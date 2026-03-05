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
        },
        photo_search_upload_label: {
            ru: 'Загрузить изображение',
            uk: 'Завантажити зображення',
            en: 'Upload image'
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

            /* Кнопки — завжди по центру, на мобільному займають повну ширину */
            '.modal__footer{',
                'display:flex !important;',
                'justify-content:center !important;',
                'flex-wrap:wrap;',
                'gap:12px;',
            '}',
            '@media(max-width:600px){',
                '.modal__button{',
                    'flex:1 1 100%;',
                    'text-align:center !important;',
                    'justify-content:center;',
                '}',
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
            version: '1.5.0',
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

            /* Чистий SVG без трансформацій — відповідає стилю нативних іконок Lampa */
            var svgIcon =
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9Z" fill="none" opacity="0.3"/>' +
                '<path d="M20 5H16.83L15 3H9L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5ZM12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18Z" fill="currentColor"/>' +
                '<circle cx="12" cy="13" r="3" fill="currentColor"/>' +
                '</svg>';

            /* Без inline width/height — клас head__action сам задає розмір як у сусідів */
            var button = $(
                '<div class="head__action open--photo-search selector"' +
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

                /* Зона прев'ю — реальний <input type="file"> займає всю площу,
                   тап/клік по зоні = прямий тап по input → системне вікно відкривається
                   на будь-якому пристрої без жодного JS .click() */
                '      <div id="ps-wrap" class="selector" style="position:relative;">' +

                '        <input type="file" id="ps-file-input" accept="image/*"' +
                '               style="position:absolute;inset:0;width:100%;height:100%;' +
                '                      opacity:0;cursor:pointer;z-index:2;' +
                '                      -webkit-appearance:none;">' +

                /* Стан 1: текст (pointer-events:none — не заважає input зверху) */
                '        <div id="ps-inner"' +
                '             style="display:flex;flex-direction:column;align-items:center;' +
                '                    gap:8px;color:rgba(255,255,255,.55);font-size:24px;' +
                '                    font-weight:500;text-align:center;padding:0 16px;' +
                '                    pointer-events:none;position:relative;z-index:1;">' +
                '          <span>' + Lampa.Lang.translate('photo_search_upload_label') + '</span>' +
                '        </div>' +

                /* Стан 2: лоадер */
                '        <div id="ps-loader"' +
                '             style="pointer-events:none;position:relative;z-index:1;">' +
                '          <div style="width:3em;height:3em;' +
                '                      background:url(./img/loader.svg) no-repeat 50% 50%;' +
                '                      background-size:contain;"></div>' +
                '          <div id="ps-loader-text"></div>' +
                '        </div>' +

                '      </div>' +

                /* Кнопки */
                '      <div class="modal__footer" style="justify-content:center;gap:12px;flex-wrap:wrap;">' +
                '        <div id="ps-btn-search" class="modal__button selector" style="text-align:center;">' + Lampa.Lang.translate('photo_search_send')  + '</div>' +
                '        <div id="ps-btn-close"  class="modal__button selector" style="text-align:center;">' + Lampa.Lang.translate('photo_search_close') + '</div>' +
                '      </div>' +

                /* Повідомлення про відсутність результату */
                '      <div id="ps-no-result"' +
                '           style="display:none;margin-top:12px;text-align:center;' +
                '                  color:rgba(255,255,255,.55);font-size:15px;padding:0 8px;">' +
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
                var wrap     = document.getElementById('ps-wrap');
                var fileInput = document.getElementById('ps-file-input');

                /* Hover/focus для ::after ефекту */
                if (wrap) {
                    wrap.addEventListener('mouseenter', function() { wrap.classList.add('ps-hover'); });
                    wrap.addEventListener('mouseleave', function() { wrap.classList.remove('ps-hover'); });
                    wrap.addEventListener('focus',  function() { wrap.classList.add('ps-focus'); });
                    wrap.addEventListener('blur',   function() { wrap.classList.remove('ps-focus'); });
                }

                /* Обробляємо вибір файлу прямо з вбудованого input */
                if (fileInput) {
                    fileInput.addEventListener('change', function() {
                        var file = fileInput.files && fileInput.files[0];
                        if (!file) return;
                        selectedFile = file;

                        var nr = document.getElementById('ps-no-result');
                        if (nr) nr.style.display = 'none';

                        var reader = new FileReader();
                        reader.onload = function(e) {
                            var inner = document.getElementById('ps-inner');
                            if (inner) {
                                inner.innerHTML =
                                    '<img src="' + e.target.result + '"' +
                                    ' style="max-width:100%;max-height:165px;border-radius:8px;' +
                                    '        display:block;pointer-events:none;">';
                            }
                            if (wrap) wrap.classList.add('ps-focus');
                        };
                        reader.readAsDataURL(file);
                    });
                }

                $('#ps-btn-search').on('click', sendImageToIdentifier);
                $('#ps-btn-close').on('click',  function() { Lampa.Modal.close(); });
            }, 100);
        }

        /* ── LOADER HELPERS ────────────────────────── */
        function showLoader(text) {
            var inner     = document.getElementById('ps-inner');
            var loader    = document.getElementById('ps-loader');
            var ltxt      = document.getElementById('ps-loader-text');
            var btnS      = document.getElementById('ps-btn-search');
            var fileInput = document.getElementById('ps-file-input');
            if (inner)     inner.style.display = 'none';
            if (loader)    loader.classList.add('ps-show');
            if (ltxt)      ltxt.textContent = text || '';
            if (btnS)      { btnS.style.opacity = '.4'; btnS.style.pointerEvents = 'none'; }
            /* Ховаємо input під час пошуку щоб не заважав */
            if (fileInput) fileInput.style.display = 'none';
        }

        function updateLoaderText(text) {
            var ltxt = document.getElementById('ps-loader-text');
            if (ltxt) ltxt.textContent = text;
        }

        function hideLoader() {
            var inner     = document.getElementById('ps-inner');
            var loader    = document.getElementById('ps-loader');
            var btnS      = document.getElementById('ps-btn-search');
            var fileInput = document.getElementById('ps-file-input');
            if (loader)    loader.classList.remove('ps-show');
            if (inner)     inner.style.display = '';
            if (btnS)      { btnS.style.opacity = '1'; btnS.style.pointerEvents = ''; }
            if (fileInput) fileInput.style.display = '';
        }

        function showNoResult(text) {
            hideLoader();
            var nr = document.getElementById('ps-no-result');
            if (nr) { nr.textContent = text; nr.style.display = 'block'; }
            Lampa.Noty.show(text);
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
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data;
                try { data = JSON.parse(text); }
                catch(e) { showNoResult(Lampa.Lang.translate('photo_search_not_found')); return; }

                if (!data.filmData || data.filmData.toLowerCase().indexOf('not found') !== -1) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed;
                try { parsed = JSON.parse(data.filmData); }
                catch(e) { showNoResult(Lampa.Lang.translate('photo_search_not_found')); return; }

                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (!results.length) { showNoResult(Lampa.Lang.translate('photo_search_not_found')); return; }

                var best  = results[0];
                var title = (best.name || best.title || '').trim();

                if (!title) { showNoResult(Lampa.Lang.translate('photo_search_not_found')); return; }

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

        /* ══════════════════════════════════════════════
           STEP 2: TMDB SEARCH
           Уточнення пошуку за допомогою Year та Director,
           які повертає movie-identifier
        ══════════════════════════════════════════════ */
        function searchTmdb(title, identifierResult) {
            var lang   = getTmdbLang();
            var apiKey = getTmdbApiKey();

            /* Витягуємо рік і режисера з відповіді movie-identifier */
            var year     = identifierResult.year     || identifierResult.Year     || null;
            var director = identifierResult.director || identifierResult.Director || null;

            /* Нормалізуємо рік — беремо лише цифри (може бути "2012" або "2012-2015") */
            if (year) year = String(year).replace(/\D.*$/, '').trim();

            console.log('[Movie-Identifier] Extra data — year:', year, '| director:', director);

            /* Будуємо URL з усіма уточненнями */
            function buildUrl(withYear) {
                var u = 'https://api.themoviedb.org/3/search/multi' +
                        '?api_key='    + apiKey +
                        '&query='      + encodeURIComponent(title) +
                        '&language='   + lang +
                        '&page=1' +
                        '&include_adult=false';
                if (withYear && year) u += '&year=' + year;
                return u;
            }

            /* Функція оцінки відповідності картки по режисеру/року */
            function scoreCard(card) {
                var score = 0;

                /* Відповідність по року */
                if (year) {
                    var releaseDate = card.release_date || card.first_air_date || '';
                    var cardYear = releaseDate ? String(releaseDate).slice(0, 4) : '';
                    if (cardYear === String(year)) score += 10;
                }

                /* Відповідність по режисеру шукаємо в crew (якщо вже є) або просто даємо бонус */
                /* TMDB search/multi не повертає crew, тому орієнтуємось тільки по року */

                return score;
            }

            /* Функція обробки результатів TMDB */
            function handleResults(results, usedYear) {
                /* Залишаємо тільки фільми і серіали */
                results = results.filter(function(r) {
                    return r.media_type === 'movie' || r.media_type === 'tv';
                });

                /* Якщо з роком нічого не знайшли — повторюємо без року */
                if (!results.length && usedYear && year) {
                    console.log('[Movie-Identifier] No results with year, retrying without year...');
                    fetch(buildUrl(false))
                    .then(function(r) { if (!r.ok) throw new Error('TMDB HTTP ' + r.status); return r.json(); })
                    .then(function(json) { handleResults((json && json.results) ? json.results : [], false); })
                    .catch(onTmdbError);
                    return;
                }

                if (!results.length) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                /* Сортуємо за score (рік збігається = вище) і беремо перший */
                results.sort(function(a, b) { return scoreCard(b) - scoreCard(a); });

                var best = results[0];

                var confidence = identifierResult.confidence ? ' (' + identifierResult.confidence + '%)' : '';
                var infoStr    = [title, year, director].filter(Boolean).join(', ');
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + infoStr + confidence);

                hideLoader();
                Lampa.Modal.close();

                /* Завжди відкриваємо лише одну — найкращу — картку */
                setTimeout(function() {
                    openFullCard(best);
                }, 300);
            }

            function onTmdbError(err) {
                console.error('[Movie-Identifier] TMDB search error:', err);
                hideLoader();
                Lampa.Modal.close();
                setTimeout(function() { fallbackSearch(title); }, 300);
            }

            /* Перший запит — з роком (якщо є) */
            fetch(buildUrl(true))
            .then(function(r) { if (!r.ok) throw new Error('TMDB HTTP ' + r.status); return r.json(); })
            .then(function(json) { handleResults((json && json.results) ? json.results : [], !!year); })
            .catch(onTmdbError);
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
        function openCategoryPage(title, year, apiKey, lang) {
            var url = 'search/multi?query=' + encodeURIComponent(title) +
                      '&language=' + lang + '&page=1&include_adult=false';
            if (year) url += '&year=' + year;
            Lampa.Activity.push({
                url       : url,
                title     : title + (year ? ' (' + year + ')' : ''),
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
