# 项目：TennisHub 网球运动生态平台

## 一、技术栈规范
- 前端：Next.js 最新版（App Router，React 19，TypeScript strict）
- UI：Tailwind CSS + shadcn/ui（组件统一放 `src/components/ui/`）
- 数据库与部署：PostgreSQL + Docker / Docker Compose（支持独立部署与 Supabase 兼容）
- 后端逻辑：Next.js Server Actions 为主，复杂查询/Webhook 采用 Route Handlers
- 表单校验：React Hook Form + Zod；严格在 Server Action 中做二次验证
- 状态与工具：clsx, tailwind-merge, date-fns, lucide-react

## 二、目录约定
```
src/
  ├── app/
  │   ├── (auth)/          # 登录/注册路由组
  │   ├── (main)/          # 主业务（评测/约球/订场/教练/个人中心）
  │   ├── api/             # Webhook 与外部回调
  │   ├── layout.tsx
  │   ├── loading.tsx
  │   └── error.tsx
  ├── components/
  │   ├── ui/              # shadcn/ui 原语组件
  │   ├── feature/         # 按业务领域划分的组件（assessment, match, court, coach）
  │   └── shared/          # 通用业务组件（导航栏、页脚、空状态等）
  ├── lib/
  │   ├── db/              # 数据库连接与客户端封装
  │   ├── schemas/         # Zod schemas（数据校验）
  │   └── utils/           # 纯函数（匹配算法、距离计算、格式化）
supabase/ (或 migrations/) # SQL 迁移与种子数据
docker/                    # Dockerfile 及容器配置
```

## 三、开发铁律（严格执行）
1. **安全与防篡改**：金额（一律以分/cents为整数单位存储）、等级计算、订单状态变更、信用分扣减必须在服务端执行，禁止客户端直写敏感数据。
2. **并发防超卖**：场地时段预订与教练预约必须具备并发防超卖保护（数据库条件更新或行锁 `FOR UPDATE`），受到并发冲突立即回滚并提示友好信息。
3. **架构偏好**：默认编写 Server Component；仅在涉及 `useState`、`useEffect`、浏览器事件时添加 `'use client'`。
4. **外部输入校验**：所有表单与 URL 查询参数一律先经 Zod Schema 验证。
5. **完整三态设计**：每个核心交互页面必须提供 Loading（骨架屏）、Error（异常捕获）和 Empty（空数据占位）三种状态。
6. **零 Any 规范**：TypeScript 严禁使用 `any`，未知类型统一使用 `unknown` + 类型守卫。
7. **环境隔离**：严禁在前端代码暴露敏感密钥，敏感密钥仅在服务端通过 `process.env` 获取。
8. **提交纪律**：按阶段进行单元化交付，小步快跑，每个完整子功能完成后提交 Git Commit。

## 四、领域术语与设计规范
- 等级体系：T1-T10（内部数值 `level_num` 采用浮点数 `1.0` - `10.0`，步长 0.5）
- 约球模块：`match_request`（发起需求），`match_participant`（参与者记录）
- 场地模块：`venue`（场馆），`court`（具体场地），`court_slot`（按小时粒度的时段）
- 教练模块：`coach_profile`（教练档案，等级 `junior` / `middle` / `senior` / `star`）
- 信用评分：`credit_score`（整数 60-100，初始 80 分，放鸽子 `no_show` -5 分）
