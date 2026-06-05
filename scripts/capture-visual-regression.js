#!/usr/bin/env node
// Copyright (C) 2017-2023 Smart code 203358507

const { chromium, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUT_DIR = path.join(__dirname, '..', 'test-results', 'visual');
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

const VIEWPORTS = [
    { name: 'iphone-se', width: 375, height: 812 },
    { name: 'iphone-14', width: 390, height: 844 },
    { name: 'iphone-pro-max', width: 430, height: 932 },
    { name: 'ipad', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
];

const ROUTES = ['/', '/search', '/discover', '/library', '/calendar', '/settings', '/addons'];

async function capture() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const browser = await chromium.launch();
    const context = await browser.newContext({ ...devices['iPhone 14'] });

    for (const route of ROUTES) {
        for (const vp of VIEWPORTS) {
            const page = await context.newPage();
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await page.goto(`${BASE}${route === '/' ? '' : route}`, { waitUntil: 'networkidle', timeout: 60_000 });
            await page.waitForSelector('#app', { timeout: 30_000 });
            const safeRoute = route.replace(/\//g, '_') || 'home';
            const file = path.join(OUT_DIR, `${safeRoute}-${vp.name}.png`);
            await page.screenshot({ path: file, fullPage: false });
            await page.close();
        }
    }

    await browser.close();
    console.log(`Visual captures written to ${OUT_DIR}`);
}

async function main() {
    const server = spawn('pnpm', ['exec', 'serve', 'build', '-l', '4173'], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
    });

    await new Promise((r) => setTimeout(r, 3000));

    try {
        await capture();
    } finally {
        server.kill('SIGTERM');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
