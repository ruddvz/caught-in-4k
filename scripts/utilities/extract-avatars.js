const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '../../assets/images/avatars');

// Images are 5632x3072 — exactly 4× the 1408x768 originals.
// Scale all coords by 4.
const centers = [
    {x:676,  y:860},  {x:1748, y:860},  {x:2820, y:860},  {x:3892, y:860},  {x:4964, y:860},
    {x:676,  y:2220}, {x:1748, y:2220}, {x:2820, y:2220}, {x:3892, y:2220}, {x:4964, y:2220},
];

const IMG_W  = 5632;
const IMG_H  = 3072;
const radius = 460;  // 115 × 4
const side   = 920;  // 230 × 4

console.log('radius:', radius, 'px  |  crop size:', side + 'x' + side, 'px');

// Circular SVG mask (white circle = keep, transparent outside)
const svgMask = Buffer.from(
    '<svg width="' + side + '" height="' + side + '">'
    + '<circle cx="' + radius + '" cy="' + radius + '" r="' + radius + '" fill="white"/>'
    + '</svg>'
);

const SRC1 = 'C:\\Users\\pvr66\\Downloads\\new avatars\\image_b5cb3e24.png';
const SRC2 = 'C:\\Users\\pvr66\\Downloads\\new avatars\\image_e6fed91b.png';

async function extract(src, startNum) {
    const tasks = centers.map((c, i) => {
        const n    = startNum + i;
        const left = Math.max(0, c.x - radius);
        const top  = Math.max(0, c.y - radius);
        const w    = Math.min(side, IMG_W - left);
        const h    = Math.min(side, IMG_H - top);
        const dest = path.join(OUT, 'c4k-avatar-' + n + '.png');
        console.log('  avatar', n, '| center:', c.x + ',' + c.y,
                    '| crop:', left + ',' + top, w + 'x' + h);
        return sharp(src)
            .extract({ left, top, width: w, height: h })
            .resize(side, side, { fit: 'fill' })
            .composite([{ input: svgMask, blend: 'dest-in' }])
            .png()
            .toFile(dest)
            .then(() => process.stdout.write(' ✓' + n));
    });
    await Promise.all(tasks);
    console.log('');
}

extract(SRC1, 1)
    .then(() => extract(SRC2, 11))
    .then(() => console.log('\nALL DONE — 20 avatars saved to', OUT))
    .catch(err => { console.error(err); process.exit(1); });
