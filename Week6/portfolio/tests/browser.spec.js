import { expect, test } from '@playwright/test';

test('navigation, theme, contact and About controls work together', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('MERN developer &AI enthusiast');
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page).toHaveTitle(/Priyanshu Joshi/);
  await page.screenshot({ path: testInfo.outputPath('home-dark.png'), fullPage: true });
  await page.getByRole('button', { name: 'Show email' }).first().click();
  await expect(page.getByRole('link', { name: 'Open email app' })).toHaveAttribute('href', 'mailto:joshipriyanshu125@gmail.com');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('link', { name: 'View My Work' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /live site/ })).toHaveCount(2);
  await expect(page.getByRole('link', { name: /source code/ })).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Visit TaskFlow live site/ })).toHaveAttribute('href', 'https://taskflow-frontend-blond.vercel.app/');
  await expect(page.getByRole('link', { name: /Visit Weather Dashboard live site/ })).toHaveAttribute('href', 'https://weather-application-frontend-seven.vercel.app/');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/joshipriyanshu125');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({ path: testInfo.outputPath('projects-light.png'), fullPage: true });
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).click();
  await page.getByRole('button', { name: 'Turn over photo 1' }).click();
  await expect(page.getByRole('button', { name: 'Turn over photo 1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Hello! I’m Priyanshu Joshi.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Independent Full-Stack Developer' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Show \d+ more/ })).toHaveCount(0);
  for (const heading of ['Education', 'What I do', 'Stack', 'Technical skills', 'Soft skills', 'Certifications', 'Achievements']) {
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByText('CGPA: 7.3/10', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Call Priyanshu Joshi/ })).toHaveAttribute('href', 'tel:+919105131502');
  await expect(page.locator('body')).not.toContainText('Sample details');
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
    await expect(page.locator('body')).not.toContainText('Your Name');
    await expect(page.locator('body')).not.toContainText('DeepResearch AI');
    await expect(page.locator('body')).not.toContainText('LabVR');
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
