/**
 * Minimal zh/en copy for the file-review sidebar tab. Follows the DSH i18n
 * system: the client apply attaches the locale service (`ctx.locale`,
 * provided by `@deepseek-ai/dsh-client-locale`) through {@link attachLocale},
 * and `t()` resolves the active locale from it. Without an attached service
 * (standalone/test compositions) the browser language is used. Mirrors the
 * dsh-better-sidebar locales pattern.
 */

/** The dictionary namespace this plugin owns in the DSH locale registry. */
export const LOCALE_NS = 'fileReviewTab'

/** The zh dictionary (the key-set source of truth). */
export const zh = {
  tabTitle: '文件审查',
  empty: '本会话暂无文件改动',
  sessionUnavailable: '会话不可用',
  remoteUnavailable: '文件审查服务不可用',
  turn: '第 {n} 轮',
  turnLive: '进行中',
  files: '{count} 个文件',
  filesOne: '1 个文件',
  undo: '撤销',
  redo: '重新应用',
  undoing: '正在撤销…',
  redoing: '正在重新应用…',
  undoTurn: '撤销本轮',
  redoTurn: '重新应用本轮',
  toggleUnavailable: '没有可安全还原的文件',
  stateUndone: '已撤销',
  stateConflict: '内容冲突',
  stateUnsupported: '不可还原',
  stateError: '错误',
  deleted: '已删除',
  deletedHint: '该文件在本轮中被终端命令删除，内容已不存在，无法查看差异或撤销。',
  archived: '已归档 {n} 轮',
  archivedExpand: '展开已归档轮次',
  archivedCollapse: '收起已归档轮次',
  loadMore: '加载更多（还有 {n} 轮）',
  undoSuccess: '已成功撤销更改',
  redoSuccess: '已成功重新应用更改',
  undoPartial: '部分文件未能撤销',
  redoPartial: '部分文件未能重新应用',
  toggleError: '操作失败',
  openInEditor: '在编辑器中打开',
  open: '打开 {name}',
  copy: '复制差异',
  copied: '已复制',
  showUnchanged: '显示 {count} 行未更改内容',
  hideUnchanged: '隐藏 {count} 行未更改内容',
  stats: '新增 {added} 行，删除 {removed} 行',
  unavailable: '无法为此更改还原可审查的差异。',
  refresh: '刷新状态',
  projectTab: '多代码仓管理',
  projectCurrentRoot: '当前工程目录',
  projectIntro: '为当前工程增删改 Git 仓库，保存到工程目录中的配置文件。仓库路径以当前工程目录为基准。',
  projectSave: '保存配置',
  projectReload: '重新加载已保存配置',
  projectSaved: '项目配置已保存',
  projectWorking: '处理中…',
  projectName: '项目名称',
  projectConfigFile: '工程配置文件（相对工程目录）',
  projectInactive: '当前工程尚未保存配置文件（dsh-file-review-repositories.json）。点击上方「保存配置」即可保存并启用多代码仓。',
  projectEnable: '启用多代码仓管理',
  projectDisabledHint: '已停用多代码仓管理，审查将按原有单目录方式进行；保存配置后生效。',
  projectIncludeRoot: '同时审查项目根目录内的文件',
  projectFiles: '仓库清单文件（每行一个，可选）',
  projectFilesHint: '支持 INI 的 [仓库名] / path 字段、.gitmodules，以及 JSON 的 repositories 数组；清单文件路径可相对项目根目录或使用绝对路径。',
  projectRepos: '代码仓库',
  projectReposHint: '直接编辑仓库名称和相对工程目录的路径；同盘绝对路径保存时会转换为相对路径。',
  projectImportHint: '已导入原有仓库清单；保存后将写入本工程配置文件，不再依赖原清单。',
  projectAddRepo: '添加仓库',
  projectOpenRepo: '打开',
  projectRemoveRepo: '删除',
  projectTemporary: '临时使用，不保存',
  projectTemporaryHint: '该目录无法相对当前工程表示，只在本会话使用；保存配置时不会写入文件。',
  projectPickerUnavailable: '当前 Desktop 没有提供目录选择服务',
  projectPickerInvalid: '目录选择器没有返回绝对路径',
  projectDeleteTitle: '确认删除仓库？',
  projectDeleteDescription: '确定从列表移除“{name}”吗？不会删除磁盘目录；保存配置后列表改动才会写入文件。',
  projectCancel: '取消',
  projectResolved: '已识别 {count} / {total} 个 Git 仓库',
  projectPath: '路径（相对工程）',
  projectState: '状态',
  projectRootSource: '项目根目录',
  projectManual: '手动配置',
  repository: '仓库',
  repoReady: '可用',
  repoMissing: '路径不存在',
  repoNotGit: '不是 Git 根目录',
  repoAll: '全部仓库',
  repoOther: '其他文件',
  repoScope: '{name} · {count} 个仓库',
  repoFilterEmpty: '此仓库暂无会话文件改动',
  repoSettingsHint: '仓库来源和维护范围可在会话的“多代码仓管理”页签中配置',
} as const

/** Union of this namespace's dictionary keys. */
export type CopyKey = keyof typeof zh

/** The en dictionary. */
export const en: Record<CopyKey, string> = {
  tabTitle: 'File Review',
  empty: 'No file changes in this session yet',
  sessionUnavailable: 'Session is unavailable',
  remoteUnavailable: 'File review service is unavailable',
  turn: 'Turn {n}',
  turnLive: 'in progress',
  files: '{count} files',
  filesOne: '1 file',
  undo: 'Undo',
  redo: 'Reapply',
  undoing: 'Undoing…',
  redoing: 'Reapplying…',
  undoTurn: 'Undo turn',
  redoTurn: 'Reapply turn',
  toggleUnavailable: 'No safely reversible files are available',
  stateUndone: 'undone',
  stateConflict: 'conflict',
  stateUnsupported: 'not reversible',
  stateError: 'error',
  deleted: 'deleted',
  deletedHint: 'This file was deleted by a terminal command in this turn; its content is gone, so no diff or undo is available.',
  archived: 'Archived turns ({n})',
  archivedExpand: 'Expand archived turns',
  archivedCollapse: 'Collapse archived turns',
  loadMore: 'Load more ({n} more turns)',
  undoSuccess: 'Changes undone',
  redoSuccess: 'Changes reapplied',
  undoPartial: 'Some files could not be undone',
  redoPartial: 'Some files could not be reapplied',
  toggleError: 'Operation failed',
  openInEditor: 'Open in editor',
  open: 'Open {name}',
  copy: 'Copy diff',
  copied: 'Copied',
  showUnchanged: '{count} unchanged lines',
  hideUnchanged: 'Hide {count} unchanged lines',
  stats: '{added} lines added, {removed} lines removed',
  unavailable: 'No reconstructable diff is available for this change.',
  refresh: 'Refresh status',
  projectTab: 'Multi-repository management',
  projectCurrentRoot: 'Current project directory',
  projectIntro: 'Add, edit, and remove Git repositories for this project. Save them to a configuration file in the project directory. Paths are relative to the project directory.',
  projectSave: 'Save configuration',
  projectReload: 'Reload saved configuration',
  projectSaved: 'Project configuration saved',
  projectWorking: 'Working…',
  projectName: 'Project name',
  projectConfigFile: 'Project configuration file (relative to project)',
  projectInactive: 'This project has no saved configuration file (dsh-file-review-repositories.json) yet. Click "Save configuration" above to create and enable it.',
  projectEnable: 'Enable multi-repository management',
  projectDisabledHint: 'Multi-repository management is disabled. Review will use single-directory scope; save configuration to apply.',
  projectIncludeRoot: 'Also review files within the project root',
  projectFiles: 'Repository manifests (one per line, optional)',
  projectFilesHint: 'Supports INI [repository] / path fields, .gitmodules, and JSON repositories arrays. Manifest paths may be relative to the project root or absolute.',
  projectRepos: 'Repositories',
  projectReposHint: 'Edit repository names and paths relative to the project directory. Absolute paths on the same volume are converted when saved.',
  projectImportHint: 'Existing manifest entries have been imported. Saving writes the project configuration file and removes the manifest dependency.',
  projectAddRepo: 'Add repository',
  projectOpenRepo: 'Open',
  projectRemoveRepo: 'Remove',
  projectTemporary: 'Temporary, not saved',
  projectTemporaryHint: 'This directory cannot be relative to the project. It is available in this session only and will not be written to the configuration file.',
  projectPickerUnavailable: 'Directory picker is unavailable in this Desktop',
  projectPickerInvalid: 'The directory picker did not return an absolute path',
  projectDeleteTitle: 'Remove this repository?',
  projectDeleteDescription: 'Remove “{name}” from the list? The directory on disk stays intact; the list change is written when you save.',
  projectCancel: 'Cancel',
  projectResolved: '{count} / {total} Git repositories available',
  projectPath: 'Path (relative to project)',
  projectState: 'Status',
  projectRootSource: 'Project root',
  projectManual: 'Manual',
  repository: 'Repository',
  repoReady: 'Ready',
  repoMissing: 'Missing path',
  repoNotGit: 'Not a Git root',
  repoAll: 'All repositories',
  repoOther: 'Other files',
  repoScope: '{name} · {count} repositories',
  repoFilterEmpty: 'No session changes in this repository',
  repoSettingsHint: 'Configure repository sources and scope in this conversation’s Multi-repository management tab',
}

/** The DSH locale service attached by the client apply (absent → browser detection). */
let localeService: { getSnapshot(): { active: string } } | undefined

/** Attach (or detach, with undefined) the DSH locale service. */
export function attachLocale(service: { getSnapshot(): { active: string } } | undefined): void {
  localeService = service
}

/** The active locale id ('zh' | 'en'): the DSH locale service's snapshot when attached. */
function activeLocale(): string {
  return localeService?.getSnapshot().active
    ?? (typeof navigator !== 'undefined' ? navigator.language : '')
    ?? 'en'
}

/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
export function t(key: CopyKey, params?: Record<string, string | number>): string {
  const dict = activeLocale().toLowerCase().startsWith('zh') ? zh : en
  let text: string = dict[key]
  if (params !== undefined) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
