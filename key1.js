(function () {
    'use strict';

    // Назва плагіну в меню
    var plugin_name = 'Приховувати клавіатури';

    // Налаштування за замовчуванням
    var default_settings = {
        hide_ua: true,   // Українська
        hide_ru: true,   // Російська
        hide_en: false,  // Англійська (зазвичай залишають)
        hide_he: true    // עִברִית
    };

    // Ініціалізація налаштувань
    function initSettings() {
        var settings = Lampa.Storage.get('keyboard_hider_settings', {});
        // Якщо налаштувань ще немає — створюємо з дефолтними значеннями
        if (Object.keys(settings).length === 0) {
            Lampa.Storage.set('keyboard_hider_settings', default_settings);
            settings = default_settings;
        }
        return settings;
    }

    // Приховуємо вибрані мови в списку клавіатур
    function hideKeyboards() {
        var settings = initSettings();

        // Українська
        if (settings.hide_ua) {
            var elUA = $('.selectbox-item.selector > div:contains("Українська")');
            if (elUA.length > 0) elUA.parent('div').hide();
        }

        // Російська
        if (settings.hide_ru) {
            var elRU = $('.selectbox-item.selector > div:contains("Русский")');
            if (elRU.length > 0) elRU.parent('div').hide();
        }

        // Англійська
        if (settings.hide_en) {
            var elEN = $('.selectbox-item.selector > div:contains("English")');
            if (elEN.length > 0) elEN.parent('div').hide();
        }

        // Іврит
        if (settings.hide_he) {
            var elHE = $('.selectbox-item.selector > div:contains("עִברִית")');
            if (elHE.length > 0) elHE.parent('div').hide();
        }
    }

    // Основна функція запуску при готовності додатка
    function startPlugin() {
        // Додаємо пункт у меню налаштувань
        Lampa.Settings.main().render().find('[data-component="more"]').after(
            '<div class="settings-folder">' +
                '<div class="settings-folder__icon"><div class="icon-keyboard"></div></div>' +
                '<div class="settings-folder__name">' + plugin_name + '</div>' +
            '</div>'
        );

        // Додаємо підменю з чекбоксами
        Lampa.Settings.main().update = function () {
            var settings = initSettings();

            var html = '<div class="settings-param selector" data-type="selectbox" data-name="keyboard_hider">' +
                '<div class="settings-param__name">' + plugin_name + '</div>' +
                '<div class="settings-param__value">Налаштувати</div>' +
                '<div class="settings-param__descr">Виберіть, які клавіатури приховати в пошуку</div>' +
                '</div>';

            Lampa.Settings.main().render().find('.settings-folder:last').after(html);

            // Обробник кліку по пункту
            $('.settings-param[data-name="keyboard_hider"]').on('hover:enter', function () {
                var items = [];

                items.push({
                    title: 'Українська',
                    subtitle: settings.hide_ua ? 'Прихована' : 'Видима',
                    selected: settings.hide_ua
                });

                items.push({
                    title: 'Російська',
                    subtitle: settings.hide_ru ? 'Прихована' : 'Видима',
                    selected: settings.hide_ru
                });

                items.push({
                    title: 'English',
                    subtitle: settings.hide_en ? 'Прихована' : 'Видима',
                    selected: settings.hide_en
                });

                items.push({
                    title: 'עִברִית (Іврит)',
                    subtitle: settings.hide_he ? 'Прихована' : 'Видима',
                    selected: settings.hide_he
                });

                Lampa.Select.show({
                    title: 'Приховувати клавіатури',
                    items: items,
                    onSelect: function (a) {
                        var key = '';
                        if (a.title === 'Українська') key = 'hide_ua';
                        if (a.title === 'Російська') key = 'hide_ru';
                        if (a.title === 'English') key = 'hide_en';
                        if (a.title === 'עִברִית (Іврит)') key = 'hide_he';

                        if (key) {
                            settings[key] = !settings[key];
                            Lampa.Storage.set('keyboard_hider_settings', settings);
                            Lampa.Settings.main().update(); // оновлюємо підказки
                            hideKeyboards(); // негайно застосовуємо
                        }

                        Lampa.Controller.toggle('settings_component');
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component');
                    }
                });
            });
        };

        // Спостерігаємо за появою кнопки зміни мови клавіатури
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'start') {
                setTimeout(hideKeyboards, 300); // невелика затримка для впевненості
            }
        });

        // Якщо додаток вже готовий — запускаємо відразу
        if (window.appready) {
            setTimeout(hideKeyboards, 500);
        }
    }

    // Запуск плагіну
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                startPlugin();
            }
        });
    }

})();
