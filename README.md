# dsh-file-review-tab-multi-git-repository

把 [dsh-file-review](https://github.com/left0ver/dsh-file-review)（作者 [left0ver](https://github.com/left0ver)）的「改动审查」能力移植为 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 的侧边栏 Tab，并保留对话尾部的审查行。适配 DeepSeek Harness 桌面版 0.2.0-rc.2 与 dsh-better-sidebar 0.24.1；宿主自带的改动摘要、审查页及文件提及功能保持启用。

## 功能

- **对话尾部审查行**：回合结束出现「已编辑 N 个文件 +M −K / 撤销 / 审查」；点「审查」或单个文件名，**深链打开侧边栏 Tab，自动展开对应文件的 diff 并定位到该轮分组顶部**（不再弹全宽 drawer）。这是与宿主原生改动卡并存的独立列表条目，不会替换或禁用原生改动卡。
- **侧边栏 Tab「文件审查」**：按轮次分组列出本会话改动文件；点击展开行级红绿 diff；支持撤销本轮 / 单文件撤销 / 重新应用；Tab 角标实时显示改动文件数。
- **删除文件可见**：dsh 没有删除文件的工具，删除发生在终端命令里——插件解析 `rm` 族命令（`rm` / `rmdir` / `unlink` / `Remove-Item` / `del` / `rd` 等）的字面路径参数，被删文件以「已删除」标记出现在两个入口（内容已不存在，故无行级 diff、不可撤销）。带通配符（`rm *.log`）或命令替换（`rm $(...)`）的删除不识别——受影响文件事后无法枚举。
- **自动归档**：主列表只保留最近 5 轮（进行中的轮次永不归档），更早的已完成轮次沉入底部「已归档 N 轮」折叠区。折叠时归档内容零渲染，展开后每页加载 10 轮（「加载更多」续页），diff 行另有懒挂载——长会话不再一次性挂载几十个 diff 组。深链跳到已归档轮次会自动展开并定位；展开状态按会话记忆；角标只统计主列表。
- **PTC / Code Mode 支持**：`run_code` 程序内部的 `edit`/`write` 子调用也会被捕获——Host 端快照完整 before/after，浏览器端重建带行号的行级 hunks 并入所属轮次；diff 查看、状态检查、撤销/重做均可用。标准模式行为不变（对话尾部审查行仍只覆盖标准模式轮次）。
- **会话隔离**：每个会话只看自己的改动；Tab 不可见时暂停状态巡检。
- **窄容器自适应**：侧栏半宽分屏下，轮次头部自动换行、次要信息（行数统计、「在编辑器中打开」）让位，撤销操作与文件名始终完整。
- **样式隔离**：全部 CSS Module + 宿主 `--dsw-alias-*` 主题令牌，不与对话区或其他插件冲突。

![对话尾部的审查行：已编辑 N 个文件、撤销与审查按钮、文件名列表](docs/screenshot.png)

## 安装

```sh
# 普通 dsh Profile
dsh plugin --profile desktop add dsh-file-review-tab-multi-git-repository

# 从 GitHub 安装
dsh plugin --profile desktop add github:wuqingzhong2020/dsh-file-review-tab-Multi-git-repository

# 独立 Web Profile
dsh plugin --profile web add dsh-file-review-tab-multi-git-repository
```

对于安装在 `D:\app\DeepSeekHarnessDesktop` 的 DeepSeek Harness Desktop 0.2.0-rc.2，本仓库会生成可安装包 `dist/dsh-file-review-tab-multi-git-repository-0.1.0.tgz`。桌面应用独占 `desktop` Profile，不能通过普通 `dsh plugin --profile desktop` 命令修改；在 PowerShell 中运行以下命令，把包直接安装到桌面的 Profile：

```powershell
pnpm --dir "$env:USERPROFILE\.dsh\profiles\desktop" add "<本仓库路径>\dist\dsh-file-review-tab-multi-git-repository-0.1.0.tgz"
```

桌面版安装后请重启应用，让 Host 与 Web 插件重新加载。确认 `package.json` 使用 `dsh-better-sidebar` **0.24.1**；在已安装桌面的设置与侧边栏中打开「文件审查」。

前置依赖：DeepSeek Harness 桌面版 / Web **0.2.0-rc.2** + [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) **0.24.1**。本版本针对这组接口构建并完成静态检查；旧版宿主请使用旧包 `dsh-file-review-tab@0.5.x`（DSH 0.1.5）或 `@0.4.1`（更早版本）。

在桌面版中，安装的新组合包通常会由热重载自动加载；若侧栏未出现「文件审查」，请重启桌面版。独立 Web Profile 若未启用热重载，则需重启 `dsh web`。加载后，在 better-sidebar 侧栏「+」菜单中打开「文件审查」。宿主原生改动卡仍会显示；插件 Tab 另外列出文件工具（包括 `run_code` 子调用）产生的改动，嵌套仓库中的文件工具改动也按会话工作区路径处理。纯终端/Git 修改（删除操作除外）不会完整显示，会话工作区外的路径也不可撤销；请将本 Tab 作为宿主原生改动卡的补充，而非 Git 工作树的完整替代视图。

## 致谢

核心 diff 渲染器与撤销服务移植自 [left0ver/dsh-file-review](https://github.com/left0ver/dsh-file-review)（MIT 许可证，© ZhangWenChao）。侧边栏集成基于 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 开放的 `ctx.betterSidebar` 注册 API。

## 许可证

[MIT](./LICENSE)
