/** Compatibility entry for existing install instructions. */
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runDirectoryPickerAdapter } from 'dsh-multi-git-repo-manager/desktop-picker-adapter'
export { patchArchive } from 'dsh-multi-git-repo-manager/desktop-picker-adapter'

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await runDirectoryPickerAdapter()
}
