/* Shared behaviour for every page. Each block is guarded, so a page only runs what it contains. */
(function () {
  'use strict';

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('mobile-menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var menuIcon = menuBtn.querySelector('i');
    menuBtn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
      menuIcon.className = menu.classList.contains('hidden') ? 'fas fa-bars text-gray-600' : 'fas fa-times text-gray-600';
    });
    document.querySelectorAll('.mobile-nav-link').forEach(function (l) {
      l.addEventListener('click', function () {
        menu.classList.add('hidden');
        menuIcon.className = 'fas fa-bars text-gray-600';
      });
    });
  }

  /* ---------- theme (dark by default, remembered) ---------- */
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    var body = document.body;
    var themeIcon = themeToggle.querySelector('i');
    var themeLabel = document.querySelector('.theme-label');
    var applyTheme = function (mode) {
      if (mode === 'light') {
        body.classList.remove('dark-mode');
        themeIcon.className = 'fas fa-moon text-gray-600 text-xs';
        if (themeLabel) themeLabel.textContent = 'Light';
      } else {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun text-yellow-400 text-xs';
        if (themeLabel) themeLabel.textContent = 'Dark';
      }
    };
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    applyTheme(saved === 'light' ? 'light' : 'dark');
    themeToggle.addEventListener('click', function () {
      var goingLight = body.classList.contains('dark-mode');
      applyTheme(goingLight ? 'light' : 'dark');
      try { localStorage.setItem('theme', goingLight ? 'light' : 'dark'); } catch (e) {}
    });
  }

  /* ---------- smooth in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ---------- scroll-in animation ---------- */
  var animEls = document.querySelectorAll('.scroll-animate');
  if (animEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    animEls.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      animEls.forEach(function (el, i) {
        setTimeout(function () { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('visible'); }, i * 60);
      });
    });
  }

  /* ---------- back to top ---------- */
  var topBtn = document.getElementById('back-to-top');
  if (topBtn) {
    var onScroll = function () { topBtn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.9); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- hero: name letters + typed.js (home only) ---------- */
  var nameEl = document.querySelector('.name-animation');
  if (nameEl) {
    var txt = nameEl.textContent;
    nameEl.innerHTML = '';
    txt.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = (i * 0.08) + 's';
      nameEl.appendChild(s);
    });
  }
  if (window.Typed && document.querySelector('.typed')) {
    new Typed('.typed', {
      strings: ['Analytics and BI Engineer', 'Analytics Engineer', 'Analytics Professional', 'Analytics Engineer in BI'],
      typeSpeed: 100, backSpeed: 50, backDelay: 2000, loop: true, showCursor: true, cursorChar: '|'
    });
  }

  /* ---------- live embeds ---------- */
  function mountEmbed(frame, src, title) {
    var ratio = frame.querySelector('.embed-ratio');
    ratio.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title || 'Live Power BI report';
    iframe.setAttribute('allowfullscreen', 'true');
    ratio.appendChild(iframe);
    var fs = document.createElement('button');
    fs.className = 'embed-fullscreen-btn';
    fs.setAttribute('aria-label', 'View fullscreen');
    fs.innerHTML = '<i class="fas fa-expand"></i>';
    fs.addEventListener('click', function () {
      if (ratio.requestFullscreen) ratio.requestFullscreen();
      else if (ratio.webkitRequestFullscreen) ratio.webkitRequestFullscreen();
    });
    ratio.appendChild(fs);
  }
  function showPlaceholder(frame) {
    frame.querySelector('.embed-ratio').innerHTML =
      '<div class="embed-placeholder"><div class="embed-spinner"></div><span>Loading live report&hellip;</span></div>';
  }
  // Lazy embeds on any page (home featured report)
  document.querySelectorAll('.embed-frame[data-src]').forEach(function (frame) {
    var lazy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          mountEmbed(frame, frame.getAttribute('data-src'), frame.getAttribute('data-title'));
          lazy.unobserve(frame);
        }
      });
    }, { rootMargin: '200px' });
    lazy.observe(frame);
  });

  /* ---------- challenges viewer ---------- */
  var R = window.REPORTS;
  var viewer = document.getElementById('viewer');
  if (R && viewer) {
    var frame = document.getElementById('v-frame');
    var pillClass = { winner: 'pill-winner', runner: 'pill-runnerup', part: 'pill-live', pending: 'pill-pending' };
    var pillIcon = { winner: 'fa-trophy', runner: 'fa-medal', part: 'fa-circle', pending: 'fa-hourglass-half' };
    var current = null;

    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };

    var show = function (id, push) {
      var r = R[id];
      if (!r) return;
      current = id;
      var pill = document.getElementById('v-pill');
      pill.className = pillClass[r.status];
      pill.innerHTML = '<i class="fas ' + pillIcon[r.status] + ' mr-1"' + (r.status === 'part' ? ' style="font-size:6px"' : '') + '></i>' + esc(r.pill);
      document.getElementById('v-series').textContent = r.series;
      document.getElementById('v-title').textContent = r.title;
      document.getElementById('v-sub').textContent = r.sub;
      document.getElementById('v-open').href = r.url;
      var chips = document.getElementById('v-chips');
      chips.innerHTML = (r.chips || []).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
      var note = document.getElementById('v-note');
      note.textContent = r.note || '';
      note.style.display = r.note ? '' : 'none';
      var sqlBox = document.getElementById('v-sql');
      if (sqlBox) {
        sqlBox.style.display = r.sql ? '' : 'none';
        sqlBox.open = false;
        document.getElementById('v-sql-code').textContent = r.sql || '';
      }
      showPlaceholder(frame);
      mountEmbed(frame, r.url, r.title);
      document.querySelectorAll('.thumb').forEach(function (t) {
        var on = t.getAttribute('data-id') === id;
        t.classList.toggle('active', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (push) {
        try { history.replaceState(null, '', '?r=' + id); } catch (e) {}
      }
    };

    document.querySelectorAll('.thumb').forEach(function (t) {
      t.addEventListener('click', function () {
        show(t.getAttribute('data-id'), true);
        viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var copyBtn = document.getElementById('v-copy');
    copyBtn.addEventListener('click', function () {
      var link = location.origin + location.pathname + '?r=' + current;
      var done = function () {
        var old = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>Link copied';
        setTimeout(function () { copyBtn.innerHTML = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(done, function () { window.prompt('Copy this link', link); });
      } else {
        window.prompt('Copy this link', link);
      }
    });

    window.addEventListener('hashchange', function () {
      var id = location.hash.replace('#', '');
      if (R[id] && id !== current) show(id, false);
    });

    // Deep link: ?r=jul (survives LinkedIn and other sites that drop #fragments) or #jul
    var qid = '';
    try { qid = new URLSearchParams(location.search).get('r') || ''; } catch (e) {}
    var hid = location.hash.replace('#', '');
    var start = R[qid] ? qid : (R[hid] ? hid : window.DEFAULT_REPORT);
    show(start, false);
  }

  /* ---------- case studies: filters, expand, tabs ---------- */
  var chipsEls = document.querySelectorAll('.filter-chip');
  chipsEls.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chipsEls.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var f = chip.getAttribute('data-filter');
      document.querySelectorAll('[data-tech]').forEach(function (card) {
        var techs = (card.getAttribute('data-tech') || '').split(/\s+/);
        card.style.display = (f === 'all' || techs.indexOf(f) > -1) ? '' : 'none';
      });
    });
  });
  window.toggleCaseStudy = function (btn) {
    var details = btn.nextElementSibling;
    var wasHidden = details.classList.contains('hidden');
    details.classList.toggle('hidden');
    details.classList.toggle('show');
    btn.innerHTML = wasHidden
      ? '<i class="fas fa-chevron-down mr-2 text-xs" style="transform:rotate(180deg)"></i>Close case study'
      : '<i class="fas fa-chevron-down mr-2 text-xs"></i>Open case study';
  };
  document.querySelectorAll('.cs-tab-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var wrap = b.closest('.project-details');
      var tab = b.getAttribute('data-tab');
      wrap.querySelectorAll('.cs-tab-btn').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      wrap.querySelectorAll('.cs-tab-panel').forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === tab); });
    });
  });
})();
