# 整体架构与开发接入指南

当前新增目录能力见 [非 Git 目录架构与使用](REPOSITORY_MANAGER.md#配置与界面)。管理、发现与文件归属由共享插件提供，审查侧仅维护业务适配；以下既有链路继续沿用。

多仓库管理已迁移到独立的 **dsh-multi-git-repo-manager 0.1.4**。`apply` 注入 `multiGitRepoManagerByWqz`，`FileReviewService.workspace(agent)` 委托共享服务；管理 Remote、右侧原生管理 Tab 和「开始」页入口由新插件注册。审查宿主仅依赖 `ManagedWorkspaceReader` 的两个必需读取方法，源码直接导入管理包正式入口，管理转发文件已移除。本文后续的多仓库算法说明指新插件实现；新增或修改管理功能应在管理仓库完成。详见 [公共仓库管理依赖](REPOSITORY_MANAGER.md)。

本文面向首次接手工程的开发人员，说明当前实现的模块边界、数据流、状态存储和修改入口。功能使用说明见 [README](../README.md)。

文档基线：插件 `dsh-file-review-tab-multi-git-repository` **v0.3.5**；目标 DSH 正式接口 **>=0.2.0**，实测 RC **0.2.0-rc.2**，实际平台边界见 [验证记录](releases/version.md#v031)；文件审查直接接入原生右侧栏，第三方侧栏可选。本文按当前源码整理；宿主接口或数据模型变化时，应同步更新本文。目录名中的 `Multi` 大小写不等于 npm 包名，注册和发布时以 [package.json](../package.json) 中的名称为准。

阅读导航：先看 [运行架构](#2-运行架构与加载方式) 和 [代码地图](#3-代码地图)；接入功能开发看 [工作流程与修改入口](#10-新开发者的工作流程)；涉及仓库范围时先看 [配置生命周期](#5-管理契约与业务边界)。

## 1. 五分钟理解工程

这是一个运行在 DeepSeek Harness 内的插件，包含 Node.js Host 服务和浏览器 React 界面。它把会话中的文件工具改动，以及多个 Git 仓库的真实差异，统一放进「文件审查」侧栏，并提供工程级仓库配置、行评论和会话改动撤销。

文件审查入口由 [src/client/index.tsx](../src/client/index.tsx) 注册，管理页签由独立管理插件注册：

| 入口 | 组件 | 作用 |
| --- | --- | --- |
| 原生右侧栏「文件审查」Tab | [NativeReviewTab.tsx](../src/client/NativeReviewTab.tsx) → [FileReviewTab.tsx](../src/client/FileReviewTab.tsx) | 适配会话／可见性，选择范围、查看差异、确认轮次、撤销和提交意见 |
| 原生右侧「多代码仓管理」Tab | [RepositorySettings.tsx](https://github.com/wuqingzhong2020/dsh-multi-git-repo-manager/blob/main/src/client/RepositorySettings.tsx) | 从开始页打开，编辑当前工程的仓库列表，保存工程配置文件 |
| 对话轮次末尾的审查行 | [ProducedFiles.tsx](../src/client/ProducedFiles.tsx) | 展示工具改动摘要，撤销或定位到侧栏的文件差异 |
| 审查标题行的「操作指南」按钮 | [UserGuideTab.tsx](../src/client/UserGuideTab.tsx) | 打开安装包内的双语手册，预览截图并点击放大 |

理解工程时，先区分以下概念：

- **会话改动**来自工具执行记录，能够归属到某一轮对话；是否可以撤销取决于原始差异和当前磁盘内容。
- **Git 差异**来自实际工作区、暂存区和提交历史，也能看到终端、编辑器等产生的修改；这些范围在插件中只读。
- **确认当前范围文件**只是记录审查进度，不修改文件或 Git 状态。
- **提交修改意见**是把评论发送给当前会话的 Agent，不是 Git 提交，也不直接执行代码修改。
- **工程配置**描述该工程维护哪些仓库；**会话本地状态**描述某个会话的评论、确认和临时仓库，二者独立。

建议按以下顺序阅读源码：两个 `index` 入口 → 通信契约 → `FileReviewTab` 与 `FileReviewService` → 正在修改的功能模块。不要从生成的 `lib/client.js` 开始追踪业务。

## 2. 运行架构与加载方式

~~~mermaid
flowchart TB
  subgraph Desktop["DeepSeek Harness Desktop / Web 宿主"]
    subgraph Browser["浏览器界面"]
      Slots["sidebar.right.pane.tab / turnTail 插槽"]
      Sidebar["原生右侧栏"]
      UI["React 页面与差异渲染"]
      Snapshot["会话 Conversation snapshot"]
      Local["浏览器 localStorage"]
      Remote["Typert 客户端 remote.multiGitFileReviewByWqz"]
      Slots --> UI
      Sidebar --> UI
      Snapshot --> UI
      UI <--> Local
      UI <--> Remote
    end
    subgraph Host["Node.js Host"]
      Entry["src/index.ts：注册与嵌套工具监听"]
      Service["FileReviewService"]
      Workspace["multiGitRepoManagerByWqz：共享工程配置、路径与仓库解析"]
      Git["git-review.ts"]
      Entry --> Service
      Service --> Workspace
      Service --> Git
    end
    Remote <-->|"共享描述符与 Zod 校验"| Service
    Tools["宿主 tools/result"] --> Entry
    UI --> Picker["宿主原生目录选择桥"]
  end
  Workspace <--> Config["工程 JSON / Profile 索引"]
  Service <--> Files["受允许范围内的文本文件"]
  Git --> GitRepos["Git 工作区、暂存区、提交对象"]
~~~

### 2.1 Host 入口

[src/index.ts](../src/index.ts) 的 `apply` 注入共享 `multiGitRepoManagerByWqz`，创建 `FileReviewService`，注册文件引用的系统提示，并监听成功的嵌套 `tools/result`。

监听器按结果结构识别具有 `path / before / after` 的文件修改，只补录嵌套调用。普通工具调用已经有 Conversation 数据，不在这里重复记录。失败的工具结果不会进入记录。

### 2.2 浏览器入口

[src/client/index.tsx](../src/client/index.tsx) 负责：

1. 注册中英文文案。
2. 挂载 `TYPERT_REMOTE`。
3. 注册插件自己的 Conversation 数据定义和轮次尾部审查行。工程配置页由管理插件注册。
4. 委托 `native-sidebar.ts` 注册原生 `file-review` 类型、正文和标题插槽，键为插件 implementation id。
5. 注册无引导卡片的旧 `file-review-guide` 兼容页；日常操作指南由插件弹窗打开。

注册使用 `ctx.effect` 管理清理，供插件禁用和热重载使用。新增全局监听或宿主注册时，也需要提供对应的释放逻辑。

插件自己的审查行与宿主内置改动卡共存，使用独立的注册标识。不要通过关闭宿主原生 `deliverables` 或文件提及服务来实现扩展。

`attachLocale` 在 `ctx.effect` 中接入 `ctx.locale.getSnapshot/subscribe`，以宿主「通用设置 → 语言」的选择为准。`useReviewLocale` 让插件界面实时刷新文案，不重新挂载页面或清空编辑状态。服务替换、插件禁用及 HMR 都释放旧订阅；仅独立预览或测试未接入宿主时使用浏览器语言。已显示的通知保存词典键或原始错误信息，在渲染时翻译；Host 返回的差异、路径及状态契约保持原样。

原生标题插槽由 `NativeReviewTitle` 独立订阅宿主语言和会话快照，正文隐藏时仍同步标题与文件数角标。角标只统计未自动归档轮次的去重文件，按实际不可变快照缓存，不以节点数推断内容是否变化。原生 `keepMounted` 保留切换标签时的阅读和草稿状态，隐藏时暂停状态检查，关闭时卸载。注册单元在失败时逆序回滚；插件卸载释放类型、插槽及跳转 seed。

标题通过 `sessions.retainInfo(sessionId)` 观察既有会话绑定的代际变化，不为了显示角标主动加载历史或保留会话。正文读取 `useTabInfo()` 提供的可见性、取消信号及绑定当前窗格的导航动作；类型、正文和标题使用相同 implementation id，服务迟到时由 `slots.inject` 等待插槽声明。

原生主题背景使用宿主的 `--dsw-alias-bg-layer-1/2` 变量。仓库标题、评论卡片和选区菜单应使用这些真实令牌，避免旧变量在深色主题中退回白色。

### 2.3 包与构建边界

[package.json](../package.json)、[cordis.patch.yml](../cordis.patch.yml) 和 [tsdown.config.ts](../tsdown.config.ts) 共同决定加载方式：

| 包导出 | 源码入口 | 构建产物与用途 |
| --- | --- | --- |
| `.` | `src/index.ts` | `lib/index.js`，Host 插件 |
| `./client` | `src/client/index.tsx` | `lib/client.js`，浏览器贡献 |
| `./typert` | `src/typert.host.ts` | `lib/typert.host.js`，Host 通信模型 |
| `./remote` | `src/remote.ts` | `lib/remote.js`，远程贡献定义 |

Host 输出为 ESM，目标为 Node ES2024。浏览器代码输出为 CJS，再包装进宿主的 `window.__ModuleLoader__.load`；不是独立网页应用。React 由宿主提供，`diff`、`zod` 和官方 `dsh-util-workspace-path` 中实际使用的纯路径函数随浏览器产物打包。路径工具没有客户端入口，不作为宿主注入服务。

CSS Module 通过 lightningcss 转换为带哈希的类名，再注入具有 `data-plugin-css` 标识的 `style`，相同标识避免重复注入。界面使用宿主 `--dsw-alias-*` 主题变量和容器查询。修改布局优先在对应 `.module.css` 中进行，不给宿主页面添加全局样式。

## 3. 代码地图

| 模块 | 主要文件 | 职责 |
| --- | --- | --- |
| Host 调度 | [file-review-service.ts](../src/file-review-service.ts) | 远程方法编排、只读管理服务委托与审查证据缓存 |
| Host 文件能力 | [file-review-files.ts](../src/file-review-files.ts)、[file-review-locations.ts](../src/file-review-locations.ts)、[file-review-user-guide.ts](../src/file-review-user-guide.ts) | 路径验证与安全撤销/重做、磁盘引用与编辑器、安装目录手册装载 |
| 通信契约 | [change-types.ts](../src/change-types.ts)、[typert-descriptors.ts](../src/typert-descriptors.ts)、[typert.host.ts](../src/typert.host.ts)、[remote.ts](../src/remote.ts) | 请求结果类型、运行时校验、Host 模型和客户端类型注册 |
| Git 查询 | [git-review.ts](../src/git-review.ts)、[git-review-command.ts](../src/git-review-command.ts)、[git-review-parser.ts](../src/git-review-parser.ts) | 比较与仓库编排、受限命令执行、NUL 分隔输出与 patch 解析；契约位于 `git-review-types/schemas` |
| 审查范围定义 | [review-scopes.ts](../src/review-scopes.ts)、[review-scope-model.ts](../src/client/review-scope-model.ts) | 共享范围 ID、数据来源、标签与 Git 能力；客户端轮次筛选、分页规则及引用选择器 |
| 会话审查页面 | [FileReviewTab.tsx](../src/client/FileReviewTab.tsx)、[file-review-turn.tsx](../src/client/file-review-turn.tsx)、[file-review-model.ts](../src/client/file-review-model.ts) | 范围选择与页面组合、轮次/文件展示、共享身份及操作条件 |
| 会话审查生命周期 | [use-file-review-conversation.ts](../src/client/use-file-review-conversation.ts)、[use-file-review-archive.ts](../src/client/use-file-review-archive.ts)、[use-file-review-deep-link.ts](../src/client/use-file-review-deep-link.ts)、[use-file-review-actions.ts](../src/client/use-file-review-actions.ts) | 快照与补录、归档与迁移、深链与局部滚动、状态巡检与撤销/重做 |
| 会话数据归并 | [session-changes.ts](../src/client/session-changes.ts)、[mutation-call.ts](../src/client/mutation-call.ts)、[recorded-diffs.ts](../src/client/recorded-diffs.ts) | 工具结果解析、轮次归属、PTC 补录及归档 |
| 宿主快照适配 | [snapshot-compat.ts](../src/client/snapshot-compat.ts)、[turn-deliverables.ts](../src/client/turn-deliverables.ts)、[deleted-paths.ts](../src/client/deleted-paths.ts) | 快照形状适配、审查行数据、字面删除路径识别 |
| 对话审查行 | [ProducedFiles.tsx](../src/client/ProducedFiles.tsx)、[produced-files-summary.tsx](../src/client/produced-files-summary.tsx)、[produced-files-toast.tsx](../src/client/produced-files-toast.tsx) | 巡检与撤销流程、文件摘要与深链操作、带自动关闭的结果提示 |
| Git 页面与加载 | [GitReviewPanel.tsx](../src/client/GitReviewPanel.tsx)、[GitReviewFile.tsx](../src/client/GitReviewFile.tsx)、[git-review-diff-loader.ts](../src/client/git-review-diff-loader.ts) | 范围、仓库筛选与请求生命周期，文件行与差异展示，并发加载队列 |
| 仓库分组 | [ReviewRepositoryGroup.tsx](../src/client/ReviewRepositoryGroup.tsx)、[review-repository-groups.ts](../src/client/review-repository-groups.ts)、[repository-paths.ts](REPOSITORY_MANAGER.md#只读契约) | 文件所属仓库、组标题、列表折叠和批量内容展开 |
| 差异显示 | [UnifiedDiff.tsx](../src/client/UnifiedDiff.tsx)、[unified-diff-model.ts](../src/client/unified-diff-model.ts)、[diff-text.ts](../src/client/diff-text.ts) | 行模型、两种布局、上下文展开和复制 |
| 差异交互与展示 | [use-diff-selection.ts](../src/client/use-diff-selection.ts)、[unified-diff-controls.tsx](../src/client/unified-diff-controls.tsx)、[unified-diff-block.tsx](../src/client/unified-diff-block.tsx) | 选区/菜单生命周期与异步反馈、搜索导航控件、上下文与行窗口展示 |
| 差异阅读 | [diff-search.ts](../src/client/diff-search.ts)、[diff-navigation.ts](../src/client/diff-navigation.ts)、[diff-highlight.ts](../src/client/diff-highlight.ts)、[DiffCode.tsx](../src/client/DiffCode.tsx) | 原始行搜索、修改块索引、有限语言词法着色与匹配标记 |
| 评论界面与存储 | [ReviewComments.tsx](../src/client/ReviewComments.tsx)、[review-comment-context.ts](../src/client/review-comment-context.ts)、[review-comment-components.tsx](../src/client/review-comment-components.tsx)、[review-comments.ts](../src/client/review-comments.ts) | Provider 与工具条、会话草稿/讨论上下文、编辑与卡片展示、草稿模型 |
| 评论提交与答复 | [review-comment-submission.ts](../src/client/review-comment-submission.ts)、[review-comments-send.ts](../src/client/review-comments-send.ts)、[use-review-discussion-events.ts](../src/client/use-review-discussion-events.ts)、[review-discussion-events.ts](../src/client/review-discussion-events.ts) | 批次/父意见格式化、宿主发送、订阅和确认草稿、按请求与轮次归并事件 |
| 范围引用与外部定位 | [review-reference.ts](../src/client/review-reference.ts)、[review-file-opener.ts](../src/client/review-file-opener.ts)、[review-location.ts](../src/review-location.ts)、[editor-launch.ts](../src/editor-launch.ts) | 完整行范围、来源、磁盘唯一匹配、受限编辑器启动 |
| 讨论与大文件窗口 | [review-discussions.ts](../src/client/review-discussions.ts)、[VirtualDiffRows.tsx](../src/client/VirtualDiffRows.tsx)、[virtual-diff-model.ts](../src/client/virtual-diff-model.ts) | 持久化请求／轮次关联、已读／解决状态、可变高度渲染 |
| 确认与显示偏好 | [review-confirmations.ts](../src/client/review-confirmations.ts)、[DiffViewControls.tsx](../src/client/DiffViewControls.tsx)、[diff-view-preferences.ts](../src/client/diff-view-preferences.ts) | 整轮确认、统一/并排布局、自动换行及上下文展开行数设置 |
| 页面协调 | [deep-link.ts](../src/client/deep-link.ts)、[repository-events.ts](REPOSITORY_MANAGER.md#通知边界) | 深链定位和配置变化通知 |
| 文案 | [locales.ts](../src/client/locales.ts)、[chat-locales.ts](../src/client/chat-locales.ts)、[use-review-locale.ts](../src/client/use-review-locale.ts)、[message-locales.ts](../src/client/message-locales.ts) | 中英文词典、宿主语言订阅、界面实时刷新及已识别的错误说明翻译 |
| Desktop 兼容适配 | [patch-desktop-directory-picker.mjs](../scripts/patch-desktop-directory-picker.mjs) | 为特定 Desktop 构建的目录选择桥增加起始目录参数 |

### 3.1 维护模块边界

页面负责组合状态和展示；独立的订阅、请求和存储生命周期放在具名 hook 中。`FileReviewTab` 的四个 hook 按快照、归档、深链、操作组织，保持原有依赖和清理顺序；阅读撤销流程从 `use-file-review-actions` 进入，阅读归档定位从 `use-file-review-deep-link` 进入。

`UnifiedDiff` 继续集中管理相互依赖的搜索、修改导航和上下文曝光。选区与菜单由 `use-diff-selection` 管理，展示组件接受模型和回调。不要在展示组件中重新创建行身份，或把搜索索引改为可见 DOM 的索引。

评论沿「草稿存储 → 提交批次 → 宿主发送 → 事件关联 → 草稿确认」追踪。`review-discussion-events` 是纯事件归并；`review-discussions` 负责持久化和状态发布；`use-review-discussion-events` 负责订阅与清理。组件不直接推测答复归属。标签映射集中在 `review-comment-labels`，避免提交文字和界面使用不同范围名称。

Host 的 `FileReviewService` 保留公开服务边界，文件验证/变换、引用定位和手册装载由私有模块实现。`transformFile` 仍通过原服务模块再导出；编辑器启动的再次验证仍调用服务的 `this.locateReference`。修改私有模块时也要核对原调用顺序、错误文字和路径边界。

多仓库设置页沿「`RepositorySettings` 页面 → `use-repository-settings` 操作 → `repository-settings-model` 数据转换 → Host」阅读。展示组件只接收数据与回调，表单状态和请求版本留在同一个 hook；保存仍依次写入工程配置、更新临时仓库、重新读取页面。数据转换函数不读写磁盘，便于单独验证空白行过滤、路径规范化与临时仓库去重。

`repository-workspace` 按规范化工程、收集候选、检查仓库、归并根目录的顺序组织。`repository-manifest` 只负责文本格式；清单大小限制、读取失败警告和实际目录检查仍属于工作区解析。客户端路径用于显示与编辑，Host 的真实路径校验仍是授权范围的依据。

职责拆分应让一个模块能独立说明用途；不为每个短函数新增文件。已足够清晰的协议与快照模型保持现有结构。新增具名函数优先解释业务条件、异步身份和失败语义，注释解释约束，不重复描述代码。

### 3.2 扩展审查范围

[review-scopes.ts](../src/review-scopes.ts) 是范围 ID 和公共能力的定义入口。`ReviewMode`、`SessionReviewMode`、`GitReviewMode` 从定义推导；下拉菜单按定义顺序展示，评论标签和存储校验、Git 请求的 Zod 枚举使用同一来源。已保存的评论与引用包含范围 ID，扩展时保留现有 ID 和含义。

新增范围按以下顺序实现：

1. 在 `REVIEW_SCOPES` 登记 ID、标签键与 `source`，在中英文词典中补齐对应标签。Git 范围还需说明 `reference` 类型和是否读取工作区。
2. 对会话范围，在 `review-scope-model` 的 `SESSION_SCOPE_BEHAVIORS` 中提供轮次筛选、分页方式和空状态文案。页面、归档 hook 和评论身份识别会使用共享定义。
3. 对 Git 范围，在 `git-review-command` 的 `COMPARISON_RESOLVERS` 中实现比较参数和说明。若需要新的引用类型，再扩展 `REFERENCE_SELECTORS` 与对应元数据契约；复用提交或分支引用时无需重复修改 JSX 分支。
4. 检查新比较是否需要特殊文件收集规则，补充真实 Git 仓库测试、范围行为测试，以及中文/英文说明。`uncommitted` 在没有 HEAD 时合并暂存区与磁盘内容的处理仍明确保留在 `git-review` 中。

处理表使用 `satisfies Record<…>` 检查覆盖情况：增加范围后未提供对应会话行为或 Git 比较函数会产生编译错误。`workingTree` 驱动未跟踪文件纳入及新版意见的定位复核；文件写入权限、真实路径检查与撤销条件仍由各自的 Host 接口负责。

`resolveGitComparison` 和 `resolveDefaultBranchRequest` 支持传入 `ReviewGitRunner`，用于单独验证比较策略的命令参数、失败分支和默认分支优先级。生产调用使用默认的 `runReviewGit`，继续保留参数数组、超时、输出大小及只读环境设置。

## 4. 两条差异数据链路

### 4.1 会话工具改动

~~~mermaid
flowchart LR
  S["uiConversation 的会话快照"] --> N["snapshot-compat 标准化"]
  N --> D["session-changes 解析并归属轮次"]
  H["Host 嵌套工具 before/after 记录"] --> R["recorded RPC"]
  R --> P["recorded-diffs 重建差异"]
  P --> D
  D --> F["会话范围过滤与仓库分组"]
  F --> U["UnifiedDiff 展示"]
  F --> A["status / apply 检查与撤销"]
~~~

`FileReviewTab` 订阅 `ctx.uiConversation.binding(sessionId).snapshot`，通过 `useSyncExternalStore` 响应变化。`sessions` 中的生命周期快照不能替代 Conversation 快照。

标准工具记录经 `mutation-call`、`session-changes` 提取文件差异，并按序号与 `turnEnds` 归属到轮次；同一轮对同一路径的多次修改保留顺序。终端删除通过 `deleted-paths` 解析可确定的字面路径，只有删除标记，没有可还原的内容。通配符和命令替换不会被推测成文件列表。

PTC / Code Mode 的嵌套文件改动如果缺少可用的子调用差异，则按 `rootCallId` 请求 Host 补录。Host 保存完整 `before / after`，客户端重建差异并合并到所属轮次；已有可用子调用差异时避免重复计入。

这里有两份用途不同的数据：

- `diffs`：用于 `status / apply` 的原始差异块，是撤销依据。
- `reviewDiffs`：有完整记录时提供更丰富的显示上下文；渲染优先使用 `reviewDiffs ?? diffs`。

**不要把展开上下文后的显示数据替换为撤销请求数据。** 标准工具的历史记录如果缺少全文，界面只能提示缺失；不能读当前磁盘文件来伪造历史上下文。

「上一轮」严格选择最近的轮次，最近一轮没有文件改动就显示为空，不回退到之前有修改的轮次。对话尾部审查行主要使用标准 Conversation 数据；侧栏另有 Host 补录能力，两个入口的数据覆盖范围并不完全相同。

### 4.2 Git 实际状态

`GitReviewPanel` 先调用 `gitReview` 获取各仓库的比较信息、文件元数据和警告，再在展开文件内容时调用 `gitReviewDiff`。列表不需要预先加载所有文件的正文。

Host 的 `git-review.ts` 使用 `execFile('git', args)` 参数数组调用 Git，解析 `-z` 输出，处理带空格等字符的路径以及重命名。禁用外部 diff 和 textconv，不执行暂存、提交或切换分支。

单文件请求重新验证仓库属于当前工作区、路径合法且仍在该比较的改动列表中。Git 比较返回实际版本的上下文，包括历史提交对应的代码；客户端再决定默认折叠哪些未修改行。

`git-review-diff-loader` 对已排队和进行中的请求去重，最多同时加载 4 个文件。切换模式、仓库、比较引用或刷新后，通过请求版本标识忽略旧结果；批量展开复用这条加载链路。

### 4.3 审查范围与能力

| 界面范围 / 内部值 | 差异来源或比较 | 修改意见 | 文件撤销/重做 | 整轮确认 |
| --- | --- | --- | --- | --- |
| 上一轮 / `last-turn` | 最近一轮工具改动 | 支持 | 原始差异满足条件时支持 | 已完成且有改动的轮次 |
| 本会话 / `session` | 会话各轮工具改动 | 支持 | 同上 | 同上 |
| 待确认 / `pending` | 未确认的会话改动轮次 | 支持 | 同上 | 同上 |
| 未提交 / `uncommitted` | HEAD → 工作区，含未跟踪文件 | 支持 | 不提供 | 不提供 |
| 未暂存 / `unstaged` | 暂存区 → 工作区，含未跟踪文件 | 支持 | 不提供 | 不提供 |
| 已暂存 / `staged` | HEAD → 暂存区 | 不提供 | 不提供 | 不提供 |
| 已提交 / `commit` | 所选提交第一父提交 → 所选提交；根提交用空树 | 不提供 | 不提供 | 不提供 |
| 分支 / `branch` | 所选分支与 HEAD 的共同祖先 → HEAD | 不提供 | 不提供 | 不提供 |

全部仓库查看「已提交」时，各仓库默认比较自己的 HEAD；选定单个仓库后可选最近 50 次提交。「分支」比较已提交内容，不包含工作区修改。

## 5. 管理契约与业务边界

管理插件统一维护 v2 `dsh-file-review-repositories.json`、Profile 根目录索引、`ManagedProject`、`ManagedWorkspace` 及文件归属；本仓库不解析或保存管理配置。完整接入与通知边界见 [公共管理依赖](REPOSITORY_MANAGER.md)。

`FileReviewService` 依赖管理包 `/types` 的 `ManagedWorkspaceReader`，必需方法为 `workspace(agent)` 与 `resolveTargetPaths(agent, paths)`。`targets`、`boundaries`、`workspaceRevision` 都是必需字段，缺少归属结果不能以 `roots` 兜底。

审查业务定义自己的八种范围、目标筛选与操作条件。Git 批量读取可以复用同次管理快照的纯归属算法；捕获、撤销/重做、文件定位通过当前 Agent 服务重新核对归属。managed 只表示纳管，可信证据、当前内容、权限和维护锁继续属于审查安全条件。

普通目录只承载已经捕获的会话改动，没有 Git 比较能力或自动手工差异基线。管理目标改名、类型转换及移除不能改写审查记录、评论和确认身份。工程外目标仅由管理服务按 Agent + 工程身份保存，使用 `setTemporaryTargets`；重启、释放或工程切换后按生命周期清理。

## 6. Host / Client 通信契约

审查通信命名空间为 `multiGitFileReviewByWqz`，管理通信命名空间为 `multiGitRepoManagerByWqz`，均以 Agent 为作用域。Host 从宿主查找 Agent，并使用 `agent.session.header.cwd` 作为权威会话目录，不能信任浏览器传入一个根目录就扩大文件操作范围。

契约分为三层：

- [typert-descriptors.ts](../src/typert-descriptors.ts)：共享调用描述符、作用域和严格 Zod 编解码。
- [typert.host.ts](../src/typert.host.ts)：Host 的 Typert 模型。
- [remote.ts](../src/remote.ts)：浏览器远程贡献及 TypeScript 服务类型扩展。

| 方法 | 用途 | 副作用 |
| --- | --- | --- |
| `multiGitRepoManagerByWqz.project()` | 读取当前工程的管理页数据、配置存在状态与修订值 | 读取 |
| `multiGitRepoManagerByWqz.workspace()` | 获取当前会话有效仓库和允许的文件根目录 | 读取 |
| `multiGitRepoManagerByWqz.saveProject(request)` | 保存工程配置并返回管理页数据 | 写工程 JSON、更新 Profile 索引 |
| `multiGitRepoManagerByWqz.setTemporaryRepositories(entries)` | 设置当前会话的临时外部仓库 | 更新 Host 内存 |
| `multiGitRepoManagerByWqz.directoryStart(path)` | 解析目录选择器起始目录 | 读取 |
| `userGuide(language)` | 按 `zh` / `en` 返回插件安装目录中的使用手册绝对路径 | 读取插件文件；不依赖会话工程目录 |
| `userGuideDocument(language)` | 返回固定语言手册的 Markdown 与 12 张随包截图的 JPEG data URL | 只读取固定文档和图片白名单；不接受调用方文件路径 |
| `gitReview(request)` | 查询仓库、比较引用及改动文件列表 | 读取 Git |
| `gitReviewDiff(request)` | 查询一个文件的具体差异 | 读取 Git/工作区 |
| `recorded(request)` | 获取可信标准／PTC 记录、兼容补录及截断提示 | 重放官方会话日志与有界缓存 |
| `status(request)` | 检查原始差异与当前文件的关系 | 读取文件 |
| `apply(request)` | 安全撤销或重新应用差异 | 写文件 |
| `locateReference(request)` | 核对当前磁盘引用位置 | 读取，结果含原位置／移动／歧义／失配 |
| `openEditor(request)` | 再次校验后向 VS Code 兼容程序传递文件与行号 | 启动外部编辑器，不写工程文件 |

客户端先获取 `sessions.scope(sessionId)`，审查功能用 `scope.get('remote.multiGitFileReviewByWqz')`，管理与工作区功能用 `scope.get('remote.multiGitRepoManagerByWqz')` 获取动态服务。响应为 `RemoteResult`：先检查 `ok`，失败读取 `error.message`，成功读取 `value`。异步挂载未完成或插件服务缺失时必须提供可见错误，不能在组件渲染期间无条件访问会抛异常的动态服务 getter。

文件审查标题行的「操作指南」打开 [UserGuideTab.tsx](../src/client/UserGuideTab.tsx) 中的宿主 Modal 弹窗。[UserGuideContent.tsx](../src/client/UserGuideContent.tsx) 通过 Agent 作用域 `userGuideDocument(language)` 读取手册和截图，保留宿主 Markdown 排版、图片放大、刷新、焦点返回及 Esc。语言变化重载正文，关闭或来源 Tab 隐藏时卸载文档与图片层，旧请求不写回。旧保存布局的 `file-review-guide` 兼容页只提供打开同一弹窗和关闭自身，不再出现在引导页；Host 的旧路径 RPC 保留兼容。

Host 相对自身模块定位随包安装的 `docs/USER_GUIDE.md` / `docs/USER_GUIDE.en.md`，只接受两种语言值和 18 张固定命名的 JPEG 截图；不会把当前工程里的同名文件当作插件手册。截图转换为 data URL，经 `pathImages` / `fileImages` 的显式图片解析器交给宿主渲染，避免 Desktop 的 `dsh-app://` 地址被普通 Markdown 图片协议白名单拒绝。RPC 对内容长度、图片键和媒体类型作校验，不接受调用方的任意本地路径；图片数据只保留在弹窗内存中，不写入布局持久化元数据。未新增 Markdown 渲染运行时依赖；差异视图保持原有代码展示方式。

官方 Markdown 不支持片段导航。指南头部的章节选择框从实际渲染的编号 h2 标题提取选项，按标题定位且只滚动当前文档容器；不解析示例代码或替换宿主 Markdown／图片组件。

新增远程方法时，应同时修改领域类型、Zod schema、描述符、Host 方法、`remote.ts` 类型扩展和调用页面。仅给 service 增加一个方法不会自动使它成为可调用 RPC。

## 7. 差异渲染、折叠与评论定位

### 7.1 统一行模型与两种布局

`ProducedFileDiff` 描述一个差异块：路径、旧/新文本、可选旧/新起始行。`oldText: null` 表示原先不存在的文件，与空字符串不同。

`unified-diff-model.ts` 生成具有旧/新行号、增删/上下文类型以及折叠间隔的模型。`UnifiedDiff` 用同一模型渲染两种布局：

- **统一**：删除与新增按行上下排列，显示新旧两列行号。
- **并排**：左旧右新；替换行对齐，数量不等时以空单元格补齐。换行后的两侧行高同步。

默认显示改动附近 3 行上下文。顶部「设置」弹窗可配置每次展开的行数 N（正整数，默认 20），保存在 `diff-view` 偏好的 `contextExpansionLines` 字段；旧偏好缺少此字段时自动使用默认值。首尾间隔每次向外展开 N 行，中间间隔从两端分别展开 ceil(N/2) 和 floor(N/2) 行。向上、向下双箭头可一次展开相邻间隔的全部剩余代码，首尾展开至记录边界，中间展开至相邻修改块。渲染调用 `visibleHunkRows` 时保留已全部展开间隔的空标记，以继续显示局部收起图标；收起只删除该间隔的展开状态。设置弹窗使用宿主真实的 `--dsw-alias-bg-base` 实体背景色，并提供白色备用值。布局、换行和上下文展开都不修改实际差异内容；复制差异仍输出精简的 3 行上下文。

完整文本来源只可能是原始历史记录、Host 保存的 before/after 或 Git 的实际比较。缺失历史正文不允许通过读取当前文件补齐。

### 7.2 文件列表与文件内容分别控制

界面层级是「轮次 → 仓库 → 文件 → 差异内容」（Git 范围没有轮次层）。当前交互语义如下：

| 操作 | 影响 |
| --- | --- |
| 仓库名称或左侧箭头 | 隐藏/显示该仓库的文件列表 |
| 单文件左侧箭头 | 展开/收起该文件的差异内容 |
| 仓库标题旁内容图标 | 展开/收起该仓库全部文件的差异内容 |
| 轮次标题旁内容图标 | 展开/收起当前轮次、当前筛选范围的全部文件内容 |
| Git 文件数标题旁内容图标 | 展开/收起当前 Git 结果的全部文件内容 |

批量收起内容后仍保留文件名。部分文件已经展开时，第一次点击展开剩余内容；全部展开后再次点击才全部收起。展开内容会同时显露对应仓库列表，避免内容处于隐藏父组中。

分组和文件键包含会话、轮次/范围与仓库身份；作用域操作只修改目标键集合。不要把一个仓库的操作实现为清空整个 Tab 的展开状态。

### 7.3 评论与提交

`ReviewCommentAnchor` 包含仓库身份、文件绝对路径、范围/轮次、比较引用 `ref`、旧/新侧、起止行、引用代码、差异修订及片段来源 `sourceKey`。删除行引用旧版行号，新增行引用新版行号；并排上下文行按实际点击的一侧定位。单行旧草稿的可选新增字段自动兼容。`rangeReference` 只选择同一片段中同一侧连续的实际行，引用及相邻上下文各限 UTF-8 64 KiB；不把可视索引当作真实行号。

「上一轮」「本会话」「待确认」同一轮共用评论身份，不能因为切换筛选重复生成一套评论。差异变动后旧评论保留原引用，并显示修订不匹配提示，不自动挪到其他行。整文件评论不依赖具体行。

`ReviewCommentStore` 按会话保存草稿，单条文字上限为 6000 字符。启用讨论时，`review-comments-send.ts` 通过宿主公开 `beginSubmission` 取得请求身份，在调用 `prompt(..., 'queue', ..., requestId)` 前保存批次；缺少此能力时退回会话的 `conversation.send`，明确显示不能关联答复。关闭讨论时继续沿用原发送入口。两种方式都不覆盖输入草稿。发送期间防止重复提交；成功或明确入队后只清除已接受草稿，迟到的确认按 ID、文字及锚点核对，不清除后来改写的草稿。

`ReviewDiscussionStore` 与草稿分别持久化。订阅该会话 binding 的 `eventSource`，从 `user/message.source.rpcId` 查实际入轮，再读取相同轮次且在用户消息之后的 `assistant/message` 文字内容。`agent/inbox/spliced` 用于排队／取消，`turn/end` 用于结束状态；不读取推理或工具结果，也不猜测最后一条 Agent 消息的归属。多条评论一批发送，共享批次答复，解决状态由用户手动记录。追加意见保留父批次上下文及链接，生成新的提交请求。

重启时未完成提交标为待核对，不自动重发；已建立的请求／轮次身份及已收到回复在历史窗口截断后仍保留。八种审查范围都可评论，Git 范围仍不新增文件写入。过期草稿仅在当前工作区新版提供显式重定位：Host 引用唯一匹配且加载中的差异模型也匹配，用户确认后更新；历史和已提交锚点保持原文。

### 7.4 搜索、导航与语法高亮

`diff-navigation.ts` 在原始行模型上生成 `(hunkIndex, lineIndex)` 定位，避免同一文件多次编辑产生重复行号时串位置。文件组件的来源键包含会话、仓库、文件及轮次／Git 比较基线，再组合差异修订标识；搜索位置及上下文展开不会沿用到另一来源。相距超过两侧默认上下文长度的修改分成独立导航块。

`diff-search.ts` 按字面匹配 Unicode 文本，支持大小写、整词与旧／新侧过滤；共有上下文只计一次，删除行属于旧侧。每次最多返回 10,000 个匹配。搜索可访问折叠行，但不访问缺失的历史代码。定位只在原间隔增加命中附近的小范围 `revealed` 区段，`visibleHunkRows` 合并区段并保留原始行对象，局部展开和收起继续使用原间隔身份。

快捷键绑定在差异组件内：默认 Ctrl/Cmd+F、Enter/F3、Shift+Enter/Shift+F3、Esc、Ctrl/Cmd+↑/↓。设置可改搜索为 Ctrl/Cmd+Shift+F 或 Ctrl/Cmd+Alt+F、改导航为 Alt+↑/↓；不注册系统全局快捷键。除搜索框外的输入控件不处理这些快捷键。语言和布局切换不重建搜索选择或评论草稿；新查询、筛选或修订变化重新定位到第一处匹配。关闭搜索去除其临时定位窗口，手动展开仍保留。

宿主当前公开渲染接口未提供可直接复用的高亮服务，因此 `diff-highlight.ts` 使用有限词法着色，不增加高亮依赖。支持 C/C++、JS、TS、Python 3、JSON、Markdown；旧／新侧分别维护多行注释和字符串状态。状态只能从已记录片段开头推导，未知片段前的语法状态不可恢复。`DiffCode` 用 React 文本节点和范围跨度着色，不注入 HTML，不修改源文本；主题颜色在 CSS 中跟随宿主变量，高亮缓存不因主题变更重新计算。

单行超过 16,000 字符或片段超过当前组件剩余的 500,000 字符预算时降级纯文本；未知语言同样降级。预算只限制着色，不截断内容、搜索、行号和评论。Markdown 为源码着色，不渲染文档预览。词级 diff 与语言全量包不属于当前实现。

### 7.5 外部定位、外观与可变高度虚拟化

`review-location.ts` 对完整版本一致的引用使用原位置，其他引用只接受全文中的唯一引用及相邻上下文匹配；移动与歧义分开返回。`FileReviewService` 使用当前会话权威根目录和真实路径，拒绝越界、符号链接、非普通／非 UTF-8／二进制及超过 16 MiB 的文件。外部启动前再次检查内容。旧侧不会把历史行号传给当前文件，新侧的历史比较也必须核对磁盘，位置移动必须有显式确认。

`editor-launch.ts` 自动探测推荐的 VS Code，或接受「外部 IDE」设置中的绝对 `Code.exe`／`Antigravity IDE.exe` 路径（Windows）。通过 `spawn(executable, ['--reuse-window', '--goto', 'file:line:1'])`、独立参数和 `shell:false` 启动；其他 IDE 需适配其行定位参数。OS 接受进程不是 GUI 光标／焦点确认；内置文件预览始终保留作为回退。

选区操作由 `UnifiedDiff` 的代码／行号右键菜单提供，复用宿主 `Menu`／`MenuItemButton` 并通过 portal 避免被差异列表裁切。`review-context-selection.ts` 保证范围内右键保留原范围，范围外、另一侧、另一片段或修订右键改为单行引用。键盘菜单键或 Shift+F10 可从行号打开；移动列表、切换布局、变更修订时关闭。复制与外部定位反馈在菜单内显示；异步结果须匹配请求时的引用身份。

`diff-view-preferences.ts` 迁移旧偏好并校验字体预设、字号 10–24、行高 1.2–2.5、Tab 宽度 1–8、配色和背景强度 5–40%。字体使用本机字体并提供系统等宽回退，不打包字体文件。设置弹窗具有实体主题背景、滚动正文和固定操作栏。

`VirtualDiffRows` 对单个可见块超过 400 行时启用内部滚动窗口，使用实际测量高度构造前缀偏移及 250 px 预渲染范围。每个并排行对是同一个测量单位；换行和完整评论卡片纳入高度。编辑行即使离开窗口也保留挂载，避免失去光标及草稿。搜索／修改导航先展开必要区段，再按同一行索引定位窗口。布局、正文和外观变化重置高度缓存；设置可恢复全部行挂载。原始行模型、搜索、统计、复制及撤销数据不虚拟化。

## 8. 状态存储与生命周期

| 数据 | 存储位置 | 隔离与生命周期 |
| --- | --- | --- |
| 工程仓库配置 | 工程根目录 JSON | 可随 Git 维护；不同工程独立；不写外部临时仓库 |
| 工程根目录索引 | 管理插件 Profile 设置 | 仅定位 v2 项目文件，不替代项目 JSON 的存在/启用判断 |
| 可信标准／PTC 文件图像 | 官方 tool/result 与 tool/ptc-dispatch | 会话/root/sub-call 校验；最近 4000 条、16 MiB，超限说明 |
| 旧 PTC 兼容补录 | Host recordLog | 最多 4000 条；重载后丢失，不授权新建文件删除 |
| 临时外部仓库 | Host `temporaryRepositories` | 当前 Agent/会话内有效，Host 重启后丢失 |
| 评论草稿 | localStorage 的 `…:comments:<sessionId>` | 按会话持久化 |
| 已提交意见／讨论 | localStorage 的 `…:discussions:<sessionId>` | 按会话保存请求／轮次、答复、已读／解决状态 |
| 轮次确认 | localStorage 的 `…:confirmations:<sessionId>` | 按会话持久化 |
| 归档展开状态 | localStorage 的 `…:archive:<sessionId>` | 按会话持久化，兼容旧前缀迁移 |
| 布局、换行、Dock／adaptive／foldMessages | 本插件 Profile reviewSettings | 官方权威值；无损迁移缺少的便携字段，本地降级 |
| 上下文、外观、编辑器路径、快捷键与讨论／虚拟化 | localStorage 的 `…:diff-view` | 本机偏好，不上传到 Profile |
| 文件内容、仓库列表、上下文展开 | React/组件内存 | 页面状态，不写工程 JSON |
| 搜索条件、匹配位置、修改块选择 | `UnifiedDiff` 内存 | 来源／修订隔离，不持久化；布局与语言切换保留 |
| Git 文件差异缓存 | `GitReviewPanel` 内存 | 模式/引用/刷新等变化时失效 |
| 审查深链目标 | `deep-link.ts` 模块内存 | 按会话保存最新目标，带 nonce 支持重复点击 |

表中的 `…` 为 `dsh-file-review-tab-multi-git-repository`。localStorage 不是工程配置的一部分，也不是跨设备同步数据；不可用时退回内存，评论和确认页面会提示持久化失败。

确认记录使用整轮文件差异的修订标识。只能确认已完成且有改动的轮次；该轮后续补录或改变差异，修订标识变化后自动重新进入「待确认」。撤销、Git 状态与确认记录分别处理。

客户端直接订阅管理包 `/events` 通知通道，在独立浏览器 bundle 间共享，不是跨进程文件监听器；手工修改 JSON 后通过「重新加载已保存配置」读取。`deep-link.ts` 按会话保存最新跳转目标，以 nonce 区分重复点击，完成滚动后消费；定位归档轮次时自动打开归档并加载所需页。`sidebar-navigation.ts` 检查顶层控制器的当前会话，审查正文则通过自己的 `tab.actions.openResource` 打开文件；统一导航 Provider 供文件头和选区菜单使用，避免异步操作误打开到其他会话。

## 9. 文件写入边界与性能约束

### 9.1 撤销/重做的安全边界

`FileReviewService.apply` 在 `agent.runMaintenance` 中执行，避免与 Agent 的正常执行交错。每个文件独立返回 `applied / undone / conflict / unsupported / error` 及 `changed`，整轮操作不是全有或全无事务。

文件操作依次检查：

1. 将路径解析到会话和当前有效工作区，校验真实路径属于允许的根目录。
2. 拒绝符号链接文件、非普通文件以及无法按 UTF-8 无损处理的内容。
3. 用原始差异匹配当前文本；撤销逆序处理同文件差异块，重做顺序处理。
4. 有行号时按预期位置匹配；无行号时要求文本唯一匹配，不做模糊猜测。
5. 写入前重新读取核对内容，冲突时跳过；采用原子写入并保留权限和换行风格。

仅有 `oldText: null` 的旧记录、终端删除标记、缺少足够差异或冲突文件不能直接恢复。v0.3.1 只有完整 Host 生命周期才支持新建删除／重建，且每次重新授权与核对身份。不扩大根目录或添加模糊匹配。写前核对是乐观保护，不能描述成覆盖所有外部编辑竞争的文件系统事务。

### 9.2 当前性能策略与限制

- 不可见的侧栏暂停状态巡检；状态检查约 300 ms 防抖，PTC 补录约 200 ms 防抖。
- 普通会话主列表保留最近 5 轮及进行中的轮次；归档折叠时不渲染正文，展开每页 10 轮。「待确认」单独每页 10 轮加载，不隐藏到归档折叠区。
- 会话差异正文通过 IntersectionObserver 懒挂载；角标按快照结构指纹缓存，只统计标准快照主列表中的不同文件，不代表全部归档或 PTC 补录数量。
- Git 仓库查询分批执行；正文按需加载，每批最多 4 个并发文件请求。
- Git 命令超时为 15 秒，输出缓冲上限为 2 MiB；单仓库最多审查 1000 个文件。过大的正文/输出返回说明或错误，不保证无限规模。
- 未跟踪文件如果是符号链接、二进制、非 UTF-8 或超过 2 MiB，不渲染文本差异。
- 工程配置最大 1 MiB，最多 512 条仓库记录，配置文件必须是普通文件。
- 搜索索引与语法 token 按差异模型缓存；命中折叠区域只增加附近行的 DOM。高亮有字符预算，搜索有匹配数量上限。
- 超过 400 行的可见块默认可变高度虚拟化，较小块完整挂载。v0.2.0 的 [验证记录](releases/version.md#v020-验证记录) 给出与 v0.1.2 的组件预览测量；不能代替实际 Desktop 或跨平台性能验收。

修改这些限制时，要同时考虑 Host 负载、浏览器渲染和 RPC 数据量，而不只增加一个常量。

## 10. 新开发者的工作流程

### 10.1 准备环境

在工程根目录使用 PowerShell。当前本地开发环境为 Node.js 24、pnpm 11；测试文件会直接导入 `.ts`，因此 Node 需要支持相应的 TypeScript 执行能力。依赖版本和脚本以 `package.json`、`pnpm-lock.yaml` 为准。

以下命令供后续功能开发使用；**仅补充文档时不需要编译或测试插件**：

~~~powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
~~~

`typecheck` 只检查类型；`build` 先生成声明，再打包 Host/Client。TypeScript 开启严格检查，包括 `noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`，新增数据字段要明确可选和空值语义。

`src/` 是修改入口，`lib/` 是受版本控制的生成产物。功能代码变动需要构建同步产物，不手工修改 bundle；文档变动不需要同步 `lib/`。

### 10.2 验证能力与当前仓库情况

本地 `tests/` 使用 Node test runner 和临时 Git 仓库，覆盖仓库配置/路径、目录选择桥、Git 比较、差异模型、评论、确认及分组作用域。`repository-settings-model.test.mjs` 专门验证表单数据转换和外部路径规则；`repository-workspace.test.mjs` 包含清单限制、失败后继续读取其他清单及工作区根目录规则。`review-scopes.test.mjs` 验证范围、协议、评论身份和界面选项的一致性；`git-review-comparison.test.mjs` 用注入的命令执行函数覆盖比较参数与失败路径，真实 Git 行为继续由 `git-review.test.mjs` 验证。`pnpm test` 执行同一套测试；部分集成测试读取 `lib/index.js`，源码重构后先构建再测试。

`tests/` 不再被 [.gitignore](../.gitignore) 忽略，应与源码一并提交。已有本地测试文件在移除忽略规则后会显示为未跟踪；提交并推送后，其他开发人员才能在克隆中获得它们。测试创建的临时仓库位于系统临时目录，`coverage/` 等生成报告继续忽略。接手时应确认测试文件齐全，不能把「没有测试文件」当成测试通过。

测试没有绑定维护者的工程目录或 Desktop 安装目录。路径样例中的 `D:/Projects/App` 等字符串用于验证 Windows 路径规则，不要求开发人员具备相同的盘符或目录；Desktop 桥接和 ASAR 补丁测试使用模拟对象及内存数据，不需要启动或修改桌面应用。

接手时仍需确认以下环境条件：

- **运行时与依赖**：建议统一使用 Node.js 24、pnpm 11，并通过 `pnpm install --frozen-lockfile` 安装锁定依赖。测试直接导入 `.ts`，旧 Node 版本可能无法执行；`directory-start`、`git-review` 和 `repository-workspace` 测试在管理插件中导入 `lib/index.js`，功能变更后需先同步产物。
- **Git**：`git-review.test.mjs` 会在临时目录调用 PATH 中的 `git`，创建仓库和本地提交，不需要 GitHub 账号。测试已指定提交身份并关闭提交签名，但尚未完全隔离系统/全局 Git 配置，例如全局忽略规则、属性、钩子和仓库模板可能影响结果。
- **文件系统**：系统临时目录需要可写；`repository-workspace.test.mjs` 的越界验证会在 Windows 创建目录联接，在其他系统创建符号链接，环境需允许对应操作。

这些条件说明测试并非仅供维护者本机使用，也不等于已验证所有平台。后续完善可移植性时，应先隔离 Git 集成测试的配置和模板，再在 Windows/Linux CI 中执行相同的依赖安装、构建和测试流程；不能以忽略整个 `tests/` 代替验证。纯数据模型测试与 Git/链接集成测试失败时，需分别排查业务逻辑和环境条件。

~~~powershell
pnpm build
pnpm test
~~~

改变显示或交互时，重点人工验证半宽侧栏、长路径、自动换行、统一/并排切换、局部与全部展开、切换会话及异步刷新。改变文件写入逻辑时，在临时目录验证冲突、越界、符号链接、CRLF 和多次编辑顺序，不用真实业务仓库验证破坏性操作。

### 10.3 打包和 Desktop 加载

功能验证后，普通打包命令是：

~~~powershell
pnpm pack --pack-destination dist
~~~

默认得到 `dist/dsh-file-review-tab-multi-git-repository-0.3.1.tgz`，公开 Release 使用同名资产。同版本本地开发安装可给文件增加唯一后缀；公开发版则使用新版本号。GitHub Release 上传及市场收录步骤见 [发布指南](RELEASING.md)。

当前 Desktop 使用 `%USERPROFILE%\.dsh\profiles\desktop`。该 Profile 由桌面宿主管理，本地 tgz 安装步骤见 [README 的安装说明](../README.md#安装)，安装后重新加载/重启宿主使 Host 和 Client 使用同一套产物。目录选择起始路径的宿主适配是单独步骤，不随插件包自动修改 Desktop。

`package.json` 的 `files` 包含运行产物、补丁、兼容脚本、README 和 `docs/`。预构建安装包同时提供架构及发布文档，README 中的相对文档链接可以在包内继续使用。

### 10.4 常见修改入口

| 需求 | 首先查看 | 必须保持的约定 |
| --- | --- | --- |
| 增加或调整审查范围 | `review-scopes`、`review-scope-model`、`git-review-command`、`locales`，参见 [扩展步骤](#32-扩展审查范围) | 保持稳定范围 ID、补齐处理表与中英文标签；明确数据来源及评论/撤销条件 |
| 改变差异布局或上下文 | `UnifiedDiff`、`unified-diff-model`、对应 CSS | 只保留统一/并排两种布局；保留行身份，不改变撤销数据 |
| 改变批量展开 | `ReviewRepositoryGroup`、`review-repository-groups`、两个审查页面 | 区分文件列表与正文，限定会话/轮次/仓库范围，复用 Git 加载队列 |
| 增加仓库配置字段 | `repository-types/schemas`、`repository-project-file`、`repository-settings-model`、`use-repository-settings`、`RepositorySettings` | 维护文件版本兼容与修订检查，不保存机器绝对根目录或临时外部仓库 |
| 新增 Host 能力 | `FileReviewService` 和 Typert 三层契约 | Agent 作用域、请求/响应运行时校验、Host 路径验证 |
| 修改评论发送/定位 | `review-comment-submission`、`review-comments-send`、`review-discussion-events`、`review-file-opener` | 保留原引用与准确请求身份、发送失败保留草稿，不覆盖会话输入草稿 |
| 修改撤销算法 | `file-review-files` 中的 `transformFile/resolveReviewFile` 及 `FileReviewService` | 精确匹配、逐文件结果、真实路径边界、写前核对 |
| 升级宿主或 sidebar | `package.json`、两个入口、`snapshot-compat`、目录桥脚本 | 核对插槽、Conversation 快照、Typert 注册、Tab 打开和清理生命周期 |

完成一次功能修改后，同步更新 README 的用户行为说明与本文的架构/限制说明；跨 Host/Client 的修改需保持契约和构建产物一致。

## 11. 常见问题定位

| 现象 | 优先排查 |
| --- | --- |
| 「文件审查」Tab 不出现 | 原生类型／插槽注册、`dsh.client` 加载、`client/index` 日志、安装包是否为本次产物 |
| `remote.multiGitFileReviewByWqz` 不可用 | `$mount` 错误、Host 插件与 Typert 模型加载、会话 scope 是否存在、两端版本是否一致 |
| 会话有旧修改但「上一轮」为空 | 最新轮次是否实际修改文件；按定义不会回退到更早轮次 |
| Code Mode 改动缺失 | 嵌套调用是否成功、结果是否有 before/after、root/sub-call 归属、schema 与预算、官方持久化标记及截断提示 |
| 多仓库没有生效 | 最近项目 JSON 是否存在/启用、相对根目录是否正确、仓库是否可用；旧 Profile 清单本身不启用功能 |
| 保存配置提示已变动 | 文件修订值不匹配；重新加载后再编辑，避免覆盖他人的变动 |
| 「打开」不能定位已有路径 | `directoryStart` 结果、Desktop 桥的 `supportsDefaultPath`、宿主构建是否匹配兼容脚本 |
| 文件差异加载后属于旧范围 | 请求版本防护是否保留，模式/仓库/引用变化是否清理缓存 |
| 历史上下文无法展开 | 原始记录是否包含全文；缺失内容不能从当前文件补造 |
| 撤销不可用或部分失败 | 返回的逐文件 `state/reason`、当前内容是否冲突、是否新建/删除/越界或差异不完整 |
| 评论/确认重启后丢失 | localStorage 是否不可用/损坏、sessionId 是否变化；不要去项目 JSON 中寻找这些状态 |
| 仓库名称重复或展开影响其他组 | 是否用显示名称作唯一键；应使用仓库根目录和会话/轮次作用域 |

排查时先确定问题属于会话记录、Git 查询、项目范围、显示状态还是文件写入，再沿对应链路处理。一个页面显示相同路径不代表两个范围使用相同版本的代码。


## 12. v0.3.1 融合实现边界

### 12.1 捕获、提交与重放

标准与 PTC 根调用都请求 Host 生命周期记录。共享 codec 在 [lifecycle-record.ts](../src/lifecycle-record.ts)，观察适配在 [lifecycle-capture.ts](../src/lifecycle-capture.ts)，路径、字节图像与文件转换在 [file-lifecycle.ts](../src/file-lifecycle.ts)。执行前后只观察允许仓库内的普通 UTF-8 文件；捕获失败不会改变正常工具结果。

官方 tools/execute → tools/post-execute → tools/result 决定最终接受；未接受、失败、取消、替换执行值不能产生可信图像。标记位于空 text 块的 dshFileReviewMultiRepository 元数据，模型正文不增加文件快照。标准结果随 tool/result 保存；子调用通过 tools/ptc-dispatch-log 进入官方 tool/ptc-dispatch。重放校验版本、session/root/sub-call，并按 UUID 去重；不写入未知的必需会话事件。

单文件捕获 1 MiB、单标记 256 KiB、最近 4000 条／16 MiB 图像；超限保留原因或截断警告。请求另限 256 文件／16 MiB。客户端 recordId、路径、旧／新文本必须逐项匹配 Host 记录；sourceCallId 仅用于同次调用去重，不能授权。未捕获的同路径差异仍展示，混合或不连续序列保守拒绝整段撤销。

创建是 before=null 与真实不存在路径的组合，空文件不等于不存在；独占 wx 重建、原始换行和 mode 均保留。实际操作重新检查当前 roots、真实父目录、常规文件、精确内容、权限及 dev/ino，批量返回逐文件结果。现有文件采用官方 atomic-write。旧局部 hunk 逻辑仍用于无身份历史，oldText=null 本身不能授权删除。

自行还原后的新 dev/ino 只在本进程维护。RC Session.append 未提供写入 ignorable 扩展事件的公开参数，所以没有引入可能阻止卸载后恢复会话的必需事件；重启后继续多次切换可能保守冲突。原始记录经真正新 Node 进程可撤销与重建。此限制明确记录，不降低文件替换检查。

### 12.2 评论增强与可选服务

ReviewCommentsDock、侧栏 Provider 共用同一会话草稿／讨论 Store。review-input 使用官方 inputTriggers codec 和带 draftRev 的 input-insert-reference／insertText，保留文本与其他引用／附件，不 setDraft。附加时冻结包；序列化时占用共享锁；用官方 pendingSubmissions 和 eventSource 找真实 requestId／入队入轮证据。无讨论模式使用临时 reconciliation Store，不保存批次。全局 tracking 在 Dock 隐藏后仍运行，解绑、abort、卸载均释放。

review-comment-packet 只认完整的 leading、本包名、版本 1 envelope，限制 512 KiB，并转义 JSON 中尖括号。ReviewPacketMessage 捕获实际原 user／steering 组件并组合：普通、损坏、旧消息完整委托；插件包仅投影首个 text，其他 content 和原 props 保留。遇到不可委托的 inject／children／store 契约时不接管。详情取消息快照，完整复制含原 envelope。宿主编辑／重发等在真实 Desktop 的行为仍待验证。

inputTriggers、configForms 与插件设置卡片都通过可选能力注入／插槽生命周期接入，未增加社区插件或核心必需注入。唯一注册、effect disposer、参考包清理、ResizeObserver 与任务 AbortController 均随卸载释放。输入 Chip 重载后不可凭 localStorage 重新授权：保留草稿，用户移除并重附。

### 12.3 设置与阅读

repository-config 的 reviewSettingsOwner 标记用于发现本插件真实 Profile namespace；reviewSettings 只包含 layout/wrap/dock/adaptive/foldMessages。profile-review-preferences 负责 form 订阅、revision 写入、成功后迁移、已有 user/base 优先与只读／失败回退。顶部、弹窗及官方卡片共享权威 Store；弹窗按打开时基准只写用户改动字段。字体、editorPath 等留在本机。

use-effective-layout 用实际容器 ResizeObserver 分离偏好与有效布局，小于 480px 回退统一、拉宽恢复、零宽保持上次决定；虚拟行获得有效布局以重算高度。搜索、引用、上下文和评论身份不随宽度重建。

aggregate-diff 输出跨仓库、来源／基线明确的操作片段报告，数量 256／编码 2 MiB，不能冒充可应用净补丁。Git 复制与展开共用 ReviewDiffQueue（4 并发、去重、失败可重试）；取消／比较 epoch 阻止后续复制，逐文件失败／二进制／缺失文本有说明，加载中逐步核对内存预算。

### 12.4 回归与安装包

pnpm run typecheck / build / test / test:e2e / test:docs / test:pack 是复现入口。浏览器夹具加载真实 lib/client.js 与官方 UI primitives，模拟 Session/Remote/输入／配置服务，不是正在运行的 Desktop。test:docs 验证双语新增章节、白名单、JPEG 与 Host wire；test:pack 生成 tgz、校验导出／声明／资源／社区依赖边界及临时方案排除，附 SHA256。测试用纯 UI 依赖均为开发依赖。

Windows Desktop 的独立双仓库操作验收见 [验证记录](releases/version.md#v031)。`create-desktop-review-workspace.mjs` 只建立系统临时样例，真实截图经 `crop-desktop-guide-images.py` 裁剪后交付；浏览器调试截图写入 `test-results`，不覆盖指南资源。安装同版本新构建需使用内容摘要不同的归档路径，并核对安装产物字节，以免复用包缓存。

侧栏发送的 Session scope 属于宿主 fiber，不能直接访问未在本插件声明注入的 `scope.conversation`。优先使用 Session 的请求身份与提交接口；降级时通过 Cordis `scope.get('conversation')` 解析动态服务。真实 Cordis fiber 与拒绝属性访问的夹具共同覆盖这一约束。

### 12.5 模块职责与扩展约束

融合代码按下表分工，避免在组件、Remote 服务中混合事件解析、持久化和副作用：

| 模块 | 职责 | 扩展时保留的约束 |
| --- | --- | --- |
| [lifecycle-history.ts](../src/lifecycle-history.ts) | 接受事件回放、UUID 索引、顺序校验、缓存预算 | 一次批量 status/apply 共用一个回放快照；旧 hunk、可信记录、无效混合序列分别处理 |
| [lifecycle-capture.ts](../src/lifecycle-capture.ts) | 从工具呈现发现路径，捕获前后图像，对接接受事件 | 观察失败不影响工具结果，工具自带元数据不能授权写入 |
| [file-lifecycle.ts](../src/file-lifecycle.ts) | 路径授权、图像与身份复核、实际文件转换 | 内容相同与 inode 相同分别判断；新增写入方式必须保留操作前复核 |
| [review-input-batches.ts](../src/client/review-input-batches.ts) | 冻结意见包、共享锁、提交身份、确认与释放 | 取消清理当前提交状态，重试重新绑定真实 requestId；只清除已确认的冻结意见 |
| [review-input.ts](../src/client/review-input.ts) | 官方输入引用操作与会话订阅 | 使用 draftRev 防止覆盖更新后的输入；批次跟踪独立于 Dock 生命周期 |
| [profile-review-preferences.ts](../src/client/profile-review-preferences.ts) | Profile 发现、单表单订阅、迁移与保存 | 每次表单绑定拥有独立异步状态，解绑后的完成回调不能恢复订阅或更新本地值 |
| [ReviewEnhancementControls.tsx](../src/client/ReviewEnhancementControls.tsx) | 弹窗与官方卡片共享的增强选项 | 选项、标签只定义一次，保存策略由调用方提供 |
| [git-review-report.ts](../src/client/git-review-report.ts) | 按显示顺序装配复制报告，保留逐文件失败 | 共享加载队列，校验比较版本和取消状态，超限或失败后停止继续调度 |
| [review-enhancements.tsx](../src/client/review-enhancements.tsx) | 注册可选输入、消息和设置能力 | effect/inject 生命周期集中管理，不扩大核心必需注入 |

会话补录的 mutations、warnings、sessionId、rootsKey 作为一个状态快照更新，避免关联字段分散维护。轮次摘要和侧栏共用 isReversible；此判断只决定 UI 可用性，最终写入仍由 Host 校验。新增逻辑测试放在 `lifecycle-history.test.mjs`、`lifecycle-migration.test.mjs` 和 `migration-client.test.mjs`，不要用复制实现的测试替代实际调用链验证。
