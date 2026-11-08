'use strict';

const BASE = 'https://tzion-gvili.github.io/';
const ROTATE_MS = 5000;

// The first project is shown first, tagged as new.
const PROJECTS = [
  { name: 'TreZuzey3', path: 'TreZuzey3/', icon: '🪙', color: '#ffb703', desc: 'מידות, מטבעות וארמית', long: 'כמה טפחים באמה? כמה שווה סלע? מידות ומטבעות לפי השיטות, חידות משעשעות, שיעורים בהלכה ובזמנים – וארמית: מילים, פתגמים ושקלא וטריא.' },
  { name: 'Cybertron3', path: 'Cybertron3/', icon: '🤖', color: '#4cc9f0', desc: 'חשמל, אלקטרוניקה ופיזיקה' },
  { name: 'Formula3', path: 'Formula3/', icon: '⚡', color: '#ff9f1c', desc: 'מעבדת האלקטרוניקה' },
  { name: 'Gandalf3', path: 'Gandalf3/', icon: '🧙', color: '#9b5de5', desc: 'דקדוק ומילים באנגלית' },
  { name: 'HumanCalc', path: 'HumanCalc/', icon: '🧮', color: '#06d6a0', desc: 'מתמטיקה 5 יח"ל – שאלונים 571 ו-572' },
  { name: 'Itot3', path: 'Itot3/', icon: '🏭', color: '#ef476f', desc: 'IT, OT, SCADA ו-PLC – הכל באפליקציה אחת' },
  { name: 'Bipbip3', path: 'Bipbip3/', icon: '🚗', color: '#ffd166', desc: 'תיאוריה וחינוך תעבורתי – 738 שאלות, מבחן מדומה ומשחקי נהיגה' },
  { name: 'Chess Vanila', path: 'chess-vanila/', icon: '♟️', color: '#cfd5ff', desc: 'שחמט קלאסי – לוח מלא, בדיקת מהלכים, ומשחק מול המחשב' },
];

// Used only when adv.json cannot be loaded (for example when the page is opened as a local file).
const FALLBACK_ADS = [
  { caption: 'TgSofts – אפליקציות לימוד', catchPhrase: 'לומדים דרך משחק – בעברית, בחינם, בכל טלפון!', phone: '0525914007' },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '');
const fmtPhone = (p) => {
  const d = String(p).replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3)}` : String(p);
};

function renderProjects() {
  document.getElementById('apps').innerHTML = PROJECTS.map((p, i) => `
    <a class="app" href="${BASE + p.path}" style="--c:${p.color}; animation-delay:${0.1 + i * 0.07}s">
      <div class="a-icon">${p.icon}</div>
      <div class="a-body">
        <h3><span class="ltr">${p.name}</span>${i === 0 ? '<span class="new">⭐ חדש</span>' : ''}</h3>
        <p>${p.desc}</p>
      </div>
      <span class="go">◀</span>
    </a>`).join('');
}

const Ads = {
  list: [],
  i: 0,
  timer: 0,

  async load() {
    try {
      const res = await fetch('adv.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const ads = (Array.isArray(data) ? data : []).filter((a) => a && a.caption);
      if (!ads.length) throw new Error('adv.json has no ads');
      this.list = ads;
    } catch (e) {
      console.warn('adv.json not loaded, using fallback ad:', e.message);
      this.list = FALLBACK_ADS;
    }
    document.getElementById('adDots').innerHTML = this.list.length > 1
      ? this.list.map((_, k) => `<button class="dot" data-k="${k}" aria-label="פרסומת ${k + 1}"></button>`).join('') : '';
    document.getElementById('adDots').onclick = (e) => {
      const b = e.target.closest('.dot');
      if (b) this.show(+b.dataset.k);
    };
    this.show(0);
  },

  show(k) {
    this.i = (k + this.list.length) % this.list.length;
    const a = this.list[this.i];
    const card = document.getElementById('adCard');
    card.classList.remove('in');
    void card.offsetWidth;
    card.innerHTML = `
      <div class="ad-caption">${esc(a.caption)}</div>
      <div class="ad-phrase">${esc(a.catchPhrase)}</div>
      ${a.phone ? `<a class="ad-phone" href="${telHref(a.phone)}">📞 <span class="ltr">${esc(fmtPhone(a.phone))}</span></a>` : ''}`;
    card.classList.add('in');
    document.querySelectorAll('.dot').forEach((d, n) => d.classList.toggle('on', n === this.i));

    const bar = document.getElementById('adBar');
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    if (this.list.length > 1) {
      bar.style.transition = `width ${ROTATE_MS}ms linear`;
      bar.style.width = '100%';
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.show(this.i + 1), ROTATE_MS);
    }
  },
};

// Soft "pop" on every tap, made live with Web Audio (no sound files).
const Click = {
  ctx: null,
  play(kind) {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = this.ctx.currentTime;
      const notes = kind === 'app' ? [[880, 0], [1320, 0.06]] : [[1040, 0]];
      for (const [f, d] of notes) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t + d);
        o.frequency.exponentialRampToValueAtTime(f * 0.6, t + d + 0.12);
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(0.18, t + d + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
        o.connect(g).connect(this.ctx.destination);
        o.start(t + d);
        o.stop(t + d + 0.18);
      }
    } catch (e) { /* no audio, no problem */ }
  },
};

// pointerdown fires before the link navigates away, so the sound is heard
document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('a, button');
  if (el) Click.play(el.classList.contains('app') ? 'app' : 'tap');
});

renderProjects();
Ads.load();
