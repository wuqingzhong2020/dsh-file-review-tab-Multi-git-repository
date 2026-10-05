# 多仓库管理提取验证

本轮验证的操作、边界与开发流程见 [公共仓库管理依赖与迁移](REPOSITORY_MANAGER.md)。

自动检查覆盖：管理插件独立注册、volatile 配置读取、旧 Profile 索引迁移、五个管理 Remote 的会话 lookup、跨 bundle 配置变化通知、已有项目文件、路径及临时仓库规则；消费者依赖 `0.1.1`、共享工作区、跨仓库撤销与生命周期记录。

浏览器 fixture 同时加载两个实际构建的 `lib/client.js`，验证页签归属、编辑保存和审查范围刷新，使用隔离会话及模拟宿主数据。41 项管理插件测试、167 项审查插件测试、6 项浏览器测试通过。

安装包检查核对 exports、内部 chunks、协议和文件清单；另用临时安装目录检查两个 tgz 的精确版本依赖和实际服务导入，npm 与 pnpm 安装检查均通过。

## 实际 Desktop 验证（2026-10-05）

按用户要求使用 `D:\app\DeepSeekHarnessDesktop\DeepSeek Harness.exe`（`@deepseek-ai/dsh-desktop` 0.2.0-rc.2），在备份 desktop Profile 后安装两个本地 tgz，并将管理插件加入 Profile bundles。

初次提取测试使用管理插件 0.1.0、审查插件 0.3.0；下列记录保留该次实际操作结果。

- 重启成功加载两个插件，已有 ProjectManager 配置识别 17 / 17 个 Git 仓库；管理页签仅有一份。
- 使用已有独立临时样例会话和新增测试 Git 仓库验证路径编辑、工程 JSON 保存及管理插件自己的 Profile 索引。
- 未提交审查展示两个测试仓库的 `sample.txt` 差异；在管理页新增并保存第三个仓库后，已打开的审查面板自动更新为 3 个仓库、6 个文件。
- 原生目录选择器从当前会话工程目录打开，选择工程内仓库后表单使用相对路径。
- 工程外绝对路径标记为“临时”，保存后 JSON 只包含两个工程内仓库；当前会话可审查外部仓库。
- 测试后恢复样例工程配置并重新加载。保留双插件安装，未发布 npm 或 GitHub Release。

实际 Desktop 截图及测试前 Profile 备份保存在工作区根目录的 `.desktop-migration-test/` 中，不随插件发布。`D:\projectZJGG\ref\dsh-file-review` 未修改。

## 原生管理 Tab 与版本升级（2026-10-05）

管理插件 **0.1.1**、审查插件 **0.3.1** 已安装到同一实际 Desktop。审查插件精确依赖管理插件 0.1.1；安装后 Host 和客户端 SHA256 均与构建产物一致。

- 原会话区管理页签移除；右侧「开始」页可打开「多代码仓管理」和「文件审查」原生 Tab。
- 旧 ProjectManager 配置识别 17 / 17 个仓库，样例会话识别 core、cli；切换会话使用对应工程根目录。
- 未保存的仓库名称草稿跨开始页和文件审查 Tab 切换保留，重新加载可恢复保存状态。
- 右侧管理 Tab 保存仓库名称后，未提交审查按共享配置展示两个仓库、五个现有差异文件；恢复原名称后，已打开的审查 Tab 自动刷新。
- 约 400px 右侧栏中的仓库输入、打开／删除按钮及预览表正常使用；浏览器 fixture 同时断言 400px 容器无横向溢出，覆盖中英文。
- 样例 JSON 恢复后与备份逐字节一致，未发送模型消息，未修改 `app.asar`。

本轮 41 项管理测试、167 项审查测试、6 项浏览器测试全部通过，文档和打包检查通过；使用两个实际 tgz 的独立 pnpm 安装及共享 Host 服务检查通过。截图为 `.desktop-migration-test/screenshots/native-manager-narrow-0.1.1.png` 和 `native-tabs-review-0.3.1.png`，备份位于 `native-tab-profile-backup/`。
