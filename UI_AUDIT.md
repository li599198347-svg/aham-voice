# AhamVoice UI 审计报告（v6.0 网页轨 · 代码+真机）

**共 58 项** · 分级 P0×1 / P1×21 / P2×24 / P3×12

## Top 10 优先修
- #1 侧边栏窄屏不折叠逐字竖排(P0)
- #2 设计系统 @media 空壳无 sidebar 规则(P1)
- #8 原生 confirm() 删除(P1)
- #9 清除Key 无二次确认(P1)
- #10/#11 Modal 无焦点陷阱+未保存丢失(P1)
- #12/#13 --ink-3 对比度不达标(P1)
- #14 加载期空白无骨架(P1)
- #17 表格行键盘不可达(P1)
- #18/#19 输入无 label(P1)
- #22 顶栏与内容左右基准错位(P1)


## P0

**#1 [响应式·布局]** `AppShell.tsx:107-151 .shell/.sidebar；aham-ui.css:188(.sidebar 264px)、213(.shell)、850 @media`
- 问题：侧边栏在任何视口下固定264px、left:0、永不折叠，AppShell 无汉堡/抽屉开关。375px 实测主内容被挤到约47-115px，标题、subtitle、表格全部逐字竖排，面包屑逐字换行，页面完全不可用；768px 下 container 仅440px，7列表格被裁。暗色375同样破。阻断级移动端硬伤。
- 建议：为 .shell 增加 @media(max-width:48rem){.shell{flex-direction:column} .sidebar{position:fixed;transform:translateX(-100%);z-index:overlay;width:min(264px,80vw);overflow-y:auto}}+汉堡 toggle .is-open；.col 占满全宽；topbar 加移动菜单按钮；表格窄屏转卡片或 overflow-x:auto。


## P1

**#2 [响应式·设计系统]** `aham-ui.css:850-856 @media(max-width:48rem)`
- 问题：官方注释承诺『侧栏折叠、三段工具栏换行、页眉操作降级』，但规则体只含 --gutter/--margin-x/.grid-12/.page-header/.modal__foot/.preview，完全无 .sidebar/.shell 折叠声明。设计系统窄屏断点是空壳，导致所有消费方移动端塌缩（第1条根因）。
- 建议：在 aham-ui.css:850 @media 块内补齐 .sidebar 折叠规则（或新增 .app-shell--mobile 模式），提供官方 .shell 移动骨架，让规范与注释一致。

**#3 [响应式·内容溢出]** `RecordingsList.tsx 表格 .doc-table(8列)`
- 问题：768px 下 sidebar 占264px后内容列仅约500px，表格右边界溢出视口(right=996)，『内部会议』换行成『内部会/议』、『本机用户』换成『本机/用户』；375px 彻底无法横向容纳且无横向滚动。
- 建议：窄屏(<768)切换为卡片/列表视图(每条一张卡：标题+元信息堆叠)，或容器加 overflow-x:auto 并隐藏次要列(客户/项目、负责人)只保留 录音/状态/更新。

**#4 [响应式·工具栏]** `RecordingsList.tsx/Hotwords.tsx .page-toolbar`
- 问题：375px 下三段工具栏溢出：recordings __trail right=628(超253px)搜索/筛选被截屏外；hotwords __trail right=489、批量/新增按钮被推出可视区。内容列过窄无法横排。
- 建议：窄屏 .page-toolbar 设 flex-wrap:wrap 或 column，搜索框 width:100%，seg 与筛选各自占行；按钮组 flex-wrap 并允许图标-only 降级。

**#5 [响应式·顶栏]** `AppShell.tsx:167-192 .nav-actions；RecordingNew/RecordingsList .btn--primary`
- 问题：375px 下 .nav-actions right=451-487(超视口76-112px)，搜索/通知/主题按钮被推屏外不可点；『上传录音』主按钮 right=425 被截断。顶栏未对窄屏收纳。
- 建议：窄屏面包屑用省略/只显当前页，nav-actions 收进溢出菜单(…)或贴边不溢出；主操作按钮窄屏改 width:100% 块级或图标按钮。

**#6 [响应式·详情页]** `RecordingDetail AudioPlayer .vplayer/.vplayer__time、操作 .row、说话人 .card-grid`
- 问题：375px 下详情页 wideCount=22：播放器时间 right=461、操作行/『重新处理』按钮 right=488 溢出；波形播放器与说话人卡无窄屏堆叠被横切(768尚可)。根因叠加 sidebar 不折叠。
- 建议：修复 sidebar 折叠后，窄屏波形设 flex:1 min-width:0 自适应，时间标签换行到下方；操作行 flex-wrap；说话人卡片网格降为单列。

**#8 [交互·弹窗]** `RecordingsList.tsx:268-273 confirm() 删录音；Voiceprints.tsx:44-48 window.confirm 删声纹`
- 问题：两处删除用浏览器原生 confirm()，无法套设计系统视觉(无 .dialog/danger)，按钮顺序由OS决定(macOS确认在右/Windows在左)违反§8.6『一律按macOS』，且无焦点陷阱/aria-modal。删除是真删不可逆却无设计系统级破坏确认。设计系统 .dialog/.dlg-foot/.btn--danger(aham-ui.css:617-620,98)已就绪却被绕过。
- 建议：建共享 <ConfirmDialog tone=danger> 基于 .dialog，统一录音/声纹删除。DOM 顺序：取消(.btn)在前、删除(.btn--danger 不设蓝色默认)在后；窄屏 column-reverse 已就绪。

**#9 [交互·弹窗]** `Settings.tsx:114-115,266-273 『清除 Key』按钮`
- 问题：『清除 Key』破坏性不可撤销(把 llm_api_key 置空、纪要功能立即失效)，点击直接 clearKey.mutate() 执行(line 273)无二次确认。按钮用 variant=ghost 灰色无 danger 警示，与同排『保存』『测试连接』紧挨无分隔易误点。
- 建议：点击先弹 .dialog 二次确认(『确定清除 API Key？纪要相关功能将不可用』，取消/清除-danger)；按钮改 danger 语义色；用 margin-inline-start:auto 把破坏操作与主操作分隔。

**#10 [a11y·焦点陷阱]** `SpeakerNameModal.tsx:46-58`
- 问题：Modal 用 role=dialog/aria-modal 且支持 Esc/scrim 关闭、input autoFocus(良好)，但未实现焦点陷阱：Tab 可跳出对话框落到背景元素，关闭时焦点不归还触发元素。违反§8.6/DESIGN第7章硬要求。
- 建议：打开时记录 document.activeElement 并聚焦首个可交互项；监听 keydown Tab/Shift+Tab 在首尾循环；onClose 时 previousActiveElement?.focus() 归还。抽成 useFocusTrap hook 复用。

**#11 [交互·弹窗]** `SpeakerNameModal.tsx:71(scrim)、49(Esc)、95(×)`
- 问题：未保存内容丢失无保护：input/textarea 输入后 scrim 点击、Esc、右上× 都直接关闭丢弃，无§8.6『有未保存内容时关闭前确认(取消/放弃-danger/保存)』拦截。命名/备注误点 scrim 即丢。
- 建议：记录初始值，关闭时若 name/note dirty 先弹『放弃未保存的更改？』三按钮确认，否则直接关。至少对 scrim 与 × 加 dirty 检查。

**#12 [a11y·对比度]** `aham-ui.css:13 --ink-3:#9B9B9B(亮)；RecordingsList:246、SpeakersCard:107/109、Settings:200、Voiceprints:86、面包屑`
- 问题：亮色下正文级辅助文字大量用 --ink-3(#9B9B9B)，白底约2.6:1，远低于AA正文4.5:1(也低于大字3:1)，命中文件名/段数时长/说明/空备注等信息承载文字而非纯装饰。
- 建议：次级正文统一改用 --ink-2(#6E6E6E，白底约4.9:1达标)；--ink-3 仅用于真正装饰性微文字。复核所有 color:var(--ink-3) 正文用法。

**#13 [a11y·对比度]** `aham-ui.css:423/434 暗色块 --ink-3:#767676`
- 问题：暗色下 .text-caption #767676 对 panel(#2A2A2A)约3.16:1、对 app背景(#1C1C1C)约3.75:1，均未达AA正文4.5:1。命中『录音转写』13px、面包屑『/』、多页 caption，随主题切换放大。
- 建议：暗色下次级正文改用 --ink-2(#A8A8A8，暗底约6:1)；或上调 --ink-3 到约 #9A9A9A。切主题后复测面包屑/表格副信息/卡片 caption。

**#14 [加载态]** `RecordingsList/Voiceprints/Tasks query.isLoading 分支；components/PageLoading.tsx`
- 问题：数据请求进行中页面完全空白：列表/声纹页 main 区 innerText 为空，无 .skeleton/.spinner/.page-state 占位。PageLoading(用官方.skeleton)仅在 RecordingDetail 引用，列表/声纹/任务页从未引用。违反第8层加载分级。
- 建议：在三页 query.isLoading 分支渲染 <PageLoading/>(或表格行级 .skeleton，尺寸=最终行高防CLS)。

**#15 [错误态]** `RecordingsList.tsx:200-202 <Diag code=REC_E_LIST>`
- 问题：列表失败时把内部错误码 REC_E_LIST 当粗体 lead、原始后端 message(实测 boom)平铺给用户，alert 无任何重试/刷新(hasRetry=false)。违反§1.9『错误说发生什么+怎么办』。
- 建议：改人话标题(如『加载录音失败』)+一句可操作建议，通过 Diag actions 传重试按钮(query.refetch())；内部 code 仅在折叠诊断详情给技术用户。

**#16 [a11y·焦点环]** `aham-ui.css:224-225 :focus-visible 选择器组缺 .icon-btn/.skip-link/.crumb a`
- 问题：.icon-btn(顶栏搜索/通知/主题、音频播放、modal关闭)、skip-link、面包屑链接未进 :focus-visible 组(该组只含 .focusable/.btn/.input/.select/.nav-item/.tab)，Tab 到时只显浏览器默认1px auto 而非规范3px。违反§1.8。
- 建议：把 .icon-btn、a.skip-link、.crumb a 加入 aham-ui.css:224 的 :focus-visible 列表，统一 outline:var(--focus-ring-w) solid var(--focus-ring)。

**#17 [a11y·键盘可达]** `RecordingsList.tsx:242 <tr onClick navigate cursor:pointer>`
- 问题：录音表格每行用 tr onClick 导航并设 cursor:pointer，但 tr 无 role/tabIndex/onKeyDown(rowsWithRole=0)。键盘用户无法聚焦或回车进入详情，纯鼠标可用。违反DESIGN第7章键盘可达。
- 建议：行内提供可聚焦主链接(标题用 <Link>)承担导航(推荐，语义干净避免与行内删除冲突)；或给 tr 加 role=link、tabIndex=0、onKeyDown(Enter/Space) 调同一导航。

**#18 [a11y·表单标签]** `RecordingsList.tsx:177-188 搜索 input(type=search)`
- 问题：列表页搜索 input 只有 placeholder『搜索标题、客户、标签、负责人』，无 label/aria-label，进入 inputsNoLabel。placeholder 非可访问名称，读屏只读 'edit text' 无上下文。
- 建议：加 aria-label=『搜索录音』(与下方 select aria-label=『会议类型』一致)，placeholder 保留作辅助提示。

**#19 [a11y·表单标签]** `Hotwords.tsx:150 主热词编辑 textarea`
- 问题：热词页核心输入是全宽 textarea，只有 placeholder 无可见 label 也无 aria-label，进入 inputsNoLabel。是页面唯一数据录入控件，对读屏完全无名称。
- 建议：上方加 <label htmlFor=hotwords-text> 或直接 aria-label=『热词列表（用顿号分隔）』，textarea 设 id 与 label 关联。

**#20 [a11y·焦点陷阱]** `RecordingNew.tsx:105-111 dropzone 隐藏 file input(left:-9999)+label`
- 问题：上传 dropzone 用 label 包一个 left:-9999 移出屏外的 file input。label 非 button、无 role/tabIndex，隐藏 input 移出屏外可能导致键盘 Tab 无法聚焦上传控件且无可见焦点环。违反§1.8。
- 建议：file input 改用 .sr-only(clip 保留可聚焦)而非 left:-9999；或给 label 加 tabIndex=0+role=button+onKeyDown(Enter/Space 触发 inputRef.click())，并补 :focus-visible 焦点环到 .upload。

**#21 [a11y·状态播报]** `components/Diag.tsx(无 role/aria-live)；Hotwords.tsx alert--ok/--risk`
- 问题：错误/成功反馈通过 Diag(.alert)与内联 alert 渲染，但容器无 role=alert/aria-live。保存成功、上传失败等动态消息插入 DOM 后不会被读屏自动播报，键盘/读屏用户得不到结果反馈。
- 建议：Diag 根节点加 role=alert(错误)或 aria-live=polite(info/ok)；Hotwords 内联 alert 补 role=status/alert。在组件层统一处理全站受益。

**#22 [布局对齐]** `AppShell.tsx:154-166 .navbar .crumb vs .page-header__title；全部7页`
- 问题：navbar 面包屑左缘 x=280(264 sidebar+16)，page-header 主标题左缘 x=344(container 312+padL 32)，相差64px，顶栏与内容区不共用左基准线；右侧同理 nav-actions right=1424 vs 内容右缘1360 错位64px。违反§8.4。
- 建议：给 navbar 内层套同款 .container(max-width 1080 居中 + padding-inline 32)，使面包屑首字与标题首字垂直对齐、nav-actions 右缘与内容右缘对齐，顶栏与内容左右双侧共基准。

**#23 [文案·面包屑]** `AppShell.tsx:48-70 labelMap(缺 settings 键)；:86 label=labelMap[seg]??seg`
- 问题：labelMap 有 recordings/tasks/hotwords 等却独缺 settings 键，line 86 兜底回退原始 seg，设置页面包屑显示『工作台 / settings』中英混排，与主标题『设置』不一致(暗色/窄屏同错)。
- 建议：labelMap 补 'settings':'设置'(与侧栏 line 40 label 一致)；排查其它路由段做兜底统一。

**#24 [导航状态]** `AppShell.tsx:26-27 首页→/app/recordings/new；NavLink active 逻辑`
- 问题：/app/recordings/new(上传录音子页)下侧栏高亮『首页』而非『录音库』，面包屑却是『工作台/录音库/上传录音』，活动导航与面包屑/上下文不一致。违反§3.4『侧栏选中↔内容标题联动』。
- 建议：nav active 改为路径前缀匹配(/app/recordings 与 /app/recordings/new 都点亮『录音库』)，而非精确匹配或首页兜底。

**#25 [导航·首页定位]** `AppShell.tsx:26 首页→/app/recordings/new`
- 问题：把『上传录音』表单当『首页』放导航第一项，三重不一致：(1)点首页落到上传表单与心智模型错位；(2)同一路由侧栏叫『首页』、面包屑/H1 叫『上传录音』；(3)真正主页『录音库』排第二。新用户第一眼见空表单。
- 建议：将『录音库』作为首页/默认落点；上传改为录音库右上角主操作或独立『上传』入口，不叫『首页』。若保留快捷入口，导航项也应叫『上传录音』与面包屑/标题统一。

**#26 [动作主次]** `RecordingDetail/index.tsx 页眉『重新处理』(primary)+ ReviseComposer『按要求重写』(primary)`
- 问题：详情页同时存在2个 .btn--primary，违反铁规『一组只一个 primary』与§8.4『全页只一个 primary』。两个蓝色主操作分散注意力。
- 建议：保留页眉『重新处理』为页面级唯一 primary，composer『按要求重写』降为 secondary；或页眉主操作降级，二选一。

**#27 [卡片样式]** `RecordingDetail『从当前录音指定声纹』Speaker 1 卡片`
- 问题：说话人卡片带深色/黑色粗描边，违反铁规『卡片无边框无阴影；选中=扁平灰 #E7E7E7 非蓝非黑』；且该卡片宽仅230与其它全宽卡片(1016)混排，留白节奏不一。
- 建议：移除深色描边，选中态改扁平灰底 #E7E7E7(.card--sel)无边框，未选中靠 panel 层差区分；卡片宽度纳入 card-grid 自适应列，避免孤立230px。

**#28 [间距留白]** `RecordingNew/Settings .container--form(560px) 在 .col(1176px) 内居中`
- 问题：表单 margin-inline:auto 在 col 内居中，但左侧被264px sidebar 占据，表单视觉重心严重偏右：中心约 x=852 而视口中心720，偏右132px，sidebar 与表单间308px 单边空白显空旷失衡。
- 建议：表单页改用 container--content 承载、内部表单块 max-width 560 左对齐或加56px 左内边距收紧；或在表单上方补一条与表单左缘对齐的返回/上下文条。

**#29 [空状态]** `Voiceprints.tsx 空态；Tasks.tsx:34-40 空态`
- 问题：空状态只有标题+一句说明缺主CTA按钮(DOM 空态无 .btn)。违反§8.7『空状态=图标+标题+正文+主CTA』、§1.9。声纹空态只给文字指引无可点按钮；任务空态文案准确但无『去上传』动作(对比录音库空态已有按钮，不一致)。
- 建议：补 .empty/.page-state 标准结构：图标+主CTA(声纹/任务页加『去上传录音』链接 /app/recordings/new)，保持全站『一句话+一个动作』一致。


## P2

**#7 [响应式·矮窗/横屏]** `aham-ui.css:857 @media(max-height:30rem)；.sidebar(flex-column 固定结构)`
- 问题：矮窗断点只压缩页眉内边距，sidebar 含 brand+nav+account 固定高度且不可滚动，≤480px 高(手机横屏)下底部『本机用户』账户区会与导航挤压/溢出。
- 建议：给 .sidebar 设 overflow-y:auto；矮窗下 .app-account 可收为图标；在折叠方案中一并处理 sidebar 内部滚动。

**#30 [a11y·按钮类型]** `RecordingsList.tsx:166/169 seg tab 按钮、:263 行内删除 icon-btn`
- 问题：行内删除按钮与 role=tab 按钮均未显式设 type(delBtnType=null、tabsNoType=['我的','全部'])。原生 button 默认 type=submit，一旦被 form 包裹会误触提交，不符组件库 Button 默认 type=button 约定。
- 建议：所有非提交用途原生 <button> 显式加 type=button(删除按钮、tab 按钮等)。

**#31 [a11y·ARIA角色]** `RecordingsList.tsx:165-172 seg role=tablist/tab`
- 问题：用了 role=tablist+tab+aria-selected 但无对应 role=tabpanel，tab 无 aria-controls(controls=null)，也无 roving tabindex。不完整 tab 模式让读屏宣告『标签页1/2』却找不到面板，比普通按钮更困惑。
- 建议：推荐降级为一组普通 <button> 配 aria-pressed(过滤切换语义更贴切)；或补全 tabpanel+aria-controls+方向键切换。

**#32 [a11y·ARIA标注]** `SpeakerNameModal.tsx:87 aria-label={title}；:94 <h3 class=modal__title> 无 id`
- 问题：对话框用 aria-label={title} 重复字符串命名，而标题已在可见 h3 渲染，应用 aria-labelledby 指向该元素避免与可见标题不同步；且无 aria-describedby 关联错误区。
- 建议：给 h3 加 id 并在 .modal 上用 aria-labelledby 指向它；错误容器加 id 用 aria-describedby 关联并置于 role=alert。

**#33 [a11y·表单标签]** `Hotwords.tsx:120-126 隐藏 file input(display:none)`
- 问题：导入 txt 的 display:none file input 无 aria-label，仍被审计列入 inputsNoLabel(部分AT/工具会扫描)，若未来改视觉隐藏会暴露。
- 建议：加 aria-label=『导入热词 txt 文件』，或用 aria-hidden=true 明确排除出可访问树。

**#34 [交互·弹窗]** `SpeakerNameModal.tsx:112-118 回车仅绑姓名 input；:131-141 foot 用 type=button`
- 问题：回车提交只绑姓名 input，焦点在备注 textarea 或按钮区时回车不触发默认『保存』，与§8.6『默认按钮绑 Return』不一致。
- 建议：用 <form onSubmit={handleSubmit}> 包裹 body，『保存』设 type=submit 由表单统一处理 Return；textarea 保持 Enter 换行。

**#35 [交互·副作用]** `Settings.tsx:126-145 『测试连接』dirty 时 patchSettings 写库`
- 问题：『测试连接』在用户未点保存时静默把表单(含 API Key/Base/Model/provider)PATCH 持久化到后端，产生不可见写入副作用违反最小意外原则；测试用的临时/错误 Key 也被写进 config.json。
- 建议：测试连接应只探活不落库，解耦『保存到配置』与『测试』；若需先存应在按钮旁明示『测试会先保存当前配置』。

**#36 [交互·反馈就近]** `Settings.tsx:182-183 顶部 Diag vs 251-278 按钮区`
- 问题：保存/测试/清除的成功失败反馈共用页面顶部同一对 Diag，离按钮区(卡片中部)较远视线需上下跳；且 info 仅用『✓』字符，错误三重指示(红框+图标+文案)中图标缺失。
- 建议：把异步结果 inline 提示移到按钮行正下方就近；错误用 .alert--risk 补图标、成功用 .alert--ok 配图标，满足『不靠颜色单独传达』。

**#37 [交互·禁用门槛]** `SpeakerNameModal.tsx:71(scrim)、49(Esc) 无 saving 判断 vs :132 取消按钮 disabled={saving}`
- 问题：保存进行中(saving)取消按钮已 disabled，但 scrim 点击与 Esc 仍可关闭 modal，用户可绕过禁用态在『保存中却关闭』。门槛分散在各调用方易漏。
- 建议：在 SpeakerNameModal 内部统一：saving 为 true 时 scrim onClick 与 Esc 一律 no-op，集中收敛关闭门槛不依赖调用方判断。

**#38 [交互·表单校验]** `RecordingNew.tsx:127-135 标题 required、:205-216 提交按钮 disabled`
- 问题：提交按钮缺文件/空标题时 disabled 屏蔽但无就近 inline 提示『为什么不能提交』，标题空时无字段级 .err 校验只靠浏览器原生 required，用户看灰按钮无从下手。违反§8.6/§8.7。
- 建议：为标题/文件加就近字段级校验：未通过时在对应 FormRow 下显示 .err(『请填写标题』『请选择音频文件』)；或保留 disabled 但在按钮/字段旁给缺失项提示。

**#39 [交互·异步反馈]** `RecordingsList.tsx:262-277 行内删除(disabled={remove.isPending})`
- 问题：删除进行中对全表所有删除按钮统一 disabled，无单行 loading 指示，用户看不出哪行在删；删除失败也无 inline 错误回显(onError 未在列表渲染)。
- 建议：删除按钮按行展示 loading(只禁用并转圈当前行)，mutation onError 在列表顶部用 .alert--risk inline 显示失败原因；成功用瞬态 toast 或乐观更新。

**#40 [交互·错误隔离]** `Voiceprints.tsx:19 单一 error state；:61 顶部 Diag 与 :123 modal error 同源`
- 问题：删除与编辑共用同一 error state，既渲染在页面顶部 Diag 又传入 SpeakerNameModal。删除失败时若编辑 modal 恰好打开，同一错误会串到 modal 内造成上下文错配。
- 建议：拆分 deleteError 与 editError 两个 state：删除失败只在列表 inline 显示，编辑失败只在 modal 内显示。

**#41 [a11y·键盘可达]** `AudioPlayer .vplayer__wave role=slider；vplayer__time`
- 问题：波形 slider 聚焦只有浏览器默认细环(受焦点环P1影响)，且 vplayer__time 显示 0:00/0:09 与详情头部/列表用的 00:00:09 时长格式不一致(§1.9 数字格式统一)。
- 建议：统一时长展示格式(详情头部/列表/播放器一致)；确保波形 slider 聚焦有3px焦点环(随焦点环修复覆盖)。

**#42 [空态一致性]** `SpeakersCard.tsx 用 <EmptyState>(.empty-state) vs 列表页内联 .page-state；aham-ui.css:712 vs :800`
- 问题：项目并行两套空态系统：页面级用 .page-state(__icon/__title/__desc/__actions)，EmptyState 组件用 .empty-state(.es-title/.es-desc)。SpeakersCard 调 EmptyState 只传 description 无图标无标题，与 .page-state 字号/图标/间距不一致。
- 建议：统一收敛一套：让 EmptyState 内部输出 .page-state 结构，或页面改用同一组件。

**#43 [死CSS]** `components-voice.css:119-188 .spk-table/.spk-cell-actions/.spk-name-line/.spk-tag/.spk-edit*/.spk-clip*/.spk-sample*/.spk-savebar`
- 问题：整块说话人编辑表 CSS(约70行)无任何 .tsx 引用(grep 命中0)，SpeakersCard 已重写为 .card/.card-grid/.status--warn。死CSS违反§7治理。
- 建议：删除 components-voice.css 中整段 .spk-* 规则(约119-188行)。

**#44 [死CSS]** `components-voice.css:282-306 .page-body/.page-head/.page--object-index/.page--object-detail/.obj-head`
- 问题：.page-body/.page-head/.obj-head 自造类无 .tsx 引用(grep 命中0)，页面已改用官方 .container--content + <PageHead>=.page-header。迁移残留旧布局类，与官方三层体系重复。
- 建议：删除 .page-body/.page-head/.page--object-*/.obj-head 规则，统一走官方 .page-header + .container。

**#45 [残留旧类]** `RecordingsList.tsx:151、Tasks.tsx:25、Voiceprints.tsx:54、RecordingNew.tsx:87 className=page-shell page--object-index`
- 问题：四页写 .page-shell.page--object-index，但 CSS 选择器是 .page-body.page--object-index(依附 .page-body)，故 .page-shell 上的 page--object-index 匹配不到任何规则是死修饰类，width 约束从未生效；page-shell 又嵌进 .container 形成宽度双重来源(实测 page-shell 1016≠container 1080，32px偏移)。
- 建议：移除 page--object-index/page--object-detail 修饰类；宽度只由 .container--content 控制，page-shell 仅做纵向布局。

**#46 [死变量]** `design-tokens.css:38-43 LEGACY COMPATIBILITY 块 --bg-surface/--border-default/--fg-subtle/--radius-md/--weight-semibold`
- 问题：兼容块注释称『Settings.tsx 迁移完成前临时保留』，但 grep 全 .tsx 命中0(已迁移)。整块死变量，注释过期。
- 建议：删除整个 LEGACY COMPATIBILITY 块(约33-43行)及过期注释。

**#47 [内联样式]** `Timeline.tsx(13)、Tasks.tsx(11)、SpeakersCard.tsx(11)、RecordingNew.tsx(9)、RecordingCard.tsx(8)、Preview.tsx(8)`
- 问题：多组件 style={{...}} 内联块密集，把布局(flex/gap/grid/padding)写进内联而非具名 class。虽多引用 token(无裸px/硬编码色)，但内联布局难复用、无法被容器查询/断点覆盖。违反§8.1/可维护性治理。
- 建议：把重复 flex/gap/grid 收敛为 components-voice.css 具名类(如 .timeline-row、.task-meta)，内联只留一次性微调；优先用官方布局原子(.row/.col/.fill)。

**#48 [间距留白]** `Voiceprints/Tasks page-header--divider 之下、空状态之上`
- 问题：声纹页 divider top≈228、空态标题 top≈325 中间约97px 纯空白；空状态贴顶部而非整页级垂直居中(违反§8.7『默认整页级居中』)，下方数百px 空白上挤下空失衡。
- 建议：列表为空时 .page-state 在 page-content 剩余空间内垂直居中(min-height+flex center)；divider 到空态标题压缩到 --s6(32)。

**#49 [间距留白]** `tasks page-header--divider 与 page-content；recordings page-toolbar/header divider`
- 问题：page-header padB 24+divider+content padT 24 累积，副标题到首个区块标题约80px 留白过大头部与列表割裂；多页 header padB24+content padT24=48px(≈--s7)比规范 header-内容 --s5(24)翻倍；recordings 工具栏到表头又空70px。
- 建议：收敛纵向节奏：有 divider 页 content padT 由 --s5 降为 --s4，或用容器 gap 统一控制避免双 padding 叠加；结果计数移到表格上方紧贴表头。

**#50 [内容溢出]** `RecordingDetail 全宽 .card 内 3项 metric 行(热词/声纹/说话人)`
- 问题：详情页卡片全1016px 全宽，三项 metric 横向拉到 left 380/707/1035 跨近1016px，单条信息被稀释到极宽右侧大量空白，内容密度偏低长行扫视成本高。
- 建议：metric 行用 max-width 收口(如720 read宽)或改 grid 固定列宽左对齐；或用 supporting-pane 把元信息收进 rightbar 340，主内容用 content 宽。

**#51 [表格·列合理性]** `RecordingsList.tsx:232-235,262-277 负责人列、删除列`
- 问题：删除按钮列无表头(空th)且破坏操作直接暴露每行；单用户场景『负责人』恒为『本机用户』是零信息量冗余列，挤占窄屏横向空间。
- 建议：单用户模式隐藏『负责人』列(仅团队scope显示)；删除等行操作收进 hover『⋯』菜单或给 aria 表头的图标列+二次确认；优先保证录音/状态/更新核心列窄屏可见。

**#52 [文案·占位截断]** `RecordingsList.tsx:181 toolbar-search placeholder(width=200)`
- 问题：搜索框 placeholder『搜索标题、客户、标签、负责人』在200px宽框被裁断只显到『标签、』，『负责人』看不到，用户无法获知可按负责人搜索。
- 建议：缩短为『搜索录音…』或加宽输入框(flex:1)让 placeholder 完整；窄屏自适应。

**#53 [信息层级·subtitle]** `RecordingsList.tsx:154、Hotwords.tsx:105、Settings.tsx:178；PageHead.tsx:6-8 规则注释`
- 问题：subtitle 应为本页数据事实而非功能描述：录音库后半『点开任一条进入…』是操作教学；热词页纯功能描述；设置页 subtitle 是3行功能说明+7厂商清单(与下拉重复)，窄屏换4-5行挤压标题区。违反 PageHead 注释明示规则。
- 建议：统一收敛为事实型：录音库『共N条·最近更新X』、热词『共N个词·上次保存X』、设置『大模型:已配置(DeepSeek)』或『本地单机运行』；功能说明移到卡片内辅助文字。

**#54 [暗色·焦点环]** `aham-ui.css:432-441 暗色 token 块未覆盖 --focus-ring(仍 rgba(51,110,232,0.20))`
- 问题：暗色 [data-theme=dark] 块覆盖了 --accent 系列却没覆盖 --focus-ring，焦点环仍用亮色低不透明深蓝，在 #1C1C1C 暗背景上几乎不可见，键盘可达性受损。
- 建议：暗色块补 --focus-ring:rgba(92,139,237,0.40)(用暗色 accent #5C8BED 并提高不透明度)，确保深背景上焦点环清晰。

**#55 [暗色·对比度]** `.btn--primary 蓝底白字(暗色 --accent=#5C8BED)+ 品牌字母 A`
- 问题：暗色主按钮 #5C8BED 上白字对比仅3.3:1，低于正文4.5(15px粗体按大字3:1勉强达标但临界)；品牌头像 A 同3.3。设计系统注释已标注『暗色按钮蓝底白字尤其要验』。
- 建议：暗色主按钮底色压深一档(回 #336EE8 系，对白字~4.6:1)，文字 font-weight:600 且≥14px；品牌字母同理。

**#56 [术语·标点一致性]** `ReviseComposer.tsx:58-78、Voiceprints.tsx:45 vs RecordingsList.tsx:270、状态标签(RecordingsList:58 vs index.tsx:33)`
- 问题：术语/标点不统一：改纪要同一功能叫『改一下』『按要求重写』『修改』三种；删除确认 Voiceprints 用半角『?』、RecordingsList 用全角『？』；同一状态列表页『已完成/进行中』vs 详情页『已生成/处理中』，用户跨页困惑。
- 建议：统一动词(建议『修改纪要』)；统一中文全角『？』『。』『……』；抽单一 statusLabel/statusTone 映射函数供列表与详情共用；统一破坏性确认模板『删除「X」？该操作不可撤销。』。


## P3

**#57 [页眉规范]** `recordings page-header--divider 与 page-toolbar；hotwords/settings header 高度`
- 问题：录音库 divider 后立即接 page-toolbar(中间仅~16px)而 header 上方留白充足上松下紧；各页 header 高度被内容撑开不一(普通143、settings194)，跨页切换 header 下边界跳动导致内容起点跳动。
- 建议：page-toolbar 顶部加 --s4 上间距或让 divider 归属 toolbar 上方；副标题统一1-2行并统一 header 最小高，settings 副标题精简到2行。

**#58 [残留旧变量/旧类]** `RecordingNew.tsx:94,201 var(--space-6/-3)、Timeline.tsx:264 var(--space-2)；components-voice.css:395-398 nv-timeline--moss/rust/amber、:82(9px)/:403(22px)/:467(3px 6px)`
- 问题：三处内联仍用旧间距标度 --space-*(官方单一事实源是 --s*)违反§3.5/§7；.nv-timeline 仍用被清退的旧色名 moss/rust/amber 修饰，且多处用4基网格外裸px(9/22/3/6px)违反§3.2。
- 建议：--space-6→--s6、--space-3→--s3、--space-2→--s2 并删 --space-* 定义；类名改官方 .timeline 或中性 --ok/--warn/--risk 去掉 moss/amber/rust；装饰尺寸取最近4基档(9→8、22→24)或token化(描边1/1.5px例外允许)。
