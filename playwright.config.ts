import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173',
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'pnpm exec serve build -l 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
    projects: [
        {
            name: 'chromium',
            testIgnore: /(ios-pwa|mobile-layout)\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'iphone',
            testMatch: /(ios-pwa|smoke|mobile-layout)\.spec\.ts/,
            use: {
                ...devices['iPhone 14'],
                browserName: 'chromium',
            },
        },
    ],
});
