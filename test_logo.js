(function () {
    'use strict';
    // Встановлення платформи на телевізійний режим
    Lampa.Platform.tv();

    // Функція для заміни логотипу замість назви в інтерфейсі
    (function () {
        // Функція ініціалізації та налаштування логіки заміни логотипу
        function initLogoReplacement() {
            // Захист від дебагінгу: обфускований код для перевірки конструктора функції
            (function () {
                return (function () {
                    return {}.constructor("return this")();
                }).toString().search('(((.+)+)+)+$').toString().constructor(this).toString();
            })();

            // Налаштування консольного логування для захисту від дебагінгу
            (function () {
                var consoleObj = (function () {
                    var global;
                    try {
                        global = Function('return (function() {}.constructor("return this")());')();
                    } catch (e) {
                        global = window;
                    }
                    return global;
                })();
                var consoleMethods = consoleObj.console = consoleObj.console || {};
                var methods = ['log', 'info', 'warn', 'error', 'exception', 'table', 'trace'];
                for (var i = 0; i < methods.length; i++) {
                    var method = methods[i];
                    var originalMethod = consoleMethods[method] || function () {};
                    originalMethod.__proto__ = Function.prototype;
                    originalMethod.toString = originalMethod.toString.bind(originalMethod);
                    consoleMethods[method] = originalMethod;
                }
            })();

            // Додавання параметру в налаштування для увімкнення/вимкнення заміни логотипу
            Lampa.SettingsApi.addParam({
                'component': 'interface',
                'param': {
                    'name': 'logo_card',
                    'type': 'card_interfice_type',
                    'default': true
                },
                'field': {
                    'name': 'Логотип замість назви'
                },
                'onRender': function () {
                    // Приховання картки логотипу в налаштуваннях
                    setTimeout(function () {
                        $('div[data-name="logo_card"]').remove();
                    }, 0);
                }
            });

            // Підписка на подію активності для обробки повноекранного режиму
            Lampa.Listener.follow('full', function (event) {
                // Перевірка, чи подія стосується фільму або серіалу та чи увімкнена заміна логотипу
                console.log('Full event triggered:', event.type, event.data); // Лог для діагностики
                if ((event.type == 'movie' || event.type == 'tv') && Lampa.Storage.get('logo_card') !== false) {
                    var item = event.data.movie;
                    var mediaType = item.name ? 'tv' : 'movie';
                    var apiKey = '4ef0d7355d9ffb5151e987764708ce96';
                    var baseUrl = 'http://api.themoviedb.org/3/';
                    var imgBaseUrl = 'http://image.tmdb.org/t/p/w500';
                    // Формування URL для запиту логотипу з TMDB
                    var url = baseUrl + mediaType + '/' + item.id + '/images?api_key=' + apiKey + '&language=' + Lampa.Storage.get('language');
                    console.log('TMDB URL:', url); // Лог для діагностики

                    // Виконання AJAX-запиту для отримання логотипів
                    $.get(url, function (response) {
                        console.log('TMDB response:', response); // Лог для діагностики
                        if (response.logos && response.logos[0]) {
                            var logoPath = response.logos[0].file_path;
                            console.log('Logo path:', logoPath); // Лог для діагностики
                            if (logoPath !== '') {
                                var card = event.render.full.html();
                                console.log('Card element:', $('.full-start-new__title', card).length); // Лог для перевірки селектора
                                var logoHtml;
                                // Логіка залежно від налаштувань та ширини екрану
                                if (window.innerWidth > 585) {
                                    if (Lampa.Storage.get('card_interfice_type') === 'new' && !$('div[data-name="card_interfice_cover"]').length) {
                                        logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="' + imgBaseUrl + logoPath.replace('.svg', '.png') + '" />';
                                        $('.full-start-new__tagline', card).remove();
                                        $('.full-start-new__title', card).html(logoHtml);
                                        console.log('Rendered logo (new, no cover):', logoHtml); // Лог для діагностики
                                    } else if (Lampa.Storage.get('card_interfice_type') === 'new' && $('div[data-name="card_interfice_cover"]').length) {
                                        logoHtml = '<img style="margin-top: 0.6em; margin-bottom: 0.4em; max-height: 2.8em;" src="' + imgBaseUrl + 'http://212.113.103.137:9118/proxyimg/' + logoPath.replace('.svg', '.png') + '" />';
                                        $('.full-start-new__title', card).html(logoHtml);
                                        console.log('Rendered logo (new, with cover):', logoHtml); // Лог для діагностики
                                    } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !$('div[data-name="card_interfice_cover"]').length) {
                                        logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="' + imgBaseUrl + 'http://212.113.103.137:9118/proxyimg/' + logoPath.replace('.svg', '.png') + '" />';
                                        $('.full-start__title-original', card).remove();
                                        $('.full-start__title', card).html(logoHtml);
                                        console.log('Rendered logo (old, no cover):', logoHtml); // Лог для діагностики
                                    }
                                } else {
                                    if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                        logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 1.8em;" src="' + imgBaseUrl + logoPath.replace('.svg', '.png') + '" />';
                                        $('.full-start-new__tagline', card).remove();
                                        $('.full-start-new__title', card).html(logoHtml);
                                        console.log('Rendered logo (new, mobile):', logoHtml); // Лог для діагностики
                                    } else {
                                        logoHtml = '<img style="margin-top: 0.3em; margin-bottom: 0.4em; max-height: 2.2em;" src="' + imgBaseUrl + 'http://212.113.103.137:9118/proxyimg/' + logoPath.replace('.svg', '.png') + '" />';
                                        $('.full-start__title-original', card).remove();
                                        $('.full-start__title', card).html(logoHtml);
                                        console.log('Rendered logo (old, mobile):', logoHtml); // Лог для діагностики
                                    }
                                }
                            }
                        } else {
                            console.log('No logos found in TMDB response'); // Лог для діагностики
                        }
                    }).fail(function (xhr, status, error) {
                        console.log('TMDB request failed:', status, error); // Лог для діагностики
                    });
                }
            });
        }

        // Виконання ініціалізації, якщо додаток готовий, або підписка на подію готовності
        console.log('Plugin initialized'); // Лог для діагностики
        if (window.appready) {
            initLogoReplacement();
        } else {
            Lampa.Listener.follow('app', function (event) {
                if (event.type == 'ready') {
                    initLogoReplacement();
                }
            });
        }
    })();
})();
