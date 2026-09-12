import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// -----------------------------------------------------------------------------
// Minimal PNG / ICO Generator using built-in zlib & crc32
// -----------------------------------------------------------------------------
function crc32(buf) {
  let table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

function makePng(width, height, getPixelRgba) {
  // 8-byte PNG signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 6 // color type: RGBA
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace

  const ihdrLen = Buffer.alloc(4)
  ihdrLen.writeUInt32BE(13, 0)
  const ihdrType = Buffer.from('IHDR')
  const ihdrCrcVal = crc32(Buffer.concat([ihdrType, ihdrData]))
  const ihdrCrc = Buffer.alloc(4)
  ihdrCrc.writeUInt32BE(ihdrCrcVal, 0)

  const ihdrChunk = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc])

  // Raw uncompressed scanlines
  const rowLen = 1 + width * 4
  const rawData = Buffer.alloc(height * rowLen)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen
    rawData[rowOffset] = 0 // filter byte: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height)
      const pxOffset = rowOffset + 1 + x * 4
      rawData[pxOffset] = r
      rawData[pxOffset + 1] = g
      rawData[pxOffset + 2] = b
      rawData[pxOffset + 3] = a
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 })
  const idatLen = Buffer.alloc(4)
  idatLen.writeUInt32BE(deflated.length, 0)
  const idatType = Buffer.from('IDAT')
  const idatCrcVal = crc32(Buffer.concat([idatType, deflated]))
  const idatCrc = Buffer.alloc(4)
  idatCrc.writeUInt32BE(idatCrcVal, 0)

  const idatChunk = Buffer.concat([idatLen, idatType, deflated, idatCrc])

  // IEND
  const iendLen = Buffer.alloc(4)
  iendLen.writeUInt32BE(0, 0)
  const iendType = Buffer.from('IEND')
  const iendCrcVal = crc32(iendType)
  const iendCrc = Buffer.alloc(4)
  iendCrc.writeUInt32BE(iendCrcVal, 0)

  const iendChunk = Buffer.concat([iendLen, iendType, iendCrc])

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk])
}

function makeIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)

  const dirEntry = Buffer.alloc(16)
  dirEntry.writeUInt8(width >= 256 ? 0 : width, 0)
  dirEntry.writeUInt8(height >= 256 ? 0 : height, 1)
  dirEntry.writeUInt8(0, 2)
  dirEntry.writeUInt8(0, 3)
  dirEntry.writeUInt16LE(1, 4)
  dirEntry.writeUInt16LE(32, 6)
  dirEntry.writeUInt32LE(pngBuffer.length, 8)
  dirEntry.writeUInt32LE(22, 12)

  return Buffer.concat([header, dirEntry, pngBuffer])
}

// -----------------------------------------------------------------------------
// 1. Favicon SVG
// -----------------------------------------------------------------------------
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#0A1B27" />
  <!-- Compass ring in Indian Saffron -->
  <circle cx="32" cy="32" r="24" stroke="#E86014" stroke-width="2.5" />
  <circle cx="32" cy="32" r="19" stroke="#EAF4F8" stroke-width="1" stroke-dasharray="3 3" stroke-opacity="0.4" />
  <!-- Cardinal points -->
  <line x1="32" y1="8" x2="32" y2="13" stroke="#E86014" stroke-width="3" stroke-linecap="round" />
  <line x1="32" y1="51" x2="32" y2="56" stroke="#106644" stroke-width="3" stroke-linecap="round" />
  <line x1="8" y1="32" x2="13" y2="32" stroke="#106644" stroke-width="3" stroke-linecap="round" />
  <line x1="51" y1="32" x2="56" y2="32" stroke="#106644" stroke-width="3" stroke-linecap="round" />
  <!-- Marine bathymetric wave profile -->
  <path d="M14 36 C22 28, 28 40, 38 32 C46 26, 50 31, 52 34" stroke="#FAF6EE" stroke-width="2.8" stroke-linecap="round" />
  <path d="M17 42 C24 35, 30 45, 40 38 C45 35, 48 37, 50 39" stroke="#007A78" stroke-width="2.2" stroke-linecap="round" />
  <!-- Center sounding node in Saffron -->
  <circle cx="32" cy="32" r="4.5" fill="#E86014" stroke="#FAF6EE" stroke-width="1.5" />
</svg>
`

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf8')
console.log('Created public/favicon.svg')

// -----------------------------------------------------------------------------
// 2. Favicon Pixel Renderer (16x16, 32x32, 180x180)
// -----------------------------------------------------------------------------
function renderFaviconPixel(x, y, w, h) {
  const nx = (x / (w - 1)) * 2 - 1
  const ny = (y / (h - 1)) * 2 - 1
  const r = Math.sqrt(nx * nx + ny * ny)

  if (Math.abs(nx) > 0.95 || Math.abs(ny) > 0.95) {
    if (r > 1.05) return [0, 0, 0, 0]
  }

  const ringDist = Math.abs(r - 0.76)
  if (ringDist < 0.08) {
    return [232, 96, 20, 255] // Saffron ring
  }

  if (r > 0.75 && r < 0.95) {
    if (Math.abs(nx) < 0.1 && ny < 0) return [232, 96, 20, 255]
    if (Math.abs(nx) < 0.1 && ny > 0) return [16, 102, 68, 255]
    if (Math.abs(ny) < 0.1) return [16, 102, 68, 255]
  }

  if (r < 0.16) {
    return [232, 96, 20, 255]
  }
  if (r >= 0.16 && r < 0.22) {
    return [250, 246, 238, 255]
  }

  const waveY1 = 0.15 + 0.18 * Math.sin(nx * 3.14 + 0.4)
  const waveDist1 = Math.abs(ny - waveY1)
  if (waveDist1 < 0.09 && Math.abs(nx) < 0.7) {
    return [250, 246, 238, 255]
  }

  const waveY2 = 0.35 + 0.18 * Math.sin(nx * 3.14 + 0.8)
  const waveDist2 = Math.abs(ny - waveY2)
  if (waveDist2 < 0.08 && Math.abs(nx) < 0.65) {
    return [0, 122, 120, 255]
  }

  if (r < 0.76) {
    return [10, 27, 39, 255]
  }

  return [10, 27, 39, 255]
}

const fav16 = makePng(16, 16, renderFaviconPixel)
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), fav16)

const fav32 = makePng(32, 32, renderFaviconPixel)
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), fav32)

const appleTouch = makePng(180, 180, renderFaviconPixel)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch)

const icoBuf = makeIcoFromPng(fav32, 32, 32)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf)
console.log('Created favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png')

// -----------------------------------------------------------------------------
// 3. Open Graph 1200x630 Social Share Image
// -----------------------------------------------------------------------------
function renderOgPixel(x, y, w, h) {
  const cx = w * 0.28
  const cy = h * 0.5
  const dx = (x - cx) / w
  const dy = (y - cy) / h
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (y < 3) return [232, 96, 20, 255]
  if (y < 6) return [250, 246, 238, 255]
  if (y < 9) return [16, 102, 68, 255]

  if (y > h - 4) return [0, 122, 120, 255]

  if (x % 50 === 0 || y % 50 === 0) {
    if (dist > 0.35) {
      return [16, 38, 56, 255]
    }
  }

  // Brand Logo Mark at x=230, y=315
  const lcx = 230
  const lcy = 315
  const ldx = (x - lcx) / 130
  const ldy = (y - lcy) / 130
  const lr = Math.sqrt(ldx * ldx + ldy * ldy)

  if (lr < 1.0) {
    if (Math.abs(lr - 0.85) < 0.04) {
      return [232, 96, 20, 255]
    }
    if (Math.abs(lr - 0.7) < 0.02) {
      const angle = Math.atan2(ldy, ldx)
      if (Math.sin(angle * 16) > 0) return [250, 246, 238, 120]
    }
    if (lr > 0.8 && lr < 1.0) {
      if (Math.abs(ldx) < 0.03 && ldy < 0) return [232, 96, 20, 255]
      if (Math.abs(ldx) < 0.03 && ldy > 0) return [16, 102, 68, 255]
      if (Math.abs(ldy) < 0.03) return [16, 102, 68, 255]
    }
    if (lr < 0.12) {
      return [232, 96, 20, 255]
    }
    const w1 = 0.12 + 0.16 * Math.sin(ldx * 3.5 + 0.5)
    if (Math.abs(ldy - w1) < 0.05 && Math.abs(ldx) < 0.65) {
      return [250, 246, 238, 255]
    }
    const w2 = 0.28 + 0.16 * Math.sin(ldx * 3.5 + 1.0)
    if (Math.abs(ldy - w2) < 0.04 && Math.abs(ldx) < 0.6) {
      return [0, 122, 120, 255]
    }
  }

  // Right card bands
  if (x > 420 && x < 1140) {
    if (y >= 460 && y <= 520) {
      const cardWidth = 160
      const gap = 16
      const startX = 430
      for (let i = 0; i < 4; i++) {
        const cLeft = startX + i * (cardWidth + gap)
        const cRight = cLeft + cardWidth
        if (x >= cLeft && x <= cRight) {
          if (y >= 460 && y <= 464) {
            if (i === 0) return [16, 102, 68, 255]
            if (i === 1) return [232, 96, 20, 255]
            if (i === 2) return [212, 136, 26, 255]
            if (i === 3) return [0, 122, 120, 255]
          }
          return [18, 44, 61, 255]
        }
      }
    }
  }

  const glow = Math.max(0, 1 - dist * 1.5)
  const r = Math.min(255, Math.floor(9 + glow * 15))
  const g = Math.min(255, Math.floor(24 + glow * 35))
  const b = Math.min(255, Math.floor(37 + glow * 45))

  return [r, g, b, 255]
}

console.log('Rendering 1200x630 og-image.png...')
const ogBuf = makePng(1200, 630, renderOgPixel)
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuf)
console.log('Created public/og-image.png (1200x630)')
