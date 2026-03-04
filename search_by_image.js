(function() {
    'use strict';

    var selectedFile = null;

    Lampa.Lang.add({
        photo_search_title: {
            ru: 'Поиск по фото',
            uk: 'Пошук за фото',
            en: 'Search by photo'
        },
        photo_search_description: {
            ru: 'Поиск фильма или сериала по фотографии',
            uk: 'Пошук фільму або серіалу за фотографією',
            en: 'Search movie or series by photo'
        },
        photo_search_button: {
            ru: 'Поиск по фото',
            uk: 'Пошук за фото',
            en: 'Search by photo'
        },
        photo_search_send: {
            ru: 'Поиск',
            uk: 'Пошук',
            en: 'Search'
        },
        photo_search_close: {
            ru: 'Закрыть',
            uk: 'Закрити',
            en: 'Close'
        },
        photo_search_no_file: {
            ru: 'Сначала выберите изображение',
            uk: 'Спочатку виберіть зображення',
            en: 'First select an image'
        },
        photo_search_identifying: {
            ru: 'Определяю фильм...',
            uk: 'Визначаю фільм...',
            en: 'Identifying movie...'
        },
        photo_search_searching_tmdb: {
            ru: 'Ищу в базе TMDB...',
            uk: 'Шукаю в базі TMDB...',
            en: 'Searching TMDB...'
        },
        photo_search_success: {
            ru: 'Найдено: ',
            uk: 'Знайдено: ',
            en: 'Found: '
        },
        photo_search_not_found: {
            ru: 'Фильм не найден. Попробуйте другое фото',
            uk: 'Фільм не знайдено. Спробуйте інше фото',
            en: 'Movie not found. Try another photo'
        },
        photo_search_network_error: {
            ru: 'Ошибка сети: ',
            uk: 'Помилка мережі: ',
            en: 'Network error: '
        },
        photo_search_click_hint: {
            ru: 'Нажмите, чтобы выбрать фото',
            uk: 'Натисніть, щоб вибрати фото',
            en: 'Click to select photo'
        }
    });

    /* ══════════════════════════════════════════════
       INJECT CSS
       Використовуємо ті ж ::after-стилі що і Lampa
       .card.focus .card__view::after  →  overlay з glow
    ══════════════════════════════════════════════ */
    function injectCSS() {
        if (document.getElementById('ps-css')) return;
        var s = document.createElement('style');
        s.id = 'ps-css';
        s.textContent = [
            /* Зона прев'ю — структура як у .card / .card__view */
            '#ps-wrap{',
                'position:relative;',
                'width:300px;height:169px;',
                'margin:0 auto 12px;',
                'border-radius:10px;',
                'overflow:hidden;',
                'cursor:pointer;',
                'background:#1a1a1a;',
                'display:flex;align-items:center;justify-content:center;',
            '}',

            /* ::after — точна копія Lampa card focus/hover overlay */
            '#ps-wrap::after{',
                'content:"";',
                'position:absolute;',
                'inset:0;',
                'border-radius:inherit;',
                'opacity:0;',
                'transition:opacity .2s;',
                'pointer-events:none;',
                'box-shadow:inset 0 0 0 3px #fff;',
            '}',
            '#ps-wrap.ps-hover::after{ opacity:.45; }',
            '#ps-wrap.ps-focus::after{ opacity:1;  }',

            /* Лоадер */
            '#ps-loader{',
                'display:none;',
                'flex-direction:column;',
                'align-items:center;',
                'gap:10px;',
                'pointer-events:none;',
            '}',
            '#ps-loader.ps-show{ display:flex; }',
            '#ps-loader-text{',
                'color:rgba(255,255,255,.6);',
                'font-size:13px;',
                'text-align:center;',
            '}',
        ].join('');
        document.head.appendChild(s);
    }

    /* ══════════════════════════════════════════════
       TMDB LANG
    ══════════════════════════════════════════════ */
    function getTmdbLang() {
        var lang = Lampa.Storage.field('language') || 'en';
        var map = { ru:'ru-RU', uk:'uk-UA', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', pl:'pl-PL', it:'it-IT', zh:'zh-CN' };
        return map[lang] || 'en-US';
    }

    /* ══════════════════════════════════════════════
       TMDB API KEY — витягуємо з Lampa
    ══════════════════════════════════════════════ */
    function getTmdbApiKey() {
        // Lampa зберігає ключ у різних місцях залежно від версії
        try { if (Lampa.Api.key)     return Lampa.Api.key('tmdb'); } catch(e){}
        try { if (Lampa.Api.tmdbKey) return Lampa.Api.tmdbKey;      } catch(e){}
        // Публічний readonly ключ як fallback
        return '4ef0d7355d9ffb5151e987764708ce96';
    }

    function startPlugin() {
        Lampa.Manifest.plugins = {
            type: 'other',
            version: '1.4.0',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        injectCSS();

        /* ── HEADER BUTTON ─────────────────────────── */
        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;
            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) { setTimeout(addHeaderButton, 1000); return; }

            var svgIcon =
                '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none">' +
                '<g><g transform="matrix(0.539435,0,0,0.554343,18.8769,18.1628)">' +
                '<svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" x="-41.22351" y="-38.89616">' +
                '<g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/><g><g>' +
                '<path fill="none" d="m0,0l24,0l0,24l-24,0l0,-24z"/>' +
                '<path d="m3,3l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm0,4l2,0l0,2l-2,0l0,-2zm-16,12l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm7.667,4l1.036,-1.555a1,1 0 0 1 0.832,-0.445l2.93,0a1,1 0 0 1 0.832,0.445l1.036,1.555l2.667,0a1,1 0 0 1 1,1l0,8a1,1 0 0 1 -1,1l-12,0a1,1 0 0 1 -1,-1l0,-8a1,1 0 0 1 1,-1l2.667,0zm-1.667,8l10,0l0,-6l-2.737,0l-1.333,-2l-1.86,0l-1.333,2l-2.737,0l0,6zm5,-1a2,2 0 1 1 0,-4a2,2 0 0 1 0,4z" fill="currentColor"/>' +
                '</g></g></g></svg></g></g></svg>';

            var button = $(
                '<div class="head__button head__action open--photo-search selector"' +
                ' style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;"' +
                ' title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon + '</div>'
            );
            searchButton.after(button);
            button.on('click', openPhotoSearchWindow);
        }

        /* ── MODAL ─────────────────────────────────── */
        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = $(
                '<div class="scroll scroll--over">' +
                '  <div class="scroll__content">' +
                '    <div class="scroll__body">' +

                /* Зона прев'ю — клас card + card__view для нативних стилів Lampa */
                '      <div id="ps-wrap" class="selector">' +

                /* Стан 1: іконка + підказка */
                '        <div id="ps-inner"' +
                '             style="display:flex;flex-direction:column;align-items:center;' +
                '                    gap:8px;color:rgba(255,255,255,.45);font-size:14px;">' +
                '          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"' +
                '               stroke="currentColor" stroke-width="1.5"' +
                '               stroke-linecap="round" stroke-linejoin="round"' +
                '               style="opacity:.35">' +
                '            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
                '            <circle cx="12" cy="13" r="4"/>' +
                '          </svg>' +
                '          <span>' + Lampa.Lang.translate('photo_search_click_hint') + '</span>' +
                '        </div>' +

                /* Стан 2: лоадер Lampa (./img/loader.svg) */
                '        <div id="ps-loader">' +
                '          <div style="width:3em;height:3em;' +
                '                      background:url(./img/loader.svg) no-repeat 50% 50%;' +
                '                      background-size:contain;"></div>' +
                '          <div id="ps-loader-text"></div>' +
                '        </div>' +

                '      </div>' +

                /* Кнопки */
                '      <div class="modal__footer" style="justify-content:center;gap:12px;">' +
                '        <div id="ps-btn-search" class="modal__button selector">' + Lampa.Lang.translate('photo_search_send')  + '</div>' +
                '        <div id="ps-btn-close"  class="modal__button selector">' + Lampa.Lang.translate('photo_search_close') + '</div>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>'
            );

            Lampa.Modal.open({
                title: Lampa.Lang.translate('photo_search_title'),
                html: html,
                size: 'medium',
                onBack: function() { Lampa.Modal.close(); }
            });

            setTimeout(function() {
                var wrap = document.getElementById('ps-wrap');
                if (wrap) {
                    /* Hover — стандартний ::after через CSS-клас */
                    wrap.addEventListener('mouseenter', function() { wrap.classList.add('ps-hover'); });
                    wrap.addEventListener('mouseleave', function() { wrap.classList.remove('ps-hover'); });

                    /* Клік — відкриваємо файловий діалог */
                    wrap.addEventListener('click', function() {
                        if (document.getElementById('ps-loader').classList.contains('ps-show')) return;
                        selectImageFromDevice();
                    });

                    /* Focus для TV-пульта */
                    wrap.addEventListener('focus',  function() { wrap.classList.add('ps-focus'); });
                    wrap.addEventListener('blur',   function() { wrap.classList.remove('ps-focus'); });
                }

                $('#ps-btn-search').on('click', sendImageToIdentifier);
                $('#ps-btn-close').on('click',  function() { Lampa.Modal.close(); });
            }, 100);
        }

        /* ── LOADER HELPERS ────────────────────────── */
        function showLoader(text) {
            var inner  = document.getElementById('ps-inner');
            var loader = document.getElementById('ps-loader');
            var ltxt   = document.getElementById('ps-loader-text');
            var btnS   = document.getElementById('ps-btn-search');
            if (inner)  inner.style.display = 'none';
            if (loader) loader.classList.add('ps-show');
            if (ltxt)   ltxt.textContent = text || '';
            if (btnS)   { btnS.style.opacity = '.4'; btnS.style.pointerEvents = 'none'; }
        }

        function updateLoaderText(text) {
            var ltxt = document.getElementById('ps-loader-text');
            if (ltxt) ltxt.textContent = text;
        }

        function hideLoader() {
            var inner  = document.getElementById('ps-inner');
            var loader = document.getElementById('ps-loader');
            var btnS   = document.getElementById('ps-btn-search');
            if (loader) loader.classList.remove('ps-show');
            if (inner)  inner.style.display = '';
            if (btnS)   { btnS.style.opacity = '1'; btnS.style.pointerEvents = ''; }
        }

        /* ── FILE SELECT ───────────────────────────── */
        function selectImageFromDevice() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = function(event) {
                var file = event.target.files[0];
                if (!file) return;
                selectedFile = file;

                var reader = new FileReader();
                reader.onload = function(e) {
                    var inner = document.getElementById('ps-inner');
                    var wrap  = document.getElementById('ps-wrap');
                    if (inner) {
                        inner.innerHTML =
                            '<img src="' + e.target.result + '"' +
                            ' style="max-width:100%;max-height:165px;border-radius:8px;' +
                            '        display:block;pointer-events:none;">';
                    }
                    /* Після вибору — показуємо focus-стан щоб підкреслити готовність */
                    if (wrap) wrap.classList.add('ps-focus');
                };
                reader.readAsDataURL(file);
            };

            document.body.appendChild(input);
            input.click();
            setTimeout(function() { if (input.parentNode) document.body.removeChild(input); }, 60000);
        }

        /* ── STEP 1: MOVIE-IDENTIFIER ──────────────── */
        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

            /* Прибираємо focus-стан і вмикаємо лоадер */
            var wrap = document.getElementById('ps-wrap');
            if (wrap) wrap.classList.remove('ps-focus');

            showLoader(Lampa.Lang.translate('photo_search_identifying'));

            var formData = new FormData();
            formData.append('video', selectedFile);

            fetch('https://movie-identifier.com/api/process-video-clip', {
                method: 'POST',
                body: formData
            })
            .then(function(r) { return r.text(); })
            .then(function(text) {
                console.log('[Movie-Identifier] Raw:', text.substring(0, 500));

                if (!text || text.toLowerCase().indexOf('not found') !== -1) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data;
                try { data = JSON.parse(text); }
                catch(e) { hideLoader(); Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found')); return; }

                if (!data.filmData || data.filmData.toLowerCase().indexOf('not found') !== -1) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed;
                try { parsed = JSON.parse(data.filmData); }
                catch(e) { hideLoader(); Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found')); return; }

                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (!results.length) { hideLoader(); Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found')); return; }

                var best  = results[0];
                var title = (best.name || best.title || '').trim();

                if (!title) { hideLoader(); Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found')); return; }

                console.log('[Movie-Identifier] Detected:', title, best.confidence ? best.confidence + '%' : '');

                updateLoaderText(Lampa.Lang.translate('photo_search_searching_tmdb'));
                searchTmdb(title, best);
            })
            .catch(function(err) {
                hideLoader();
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + err.message);
                console.error('[Movie-Identifier] error:', err);
            });
        }

        /* ── STEP 2: TMDB SEARCH ───────────────────────
           Використовуємо прямий fetch до TMDB API
           з ключем, витягнутим з Lampa
        ──────────────────────────────────────────────── */
        function searchTmdb(title, identifierResult) {
            var lang   = getTmdbLang();
            var apiKey = getTmdbApiKey();

            var url = 'https://api.themoviedb.org/3/search/multi' +
                      '?api_key=' + apiKey +
                      '&query='    + encodeURIComponent(title) +
                      '&language=' + lang +
                      '&page=1' +
                      '&include_adult=false';

            fetch(url)
            .then(function(r) {
                if (!r.ok) throw new Error('TMDB HTTP ' + r.status);
                return r.json();
            })
            .then(function(json) {
                var results = (json && json.results) ? json.results : [];

                /* Залишаємо тільки фільми і серіали */
                results = results.filter(function(r) {
                    return r.media_type === 'movie' || r.media_type === 'tv';
                });

                if (!results.length) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var confidence = identifierResult.confidence ? ' (' + identifierResult.confidence + '%)' : '';
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + title + confidence);

                hideLoader();
                Lampa.Modal.close();

                setTimeout(function() {
                    if (results.length === 1) {
                        openFullCard(results[0]);
                    } else {
                        openCategoryPage(title, apiKey, lang);
                    }
                }, 300);
            })
            .catch(function(err) {
                console.error('[Movie-Identifier] TMDB search error:', err);
                hideLoader();
                Lampa.Modal.close();
                /* Fallback — відкриваємо звичайний пошук Lampa */
                setTimeout(function() { fallbackSearch(title); }, 300);
            });
        }

        /* ── ВІДКРИВАЄМО ПОВНУ КАРТКУ ──────────────── */
        function openFullCard(card) {
            var method = card.media_type === 'tv' ? 'tv' : 'movie';
            if (!card.media_type) {
                method = card.original_name ? 'tv' : 'movie';
                card.media_type = method;
            }
            if (!card.title && card.name)  card.title = card.name;
            if (!card.name  && card.title) card.name  = card.title;

            Lampa.Activity.push({
                component : 'full',
                id        : card.id,
                method    : method,
                card      : card,
                source    : 'tmdb'
            });
        }

        /* ── ВІДКРИВАЄМО СТОРІНКУ РЕЗУЛЬТАТІВ ─────── */
        function openCategoryPage(title, apiKey, lang) {
            Lampa.Activity.push({
                url       : 'search/multi?query=' + encodeURIComponent(title) +
                            '&language=' + lang + '&page=1&include_adult=false',
                title     : title,
                component : 'category_full',
                source    : 'tmdb',
                card_type : true,
                page      : 1
            });
        }

        /* ── FALLBACK: НАТИВНИЙ ПОШУК LAMPA ───────── */
        function fallbackSearch(title) {
            try {
                Lampa.Activity.push({
                    component  : 'search',
                    search     : title,
                    search_auto: true,
                    title      : title,
                    page       : 1
                });
            } catch(e) {
                try {
                    if (Lampa.Search && typeof Lampa.Search.open === 'function') {
                        Lampa.Search.open(title);
                    }
                } catch(e2) { console.warn('[Movie-Identifier] fallback failed:', e2); }
            }
        }

        /* ── INIT ──────────────────────────────────── */
        if (window.appready) {
            addHeaderButton();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') addHeaderButton();
            });
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
