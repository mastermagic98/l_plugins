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
        photo_search_not_found: {
            ru: 'Фільм не знайдено. Спробуйте інше фото',
            uk: 'Фільм не знайдено. Спробуйте інше фото',
            en: 'Movie not found. Try another photo'
        },
        photo_search_server_error: {
            ru: 'Сервер повернув помилку. Деталі в консолі.',
            uk: 'Сервер повернув помилку. Деталі в консолі.',
            en: 'Server error. Check console for details.'
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
            version: '1.1.6',
            name: Lampa.Lang.translate('photo_search_title'),
            description: Lampa.Lang.translate('photo_search_description'),
            component: 'photo_search'
        };

        Lampa.Manifest.plugins = manifest;

        function addHeaderButton() {
            if ($('.open--photo-search').length > 0) return;

            var searchButton = $('.head .open--search, .head__button.open--search');
            if (searchButton.length === 0) {
                setTimeout(addHeaderButton, 1000);
                return;
            }

            var svgIcon = '' +
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

            var buttonHtml = '' +
                '<div class="head__button head__action open--photo-search selector" ' +
                'style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;margin:0 4px;cursor:pointer;" ' +
                'title="' + Lampa.Lang.translate('photo_search_button') + '">' +
                svgIcon +
                '</div>';

            var button = $(buttonHtml);
            searchButton.after(button);

            button.on('click', function() {
                openPhotoSearchWindow();
            });
        }

        function openPhotoSearchWindow() {
            selectedFile = null;

            var htmlString = '' +
                '<div class="scroll scroll--over">' +
                '    <div class="scroll__content">' +
                '        <div class="scroll__body">' +
                '            <div style="text-align:center;">' +
                '                <div id="photo-preview" style="width:300px;height:169px;margin:0 auto 20px;border:2px dashed #666;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#1c1c1c;color:#888;font-size:18px;">' +
                '                    Прев’ю зображення' +
                '                </div>' +
                '                <div style="color:#aaa;font-size:16px;">' +
                '                    Натисніть «Завантажити», щоб вибрати фото з пристрою<br>(Windows, Mac, Android)' +
                '                </div>' +
                '            </div>' +
                '            <div class="modal__footer" style="justify-content:center;">' +
                '                <div id="btn-load" class="modal__button selector">' + Lampa.Lang.translate('photo_search_load') + '</div>' +
                '                <div id="btn-send" class="modal__button selector">' + Lampa.Lang.translate('photo_search_send') + '</div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>';

            Lampa.Modal.open({
                title: Lampa.Lang.translate('photo_search_title'),
                html: $(htmlString),
                size: 'medium',
                onBack: function() {
                    setTimeout(function() { Lampa.Modal.close(); }, 150);
                }
            });

            setTimeout(function() {
                $('#btn-load').on('click', selectImageFromDevice);
                $('#btn-send').on('click', sendImageToIdentifier);
            }, 100);
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
                    Lampa.Noty.show('Зображення вибрано');
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
            formData.append('video', selectedFile);

            fetch('https://movie-identifier.com/api/process-video-clip', {
                method: 'POST',
                body: formData
            })
            .then(r => r.text())
            .then(text => {
                console.log('[Movie-Identifier] Raw:', text.substring(0, 500));

                if (text.includes('Not found') || text.includes('not found')) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var data = JSON.parse(text);
                if (!data.filmData || data.filmData.includes('Not found')) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var parsed = JSON.parse(data.filmData);
                var results = Array.isArray(parsed) ? parsed : [parsed];
                if (results.length === 0) {
                    Lampa.Noty.show(Lampa.Lang.translate('photo_search_not_found'));
                    return;
                }

                var best = results[0];
                var title = best.name.trim();

                Lampa.Noty.show(Lampa.Lang.translate('photo_search_success') + title + ' (' + best.confidence + '%)');

                // Закриваємо модалку
                Lampa.Modal.close();

                // Відкриваємо повноцінну сторінку пошуку з картками (як при звичайному пошуку)
                setTimeout(() => {
                    Lampa.Activity.push({
                        component: 'search',
                        query: title,
                        title: 'Пошук за фото: ' + title,
                        page: 1,
                        clear: true
                    });
                }, 300);
            })
            .catch(err => {
                Lampa.Noty.show(Lampa.Lang.translate('photo_search_network_error') + err.message);
                console.error('Movie-Identifier error:', err);
            });
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
