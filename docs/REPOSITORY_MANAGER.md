# 公共管理依赖与业务分工

审查插件 0.3.5 精确依赖 `dsh-multi-git-repo-manager@0.1.4`。管理负责工程配置、Profile 索引、目标分类、发现、路径归属、临时目标及独立管理 Tab；审查负责工具证据、Git 比较、Diff、评论、确认、撤销/重做和编辑器定位。

## 安装与构建

两个 tgz 同时安装并启用，Profile 的 `dsh.profile.bundles` 必须选中两个包。管理为必需 peer，宿主只加载一个实例；尚未发布到 registry 时必须提供两个本地安装包。源码开发仅通过未打包的 `pnpm-workspace.yaml` 链接相邻管理仓库。

先在管理仓库构建、测试和打包，再在本仓库运行 `pnpm build`、`pnpm test`、`pnpm test:e2e`、`pnpm test:docs`、`pnpm test:pack`、`pnpm test:install`。两个构建不能并行，因为管理构建会清理消费者链接使用的类型产物。

## 只读契约

宿主注入 `multiGitRepoManagerByWqz`；`FileReviewService` 只依赖 `/types` 的 `ManagedWorkspaceReader`，两个必需方法为：

- `workspace(agent)`：完整 `ManagedWorkspace`，包含目标、边界和范围修订。
- `resolveTargetPaths(agent, paths)`：具体文件当前归属，逐项保留状态与原因。

生产和测试均须提供两个方法；没有归属接口时不能按 `roots` 兜底。审查源码直接导入管理包正式入口，已删除管理配置、解析、设置和客户端工具的转发文件，也不再向外再导出管理类型。

Git 批量比较复用管理包纯归属算法与同一范围快照，避免逐文件读取整个工程。捕获、撤销/重做及定位通过当前 Agent 服务重新核对归属；managed 只表示纳管，业务证据、内容匹配、宿主权限和维护锁仍由审查插件判断。

Git CLI、HEAD、分支与提交基线属于审查业务，继续保留在 `git-review.ts`、`git-review-command.ts` 等模块。管理的 `capabilities.git` 只是目标自身元数据事实。

## 配置与界面

工程文件沿用 `dsh-file-review-repositories.json`，仅支持 v2；管理插件是文件与 Profile 根目录索引的唯一来源。本插件只保存 `reviewSettings`，没有项目清单、配置导入或保存接口。

Git 目标和普通目录统一由管理提供。审查的“全部 Git 仓库”“全部非 Git 目录”“未纳管记录”是业务筛选，不能写成管理目标。普通目录支持已捕获的上一轮、本会话、待确认；没有工具记录的手改不会自动生成基线。已移除目标的历史保留，当前磁盘操作重新判断归属。

管理页面从右侧“开始”页打开独立原生 Tab；审查只注册自身界面。服务 `multiGitFileReviewByWqz`、聊天字典 `multiGitFileReviewByWqz.chat` 与原版 `fileReview` / `file-review` 保持分离。

## 通知边界

浏览器订阅管理包 `/events`，保存或临时目标变化后重新读取当前会话范围。同一浏览器全局中的独立 bundle 共享 EventTarget，订阅在卸载时清理；切换会话后忽略旧回复。

通知不是文件授权凭证，也不是磁盘监听或多窗口 Host 同步。手改配置需显式重载，实际文件操作始终重新验证。当前两个插件无需额外 Host 事件框架。

`D:\\projectZJGG\\ref` 中的插件仅为参考，本轮没有为它们接入多仓管理。原版共存测试验证注册兼容，不改变原版功能。
