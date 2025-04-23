(function () {
    'use strict';

    // Встановлюємо платформу в режим телевізора
    Lampa.Platform.tv();

    // Додаємо налаштування для вмикання/вимикання відображення логотипу
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'logo_card',
            type: 'object',
            default: true
        },
        field: {
            name: 'Відображати логотип замість назви'
        },
        onRender: function () {
            // Видаляємо елемент налаштування logo_card з інтерфейсу
            setTimeout(() => {
                $('div[data-name="logo_card"]').remove();
            }, 0);
        }
    });

    // Слухаємо подію 'full' для обробки відображення медіа
    Lampa.Listener.follow('full', function (event) {
        // Перевіряємо, чи це подія для фільму та чи ввімкнено відображення логотипу
        if (event.type === 'movie' && Lampa.Storage.get('logo_card') !== false) {
            // Отримуємо дані медіаоб’єкта
            const item = event.data.movie;
            // Визначаємо тип медіа: серіал (tv) чи фільм (movie)
            const mediaType = item.name ? 'tv' : 'movie';
            // Фіксований API-ключ для TMDB
            const apiKey = '4ef0d7355d9ffb5151e987764708ce96';
            // URL проксі-сервера
            const proxyUrl = 'http://212.113.103.137:9118/proxy/';
            // Базова URL для зображень TMDB
            const tmdbImageBase = 'http://image.tmdb.org/t/p/w500';

            // Формуємо URL для запиту логотипів із TMDB
            const apiUrl = `http://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}&language=${Lampa.Storage.get('language')}`;

            // Виконуємо запит до TMDB API
            $.get(apiUrl, function (response) {
                // Перевіряємо, чи є логотипи в відповіді
                if (response.logos && response.logos[0]) {
                    // Отримуємо шлях до логотипу
                    let logoPath = response.logos[0].file_path;
                    if (logoPath !== '') {
                        // Отримуємо HTML-елемент картки медіа
                        const card = event.render.full.html();
                        let logoHtml;

                        // Логіка відображення залежно від розміру екрана та налаштувань
                        if (window.innerWidth > 585) {
                            // Для більших екранів (>585px)
                            if (Lampa.Storage.get('card_interfice_type') === 'new' && !$('div[data-name="card_interfice_cover"]').length) {
                                // Новий інтерфейс, без обкладинки
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'new' && $('div[data-name="card_interfice_cover"]').length) {
                                // Новий інтерфейс, з обкладинкою
                                logoHtml = `<img style="margin-top: 0.6em; margin-bottom: 0.4em; max-height: 2.8em; max-width: 6.8em;" src="${proxyUrl}${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__title', card).html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !$('div[data-name="card_interfice_cover"]').length) {
                                // Старий інтерфейс, без обкладинки
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${proxyUrl}${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            }
                        } else {
                            // Для менших екранів
                            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                // Новий інтерфейс
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            } else {
                                // Старий інтерфейс або інші випадки
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="${proxyUrl}${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            }
                        }
                    }
                }
            });
        }
    });

    // Перевіряємо готовність програми
    if (window.appready) {
        // Якщо програма вже готова, нічого не робимо (логіка вже виконана вище)
    } else {
        // Слухаємо подію готовності програми
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                // Логіка виконається, коли програма буде готова
            }
        });
    }
})();
