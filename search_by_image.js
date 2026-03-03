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
            version: '1.0.1',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        Lampa.Manifest.plugins = manifest;

        function addHeaderButton() {
            // SVG-іконка, яку ви надали (масштабована до 24px, fill currentColor)
            var svgIcon = '' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '  <path d="M17.25,3 C19.3210678,3 21,4.67893219 21,6.75 L21,17.25 C21,19.3210678 19.3210678,21 17.25,21 L6.75,21 C4.67893219,21 3,19.3210678 3,17.25 L3,6.75 C3,4.67893219 4.67893219,3 6.75,3 L17.25,3 Z M17.25,4.5 L6.75,4.5 C5.50735931,4.5 4.5,5.50735931 4.5,6.75 L4.5,17.25 C4.5,18.4926407 5.50735931,19.5 6.75,19.5 L17.25,19.5 C18.4926407,19.5 19.5,18.4926407 19.5,17.25 L19.5,6.75 C19.5,5.50735931 18.4926407,4.5 17.25,4.5 Z M17.25,13 C17.6642136,13 18,13.3357864 18,13.75 L18,16 C18,17.1046 17.1046,18 16,18 L13.75,18 C13.3357864,18 13,17.6642136 13,17.25 C13,16.8357864 13.3357864,16.5 13.75,16.5 L16,16.5 C16.2761,16.5 16.5,16.2761 16.5,16 L16.5,13.75 C16.5,13.3357864 16.8357864,13 17.25,13 Z M6.75,13 C7.16421356,13 7.5,13.3357864 7.5,13.75 L7.5,16 C7.5,16.2761 7.72386,16.5 8,16.5 L10.25,16.5 C10.6642136,16.5 11,16.8357864 11,17.25 C11,17.6642136 10.6642136,18 10.25,18 L8,18 C6.89543,18 6,17.1046 6,16 L6,13.75 C6,13.3357864 6.33578644,13 6.75,13 Z M8,6 L10.25,6 C10.6642136,6 11,6.33578644 11,6.75 C11,7.12969577 10.7178461,7.44349096 10.3517706,7.49315338 L10.25,7.5 L8,7.5 C7.75454222,7.5 7.5503921,7.67687704 7.50805575,7.91012499 L7.5,8 L7.5,10.25 C7.5,10.6642136 7.16421356,11 6.75,11 C6.37030423,11 6.05650904,10.7178461 6.00684662,10.3517706 L6,10.25 L6,8 C6,6.94563773 6.81587733,6.08183483 7.85073759,6.00548573 L8,6 L10.25,6 L8,6 Z M16,6 C17.1046,6 18,6.89543 18,8 L18,10.25 C18,10.6642136 17.6642136,11 17.25,11 C16.8357864,11 16.5,10.6642136 16.5,10.25 L16.5,8 C16.5,7.72386 16.2761,7.5 16,7.5 L13.75,7.5 C13.3357864,7.5 13,7.16421356 13,6.75 C13,6.33578644 13.3357864,6 13.75,6 L16,6 Z" fill="currentColor"/>' +
                '</svg>';

            var buttonHtml = '' +
                '<div class="head__button head__action open--photo-search selector" ' +
                'style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;" ' +
                'title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon +
                '</div>';

            var button = $(buttonHtml);

            // Розміщуємо СТРОГО після іконки пошуку (лупи)
            $('.head .open--search').after(button);

            button.on('click', function() {
                openPhotoSearchWindow();
            });
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
                // onBack видалено — Lampa сама закриває модалку
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
            formData.append('file', selectedFile);   // ← якщо поле називається інакше (image, screenshot тощо) — змініть тут

            // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
            // Відкрийте https://www.movie-identifier.com/ у браузері
            // Натисніть Upload → DevTools → Network → знайдіть POST-запит
            // Скопіюйте точний URL і назву поля файлу замість рядка нижче
            // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

            fetch('https://www.movie-identifier.com/upload', {   // ← замініть на реальний endpoint
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

                    // Виправлення помилки startHide
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
