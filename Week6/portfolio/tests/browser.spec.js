import { expect, test } from '@playwright/test';

test('navigation, theme, contact and About controls work together', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design engineer &AI enthusiast');
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('home-dark.png'), fullPage: true });
  await page.getByRole('button', { name: 'Show email' }).first().click();
  await expect(page.getByRole('status')).toContainText('once you share your contact details');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('link', { name: 'View My Work' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('article')).toHaveCount(6);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: testInfo.outputPath('projects-light.png'), fullPage: true });
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
  await page.getByRole('button', { name: 'Turn over photo 1' }).click();
  await expect(page.getByRole('button', { name: 'Turn over photo 1' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Show 2 more' }).click();
  await expect(page.getByText('An independent project', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Show less' }).click();
  await expect(page.getByText('An independent project', { exact: true })).toHaveCount(0);
  const tool = page.getByRole('button', { name: 'Move React', exact: true });
  await tool.focus();
  await tool.press('ArrowRight');
  await expect(page.getByRole('status')).toContainText('React:');
  await page.getByRole('button', { name: 'Reset stack' }).click();
  await expect(page.getByRole('status')).toContainText('Stack reset');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});

test('direct routes fit the viewport and all imagery has a usable fallback', async ({ page }, testInfo) => {
  for (const route of ['/', '/projects', '/about']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const width = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(width.page, `Horizontal overflow on ${route}`).toBeLessThanOrEqual(width.viewport + 1);
    for (const image of await page.getByRole('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll('/', '') || 'home'}-layout.png`), fullPage: true });
  }
});
