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
import { readingZh, readingEn } from './reading-locales.ts'

/** The zh dictionary (the key-set source of truth). */
export const zh = {
  ...readingZh,
  tabTitle: '文件审查',
  userGuide: '操作指南', userGuideOpening: '正在打开…', userGuideHint: '打开支持图片预览的使用手册',
  userGuideFailed: '无法打开操作指南。',
  userGuideServiceUnavailable: '使用手册服务不可用；安装或更新插件后，请完整退出并重启 Desktop，再重试。',
  userGuideViewerUnavailable: '操作指南页签不可用，请检查 dsh-better-sidebar 是否启用。',
  userGuideImageOpen: '查看图片', userGuideImageDialog: '截图预览', userGuideImageClose: '关闭图片',
  userGuideImageLoading: '正在加载图片…', userGuideImageFailed: '图片加载失败', userGuideCodeCopy: '复制代码', userGuideFootnotes: '脚注',
  commentAddLine: '添加行评论', commentAddFile: '评论', commentWholeFile: '整个文件',
  commentOldLine: '旧版第 {line} 行', commentNewLine: '新版第 {line} 行',
  commentYou: '你', commentPlaceholder: '添加一条修改意见…', commentAdd: '评论', commentSave: '保存评论', commentEdit: '编辑',
  commentDraft: '待提交', commentPending: '修改意见（{count}）', commentSubmit: '提交修改意见', commentSending: '正在提交…',
  commentList: '待提交的修改意见', commentEmpty: '悬停代码行并点击「＋」，或点击文件旁的「评论」添加修改意见。',
  commentDraftHint: '评论保存在当前会话；点击「提交修改意见」将这些意见汇总发送给当前会话中的 Agent。',
  commentSendHint: '将全部待提交意见发送给当前会话；Agent 忙碌时按新一轮消息排队',
  commentFinishEditing: '请先保存或取消正在编辑的评论', commentSent: '修改意见已发送给当前会话',
  commentSendFailed: '提交失败，评论已保留，可重试', commentStorageError: '评论目前保留在内存中，本地草稿存储不可用或已损坏；关闭应用可能丢失未提交意见。',
  commentChanged: '差异已变化；以下评论保留原始位置和参考代码。',
  commentFile: '文件', commentSource: '审查来源', commentReference: '参考代码（> 标记评论行）', commentOpinion: '修改意见',
  commentPrompt: '请根据以下文件审查意见修改当前工程，并完成必要验证。先读取当前文件，核对参考代码及新旧版本；历史轮次和 Git 差异中的行号可能已经变化，请按当前内容定位。对删除行的评论引用的是旧版代码。完成后说明每条意见的处理结果。',
  reviewScope: '审查范围', reviewLastTurn: '上一轮', reviewSession: '本会话', reviewPending: '待确认',
  reviewPendingHint: '仅显示未确认轮次；确认后隐藏，可在“本会话”中取消确认。',
  pendingEmpty: '本会话暂无待确认的文件改动', pendingRepoEmpty: '此仓库暂无待确认的文件改动',
  confirmTurn: '确认本轮', unconfirmTurn: '取消确认', turnConfirmed: '已确认',
  confirmTurnHint: '确认本轮全部仓库的改动（{count} 个文件），从“待确认”中隐藏',
  unconfirmTurnHint: '将本轮重新放回“待确认”', confirmTurnLive: '本轮仍在修改代码，结束后才能确认',
  confirmationStorageError: '确认状态目前仅保留在内存中，本地存储不可用或已损坏；重启后需重新确认。',
  reviewUncommitted: '未提交', reviewUnstaged: '未暂存', reviewStaged: '已暂存', reviewCommit: '已提交', reviewBranch: '分支',
  reviewHead: '最新提交（HEAD）', reviewAutoBranch: '自动选择基准分支',
  reviewSelectRepository: '选择单个仓库后，可指定提交或基准分支；全部仓库按各自的最新提交或默认分支审查。',
  reviewGitHint: '查看 Git 差异；不修改工作区、暂存区或提交。',
  reviewRepoCount: '{count} 个仓库', reviewLoading: '正在加载差异…', reviewGitEmpty: '当前范围暂无 Git 改动', reviewNoGit: '当前范围没有可用的 Git 仓库',
  reviewFiles: '{count} 个文件', reviewBinary: '二进制', reviewBinaryHint: '二进制文件、符号链接或超出大小限制，无法显示文本差异。', reviewMetadataOnly: '仅有重命名或文件模式变化，没有文本差异。',
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
  expandContext: '展开 {count} 行未修改代码（剩余 {remaining} 行）',
  expandAllContextUp: '向上展开全部 {count} 行未修改代码',
  expandAllContextDown: '向下展开全部 {count} 行未修改代码',
  collapseContextGap: '收起这段已展开的未修改代码（{count} 行）',
  diffSettings: '设置',
  diffSettingsSave: '保存',
  diffContextExpansionLines: '每次展开的未修改代码行数',
  diffContextExpansionHint: '请输入正整数，默认 20 行。设置保存在本地，适用于统一和并排视图。',
  collapseContext: '收起展开的上下文',
  unavailableContext: '省略 {count} 行：历史记录未包含这些代码',
  diffLayout: '差异布局', diffSplit: '并排', diffUnified: '统一', diffWrap: '自动换行', diffOld: '旧版', diffNew: '新版',
  diffSearch: '搜索', diffSearchShortcut: '搜索当前文件（Ctrl/Cmd+F）', diffSearchQuery: '在已记录代码中搜索',
  diffSearchSide: '搜索版本', diffSearchBoth: '新旧版本', diffSearchCase: '区分大小写', diffSearchWord: '整词',
  diffSearchCount: '{current} / {count}', diffSearchLimited: '前 {count} 处匹配', diffSearchRecorded: '仅搜索已记录的代码',
  diffSearchPrevious: '上一处匹配（Shift+Enter / Shift+F3）', diffSearchNext: '下一处匹配（Enter / F3）', diffSearchClose: '关闭搜索（Esc）',
  diffPreviousChange: '上一处改动', diffNextChange: '下一处改动', diffPreviousChangeShortcut: '上一处改动（Ctrl/Cmd+↑）', diffNextChangeShortcut: '下一处改动（Ctrl/Cmd+↓）',
  diffChangeNavigation: '跳转到改动块', diffChangeCount: '{count} 处改动', diffChangePosition: '改动 {current} / {count}',
  diffSyntaxLanguage: '语法高亮语言', diffPlainText: '纯文本',
  collapseRepositoryFiles: '收起 {name} 的文件内容', expandRepositoryFiles: '展开 {name} 的文件内容',
  collapseTurnRepositories: '收起本轮全部仓库的文件内容', expandTurnRepositories: '展开本轮全部仓库的文件内容',
  collapseAllRepositories: '收起全部仓库的文件内容', expandAllRepositories: '展开全部仓库的文件内容',
  stats: '新增 {added} 行，删除 {removed} 行',
  unavailable: '无法为此更改还原可审查的差异。',
  refresh: '刷新状态',
  projectTab: '多代码仓管理',
  projectCurrentRoot: '当前工程目录',
  projectIntro: '为当前工程增删改 Git 仓库，保存到工程目录中的配置文件。仓库路径以当前工程目录为基准。',
  projectSave: '保存配置',
  projectGenerate: '生成新配置文件',
  projectReload: '重新加载已保存配置',
  projectSaved: '项目配置已保存',
  projectWorking: '处理中…',
  projectName: '项目名称',
  projectConfigFile: '工程配置文件（相对工程目录）',
  projectInactive: '当前工程没有配置文件（dsh-file-review-repositories.json）。点击上方「生成新配置文件」保存当前列表。',
  projectEnable: '启用多代码仓管理',
  projectDisabledHint: '已停用多代码仓管理，审查将按原有单目录方式进行；保存配置后生效。',
  projectIncludeRoot: '同时审查项目根目录内的文件',
  projectFiles: '仓库清单文件（每行一个，可选）',
  projectFilesHint: '支持 INI 的 [仓库名] / path 字段、.gitmodules，以及 JSON 的 repositories 数组；清单文件路径可相对项目根目录或使用绝对路径。',
  projectRepos: '代码仓库',
  projectReposHint: '工程内的仓库使用相对路径；工程外的仓库使用绝对路径，仅临时使用，不写入配置文件。',
  projectImportHint: '已导入原有仓库清单；保存后将写入本工程配置文件，不再依赖原清单。',
  projectAddRepo: '添加仓库',
  projectOpenRepo: '打开',
  projectRemoveRepo: '删除',
  projectTemporary: '临时使用，不保存',
  projectTemporaryShort: '临时',
  projectTemporaryHint: '该仓库位于当前工程目录外，只在本会话临时使用，不写入配置文件。',
  projectPickerUnavailable: '目录选择服务不可用，或尚未安装 Desktop 起始目录适配；请更新适配后重启应用',
  projectPickerInvalid: '目录选择器没有返回绝对路径',
  projectDeleteTitle: '确认删除仓库？',
  projectDeleteDescription: '确定从列表移除“{name}”吗？不会删除磁盘目录；保存配置后列表改动才会写入文件。',
  projectCancel: '取消',
  projectResolved: '已识别 {count} / {total} 个 Git 仓库',
  projectPath: '路径（工程内相对，工程外绝对）',
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
  ...readingEn,
  tabTitle: 'File Review',
  userGuide: 'User guide', userGuideOpening: 'Opening…', userGuideHint: 'Open the user guide with screenshot previews',
  userGuideFailed: 'Failed to open the user guide.',
  userGuideServiceUnavailable: 'The user guide service is unavailable. Fully quit and restart Desktop after installing or updating the plugin, then try again.',
  userGuideViewerUnavailable: 'The user guide tab is unavailable. Check that dsh-better-sidebar is enabled.',
  userGuideImageOpen: 'View image', userGuideImageDialog: 'Screenshot preview', userGuideImageClose: 'Close image',
  userGuideImageLoading: 'Loading image…', userGuideImageFailed: 'Failed to load image', userGuideCodeCopy: 'Copy code', userGuideFootnotes: 'Footnotes',
  commentAddLine: 'Add line comment', commentAddFile: 'Comment', commentWholeFile: 'Entire file',
  commentOldLine: 'Old line {line}', commentNewLine: 'New line {line}',
  commentYou: 'You', commentPlaceholder: 'Add a review comment…', commentAdd: 'Comment', commentSave: 'Save comment', commentEdit: 'Edit',
  commentDraft: 'Pending', commentPending: 'Review comments ({count})', commentSubmit: 'Submit review comments', commentSending: 'Submitting…',
  commentList: 'Pending review comments', commentEmpty: 'Hover a code line and click +, or click Comment beside a file.',
  commentDraftHint: 'Comments belong to this session. Submit review comments sends them together to this session’s Agent.',
  commentSendHint: 'Send all pending comments to this session; queue a new turn when the Agent is busy',
  commentFinishEditing: 'Save or cancel the comment being edited first', commentSent: 'Review comments sent to this session',
  commentSendFailed: 'Submission failed; comments kept for retry', commentStorageError: 'Comments remain in memory. Local draft storage is unavailable or corrupt; closing the app may lose pending comments.',
  commentChanged: 'The diff changed. These comments retain their original location and reference code.',
  commentFile: 'File', commentSource: 'Review source', commentReference: 'Reference code (> marks the commented line)', commentOpinion: 'Requested change',
  commentPrompt: 'Apply the following file review feedback to the current project and perform the necessary validation. Read the current files and verify the reference code and diff side first: line numbers in historical turns and Git diffs may have changed. Comments on deleted lines refer to old code. Report how each comment was addressed.',
  reviewScope: 'Review scope', reviewLastTurn: 'Last turn', reviewSession: 'This session', reviewPending: 'Pending review',
  reviewPendingHint: 'Only unconfirmed turns appear. Confirm to hide a turn; undo confirmation in This session.',
  pendingEmpty: 'No file changes pending review in this session', pendingRepoEmpty: 'No file changes pending review in this repository',
  confirmTurn: 'Confirm turn', unconfirmTurn: 'Undo confirmation', turnConfirmed: 'confirmed',
  confirmTurnHint: 'Confirm all repositories in this turn ({count} files) and hide it from Pending review',
  unconfirmTurnHint: 'Return this turn to Pending review', confirmTurnLive: 'Wait until this turn finishes changing files before confirming',
  confirmationStorageError: 'Confirmations remain in memory. Local storage is unavailable or corrupt; review again after restarting.',
  reviewUncommitted: 'Uncommitted', reviewUnstaged: 'Unstaged', reviewStaged: 'Staged', reviewCommit: 'Committed', reviewBranch: 'Branch',
  reviewHead: 'Latest commit (HEAD)', reviewAutoBranch: 'Automatic base branch',
  reviewSelectRepository: 'Select a repository to choose a commit or base branch. All repositories use their latest commit or default base branch.',
  reviewGitHint: 'View Git differences without changing the worktree, index, or commits.',
  reviewRepoCount: '{count} repositories', reviewLoading: 'Loading differences…', reviewGitEmpty: 'No Git changes in this scope', reviewNoGit: 'No available Git repository in this scope',
  reviewFiles: '{count} files', reviewBinary: 'Binary', reviewBinaryHint: 'Binary, symbolic link, or size limit exceeded; text differences are unavailable.', reviewMetadataOnly: 'Only rename or file mode changes; no text difference.',
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
  expandContext: 'Expand {count} unchanged lines ({remaining} hidden)',
  expandAllContextUp: 'Expand all {count} unchanged lines upward',
  expandAllContextDown: 'Expand all {count} unchanged lines downward',
  collapseContextGap: 'Collapse this expanded interval ({count} unchanged lines)',
  diffSettings: 'Settings',
  diffSettingsSave: 'Save',
  diffContextExpansionLines: 'Unchanged lines to expand per click',
  diffContextExpansionHint: 'Enter a positive integer. Default: 20 lines. Saved locally for unified and split views.',
  collapseContext: 'Collapse expanded context',
  unavailableContext: '{count} lines omitted: their code was not recorded',
  diffLayout: 'Diff layout', diffSplit: 'Split', diffUnified: 'Unified', diffWrap: 'Wrap lines', diffOld: 'Before', diffNew: 'After',
  diffSearch: 'Search', diffSearchShortcut: 'Search this file (Ctrl/Cmd+F)', diffSearchQuery: 'Search recorded code',
  diffSearchSide: 'Search version', diffSearchBoth: 'Both versions', diffSearchCase: 'Match case', diffSearchWord: 'Whole word',
  diffSearchCount: '{current} / {count}', diffSearchLimited: 'First {count} matches', diffSearchRecorded: 'Only searches recorded code',
  diffSearchPrevious: 'Previous match (Shift+Enter / Shift+F3)', diffSearchNext: 'Next match (Enter / F3)', diffSearchClose: 'Close search (Esc)',
  diffPreviousChange: 'Previous change', diffNextChange: 'Next change', diffPreviousChangeShortcut: 'Previous change (Ctrl/Cmd+↑)', diffNextChangeShortcut: 'Next change (Ctrl/Cmd+↓)',
  diffChangeNavigation: 'Go to change', diffChangeCount: '{count} changes', diffChangePosition: 'Change {current} / {count}',
  diffSyntaxLanguage: 'Syntax language', diffPlainText: 'Plain text',
  collapseRepositoryFiles: 'Collapse file contents in {name}', expandRepositoryFiles: 'Expand file contents in {name}',
  collapseTurnRepositories: 'Collapse file contents in all repositories in this turn', expandTurnRepositories: 'Expand file contents in all repositories in this turn',
  collapseAllRepositories: 'Collapse file contents in all repositories', expandAllRepositories: 'Expand file contents in all repositories',
  stats: '{added} lines added, {removed} lines removed',
  unavailable: 'No reconstructable diff is available for this change.',
  refresh: 'Refresh status',
  projectTab: 'Multi-repository management',
  projectCurrentRoot: 'Current project directory',
  projectIntro: 'Add, edit, and remove Git repositories for this project. Save them to a configuration file in the project directory. Paths are relative to the project directory.',
  projectSave: 'Save configuration',
  projectGenerate: 'Generate new configuration file',
  projectReload: 'Reload saved configuration',
  projectSaved: 'Project configuration saved',
  projectWorking: 'Working…',
  projectName: 'Project name',
  projectConfigFile: 'Project configuration file (relative to project)',
  projectInactive: 'This project has no configuration file (dsh-file-review-repositories.json). Click "Generate new configuration file" above to save the list.',
  projectEnable: 'Enable multi-repository management',
  projectDisabledHint: 'Multi-repository management is disabled. Review will use single-directory scope; save configuration to apply.',
  projectIncludeRoot: 'Also review files within the project root',
  projectFiles: 'Repository manifests (one per line, optional)',
  projectFilesHint: 'Supports INI [repository] / path fields, .gitmodules, and JSON repositories arrays. Manifest paths may be relative to the project root or absolute.',
  projectRepos: 'Repositories',
  projectReposHint: 'Repositories inside the project use relative paths. Outside repositories use absolute paths for this session only and are excluded from the configuration file.',
  projectImportHint: 'Existing manifest entries have been imported. Saving writes the project configuration file and removes the manifest dependency.',
  projectAddRepo: 'Add repository',
  projectOpenRepo: 'Open',
  projectRemoveRepo: 'Remove',
  projectTemporary: 'Temporary, not saved',
  projectTemporaryShort: 'Temp',
  projectTemporaryHint: 'This repository is outside the project. It is temporary for this session and will not be written to the configuration file.',
  projectPickerUnavailable: 'Directory picker unavailable, or the Desktop starting-directory adapter is missing; update the adapter and restart',
  projectPickerInvalid: 'The directory picker did not return an absolute path',
  projectDeleteTitle: 'Remove this repository?',
  projectDeleteDescription: 'Remove “{name}” from the list? The directory on disk stays intact; the list change is written when you save.',
  projectCancel: 'Cancel',
  projectResolved: '{count} / {total} Git repositories available',
  projectPath: 'Path (relative inside project, absolute outside)',
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

export interface ReviewLocaleSource {
  getSnapshot(): { active: string }
  subscribe?(listener: () => void): () => void
}
export type ReviewLocale = 'zh' | 'en'
const localeListeners = new Set<() => void>()
let localeAttachment: { service: ReviewLocaleSource | undefined; unsubscribe?: (() => void) | undefined } | undefined
const notifyLocale = () => { for (const listener of localeListeners) listener() }

/** Follow the host's General settings language; dispose on plugin disable/HMR. */
export function attachLocale(service: ReviewLocaleSource | undefined): () => void {
  localeAttachment?.unsubscribe?.()
  const attachment = { service, unsubscribe: service?.subscribe?.(notifyLocale) }
  localeAttachment = attachment
  notifyLocale()
  return () => {
    if (localeAttachment !== attachment) return
    attachment.unsubscribe?.()
    localeAttachment = undefined
    notifyLocale()
  }
}

export function subscribeLocale(listener: () => void): () => void {
  localeListeners.add(listener)
  return () => { localeListeners.delete(listener) }
}

/** The active locale id ('zh' | 'en'): the DSH locale service's snapshot when attached. */
export function getLocaleSnapshot(): ReviewLocale {
  const active = localeAttachment?.service?.getSnapshot().active
    ?? (typeof navigator !== 'undefined' ? navigator.language : '')
    ?? 'en'
  return active.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
export function t(key: CopyKey, params?: Record<string, string | number>): string {
  const dict = getLocaleSnapshot() === 'zh' ? zh : en
  let text: string = dict[key]
  if (params !== undefined) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
