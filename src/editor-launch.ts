import { spawn, execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { basename, delimiter, dirname, isAbsolute, join } from 'node:path'
import { promisify } from 'node:util'

const execute = promisify(execFile)
/** Known VS Code-compatible executables only; no command templates or shell launchers. */
export async function findVSCode(configured?: string): Promise<string | null> {
  const allowed = (file: string) => process.platform === 'win32' ? ['code.exe', 'antigravity ide.exe'].includes(basename(file).toLowerCase()) : ['code', 'Visual Studio Code'].includes(basename(file))
  const candidates: string[] = []
  if (configured?.trim()) {
    const file = configured.trim()
    if (!isAbsolute(file) || !allowed(file)) return null
    candidates.push(file)
  } else {
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execute('reg.exe', ['query', 'HKCU\\Software\\Classes\\vscode\\shell\\open\\command', '/ve'], { windowsHide: true, timeout: 3000 })
        const match = stdout.match(/REG_SZ\s+"([^"]+Code\.exe)"/i)
        if (match?.[1]) candidates.push(match[1])
      } catch { /* Portable installs do not register a protocol. */ }
      for (const root of [process.env.LOCALAPPDATA, process.env.ProgramFiles, process.env['ProgramFiles(x86)']]) {
        if (root) candidates.push(join(root, ...(root === process.env.LOCALAPPDATA ? ['Programs'] : []), 'Microsoft VS Code', 'Code.exe'))
      }
    } else if (process.platform === 'darwin') candidates.push('/Applications/Visual Studio Code.app/Contents/MacOS/Electron')
    for (const directory of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
      candidates.push(join(directory, process.platform === 'win32' ? 'Code.exe' : 'code'))
      if (process.platform === 'win32') candidates.push(join(dirname(directory), 'Code.exe'))
    }
  }
  for (const file of candidates) try { if ((await stat(file)).isFile()) return file } catch { /* Try the next candidate. */ }
  return null
}
export function vscodeArguments(path: string, line: number): string[] {
  if (!isAbsolute(path) || !Number.isSafeInteger(line) || line < 1) throw new Error('Invalid editor location')
  return ['--reuse-window', '--goto', `${path}:${line}:1`]
}
/** Resolves only after OS process admission; GUI focus is not an observable acknowledgement. */
export async function launchVSCode(executable: string, args: readonly string[]): Promise<void> {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, [...args], { env, detached: true, stdio: 'ignore', windowsHide: true, shell: false })
    child.once('error', reject)
    child.once('spawn', () => { child.unref(); resolve() })
  })
}
