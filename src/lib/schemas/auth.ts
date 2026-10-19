import { z } from 'zod';

// 手机验证码登录
export const PhoneLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的11位手机号码'),
  code: z.string().length(6, '请输入6位短信验证码'),
});

// 账号密码登录
export const PasswordLoginSchema = z.object({
  account: z.string().min(3, '请输入手机号或账号'),
  password: z.string().min(6, '密码至少6位字符'),
});

// 新用户注册
export const RegisterSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的11位手机号码'),
  password: z.string().min(6, '密码至少6位字符').max(32, '密码最多32位字符'),
  nickname: z.string().min(2, '昵称至少2个字符').max(20, '昵称最多20个字符'),
  city: z.string().min(2, '请输入常住城市'),
  code: z.string().optional(), // 开启短信验证时必填
});

// 发送短信验证码请求
export const SendSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的11位手机号码'),
  scene: z.enum(['login', 'register']).default('login'),
});

// 资料更新
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

export interface SystemAuthConfig {
  sms_enabled: boolean;        // 后台设置：是否开启第三方短信强制校验
  allow_password_login: boolean; // 是否允许账号密码登录
  sms_provider: 'aliyun' | 'tencent' | 'mock';
}
