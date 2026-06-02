const sharp = require('sharp');
const path = require('path');

const SCALE = 10;
const SW = 64 * SCALE; // 640
const DW = 640, DH = 320;

async function convert(inputPath, outputPath) {
  const src = await sharp(inputPath)
    .resize(SW, SW, { kernel: 'nearest' })
    .png()
    .toBuffer();

  const { data: srcPixels, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;

  const dst = Buffer.alloc(DW * DH * 4, 0);

  function copy(sx, sy, sw, sh, dx, dy, flipX, flipY) {
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const srcX = flipX ? (sw - 1 - x) : x;
        const srcY = flipY ? (sh - 1 - y) : y;
        const si = ((sy + srcY) * SW + (sx + srcX)) * channels;
        const di = ((dy + y) * DW + (dx + x)) * 4;
        dst[di]     = srcPixels[si];
        dst[di + 1] = srcPixels[si + 1];
        dst[di + 2] = srcPixels[si + 2];
        dst[di + 3] = channels >= 4 ? srcPixels[si + 3] : 255;
      }
    }
  }

  // ===== HEAD =====
  // source: standard 64×64 skin ×10
  // target: CSS background-positions
  copy( 80,   0, 80, 80,  80,  0);          // top
  copy(160,   0, 80, 80, 160,  0);          // bottom
  copy(  0,  80, 80, 80,   0, 80);          // char-right → viewer-left
  copy( 80,  80, 80, 80,  80, 80);          // front
  copy(160,  80, 80, 80, 160, 80);          // char-left → viewer-right
  copy(240,  80, 80, 80, 240, 80);          // back

  // ===== TORSO =====
  copy(200, 160, 80, 40, 200, 160);         // top
  copy(280, 160, 80, 40, 280, 160);         // bottom
  copy(160, 200, 40,120, 160, 200);         // char-right → viewer-left
  copy(200, 200, 80,120, 200, 200);         // front
  copy(280, 200, 40,120, 280, 200);         // char-left → viewer-right
  copy(320, 200, 80,120, 320, 200);         // back

  // ===== LEFT LEG =====
  copy( 40, 160, 40, 40,  40, 160);         // top
  copy( 80, 160, 40, 40,  80, 160);         // bottom
  copy(  0, 200, 40,120,   0, 200);         // outer side
  copy( 40, 200, 40,120,  40, 200);         // front
  copy( 80, 200, 40,120,  80, 200);         // inner side
  copy(120, 200, 40,120, 120, 200);         // back

  // ===== LEFT ARM =====
  // standard Minecraft 64×64 top half: arm at x=40-56, y=16-32
  copy(440, 160, 40, 40, 440, 160);         // top
  copy(480, 160, 40, 40, 480, 160);         // bottom
  copy(400, 200, 40,120, 400, 200);         // outer side
  copy(440, 200, 40,120, 440, 200);         // front
  copy(480, 200, 40,120, 480, 200);         // inner side
  copy(520, 200, 40,120, 520, 200);         // back

  // ===== RIGHT LEG (same positions as left leg, CSS flips) =====
  // already covered by left leg copy above

  // ===== RIGHT ARM (same positions as left arm, CSS flips) =====
  // already covered by left arm copy above

  await sharp(dst, { raw: { width: DW, height: DH, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
}

const input = process.argv[2] || 'godofredoninja.png';
const output = process.argv[3] || 'godofredoninja.png';
convert(input, output).catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
