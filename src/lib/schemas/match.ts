import { z } from 'zod';

export const CreateMatchSchema = z.object({
  title: z.string().min(2, '标题至少2个字符').max(64, '标题最多64个字符'),
  venue_id: z.string().uuid().optional().or(z.literal('')),
  court_name: z.string().min(1, '请输入或选择球场名称'),
  city: z.string().default('上海'),
  level_min: z.number().min(1.0).max(10.0),
  level_max: z.number().min(1.0).max(10.0),
  start_time: z.string().min(1, '请选择开打时间'),
  slots_needed: z.number().min(1).max(3).default(1), // 单打找1人，双打找3人
  match_type: z.enum(['singles', 'doubles', 'rally']).default('singles'),
  cost_mode: z.enum(['aa', 'creator_pays', 'loser_pays']).default('aa'),
  notes: z.string().max(200, '备注最多200字').optional().or(z.literal('')),
});

export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;

export interface MatchDetail {
  id: string;
  creator_id: string;
  creator_nickname: string;
  creator_avatar: string;
  creator_level: number;
  creator_credit: number;
  title: string;
  city: string;
  venue_id?: string;
  court_name: string;
  level_min: number;
  level_max: number;
  start_time: string;
  slots_needed: number;
  match_type: 'singles' | 'doubles' | 'rally';
  cost_mode: 'aa' | 'creator_pays' | 'loser_pays';
  notes?: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled' | 'expired';
  participants_count: number;
  created_at: string;
}
