// ── Config ──
const INITIAL_MINUTES = 18;
const INITIAL_SECONDS = 0;
const WARNING_SECONDS = 5 * 60;  // 5 min — turns orange
const DANGER_SECONDS = 1 * 60;  // 1 min — turns red + pulses

// ── DOM ──
const timerDisplay = document.getElementById('timerDisplay');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const timerArea = document.getElementById('timerArea');
const controls = document.getElementById('controls');
const resumeBtn = document.getElementById('resumeBtn');
const reloadBtn = document.getElementById('reloadBtn');
const tapHint = document.getElementById('tapHint');
const colorBtn = document.getElementById('colorBtn');
const colorOptions = document.getElementById('colorOptions');
const colorWrapper = document.getElementById('colorPickerWrapper');
const logoImg = document.getElementById('logoImg');

const DARK_BGS = ['#000000', '#1a1a2e', '#0f0f23', '#1b1f3b', '#0d1117', '#282c34'];

// ── State ──
let totalSeconds = INITIAL_MINUTES * 60 + INITIAL_SECONDS;
let running = false;
let intervalId = null;

// ── Helpers ──
function pad(n) {
  return String(n).padStart(2, '0');
}

function render() {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  minutesEl.textContent = pad(m);
  secondsEl.textContent = pad(s);

  // Warning / danger colors
  timerDisplay.classList.toggle('warning', totalSeconds <= WARNING_SECONDS && totalSeconds > DANGER_SECONDS);
  timerDisplay.classList.toggle('danger', totalSeconds <= DANGER_SECONDS && totalSeconds > 0);
}

function tick() {
  if (totalSeconds <= 0) {
    stop();
    return;
  }
  totalSeconds--;
  render();
}

function start() {
  if (running) return;
  running = true;
  timerDisplay.classList.remove('paused');
  controls.classList.remove('visible');
  colorWrapper.classList.remove('visible');
  colorOptions.classList.remove('open');
  intervalId = setInterval(tick, 1000);
}

function stop() {
  running = false;
  clearInterval(intervalId);
  intervalId = null;
  timerDisplay.classList.add('paused');
  controls.classList.add('visible');
  colorWrapper.classList.add('visible');
}

function reload() {
  stop();
  totalSeconds = INITIAL_MINUTES * 60 + INITIAL_SECONDS;
  timerDisplay.classList.remove('warning', 'danger', 'paused');
  controls.classList.remove('visible');
  render();
  // Auto-start after reload
  start();
}

// ── Events ──

// Click timer to pause
timerArea.addEventListener('click', () => {
  if (running) {
    stop();
  }
});

// Resume button
resumeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  start();
});

// Reload button
reloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  reload();
});

// ── Fullscreen ──
const fullscreenBtn = document.getElementById('fullscreenBtn');

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen();
  }
}

fullscreenBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

// Update button text when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  const svg = fullscreenBtn.querySelector('svg');
  if (document.fullscreenElement) {
    svg.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>';
    fullscreenBtn.lastChild.textContent = ' Exit';
  } else {
    svg.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
    fullscreenBtn.lastChild.textContent = ' Fullscreen';
  }
});

// ── Color Picker ──
colorBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  colorOptions.classList.toggle('open');
});

document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', (e) => {
    e.stopPropagation();
    const bg = swatch.dataset.bg;
    const text = swatch.dataset.text;
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--text', text);
    // Swap logo based on background brightness
    const isDark = DARK_BGS.includes(bg.toLowerCase());
    logoImg.src = isDark ? 'logo-dark.png' : 'logo.png';
    logoImg.classList.toggle('dark-logo', isDark);
    colorOptions.classList.remove('open');
  });
});

// Close color picker when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!document.getElementById('colorPickerWrapper').contains(e.target)) {
    colorOptions.classList.remove('open');
  }
});

// ── Keyboard shortcuts ──
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    running ? stop() : start();
  }
  if (e.code === 'KeyR') {
    reload();
  }
  if (e.code === 'KeyF') {
    toggleFullscreen();
  }
});

// ── Init ──
render();
start(); // Auto-start the timer
