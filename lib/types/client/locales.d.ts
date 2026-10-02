/**
 * Minimal zh/en copy for the file-review sidebar tab. Follows the DSH i18n
 * system: the client apply attaches the locale service (`ctx.locale`,
 * provided by `@deepseek-ai/dsh-client-locale`) through {@link attachLocale},
 * and `t()` resolves the active locale from it. Without an attached service
 * (standalone/test compositions) the browser language is used. Mirrors the
 * dsh-better-sidebar locales pattern.
 */
/** The dictionary namespace this plugin owns in the DSH locale registry. */
export declare const LOCALE_NS = "fileReviewTab";
/** The zh dictionary (the key-set source of truth). */
export declare const zh: {
    readonly tabTitle: "文件审查";
    readonly commentAddLine: "添加行评论";
    readonly commentAddFile: "评论";
    readonly commentWholeFile: "整个文件";
    readonly commentOldLine: "旧版第 {line} 行";
    readonly commentNewLine: "新版第 {line} 行";
    readonly commentYou: "你";
    readonly commentPlaceholder: "添加一条修改意见…";
    readonly commentAdd: "评论";
    readonly commentSave: "保存评论";
    readonly commentEdit: "编辑";
    readonly commentDraft: "待提交";
    readonly commentPending: "修改意见（{count}）";
    readonly commentSubmit: "提交修改意见";
    readonly commentSending: "正在提交…";
    readonly commentList: "待提交的修改意见";
    readonly commentEmpty: "悬停代码行并点击「＋」，或点击文件旁的「评论」添加修改意见。";
    readonly commentDraftHint: "评论保存在当前会话；点击「提交修改意见」将这些意见汇总发送给当前会话中的 Agent。";
    readonly commentSendHint: "将全部待提交意见发送给当前会话；Agent 忙碌时按新一轮消息排队";
    readonly commentFinishEditing: "请先保存或取消正在编辑的评论";
    readonly commentSent: "修改意见已发送给当前会话";
    readonly commentSendFailed: "提交失败，评论已保留，可重试";
    readonly commentStorageError: "评论目前保留在内存中，本地草稿存储不可用或已损坏；关闭应用可能丢失未提交意见。";
    readonly commentChanged: "差异已变化；以下评论保留原始位置和参考代码。";
    readonly commentFile: "文件";
    readonly commentSource: "审查来源";
    readonly commentReference: "参考代码（> 标记评论行）";
    readonly commentOpinion: "修改意见";
    readonly commentPrompt: "请根据以下文件审查意见修改当前工程，并完成必要验证。先读取当前文件，核对参考代码及新旧版本；历史轮次和 Git 差异中的行号可能已经变化，请按当前内容定位。对删除行的评论引用的是旧版代码。完成后说明每条意见的处理结果。";
    readonly reviewScope: "审查范围";
    readonly reviewLastTurn: "上一轮";
    readonly reviewSession: "本会话";
    readonly reviewPending: "待确认";
    readonly reviewPendingHint: "仅显示未确认轮次；确认后隐藏，可在“本会话”中取消确认。";
    readonly pendingEmpty: "本会话暂无待确认的文件改动";
    readonly pendingRepoEmpty: "此仓库暂无待确认的文件改动";
    readonly confirmTurn: "确认本轮";
    readonly unconfirmTurn: "取消确认";
    readonly turnConfirmed: "已确认";
    readonly confirmTurnHint: "确认本轮全部仓库的改动（{count} 个文件），从“待确认”中隐藏";
    readonly unconfirmTurnHint: "将本轮重新放回“待确认”";
    readonly confirmTurnLive: "本轮仍在修改代码，结束后才能确认";
    readonly confirmationStorageError: "确认状态目前仅保留在内存中，本地存储不可用或已损坏；重启后需重新确认。";
    readonly reviewUncommitted: "未提交";
    readonly reviewUnstaged: "未暂存";
    readonly reviewStaged: "已暂存";
    readonly reviewCommit: "已提交";
    readonly reviewBranch: "分支";
    readonly reviewHead: "最新提交（HEAD）";
    readonly reviewAutoBranch: "自动选择基准分支";
    readonly reviewSelectRepository: "选择单个仓库后，可指定提交或基准分支；全部仓库按各自的最新提交或默认分支审查。";
    readonly reviewGitHint: "查看 Git 差异；不修改工作区、暂存区或提交。";
    readonly reviewRepoCount: "{count} 个仓库";
    readonly reviewLoading: "正在加载差异…";
    readonly reviewGitEmpty: "当前范围暂无 Git 改动";
    readonly reviewNoGit: "当前范围没有可用的 Git 仓库";
    readonly reviewFiles: "{count} 个文件";
    readonly reviewBinary: "二进制";
    readonly reviewBinaryHint: "二进制文件、符号链接或超出大小限制，无法显示文本差异。";
    readonly reviewMetadataOnly: "仅有重命名或文件模式变化，没有文本差异。";
    readonly empty: "本会话暂无文件改动";
    readonly sessionUnavailable: "会话不可用";
    readonly remoteUnavailable: "文件审查服务不可用";
    readonly turn: "第 {n} 轮";
    readonly turnLive: "进行中";
    readonly files: "{count} 个文件";
    readonly filesOne: "1 个文件";
    readonly undo: "撤销";
    readonly redo: "重新应用";
    readonly undoing: "正在撤销…";
    readonly redoing: "正在重新应用…";
    readonly undoTurn: "撤销本轮";
    readonly redoTurn: "重新应用本轮";
    readonly toggleUnavailable: "没有可安全还原的文件";
    readonly stateUndone: "已撤销";
    readonly stateConflict: "内容冲突";
    readonly stateUnsupported: "不可还原";
    readonly stateError: "错误";
    readonly deleted: "已删除";
    readonly deletedHint: "该文件在本轮中被终端命令删除，内容已不存在，无法查看差异或撤销。";
    readonly archived: "已归档 {n} 轮";
    readonly archivedExpand: "展开已归档轮次";
    readonly archivedCollapse: "收起已归档轮次";
    readonly loadMore: "加载更多（还有 {n} 轮）";
    readonly undoSuccess: "已成功撤销更改";
    readonly redoSuccess: "已成功重新应用更改";
    readonly undoPartial: "部分文件未能撤销";
    readonly redoPartial: "部分文件未能重新应用";
    readonly toggleError: "操作失败";
    readonly openInEditor: "在编辑器中打开";
    readonly open: "打开 {name}";
    readonly copy: "复制差异";
    readonly copied: "已复制";
    readonly showUnchanged: "显示 {count} 行未更改内容";
    readonly hideUnchanged: "隐藏 {count} 行未更改内容";
    readonly expandContext: "展开 {count} 行未修改代码（剩余 {remaining} 行）";
    readonly collapseContext: "收起展开的上下文";
    readonly unavailableContext: "省略 {count} 行：历史记录未包含这些代码";
    readonly diffLayout: "差异布局";
    readonly diffSplit: "并排";
    readonly diffUnified: "统一";
    readonly diffWrap: "自动换行";
    readonly diffOld: "旧版";
    readonly diffNew: "新版";
    readonly collapseRepositoryFiles: "收起 {name} 的文件内容";
    readonly expandRepositoryFiles: "展开 {name} 的文件内容";
    readonly collapseTurnRepositories: "收起本轮全部仓库的文件内容";
    readonly expandTurnRepositories: "展开本轮全部仓库的文件内容";
    readonly collapseAllRepositories: "收起全部仓库的文件内容";
    readonly expandAllRepositories: "展开全部仓库的文件内容";
    readonly stats: "新增 {added} 行，删除 {removed} 行";
    readonly unavailable: "无法为此更改还原可审查的差异。";
    readonly refresh: "刷新状态";
    readonly projectTab: "多代码仓管理";
    readonly projectCurrentRoot: "当前工程目录";
    readonly projectIntro: "为当前工程增删改 Git 仓库，保存到工程目录中的配置文件。仓库路径以当前工程目录为基准。";
    readonly projectSave: "保存配置";
    readonly projectGenerate: "生成新配置文件";
    readonly projectReload: "重新加载已保存配置";
    readonly projectSaved: "项目配置已保存";
    readonly projectWorking: "处理中…";
    readonly projectName: "项目名称";
    readonly projectConfigFile: "工程配置文件（相对工程目录）";
    readonly projectInactive: "当前工程没有配置文件（dsh-file-review-repositories.json）。点击上方「生成新配置文件」保存当前列表。";
    readonly projectEnable: "启用多代码仓管理";
    readonly projectDisabledHint: "已停用多代码仓管理，审查将按原有单目录方式进行；保存配置后生效。";
    readonly projectIncludeRoot: "同时审查项目根目录内的文件";
    readonly projectFiles: "仓库清单文件（每行一个，可选）";
    readonly projectFilesHint: "支持 INI 的 [仓库名] / path 字段、.gitmodules，以及 JSON 的 repositories 数组；清单文件路径可相对项目根目录或使用绝对路径。";
    readonly projectRepos: "代码仓库";
    readonly projectReposHint: "工程内的仓库使用相对路径；工程外的仓库使用绝对路径，仅临时使用，不写入配置文件。";
    readonly projectImportHint: "已导入原有仓库清单；保存后将写入本工程配置文件，不再依赖原清单。";
    readonly projectAddRepo: "添加仓库";
    readonly projectOpenRepo: "打开";
    readonly projectRemoveRepo: "删除";
    readonly projectTemporary: "临时使用，不保存";
    readonly projectTemporaryShort: "临时";
    readonly projectTemporaryHint: "该仓库位于当前工程目录外，只在本会话临时使用，不写入配置文件。";
    readonly projectPickerUnavailable: "目录选择服务不可用，或尚未安装 Desktop 起始目录适配；请更新适配后重启应用";
    readonly projectPickerInvalid: "目录选择器没有返回绝对路径";
    readonly projectDeleteTitle: "确认删除仓库？";
    readonly projectDeleteDescription: "确定从列表移除“{name}”吗？不会删除磁盘目录；保存配置后列表改动才会写入文件。";
    readonly projectCancel: "取消";
    readonly projectResolved: "已识别 {count} / {total} 个 Git 仓库";
    readonly projectPath: "路径（工程内相对，工程外绝对）";
    readonly projectState: "状态";
    readonly projectRootSource: "项目根目录";
    readonly projectManual: "手动配置";
    readonly repository: "仓库";
    readonly repoReady: "可用";
    readonly repoMissing: "路径不存在";
    readonly repoNotGit: "不是 Git 根目录";
    readonly repoAll: "全部仓库";
    readonly repoOther: "其他文件";
    readonly repoScope: "{name} · {count} 个仓库";
    readonly repoFilterEmpty: "此仓库暂无会话文件改动";
    readonly repoSettingsHint: "仓库来源和维护范围可在会话的“多代码仓管理”页签中配置";
};
/** Union of this namespace's dictionary keys. */
export type CopyKey = keyof typeof zh;
/** The en dictionary. */
export declare const en: Record<CopyKey, string>;
/** Attach (or detach, with undefined) the DSH locale service. */
export declare function attachLocale(service: {
    getSnapshot(): {
        active: string;
    };
} | undefined): void;
/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
export declare function t(key: CopyKey, params?: Record<string, string | number>): string;
//# sourceMappingURL=locales.d.ts.map