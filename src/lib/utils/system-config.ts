import { SystemAuthConfig } from '@/lib/schemas/auth';

// 运行时系统配置内存单例（支持后台一键开关）
let systemAuthConfig: SystemAuthConfig = {
  sms_enabled: true,         // 是否强制开启手机短信校验
  allow_password_login: true, // 是否允许账号密码登录
  sms_provider: 'mock',      // 短信服务商
};

export function getSystemAuthConfig(): SystemAuthConfig {
  return { ...systemAuthConfig };
}

export function updateSystemAuthConfig(newConfig: Partial<SystemAuthConfig>): SystemAuthConfig {
  systemAuthConfig = {
    ...systemAuthConfig,
    ...newConfig,
  };
  console.log('[SystemConfig] 系统认证安全配置已更新:', systemAuthConfig);
  return { ...systemAuthConfig };
}
