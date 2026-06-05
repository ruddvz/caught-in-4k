import { test, expect } from '@playwright/test';

test.describe('Caught in 4K smoke', () => {
    test('app shell loads', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    });

    test('calendar route is reachable', async ({ page }) => {
        await page.goto('/calendar');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    });
});
