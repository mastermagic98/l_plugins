(function () {
    'use strict';
    // Функція для заміни логотипу замість назви в інтерфейсі
    (function () {
        // Додавання локалізації для плагіна
        Lampa.Lang.add({
            logo_main_title: {
                en: 'Logos instead of titles',
                uk: 'Логотипи замість назв',
                ru: 'Логотипы вместо названий'
            },
            logo_main_description: {
                en: 'Displays movie logos instead of text',
                uk: 'Відображає логотипи фільмів замість тексту',
                ru: 'Отображает логотипы фильмов вместо текста'
            },
            logo_main_show: {
                en: 'Show',
                uk: 'Показати',
                ru: 'Отображать'
            },
            logo_main_hide: {
                en: 'Hide',
                uk: 'Приховати',
                ru: 'Скрыть'
            },
            logo_display_mode_title: {
                en: 'Display mode',
                uk: 'Режим відображення',
                ru: 'Режим отображения'
            },
            logo_display_mode_logo_only: {
                en: 'Logo only',
                uk: 'Тільки логотип',
                ru: 'Только логотип'
            },
            logo_display_mode_logo_and_text: {
                en: 'Logo and text',
                uk: 'Логотип і текст',
                ru: 'Логотип и текст'
            }
        });

        // Додавання параметру для увімкнення/вимкнення заміни логотипу
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_main',
                type: 'select',
                values: {
                    '1': Lampa.Lang.translate('logo_main_hide'),
                    '0': Lampa.Lang.translate('logo_main_show')
                },
                default: '0'
            },
            field: {
                name: Lampa.Lang.translate('logo_main_title'),
                description: Lampa.Lang.translate('logo_main_description')
            }
        });

        // Додавання параметру для вибору режиму відображення
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_display_mode',
                type: 'select',
                values: {
                    'logo_only': Lampa.Lang.translate('logo_display_mode_logo_only'),
                    'logo_and_text': Lampa.Lang.translate('logo_display_mode_logo_and_text')
                },
                default: 'logo_only'
            },
            field: {
                name: Lampa.Lang.translate('logo_display_mode_title'),
                description: Lampa.Lang.translate('logo_main_description')
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
            if ((event.type == 'complite' || event.type == 'movie') && Lampa.Storage.get('logo_main') != '1') {
                var item = event.data.movie;
                var mediaType = item.name ? 'tv' : 'movie';
                var currentLang = Lampa.Storage.get('language');
                // Формування URL для запиту логотипу з TMDB (поточна мова)
                var url = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);
                console.log('TMDB URL (current lang):', url); // Лог для діагностики

                // Виконання AJAX-запиту для отримання логотипів
                $.get(url, function (response) {
                    console.log('TMDB response (current lang):', response.logos ? response.logos : 'No logos'); // Лог для діагностики
                    if (response.logos && response.logos[0]) {
                        // Логотип знайдено для поточної мови (uk/ru)
                        renderLogo(response.logos[0].file_path, event, mediaType, currentLang);
                    } else if (currentLang !== 'en') {
                        // Якщо логотип відсутній і мова не англійська, спробувати англійську
                        var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
                        console.log('TMDB URL (en):', enUrl); // Лог для діагностики
                        $.get(enUrl, function (enResponse) {
                            console.log('TMDB response (en):', enResponse.logos ? enResponse.logos : 'No logos'); // Лог для діагностики
                            if (enResponse.logos && enResponse.logos[0]) {
                                // Використати англійський логотип
                                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
                            } else {
                                console.log('No logo available for any language'); // Лог для діагностики
                                // Назва залишиться мовою інтерфейсу
                            }
                        }).fail(function (xhr, status, error) {
                            console.log('TMDB request failed (en):', status, error); // Лог для діагностики
                        });
                    } else {
                        console.log('No logo available for current language'); // Лог для діагностики
                        // Назва залишиться мовою інтерфейсу
                    }
                }).fail(function (xhr, status, error) {
                    console.log('TMDB request failed (current lang):', status, error); // Лог для діагностики
                    if (currentLang !== 'en') {
                        // Спробувати англійську мову при помилці
                        var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
                        console.log('TMDB URL (en):', enUrl); // Лог для діагностики
                        $.get(enUrl, function (enResponse) {
                            console.log('TMDB response (en):', enResponse.logos ? enResponse.logos : 'No logos'); // Лог для діагностики
                            if (enResponse.logos && enResponse.logos[0]) {
                                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
                            } else {
                                console.log('No logo available for any language'); // Лог для діагностики
                            }
                        }).fail(function (xhr, status, error) {
                            console.log('TMDB request failed (en):', status, error); // Лог для діагностики
                        });
                    }
                });

                // Функція для рендерингу логотипу
                function renderLogo(logoPath, event, mediaType, currentLang, isEnglishLogo) {
                    if (logoPath !== '') {
                        var card = event.object.activity.render();
                        console.log('Title element found:', card.find('.full-start-new__title').length); // Лог для діагностики
                        var logoHtml;
                        var showTitle = Lampa.Storage.get('logo_display_mode') === 'logo_and_text' || (isEnglishLogo && Lampa.Storage.get('logo_display_mode') === 'logo_only');
                        var titleText = showTitle ? (card.find('.full-start-new__title').text() || card.find('.full-start__title').text() || item.title || item.name) : '';
                        // Логіка залежно від налаштувань та ширини екрану
                        if (window.innerWidth > 585) {
                            if (Lampa.Storage.get('card_interfice_type') === 'new' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                                console.log('Rendered logo (new, no cover, desktop):', logoHtml); // Лог для діагностики
                            } else if (Lampa.Storage.get('card_interfice_type') === 'new' && card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 2.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__title').html(logoHtml);
                                console.log('Rendered logo (new, with cover, desktop):', logoHtml); // Лог для діагностики
                            } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start__title-original').remove();
                                card.find('.full-start__title').html(logoHtml);
                                console.log('Rendered logo (old, no cover, desktop):', logoHtml); // Лог для діагностики
                            }
                        } else {
                            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                                console.log('Rendered logo (new, mobile):', logoHtml); // Лог для діагностики
                            } else {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 2.2em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start__title-original').remove();
                                card.find('.full-start__title').html(logoHtml);
                                console.log('Rendered logo (old, mobile):', logoHtml); // Лог для діагностики
                            }
                        }
                    }
                }
            }
        });
    })();
})();
