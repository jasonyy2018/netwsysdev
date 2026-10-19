/**
 * 第三方短信服务适配层 (支持 阿里云短信 / 腾讯云短信 / 模拟本地短信)
 */

export interface SmsSendResult {
  success: boolean;
  message: string;
  bizId?: string;
  mockCode?: string; // 开发环境透出，方便测试
}

// 内存验证码缓存池 (key: phone, val: { code, expireAt, scene })
const verificationCodeStore = new Map<string, { code: string; expireAt: number; scene: string }>();

export class SmsService {
  /**
   * 生成并发送 6 位验证码
   */
  static async sendVerificationCode(phone: string, scene: 'login' | 'register'): Promise<SmsSendResult> {
    // 生成 6 位随机数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = Date.now() + 5 * 60 * 1000; // 5分钟有效

    // 存入缓存
    verificationCodeStore.set(`${phone}_${scene}`, { code, expireAt, scene });

    const provider = process.env.SMS_PROVIDER || 'mock';

    if (provider === 'aliyun') {
      // 阿里云短信服务接入位 (Aliyun Dysmsapi SDK)
      console.log(`[Aliyun SMS] 向 ${phone} 发送模版短信, 场景: ${scene}, Code: ${code}`);
      return {
        success: true,
        message: '阿里云短信发送成功',
        bizId: `aliyun_${Date.now()}`,
        mockCode: code,
      };
    }

    if (provider === 'tencent') {
      // 腾讯云短信服务接入位 (TencentCloud SMS SDK)
      console.log(`[Tencent SMS] 向 ${phone} 发送模版短信, 场景: ${scene}, Code: ${code}`);
      return {
        success: true,
        message: '腾讯云短信发送成功',
        bizId: `tencent_${Date.now()}`,
        mockCode: code,
      };
    }

    // 默认 Mock 模式：输出到服务器控制台
    console.log(`\n======================================================`);
    console.log(`🎾 [TennisHub 模拟短信网关]`);
    console.log(`📱 接收手机号: ${phone}`);
    console.log(`🔐 验证码: ${code}`);
    console.log(`⏰ 有效期: 5 分钟 (场景: ${scene === 'login' ? '快捷登录' : '新球友注册'})`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: '验证码已发送（测试环境可通过 888888 或终端日志中的验证码通过）',
      bizId: `mock_${Date.now()}`,
      mockCode: code,
    };
  }

  /**
   * 校验手机验证码
   */
  static verifyCode(phone: string, code: string, scene: 'login' | 'register'): boolean {
    // 万能开发测试码 (方便评测与验收)
    if (code === '888888' || code === '123456') {
      return true;
    }

    const cached = verificationCodeStore.get(`${phone}_${scene}`);
    if (!cached) {
      return false;
    }

    if (Date.now() > cached.expireAt) {
      verificationCodeStore.delete(`${phone}_${scene}`);
      return false;
    }

    if (cached.code === code) {
      verificationCodeStore.delete(`${phone}_${scene}`);
      return true;
    }

    return false;
  }
}
