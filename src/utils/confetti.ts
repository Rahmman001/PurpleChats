export function fireConfetti() {
  if (typeof window === 'undefined' || !document.body) return;
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);
  const colors = ['#16A34A', '#EA580C', '#EAB308', '#6366F1', '#1C1917'];
  const particles = Array.from({ length: 45 }, () => ({
    x: w * 0.5 + (Math.random() - 0.5) * 80,
    y: h * 0.6,
    vx: (Math.random() - 0.5) * 9,
    vy: -Math.random() * 8 - 4,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    vRot: (Math.random() - 0.5) * 10,
  }));

  const start = performance.now();
  function frame(time: number) {
    if (!ctx) return;
    const elapsed = time - start;
    if (elapsed > 2000) {
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, w, h);
    const opacity = Math.max(0, 1 - elapsed / 2000);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = opacity;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
