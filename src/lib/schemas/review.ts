import { z } from 'zod';

export const SubmitReviewSchema = z.object({
  target_id: z.string().uuid().or(z.string().min(1)),
  target_type: z.enum(['player', 'coach', 'court']),
  match_id: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  comment: z.string().max(200, '评语最多200字').optional().or(z.literal('')),
  is_no_show: z.boolean().default(false), // 是否标记放鸽子
});

export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;

export interface CreditEventItem {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  ref_id?: string;
  created_at: string;
}

export interface UserCreditProfile {
  id: string;
  nickname: string;
  avatar_url: string;
  level_num: number;
  credit_score: number;
  completed_matches_count: number;
  no_show_count: number;
}
