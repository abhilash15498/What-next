import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../public/icons');
mkdirSync(OUT_DIR, { recursive: true });

// --- minimal PNG encoder (RGBA, no external deps) ---------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, getPixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter type 0 (none) per scanline
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- brand glyph: rounded indigo square + amber "next" arrow ----------------

const BG = [16, 18, 26]; // #10121A
const SURFACE = [25, 28, 39]; // #191C27
const AMBER = [255, 178, 56]; // #FFB238

function mix(c1, c2, t) {
  return c1.map((v, i) => Math.round(v + (c2[i] - v) * t));
}

function drawIcon(size) {
  const radius = size * 0.22; // rounded corners
  const cx = size / 2;
  const cy = size / 2;

  // Arrow: a chevron pointing up-right, built from three line segments
  // rendered as a thick stroke using distance-to-segment math.
  const p1 = [size * 0.28, size * 0.68];
  const p2 = [size * 0.68, size * 0.28];
  const p3 = [size * 0.46, size * 0.28];
  const p4 = [size * 0.68, size * 0.5];
  const strokeWidth = Math.max(1.6, size * 0.09);

  function distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy || 1;
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * dx;
    const projY = ay + t * dy;
    return Math.hypot(px - projX, py - projY);
  }

  function inRoundedSquare(x, y) {
    const dx = Math.max(0, Math.abs(x - cx) - (size / 2 - radius));
    const dy = Math.max(0, Math.abs(y - cy) - (size / 2 - radius));
    return Math.hypot(dx, dy) <= radius + 0.5;
  }

  return (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;

    if (!inRoundedSquare(px, py)) return [0, 0, 0, 0];

    // subtle vertical gradient background, BG -> SURFACE
    const bg = mix(BG, SURFACE, py / size);

    const dArrow = Math.min(
      distToSegment(px, py, p1[0], p1[1], p2[0], p2[1]),
      distToSegment(px, py, p3[0], p3[1], p2[0], p2[1]),
      distToSegment(px, py, p2[0], p2[1], p4[0], p4[1]),
    );

    if (dArrow <= strokeWidth / 2) {
      const edge = 1 - Math.max(0, dArrow - strokeWidth / 2 + 1);
      const color = mix(bg, AMBER, Math.max(0, Math.min(1, edge)));
      return [...color, 255];
    }

    return [...bg, 255];
  };
}

for (const size of [16, 32, 48, 128]) {
  const png = encodePng(size, size, drawIcon(size));
  writeFileSync(resolve(OUT_DIR, `icon-${size}.png`), png);
  console.log(`generated icon-${size}.png (${png.length} bytes)`);
}
