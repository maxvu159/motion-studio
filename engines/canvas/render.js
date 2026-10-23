// Render a canvas-engine project.
//   node render.js <projectDir> all [--jobs 4] [--scale 1]     -> <project>/local/render.mp4 (silent)
//   node render.js <projectDir> frames <from> <to>             -> <project>/local/frames/f00000.jpg ...
//   node render.js <projectDir> stills <outDir> <f1> <f2> ...  -> single frames for checking
// The page is opened from file:// with --allow-file-access-from-files (a local http server stalls on frames).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn, execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const [projArg, mode, ...rest] = process.argv.slice(2);
if (!projArg || !mode) { console.error('usage: node render.js <projectDir> all|frames|stills ...'); process.exit(1); }
const project = path.resolve(projArg);
const edl = JSON.parse(fs.readFileSync(path.join(project, 'edl.json'), 'utf8'));
const total = edl.total;

async function work(frames, outDir) {
  const b = await chromium.launch({ channel: 'chromium', args: ['--allow-file-access-from-files', '--disable-web-security', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: edl.w || 1920, height: edl.h || 1080 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGE', e.message));
  const url = 'file://' + path.join(__dirname, 'runtime/comp.html') + `?root=${encodeURIComponent(ROOT)}&project=${encodeURIComponent(project)}`;
  await p.goto(url);
  fs.mkdirSync(outDir, { recursive: true });
  const el = await p.$('canvas');
  for (const f of frames) {
    await p.evaluate(f => window.renderFrame(f), f);
    await el.screenshot({ path: path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
  }
  await b.close();
}
(async () => {
  if (mode === 'frames') { const [a, z] = rest.map(Number); const fr = []; for (let f = a; f < z; f++) fr.push(f); await work(fr, path.join(project, 'local/frames')); }
  else if (mode === 'stills') { await work(rest.slice(1).map(Number), path.resolve(rest[0])); }
  else if (mode === 'all') {
    const jobs = Number((rest[rest.indexOf('--jobs') + 1]) || 4) || 4;
    const framesDir = path.join(project, 'local/frames'); fs.rmSync(framesDir, { recursive: true, force: true });
    const chunk = Math.ceil(total / jobs), t0 = Date.now();
    await Promise.all([...Array(jobs)].map((_, j) => new Promise((res, rej) => {
      const a = j * chunk, z = Math.min(total, a + chunk); if (a >= z) return res();
      const c = spawn(process.execPath, [__filename, project, 'frames', String(a), String(z)], { stdio: 'inherit' });
      c.on('exit', code => code ? rej(new Error('worker failed')) : res());
    })));
    const out = path.join(project, 'local/render.mp4');
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(edl.fps || 30), '-i', path.join(framesDir, 'f%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', out]);
    console.log(`${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${out}`);
  }
})();
