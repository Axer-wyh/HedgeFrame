# HedgeFrame Landing + Workspace Structure, Lovable-Mapped Draft

Status: review draft for product/content approval  
Reference checked: `https://lovable.dev/`, captured on 2026-06-26 with desktop and mobile screenshots.  
Local references used: Lovable design notes, React Bits motion archive, Pixel Perfect UI archive.

## 0. Working Assumption To Confirm

Lovable's current homepage is not a dense dashboard. It is a direct-input landing page with one dominant chat box, large atmospheric gradient, generous whitespace, lightweight sections, and a repeated input near the footer.

For HedgeFrame, the structure should match Lovable closely, but the skin should be colder and more precise:

- Landing page: cold off-white or mist-gray surface, near-black text, cyan/blue pixel aurora, subtle grid and dither texture.
- Product workspace after submit: darker, denser, operational UI.
- No fake customer logos, no insurance promise, no guaranteed payout language.
- Homepage CTA input routes to `/markets`, where the actual filtering, ranking, plan, and demo execution flow lives.

Open decision: whether the landing page should be light-cold like Lovable or fully near-black. My recommendation is light-cold landing + dark workspace, because it follows Lovable's spatial rhythm more closely and avoids the current cramped dashboard feel.

## 1. Lovable Page Structure Observed

Desktop sequence:

1. Sticky top nav: logo left, nav links `Solutions`, `Resources`, `Community`, `Enterprise`, `Pricing`, `Security`, then `Log in` and primary `Get started`.
2. Mega menu interactions:
   - `Solutions`: large rounded panel, left multi-column audience list, right use-case column.
   - `Resources`: large rounded panel, left resource links, right announcement card with image.
3. Hero: large vertical blank space, centered headline, subtitle, and a large rounded chat input.
4. Chat controls: plus button, mode dropdown, voice button, send button. Send turns active after typing.
5. Trust/logo strip.
6. "Meet Lovable": left visual preview, right three clickable step rows.
7. "Discover templates": grid of template cards and a small `View all` action.
8. "Lovable in numbers": three large metric cards.
9. Bottom CTA: small category label, repeated chat input, gradient behind it.
10. Large rounded footer card: logo, multi-column links, language selector.

Mobile sequence:

1. Logo left, primary CTA, hamburger.
2. Open menu becomes a full-screen off-white panel with large rows and chevrons.
3. Bottom sticky actions: `Log in` and primary CTA.
4. Hero, input, sections, cards, stats, bottom input, and footer stack vertically.

## 2. HedgeFrame Page Map

### 2.1 Header

Lovable mapping: sticky nav with logo, two dropdowns, direct links, right-side auth actions.

HedgeFrame content:

- Logo: pixel-gradient risk mark + `HedgeFrame`.
- Nav item 1: `Solutions` mega menu.
- Nav item 2: `Resources` mega menu.
- Direct link 1: `Catalog`.
- Direct link 2: `Teams`.
- Direct link 3: `Pricing`.
- Direct link 4: `Security`.
- Right actions: `Log in` outline button, `Connect wallet` primary button.

`Solutions` mega menu content:

- Column label: `Who is it for?`
- Items:
  - `Event organizers` / Weather-sensitive outdoor revenue.
  - `Venue owners` / Cancellations, attendance, and operating loss.
  - `SMB finance` / Budgeted exposure before an event window.
  - `Logistics coordinators` / Route and delay risk, low-confidence first.
  - `Brokers and advisors` / Transparent scenario notes for clients.
  - `Risk ops` / Repeatable audit trail and order intent snapshots.
- Right column label: `Use cases`
- Use cases:
  - `Weather events` / Rain, snow, heat, wind.
  - `Revenue interruption` / Cancellation and footfall-sensitive exposure.
  - `Shipping route` / Parsed, explained, blocked unless market fit is strong.

`Resources` mega menu content:

- Link grid:
  - `Docs` / How scenario parsing and matching works.
  - `Market catalog` / Mock, Kalshi demo, Polymarket read-only.
  - `Scenario library` / Starter examples by industry.
  - `Basis risk guide` / What a contract covers and misses.
  - `Kalshi demo guide` / Limit orders, quote TTL, idempotency.
  - `Safety checklist` / Not insurance, no custody, no private keys.
- Right announcement card:
  - Eyebrow: `MVP workflow`
  - Title: `Weather/event demo is ready for review`
  - Body: `Parse a scenario, inspect candidates, build a quote, and run a Kalshi demo order.`
  - CTA: `Open demo`

Interactions:

- Desktop dropdown panel opens below nav and overlays hero, with rounded 24px container.
- Dropdown closes on outside click, Escape, and selecting a link.
- Mobile hamburger opens a full-screen panel with large rows: `Solutions`, `Resources`, `Catalog`, `Teams`, `Pricing`, `Security`.
- Mobile bottom actions stay fixed: `Log in` and `Connect wallet`.

### 2.2 Hero

Lovable mapping: large atmospheric gradient, centered headline, compact subtitle, dominant chat input.

HedgeFrame content:

- Eyebrow: `Prediction-market hedge discovery`
- H1: `What risk are you exposed to?`
- Subtitle: `Describe the event, place, time window, trigger, and exposed amount. HedgeFrame maps it to prediction-market candidates and shows the basis risk before demo execution.`
- Prompt placeholder rotation:
  - `My outdoor event loses $80k if heavy rain hits Austin on Oct 12.`
  - `A venue loses weekend revenue if snow closes access in Chicago.`
  - `A crude shipment is exposed to route disruption between the Gulf and Houston.`
- Inline disclaimer under input: `This is not insurance. Demo execution only.`

Prompt box UI:

- Large rounded rectangle, white/cold surface, 1px subtle border.
- Contenteditable input area, no visible textarea chrome.
- Left circle plus button: attach route, contract, or event doc.
- Right controls:
  - Mode pill: `Discover` with chevron.
  - Optional disabled mic button in phase one.
  - Send arrow circle.

Prompt states:

- Empty: send disabled, controls muted.
- Typed: send active, arrow becomes dark/primary.
- Submit: input compresses slightly, a route-loading overlay appears, then navigate to `/markets?scenario=...`.
- Error: inline message below box, no modal.

Hero visual:

- Lovable uses warm blue/pink/orange gradient. HedgeFrame should use cold aurora: cyan, ice blue, deep graphite, very small violet trace if needed.
- Add pixel dither/grid on the gradient, but keep the first viewport uncluttered.

### 2.3 Operator Strip

Lovable mapping: logo strip immediately below hero.

HedgeFrame content should not pretend to have customers. Use category marks instead:

- Label: `Built for operators with time-bound exposure`
- Items:
  - `Outdoor events`
  - `Venues`
  - `SMB finance`
  - `Logistics`
  - `Advisors`

UI:

- Same centered horizontal strip on desktop.
- On mobile, wrap into two rows or horizontal scroll.
- Use monochrome wordmarks or compact pixel icons, not colorful badges.

### 2.4 "Meet HedgeFrame" Section

Lovable mapping: left visual preview, right three large clickable step rows.

Section content:

- H2: `Meet HedgeFrame`
- Intro: `A plain-language risk scenario becomes ranked market candidates, a hedge plan, and a demo execution record.`

Right step rows:

1. `Start with an exposure`
   - Body: `Describe what can go wrong, where, when, trigger conditions, and how much revenue is at risk.`
   - Left preview: parsed fields card with subject, location, dates, trigger, exposure, budget.
2. `Watch market fit resolve`
   - Body: `Candidates are scored by event fit, location, time overlap, settlement rules, liquidity, and basis risk.`
   - Left preview: 3 ranked market rows, confidence tags, blocked reason for weak matches.
3. `Refine and demo execute`
   - Body: `Choose eligible legs, review quote expiry and scenario table, then submit a limit-only Kalshi demo order.`
   - Left preview: hedge plan with cost, max payout, remaining exposure, quote TTL, acknowledgement checkbox.

Interactions:

- Step rows are buttons.
- Active row is dark/primary text; inactive rows are muted.
- Clicking a row swaps the left preview with a short crossfade/slide.
- Keyboard arrows move between steps.

### 2.5 Scenario Library

Lovable mapping: `Discover templates` card grid.

HedgeFrame content:

- H2: `Discover scenarios`
- Subtitle: `Start from a risk pattern, then edit the details before matching markets.`
- Small action: `View all`

Cards:

1. `Austin outdoor rain` / `Event loss from heavy rainfall`
2. `Chicago snow closure` / `Venue access and cancellation risk`
3. `Dallas heat attendance` / `Weather-sensitive footfall`
4. `Gulf storm weekend` / `Regional weather disruption`
5. `Shipping route disruption` / `Low-confidence geopolitical mapping`
6. `Wildfire smoke event` / `Air-quality sensitive attendance`
7. `Retail cold snap` / `Weather-sensitive revenue`
8. `Conference travel disruption` / `Flight and arrival dependency`

Card UI:

- Image/visual thumbnail at top, title and subtitle below.
- Thumbnail should show the actual state: rain map, calendar, route line, or market rows. Avoid stock-photo atmosphere.
- `Shipping route disruption` card must show a `low confidence` or `review only` tag.

Card interaction:

- Click pre-fills the hero/bottom prompt and can route to `/markets` when submitted.
- Hover raises border contrast only; no heavy shadow.

### 2.6 Numbers / Proof Section

Lovable mapping: three large metric cards.

HedgeFrame should use honest MVP metrics, not fake traction.

- H2: `HedgeFrame in numbers`
- Subtitle: `Phase-one demo surfaces the controls that matter before real execution.`

Metric cards:

1. `5` / `mock markets in the demo catalog`
2. `6` / `match dimensions explained per candidate`
3. `0` / `private keys or customer funds stored`

Optional fourth if layout needs it:

- `5m` / `quote TTL before refresh is required`

Motion:

- Counter increments once when card enters viewport.
- Reduced motion: static values.

### 2.7 Bottom CTA

Lovable mapping: repeated chat input above footer over the same gradient field.

HedgeFrame content:

- Eyebrow: `Risk hedge discovery`
- H2: `Ready to map an exposure?`
- Same prompt box component as hero, smaller max width.
- Placeholder: `Describe the loss scenario, trigger, date range, and amount at risk...`

Behavior:

- Same submit path as hero.
- If user already typed in hero but did not submit, bottom prompt should preserve or offer the same text.

### 2.8 Footer

Lovable mapping: large rounded footer card with logo and five columns.

HedgeFrame footer columns:

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

Footer details:

- Include small language selector at bottom-left.
- Include clear line: `HedgeFrame is a prediction-market hedge discovery and demo execution assistant. It does not underwrite losses, hold funds, or provide investment advice.`

## 3. Post-Submit Workspace Page

Lovable mapping: homepage prompt opens the actual builder app. HedgeFrame prompt should open the market/portfolio workspace.

Route: `/markets`

### 3.1 Loading / Transition

After prompt submit:

1. `Parsing scenario`
2. `Checking time and location overlap`
3. `Scoring settlement rules`
4. `Building candidate list`

UI:

- Full-page or in-page cold loading state.
- Skeleton candidate rows appear before data.
- Decrypted status label can run during loading.
- No fake progress percent.

### 3.2 Workspace Layout

Desktop:

- Top compressed nav: HedgeFrame logo, back to home, scenario title, `Log in`, `Connect wallet`.
- Left rail: scenario input and editable parsed fields.
- Center: market candidate list and filters.
- Right rail: hedge plan, quote checks, acknowledgement, demo execution status.

Mobile:

- Top nav.
- Tabs: `Scenario`, `Markets`, `Plan`, `Status`.
- Bottom sticky action when plan is ready.

### 3.3 Candidate List Content

Each market card must show:

- Provider: `Kalshi demo`, `Polymarket read-only`, or `Mock`
- Execution state: `demo ready`, `read-only`, `blocked`
- Market title
- Settlement rule summary
- Covers
- Does not cover
- Match dimensions:
  - Event fit
  - Location fit
  - Time overlap
  - Trigger fit
  - Rule clarity
  - Liquidity
  - Basis risk
- Best ask, liquidity, expected slippage
- Reason to execute or block

Filters:

- `All`
- `Weather`
- `Event revenue`
- `Kalshi demo`
- `Polymarket`
- `Blocked`

### 3.4 Hedge Plan Panel

Content:

- Selected legs count
- Estimated cost
- Max payout
- Remaining exposure
- Max loss
- Quote expiry countdown
- Scenario table:
  - Trigger happens
  - Trigger does not happen
  - Partial/ambiguous basis case
- Required acknowledgement:
  - `I understand this is not insurance and may not match my real-world loss.`
- CTA: `Run Kalshi demo order`

Blocked execution states:

- Quote expired
- Market closed
- Price exceeds limit
- Insufficient liquidity
- No direct market fit
- Polymarket read-only

## 4. UI Elements To Build

Shared landing components:

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

Workspace components:

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

Visual primitives:

- Cold aurora background
- Pixel/dither grid overlay
- Rounded mega panel
- Pill button
- Icon button
- Metric card
- Scenario thumbnail
- Status badge
- Countdown badge

## 5. Motion Components

Use motion with reduced-motion fallbacks.

Recommended local archive references:

- React Bits `AnimatedContent`: section entrance, step preview swap.
- React Bits `DecryptedText`: loading/status labels, not large body copy.
- React Bits `SplitText`: optional hero H1 reveal, one-time only.
- Pixel Perfect `gradient-cool-aurora`: hero and bottom CTA background.
- Pixel Perfect `gradient-dual-grid`: cold pixel/grid treatment.
- Pixel Perfect `intersection-grid-svg`: subtle footer/section border texture.
- Pixel Perfect `text-typewriter-glitch`: short terminal-style status labels only.

Motion rules:

- Hero gradient drifts slowly, max 12-16 seconds per cycle.
- Prompt submit compresses 2-4px and fades into route loading.
- Mega menus animate opacity + y only, no rotation.
- Step preview crossfades and slides 8-12px.
- Scenario cards reveal in a short stagger.
- Candidate selection has border/inner-fill transition, no layout jump.
- Execution success can use ripple, but only after actual demo response.
- Disable nonessential animation under `prefers-reduced-motion`.

Avoid by default:

- Heavy shader scenes.
- Cursor-follow blobs.
- Decorative 3D objects.
- Constant background movement in the workspace.
- Neon/cyberpunk overuse.

## 6. Copy Guardrails

Must say:

- `This is not insurance.`
- `Demo execution only.`
- `Polymarket is read-only in phase one.`
- `HedgeFrame does not hold funds or private keys.`

Must not say:

- insurance payout
- guaranteed coverage
- risk-free
- claim settlement
- underwriting
- guaranteed return

## 7. Implementation Acceptance Checklist

- Desktop landing follows Lovable's section order exactly: nav, hero prompt, strip, meet/steps, scenarios, metrics, bottom prompt, footer.
- Mobile nav matches Lovable behavior: full-screen menu, large rows, bottom auth/CTA actions.
- Hero is dominated by one prompt box, not multiple dashboard panels.
- Homepage submit navigates to `/markets` and preserves scenario text.
- `/markets` shows loading states before candidates.
- Candidate cards explain covers, does not cover, rules, liquidity, slippage, max loss, and basis risk.
- Blocked scenarios clearly explain why execution is not recommended.
- Login and wallet entry points are visible on landing and workspace.
- No fake customer logos or fabricated traction metrics.
- Reduced-motion mode leaves the whole product usable and readable.

