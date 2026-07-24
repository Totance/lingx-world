import { useEffect, useRef } from 'react';

const MAX_PARTICLES = 400;
const DAMPING = 11;            // 帧率无关阻尼系数
const PARTICLE_LIFE = 2200;    // ms

// 星尘粒子精灵(径向渐变小圆点)
function createParticleSprite() {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,252,248,0.85)');
  g.addColorStop(0.5, 'rgba(255,248,235,0.35)');
  g.addColorStop(0.8, 'rgba(255,240,220,0.06)');
  g.addColorStop(1, 'rgba(255,240,220,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

// 暖白 / 淡金 / 淡蓝 调色板,呼应梦境主题
const PALETTE = [
  '255,252,248',
  '255,248,235',
  '255,242,220',
  '245,240,232',
  '232,216,160',
  '200,216,248',
];

function damp(current, target, smoothing, dt) {
  return current + (target - current) * (1 - Math.exp(-smoothing * dt));
}

export default function CursorDust() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const sprite = createParticleSprite();

    const state = {
      pointer: { x: -9999, y: -9999, active: false },
      lerp: { x: -9999, y: -9999 },
      particles: [],
      running: true,
      width: 0,
      height: 0,
    };

    const resize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = state.width * dpr;
      canvas.height = state.height * dpr;
      canvas.style.width = state.width + 'px';
      canvas.style.height = state.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      state.pointer.x = e.clientX;
      state.pointer.y = e.clientY;
      state.pointer.active = true;
      if (state.lerp.x < -9000) { state.lerp.x = e.clientX; state.lerp.y = e.clientY; }
    };
    const onLeave = () => { state.pointer.active = false; };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    function spawn(px, py, count) {
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        if (state.particles.length >= MAX_PARTICLES) state.particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const speed = 16 + Math.random() * 64;
        state.particles.push({
          x: px + (Math.random() - 0.5) * 6,
          y: py + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6,   // 轻微向上飘
          size: 0.3 + Math.random() * 1.8,
          opacity: 0.5 + Math.random() * 0.5,
          born: now,
          life: PARTICLE_LIFE * (0.5 + Math.random() * 0.6),
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    }

    let lastTime = 0;
    function animate(time) {
      if (!state.running) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;

      ctx.clearRect(0, 0, state.width, state.height);

      state.lerp.x = damp(state.lerp.x, state.pointer.x, DAMPING, dt);
      state.lerp.y = damp(state.lerp.y, state.pointer.y, DAMPING, dt);

      const dx = state.pointer.x - state.lerp.x;
      const dy = state.pointer.y - state.lerp.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const count = Math.min(Math.ceil(speed * 0.14), 7);

      if (state.pointer.active && state.pointer.x > 0 && state.pointer.y > 0) {
        spawn(state.lerp.x, state.lerp.y, count);
      }

      const now = performance.now();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        const age = now - p.born;
        if (age >= p.life) { state.particles.splice(i, 1); continue; }

        const progress = age / p.life;
        const ease = 1 - (1 - progress) * (1 - progress);
        p.x += p.vx * dt * (1 - ease * 0.65);
        p.y += p.vy * dt * (1 - ease * 0.65);
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.twinkle += dt * 6;

        const twinkle = 0.7 + Math.sin(p.twinkle) * 0.3;
        const alpha = p.opacity * (1 - ease) * twinkle;
        const size = p.size * (0.6 + progress * 1.8 + Math.sin(progress * Math.PI) * 0.9);
        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - size, p.y - size, size * 2, size * 2);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(animate);
    }
    const raf = requestAnimationFrame(animate);

    return () => {
      state.running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}






