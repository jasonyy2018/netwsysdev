import { z } from 'zod';

export const PhoneLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的11位手机号码'),
  code: z.string().length(6, '请输入6位短信验证码'),
});

export const UpdateProfileSchema = z.object({
  nickname: z.string().min(2, '昵称至少2个字符').max(30, '昵称最多30字符'),
  city: z.string().min(2, '请输入常住城市'),
  play_preference: z.enum(['singles', 'doubles', 'both']),
  bio: z.string().max(150, '个人简介最多150字').optional().or(z.literal('')),
});

export interface UserSession {
  id: string;
  phone: string;
  nickname: string;
  avatar_url: string;
  level_num: number;
  credit_score: number;
  role: 'user' | 'coach' | 'admin';
  city: string;
  play_preference: 'singles' | 'doubles' | 'both';
  created_at: string;
}
