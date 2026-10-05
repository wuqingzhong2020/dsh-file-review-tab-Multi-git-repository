import { createServer } from 'node:http'
import { readFile, readdir } from 'node:fs/promises'
import { build } from 'tsdown'
import { cssModulesPlugin } from '../../tsdown.config.ts'
import { FileReviewService } from '../../lib/index.js'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const plainCss = { name: 'fixture-plain-css', resolveId(source, importer) {
  if (source.endsWith('.css') && !source.endsWith('.module.css')) return '\0fixture-css:' + (source.startsWith('.') ? resolve(dirname(importer), source) : require.resolve(source)) + '.mjs'
}, async load(id) {
  if (!id.startsWith('\0fixture-css:')) return null
  const css = await readFile(id.slice(13, -4), 'utf8')
  return `const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.append(style);`
} }

await build({ config: false, entry: { fixture: 'tests/browser/fixture.tsx' }, outDir: '.browser-fixture', format: 'esm', platform: 'browser', target: 'es2022', dts: false, deps: { alwaysBundle: [/.*/] }, plugins: [cssModulesPlugin(), plainCss], outputOptions: { entryFileNames: 'fixture.js' } })
const service = Object.create(FileReviewService.prototype)
const assets = Object.fromEntries((await readdir('.browser-fixture')).filter(name => name.endsWith('.js') || name.endsWith('.css')).map(name => ['/' + name, '.browser-fixture/' + name]))
assets['/client.js'] = 'lib/client.js'
assets['/manager-client.js'] = '../dsh-multi-git-repo-manager/lib/client.js'
const html = `<!doctype html><html><meta charset="utf-8"><title>Isolated review fixture</title><style>
:root{--dsw-alias-label-primary:#20242b;--dsw-alias-label-secondary:#657084;--dsw-alias-bg-base:#fff;--dsw-alias-bg-layer-1:#fff;--dsw-alias-bg-layer-2:#f4f6fa;--dsw-alias-border-l1:#e9edf4;--dsw-alias-border-l2:#d9dee7;--dsw-alias-state-link-primary:#365be5;--dsw-alias-state-success-primary:#1a7f37;--dsw-alias-state-error-primary:#cf222e;--dsw-font-xs-13:13px/1.5 Arial,sans-serif;--dsw-font-markdown-code-block:13px/1.6 Consolas,monospace}
body{margin:0;background:#f4f6fa;color:#20242b;font:14px/1.6 Arial,sans-serif}button,input,select{font:inherit}.fixture-bar{padding:12px;display:flex;flex-wrap:wrap;gap:12px;background:#fff;border-bottom:1px solid #d9dee7}.fixture-bar span{font-size:12px;color:#657084}.fixture-bar button{border:1px solid #d9dee7;border-radius:5px;background:#fff;cursor:pointer}main{background:#fff;border:1px solid #d9dee7;margin:12px;max-width:calc(100vw - 26px)}#review-surface{height:640px}#settings-surface,#messages-surface{padding:18px;width:780px}#input-surface{box-sizing:border-box;width:820px;max-width:calc(100vw - 24px);margin:12px;padding:12px;background:#fff;border:1px solid #d9dee7;border-radius:10px}[data-input-reference]{background:#e9eefb;border-radius:5px;padding:4px 8px}[data-host-message]{padding:10px;border-top:1px solid #ddd}[data-host-message] time{margin:10px;color:#777}
</style><div id="root"></div><script type="module" src="/fixture.js"></script></html>`
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://localhost').pathname
    if (path.startsWith('/guide/')) {
      const document = await service.userGuideDocument({}, path.slice(7))
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(document)); return
    }
    if (assets[path]) { res.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : 'text/javascript'); res.end(await readFile(assets[path])); return }
    res.setHeader('Content-Type', 'text/html'); res.end(html)
  } catch (error) { res.statusCode = 500; res.end(String(error)) }
}).listen(4179, '127.0.0.1', () => console.log('Isolated fixture: http://127.0.0.1:4179'))
