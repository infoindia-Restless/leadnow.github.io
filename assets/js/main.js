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
      var host = location.hostname;
      if (!/leadnowfoundation\.org$|github\.io$|^localhost$|^127\.0\.0\.1$/.test(host)) {
        var st = document.getElementById('formStatus');
        st.className = 'form-status ok';
        st.textContent = 'This is a preview, so messages are not sent from here. On leadnowfoundation.org this form sends your message to the team.';
        return;
      }
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

  // Lead Forward: a beam sweeps round the wheel; each part lights up as it passes
  var stage = document.querySelector('.eco-stage');
  if (stage) {
    var notes = Array.prototype.slice.call(stage.querySelectorAll('.eco-note'));
    var beam = stage.querySelector('.beam');
    // sectors in degrees, clockwise from 3 o'clock (SVG convention); centre of each sector used for jumps
    var sectors = [
      { k: 'yrc', from: -30, to: 40 },
      { k: 'parent', from: 40, to: 110 },
      { k: 'comm', from: 110, to: 155 },
      { k: 'school', from: 155, to: 215 },
      { k: 'partner', from: 215, to: 330 }
    ];
    var PERIOD = 18000; // ms per full turn
    var angle = -20, last = null, paused = false, current = '';
    var keyFor = function (deg) {
      var d = ((deg % 360) + 360) % 360; if (d >= 330) d -= 360;
      for (var i = 0; i < sectors.length; i++) if (d >= sectors[i].from && d < sectors[i].to) return sectors[i].k;
      return 'yrc';
    };
    var setActive = function (k) {
      if (k === current) return; current = k;
      stage.setAttribute('data-active', k);
      notes.forEach(function (n) { var on = n.getAttribute('data-k') === k; n.classList.toggle('on', on); n.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    };
    var draw = function () {
      if (beam) beam.setAttribute('transform', 'rotate(' + (angle + 23).toFixed(2) + ' 320 290)');
      setActive(keyFor(angle));
    };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tick = function (t) {
      if (last !== null && !paused) angle += (t - last) * 360 / PERIOD;
      last = t; draw(); requestAnimationFrame(tick);
    };
    var jump = function (k) {
      for (var i = 0; i < sectors.length; i++) if (sectors[i].k === k) { angle = (sectors[i].from + sectors[i].to) / 2 - 10; break; }
      draw();
    };
    stage.addEventListener('mouseenter', function () { paused = true; });
    stage.addEventListener('mouseleave', function () { paused = false; });
    stage.addEventListener('focusin', function () { paused = true; });
    stage.addEventListener('focusout', function () { paused = false; });
    notes.forEach(function (n) { n.addEventListener('click', function () { jump(n.getAttribute('data-k')); }); });
    stage.querySelectorAll('.eg').forEach(function (g) { g.addEventListener('click', function () { jump(g.getAttribute('data-k')); }); });
    if (reduce) {
      var order = sectors.map(function (x) { return x.k; }), i = 0;
      if (beam) beam.style.display = 'none';
      setActive(order[0]);
      setInterval(function () { if (!paused) { i = (i + 1) % order.length; setActive(order[i]); } }, 4000);
    } else {
      draw(); requestAnimationFrame(tick);
    }
  }

  // About: vision and mission reveal word by word, then a highlighter sweeps the key phrase
  var vm = document.querySelector('[data-reveal]');
  var reduceRv = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (vm && !reduceRv && 'IntersectionObserver' in window) {
    var rows = Array.prototype.slice.call(vm.querySelectorAll('.vm-row'));
    var wrapWords = function (node, counter) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = part;
            w.style.setProperty('--i', counter.n++); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { wrapWords(child, counter); }
      });
    };
    var delay = 0;
    rows.forEach(function (row) {
      var text = row.querySelector('.vm-text');
      var counter = { n: 0 };
      wrapWords(text, counter);
      row.style.setProperty('--d0', delay + 'ms');
      var hl = text.querySelector('mark.hl');
      var doneAt = delay + counter.n * 45 + 500;
      if (hl) hl.style.setProperty('--hd', doneAt + 'ms');
      delay = doneAt + 500;
    });
    vm.classList.add('rv-on', 'rv-prep');
    void vm.offsetWidth;
    vm.classList.remove('rv-prep');
    var ioRv = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      ioRv.disconnect();
      requestAnimationFrame(function () { rows.forEach(function (r) { r.classList.add('in'); }); });
    }, { threshold: 0.3 });
    ioRv.observe(vm);
  }

  // About: highlighter sweeps under each value name
  var vlist = document.querySelector('[data-vhl]');
  var reduceV = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (vlist && !reduceV && 'IntersectionObserver' in window) {
    vlist.classList.add('vhl-on', 'vhl-prep'); void vlist.offsetWidth; vlist.classList.remove('vhl-prep');
    var ioV = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      ioV.disconnect(); vlist.classList.add('in');
    }, { threshold: 0.25 });
    ioV.observe(vlist);
  }

  // Highlighter sweep on headings marked data-sweep
  var reduceS = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceS && 'IntersectionObserver' in window) {
    document.querySelectorAll('[data-sweep]').forEach(function (m) {
      m.classList.add('sw-on', 'sw-prep'); void m.offsetWidth; m.classList.remove('sw-prep');
      var o = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { o.disconnect(); m.classList.add('in'); }
      }, { threshold: 0.6 });
      o.observe(m);
    });
  }

  // Home headline: the last word deletes itself and types the next, on a loop
  var rot = document.querySelector('em.rot[data-words]');
  var reduceR = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rot && !reduceR) {
    var words = rot.getAttribute('data-words').split('|');
    var wi = 0, text = words[0];
    var caretR = document.createElement('span'); caretR.className = 'rcaret';
    var render = function () { rot.textContent = text; rot.appendChild(caretR); };
    render();
    var erase = function () {
      if (text.length) { text = text.slice(0, -1); render(); setTimeout(erase, 45); }
      else { wi = (wi + 1) % words.length; setTimeout(type, 250); }
    };
    var type = function () {
      var target = words[wi];
      if (text.length < target.length) { text = target.slice(0, text.length + 1); render(); setTimeout(type, 85); }
      else setTimeout(erase, 2200);
    };
    setTimeout(erase, 2600);
  }
})();
