import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// =========================================
// SMOOTH SCROLLING (Lenis)
// =========================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// =========================================
// LOADER ANIMATION
// =========================================
const tlLoader = gsap.timeline();
tlLoader
  .to('.bracket-left', { x: -20, opacity: 0, duration: 1, delay: 1, ease: 'power2.inOut' })
  .to('.bracket-right', { x: 20, opacity: 0, duration: 1, ease: 'power2.inOut' }, '<')
  .to('.loader', { yPercent: -100, duration: 1, ease: 'power4.inOut', onComplete: () => document.querySelector('.loader').remove() })
  .fromTo(
    '.hero-title',
    { y: 100, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    '-=0.5'
  )
  .fromTo(
    '.hero-tagline',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    '-=0.8'
  )
  .fromTo(
    '.code-snippet-window',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
    '-=0.8'
  );

// =========================================
// NEURAL NETWORK CANVAS (Interactive Constellation)
// =========================================
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const particleCount = 120; // Number of stars/nodes

// Mouse Interaction
let mouse = { x: null, y: null, radius: 150 };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 1;
    this.baseX = this.x;
    this.baseY = this.y;
    this.color = '#ffffff';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    
    // Mouse Interaction
    if(mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = forceDirectionX * force * 5;
            const directionY = forceDirectionY * force * 5;
            
            this.x -= directionX;
            this.y -= directionY;
        }
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 120})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// =========================================
// 3D TILT EFFECT (Vanilla JS)
// =========================================
const tiltElements = document.querySelectorAll('.project-card, .code-snippet-window, .about-image');
tiltElements.forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
        const rotateY = ((x - centerX) / centerX) * 10;
        
        gsap.to(el, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: 'power1.out',
            duration: 0.5
        });
    });
    
    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            rotationX: 0,
            rotationY: 0,
            ease: 'power3.out',
            duration: 1
        });
    });
});

// =========================================
// SCROLL ANIMATIONS (GSAP)
// =========================================

// Reveal texts
gsap.utils.toArray('.reveal-text').forEach((el) => {
  if (el.classList.contains('hero-title')) return; // handled by loader
  gsap.fromTo(
    el,
    { y: 50, opacity: 0 },
    {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
    }
  );
});

// Fade ups general
gsap.utils.toArray('.fade-up').forEach((el) => {
  if (el.closest('.hero')) return; // handled by loader
  gsap.fromTo(
    el,
    { y: 50, opacity: 0 },
    {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out',
    }
  );
});

// Parallax Images
gsap.utils.toArray('.parallax-img').forEach((el) => {
  gsap.fromTo(
    el,
    { y: -30 },
    {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
      y: 30,
      ease: 'none',
    }
  );
});

// Magnetic Buttons Loop
const magnetics = document.querySelectorAll('.magnetic, .magnetic-link');
magnetics.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const h = rect.width / 2;
    const v = rect.height / 2;
    const x = e.clientX - rect.left - h;
    const y = e.clientY - rect.top - v;
    
    gsap.to(btn, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.5,
      ease: 'power3.out'
    });
  });
  
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
