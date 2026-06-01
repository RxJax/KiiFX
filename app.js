/* ═══════════════════════════════════════════════
   KIICHAIN FINANCIAL INFRASTRUCTURE DASHBOARD
   app.js — Interactive Logic & Live Simulations
═══════════════════════════════════════════════ */

'use strict';

// ─── UTILS ─────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const fmt = (n, dec = 2) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtCurrency = (n, symbol = '') => symbol + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const updateTickers = (className, text) => {
  const elements = document.getElementsByClassName(className);
  for (let i = 0; i < elements.length; i++) {
    elements[i].textContent = text;
  }
};

// ─── FX RATES (USD → target) ──────────────────────────────
const FX = {
  MXN: { rate: 17.45, symbol: 'MX$', name: 'Mexican Peso',     trad_spread: 0.034, kii_spread: 0.0008 },
  BRL: { rate: 5.02,  symbol: 'R$',  name: 'Brazilian Real',    trad_spread: 0.031, kii_spread: 0.0007 },
  ARS: { rate: 985,   symbol: 'AR$', name: 'Argentine Peso',    trad_spread: 0.045, kii_spread: 0.0012 },
  COP: { rate: 3920,  symbol: 'CO$', name: 'Colombian Peso',    trad_spread: 0.038, kii_spread: 0.0009 },
  PEN: { rate: 3.73,  symbol: 'S/',  name: 'Peruvian Sol',      trad_spread: 0.028, kii_spread: 0.0006 },
  GBP: { rate: 0.78,  symbol: '£',   name: 'British Pound',     trad_spread: 0.022, kii_spread: 0.0005 },
  JPY: { rate: 156.40,symbol: '¥',   name: 'Japanese Yen',      trad_spread: 0.025, kii_spread: 0.0006 },
  SGD: { rate: 1.35,  symbol: 'S$',  name: 'Singapore Dollar',  trad_spread: 0.024, kii_spread: 0.0005 },
  INR: { rate: 83.50, symbol: '₹',   name: 'Indian Rupee',      trad_spread: 0.032, kii_spread: 0.0007 },
  AUD: { rate: 1.50,  symbol: 'A$',  name: 'Australian Dollar', trad_spread: 0.026, kii_spread: 0.0006 },
  ZAR: { rate: 18.60, symbol: 'R',   name: 'South African Rand',trad_spread: 0.036, kii_spread: 0.0008 },
  CAD: { rate: 1.37,  symbol: 'C$',  name: 'Canadian Dollar',   trad_spread: 0.021, kii_spread: 0.0004 },
  EUR: { rate: 0.92,  symbol: '€',   name: 'Euro',              trad_spread: 0.020, kii_spread: 0.0004 },
  NGN: { rate: 1450,  symbol: '₦',   name: 'Nigerian Naira',    trad_spread: 0.055, kii_spread: 0.0015 },
  PHP: { rate: 58.50, symbol: '₱',   name: 'Philippine Peso',   trad_spread: 0.033, kii_spread: 0.0008 },
  VND: { rate: 25400, symbol: '₫',   name: 'Vietnamese Dong',   trad_spread: 0.035, kii_spread: 0.0009 },
  CLP: { rate: 920,   symbol: 'CL$', name: 'Chilean Peso',      trad_spread: 0.038, kii_spread: 0.0010 },
  KES: { rate: 130,   symbol: 'KSh', name: 'Kenyan Shilling',   trad_spread: 0.042, kii_spread: 0.0011 },
};

// ─── COUNTRY → CURRENCY MAP ───────────────────────────────
const COUNTRY_CURRENCY = { 
  MX:'MXN', BR:'BRL', AR:'ARS', CO:'COP', PE:'PEN', 
  GB:'GBP', JP:'JPY', SG:'SGD', IN:'INR', AU:'AUD', ZA:'ZAR',
  CA:'CAD', EU:'EUR', NG:'NGN', PH:'PHP', VN:'VND', CL:'CLP', KE:'KES' 
};

// ─── NAV SCROLL ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ─── CLOCK ────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const utcStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const el = $('panel-timestamp');
  if (el) el.textContent = utcStr;
  const fc = $('footer-clock');
  if (fc) fc.textContent = now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC';
}
setInterval(updateClock, 1000);
updateClock();

// ─── HERO LIVE VALUES ─────────────────────────────────────
function animateHeroValues() {
  const settleEl = $('hero-settle-time');
  const settlePanelEl = $('settle-val');
  const fxEl = $('hero-fx-eff');

  let st = 2.1 + rand(-0.1, 0.4);
  let fx = 0.06 + rand(0, 0.04);

  if (settleEl) settleEl.textContent = st.toFixed(1) + 's';
  if (settlePanelEl) settlePanelEl.textContent = st.toFixed(1) + 's';
  if (fxEl) fxEl.textContent = fx.toFixed(2) + '%';

  // Settle bar
  const bar = $('settle-bar');
  if (bar) bar.style.width = Math.min(98, 88 + rand(0, 10)) + '%';

  updateTickers('tick-settle', st.toFixed(1) + 's');
}
setInterval(animateHeroValues, 3200);

// Duplicate ticker content for seamless loop
const tickerInner = $('ticker-inner');
if (tickerInner) {
  tickerInner.innerHTML += tickerInner.innerHTML;
}

// ─── LIQUIDITY COUNTER ────────────────────────────────────
let liqBase = 847.2;
function updateLiquidity() {
  liqBase += rand(-2, 4);
  liqBase = Math.max(820, Math.min(900, liqBase));
  const el = $('liquidity-val');
  if (el) el.textContent = '$' + liqBase.toFixed(1) + 'M';
  const delta = $('liquidity-delta');
  const change = rand(-0.5, 1.2);
  if (delta) {
    delta.textContent = (change >= 0 ? '▲ ' : '▼ ') + Math.abs(change).toFixed(1) + '%';
    delta.style.color = change >= 0 ? 'var(--green)' : 'var(--red)';
  }
  updateTickers('tick-liq', '$' + liqBase.toFixed(1) + 'M');
}
setInterval(updateLiquidity, 2800);

// ─── NETWORK NODES ────────────────────────────────────────
function buildNetworkNodes() {
  const container = $('network-nodes');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const dot = document.createElement('div');
    dot.className = 'network-node-dot';
    dot.style.animationDelay = (i * 0.13) + 's';
    if (Math.random() < 0.05) dot.style.background = 'var(--amber)';
    container.appendChild(dot);
  }
}
buildNetworkNodes();

// ─── CHARTS DATA & INITIALIZATION ─────────────────────────
const tpsData = Array.from({ length: 45 }, () => randInt(720, 920));
let lastTpsUpdate = performance.now();

// ─── TPS CHART ────────────────────────────────────────────
function drawTPSChart(now) {
  const canvas = $('tps-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 60;
  ctx.clearRect(0, 0, W, H);

  // Update data occasionally (every 1.2 seconds)
  if (now - lastTpsUpdate > 1200) {
    tpsData.shift();
    const lastVal = tpsData[tpsData.length - 1];
    const change = randInt(-45, 55);
    const newVal = Math.max(650, Math.min(1050, lastVal + change));
    tpsData.push(newVal);
    lastTpsUpdate = now;
    
    // Update live indicators
    const el = $('tps-live');
    if (el) el.textContent = newVal + ' TPS';
    
    updateTickers('tick-tps', newVal);
  }

  const min = Math.min(...tpsData) - 30;
  const max = Math.max(...tpsData) + 30;
  const step = W / (tpsData.length - 2);

  // Scroll interpolation factor (0 to step)
  const elapsedSinceUpdate = now - lastTpsUpdate;
  const scrollOffset = step * Math.min(1, elapsedSinceUpdate / 1200);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(59,130,246,0.35)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');

  ctx.beginPath();
  tpsData.forEach((v, i) => {
    const x = i * step - scrollOffset;
    const y = H - ((v - min) / (max - min)) * (H - 6);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = 'rgba(96,165,250,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fill area
  ctx.lineTo((tpsData.length - 1) * step - scrollOffset, H); 
  ctx.lineTo(0, H); 
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw current value indicator dot at the end
  const lx = (tpsData.length - 1) * step - scrollOffset;
  const lv = tpsData[tpsData.length - 1];
  const ly = H - ((lv - min) / (max - min)) * (H - 6);
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.shadowColor = '#60a5fa';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0; // reset shadow
}

// ─── HYPE CHART (Volatile Speculation) ─────────────────────
function drawHypeChart(t) {
  const canvas = $('hype-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 120;
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(239,68,68,0.25)');
  grad.addColorStop(1, 'rgba(239,68,68,0)');

  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.5 
      + Math.sin(x * 0.05 - t * 8) * 15 
      + Math.cos(x * 0.12 + t * 14) * 12 
      + Math.sin(x * 0.02 + t * 4) * 18
      + Math.sin(t * 5 + x * 0.08) * 6;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(239,68,68,0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

// ─── INFRA CHART (Steady Growth) ──────────────────────────
function drawInfraChart(t) {
  const canvas = $('infra-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = 120;
  ctx.clearRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(59,130,246,0.3)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');

  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const progress = x / W;
    const baseVal = H * 0.85 - progress * (H * 0.65);
    const wave = Math.sin(x * 0.03 - t * 3) * 3 
      + Math.cos(x * 0.07 + t * 2) * 2;
    const y = baseVal + wave;
    
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(96,165,250,0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

// Resize event is handled natively by reading offsetWidth on each animation frame.
window.addEventListener('resize', () => {});

// Start animation loop
function startChartsAnimation() {
  function tick(timestamp) {
    const t = timestamp / 1000;
    drawHypeChart(t);
    drawInfraChart(t);
    drawTPSChart(timestamp);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
setTimeout(startChartsAnimation, 300);

// Helper for transaction console log outputs
function writeLog(consoleId, timestamp, text, type) {
  const consoleEl = $(consoleId);
  if (!consoleEl) return;
  const line = document.createElement('div');
  line.className = 'console-line';
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'console-time';
  timeSpan.textContent = `[${timestamp}]`;
  
  const textSpan = document.createElement('span');
  textSpan.className = 'console-text ' + (type || '');
  textSpan.textContent = text;
  
  line.appendChild(timeSpan);
  line.appendChild(textSpan);
  consoleEl.appendChild(line);
  
  // Auto-scroll to bottom
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Helper for count-up animation
function animateValue(obj, start, end, duration, prefix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const ease = progress * (2 - progress); // easeOutQuad
    const val = start + ease * (end - start);
    obj.innerHTML = prefix + ' ' + Math.floor(val).toLocaleString('en-US');
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ─── COMPARISON SIMULATOR ─────────────────────────────────
let kiiSimInterval = null;
let tradSimInterval = null;

function resetSimulatorState() {
  // Clear existing simulation state
  if (kiiSimInterval) clearInterval(kiiSimInterval);
  if (tradSimInterval) clearInterval(tradSimInterval);

  // Restore dormant overlay
  const overlay = $('simulator-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }

  // Reset consoles
  const kiiConsole = $('kii-console');
  const tradConsole = $('trad-console');
  if (kiiConsole) {
    kiiConsole.innerHTML = '<div class="console-line"><span class="console-time">[0.00s]</span><span class="console-text">Ready. Adjust parameters to simulate transfer.</span></div>';
  }
  if (tradConsole) {
    tradConsole.innerHTML = '<div class="console-line"><span class="console-time">[Day 0]</span><span class="console-text">Ready. Adjust parameters to simulate transfer.</span></div>';
  }

  // Reset timers
  const kiiTimer = $('kii-sim-timer');
  const tradTimer = $('trad-sim-timer');
  if (kiiTimer) kiiTimer.textContent = '0.00s';
  if (tradTimer) tradTimer.textContent = 'Day 1 (0h)';

  // Hide success tick
  const tick = $('kii-tick');
  if (tick) tick.classList.remove('visible');

  // Reset received amount containers
  const kiiAmtEl = $('kii-amount');
  const tradAmtEl = $('trad-amount');
  if (kiiAmtEl) {
    kiiAmtEl.textContent = '—';
    kiiAmtEl.parentElement.classList.remove('success-glow');
  }
  if (tradAmtEl) {
    tradAmtEl.textContent = '—';
    tradAmtEl.parentElement.classList.remove('warning-glow');
  }

  // Reset savings
  $('save-fees').textContent = '$—';
  $('save-more').textContent = '—';
  $('save-fx').textContent = '—';
  $('save-time').textContent = '—';

  // Reset visual flow nodes and lines
  const allNodes = $$('.flow-node');
  const allLines = $$('.flow-line');
  allNodes.forEach(node => {
    node.classList.remove('active', 'settled', 'warning-state');
  });
  allLines.forEach(line => {
    line.classList.remove('active', 'settled');
  });

  // Set first node of each to active
  const kiiNode1 = $('kii-node-1');
  if (kiiNode1) kiiNode1.classList.add('active');
  const tradNode1 = $('trad-node-1');
  if (tradNode1) tradNode1.classList.add('active');
}

function runSimulation() {
  const amount = parseFloat($('send-amount').value) || 10000;
  const currency = $('send-currency').value;
  const fx = FX[currency];
  if (!fx) return;

  // Clear existing simulation state
  if (kiiSimInterval) clearInterval(kiiSimInterval);
  if (tradSimInterval) clearInterval(tradSimInterval);

  // Clear consoles
  const kiiConsole = $('kii-console');
  const tradConsole = $('trad-console');
  if (kiiConsole) kiiConsole.innerHTML = '';
  if (tradConsole) tradConsole.innerHTML = '';

  // Reset timers
  const kiiTimer = $('kii-sim-timer');
  const tradTimer = $('trad-sim-timer');
  if (kiiTimer) kiiTimer.textContent = '0.00s';
  if (tradTimer) tradTimer.textContent = 'Day 1 (0h)';

  // Hide success checkmark
  const tick = $('kii-tick');
  if (tick) tick.classList.remove('visible');

  // Set received values to processing states
  const kiiAmtEl = $('kii-amount');
  const tradAmtEl = $('trad-amount');
  if (kiiAmtEl) {
    kiiAmtEl.innerHTML = '<span class="loading-dots">Settling payment...</span>';
    kiiAmtEl.parentElement.classList.remove('success-glow');
  }
  if (tradAmtEl) {
    tradAmtEl.innerHTML = '<span class="loading-dots-trad">Awaiting clearing...</span>';
    tradAmtEl.parentElement.classList.remove('warning-glow');
  }

  // Pre-calculate final values
  const tradFeeFixed = rand(45, 120);
  const tradSpread = fx.trad_spread;
  const tradNetAmount = (amount - tradFeeFixed) * fx.rate * (1 - tradSpread);

  const kiiFeeFixed = rand(0.5, 2);
  const kiiSpread = fx.kii_spread;
  const kiiNetAmount = (amount - kiiFeeFixed) * fx.rate * (1 - kiiSpread);

  // Update simulator summary specs (static specs inside panel)
  $('trad-fees-val').textContent = '$' + fmt(tradFeeFixed, 0) + '–$' + fmt(tradFeeFixed * 1.2, 0);
  $('kii-fee-val').textContent = '$' + kiiFeeFixed.toFixed(2);

  // Savings summary stats
  const feeSaving = tradFeeFixed - kiiFeeFixed;
  const moreMoney = kiiNetAmount - tradNetAmount;
  const fxSaving = ((fx.trad_spread - fx.kii_spread) * 100).toFixed(2);

  // Reset savings display
  $('save-fees').textContent = '$—';
  $('save-more').textContent = '—';
  $('save-fx').textContent = '—';
  $('save-time').textContent = '—';

  // Reset visual flow nodes and lines
  const allNodes = $$('.flow-node');
  const allLines = $$('.flow-line');
  allNodes.forEach(node => {
    node.classList.remove('active', 'settled', 'warning-state');
  });
  allLines.forEach(line => {
    line.classList.remove('active', 'settled');
  });

  // Get visual nodes
  const kiiNode1 = $('kii-node-1');
  const kiiNode2 = $('kii-node-2');
  const kiiNode3 = $('kii-node-3');
  const kiiLine1 = $('kii-line-1');
  const kiiLine2 = $('kii-line-2');

  const tradNode1 = $('trad-node-1');
  const tradNode2 = $('trad-node-2');
  const tradNode3 = $('trad-node-3');
  const tradNode4 = $('trad-node-4');
  const tradLine1 = $('trad-line-1');
  const tradLine2 = $('trad-line-2');
  const tradLine3 = $('trad-line-3');

  if (kiiNode1) kiiNode1.classList.add('active');
  if (tradNode1) tradNode1.classList.add('active');

  // --- KIICHAIN SIMULATION RUNNER ---
  const kiiStart = performance.now();
  const kiiSteps = [
    { time: 0.1, text: `⬡ Broadcasting transaction to KiiChain network (size: 245 bytes)...`, type: "info" },
    { time: 0.6, text: `🛡 AML/KYC checks completed on-chain via decentralized compliance oracle.`, type: "success" },
    { time: 1.2, text: `💱 FX routed: executing atomic liquidity swap (USD → ${currency}) at ${fx.rate}...`, type: "info" },
    { time: 1.8, text: `⚡ Consensus validation: block generation initiated by network validators...`, type: "info" },
    { time: 2.3, text: `✅ Settlement complete. Block #827,109 finalized. Cryptographic finality achieved.`, type: "success" }
  ];
  let kiiStepIdx = 0;

  kiiSimInterval = setInterval(() => {
    const elapsed = (performance.now() - kiiStart) / 1000;
    const currentSec = Math.min(2.3, elapsed);
    
    if (kiiTimer) kiiTimer.textContent = currentSec.toFixed(2) + 's';

    // Print pending steps and animate visual nodes
    while (kiiStepIdx < kiiSteps.length && kiiSteps[kiiStepIdx].time <= currentSec) {
      const step = kiiSteps[kiiStepIdx];
      const stamp = currentSec.toFixed(2) + 's';
      writeLog('kii-console', stamp, step.text, step.type);
      
      // Visual toggles
      if (kiiStepIdx === 0) {
        if (kiiLine1) kiiLine1.classList.add('active');
      } else if (kiiStepIdx === 1) {
        if (kiiNode2) kiiNode2.classList.add('active');
        if (kiiNode1) kiiNode1.classList.add('settled');
        if (kiiLine1) { kiiLine1.classList.remove('active'); kiiLine1.classList.add('settled'); }
      } else if (kiiStepIdx === 2) {
        if (kiiLine2) kiiLine2.classList.add('active');
      } else if (kiiStepIdx === 3) {
        if (kiiNode2) kiiNode2.classList.add('settled');
      }
      
      kiiStepIdx++;
    }

    if (elapsed >= 2.3) {
      clearInterval(kiiSimInterval);
      if (kiiTimer) kiiTimer.textContent = '2.30s';
      
      // Visual settled state
      if (kiiNode3) kiiNode3.classList.add('settled');
      if (kiiLine2) { kiiLine2.classList.remove('active'); kiiLine2.classList.add('settled'); }

      // Flash amount and count up
      if (kiiAmtEl) {
        animateValue(kiiAmtEl, 0, kiiNetAmount, 800, fx.symbol);
        kiiAmtEl.parentElement.classList.add('success-glow');
      }

      // Show checkmark
      if (tick) tick.classList.add('visible');

      // Update savings partially
      $('save-fees').textContent = '$' + fmt(feeSaving, 0);
      $('save-fx').textContent = '~' + fxSaving + '%';
    }
  }, 50);

  // --- TRADITIONAL FINANCE SIMULATION RUNNER ---
  const tradStart = performance.now();
  const tradSteps = [
    { elapsed: 0.5, timeStr: "Day 1, 09:15 AM", text: "🏛 SWIFT transfer initiated at sender's local commercial bank.", type: "info" },
    { elapsed: 1.8, timeStr: "Day 1, 04:30 PM", text: "🔄 Batch transaction queued and transmitted to correspondent bank (MT103).", type: "info" },
    { elapsed: 3.2, timeStr: "Day 2, 10:00 AM", text: "⏳ Intermediary delay: Timezone differences & bank cut-off hours encountered.", type: "warning" },
    { elapsed: 4.8, timeStr: "Day 3, 11:30 AM", text: "⚠️ Compliance delay: Manual sanction review flagged at foreign clearing desk.", type: "warning" },
    { elapsed: 6.2, timeStr: "Day 4, 02:15 PM", text: "🏦 Nostro/Vostro accounts matched. Clearing fees and FX spreads deducted.", type: "info" },
    { elapsed: 7.5, timeStr: "Day 5, 03:45 PM", text: "📧 Clear: Funds credited to recipient ledger. Intermediary chain complete.", type: "success" }
  ];
  let tradStepIdx = 0;

  tradSimInterval = setInterval(() => {
    const elapsed = (performance.now() - tradStart) / 1000;
    const currentSec = Math.min(7.5, elapsed);
    
    // Map 0-7.5s to 0-120 hours (5 days)
    const simulatedHours = (currentSec / 7.5) * 120;
    const simulatedDays = Math.min(5, Math.floor(simulatedHours / 24) + 1);
    
    if (tradTimer) {
      tradTimer.textContent = `Day ${simulatedDays} (${Math.floor(simulatedHours)}h)`;
    }

    // Print pending steps and animate visual nodes
    while (tradStepIdx < tradSteps.length && tradSteps[tradStepIdx].elapsed <= currentSec) {
      const step = tradSteps[tradStepIdx];
      writeLog('trad-console', step.timeStr, step.text, step.type);
      
      // Visual toggles
      if (tradStepIdx === 0) {
        if (tradLine1) tradLine1.classList.add('active');
      } else if (tradStepIdx === 1) {
        if (tradNode2) tradNode2.classList.add('active');
        if (tradNode1) tradNode1.classList.add('settled');
        if (tradLine1) { tradLine1.classList.remove('active'); tradLine1.classList.add('settled'); }
      } else if (tradStepIdx === 2) {
        if (tradLine2) tradLine2.classList.add('active');
      } else if (tradStepIdx === 3) {
        if (tradNode3) {
          tradNode3.classList.add('active', 'warning-state');
        }
        if (tradNode2) tradNode2.classList.add('settled');
        if (tradLine2) { tradLine2.classList.remove('active'); tradLine2.classList.add('settled'); }
      } else if (tradStepIdx === 4) {
        if (tradNode3) tradNode3.classList.remove('warning-state');
        if (tradNode3) tradNode3.classList.add('settled');
        if (tradLine3) tradLine3.classList.add('active');
      }
      
      tradStepIdx++;
    }

    if (elapsed >= 7.5) {
      clearInterval(tradSimInterval);
      if (tradTimer) tradTimer.textContent = 'Day 5 (120h)';
      
      // Visual settled state
      if (tradNode4) tradNode4.classList.add('settled');
      if (tradLine3) { tradLine3.classList.remove('active'); tradLine3.classList.add('settled'); }

      // Update amount
      if (tradAmtEl) {
        animateValue(tradAmtEl, 0, tradNetAmount, 800, fx.symbol);
        tradAmtEl.parentElement.classList.add('warning-glow');
      }

      // Complete savings summary
      $('save-time').textContent = '4.99 Days';
      $('save-more').textContent = fx.symbol + ' ' + fmtCurrency(moreMoney);
    }
  }, 50);
}

// Function to handle input changes and trigger simulation automatically
function handleInputChange() {
  const overlay = $('simulator-overlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('hidden');
  }
  runSimulation();
}

// Auto-sync country → currency
const countryEl = $('send-country');
const currencyEl = $('send-currency');
if (countryEl && currencyEl) {
  countryEl.addEventListener('change', () => {
    const cur = COUNTRY_CURRENCY[countryEl.value];
    if (cur) currencyEl.value = cur;
    handleInputChange();
  });
  currencyEl.addEventListener('change', handleInputChange);
  
  const amountEl = $('send-amount');
  if (amountEl) {
    amountEl.addEventListener('input', debounce(handleInputChange, 400));
  }
  
  const simBtn = $('simulate-btn');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      const overlay = $('simulator-overlay');
      if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
      }
      runSimulation();
    });
  }
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// Run initial reset instead of simulation on page load
setTimeout(resetSimulatorState, 100);

// ─── SCOREBOARD INTERSECTION OBSERVER ─────────────────────
const scoreObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.score-bar-fill').forEach(bar => {
        const target = bar.getAttribute('data-width') || '0';
        bar.style.width = target + '%';
      });
      scoreObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

$$('.score-card').forEach(card => scoreObserver.observe(card));

// ─── COMMERCE CARDS ───────────────────────────────────────
const commerceDetail = $('commerce-detail');
const detailClose = $('detail-close');

$$('.commerce-card').forEach(card => {
  card.addEventListener('click', () => openCommerceDetail(card));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openCommerceDetail(card); });
});

function openCommerceDetail(card) {
  const problem = card.getAttribute('data-problem');
  const solution = card.getAttribute('data-solution');
  const split = commerceDetail.querySelector('.detail-split');
  
  if (commerceDetail.style.display === 'block') {
    // Cross-fade text transition if already open
    if (split) {
      split.style.opacity = '0';
      split.style.transform = 'translateY(8px)';
    }
    setTimeout(() => {
      $('detail-problem-text').textContent = problem;
      $('detail-solution-text').textContent = solution;
      if (split) {
        split.style.opacity = '1';
        split.style.transform = 'translateY(0)';
      }
    }, 180);
  } else {
    // Opening for the first time
    $('detail-problem-text').textContent = problem;
    $('detail-solution-text').textContent = solution;
    commerceDetail.style.display = 'block';
    if (split) {
      split.style.opacity = '0';
      split.style.transform = 'translateY(12px)';
      split.offsetHeight; // Force reflow
      split.style.opacity = '1';
      split.style.transform = 'translateY(0)';
    }
  }
  
  setTimeout(() => {
    commerceDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
  
  $$('.commerce-card').forEach(c => c.setAttribute('aria-expanded', 'false'));
  card.setAttribute('aria-expanded', 'true');
}

function closeCommerceDetail() {
  const split = commerceDetail.querySelector('.detail-split');
  if (split) {
    split.style.opacity = '0';
    split.style.transform = 'translateY(10px)';
  }
  setTimeout(() => {
    commerceDetail.style.display = 'none';
    $$('.commerce-card').forEach(c => c.setAttribute('aria-expanded', 'false'));
  }, 220);
}

if (detailClose) {
  detailClose.addEventListener('click', closeCommerceDetail);
  detailClose.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') closeCommerceDetail();
  });
}

// ─── LIVE MAP — TRANSACTION FEED ──────────────────────────
const ROUTES = [
  { from: 'MX', to: 'BR', label: 'MX→BR', currencies: 'MXN/BRL' },
  { from: 'BR', to: 'US', label: 'BR→US', currencies: 'BRL/USD' },
  { from: 'AR', to: 'MX', label: 'AR→MX', currencies: 'ARS/MXN' },
  { from: 'CO', to: 'US', label: 'CO→US', currencies: 'COP/USD' },
  { from: 'MX', to: 'CO', label: 'MX→CO', currencies: 'MXN/COP' },
  { from: 'PE', to: 'US', label: 'PE→US', currencies: 'PEN/USD' },
  { from: 'MX', to: 'PE', label: 'MX→PE', currencies: 'MXN/PEN' },
  { from: 'US', to: 'GB', label: 'US→GB', currencies: 'USD/GBP' },
  { from: 'GB', to: 'JP', label: 'GB→JP', currencies: 'GBP/JPY' },
  { from: 'JP', to: 'SG', label: 'JP→SG', currencies: 'JPY/SGD' },
  { from: 'SG', to: 'IN', label: 'SG→IN', currencies: 'SGD/INR' },
  { from: 'IN', to: 'GB', label: 'IN→GB', currencies: 'INR/GBP' },
  { from: 'SG', to: 'AU', label: 'SG→AU', currencies: 'SGD/AUD' },
  { from: 'ZA', to: 'GB', label: 'ZA→GB', currencies: 'ZAR/GBP' },
  { from: 'JP', to: 'US', label: 'JP→US', currencies: 'JPY/USD' },
  { from: 'US', to: 'CA', label: 'US→CA', currencies: 'USD/CAD' },
  { from: 'US', to: 'EU', label: 'US→EU', currencies: 'USD/EUR' },
  { from: 'GB', to: 'EU', label: 'GB→EU', currencies: 'GBP/EUR' },
  { from: 'EU', to: 'NG', label: 'EU→NG', currencies: 'EUR/NGN' },
  { from: 'NG', to: 'ZA', label: 'NG→ZA', currencies: 'NGN/ZAR' },
  { from: 'SG', to: 'PH', label: 'SG→PH', currencies: 'SGD/PHP' },
  { from: 'SG', to: 'VN', label: 'SG→VN', currencies: 'SGD/VND' },
  { from: 'PE', to: 'CL', label: 'PE→CL', currencies: 'PEN/CLP' },
  { from: 'ZA', to: 'KE', label: 'ZA→KE', currencies: 'ZAR/KES' },
];

let transfersToday = 14827;
let volumeToday = 924.1;

function addTxFeedItem() {
  const feedList = $('tx-feed-list');
  if (!feedList) return;

  const route = ROUTES[randInt(0, ROUTES.length)];
  const amount = randInt(1200, 85000);

  transfersToday += randInt(1, 4);
  volumeToday += amount / 1e6;

  const item = document.createElement('div');
  item.className = 'tx-item';
  item.innerHTML = `
    <span>${route.label} <span style="color:var(--text-muted);font-size:9px">${route.currencies}</span></span>
    <span class="tx-amount">$${fmtCurrency(amount)}</span>
    <span class="tx-settled">✓</span>
  `;

  feedList.insertBefore(item, feedList.firstChild);
  if (feedList.children.length > 5) feedList.removeChild(feedList.lastChild);

  // Update map metrics
  const mt = $('map-transfers-val');
  if (mt) mt.textContent = transfersToday.toLocaleString();
  const mv = $('map-volume-val');
  if (mv) mv.textContent = '$' + volumeToday.toFixed(1) + 'M';

  // Update final section
  const ft = $('final-txs');
  if (ft) ft.textContent = transfersToday.toLocaleString();

  updateTickers('tick-tx', transfersToday.toLocaleString());
}

setInterval(addTxFeedItem, 1400);
setTimeout(addTxFeedItem, 300);

// ─── FX ROUTE ANIMATION ───────────────────────────────────
function animateFXRoutes() {
  const routes = $$('.fx-route');
  routes.forEach(route => {
    const bar = route.querySelector('.route-bar');
    if (bar) {
      const newWidth = randInt(65, 98);
      bar.style.width = newWidth + '%';
    }
  });
}
setInterval(animateFXRoutes, 2000);

// ─── FINALITY SPARKLINE ───────────────────────────────────
function drawFinalitySparkline() {
  const container = $('finality-spark');
  if (!container) return;

  const W = container.offsetWidth || 100;
  const H = 28;
  const pts = Array.from({ length: 20 }, () => rand(4, H - 4));

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  const step = W / (pts.length - 1);
  const pathD = pts.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y}`).join(' ');
  svg += `<path d="${pathD}" fill="none" stroke="rgba(16,185,129,0.6)" stroke-width="1.5"/>`;
  svg += `</svg>`;
  container.innerHTML = svg;
}
setTimeout(drawFinalitySparkline, 400);
setInterval(drawFinalitySparkline, 4000);

// ─── GENERAL INTERSECTION FADE-IN ─────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Apply initial styles and observe
const fadeTargets = [
  ...$$('.score-card'),
  ...$$('.commerce-card'),
  ...$$('.infra-card'),
  ...$$('.hype-item'),
  ...$$('.infra-item'),
];
fadeTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s`;
  fadeObserver.observe(el);
});

// ─── SETTLEMENT VALUE COUNTER ─────────────────────────────
function animateKiiSettleTime() {
  const el = $('kii-settle-val');
  if (!el) return;
  const val = (2.0 + rand(0, 0.8)).toFixed(1);
  el.textContent = '~' + val + ' seconds';
}
setInterval(animateKiiSettleTime, 4000);

// ─── NAV ACTIVE LINK ─────────────────────────────────────
const sections = ['hero', 'comparison', 'scoreboard', 'commerce', 'hype', 'map', 'infrastructure', 'final'];
const navLinks = $$('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + id ? 'var(--text-primary)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// ─── TRAD STATUS ANIMATION INITIAL ───────────────────────
animateTradStatus();

// ─── NETWORK VALUE FLIP ───────────────────────────────────
function flipNetworkVal() {
  const el = $('network-val');
  if (!el) return;
  const statuses = ['Healthy', 'Optimal', '99.97%', 'Active'];
  const colors = ['var(--green)', 'var(--teal)', 'var(--blue-bright)', 'var(--green)'];
  const idx = randInt(0, statuses.length);
  el.textContent = statuses[idx];
  el.style.color = colors[idx];
}
setInterval(flipNetworkVal, 5000);

// ─── LIVE MAP CLICK INTERACTION ───────────────────────────
$$('.map-node').forEach(node => {
  node.addEventListener('click', () => {
    const id = node.getAttribute('id');
    if (!id || id === 'node-us') return; // US is the sender
    const countryCode = id.replace('node-', '').toUpperCase();
    
    const countrySelect = $('send-country');
    if (countrySelect && COUNTRY_CURRENCY[countryCode]) {
      // Highlight map node
      node.classList.add('node-active');
      setTimeout(() => node.classList.remove('node-active'), 1500);

      // Select in simulator dropdown and trigger simulator update
      countrySelect.value = countryCode;
      countrySelect.dispatchEvent(new Event('change'));

      // Smooth scroll to comparison simulator
      const compSection = $('comparison');
      if (compSection) {
        compSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ─── CONSOLE EASTER EGG ───────────────────────────────────
console.log('%c⬡ KiiChain Financial Infrastructure', 'color:#60a5fa;font-size:18px;font-weight:700;');
console.log('%cSettlement Rails · FX Markets · Payment Finality · 24/7 Operations', 'color:#94a3b8;font-size:12px;');
console.log('%cNot a token. Infrastructure.', 'color:#10b981;font-size:13px;font-weight:600;');
