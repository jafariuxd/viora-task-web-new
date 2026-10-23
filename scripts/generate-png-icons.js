import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal CRC32 implementation
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  const bgR = 15, bgG = 15, bgB = 18; // #0F0F12
  const limeR = 180, limeG = 255, limeB = 0; // #B4FF00
  const lime2R = 156, lime2G = 230, lime2B = 0;

  const scale = isMaskable ? 0.72 : 0.85;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background
      let r = bgR;
      let g = bgG;
      let b = bgB;
      let a = 255;

      // Subtle radial dark gradient
      const distFromCenter = Math.hypot(x - centerX, y - centerY) / (width * 0.5);
      if (distFromCenter < 1.0) {
        const factor = 1 - distFromCenter * 0.35;
        r = Math.min(255, Math.floor(bgR * factor + 10 * (1 - distFromCenter)));
        g = Math.min(255, Math.floor(bgG * factor + 10 * (1 - distFromCenter)));
        b = Math.min(255, Math.floor(bgB * factor + 14 * (1 - distFromCenter)));
      }

      // Rounded rect boundary if not maskable
      if (!isMaskable) {
        const cornerR = width * 0.22;
        const dx = Math.max(0, Math.abs(x - centerX) - (width / 2 - cornerR));
        const dy = Math.max(0, Math.abs(y - centerY) - (height / 2 - cornerR));
        if (Math.hypot(dx, dy) > cornerR) {
          a = 0; // transparent outside rounded squircle
        }
      }

      // Draw stylized V shape if inside icon
      // Normalized coordinates from -1 to 1 centered
      const nx = (x - centerX) / (centerX * scale);
      const ny = (y - centerY) / (centerY * scale);

      // Left branch: line from (-0.55, -0.6) to (0, 0.45)
      // Right branch: line from (0, 0.45) to (0.55, -0.6)
      // Dot at (0, 0.7)
      if (a > 0) {
        let insideGlyph = false;

        // Check if inside V arms
        // Left arm center line: y = 1.909 * x + 0.45 for x in [-0.55, 0]
        const leftArmDist = Math.abs(ny - (1.909 * nx + 0.45)) / Math.sqrt(1 + 1.909 * 1.909);
        const rightArmDist = Math.abs(ny - (-1.909 * nx + 0.45)) / Math.sqrt(1 + 1.909 * 1.909);

        if (
          (nx <= 0.05 && nx >= -0.6 && ny >= -0.65 && ny <= 0.55 && leftArmDist < 0.16) ||
          (nx >= -0.05 && nx <= 0.6 && ny >= -0.65 && ny <= 0.55 && rightArmDist < 0.16)
        ) {
          insideGlyph = true;
        }

        // Check milestone dot at (0, 0.68)
        const dotDist = Math.hypot(nx - 0, ny - 0.7);
        if (dotDist < 0.1) {
          insideGlyph = true;
        }

        if (insideGlyph) {
          const t = (ny + 0.6) / 1.3;
          r = Math.floor(limeR * (1 - t * 0.2) + lime2R * (t * 0.2));
          g = Math.floor(limeG * (1 - t * 0.1) + lime2G * (t * 0.1));
          b = Math.floor(limeB * (1 - t) + lime2B * t);
          a = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // color type 6 (RGBA)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('Successfully generated all PWA icons: 192x192, 512x512, maskable, apple-touch-icon');
