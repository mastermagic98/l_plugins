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

        // Підписка на подію активності для обробки повноекранного режиму
        Lampa.Listener.follow('full', function (event) {
            // Перевірка, чи подія є завершенням рендерингу та чи увімкнена заміна логотипу
            console.log('Full event triggered:', event.type); // Лог для діагностики
            if (event.type == 'complite' && Lampa.Storage.get('logo_glav') != '1') {
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
                            var logoHtml = '<img style="margin-top: 5px; max-height: 125px;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" />';
                            card.find('.full-start-new__title').html(logoHtml);
                            console.log('Rendered logo:', logoHtml); // Лог для діагностики
                        }
                    }
                }).fail(function (xhr, status, error) {
                    console.log('TMDB request failed:', status, error); // Лог для діагностики
                });
            }
        });
    })();
})();
