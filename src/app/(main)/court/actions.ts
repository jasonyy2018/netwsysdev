'use server';

import { query, getClient } from '@/lib/db';
import { CourtBookingSchema, VenueDetail, SlotItem } from '@/lib/schemas/court';
import { calculateDistanceKm } from '@/lib/utils/matching';
import { revalidatePath } from 'next/cache';

const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * 1. 场馆与场地查询（按地理距离排序）
 */
export async function getVenues(userLat = 31.230416, userLng = 121.473701): Promise<(VenueDetail & { distance_km: number })[]> {
  try {
    const res = await query(`
      SELECT 
        v.*,
        COUNT(c.id) as courts_count,
        COALESCE(MIN(c.price_cents_per_hour), 12000) as starting_price_cents
      FROM venues v
      LEFT JOIN courts c ON c.venue_id = v.id
      GROUP BY v.id
    `);

    const venues = res.rows.map((r) => {
      const dist = calculateDistanceKm(userLat, userLng, Number(r.lat), Number(r.lng));
      return {
        id: r.id,
        name: r.name,
        address: r.address,
        lat: Number(r.lat),
        lng: Number(r.lng),
        facilities: r.facilities || [],
        rating: Number(r.rating),
        courts_count: Number(r.courts_count),
        starting_price_cents: Number(r.starting_price_cents),
        distance_km: dist,
      };
    });

    return venues.sort((a, b) => a.distance_km - b.distance_km);
  } catch (error) {
    console.error('getVenues error:', error);
    // 降级兜底模拟场馆数据
    return [
      {
        id: 'aaaa0001-0000-0000-0000-000000000001',
        name: '静安网球中心 (常德路馆)',
        address: '上海市静安区常德路999号',
        lat: 31.2355,
        lng: 121.4421,
        facilities: ['硬地', '室内恒温', '淋浴更衣', '夜间灯光', '免费停车'],
        rating: 4.9,
        courts_count: 4,
        starting_price_cents: 14000,
        distance_km: 3.2,
      },
      {
        id: 'aaaa0002-0000-0000-0000-000000000002',
        name: '徐汇滨江网球俱乐部',
        address: '上海市徐汇区龙腾大道3000号',
        lat: 31.1822,
        lng: 121.4655,
        facilities: ['硬地', '红土', '户外江景', '穿线服务'],
        rating: 4.8,
        courts_count: 3,
        starting_price_cents: 18000,
        distance_km: 5.6,
      },
      {
        id: 'aaaa0003-0000-0000-0000-000000000003',
        name: '浦东源深体育中心网球场',
        address: '上海市浦东新区源深路655号',
        lat: 31.2338,
        lng: 121.5362,
        facilities: ['硬地', '室内', '器材租借'],
        rating: 4.7,
        courts_count: 2,
        starting_price_cents: 12000,
        distance_km: 6.8,
      },
    ];
  }
}

/**
 * 2. 获取指定场馆的可预约时段网格
 */
export async function getCourtSlots(venueId: string, dateStr: string): Promise<SlotItem[]> {
  try {
    const res = await query(
      `SELECT cs.* 
       FROM court_slots cs
       JOIN courts c ON cs.court_id = c.id
       WHERE c.venue_id = $1 AND cs.slot_date = $2
       ORDER BY cs.start_hour ASC`,
      [venueId, dateStr]
    );

    if (res.rows.length > 0) {
      return res.rows.map((r) => ({
        id: r.id,
        court_id: r.court_id,
        slot_date: r.slot_date,
        start_hour: Number(r.start_hour),
        price_cents: Number(r.price_cents),
        status: r.status,
      }));
    }

    // 若当前日期尚未生成，动态返回时段数据 (8点 - 22点)
    return generateVirtualSlots(venueId, dateStr);
  } catch (error) {
    console.error('getCourtSlots error:', error);
    return generateVirtualSlots(venueId, dateStr);
  }
}

function generateVirtualSlots(venueId: string, dateStr: string): SlotItem[] {
  const hours = [8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21];
  return hours.map((hour) => ({
    id: `slot-${dateStr}-${hour}`,
    court_id: 'cccc0001-0000-0000-0000-000000000001',
    slot_date: dateStr,
    start_hour: hour,
    price_cents: hour >= 18 ? 16000 : 12000,
    status: hour === 19 ? 'booked' : 'available', // 19点模拟已被占用
  }));
}

/**
 * 3. 核心并发防超卖预订事务 (严守开发方案 7.1)
 * a) 条件更新 update court_slots set status='booked' where id in (...) and status='available'
 * b) 校验 affected rows 是否严格等于 slot_ids 长度，否则单事务回滚
 * c) 插入订单并记 mock 支付流水
 */
export async function createCourtBooking(input: unknown) {
  const { getCurrentUser } = await import('@/app/(auth)/actions');
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      error: '请先登录后再预订场地',
    };
  }

  const validated = CourtBookingSchema.parse(input);
  const client = await getClient().catch(() => null);

  // 1. 若本地直连 PostgreSQL 数据库可用，执行严格事务行锁与条件更新
  if (client) {
    try {
      await client.query('BEGIN');

      // 并发条件更新
      const updateRes = await client.query(
        `UPDATE court_slots 
         SET status = 'booked' 
         WHERE id = ANY($1::uuid[]) AND status = 'available'
         RETURNING id`,
        [validated.slot_ids]
      );

      // 防超卖核心断言
      if (updateRes.rowCount !== validated.slot_ids.length) {
        await client.query('ROLLBACK');
        return {
          success: false,
          code: 'SLOT_TAKEN',
          error: '手慢了一步！所选的场地时段刚刚被其他人预订',
        };
      }

      // 生成订单
      const insertBooking = await client.query(
        `INSERT INTO bookings (user_id, court_id, slot_ids, amount_cents, status, payment_mock_log)
         VALUES ($1, $2, $3::uuid[], $4, 'mock_paid', $5)
         RETURNING id`,
        [
          user.id,
          validated.court_id,
          validated.slot_ids,
          validated.amount_cents,
          JSON.stringify({ mock: true, paid_at: new Date().toISOString() }),
        ]
      );

      await client.query('COMMIT');

      revalidatePath('/court');
      revalidatePath('/my/bookings');

      return {
        success: true,
        bookingId: insertBooking.rows[0].id,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Booking transaction error:', err);
      return {
        success: false,
        error: '预订事务提交失败，请重试',
      };
    } finally {
      client.release();
    }
  }

  // 2. 数据库离线情况下的模拟下单闭环
  return {
    success: true,
    bookingId: `mock-order-${Date.now()}`,
    mock: true,
  };
}
