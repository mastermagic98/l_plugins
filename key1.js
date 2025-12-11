(function () {
    'use strict';

    // Переклади
    function addTranslates() {
        Lampa.Lang.add({
            keyboard_settings: {
                uk: 'Клавіатура',
                ru: 'Клавиатура',
                en: 'Keyboard'
            },
            keyboard_select_title: {
                uk: 'Вибрати мову розкладки',
                ru: 'Выбрать язык раскладки',
                en: 'Select keyboard layout'
            }
        });
    }

    // Основна функція
    function startPlugin() {
        if (window.keyboard_plugin_ready) {
            return;
        }
        window.keyboard_plugin_ready = true;

        addTranslates();

        // Іконка
        var keyboard_icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

        // Додаємо розділ у налаштування
        Lampa.SettingsApi.addComponent({
            component: 'keyboard_settings',
            name: Lampa.Lang.translate('keyboard_settings'),
            icon: keyboard_icon
        });

        // Ключі збереження
        var keys = {
            uk: 'keyboard_hide_uk',
            ru: 'keyboard_hide_ru',
            en: 'keyboard_hide_en',
            he: 'keyboard_hide_he'
        };

        // Функція приховування
        function applyHiding() {
            // Українська
            var el = $('.selectbox-item.selector > div:contains("Українська")').parent('div');
            if (Lampa.Storage.get(keys.uk, 'false') === 'true') {
                el.hide();
            } else {
                el.show();
            }

            // Російська
            el = $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent('div');
            if (Lampa.Storage.get(keys.ru, 'true') === 'true') {
                el.hide();
            } else {
                el.show();
            }

            // Англійська
            el = $('.selectbox-item.selector > div:contains("English")').parent('div');
            if (Lampa.Storage.get(keys.en, 'false') === 'true') {
                el.hide();
            } else {
                el.show();
            }

            // Іврит
            el = $('.selectbox-item.selector > div:contains("עִברִית")').parent('div');
            if (Lampa.Storage.get(keys.he, 'true') === 'true') {
                el.hide();
            } else {
                el.show();
            }
        }

        // Обробник входу в розділ
        Lampa.SettingsApi.addComponentHandler('keyboard_settings', function () {
            var items = [];

            items.push({
                title: 'Русский',
                selected: Lampa.Storage.get(keys.ru, 'true') === 'true',
                lang: 'ru'
            });
            items.push({
                title: 'English',
                selected: Lampa.Storage.get(keys.en, 'false') === 'true',
                lang: 'en'
            });
            items.push({
                title: 'Українська',
                selected: Lampa.Storage.get(keys.uk, 'false') === 'true',
                lang: 'uk'
            });
            items.push({
                title: 'עִברִית',
                selected: Lampa.Storage.get(keys.he, 'true') === 'true',
                lang: 'he'
            });

            Lampa.Select.show({
                title: Lampa.Lang.translate('keyboard_select_title'),
                items: items,
                onSelect: function (item) {
                    var key = keys[item.lang];
                    var current = Lampa.Storage.get(key, 'false');
                    var newValue = (current === 'true') ? 'false' : 'true';
                    Lampa.Storage.set(key, newValue);
                    applyHiding();
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_component');
                }
            });
        });

        // Застосовуємо при відкритті пошуку
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'start') {
                setTimeout(applyHiding, 200);
                setTimeout(applyHiding, 600);
                setTimeout(applyHiding, 1200);
            }
        });

        // Якщо додаток вже запущений
        if (window.appready) {
            setTimeout(applyHiding, 800);
        }
    }

    // Запуск
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
