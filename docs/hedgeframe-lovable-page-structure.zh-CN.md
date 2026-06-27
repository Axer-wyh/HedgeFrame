# HedgeFrame 首页与工作台结构中文稿

状态：产品内容与页面结构确认稿  
参考页面：`https://lovable.dev/` 当前首页结构  
本地参考：Lovable 设计文档、React Bits 动效档案、Pixel Perfect UI 动效档案

## 0. 需要先确认的方向

Lovable 当前首页不是密集型 dashboard，而是一个以输入框为核心的产品入口页。它的节奏是：顶部导航、超大的直接输入区、轻量信任/说明模块、模板卡片、数据指标、底部再次输入和大 footer。

HedgeFrame 应该复用这套页面骨架，但视觉语气要更冷静、更精确：

- 首页：冷白、雾灰或极浅冰灰底色，近黑文字，冷青/冰蓝像素极光背景，轻微网格和抖动纹理。
- 提交后的产品工作台：可以更深、更密、更偏运营工具。
- 不使用虚假客户 logo，不承诺保险赔付，不出现保证覆盖或无风险表达。
- 首页输入框提交后进入 `/markets`，真正的筛选、匹配、计划和 Kalshi demo 执行流程都在工作台完成。

待确认选择：  
首页是做“冷浅色 Lovable 节奏”还是“全近黑像素风”。我建议首页采用冷浅色，工作台采用深色。这样更接近 Lovable 的留白和信息节奏，也能避免当前原型过于拥挤。

## 1. Lovable 实际页面结构

桌面端顺序：

1. 顶部 sticky 导航：左侧 logo，中间是 `Solutions`、`Resources`、`Community`、`Enterprise`、`Pricing`、`Security`，右侧是 `Log in` 和主按钮 `Get started`。
2. Mega menu：
   - `Solutions`：大圆角面板，左侧是目标用户列表，右侧是 use case 列。
   - `Resources`：大圆角面板，左侧资源链接，右侧公告卡片。
3. Hero：大面积留白和渐变背景，中间是 headline、subtitle 和一个大型 chat input。
4. 输入框工具栏：左侧加号，右侧模式选择、语音按钮、发送按钮。输入文字后发送按钮变成 active。
5. logo strip：展示“哪些团队在使用”。
6. `Meet Lovable`：左侧视觉预览，右侧三个可点击步骤。
7. `Discover templates`：模板卡片网格和 `View all`。
8. `Lovable in numbers`：三个大数字卡片。
9. 底部 CTA：再次出现输入框，背后延续渐变。
10. 大 footer 卡片：logo、多列链接、语言选择。

移动端顺序：

1. 左侧 logo，右侧主 CTA 和 hamburger。
2. 打开菜单后是全屏浅色面板，大字号菜单行，带箭头。
3. 底部固定 `Log in` 和主 CTA。
4. Hero、输入框、说明模块、卡片、指标、底部输入和 footer 纵向堆叠。

## 2. HedgeFrame 页面结构映射

### 2.1 顶部导航

Lovable 对应：sticky nav，两个下拉菜单，若干直接链接，右侧账号动作。

HedgeFrame 内容：

- Logo：像素渐变风险标记 + `HedgeFrame`。
- 导航 1：`Solutions` mega menu。
- 导航 2：`Resources` mega menu。
- 直接链接：
  - `Catalog`
  - `Teams`
  - `Pricing`
  - `Security`
- 右侧动作：
  - `Log in`，描边按钮。
  - `Connect wallet`，主按钮。

`Solutions` mega menu 内容：

- 栏目标题：`Who is it for?`
- 用户类型：
  - `Event organizers`：天气敏感的户外活动收入风险。
  - `Venue owners`：取消、到场人数和运营损失。
  - `SMB finance`：在事件窗口前预算风险暴露。
  - `Logistics coordinators`：航线和延误风险，先以低置信度审查。
  - `Brokers and advisors`：给客户准备可解释的场景说明。
  - `Risk ops`：可重复的审计记录和订单意图快照。
- 右侧栏目：`Use cases`
  - `Weather events`：雨、雪、高温、强风。
  - `Revenue interruption`：取消、客流、收入敏感场景。
  - `Shipping route`：可解析、可解释，只有强匹配时才建议执行。

`Resources` mega menu 内容：

- 链接区：
  - `Docs`：场景解析和匹配逻辑。
  - `Market catalog`：mock、Kalshi demo、Polymarket 只读。
  - `Scenario library`：按行业整理的起步场景。
  - `Basis risk guide`：合约覆盖什么、不覆盖什么。
  - `Kalshi demo guide`：限价单、quote TTL、幂等键。
  - `Safety checklist`：非保险、不托管资金、不保存私钥。
- 右侧公告卡：
  - 小标题：`MVP workflow`
  - 标题：`Weather/event demo is ready for review`
  - 正文：`Parse a scenario, inspect candidates, build a quote, and run a Kalshi demo order.`
  - CTA：`Open demo`

交互：

- 桌面端 dropdown 在导航下方展开，覆盖 hero 上方区域，大圆角面板。
- 点击外部、按 Escape、点击链接后关闭。
- 移动端 hamburger 打开全屏菜单，菜单项为 `Solutions`、`Resources`、`Catalog`、`Teams`、`Pricing`、`Security`。
- 移动端菜单底部固定 `Log in` 和 `Connect wallet`。

### 2.2 Hero 首屏

Lovable 对应：大渐变背景，居中 headline，短 subtitle，一个核心 chat input。

HedgeFrame 内容：

- Eyebrow：`Prediction-market hedge discovery`
- H1：`What risk are you exposed to?`
- Subtitle：`Describe the event, place, time window, trigger, and exposed amount. HedgeFrame maps it to prediction-market candidates and shows the basis risk before demo execution.`
- 输入框 placeholder 轮播：
  - `My outdoor event loses $80k if heavy rain hits Austin on Oct 12.`
  - `A venue loses weekend revenue if snow closes access in Chicago.`
  - `A crude shipment is exposed to route disruption between the Gulf and Houston.`
- 输入框下方声明：`This is not insurance. Demo execution only.`

输入框 UI：

- 大圆角矩形，冷白表面，1px 细边框。
- 输入区像 chat，不要有明显 textarea 浏览器默认样式。
- 左侧圆形加号：后续可用于上传路线、合同或事件文件，一期可禁用。
- 右侧工具：
  - 模式 pill：`Discover` + chevron。
  - 语音按钮：一期可禁用或隐藏。
  - 发送箭头圆按钮。

输入框状态：

- 空状态：发送按钮 disabled，工具栏弱化。
- 已输入：发送按钮 active。
- 提交：输入框轻微压缩 2 到 4px，出现短暂 loading，随后跳转到 `/markets?scenario=...`。
- 错误：输入框下方显示 inline error，不用 modal。

Hero 视觉：

- Lovable 是暖色蓝、粉、橙渐变。
- HedgeFrame 改成冷极光：cyan、ice blue、graphite，可少量使用 violet。
- 加入像素 dither 和细网格，但首屏不要堆过多图表。

### 2.3 Operator Strip

Lovable 对应：hero 下方的 logo strip。

HedgeFrame 不应该假装已有客户 logo，改成目标场景分类：

- Label：`Built for operators with time-bound exposure`
- 项目：
  - `Outdoor events`
  - `Venues`
  - `SMB finance`
  - `Logistics`
  - `Advisors`

UI：

- 桌面端居中横排。
- 移动端两行换行或横向滚动。
- 用单色字标或小像素图标，不用花哨徽章。

### 2.4 Meet HedgeFrame

Lovable 对应：左侧视觉预览，右侧三个可点击步骤。

内容：

- H2：`Meet HedgeFrame`
- Intro：`A plain-language risk scenario becomes ranked market candidates, a hedge plan, and a demo execution record.`

右侧三个步骤：

1. `Start with an exposure`
   - 正文：描述可能损失、地点、时间、触发条件和暴露金额。
   - 左侧预览：解析字段卡片，包含 subject、location、dates、trigger、exposure、budget。
2. `Watch market fit resolve`
   - 正文：按事件匹配、地点、时间重叠、结算规则、流动性和 basis risk 给候选市场评分。
   - 左侧预览：3 条候选市场，置信度 tag，弱匹配时显示 blocked reason。
3. `Refine and demo execute`
   - 正文：选择可执行 legs，检查 quote expiry 和 scenario table，然后提交 Kalshi demo 限价单。
   - 左侧预览：hedge plan，包含 cost、max payout、remaining exposure、quote TTL、确认 checkbox。

交互：

- 三个 step row 都是 button。
- 当前 active 行文字更深，非 active 行弱化。
- 点击行时左侧 preview crossfade，并轻微上下滑动。
- 键盘上下箭头可以切换步骤。

### 2.5 Scenario Library

Lovable 对应：`Discover templates` 模板卡片网格。

HedgeFrame 内容：

- H2：`Discover scenarios`
- Subtitle：`Start from a risk pattern, then edit the details before matching markets.`
- 小按钮：`View all`

卡片：

1. `Austin outdoor rain`：户外活动因强降雨损失。
2. `Chicago snow closure`：雪天导致场馆访问受阻和取消。
3. `Dallas heat attendance`：高温影响到场人数。
4. `Gulf storm weekend`：区域风暴扰动。
5. `Shipping route disruption`：低置信度地缘/航运映射。
6. `Wildfire smoke event`：空气质量影响活动。
7. `Retail cold snap`：寒潮影响线下收入。
8. `Conference travel disruption`：航班和到达依赖。

卡片 UI：

- 上方是真实状态缩略图：雨量地图、日历、路线线条、市场行等。
- 下方是标题和一句 subtitle。
- `Shipping route disruption` 必须带 `low confidence` 或 `review only` 标签。
- 避免使用只营造氛围的 stock photo。

卡片交互：

- 点击后预填 hero 或 bottom prompt。
- 用户再提交时进入 `/markets`。
- hover 只提高边框对比，不使用重阴影。

### 2.6 数字与证明区

Lovable 对应：三个大数字卡片。

HedgeFrame 不能伪造增长数据，使用诚实的 MVP 指标：

- H2：`HedgeFrame in numbers`
- Subtitle：`Phase-one demo surfaces the controls that matter before real execution.`

指标卡：

1. `5`：demo catalog 中的 mock markets。
2. `6`：每个 candidate 解释的 match dimensions。
3. `0`：保存的用户私钥或托管资金。

可选第四张：

- `5m`：quote TTL，过期必须刷新。

动效：

- 数字在进入 viewport 时递增一次。
- reduced motion 下直接显示静态值。

### 2.7 底部 CTA

Lovable 对应：footer 前再次出现 chat input，背后延续渐变。

HedgeFrame 内容：

- Eyebrow：`Risk hedge discovery`
- H2：`Ready to map an exposure?`
- 使用和 hero 相同的 prompt box，但宽度稍小。
- Placeholder：`Describe the loss scenario, trigger, date range, and amount at risk...`

行为：

- 提交流程与 hero 一致。
- 如果用户在 hero 输入过但没有提交，底部 prompt 可以保留或提示复用同一段文字。

### 2.8 Footer

Lovable 对应：大圆角 footer 卡片，包含 logo 和多列链接。

HedgeFrame footer 列：

- `Company`
  - About
  - Brand
  - Partnerships
  - Careers
- `Product`
  - Weather events
  - Venue revenue
  - Shipping route review
  - Audit ledger
  - API
- `Resources`
  - Docs
  - Scenario library
  - Market catalog
  - Kalshi demo guide
  - Changelog
  - Status
- `Legal`
  - This is not insurance
  - Risk disclosure
  - Privacy
  - Terms
  - Compliance notes
  - Report issue
- `Community`
  - Operator council
  - Partner network
  - X / Twitter
  - LinkedIn

Footer 说明：

- 左下角保留语言选择。
- 明确写：`HedgeFrame is a prediction-market hedge discovery and demo execution assistant. It does not underwrite losses, hold funds, or provide investment advice.`

## 3. 提交后的 Workspace 页面

Lovable 对应：首页 prompt 打开真正的 builder app。  
HedgeFrame 对应：首页 prompt 打开预测市场/portfolio 工作台。

路由：`/markets`

### 3.1 Loading / Transition

提交后依次显示：

1. `Parsing scenario`
2. `Checking time and location overlap`
3. `Scoring settlement rules`
4. `Building candidate list`

UI：

- 可用整页 loading，也可在 workspace 内 loading。
- 数据返回前先显示 candidate skeleton rows。
- 可使用 DecryptedText 风格的状态标签。
- 不显示假的百分比进度。

### 3.2 Workspace 布局

桌面端：

- 顶部压缩导航：HedgeFrame logo、返回首页、场景标题、`Log in`、`Connect wallet`。
- 左侧 rail：场景输入和可编辑解析字段。
- 中间：市场候选列表和 filters。
- 右侧 rail：hedge plan、quote checks、确认项、demo execution 状态。

移动端：

- 顶部 nav。
- Tabs：`Scenario`、`Markets`、`Plan`、`Status`。
- plan ready 后底部出现 sticky action。

### 3.3 Market Candidate Card 内容

每张市场卡必须展示：

- Provider：`Kalshi demo`、`Polymarket read-only` 或 `Mock`。
- Execution state：`demo ready`、`read-only`、`blocked`。
- Market title。
- Settlement rule summary。
- Covers。
- Does not cover。
- Match dimensions：
  - Event fit
  - Location fit
  - Time overlap
  - Trigger fit
  - Rule clarity
  - Liquidity
  - Basis risk
- Best ask、liquidity、expected slippage。
- 推荐执行或阻止执行的原因。

Filters：

- `All`
- `Weather`
- `Event revenue`
- `Kalshi demo`
- `Polymarket`
- `Blocked`

### 3.4 Hedge Plan Panel

内容：

- Selected legs count。
- Estimated cost。
- Max payout。
- Remaining exposure。
- Max loss。
- Quote expiry countdown。
- Scenario table：
  - Trigger happens
  - Trigger does not happen
  - Partial/ambiguous basis case
- 必选确认：
  - `I understand this is not insurance and may not match my real-world loss.`
- CTA：`Run Kalshi demo order`

阻止执行状态：

- Quote expired。
- Market closed。
- Price exceeds limit。
- Insufficient liquidity。
- No direct market fit。
- Polymarket read-only。

## 4. 需要建设的 UI 元素

首页共享组件：

- `SiteHeader`
- `MegaMenu`
- `MobileNavPanel`
- `HeroPrompt`
- `PromptToolbar`
- `OperatorStrip`
- `StepPreviewSection`
- `ScenarioCardGrid`
- `MetricCards`
- `BottomPrompt`
- `FooterCard`

Workspace 组件：

- `WorkspaceHeader`
- `ScenarioEditor`
- `LoadingPipeline`
- `MarketFilterTabs`
- `MarketCandidateCard`
- `MatchScoreMatrix`
- `BasisRiskExplainer`
- `HedgePlanPanel`
- `QuoteExpiryBadge`
- `ExecutionStatusCard`

视觉基础元素：

- 冷色 aurora background。
- Pixel/dither grid overlay。
- 大圆角 mega panel。
- Pill button。
- Icon button。
- Metric card。
- Scenario thumbnail。
- Status badge。
- Countdown badge。

## 5. 动效组件清单

所有动效必须支持 reduced-motion fallback。

建议使用的本地档案组件：

- React Bits `AnimatedContent`：section entrance、step preview 切换。
- React Bits `DecryptedText`：loading/status 标签，不用于大段正文。
- React Bits `SplitText`：可选 hero H1 首次 reveal，只播放一次。
- Pixel Perfect `gradient-cool-aurora`：hero 和底部 CTA 背景。
- Pixel Perfect `gradient-dual-grid`：冷色像素网格。
- Pixel Perfect `intersection-grid-svg`：footer 或 section 边界纹理。
- Pixel Perfect `text-typewriter-glitch`：短状态文本，不能滥用。

动效规则：

- Hero gradient 缓慢漂移，一个循环 12 到 16 秒。
- prompt submit 时轻微压缩 2 到 4px，再进入 route loading。
- mega menu 只做 opacity + y 位移，不做旋转。
- step preview 只做 crossfade 和 8 到 12px 位移。
- scenario cards 可短 stagger reveal。
- candidate selection 只改 border 和 inner fill，不能造成布局跳动。
- execution success 只有在真实 demo response 后才出现 ripple。
- `prefers-reduced-motion` 下禁用非必要动效。

默认避免：

- 重型 shader 场景。
- 跟随光标的 blob。
- 装饰性 3D 对象。
- workspace 中持续运动的背景。
- 过度 neon/cyberpunk 风格。

## 6. 文案红线

必须出现：

- `This is not insurance.`
- `Demo execution only.`
- `Polymarket is read-only in phase one.`
- `HedgeFrame does not hold funds or private keys.`

禁止出现：

- insurance payout
- guaranteed coverage
- risk-free
- claim settlement
- underwriting
- guaranteed return
- 保险赔付
- 保证覆盖
- 无风险
- 理赔
- 承保

## 7. 实现验收清单

- 桌面端首页结构必须按 Lovable 顺序：nav、hero prompt、strip、meet/steps、scenarios、metrics、bottom prompt、footer。
- 移动端 nav 必须接近 Lovable 行为：全屏菜单、大行高、底部 auth/CTA。
- Hero 首屏只能突出一个 prompt box，不能堆 dashboard 面板。
- 首页提交后进入 `/markets`，并保留 scenario text。
- `/markets` 在展示 candidates 前必须有 loading state。
- Candidate card 必须解释 covers、does not cover、rules、liquidity、slippage、max loss 和 basis risk。
- Blocked scenario 必须清楚说明为什么不建议执行。
- 登录和钱包入口在首页和 workspace 都必须可见。
- 不使用虚假客户 logo 或伪造增长数据。
- reduced-motion 模式下产品必须完整可用、可读。

