import { test, expect } from '@playwright/test'

for (const lang of ['zh', 'en']) {
  test('update reloads an open Git diff and preserves scope and repository (' + lang + ')', async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/?lang=' + lang)
    const surface = page.locator('#review-surface')
    const scope = surface.getByRole('combobox', { name: lang === 'zh' ? '审查范围' : 'Review scope' })
    const repository = surface.getByRole('combobox', { name: lang === 'zh' ? '仓库' : 'Repository' })
    await scope.selectOption('uncommitted')
    await repository.selectOption('D:/fixture/core')
    await surface.getByRole('button', { name: /service\.ts$/ }).click()
    const diff = surface.locator('[data-diff-layout]')
    await expect(diff).toHaveCount(1)
    await expect(diff).toContainText('return validate(input)')
    const before = await page.evaluate(() => window.fixture.gitReads())
    await page.evaluate(() => window.fixture.updateGitText('export function review(input) {\n  return validateUpdated(input)\n}\n'))
    const update = surface.getByRole('button', { name: lang === 'zh' ? '更新' : 'Update', exact: true })
    await expect(update).toBeVisible()
    // The button belongs immediately after the repository selector, as in the screenshot.
    expect(await update.evaluate(button => button.previousElementSibling?.getAttribute('aria-label')))
      .toBe(lang === 'zh' ? '仓库' : 'Repository')
    await update.click()
    await expect(diff).toHaveCount(1)
    await expect(diff).toContainText('return validateUpdated(input)')
    await expect(diff).toContainText('return input')
    await expect(scope).toHaveValue('uncommitted')
    await expect(repository).toHaveValue('D:/fixture/core')
    const after = await page.evaluate(() => window.fixture.gitReads())
    expect(after.lists).toBeGreaterThan(before.lists)
    expect(after.diffs).toBeGreaterThan(before.diffs)
    await page.screenshot({ path: test.info().outputPath('review-update-' + lang + '.png'), fullPage: true })
    await page.getByRole('button', { name: '400px', exact: true }).click()
    await expect(update).toBeVisible()
    await expect(diff).toHaveAttribute('data-diff-layout', 'unified')
    expect(errors).toEqual([])
  })
}
