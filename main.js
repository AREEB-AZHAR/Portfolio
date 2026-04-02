import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// =========================================
// SMOOTH SCROLLING (Lenis)
// =========================================
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// =========================================
// CUSTOM CURSOR
// =========================================
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let isHovering = false;

function updateMousePosition(clientX, clientY) {
  mouseX = clientX;
  mouseY = clientY;
  
  if (cursor && window.innerWidth > 768) {
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  }
}

window.addEventListener('mousemove', (e) => {
  updateMousePosition(e.clientX, e.clientY);
});

window.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  
  if (cursorRing) {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  }
  
  requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Add hover states to interactive elements
document.querySelectorAll('a, button, input, .interactive').forEach((el) => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering-link'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-link'));
});

// =========================================
// GSAP SCROLL ANIMATIONS
// =========================================

// Hero Parallax Code Windows
gsap.to('.cw-1', {
  yPercent: -50,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  }
});

gsap.to('.cw-2', {
  yPercent: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  }
});

// Section Titles Reveal
gsap.utils.toArray('.reveal-title').forEach((title) => {
  gsap.from(title, {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: title,
      start: 'top 85%',
    }
  });
});

// =========================================
// DROPDOWN MENU LOGIC
// =========================================
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.dropdown-link');

if (menuToggle && mobileMenu) {
  const toggleMenu = (e) => {
    if (e) e.stopPropagation();
    mobileMenu.classList.toggle('active');
  };

  menuToggle.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
      mobileMenu.classList.remove('active');
    }
  });
}


// =========================================
// CUSTOM GSAP GALLERY SLIDER
// =========================================
const galleryTrack = document.querySelector('.gallery-track');
const galleryItems = document.querySelectorAll('.gallery-item');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (galleryTrack && galleryItems.length > 0) {
  let activeIndex = 0;
  
  function updateGallery() {
    const viewportWidth = document.querySelector('.gallery-viewport').offsetWidth;
    const cardWidth = galleryItems[activeIndex].offsetWidth;
    // CSS gap is 4rem (64px) on desktop, 1.5rem (24px) on mobile
    const gap = window.innerWidth <= 768 ? 24 : 64; 
    
    // Calculate the left position of the active card within the track
    let activeCardLeft = (cardWidth + gap) * activeIndex;
    
    // Calculate translation required to center the active card in the viewport
    let translateAmount = activeCardLeft - (viewportWidth / 2) + (cardWidth / 2);
    
    gsap.to(galleryTrack, {
      x: -translateAmount,
      duration: 1.2,
      ease: 'power3.out',
      force3D: true
    });
    
    galleryItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Removed end limits so user can loop freely

    // Update Pills
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      const target = parseInt(btn.getAttribute('data-target'));
      if (target === activeIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  let autoPlayTimer;
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      if (activeIndex < galleryItems.length - 1) {
        activeIndex++;
      } else {
        activeIndex = 0; // Loop to start
      }
      updateGallery();
    }, 4000); // Changes every 4 seconds
  }
  
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // Initial layout calculation
  setTimeout(() => {
    updateGallery();
    startAutoPlay();
  }, 100);
  
  window.addEventListener('resize', () => {
    updateGallery();
  });
  
  prevBtn.addEventListener('click', () => {
    if (activeIndex > 0) {
      activeIndex--;
    } else {
      activeIndex = galleryItems.length - 1; // loop back to the end
    }
    updateGallery();
    resetAutoPlay();
  });
  
  nextBtn.addEventListener('click', () => {
    if (activeIndex < galleryItems.length - 1) {
      activeIndex++;
    } else {
      activeIndex = 0; // loop back to the start
    }
    updateGallery();
    resetAutoPlay();
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIndex = parseInt(btn.getAttribute('data-target'));
      if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < galleryItems.length) {
        activeIndex = targetIndex;
        updateGallery();
        resetAutoPlay();
      }
    });
  });

  // Entry animation
  gsap.from('.gallery-viewport', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.gallery-viewport',
      start: 'top 80%',
    }
  });
}

// About Stats Counter Reveal
gsap.from('.stat-num', {
  textContent: 0,
  duration: 2,
  ease: 'power1.inOut',
  snap: { textContent: 1 },
  stagger: 0.2,
  scrollTrigger: {
    trigger: '.stats-row',
    start: 'top 85%',
  }
});

// Hologram Scanline Parallax
gsap.to('.about-holo', {
  yPercent: 15,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about-visual',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  }
});


// =========================================
// NEURAL CANVAS (Adapted)
// =========================================
const canvas = document.getElementById('neural-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  const particleCount = 100;
  const connectionDistance = 150;
  const mouseInfluenceRadius = 250;
  
  const COLOR_BASE = '0, 255, 136'; // Emerald
  const COLOR_HOVER = '0, 225, 255'; // Cyan
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 1.5 + 0.5;
      this.lit = 0; // Glow factor
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Bounce
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      
      // Mouse Interaction
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < mouseInfluenceRadius) {
        // Repel slightly and inherit velocity
        const force = (1 - dist / mouseInfluenceRadius) * 0.02;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
        
        // Glow up
        this.lit += (1 - this.lit) * 0.1;
      } else {
        // Decay glow
        this.lit += (0 - this.lit) * 0.05;
      }
      
      // Speed limit
      const maxSpeed = dist < mouseInfluenceRadius ? 2.5 : 1.0;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
    }
    
    draw() {
      const glowR = this.radius * (3 + this.lit * 5);
      
      // Draw outer glow if lit
      if (this.lit > 0.1) {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
        grad.addColorStop(0, `rgba(${COLOR_BASE}, ${0.3 * this.lit})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      
      // Core particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + this.lit, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR_BASE}, ${0.4 + this.lit * 0.6})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw links
    for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const iNearMouse = particles[i].lit > 0.1 || particles[j].lit > 0.1;
            const actualMaxDist = iNearMouse ? connectionDistance * 1.5 : connectionDistance;
            
            if (dist < actualMaxDist) {
                const baseAlpha = 1 - (dist / actualMaxDist);
                const boost = (particles[i].lit + particles[j].lit) * 0.5;
                const alpha = baseAlpha * (0.15 + boost * 0.4);
                
                ctx.beginPath();
                ctx.strokeStyle = boost > 0.2 ? `rgba(${COLOR_HOVER}, ${alpha})` : `rgba(${COLOR_BASE}, ${alpha})`;
                ctx.lineWidth = 0.5 + boost * 1.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animateCanvas);
  }
  
  animateCanvas();
}
