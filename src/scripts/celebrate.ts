interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  char: string;
}

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Rain holiday emoji inside `host` (a positioned element). Returns a stop fn.
 */
export function celebrate(host: HTMLElement, chars: string[], opts: { burst?: number; duration?: number } = {}) {
  if (prefersReduced || !chars.length) return () => {};

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = host.clientWidth * dpr;
    canvas.height = host.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const burst = opts.burst ?? 26;
  const duration = opts.duration ?? 4200;
  const pieces: Piece[] = [];
  const W = () => host.clientWidth;
  const H = () => host.clientHeight;

  function spawn(n: number) {
    for (let i = 0; i < n; i++) {
      pieces.push({
        x: Math.random() * W(),
        y: -20 - Math.random() * H() * 0.5,
        vx: (Math.random() - 0.5) * 40,
        vy: 40 + Math.random() * 80,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 3,
        size: 18 + Math.random() * 20,
        char: chars[(Math.random() * chars.length) | 0],
      });
    }
  }
  spawn(burst);
  const trickle = window.setInterval(() => spawn(4), 380);

  let last = performance.now();
  const start = last;
  let raf = 0;
  let running = true;

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W(), H());
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.vy += 60 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, 0, 0);
      ctx.restore();
      if (p.y > H() + 40) pieces.splice(i, 1);
    }
    if (now - start > duration) window.clearInterval(trickle);
    if (pieces.length === 0 && now - start > duration) {
      stop();
      return;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.clearInterval(trickle);
    window.removeEventListener('resize', resize);
    canvas.remove();
  }

  return stop;
}
