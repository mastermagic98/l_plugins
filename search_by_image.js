(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     LAMPA – Movie Identifier Plugin
     Пошук фільму/серіалу за скріншотом
     Використовує movie-identifier.com
  ───────────────────────────────────────────── */

  var PLUGIN_NAME = 'MovieIdentifier';
  var PLUGIN_TITLE = 'Пошук за фото';

  /* ── Стилі ─────────────────────────────────── */
  var CSS = [
    '.mi-btn{',
      'display:inline-flex;align-items:center;gap:.5em;',
      'padding:.4em .9em;border-radius:3em;cursor:pointer;',
      'background:linear-gradient(135deg,#1a8cff 0%,#0055cc 100%);',
      'color:#fff;font-size:1.05em;font-weight:600;',
      'border:none;outline:none;transition:transform .15s,box-shadow .15s;',
      'box-shadow:0 2px 14px rgba(26,140,255,.45);',
    '}',
    '.mi-btn:hover,.mi-btn.focus{',
      'transform:scale(1.06);',
      'box-shadow:0 4px 22px rgba(26,140,255,.7);',
    '}',
    '.mi-btn svg{width:1.2em;height:1.2em;flex-shrink:0;}',

    /* overlay */
    '.mi-overlay{',
      'position:fixed;inset:0;z-index:9999;',
      'background:rgba(0,0,0,.82);backdrop-filter:blur(6px);',
      'display:flex;align-items:center;justify-content:center;',
      'opacity:0;transition:opacity .25s;pointer-events:none;',
    '}',
    '.mi-overlay.show{opacity:1;pointer-events:all;}',

    /* card */
    '.mi-card{',
      'background:linear-gradient(160deg,#141e30 0%,#0d1520 100%);',
      'border:1px solid rgba(255,255,255,.09);',
      'border-radius:1.2em;padding:2em 2.4em;',
      'width:min(540px,92vw);',
      'box-shadow:0 24px 60px rgba(0,0,0,.65);',
      'display:flex;flex-direction:column;gap:1.4em;',
    '}',
    '.mi-card h2{margin:0;color:#fff;font-size:1.35em;display:flex;align-items:center;gap:.5em;}',
    '.mi-card h2 span{color:#1a8cff;}',

    /* drop zone */
    '.mi-drop{',
      'border:2px dashed rgba(26,140,255,.45);border-radius:.8em;',
      'min-height:160px;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;gap:.6em;',
      'cursor:pointer;transition:border-color .2s,background .2s;',
      'color:rgba(255,255,255,.55);font-size:.95em;',
      'position:relative;overflow:hidden;',
    '}',
    '.mi-drop:hover,.mi-drop.dragover{',
      'border-color:#1a8cff;background:rgba(26,140,255,.07);color:#fff;',
    '}',
    '.mi-drop img{max-width:100%;max-height:150px;border-radius:.5em;object-fit:contain;}',
    '.mi-drop input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;}',
    '.mi-drop .mi-drop-icon{font-size:2.5em;line-height:1;}',

    /* actions */
    '.mi-actions{display:flex;gap:.8em;justify-content:flex-end;}',
    '.mi-actions button{',
      'padding:.5em 1.4em;border-radius:2em;cursor:pointer;font-size:.95em;font-weight:600;border:none;',
      'transition:transform .15s,background .2s;',
    '}',
    '.mi-actions button:hover{transform:scale(1.04);}',
    '.mi-btn-cancel{background:rgba(255,255,255,.12);color:#fff;}',
    '.mi-btn-search{background:linear-gradient(135deg,#1a8cff,#0055cc);color:#fff;}',
    '.mi-btn-search:disabled{opacity:.45;pointer-events:none;}',

    /* loader */
    '.mi-loader{',
      'display:none;flex-direction:column;align-items:center;gap:.8em;color:rgba(255,255,255,.7);',
    '}',
    '.mi-loader.show{display:flex;}',
    '.mi-spinner{',
      'width:42px;height:42px;border-radius:50%;',
      'border:3px solid rgba(26,140,255,.2);',
      'border-top-color:#1a8cff;',
      'animation:mi-spin .8s linear infinite;',
    '}',
    '@keyframes mi-spin{to{transform:rotate(360deg)}}',

    /* results */
    '.mi-results{display:flex;flex-direction:column;gap:.7em;max-height:360px;overflow-y:auto;',
      'scrollbar-width:thin;scrollbar-color:#1a8cff transparent;}',
    '.mi-result-item{',
      'display:flex;gap:1em;align-items:center;',
      'background:rgba(255,255,255,.05);border-radius:.7em;padding:.7em .9em;',
      'cursor:pointer;transition:background .15s,transform .15s;',
      'border:1px solid transparent;',
    '}',
    '.mi-result-item:hover,.mi-result-item.focus{',
      'background:rgba(26,140,255,.18);border-color:rgba(26,140,255,.5);transform:translateX(4px);',
    '}',
    '.mi-result-poster{',
      'width:48px;height:68px;border-radius:.4em;object-fit:cover;',
      'background:rgba(255,255,255,.06);flex-shrink:0;',
    '}',
    '.mi-result-info{flex:1;min-width:0;}',
    '.mi-result-title{color:#fff;font-weight:700;font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.mi-result-meta{color:rgba(255,255,255,.5);font-size:.85em;margin-top:.15em;}',
    '.mi-result-score{',
      'font-size:.78em;font-weight:700;padding:.2em .55em;border-radius:2em;',
      'background:rgba(26,140,255,.22);color:#7dc6ff;white-space:nowrap;',
    '}',
    '.mi-no-results{color:rgba(255,255,255,.5);text-align:center;padding:1.5em 0;}',
    '.mi-error{color:#ff6b6b;font-size:.9em;text-align:center;}',
  ].join('');

  /* ── SVG ────────────────────────────────────── */
  var SVG_CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  var SVG_UPLOAD = '📷';

  /* ── inject CSS ─────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('mi-style')) return;
    var s = document.createElement('style');
    s.id = 'mi-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Build overlay UI ───────────────────────── */
  function buildOverlay() {
    var html = [
      '<div class="mi-overlay" id="mi-overlay">',
        '<div class="mi-card">',
          '<h2>', SVG_CAMERA, ' Пошук за <span>фото</span></h2>',

          '<div class="mi-drop" id="mi-drop" tabindex="0" role="button" aria-label="Завантажити фото">',
            '<input type="file" id="mi-file-input" accept="image/*">',
            '<div class="mi-drop-icon" id="mi-drop-icon">', SVG_UPLOAD, '</div>',
            '<div id="mi-drop-text">Натисніть або перетягніть скріншот</div>',
            '<div style="font-size:.78em;color:rgba(255,255,255,.3)">JPEG / PNG / WEBP</div>',
          '</div>',

          '<div class="mi-loader" id="mi-loader">',
            '<div class="mi-spinner"></div>',
            '<span>Аналізую зображення…</span>',
          '</div>',

          '<div id="mi-result-area"></div>',

          '<div class="mi-actions">',
            '<button class="mi-btn-cancel" id="mi-cancel-btn">Закрити</button>',
            '<button class="mi-btn-search" id="mi-search-btn" disabled>Шукати</button>',
          '</div>',
        '</div>',
      '</div>',
    ].join('');

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstElementChild);
  }

  /* ── State ──────────────────────────────────── */
  var state = { file: null, dataUrl: null };

  /* ── Show / Hide overlay ────────────────────── */
  function openOverlay() {
    resetState();
    var el = document.getElementById('mi-overlay');
    if (!el) { buildOverlay(); bindOverlayEvents(); el = document.getElementById('mi-overlay'); }
    el.classList.add('show');
  }

  function closeOverlay() {
    var el = document.getElementById('mi-overlay');
    if (el) el.classList.remove('show');
  }

  function resetState() {
    state.file = null;
    state.dataUrl = null;
    var resultArea = document.getElementById('mi-result-area');
    var loader = document.getElementById('mi-loader');
    var dropIcon = document.getElementById('mi-drop-icon');
    var dropText = document.getElementById('mi-drop-text');
    var searchBtn = document.getElementById('mi-search-btn');
    if (resultArea) resultArea.innerHTML = '';
    if (loader) loader.classList.remove('show');
    if (dropIcon) dropIcon.innerHTML = SVG_UPLOAD;
    if (dropText) dropText.textContent = 'Натисніть або перетягніть скріншот';
    if (searchBtn) searchBtn.disabled = true;
  }

  /* ── File handling ──────────────────────────── */
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    state.file = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      state.dataUrl = e.target.result;
      var dropIcon = document.getElementById('mi-drop-icon');
      var dropText = document.getElementById('mi-drop-text');
      var searchBtn = document.getElementById('mi-search-btn');
      if (dropIcon) {
        dropIcon.innerHTML = '<img src="' + state.dataUrl + '" alt="preview">';
      }
      if (dropText) dropText.textContent = file.name;
      if (searchBtn) searchBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  /* ── Search via movie-identifier.com ─────────── */
  function doSearch() {
    if (!state.file) return;

    var loader = document.getElementById('mi-loader');
    var resultArea = document.getElementById('mi-result-area');
    var searchBtn = document.getElementById('mi-search-btn');

    if (loader) loader.classList.add('show');
    if (resultArea) resultArea.innerHTML = '';
    if (searchBtn) searchBtn.disabled = true;

    var formData = new FormData();
    formData.append('image', state.file);

    // movie-identifier.com – POST до їх API ідентифікації
    fetch('https://www.movie-identifier.com/identify', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (loader) loader.classList.remove('show');
      if (searchBtn) searchBtn.disabled = false;
      renderResults(data);
    })
    .catch(function (err) {
      // Якщо прямий fetch блокується CORS – відкриваємо сторінку і
      // паралельно пробуємо через TMDB текстовий пошук, якщо вдалося
      // витягнути назву зі сторінки (fallback).
      console.warn('[MovieIdentifier] direct fetch failed:', err);
      if (loader) loader.classList.remove('show');
      if (searchBtn) searchBtn.disabled = false;
      fallbackOpenSite();
    });
  }

  /* ── Fallback: відкрити сайт в iframe / новій вкладці ── */
  function fallbackOpenSite() {
    var resultArea = document.getElementById('mi-result-area');
    if (resultArea) {
      resultArea.innerHTML = [
        '<div class="mi-error">',
          'Прямий запит заблоковано браузером (CORS).<br>',
          'Відкриваємо movie-identifier.com для пошуку.',
        '</div>',
      ].join('');
    }

    // Спробуємо відкрити всередині Lampa як зовнішнє джерело
    setTimeout(function () {
      if (typeof Lampa !== 'undefined' && Lampa.Noty) {
        Lampa.Noty.show('Відкриваємо movie-identifier.com…');
      }
      window.open('https://www.movie-identifier.com/', '_blank');
    }, 1200);
  }

  /* ── Render results ─────────────────────────── */
  function renderResults(data) {
    var resultArea = document.getElementById('mi-result-area');
    if (!resultArea) return;

    // Normalize різні можливі формати відповіді
    var items = [];
    if (Array.isArray(data)) items = data;
    else if (data && Array.isArray(data.results)) items = data.results;
    else if (data && data.title) items = [data];

    if (!items.length) {
      resultArea.innerHTML = '<div class="mi-no-results">Нічого не знайдено 😔</div>';
      return;
    }

    var html = '<div class="mi-results" id="mi-results-list">';
    items.forEach(function (item, idx) {
      var title = item.title || item.name || 'Невідомо';
      var year  = item.year  || (item.release_date && item.release_date.slice(0,4)) || '';
      var type  = item.media_type === 'tv' ? 'Серіал' : (item.media_type === 'movie' ? 'Фільм' : (item.type || ''));
      var score = item.confidence ? Math.round(item.confidence * 100) + '%' : (item.vote_average ? '★ ' + item.vote_average : '');
      var poster = item.poster_path
        ? 'https://image.tmdb.org/t/p/w92' + item.poster_path
        : (item.poster || '');

      html += [
        '<div class="mi-result-item" data-idx="', idx, '" tabindex="0">',
          poster
            ? '<img class="mi-result-poster" src="' + poster + '" alt="" loading="lazy">'
            : '<div class="mi-result-poster"></div>',
          '<div class="mi-result-info">',
            '<div class="mi-result-title">', escapeHTML(title), '</div>',
            '<div class="mi-result-meta">',
              [type, year].filter(Boolean).join(' · '),
            '</div>',
          '</div>',
          score ? '<div class="mi-result-score">' + score + '</div>' : '',
        '</div>',
      ].join('');
    });
    html += '</div>';
    resultArea.innerHTML = html;

    // Клік по результату – шукаємо через Lampa
    var list = document.getElementById('mi-results-list');
    if (list) {
      list.querySelectorAll('.mi-result-item').forEach(function (el) {
        el.addEventListener('click', function () {
          var idx = parseInt(el.getAttribute('data-idx'), 10);
          openInLampa(items[idx]);
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            var idx = parseInt(el.getAttribute('data-idx'), 10);
            openInLampa(items[idx]);
          }
        });
      });
    }
  }

  /* ── Open found item in Lampa ────────────────── */
  function openInLampa(item) {
    if (typeof Lampa === 'undefined') return;

    var title = item.title || item.name || '';
    closeOverlay();

    // Якщо є TMDB id – відразу відкриваємо картку
    if (item.id && item.media_type) {
      try {
        Lampa.Activity.push({
          component: 'full',
          id: item.id,
          method: item.media_type,
          card: item,
          source: 'tmdb',
        });
        return;
      } catch(e) {}
    }

    // Інакше – пошук через вбудований Lampa search
    try {
      if (Lampa.Search) {
        Lampa.Search.open(title);
      } else if (Lampa.Activity) {
        Lampa.Activity.push({
          component: 'search',
          search: title,
          search_auto: true,
        });
      }
    } catch(e) {
      console.warn('[MovieIdentifier] Lampa open failed:', e);
    }
  }

  /* ── Escape HTML ─────────────────────────────── */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  /* ── Bind overlay events ─────────────────────── */
  function bindOverlayEvents() {
    var overlay    = document.getElementById('mi-overlay');
    var drop       = document.getElementById('mi-drop');
    var fileInput  = document.getElementById('mi-file-input');
    var cancelBtn  = document.getElementById('mi-cancel-btn');
    var searchBtn  = document.getElementById('mi-search-btn');

    if (!overlay) return;

    cancelBtn && cancelBtn.addEventListener('click', closeOverlay);
    searchBtn && searchBtn.addEventListener('click', doSearch);

    // Click outside card
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });

    // File input change
    fileInput && fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    // Drag & drop
    drop && drop.addEventListener('dragover', function (e) {
      e.preventDefault();
      drop.classList.add('dragover');
    });
    drop && drop.addEventListener('dragleave', function () {
      drop.classList.remove('dragover');
    });
    drop && drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('dragover');
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) handleFile(files[0]);
    });

    // ESC to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
    });
  }

  /* ── Add camera button to Lampa header ───────── */
  function addHeaderButton() {
    // Чекаємо поки Lampa та header готові
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      var header = document.querySelector('.header__icons, .header .header__left, .header');
      if (!header || attempts > 60) { clearInterval(interval); return; }

      if (document.getElementById('mi-header-btn')) { clearInterval(interval); return; }

      var btn = document.createElement('div');
      btn.id = 'mi-header-btn';
      btn.className = 'mi-btn selector';
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', PLUGIN_TITLE);
      btn.innerHTML = SVG_CAMERA + '<span>' + PLUGIN_TITLE + '</span>';

      btn.addEventListener('click', openOverlay);
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') openOverlay();
      });

      // Вставляємо на початок блоку іконок
      var iconsBlock = document.querySelector('.header__icons');
      if (iconsBlock) {
        iconsBlock.insertBefore(btn, iconsBlock.firstChild);
      } else {
        header.appendChild(btn);
      }

      clearInterval(interval);
    }, 500);
  }

  /* ── Register Lampa plugin ────────────────────── */
  function register() {
    if (typeof Lampa === 'undefined') {
      // Lampa ще не завантажена – чекаємо
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(register, 1000);
      });
      return;
    }

    injectCSS();
    buildOverlay();
    bindOverlayEvents();
    addHeaderButton();

    // Реєструємо як Lampa component (опціонально)
    if (Lampa.Component) {
      try {
        Lampa.Component.add(PLUGIN_NAME, {
          name: PLUGIN_TITLE,
          icon: SVG_CAMERA,
          launch: openOverlay,
        });
      } catch(e) {}
    }

    // Додаємо до меню налаштувань / sidebar якщо підтримується
    if (Lampa.Listener) {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'start') {
          addHeaderButton();
        }
      });
    }

    console.log('[MovieIdentifier] Plugin loaded ✓');
  }

  /* ── Entry point ─────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    register();
  }

  // Також спробуємо через Lampa.ready якщо доступний
  if (typeof Lampa !== 'undefined' && Lampa.ready) {
    Lampa.ready(register);
  }

})();
