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
        photo_search_select_photo: {
            ru: 'Выбрать фото',
            uk: 'Вибрати фото',
            en: 'Select photo'
        }
    });

    function injectCSS() {
        if (document.getElementById('ps-css')) return;
        var s = document.createElement('style');
        s.id = 'ps-css';
        s.textContent = [
            '#ps-preview{',
                'width:300px;height:169px;',
                'margin:0 auto 16px;',
                'border:2px dashed #555;',
                'border-radius:10px;',
                'background:#1a1a1a;',
                'display:flex;align-items:center;justify-content:center;',
                'overflow:hidden;',
                'position:relative;',
            '}',
            '#ps-preview img{',
                'max-width:100%;max-height:100%;object-fit:contain;',
            '}',
            '#ps-select-btn{',
                'padding:12px 24px;',
                'background:#2a2a2a;',
                'border:1px solid #444;',
                'border-radius:8px;',
                'color:#fff;',
                'font-size:15px;',
                'margin:0 auto 20px;',
                'display:block;',
                'cursor:pointer;',
            '}',
            '#ps-loader{',
                'display:none;',
                'flex-direction:column;',
                'align-items:center;',
                'gap:12px;',
            '}',
            '#ps-loader.ps-show{ display:flex; }',
            '#ps-no-result{',
                'display:none;',
                'margin-top:16px;',
                'color:#ff6b6b;',
                'font-size:15px;',
                'text-align:center;',
            '}'
        ].join('');
        document.head.appendChild(s);
    }

    function startPlugin() {
        Lampa.Manifest.plugins = {
            type: 'other',
            version: '1.5.2',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        injectCSS();

        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;
            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) { setTimeout(addHeaderButton, 1000); return; }

            var svgIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                          '<path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/></svg>';

            var button = $(
                '<div class="head__action open--photo-search selector" title="' +
                Lampa.Lang.translate('photo_search_button') + '">' + svgIcon + '</div>'
            );
            searchButton.after(button);
            button.on('click', openPhotoSearchWindow);
        }

        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = $(
                '<div class="scroll scroll--over">' +
                ' <div class="scroll__content">' +
                '  <div class="scroll__body" style="padding:20px;text-align:center;">' +
                '   <div id="ps-preview">' +
                '    <div style="color:#888;font-size:18px;">Прев’ю зображення</div>' +
                '   </div>' +
                '   <label for="ps-file-input" id="ps-select-btn" class="selector">' +
                Lampa.Lang.translate('photo_search_select_photo') +
                '   </label>' +
                '   <input type="file" id="ps-file-input" accept="image/*" ' +
                '    style="display:none;">' +
                '   <div id="ps-loader">' +
                '    <div style="width:48px;height:48px;background:url(./img/loader.svg) no-repeat center/contain;"></div>' +
                '    <div id="ps-loader-text" style="color:#aaa;font-size:14px;"></div>' +
                '   </div>' +
                '   <div id="ps-no-result"></div>' +
                '   <div class="modal__footer" style="justify-content:center;gap:16px;margin-top:24px;">' +
                '    <div id="ps-btn-search" class="modal__button selector">' + Lampa.Lang.translate('photo_search_send') + '</div>' +
                '    <div id="ps-btn-close" class="modal__button selector">' + Lampa.Lang.translate('photo_search_close') + '</div>' +
                '   </div>' +
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
                var fileInput = document.getElementById('ps-file-input');
                var preview = document.getElementById('ps-preview');
                var loader = document.getElementById('ps-loader');
                var loaderText = document.getElementById('ps-loader-text');
                var noResult = document.getElementById('ps-no-result');

                if (fileInput) {
                    fileInput.addEventListener('change', function(e) {
                        var file = e.target.files[0];
                        if (!file) return;
                        selectedFile = file;

                        if (noResult) noResult.style.display = 'none';

                        var reader = new FileReader();
                        reader.onload = function(ev) {
                            preview.innerHTML = '<img src="' + ev.target.result + '" ' +
                                               'style="width:100%;height:100%;object-fit:contain;border-radius:8px;">';
                        };
                        reader.readAsDataURL(file);
                    });
                }

                $('#ps-btn-search').on('click', sendImageToIdentifier);
                $('#ps-btn-close').on('click', function() { Lampa.Modal.close(); });
            }, 100);
        }

        function showLoader(text) {
            var preview = document.getElementById('ps-preview');
            var loader = document.getElementById('ps-loader');
            var ltxt = document.getElementById('ps-loader-text');
            var btn = document.getElementById('ps-btn-search');
            if (preview) preview.style.opacity = '0.4';
            if (loader) loader.style.display = 'flex';
            if (ltxt) ltxt.textContent = text || '';
            if (btn) btn.style.pointerEvents = 'none';
        }

        function hideLoader() {
            var preview = document.getElementById('ps-preview');
            var loader = document.getElementById('ps-loader');
            var btn = document.getElementById('ps-btn-search');
            if (preview) preview.style.opacity = '1';
            if (loader) loader.style.display = 'none';
            if (btn) btn.style.pointerEvents = '';
        }

        function showNoResult(text) {
            hideLoader();
            var nr = document.getElementById('ps-no-result');
            if (nr) {
                nr.textContent = text;
                nr.style.display = 'block';
            }
            Lampa.Noty.show(text);
        }

        // ── решта коду (sendImageToIdentifier, searchTmdb, openFullCard, fallbackSearch) ──
        // залишається без змін, тільки вставляємо сюди з попередньої версії

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

                hideLoader();
                Lampa.Modal.close();

                setTimeout(() => {
                    searchTmdb(title, year, best);
                }, 200);
            })
            .catch(err => {
                hideLoader();
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + err.message);
                console.error(err);
            });
        }

        // ── TMDB та решта функцій (searchTmdb, openFullCard, fallbackSearch) ──
        // копіюй з попередньої версії або залиш без змін

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
