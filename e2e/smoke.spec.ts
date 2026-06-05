import { test, expect } from '@playwright/test';

async function expectAppMounted(page: import('@playwright/test').Page) {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('body')).toHaveClass(/caught-in-4k/, { timeout: 30_000 });
    await expect(page.locator('#app .routes-container')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('text=Something went wrong')).toHaveCount(0);

    await expect.poll(async () => {
        return page.locator('#app').evaluate((node) => node.innerHTML.length);
    }, { timeout: 30_000 }).toBeGreaterThan(1000);

    expect(pageErrors).toEqual([]);
}

test.describe('Caught in 4K smoke', () => {
    test('app shell loads with React content', async ({ page }) => {
        await page.goto('/');
        await expectAppMounted(page);
    });

    test('calendar route is reachable', async ({ page }) => {
        await page.goto('/calendar');
        await expectAppMounted(page);
    });
});
