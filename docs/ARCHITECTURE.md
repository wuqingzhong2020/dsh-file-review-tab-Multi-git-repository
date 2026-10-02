# 整体架构与开发接入指南

本文面向首次接手工程的开发人员，说明当前实现的模块边界、数据流、状态存储和修改入口。功能使用说明见 [README](../README.md)。

文档基线：插件 `dsh-file-review-tab-multi-git-repository` **v0.1.0**，DeepSeek Harness Desktop **0.2.0-rc.2**，`dsh-better-sidebar` **0.24.1**。本文按当前源码整理；宿主接口或数据模型变化时，应同步更新本文。目录名中的 `Multi` 大小写不等于 npm 包名，注册和发布时以 [package.json](../package.json) 中的名称为准。

阅读导航：先看 [运行架构](#2-运行架构与加载方式) 和 [代码地图](#3-代码地图)；接入功能开发看 [工作流程与修改入口](#10-新开发者的工作流程)；涉及仓库范围时先看 [配置生命周期](#5-多仓库工程模型与配置生命周期)。

## 1. 五分钟理解工程

这是一个运行在 DeepSeek Harness 内的插件，包含 Node.js Host 服务和浏览器 React 界面。它把会话中的文件工具改动，以及多个 Git 仓库的真实差异，统一放进「文件审查」侧栏，并提供工程级仓库配置、行评论和会话改动撤销。

三个用户入口均由 [src/client/index.tsx](../src/client/index.tsx) 注册：

| 入口 | 组件 | 作用 |
| --- | --- | --- |
| better-sidebar 的「文件审查」Tab | [FileReviewTab.tsx](../src/client/FileReviewTab.tsx) | 选择审查范围、查看差异、确认轮次、撤销和提交修改意见 |
| 会话顶部「多代码仓管理」页签 | [RepositorySettings.tsx](../src/client/RepositorySettings.tsx) | 编辑当前工程的仓库列表，保存工程配置文件 |
| 对话轮次末尾的审查行 | [ProducedFiles.tsx](../src/client/ProducedFiles.tsx) | 展示工具改动摘要，撤销或定位到侧栏的文件差异 |

理解工程时，先区分以下概念：

- **会话改动**来自工具执行记录，能够归属到某一轮对话；是否可以撤销取决于原始差异和当前磁盘内容。
- **Git 差异**来自实际工作区、暂存区和提交历史，也能看到终端、编辑器等产生的修改；这些范围在插件中只读。
- **确认本轮**只是记录审查进度，不修改文件或 Git 状态。
- **提交修改意见**是把评论发送给当前会话的 Agent，不是 Git 提交，也不直接执行代码修改。
- **工程配置**描述该工程维护哪些仓库；**会话本地状态**描述某个会话的评论、确认和临时仓库，二者独立。

建议按以下顺序阅读源码：两个 `index` 入口 → 通信契约 → `FileReviewTab` 与 `FileReviewService` → 正在修改的功能模块。不要从生成的 `lib/client.js` 开始追踪业务。

## 2. 运行架构与加载方式

~~~mermaid
flowchart TB
  subgraph Desktop["DeepSeek Harness Desktop / Web 宿主"]
    subgraph Browser["浏览器界面"]
      Slots["conversation.view / turnTail 插槽"]
      Sidebar["better-sidebar"]
      UI["React 页面与差异渲染"]
      Snapshot["会话 Conversation snapshot"]
      Local["浏览器 localStorage"]
      Remote["Typert 客户端 remote.fileReview"]
      Slots --> UI
      Sidebar --> UI
      Snapshot --> UI
      UI <--> Local
      UI <--> Remote
    end
    subgraph Host["Node.js Host"]
      Entry["src/index.ts：注册与嵌套工具监听"]
      Service["FileReviewService"]
      Workspace["工程配置、路径与仓库解析"]
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

[src/index.ts](../src/index.ts) 的 `apply` 创建 `RepositorySettings` 和 `FileReviewService`，注册文件引用的系统提示，并监听成功的嵌套 `tools/result`。

监听器按结果结构识别具有 `path / before / after` 的文件修改，只补录嵌套调用。普通工具调用已经有 Conversation 数据，不在这里重复记录。失败的工具结果不会进入记录。

### 2.2 浏览器入口

[src/client/index.tsx](../src/client/index.tsx) 负责：

1. 注册中英文文案。
2. 挂载 `TYPERT_REMOTE`。
3. 注册工程配置页、插件自己的 Conversation 数据定义和轮次尾部审查行。
4. 通过 `ctx.betterSidebar.registerTab` 注册 `file-review` Tab。

注册使用 `ctx.effect` 管理清理，供插件禁用和热重载使用。新增全局监听或宿主注册时，也需要提供对应的释放逻辑。

插件自己的审查行与宿主内置改动卡共存，使用独立的注册标识。不要通过关闭宿主原生 `deliverables` 或文件提及服务来实现扩展。

### 2.3 包与构建边界

[package.json](../package.json)、[cordis.patch.yml](../cordis.patch.yml) 和 [tsdown.config.ts](../tsdown.config.ts) 共同决定加载方式：

| 包导出 | 源码入口 | 构建产物与用途 |
| --- | --- | --- |
| `.` | `src/index.ts` | `lib/index.js`，Host 插件 |
| `./client` | `src/client/index.tsx` | `lib/client.js`，浏览器贡献 |
| `./typert` | `src/typert.host.ts` | `lib/typert.host.js`，Host 通信模型 |
| `./remote` | `src/remote.ts` | `lib/remote.js`，远程贡献定义 |

Host 输出为 ESM，目标为 Node ES2024。浏览器代码输出为 CJS，再包装进宿主的 `window.__ModuleLoader__.load`；不是独立网页应用。React 由宿主提供，`diff` 与 `zod` 随浏览器产物打包。

CSS Module 通过 lightningcss 转换为带哈希的类名，再注入具有 `data-plugin-css` 标识的 `style`，相同标识避免重复注入。界面使用宿主 `--dsw-alias-*` 主题变量和容器查询。修改布局优先在对应 `.module.css` 中进行，不给宿主页面添加全局样式。

## 3. 代码地图

| 模块 | 主要文件 | 职责 |
| --- | --- | --- |
| Host 调度与文件操作 | [file-review-service.ts](../src/file-review-service.ts) | 远程方法、状态检查、安全撤销/重做、嵌套改动及临时仓库存储 |
| 通信契约 | [change-types.ts](../src/change-types.ts)、[typert-descriptors.ts](../src/typert-descriptors.ts)、[typert.host.ts](../src/typert.host.ts)、[remote.ts](../src/remote.ts) | 请求结果类型、运行时校验、Host 模型和客户端类型注册 |
| 工程数据模型 | [repository-types.ts](../src/repository-types.ts)、[repository-schemas.ts](../src/repository-schemas.ts)、[repository-config.ts](../src/repository-config.ts) | 工程、仓库、工作区及 Profile 配置类型 |
| 配置文件与 Profile | [repository-project-file.ts](../src/repository-project-file.ts)、[repository-settings.ts](../src/repository-settings.ts) | 项目 JSON 发现、校验、版本检查、原子写入和 Profile 索引 |
| 仓库范围与路径 | [repository-workspace.ts](../src/repository-workspace.ts)、[repository-path-policy.ts](../src/repository-path-policy.ts)、[repository-directory.ts](../src/repository-directory.ts) | 清单兼容解析、真实路径、去重、仓库可用性和目录选择 |
| 客户端目录选择 | [directory-picker.ts](../src/client/directory-picker.ts) | 选择 Desktop/Web 目录接口、检查起始目录能力、处理取消及错误 |
| Git 查询 | [git-review.ts](../src/git-review.ts)、[git-review-types.ts](../src/git-review-types.ts)、[git-review-schemas.ts](../src/git-review-schemas.ts) | Git 比较、文件列表、单文件差异及契约 |
| 会话数据归并 | [session-changes.ts](../src/client/session-changes.ts)、[mutation-call.ts](../src/client/mutation-call.ts)、[recorded-diffs.ts](../src/client/recorded-diffs.ts) | 工具结果解析、轮次归属、PTC 补录及归档 |
| 宿主快照适配 | [snapshot-compat.ts](../src/client/snapshot-compat.ts)、[turn-deliverables.ts](../src/client/turn-deliverables.ts)、[deleted-paths.ts](../src/client/deleted-paths.ts) | 快照形状适配、审查行数据、字面删除路径识别 |
| Git 页面与加载 | [GitReviewPanel.tsx](../src/client/GitReviewPanel.tsx)、[git-review-diff-loader.ts](../src/client/git-review-diff-loader.ts) | Git 范围、仓库筛选、差异缓存和并发队列 |
| 仓库分组 | [ReviewRepositoryGroup.tsx](../src/client/ReviewRepositoryGroup.tsx)、[review-repository-groups.ts](../src/client/review-repository-groups.ts)、[repository-paths.ts](../src/client/repository-paths.ts) | 文件所属仓库、组标题、列表折叠和批量内容展开 |
| 差异显示 | [UnifiedDiff.tsx](../src/client/UnifiedDiff.tsx)、[unified-diff-model.ts](../src/client/unified-diff-model.ts)、[diff-text.ts](../src/client/diff-text.ts) | 行模型、两种布局、上下文展开和复制 |
| 评论 | [ReviewComments.tsx](../src/client/ReviewComments.tsx)、[review-comments.ts](../src/client/review-comments.ts)、[review-comments-send.ts](../src/client/review-comments-send.ts) | 评论编辑、定位、存储和发送 |
| 确认与显示偏好 | [review-confirmations.ts](../src/client/review-confirmations.ts)、[DiffViewControls.tsx](../src/client/DiffViewControls.tsx)、[diff-view-preferences.ts](../src/client/diff-view-preferences.ts) | 整轮确认、统一/并排布局、自动换行 |
| 页面协调 | [deep-link.ts](../src/client/deep-link.ts)、[repository-events.ts](../src/client/repository-events.ts) | 深链定位和配置变化通知 |
| 文案 | [locales.ts](../src/client/locales.ts)、[chat-locales.ts](../src/client/chat-locales.ts) | Tab/管理页及对话审查行的中英文文案 |
| Desktop 兼容适配 | [patch-desktop-directory-picker.mjs](../scripts/patch-desktop-directory-picker.mjs) | 为特定 Desktop 构建的目录选择桥增加起始目录参数 |

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

## 5. 多仓库工程模型与配置生命周期

### 5.1 配置归属

工程根目录下的 `dsh-file-review-repositories.json` 是可随 Git 维护的配置来源。项目名称和根目录由当前会话及配置发现结果确定，管理页面只读展示；文件内不保存某台机器的工程绝对根目录。

~~~json
{
  "version": 1,
  "enabled": true,
  "includeProjectRoot": true,
  "repositories": [
    { "name": "core", "path": "packages/core" },
    { "name": "editor", "path": "plugins/editor" }
  ]
}
~~~

`version` 当前为 1，`enabled` 缺省时视为启用，`includeProjectRoot` 决定是否同时纳入工程根目录范围。所有保存的仓库路径均相对工程根目录，适用于任意工程，不绑定 ProjectManager 或 `submodules.ini`。

配置发现从会话 `cwd` 的真实目录向父目录查找，最近的配置文件优先。Profile 中的项目索引可辅助匹配已登记工程，但最终仍检查工程文件是否存在、是否启用。没有配置文件时保持原有会话目录范围，不会仅凭旧 Profile 记录启用多代码仓。

[src/repository-workspace.ts](../src/repository-workspace.ts) 解析候选仓库并检查目录/Git 可用性；实际 Git 审查使用可用仓库。嵌套仓库的文件归属按最具体的匹配根目录判定，避免统一归到父仓库；去重使用路径身份，不依赖仓库显示名称。

### 5.2 保存、重新加载与旧配置迁移

管理页通过 `project` 读取配置状态和 `fileRevision`：

1. 无配置时禁用「重新加载已保存配置」，主按钮显示「生成新配置文件」。
2. 编辑仓库行后，`saveProject` 校验工程身份与路径。
3. `writeProjectFile` 对当前文件计算 SHA-256 修订值，与加载时的修订值比较；外部修改导致不一致时拒绝覆盖，要求先重新加载。
4. 原子写入工程 JSON；随后尽力更新 Profile 项目索引。Profile 设置服务不可用时，已经保存的工程文件仍是可使用的配置。
5. 浏览器通过 `repository-events` 通知已挂载页面重新读取工作区。

这里的修订检查是乐观并发检查，工程文件写入与 Profile 索引更新不是一个跨存储事务。

旧 Profile 可引用 INI、`.gitmodules` 或 JSON 仓库清单，用于在管理页列出可迁移的行。主动保存后，新项目 JSON 接管配置；新工程不需要准备这些旧清单。Host 内部仍有 `preview` 方法供保存验证使用，当前没有独立的预览按钮或 `preview` RPC。

### 5.3 工程内路径与临时外部仓库

Host 通过 `realpath` 判断实际位置：

| 路径实际位置 | 界面表示 | 是否写入工程 JSON |
| --- | --- | --- |
| 工程根目录或内部目录 | `.` 或相对路径 | 是 |
| 工程外的父目录、兄弟目录、其他盘目录 | 绝对路径，标记临时 | 否 |
| 看似在工程内、实际经目录联接指向外部 | 按外部目录处理 | 否 |

不能只用 `path.relative` 的结果判断可保存性；同盘工程外路径即使能写成 `../other`，仍是临时仓库。浏览器路径转换用于交互，Host 真实路径校验才是最终依据。

临时仓库通过 `setTemporaryRepositories` 按 Agent/会话保存在 Host 内存中，依附已启用的项目配置，重新启动 Host 后丢失。它们不进入可提交的工程文件，也不改变其他会话的范围。删除仓库行需要确认，实际只移除列表项，不删除磁盘目录。

### 5.4 「打开」目录选择

管理页先调用 `directoryStart`：有有效路径就按相对工程路径或绝对路径解析，空值、错误路径或非目录则退回工程目录。之后由浏览器调用宿主目录选择接口，选中工程内目录转为相对路径，外部目录保留绝对路径。

Desktop 0.2.0-rc.2 原生接口需要单独适配才能接收起始路径。客户端的 `directory-picker.ts` 检查桥上的 `supportsDefaultPath`，避免把「可选择目录」误当成「能按指定目录打开」；Host 的 `repository-directory.ts` 负责验证起始目录。独立 Web 的目录选择服务不具备同样的起始路径能力。

[scripts/patch-desktop-directory-picker.mjs](../scripts/patch-desktop-directory-picker.mjs) 修改的是特定宿主 `app.asar`，不属于普通 React 功能实现。脚本保留窗口/来源验证，备份原文件，对不匹配构建停止操作。详细使用步骤见 README；宿主更新后需重新核对兼容性。

## 6. Host / Client 通信契约

通信命名空间为 `fileReview`，以 Agent 为作用域。Host 从宿主查找 Agent，并使用 `agent.session.header.cwd` 作为权威会话目录，不能信任浏览器传入一个根目录就扩大文件操作范围。

契约分为三层：

- [typert-descriptors.ts](../src/typert-descriptors.ts)：共享调用描述符、作用域和严格 Zod 编解码。
- [typert.host.ts](../src/typert.host.ts)：Host 的 Typert 模型。
- [remote.ts](../src/remote.ts)：浏览器远程贡献及 TypeScript 服务类型扩展。

| 方法 | 用途 | 副作用 |
| --- | --- | --- |
| `project()` | 读取当前工程的管理页数据、配置存在状态与修订值 | 读取 |
| `workspace()` | 获取当前会话有效仓库和允许的文件根目录 | 读取 |
| `saveProject(request)` | 保存工程配置并返回管理页数据 | 写工程 JSON、更新 Profile 索引 |
| `setTemporaryRepositories(entries)` | 设置当前会话的临时外部仓库 | 更新 Host 内存 |
| `directoryStart(path)` | 解析目录选择器起始目录 | 读取 |
| `gitReview(request)` | 查询仓库、比较引用及改动文件列表 | 读取 Git |
| `gitReviewDiff(request)` | 查询一个文件的具体差异 | 读取 Git/工作区 |
| `recorded(request)` | 按根调用 ID 获取嵌套工具修改记录 | 读取 Host 内存 |
| `status(request)` | 检查原始差异与当前文件的关系 | 读取文件 |
| `apply(request)` | 安全撤销或重新应用差异 | 写文件 |

客户端先获取 `sessions.scope(sessionId)`，再用 `scope.get('remote.fileReview')` 获取动态服务。响应为 `RemoteResult`：先检查 `ok`，失败读取 `error.message`，成功读取 `value`。异步挂载未完成或插件服务缺失时必须提供可见错误，不能在组件渲染期间无条件访问会抛异常的动态服务 getter。

新增远程方法时，应同时修改领域类型、Zod schema、描述符、Host 方法、`remote.ts` 类型扩展和调用页面。仅给 service 增加一个方法不会自动使它成为可调用 RPC。

## 7. 差异渲染、折叠与评论定位

### 7.1 统一行模型与两种布局

`ProducedFileDiff` 描述一个差异块：路径、旧/新文本、可选旧/新起始行。`oldText: null` 表示原先不存在的文件，与空字符串不同。

`unified-diff-model.ts` 生成具有旧/新行号、增删/上下文类型以及折叠间隔的模型。`UnifiedDiff` 用同一模型渲染两种布局：

- **统一**：删除与新增按行上下排列，显示新旧两列行号。
- **并排**：左旧右新；替换行对齐，数量不等时以空单元格补齐。换行后的两侧行高同步。

默认显示改动附近 3 行上下文。首尾间隔每次向外展开 20 行，中间间隔从两端各展开 10 行。布局、换行和上下文展开都不修改实际差异内容；复制差异仍输出精简的 3 行上下文。

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

`ReviewCommentAnchor` 包含仓库身份、文件绝对路径、范围/轮次、旧/新侧、行号、引用代码和差异修订标识。删除行引用旧版行号，新增行引用新版行号；并排上下文行按实际点击的一侧定位。引用附近代码用于帮助 Agent 核对位置。

「上一轮」「本会话」「待确认」同一轮共用评论身份，不能因为切换筛选重复生成一套评论。差异变动后旧评论保留原引用，并显示修订不匹配提示，不自动挪到其他行。整文件评论不依赖具体行。

`ReviewCommentStore` 按会话保存草稿，单条文字上限为 6000 字符。`review-comments-send.ts` 调用该会话的 `conversation.send` 发送整理后的意见，不增加插件 RPC，也不覆盖输入框现有草稿。发送期间防止重复提交；成功只清除已发送批次，失败保留。Agent 忙碌时由宿主处理消息排队。

## 8. 状态存储与生命周期

| 数据 | 存储位置 | 隔离与生命周期 |
| --- | --- | --- |
| 工程仓库配置 | 工程根目录 JSON | 可随 Git 维护；不同工程独立；不写外部临时仓库 |
| 工程索引、旧配置引用 | 宿主 Profile 设置 | 用于项目匹配及迁移，不替代项目 JSON 的存在/启用判断 |
| PTC 嵌套修改全文 | `FileReviewService` 的 `recordLog` | 按 Agent 隔离，最多保留 4000 条；Host 重启/重载后丢失 |
| 临时外部仓库 | Host `temporaryRepositories` | 当前 Agent/会话内有效，Host 重启后丢失 |
| 评论草稿 | localStorage 的 `…:comments:<sessionId>` | 按会话持久化 |
| 轮次确认 | localStorage 的 `…:confirmations:<sessionId>` | 按会话持久化 |
| 归档展开状态 | localStorage 的 `…:archive:<sessionId>` | 按会话持久化，兼容旧前缀迁移 |
| 差异布局与换行 | localStorage 的 `…:diff-view` | 同一浏览器环境下共享的显示偏好 |
| 文件内容、仓库列表、上下文展开 | React/组件内存 | 页面状态，不写工程 JSON |
| Git 文件差异缓存 | `GitReviewPanel` 内存 | 模式/引用/刷新等变化时失效 |
| 审查深链目标 | `deep-link.ts` 模块内存 | 按会话保存最新目标，带 nonce 支持重复点击 |

表中的 `…` 为 `dsh-file-review-tab-multi-git-repository`。localStorage 不是工程配置的一部分，也不是跨设备同步数据；不可用时退回内存，评论和确认页面会提示持久化失败。

确认记录使用整轮文件差异的修订标识。只能确认已完成且有改动的轮次；该轮后续补录或改变差异，修订标识变化后自动重新进入「待确认」。撤销、Git 状态与确认记录分别处理。

`repository-events.ts` 是当前浏览器插件实例中的通知通道，不是跨进程文件监听器；手工修改 JSON 后通过「重新加载已保存配置」读取。`deep-link.ts` 用插件自己的目标通道配合 better-sidebar 打开 Tab，解决已打开 Tab 的 meta 不更新问题；定位归档轮次时自动打开归档并加载所需页。

## 9. 文件写入边界与性能约束

### 9.1 撤销/重做的安全边界

`FileReviewService.apply` 在 `agent.runMaintenance` 中执行，避免与 Agent 的正常执行交错。每个文件独立返回 `applied / undone / conflict / unsupported / error` 及 `changed`，整轮操作不是全有或全无事务。

文件操作依次检查：

1. 将路径解析到会话和当前有效工作区，校验真实路径属于允许的根目录。
2. 拒绝符号链接文件、非普通文件以及无法按 UTF-8 无损处理的内容。
3. 用原始差异匹配当前文本；撤销逆序处理同文件差异块，重做顺序处理。
4. 有行号时按预期位置匹配；无行号时要求文本唯一匹配，不做模糊猜测。
5. 写入前重新读取核对内容，冲突时跳过；采用原子写入并保留权限和换行风格。

新建文件的 `oldText: null`、终端删除标记、缺少足够差异或匹配冲突的文件不能直接恢复。不要为了让按钮可用而自动删除新文件、扩大根目录或添加模糊匹配。写前核对是乐观保护，不能描述成覆盖所有外部编辑竞争的文件系统事务。

### 9.2 当前性能策略与限制

- 不可见的侧栏暂停状态巡检；状态检查约 300 ms 防抖，PTC 补录约 200 ms 防抖。
- 普通会话主列表保留最近 5 轮及进行中的轮次；归档折叠时不渲染正文，展开每页 10 轮。「待确认」单独每页 10 轮加载，不隐藏到归档折叠区。
- 会话差异正文通过 IntersectionObserver 懒挂载；角标按快照结构指纹缓存，只统计标准快照主列表中的不同文件，不代表全部归档或 PTC 补录数量。
- Git 仓库查询分批执行；正文按需加载，每批最多 4 个并发文件请求。
- Git 命令超时为 15 秒，输出缓冲上限为 2 MiB；单仓库最多审查 1000 个文件。过大的正文/输出返回说明或错误，不保证无限规模。
- 未跟踪文件如果是符号链接、二进制、非 UTF-8 或超过 2 MiB，不渲染文本差异。
- 工程配置最大 1 MiB，最多 512 条仓库记录，配置文件必须是普通文件。

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

本地 `tests/` 使用 Node test runner 和临时 Git 仓库，覆盖仓库配置/路径、目录选择桥、Git 比较、差异模型、评论、确认及分组作用域。`package.json` 当前没有 `test` 脚本。

`tests/` 不再被 [.gitignore](../.gitignore) 忽略，应与源码一并提交。已有本地测试文件在移除忽略规则后会显示为未跟踪；提交并推送后，其他开发人员才能在克隆中获得它们。测试创建的临时仓库位于系统临时目录，`coverage/` 等生成报告继续忽略。接手时应确认测试文件齐全，不能把「没有测试文件」当成测试通过。

测试没有绑定维护者的工程目录或 Desktop 安装目录。路径样例中的 `D:/Projects/App` 等字符串用于验证 Windows 路径规则，不要求开发人员具备相同的盘符或目录；Desktop 桥接和 ASAR 补丁测试使用模拟对象及内存数据，不需要启动或修改桌面应用。

接手时仍需确认以下环境条件：

- **运行时与依赖**：建议统一使用 Node.js 24、pnpm 11，并通过 `pnpm install --frozen-lockfile` 安装锁定依赖。测试直接导入 `.ts`，旧 Node 版本可能无法执行；`directory-start`、`git-review` 和 `repository-workspace` 测试还导入 `lib/index.js`，功能变更后需先同步产物。
- **Git**：`git-review.test.mjs` 会在临时目录调用 PATH 中的 `git`，创建仓库和本地提交，不需要 GitHub 账号。测试已指定提交身份并关闭提交签名，但尚未完全隔离系统/全局 Git 配置，例如全局忽略规则、属性、钩子和仓库模板可能影响结果。
- **文件系统**：系统临时目录需要可写；`repository-workspace.test.mjs` 的越界验证会在 Windows 创建目录联接，在其他系统创建符号链接，环境需允许对应操作。

这些条件说明测试并非仅供维护者本机使用，也不等于已验证所有平台。后续完善可移植性时，应先隔离 Git 集成测试的配置和模板，再在 Windows/Linux CI 中执行相同的依赖安装、构建和测试流程；不能以忽略整个 `tests/` 代替验证。纯数据模型测试与 Git/链接集成测试失败时，需分别排查业务逻辑和环境条件。

~~~powershell
node --test tests/*.test.mjs
~~~

改变显示或交互时，重点人工验证半宽侧栏、长路径、自动换行、统一/并排切换、局部与全部展开、切换会话及异步刷新。改变文件写入逻辑时，在临时目录验证冲突、越界、符号链接、CRLF 和多次编辑顺序，不用真实业务仓库验证破坏性操作。

### 10.3 打包和 Desktop 加载

功能验证后，普通打包命令是：

~~~powershell
pnpm pack --pack-destination dist
~~~

默认得到 `dist/dsh-file-review-tab-multi-git-repository-0.1.0.tgz`，公开 Release 使用同名资产。同版本本地开发安装可给文件增加唯一后缀；公开发版则使用新版本号。GitHub Release 上传及市场收录步骤见 [发布指南](RELEASING.md)。

当前 Desktop 使用 `%USERPROFILE%\.dsh\profiles\desktop`。该 Profile 由桌面宿主管理，本地 tgz 安装步骤见 [README 的安装说明](../README.md#安装)，安装后重新加载/重启宿主使 Host 和 Client 使用同一套产物。目录选择起始路径的宿主适配是单独步骤，不随插件包自动修改 Desktop。

`package.json` 的 `files` 包含运行产物、补丁、兼容脚本、README 和 `docs/`。预构建安装包同时提供架构及发布文档，README 中的相对文档链接可以在包内继续使用。

### 10.4 常见修改入口

| 需求 | 首先查看 | 必须保持的约定 |
| --- | --- | --- |
| 增加或调整审查范围 | `FileReviewTab`、`GitReviewPanel`、`git-review-types/schemas`、`locales` | 明确数据来源及是否允许评论/撤销；不能把 Git 历史当作工具轮次 |
| 改变差异布局或上下文 | `UnifiedDiff`、`unified-diff-model`、对应 CSS | 只保留统一/并排两种布局；保留行身份，不改变撤销数据 |
| 改变批量展开 | `ReviewRepositoryGroup`、`review-repository-groups`、两个审查页面 | 区分文件列表与正文，限定会话/轮次/仓库范围，复用 Git 加载队列 |
| 增加仓库配置字段 | `repository-types/schemas`、`repository-project-file`、`RepositorySettings` | 维护文件版本兼容与修订检查，不保存机器绝对根目录或临时外部仓库 |
| 新增 Host 能力 | `FileReviewService` 和 Typert 三层契约 | Agent 作用域、请求/响应运行时校验、Host 路径验证 |
| 修改评论发送/定位 | `review-comments`、`ReviewComments`、`review-comments-send` | 保留原引用、发送失败保留草稿，不覆盖会话输入草稿 |
| 修改撤销算法 | `transformFile`、`resolveFile` 及 `FileReviewService` | 精确匹配、逐文件结果、真实路径边界、写前核对 |
| 升级宿主或 sidebar | `package.json`、两个入口、`snapshot-compat`、目录桥脚本 | 核对插槽、Conversation 快照、Typert 注册、Tab 打开和清理生命周期 |

完成一次功能修改后，同步更新 README 的用户行为说明与本文的架构/限制说明；跨 Host/Client 的修改需保持契约和构建产物一致。

## 11. 常见问题定位

| 现象 | 优先排查 |
| --- | --- |
| 「文件审查」Tab 不出现 | better-sidebar 依赖和注册、`dsh.client` 加载、`client/index` 日志、安装包是否为本次产物 |
| `remote.fileReview` 不可用 | `$mount` 错误、Host 插件与 Typert 模型加载、会话 scope 是否存在、两端版本是否一致 |
| 会话有旧修改但「上一轮」为空 | 最新轮次是否实际修改文件；按定义不会回退到更早轮次 |
| Code Mode 改动缺失 | 嵌套调用是否成功、结果是否有 before/after、rootCallId 归属、Host 记录是否因重启或上限丢失 |
| 多仓库没有生效 | 最近项目 JSON 是否存在/启用、相对根目录是否正确、仓库是否可用；旧 Profile 清单本身不启用功能 |
| 保存配置提示已变动 | 文件修订值不匹配；重新加载后再编辑，避免覆盖他人的变动 |
| 「打开」不能定位已有路径 | `directoryStart` 结果、Desktop 桥的 `supportsDefaultPath`、宿主构建是否匹配兼容脚本 |
| 文件差异加载后属于旧范围 | 请求版本防护是否保留，模式/仓库/引用变化是否清理缓存 |
| 历史上下文无法展开 | 原始记录是否包含全文；缺失内容不能从当前文件补造 |
| 撤销不可用或部分失败 | 返回的逐文件 `state/reason`、当前内容是否冲突、是否新建/删除/越界或差异不完整 |
| 评论/确认重启后丢失 | localStorage 是否不可用/损坏、sessionId 是否变化；不要去项目 JSON 中寻找这些状态 |
| 仓库名称重复或展开影响其他组 | 是否用显示名称作唯一键；应使用仓库根目录和会话/轮次作用域 |

排查时先确定问题属于会话记录、Git 查询、项目范围、显示状态还是文件写入，再沿对应链路处理。一个页面显示相同路径不代表两个范围使用相同版本的代码。
