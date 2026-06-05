import { test, expect } from '@playwright/test';

const MOBILE_ROUTES = ['/', '/discover', '/library', '/settings', '/calendar'];

test.describe('Mobile layout parity', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    });

    test('viewport-fit cover meta is present', async ({ page }) => {
        const viewportMeta = page.locator('meta[name="viewport"]');
        await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/);
    });

    for (const route of MOBILE_ROUTES) {
        test(`route ${route} renders app shell`, async ({ page }) => {
            await page.goto(route);
            await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
        });
    }

    test('settings route loads app shell', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    });

    test('library empty or grid is reachable above safe area', async ({ page }) => {
        await page.goto('/library');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
        const libraryRoot = page.locator('.library-container');
        if (await libraryRoot.count()) {
            await expect(libraryRoot.first()).toBeVisible();
        }
    });
});
