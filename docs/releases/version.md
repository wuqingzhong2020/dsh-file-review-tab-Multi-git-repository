# 版本记录 / Version history

本文件集中维护各版本的发布说明与验证记录，按版本从新到旧排列。后续发版在顶部追加新版本章节；有验证记录时放在对应版本内，不再创建单独的版本文件。

Release notes and validation records are maintained in this file, with the newest version first. Add future releases at the top and keep validation records within their version section.

## 目录 / Contents

- [v0.2.0](#v020) · [验证记录 / Validation](#v020-验证记录)
- [v0.1.2](#v012) · [验证记录 / Validation](#v012-验证记录)
- [v0.1.1](#v011)
- [v0.1.0](#v010)

## v0.2.0

**选区引用、外部定位与评论讨论**

### 中文

- 新增同一版本侧的连续行选择，可复制完整引用或路径与起止行，并添加范围评论。保留仓库、来源、比较基线和修订身份。
- 选区操作改为代码／行号右键菜单：范围内右键保留范围，范围外右键选择该行，支持 Shift+F10、复制、范围评论、外部定位和清除选区。
- 新增外部 IDE 行定位，推荐 VS Code，Windows 也支持配置 Antigravity IDE。打开前核对真实仓库范围、文件及引用；位置移动需确认，歧义、旧版行、删除文件和缺失编辑器在菜单中显示回退提示。
- 扩展设置：字体、字号、行高、Tab 宽度、主题或蓝／橙配色、背景强度、编辑器路径、文件内快捷键、讨论记录及大文件虚拟化。默认每次展开 20 行，旧偏好自动迁移。
- 八种范围支持单行、范围与整文件评论。讨论按提交请求及实际轮次关联文字答复，保留批次、排队／取消／失败状态、新回复、已读、手动解决／重新打开和追加意见；重启不自动重发。
- 大块差异启用可变高度行虚拟化，换行、并排对齐及评论高度共同测量，编辑行保持挂载；搜索、导航、复制及原始撤销数据保留完整语义。
- 中英文 README、界面及维护文档同步更新。Git 比较保持只读，不新增选区写回或回退动作。
- 文件审查标题行新增「操作指南」按钮，按宿主语言打开随插件安装的 [中文手册](../USER_GUIDE.md) 或 [英文手册](../USER_GUIDE.en.md)，支持 Markdown 排版、截图显示和点击放大。
- 文件审查直接注册宿主原生右侧栏，不再要求安装 dsh-better-sidebar。保留聊天尾部审查入口、会话顶部多仓库管理和文件数角标；文件打开绑定来源会话与窗格。
- 操作指南改为主题适配的弹窗，保留图片放大、刷新和 Esc；旧布局中的指南标签提供兼容入口。修正原生深色主题下仓库标题、评论和菜单的背景。

适配 DeepSeek Harness Desktop **0.2.0-rc.2**。dsh-better-sidebar **0.24.1** 可选共存。验证环境为 Windows；其他平台尚未完成真实宿主验证。具体测试与性能记录见 [验证记录](#v020-验证记录)。

安装资产：`dsh-file-review-tab-multi-git-repository-0.2.0.tgz` 及 `.sha256`。安装后完整退出 Desktop（含托盘）并重新启动，确保 Host 与浏览器同时加载新版。

### English

- Select contiguous lines on one version side, copy a complete reference or path/range, and add range comments. Repository, source, comparison and revision identities are retained.
- Access selection actions through a code/line-number context menu or Shift+F10. Right-click inside a range to keep it, or outside it to select one line; copy references, comment, navigate externally or clear the selection.
- Navigate to verified lines in an external IDE. VS Code is recommended; Windows also accepts a configured Antigravity IDE executable. Real repository paths, file content and references are checked before launch. Relocation requires confirmation; ambiguous, old-version, deleted-file and missing-editor cases explain the fallback in the menu.
- Configure fonts, size, line height, tab width, theme or blue/orange colors, background intensity, executable path, scoped shortcuts, discussions and virtualization. Expansion still defaults to 20 lines and existing preferences migrate.
- All eight scopes support line, range and file comments. Discussions link text replies to submitted requests and actual turns, with queued/cancelled/failed states, unread/read, manual resolve/reopen and follow-ups. Restart never resends automatically.
- Variable-height rendering windows large diff blocks, measuring wrapping, paired split cells and comments together. Editing rows stay mounted; search, navigation, copying and original undo data retain their full semantics.
- Chinese/English UI, READMEs and maintenance documentation are updated. Git comparisons remain read-only.
- Open the shipped [English](../USER_GUIDE.en.md) or [Chinese](../USER_GUIDE.md) manual from the User guide button beside the review scope. The host language selects the manual; instructions and screenshots are included in the package.
- File Review now registers directly with the native right sidebar; dsh-better-sidebar is optional. The turn-tail actions, conversation repository settings and file-count badge remain available. File navigation stays bound to its originating session and pane.
- The guide opens in a themed dialog with image enlargement, refresh and Esc support. Restored legacy guide tabs provide a compatibility page. Native dark-mode backgrounds are corrected for repository headers, comments and selection menus.

Compatible with DeepSeek Harness Desktop **0.2.0-rc.2**. dsh-better-sidebar **0.24.1** is optional and can coexist with the plugin. Validated on Windows; other platforms have not completed real-host testing. See the [validation record](#v020-验证记录) for evidence and limits.

Assets: `dsh-file-review-tab-multi-git-repository-0.2.0.tgz` and its `.sha256`. Fully exit Desktop, including its tray process, and restart after installation so both Host and browser load the new version.

### v0.2.0 验证记录

#### 2026-10-04 原生侧栏迁移

- 严格类型检查、声明生成和构建通过；完整自动测试 **166 / 166 通过**，0 失败、0 跳过，约 39.1 秒。新测试覆盖会话限定导航、重复目标、种子消费及卸载清理、特殊字符／UNC／跨根地址、注册失败回滚、迟到插槽、旧指南兼容和隐藏标题更新。角标也覆盖同节点数结果变化与自动归档排除。
- 删除第三方侧栏运行依赖及旧标题桥接声明；新增官方原生侧栏类型和随客户端打包的纯路径工具。客户端约 **590.17 kB**，gzip 约 **131.95 kB**。Host 文件读写、撤销、外部定位协议和业务存储键未变。
- 使用真正的 Desktop rc.2 窗口、隔离的 DSH_HOME 与 Electron 数据目录验收，生产 Profile 未改动。测试代码的 `lib/client.js` SHA-256 为 `4A534A60D9C9E37C6E38C827A2FA39737A37E9C86EB6FF5642A3FE7A9E292A7A`；安装后的文件哈希与构建产物一致。
- 完全未安装 better-sidebar 的环境可从原生 ＋ 引导打开文件审查，展示主区域多仓库页签，打开真实工作区文件；八种审查范围入口可见，未提交范围读取实际 Git 改动。正文非活动时切换 zh/en，标题与角标继续更新，返回时保留审查范围。
- 从旧 v0.2.0 安装包实际打开审查、文件及指南标签，再升级新包；旧审查与文件标签恢复，指南恢复为兼容页，并可打开新弹窗。没有批量改写或清空旧布局存储。
- better-sidebar 启用时可共存，两种加载顺序均已检查；停用并重启后审查正文继续工作。真机停用本插件后正文显示宿主的不可用回退，重新启用恢复审查和角标，不积累重复注册。真实聊天尾部的整轮及单文件入口能展开对应第 13 轮差异；关闭后重开、收起后展开、重复目标和全屏正常。分栏中的文件打开仍进入来源审查窗格。
- 中英文手册均以 Markdown 和截图显示，放大图片后 Esc 先关闭图片，再关闭指南；深色手册、仓库标题、范围菜单及评论编辑器可读。单行选择、Shift+F10 范围菜单、评论编辑及取消已检查，未向用户会话发送测试意见。
- 最终 tgz 包含 12 张手册截图及双语手册；不包含临时方案或旧标题声明。181 个长期文档本地链接检查通过。最终包在隔离 Profile 安装后重新启动，真实 Git 数据和指南加载正常；停用／重新启用及共存也使用该最终客户端产物验证。

以上包含真实 Desktop 操作，区别于下文早期组件夹具验证。真机尚未覆盖全部跨会话同名文件与异步切换组合、流式角标变化、强制原生服务重建及注册异常；这些边界中的部分由自动测试覆盖。本次没有重新启动外部 IDE，也没有发送真实模型审查请求，沿用下文既有验证及本次自动回归结果。关闭 Tab 释放页面临时状态；隐藏 Tab 保留状态；评论、讨论、确认和阅读偏好继续按原规则保存。其他平台未验证。

#### 2026-10-03 功能与性能基线

日期：2026-10-03。环境：Windows、Node.js 24.19.0、pnpm 11.25.0、项目锁定依赖。对照基线为本次开发开始时的 v0.1.2。

#### 构建与自动测试

- TypeScript 严格检查、声明生成及 tsdown 构建通过，`lib/` 与源码同步；无新增运行依赖或字体包。
- `node --test tests/*.test.mjs`：**121 / 121 通过**，0 失败、0 跳过，约 29.2 秒。
- 本版本新增 21 项测试：同侧连续范围／反向选择／缺失片段／引用大小与 Unicode、来源与安全代码围栏、全文或唯一上下文定位、CRLF、重复匹配、特殊字符路径 argv、缺失程序／启动失败、Antigravity 兼容及程序类型、真实文件／仓库范围／非 UTF-8／NUL 二进制／文件失配、通信契约、准确请求与轮次答复关联、队列取消／中断／失败、持久化／历史窗口截断／重启不重发、传输结果不确定、迟到确认保留新编辑草稿、可变高度窗口及偏好迁移。
- 原有 Git 比较、创建／删除／重命名、二进制、换行、真实仓库隔离、撤销、确认及语言测试继续通过。

#### 组件界面验证

本地浏览器挂载实际 `FileReviewTab`、`GitReviewPanel`、`UnifiedDiff`、设置及评论组件，模拟宿主语言、快照、会话事件和 Remote 响应。

- 八种范围 × 统一／并排布局，共 16 个场景均能选择新版 98–102 行，并显示引用复制、范围评论与外部定位入口。
- 单行点击、Shift 范围、跨旧／新侧拒绝、复制引用的来源／行范围／原代码正确；对话草稿在范围评论与提交时保留。
- 范围评论入队后清除待提交草稿并保留讨论；实际用户事件入轮后关联本轮文字答复，支持已读、手动解决／重新打开、追加意见及队列取消。
- 提交失败后草稿保留，重新加载后已提交意见、答复、解决状态及失败草稿恢复。语言切换保留正在编辑的中文文字和选区。
- 缺失编辑器、移动引用确认、旧版定位拒绝及内置打开回退有可见提示。
- 字号、行高、Tab、配色保存／重新打开／默认值恢复正常；深色设置背景为实体 `rgb(13, 17, 23)`，正文可滚动，操作栏保持可见。360 px 侧栏下工具条换行。
- 两万行展开后搜索第 19,990 行能将目标显示在可见区域；虚拟区域键盘滚动到末尾后，起点第 10 行的编辑器及未保存草稿仍保持挂载。
- 并排评论卡片增高时两侧测量高度一致（样例为 229.7 px）；代码及答复中的 `<script>` 以文字显示。
- 修正并排左右单元格重复 React key 后重跑 16 个场景，新的控制台错误／告警为 0。

以上是组件和模拟服务验证，不是自动化操作真实 Desktop 窗口或真实模型回答；真实 Desktop 中的长会话、重连与不同平台仍需使用中确认。

#### 真实编辑器验证

按用户指定使用 `D:\app\Antigravity IDE\Antigravity IDE.exe` 替代本机无效的 VS Code 注册路径。读取其产品配置与 CLI 实现，确认版本 1.107.0 和 `--goto file:line[:character]` 参数。

通过实际 `FileReviewService.locateReference/openEditor` 对普通 CRLF Python 文件核对新版第 12–14 行，再启动编辑器。测试文件名包含中文、空格、`&`、`#` 和 `%`；路径作为一个独立 argv 传入，未拼接 shell。Host 返回 `exact` 和 `started`，编辑器 CLI `--status` 确认该文件窗口存在。

**没有自动核验 GUI 光标或窗口焦点**；启动及窗口诊断不等于光标验收。插件提示只表示请求已交给编辑器。测试使用真实文件与真实编辑器进程，Host 的 workspace 根目录由测试夹具提供，并非通过真实 Desktop RPC 发起。未安装扩展或改写注册表／宿主 ASAR。

#### 两万行测量

同一浏览器分别挂载 v0.1.2 与 v0.2.0 组件，使用 20,000 行 Python、两处相距较远的修改、自动换行及评论控件，依次点击三个间隔的实际全部展开按钮。旧组件使用本次共享行模型，不启用虚拟化；本样例的原始行流一致。

| 布局／状态 | v0.1.2 React 渲染 | v0.2.0 React 渲染 | v0.1.2 DOM 节点 | v0.2.0 DOM 节点 |
| --- | ---: | ---: | ---: | ---: |
| 统一，折叠 | 48.8 ms | 4.9 ms | 257 | 285 |
| 统一，全部展开（累计） | 3,797.1 ms | 10.0 ms | 120,157 | 1,042 |
| 并排，折叠 | 47.0 ms | 11.2 ms | 338 | 374 |
| 并排，全部展开（累计） | 6,840.1 ms | 32.9 ms | 240,157 | 1,738 |

全部展开的交互总耗时（含提交、布局及动画帧等待）：统一 **13,582 → 180 ms**，并排 **25,755 → 286 ms**。新版统一挂载 99 个代码行元素，并排 198 个，共三个虚拟窗口。切换旧组件时要卸载前一个大 DOM，折叠端到端耗时不用于比较。数据为一次本机样例，不是固定性能保证。

虚拟化限制 DOM 数量，完整原始行模型、搜索索引、RPC 正文和高亮预算仍占内存；不能据此声称无限规模文件没有成本。窗口按实际测量高度调整，正在编辑的离屏行额外挂载。关闭虚拟化后恢复完整 DOM。

#### Bundle 与交付

| 产物 | v0.1.2 | v0.2.0 |
| --- | ---: | ---: |
| `lib/client.js` 原始字节 | 464,304 | 532,684 |
| `lib/client.js` gzip 字节 | 101,959 | 117,636 |

客户端新增约 68.4 kB，gzip 新增约 15.7 kB；Host 为 47,584 字节（gzip 13,431）。没有加入完整 Shiki 语言包、字体包或 Markdown 渲染器。

交付使用标准 `dsh-file-review-tab-multi-git-repository-0.2.0.tgz` 与 SHA-256 文件；检查版本、运行文件、双语 README、发布说明与验证记录。临时调研方案、本地缓存、测试夹具及 `node_modules` 不进入包。Desktop Profile 安装前保存旧包和配置备份，安装后核对版本及文件哈希，保持其他插件依赖和 Desktop bundle 配置。

本地测试证据位于开发工作区的 `.cache/stage-b/`（性能 JSON、范围检查、编辑器诊断、截图及测试输出），它们是开发记录，不随公开包分发。

#### 2026-10-03：右键菜单与外部 IDE 文案

- 选区操作移至右键菜单，文件开头不再显示选区按钮栏；复用宿主 Menu 的 portal、位置约束及键盘导航。本机 Desktop ASAR 的只读检查确认导出 `Menu`、`MenuItemButton` 并支持 `getAnchorRect`；未修改宿主。
- 新增范围操作目标测试：正向／反向范围内部保留范围，范围外、另一版本侧、另一片段、另一文件或修订改为单行。全部自动测试 **122 / 122 通过**，0 失败、0 跳过；typecheck 和 build 通过。
- 实际组件搭配模拟宿主服务，八种范围 × 两种布局共 16 个场景均显示正确的新侧 22–23 行菜单。验证复制内容、范围评论、清除选区、Shift+F10、方向键和 Esc 焦点归还、范围外与跨侧右键、新侧打开成功提示及旧侧拒绝／内置打开回退。复制测试后恢复原剪贴板。
- 中英文菜单及设置均使用「外部 IDE」，VS Code 保留为推荐示例，仍可配置 Antigravity；没有新增其他 IDE 的启动参数适配。深色菜单背景为实体 `rgb(13, 17, 23)`，正文为 `rgb(230, 237, 243)`，菜单位于可见视口内。评论输入框保留其自身右键行为。
- 中文使用手册更新右键操作说明，更新菜单、外部 IDE 设置、范围评论、待提交意见与讨论截图。12 张图片、目录锚点、相对链接及双语 README 的手册入口检查通过。

这批界面验证使用浏览器中的实际插件组件和宿主 Menu 实现，服务与工程为演示数据，未自动操作真实 Desktop 会话或向真实 Agent 发送消息。

#### 2026-10-03：操作指南入口与双语手册

- 文件审查标题行在范围下拉框右侧显示「操作指南 / User guide」。点击时读取宿主当前语言，经 Agent 作用域 RPC 获取插件安装目录中的固定手册路径，交给内置文件查看器；不依赖当前工程，不新增 Markdown 渲染依赖。
- 新增 5 项测试，覆盖实际构建 Host 的路径定位、语言白名单与通信校验、实时语言切换、原会话打开、缺失服务／查看器及远程失败。全部自动测试 **127 / 127 通过**，0 失败、0 跳过；typecheck 和 build 通过。
- 浏览器实际组件验证八种范围 × 中英文，共 16 个指南打开场景；测试空会话入口、失败提示、420 px 英文浅色及 320 px 中文深色窄视口的按钮可见性。服务端调用实际构建的手册定位方法，文件查看器由测试回调记录请求；未自动验收真实 Desktop 的 Markdown 页签。
- 两份手册各包含 16 个功能章节及相同的 12 张具名截图；中英文手册、README 共 90 个本地文件／目录锚点链接检查通过。英文正文使用英文操作名称，并注明截图为中文界面。

#### 2026-10-03：操作指南截图显示修复

- 原内置文件预览已渲染 Markdown，但将相对截图地址转换为 `dsh-app://app/sidebar/file?...` 后，被宿主 Markdown 图片协议白名单拒绝，因而只显示替代文字。
- 操作指南改用独立页签，复用宿主 Markdown 渲染器。Host 返回固定语言的手册及 12 张白名单 JPEG 的 data URL，由显式图片解析器加载；支持点击放大、Esc／关闭按钮返回、跟随语言切换和刷新重试，不新增 Markdown 运行时依赖。
- 新增 4 项测试，覆盖中英文实际手册内容、截图原始字节一致性、固定图片解析、通信白名单与失败传播。全部自动测试 **131 / 131 通过**，0 失败、0 跳过；typecheck 和 build 通过。手册文件与目录锚点检查通过。
- 浏览器使用实际 `UserGuideTab`、构建后的 Host 文档读取方法，以及从已安装 Desktop 提取的 Markdown 解析、渲染和图片放大实现；仅测试夹具的代码高亮与链接图标省略。中英文共 24 次截图加载／放大均成功，验证 Esc 和按钮关闭、已打开手册切换语言、加载失败后刷新恢复、420 px 英文浅色和 320 px 中文深色的图片缩放。没有自动验收真实 Desktop 页签；安装后需完全退出并重启宿主。

#### 2026-10-03：工程可读性整理

- 会话审查页面拆分为快照补录、归档、深链、文件操作 hook 与轮次/文件展示组件；Git 面板保留请求生命周期，单独组织文件展示。对话末尾审查行分离摘要和结果提示。
- 差异组件分离选区/菜单、工具栏和上下文块展示，继续集中管理搜索与导航；高亮扫描、行测量和偏好校验采用具名条件与函数，展开压缩的分支和 JSX。
- 评论分离上下文、编辑卡片、批次提交、事件归并和持久化。保留请求身份先落盘、失败保留草稿、迟到确认不清除新编辑意见等规则。
- Host 服务分离安全文件处理、引用定位、手册读取，以及 Git 命令和输出解析。公开接口、存储格式、错误文字、路径检查和文件操作顺序保持原样；同步生成运行产物及声明，版本保留 **v0.2.0**，没有增加运行时依赖。
- 补充架构代码地图与维护边界，增加 `pnpm test`。新增 9 项提交批次回归测试；类型检查、构建及 **140 / 140** 项自动测试通过，0 失败、0 跳过。
- 对照原实现检查 hook/回调、事件归并、提交轨迹、词法 token 和初始渲染。浏览器实际组件验证八种范围 × 两种布局的 16 个选区菜单场景，以及键盘焦点、语言切换保留草稿、模拟批次答复、设置保存、隐藏行搜索和手册图片。800 行文件的统一/并排窗口与第 790 行定位正常；滚动离开后编辑器及未保存草稿仍保持挂载，控制台无新增错误或告警。
- 客户端 bundle 为 572,433 字节（gzip 127,101），整理前为 557,533 字节（gzip 122,576）；Host 为 52,302 字节（gzip 14,765），整理前为 48,849 字节（gzip 13,886）。本次目标是可读性，性能变化未另作基准测试。

上述界面验证使用模拟会话与服务；手册读取调用本次构建的 Host。未自动验收真实 Desktop 会话或真实模型答复。开发证据保存在忽略目录 `.cache/readability-20261003/` 与 `.cache/readability/`。

#### 2026-10-04：多仓库设置与解析流程可读性整理

- 多仓库设置页分离页面组合、展示组件、会话操作 hook 和纯数据转换。仓库行增删、路径规范化、目录选择及保存各有明确入口，重复的页面数据更新集中处理。
- Host 将 JSON、INI、`.gitmodules` 文本解析集中到 `repository-manifest`，工作区解析按工程规范化、候选收集、目录/Git 检查、根目录归并组织。保留原解析函数导出、清单限制与失败提示。
- 客户端路径解析明确区分 Windows 盘符、UNC 共享和 POSIX，使用具名条件表达父目录折叠、大小写比较及最具体仓库匹配。同步更新架构说明和 `lib/`，版本保留 **v0.2.0**。
- 新增 9 项回归测试，覆盖表单转换、临时外部仓库、跨盘符/UNC/POSIX 路径、清单上限与失败隔离，以及普通工程目录和文件形式的 `.git` 标记。类型检查、构建及 **149 / 149** 项自动测试通过，0 失败、0 跳过。
- 对照上一轮已提交实现，1,221 组路径/数据转换/清单解析结果一致；模拟 hook、目录选择和 Remote 服务，完成中英文及有/无配置状态下 72 个渲染与操作检查，覆盖编辑、删除确认、保存成功/失败、目录选择取消/无效路径、会话切换与迟到加载响应。该对照未运行真实 Desktop 宿主；证据保存在忽略目录 `.cache/readability-repositories-20261003/`。

#### 2026-10-04：审查范围与 Git 比较扩展入口

- 新增共享范围定义，统一八种范围的类型、菜单顺序、标签、数据来源、工作区能力及引用类型。评论身份与存储校验、Host 请求枚举使用同一来源；已有有效评论数据和范围 ID 保持兼容，非字符串的错误范围值会被拒绝。
- 会话筛选/分页和 Git 引用选择器使用有类型约束的处理表；Git 比较拆为独立处理函数，增加范围但遗漏处理逻辑时会产生编译错误。比较规划可注入命令执行函数，便于测试默认分支、根提交、缺少 HEAD 等路径。
- 补充架构中的扩展步骤，新增 12 项回归测试；类型检查、构建及 **161 / 161** 项自动测试通过，0 失败、0 跳过。同步更新 `lib/`，版本保留 **v0.2.0**，无新增运行时依赖。
- 对照原实现的 320 组 Git 比较结果、错误和命令顺序一致；页面 hook 顺序及 Git 请求/展开回调保持一致。使用内存中的临时范围定义验证编译器确实拒绝缺失处理函数，未向产品注册新范围。本轮未运行真实 Desktop 界面回归；开发证据位于忽略目录 `.cache/extensibility-20261004/`。

## v0.1.2

**搜索、差异块导航与语法高亮 / Search, navigation, and syntax highlighting**

### 中文

- 每个文件增加搜索工具条，支持大小写、整词、旧／新版本筛选、匹配计数与循环定位。
- 可以搜索已记录但折叠的代码；定位只展开命中附近的上下文，保留局部展开和收起。
- 增加上一处／下一处修改按钮和差异块选择框，定位时标示目标行。
- 增加 C/C++、JavaScript、TypeScript、**Python 3**、JSON、Markdown 基础语法高亮，跟随宿主深浅主题。未知语言及超过预算的内容使用纯文本。
- 支持差异区域内的 Ctrl/Cmd+F、Enter/F3、Shift+Enter/Shift+F3、Esc 与 Ctrl/Cmd+↑/↓；评论输入保留自身编辑行为。
- 共用于八种范围和统一／并排视图；实时中英文切换保留搜索、展开和评论草稿。
- 原始行号、评论引用、统计、撤销和精简差异复制继续使用原始数据。

### English

- Per-file literal search with match counts, case sensitivity, whole-word matching, before/after filtering, and cyclic navigation.
- Search folded recorded code and reveal only nearby context; existing expansion and collapse controls remain available.
- Previous/next change buttons and a change selector with a visible target-line indicator.
- Basic syntax highlighting for C/C++, JavaScript, TypeScript, **Python 3**, JSON, and Markdown, using host theme colors. Unknown languages and oversized content fall back to plain text.
- Scoped shortcuts: Ctrl/Cmd+F, Enter/F3, Shift+Enter/Shift+F3, Esc, and Ctrl/Cmd+↑/↓. Comment editors retain their editing behavior.
- All eight scopes and both layouts share these features. Live UI language and layout changes retain search, context, and comment drafts.
- Original data remains the source for line numbers, comment references, statistics, undo, and compact diff copying.

### 适配与安装 / Compatibility and installation

DeepSeek Harness Desktop **0.2.0-rc.2** + dsh-better-sidebar **0.24.1**。

安装资产 / Package: `dsh-file-review-tab-multi-git-repository-0.1.2.tgz`。

当前验证环境为 Windows；其他平台尚未验证。 / Verified on Windows; other platforms have not been tested.

搜索仅覆盖实际记录的代码，最多显示 10,000 个匹配。高亮是有限词法着色，超出预算保留纯文本；大量代码全部展开仍有渲染开销。

Search covers recorded code only, with up to 10,000 matches. Highlighting uses a limited lexer and falls back to plain text above its budget. Fully expanding large files still incurs rendering costs.

安装步骤见 [中文 README](../../README.md#安装) / [English README](../../README.en.md#installation)，验证详情见 [验证记录](#v012-验证记录)。

### v0.1.2 验证记录

日期：2026-10-03。环境：Windows、Node.js 24.19.0、项目锁定依赖。对照基线：v0.1.1 提交 `94c81a57f63ae09e59545e21296c3716f0b90802`。

#### 自动验证

- `tsc --noEmit`：通过。
- `tsc --emitDeclarationOnly --outDir lib/types` 和 `tsdown`：通过，运行文件及声明已同步。
- `node --test tests/*.test.mjs`：**100 / 100 通过**，0 失败、0 跳过，约 28.3 秒。
- 新增 16 项阅读模型测试：字面与 Unicode 搜索、大小写／整词、侧过滤、匹配上限、隐藏上下文定位、局部展开、导航循环、多片段重复行号、历史缺失、语言识别、多行词法状态、Python 3、预算降级、原始统计／复制／评论锚点保留。
- 原有 Git、路径边界、评论、确认、撤销、归档模型与 Desktop 适配测试继续通过。

#### 组件界面验证

通过本地浏览器预览挂载实际 `FileReviewTab`、`GitReviewPanel`、`UnifiedDiff`、设置及评论组件，模拟宿主 locale、会话快照和只读远端响应。

- 八种范围 × 统一／并排两种布局，搜索入口、导航及 Python 3 着色正常。
- 中文／英文、浅色／深色、360 px 窄容器；差异块宽度与滚动宽度相同，工具条换行。
- 隐藏上下文搜索后只增加附近 7 行；Enter／F3 循环、Esc 关闭、局部 Ctrl+F、Ctrl+↑／↓ 导航循环正常。
- 整词、大小写、旧版／新版筛选及零结果正确；布局切换保留当前匹配。
- 两个仓库的同名文件独立保存查询与目标行。
- 行评论草稿在布局及语言切换后保留；评论输入不触发修改块快捷键。
- `<script>` 字样以原始代码文本显示，差异区域没有生成脚本节点。

这是组件与模拟服务验证，没有通过自动化操作真实 Desktop 窗口；仍需在真实宿主重启加载后检查插件入口。未验证其他平台。

#### 大文件测量

浏览器挂载实际新旧组件，使用 20,000 行 Python 文件、两处相距较远的修改、自动换行和行评论。旧组件来自上述基线，使用当前共享模型；本样例未用新增区段，因此默认折叠／全部展开行流相同。依次通过实际展开按钮显示三个隐藏间隔，统计每次提交的 React Profiler 渲染时间与最终 DOM 数量。

| 布局／状态 | v0.1.1 渲染时间 | v0.1.2 渲染时间 | v0.1.1 DOM | v0.1.2 DOM |
| --- | ---: | ---: | ---: | ---: |
| 统一，初始折叠 | 42.4 ms | 60.0 ms | 169 | 180 |
| 统一，全部展开（三次渲染累计） | 3,103.2 ms | 3,196.7 ms | 120,069 | 120,080 |
| 并排，初始折叠 | 47.6 ms | 52.3 ms | 250 | 261 |
| 并排，全部展开（三次渲染累计） | 5,467.6 ms | 5,772.2 ms | 240,069 | 240,080 |

全部展开的交互总耗时（含浏览器布局、提交和两次动画帧等待）分别为：统一旧版 9,890 ms／新版 10,576 ms，并排旧版 16,561 ms／新版 17,794 ms。切换组件时还要卸载前一个大 DOM，因此初始折叠的端到端时间不用于比较。以上为单次本机样例，不是稳定性能保证。

此样例超过 500,000 字符预算，新版整体降级纯文本，因此不会为全部行增加语法跨度。另测纯模型，预热一次、执行十次，取中位数：

| 工作 | 5,000 行（132,809 字符） | 20,000 行（557,809 字符） |
| --- | ---: | ---: |
| 构造行模型 | 2.01 ms | 5.65 ms |
| 构造搜索／导航索引 | 0.55 ms | 2.68 ms |
| 高亮 | 11.79 ms，5,002 行 | 0.04 ms，纯文本降级 |
| 搜索 `needle` | 0.24 ms | 0.59 ms |
| 定位折叠行区段 | 0.01 ms | < 0.01 ms |

结论：默认折叠和局部搜索仍只挂载少量行；高亮预算可控制着色开销。全展开大文件的主要成本仍是每行及评论控件的大量 DOM，当前没有行虚拟化。后续性能工作应针对该成本设计并验证，不能把此次测量写成已经解决全部大文件性能问题。

## v0.1.1

### 更新内容

- 文件审查顶部增加「设置」按钮，位于差异布局选择框左侧。
- 设置弹窗可配置每次展开 N 行未修改代码，默认 20，支持正整数；保存后立即生效并在应用本地保留。
- 差异间隔增加向上、向下双箭头图标，一次展开相邻间隔内的全部未修改代码。首尾展开至记录边界，中间展开至相邻修改块。
- 每个已展开的间隔保留收起图标，支持部分展开和全部展开后的局部收起。
- 设置弹窗使用宿主实体背景色和备用色，避免背景透明导致文字与底层代码重叠。
- 插件界面跟随「通用设置 → 语言」实时切换中文和英文，覆盖审查页、仓库管理、设置弹窗、评论、对话审查行及已识别的错误说明，保留编辑和展开状态。
- 已打开和重新打开的原生侧栏「文件审查」标签标题同步切换语言，修正之前缓存中文标题的问题。
- 会话和 Git 范围、统一和并排视图共用上述功能；保留原有行号、评论定位、撤销数据和精简差异复制行为。

### 适配版本

- DeepSeek Harness Desktop **0.2.0-rc.2**
- dsh-better-sidebar **0.24.1**

### 安装资产

预构建安装包：`dsh-file-review-tab-multi-git-repository-0.1.1.tgz`。发布后可从 GitHub Release 的 Assets 下载；安装步骤见 [README](../../README.md#安装)，发布步骤见 [发布指南](../RELEASING.md)。

## v0.1.0

基于 [Lzh3070/dsh-file-review-tab](https://github.com/Lzh3070/dsh-file-review-tab) 扩展，面向一个工程维护多个 Git 代码仓的使用场景。

### 适配版本

- DeepSeek Harness Desktop **0.2.0-rc.2**
- dsh-better-sidebar **0.24.1**

### 主要功能

- 在会话顶部管理当前工程的多仓库列表，保存为 `dsh-file-review-repositories.json`。
- 工程内仓库使用相对路径；工程外仓库作为当前会话的临时绝对路径，不写入配置文件。
- 文件审查按仓库分组，支持文件列表折叠和局部/整轮差异内容展开。
- 提供上一轮、本会话、待确认及 Git 工作区、暂存区、提交、分支等审查范围。
- 支持整轮确认、满足条件的会话改动撤销/重做，以及修改意见发送到当前会话。
- 提供统一/并排差异布局、自动换行和每次展开 20 行未修改上下文。
- 保留对话尾部审查行及 PTC / Code Mode 嵌套文件改动捕获。
- 安装包包含架构与发布文档。

### 安装资产

下载 Assets 中的 `dsh-file-review-tab-multi-git-repository-0.1.0.tgz`；对应 `.sha256` 用于核对文件完整性。Desktop 和独立 Web 的安装步骤见 [README](../../README.md#安装)。

Desktop 原生目录选择器的起始路径适配需要单独运行包内兼容脚本，安装插件包不会自动修改宿主。操作步骤见 README。

本次发布准备复用已有 `lib` 产物，只执行打包及文档/包内容核对，没有重新执行插件编译或功能测试。

感谢直接上游 dsh-file-review-tab、原始 dsh-file-review 实现，以及 dsh-better-sidebar 提供的插件接口。
