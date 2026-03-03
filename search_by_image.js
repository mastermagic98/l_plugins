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
            en: 'Download'
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
            version: '1.0.0',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        Lampa.Manifest.plugins = manifest;

        function addHeaderButton() {
            var buttonHtml = '' +
                '<div class="head__button open--photo-search" style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;" title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                '<span style="font-size:24px;">📸</span>' +
                '</div>';

            var button = $(buttonHtml);

            $('.head__body').append(button);

            button.on('click', function() {
                openPhotoSearchWindow();
            });
        }

        function openPhotoSearchWindow() {
            selectedFile = null;

            var html = '' +
                '<div style="padding:20px;text-align:center;">' +
                '  <div id="photo-preview" style="width:280px;height:280px;margin:0 auto 20px;border:2px dashed #666;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#1c1c1c;">' +
                '    <span style="color:#888;font-size:14px;">Прев’ю зображення</span>' +
                '  </div>' +
                '  <div style="margin-bottom:20px;color:#aaa;font-size:13px;">' +
                '    Натисніть «Завантажити», щоб вибрати фото з пристрою<br>(працює на Windows, Mac, Android)' +
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
                ],
                onBack: function() {
                    Lampa.Modal.close();
                }
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
                        var previewContainer = $('#photo-preview');
                        previewContainer.html('<img src="' + e.target.result + '" style="max-width:100%;max-height:100%;border-radius:6px;">');
                    };
                    reader.readAsDataURL(file);

                    Lampa.Noty.show('Зображення успішно вибрано');
                }
            };

            document.body.appendChild(input);
            input.click();
            setTimeout(function() {
                document.body.removeChild(input);
            }, 1000);
        }

        function sendImageToIdentifier() {
            if (!selectedFile) {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_no_file'));
                return;
            }

            Lampa.Noty.show(Lampa.Lang.translate('photo_search_uploading'));

            var formData = new FormData();
            formData.append('file', selectedFile);   // ← якщо на сайті інша назва поля (наприклад image або video), замініть тут

            // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
            // Замініть URL і поле форми на реальні після перевірки в DevTools на сайті movie-identifier.com
            // (відкрийте сайт, натисніть Upload File, у вкладці Network знайдіть POST-запит)
            // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

            fetch('https://www.movie-identifier.com/', {   // тут буде реальний endpoint після перевірки
                method: 'POST',
                body: formData
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();   // або .json() якщо сайт повертає JSON
            })
            .then(function(data) {
                // Приклад парсингу — підлаштуйте під реальну відповідь сайту
                var title = null;

                try {
                    var json = JSON.parse(data);
                    title = json.title || json.movie || json.name || null;
                } catch (e) {
                    // якщо HTML — шукаємо заголовок або текст
                    var match = data.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                                data.match(/movie[:\s]+([^<]+)/i) ||
                                data.match(/title[:\s]+([^<]+)/i);
                    if (match) title = match[1].trim();
                }

                if (title) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + title);

                    // Відкриваємо стандартний пошук Lampa (як пошук за словами)
                    Lampa.Activity.push({
                        component: 'search',
                        query: title,
                        title: Lampa.Lang.translate('photo_search_title') + ': ' + title,
                        page: 1
                    });

                    Lampa.Modal.close();
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
