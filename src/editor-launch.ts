import { spawn, execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { basename, delimiter, dirname, isAbsolute, join } from 'node:path'
import { promisify } from 'node:util'

const execute = promisify(execFile)

function allowedConfiguredExecutable(file: string): boolean {
  if (process.platform === 'win32') {
    return ['code.exe', 'antigravity ide.exe'].includes(basename(file).toLowerCase())
  }
  return ['code', 'Visual Studio Code'].includes(basename(file))
}

async function appendWindowsInstallCandidates(candidates: string[]): Promise<void> {
  try {
    const { stdout } = await execute(
      'reg.exe',
      ['query', 'HKCU\\Software\\Classes\\vscode\\shell\\open\\command', '/ve'],
      { windowsHide: true, timeout: 3000 },
    )
    const match = stdout.match(/REG_SZ\s+"([^"]+Code\.exe)"/i)
    if (match?.[1]) candidates.push(match[1])
  } catch {
    // Portable installs do not register a protocol.
  }
  const installRoots = [
    process.env.LOCALAPPDATA,
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],
  ]
  for (const root of installRoots) {
    if (!root) continue
    const localPrograms = root === process.env.LOCALAPPDATA ? ['Programs'] : []
    candidates.push(join(root, ...localPrograms, 'Microsoft VS Code', 'Code.exe'))
  }
}

function appendPathCandidates(candidates: string[]): void {
  for (const directory of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
    candidates.push(join(directory, process.platform === 'win32' ? 'Code.exe' : 'code'))
    if (process.platform === 'win32') {
      candidates.push(join(dirname(directory), 'Code.exe'))
    }
  }
}

/** Explicit paths stay within known executables; discovery keeps its original priority. */
async function editorCandidates(configured?: string): Promise<string[]> {
  const candidates: string[] = []
  if (configured?.trim()) {
    const file = configured.trim()
    if (!isAbsolute(file) || !allowedConfiguredExecutable(file)) return candidates
    candidates.push(file)
  } else {
    if (process.platform === 'win32') {
      await appendWindowsInstallCandidates(candidates)
    } else if (process.platform === 'darwin') {
      candidates.push('/Applications/Visual Studio Code.app/Contents/MacOS/Electron')
    }
    appendPathCandidates(candidates)
  }
  return candidates
}

/** Known VS Code-compatible executables only; no command templates or shell launchers. */
export async function findVSCode(configured?: string): Promise<string | null> {
  const candidates = await editorCandidates(configured)
  for (const file of candidates) {
    try {
      if ((await stat(file)).isFile()) return file
    } catch {
      // Try the next candidate.
    }
  }
  return null
}

export function vscodeArguments(path: string, line: number): string[] {
  if (!isAbsolute(path) || !Number.isSafeInteger(line) || line < 1) {
    throw new Error('Invalid editor location')
  }
  return ['--reuse-window', '--goto', `${path}:${line}:1`]
}

/** Resolves only after OS process admission; GUI focus is not an observable acknowledgement. */
export async function launchVSCode(executable: string, args: readonly string[]): Promise<void> {
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, [...args], {
      env,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      shell: false,
    })
    child.once('error', reject)
    child.once('spawn', () => {
      child.unref()
      resolve()
    })
  })
}
