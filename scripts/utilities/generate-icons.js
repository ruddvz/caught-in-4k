const sharp = require('sharp');
const path = require('path');

function generateC4KIconSVG(size) {
    const fontSize = size * 0.38;
    const dotR = size * 0.055;
    const cx = size / 2;
    const cy = size / 2;
    // Position the red dot to the upper-right of the "K"
    const dotX = cx + fontSize * 0.72;
    const dotY = cy - fontSize * 0.28;
    const cornerR = size * 0.15;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerR}" fill="#080610"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
    font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${fontSize}"
    fill="white" letter-spacing="${size * 0.01}">C4K</text>
  <circle cx="${dotX}" cy="${dotY}" r="${dotR}" fill="#FF3B30"/>
</svg>`;
    return Buffer.from(svg);
}

async function generateAll() {
    const assetsDir = path.join(__dirname, 'assets');
    const sizes = {
        'images/icon.png': 512,
        'images/icon_196x196.png': 196,
        'images/icon_512x512.png': 512,
        'images/maskable_icon.png': 512,
        'images/maskable_icon_196x196.png': 196,
        'images/maskable_icon_512x512.png': 512,
        'images/stremio_symbol.png': 256,
        'images/logo.png': 512,
    };

    for (const [file, size] of Object.entries(sizes)) {
        const svg = generateC4KIconSVG(size);
        await sharp(svg).png().toFile(path.join(assetsDir, file));
        console.log('Generated: ' + file + ' (' + size + 'x' + size + ')');
    }

    // Favicon 48x48
    const faviconSvg = generateC4KIconSVG(48);
    await sharp(faviconSvg).png().toFile(path.join(assetsDir, 'favicons', 'favicon.ico'));
    console.log('Generated: favicons/favicon.ico (48x48)');

    console.log('All icons generated!');
}

generateAll().catch(console.error);
