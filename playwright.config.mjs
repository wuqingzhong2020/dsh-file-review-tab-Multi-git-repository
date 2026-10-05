import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: 'tests/browser', testMatch: '*.spec.mjs', workers: 1,
  use: { baseURL: 'http://127.0.0.1:4179', viewport: { width: 1100, height: 1020 }, permissions: ['clipboard-read', 'clipboard-write'], trace: 'retain-on-failure' },
  webServer: { command: 'node tests/browser/server.mjs', url: 'http://127.0.0.1:4179', reuseExistingServer: false, timeout: 60000 },
})
