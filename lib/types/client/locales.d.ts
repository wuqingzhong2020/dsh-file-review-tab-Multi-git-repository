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
    readonly stats: "新增 {added} 行，删除 {removed} 行";
    readonly unavailable: "无法为此更改还原可审查的差异。";
    readonly refresh: "刷新状态";
    readonly projectTab: "多代码仓管理";
    readonly projectCurrentRoot: "当前工程目录";
    readonly projectIntro: "为当前工程增删改 Git 仓库，保存到工程目录中的配置文件。仓库路径以当前工程目录为基准。";
    readonly projectSave: "保存配置";
    readonly projectReload: "重新加载已保存配置";
    readonly projectSaved: "项目配置已保存";
    readonly projectWorking: "处理中…";
    readonly projectName: "项目名称";
    readonly projectConfigFile: "工程配置文件（相对工程目录）";
    readonly projectInactive: "当前工程尚未保存配置文件（dsh-file-review-repositories.json）。点击上方「保存配置」即可保存并启用多代码仓。";
    readonly projectEnable: "启用多代码仓管理";
    readonly projectDisabledHint: "已停用多代码仓管理，审查将按原有单目录方式进行；保存配置后生效。";
    readonly projectIncludeRoot: "同时审查项目根目录内的文件";
    readonly projectFiles: "仓库清单文件（每行一个，可选）";
    readonly projectFilesHint: "支持 INI 的 [仓库名] / path 字段、.gitmodules，以及 JSON 的 repositories 数组；清单文件路径可相对项目根目录或使用绝对路径。";
    readonly projectRepos: "代码仓库";
    readonly projectReposHint: "直接编辑仓库名称和相对工程目录的路径；同盘绝对路径保存时会转换为相对路径。";
    readonly projectImportHint: "已导入原有仓库清单；保存后将写入本工程配置文件，不再依赖原清单。";
    readonly projectAddRepo: "添加仓库";
    readonly projectOpenRepo: "打开";
    readonly projectRemoveRepo: "删除";
    readonly projectTemporary: "临时使用，不保存";
    readonly projectTemporaryHint: "该目录无法相对当前工程表示，只在本会话使用；保存配置时不会写入文件。";
    readonly projectPickerUnavailable: "当前 Desktop 没有提供目录选择服务";
    readonly projectPickerInvalid: "目录选择器没有返回绝对路径";
    readonly projectDeleteTitle: "确认删除仓库？";
    readonly projectDeleteDescription: "确定从列表移除“{name}”吗？不会删除磁盘目录；保存配置后列表改动才会写入文件。";
    readonly projectCancel: "取消";
    readonly projectResolved: "已识别 {count} / {total} 个 Git 仓库";
    readonly projectPath: "路径（相对工程）";
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