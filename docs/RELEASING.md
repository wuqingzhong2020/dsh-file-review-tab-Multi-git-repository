# 公开发布与插件市场收录

当前审查插件版本为 **0.3.6**，精确依赖 **dsh-multi-git-repo-manager 0.1.4**。发布审查插件前，先交付管理插件的 tgz 或将其发布到可访问的 npm registry，并更新安装流程以同时选中两个 DSH 插件。两个安装包应成对提供。后续公开版本继续递增，不能覆盖既有发布资产。见 [管理契约与业务边界](ARCHITECTURE.md#5-管理契约与业务边界)。

本工程使用 **GitHub 公开仓库 + GitHub Release 预构建安装包** 提供插件。npm 发布是可选项，是否发布 npm 不影响申请市场收录。

用户安装方式见 [README](../README.md#安装)，工程开发边界见 [架构文档](ARCHITECTURE.md)。本指南说明从本地文件到公开 Release，再到插件市场的完整流程。

## 1. 版本与交付内容

当前版本约定：

| 项目 | 值 |
| --- | --- |
| npm/package.json 包名 | `dsh-file-review-tab-multi-git-repository` |
| package.json 版本号 | `0.3.6` |
| GitHub Release 标签 | `v0.3.6` |
| Release 安装资产 | `dsh-file-review-tab-multi-git-repository-0.3.6.tgz` |
| 宿主目标与实测 | 正式接口 >=0.2.0；Windows Desktop RC 0.2.0-rc.2 已实装验证；正式版、完整 Web 与其他平台未验证 |
| 侧栏接入 | Desktop 原生右侧栏；dsh-better-sidebar 可选 |

两类文件的用途不同：

- **公开源码仓库**维护 `src/`、`tests/`、`lib/`、README、docs、`package.json`、锁文件、构建配置、`cordis.patch.yml` 和兼容脚本，便于开发、审查和从源码仓库安装。当前保留 `lib/`，保证无需现场构建的 GitHub 仓库安装可用。
- **预构建安装包**由 `pnpm pack` 生成，包含现有 `lib/` 运行产物、声明、插件补丁、文档及目录选择兼容脚本，供用户直接安装。它不包含 `node_modules/`、本地工程配置或本地测试目录。

`dist/` 和 `*.tgz` 已在 `.gitignore` 中忽略。安装包通过 Release 的 **Assets** 上传，不需要强制加入 Git 源码历史。GitHub 自动生成的 Source code.zip / tar.gz 是源码快照，与这里的可安装 `.tgz` 作用不同。

## 2. 在本地生成安装包

在审查插件仓库根目录运行（源码变更后先执行 `pnpm build`）：

~~~powershell
pnpm test:pack
~~~

输出：

~~~text
../../dist/dsh-file-review-tab-multi-git-repository-<版本>.tgz
../../dist/<同名历史包>.tgz.sha256
../../dist/latest/dsh-file-review-tab-multi-git-repository.tgz
../../dist/latest/dsh-file-review-tab-multi-git-repository.tgz.sha256
../../dist/latest/dsh-file-review-tab-multi-git-repository.json
~~~

安装包和摘要统一输出到本多仓工程根目录 `dist/`，从插件目录访问为 `../../dist/`。每次成功打包保存 `<包名>-<版本>.tgz` 版本包，同版本重建覆盖，并将同一份字节复制到 latest 固定文件名；JSON 记录真实版本、SHA256、对应历史包和 `buildTime`，仅保留不同版本的历史包。`buildTime` 为 `lib/client.js` 编译产物的 UTC ISO 8601 生成时间，只重新打包时保留原编译时间。校验失败不更新 latest。独立检出时默认输出到仓库上一级的 `dist/`，也可通过 `MRM_DIST_DIR` 指定目录。当前 `package.json` 没有 `prepack` 或 `prepare` 脚本，`test:pack` 打包并校验已有产物，不执行插件编译。若修改了功能源码，则先更新 `lib/` 并验证功能，再生成安装包。主工程可统一运行 `python envBuild.py pack`，按依赖顺序生成两个包；`desktop install` 默认安装最新配套包，`--archive` 可选择历史包。

脚本已自动生成 SHA256 文件，可在插件目录用 PowerShell 独立复核：

~~~powershell
$archivePath = Join-Path (Get-Location) '..\..\dist\latest\dsh-file-review-tab-multi-git-repository.tgz'
$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
$checksumLine = "$archiveHash  $([System.IO.Path]::GetFileName($archivePath))"
[System.IO.File]::WriteAllText("$archivePath.sha256", "$checksumLine`n", [System.Text.UTF8Encoding]::new($false))
~~~

上述校验文件名为 `dsh-file-review-tab-multi-git-repository.tgz.sha256`。公开 Release 上传时按包内版本将资产命名为上表的带版本文件名，并同步生成文件名对应的 SHA256；本地 latest 固定文件名与公开资产名分别维护。

检查包内容时可使用 `tar -tzf <安装包路径>`，应能找到 `package/package.json`、`package/lib/index.js`、`package/lib/client.js`、`package/cordis.patch.yml`、README、docs 和 LICENSE。这是安装包内容检查，不能替代插件功能验证。

## 3. 提交并推送公开源码

先确认需要公开的修改：

~~~powershell
git status --short
git diff
~~~

按实际修改选择要提交的文件。对于仅修正文档和发布文件清单的修改，可使用：

~~~powershell
git add README.md docs package.json
git commit -m "docs: prepare v0.3.6 release and marketplace instructions"
git push origin main
~~~

如果还有待发布的功能修改，需要同时提交相应 `src/`、已同步的 `lib/`、补丁及依赖文件，不能只提交 README。以上命令针对本工程当前的 `main` 分支；如果在其他分支开发，应先完成合并，再选择相应发布提交。

先推送公开代码，再创建指向该提交的 Release 标签，使标签代码、包版本与上传的安装包对应。

## 4. 创建 GitHub Release

打开 [本工程的 Release 页面](https://github.com/wuqingzhong2020/dsh-file-review-tab-Multi-git-repository/releases)，选择 **Draft a new release**：

1. Tag 填 `v0.3.6`；如尚无标签，选择创建新标签。
2. Target 选择刚推送的发布提交，或已包含该提交的 `main`。
3. 标题填写 `v0.3.6`，说明可复制 [本版本发布说明](releases/version.md#v036) 中的中文或英文更新内容。
4. 选取 latest 索引对应的安装包，按资产名 `dsh-file-review-tab-multi-git-repository-0.3.6.tgz` 上传，并提供文件名对应的 `.sha256`。
5. 核对标签与资产后，点击 **Publish release**。

界面步骤参考 [GitHub 官方 Release 文档](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。创建本地 `.tgz` 不会自动创建 Release，推送 Git 提交也不会自动上传安装资产。

发布完成且资产名称保持一致后，下列下载地址才可用：

~~~text
https://github.com/wuqingzhong2020/dsh-file-review-tab-Multi-git-repository/releases/download/v0.3.6/dsh-file-review-tab-multi-git-repository-0.3.6.tgz
~~~

这里使用固定标签和固定版本文件名。未来发版时同时更新 package.json 版本、Release 标签、资产名称、安装示例和市场条目的 `tarball`；不要让 `latest/download/` 搭配旧版本资产名称。

发布说明与验证记录统一维护在 `docs/releases/version.md`，按版本从新到旧排列。未来发版时在顶部追加对应版本章节，验证记录放在该版本内，不再新建单独的版本文件。

## 5. 申请插件市场收录

截图中的 `dsh-market` 使用 [awesome-dsh-plugin 社区目录](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)。本地安装、推送源码和发布 Release 都不会单独完成收录，需要向目录仓库提交 PR。

### 5.1 添加仓库 Topic

打开插件仓库首页右侧 **About → 齿轮 → Topics**，添加 `dsh-plugin` 并保存。这是仓库主题标签；其添加方式见 [GitHub 官方说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)。

### 5.2 提交目录条目

Fork 社区目录仓库，将本工程提供的 [收录条目模板](market/wuqingzhong2020__dsh-file-review-tab-Multi-git-repository.yml) 复制到你的目录 Fork 中：

~~~text
data/plugins/wuqingzhong2020__dsh-file-review-tab-Multi-git-repository.yml
~~~

再提交 PR 到 `awesome-dsh-plugin/awesome-dsh-plugin`。模板中的 `tarball` 指向本工程的 `v0.3.6` Release；提交前需要先发布 Release、上传同名资产并确认地址可以下载。目录规则以 [贡献指南](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) 为准。

PR 说明应写明：基于 `Lzh3070/dsh-file-review-tab` 扩展，增加工程级多仓库配置、跨仓库 Git 差异、评论及轮次确认，并针对 Desktop 0.2.0-rc.2 原生右侧栏适配。README 已保留直接上游及原始实现的来源说明。

不要修改目录仓库由脚本生成的 README。维护者审核合并后，目录会更新；重新打开插件市场，再按插件名搜索。审核合并和数据同步是两个步骤，不应把「PR 已提交」写成「市场已收录」。

## 6. npm 发布与后续维护

npm 是可选的第二个发布渠道。采用 GitHub Release 路线即可申请收录并提供预构建安装包；在 npm 包真正发布前，README 不使用裸包名作为默认安装命令。

若未来发布 npm，保持包的 `repository` 字段指向本工程仓库，以便市场关联。后续修改公开版本时递增版本，不用同一个 `v0.3.6` 标签反复替换不同功能产物。

本地自测用的 `-file-contents`、`-diff-layouts` 等 tgz 文件名属于开发阶段产物。公开 `v0.3.6` 统一使用标准版本文件名，避免用户混淆要下载的版本。
