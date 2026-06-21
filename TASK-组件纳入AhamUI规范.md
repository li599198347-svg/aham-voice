# 任务卡：把 AhamVoice 招牌自创组件纳入 Aham UI 规范

> 这是给「设计会话」的输入。你的任务：在 **Aham UI v6.0** 规范框架下，把下面这些 AhamVoice 业务特有组件**正式设计成官方规范**（类名 + CSS + DESIGN.md 章节 + 必要的 token）。它们官方暂无对应，但已在 AhamVoice 实现并守住官方铁律，现要沉淀为规范，供 Aham 全系列（Voice / Survey / PPT …）复用。

## 你要扩充的目标（规范库）
`/Users/lichengbao/Documents/Aham-UI/`
- `aham-ui.css` — 组件 class（新组件建议放第 8 节之后或新建一节）
- `DESIGN.md` — 八层规范（为每个组件补写章节，多数归入「第 2 层 控件与组件」）
- `tokens.json` — 仅在确实缺档时新增 token
- `examples/` — 可加示例 html

## 现有实现参考（AhamVoice，作为设计起点，不是照搬）
`/Users/lichengbao/Documents/aham-voice/frontend-src/src/`
- `styles/components-voice.css` — 自写类定义
- `components/voice/`（AudioPlayer / TranscriptView 等）、`components/Avatar.tsx`
- `pages/app/RecordingDetail/`、`layouts/AppShell.tsx`、`layouts/AuthShell.tsx`
- 完整审计与判断见 `/Users/lichengbao/Documents/aham-voice/COMPONENT_AUDIT.md` 的「第二类」。

## 设计约束（Aham UI 铁律，逐条必须守）
- 颜色只来自 token 调色板；蓝 `#336EE8` 只点缀（主操作/选中/logo）；状态以三灰为主 + 极弱语义色，**不靠颜色单独传达**（多类别用形状/文字/图标多通道）。
- 字体只 Inter / Inter Display + JetBrains Mono；**数字/时间码用 mono**；无衬线，层级靠字号字重。
- 卡片无边框无阴影、**仅浮层有阴影**；选中 = 扁平灰非蓝；表格只横线。
- 间距/圆角/控件尺寸只用既定档位，**绝不写死像素**；布局用 rem/相对单位。
- 暗色用 `[data-theme="dark"]`，组件引用语义 token 自动适配。
- 每个组件交付要含「第 7 章 lint 自查项」，便于后续机读校验。

---

## 要规范化的组件（按优先级）

### ① 媒体播放器 `.player`（招牌件，最高优先）
- **现状**：`.vplayer / __wave / __time / .vplayer--min`（迷你档）+ 纯 SVG 波形；React 在 `components/voice/AudioPlayer.tsx`。
- **用途**：音频回放——灰阶波形（`--ink-3`）+ 已播放段一抹蓝（`--accent`）+ mono 时间码 + `.icon-btn` 控件，支持 seek/迷你档（用于卡片内试听）。
- **设计要点**：标准 + 迷你两档；DESIGN.md 已有「音频=灰阶波形+一抹蓝」原则（2.5/L220），把它落成 `.player` 组件规范；时间用 mono、波形 role=slider 可聚焦带焦点环。
- **交付**：`.player` / `.player--mini` 类 + 波形规范 + DESIGN.md「媒体播放器」小节。

### ② 逐句转写 `.transcript` + 说话人标记原子 `.speaker-marker`
- **现状**：`.transcript / __row/__time/__speaker/__marker/__text`；`components/voice/TranscriptView.tsx`。`__marker` 用**形状**区分说话人（灰度下仍可辨）。
- **用途**：逐句呈现（时间 mono + 说话人标记 + 文本），当前播放句高亮（扁平灰）；可与 `.player` 联动。
- **设计要点**：把 `__marker` 抽成**独立官方原子 `.speaker-marker`**（形状/字母区分类别，不靠纯色）——这是单蓝体系下表达多类别的优雅范式，值得复用到任何需多类别区分的场景；`.transcript` 作为「逐句媒体转写」组件。
- **交付**：`.speaker-marker` 原子 + `.transcript` 组件 + DESIGN.md 章节（强调「形状/文字区分类别，不靠颜色」）。

### ③ 正文排版 `.prose`
- **现状**：`.markdown`（h1–4 / p / 列表 / 代码 / 表格 / 引用）；用于纪要、逐字稿等长文产物。
- **用途**：长文产物排版——是该类 app 的**主要输出物**。官方 `.md` 只是菜单分隔线、无正文规范。
- **设计要点**：固化为官方 `.prose`（**避开已占用的 `.md`**）；继承官方 token；把「表格只横线、强调不用衬线」写进约束。
- **交付**：`.prose` 类 + DESIGN.md「正文/长文排版」章节。

### ④ 对话式输入 `.composer`
- **现状**：概念（指令式输入：textarea + 工具/发送行）。AhamVoice 现已改用 `.field+.textarea`，但「对话输入簇」值得做成规范（Voice/Survey/PPT 都会用）。
- **用途**：对话式/指令式输入——textarea + 发送（一组一 primary）+ 可选工具/附件行；Enter 发送（平台约定，**不 surface 成 chrome**）。
- **交付**：`.composer` 组件 + DESIGN.md 章节；可配合 ⑤ 附件卡。

### ⑤ 附件 / 引用卡 `.attachment`
- **现状**：`.msg-attachment / __type/__body/__name/__meta/__actions`。
- **用途**：对话/消息里的附件或引用卡（类型标 + 名 + meta + 操作）。官方近似件是 `.lockup` + `.ftype`。
- **交付**：`.attachment` 类（或作为 `.lockup` 的附件变体）。

### ⑥ 圆形头像 `.avatar`
- **现状**：`components/Avatar.tsx` 自写（`--panel` 底 + `--ink-2` 首字母 + `--r-pill` + 尺寸档 20/24/32/40/56，**不加品牌色**）。官方无 `.avatar`。
- **交付**：`.avatar` 类 + 尺寸档 + DESIGN.md（头像不加品牌色、首字母用 `--ink-2`）。

### ⑦ 侧栏三槽 `.sidebar` 子结构
- **现状**：`.app-brand`（顶品牌）/ `.app-nav`（中导航 `flex:1` 撑开）/ 底部固定项（设置）；`layouts/AppShell.tsx`。
- **用途**：官方 `.sidebar` 的标准内部三槽（顶品牌 + 中导航撑开 + 底固定）。是对官方 `.sidebar` 的合理组合，**非重复造轮子**。
- **交付**：`.sidebar__brand / __nav / __foot` 官方子结构 + DESIGN.md 8.3 补充。

### ⑧ 认证 / 居中页壳 `.auth-shell`
- **现状**：`.auth-shell / __brand / .brand-mark`；`layouts/AuthShell.tsx`。官方 `.shell` 只覆盖应用主壳。
- **交付**：官方「居中页 / 认证壳」规范（含品牌标）。

### ⑨ 表单分组 `.form-section`
- **现状**：`.form-section`（官方 `.field` 的上层分组容器，官方无此件）。
- **交付**：官方表单分组层 `.form-section`（分组标题 + 一组 `.field`）。

---

## 明确不纳入规范（仅记录，勿设计）
- `.speaker-tile`：本质是可点击的 `.card`，用官方 `.card` + `.card--sel`（选中态）即可。
- 场景化布局原子（`.split-baseline` / `.progress-block` 等）：留作项目内部工具类。
- 死代码（`.item-list` / `.task-meta`）：删除即可。

## 期望交付物（设计会话产出）
1. `aham-ui.css` 新增组件类（守 token / 铁律 / 暗色）。
2. `DESIGN.md` 为每个组件补章节：原则 · 结构（子元素/修饰符）· 变体 · 约束 · 第 7 章 lint 自查项。
3. `tokens.json` 仅在缺档时新增。
4. `examples/` 示例 html（可选，便于对照）。
5. 一份「AhamVoice 同步映射」：旧自写类 → 新官方类（供 AhamVoice 后续替换，如 `.vplayer`→`.player`、`.markdown`→`.prose`、`.app-brand/.app-nav`→`.sidebar__*`）。

> 版本提示：完成后建议作为 Aham UI **v6.1**（在第 2 层「控件与组件」新增「媒体 / 转写 / 正文 / 对话输入」组，并在 `$meta.note` 记录本次新增）。
