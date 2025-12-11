(function () {
    'use strict';

    // Перевірка версії Lampa (для 3.0+)
    if (Lampa.Manifest.app_digital < 300) {
        return; // Не запускаємо на старих версіях
    }

    // Додаємо переклади
    function addTranslates() {
        Lampa.Lang.add({
            keyboard_settings: {
                uk: 'Клавіатура',
                ru: 'Клавиатура',
                en: 'Keyboard'
            },
            keyboard_uk: {
                uk: 'Українська',
                ru: 'Украинская',
                en: 'Ukrainian'
            },
            keyboard_ru: {
                uk: 'Російська',
                ru: 'Русская',
                en: 'Russian'
            },
            keyboard_en: {
                uk: 'Англійська',
                ru: 'Английская',
                en: 'English'
            },
            keyboard_he: {
                uk: 'Іврит (עִברִית)',
                ru: 'Иврит (עִברִית)',
                en: 'Hebrew (עִברִית)'
            },
            keyboard_select_visibility: {
                uk: 'Вимкнути відображення в списку розкладок',
                ru: 'Отключить отображение в списке раскладок',
                en: 'Disable display in keyboard layout list'
            }
        });
    }

    // Основна функція плагіну
    function startPlugin() {
        if (window.keyboard_plugin_v3_ready) {
            return;
        }
        window.keyboard_plugin_v3_ready = true;

        addTranslates();

        // Іконка
        var keyboard_icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

        // Додаємо розділ у налаштування
        Lampa.SettingsApi.addComponent({
            component: 'keyboard_settings_v3',
            name: Lampa.Lang.translate('keyboard_settings'),
            icon: keyboard_icon
        });

        // Список мов
        var languages = [
            { key: 'hide_uk', title: 'keyboard_uk', default: false },
            { key: 'hide_ru', title: 'keyboard_ru', default: true },
            { key: 'hide_en', title: 'keyboard_en', default: false },
            { key: 'hide_he', title: 'keyboard_he', default: true }
        ];

        languages.forEach(function (lang) {
            var storageKey = 'keyboard_v3_' + lang.key;
            var storedValue = Lampa.Storage.get(storageKey, lang.default.toString()) === 'true';

            Lampa.SettingsApi.addParam({
                component: 'keyboard_settings_v3',
                param: {
                    name: storageKey,
                    type: 'trigger',
                    default: storedValue
                },
                field: {
                    name: Lampa.Lang.translate(lang.title),
                    description: Lampa.Lang.translate('keyboard_select_visibility')
                },
                onChange: function (value) {
                    Lampa.Storage.set(storageKey, value.toString());
                    applyKeyboardHiding(); // негайно застосовуємо
                }
            });
        });

        // Надійна функція приховування (MutationObserver + затримки)
        function applyKeyboardHiding() {
            // Українська
            if (Lampa.Storage.get('keyboard_v3_hide_uk', 'false') === 'true') {
                $('.selectbox-item.selector > div:contains("Українська")').parent('div').hide();
            }
            // Російська
            if (Lampa.Storage.get('keyboard_v3_hide_ru', 'true') === 'true') {
                $('.selectbox-item.selector > div:contains("Русский")').parent('div').hide();
                $('.selectbox-item.selector > div:contains("Russian")').parent('div').hide();
            }
            // Англійська
            if (Lampa.Storage.get('keyboard_v3_hide_en', 'false') === 'true') {
                $('.selectbox-item.selector > div:contains("English")').parent('div').hide();
            }
            // Іврит
            if (Lampa.Storage.get('keyboard_v3_hide_he', 'true') === 'true') {
                $('.selectbox-item.selector > div:contains("עִברִית")').parent('div').hide();
            }
        }

        // Спостерігач за появою списку розкладок
        var observer = new MutationObserver(function () {
            applyKeyboardHiding();
        });

        // Запускаємо спостереження за body (де з'являється список)
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Додатково застосовуємо при відкритті пошуку
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'start') {
                setTimeout(applyKeyboardHiding, 200);
                setTimeout(applyKeyboardHiding, 600);
                setTimeout(applyKeyboardHiding, 1200);
            }
        });

        // Якщо додаток вже запущений
        if (window.appready) {
            setTimeout(applyKeyboardHiding, 800);
            setTimeout(applyKeyboardHiding, 1500);
        }
    }

    // Запуск плагіну
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
