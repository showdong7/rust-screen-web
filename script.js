(() => {
  'use strict';

  /* ---------- 主題切換：System / Dark / Light ---------- */
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-value]');

  function readTheme() {
    try { return localStorage.getItem('rs-theme') || 'system'; } catch (e) { return 'system'; }
  }
  function applyTheme(value) {
    if (value === 'dark' || value === 'light') root.setAttribute('data-theme', value);
    else root.removeAttribute('data-theme');
    themeButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeValue === value)));
    try { localStorage.setItem('rs-theme', value); } catch (e) { /* 無法儲存時忽略 */ }
  }
  themeButtons.forEach((b) => b.addEventListener('click', () => applyTheme(b.dataset.themeValue)));
  applyTheme(readTheme());

  /* ---------- 分頁（標註展示、MCP 用戶端） ---------- */
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next, true);
      });
    });
  });

  /* ---------- 複製指令 ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = document.getElementById(btn.dataset.copy).textContent;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        ta.remove();
      }
      btn.textContent = ok ? '已複製' : '請手動選取';
      setTimeout(() => { btn.textContent = '複製'; }, 1600);
    });
  });

  /* ---------- 標註示範 ---------- */
  const board = document.getElementById('board');
  if (!board) return;
  const ctx = board.getContext('2d');
  const W = board.width, H = board.height;
  const LINE = 5;

  // 示範用「截圖」底圖（固定淺色，模擬一張真的截圖）
  const scene = document.createElement('canvas');
  scene.width = W; scene.height = H;
  (function drawScene(s) {
    const g = s.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#dbe4ee'); g.addColorStop(1, '#c7d6e3');
    s.fillStyle = g; s.fillRect(0, 0, W, H);

    const rr = (x, y, w, h, r, fill) => { s.beginPath(); s.roundRect(x, y, w, h, r); s.fillStyle = fill; s.fill(); };
    // 視窗
    s.save(); s.shadowColor = 'rgba(20,35,55,.18)'; s.shadowBlur = 24; s.shadowOffsetY = 6;
    rr(40, 36, 880, 528, 12, '#ffffff'); s.restore();
    rr(40, 36, 880, 44, 0, '#f3f6f9');
    s.fillStyle = '#e1e7ee'; s.fillRect(40, 79, 880, 1);
    ['#f2706b', '#f5bf4f', '#5fc964'].forEach((c, i) => { s.beginPath(); s.arc(64 + i * 20, 58, 6, 0, Math.PI * 2); s.fillStyle = c; s.fill(); });
    s.fillStyle = '#546579'; s.font = '15px "Segoe UI", "Microsoft JhengHei", sans-serif';
    s.fillText('季度營收報表 — Dashboard', 140, 63);
    // 側欄
    s.fillStyle = '#f6f8fb'; s.fillRect(40, 80, 170, 484);
    for (let i = 0; i < 6; i++) rr(60, 108 + i * 42, i === 1 ? 120 : 100 - i * 6, 12, 6, i === 1 ? '#f5821f' : '#dfe6ee');
    // 數字卡
    const cards = [['營收', '$4.2M'], ['新客戶', '1,284'], ['留存率', '92%']];
    cards.forEach(([label, val], i) => {
      const x = 236 + i * 222;
      rr(x, 104, 204, 92, 10, '#f3f6f9');
      s.fillStyle = '#7a8a9c'; s.font = '14px "Segoe UI", "Microsoft JhengHei", sans-serif'; s.fillText(label, x + 18, 134);
      s.fillStyle = '#1f3146'; s.font = 'bold 30px "Segoe UI", sans-serif'; s.fillText(val, x + 18, 176);
    });
    // 長條圖
    const bars = [.38, .52, .46, .64, .58, .72, .66, .9];
    s.fillStyle = '#e1e7ee'; s.fillRect(236, 520, 650, 1);
    bars.forEach((v, i) => {
      const bh = v * 270, x = 256 + i * 78;
      rr(x, 520 - bh, 46, bh, 5, i === bars.length - 1 ? '#f5821f' : '#7fcfbe');
    });
    s.fillStyle = '#9aaabe'; s.font = '12px "Segoe UI", sans-serif';
    ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4'].forEach((q, i) => s.fillText(q, 270 + i * 78, 542));
  })(scene.getContext('2d'));

  // 初始示範標註
  let shapes = [
    { type: 'rect', x1: 788, y1: 260, x2: 862, y2: 532, color: '#eb3737', fill: false },
    { type: 'arrow', x1: 640, y1: 236, x2: 776, y2: 292, color: '#eb3737', fill: false },
    { type: 'text', x: 446, y: 232, text: 'Q4 營收創新高', color: '#eb3737', size: 30 },
  ];
  let redo = [];
  let tool = 'rect';
  let color = '#eb3737';
  let filled = false;
  let draft = null;

  function drawArrowHead(c, s) {
    const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
    const len = Math.max(16, LINE * 4.2);
    c.beginPath();
    c.moveTo(s.x2, s.y2);
    c.lineTo(s.x2 - len * Math.cos(ang - Math.PI / 7), s.y2 - len * Math.sin(ang - Math.PI / 7));
    c.lineTo(s.x2 - len * Math.cos(ang + Math.PI / 7), s.y2 - len * Math.sin(ang + Math.PI / 7));
    c.closePath();
    c.fillStyle = s.color; c.fill();
  }

  function drawShape(c, s) {
    c.save();
    c.strokeStyle = s.color; c.fillStyle = s.color;
    c.lineWidth = LINE; c.lineCap = 'round'; c.lineJoin = 'round';
    const x = Math.min(s.x1, s.x2), y = Math.min(s.y1, s.y2);
    const w = Math.abs(s.x2 - s.x1), h = Math.abs(s.y2 - s.y1);
    switch (s.type) {
      case 'line':
        c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); break;
      case 'arrow': {
        const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
        const back = Math.max(16, LINE * 4.2) * .7;
        c.beginPath(); c.moveTo(s.x1, s.y1);
        c.lineTo(s.x2 - back * Math.cos(ang), s.y2 - back * Math.sin(ang)); c.stroke();
        drawArrowHead(c, s); break;
      }
      case 'rect':
        if (s.fill) c.fillRect(x, y, w, h); else c.strokeRect(x, y, w, h); break;
      case 'ellipse':
        c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        if (s.fill) c.fill(); else c.stroke(); break;
      case 'text':
        c.font = `bold ${s.size}px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif`;
        c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.9)'; c.strokeText(s.text, s.x, s.y);
        c.fillText(s.text, s.x, s.y); break;
    }
    c.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(scene, 0, 0);
    shapes.forEach((s) => drawShape(ctx, s));
    if (draft) drawShape(ctx, draft);
    undoBtn.disabled = shapes.length === 0;
    redoBtn.disabled = redo.length === 0;
  }

  function toCanvas(e) {
    const r = board.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }

  function constrain(d, shift) {
    if (!shift) return;
    if (d.type === 'rect' || d.type === 'ellipse') {
      const side = Math.max(Math.abs(d.x2 - d.x1), Math.abs(d.y2 - d.y1));
      d.x2 = d.x1 + Math.sign(d.x2 - d.x1 || 1) * side;
      d.y2 = d.y1 + Math.sign(d.y2 - d.y1 || 1) * side;
    }
  }

  board.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    board.setPointerCapture(e.pointerId);
    const p = toCanvas(e);
    draft = { type: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y, color, fill: filled };
  });
  board.addEventListener('pointermove', (e) => {
    if (!draft) return;
    const p = toCanvas(e);
    draft.x2 = p.x; draft.y2 = p.y;
    constrain(draft, e.shiftKey);
    render();
  });
  const finish = () => {
    if (!draft) return;
    // 與原程式一致：單純點一下不會留下標註
    if (Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1) > 4) {
      shapes.push(draft);
      redo = [];
    }
    draft = null;
    render();
  };
  board.addEventListener('pointerup', finish);
  board.addEventListener('pointercancel', () => { draft = null; render(); });

  // 工具列
  const toolBtns = document.querySelectorAll('[data-tool]');
  toolBtns.forEach((b) => b.addEventListener('click', () => {
    tool = b.dataset.tool;
    toolBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  const swatchBtns = document.querySelectorAll('[data-color]');
  swatchBtns.forEach((b) => b.addEventListener('click', () => {
    color = b.dataset.color;
    swatchBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  const fillToggle = document.getElementById('fillToggle');
  const fillLabel = document.getElementById('fillLabel');
  fillToggle.addEventListener('click', () => {
    filled = !filled;
    fillToggle.setAttribute('aria-pressed', String(filled));
    fillLabel.textContent = filled ? '實心' : '空心';
  });

  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const undo = () => { if (shapes.length) { redo.push(shapes.pop()); render(); } };
  const redoFn = () => { if (redo.length) { shapes.push(redo.pop()); render(); } };
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redoFn);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && draft) { draft = null; render(); return; }
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redoFn(); }
  });

  // 字型載入後再繪製一次，確保中文字正確
  render();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
})();
