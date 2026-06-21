# AhamVoice 组件规范符合度审计（对照 Aham UI v6.0）

## 总评
整体规范符合度：中上。八层官方体系的"原子件"消费得相当忠实——Button/Field/Status/Tag/PageHead/EmptyState/ConfirmDialog/上传拖拽/行内操作/设置字段/筛选下拉等都是干净的官方类映射，没有越界改色，全程守住"单色+选中扁平灰+蓝只点缀+仅浮层有阴影"的铁律（连自创的波形/转写/播放器都自觉守规）。真正的失分集中在两类系统性问题：(1) 自写类与官方类"平行造轮子"——.detail-preview≈.drawer、.nv-timeline≈.timeline、.composer 已被官方 .field+.textarea 架空、.card--stack/.form-section/.table-scroll/.row-link 等自写类污染官方命名空间且常靠声明顺序压过官方样式（脆弱）；(2) 用内联 style 拼布局/改色/写死尺寸，绕过尺寸档与节奏（.select 写死 height:28、.window 内联抹圆角阴影、.status 强改 display:block 当错误块）。还有两个确定性 bug：SpeakersCard 改名按钮引用了不存在的 var(--ink-1)（应为 var(--ink)），以及把 .status--risk 误当多行错误正文容器。另有三块死代码（.composer/.item-list/.task-meta）已无消费方，可直接删。

最该先整改的 top5：1) 右滑预览浮层 .detail-preview/.detail-preview__scrim 整体换官方 .drawer+.scrim（高频可见、且是逐字复制官方）；2) 处理时间线 .nv-timeline 整套换官方 .timeline/.tl-* 体系（详情页核心、重复造轮子最严重）；3) 修复 var(--ink-1) bug + 把 .status--risk 误用为错误块的两处改成 .field .err 或 .alert--risk；4) RecordingDetail 各卡的 .card--stack 自写类清理（全详情页弥漫）+ 标题统一回 .card__head>.ttl/.kind，去掉内联 block 覆盖；5) 表单/卡片/进度块/弹窗里成片的内联 flex 布局收敛到官方 .field/.row/.card__head/.dlg-foot 与尺寸档（去掉 .select 写死 height、.window 内联抹圆角）。

最值得沉淀为规范的 top3 自创组件：1) .vplayer 波形音频播放器（含 --mini 变体）——AhamVoice 招牌交互面，已守 mono 时间码+灰阶波形+一抹蓝，应升为官方"媒体播放器"层；2) .transcript 逐句转写视图——尤其 .transcript__marker 用"形状区分说话人"在灰度下仍可辨，是对单蓝/三灰系统的优雅扩展，值得做成官方"说话人标记"原子+"逐句媒体转写"组件；3) .markdown 正文 prose 排版——长文产物（纪要/逐字稿）是该产品主要输出物，官方 .md 只是菜单分隔线、无正文规范，应固化为官方 .prose（避开已占用的 .md），并把"表格只横线、强调不用衬线"写进约束。次选可沉淀：AppShell 侧栏三槽(brand/nav/account) 与 AuthShell 认证壳/品牌标，作为官方 .sidebar/居中页的标准子结构。

## 最该先整改 Top5
- 右滑预览浮层 .detail-preview/.detail-preview__scrim → 官方 .drawer + .scrim（含 .drawer__head/__body）；逐字复制官方、用户高频可见
- 处理时间线 .nv-timeline 整套 → 官方 .timeline/.tl-item(--on)/.tl-time/.tl-title；详情页核心、与官方平行重复造轮子
- 修 bug：SpeakersCard 改名按钮 var(--ink-1) 未定义 → var(--ink)；并把两处 .status--risk style={{display:block}} 误当错误块 → .field .err 或 .alert--risk
- 清理弥漫全详情页的自写 .card--stack（官方无，仅 .card--sel）；卡片标题统一回 .card__head>.ttl/.kind，去掉内联 block/margin 覆盖与自写 .split-baseline
- 成片内联布局收敛到官方类与尺寸档：表单/按钮行→.field/.row/.dlg-foot；.select 去掉写死 height:28/width:168；.window 去掉内联抹圆角/阴影；进度块去掉自写 .progress-block

## 最值得沉淀为规范 Top3（自创组件）
- .vplayer 波形音频播放器（标准+--mini 两档，mono 时间码+灰阶波形+一抹蓝）——AhamVoice 招牌件，升为官方媒体播放器层
- .transcript 逐句转写视图——尤其 .transcript__marker 形状区分说话人，灰度可辨，做成官方说话人标记原子 + 逐句媒体转写组件
- .markdown 正文 prose（h1-4/p/列表/代码/表格/引用）——长文产物排版，固化为官方 .prose（避开已占用的 .md），写入‘表格只横线、强调不用衬线’约束

## 第一类 — 有官方规范但没用，要整改（22 项）

**1. 右滑产物预览浮层 .detail-preview / .detail-preview__scrim**  `frontend-src/src/styles/components-voice.css:213-235；消费方 src/pages/app/RecordingDetail/index.tsx:218-232`
- 现状：自写 .detail-preview 几乎逐字复制官方 .drawer(fixed/top0/right0/100vh/--white/sh-modal/z-modal/flex column)，.detail-preview__scrim 逐字复制官方 .scrim。重复造轮子。
- 改成官方：.drawer + .drawer__head + .drawer__body + .scrim（aham-ui.css:201,264-267）。仅宽度 width:min(560px,92vw) 与官方 --rightbar-w 不同，可用行内 style 单独覆盖宽度，其余全交官方类

**2. 处理时间线 .nv-timeline 整套**  `frontend-src/src/styles/components-voice.css:265-329,566-581；消费方 src/pages/app/RecordingDetail/Timeline.tsx:274-335`
- 现状：自写 .nv-timeline/__item/--rail/--dot/--title/--when/--detail/--action 一整套轨道+圆点+连线+状态色点+折叠+行内按钮，与官方时间线平行重复。
- 改成官方：.timeline + .tl-item(.tl-item--on) + .tl-time + .tl-title（aml:325-331）。状态色点(--ok/--warn/--risk/--accent)、__detail 折叠区、__action 按钮作为官方时间线的扩展修饰类沉淀，行内动作改用 .btn(--ghost/--link/--sm)

**3. 改名按钮 var(--ink-1) bug + 虚线下划线可编辑样式**  `frontend-src/src/pages/app/RecordingDetail/SpeakersCard.tsx:225-240`
- 现状：<button style={{all:'unset',borderBottom:'1px dashed var(--line)',color:'var(--ink-1)'...}}> 纯内联拼可编辑文本，且引用了 tokens 中不存在的 var(--ink-1)。
- 改成官方：色值 bug 改 var(--ink)。DESIGN.md 第8层 .titlebar 已定义‘编辑提示=虚线下划线’官方语汇，应抽成官方可编辑文本类，而非逐处内联

**4. 内联错误状态：.status--risk 当错误块**  `frontend-src/src/pages/app/RecordingDetail/SpeakersCard.tsx:248 与 src/components/SpeakerNameModal.tsx:116-186`
- 现状：错误用 <div className="status status--risk" style={{display:'block'}}>，把 6px 点+单行 inline-flex 的状态组件强改 block 承载多行错误正文。
- 改成官方：.field .err 或 .alert .alert--risk。.status 仅用于点+单行状态回显，不承载错误正文

**5. 详情卡自写 .card--stack**  `frontend-src/src/pages/app/RecordingDetail/RecordingCard.tsx:36、SpeakersCard.tsx:38、Timeline.tsx:250`
- 现状：<section className="card card--stack">，.card--stack 官方不存在(只有 .card--sel)，弥漫所有详情卡，污染官方命名空间。
- 改成官方：去掉 .card--stack；卡内纵向堆叠走 .field 节奏或官方布局工具(.row/容器 gap)。若确需栈式卡变体应先入规范

**6. 卡片标题 + 自写 .split-baseline**  `frontend-src/src/pages/app/RecordingDetail/SpeakersCard.tsx:39-46、Timeline.tsx:251-258`
- 现状：标题用 <h3 className="card__head"> 再内联 style 改 display:block/margin:0，或裸 h3+内联 fontSize/fontWeight；副标题用自写 .split-baseline(官方无)。
- 改成官方：.card__head 自带 baseline 两端布局，应直接 .card__head>.ttl/.kind，不内联覆盖成 block；.split-baseline 用 .card__head/.card__foot 取代

**7. 表格横向滚动包裹 .table-scroll**  `frontend-src/src/pages/app/RecordingsList.tsx:221-277`
- 现状：<div className="table-scroll"> 包官方 .doc-table 做窄屏横滚，.table-scroll 官方无。
- 改成官方：DESIGN.md 2.7 的 .scroll-sticky/.scroll-shadow 滚动机制 + 1.4 内容优先级列折叠规则，替代自写 .table-scroll

**8. 表单容器与底部按钮行**  `frontend-src/src/pages/app/RecordingNew.tsx:104,230-246`
- 现状：<form> 与底部操作行用内联 style 拼 flex column/gap/justifyContent:flex-end，未用任何官方布局类。
- 改成官方：纵向节奏走 .field/.container--form；底部操作区用 .dlg-foot 同款右对齐或 .row/.toolbar，去掉内联 flex

**9. 设置卡片内联弹性栈**  `frontend-src/src/pages/app/Settings.tsx:166-173`
- 现状：官方 .card 上叠内联 style 改成 flex column+gap；标题区/按钮区也大量内联 flex/alignItems/gap。
- 改成官方：.card 为固定规格容器；卡内纵向节奏用 .field/.desc 组合，标题+状态行用 .card__head+.row，去掉内联 flex

**10. 三项统计指标格 .metric-grid + 启用态内联色**  `frontend-src/src/pages/app/RecordingDetail/RecordingCard.tsx:51-82`
- 现状：自写 .metric-grid 包三个官方 .metric，并用内联 maxWidth/marginTop 与内联 color 切 ink/ink-3 表达启用态。
- 改成官方：容器用官方 .card-grid 或栅格工具；启用/未启用走官方 .status(点+文字)，不靠内联 color 切 ink 阶

**11. 产物切换下拉 .select 写死尺寸**  `frontend-src/src/pages/app/RecordingDetail/Preview.tsx:125-142`
- 现状：.select 合规但内联 style 写死 width:168/height:28/fontSize，违反 2.0‘绝不写死宽度/同档同高’尺寸档铁规。
- 改成官方：用官方尺寸修饰(small 档)替代内联 height/width，去掉写死像素

**12. 预览轨窗口外壳 .window 内联覆写**  `frontend-src/src/pages/app/RecordingDetail/Preview.tsx:114-153`
- 现状：用官方 .window/__bar/__title/__body，但内联 style 抹 borderRadius:0/boxShadow:none/改 height，.window__bar 内联改 height/flexWrap。
- 改成官方：.window 系列保留；新增官方修饰类(如 .window--flush 嵌入式)承载抹圆角/阴影/改高的覆写，不逐处内联

**13. 上传进度块 .progress-block 外壳**  `frontend-src/src/pages/app/RecordingNew.tsx:218-228、RecordingDetail/Timeline.tsx:260-268`
- 现状：进度条本体用官方 .progress/.progress__bar(合规)，但外层自写 .progress-block/__row(官方无) + 内联 fontSize/flex 两端对齐。
- 改成官方：标签+百分比行改用官方 .field 节奏或 .row 两端布局，去掉自写 .progress-block 与内联 fontSize

**14. 删除/操作结果 alert 内联间距**  `frontend-src/src/pages/app/RecordingsList.tsx:193、Hotwords.tsx:141,146`
- 现状：用官方 .alert.alert--risk/--ok，但叠加内联 style={{marginBottom:'var(--s4)'}} 拼间距，多处重复。
- 改成官方：保留纯 .alert 类；间距交给父容器 gap/.page-content 节奏或统一间距工具类，不在组件上内联 margin

**15. 录音标题/文件名双行单元格 + 自写 .row-link**  `frontend-src/src/pages/app/RecordingsList.tsx:240-243`
- 现状：<td> 内 <div style={{flexDirection:column,gap:2}}> 拼双行，副文本内联 color:var(--ink-2)，链接用自写 .row-link(官方无)。
- 改成官方：双行主+副文本用官方 .lockup(.lk-title/.lk-sub)；链接色用 .t-2，去掉自写 .row-link 与内联 color

**16. 行内生成入口按钮 .nv-timeline__action**  `frontend-src/src/pages/app/RecordingDetail/Timeline.tsx:320-330`
- 现状：非产物事件动作用自写 .nv-timeline__action <button>，不是官方 .btn。
- 改成官方：官方 .btn(.btn--ghost/.btn--link/.btn--sm)，一组一个 primary

**17. FormRow 横排 + 必填/可选标记内联**  `frontend-src/src/components/Field.tsx:65-88`
- 现状：官方 .field 包 .label/.hint/.err(合规)，但 horizontal 模式用内联 style 拼 flexDirection:row/alignItems/gap，required(*)/optional(可选) 也内联上色。
- 改成官方：横排与必填/可选标记抽成项目级类(如 .field--row、.label__req/.label__opt)，不逐处内联拼 flex 与颜色

**18. FormSection .form-section 内联拼装**  `frontend-src/src/components/Field.tsx:100-112；CSS def components-voice.css:198-207`
- 现状：<section className="form-section">，CSS 里有定义(flex column+gap+border-top 发丝线)但属自写层；标题 .text-subheading 又叠内联 style={{margin:0}}。
- 改成官方：标题去掉内联 margin 改工具类；纵向间距走官方 spacing。.form-section 应正式入规范为官方表单分组层(见第二类)，而非半自写半内联

**19. Diag 折叠详情 .diag-detail + icon 内联 flex**  `frontend-src/src/components/Diag.tsx:40-64`
- 现状：主体 .alert/--risk/warn/info 合规，但折叠详情用自写 .diag-detail/__body/__msg(官方无)，leading icon 容器内联 color/flex/marginTop。
- 改成官方：折叠用官方 .accordion/.ac-* 或 details 项目级类；icon/actions 的 flex 抽成 .alert__icon/.alert__actions，不逐处内联

**20. PageLoading 骨架行内联尺寸**  `frontend-src/src/components/PageLoading.tsx:5-15`
- 现状：骨架原语 .skeleton 用对，但每行 height/width/gap/padding/flexDirection 全靠内联 style。
- 改成官方：骨架布局与各行尺寸抽成项目级骨架类(如 .skeleton--title/--text + 容器类)，不逐行内联

**21. Tag dim 前缀内联色**  `frontend-src/src/components/Tag.tsx:18-30`
- 现状：主体忠实官方 .tag，唯 dim 前缀用内联 style={{color:'var(--ink-3)'}}。
- 改成官方：改用官方工具类 .t-3(已定义 color:var(--ink-3))替代内联

**22. SpeakerNameModal 头/体内联 flex**  `frontend-src/src/components/SpeakerNameModal.tsx:116-186`
- 现状：骨架用官方 .modal/__head/__title/__body/__foot+.field/.input+.btn(合规)，但 .modal__head/__body 叠内联 style 拼 display/flex/gap。
- 改成官方：.modal__head/__body 的 flex 布局抽类，去掉逐处内联(错误块改 .field .err 见上条)

## 第二类 — 自创组件，官方无规范，待评估做成规范（15 项）

**1. .vplayer / __wave / __time / .vplayer--mini 波形音频播放器**  `frontend-src/src/styles/components-voice.css:13-42；消费方 src/components/voice/AudioPlayer.tsx:124-187, Waveform.tsx`
- 用途：卡片/迷你音频播放器：播放暂停+波形 SVG(可点击 seek)+mono 等宽时间码+句级联动；mini 变体用于说话人面板内联试听。
- 规范化建议：建议规范化(是)。AhamVoice 招牌交互面，官方无音频播放器/波形规范。已严格守官方 token(--font-mono/--ink-*/--accent)、无渐变阴影。应升为官方‘媒体播放器’层(标准+--mini 两档)，约束‘灰阶波形+一抹蓝’铁律

**2. Waveform 纯 SVG 波形**  `frontend-src/src/components/voice/Waveform.tsx:56-82`
- 用途：音频波形缩略：确定性 PRNG 灰条，已播放部分填 --accent，其余 --ink-3。
- 规范化建议：建议规范化(是)。与 .vplayer 一并收编为规范子件，符合 DESIGN.md‘音频=灰阶波形+一抹蓝’

**3. .transcript / __row/__time/__speaker/__marker/__text/__playmark 逐句转写视图**  `frontend-src/src/styles/components-voice.css:44-113；消费方 src/components/voice/TranscriptView.tsx:69-110`
- 用途：逐句转写：64px 时间列+说话人形状标记(circle/square/diamond/triangle 等 6 形)+句文+当前播放行 .is-current 灰底高亮(不用蓝)+点击 seek。
- 规范化建议：建议规范化(是)。语音核心面，官方无。.transcript__marker‘形状区分说话人’在灰度下仍可辨，是对单蓝/三灰系统的优雅扩展，应做成官方‘说话人标记’原子+‘逐句媒体转写’组件。空态内联 style 应改 .page-state/工具类

**4. .markdown 正文 prose 全套**  `frontend-src/src/styles/components-voice.css:412-474；消费方 src/pages/app/RecordingDetail/Preview.tsx`
- 用途：渲染 AI 生成的纪要/逐字稿 markdown 正文：h1-4/p/ul/ol/code/pre/blockquote/hr/table 全套 prose。
- 规范化建议：建议规范化(是)。官方 .md 仅是菜单分隔线、无正文规范。长文产物是该产品主要输出物，应固化为官方‘正文/文章’层(命名避开 .md，叫 .prose)，并把‘表格只横线、强调不用衬线’写进约束。当前已遵守 doc-table 横线规则

**5. .msg-attachment / __type/__body/__name/__meta/__actions/--button/.is-active 产物引用卡**  `frontend-src/src/styles/components-voice.css:344-410,551-564；消费方 src/pages/app/RecordingDetail/Timeline.tsx:301-319`
- 用途：时间线里指向纪要/逐字稿/情绪分析的可点击产物引用卡：类型角标(mono 大写)+标题+元信息(·分隔)+操作组，.is-active 用 --accent-tint 标当前预览，点开右滑预览。
- 规范化建议：建议规范化(是，作为‘附件/引用卡’层)。官方近似件是 .lockup+.ftype。可入规范作类似 IM 附件条的引用卡；当前 is-active 正确用 --accent-tint 而非实蓝。若减负可让卡体外壳挂官方 .card 再加业务修饰

**6. .transcript__marker 说话人形状标记原子**  `frontend-src/src/components/voice/TranscriptView.tsx + components-voice.css:44-113`
- 用途：用形状(非颜色)区分多说话人，配合单蓝/三灰系统在灰度下仍可辨识。
- 规范化建议：建议规范化(是)。是单色系统下表达多类别的优雅范式，值得作为独立官方原子沉淀，供其它需多类别区分的场景复用

**7. Avatar 圆形首字母头像**  `frontend-src/src/components/Avatar.tsx:22-45`
- 用途：列表/说话人/用户标识的统一圆形首字母头像。
- 规范化建议：建议规范化(是)。官方无 .avatar。虽已用官方 token(--panel/--ink-2/--r-pill)，但应沉淀为官方 .avatar + --xs/sm/md/lg/xl 尺寸类，避免每处内联，属通用件

**8. .composer 修改纪要对话式输入簇**  `frontend-src/src/components/RecordingDetail/ReviseComposer.tsx:47-81；CSS def components-voice.css:237-263(已成死代码)`
- 用途：对纪要下达自然语言修改指令的发送框：textarea+工具行+发送(Enter 发送)。
- 规范化建议：建议规范化(是，作为官方 .composer 组件)。Aham 系列(Voice/Survey/PPT)都会用‘发送式输入栏’，值得升为官方组件。注意：components-voice.css:237-263 的 .composer CSS 已无消费方(ReviseComposer 已改用官方 .field+.textarea)，是死代码可删；规范化时另起干净定义。当前内联 flex 包装应先换官方布局类

**9. .speaker-tile 说话人候选卡**  `frontend-src/src/styles/components-voice.css:536-549；消费方 src/pages/app/RecordingDetail/SpeakersCard.tsx:95-106,200`
- 用途：说话人识别面板里可点选的候选人 tile：试听+就地改名+声纹绑定状态。
- 规范化建议：不建议单独入规范(否)。本质是‘可点击的 .card’，官方 .card+.card--sel 已能表达选中态。当前靠声明顺序压过 .card 的背景/padding 较脆弱，应精简为 .card+--sel+button reset，而非自创覆盖类

**10. AppShell 侧栏三槽 .app-brand/.app-nav/.app-account/.nav-item__label**  `frontend-src/src/styles/components-voice.css:125-164；消费方 src/layouts/AppShell.tsx`
- 用途：侧栏三段式：顶部品牌+中部可滚导航+底部账户(margin-top:auto)。
- 规范化建议：建议规范化(是)。是对官方 .sidebar 的合理组合(官方未提供这些子槽)、非重复造轮子。可作官方 .sidebar 标准子结构(brand/nav/account 三槽)补进规范，统一各业务 App 侧栏；现状已正确复用官方 .shell/.sidebar/.nav-item

**11. .auth-shell/.auth-shell__brand/.brand-mark 认证页外壳**  `frontend-src/src/styles/components-voice.css:166-196；消费方 src/layouts/AuthShell.tsx`
- 用途：未登录态居中卡片页骨架(login/register/reset 共用)+方形品牌标。
- 规范化建议：建议规范化(是)。官方 .shell 仅应用主壳、无认证/居中页规范。可作官方‘居中页/认证壳’入规范；.brand-mark 与 AppShell 的 .app-brand .lk-icon 视觉一致，建议统一成一个官方品牌标原子，避免两处各写一遍

**12. .nv-timeline 状态点/折叠/行内动作增量(规范角度)**  `frontend-src/src/styles/components-voice.css:265-329,566-581`
- 用途：在官方 .timeline 之上增加状态色点(ok/risk/warn/accent)+detail 折叠+行内生成动作。
- 规范化建议：建议规范化(是，但作为官方 .timeline 的扩展修饰，而非另起一套)。基础壳(轨道线+圆点+时间+标题)整改回官方 .timeline/.tl-*(见第一类)，仅把‘带状态的时间线’这一增量沉淀为官方修饰类，状态点复用官方 --success/--danger/--warning 语义色

**13. .form-section 表单分组容器**  `frontend-src/src/styles/components-voice.css:198-207；消费方 src/components/Field.tsx`
- 用途：把多个官方 .field 聚成带发丝分隔线的逻辑段(设置页/新建录音)。
- 规范化建议：建议规范化(是)。是对官方 .field 的合理上层组合，官方确无此分组件。可作官方表单层 .form-section 分组规范补入，与 .field 配套(同时去掉消费方的内联 margin)

**14. 详情页布局原子 .split-baseline/.progress-block/.metric-grid/.card--stack**  `frontend-src/src/styles/components-voice.css:495-527`
- 用途：消除详情页重复的内联 flex/grid 布局对象(纯布局，取官方 --s*/--r-* token)。
- 规范化建议：不建议进官方规范(否，过于场景化)。但优于满屏内联 style，可作本仓内部布局工具类保留——前提是其中与官方重名/重叠的 .card--stack 等需让位官方类(见第一类)，.task-meta 已无消费方应删

**15. 死代码：.composer / .item-list / .task-meta**  `frontend-src/src/styles/components-voice.css:237-263, 331-342, 529-534`
- 用途：.composer 已被官方 .field+.textarea 架空；.item-list 全仓 0 引用；.task-meta 服务的 Tasks 页已不存在。
- 规范化建议：否——直接删除。裸行列表如将来需要可用官方 .doc-table/.list-foot 承接，无需自创
