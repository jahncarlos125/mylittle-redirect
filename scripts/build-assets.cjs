const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = 'C:/www/mylittle-redirect/.claude/worktrees/site-meu-cuidado';
const SRC_SHOTS = 'C:/www/my-little/.store-shots';
const SRC_ASSETS = 'C:/www/my-little/assets';

const PUB = path.join(ROOT, 'public');
const SCREENSHOTS_DIR = path.join(PUB, 'screenshots');
const BRAND_DIR = path.join(PUB, 'brand');

const TEAL = '#0F5C52';
const DEEP = '#0A3F38';

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function convertScreenshots() {
  ensureDir(SCREENSHOTS_DIR);
  const names = [
    'hoje-light', 'pessoas-light', 'remedios-light', 'editar-light',
    'hoje-dark', 'pessoas-dark',
  ];
  for (const name of names) {
    const src = path.join(SRC_SHOTS, `${name}.jpg`);
    const dest = path.join(SCREENSHOTS_DIR, `${name}.webp`);
    await sharp(src)
      .resize({ width: 640 })
      .webp({ quality: 82 })
      .toFile(dest);
    const stat = fs.statSync(dest);
    const meta = await sharp(dest).metadata();
    console.log(`${name}.webp -> ${meta.width}x${meta.height}, ${(stat.size / 1024).toFixed(1)}KB`);
  }
}

async function convertBrand() {
  ensureDir(BRAND_DIR);

  // glifo-branco.png: copy white glyph as-is
  const glifoBrancoSrc = path.join(SRC_ASSETS, 'android-icon-foreground.png');
  const glifoBrancoDest = path.join(BRAND_DIR, 'glifo-branco.png');
  fs.copyFileSync(glifoBrancoSrc, glifoBrancoDest);
  const gbMeta = await sharp(glifoBrancoDest).metadata();
  console.log(`glifo-branco.png -> ${gbMeta.width}x${gbMeta.height}, ${(fs.statSync(glifoBrancoDest).size / 1024).toFixed(1)}KB`);

  // glifo-teal.png: downscale brand-mark.png (teal mark) to 512x512
  const brandMarkSrc = path.join(SRC_ASSETS, 'brand-mark.png');
  const glifoTealDest = path.join(BRAND_DIR, 'glifo-teal.png');
  await sharp(brandMarkSrc)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(glifoTealDest);
  const gtMeta = await sharp(glifoTealDest).metadata();
  console.log(`glifo-teal.png -> ${gtMeta.width}x${gtMeta.height}, ${(fs.statSync(glifoTealDest).size / 1024).toFixed(1)}KB`);

  // favicon.png: downscale brand-mark.png to 256x256
  const faviconDest = path.join(PUB, 'favicon.png');
  await sharp(brandMarkSrc)
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile(faviconDest);
  const favMeta = await sharp(faviconDest).metadata();
  console.log(`favicon.png -> ${favMeta.width}x${favMeta.height}, ${(fs.statSync(faviconDest).size / 1024).toFixed(1)}KB`);
}

async function buildOg() {
  const ogDest = path.join(PUB, 'og.png');
  const W = 1200, H = 630;

  // Teal gradient background + wordmark, via SVG
  const bgSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${TEAL}"/>
          <stop offset="100%" stop-color="${DEEP}"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <text x="70" y="330" font-family="Arial, sans-serif" font-size="72" font-weight="800" fill="#F6F3EE">Meu Cuidado</text>
      <text x="70" y="385" font-family="Arial, sans-serif" font-size="30" font-weight="500" fill="#C6E1D8">Cuidado compartilhado de quem você ama.</text>
    </svg>
  `);

  const background = await sharp(bgSvg).png().toBuffer();

  // Prepare hero phone composite (from out/01-hero-phone.png), scaled to fit height with margin
  const heroSrc = path.join(SRC_SHOTS, 'out', '01-hero-phone.png');
  const heroTargetHeight = 560; // leave margin top/bottom (630 - 2*35)
  const heroMeta = await sharp(heroSrc).metadata();
  const heroTargetWidth = Math.round((heroTargetHeight / heroMeta.height) * heroMeta.width);
  const heroBuf = await sharp(heroSrc)
    .resize({ height: heroTargetHeight })
    .png()
    .toBuffer();

  // Prepare glifo-branco (white glyph) sized for top-left branding area
  const glifoSrc = path.join(SRC_ASSETS, 'android-icon-foreground.png');
  const glifoSize = 120;
  const glifoBuf = await sharp(glifoSrc)
    .resize(glifoSize, glifoSize)
    .png()
    .toBuffer();

  const heroLeft = W - heroTargetWidth - 60; // right-aligned with margin
  const heroTop = Math.round((H - heroTargetHeight) / 2);

  await sharp(background)
    .composite([
      { input: heroBuf, left: heroLeft, top: heroTop },
      { input: glifoBuf, left: 70, top: 70 },
    ])
    .png()
    .toFile(ogDest);

  const meta = await sharp(ogDest).metadata();
  const stat = fs.statSync(ogDest);
  console.log(`og.png -> ${meta.width}x${meta.height}, ${(stat.size / 1024).toFixed(1)}KB`);
}

async function writeRobots() {
  const dest = path.join(PUB, 'robots.txt');
  const content = `User-agent: *\nAllow: /\n\nSitemap: https://mylittle.vercel.app/sitemap-index.xml\n`;
  fs.writeFileSync(dest, content, 'utf8');
  console.log('robots.txt written');
}

(async () => {
  await convertScreenshots();
  await convertBrand();
  await buildOg();
  await writeRobots();
  console.log('DONE');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
