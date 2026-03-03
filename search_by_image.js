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
        photo_search_uploading: {
            ru: 'Отправка на movie-identifier.com...',
            uk: 'Відправка на movie-identifier.com...',
            en: 'Sending to movie-identifier.com...'
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

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '1.2.0',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        Lampa.Manifest.plugins = manifest;

        /* ── Додаємо кнопку у шапку ── */
        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;

            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) {
                setTimeout(addHeaderButton, 1000);
                return;
            }

            var svgIcon =
                '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none">' +
                ' <g>' +
                '  <title>Layer 1</title>' +
                '  <g id="svg_17" transform="matrix(0.539435, 0, 0, 0.554343, 18.8769, 18.1628)">' +
                '   <svg width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000" id="svg_4" x="-41.22351" y="-38.89616">' +
                '    <g id="svg_13" stroke-width="0"/>' +
                '    <g id="svg_12" stroke-linecap="round" stroke-linejoin="round"/>' +
                '    <g id="svg_5">' +
                '     <g id="svg_9">' +
                '      <path fill="none" d="m0,0l24,0l0,24l-24,0l0,-24z" id="svg_11"/>' +
                '      <path d="m3,3l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm0,4l2,0l0,2l-2,0l0,-2zm-16,12l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm7.667,4l1.036,-1.555a1,1 0 0 1 0.832,-0.445l2.93,0a1,1 0 0 1 0.832,0.445l1.036,1.555l2.667,0a1,1 0 0 1 1,1l0,8a1,1 0 0 1 -1,1l-12,0a1,1 0 0 1 -1,-1l0,-8a1,1 0 0 1 1,-1l2.667,0zm-1.667,8l10,0l0,-6l-2.737,0l-1.333,-2l-1.86,0l-1.333,2l-2.737,0l0,6zm5,-1a2,2 0 1 1 0,-4a2,2 0 0 1 0,4z" id="svg_10" fill="currentColor"/>' +
                '     </g>' +
                '    </g>' +
                '   </svg>' +
                '  </g>' +
                ' </g>' +
                '</svg>';

            var button = $(
                '<div class="head__button head__action open--photo-search selector"' +
                ' style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;"' +
                ' title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon +
                '</div>'
            );

            searchButton.after(button);
            button.on('click', openPhotoSearchWindow);
        }

        /* ── Модальне вікно ── */
        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = $(
                '<div class="scroll scroll--over">' +
                '  <div class="scroll__content">' +
                '    <div class="scroll__body">' +

                /* Зона попереднього перегляду — кліком відкриває вибір файлу */
                '      <div id="photo-preview-wrap" class="selector"' +
                '           style="width:300px;height:169px;margin:0 auto 12px;' +
                '                  border:2px dashed #555;border-radius:10px;' +
                '                  display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                '                  background:#1a1a1a;color:#888;font-size:14px;cursor:pointer;' +
                '                  transition:border-color .2s,background .2s;' +
                '                  user-select:none;overflow:hidden;">' +
                '        <div id="photo-preview-inner">' +
                '          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"' +
                '               stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
                '               style="display:block;margin:0 auto 8px">' +
                '            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
                '            <circle cx="12" cy="13" r="4"/>' +
                '          </svg>' +
                '          <span>' + Lampa.Lang.translate('photo_search_click_hint') + '</span>' +
                '        </div>' +
                '      </div>' +

                /* Кнопки: Пошук | Закрити */
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
                onBack: function() {
                    Lampa.Modal.close();
                }
            });

            setTimeout(function() {
                /* Клік / наведення на прев'ю — вибір файлу */
                var wrap = document.getElementById('photo-preview-wrap');
                if (wrap) {
                    wrap.addEventListener('click', selectImageFromDevice);
                    wrap.addEventListener('mouseenter', function() {
                        wrap.style.borderColor = '#fff';
                        wrap.style.background  = '#222';
                    });
                    wrap.addEventListener('mouseleave', function() {
                        wrap.style.borderColor = '#555';
                        wrap.style.background  = '#1a1a1a';
                    });
                }

                $('#btn-search').on('click', sendImageToIdentifier);
                $('#btn-close').on('click', function() { Lampa.Modal.close(); });
            }, 100);
        }

        /* ── Вибір файлу ── */
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
                    var wrap  = document.getElementById('photo-preview-wrap');
                    var inner = document.getElementById('photo-preview-inner');
                    if (inner) {
                        inner.innerHTML =
                            '<img src="' + e.target.result + '"' +
                            ' style="max-width:100%;max-height:165px;' +
                            '        border-radius:6px;display:block;pointer-events:none;">';
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

        /* ── Відправка та пошук ── */
        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

            Lampa.Noty.show(Lampa.Lang.translate('photo_search_uploading'));

            var formData = new FormData();
            formData.append('video', selectedFile);

            fetch('https://movie-identifier.com/api/process-video-clip', {
                method: 'POST',
                body: formData
            })
            .then(function(r) { return r.text(); })
            .then(function(text) {
                console.log('[Movie-Identifier] Raw:', text.substring(0, 500));

                /* Перевірка «не знайдено» */
                if (!text || text.toLowerCase().includes('not found')) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data;
                try { data = JSON.parse(text); }
                catch(e) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                if (!data.filmData || data.filmData.toLowerCase().includes('not found')) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed;
                try { parsed = JSON.parse(data.filmData); }
                catch(e) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (!results.length) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var best  = results[0];
                var title = (best.name || best.title || '').trim();

                if (!title) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                Lampa.Noty.show(
                    Lampa.Lang.translate('photo_search_success') +
                    title +
                    (best.confidence ? ' (' + best.confidence + '%)' : '')
                );

                Lampa.Modal.close();

                /* ── Відкриваємо результати через Lampa ── */
                setTimeout(function() {
                    openSearchResults(title);
                }, 300);
            })
            .catch(function(err) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + err.message);
                console.error('[Movie-Identifier] error:', err);
            });
        }

        /* ── Відображення результатів через нативний пошук Lampa ── */
        function openSearchResults(title) {
            /* Спосіб 1: компонент search з автозапуском */
            try {
                Lampa.Activity.push({
                    component: 'search',
                    search: title,
                    search_auto: true,
                    title: title,
                    page: 1
                });
                return;
            } catch(e) {
                console.warn('[Movie-Identifier] Activity.push search failed:', e);
            }

            /* Спосіб 2: Lampa.Search API */
            try {
                if (Lampa.Search && typeof Lampa.Search.open === 'function') {
                    Lampa.Search.open(title);
                    return;
                }
            } catch(e) {
                console.warn('[Movie-Identifier] Lampa.Search.open failed:', e);
            }

            /* Спосіб 3: емуляція вводу в поле пошуку */
            try {
                var btn = $('.open--search').first();
                if (btn.length) btn.trigger('click');

                setTimeout(function() {
                    var input = $('input[name="search"], .search__input input, .search input').first();
                    if (input.length) {
                        input.val(title).trigger('input');
                        setTimeout(function() {
                            input.trigger($.Event('keyup', { keyCode: 13, which: 13 }));
                        }, 200);
                    }
                }, 500);
            } catch(e) {
                console.warn('[Movie-Identifier] fallback search failed:', e);
            }
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
