/** Create disposable demo repositories for manual validation in the real Desktop. */
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = await mkdtemp(join(tmpdir(), 'dsh-file-review-desktop-'))
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}
const identity = ['-c', 'user.name=Review Demo', '-c', 'user.email=review-demo@example.invalid']
const core = join(root, 'core')
const cli = join(root, 'cli')
for (const repository of [core, cli]) {
  await mkdir(join(repository, 'src'), { recursive: true })
  git(repository, 'init', '--initial-branch=main')
  git(repository, 'config', 'core.autocrlf', 'false')
}
const baseline = [
  '// Review demo: authentication input validation.',
  'export interface LoginInput {',
  '  username: string',
  '  password: string',
  '}',
  '',
  'export function validateUsername(username: string): boolean {',
  '  return username.length > 0',
  '}',
  '',
  'export function login(input: LoginInput): string {',
  "  if (!validateUsername(input.username)) return 'invalid username'",
  "  if (input.password.length < 6) return 'weak password'",
  "  return 'accepted'",
  '}',
  '',
  ...Array.from({ length: 26 }, (_, index) => `// Documented context line ${index + 1}`),
  '',
  'export function loginLabel(): string {',
  "  return 'Login'",
  '}',
  '',
].join('\n')
await writeFile(join(core, 'src', 'login.ts'), baseline)
await writeFile(join(core, 'src', 'legacy.ts'), 'export const legacy = true\n')
await writeFile(join(cli, 'src', 'main.py'), 'def main():\n    print("Ready")\n\nmain()\n')
for (const repository of [core, cli]) {
  git(repository, 'add', '.')
  git(repository, ...identity, 'commit', '-m', 'Initial review demo')
}
git(core, 'branch', 'baseline')
const staged = baseline.replace('return username.length > 0', 'return username.trim().length > 0')
await writeFile(join(core, 'src', 'login.ts'), staged)
git(core, 'add', 'src/login.ts')
await writeFile(join(core, 'src', 'login.ts'), staged.replace('input.password.length < 6', 'input.password.length < 8'))
await unlink(join(core, 'src', 'legacy.ts'))
await writeFile(join(core, 'src', 'new-helper.ts'), 'export const minimumPasswordLength = 8\n')
await writeFile(join(core, 'sample.bin'), Buffer.from([0, 255, 0, 254]))
await writeFile(join(cli, 'src', 'main.py'), 'def main():\n    print("Review ready")\n\nmain()\n')
await writeFile(join(root, 'README.md'), '# Desktop review validation\n\nSynthetic files only; core and cli are separate Git repositories.\n')
process.stdout.write(JSON.stringify({ root, core, cli }, null, 2) + '\n')
