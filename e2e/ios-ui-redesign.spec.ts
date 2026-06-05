import { test, expect } from '@playwright/test';

test.describe('iOS UI redesign acceptance', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('uses C4K OLED background token on shell', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
        const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c4k-bg').trim());
        expect(bg).toBe('#05060A');
    });

    test('settings copy is selectable', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
        const userSelect = await page.evaluate(() => {
            const probe = document.createElement('p');
            probe.className = 'panel-copy';
            document.body.appendChild(probe);
            const value = getComputedStyle(probe).userSelect;
            probe.remove();
            return value;
        });
        expect(userSelect).toMatch(/text/);
    });

    test('focus ring uses gold accent token', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#app')).toBeVisible({ timeout: 30_000 });
        const gold = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c4k-gold').trim());
        expect(gold.toLowerCase()).toBe('#f4d38c');
    });
});
