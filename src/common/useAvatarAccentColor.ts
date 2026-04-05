// Caught in 4K — Avatar accent color extraction
// Samples pixels from an avatar image via Canvas API and returns the dominant
// saturated hue as a set of CSS-ready color strings.
// No external packages — native Canvas only.

export interface AvatarAccentColor {
    hsl: { h: number; s: number; l: number };
    accent: string; // e.g. "hsl(187, 72%, 62%)"
    glow: string; // e.g. "hsla(187, 72%, 62%, 0.35)"
    accentDark: string; // darkened for backgrounds: lightness capped at 30%
}

/**
 * Extracts the dominant saturated accent color from an avatar image.
 * Returns null on failure — callers must handle the fallback.
 */
export async function extractAccentFromAvatar(imageSrc: string): Promise<AvatarAccentColor | null> {
    return new Promise((resolve) => {
        const img = new Image();

        const onLoad = () => {
            try {
                // Sample at 80×80 — enough hue data, very fast
                const SIZE = 80;
                const canvas = document.createElement('canvas');
                canvas.width = SIZE;
                canvas.height = SIZE;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(null); return; }

                ctx.drawImage(img, 0, 0, SIZE, SIZE);
                const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

                // 36 hue buckets of 10° each
                const buckets: { count: number; maxSat: number }[] =
                    Array.from({ length: 36 }, () => ({ count: 0, maxSat: 0 }));

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i] / 255;
                    const g = data[i + 1] / 255;
                    const b = data[i + 2] / 255;
                    const a = data[i + 3];

                    if (a < 80) continue; // skip mostly transparent pixels

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const l = (max + min) / 2;

                    // Ignore near-black (< 15%) and near-white (> 85%) pixels
                    if (l < 0.15 || l > 0.85) continue;

                    const diff = max - min;
                    if (diff < 0.08) continue; // too grey — skip low-chroma pixels

                    const s = diff / (1 - Math.abs(2 * l - 1));
                    if (s < 0.20) continue; // saturation < 20% — ignore

                    // Calculate hue
                    let h: number;
                    if (max === r) {
                        h = ((g - b) / diff) % 6;
                    } else if (max === g) {
                        h = (b - r) / diff + 2;
                    } else {
                        h = (r - g) / diff + 4;
                    }
                    h = ((h * 60) + 360) % 360;

                    const bucketIdx = Math.floor(h / 10) % 36;
                    buckets[bucketIdx].count++;
                    if (s > buckets[bucketIdx].maxSat) {
                        buckets[bucketIdx].maxSat = s;
                    }
                }

                // Find the hue bucket with the most qualifying pixels
                let maxCount = 0;
                let winningBucket = -1;
                buckets.forEach((bucket, i) => {
                    if (bucket.count > maxCount) {
                        maxCount = bucket.count;
                        winningBucket = i;
                    }
                });

                // Require at least 50 qualifying pixels (< 1% of 80×80 grid)
                if (winningBucket === -1 || maxCount < 50) {
                    resolve(null);
                    return;
                }

                // Use bucket centre hue; clamp saturation to 60–80% for UI legibility
                const h = winningBucket * 10 + 5;
                const s = Math.round(Math.min(Math.max(buckets[winningBucket].maxSat * 100, 60), 80));
                // 62% lightness — bright enough to glow, not blinding
                const lValue = 62;

                resolve({
                    hsl: { h, s, l: lValue },
                    accent: `hsl(${h}, ${s}%, ${lValue}%)`,
                    glow: `hsla(${h}, ${s}%, ${lValue}%, 0.35)`,
                    accentDark: `hsl(${h}, ${s}%, 30%)`,
                });
            } catch (_e) {
                console.warn('Avatar accent extraction failed, using default');
                resolve(null);
            }
        };

        img.onload = onLoad;
        img.onerror = () => {
            console.warn('Avatar accent extraction failed, using default');
            resolve(null);
        };
        img.src = imageSrc;
    });
}

export default extractAccentFromAvatar;
