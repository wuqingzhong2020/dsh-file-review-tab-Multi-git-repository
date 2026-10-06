import { test, expect } from '@playwright/test'

for (const lang of ['zh', 'en']) {
  test(`separate manager and review bundles share saves and refresh events (${lang})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`/?lang=${lang}`)
    await expect(page.locator('#review-surface').getByText('service.ts', { exact: true }).first()).toBeVisible()
    const reads = await page.evaluate(() => window.fixture.workspaceReads())
    await page.evaluate(() => window.fixture.managerPlugin.repositoriesChanged())
    await expect.poll(() => page.evaluate(() => window.fixture.workspaceReads())).toBeGreaterThan(reads)
    const title = lang === 'zh' ? '多代码仓管理' : 'Multi-repository management'
    await page.locator('#start-guides').getByRole('button', { name: title, exact: true }).click()
    const surface = page.locator('#repositories-surface')
    await expect(page.getByRole('tab', { name: title, exact: true })).toBeVisible()
    await expect(surface.getByRole('heading', { name: title })).toBeVisible()
    expect(await page.evaluate(() => window.fixture.seats.has('conversation.view:repositories'))).toBe(false)
    await surface.getByRole('button', { name: lang === 'zh' ? '添加仓库或目录' : 'Add repository', exact: true }).click()
    await surface.getByRole('textbox', { name: lang === 'zh' ? '仓库 3' : 'Repository 3', exact: true }).fill('extra')
    await surface.getByRole('textbox', { name: lang === 'zh' ? '路径（工程内相对，工程外绝对） 3' : 'Path (relative inside project, absolute outside) 3', exact: true }).fill('libs/extra')
    await page.getByRole('button', { name: 'Review', exact: true }).click()
    await page.locator('#start-guides').getByRole('button', { name: title, exact: true }).click()
    await expect(surface.getByRole('textbox', { name: lang === 'zh' ? '仓库 3' : 'Repository 3', exact: true })).toHaveValue('extra')
    await page.getByRole('button', { name: '400px', exact: true }).click()
    expect(await surface.evaluate(node => node.firstElementChild.scrollWidth <= node.clientWidth)).toBe(true)
    await surface.getByRole('button', { name: lang === 'zh' ? '保存配置' : 'Save configuration', exact: true }).click()
    await expect(surface.getByRole('status')).toContainText(lang === 'zh' ? '项目配置已保存' : 'Project configuration saved')
    expect(await page.evaluate(() => window.fixture.projectPage().project.repositories.at(-1))).toEqual({ name: 'extra', path: 'libs/extra' })
    if (process.env.UPDATE_BROWSER_FIXTURE_SCREENSHOTS) await page.screenshot({ path: test.info().outputPath(`manager-${lang}.jpg`), type: 'jpeg', quality: 85, fullPage: true })
    await page.getByRole('button', { name: 'Review', exact: true }).click()
    await expect(page.locator('#review-surface').getByRole('option', { name: 'extra', exact: true })).toHaveCount(1)
    await page.evaluate(() => window.fixture.unmount())
    expect(await page.evaluate(() => window.fixture.seats.size)).toBe(0)
    expect(await page.evaluate(() => window.fixture.tabTypes.size)).toBe(0)
    expect(errors).toEqual([])
  })
}
