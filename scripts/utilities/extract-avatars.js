const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '../../assets/images/avatars');

// Exact pixel coordinates for 1408x768 images
const centers = [
    {x:145, y:215}, {x:413, y:215}, {x:681, y:215}, {x:949, y:215}, {x:1217, y:215},
    {x:145, y:555}, {x:413, y:555}, {x:681, y:555}, {x:949, y:555}, {x:1217, y:555},
];

const radius = 120;  // px — captures full circle, leaves breathing room from neighbors
const side   = 240;  // 2 * radius

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
        const w    = Math.min(side, 1408 - left);
        const h    = Math.min(side, 768  - top);
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
