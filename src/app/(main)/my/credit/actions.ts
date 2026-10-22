'use server';

import { query, getClient } from '@/lib/db';
import { SubmitReviewSchema, CreditEventItem, UserCreditProfile } from '@/lib/schemas/review';
import { revalidatePath } from 'next/cache';

const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * 1. 提交约球/教练互评，处理信用分惩罚或加分
 */
export async function submitReview(input: unknown) {
  const { getCurrentUser } = await import('@/app/(auth)/actions');
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: '请先登录后再提交评价' };
  }

  const validated = SubmitReviewSchema.parse(input);
  const client = await getClient().catch(() => null);

  if (client) {
    try {
      await client.query('BEGIN');

      // 写入评价记录
      await client.query(
        `INSERT INTO reviews (reviewer_id, target_type, target_id, rating, tags, comment)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          validated.target_type,
          validated.target_id,
          validated.rating,
          validated.tags,
          validated.comment || null,
        ]
      );

      // 若标记了“放鸽子 (no_show)”，扣除 5 分信用分并记流水
      if (validated.is_no_show && validated.target_type === 'player') {
        const delta = -5;
        await client.query(
          `UPDATE profiles 
           SET credit_score = GREATEST(60, credit_score + $1), updated_at = NOW()
           WHERE id = $2`,
          [delta, validated.target_id]
        );

        await client.query(
          `INSERT INTO credit_events (user_id, delta, reason, ref_id)
           VALUES ($1, $2, '球局无故爽约未到场 (放鸽子扣除)', $3)`,
          [validated.target_id, delta, validated.match_id ? validated.match_id : null]
        );
      } else if (validated.rating >= 4 && validated.target_type === 'player') {
        // 获高星好评，奖励 1 分信用分 (上限100)
        await client.query(
          `UPDATE profiles 
           SET credit_score = LEAST(100, credit_score + 1), updated_at = NOW()
           WHERE id = $1`,
          [validated.target_id]
        );

        await client.query(
          `INSERT INTO credit_events (user_id, delta, reason, ref_id)
           VALUES ($1, 1, '球局履约优秀获得高星球友好评', $2)`,
          [validated.target_id, validated.match_id ? validated.match_id : null]
        );
      }

      await client.query('COMMIT');
      revalidatePath('/my/credit');
      revalidatePath('/match');

      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Review submit error:', err);
      return { success: false, error: '评价提交事务异常' };
    } finally {
      client.release();
    }
  }

  // 离线环境模拟
  return { success: true, mock: true };
}

/**
 * 2. 获取用户信用档案与流水日志
 */
export async function getUserCreditProfile(providedUserId?: string): Promise<{
  profile: UserCreditProfile;
  events: CreditEventItem[];
}> {
  const { getCurrentUser } = await import('@/app/(auth)/actions');
  const currentUser = await getCurrentUser();
  const userId = providedUserId || currentUser?.id || DEFAULT_USER_ID;

  try {
    const profileRes = await query(
      `SELECT id, nickname, avatar_url, level_num, credit_score 
       FROM profiles WHERE id = $1`,
      [userId]
    );

    const eventsRes = await query(
      `SELECT * FROM credit_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    const row = profileRes.rows[0];
    const profile: UserCreditProfile = row
      ? {
          id: row.id,
          nickname: row.nickname,
          avatar_url: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          level_num: Number(row.level_num),
          credit_score: Number(row.credit_score),
          completed_matches_count: 12,
          no_show_count: 0,
        }
      : {
          id: userId,
          nickname: '费德勒老球迷 (张明)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          level_num: 3.5,
          credit_score: 95,
          completed_matches_count: 12,
          no_show_count: 0,
        };

    const events: CreditEventItem[] = eventsRes.rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      delta: Number(r.delta),
      reason: r.reason,
      ref_id: r.ref_id,
      created_at: r.created_at,
    }));

    return { profile, events };
  } catch (error) {
    console.error('getUserCreditProfile error:', error);
    // 降级兜底模拟流水
    return {
      profile: {
        id: userId,
        nickname: '费德勒老球迷 (张明)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level_num: 3.5,
        credit_score: 95,
        completed_matches_count: 12,
        no_show_count: 0,
      },
      events: [
        {
          id: 'ce-1',
          user_id: userId,
          delta: 1,
          reason: '静安中心单打球局准时到场并互评5星好评',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'ce-2',
          user_id: userId,
          delta: 1,
          reason: '徐汇滨江双打对局顺利完成',
          created_at: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 'ce-3',
          user_id: userId,
          delta: 10,
          reason: '完成首次 T1-T10 水平测评认证奖励',
          created_at: new Date(Date.now() - 604800000).toISOString(),
        },
      ],
    };
  }
}
