(function () {
    'use strict';
    // Функція для заміни логотипу замість назви в інтерфейсі
    (function () {
        // Додавання параметру в налаштування для увімкнення/вимкнення заміни логотипу
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_glav',
                type: 'select',
                values: {
                    '1': 'Скрыть',
                    '0': 'Отображать'
                },
                default: '0'
            },
            field: {
                name: 'Логотипи замість назв',
                description: 'Відображає логотипи фільмів замість тексту'
            }
        });

        // Перевірка, чи плагін уже ініціалізований
        if (window.logoplugin) return;
        window.logoplugin = true;
        console.log('Plugin initialized'); // Лог для діагностики

        // Підписка на подію активності для обробки повноекранного режиму
        Lampa.Listener.follow('full', function (event) {
            // Логування всіх подій full для діагностики
            console.log('Full event triggered:', event.type, event.data); // Лог для діагностики
            // Перевірка, чи подія є завершенням рендерингу або типом movie та чи увімкнена заміна логотипу
            // Примітка: якщо 'complite' або 'movie' не працюють, перевірте логи для інших типів (наприклад, 'render', 'ready')
            if ((event.type == 'complite' || event.type == 'movie') && Lampa.Storage.get('logo_glav') != '1') {
                var item = event.data.movie;
                var mediaType = item.name ? 'tv' : 'movie';
                // Формування URL для запиту логотипу з TMDB
                var url = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
                console.log('TMDB URL:', url); // Лог для діагностики

                // Виконання AJAX-запиту для отримання логотипів
                $.get(url, function (response) {
                    console.log('TMDB response:', response.logos ? response.logos : 'No logos'); // Лог для діагностики
                    if (response.logos && response.logos[0]) {
                        var logoPath = response.logos[0].file_path;
                        console.log('Logo path:', logoPath); // Лог для діагностики
                        if (logoPath !== '') {
                            var card = event.object.activity.render();
                            console.log('Title element found:', card.find('.full-start-new__title').length); // Лог для діагностики
                            var logoHtml;
                            // Логіка залежно від налаштувань та ширини екрану
                            if (window.innerWidth > 585) {
                                if (Lampa.Storage.get('card_interfice_type') === 'new' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                    logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" />';
                                    card.find('.full-start-new__tagline').remove();
                                    card.find('.full-start-new__title').html(logoHtml);
                                    console.log('Rendered logo (new, no cover, desktop):', logoHtml); // Лог для діагностики
                                } else if (Lampa.Storage.get('card_interfice_type') === 'new' && card.find('div[data-name="card_interfice_cover"]').length) {
                                    logoHtml = '<img style="margin-top: 0.6em; margin-bottom: 0.4em; max-height: 2.8em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + 'http://212.113.103.137:9118/proxyimg/' + '" />';
                                    card.find('.full-start-new__title').html(logoHtml);
                                    console.log('Rendered logo (new, with cover, desktop):', logoHtml); // Лог для діагностики
                                } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                    logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + 'http://212.113.103.137:9118/proxyimg/' + '" />';
                                    card.find('.full-start__title-original').remove();
                                    card.find('.full-start__title').html(logoHtml);
                                    console.log('Rendered logo (old, no cover, desktop):', logoHtml); // Лог для діагностики
                                }
                            } else {
                                if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                    logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" />';
                                    card.find('.full-start-new__tagline').remove();
                                    card.find('.full-start-new__title').html(logoHtml);
                                    console.log('Rendered logo (new, mobile):', logoHtml); // Лог для діагностики
                                } else {
                                    logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + 'http://212.113.103.137:9118/proxyimg/' + '" />';
                                    card.find('.full-start__title-original').remove();
                                    card.find('.full-start__title').html(logoHtml);
                                    console.log('Rendered logo (old, mobile):', logoHtml); // Лог для діагностики
                                }
                            }
                        }
                    }
                }).fail(function (xhr, status, error) {
                    console.log('TMDB request failed:', status, error); // Лог для діагностики
                });
            }
        });
    })();
})();
