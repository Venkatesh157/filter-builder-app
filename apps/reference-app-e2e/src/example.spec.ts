import { test, expect } from '@playwright/test';

test('landing page renders filter builder header', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Filter Builder' })
  ).toBeVisible();
});
