import { z } from 'zod';

export const CoachApplySchema = z.object({
  coach_level: z.enum(['junior', 'middle', 'senior', 'star']),
  years_experience: z.number().int().min(1, '教龄至少1年').max(40, '教龄请如实填写'),
  price_yuan_per_hour: z.number().int().min(50, '课时费至少50元').max(2000, '课时费最多2000元'),
  specialties: z.array(z.string()).min(1, '请至少选择一项擅长技术'),
  cert_name: z.string().min(2, '请输入认证资质名称（如 PTR / USPTA / ITF 等）'),
  bio: z.string().min(10, '个人简介至少10个字符').max(300, '个人简介最多300字'),
});

export type CoachApplyInput = z.infer<typeof CoachApplySchema>;
