(function () {
    'use strict';

    // Додаємо переклади для плагіну
    function addTranslates() {
        Lampa.Lang.add({
            keyboard_settings: {
                uk: 'Клавіатура',
                ru: 'Клавиатура',
                en: 'Keyboard'
            },
            keyboard_hide_uk: {
                uk: 'Приховати українську',
                ru: 'Скрыть украинскую',
                en: 'Hide Ukrainian'
            },
            keyboard_hide_ru: {
                uk: 'Приховати російську',
                ru: 'Скрыть русскую',
                en: 'Hide Russian'
            },
            keyboard_hide_en: {
                uk: 'Приховати англійську',
                ru: 'Скрыть английскую',
                en: 'Hide English'
            },
            keyboard_hide_he: {
                uk: 'Приховати іврит (עִברִית)',
                ru: 'Скрыть иврит (עִברִית)',
                en: 'Hide Hebrew (עִברִית)'
            },
            keyboard_default_lang: {
                uk: 'Мова клавіатури за замовчуванням',
                ru: 'Язык клавиатуры по умолчанию',
                en: 'Default keyboard language'
            },
            keyboard_select_visibility: {
                uk: 'Виберіть, які клавіатури приховати',
                ru: 'Выберите, какие клавиатуры скрыть',
                en: 'Select which keyboards to hide'
            }
        });
    }

    // Основна функція плагіну
    function startPlugin() {
        if (window.keyboard_plugin_ready) {
            return;
        }
        window.keyboard_plugin_ready = true;

        addTranslates();

        // Додаємо компонент у налаштування
        Lampa.SettingsApi.addComponent({
            component: 'keyboard_settings',
            name: Lampa.Lang.translate('keyboard_settings'),
            icon: '<svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><path d="M9.333 21.067c-.533 0-.967-.433-.967-.967s.434-.967.967-.967c.533 0 .966.433.966.967s-.433.967-.966.967zm7.334 0c-.534 0-.967-.433-.967-.967s.433-.967.967-.967c.533 0 .966.433.966.967s-.433.967-.966.967zm7.333 0c-.533 0-.966-.433-.966-.967s.433-.967.966-.967c.533 0 .967.433.967.967s-.434.967-.967.967zm-14.667-5.334h16v-2.666h-16v2.666zm2.667-5.333h20v-2.667h-20v2.667zm-5.334 16c-1.467 0-2.666-1.2-2.666-2.667v-16c0-1.467 1.199-2.667 2.666-2.667h26.667c1.467 0 2.666 1.2 2.666 2.667v16c0 1.467-1.199 2.667-2.666 2.667h-26.667z" fill="#fff"/></svg>'
        });

        // Параметри для кожної мови
        var languages = [
            { key: 'hide_uk', title: 'keyboard_hide_uk', default: false },
            { key: 'hide_ru', title: 'keyboard_hide_ru', default: true },
            { key: 'hide_en', title: 'keyboard_hide_en', default: false },
            { key: 'hide_he', title: 'keyboard_hide_he', default: true }
        ];

        languages.forEach(function (lang) {
            var storageKey = 'keyboard_' + lang.key;
            var storedValue = Lampa.Storage.get(storageKey, lang.default.toString()) === "true";

            Lampa.SettingsApi.addParam({
                component: 'keyboard_settings',
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
                    applyKeyboardHiding();
                }
            });
        });

        // Функція приховування клавіатур
        function applyKeyboardHiding() {
            if (Lampa.Storage.get('keyboard_hide_uk', 'false') === 'true') {
                $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
            }
            if (Lampa.Storage.get('keyboard_hide_ru', 'true') === 'true') {
                $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
            }
            if (Lampa.Storage.get('keyboard_hide_en', 'false') === 'true') {
                $('.selectbox-item.selector > div:contains("English")').parent().hide();
            }
            if (Lampa.Storage.get('keyboard_hide_he', 'true') === 'true') {
                $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
            }
        }

        // Застосовуємо при відкритті пошуку
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'start') {
                setTimeout(applyKeyboardHiding, 300);
            }
        });

        // Якщо додаток вже готовий — застосовуємо відразу
        if (window.appready) {
            setTimeout(applyKeyboardHiding, 600);
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
