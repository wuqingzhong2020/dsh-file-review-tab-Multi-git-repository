# 公共仓库管理依赖与迁移

本插件精确依赖 `dsh-multi-git-repo-manager@0.1.2`。工程配置、Profile 索引、仓库清单解析、路径和仓库归属、临时仓库、目录选择、中英文管理界面及原生右侧管理 Tab 均归管理插件所有。审查插件保留 Git 差异、工具变更、撤销/重做、评论、确认与原生侧栏。

## 安装

在 Desktop 插件页安装并启用管理插件的 `dsh-multi-git-repo-manager-0.1.2.tgz`，再安装并启用本插件。管理插件是必需的 `peerDependencies`，版本固定为 `0.1.2`；它未发布到 npm registry 时，需同时提供两个本地包，供宿主共享同一个插件实例。DSH Profile 的 `dsh.profile.bundles` 中也需要选中两个包，因为普通 npm dependencies 不会自动启动插件。

`0.1.2` 是 package.json 中的版本号，Git 标签为 `v0.1.2`。本仓库的开发链接仅在未打包的 `pnpm-workspace.yaml` 中：`link:../dsh-multi-git-repo-manager`。发布包中的必需插件依赖仍是 `peerDependencies` 的 `0.1.2`。

## 现有工程

- 继续使用 `dsh-file-review-repositories.json`；v1 工程可直接读取，添加普通目录或发现容器后写入 v2 并保留原文件备份。
- 管理插件读取工程内相对路径，外部路径只作为会话临时条目；旧文件中的外部条目继续通过编辑器迁移，不自动授权。
- 本插件的旧 `projects` Profile 字段保留为隐藏迁移数据。宿主读取普通数组或 DSH volatile 引用，导入管理服务；保存时使用管理插件自己的 Profile 设置空间。
- 管理页面现在通过右侧「开始」页的「多代码仓管理」入口打开，采用与文件审查相同的原生 Tab 机制。旧会话区管理页签已移除。
- 目录选择适配脚本归管理包所有，旧脚本路径保留 CLI 和 `patchArchive` 转发。

## 后续插件接入

宿主声明 `inject = ['multiGitRepoManager']` 并调用 `ctx.multiGitRepoManager.workspace(agent)`。浏览器使用当前会话的 `remote.multiGitRepoManager`，订阅 `/events` 的配置变化后刷新自己的界面。不要实例化第二个管理服务或再次注册管理页签。

`repository-*.ts` 和部分客户端工具在本仓库只再导出管理包的公共接口，供既有源码调用和声明兼容；管理实现不再留在本仓库。新增管理能力应修改独立管理包，再更新消费者版本。

`D:\projectZJGG\ref\dsh-file-review` 本次不修改，未来可按上述方式接入。

## 本地验证

先在管理仓库执行 `pnpm install --frozen-lockfile`、`pnpm build`、`pnpm test`、`pnpm test:pack`。再在本仓库执行相同安装和构建，以及 `pnpm test`、`pnpm test:e2e`、`pnpm test:docs`、`pnpm test:pack`。

管理测试已移到管理仓库；本仓库仍测试跨仓库撤销边界和共享服务依赖。Lifecycle fixtures 与新进程重放显式加载管理服务，覆盖独立插件后的真实 Cordis 调用。

普通目录配置和共享归属 API 见 [非 Git 目录说明](NON_GIT_DIRECTORIES.md)。未来消费者必须调用 `resolveTargetPaths` 校验具体文件，不能只按 `roots` 授权。
