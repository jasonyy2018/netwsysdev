'use server';

import { query } from '@/lib/db';
import { getCurrentUser } from '@/app/(auth)/actions';
import { revalidatePath } from 'next/cache';

export interface MyBookingItem {
  id: string;
  court_id: string;
  court_name: string;
  venue_id?: string;
  venue_name: string;
  venue_address: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

export interface MyMatchItem {
  id: string;
  title: string;
  court_name: string;
  venue_id?: string;
  level_min: number;
  level_max: number;
  start_time: string;
  match_type: string;
  cost_mode: string;
  status: string;
  creator_id: string;
  is_creator: boolean;
  participants_count: number;
  slots_needed: number;
}

export interface MyCoachOrderItem {
  id: string;
  coach_id: string;
  coach_name: string;
  coach_avatar: string;
  start_time: string;
  hours: number;
  amount_cents: number;
  status: string;
  created_at: string;
}

/**
 * 获取当前用户的订场记录
 */
export async function getMyBookings(): Promise<MyBookingItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const res = await query(
      `SELECT b.id, b.court_id, b.amount_cents, b.status, b.created_at,
              c.name as court_name, c.venue_id, v.name as venue_name, v.address as venue_address
       FROM bookings b
       LEFT JOIN courts c ON b.court_id = c.id
       LEFT JOIN venues v ON c.venue_id = v.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user.id]
    );

    if (res.rows.length > 0) {
      return res.rows.map((r) => ({
        id: r.id,
        court_id: r.court_id,
        court_name: r.court_name || '标准网球场',
        venue_id: r.venue_id,
        venue_name: r.venue_name || '静安网球中心 (常德路馆)',
        venue_address: r.venue_address || '上海市静安区常德路999号',
        amount_cents: Number(r.amount_cents),
        status: r.status,
        created_at: r.created_at,
      }));
    }

    // 默认兜底模拟订单数据 (方便预览)
    return [
      {
        id: 'ord-mock-1',
        court_id: 'cccc0001-0000-0000-0000-000000000001',
        court_name: '1号硬地场 (中央球场)',
        venue_id: 'aaaa0001-0000-0000-0000-000000000001',
        venue_name: '静安网球中心 (常德路馆)',
        venue_address: '上海市静安区常德路999号',
        amount_cents: 16000,
        status: 'mock_paid',
        created_at: new Date().toISOString(),
      },
    ];
  } catch (err) {
    console.error('getMyBookings error:', err);
    return [
      {
        id: 'ord-mock-1',
        court_id: 'cccc0001-0000-0000-0000-000000000001',
        court_name: '1号硬地场 (中央球场)',
        venue_id: 'aaaa0001-0000-0000-0000-000000000001',
        venue_name: '静安网球中心 (常德路馆)',
        venue_address: '上海市静安区常德路999号',
        amount_cents: 16000,
        status: 'mock_paid',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * 获取当前用户参与或发起的球局
 */
export async function getMyMatches(): Promise<MyMatchItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const res = await query(
      `SELECT DISTINCT m.id, m.title, m.court_name, m.venue_id, m.level_min, m.level_max,
              m.start_time, m.match_type, m.cost_mode, m.status, m.creator_id, m.slots_needed,
              (m.creator_id = $1) as is_creator,
              (SELECT COUNT(*) FROM match_participants mp WHERE mp.match_request_id = m.id AND mp.status IN ('confirmed', 'accepted')) as participants_count
       FROM match_requests m
       LEFT JOIN match_participants mp ON mp.match_request_id = m.id
       WHERE m.creator_id = $1 OR mp.user_id = $1
       ORDER BY m.start_time DESC`,
      [user.id]
    );

    if (res.rows.length > 0) {
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        court_name: r.court_name,
        venue_id: r.venue_id,
        level_min: Number(r.level_min),
        level_max: Number(r.level_max),
        start_time: r.start_time,
        match_type: r.match_type,
        cost_mode: r.cost_mode,
        status: r.status,
        creator_id: r.creator_id,
        is_creator: Boolean(r.is_creator),
        participants_count: Number(r.participants_count),
        slots_needed: Number(r.slots_needed),
      }));
    }

    // 默认演示球局
    return [
      {
        id: 'mock-m-my-1',
        title: '周末静安中心双打趣味对抗',
        court_name: '静安网球中心 (常德路馆)',
        venue_id: 'aaaa0001-0000-0000-0000-000000000001',
        level_min: 3.0,
        level_max: 4.5,
        start_time: new Date(Date.now() + 86400000).toISOString(),
        match_type: 'doubles',
        cost_mode: 'aa',
        status: 'matched',
        creator_id: user.id,
        is_creator: true,
        participants_count: 4,
        slots_needed: 3,
      },
      {
        id: 'mock-m-my-2',
        title: '徐汇滨江单打对抗与底线深球切磋',
        court_name: '徐汇滨江网球俱乐部',
        level_min: 3.5,
        level_max: 4.5,
        start_time: new Date(Date.now() - 86400000 * 2).toISOString(),
        match_type: 'singles',
        cost_mode: 'aa',
        status: 'completed',
        creator_id: '22222222-2222-2222-2222-222222222222',
        is_creator: false,
        participants_count: 2,
        slots_needed: 1,
      },
    ];
  } catch (err) {
    console.error('getMyMatches error:', err);
    return [];
  }
}

/**
 * 获取当前用户的教练预约订单
 */
export async function getMyCoachOrders(): Promise<MyCoachOrderItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const res = await query(
      `SELECT co.id, co.coach_id, co.start_time, co.hours, co.amount_cents, co.status, co.created_at,
              p.nickname as coach_name, p.avatar_url as coach_avatar
       FROM coach_orders co
       JOIN coach_profiles cp ON co.coach_id = cp.id
       JOIN profiles p ON cp.user_id = p.id
       WHERE co.student_id = $1
       ORDER BY co.created_at DESC`,
      [user.id]
    );

    if (res.rows.length > 0) {
      return res.rows.map((r) => ({
        id: r.id,
        coach_id: r.coach_id,
        coach_name: r.coach_name,
        coach_avatar: r.coach_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        start_time: r.start_time,
        hours: Number(r.hours),
        amount_cents: Number(r.amount_cents),
        status: r.status,
        created_at: r.created_at,
      }));
    }

    return [
      {
        id: 'order-coach-mock-1',
        coach_id: '44444444-4444-4444-4444-444444444444',
        coach_name: '刘教练 (PTR认证)',
        coach_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
        hours: 1,
        amount_cents: 35000,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
    ];
  } catch (err) {
    console.error('getMyCoachOrders error:', err);
    return [];
  }
}

/**
 * 标记球局已完赛 (触发互评)
 */
export async function completeMatch(matchId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: '请先登录' };
  }

  try {
    await query(
      `UPDATE match_requests SET status = 'completed' WHERE id = $1`,
      [matchId]
    );
    revalidatePath('/my/profile');
    revalidatePath('/match');
    return { success: true };
  } catch (err) {
    console.error('completeMatch error:', err);
    return { success: false, error: '更新球局状态失败' };
  }
}
