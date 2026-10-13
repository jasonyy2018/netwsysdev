import { z } from 'zod';

export const CoachOrderSchema = z.object({
  coach_id: z.string().uuid().or(z.string().min(1)),
  coach_name: z.string().min(1),
  start_time: z.string().min(1, '请选择上课时间'),
  hours: z.number().int().min(1).max(4).default(1),
  price_cents_per_hour: z.number().int().positive(),
});

export type CoachOrderInput = z.infer<typeof CoachOrderSchema>;

export interface CoachCard {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  coach_level: 'junior' | 'middle' | 'senior' | 'star';
  years_experience: number;
  price_cents_per_hour: number;
  rating: number;
  student_count: number;
  specialties: string[];
  verified: boolean;
  bio: string;
}
