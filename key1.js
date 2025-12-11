(function () {
    'use strict';

    // Перевірка версії Lampa 3.0+
    if (Lampa.Manifest.app_digital < 300) {
        return;
    }

    if (window.keyboard_select_plugin_ready) {
        return;
    }
    window.keyboard_select_plugin_ready = true;

    // Переклади
    Lampa.Lang.add({
        keyboard_menu_title: {
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
        }
    });

    // Ключі збереження
    var keys = {
        uk: 'keyboard_v3_hide_uk',
        ru: 'keyboard_v3_hide_ru',
        en: 'keyboard_v3_hide_en',
        he: 'keyboard_v3_hide_he'
    };

    // Іконка (та сама, що ти просив раніше)
    var keyboard_icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

    // Додаємо пункт у налаштування
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_select',
        name: Lampa.Lang.translate('keyboard_menu_title'),
        icon: keyboard_icon
    });

    // Функція приховування розкладок
    function applyHiding() {
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("Українська")').parent('div').hide();
        }
        if (Lampa.Storage.get(keys.ru, 'true') === 'true') {
            $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent('div').hide();
        }
        if (Lampa.Storage.get(keys.en, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("English")').parent('div').hide();
        }
        if (Lampa.Storage.get(keys.he, 'true') === 'true') {
            $('.selectbox-item.selector > div:contains("עִברִית")').parent('div').hide();
        }
    }

    // MutationObserver для надійності
    var observer = new MutationObserver(applyHiding);
    observer.observe(document.body, { childList: true, subtree: true });

    // Додатково при відкритті пошуку
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            setTimeout(applyHiding, 200);
            setTimeout(applyHiding, 600);
            setTimeout(applyHiding, 1200);
        }
    });

    // Обробник натискання на пункт у налаштуваннях
    $(document).on('hover:enter', '[data-component="keyboard_select"] .settings-folder', function () {
        var items = [];

        // Українська
        items.push({
            title: Lampa.Lang.translate('keyboard_uk'),
            selected: Lampa.Storage.get(keys.uk, 'false') === 'true',
            lang: 'uk'
        });

        // Російська
        items.push({
            title: Lampa.Lang.translate('keyboard_ru'),
            selected: Lampa.Storage.get(keys.ru, 'true') === 'true',
            lang: 'ru'
        });

        // Англійська
        items.push({
            title: Lampa.Lang.translate('keyboard_en'),
            selected: Lampa.Storage.get(keys.en, 'false') === 'true',
            lang: 'en'
        });

        // Іврит
        items.push({
            title: Lampa.Lang.translate('keyboard_he'),
            selected: Lampa.Storage.get(keys.he, 'true') === 'true',
            lang: 'he'
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('keyboard_menu_title'),
            items: items,
            onSelect: function (item) {
                var key = keys[item.lang];
                var current = Lampa.Storage.get(key, 'false');
                var newValue = current === 'true' ? 'false' : 'true';
                Lampa.Storage.set(key, newValue);

                // Негайно застосовуємо
                applyHiding();

                // Повертаємося в налаштування
                Lampa.Controller.toggle('settings_component');
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    });

    // Якщо додаток вже готовий — застосовуємо приховування
    if (window.appready) {
        setTimeout(applyHiding, 800);
        setTimeout(applyHiding, 1500);
    }

    // Запуск при готовності
    if (!window.appready) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(applyHiding, 800);
            }
        });
    }

})();
