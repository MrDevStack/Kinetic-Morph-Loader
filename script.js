(function initCircularIrisPreloader() {
  const preloader = document.getElementById('km-preloader');
  const countEl = document.getElementById('km-count');
  const fillEl = document.getElementById('km-fill');
  const statusEl = document.getElementById('km-status');
  const whitePage = document.getElementById('white-page');
  const greetingEl = document.querySelector('.greeting');

  if (!preloader || !countEl || !fillEl || !statusEl || !whitePage || !greetingEl) return;

  // Duration: 4.5s
  const DURATION = 4500;

  let currentProgress = 0;
  let targetProgress = 0;
  let startTime = performance.now();
  let lastFrameTime = performance.now();
  let animationId = null;
  let isRunning = false;

  // Frame loop with sub-pixel lerp
  function tick(now) {
    if (!isRunning) return;

    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    const elapsed = now - startTime;
    const t = Math.min(elapsed / DURATION, 1);

    const easedT = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    targetProgress = easedT * 100;

    const lerpSpeed = 7.5;
    const lerpFactor = 1 - Math.exp(-lerpSpeed * dt);
    currentProgress += (targetProgress - currentProgress) * lerpFactor;

    if (t >= 1 && (100 - currentProgress) < 0.25) {
      currentProgress = 100;
      updateDisplay(100);
      finish();
      return;
    }

    updateDisplay(currentProgress);
    animationId = requestAnimationFrame(tick);
  }

  function updateDisplay(val) {
    const intVal = Math.min(Math.floor(val), 100);

    countEl.textContent = intVal;
    fillEl.style.width = `${val.toFixed(2)}%`;

    if (intVal < 25) {
      statusEl.textContent = 'INITIALIZING';
    } else if (intVal < 60) {
      statusEl.textContent = 'LOADING';
    } else if (intVal < 90) {
      statusEl.textContent = 'SYNCING';
    } else if (intVal < 100) {
      statusEl.textContent = 'FINALIZING';
    } else {
      statusEl.textContent = 'READY';
    }
  }

  function finish() {
    isRunning = false;
    preloader.classList.add('km-completing');

    setTimeout(() => {
      whitePage.classList.add('reveal');
    }, 200);

    setTimeout(() => {
      greetingEl.classList.add('fade-in');
      preloader.style.display = 'none';
    }, 1250);
  }

  function start() {
    isRunning = true;
    startTime = performance.now();
    lastFrameTime = performance.now();
    currentProgress = 0;
    targetProgress = 0;

    preloader.style.display = 'flex';
    preloader.classList.remove('km-completing');
    whitePage.classList.remove('reveal');
    greetingEl.classList.remove('fade-in');
    updateDisplay(0);

    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(tick);
  }

  start();

  // Dev shortcut: Space or R to replay
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
      e.preventDefault();
      start();
    }
  });
})();
