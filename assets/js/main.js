/* EZ Racing — shared site script */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header scroll state ---------- */
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var onScrollHdr = function () { hdr.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScrollHdr, { passive: true });
    onScrollHdr();
  }

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('navlinks');
  if (burger && nav) {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'navlinks');
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal (staggered) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('in'); }, (i % 6) * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Expandable detail panels ---------- */
  document.querySelectorAll('[data-detail]').forEach(function (btn) {
    var panel = document.getElementById(btn.dataset.detail);
    if (!panel) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', btn.dataset.detail);
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = panel.classList.toggle('open');
      btn.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && !reduceMotion) {
        setTimeout(function () {
          panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 140);
      }
    });
  });

  /* ---------- Animated stat counters ---------- */
  var nums = document.querySelectorAll('.stat .num');
  if (nums.length && !reduceMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var raw = el.textContent.trim();
        var m = raw.match(/^(\d+)(.*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10), suffix = m[2] || '';
        var t0 = null, dur = 1200;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { cio.observe(n); });
  }

  /* ---------- Race kart driven by scroll (track strips) ---------- */
  var strips = document.querySelectorAll('.track-strip');
  if (strips.length && !reduceMotion) {
    var update = function () {
      var vh = window.innerHeight;
      strips.forEach(function (strip) {
        var kart = strip.querySelector('.strip-kart');
        if (!kart) return;
        var r = strip.getBoundingClientRect();
        // progress 0 → 1 as the strip travels from bottom to top of viewport
        var p = (vh - r.top) / (vh + r.height);
        p = Math.max(0, Math.min(1, p));
        var kw = kart.getBoundingClientRect().width || 120;
        var travel = strip.offsetWidth - kw - 8;
        kart.style.transform = 'translateX(' + (travel * p) + 'px)';
        kart.classList.toggle('moving', p > 0.02 && p < 0.98);
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Contact page: preselect interest + fake submit ---------- */
  var sel = document.getElementById('interest');
  if (sel) {
    var t = new URLSearchParams(location.search).get('type');
    if (t && Array.prototype.some.call(sel.options, function (o) { return o.value === t; })) sel.value = t;
  }
  var cf = document.getElementById('contactForm');
  if (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      cf.style.display = 'none';
      var ok = document.getElementById('formSuccess');
      if (ok) ok.classList.add('show');
      var card = document.querySelector('.form-card');
      if (card) window.scrollTo({ top: card.offsetTop - 120, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
