// Lead Now Foundation · shared behaviour
(function () {
  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  }

  // Home slideshow
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('.slide-dots button');
  if (slides.length > 1) {
    var current = 0, timer;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go = function (n) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    };
    var start = function () { if (!reduce) timer = setInterval(function () { go(current + 1); }, 5000); };
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { clearInterval(timer); go(i); start(); });
    });
    var prev = document.querySelector('.slide-arrow.prev'), next = document.querySelector('.slide-arrow.next');
    if (prev) prev.addEventListener('click', function () { clearInterval(timer); go(current - 1); start(); });
    if (next) next.addEventListener('click', function () { clearInterval(timer); go(current + 1); start(); });
    start();
  }

  // Get Involved form → Google Sheets (Apps Script web app)
  var form = document.getElementById('involveForm');
  if (form) {
    var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbypnhzklb7Ql16qgBgRul93BTVOJc9x0lvuekJSwSrVZZQq3MZwitKB4YUOjwD9EVOPCA/exec';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var label = btn.querySelector('.label');
      var status = document.getElementById('formStatus');
      btn.disabled = true; label.textContent = 'Sending';
      status.className = 'form-status'; status.textContent = '';
      var params = new URLSearchParams();
      ['name', 'email', 'phone', 'city', 'interest', 'message'].forEach(function (k) {
        params.append(k, form.elements[k].value);
      });
      params.append('submitted', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      fetch(SHEETS_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }).then(function () {
        status.className = 'form-status ok';
        status.textContent = 'Thank you. Your message has reached us and we will reply within 3 to 5 working days.';
        form.reset();
      }).catch(function () {
        status.className = 'form-status err';
        status.textContent = 'Your message could not be sent. Please check your connection, or write to info@leadnowfoundation.org.';
      }).finally(function () {
        btn.disabled = false; label.textContent = 'Send message';
      });
    });
  }
  // Circular Theory of Change: link rings and key items
  var orbit = document.querySelector('.orbit');
  if (orbit) {
    var items = orbit.querySelectorAll('[data-stage]');
    var setActive = function (k) {
      orbit.setAttribute('data-active', k || '');
      items.forEach(function (el) { el.classList.toggle('on', !!k && el.getAttribute('data-stage') === k); });
    };
    items.forEach(function (el) {
      var k = el.getAttribute('data-stage');
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        setActive(orbit.getAttribute('data-active') === k ? '' : k);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
        if (e.key === 'Escape') setActive('');
      });
    });
    document.addEventListener('click', function (e) { if (!orbit.contains(e.target)) setActive(''); });
  }
})();
