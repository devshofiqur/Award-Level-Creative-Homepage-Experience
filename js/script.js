/* ══════════════════════════════════════════
   LUMINA — Premium JavaScript
   Particles · Scroll Animations · Counters
══════════════════════════════════════════ */

$(document).ready(function () {

  /* ─── PARTICLE CANVAS ─── */
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.r   = Math.random() * 1.8 + 0.3;
      this.vx  = (Math.random() - 0.5) * 0.25;
      this.vy  = (Math.random() - 0.5) * 0.25;
      this.a   = Math.random() * 0.55 + 0.1;
      this.da  = (Math.random() - 0.5) * 0.003;
      // Warm gold tones
      const hue = 38 + Math.random() * 20;
      const sat = 55 + Math.random() * 20;
      const lit = 65 + Math.random() * 20;
      this.color = `hsla(${hue},${sat}%,${lit}%,`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.a += this.da;
      if (this.a <= 0.05 || this.a >= 0.65) this.da *= -1;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.a + ')';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 12000), 90);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    // Draw subtle connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,168,107,${0.06 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  /* ─── CUSTOM CURSOR ─── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  })();

  // Cursor state on interactable elements
  $('a, button, .exp-card, .work-item').on('mouseenter', function () {
    ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
    ring.style.opacity   = '0.35';
    dot.style.transform  = 'translate(-50%,-50%) scale(0.5)';
  }).on('mouseleave', function () {
    ring.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.opacity   = '0.6';
    dot.style.transform  = 'translate(-50%,-50%) scale(1)';
  });

  /* ─── NAVIGATION: SCROLL STATE ─── */
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 60) {
      $('#mainNav').addClass('scrolled');
    } else {
      $('#mainNav').removeClass('scrolled');
    }
  });

  /* ─── MOBILE HAMBURGER ─── */
  $('#hamburger').on('click', function () {
    $('#mobileMenu').toggleClass('open');
  });
  $('#mobileMenu a').on('click', function () {
    $('#mobileMenu').removeClass('open');
  });

  /* ─── SCROLL REVEAL OBSERVER ─── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-scale');
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObs.observe(el));

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el, target, duration) {
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      start = Math.floor(eased * target);
      el.textContent = start;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const statObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.getAttribute('data-target'));
          animateCounter(e.target, target, 2000);
          statObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.stat-num').forEach(el => statObs.observe(el));

  /* ─── SCROLL TO TOP BUTTON ─── */
  const scrollTopBtn = document.getElementById('scrollTop');

  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── SMOOTH ANCHOR SCROLLING ─── */
  $('a[href^="#"]').on('click', function (e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 70 }, 800, 'swing');
    }
  });

  /* ─── PARALLAX HERO GLOW ─── */
  $(window).on('mousemove', function (e) {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
    $('.glow-1').css('transform', `translate(${xPct * -18}px, ${yPct * -12}px)`);
    $('.glow-2').css('transform', `translate(${xPct * 10}px, ${yPct * 8}px)`);
    $('.glow-3').css('transform', `translate(${xPct * -8}px, ${yPct * 14}px)`);
  });

  /* ─── HERO IMAGE PARALLAX ON SCROLL ─── */
  $(window).on('scroll', function () {
    const scrollY = $(this).scrollTop();
    const $heroImg = $('.hero-img');
    if ($heroImg.length) {
      $heroImg.css('transform', `translateY(${scrollY * 0.08}px)`);
    }
    // Subtle marquee speed variation
    const speed = 28 - scrollY * 0.005;
    $('.marquee-inner').css('animation-duration', Math.max(speed, 10) + 's');
  });

  /* ─── EXPERIENCE CARD TILT ─── */
  $('.exp-card').on('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;
    $(this).css('transform', `translateY(-12px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`);
  }).on('mouseleave', function () {
    $(this).css('transform', '');
  });

  /* ─── WORK ITEM HOVER MAGNETIC ─── */
  $('.work-item').on('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    $(this).find('.wi-link').css('transform', `translate(${x * 0.04}px, ${y * 0.04}px)`);
  }).on('mouseleave', function () {
    $(this).find('.wi-link').css('transform', '');
  });

  /* ─── INITIAL HERO ENTRANCE ─── */
  // Force initial elements visible after short delay
  setTimeout(() => {
    $('.hero .reveal-up, .hero .reveal-scale').addClass('visible');
  }, 200);

  /* ─── NOISE TEXTURE OVERLAY ─── */
  // Add subtle grain to hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.style.position = 'relative';
  }

  /* ─── TYPING EFFECT for hero subtitle (optional enhancement) ─── */
  function addTextureClass() {
    document.querySelectorAll('.si-main img, .si-secondary img').forEach(img => {
      img.addEventListener('load', () => img.classList.add('loaded'));
      if (img.complete) img.classList.add('loaded');
    });
  }
  addTextureClass();

  /* ─── NAV LINK ACTIVE STATE ON SCROLL ─── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' }
  );
  sections.forEach(s => navObs.observe(s));

  /* ─── MARQUEE PAUSE ON HOVER ─── */
  $('.marquee-strip').on('mouseenter', function () {
    $('.marquee-inner').css('animation-play-state', 'paused');
  }).on('mouseleave', function () {
    $('.marquee-inner').css('animation-play-state', 'running');
  });

  console.log('%c✦ LUMINA Studio — Where Light Becomes Emotion', 
    'background:#1A1714;color:#C8A86B;padding:8px 16px;font-size:14px;font-family:Georgia,serif;letter-spacing:2px;');
});

/* ─── CSS Active nav link ─── */
const styleSheet = document.createElement('style');
styleSheet.textContent = `.nav-link.active { color: var(--text-primary) !important; } .nav-link.active::after { width: 100% !important; }`;
document.head.appendChild(styleSheet);
