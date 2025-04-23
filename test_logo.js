(function () {
    'use strict';

    // Встановлюємо платформу
    Lampa.Platform.tv();

 

    // Додаємо налаштування
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
            setTimeout(() => {
                $('div[data-name="logo_card"]').remove();
            }, 0);
        }
    });

    // Функція для обробки події full
    function handleFullEvent(event) {
        if (event.type === 'movie' && Lampa.Storage.get('logo_card') !== false) {
            console.log('Обробка події full:', event.type);
            const item = event.data.movie;
            const mediaType = item.name ? 'tv' : 'movie';
            const apiKey = '4ef0d7355d9ffb5151e987764708ce96';
            const proxyUrl = 'http://212.113.103.137:9118/proxy/';
            const tmdbImageBase = 'http://image.tmdb.org/t/p/w500';
            const apiUrl = `http://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}&language=${Lampa.Storage.get('language')}`;

            $.get(apiUrl, function (response) {
                console.log('TMDB відповідь:', response);
                if (response.logos && response.logos[0]) {
                    let logoPath = response.logos[0].file_path;
                    if (logoPath !== '') {
                        const card = event.render.full.html();
                        let logoHtml;

                        // Обробка для нового інтерфейсу
                        if (Lampa.Storage.get('card_interfice_type') === 'new') {
                            if (window.innerWidth > 585 && !$('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            } else {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start-new__tagline', card).remove();
                                $('.full-start-new__title', card).html(logoHtml);
                            }
                        }
                        // Обробка для старого інтерфейсу
                        else {
                            if (window.innerWidth > 585 && !$('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="${proxyUrl}${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            } else {
                                logoHtml = `<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="${proxyUrl}${tmdbImageBase}${logoPath.replace('.svg', '.png')}" />`;
                                $('.full-start__title-original', card).remove();
                                $('.full-start__title', card).html(logoHtml);
                            }
                        }
                    }
                }
            });
        }
    }

    // Ініціалізація для нового інтерфейсу
    function initializeNewInterface() {
        console.log('Ініціалізація нового інтерфейсу');
        Lampa.Listener.follow('full', handleFullEvent);
    }

    // Ініціалізація для старого інтерфейсу
    function initializeOldInterface() {
        console.log('Ініціалізація старого інтерфейсу');
        Lampa.Listener.follow('full', handleFullEvent);
    }

    // Запускаємо ініціалізацію
    if (window.appready) {
        initializeNewInterface();
        initializeOldInterface();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initializeNewInterface();
                initializeOldInterface();
            }
        });
    }
})();
