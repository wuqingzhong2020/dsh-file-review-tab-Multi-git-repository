import { en, getLocaleSnapshot, t, zh, type CopyKey } from './locales.ts'

/** Host diagnostics stay language-neutral on the wire and translate at render. */
const diagnostics: Readonly<Record<string, string>> = {
  'change has no complete trusted lifecycle record': '此更改没有完整的可信生命周期记录',
  'lifecycle sequence is incomplete': '生命周期记录不连续，不能安全还原整段更改',
  'lifecycle has no net file change': '生命周期的起止文件状态没有净变化',
  'lifecycle path does not match the current repository authorization': '生命周期路径与当前仓库授权不一致',
  'current content or permissions do not match the recorded change': '当前文件内容或权限与记录不一致',
  'file was replaced at the recorded path': '原路径的文件已被替换，不能安全还原',
  'lifecycle requires a regular file without symbolic links': '生命周期只支持无符号链接的普通文件',
  'file exceeds the lifecycle capture budget': '文件超过 1 MiB 生命周期捕获限制',
  'file is not ordinary UTF-8 text': '文件不是普通 UTF-8 文本',
  'file changed during lifecycle capture': '生命周期捕获期间文件发生了变化',
  'lifecycle record exceeds the persistence budget': '生命周期记录超过 256 KiB 持久化限制',
  'session lifecycle replay exceeds the 16 MiB budget': '会话生命周期重放超过 16 MiB 限制',
  'legacy mutation exceeds the 256 KiB capture budget': '旧版修改记录超过 256 KiB 捕获限制',
  'Only the most recent 4000 lifecycle records are available; older nested changes may lack review images.': '仅提供最近 4000 条生命周期记录；较早的嵌套修改可能缺少审查快照。',
  'symbolic links are not supported': '不支持符号链接',
  'path is not a regular file': '路径不是普通文件',
  'resolved path is outside the configured project repositories': '解析后的路径不在已配置的工程仓库范围内',
  'file is not valid UTF-8 text': '文件不是有效的 UTF-8 文本',
  'change has no complete reversible diff': '此更改没有完整的可还原差异',
  'current content does not match the recorded change': '当前文件内容与记录的更改不一致',
  'file changed while the operation was being prepared': '准备操作期间文件内容发生了变化',
  'session has no workspace directory': '当前会话没有工作区目录',
  'Project root does not belong to this session': '工程根目录不属于当前会话',
  'Enable this project before adding temporary repositories': '请先启用该工程，再添加临时仓库',
  'Temporary repositories must use absolute paths outside the project': '临时仓库必须使用工程目录外的绝对路径',
  'This repository has no commits': '此仓库尚无提交',
  'Select a comparison branch': '请选择用于比较的分支',
  'Invalid commit': '无效的提交',
  'Invalid repository file path': '无效的仓库文件路径',
  'Incomplete Git name-status output': 'Git 文件状态输出不完整',
  'File resolves outside the repository': '文件解析后的路径位于仓库外',
  'Repository is outside this session': '仓库不在当前会话的范围内',
  'This file changed; refresh the review': '此文件已发生变化，请刷新审查',
  'Binary, symbolic link, or file exceeds 2 MiB': '二进制文件、符号链接或文件超过 2 MiB',
  'Rename or file mode change; no text difference': '仅重命名或文件权限变化，没有文本差异',
  'Project configuration file changed; reload before saving': '工程配置文件已发生变化，请重新加载后再保存',
  'Native project settings are unavailable': '宿主工程设置服务不可用',
  'JSON must contain an array or a repositories array': 'JSON 必须包含数组或 repositories 数组',
  'Supported formats: .ini, .gitmodules, .json': '支持的格式：.ini、.gitmodules、.json',
  'No section with a path field was found': '未找到包含 path 字段的节',
  'Project root must be an absolute path': '工程根目录必须为绝对路径',
  'Project root is not a directory': '工程根路径不是目录',
  'Configuration file exceeds 1 MiB': '配置文件超过 1 MiB',
  'Configuration file exceeds 512 repositories': '配置文件包含超过 512 个仓库',
  'Repository path is not a directory': '仓库路径不是目录',
  'File review Remote is unavailable': '文件审查远程服务不可用',
  'Session is unavailable': '会话不可用',
  'Host file toggle is unavailable': '宿主文件撤销与重新应用服务不可用',
  'Review conversation is unavailable': '文件审查所属会话不可用',
}
const copyKeys = new Map<string, CopyKey>()
for (const key of Object.keys(en) as CopyKey[]) {
  copyKeys.set(en[key], key)
  copyKeys.set(zh[key], key)
}
const englishDiagnostics = new Map(Object.entries(diagnostics).map(([english, chinese]) => [chinese, english]))

/** Preserve paths, Git output and unrecognized technical details verbatim. */
export function localizeReviewMessage(message: string): string {
  const key = copyKeys.get(message)
  if (key) return t(key)
  if (getLocaleSnapshot() === 'en') return englishDiagnostics.get(message) ?? message
  if (diagnostics[message]) return diagnostics[message]
  const limit = /^Review exceeds (\d+) files; select a smaller scope$/.exec(message)
  if (limit) return `审查文件数超过 ${limit[1]}，请选择更小的范围`
  const repository = /^repository (\d+) has no path$/.exec(message)
  if (repository) return `第 ${repository[1]} 个仓库没有路径`
  const file = /^(.+)( must be a regular file| exceeds 1 MiB)$/.exec(message)
  if (file) return file[1] + (file[2] === ' must be a regular file' ? ' 必须为普通文件' : ' 超过 1 MiB')
  const separator = message.lastIndexOf(': ')
  if (separator >= 0) {
    const suffix = message.slice(separator + 2)
    const localized = localizeReviewMessage(suffix)
    if (localized !== suffix) return message.slice(0, separator + 2) + localized
  }
  return message
}
