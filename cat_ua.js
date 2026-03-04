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
       LAMPA LANGUAGE → TMDB LANGUAGE CODE
    ══════════════════════════════════════════════ */
    function getTmdbLang() {
        var lang = Lampa.Storage.field('language') || 'en';
        var map = {
            ru: 'ru-RU',
            uk: 'uk-UA',
            en: 'en-US',
            de: 'de-DE',
            fr: 'fr-FR',
            es: 'es-ES',
            pl: 'pl-PL',
            it: 'it-IT',
            zh: 'zh-CN'
        };
        return map[lang] || 'en-US';
    }

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '1.3.0',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };
        Lampa.Manifest.plugins = manifest;

        /* ══════════════════════════════════════════════
           HEADER BUTTON
        ══════════════════════════════════════════════ */
        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;

            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) {
                setTimeout(addHeaderButton, 1000);
                return;
            }

            var svgIcon =
                '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none">' +
                ' <g><title>Layer 1</title>' +
                '  <g transform="matrix(0.539435,0,0,0.554343,18.8769,18.1628)">' +
                '   <svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" x="-41.22351" y="-38.89616">' +
                '    <g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/>' +
                '    <g><g>' +
                '      <path fill="none" d="m0,0l24,0l0,24l-24,0l0,-24z"/>' +
                '      <path d="m3,3l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm0,4l2,0l0,2l-2,0l0,-2zm-16,12l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm7.667,4l1.036,-1.555a1,1 0 0 1 0.832,-0.445l2.93,0a1,1 0 0 1 0.832,0.445l1.036,1.555l2.667,0a1,1 0 0 1 1,1l0,8a1,1 0 0 1 -1,1l-12,0a1,1 0 0 1 -1,-1l0,-8a1,1 0 0 1 1,-1l2.667,0zm-1.667,8l10,0l0,-6l-2.737,0l-1.333,-2l-1.86,0l-1.333,2l-2.737,0l0,6zm5,-1a2,2 0 1 1 0,-4a2,2 0 0 1 0,4z" fill="currentColor"/>' +
                '    </g></g>' +
                '   </svg>' +
                '  </g>' +
                ' </g>' +
                '</svg>';

            var button = $(
                '<div class="head__button head__action open--photo-search selector"' +
                ' style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;"' +
                ' title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon + '</div>'
            );
            searchButton.after(button);
            button.on('click', openPhotoSearchWindow);
        }

        /* ══════════════════════════════════════════════
           MODAL WINDOW
        ══════════════════════════════════════════════ */
        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = $(
                '<div class="scroll scroll--over">' +
                '  <div class="scroll__content">' +
                '    <div class="scroll__body">' +

                /* Зона прев'ю / лоадер */
                '      <div id="photo-preview-wrap" class="selector"' +
                '           style="width:300px;height:169px;margin:0 auto 12px;' +
                '                  border:2px dashed #555;border-radius:10px;position:relative;' +
                '                  display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                '                  background:#1a1a1a;color:#888;font-size:14px;cursor:pointer;' +
                '                  transition:border-color .2s,background .2s;user-select:none;overflow:hidden;">' +

                /* Стан 1: пусто (іконка + підказка) */
                '          <div id="photo-preview-inner">' +
                '            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"' +
                '                 stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
                '                 style="display:block;margin:0 auto 8px">' +
                '              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
                '              <circle cx="12" cy="13" r="4"/>' +
                '            </svg>' +
                '            <span>' + Lampa.Lang.translate('photo_search_click_hint') + '</span>' +
                '          </div>' +

                /* Стан 2: лоадер Lampa */
                '          <div id="photo-loader"' +
                '               style="display:none;flex-direction:column;align-items:center;gap:12px;pointer-events:none;">' +
                '            <div style="width:3em;height:3em;' +
                '                        background:url(./img/loader.svg) no-repeat 50% 50%;' +
                '                        background-size:contain;"></div>' +
                '            <div id="photo-loader-text"' +
                '                 style="color:#aaa;font-size:13px;text-align:center;"></div>' +
                '          </div>' +

                '      </div>' +

                /* Кнопки */
                '      <div class="modal__footer" style="justify-content:center;gap:12px;">' +
                '        <div id="btn-search" class="modal__button selector">' + Lampa.Lang.translate('photo_search_send') + '</div>' +
                '        <div id="btn-close"  class="modal__button selector">' + Lampa.Lang.translate('photo_search_close') + '</div>' +
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
                var wrap = document.getElementById('photo-preview-wrap');
                if (wrap) {
                    wrap.addEventListener('click', function() {
                        /* Не відкривати вибір файлу коли лоадер активний */
                        if (document.getElementById('photo-loader').style.display !== 'none') return;
                        selectImageFromDevice();
                    });
                    wrap.addEventListener('mouseenter', function() {
                        if (document.getElementById('photo-loader').style.display !== 'none') return;
                        wrap.style.borderColor = '#fff';
                        wrap.style.background  = '#222';
                    });
                    wrap.addEventListener('mouseleave', function() {
                        if (document.getElementById('photo-loader').style.display !== 'none') return;
                        wrap.style.borderColor = selectedFile ? '#4da6ff' : '#555';
                        wrap.style.background  = '#1a1a1a';
                    });
                }
                $('#btn-search').on('click', sendImageToIdentifier);
                $('#btn-close').on('click',  function() { Lampa.Modal.close(); });
            }, 100);
        }

        /* ══════════════════════════════════════════════
           LOADER HELPERS
        ══════════════════════════════════════════════ */
        function showLoader(text) {
            var inner  = document.getElementById('photo-preview-inner');
            var loader = document.getElementById('photo-loader');
            var ltxt   = document.getElementById('photo-loader-text');
            var wrap   = document.getElementById('photo-preview-wrap');
            var btnS   = document.getElementById('btn-search');

            if (inner)  inner.style.display  = 'none';
            if (loader) { loader.style.display = 'flex'; }
            if (ltxt)   ltxt.textContent = text || '';
            if (wrap)   { wrap.style.borderColor = '#4da6ff'; wrap.style.cursor = 'default'; }
            if (btnS)   { btnS.style.opacity = '0.4'; btnS.style.pointerEvents = 'none'; }
        }

        function updateLoaderText(text) {
            var ltxt = document.getElementById('photo-loader-text');
            if (ltxt) ltxt.textContent = text;
        }

        function hideLoader() {
            var inner  = document.getElementById('photo-preview-inner');
            var loader = document.getElementById('photo-loader');
            var wrap   = document.getElementById('photo-preview-wrap');
            var btnS   = document.getElementById('btn-search');

            if (loader) loader.style.display = 'none';
            if (inner)  inner.style.display  = '';
            if (wrap)   { wrap.style.borderColor = selectedFile ? '#4da6ff' : '#555'; wrap.style.cursor = 'pointer'; }
            if (btnS)   { btnS.style.opacity = '1'; btnS.style.pointerEvents = ''; }
        }

        /* ══════════════════════════════════════════════
           FILE SELECT
        ══════════════════════════════════════════════ */
        function selectImageFromDevice() {
            var input = document.createElement('input');
            input.type   = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = function(event) {
                var file = event.target.files[0];
                if (!file) return;
                selectedFile = file;

                var reader = new FileReader();
                reader.onload = function(e) {
                    var inner = document.getElementById('photo-preview-inner');
                    var wrap  = document.getElementById('photo-preview-wrap');
                    if (inner) {
                        inner.innerHTML =
                            '<img src="' + e.target.result + '"' +
                            ' style="max-width:100%;max-height:165px;border-radius:6px;display:block;pointer-events:none;">';
                    }
                    if (wrap) {
                        wrap.style.borderColor = '#4da6ff';
                        wrap.style.borderStyle = 'solid';
                    }
                };
                reader.readAsDataURL(file);
            };

            document.body.appendChild(input);
            input.click();
            setTimeout(function() {
                if (input.parentNode) document.body.removeChild(input);
            }, 60000);
        }

        /* ══════════════════════════════════════════════
           STEP 1: ВІДПРАВКА НА MOVIE-IDENTIFIER
        ══════════════════════════════════════════════ */
        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

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

                if (!text || text.toLowerCase().includes('not found')) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data;
                try { data = JSON.parse(text); }
                catch(e) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                if (!data.filmData || data.filmData.toLowerCase().includes('not found')) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed;
                try { parsed = JSON.parse(data.filmData); }
                catch(e) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (!results.length) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var best  = results[0];
                var title = (best.name || best.title || '').trim();

                if (!title) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                console.log('[Movie-Identifier] Detected:', title, best.confidence ? best.confidence + '%' : '');

                /* Перейти до кроку 2: пошук у TMDB */
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
           STEP 2: ПОШУК У TMDB ЗА НАЗВОЮ
           Використовує Lampa.Api для правильного токена
           та мови інтерфейсу
        ══════════════════════════════════════════════ */
        function searchTmdb(title, identifierResult) {
            var lang = getTmdbLang();

            /* Будуємо URL пошуку (search/multi шукає і фільми і серіали) */
            var searchUrl = 'search/multi?query=' + encodeURIComponent(title) +
                            '&language=' + lang +
                            '&page=1' +
                            '&include_adult=false';

            /* Використовуємо Lampa.Api.get щоб отримати правильний API ключ/токен */
            Lampa.Api.get(searchUrl, function(json) {
                var results = (json && json.results) ? json.results : [];

                /* Фільтруємо тільки фільми і серіали */
                results = results.filter(function(r) {
                    return r.media_type === 'movie' || r.media_type === 'tv';
                });

                if (!results.length) {
                    hideLoader();
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var confidence = identifierResult.confidence
                    ? ' (' + identifierResult.confidence + '%)'
                    : '';
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + title + confidence);

                hideLoader();
                Lampa.Modal.close();

                setTimeout(function() {
                    if (results.length === 1) {
                        /* Один результат — одразу відкриваємо повну картку */
                        openFullCard(results[0]);
                    } else {
                        /* Кілька результатів — відкриваємо сторінку категорії */
                        openCategoryPage(title, searchUrl);
                    }
                }, 300);

            }, function(err) {
                /* Fallback: якщо Lampa.Api.get не спрацював */
                console.warn('[Movie-Identifier] Lampa.Api.get failed, fallback to category_full:', err);
                hideLoader();
                Lampa.Modal.close();
                setTimeout(function() { openCategoryPage(title, searchUrl); }, 300);
            });
        }

        /* ══════════════════════════════════════════════
           ВІДКРИВАЄМО ПОВНУ КАРТКУ ФІЛЬМУ / СЕРІАЛУ
           Через Lampa Activity component: 'full'
        ══════════════════════════════════════════════ */
        function openFullCard(card) {
            /* Визначаємо тип медіа */
            var method = card.media_type === 'tv' ? 'tv' : 'movie';

            /* Якщо media_type не вказано — визначаємо за наявністю полів */
            if (!card.media_type) {
                method = card.original_name ? 'tv' : 'movie';
                card.media_type = method;
            }

            /* Нормалізуємо картку — Lampa очікує певні поля */
            if (!card.title && card.name)   card.title = card.name;
            if (!card.name  && card.title)  card.name  = card.title;

            Lampa.Activity.push({
                component : 'full',
                id        : card.id,
                method    : method,
                card      : card,
                source    : 'tmdb'
            });
        }

        /* ══════════════════════════════════════════════
           ВІДКРИВАЄМО СТОРІНКУ РЕЗУЛЬТАТІВ (кілька карток)
           Через Lampa Activity component: 'category_full'
        ══════════════════════════════════════════════ */
        function openCategoryPage(title, searchUrl) {
            Lampa.Activity.push({
                url        : searchUrl,
                title      : title,
                component  : 'category_full',
                source     : 'tmdb',
                card_type  : true,
                page       : 1
            });
        }

        /* ── Ініціалізація ── */
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
