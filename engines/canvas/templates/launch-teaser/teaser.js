/*
 * LAUNCH TEASER scene for the canvas runtime (shot type 'teaser').
 *
 *   tl.shot('teaser', 0, 16, words=['ONE', 'VAULT.', 'EVERY', 'MARKET.'], name='Northwind', tagline='Vaults for every market.',
 *           cta='Coming soon', phase=[4, 4, 8])
 *
 * Phases, in beats from the shot start (phase = [words, assemble, lockup]):
 *   1. words   one word slams in per beat (motion-blurred), last word holds
 *   2. assemble the last word bursts into particles that fly into the brand mark (sampled from the
 *               brand SVG: paths with data-role="glyph", else all paths); impact shake on the downbeat
 *   3. lockup  mark resolves to vector, name slides in, tagline types, CTA pill appears
 * Put the shot start on a downbeat and phase boundaries on bar lines of the music.
 */
(() => {
  const { cl, lerp, eo, eo5, eio, hash, txt, spaced, alpha } = MS;
  let MARK = null, PTS = [];

  MS.init = (prev => async () => {
    if (prev) await prev();
    MARK = await MS.markPaths();
    // sample the glyph into target points (normalised 0..1 in the mark's viewBox)
    const S = 360, o = document.createElement('canvas'); o.width = o.height = S; const x = o.getContext('2d');
    const [, , vw, vh] = MARK.vb; x.scale(S / vw, S / vh);
    const glyph = MARK.paths.filter(p => p.role === 'glyph'); const use = glyph.length ? glyph : MARK.paths;
    x.fillStyle = '#fff'; use.forEach(p => x.fill(p.path));
    const d = x.getImageData(0, 0, S, S).data;
    for (let y = 0; y < S; y += 5) for (let xx = 0; xx < S; xx += 5) if (d[(y * S + xx) * 4 + 3] > 128) PTS.push([xx / S, y / S]);
  })(MS.init);

  const beatOf = (f, sh) => (f / MS.FPS) * (MS.EDL.bpm / 60) - (sh.t0 / MS.FPS) * (MS.EDL.bpm / 60);

  function drawMark(cx, cy, size, a, glyphOnly) {
    const ctx = MS.ctx, [, , vw, vh] = MARK.vb; ctx.save(); ctx.globalAlpha = a; ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(size / vw, size / vh);
    for (const p of MARK.paths) { if (glyphOnly && p.role !== 'glyph') continue; ctx.fillStyle = p.fill; ctx.fill(p.path); }
    ctx.restore();
  }

  function frameAt(sh, fr) {
    const ctx = MS.ctx, W = MS.W, H = MS.H, C = MS.C, F = MS.FONT, B = MS.BRAND;
    const [pw, pa, pl] = sh.phase || [4, 4, 8], b = beatOf(fr, sh);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, H * .8); g.addColorStop(0, alpha(C.accent, .10 * cl(b / 2))); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // impact shake on phase boundaries
    const imp = [pw, pw + pa].map(k => b - k).filter(d => d >= 0 && d < .6).map(d => Math.exp(-d * 9));
    const sk = imp.length ? imp[0] * 14 : 0; ctx.save(); ctx.translate(Math.sin(fr * 2.1) * sk, Math.cos(fr * 1.7) * sk);
    const words = sh.words || [], size = sh.size || 210, mark = Math.min(W, H) * .36, cx = W / 2, cy = H / 2 - 40;
    if (b < pw) {   // 1. words
      const i = Math.min(words.length - 1, Math.floor(b * words.length / pw)), lb = b - i * pw / words.length, p = eo5(cl(lb / .35));
      ctx.save(); ctx.translate(cx, H / 2 + (1 - p) * 70); const s = 1.12 - .12 * p; ctx.scale(s, s); ctx.globalAlpha = p;
      const w = words[i] || '', dot = w.endsWith('.');
      const tw = spaced(dot ? w.slice(0, -1) : w, 0, size * .36, `700 ${size}px ${F}`, C.text, -size * .03, 'center');
      if (dot) txt('.', tw / 2, size * .36, `700 ${size}px ${F}`, C.accent);
      ctx.restore();
    } else if (b < pw + pa) {   // 2. assemble
      const p = (b - pw) / pa;
      for (let k = 0; k < PTS.length; k++) {
        const [u, v] = PTS[k], h1 = hash(k * 1.3), h2 = hash(k * 7.9), h3 = hash(k * 3.7);
        const sx = cx + (h1 - .5) * size * 3.2, sy = H / 2 + (h2 - .5) * size * .8;          // start: spread over where the word was
        const tx = cx - mark / 2 + u * mark, ty = cy - mark / 2 + v * mark;
        const q = eio(cl((p - h3 * .35) / .65)), sw = Math.sin(q * Math.PI) * 120 * (h1 - .5);
        const x = lerp(sx, tx, q) + sw, y = lerp(sy, ty, q) - Math.sin(q * Math.PI) * 80 * h2;
        ctx.fillStyle = q > .98 ? C.accent : alpha(C.accent, .55 + .45 * q); ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
      }
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 * p; ctx.filter = 'blur(18px)';
      for (let k = 0; k < PTS.length; k += 6) { const [u, v] = PTS[k]; ctx.fillStyle = C.accent; ctx.fillRect(cx - mark / 2 + u * mark - 4, cy - mark / 2 + v * mark - 4, 8, 8); }
      ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    } else {   // 3. lockup
      const lb = b - pw - pa, m = eo5(cl(lb / 1)), slide = eo5(cl((lb - .5) / 1.2));
      const ms = lerp(mark, mark * .52, slide), mx = lerp(cx, cx - 330, slide), my = lerp(cy, H / 2 - 60, slide);
      drawMark(mx, my, ms, m, false);
      if (lb < 1) for (let k = 0; k < PTS.length; k += 2) { const [u, v] = PTS[k]; ctx.globalAlpha = 1 - m; ctx.fillStyle = C.accent; ctx.fillRect(mx - ms / 2 + u * ms - 2.5, my - ms / 2 + v * ms - 2.5, 5, 5); }
      ctx.globalAlpha = slide; spaced(sh.name || B.wordmark || B.name, mx + ms / 2 + 50 + (1 - slide) * 40, my + 46, `${B.type.displayWeight} 150px ${F}`, C.text, -4);
      const tg = sh.tagline || '', n = Math.floor(cl((lb - 1.8) / 1.6) * tg.length);
      ctx.globalAlpha = 1; txt(tg.slice(0, n), W / 2, H / 2 + 170, `500 46px ${F}`, C.dim, 'center');
      if (sh.cta) { const c = eo(cl((lb - 3.6) / .8)); if (c > 0) { ctx.globalAlpha = c; ctx.font = `600 32px ${F}`; const w = ctx.measureText(sh.cta).width + 64;
        MS.rr(W / 2 - w / 2, H / 2 + 230 + (1 - c) * 16, w, 64, 32); ctx.fillStyle = C.accent; ctx.fill(); txt(sh.cta, W / 2, H / 2 + 273 + (1 - c) * 16, `600 32px ${F}`, C.accentInk, 'center'); ctx.globalAlpha = 1; } }
    }
    ctx.restore();
  }

  MS.scene('teaser', async (sh, f) => {
    const [pw] = sh.phase || [4, 4, 8], b = beatOf(f, sh);
    if (b < pw) await MS.blur(fr => frameAt(sh, fr), f, 6, .6);   // motion blur only where things fly
    else frameAt(sh, f);
  });
})();
