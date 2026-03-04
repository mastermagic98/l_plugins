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
            ru: 'Пошук',
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
            en: 'Tap to select photo'
        },
        photo_search_upload_label: {
            ru: 'Загрузить изображение',
            uk: 'Завантажити зображення',
            en: 'Upload image'
        }
    });

    function injectCSS() {
        if (document.getElementById('ps-css')) return;
        var s = document.createElement('style');
        s.id = 'ps-css';
        s.textContent = [
            '#ps-wrap{',
                'position:relative;',
                'width:300px;height:169px;',
                'margin:0 auto 12px;',
                'border-radius:10px;',
                'overflow:hidden;',
                'cursor:pointer;',
                'background:#1a1a1a;',
                'display:flex;align-items:center;justify-content:center;',
                'touch-action:manipulation;', // покращує відгук на Android
            '}',
            '#ps-wrap::after{',
                'content:"";',
                'position:absolute;',
                'inset:0;',
                'border-radius:inherit;',
                'opacity:0;',
                'transition:opacity .18s;',
                'pointer-events:none;',
                'box-shadow:inset 0 0 0 3px #fff;',
            '}',
            '#ps-wrap:active::after, #ps-wrap.ps-active::after{ opacity:0.5; }',
            '#ps-loader{',
                'display:none;',
                'flex-direction:column;',
                'align-items:center;',
                'gap:10px;',
                'pointer-events:none;',
            '}',
            '#ps-loader.ps-show{ display:flex; }',
            '#ps-loader-text{',
                'color:rgba(255,255,255,.65);',
                'font-size:13px;',
                'text-align:center;',
            '}',
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
                '}',
            '}'
        ].join('');
        document.head.appendChild(s);
    }

    function getTmdbLang() {
        var lang = Lampa.Storage.field('language') || 'en';
        var map = { ru:'ru-RU', uk:'uk-UA', en:'en-US', de:'de-DE', fr:'fr-FR', es:'es-ES', pl:'pl-PL', it:'it-IT', zh:'zh-CN' };
        return map[lang] || 'en-US';
    }

    function getTmdbApiKey() {
        try { if (Lampa.Api.key) return Lampa.Api.key('tmdb'); } catch(e){}
        try { if (Lampa.Api.tmdbKey) return Lampa.Api.tmdbKey; } catch(e){}
        return '4ef0d7355d9ffb5151e987764708ce96';
    }

    function startPlugin() {
        Lampa.Manifest.plugins = {
            type: 'other',
            version: '1.5.1',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        injectCSS();

        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;
            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) { setTimeout(addHeaderButton, 1000); return; }

            var svgIcon =
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9Z" fill="none" opacity="0.3"/>' +
                '<path d="M20 5H16.83L15 3H9L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5ZM12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18Z" fill="currentColor"/>' +
                '<circle cx="12" cy="13" r="3" fill="currentColor"/>' +
                '</svg>';

            var button = $(
                '<div class="head__action open--photo-search selector" title="' +
                Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon + '</div>'
            );
            searchButton.after(button);
            button.on('click', openPhotoSearchWindow);
        }

        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = $(
                '<div class="scroll scroll--over">' +
                ' <div class="scroll__content">' +
                '  <div class="scroll__body">' +
                '   <div id="ps-wrap" class="selector">' +
                '    <input type="file" id="ps-file-input" accept="image/*" ' +
                '     style="position:absolute;inset:0;width:100%;height:100%;opacity:0;z-index:10;' +
                '     -webkit-appearance:none;appearance:none;cursor:pointer;">' +
                '    <div id="ps-inner" style="display:flex;flex-direction:column;align-items:center;' +
                '     gap:8px;color:rgba(255,255,255,.6);font-size:20px;font-weight:500;' +
                '     pointer-events:none;position:relative;z-index:5;">' +
                '     <span>' + Lampa.Lang.translate('photo_search_upload_label') + '</span>' +
                '     <span style="font-size:13px;opacity:0.7;">' + Lampa.Lang.translate('photo_search_click_hint') + '</span>' +
                '    </div>' +
                '    <div id="ps-loader" style="display:none;flex-direction:column;align-items:center;gap:10px;' +
                '     pointer-events:none;position:relative;z-index:5;">' +
                '     <div style="width:48px;height:48px;background:url(./img/loader.svg) no-repeat 50% 50%;' +
                '      background-size:contain;"></div>' +
                '     <div id="ps-loader-text" style="color:rgba(255,255,255,.7);font-size:14px;"></div>' +
                '    </div>' +
                '   </div>' +
                '   <div class="modal__footer" style="justify-content:center;gap:12px;flex-wrap:wrap;">' +
                '    <div id="ps-btn-search" class="modal__button selector">' + Lampa.Lang.translate('photo_search_send') + '</div>' +
                '    <div id="ps-btn-close" class="modal__button selector">' + Lampa.Lang.translate('photo_search_close') + '</div>' +
                '   </div>' +
                '   <div id="ps-no-result" style="display:none;margin-top:16px;text-align:center;' +
                '    color:rgba(255,255,255,.6);font-size:15px;padding:0 12px;"></div>' +
                '  </div>' +
                ' </div>' +
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
                var fileInput = document.getElementById('ps-file-input');
                var inner = document.getElementById('ps-inner');
                var loader = document.getElementById('ps-loader');
                var loaderText = document.getElementById('ps-loader-text');
                var noResult = document.getElementById('ps-no-result');

                // Ефект натискання на Android
                if (wrap) {
                    wrap.addEventListener('touchstart', function() { wrap.classList.add('ps-active'); });
                    wrap.addEventListener('touchend', function() { wrap.classList.remove('ps-active'); });
                    wrap.addEventListener('touchcancel', function() { wrap.classList.remove('ps-active'); });
                }

                // Прямий клік/тап по зоні = відкриває файловий діалог
                if (fileInput) {
                    fileInput.addEventListener('change', function(e) {
                        var file = e.target.files[0];
                        if (!file) return;
                        selectedFile = file;

                        if (noResult) noResult.style.display = 'none';

                        var reader = new FileReader();
                        reader.onload = function(ev) {
                            if (inner) {
                                inner.innerHTML = '<img src="' + ev.target.result + '" ' +
                                    'style="max-width:100%;max-height:165px;border-radius:8px;display:block;">';
                            }
                        };
                        reader.readAsDataURL(file);
                    });
                }

                $('#ps-btn-search').on('click', sendImageToIdentifier);
                $('#ps-btn-close').on('click', function() { Lampa.Modal.close(); });
            }, 100);
        }

        function showLoader(text) {
            var inner = document.getElementById('ps-inner');
            var loader = document.getElementById('ps-loader');
            var ltxt = document.getElementById('ps-loader-text');
            var btn = document.getElementById('ps-btn-search');
            var input = document.getElementById('ps-file-input');
            if (inner) inner.style.display = 'none';
            if (loader) loader.style.display = 'flex';
            if (ltxt) ltxt.textContent = text || '';
            if (btn) { btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none'; }
            if (input) input.disabled = true;
        }

        function hideLoader() {
            var inner = document.getElementById('ps-inner');
            var loader = document.getElementById('ps-loader');
            var btn = document.getElementById('ps-btn-search');
            var input = document.getElementById('ps-file-input');
            if (loader) loader.style.display = 'none';
            if (inner) inner.style.display = 'flex';
            if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = ''; }
            if (input) input.disabled = false;
        }

        function showNoResult(text) {
            hideLoader();
            var nr = document.getElementById('ps-no-result');
            if (nr) { nr.textContent = text; nr.style.display = 'block'; }
            Lampa.Noty.show(text);
        }

        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

            var wrap = document.getElementById('ps-wrap');
            if (wrap) wrap.classList.remove('ps-active');

            showLoader(Lampa.Lang.translate('photo_search_identifying'));

            var formData = new FormData();
            formData.append('video', selectedFile);

            fetch('https://movie-identifier.com/api/process-video-clip', {
                method: 'POST',
                body: formData
            })
            .then(r => r.text())
            .then(text => {
                console.log('[Movie-Identifier] Raw:', text.substring(0, 500));

                if (text.toLowerCase().includes('not found')) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data = JSON.parse(text);
                if (!data.filmData || data.filmData.toLowerCase().includes('not found')) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed = JSON.parse(data.filmData);
                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (!results.length) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var best = results[0];
                var title = (best.name || best.title || '').trim();
                if (!title) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var year = best.year || null;
                if (year) year = String(year).replace(/\D.*$/, '').trim();

                console.log('[Movie-Identifier] Detected:', title, year ? 'year: ' + year : '');

                updateLoaderText(Lampa.Lang.translate('photo_search_searching_tmdb'));

                searchTmdb(title, year, best);
            })
            .catch(err => {
                hideLoader();
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + err.message);
                console.error(err);
            });
        }

        // ── TMDB SEARCH ────────────────────────────────────────────────────────
        function searchTmdb(title, year, identifierResult) {
            var lang = getTmdbLang();
            var apiKey = getTmdbApiKey();

            var url = 'https://api.themoviedb.org/3/search/multi?api_key=' + apiKey +
                      '&query=' + encodeURIComponent(title) +
                      '&language=' + lang +
                      '&page=1&include_adult=false';
            if (year) url += '&year=' + year;

            fetch(url)
            .then(r => {
                if (!r.ok) throw new Error('TMDB ' + r.status);
                return r.json();
            })
            .then(json => {
                var results = (json && json.results) ? json.results : [];
                results = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');

                if (!results.length && year) {
                    // повтор без року
                    url = url.replace('&year=' + year, '');
                    return fetch(url).then(r => r.json()).then(json2 => {
                        results = (json2 && json2.results) ? json2.results : [];
                        results = results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
                        processResults(results);
                    });
                }

                processResults(results);
            })
            .catch(err => {
                console.error('[TMDB] error:', err);
                hideLoader();
                Lampa.Modal.close();
                fallbackSearch(title);
            });

            function processResults(results) {
                if (!results.length) {
                    showNoResult(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var best = results[0];
                var confidence = identifierResult.confidence ? ' (' + identifierResult.confidence + '%)' : '';
                var info = [title, year, identifierResult.director].filter(Boolean).join(', ');

                Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + info + confidence);

                hideLoader();
                Lampa.Modal.close();

                setTimeout(() => {
                    openFullCard(best);
                }, 250);
            }
        }

        function openFullCard(card) {
            var method = card.media_type === 'tv' ? 'tv' : 'movie';
            if (!card.media_type) method = card.original_name ? 'tv' : 'movie';

            if (!card.title && card.name) card.title = card.name;
            if (!card.name && card.title) card.name = card.title;

            Lampa.Activity.push({
                component: 'full',
                id: card.id,
                method: method,
                card: card,
                source: 'tmdb'
            });
        }

        function fallbackSearch(title) {
            Lampa.Activity.push({
                component: 'search',
                query: title,
                title: title,
                page: 1,
                clear: true
            });

            setTimeout(() => {
                var input = $('.search__input input').first();
                if (input.length) {
                    input.val(title);
                    input.trigger('input');
                    input.trigger($.Event('keyup', { keyCode: 13 }));
                }
            }, 400);
        }

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
