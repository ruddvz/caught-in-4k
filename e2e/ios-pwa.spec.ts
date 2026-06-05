import { test, expect } from '@playwright/test';

test('viewport-fit cover is preserved on iOS user agent', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/);
});
