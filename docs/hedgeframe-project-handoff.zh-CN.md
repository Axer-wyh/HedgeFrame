# HedgeFrame 项目交接文档

更新时间：2026-06-28  
当前工作分支：`codex/hedgeframe-mvp`  
目标仓库：`Axer-wyh/HedgeFrame`  
当前可验收本地入口：`http://localhost:3000/`

## 1. 项目定位

HedgeFrame 当前是一套预测市场对冲发现与 demo 执行辅助原型。它面向小企业、活动方、场地方、SMB 财务和物流协调方，第一主场景是天气或活动损失风险。

产品边界必须保持清晰：

- 不是保险产品。
- 不承保、不理赔、不保证覆盖损失。
- 不提供投资建议。
- 不托管资金、不保存私钥、不保存 seed phrase。
- 当前交易和钱包均为 demo 体验。

当前核心叙事：

- 用户用普通语言说出担心的风险。
- 系统解析场景，匹配预测市场候选标的。
- 系统解释覆盖点、不覆盖点、basis risk、流动性、价格和执行限制。
- 用户选择标的后生成 hedge plan。
- demo 钱包连接后，用户确认非保险提示，再执行 Kalshi demo 或模拟订单。

## 2. 当前技术栈

- Framework：Next.js App Router `16.2.9`
- Language：TypeScript
- UI：React `19.2.4`
- Styling：Tailwind v4 + CSS variables
- Motion：`motion` + 自研 `LogoLoop`
- Icons：`@phosphor-icons/react`
- Persistence：Prisma + SQLite
- Validation：Zod
- Unit tests：Vitest
- E2E：Playwright

关键脚本：

```bash
npm install
npm run db:init
npm run dev
```

验证命令：

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

环境变量参考：

```bash
DATABASE_URL="file:./dev.db"
KALSHI_DEMO_EXECUTION_MODE="simulator"
KALSHI_DEMO_BASE_URL="https://external-api.demo.kalshi.co/trade-api/v2"
KALSHI_DEMO_API_KEY_ID=""
KALSHI_DEMO_PRIVATE_KEY=""
```

默认使用 simulator。只有当 `KALSHI_DEMO_EXECUTION_MODE="api"` 且 Kalshi demo key 配齐时，才会走真实 Kalshi demo API 适配器。

## 3. 当前分支与本地状态

最近一批已推送提交：

```text
eb79d6e Tighten how it works step typography
1a5a646 Make platform logo tiles more square
7308e58 Enlarge homepage platform logo rail
a35a55b Center risk story rail in section
40bae74 Align risk story cards with section copy
20d736c Increase risk stories section height
fe8f68f Move trust section before risk stories
56b84b8 Add moving risk story cards
```

当前本地有两个未跟踪文档，尚未纳入 Git：

```text
docs/hedgeframe-backend-framework.zh-CN.md
docs/hedgeframe-homepage-pm-review.md
```

这两个文档对后续规划有价值。新线程继续时应先读取它们，但不要默认已经在 GitHub 上。

## 4. 已实现的产品界面

### 4.1 首页 `/`

核心文件：

- `src/app/home-page.tsx`
- `src/app/site-header.tsx`
- `src/app/logo-loop.tsx`
- `src/app/globals.css`

当前状态：

- 统一顶部导航：`HedgeFrame / How it works / Use cases / Markets / About / Log in or account / Try a scenario / language / theme`
- `Markets` 是直接链接到 `/markets`，不再是下拉菜单。
- 顶栏不展示 `Connect wallet`，降低 crypto 盘感。
- 登录后顶栏显示账户入口。
- 语言按钮目前只有菜单展示，尚未接入真实 i18n。
- 日夜模式按钮已可切换视觉 tone。
- 首屏采用 Mistral 风格的分区滚动交互。
- 首页输入和场景卡片可跳转到 `/markets?scenario=...`。
- `How it works` 三格：`Say it / We map it / Hedge it`，现在桌面端都保持单行。
- 平台品牌 rail 已放大成横向滚动品牌墙：Kalshi、Polymarket、USDC、WalletConnect、Chainlink、Vercel、Next.js。
- `Use cases`、`Trust before execution`、`For people carrying weird risk` 等 section 已按最近反馈调整。
- `Risk stories in motion` 使用 `LogoLoop` 横向缓慢滚动，左侧文案和卡片已经垂直对齐。

首页文案基调：

- 英文 UI。
- 冷黑/灰背景。
- 亮黄色为唯一强强调色。
- 像素格、细边框、冷淡金融/基础设施感。

### 4.2 Markets 工作台 `/markets`

核心文件：

- `src/app/markets-workspace.tsx`
- `src/app/markets/page.tsx`
- `src/lib/domain/mock-markets.ts`
- `src/lib/domain/matcher.ts`
- `src/lib/domain/hedge-planner.ts`
- `src/lib/domain/execution.ts`

当前已实现：

- 顶部使用统一 `SiteHeader`，没有返回按钮。
- 左侧 scenario intake，可编辑字段：subject、location、trigger、exposure amount、budget、target coverage。
- 中间 market candidates：
  - mock 数据当前共 15 个候选。
  - 支持 filter：`All / Kalshi demo / Polymarket / Others`，按钮等宽。
  - 支持 sort：`Default / Liquidity / Relevance / Timeliness`。
  - 小卡片展示 provider、confidence、demo/read-only/blocked 状态、方向、标题、ask、liquidity、选中状态。
  - 点击卡片本体为选中或取消选中。
  - `View details` 打开详情弹窗。
  - 每张卡片有跳转原平台 source URL 的 icon。
  - 底部 `Continue x/15` 按钮，未选中时置灰，已选中时高亮。
- 详情弹窗：
  - 展示标的标题和平台跳转 icon。
  - 展示 Yes/No 概率。
  - 展示概率走势图。
  - 展示 bid、ask、range、move。
  - 展示规则与盘口背景，支持展开。
  - 订单 ticket 只展示当前推荐方向：Action Buy、Outcome Yes。
  - 支持数量输入和快捷数量按钮 `100 / 250 / 500 / 1000`。
  - 展示 estimated cost、potential payout、demo balance、remaining。
- Hedge plan 弹窗：
  - 由底部 `Continue` 唤起。
  - 直接显示 quote detail，不再有多余中间步骤。
  - 展示 cost、max payout、remaining exposure、quote expiry、scenario table。
  - 下单前必须连接 demo wallet。
  - 连接后按钮从 `Connect wallet` 变为 `Confirm`。
  - 仍需勾选非保险确认。
  - demo 执行成功后显示 execution filled 状态。

重要限制：

- 钱包连接只是前端 demo 状态。
- Polymarket 当前只读或 blocked，不做应用内交易。
- Kalshi 默认 simulator，真实 demo API 需要服务端 env。

### 4.3 账户中心 `/account`

核心文件：

- `src/app/account-page.tsx`
- `src/app/account-nav.tsx`
- `src/app/demo-auth-client.ts`
- `src/app/identity-panel.tsx`
- `src/lib/app/demo-session.ts`

当前已实现：

- `Log in` 弹窗支持 `Continue in demo mode`。
- demo session 使用 httpOnly cookie：`hf_demo_session`。
- 登录后顶栏显示 `Demo operator` 账户入口。
- `/account` 未登录时展示 login gate。
- 已登录后提供四个菜单：
  - `Dashboard`
  - `My profile`
  - `Security`
  - `My orders`
- Dashboard 展示 active scenarios、demo orders、estimated exposure、audit events、recent activity、next actions。
- Profile 可编辑 display name、email、organization、role。
- Security 展示 demo session、platform Kalshi demo account、wallet not connected、no private keys stored、audit trail。
- Orders 展示当前 demo user 订单列表和关联 hedge plan。

重要限制：

- 这不是生产 auth。
- 没有 OAuth、email OTP、钱包签名登录。
- 钱包入口只是 demo/future state。

## 5. API 与服务层

主要 API：

```text
GET  /api/me
POST /api/auth/demo-login
POST /api/auth/logout
GET  /api/account/dashboard
GET  /api/account/orders
GET  /api/account/profile
PATCH /api/account/profile
POST /api/scenarios/parse
POST /api/scenarios
GET  /api/scenarios/[id]/matches
POST /api/hedge-plans
POST /api/orders/demo
GET  /api/orders/[id]
```

服务层：

- `src/lib/app/hedgeframe-service.ts`
  - `createScenario`
  - `getScenarioMatches`
  - `createHedgePlan`
  - `createDemoOrder`
- `src/lib/app/repository.ts`
  - Repository interface。
- `src/lib/app/prisma-repository.ts`
  - Prisma 持久化实现。
- `src/lib/app/memory-repository.ts`
  - 测试和可选内存实现。
- `src/lib/app/repository-factory.ts`
  - 默认 Prisma，`HEDGEFRAME_REPOSITORY=memory` 时走内存。

领域层：

- `src/lib/domain/types.ts`
  - `RiskScenario`
  - `MarketCandidate`
  - `MatchResult`
  - `HedgePlan`
  - `HedgeLeg`
  - `OrderExecution`
- `src/lib/domain/scenario-parser.ts`
  - 简单自然语言解析。
- `src/lib/domain/matcher.ts`
  - 根据风险类型、地点、时间、触发条件、流动性等排序。
- `src/lib/domain/hedge-planner.ts`
  - 预算、目标覆盖、数量、成本、payout、scenario table。
- `src/lib/domain/execution.ts`
  - quote expiry、idempotency、市场状态、demo execution 校验。
- `src/lib/domain/mock-markets.ts`
  - 当前 mock 市场目录。

Kalshi demo adapter：

- `src/lib/adapters/kalshi-demo.ts`
- 默认不启用真实 API。
- 启用条件：
  - `KALSHI_DEMO_EXECUTION_MODE="api"`
  - `KALSHI_DEMO_API_KEY_ID` 存在
  - `KALSHI_DEMO_PRIVATE_KEY` 存在
- 使用 RSA PSS 对 Kalshi 请求签名。
- key 只能放服务端 env，不能进入前端 bundle。

## 6. 数据模型

Prisma schema 在 `prisma/schema.prisma`。

当前模型：

- `User`
- `DemoSession`
- `RiskScenario`
- `MarketSnapshot`
- `MatchResult`
- `HedgePlan`
- `HedgeLeg`
- `OrderIntent`
- `OrderExecution`
- `AuditLog`

当前数据库：

- SQLite：`prisma/dev.db`
- schema 有迁移到 Postgres 的结构基础，但尚未真正切 Postgres。

注意点：

- `RiskScenario`、`HedgePlan`、`OrderExecution`、`AuditLog` 已支持 nullable `userId`。
- 老数据允许没有 user 归属。
- `GET /api/account/orders` 是按当前 demo user scoped。
- `GET /api/orders/[id]` 当前按 id 查询，没有 user scope。生产化前必须收紧权限。

## 7. 测试覆盖

测试文件：

```text
src/lib/domain/hedgeframe.test.ts
src/lib/app/hedgeframe-service.test.ts
src/lib/app/prisma-repository.test.ts
src/lib/adapters/kalshi-demo.test.ts
src/app/api-routes.test.ts
src/app/account-api.test.ts
src/app/home-page.test.tsx
e2e/hedgeframe.spec.ts
```

当前 E2E 覆盖主路径：

- 首页首屏和导航。
- demo 登录。
- 首页 `How it works` 标题不换行。
- 平台品牌 rail 尺寸。
- risk story rail 动效和布局。
- 首页场景进入 markets。
- market filter、sort、小卡片、详情弹窗。
- 概率走势图、规则背景、数量快捷键、order ticket。
- Continue 按钮和 hedge plan 弹窗。
- wallet gating。
- 非保险确认。
- demo order 执行。
- account orders。
- profile 持久化。
- security 文案红线。
- 页面横向溢出检查。

最近确认通过的命令：

```bash
npm run test:e2e -- e2e/hedgeframe.spec.ts --project=desktop
npm test
npm run lint
npm run build
```

## 8. 设计系统与交互约束

当前视觉方向：

- 冷黑、冷灰、近黑。
- 亮黄色作为主强调色。
- 少量橙红作为视觉块点缀。
- 像素格、细线、低圆角。
- 页面整体偏 Mistral/Lovable 参考，但更冷峻、更像风险基础设施。

已有重要交互：

- 首屏滚动展开动效。
- `LogoLoop` 横向滚动平台品牌和风险故事。
- markets 小卡片选择和详情弹窗。
- hedge plan 底部 CTA 和弹窗。

后续继续 UI 时要注意：

- 不要新增无意义动效。
- 保持 reduced-motion 兜底。
- 不要把 `Connect wallet` 放回公共顶栏。
- 不要引入紫色 AI 渐变风格。
- 不要把运营/合规文案写成保险承诺。

## 9. 尚未完成或需要谨慎处理的部分

### 9.1 真实市场数据

当前市场数据来自 `mockMarkets`。后续要做真实产品，需要：

- Kalshi market catalog sync。
- Kalshi orderbook/price sync。
- Polymarket Gamma/CLOB catalog sync。
- Polymarket orderbook/price sync。
- 统一 `MarketCandidate` 归一化。
- 市场关闭、价格变化、流动性不足、quote expiry 的实时校验。
- 历史概率入库。

### 9.2 真实执行

当前默认 simulator。真实 Kalshi demo API 适配器已有雏形，但还需要：

- 真实 demo key 环境验证。
- provider error mapping。
- 部分成交状态展示。
- order status polling。
- cancellation/expiry。
- 更强 idempotency 持久化。

Polymarket 当前不执行交易。若后续支持，需要单独设计：

- 用户自己的 Polymarket proxy wallet。
- USDC deposit/approve 流程。
- CLOB 签名订单。
- 地区限制和 geoblock。
- 合规隔离。

### 9.3 钱包与支付

当前 wallet 是 demo 状态。用户后续要求过：

- 优先支持链上钱包登录和支付。
- 前期支持 EVM 网络。
- 用户自托管资金，需要用时再发起转账。
- 后续支持银行卡、线上支付等渠道。

这部分还没有生产实现。建议先做产品和合规设计，再接 WalletConnect/RainbowKit/Wagmi 或支付服务。

### 9.4 多语言

当前语言菜单只是 UI，不会切换全站文案。

建议后续：

- 引入 `next-intl` 或轻量 dictionary。
- 路由策略先定：`/en`、`/zh-CN` 还是 cookie/session。
- 首期至少维护 `en` 和 `zh-CN`。
- 所有合规红线文案要逐语言人工审核。

### 9.5 Auth 与用户中心

当前是 demo session。生产需要：

- 真实 auth 方案：Clerk/Auth.js/OAuth/email OTP/钱包签名登录。
- 用户与订单权限强绑定。
- `/api/orders/[id]` 加 user scope。
- session rotation、CSRF 策略、rate limit。

### 9.6 部署

项目可部署到 Vercel，但当前交接时没有确认最新生产 URL。

建议下一线程先做：

```bash
npm run build
vercel
```

再补：

- Vercel env vars。
- Prisma 生产数据库，建议 Postgres。
- GitHub branch/PR 流程。

## 10. 新线程建议优先级

建议新线程按以下顺序接手：

1. 打开并阅读本文件、`README.md`、`docs/hedgeframe-homepage-pm-review.md`、`docs/hedgeframe-backend-framework.zh-CN.md`。
2. 拉起本地服务并跑完整验证。
3. 先确认首页和 markets 的当前 UI 是否已满足阶段验收。
4. 决定是否把两个未跟踪 docs 提交到 Git。
5. 补齐真实 i18n 或继续 polish 首页。
6. 设计 wallet/payment 的生产路径，不要直接把 demo wallet 改成真钱入口。
7. 设计真实 provider sync，再替换 mock market catalog。
8. 部署到 Vercel 并建立 staging URL。

## 11. 上线红线

以下任一出现都应阻止上线：

- 前端 bundle 或日志里出现 Kalshi private key、API key、用户私钥。
- 未登录用户能看到其他用户订单或业务数据。
- quote 过期仍可确认执行。
- 市场关闭、价格超限、流动性不足仍允许执行。
- 没有审计日志。
- 相同 idempotency key 造成重复下单。
- 使用“保险赔付”“保证覆盖”“无风险”等误导文案。
- Polymarket 被描述成当前可交易，但实际只读。
- demo wallet 被误导为真钱钱包。

## 12. 推荐给新线程的启动提示词

可以直接复制给新线程：

```text
请在 /Users/zappa/Documents/EZInsurance 继续 HedgeFrame 项目。先打开 docs/hedgeframe-project-handoff.zh-CN.md、README.md、docs/hedgeframe-homepage-pm-review.md、docs/hedgeframe-backend-framework.zh-CN.md，确认当前分支 codex/hedgeframe-mvp 和本地状态。不要把 demo 功能误当生产功能。先跑 npm test、npm run lint、npm run build、npm run test:e2e，再根据我新的需求继续开发。
```
