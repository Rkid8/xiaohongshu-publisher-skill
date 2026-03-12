#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function findChrome(preferred) {
  const candidates = [
    preferred,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);
  for (const p of candidates) if (fs.existsSync(p)) return p;
  throw new Error('Chrome/Chromium executable not found. Pass --chrome-path or set CHROME_PATH.');
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function slugify(text) { return String(text || 'post').replace(/\s+/g, '-').replace(/[^\w\-\u4e00-\u9fff]/g, '').slice(0, 32) || 'post'; }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function generateContent(spec) {
  const theme = spec.content.theme || '日常分享';
  const template = spec.content.template || 'daily';
  const base = {
    title: `${theme}｜简单分享`,
    body: `今天做一个关于${theme}的简单分享。\n\n✅ 适合日常场景\n✅ 表达尽量清楚直接\n✅ 先用最小可用版本测试发布流程\n\n如果你也对${theme}感兴趣，欢迎一起交流。`,
    hashtags: [theme]
  };

  if (theme.includes('防晒衣')) {
    if (template === 'selling') {
      base.title = '夏天真的离不开防晒衣｜轻薄又百搭';
      base.body = '最近在试一款很适合日常通勤和出门的防晒衣，做个简单分享～\n\n✅ 面料轻薄，上身不会闷\n✅ 日常通勤、骑车、散步都能穿\n✅ 颜色基础，很好搭衣服\n✅ 夏天在空调房里穿也合适\n\n我自己比较在意的是：防晒衣不能只有“防晒”两个字，还得真的愿意每天穿出去。\n\n如果你也在找一件适合夏天日常穿的防晒衣，可以看看这类轻便、百搭、透气的款式。';
      base.hashtags = ['防晒衣', '夏日穿搭', '通勤穿搭', '日常分享', '防晒'];
    } else if (template === 'knowledge') {
      base.title = '防晒衣怎么选？这 4 点最重要';
      base.body = '如果你在挑夏天穿的防晒衣，我觉得先看这几件事：\n\n✅ 面料是否轻薄透气\n✅ 上身会不会闷热黏身\n✅ 日常通勤和骑车是否方便\n✅ 颜色和版型是不是容易搭配\n\n很多防晒衣的问题不是“防不防晒”，而是你愿不愿意每天真的穿它。选到舒服、轻便、好搭的，使用率才会高。';
      base.hashtags = ['防晒衣', '穿搭技巧', '夏日防晒', '购物建议'];
    } else if (template === 'recruitment') {
      base.title = '找想试穿防晒衣的朋友｜一起做夏日测试';
      base.body = '最近在整理一批适合夏天日常穿的防晒衣测试内容，想找几位对轻薄、透气、好搭这类需求比较明确的朋友一起交流反馈。\n\n如果你平时会通勤、骑车、散步，或者一直在找好穿的防晒衣，欢迎留言说说你最在意的点。';
      base.hashtags = ['防晒衣', '招募', '夏日测试', '穿搭交流'];
    }
  } else if (template === 'selling') {
    base.title = `${theme}｜值得试试的一个版本`;
    base.body = `最近在整理关于${theme}的内容，做个简单种草分享。\n\n✅ 核心卖点更明确\n✅ 更适合日常使用场景\n✅ 先用最小版本测试反馈\n\n如果你也对${theme}感兴趣，可以先从最实用的版本开始看。`;
    base.hashtags = [theme, '种草', '日常分享'];
  } else if (template === 'knowledge') {
    base.title = `${theme}怎么入门？先看这几条`;
    base.body = `如果你刚开始接触${theme}，我建议先看这几件事：\n\n✅ 基本概念\n✅ 最常见误区\n✅ 实际使用场景\n✅ 低成本起步方法\n\n先把框架建立起来，再慢慢细化，效率会高很多。`;
    base.hashtags = [theme, '干货', '入门', '经验分享'];
  } else if (template === 'recruitment') {
    base.title = `想找对${theme}感兴趣的朋友一起交流`;
    base.body = `最近在做${theme}相关内容，想找一些真正有兴趣的人一起交流反馈。\n\n如果你也关注这个方向，欢迎留言说说你的经验、需求或者最想看的内容。`;
    base.hashtags = [theme, '招募', '交流', '反馈'];
  }

  const title = spec.content.title || base.title;
  const bodyCore = spec.content.body || base.body;
  const hashtags = (spec.content.hashtags && spec.content.hashtags.length ? spec.content.hashtags : base.hashtags)
    .map(t => t.startsWith('#') ? t : `#${t}`)
    .join(' ');

  return {
    title,
    body: `${bodyCore}\n\n${hashtags}`.trim(),
    hashtags
  };
}

function buildCoverSvg(title, subtitle, footer) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="1660" viewBox="0 0 1242 1660" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF7E8"/>
      <stop offset="100%" stop-color="#FFE0C7"/>
    </linearGradient>
  </defs>
  <rect width="1242" height="1660" fill="url(#bg)"/>
  <circle cx="1000" cy="260" r="180" fill="#FFD07A" opacity="0.65"/>
  <circle cx="240" cy="1320" r="220" fill="#FFC4A3" opacity="0.55"/>
  <rect x="118" y="170" width="1006" height="1320" rx="42" fill="#FFFDF9" opacity="0.95"/>
  <text x="621" y="500" text-anchor="middle" font-size="98" font-weight="700" fill="#FF7A00" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(title)}</text>
  <text x="621" y="640" text-anchor="middle" font-size="58" font-weight="600" fill="#2B2B2B" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(subtitle)}</text>
  <text x="621" y="1360" text-anchor="middle" font-size="40" fill="#8A8A8A" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(footer)}</text>
</svg>`;
}

function buildBulletCardSvg(header, points, footer) {
  const y0 = 380;
  const lines = points.map((p, idx) => `<text x="170" y="${y0 + idx * 140}" font-size="56" font-weight="600" fill="#2B2B2B" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">• ${esc(p)}</text>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="1660" viewBox="0 0 1242 1660" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="1660" fill="#FFF8F0"/>
  <rect x="100" y="120" width="1042" height="1420" rx="44" fill="#FFFFFF"/>
  <text x="621" y="240" text-anchor="middle" font-size="82" font-weight="700" fill="#FF7A00" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(header)}</text>
  ${lines}
  <text x="621" y="1460" text-anchor="middle" font-size="40" fill="#8A8A8A" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(footer)}</text>
</svg>`;
}

function buildCtaCardSvg(title, body, footer) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="1660" viewBox="0 0 1242 1660" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="1660" fill="#FFF3EC"/>
  <rect x="120" y="220" width="1002" height="1220" rx="50" fill="#FFFFFF"/>
  <text x="621" y="520" text-anchor="middle" font-size="90" font-weight="700" fill="#FF7A00" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(title)}</text>
  <text x="621" y="760" text-anchor="middle" font-size="54" fill="#343434" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(body)}</text>
  <text x="621" y="1300" text-anchor="middle" font-size="40" fill="#8A8A8A" font-family="PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif">${esc(footer)}</text>
</svg>`;
}

async function renderSvgToPng(browserContext, svg, pngPath) {
  const page = await browserContext.newPage();
  await page.setViewportSize({ width: 1242, height: 1660 });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.screenshot({ path: pngPath });
  await page.close();
}

function extractBulletPoints(text, max = 4) {
  const points = String(text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => s.startsWith('✅') || s.startsWith('-') || s.startsWith('•'))
    .map(s => s.replace(/^[✅•-]\s*/, ''));
  return points.slice(0, max);
}

async function makeSimpleCover(spec, browserContext, outDir) {
  ensureDir(outDir);
  const title = spec.images.cover?.title || spec.content.title || spec.content.theme || '小红书图文';
  const subtitle = spec.images.cover?.subtitle || '自动生成测试封面';
  const footer = spec.images.cover?.footer || '';
  const svg = buildCoverSvg(title, subtitle, footer);
  const slug = slugify(title);
  const svgPath = path.join(outDir, `${slug}.svg`);
  const pngPath = path.join(outDir, `${slug}.png`);
  fs.writeFileSync(svgPath, svg, 'utf8');
  await renderSvgToPng(browserContext, svg, pngPath);
  return [pngPath];
}

async function makeSimpleCards(spec, browserContext, outDir) {
  ensureDir(outDir);
  const base = slugify(spec.content.title || spec.content.theme || 'xhs-cards');
  const footer = spec.images.cards?.footer || '';
  const title = spec.images.cover?.title || spec.content.title || spec.content.theme || '小红书图文';
  const subtitle = spec.images.cover?.subtitle || '自动生成多图卡片';
  const bulletPoints = (spec.images.cards?.points && spec.images.cards.points.length)
    ? spec.images.cards.points.slice(0, 4)
    : extractBulletPoints(spec.content.body, 4);
  const cta = spec.images.cards?.cta || '喜欢这种简洁种草风格可以继续关注';

  const svgs = [
    { name: `${base}-01-cover`, svg: buildCoverSvg(title, subtitle, footer) },
    { name: `${base}-02-points`, svg: buildBulletCardSvg('这件防晒衣的亮点', bulletPoints.length ? bulletPoints : ['轻薄透气', '通勤百搭', '空调房可穿', '日常好搭配'], footer) },
    { name: `${base}-03-cta`, svg: buildCtaCardSvg('适合谁？', cta, footer) }
  ];

  const pngs = [];
  for (const item of svgs) {
    const svgPath = path.join(outDir, `${item.name}.svg`);
    const pngPath = path.join(outDir, `${item.name}.png`);
    fs.writeFileSync(svgPath, item.svg, 'utf8');
    await renderSvgToPng(browserContext, item.svg, pngPath);
    pngs.push(pngPath);
  }
  return pngs;
}

async function clickExactText(page, text) {
  return page.evaluate((target) => {
    const els = Array.from(document.querySelectorAll('*')).filter(el => (el.innerText || '').trim() === target);
    if (els[0]) { els[0].click(); return true; }
    return false;
  }, text);
}

function fileToDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function makeCompositePreview(spec, images, browserContext, outDir) {
  ensureDir(outDir);
  const title = esc(spec.content.title || '预览');
  const body = esc(spec.content.body || '').replace(/\n/g, '<br/>');
  const cards = (images || []).map(img => `<div class="card"><img src="${fileToDataUrl(img)}" /></div>`).join('');
  const html = `
  <html>
    <head>
      <style>
        body{margin:0;background:#f4eee8;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;color:#222}
        .wrap{width:1600px;margin:0 auto;padding:40px;box-sizing:border-box}
        .top{background:#fff;border-radius:28px;padding:36px 42px;box-shadow:0 6px 20px rgba(0,0,0,.05);margin-bottom:28px}
        h1{font-size:54px;line-height:1.25;margin:0 0 22px;color:#ff7a00}
        .body{font-size:28px;line-height:1.7;color:#333;white-space:normal}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .card{background:#fff;border-radius:24px;padding:18px;box-shadow:0 6px 18px rgba(0,0,0,.05)}
        img{width:100%;display:block;border-radius:18px}
        .footer{margin-top:24px;font-size:22px;color:#888;text-align:right}
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="top">
          <h1>${title}</h1>
          <div class="body">${body}</div>
          <div class="footer">预览图 · 发布前确认</div>
        </div>
        <div class="grid">${cards}</div>
      </div>
    </body>
  </html>`;
  const out = path.join(outDir, `${slugify(spec.content.title || 'preview')}-preview.jpg`);
  const page = await browserContext.newPage();
  await page.setViewportSize({ width: 1600, height: 2200 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: out, type: 'jpeg', quality: 90, fullPage: true });
  await page.close();
  return out;
}

function archivePreview(spec, screenshotPath, images, compositePath, archiveRoot) {
  ensureDir(archiveRoot);
  const dir = path.join(archiveRoot, `${stamp()}-${slugify(spec.content.title || spec.content.theme || 'post')}`);
  ensureDir(dir);
  const shotOut = path.join(dir, path.basename(screenshotPath));
  fs.copyFileSync(screenshotPath, shotOut);
  let compositeOut = null;
  if (compositePath && fs.existsSync(compositePath)) {
    compositeOut = path.join(dir, path.basename(compositePath));
    fs.copyFileSync(compositePath, compositeOut);
  }
  const archivedImages = [];
  for (const img of (images || [])) {
    if (img && fs.existsSync(img)) {
      const out = path.join(dir, path.basename(img));
      fs.copyFileSync(img, out);
      archivedImages.push(out);
    }
  }
  const meta = {
    archivedAt: new Date().toISOString(),
    mode: spec.mode,
    title: spec.content.title,
    body: spec.content.body,
    images: archivedImages,
    compositePreview: compositeOut,
    originalScreenshot: screenshotPath,
    publish: spec.publish || {}
  };
  const metaPath = path.join(dir, 'preview.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  return { dir, shotOut, compositeOut, metaPath, archivedImages };
}

async function setEditorContent(page, selector, text) {
  await page.locator(selector).click({ timeout: 30000 });
  await page.evaluate(({ selector, text }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No element found for selector: ${selector}`);
    const html = String(text || '').split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
    el.innerHTML = html;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text || '' }));
  }, { selector, text });
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.spec) {
    console.error('Usage: xhs_publish.js --spec /absolute/path/to/spec.json [--chrome-path PATH]');
    process.exit(2);
  }

  const spec = JSON.parse(fs.readFileSync(args.spec, 'utf8'));
  spec.mode = spec.mode || 'manual-confirm';
  spec.account = spec.account || {};
  spec.content = spec.content || { source: 'theme-generated', theme: '日常分享' };
  spec.images = spec.images || { source: 'simple-cover' };
  spec.publish = spec.publish || { confirmBeforePublish: spec.mode !== 'auto' };
  spec.archive = Object.assign({ enabled: true }, spec.archive || {});

  const chromePath = findChrome(args['chrome-path']);
  const profileDir = spec.account.profileDir || path.join(process.cwd(), 'tmp', 'xhs-profile');
  const artifactDir = spec.artifactDir || path.join(process.cwd(), 'tmp', 'xhs-artifacts');
  ensureDir(profileDir);
  ensureDir(artifactDir);

  const context = await chromium.launchPersistentContext(profileDir, {
    executablePath: chromePath,
    headless: spec.headless === true,
    viewport: { width: 1440, height: 960 },
    locale: 'zh-CN'
  });

  try {
    const generated = generateContent(spec);
    spec.content.title = spec.content.title || generated.title;
    spec.content.body = spec.content.body || generated.body;

    const current = spec.images.paths || [];
    if (spec.images.source === 'simple-cover') {
      spec.images.paths = [...await makeSimpleCover(spec, context, artifactDir), ...current];
    } else if (spec.images.source === 'simple-cards') {
      spec.images.paths = [...await makeSimpleCards(spec, context, artifactDir), ...current];
    } else if (spec.images.source === 'mixed') {
      spec.images.paths = [...await makeSimpleCards(spec, context, artifactDir), ...current];
    }

    const page = context.pages()[0] || await context.newPage();
    await page.goto('https://creator.xiaohongshu.com/publish/publish', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    await clickExactText(page, '上传图文');
    await page.waitForTimeout(1500);

    const imgInputs = page.locator('input[type=file][accept*=".jpg"]');
    if (await imgInputs.count()) {
      await imgInputs.first().setInputFiles(spec.images.paths || []);
    } else {
      throw new Error('No image upload input found on Xiaohongshu publish page.');
    }

    await page.waitForTimeout(8000);
    await page.locator("input[placeholder='填写标题会有更多赞哦']").fill(spec.content.title);
    await setEditorContent(page, "div[contenteditable='true']", spec.content.body);
    const shot = path.join(artifactDir, `${slugify(spec.content.title)}-filled.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const compositePreview = await makeCompositePreview(spec, spec.images.paths, context, artifactDir);
    const archiveInfo = spec.archive.enabled ? archivePreview(spec, shot, spec.images.paths, compositePreview, path.join(artifactDir, 'preview-archive')) : null;

    if (spec.mode === 'auto' && spec.publish.confirmBeforePublish !== true) {
      const published = await clickExactText(page, '发布');
      if (!published) throw new Error('Publish button not found.');
      await page.waitForTimeout(5000);
      console.log(JSON.stringify({ ok: true, mode: 'auto', screenshot: shot, previewImage: compositePreview, title: spec.content.title, images: spec.images.paths, archive: archiveInfo }, null, 2));
      return;
    }

    console.log(JSON.stringify({
      ok: true,
      mode: 'manual-confirm',
      screenshot: shot,
      previewImage: compositePreview,
      title: spec.content.title,
      body: spec.content.body,
      images: spec.images.paths,
      archive: archiveInfo,
      message: 'Content filled. Review in the visible browser window and publish manually.'
    }, null, 2));

    await page.waitForTimeout(spec.reviewWaitMs || 300000);
  } finally {
    await context.close();
  }
}

main().catch(err => {
  console.error(err.stack || String(err));
  process.exit(1);
});
