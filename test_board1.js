(function () {
    'use strict';

    if (Lampa.Manifest.app_digital < 300) return;

    if (window.keyboard_clean_ready) return;
    window.keyboard_clean_ready = true;

    // === Переклади ===
    Lampa.Lang.add({
        keyboard_title: { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
        keyboard_uk: { uk: 'Українська', ru: 'Украинская', en: 'Ukrainian' },
        keyboard_ru: { uk: 'Російська', ru: 'Русская', en: 'Russian' },
        keyboard_en: { uk: 'Англійська', ru: 'Английская', en: 'English' },
        keyboard_he: { uk: 'Іврит (עִברִית)', ru: 'Иврит (עִברִית)', en: 'Hebrew (עִברִית)' }
    });

    // Ключі приховування
    var keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

    // Додаємо пункт у налаштування
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_clean',
        name: Lampa.Lang.translate('keyboard_title'),
        icon: icon
    });

    // === Приховування ===
    function applyHiding() {
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        }
        if (Lampa.Storage.get(keys.ru, 'true') === 'true') {
            $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        }
        if (Lampa.Storage.get(keys.en, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("English")').parent().hide();
        }
        if (Lampa.Storage.get(keys.he, 'true') === 'true') {
            $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
        }
    }

    // === Меню тільки з чекбоксами ===
    function openMenu() {
        var items = [];

        items.push({ title: 'Приховати клавіатури', separator: true });

        ['uk', 'ru', 'en', 'he'].forEach(function (l) {
            items.push({
                title: Lampa.Lang.translate('keyboard_' + l),
                checkbox: true,
                checked: Lampa.Storage.get(keys[l], l === 'ru' ? 'true' : 'false') === 'true',
                lang: l
            });
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('keyboard_title'),
            items: items,
            onSelect: function (item) {
                if (item.checkbox && item.lang) {
                    var key = keys[item.lang];
                    var current = Lampa.Storage.get(key, 'false') === 'true';
                    Lampa.Storage.set(key, current ? 'false' : 'true');
                    applyHiding();
                    openMenu(); // оновлюємо галочки
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // === Обробник натискання ===
    Lampa.SettingsApi.addParam({
        component: 'keyboard_clean',
        param: { name: 'open', type: 'trigger' },
        field: { name: Lampa.Lang.translate('keyboard_title') },
        onRender: function (el) {
            el.off('hover:enter').on('hover:enter', openMenu);
        }
    });

    // === Спостереження за DOM ===
    var observer = new MutationObserver(applyHiding);
    observer.observe(document.body, { childList: true, subtree: true });

    // === Запуск ===
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            setTimeout(applyHiding, 300);
        }
    });

    setTimeout(applyHiding, 1000);

})();
