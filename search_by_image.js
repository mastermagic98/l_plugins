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
            ru: 'Пошук за фото',
            uk: 'Пошук за фото',
            en: 'Search by photo'
        },
        photo_search_load: {
            ru: 'Завантажити',
            uk: 'Завантажити',
            en: 'Load'
        },
        photo_search_send: {
            ru: 'Відправити',
            uk: 'Відправити',
            en: 'Send'
        },
        photo_search_no_file: {
            ru: 'Спочатку завантажте зображення',
            uk: 'Спочатку завантажте зображення',
            en: 'First select an image'
        },
        photo_search_uploading: {
            ru: 'Відправка на movie-identifier.com...',
            uk: 'Відправка на movie-identifier.com...',
            en: 'Sending to movie-identifier.com...'
        },
        photo_search_success: {
            ru: 'Знайдено: ',
            uk: 'Знайдено: ',
            en: 'Found: '
        },
        photo_search_error: {
            ru: 'Не вдалося розпізнати фільм',
            uk: 'Не вдалося розпізнати фільм',
            en: 'Failed to identify the movie'
        },
        photo_search_network_error: {
            ru: 'Помилка мережі: ',
            uk: 'Помилка мережі: ',
            en: 'Network error: '
        }
    });

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '1.0.2',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        Lampa.Manifest.plugins = manifest;

        function addHeaderButton() {
            // Захист від дублювання кнопки
            if ($('.open--photo-search').length > 0) return;

            // Надійний пошук кнопки «лупа» (пошук)
            var searchButton = $('.head .open--search, .head__button.open--search');
            
            if (searchButton.length === 0) {
                console.log('[Photo Search] Кнопка пошуку ще не завантажена, повторюю через 1 сек...');
                setTimeout(addHeaderButton, 1000);
                return;
            }

            // НОВА ІКОНКА (яку ви надали, очищена і адаптована)
            var svgIcon = '' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '  <path d="m3,3l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm4,0l2,0l0,2l-2,0l0,-2zm0,4l2,0l0,2l-2,0l0,-2zm-16,12l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm0,-4l2,0l0,2l-2,0l0,-2zm7.667,4l1.036,-1.555a1,1 0 0 1 0.832,-0.445l2.93,0a1,1 0 0 1 0.832,0.445l1.036,1.555l2.667,0a1,1 0 0 1 1,1l0,8a1,1 0 0 1 -1,1l-12,0a1,1 0 0 1 -1,-1l0,-8a1,1 0 0 1 1,-1l2.667,0zm-1.667,8l10,0l0,-6l-2.737,0l-1.333,-2l-1.86,0l-1.333,2l-2.737,0l0,6zm5,-1a2,2 0 1 1 0,-4a2,2 0 0 1 0,4z" fill="currentColor"/>' +
                '</svg>';

            var buttonHtml = '' +
                '<div class="head__button head__action open--photo-search selector" ' +
                'style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;" ' +
                'title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon +
                '</div>';

            var button = $(buttonHtml);

            // Розміщуємо СТРОГО після кнопки пошуку (лупи)
            searchButton.after(button);

            button.on('click', function() {
                openPhotoSearchWindow();
            });

            console.log('[Photo Search] Кнопка з новою іконкою успішно додана після лупи');
        }

        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = '' +
                '<div style="padding:20px;text-align:center;">' +
                '  <div id="photo-preview" style="width:280px;height:280px;margin:0 auto 20px;border:2px dashed #666;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#1c1c1c;color:#888;font-size:14px;">' +
                '    Прев’ю зображення' +
                '  </div>' +
                '  <div style="margin-bottom:20px;color:#aaa;font-size:13px;">' +
                '    Натисніть «Завантажити», щоб вибрати фото з пристрою<br>(Windows, Mac, Android)' +
                '  </div>' +
                '</div>';

            Lampa.Modal.open({
                title: Lampa.Lang.translate('photo_search_title'),
                html: html,
                buttons: [
                    {
                        name: Lampa.Lang.translate('photo_search_load'),
                        onSelect: function() {
                            selectImageFromDevice();
                        }
                    },
                    {
                        name: Lampa.Lang.translate('photo_search_send'),
                        onSelect: function() {
                            sendImageToIdentifier();
                        }
                    }
                ]
            });
        }

        function selectImageFromDevice() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = function(event) {
                var file = event.target.files[0];
                if (file) {
                    selectedFile = file;

                    var reader = new FileReader();
                    reader.onload = function(e) {
                        $('#photo-preview').html('<img src="' + e.target.result + '" style="max-width:100%;max-height:100%;border-radius:6px;">');
                    };
                    reader.readAsDataURL(file);

                    Lampa.Noty.show('Зображення успішно вибрано');
                }
            };

            document.body.appendChild(input);
            input.click();
            setTimeout(function() {
                if (input.parentNode) document.body.removeChild(input);
            }, 1000);
        }

        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

            Lampa.Noty.show(Lampa.Lang.translate('photo_search_uploading'));

            var formData = new FormData();
            formData.append('file', selectedFile);   // ← якщо поле на сайті інше — змініть тут

            fetch('https://www.movie-identifier.com/upload', {   // ← замініть на точний endpoint після перевірки в DevTools
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(function(data) {
                var title = null;

                try {
                    var json = JSON.parse(data);
                    title = json.title || json.movie || json.name || null;
                } catch (e) {
                    var match = data.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                                data.match(/movie[:\s]+([^<]+)/i) ||
                                data.match(/title[:\s]+([^<]+)/i);
                    if (match) title = match[1].trim();
                }

                if (title) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + title);

                    Lampa.Activity.push({
                        component: 'search',
                        query: title,
                        title: Lampa.Lang.translate('photo_search_title') + ': ' + title,
                        page: 1
                    });

                    setTimeout(function() {
                        Lampa.Modal.close();
                    }, 150);
                } else {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_error'));
                    console.log('Відповідь сайту:', data);
                }
            })
            .catch(function(error) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + error.message);
                console.error('Помилка відправки:', error);
            });
        }

        if (window.appready) {
            addHeaderButton();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    addHeaderButton();
                }
            });
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
