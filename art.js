/* Original SVG artwork: Padma the lotus mascot and the unlockable scenes. */
(() => {
  'use strict';
  const INK = '#2b1d17';

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
  const grey = (c, t) => { const [r, g, b] = hex(c), l = Math.round(r * 0.3 + g * 0.59 + b * 0.11); return mix(c, '#' + [l, l, l].map((v) => v.toString(16).padStart(2, '0')).join(''), t); };

  // Scenes unlock with streaks; `palette` maps to the CSS accent palette.
  const SCENES = [
    { id: 'pond', name: 'Lotus pond', streak: 0, palette: 'lotus', sky: ['#8fd3f4', '#d9f2fb'], hill: '#8fce72', ground: '#3f9f57', deep: '#2f8547', sun: '#fff3b0' },
    { id: 'forest', name: 'Forest monastery', streak: 3, palette: 'forest', sky: ['#a6dbe6', '#e6f5ee'], hill: '#4f9b72', ground: '#2f8a5b', deep: '#23744a', sun: '#fffbe0' },
    { id: 'night', name: 'Full-moon night', streak: 7, palette: 'moon', sky: ['#1d2766', '#4256a8'], hill: '#2c5c70', ground: '#1f6b5a', deep: '#185547', sun: '#fdf6d8', night: true },
    { id: 'temple', name: 'Mountain temple', streak: 14, palette: 'saffron', sky: ['#f4c39c', '#fbe6d2'], hill: '#a98bb5', ground: '#5aa469', deep: '#468a55', sun: '#fff0c8' },
    { id: 'gold', name: 'Bodhi at sunset', streak: 30, palette: 'gold', sky: ['#f59e5b', '#fde2b0'], hill: '#a7c25e', ground: '#6aa84f', deep: '#55903f', sun: '#fff1b8' }
  ];
  const scene = (id) => SCENES.find((s) => s.id === id) || SCENES[0];

  // 0 = lush, 1 = barren
  const decay = (h) => (h >= 70 ? 0 : h >= 40 ? 0.45 : 0.9);
  function colors(id, h) {
    const s = scene(id), d = decay(h);
    const bar = (c) => grey(mix(c, '#a59f93', d * 0.55), d * 0.8);
    return { ...s, d, sky: s.sky.map((c) => grey(c, d * 0.7)), hill: bar(s.hill), ground: bar(s.ground), deep: bar(s.deep) };
  }

  /* ---------- Padma ---------- */
  // mood: happy | ok | sad | sit | study | sleep
  function padma(mood = 'happy', size = 120) {
    const sad = mood === 'sad', closed = mood === 'sit' || mood === 'study' || mood === 'sleep';
    const petalFill = sad ? '#d7a3ae' : '#ec7f9c', body = sad ? '#efc7cf' : '#f8b9c6', belly = sad ? '#f6dde2' : '#fcd9e0';
    const spread = sad ? 1.25 : mood === 'ok' ? 1.0 : 0.92, droop = sad ? 14 : 0;
    const petal = (a, s) => `<path d="M0 0 C-13 -10 -12 -34 0 -46 C12 -34 13 -10 0 0Z" transform="translate(60 56) rotate(${a * spread + (a > 0 ? droop : a < 0 ? -droop : 0)}) scale(${s})" fill="${petalFill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    const limb = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${body}" stroke-width="5.5" stroke-linecap="round"/>`;
    let legs = '', arms = '';
    if (mood === 'sit' || mood === 'study' || mood === 'sleep') {
      legs = `<ellipse cx="60" cy="104" rx="34" ry="10" fill="${body}" stroke="${INK}" stroke-width="3"/>`;
      arms = mood === 'study'
        ? `<g transform="translate(60 96)"><path d="M-20 -6 L0 -2 L20 -6 L20 8 L0 12 L-20 8Z" fill="#fff8e8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M0 -2 V12" stroke="${INK}" stroke-width="2"/></g>`
        : `<circle cx="53" cy="96" r="5" fill="${body}" stroke="${INK}" stroke-width="3"/><circle cx="67" cy="96" r="5" fill="${body}" stroke="${INK}" stroke-width="3"/>`;
    } else if (sad) {
      legs = `<ellipse cx="44" cy="110" rx="9" ry="6" fill="${body}" stroke="${INK}" stroke-width="3"/><ellipse cx="76" cy="110" rx="9" ry="6" fill="${body}" stroke="${INK}" stroke-width="3"/>`;
      arms = limb('M28 84 Q22 96 26 104') + limb('M92 84 Q98 96 94 104');
    } else {
      legs = limb('M48 100 L46 112') + limb('M72 100 L74 112');
      arms = limb('M28 82 Q20 92 22 98') + (mood === 'happy' ? limb('M92 80 Q104 70 104 58') : limb('M92 82 Q100 92 98 98'));
    }
    const eyes = closed
      ? `<path d="M42 70 Q48 75 54 70M66 70 Q72 75 78 70" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
      : `<ellipse cx="48" cy="70" rx="4.2" ry="5.4" fill="${INK}"/><ellipse cx="72" cy="70" rx="4.2" ry="5.4" fill="${INK}"/><circle cx="49.5" cy="68" r="1.6" fill="#fff"/><circle cx="73.5" cy="68" r="1.6" fill="#fff"/>`;
    const brows = sad ? `<path d="M41 65 L53 60M79 65 L67 60" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` : '';
    const mouth = { happy: 'M53 81 Q60 89 67 81', ok: 'M55 83 Q60 86 65 83', sad: 'M54 86 Q60 80 66 86', sit: 'M55 82 Q60 86 65 82', study: 'M56 82 Q60 85 64 82', sleep: 'M57 83 Q60 85 63 83' }[mood];
    const zzz = mood === 'sleep' ? `<text x="92" y="40" font-family="Nunito, sans-serif" font-weight="900" font-size="16" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">z</text><text x="102" y="26" font-family="Nunito, sans-serif" font-weight="900" font-size="12" fill="#fff" stroke="${INK}" stroke-width="2.5" paint-order="stroke">z</text>` : '';
    return `<svg class="padma" width="${size}" height="${size}" viewBox="0 0 120 124" role="img" aria-label="Padma the lotus, ${mood}">
      ${[-64, -32, 32, 64].map((a) => petal(a, 0.95)).join('')}${petal(0, 1)}
      ${legs}
      <path d="M60 40 C86 40 96 62 95 80 C94 99 79 108 60 108 C41 108 26 99 25 80 C24 62 34 40 60 40Z" fill="${body}" stroke="${INK}" stroke-width="3.2"/>
      <ellipse cx="60" cy="92" rx="22" ry="12" fill="${belly}"/>
      ${arms}${eyes}${brows}
      <ellipse cx="39" cy="80" rx="5.5" ry="3.4" fill="#f27d98" opacity=".55"/><ellipse cx="81" cy="80" rx="5.5" ry="3.4" fill="#f27d98" opacity=".55"/>
      <path d="${mouth}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>${zzz}
    </svg>`;
  }

  /* ---------- landscape ---------- */
  const cloud = (x, y, s, c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="0" cy="0" r="16"/><circle cx="18" cy="-8" r="20"/><circle cx="40" cy="0" r="15"/><rect x="0" y="0" width="40" height="15"/></g>`;
  const bush = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="0" cy="0" r="12"/><circle cx="13" cy="-6" r="14"/><circle cx="27" cy="0" r="11"/></g>`;
  const pine = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M0 -60 L18 -28 H9 L24 -4 H-24 L-9 -28 H-18Z"/><rect x="-3" y="-4" width="6" height="10" fill="#6b4f3a"/></g>`;
  const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0 V12" stroke="#3a7d3f" stroke-width="2"/><circle r="4" fill="${c}"/><circle r="1.6" fill="#ffe27a"/></g>`;
  const twig = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0 L2 -26 M1 -14 L-8 -22 M2 -20 L10 -30" fill="none" stroke="#6e655c" stroke-width="3" stroke-linecap="round"/>`;
  const lotusFlower = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="16" ry="5" fill="#3f8f4f"/><path d="M-9 -2 C-12 -10 -6 -16 0 -18 C6 -16 12 -10 9 -2Z" fill="#f49ab0" stroke="${INK}" stroke-width="1.6"/><path d="M-4 -2 C-6 -10 -2 -16 0 -20 C2 -16 6 -10 4 -2Z" fill="#fcd0dc" stroke="${INK}" stroke-width="1.4"/></g>`;

  function landscape(id, h, mood) {
    const c = colors(id, h), d = c.d, s = scene(id);
    const lush = d === 0, barren = d > 0.6;
    let props = '';
    if (s.night) props += [...Array(14)].map((_, i) => `<circle cx="${(i * 53) % 400}" cy="${12 + (i * 37) % 90}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity="${barren ? 0.3 : 0.8}"/>`).join('');
    props += s.night
      ? `<circle cx="320" cy="56" r="26" fill="${c.sun}" opacity="${barren ? 0.5 : 1}"/>`
      : `<circle cx="330" cy="54" r="24" fill="${c.sun}" opacity="${barren ? 0.35 : 0.95}"/>`;
    if (!s.night) props += cloud(40, 70, 1, barren ? '#e3e3e3' : '#fff') + cloud(250, 40, 0.8, barren ? '#e3e3e3' : '#fff');
    if (id === 'temple') props += `<path d="M0 170 L70 90 L120 140 L180 70 L260 150 L320 100 L400 160 V200 H0Z" fill="${mix(c.hill, '#ffffff', 0.25)}"/>
      <g transform="translate(180 108)" fill="${mix(c.hill, INK, 0.35)}"><path d="M-14 0 Q0 -26 14 0Z"/><rect x="-18" y="0" width="36" height="6"/><path d="M0 -26 V-40" stroke="${mix(c.hill, INK, 0.35)}" stroke-width="3"/></g>`;
    props += `<path d="M0 175 Q90 130 190 160 T400 150 V220 H0Z" fill="${c.hill}"/>`;
    if (id === 'forest' || id === 'night') props += [30, 70, 330, 372].map((x, i) => pine(x, 165 + (i % 2) * 6, 0.9 + (i % 2) * 0.25, barren ? '#7a7f78' : mix(c.deep, '#0b3d2a', 0.2))).join('');
    if (id === 'gold') props += barren
      ? twig(330, 190, 2.2)
      : `<g transform="translate(335 190)"><path d="M-4 0 Q0 -40 -8 -70 M0 -40 Q12 -60 26 -66" stroke="#7a5536" stroke-width="7" fill="none" stroke-linecap="round"/>${[[-20, -80, 22], [8, -88, 26], [30, -70, 20], [-30, -60, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.deep}"/>`).join('')}</g>`;
    // ground
    props += `<path d="M0 200 Q200 170 400 200 V300 H0Z" fill="${c.ground}"/>`;
    // pond
    const pondC = barren ? '#8b7f70' : mix('#5ec4e0', c.ground, d * 0.6);
    props += `<ellipse cx="300" cy="248" rx="70" ry="16" fill="${pondC}" ${barren ? `stroke="#6e655c" stroke-width="2"` : ''}/>`;
    if (barren) props += `<path d="M260 246 l12 4 l8 -6 M300 252 l10 -5 l12 4 M320 244 l-8 6" stroke="#6e655c" stroke-width="2" fill="none"/>` + twig(250, 240, 1) + twig(345, 244, 0.8) + twig(60, 236, 1.2) + `<ellipse cx="110" cy="260" rx="14" ry="8" fill="#8d8a84"/>`;
    else {
      props += lotusFlower(280, 248, lush ? 1 : 0.8) + (lush ? lotusFlower(320, 252, 0.8) : '') + `<ellipse cx="302" cy="244" rx="10" ry="3" fill="#3f8f4f"/>`;
      props += bush(20, 214, 1, c.deep) + bush(350, 214, 0.9, c.deep) + (lush ? bush(110, 262, 0.7, c.deep) : '');
      if (lush) props += flower(70, 226, '#fff3a6') + flower(92, 236, '#ffb3c4') + flower(240, 228, '#ffd27a');
    }
    return `<svg class="landscape" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#sky-${id})"/>${props}
      ${mood ? `<ellipse cx="200" cy="226" rx="44" ry="7" fill="#000" opacity=".15"/><g class="bob"><svg x="138" y="104" width="124" height="128" viewBox="0 0 120 124">${padma(mood).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>` : ''}</svg>`;
  }

  /* ---------- zen garden for sessions ---------- */
  function zen(id, mood = 'sit', align = 'xMidYMax') {
    const c = colors(id, 100), s = scene(id);
    const rake = [...Array(7)].map((_, i) => `<ellipse cx="200" cy="300" rx="${90 + i * 34}" ry="${30 + i * 13}" fill="none" stroke="${mix(c.ground, '#ffffff', 0.18)}" stroke-width="2"/>`).join('');
    const leaves = [[-70, -150, 46], [-20, -175, 52], [40, -160, 48], [85, -125, 38], [-100, -110, 34], [10, -125, 40]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.deep}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.55}" fill="${mix(c.deep, '#ffffff', 0.15)}"/>`).join('');
    return `<svg class="landscape" viewBox="0 0 400 520" preserveAspectRatio="${align} slice" aria-hidden="true">
      <defs><linearGradient id="zsky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient></defs>
      <rect width="400" height="520" fill="url(#zsky-${id})"/>
      ${s.night ? [...Array(18)].map((_, i) => `<circle cx="${(i * 67) % 400}" cy="${10 + (i * 41) % 160}" r="1.4" fill="#fff" opacity=".8"/>`).join('') + `<circle cx="320" cy="70" r="28" fill="${c.sun}"/>` : cloud(20, 80, 1) + cloud(300, 120, 0.9)}
      <path d="M0 250 Q120 215 220 240 T400 230 V520 H0Z" fill="${c.hill}"/>
      <path d="M0 270 Q200 245 400 270 V520 H0Z" fill="${c.ground}"/>
      <g transform="translate(0 70)">${rake}</g>
      <g transform="translate(150 290)"><path d="M0 0 Q-10 -60 10 -120 M5 -80 Q-30 -110 -60 -118 M8 -100 Q40 -130 70 -128" stroke="#7a5536" stroke-width="12" fill="none" stroke-linecap="round"/>${leaves}</g>
      <g fill="#a9a6a0" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M300 300 L318 230 L348 236 L356 300Z"/><path d="M60 452 L120 440 L150 470 L80 480Z"/></g>
      <path d="M140 372 Q200 350 262 372 L250 392 Q200 402 150 392Z" fill="#b8b4ad" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g class="breathe-g"><svg x="132" y="236" width="136" height="140" viewBox="0 0 120 124">${padma(mood).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>
    </svg>`;
  }

  window.ART = { SCENES, scene, colors, padma, landscape, zen, mix };
})();
