/* Site header — keep nav below topbar (menu icon stays tappable on mobile) */
function syncSiteHeaderOffset() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  const topbarH = Math.ceil(topbar.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--umpa-topbar-h', `${topbarH}px`);
  const nav = document.querySelector('body > nav');
  if (nav) {
    const navH = Math.ceil(nav.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--umpa-nav-h', `${navH}px`);
  }
}

(function initSiteHeaderOffset() {
  function run() {
    syncSiteHeaderOffset();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  window.addEventListener('resize', run);
  window.addEventListener('orientationchange', run);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(() => {});
  }
})();

/* NAV */
let navIgnoreOutsideUntil = 0;
let navLastViewportWidth = window.innerWidth;

function isMobileNav() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-has-dropdown.open').forEach((item) => {
    item.classList.remove('open');
    const btn = item.querySelector('.nav-caret-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function closeMobileMenu() {
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
  if (!menu) return;
  menu.classList.remove('active');
  document.body.classList.remove('nav-menu-open');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.textContent = '☰';
  }
  closeAllDropdowns();
}

function toggleMenu() {
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
  if (!menu) return;

  const willOpen = !menu.classList.contains('active');
  menu.classList.toggle('active', willOpen);
  document.body.classList.toggle('nav-menu-open', willOpen);

  if (toggle) {
    toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
    toggle.textContent = willOpen ? '✕' : '☰';
  }

  if (!willOpen) {
    closeAllDropdowns();
  } else {
    navIgnoreOutsideUntil = Date.now() + 400;
  }
}

function toggleDropdown(el) {
  if (!el) return;

  const willOpen = !el.classList.contains('open');

  document.querySelectorAll('.nav-has-dropdown.open').forEach((item) => {
    if (item !== el) {
      item.classList.remove('open');
      const btn = item.querySelector('.nav-caret-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  el.classList.toggle('open', willOpen);
  const caretBtn = el.querySelector('.nav-caret-btn');
  if (caretBtn) caretBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

  navIgnoreOutsideUntil = Date.now() + 300;
}

(function initNav() {
  const toggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (menu) {
    menu.addEventListener('click', (e) => {
      if (!isMobileNav()) return;
      if (e.target.closest('.nav-caret-btn')) return;
      if (e.target.closest('.nav-dropdown a')) {
        closeMobileMenu();
      } else if (e.target.closest('a') && !e.target.closest('.nav-has-dropdown > .nav-label > a')) {
        closeMobileMenu();
      }
    });
  }

  document.querySelectorAll('.nav-caret-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(btn.closest('.nav-has-dropdown'));
    });
  });

  document.addEventListener('click', (e) => {
    if (Date.now() < navIgnoreOutsideUntil) return;

    if (!e.target.closest('nav')) {
      closeAllDropdowns();
      if (isMobileNav()) closeMobileMenu();
      return;
    }

    if (isMobileNav() && e.target.closest('#menu') && !e.target.closest('.nav-has-dropdown')) {
      closeAllDropdowns();
    } else if (!e.target.closest('.nav-has-dropdown')) {
      closeAllDropdowns();
    }
  });

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (navLastViewportWidth <= 768 && w > 768) closeMobileMenu();
    navLastViewportWidth = w;
    syncSiteHeaderOffset();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      closeMobileMenu();
    }
  });
})();

/* HERO SLIDER (homepage only) */
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');
if (slides.length && dotsContainer) {
  let index = 0;
  function showSlide() {
    slides.forEach(s => s.classList.remove('active'));
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
    updateDots();
  }
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { index = i - 1; showSlide(); });
    dotsContainer.appendChild(dot);
  });
  function updateDots() {
    document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.dot')[index].classList.add('active');
  }
  setInterval(showSlide, 4000);
}

/* HERO LEMON GREEN SPARKS (homepage only) */
(function () {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('heroTechLines');
  if (!hero || !canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const sparks = [];
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const MAX_SPARKS = 150;
  let rafId = null;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnSparks(x, y) {
    const count = 5;
    for (let i = 0; i < count; i += 1) {
      if (sparks.length >= MAX_SPARKS) sparks.shift();
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.4;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 16 + Math.random() * 34,
        life: 1,
        decay: 0.02 + Math.random() * 0.022,
        width: 1 + Math.random() * 1.1
      });
    }
  }

  function drawSpark(s) {
    const alpha = s.life * 0.7;
    const x2 = s.x + s.vx * s.len * 0.35;
    const y2 = s.y + s.vy * s.len * 0.35;
    const grad = ctx.createLinearGradient(s.x, s.y, x2, y2);
    grad.addColorStop(0, `rgba(208, 255, 0, ${alpha})`);
    grad.addColorStop(0.45, `rgba(208, 255, 0, ${alpha * 0.55})`);
    grad.addColorStop(1, 'rgba(208, 255, 0, 0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function animate() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const s = sparks[i];
      drawSpark(s);
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) sparks.splice(i, 1);
    }

    if (sparks.length) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function onMove(event) {
    const rect = hero.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (Math.hypot(x - lastX, y - lastY) > 2) {
      spawnSparks(x, y);
      lastX = x;
      lastY = y;
      startLoop();
    }
  }

  hero.addEventListener('mouseenter', (event) => {
    const rect = hero.getBoundingClientRect();
    lastX = event.clientX - rect.left;
    lastY = event.clientY - rect.top;
    spawnSparks(lastX, lastY);
    startLoop();
  });

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', () => {
    sparks.length = 0;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
})();

/* ===================== DIFFERENCE CAROUSEL (homepage only) ===================== */
(function() {
  const track    = document.getElementById('diffTrack');
  if (!track) return;

  const viewport = track.closest('.diff-carousel-wrap');
  const dotsWrap = document.getElementById('diffDots');
  const btnPrev  = document.getElementById('diffPrev');
  const btnNext  = document.getElementById('diffNext');
  const cards    = track.querySelectorAll('.difference-card');
  const total    = cards.length;

  let current = 0;
  let dragStartX = 0;
  let dragDelta = 0;
  let dragging = false;

  function perView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }
  function maxStep() { return Math.max(0, total - perView()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const steps = maxStep() + 1;
    for (let i = 0; i < steps; i += 1) {
      const d = document.createElement('button');
      d.classList.add('diff-dot');
      d.type = 'button';
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      if (i === 0) d.classList.add('active');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDotState() {
    dotsWrap.querySelectorAll('.diff-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() { return cards[0].offsetWidth + 24; }

  function applyTransform(offsetPx) {
    track.style.transform = `translateX(-${current * getCardWidth() - offsetPx}px)`;
  }

  function goTo(step) {
    current = Math.max(0, Math.min(step, maxStep()));
    track.style.transition = '';
    applyTransform(0);
    updateDotState();
  }

  function next() { goTo(current >= maxStep() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxStep() : current - 1); }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  function onDragStart(clientX) {
    dragging = true;
    dragStartX = clientX;
    dragDelta = 0;
    viewport.classList.add('is-dragging');
  }

  function onDragMove(clientX) {
    if (!dragging) return;
    dragDelta = clientX - dragStartX;
    applyTransform(dragDelta);
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    const threshold = getCardWidth() * 0.18;
    if (dragDelta < -threshold) next();
    else if (dragDelta > threshold) prev();
    else goTo(current);
    dragDelta = 0;
  }

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    viewport.setPointerCapture(e.pointerId);
    onDragStart(e.clientX);
  });
  viewport.addEventListener('pointermove', (e) => onDragMove(e.clientX));
  viewport.addEventListener('pointerup', onDragEnd);
  viewport.addEventListener('pointercancel', onDragEnd);

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxStep()));
  });

  buildDots();
  goTo(0);
})();
/* ===================== END DIFFERENCE CAROUSEL ===================== */

/* ===================== TESTIMONIALS CAROUSEL (homepage only) ===================== */
function initTestimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const carousel = track?.closest('.testimonials-carousel');
  const dotsWrap = document.getElementById('testimonialsDots');
  const btnPrev = document.getElementById('testimonialsPrev');
  const btnNext = document.getElementById('testimonialsNext');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;

  if (carousel) {
    carousel.classList.toggle('is-empty', total === 0);
  }
  if (!total) {
    track.style.transform = '';
    if (dotsWrap) dotsWrap.innerHTML = '';
    return;
  }
  let current = 0;
  let autoTimer = null;

  function perView() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxStep() {
    return Math.max(0, total - perView());
  }

  function getStepWidth() {
    return cards[0].offsetWidth + 24;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const steps = maxStep() + 1;
    for (let i = 0; i < steps; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.classList.add('testimonials-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    dotsWrap.style.display = steps > 1 ? 'flex' : 'none';
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.testimonials-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(step) {
    current = Math.max(0, Math.min(step, maxStep()));
    track.style.transform = `translateX(-${current * getStepWidth()}px)`;
    updateDots();
  }

  function next() {
    goTo(current >= maxStep() ? 0 : current + 1);
  }

  function prev() {
    goTo(current <= 0 ? maxStep() : current - 1);
  }

  btnNext?.addEventListener('click', () => {
    resetAuto();
    next();
  });
  btnPrev?.addEventListener('click', () => {
    resetAuto();
    prev();
  });

  function startAuto() {
    clearInterval(autoTimer);
    if (maxStep() > 0) autoTimer = setInterval(next, 6000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxStep()));
  });

  buildDots();
  goTo(0);
  startAuto();
}
/* ===================== END TESTIMONIALS CAROUSEL ===================== */

/* ===================== MEDIA CAROUSEL (image + text) ===================== */
(function () {
  const DOTS_MAX = 10;

  document.querySelectorAll('.media-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.media-carousel-track');
    const slides = carousel.querySelectorAll('.media-slide');
    const dotsWrap = carousel.querySelector('.media-carousel-dots');
    const btnPrev = carousel.querySelector('.media-carousel-btn--prev');
    const btnNext = carousel.querySelector('.media-carousel-btn--next');
    const counterCurrent = carousel.querySelector('.media-carousel-counter-current');
    const isUnified = carousel.classList.contains('media-carousel--unified');
    const isManual = carousel.classList.contains('media-carousel--manual');
    if (!track || !slides.length) return;

    if (slides.length === 1) {
      carousel.classList.add('media-carousel--single');
    }

    let current = 0;
    let autoTimer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsWrap && dotsWrap.style.display !== 'none') {
        dotsWrap.querySelectorAll('button').forEach((dot, i) => {
          dot.classList.toggle('active', i === current);
        });
      }
      if (counterCurrent) counterCurrent.textContent = String(current + 1);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (dotsWrap && slides.length <= DOTS_MAX && !isUnified) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.classList.add('media-carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => { resetAuto(); goTo(i); });
        dotsWrap.appendChild(dot);
      });
    } else if (dotsWrap) {
      dotsWrap.style.display = 'none';
    }

    btnNext?.addEventListener('click', () => { resetAuto(); next(); });
    btnPrev?.addEventListener('click', () => { resetAuto(); prev(); });

    function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
    function startAuto() {
      if (isManual || slides.length <= 1) return;
      stopAuto();
      autoTimer = setInterval(next, isUnified ? 6000 : 5500);
    }
    function resetAuto() {
      if (isManual || slides.length <= 1) return;
      stopAuto();
      startAuto();
    }

    if (!isManual && slides.length > 1) {
      carousel.addEventListener('mouseenter', stopAuto);
      carousel.addEventListener('mouseleave', startAuto);
      carousel.addEventListener('focusin', stopAuto);
      carousel.addEventListener('focusout', (e) => {
        if (!carousel.contains(e.relatedTarget)) startAuto();
      });
    }
    carousel.addEventListener('keydown', (e) => {
      if (slides.length <= 1) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); resetAuto(); prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); resetAuto(); next(); }
    });

    goTo(0);
    startAuto();
  });
})();
/* ===================== END MEDIA CAROUSEL ===================== */

/* IMPACT COUNTERS — loop continuously while visible */
(function () {
  const counters = document.querySelectorAll('.impact-counter');
  if (!counters.length) return;

  const loops = new WeakMap();

  function animateCounter(el, onDone) {
    const target = parseInt(el.dataset.target, 10);
    const fmt = el.dataset.fmt;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = fmt === 'locale' ? value.toLocaleString() : String(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = fmt === 'locale' ? target.toLocaleString() : String(target);
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(tick);
  }

  function startLoop(el) {
    if (loops.get(el)) return;
    loops.set(el, true);

    function cycle() {
      if (!loops.get(el)) return;
      el.textContent = '0';
      animateCounter(el, () => {
        setTimeout(cycle, 2200);
      });
    }
    cycle();
  }

  function stopLoop(el) {
    loops.set(el, false);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startLoop(entry.target);
      else stopLoop(entry.target);
    });
  }, { threshold: 0.35 });

  counters.forEach((c) => observer.observe(c));
})();

/* ========== UMPA PUBLIC FORMS → prolife.klarch@yahoo.com (FormSubmit) ========== */
const UMPA_FORM_EMAIL = 'prolife.klarch@yahoo.com';
const UMPA_FORMSUBMIT_URL = 'https://formsubmit.co/' + UMPA_FORM_EMAIL;
const UMPA_FORM_FRAME = 'umpa-formsubmit-frame';

function umpaEnsureHidden(form, name, value) {
  let input = form.querySelector('input[name="' + name + '"]');
  if (!input) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    form.prepend(input);
  }
  input.value = value;
}

function umpaHoneypotFilled(form) {
  const honey = form.querySelector('[name="_gotcha"]');
  return !!(honey && String(honey.value || '').trim());
}

function umpaEnsureFormSubmitFrame() {
  let frame = document.getElementById(UMPA_FORM_FRAME);
  if (frame) return frame;
  frame = document.createElement('iframe');
  frame.id = UMPA_FORM_FRAME;
  frame.name = UMPA_FORM_FRAME;
  frame.title = 'Form delivery';
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(frame);
  return frame;
}

function umpaPrepareFormSubmit(form) {
  form.setAttribute('action', UMPA_FORMSUBMIT_URL);
  form.setAttribute('method', 'POST');
  form.setAttribute('target', UMPA_FORM_FRAME);
  umpaEnsureHidden(form, '_captcha', 'false');
  umpaEnsureHidden(form, '_template', 'table');
  form.querySelectorAll('input[name="_next"]').forEach(function (el) {
    el.remove();
  });
}

/**
 * Send via hidden iframe — you stay on the page; works from local files and http.
 */
function umpaSendForm(form, options) {
  const opts = options || {};
  if (umpaHoneypotFilled(form)) return false;
  if (!form.reportValidity()) return false;

  const replyEmail = form.querySelector('[name="email"]');
  if (replyEmail && replyEmail.value) {
    umpaEnsureHidden(form, '_replyto', String(replyEmail.value).trim());
  }

  umpaEnsureFormSubmitFrame();
  umpaPrepareFormSubmit(form);

  const submitBtn = opts.submitBtn;
  const prevLabel = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = opts.sendingLabel || 'Sending…';
  }
  if (typeof opts.onSending === 'function') {
    opts.onSending();
  }

  form.submit();

  window.setTimeout(function () {
    form.reset();
    form.removeAttribute('target');
    if (typeof opts.onSuccess === 'function') {
      opts.onSuccess();
    }
    if (typeof opts.afterReset === 'function') {
      opts.afterReset();
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = prevLabel;
    }
  }, 1400);

  return true;
}

/* CONTACT FORM */
(function () {
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form || form.dataset.umpaBound === '1') return;
    form.dataset.umpaBound = '1';
    umpaPrepareFormSubmit(form);

    const statusEl = document.getElementById('contactFormStatus');
    const submitBtn = document.getElementById('contactSubmitBtn');

    function showStatus(message, type) {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.className = 'contact-form-status contact-form-status--' + type;
      statusEl.innerHTML = message;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      umpaSendForm(form, {
        submitBtn: submitBtn,
        onSending: function () {
          showStatus('Sending your message…', 'success');
        },
        onSuccess: function () {
          showStatus('Thank you! Your message has been sent. We will get back to you soon.', 'success');
        },
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();

/* JOIN CLUB FORM */
(function () {
  function initJoinClubForm() {
    const form = document.getElementById('joinClubForm');
    if (!form || form.dataset.umpaBound === '1') return;
    form.dataset.umpaBound = '1';
    umpaPrepareFormSubmit(form);

    const statusEl = document.getElementById('joinClubFormStatus');
    const submitBtn = document.getElementById('joinClubSubmit');

    function showStatus(message, type) {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.className = 'jcl-form-status jcl-form-status--' + type;
      statusEl.innerHTML = message;
    }

    function resetAudienceButtons() {
      document.querySelectorAll('.jcl-audience-btn.is-active').forEach(function (btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      umpaSendForm(form, {
        submitBtn: submitBtn,
        onSending: function () {
          showStatus('Sending your registration…', 'success');
        },
        onSuccess: function () {
          showStatus('Thank you! Your registration has been received. We will contact you soon.', 'success');
        },
        afterReset: resetAudienceButtons,
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJoinClubForm);
  } else {
    initJoinClubForm();
  }
})();

/* JOIN CLUB — Who Can Join role picker */
(function () {
  const grid = document.querySelector('.jcl-audience-grid');
  const roleSelect = document.getElementById('jcl-role');
  if (!grid || !roleSelect) return;

  const buttons = grid.querySelectorAll('.jcl-audience-btn');
  const registerSection = document.getElementById('jcl-register');

  function setActive(btn) {
    buttons.forEach((b) => {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-pressed', 'true');
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const role = btn.dataset.role;
      if (!role) return;

      setActive(btn);
      roleSelect.value = role;
      roleSelect.dispatchEvent(new Event('change', { bubbles: true }));

      if (registerSection) {
        registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      window.setTimeout(function () {
        roleSelect.focus({ preventScroll: true });
      }, 400);
    });
  });

  roleSelect.addEventListener('change', function () {
    const value = roleSelect.value;
    let matched = false;
    buttons.forEach((btn) => {
      if (btn.dataset.role === value) {
        setActive(btn);
        matched = true;
      }
    });
    if (!matched) {
      buttons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
    }
  });
})();

/* JOIN CLUB STATS — one-shot counter animation */
(function () {
  const counters = document.querySelectorAll('.jcl-counter');
  if (!counters.length) return;

  const done = new WeakSet();

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const fmt = el.dataset.fmt;
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = fmt === 'locale' ? value.toLocaleString() : String(value);
      if (progress < 1) requestAnimationFrame(tick);
      else {
        el.textContent = fmt === 'locale' ? target.toLocaleString() : String(target);
      }
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || done.has(entry.target)) return;
      done.add(entry.target);
      entry.target.textContent = '0';
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach((c) => observer.observe(c));
})();

/* NEWSLETTER — all footer subscribe forms */
(function () {
  function findNewsletterStatus(form) {
    const next = form.nextElementSibling;
    if (next && (next.classList.contains('newsletter-form-status') || next.id === 'sub-msg')) {
      return next;
    }
    const col = form.closest('.footer-col');
    if (col) {
      return col.querySelector('.newsletter-form-status, #sub-msg');
    }
    return null;
  }

  function showNewsletterStatus(statusEl, message, type) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = 'newsletter-form-status newsletter-form-status--' + type;
    statusEl.textContent = message;
    if (statusEl.id === 'sub-msg') {
      statusEl.style.display = 'block';
    }
    window.setTimeout(function () {
      statusEl.hidden = true;
      if (statusEl.id === 'sub-msg') {
        statusEl.style.display = 'none';
      }
    }, 6000);
  }

  function ensureNewsletterFields(form) {
    umpaPrepareFormSubmit(form);
    umpaEnsureHidden(form, '_subject', 'Newsletter subscription — UMPA website');
    if (!form.querySelector('[name="_gotcha"]')) {
      const honey = document.createElement('input');
      honey.type = 'text';
      honey.name = '_gotcha';
      honey.tabIndex = -1;
      honey.autocomplete = 'off';
      honey.className = 'newsletter-form-honeypot';
      honey.setAttribute('aria-hidden', 'true');
      form.prepend(honey);
    }
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && !emailInput.name) {
      emailInput.name = 'email';
    }
  }

  function bindNewsletterForm(form) {
    if (form.dataset.umpaBound === '1') return;
    form.dataset.umpaBound = '1';
    ensureNewsletterFields(form);

    const statusEl = findNewsletterStatus(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;

      umpaSendForm(form, {
        submitBtn: submitBtn,
        onSending: function () {
          showNewsletterStatus(statusEl, 'Subscribing…', 'success');
        },
        onSuccess: function () {
          showNewsletterStatus(statusEl, '✓ Thank you for subscribing!', 'success');
        },
      });
    });
  }

  document.querySelectorAll('.newsletter-form').forEach(bindNewsletterForm);

  window.handleSubscribe = function () {
    const form = document.querySelector('.newsletter-form');
    if (form) {
      form.requestSubmit();
    }
  };
})();

/* HERO TYPING (index hero tagline) */
(function () {
  const el = document.getElementById('heroTyping');
  if (!el) return;

  const fullText = (el.getAttribute('data-text') || el.textContent || '').trim();
  if (!fullText) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = fullText;
    return;
  }

  let i = 0;
  let dir = 1; // 1 typing, -1 deleting

  const TYPE_MS = 65;
  const DELETE_MS = 38;
  const HOLD_FULL_MS = 1400;
  const HOLD_EMPTY_MS = 450;

  function tick() {
    i += dir;
    if (i < 0) i = 0;
    if (i > fullText.length) i = fullText.length;
    el.textContent = fullText.slice(0, i);

    if (dir === 1 && i === fullText.length) {
      dir = -1;
      setTimeout(tick, HOLD_FULL_MS);
      return;
    }

    if (dir === -1 && i === 0) {
      dir = 1;
      setTimeout(tick, HOLD_EMPTY_MS);
      return;
    }

    setTimeout(tick, dir === 1 ? TYPE_MS : DELETE_MS);
  }

  el.textContent = '';
  setTimeout(tick, 400);
})();

/* ===================== SCROLL REVEAL ===================== */
(function () {
  const targets = [
    { sel: '.hero-values__row',            cls: 'reveal reveal-stagger' },
    { sel: '.who-we-are__art',             cls: 'reveal reveal-left'  },
    { sel: '.who-we-are__content',        cls: 'reveal reveal-right' },
    { sel: '.difference-inner h2',        cls: 'reveal'              },
    { sel: '.diff-carousel-row',          cls: 'reveal'              },
    { sel: '.difference-action',          cls: 'reveal'              },
    { sel: '.impact-grid',                cls: 'reveal reveal-stagger' },
    { sel: '.life-cta-banner__inner',     cls: 'reveal'              },
    { sel: '.campus-gallery-header',     cls: 'reveal'              },
    { sel: '.campus-gallery-grid',       cls: 'reveal reveal-stagger' },
    { sel: '.testimonials-header',       cls: 'reveal'              },
    { sel: '.testimonials-carousel',     cls: 'reveal'              },
    { sel: '.news-events-header',        cls: 'reveal'              },
    { sel: '.news-events-grid',          cls: 'reveal reveal-stagger' },
    { sel: '.page-section-title',         cls: 'reveal'              },
    { sel: '.page-prose',                cls: 'reveal'              },
    { sel: '.media-carousel-section',    cls: 'reveal'              },
    { sel: '.journey-section',           cls: 'reveal'              },
    { sel: '.core-values-header',       cls: 'reveal'              },
    { sel: '.core-values-grid',         cls: 'reveal reveal-stagger' },
    { sel: '.jcl-section-header',       cls: 'reveal'              },
    { sel: '.jcl-why-grid',             cls: 'reveal reveal-stagger' },
    { sel: '.jcl-gallery-grid',         cls: 'reveal reveal-stagger' },
    { sel: '.jcl-audience-grid',        cls: 'reveal reveal-stagger' },
    { sel: '.jcl-testimonial-card',     cls: 'reveal'              },
    { sel: '.jcl-form-card',            cls: 'reveal'              },
    { sel: '.jcl-stats-grid',           cls: 'reveal reveal-stagger' },
  ];

  targets.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add(...cls.split(' ')));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => observer.observe(el));
})();

/* ===================== SITE SETTINGS (theme & font) ===================== */
(function () {
  const STORAGE_THEME = 'umpa-theme';
  const STORAGE_FONT = 'umpa-font';
  const DEFAULT_THEME = 'default';
  const DEFAULT_FONT = 'poppins';
  const VALID_THEMES = new Set(['default', 'green', 'red', 'black']);
  const LEGACY_THEMES = { light: 'default', dark: 'black', contrast: 'default' };

  const toggle = document.getElementById('siteSettingsToggle');
  const panel = document.getElementById('siteSettingsPanel');
  const backdrop = document.getElementById('siteSettingsBackdrop');
  const closeBtn = document.getElementById('siteSettingsClose');
  const resetBtn = document.getElementById('siteSettingsReset');
  const fontSelect = document.getElementById('umpaFontSelect');
  const themeInputs = document.querySelectorAll('input[name="umpa-theme"]');
  const fontInputs = document.querySelectorAll('input[name="umpa-font"]');

  if (!toggle || !panel) return;

  function normalizeTheme(theme) {
    if (VALID_THEMES.has(theme)) return theme;
    return LEGACY_THEMES[theme] || DEFAULT_THEME;
  }

  function applyTheme(theme) {
    const active = normalizeTheme(theme);
    document.documentElement.setAttribute('data-theme', active);
    localStorage.setItem(STORAGE_THEME, active);
    themeInputs.forEach((input) => {
      input.checked = input.value === active;
    });
  }

  function applyFont(font) {
    document.documentElement.setAttribute('data-font', font);
    localStorage.setItem(STORAGE_FONT, font);
    if (fontSelect) fontSelect.value = font;
    fontInputs.forEach((input) => {
      input.checked = input.value === font;
    });
  }

  function syncControlsFromStorage() {
    const storedTheme = localStorage.getItem(STORAGE_THEME) || DEFAULT_THEME;
    const theme = normalizeTheme(storedTheme);
    const font = localStorage.getItem(STORAGE_FONT) || DEFAULT_FONT;
    applyTheme(theme);
    applyFont(font);
  }

  function openPanel() {
    panel.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('site-settings-open');
    closeBtn?.focus();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('site-settings-open');
    setTimeout(() => {
      panel.hidden = true;
      backdrop.hidden = true;
    }, 320);
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  closeBtn?.addEventListener('click', closePanel);
  backdrop?.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  themeInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) applyTheme(input.value);
    });
  });

  fontInputs.forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) applyFont(input.value);
    });
  });

  resetBtn?.addEventListener('click', () => {
    applyTheme(DEFAULT_THEME);
    applyFont(DEFAULT_FONT);
  });

  syncControlsFromStorage();
})();
/* ===================== END SITE SETTINGS ===================== */

/* ===================== ADMIN LOGIN + CONTENT MANAGEMENT ===================== */
(function () {
  const AUTH_KEY = 'umpa-admin-auth';
  const USER_KEY = 'umpa-admin-user';
  const CONTENT_KEY = 'umpa-admin-content-v1';
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'umpa2026';
  const LOGIN_PAGE = 'admin-login.html';
  const DASH_PAGE = 'admin-dashboard.html';
  const CONTENT_TYPES = [
    'programs',
    'awareness-campaigns',
    'pro-life-clubs',
    'counseling-family-guidance',
    'natural-family-planning',
    'charity-outreach',
    'training-programs',
    'events',
    'gallery',
    'resources',
    'testimonials'
  ];
  const TYPE_LABELS = {
    programs: 'Programs',
    'awareness-campaigns': 'Awareness Campaigns',
    'pro-life-clubs': 'Pro-Life Clubs',
    'counseling-family-guidance': 'Counseling & Family Guidance',
    'natural-family-planning': 'Natural Family Planning',
    'charity-outreach': 'Charity Outreach',
    'training-programs': 'Training Programs',
    events: 'Events',
    gallery: 'Gallery',
    resources: 'Resources',
    testimonials: 'Testimonials'
  };
  const TYPE_ALIASES = {
    'prolife-clubs': 'pro-life-clubs',
    'pro_life_clubs': 'pro-life-clubs'
  };
  const PROGRAM_FEEDS = [
    { type: 'awareness-campaigns', sectionId: 'adminAwarenessCampaignsFeed', gridId: 'adminAwarenessCampaignsGrid' },
    { type: 'pro-life-clubs', sectionId: 'adminProLifeClubsFeed', gridId: 'adminProLifeClubsGrid' },
    { type: 'counseling-family-guidance', sectionId: 'adminCounselingFeed', gridId: 'adminCounselingGrid' },
    { type: 'natural-family-planning', sectionId: 'adminNfpFeed', gridId: 'adminNfpGrid' },
    { type: 'charity-outreach', sectionId: 'adminCharityFeed', gridId: 'adminCharityGrid' },
    { type: 'training-programs', sectionId: 'adminTrainingFeed', gridId: 'adminTrainingGrid' }
  ];

  function emptyStore() {
    return CONTENT_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {});
  }

  function normalizeType(type) {
    const value = String(type || '').trim();
    if (!value) return 'programs';
    return TYPE_ALIASES[value] || value;
  }

  function currentPage() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function getAuth() {
    return localStorage.getItem(AUTH_KEY) === '1';
  }

  function setAuth(isAuthed) {
    if (isAuthed) {
      localStorage.setItem(AUTH_KEY, '1');
      localStorage.setItem(USER_KEY, ADMIN_USER);
    } else {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  function getStore() {
    const fallback = emptyStore();
    try {
      const raw = localStorage.getItem(CONTENT_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      const store = emptyStore();
      CONTENT_TYPES.forEach((type) => {
        store[type] = Array.isArray(parsed[type]) ? parsed[type] : [];
      });

      // Backward compatibility: merge only alias keys into canonical buckets.
      Object.keys(TYPE_ALIASES).forEach((aliasType) => {
        if (!Array.isArray(parsed[aliasType]) || !parsed[aliasType].length) return;
        const canonical = TYPE_ALIASES[aliasType];
        if (!Array.isArray(store[canonical])) store[canonical] = [];
        store[canonical] = [...parsed[aliasType], ...store[canonical]];
      });

      // De-duplicate items to prevent growth from prior migrations.
      CONTENT_TYPES.forEach((type) => {
        const seen = new Set();
        store[type] = (store[type] || []).filter((item) => {
          const key = item?.id || `${item?.title || ''}|${item?.createdAt || ''}|${item?.description || ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
      return store;
    } catch (_) {
      return fallback;
    }
  }

  function setStore(store) {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(store));
  }

  function setLoginLinks() {
    document.querySelectorAll('.topbar-left a').forEach((a) => {
      const hasUserIcon = !!a.querySelector('.fa-user');
      const looksLogin = /login/i.test(a.textContent || '');
      if (hasUserIcon || looksLogin) {
        a.href = getAuth() ? DASH_PAGE : LOGIN_PAGE;
        a.textContent = getAuth() ? ' Admin Dashboard' : ' Login';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-user';
        a.prepend(icon);
      }
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result || ''), fileName: file.name, mime: file.type });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function compressImageDataUrl(dataUrl, maxWidth = 1400, quality = 0.82) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(1, img.width));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  async function saveStoreWithFallback(store, type) {
    try {
      setStore(store);
      return { ok: true, warning: '' };
    } catch (_) {}

    const list = store[type] || [];
    const latest = list[0];
    if (!latest) return { ok: false, warning: '' };

    if (latest.imageData) {
      latest.imageData = await compressImageDataUrl(latest.imageData, 1280, 0.78);
      try {
        setStore(store);
        return { ok: true, warning: 'Saved with a compressed image to fit browser storage.' };
      } catch (_) {}
    }

    if (latest.fileData && String(latest.fileData).startsWith('data:image/')) {
      latest.fileData = await compressImageDataUrl(latest.fileData, 1280, 0.78);
      try {
        setStore(store);
        return { ok: true, warning: 'Saved with a compressed image to fit browser storage.' };
      } catch (_) {}
    }

    // Final fallback: keep the content entry even if binary payload is too large.
    latest.imageData = '';
    latest.fileData = '';
    latest.fileName = '';
    try {
      setStore(store);
      return { ok: true, warning: 'Saved without the uploaded file. Use Image URL or Link URL for large files.' };
    } catch (_) {
      return { ok: false, warning: '' };
    }
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (_) {
      return iso || '';
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resourceDownloadHref(item) {
    if (item.fileData) return item.fileData;
    if (item.link) return item.link;
    return '';
  }

  function resourceDownloadFilename(item) {
    if (item.fileName) return item.fileName;
    const href = item.fileData || item.link || '';
    try {
      const name = new URL(href, window.location.href).pathname.split('/').pop();
      if (name && name !== '/') return decodeURIComponent(name);
    } catch (_) {}
    const base = (item.title || 'resource').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'resource';
    if (String(item.fileData || '').startsWith('data:application/pdf')) return `${base}.pdf`;
    return base;
  }

  const RESOURCES_PORTAL_CATEGORIES = {
    guides: 'Guides',
    pdf: 'PDF',
    clubs: 'Clubs & Schools',
    family: 'Family & NFP',
  };

  function normalizeResourcesCategory(item) {
    let key = String(item.category || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '');
    if (key === 'clubs-schools' || key === 'schools') return 'clubs';
    if (key === 'nfp' || key === 'family-nfp') return 'family';
    if (RESOURCES_PORTAL_CATEGORIES[key]) return key;
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const isPdf =
      String(item.fileData || '').includes('application/pdf') ||
      /\.pdf$/i.test(item.fileName || '') ||
      /pdf|brochure|printable|download/i.test(text);
    if (isPdf) return 'pdf';
    if (/club|school|youth|student|campus/i.test(text)) return 'clubs';
    if (/family|nfp|marriage|counsel|parent/i.test(text)) return 'family';
    if (/guide|handbook|toolkit|material/i.test(text)) return 'guides';
    return 'pdf';
  }

  function buildResourcesPortalCard(item) {
    const category = normalizeResourcesCategory(item);
    const label = RESOURCES_PORTAL_CATEGORIES[category];
    const href = resourceDownloadHref(item);
    const fileName = escapeHtml(resourceDownloadFilename(item));
    const title = escapeHtml(item.title || 'Untitled resource');
    const desc = item.description ? escapeHtml(item.description) : '';
    const thumb = item.imageData || item.imageUrl || '';
    const imgSrc = String(thumb).replace(/"/g, '&quot;');
    const isExternal = href && /^https?:\/\//i.test(href);
    const downloadAttr = href && !isExternal ? ` download="${fileName}"` : '';
    const link = href || '#';
    const mediaInner = thumb
      ? `<img src="${imgSrc}" alt="${title}" loading="lazy" />`
      : `<span class="resources-portal-card__icon" aria-hidden="true"><i class="fa-solid fa-file-pdf"></i></span>`;
    const linkLabel = href ? 'Download <span aria-hidden="true">→</span>' : 'View details <span aria-hidden="true">→</span>';

    return `
      <article class="events-portal-card resources-portal-card resources-portal-card--admin" data-category="${category}">
        <a href="${escapeHtml(link)}" class="events-portal-card__media${thumb ? '' : ' resources-portal-card__media--pdf'}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}${downloadAttr && href ? ` download="${fileName}"` : ''}>
          ${mediaInner}
          <span class="events-portal-card__badge">${escapeHtml(label)}</span>
        </a>
        <div class="events-portal-card__body">
          <h3>${title}</h3>
          ${desc ? `<p>${desc}</p>` : ''}
          <a href="${escapeHtml(link)}" class="events-portal-card__link"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}${downloadAttr && href ? ` download="${fileName}"` : ''}>${linkLabel}</a>
        </div>
      </article>
    `;
  }

  function applyResourcesPortalFilter(filter) {
    const grid = document.getElementById('resourcesPortalGrid');
    const emptyEl = document.getElementById('resourcesPortalEmpty');
    if (!grid) return;

    const cards = grid.querySelectorAll('.resources-portal-card');
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const show = filter === 'all' || cat === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function applyInvolvedSubportalFilter(grid, emptyEl, filter) {
    if (!grid) return;
    const cards = grid.querySelectorAll('.involved-subportal-card');
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const show = filter === 'all' || cat === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function initInvolvedSubportalFilters() {
    const grid = document.querySelector('[data-involved-portal-grid]');
    const filtersWrap = document.querySelector('[data-involved-portal-filters]');
    if (!grid || !filtersWrap) return;

    const filters = filtersWrap.querySelectorAll('.events-portal-filter');
    if (!filters.length) return;

    const emptyEl = grid.closest('.events-portal-inner')?.querySelector('.involved-subportal-empty');
    let activeFilter = 'all';

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyInvolvedSubportalFilter(grid, emptyEl, activeFilter);
      });
    });

    applyInvolvedSubportalFilter(grid, emptyEl, activeFilter);
  }

  function initResourcesPortalFilters() {
    const grid = document.getElementById('resourcesPortalGrid');
    const filters = document.querySelectorAll('.resources-portal-filters .events-portal-filter');
    if (!grid || !filters.length) return;

    let activeFilter = 'all';

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyResourcesPortalFilter(activeFilter);
      });
    });

    applyResourcesPortalFilter(activeFilter);
  }

  function renderResourcesFeed() {
    const portalGrid = document.getElementById('resourcesPortalGrid');
    if (portalGrid) {
      portalGrid.querySelectorAll('.resources-portal-card--admin').forEach((el) => el.remove());
      const items = (getStore().resources || []).slice().sort((a, b) =>
        String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      );
      if (items.length) {
        portalGrid.insertAdjacentHTML('beforeend', items.map((item) => buildResourcesPortalCard(item)).join(''));
      }
      const active = document.querySelector('.resources-portal-filters .events-portal-filter.is-active');
      applyResourcesPortalFilter(active ? active.getAttribute('data-filter') || 'all' : 'all');
      return;
    }

    const container = document.getElementById('adminResourcesGrid');
    const emptyEl = document.getElementById('resourcesDownloadsEmpty');
    if (!container) return;
    const items = getStore().resources || [];
    if (!items.length) {
      container.hidden = true;
      container.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    container.hidden = false;

    container.innerHTML = items
      .map((item) => {
        const href = resourceDownloadHref(item);
        const fileName = escapeHtml(resourceDownloadFilename(item));
        const title = escapeHtml(item.title || 'Untitled');
        const desc = item.description ? `<p>${escapeHtml(item.description)}</p>` : '';
        const thumb = item.imageData || item.imageUrl;
        const isExternal = href && /^https?:\/\//i.test(href);
        const downloadAttr = href && !isExternal ? ` download="${fileName}"` : '';
        const btn = href
          ? `<a class="resource-download-btn" href="${href}"${downloadAttr}${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}><i class="fa-solid fa-download" aria-hidden="true"></i> Download</a>`
          : '';
        const icon =
          thumb
            ? `<img class="resource-download-card__thumb" src="${thumb}" alt="" loading="lazy" />`
            : '<div class="resource-download-card__icon" aria-hidden="true"><i class="fa-solid fa-file-pdf"></i></div>';
        return `
          <article class="resource-download-card">
            ${icon}
            <div class="resource-download-card__body">
              <h3>${title}</h3>
              ${desc}
              ${btn}
            </div>
          </article>
        `;
      })
      .join('');
  }

  function getItemsForType(store, type) {
    const directItems = store[type] || [];
    if (type !== 'pro-life-clubs') return directItems;
    if (directItems.length) return directItems;

    // Fallback: older uploads may have been saved as "programs".
    return (store.programs || []).filter((item) => {
      const haystack = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      return /\bclub\b|\bclubs\b/.test(haystack);
    });
  }

  function renderFeed(type, containerId, sectionId) {
    const section = document.getElementById(sectionId);
    const container = document.getElementById(containerId);
    if (!section || !container) return;
    const items = getItemsForType(getStore(), type);
    if (!items.length) {
      section.hidden = true;
      container.innerHTML = '';
      return;
    }
    section.hidden = false;

    if (type === 'gallery') {
      container.innerHTML = items
        .map((item) => {
          const src = item.imageData || item.imageUrl || item.fileData || '';
          if (!src) return '';
          return `<a href="${src}" target="_blank" rel="noopener noreferrer" title="${item.title || 'Gallery image'}"><img src="${src}" alt="${item.title || 'Gallery image'}" loading="lazy" /></a>`;
        })
        .join('');
      return;
    }

    container.innerHTML = items
      .map((item) => {
        const image = item.imageData || item.imageUrl;
        const link = item.link || item.fileData || '#';
        const linkLabel = item.fileData ? 'Download' : 'Open';
        const eventDateLine =
          type === 'events' && item.eventDate
            ? `<p class="admin-feed-card__meta"><strong>Date:</strong> ${escapeHtml(item.eventDate)}</p>`
            : '';
        return `
          <article class="admin-feed-card">
            ${image ? `<img class="admin-feed-card__img" src="${image}" alt="${item.title || 'Admin item'}" loading="lazy" />` : ''}
            <div class="admin-feed-card__body">
              <h3>${item.title || 'Untitled'}</h3>
              ${eventDateLine}
              ${item.description ? `<p>${item.description}</p>` : ''}
              ${link && link !== '#' ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${linkLabel}</a>` : ''}
            </div>
          </article>
        `;
      })
      .join('');
  }

  const EVENTS_PORTAL_CATEGORIES = {
    conventions: 'Conventions',
    clubs: 'Pro-Life Clubs',
    outreach: 'Outreach',
    training: 'Training',
    media: 'Media',
  };

  const EVENTS_PORTAL_LEGACY_CATEGORIES = {
    academics: 'conventions',
    sports: 'outreach',
    'co-curricular': 'clubs',
    notices: 'outreach',
  };

  function normalizeEventsCategory(raw) {
    let key = String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '');
    if (EVENTS_PORTAL_LEGACY_CATEGORIES[key]) key = EVENTS_PORTAL_LEGACY_CATEGORIES[key];
    if (EVENTS_PORTAL_CATEGORIES[key]) return key;
    const text = String(raw || '');
    if (/convention|diocesan|gathering|annual|delegation|register/i.test(text)) return 'conventions';
    if (/radio|television|tv|media|maria|sapientia|talk\s*show/i.test(text)) return 'media';
    if (/training|workshop|ambassador|leader|formation|facilitat/i.test(text)) return 'training';
    if (/outreach|charity|awareness|campaign|community|counseling|flier|resource|nfp|family\s*planning/i.test(text)) return 'outreach';
    if (/club|youth|drama|peer|school|volunteer/i.test(text)) return 'clubs';
    return 'outreach';
  }

  function formatPortalDate(dateRaw) {
    const date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function buildEventsPortalCard(item) {
    const category = normalizeEventsCategory(item.category || item.title || item.description);
    const label = EVENTS_PORTAL_CATEGORIES[category];
    const image = item.imageData || item.imageUrl || 'imgs/p3.jpg';
    const link = item.link && item.link !== '#' ? item.link : 'upcoming-events.html';
    const dateRaw = item.eventDate || item.createdAt || '';
    const dateIso = dateRaw ? String(dateRaw).slice(0, 10) : '';
    const dateLabel = formatPortalDate(dateRaw);
    const title = escapeHtml(item.title || 'Untitled event');
    const desc = item.description ? escapeHtml(item.description) : '';
    const isExternal = /^https?:\/\//i.test(link);
    const imgSrc = String(image).replace(/"/g, '&quot;');

    return `
      <article class="events-portal-card events-portal-card--admin" data-category="${category}">
        <a href="${escapeHtml(link)}" class="events-portal-card__media"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <img src="${imgSrc}" alt="${title}" loading="lazy" />
          <span class="events-portal-card__badge">${escapeHtml(label)}</span>
        </a>
        <div class="events-portal-card__body">
          ${dateLabel ? `<time datetime="${escapeHtml(dateIso)}">${escapeHtml(dateLabel)}</time>` : ''}
          <h3>${title}</h3>
          ${desc ? `<p>${desc}</p>` : ''}
          <a href="${escapeHtml(link)}" class="events-portal-card__link"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>Read more <span aria-hidden="true">→</span></a>
        </div>
      </article>
    `;
  }

  function applyEventsPortalFilter(filter) {
    const grid = document.getElementById('eventsPortalGrid');
    const emptyEl = document.getElementById('eventsPortalEmpty');
    if (!grid) return;

    const cards = grid.querySelectorAll('.events-portal-card');
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const show = filter === 'all' || cat === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function initEventsPortalFilters() {
    const grid = document.getElementById('eventsPortalGrid');
    const filters = document.querySelectorAll('.events-portal-filter');
    if (!grid || !filters.length) return;

    let activeFilter = 'all';

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyEventsPortalFilter(activeFilter);
      });
    });

    applyEventsPortalFilter(activeFilter);
  }

  function renderEventsPortalFeed() {
    const grid = document.getElementById('eventsPortalGrid');
    if (!grid) return;

    grid.querySelectorAll('.events-portal-card--admin').forEach((el) => el.remove());

    const items = getItemsForType(getStore(), 'events');
    if (!items.length) return;

    const html = items
      .sort((a, b) => String(b.eventDate || b.createdAt || '').localeCompare(String(a.eventDate || a.createdAt || '')))
      .map((item) => buildEventsPortalCard(item))
      .join('');

    grid.insertAdjacentHTML('beforeend', html);

    const active = document.querySelector('.events-portal-filter.is-active');
    applyEventsPortalFilter(active ? active.getAttribute('data-filter') || 'all' : 'all');
  }

  const PROGRAMS_PORTAL_CATEGORIES = {
    awareness: 'Awareness',
    clubs: 'Pro-Life Clubs',
    counseling: 'Counseling',
    outreach: 'Outreach',
    training: 'Training',
    conventions: 'Conventions',
    media: 'Media',
  };

  function normalizeProgramsCategory(raw) {
    let key = String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z-]/g, '');
    if (key === 'nfp' || key === 'natural-family-planning' || key === 'family-planning') return 'counseling';
    if (key === 'charity' || key === 'charity-outreach') return 'outreach';
    if (key === 'pro-life-clubs' || key === 'clubs') return 'clubs';
    if (key === 'awareness-campaigns') return 'awareness';
    if (PROGRAMS_PORTAL_CATEGORIES[key]) return key;
    const text = String(raw || '');
    if (/convention|diocesan|annual\s*day/i.test(text)) return 'conventions';
    if (/radio|television|tv|media|maria|sapientia|talk\s*show/i.test(text)) return 'media';
    if (/training|workshop|ambassador|leader|formation|facilitat/i.test(text)) return 'training';
    if (/charity|outreach|vulnerable|kindness/i.test(text)) return 'outreach';
    if (/counsel|psychosocial|crisis|nfp|family\s*planning|pregnancy/i.test(text)) return 'counseling';
    if (/club|youth|drama|peer|school/i.test(text)) return 'clubs';
    if (/awareness|campaign|educative|moral/i.test(text)) return 'awareness';
    return 'awareness';
  }

  function buildProgramsPortalCard(item) {
    const category = normalizeProgramsCategory(item.category || item.title || item.description);
    const label = PROGRAMS_PORTAL_CATEGORIES[category];
    const image = item.imageData || item.imageUrl || 'imgs/p3.jpg';
    const link = item.link && item.link !== '#' ? item.link : 'programs.html';
    const title = escapeHtml(item.title || 'Program update');
    const desc = item.description ? escapeHtml(item.description) : '';
    const isExternal = /^https?:\/\//i.test(link);
    const imgSrc = String(image).replace(/"/g, '&quot;');

    return `
      <article class="events-portal-card events-portal-card--admin" data-category="${category}">
        <a href="${escapeHtml(link)}" class="events-portal-card__media"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <img src="${imgSrc}" alt="${title}" loading="lazy" />
          <span class="events-portal-card__badge">${escapeHtml(label)}</span>
        </a>
        <div class="events-portal-card__body">
          <h3>${title}</h3>
          ${desc ? `<p>${desc}</p>` : ''}
          <a href="${escapeHtml(link)}" class="events-portal-card__link"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>Learn more <span aria-hidden="true">→</span></a>
        </div>
      </article>
    `;
  }

  function applyProgramsPortalFilter(filter) {
    const grid = document.getElementById('programsPortalGrid');
    const emptyEl = document.getElementById('programsPortalEmpty');
    if (!grid) return;

    const cards = grid.querySelectorAll('.events-portal-card');
    let visible = 0;
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category') || '';
      const show = filter === 'all' || cat === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function initProgramsPortalFilters() {
    const grid = document.getElementById('programsPortalGrid');
    const filters = document.querySelectorAll('.programs-portal-filters .events-portal-filter');
    if (!grid || !filters.length) return;

    let activeFilter = 'all';

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter') || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyProgramsPortalFilter(activeFilter);
      });
    });

    applyProgramsPortalFilter(activeFilter);
  }

  function renderProgramsPortalFeed() {
    const grid = document.getElementById('programsPortalGrid');
    if (!grid) return;

    grid.querySelectorAll('.events-portal-card--admin').forEach((el) => el.remove());

    const items = getItemsForType(getStore(), 'programs');
    if (!items.length) return;

    const html = items
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .map((item) => buildProgramsPortalCard(item))
      .join('');

    grid.insertAdjacentHTML('beforeend', html);

    const active = document.querySelector('.programs-portal-filters .events-portal-filter.is-active');
    applyProgramsPortalFilter(active ? active.getAttribute('data-filter') || 'all' : 'all');
  }

  function initEventsCalendar() {
    const grid = document.getElementById('eventsCalendarGrid');
    const monthEl = document.getElementById('eventsCalendarMonth');
    const listEl = document.getElementById('eventsCalendarList');
    const prevBtn = document.getElementById('eventsCalendarPrev');
    const nextBtn = document.getElementById('eventsCalendarNext');
    const listTitle = document.getElementById('eventsCalendarListTitle');
    if (!grid || !monthEl || !listEl) return;

    const allEvents = (getStore().events || [])
      .map((item) => {
        const dateRaw = item.eventDate || item.date || item.createdAt || '';
        const date = new Date(dateRaw);
        if (Number.isNaN(date.getTime())) return null;
        return { ...item, date };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);

    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    let selectedDay = null;

    function dateKey(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function eventsForDay(y, m, d) {
      return allEvents.filter((item) =>
        item.date.getFullYear() === y &&
        item.date.getMonth() === m &&
        item.date.getDate() === d
      );
    }

    function renderList() {
      const monthItems = allEvents.filter((item) =>
        item.date.getFullYear() === currentYear && item.date.getMonth() === currentMonth
      );
      if (selectedDay) {
        const dayItems = eventsForDay(currentYear, currentMonth, selectedDay);
        if (listTitle) listTitle.textContent = `Events on ${String(selectedDay).padStart(2, '0')} ${new Date(currentYear, currentMonth, 1).toLocaleString(undefined, { month: 'short', year: 'numeric' })}`;
        listEl.innerHTML = dayItems.length
          ? dayItems
              .map((item) => `<p class="events-calendar__list-item"><strong>${item.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</strong><span>${escapeHtml(item.title || 'Untitled event')}</span></p>`)
              .join('')
          : '<p>No events on this day.</p>';
        return;
      }

      if (listTitle) listTitle.textContent = 'Events this month';
      listEl.innerHTML = monthItems.length
        ? monthItems
            .map((item) => `<p class="events-calendar__list-item"><strong>${item.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</strong><span>${escapeHtml(item.title || 'Untitled event')}</span></p>`)
            .join('')
        : '<p>No events in this month.</p>';
    }

    function renderGrid() {
      monthEl.textContent = new Date(currentYear, currentMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

      const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const eventDays = new Set(
        allEvents
          .filter((item) => item.date.getFullYear() === currentYear && item.date.getMonth() === currentMonth)
          .map((item) => item.date.getDate())
      );
      const cells = [];
      for (let i = 0; i < firstWeekday; i += 1) {
        cells.push('<span class="events-calendar__day is-empty" aria-hidden="true"></span>');
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const hasEvent = eventDays.has(day);
        const isSelected = selectedDay === day;
        cells.push(
          `<button type="button" class="events-calendar__day${hasEvent ? ' has-event' : ''}${isSelected ? ' is-selected' : ''}" data-calendar-day="${day}" data-calendar-key="${dateKey(currentYear, currentMonth, day)}" role="gridcell" aria-label="${day}${hasEvent ? ', event day' : ''}">${day}</button>`
        );
      }
      grid.innerHTML = cells.join('');
      renderList();
    }

    grid.addEventListener('click', (e) => {
      const dayBtn = e.target.closest('[data-calendar-day]');
      if (!dayBtn) return;
      const day = parseInt(dayBtn.getAttribute('data-calendar-day') || '', 10);
      if (!day) return;
      selectedDay = selectedDay === day ? null : day;
      renderGrid();
    });

    prevBtn?.addEventListener('click', () => {
      currentMonth -= 1;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
      }
      selectedDay = null;
      renderGrid();
    });

    nextBtn?.addEventListener('click', () => {
      currentMonth += 1;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
      }
      selectedDay = null;
      renderGrid();
    });

    renderGrid();
  }

  function renderDashboardItems() {
    const list = document.getElementById('adminItemsList');
    if (!list) return;
    const store = getStore();
    const all = Object.keys(store).flatMap((type) =>
      (store[type] || []).map((item) => ({ ...item, type }))
    );
    if (!all.length) {
      list.innerHTML = '<p>No saved items yet.</p>';
      return;
    }
    list.innerHTML = all
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .map((item) => {
        return `
          <article class="admin-item-card">
            <h4>${item.title || 'Untitled'}</h4>
            <p class="admin-item-meta">${TYPE_LABELS[item.type] || item.type} • ${fmtDate(item.createdAt)}</p>
            ${item.description ? `<p>${item.description}</p>` : ''}
            ${item.role ? `<p><strong>Role:</strong> ${escapeHtml(item.role)}</p>` : ''}
            <button
              type="button"
              class="admin-item-edit"
              data-admin-edit-id="${item.id || ''}"
              data-admin-edit-type="${item.type || ''}"
            >
              Edit
            </button>
            <button
              type="button"
              class="admin-item-delete"
              data-admin-delete-id="${item.id || ''}"
              data-admin-delete-type="${item.type || ''}"
            >
              Delete
            </button>
          </article>
        `;
      })
      .join('');
  }

  function deleteDashboardItem(type, id) {
    const normalizedType = normalizeType(type);
    if (!normalizedType || !id) return false;
    const store = getStore();
    const before = Array.isArray(store[normalizedType]) ? store[normalizedType].length : 0;
    store[normalizedType] = (store[normalizedType] || []).filter((item) => item && item.id !== id);
    const after = store[normalizedType].length;
    if (after === before) return false;
    setStore(store);
    return true;
  }

  function getDashboardItem(type, id) {
    const normalizedType = normalizeType(type);
    if (!normalizedType || !id) return null;
    const store = getStore();
    return (store[normalizedType] || []).find((item) => item && item.id === id) || null;
  }

  async function initDashboard() {
    if (!getAuth()) {
      window.location.href = LOGIN_PAGE;
      return;
    }
    const form = document.getElementById('adminContentForm');
    const status = document.getElementById('adminFormStatus');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const clearAllBtn = document.getElementById('adminClearAllBtn');
    const typeInput = document.getElementById('adminType');
    const titleInput = document.getElementById('adminTitle');
    const descriptionInput = document.getElementById('adminDescription');
    const linkInput = document.getElementById('adminLink');
    const imageUrlInput = document.getElementById('adminImageUrl');
    const eventDateInput = document.getElementById('adminEventDate');
    const eventDateWrap = document.getElementById('adminEventDateWrap');
    const roleInput = document.getElementById('adminRole');
    const roleWrap = document.getElementById('adminRoleWrap');
    const titleLabel = document.getElementById('adminTitleLabel');
    const descriptionLabel = document.getElementById('adminDescriptionLabel');
    const fileInput = document.getElementById('adminFile');
    const submitBtn = form?.querySelector('button[type="submit"]');
    let editingId = '';
    let editingType = '';
    if (!form) return;

    logoutBtn?.addEventListener('click', () => {
      setAuth(false);
      window.location.href = LOGIN_PAGE;
    });

    clearAllBtn?.addEventListener('click', () => {
      if (!window.confirm('Delete all admin uploaded content?')) return;
      setStore(emptyStore());
      renderDashboardItems();
    });

    function updateTypeFieldsVisibility() {
      const currentType = normalizeType(typeInput?.value);
      const isEvents = currentType === 'events';
      const isTestimonials = currentType === 'testimonials';
      if (eventDateWrap) eventDateWrap.style.display = isEvents ? '' : 'none';
      if (!isEvents && eventDateInput) eventDateInput.value = '';
      if (roleWrap) roleWrap.hidden = !isTestimonials;
      if (titleLabel) titleLabel.textContent = isTestimonials ? "Person's name" : 'Title';
      if (descriptionLabel) {
        descriptionLabel.textContent = isTestimonials ? 'Testimonial quote' : 'Description';
      }
      if (descriptionInput) {
        descriptionInput.placeholder = isTestimonials
          ? 'What they said about UMPA…'
          : 'Short summary...';
      }
      if (titleInput) {
        titleInput.placeholder = isTestimonials ? 'e.g. Sarah Nakato' : '';
      }
    }
    typeInput?.addEventListener('change', updateTypeFieldsVisibility);
    updateTypeFieldsVisibility();

    const itemsList = document.getElementById('adminItemsList');
    itemsList?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.admin-item-edit');
      if (editBtn) {
        const id = editBtn.getAttribute('data-admin-edit-id');
        const type = editBtn.getAttribute('data-admin-edit-type');
        const item = getDashboardItem(type, id);
        if (!item || !id || !type) return;
        editingId = id;
        editingType = normalizeType(type);
        if (typeInput) typeInput.value = editingType;
        if (titleInput) titleInput.value = item.title || '';
        if (descriptionInput) descriptionInput.value = item.description || '';
        if (linkInput) linkInput.value = item.link || '';
        if (imageUrlInput) imageUrlInput.value = item.imageUrl || '';
        if (eventDateInput) eventDateInput.value = item.eventDate || '';
        if (roleInput) roleInput.value = item.role || '';
        updateTypeFieldsVisibility();
        if (submitBtn) submitBtn.textContent = 'Update Content';
        status.hidden = false;
        status.className = 'admin-form-status ok';
        status.textContent = 'Editing item. Update fields and click "Update Content".';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const btn = e.target.closest('.admin-item-delete');
      if (!btn) return;
      const id = btn.getAttribute('data-admin-delete-id');
      const type = btn.getAttribute('data-admin-delete-type');
      if (!id || !type) return;
      if (!window.confirm('Delete this item?')) return;
      const removed = deleteDashboardItem(type, id);
      status.hidden = false;
      status.className = removed ? 'admin-form-status ok' : 'admin-form-status err';
      status.textContent = removed ? 'Item deleted successfully.' : 'Could not delete this item.';
      renderDashboardItems();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedType = document.getElementById('adminType').value;
      const type = normalizeType(selectedType);
      const title = document.getElementById('adminTitle').value.trim();
      const description = document.getElementById('adminDescription').value.trim();
      const link = document.getElementById('adminLink').value.trim();
      const imageUrl = document.getElementById('adminImageUrl').value.trim();
      const eventDate = (eventDateInput?.value || '').trim();
      const role = (roleInput?.value || '').trim();
      const file = fileInput?.files?.[0];

      let fileData = '';
      let imageData = '';
      let fileName = '';
      if (file) {
        try {
          const data = await fileToDataUrl(file);
          fileName = data.fileName;
          if (data.mime.startsWith('image/')) imageData = data.dataUrl;
          else fileData = data.dataUrl;
        } catch (_) {
          status.hidden = false;
          status.className = 'admin-form-status err';
          status.textContent = 'Could not read uploaded file.';
          return;
        }
      }

      const store = getStore();
      store[type] = store[type] || [];

      if (editingId && editingType) {
        // Keep existing file/image data unless user uploads a new file.
        let existing = null;
        if (editingType !== type) {
          existing = (store[editingType] || []).find((item) => item && item.id === editingId) || null;
          store[editingType] = (store[editingType] || []).filter((item) => item && item.id !== editingId);
        } else {
          existing = (store[type] || []).find((item) => item && item.id === editingId) || null;
        }

        const payload = {
          id: editingId,
          title,
          description,
          link: type === 'testimonials' ? '' : link,
          role: type === 'testimonials' ? role : (existing?.role || ''),
          eventDate: type === 'events' ? eventDate : '',
          imageUrl,
          imageData: imageData || (existing?.imageData || ''),
          fileData: fileData || (existing?.fileData || ''),
          fileName: fileName || (existing?.fileName || ''),
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        store[type] = (store[type] || []).filter((item) => item && item.id !== editingId);
        store[type].unshift(payload);
      } else {
        store[type].unshift({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          description,
          link: type === 'testimonials' ? '' : link,
          role: type === 'testimonials' ? role : '',
          eventDate: type === 'events' ? eventDate : '',
          imageUrl,
          imageData,
          fileData,
          fileName,
          createdAt: new Date().toISOString()
        });
      }
      const saveResult = await saveStoreWithFallback(store, type);
      if (!saveResult.ok) {
        status.hidden = false;
        status.className = 'admin-form-status err';
        status.textContent = 'Could not save content. Try a smaller image or use an image URL.';
        return;
      }
      form.reset();
      editingId = '';
      editingType = '';
      if (submitBtn) submitBtn.textContent = 'Save Content';
      status.hidden = false;
      status.className = 'admin-form-status ok';
      status.textContent = saveResult.warning || `Saved successfully to ${TYPE_LABELS[type] || type}.`;
      renderDashboardItems();
    });

    renderDashboardItems();
  }

  function initLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;
    if (getAuth()) {
      window.location.href = DASH_PAGE;
      return;
    }
    const error = document.getElementById('adminLoginError');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = (document.getElementById('adminUsername').value || '').trim();
      const password = document.getElementById('adminPassword').value || '';
      const ok = username === ADMIN_USER && password === ADMIN_PASS;
      if (!ok) {
        if (error) error.hidden = false;
        return;
      }
      setAuth(true);
      window.location.href = DASH_PAGE;
    });
  }

  function applyGalleryPortalFilter(filter) {
    const grid = document.getElementById('galleryPortalGrid');
    const emptyEl = document.getElementById('galleryPortalEmpty');
    const countEl = document.getElementById('galleryPortalCount');
    if (!grid) return;

    const items = grid.querySelectorAll('.gallery-portal-item');
    let visible = 0;
    items.forEach((item) => {
      const cat = item.getAttribute('data-category') || 'outreach';
      const show = filter === 'all' || cat === filter;
      item.hidden = !show;
      if (show) visible += 1;
    });

    if (emptyEl) emptyEl.hidden = visible > 0;
    if (countEl) {
      countEl.textContent =
        visible === 1 ? 'Showing 1 photo' : 'Showing ' + visible + ' photos';
    }
  }

  function initGalleryPortalFilters() {
    const grid = document.getElementById('galleryPortalGrid');
    const filters = document.querySelectorAll('.gallery-portal-filters .events-portal-filter');
    if (!grid || !filters.length) return;

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';
        filters.forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        applyGalleryPortalFilter(filter);
      });
    });

    applyGalleryPortalFilter('all');
  }

  function renderGalleryPortalFeed() {
    const grid = document.getElementById('galleryPortalGrid');
    if (!grid) return;

    grid.querySelectorAll('.gallery-portal-item--admin').forEach((el) => el.remove());

    const items = getItemsForType(getStore(), 'gallery');
    items.forEach((item) => {
      const src = item.imageData || item.imageUrl || item.fileData || '';
      if (!src) return;
      const title = escapeHtml(item.title || 'UMPA gallery photo');
      const cat = normalizeEventsCategory(item.category || item.description || 'outreach');
      const galleryCat = cat === 'clubs' ? 'clubs' : 'outreach';
      const anchor = document.createElement('a');
      anchor.className = 'gallery-portal-item gallery-portal-item--admin';
      anchor.href = src;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.setAttribute('data-category', galleryCat);
      anchor.title = item.title || 'Gallery image';
      const img = document.createElement('img');
      img.src = src;
      img.alt = item.title || 'UMPA gallery photo';
      img.loading = 'lazy';
      anchor.appendChild(img);
      grid.appendChild(anchor);
    });

    const active = document.querySelector('.gallery-portal-filters .events-portal-filter.is-active');
    applyGalleryPortalFilter(active ? active.getAttribute('data-filter') || 'all' : 'all');
  }

  function getTestimonialInitials(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getTestimonialRole(item) {
    return String(item.role || item.category || '').trim();
  }

  function buildJclTestimonialCard(item) {
    const name = escapeHtml(item.title || 'Anonymous');
    const role = escapeHtml(getTestimonialRole(item));
    const quote = escapeHtml(item.description || '');
    const image = item.imageData || item.imageUrl || '';
    const initials = escapeHtml(getTestimonialInitials(item.title));
    const imgSrc = String(image).replace(/"/g, '&quot;');
    const avatar = image
      ? `<div class="jcl-testimonial-avatar jcl-testimonial-avatar--photo" aria-hidden="true"><img src="${imgSrc}" alt="" loading="lazy" /></div>`
      : `<div class="jcl-testimonial-avatar" aria-hidden="true">${initials}</div>`;

    return `
      <article class="jcl-testimonial-card">
        <div class="jcl-testimonial-card__accent" aria-hidden="true"></div>
        <span class="jcl-testimonial-quote-icon" aria-hidden="true"><i class="fa-solid fa-quote-left"></i></span>
        <blockquote class="jcl-testimonial-quote">
          <p>${quote}</p>
        </blockquote>
        <footer class="jcl-testimonial-footer">
          ${avatar}
          <div class="jcl-testimonial-meta">
            <cite>${name}</cite>
            ${role ? `<span class="jcl-testimonial-role">${role}</span>` : ''}
          </div>
        </footer>
      </article>
    `;
  }

  function buildHomeTestimonialCard(item) {
    const name = escapeHtml(item.title || 'Anonymous');
    const role = escapeHtml(getTestimonialRole(item));
    const raw = String(item.description || '').trim();
    const paragraphs = raw.split(/\n\n+/).filter(Boolean);
    const body = paragraphs.length
      ? paragraphs.map((p) => `<p>${escapeHtml(p.trim())}</p>`).join('')
      : `<p>${escapeHtml(raw)}</p>`;
    const isLong = paragraphs.length > 1 || raw.length > 280;
    const image = item.imageData || item.imageUrl || '';
    const initials = escapeHtml(getTestimonialInitials(item.title));
    const imgSrc = String(image).replace(/"/g, '&quot;');
    const avatar = image
      ? `<div class="testimonial-avatar" aria-hidden="true"><img src="${imgSrc}" alt="" loading="lazy" /></div>`
      : `<div class="testimonial-avatar testimonial-avatar--initials" aria-hidden="true">${initials}</div>`;
    const stars = `
      <div class="testimonial-stars" aria-label="5 out of 5 stars">
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        <i class="fa-solid fa-star" aria-hidden="true"></i>
      </div>`;

    return `
      <article class="testimonial-card${isLong ? ' testimonial-card--long' : ''}">
        <span class="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
        ${stars}
        <blockquote class="testimonial-text">${body}</blockquote>
        <footer class="testimonial-author">
          ${avatar}
          <div>
            <cite class="testimonial-name">${name}</cite>
            ${role ? `<span class="testimonial-role">${role}</span>` : ''}
          </div>
        </footer>
      </article>
    `;
  }

  function renderTestimonials() {
    const items = (getStore().testimonials || []).slice().sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );

    const jclSection = document.querySelector('.jcl-testimonial-section');
    const jclList = document.getElementById('jclTestimonialsList');
    if (jclSection) {
      jclSection.hidden = items.length === 0;
    }
    if (jclList) {
      jclList.innerHTML = items.length
        ? items.map((item) => buildJclTestimonialCard(item)).join('')
        : '';
    }

    const homeSection = document.querySelector('.testimonials-section');
    const track = document.getElementById('testimonialsTrack');
    if (homeSection) {
      homeSection.hidden = items.length === 0;
    }
    if (track) {
      if (!items.length) {
        track.innerHTML = '';
      } else {
        track.innerHTML = items.map((item) => buildHomeTestimonialCard(item)).join('');
      }
      if (typeof initTestimonialsCarousel === 'function') {
        initTestimonialsCarousel();
      }
    }
  }

  function initPublicFeeds() {
    if (document.getElementById('programsPortalGrid')) {
      renderProgramsPortalFeed();
      initProgramsPortalFilters();
    } else {
      renderFeed('programs', 'adminProgramsGrid', 'adminProgramsFeed');
    }
    PROGRAM_FEEDS.forEach(({ type, sectionId, gridId }) => renderFeed(type, gridId, sectionId));
    renderEventsPortalFeed();
    initEventsPortalFilters();
    initEventsCalendar();
    renderResourcesFeed();
    if (document.getElementById('resourcesPortalGrid')) {
      initResourcesPortalFilters();
    }
    initInvolvedSubportalFilters();
    if (document.getElementById('galleryPortalGrid')) {
      renderGalleryPortalFeed();
      initGalleryPortalFilters();
    } else {
      renderFeed('gallery', 'adminGalleryGrid', 'adminGalleryFeed');
    }
    renderTestimonials();
  }

  setLoginLinks();
  initPublicFeeds();

  const page = currentPage();
  if (page === 'admin-login.html') initLogin();
  if (page === 'admin-dashboard.html') initDashboard();
})();
/* ===================== END ADMIN LOGIN + CONTENT MANAGEMENT ===================== */
