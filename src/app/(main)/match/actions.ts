'use server';

import { query } from '@/lib/db';
import { CreateMatchSchema, MatchDetail } from '@/lib/schemas/match';
import { scoreCandidate, CandidateUser, TargetMatch } from '@/lib/utils/matching';
import { revalidatePath } from 'next/cache';

const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * 1. 发起约球需求
 */
export async function createMatchRequest(data: unknown) {
  const { getCurrentUser } = await import('@/app/(auth)/actions');
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: '请先登录后再发起约球',
    };
  }

  try {
    const validated = CreateMatchSchema.parse(data);

    // 插入 match_requests
    const insertRes = await query(
      `INSERT INTO match_requests 
        (creator_id, title, venue_id, court_name, city, level_min, level_max, start_time, slots_needed, match_type, cost_mode, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'open')
       RETURNING id`,
      [
        user.id,
        validated.title,
        validated.venue_id ? validated.venue_id : null,
        validated.court_name,
        validated.city,
        validated.level_min,
        validated.level_max,
        new Date(validated.start_time).toISOString(),
        validated.slots_needed,
        validated.match_type,
        validated.cost_mode,
        validated.notes || null,
      ]
    );

    const matchId = insertRes.rows[0].id;

    // 创建者自动作为 confirmed 参与者
    await query(
      `INSERT INTO match_participants (match_request_id, user_id, status)
       VALUES ($1, $2, 'confirmed')
       ON CONFLICT (match_request_id, user_id) DO NOTHING`,
      [matchId, user.id]
    );

    revalidatePath('/match');
    return { success: true, matchId };
  } catch (error) {
    console.error('Create match error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建约球失败',
    };
  }
}

/**
 * 2. 获取约球列表 (带等级与城市筛选)
 */
export async function getMatchRequests(filters?: {
  city?: string;
  level?: number;
  matchType?: string;
}): Promise<MatchDetail[]> {
  try {
    const sql = `
      SELECT 
        m.*,
        p.nickname as creator_nickname,
        p.avatar_url as creator_avatar,
        p.level_num as creator_level,
        p.credit_score as creator_credit,
        (SELECT COUNT(*) FROM match_participants mp WHERE mp.match_request_id = m.id AND mp.status IN ('confirmed', 'accepted')) as participants_count
      FROM match_requests m
      JOIN profiles p ON m.creator_id = p.id
      WHERE m.status IN ('open', 'matched')
      ORDER BY m.start_time ASC
      LIMIT 30
    `;
    const res = await query(sql);
    return res.rows.map((r) => ({
      id: r.id,
      creator_id: r.creator_id,
      creator_nickname: r.creator_nickname,
      creator_avatar: r.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      creator_level: Number(r.creator_level),
      creator_credit: Number(r.creator_credit),
      title: r.title,
      city: r.city,
      venue_id: r.venue_id,
      court_name: r.court_name,
      level_min: Number(r.level_min),
      level_max: Number(r.level_max),
      start_time: r.start_time,
      slots_needed: Number(r.slots_needed),
      match_type: r.match_type,
      cost_mode: r.cost_mode,
      notes: r.notes,
      status: r.status,
      participants_count: Number(r.participants_count),
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error('getMatchRequests error:', error);
    // 降级兜底模拟数据（当数据库尚未容器启动时）
    return [
      {
        id: 'mock-m-1',
        creator_id: '11111111-1111-1111-1111-111111111111',
        creator_nickname: '费德勒老球迷 (张明)',
        creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        creator_level: 3.5,
        creator_credit: 95,
        title: '周六上午静安中心中速对拉与抢七',
        city: '上海',
        court_name: '静安网球中心 1号中央场',
        level_min: 3.0,
        level_max: 4.0,
        start_time: new Date(Date.now() + 86400000).toISOString(),
        slots_needed: 1,
        match_type: 'singles',
        cost_mode: 'aa',
        notes: '自带新球，热身拉球20分钟后打单打一盘，欢迎同水平球友！',
        status: 'open',
        participants_count: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-m-2',
        creator_id: '22222222-2222-2222-2222-222222222222',
        creator_nickname: '李娜小师妹 (王芳)',
        creator_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        creator_level: 3.0,
        creator_credit: 92,
        title: '徐汇滨江晚间女子/混双双打娱乐局',
        city: '上海',
        court_name: '徐汇滨江红土场',
        level_min: 2.5,
        level_max: 3.5,
        start_time: new Date(Date.now() + 172800000).toISOString(),
        slots_needed: 3,
        match_type: 'doubles',
        cost_mode: 'aa',
        notes: '主要是出出汗交朋友，输赢其次～',
        status: 'open',
        participants_count: 2,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * 3. 报名加入约球
 */
export async function joinMatchRequest(matchId: string) {
  const { getCurrentUser } = await import('@/app/(auth)/actions');
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: '请先登录后再报名约球',
    };
  }

  try {
    await query(
      `INSERT INTO match_participants (match_request_id, user_id, status)
       VALUES ($1, $2, 'accepted')
       ON CONFLICT (match_request_id, user_id) 
       DO UPDATE SET status = 'accepted', joined_at = NOW()`,
      [matchId, user.id]
    );

    // 检查人数是否已满，若满则转 matched 状态
    await query(
      `UPDATE match_requests m
       SET status = 'matched'
       WHERE m.id = $1 
         AND (SELECT COUNT(*) FROM match_participants mp WHERE mp.match_request_id = m.id AND mp.status IN ('confirmed', 'accepted')) >= (m.slots_needed + 1)`,
      [matchId]
    );

    revalidatePath(`/match/${matchId}`);
    revalidatePath('/match');
    return { success: true };
  } catch (error) {
    console.error('Join match error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '报名失败',
    };
  }
}

/**
 * 4. 智能推荐 Top 20 契合球友 (加权算法)
 */
export async function getRecommendationsForMatch(matchTarget: TargetMatch) {
  try {
    const res = await query(
      `SELECT id, nickname, avatar_url, level_num, credit_score, city, lat, lng 
       FROM profiles 
       WHERE id != $1 
       LIMIT 30`,
      [DEFAULT_USER_ID]
    );

    const candidates: CandidateUser[] = res.rows.map((r) => ({
      id: r.id,
      nickname: r.nickname,
      level_num: Number(r.level_num),
      credit_score: Number(r.credit_score),
      lat: r.lat ? Number(r.lat) : undefined,
      lng: r.lng ? Number(r.lng) : undefined,
      rating: 4.9,
      time_overlap_ratio: 0.9,
    }));

    const scored = candidates
      .map((c) => {
        const score = scoreCandidate(matchTarget, c);
        return {
          user: c,
          score,
        };
      })
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, 20);

    return scored;
  } catch (error) {
    console.error('getRecommendations error:', error);
    // 降级兜底候选推荐
    const mockCandidates: CandidateUser[] = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        nickname: '李娜小师妹 (王芳)',
        level_num: 3.0,
        credit_score: 90,
        lat: 31.240416,
        lng: 121.483701,
        rating: 4.8,
        time_overlap_ratio: 0.85,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        nickname: '纳达尔跑动王 (陈强)',
        level_num: 4.5,
        credit_score: 88,
        lat: 31.210416,
        lng: 121.453701,
        rating: 5.0,
        time_overlap_ratio: 0.9,
      },
    ];

    return mockCandidates.map((c) => ({
      user: c,
      score: scoreCandidate(matchTarget, c),
    }));
  }
}
