const canvas = document.getElementById("smokeCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let dpr;
let particles = [];
let mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  px: window.innerWidth / 2,
  py: window.innerHeight / 2,
  active: false
};

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createSmoke(x, y, force = 1) {
  const speedX = mouse.x - mouse.px;
  const speedY = mouse.y - mouse.py;
  const speed = Math.min(Math.hypot(speedX, speedY), 70);

  const count = Math.floor(3 + speed * 0.08);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + random(-18, 18),
      y: y + random(-18, 18),
      vx: random(-0.25, 0.25) - speedX * 0.018,
      vy: random(-0.55, -0.12) - speedY * 0.012,
      radius: random(42, 110) * force,
      life: random(120, 220),
      maxLife: random(120, 220),
      alpha: random(0.022, 0.055),
      twist: random(0, Math.PI * 2),
      twistSpeed: random(-0.018, 0.018),
      noiseSeed: random(0, 1000)
    });
  }

  if (particles.length > 420) {
    particles.splice(0, particles.length - 420);
  }
}

function drawSmokeParticle(p) {
  const lifeRatio = p.life / p.maxLife;
  const fade = Math.sin(lifeRatio * Math.PI);
  const alpha = p.alpha * fade;

  const wobbleX = Math.sin(p.twist + p.noiseSeed) * 18;
  const wobbleY = Math.cos(p.twist * 0.7 + p.noiseSeed) * 12;

  const x = p.x + wobbleX;
  const y = p.y + wobbleY;

  const gradient = ctx.createRadialGradient(
    x,
    y,
    p.radius * 0.08,
    x,
    y,
    p.radius
  );

  gradient.addColorStop(0.0, `rgba(255,255,255,${alpha * 1.7})`);
  gradient.addColorStop(0.22, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(0.48, `rgba(255,255,255,${alpha * 0.42})`);
  gradient.addColorStop(0.75, `rgba(255,255,255,${alpha * 0.16})`);
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;

  ctx.beginPath();

  const points = 18;
  for (let i = 0; i <= points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const distortion =
      1 +
      Math.sin(angle * 3 + p.twist) * 0.14 +
      Math.cos(angle * 5 + p.twist * 0.8) * 0.1;

    const r = p.radius * distortion;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r * 0.72;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(14px) contrast(112%)";

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.992;
    p.vy *= 0.992;

    p.radius += 0.28;
    p.twist += p.twistSpeed;
    p.life--;

    drawSmokeParticle(p);

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,0.018)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  requestAnimationFrame(animate);
}

function handleMove(x, y) {
  mouse.px = mouse.x;
  mouse.py = mouse.y;
  mouse.x = x;
  mouse.y = y;
  mouse.active = true;

  createSmoke(x, y, 1);
}

window.addEventListener("mousemove", (e) => {
  handleMove(e.clientX, e.clientY);
});

window.addEventListener(
  "touchmove",
  (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
  },
  { passive: true }
);

window.addEventListener("touchstart", (e) => {
  if (!e.touches.length) return;
  const t = e.touches[0];
  handleMove(t.clientX, t.clientY);
  createSmoke(t.clientX, t.clientY, 1.4);
});

setInterval(() => {
  if (!mouse.active) {
    createSmoke(width * random(0.2, 0.8), height * random(0.35, 0.75), 0.55);
  }
}, 900);

animate();
