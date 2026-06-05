#!/usr/bin/env node
// Copyright (C) 2017-2023 Smart code 203358507

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const swPath = path.join(buildDir, 'service-worker.js');

if (!fs.existsSync(swPath)) {
    console.error('service-worker.js missing — run pnpm run build first');
    process.exit(1);
}

const sw = fs.readFileSync(swPath, 'utf8');

if (!sw.includes('precacheAndRoute') && !sw.includes('precache')) {
    console.error('service worker does not appear to configure precaching');
    process.exit(1);
}

const indexPath = path.join(buildDir, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('index.html missing from build output');
    process.exit(1);
}

console.log('Service worker verification passed:', swPath);
