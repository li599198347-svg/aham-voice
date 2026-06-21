# AhamVoice 前端迁移到 Aham UI v5.1 — 实施计划

> 方向(已确认):**路径 B — 全量换用官方 `aham-ui.css`**。引入官方 CSS 作为唯一组件样式源,token 切到官方 `:root`,所有 `.tsx` 的 className 重写为官方类名,业务特有组件按官方 token + 原则自写。**serif 彻底移除**。丢弃官方 `aham-ui.js`,所有交互用 React 复刻。暗色用 `[data-theme="dark"]`(不是 `.dark`)。
>
> 规范来源:`/Users/lichengbao/Documents/Aham-UI/`(tokens.json v5.1.0 + aham-ui.css 729 行 + DESIGN.md 七层 + examples/)。

---

## 0. 为什么是"迁移"而非"重做"

两套设计系统**同源**:`tokens.json.$meta.lineage` 写明"Regularized from the Aham Workbench design system",而 aham-voice 现有体系(`--paper/--steel`、oklch、自述 "claude.ai cool paper")正是 Workbench 的另一个后代。设计**哲学已经一致**(极简、单蓝、状态点+文字、表格只横线、flat),分叉只在三个层面:**token 取值、命名、class 名**。所以这是"把一个方言对齐到官方普通话",不是推倒重来——绝大多数 `.tsx` 的**结构**不动,只动 className 与样式层。

### 差异总览

| 维度 | 官方 aham-ui v5.1 | aham-voice 现状 | 动作 |
|---|---|---|---|
| 颜色表示 | hex(`#262626`/`#336EE8`) | oklch(`--steel-*`/`--paper-*`) | 切官方 hex token |
| 正文基号 | `--text-base: 14px` | `--text-base: 15px` | 改 14 |
| 字体 | 单 sans(Inter)+ mono,**无 serif** | Inter Tight + Source Serif 4 + Noto Sans SC | 去 serif、Inter Tight→Inter |
| 阴影 | FLAT,静止/hover 无阴影,`xs/sm=none` | `--shadow-xs..xl` 有值,卡片 hover 出阴影 | 收敛为 flat |
| 变量命名 | `--ink/--bg-app/--accent/--border` | `--fg-*/--bg-canvas/--accent-default/--border-default` | 映射(见 §3) |
| 组件 class | `.shell/.doc-table/.status--ok/.nav-item--on` | `.app-shell__*/.data-table/.status--moss/.is-active` | 映射(见 §4) |
| 暗色触发 | `[data-theme="dark"]` + 系统 media | `.dark` 类 | 改 `[data-theme]` |
| 交互 JS | `aham-ui.js`(data 属性驱动) | React 状态 | React 复刻(已是) |

---

## 1. 目标与验收标准

- **视觉**:逐页对照 `Aham-UI/examples/patterns.html`,主屏/列表/详情/表单四类页型与官方一致。
- **token**:`.tsx`/`.css` 不出现官方 token 之外的颜色 hex / oklch;字号圆角间距只用官方档。
- **字体**:仅 Inter / Inter Display / JetBrains Mono;无任何 serif。
- **lint(DESIGN.md 第 7 章,交付前必过)**:
  1. 颜色只来自 token(无杂色 hex);
  2. 字体不越界(禁衬线、禁中文等宽);
  3. `.doc-table` 只横线、无竖线、无整行底色;
  4. 每个动作组只 1 个 `.btn--primary`;
  5. 正文对比 ≥ 4.5(`--ink-3/--ink-4` 不承载正文);
  6. 圆角只用 `--r-*` 档;
  7. 卡片无边框无阴影、选中=扁平灰非蓝;状态=点+文字;蓝只用于 logo/主操作/发送/选中;仅浮层有阴影;图标按钮带 `aria-label`。
- **回归**:`npm run build` 通过;转写/纪要/说话人/情绪/热词/声纹/设置 各页功能不破。

---

## 2. 分阶段实施(每阶段 = 一次 git commit + `npm run build` + 视觉抽查)

> AhamVoice 是 git 仓库,`frontend/dist` 被跟踪。每阶段结束:`cd frontend-src && npm run build` 重生成 dist → 刷新 http://127.0.0.1:8765 抽查 → commit。出问题可逐阶段回滚。

| 阶段 | 内容 | 风险 | 产物 |
|---|---|---|---|
| **P0 准备** | 引入官方 `aham-ui.css`;改字体;建"变量桥接层";决定 Tailwind 去留 | 低 | 页面应几乎不变(桥接层保旧引用) |
| **P1 token 地基** | `design-tokens.css` 切官方 `:root` 值;暗色改 `[data-theme]` | 中 | 全站配色/字号对齐官方 |
| **P2 公共组件** | `components/` 11 个组件 className 映射到官方 | 中 | Button/Field/Status/Tag/Avatar… 对齐 |
| **P3 布局骨架** | `AppShell`/`AuthShell` → `.shell/.sidebar/.col/.fill/.rightbar/.navbar` | 中 | 三栏骨架对齐官方 |
| **P4 页面** | 8 个页面 + RecordingDetail 子树逐个映射 | 中高 | 各业务页对齐 |
| **P5 自写业务组件** | 音频播放器、逐句转写、说话人编辑、波形 — 按 token 自写 | 高 | 官方无的组件补齐 |
| **P6 交互复刻** | drawer/modal/menu/tabs/表格排序/全选 用 React 复刻官方契约 | 中 | 交互行为对齐 |
| **P7 清理 + lint** | 删桥接层与旧 `components-*.css`/`app-extras.css` 死代码;过第 7 章 lint;移除 Tailwind(若决定) | 中 | 纯官方体系,无残留 |

---

## 3. P0–P1:Token 与变量映射

### 3.1 资产引入(P0)
- 复制 `Aham-UI/aham-ui.css` → `frontend-src/src/styles/aham-ui.css`(单一组件源)。
- `index.html` 字体段(行 11-14)替换为:`Inter`(400/500/600/700)+ `Inter:opsz`/或 `Inter Display`(≥20px 光学)+ `JetBrains Mono`(400/500)。**删除** `Inter Tight`、`Source Serif 4`、`Noto Sans SC`(CJK 回退交给 `Microsoft YaHei`/`SimHei`/`PingFang` 系统字体,与官方 `--font-sans` 一致)。
- `index.css` 导入顺序改为:`@import "tailwindcss"`(暂留作 reset)→ `aham-ui.css` → `design-tokens.css`(桥接层)→ 业务自写 css(`components-business-voice.css` 等,P5 产出)。
- **Tailwind 去留**:盘点确认 `.tsx` 用到的 Tailwind 原子类 = 0 个(颜色 100% 走 `var(--)`)。故 P7 可整体移除 `tailwindcss` 依赖与 `tailwind.theme.css`;P0–P6 期间保留仅作浏览器 reset,避免一次性变更过大。

### 3.2 CSS 变量映射(桥接层,P0 建 → P7 删)
在 `design-tokens.css` 顶部建一段"桥接层",把 voice 旧变量名 alias 到官方变量,使既有 css/tsx 引用**零改动即可先跑起来**,随后逐文件把引用替换为官方变量,最后删桥接层。

| voice 变量(旧) | 官方变量(新) | 备注 |
|---|---|---|
| `--fg-default` | `--ink` | |
| `--fg-muted` | `--ink-2` | |
| `--fg-subtle` | `--ink-3` | |
| `--fg-faint` | `--ink-4` | 仅占位/分隔 |
| `--fg-on-accent` | `--on-accent` | |
| `--bg-canvas` | `--bg-app`(=`--white`) | |
| `--bg-surface` / `--bg-elevated` | `--white` | |
| `--bg-panel` / `--bg-sunken` | `--panel` | 三层灰收敛为白/panel/line |
| `--bg-overlay` | `--overlay` | |
| `--border-default` / `--border-strong` | `--border`(=`--line`) | 官方只一档边框色 |
| `--border-focus` | `--accent` | |
| `--accent-default` | `--accent` | |
| `--accent-hover` | `--accent-hover` | 同名 |
| `--accent-active` | `--accent-press` | |
| `--accent-soft` | `--accent-tint` | |
| `--accent-fg` | `--on-accent` | |
| `--fill-subtle` | `--fill-hover` | |
| `--fill-muted` | `--fill-active` | |
| `--fill-strong` | `--fill-active` | 收敛 |
| `--success-fg/bg` | `--success` / `--success-bg` | |
| `--warning-fg/bg` | `--warning` / `--warning-bg` | |
| `--danger-fg/bg` | `--danger` / `--danger-bg` | |
| `--info-fg/bg` | `--accent` / `--accent-tint` | 官方无 info 语义,info=蓝 |
| `--font-sans` | `--font-sans` | 值改 Inter(去 Tight) |
| `--font-serif` | **删除** | serif 移除;原 serif 用处改 `--font-sans` |
| `--font-mono` | `--font-mono` | |
| `--text-base` | `--text-base` | 值 15→14 |
| `--radius-*` | `--r-*` | 档位一致,改前缀 |
| `--shadow-xs/sm` | `--sh-none`(none) | flat |
| `--shadow-md/lg/xl` | `--sh-md/--sh-pop/--sh-modal` | 仅浮层 |
| `--steel-*` / `--paper-*` / `--clay-*` / `--moss/amber/rust/slate` | 删 | 原始色阶不再需要 |

> Finance 补丁变量(`--cell-*`、`--threshold-*`)AhamVoice 未使用,直接删。

### 3.3 字体收口(P1)
- `--font-sans: 'Inter','Microsoft YaHei','SimHei',system-ui,-apple-system,sans-serif`(对齐官方)。
- 大字(≥20px,即 `.text-display/title/heading/subheading`)用 `--font-sans-display`(Inter Display)。
- **serif 三处去除**:
  - `app-shell__brand-glyph` 品牌字 "A":serif italic → `--font-sans-display` 常规(官方 logo 不靠 serif)。
  - `colors_and_type.css` 的 `blockquote { font-family: var(--font-serif) italic }` → 改 sans,引用样式用左边框 + `--ink-2`。
  - `.markdown em` → 正常 italic sans(不换族)。
- `AuthShell` 标题 `em`、`briefing-page` 编号 em 同样去 serif。

---

## 4. P2–P3:组件 class 与布局映射

### 4.1 组件 class 映射(voice → 官方)

| voice class(旧) | 官方 class(新) | 备注 / 子结构 |
|---|---|---|
| `.app-shell` | `.shell` | flex 三栏根 |
| `.app-shell__sidebar` | `.sidebar` | 264px(原 280) |
| `.app-shell__body` | `.col > .fill` | 主列 + 滚动区 |
| `.app-shell__topbar` | `.navbar`(或 `.titlebar`) | 顶栏 52px(原 56) |
| `.app-shell__topbar-breadcrumb` | `.crumb`(`a`/`.sep`/`.here`) | |
| `.app-shell__brand*` | 自写 lockup(`.lk-icon`+文字) | 官方无 brand 类 |
| `.nav-section/__title` | `.nav-group` / `.nav-grouptitle` | 折叠态 `.collapsed` |
| `.nav-item` + `.nav-item__icon/__label/__count` | `.nav-item` + `.ico` + `.badge` | 同名,改子类 |
| `.is-active`(nav) | `.nav-item--on` | 扁平灰选中 |
| `.data-table` | `.doc-table` | `td.num`/`th.sortable`/`tr[aria-selected]`/`td.cat` |
| `.filter-bar` | `.toolbar` + `.input`/`.select`/`.seg` | |
| `.filter-bar__seg` / `.filter-bar__segments` | `.seg`(`button[aria-selected]`) | 分段切换 |
| `.nv-timeline` + `__dot/__item/__when/...` | `.timeline`(`.tl-item`/`.tl-time`/`.tl-title`) | 转写/产物时间线 |
| `.preview-window` | `.window`(`__bar`/`__body`/`__title`/`__dots`) | 纪要预览 |
| `.card` | `.card`(同名) | **去边框、去 hover 阴影**;`__head`/`__foot`;选中 `.card--sel` |
| `.stat-tile` + `__label/__value` | `.metric`(`.k`/`.v`/`.u`/`.d`) | 统计小块 |
| `.speaker-tile` | `.card` 或 `.lockup`(in `.card-grid`) | |
| `.status--moss` | `.status--ok` | 绿(成功) |
| `.status--amber` | `.status--warn` | 黄(警告) |
| `.status--rust` | `.status--risk` | 红(风险) |
| `.status--slate` / `.status--accent` | `.status--active` | 蓝(进行中) |
| `.status--muted/--faint` | `.status--muted` | 灰 |
| `.btn` + `--primary/secondary/ghost/danger/sm/lg/--loading` | 官方同名(`--loading`→`.is-loading`) | |
| `.icon-btn` | `.icon-btn`(同名,带 `aria-label`) | |
| `.field`/`.form-row`/`.form-section` | `.field`(`.label`/`.hint`/`.err`)/`.ctl-row` | |
| `.menu`/`.menu-item` | `.menu`/`.mi`(`.ico`/`.sc`/`.md`分隔) | |
| `.empty-state` + `__title/__body/__actions` | `.empty-state`(`.es-icon`/`.es-title`/`.es-desc`) | |
| `.spinner`/`.skeleton`/`.page-loading` | `.spinner`/`.skeleton` | 骨架用 `.skeleton` |
| `.upload-zone` + `__drop/__hint/...` | `.upload`(`.up-t`/`.up-h`/`.dragover`)或 `.drop-zone` | |
| `.tag` | `.tag`(同名,仅过滤 chip) | 补齐基样式(官方有) |
| `.obj-head` + `__title/__meta/__status` | `.navbar`/`.crumb` + `.text-heading` + `.row` + `.status` | 详情标题区 |
| `.diag` | `.alert`(`--info/--ok/--warn/--risk` + `.at`) | 官方用 `.alert`(左边框 1.5px) |
| `.composer`/`.detail-composer-dock` | 自写(`.textarea`+`.btn--primary`) | 官方无 composer,组合 |
| `.spk-*`(说话人面板全套) | 自写 voice 业务 css | 官方无(见 §5) |
| `.transcript__*` | 自写 voice 业务 css | 官方无(见 §5) |

> **官方无 `.avatar` 类**:`Avatar.tsx` 需自写圆形头像(用 `--panel` 底 + `--ink-2` 首字母,`--r-pill`,尺寸档 20/24/32/40/56),**不加品牌色**。

### 4.2 三栏骨架(AppShell,P3)
官方页型(`patterns.html` L33-77 实证)结构:
```
.shell
 ├─ .sidebar            (导航:.nav-group > .nav-grouptitle + .nav-item)
 ├─ .col                (主列)
 │   ├─ .navbar / .titlebar   (.crumb 面包屑 + .row 顶栏操作 icon-btn)
 │   └─ .fill                 (主体滚动区:页面内容)
 └─ .rightbar           (AI rail,静态右栏;或用 .drawer 浮层)
```
- 侧栏宽 `--sidebar-w`(264)、顶栏高 `--topbar-h`(52)、右栏 `--rightbar-w`(340)。
- 账号区(底部)、主题切换按钮(改 `data-theme` 而非 toggle `.dark`)。
- RecordingDetail 的右 AI rail:用 `.rightbar`(常驻)或 `.drawer`(`__head`/`__body`,P6 用 React 控制开合)。

---

## 5. P5:自写业务组件(官方完全没有,按 token + 原则自写)

官方 CSS 无以下件,但它们是 AhamVoice 核心。自写时**严守**:三层灰(white/panel/line)+ 单蓝高亮 + mono 数字 + 无渐变/3D/阴影(DESIGN.md 2.5,L220)。

1. **音频播放器**(`RecordingCard` 的原生 `<audio>` 必须替换):
   - 波形:SVG 灰阶柱(`--ink-3`)+ 已播放段一个蓝(`--accent`);DESIGN.md L220 明确"音频回放:波形灰阶 + 一个蓝"。
   - 控件:播放/暂停用 `.icon-btn`;进度 `.slider` 或 `.progress`;时间 `.text-mono`。
   - RTL 下播放控件/时间轴不翻转(L714)。
2. **逐句转写视图**(`Timeline`/`transcript`):每句 = 时间(mono)+ 说话人标注 + 文本;**说话人区分用标注/形状,不靠纯色块**(单蓝体系要"去色仍可辨");当前播放句高亮用 `--fill-active` 灰底(非蓝)。
3. **说话人编辑面板**(`SpeakersPanel`):列表用 `.doc-table` + `td.row-actions`(hover 操作)+ 行内 `.cell-input`;片段播放=迷你播放器(复用 1);保存条 sticky。
4. **声纹/波形缩略图**:SVG 灰阶,无彩色。
5. **统计小块**统一用官方 `.metric`(`.k`/`.v`/`.u`/`.d`),废弃 `.stat-tile`。

---

## 6. P6:交互复刻(丢弃 aham-ui.js,用 React 实现官方 data 契约)

官方 JS 全靠 `data-*` 自动绑定;React 项目**不引入**它,用状态复刻这些行为:

| 行为 | 官方契约 | React 实现 |
|---|---|---|
| 浮层开关(drawer/modal/menu/notif) | `[data-open="#id"]`/`[data-close]`/点 scrim 关 | `useState(open)` + portal + scrim onClick |
| Esc 关浮层 | 全局 keydown Escape | `useEffect` keydown |
| 表格排序 | `table[data-sortable]` + `th.sortable` | 受控 sort state + 排序数组(RecordingsList 已部分有) |
| 行展开 / 全选 | `[data-expand]` / `[data-select-all]` | 展开集合 / 受控 checkbox state |
| Tabs | `[data-tabs]` + `.tab[data-target]`↔`[data-panel]` | activeTab state + 条件渲染 |
| 上传拖放 | `.upload` dragover/leave/drop 切 `.dragover` | onDragOver/Leave/Drop state(RecordingNew 已有) |
| 折叠 nav-group / accordion / tree | `[data-accordion]`/`.tree-caret` | open state |
| combobox/popover/tooltip 定位 | 纯 CSS 壳,无官方 JS | React 自管开合 + 定位 |

主题切换:`document.documentElement.setAttribute('data-theme', next)`(亮/暗/跟随系统三态),替换现有 `classList.toggle('dark')`。

---

## 7. 逐文件改动清单(供执行核对)

### components/(P2)
- `Button.tsx`:`.is-loading`(原 `.btn--loading`);确认变体名;一组一 primary。
- `Field.tsx`/`FormRow`:`.field`+`.label`/`.hint`/`.err`;`.input` 三态 `.is-error`/`[readonly]`/`[disabled]`。
- `Status.tsx`:tone 映射 moss→ok/amber→warn/rust→risk/slate→active/accent→active/muted→muted。
- `Tag.tsx`:用官方 `.tag`(补基样式)。
- `Avatar.tsx`:**自写圆形头像**(官方无 `.avatar`)。
- `Icon.tsx`:保持 lucide,size 用 `--icon-sm/md/lg`(16/20/24);默认 1.5 stroke。
- `Diag.tsx`:`.diag` → `.alert`(`--info/ok/warn/risk`)。
- `EmptyState.tsx`:`.empty-state`(`.es-icon/.es-title/.es-desc`)。
- `PageHead.tsx`:`.text-heading` + `.row` 操作槽;readonly 用 `.status--muted`。
- `PageLoading.tsx`:`.skeleton`。
- `Spinner.tsx`:用 `.spinner`(去内联,统一)。

### layouts/(P3)
- `AppShell.tsx`:`.shell/.sidebar/.col/.fill/.navbar/.crumb/.nav-group/.nav-item(--on)`;主题三态;账号区。
- `AuthShell.tsx`:`.auth` 居中(自写最小壳);品牌字去 serif。

### pages/(P4)
- `RecordingsList.tsx`:`.toolbar`(搜索/分段 `.seg`/类型 `.select`)+ `.doc-table`(`.sortable`/`.num`/`.status`)+ `.empty-state` + `.pager`。
- `RecordingNew.tsx`:`.upload`(拖放)+ `.field` 组 + 上传中 `.progress`(去 `.card` 边框)。
- `Settings.tsx`:内联手搓块 → `.card`(无边框无阴影)+ `.field`/`.switch-row`;"已配置"用 `.status--ok/--muted`。
- `Hotwords.tsx`:新增行内联块 → `.card`;`.toolbar` + `.doc-table`(可 `.cell-input` 行内编辑);删除确认用 `.popconfirm`/React modal(替原生 confirm)。
- `Voiceprints.tsx`:`.card` 表单 + `.doc-table`/`.card-grid`;阈值 `<input range>` → 官方 `.slider`(`.slider-row .val`)。
- `Tasks.tsx`:`.doc-table` 或列表 + `.progress`(`.is-indeterminate` 转写中)+ `.status`。
- `NotFound.tsx`:全内联 → `.empty-state` + `.btn`。
- `RecordingDetail/`:
  - `index.tsx`:`.shell`/`.rightbar`/`.drawer` 骨架;`.navbar`+`.crumb`+`.status`+操作。
  - `Timeline.tsx`:`.timeline`(`.tl-item/.tl-time/.tl-title`)+ 自写逐句转写(§5.2)。
  - `SpeakersCard.tsx`:`.card-grid`+`.card`;每 tile `.status`。
  - `RecordingCard.tsx`:**自写音频播放器替换原生 `<audio>`**(§5.1)+ `.metric` 统计。
  - `SpeakersPanel.tsx`:`.doc-table`/`.lockup` 行 + 行内编辑 + 迷你播放器;sticky 保存条。
  - `ReviseComposer.tsx`:`.textarea`+`.btn--primary`(发送=唯一蓝)。
  - `Drawer.tsx`:React portal + scrim(复刻官方 `.drawer` 契约)。
  - `Preview.tsx`:`.window`(`__bar`/`__body`)+ `.markdown`(去 serif)。

### styles/(P1/P7)
- `design-tokens.css`:切官方值 + 桥接层(P1)→ 删桥接层(P7)。
- `colors_and_type.css`:元素映射改官方变量;表格规范保留(已合规);blockquote 去 serif。
- `components-*.css` / `app-extras.css`:被官方 `aham-ui.css` 取代的部分删除;仅保留 voice 业务自写(重命名为 `components-voice.css`)。
- `tailwind.theme.css`:P7 评估移除。

---

## 8. 风险、回滚、工作量

- **风险点**:① P5 自写音频播放器/转写视图(交互复杂);② P4 表格交互(排序/选择)从旧实现迁移;③ 变量桥接层删除时漏改引用 → P7 用 `grep -rn "--fg-\|--bg-canvas\|--accent-default\|--border-default\|--radius-\|--shadow-"` 全量扫尾。
- **回滚**:每阶段单独 commit;`frontend/dist` 同步重建。任一阶段视觉/功能回归可 `git revert` 该阶段。
- **工作量(粗估)**:P0–P1 半天;P2–P3 一天;P4 一天半;P5 一天;P6 半天;P7 半天。合计约 **4–5 个工作日**(单人)。
- **建议节奏**:先做 P0–P1(地基,改动可逆、收益立现),抽查满意后再推进 P2+。

---

## 9. 执行顺序速查

1. 复制 `aham-ui.css`,改 `index.html` 字体,建变量桥接层 → build → 抽查(应几乎无变化)。
2. `design-tokens.css` 切官方值,暗色改 `[data-theme]` → build → 全站配色/字号对齐。
3. `components/` 11 个 → build → 抽查组件。
4. `AppShell/AuthShell` → build → 抽查骨架。
5. 页面逐个(列表→详情→设置→热词→声纹→任务→404)→ build → 逐页抽查。
6. 自写音频播放器/转写/说话人/波形。
7. React 复刻交互(drawer/modal/menu/排序/全选)。
8. 删桥接层与死 css,移除 Tailwind(可选),过第 7 章 lint → 终验。
