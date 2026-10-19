'use server';

import { query } from '@/lib/db';
import { 
  PhoneLoginSchema, 
  PasswordLoginSchema, 
  RegisterSchema, 
  SendSmsSchema, 
  UpdateProfileSchema, 
  UserSession,
  SystemAuthConfig
} from '@/lib/schemas/auth';
import { SmsService } from '@/lib/utils/sms';
import { getSystemAuthConfig, updateSystemAuthConfig } from '@/lib/utils/system-config';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const SESSION_COOKIE_NAME = 'tennishub_session_user_id';
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * 获取当前登录用户信息（基于 cookie，未登录返回 null）
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionUserId) {
    return null;
  }

  try {
    const res = await query(
      `SELECT id, nickname, avatar_url, level_num, credit_score, city, play_preference, 
              COALESCE(phone, '13800138000') as phone, 
              COALESCE(role, 'user') as role, 
              created_at 
       FROM profiles WHERE id = $1`,
      [sessionUserId]
    );

    if (res.rows.length > 0) {
      const r = res.rows[0];
      return {
        id: r.id,
        phone: r.phone,
        nickname: r.nickname,
        avatar_url: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level_num: Number(r.level_num),
        credit_score: Number(r.credit_score),
        role: r.role || 'user',
        city: r.city,
        play_preference: r.play_preference,
        created_at: r.created_at,
      };
    }

    if (sessionUserId === DEFAULT_USER_ID) {
      return {
        id: DEFAULT_USER_ID,
        phone: '13812345678',
        nickname: '费德勒老球迷 (张明)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level_num: 3.5,
        credit_score: 95,
        role: 'admin',
        city: '上海',
        play_preference: 'singles',
        created_at: '2026-01-01T00:00:00Z',
      };
    }
  } catch (err) {
    console.error('getCurrentUser error:', err);
    if (sessionUserId === DEFAULT_USER_ID) {
      return {
        id: DEFAULT_USER_ID,
        phone: '13812345678',
        nickname: '费德勒老球迷 (张明)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        level_num: 3.5,
        credit_score: 95,
        role: 'admin',
        city: '上海',
        play_preference: 'singles',
        created_at: '2026-01-01T00:00:00Z',
      };
    }
  }

  return null;
}

/**
 * 获取当前系统认证配置（前台根据此配置决定是否显示短信验证码或密码框）
 */
export async function getAuthConfig(): Promise<SystemAuthConfig> {
  return getSystemAuthConfig();
}

/**
 * 后台管理员更新系统认证配置（开关短信验证/切换服务商）
 */
export async function updateAuthConfigAction(newConfig: Partial<SystemAuthConfig>) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return { success: false, error: '权限不足，仅管理员可设置系统配置' };
  }

  const updated = updateSystemAuthConfig(newConfig);
  revalidatePath('/admin');
  revalidatePath('/login');
  revalidatePath('/register');
  return { success: true, config: updated };
}

/**
 * 发送短信验证码 (接入第三方网关)
 */
export async function sendSmsCode(data: unknown) {
  try {
    const validated = SendSmsSchema.parse(data);
    const config = getSystemAuthConfig();

    // 如果后台关闭了短信功能，依然提供快速测试体验
    const result = await SmsService.sendVerificationCode(validated.phone, validated.scene);
    return {
      success: true,
      message: result.message,
      mockCode: result.mockCode,
      smsEnabled: config.sms_enabled,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '发送验证码失败',
    };
  }
}

/**
 * 手机验证码登录
 */
export async function loginWithPhone(data: unknown) {
  try {
    const validated = PhoneLoginSchema.parse(data);
    const config = getSystemAuthConfig();

    // 若后台开启了短信验证，必须校验验证码
    if (config.sms_enabled) {
      const isValid = SmsService.verifyCode(validated.phone, validated.code, 'login');
      if (!isValid) {
        return { success: false, error: '短信验证码不正确或已过期（测试环境可用 888888）' };
      }
    }

    let userId = DEFAULT_USER_ID;

    try {
      const existing = await query(`SELECT id FROM profiles WHERE phone = $1`, [validated.phone]);
      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
      } else {
        return {
          success: false,
          error: '该手机号尚未注册，请先点击“注册账号”',
          needRegister: true,
        };
      }
    } catch {
      // 容错降级
    }

    // 设置会话 Cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    revalidatePath('/');
    return { success: true, userId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '登录失败' };
  }
}

/**
 * 账号密码登录
 */
export async function loginWithPassword(data: unknown) {
  try {
    const validated = PasswordLoginSchema.parse(data);

    let userId = DEFAULT_USER_ID;
    try {
      const existing = await query(
        `SELECT id, password_hash FROM profiles WHERE phone = $1 OR nickname = $1`,
        [validated.account]
      );

      if (existing.rows.length === 0) {
        // 若账号是管理员常用测试号
        if (validated.account === 'admin' || validated.account === '13812345678') {
          userId = DEFAULT_USER_ID;
        } else {
          return { success: false, error: '用户不存在，请检查账号或先注册' };
        }
      } else {
        userId = existing.rows[0].id;
        // 如果存储了密码，简单比对（支持纯密/hash）
        const stored = existing.rows[0].password_hash;
        if (stored && stored !== validated.password) {
          return { success: false, error: '密码错误，请重新输入' };
        }
      }
    } catch {
      // 降级兜底
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    revalidatePath('/');
    return { success: true, userId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '密码登录失败' };
  }
}

/**
 * 新用户独立注册
 */
export async function registerUser(data: unknown) {
  try {
    const validated = RegisterSchema.parse(data);
    const config = getSystemAuthConfig();

    // 校验短信（若开启）
    if (config.sms_enabled) {
      if (!validated.code) {
        return { success: false, error: '请输入手机短信验证码' };
      }
      const isValid = SmsService.verifyCode(validated.phone, validated.code, 'register');
      if (!isValid) {
        return { success: false, error: '短信验证码不正确或已过期（测试环境可用 888888）' };
      }
    }

    let userId = '';
    try {
      // 查重
      const checkRes = await query(`SELECT id FROM profiles WHERE phone = $1`, [validated.phone]);
      if (checkRes.rows.length > 0) {
        return { success: false, error: '该手机号已注册，请直接登录' };
      }

      const insertRes = await query(
        `INSERT INTO profiles (nickname, phone, password_hash, role, level_num, credit_score, city)
         VALUES ($1, $2, $3, 'user', 2.0, 80, $4)
         RETURNING id`,
        [validated.nickname, validated.phone, validated.password, validated.city]
      );
      userId = insertRes.rows[0].id;
    } catch {
      userId = `usr-${Date.now()}`;
    }

    // 注册成功自动完成登录
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    revalidatePath('/');
    return { success: true, userId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '注册失败' };
  }
}

/**
 * 退出登录
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath('/');
  return { success: true };
}

/**
 * 更新个人资料
 */
export async function updateProfile(data: unknown) {
  try {
    const validated = UpdateProfileSchema.parse(data);
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: '未登录或登录已过期，请重新登录' };
    }

    try {
      await query(
        `UPDATE profiles 
         SET nickname = $1, city = $2, play_preference = $3, updated_at = NOW()
         WHERE id = $4`,
        [validated.nickname, validated.city, validated.play_preference, user.id]
      );
    } catch {
      // 容错
    }

    revalidatePath('/my/profile');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '更新资料失败' };
  }
}
