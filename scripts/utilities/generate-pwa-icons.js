// Copyright (C) 2017-2024 Smart code 203358507
// Generates PWA icons with solid black background for iOS home screen compatibility.
// Usage: node scripts/utilities/generate-pwa-icons.js

const sharp = require('sharp');
const path = require('path');

const BG = { r: 8, g: 6, b: 16 }; // rgba(8,6,16) — exact app background color
const SRC = path.join(__dirname, '../../assets/images/icon_512x512.png');

async function generate() {
    await sharp(SRC)
        .flatten({ background: BG })
        .resize(512, 512, { fit: 'contain', background: BG })
        .toFile(path.join(__dirname, '../../assets/images/pwa-icon-512.png'));
    console.log('Generated pwa-icon-512.png');

    await sharp(SRC)
        .flatten({ background: BG })
        .resize(192, 192, { fit: 'contain', background: BG })
        .toFile(path.join(__dirname, '../../assets/images/pwa-icon-192.png'));
    console.log('Generated pwa-icon-192.png');
}

generate().catch(console.error);
