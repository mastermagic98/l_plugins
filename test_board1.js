(function () {
    'use strict';

    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;

    Lampa.Lang.add({
        kb_title: { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
        kb_header: { uk: 'Вимкнути розкладку клавіатури', ru: 'Отключить раскладку клавиатуры', en: 'Disable keyboard layout' },
        kb_uk: { uk: 'Українську', ru: 'Украинскую', en: 'Ukrainian' },
        kb_ru: { uk: 'Російську', ru: 'Русскую', en: 'Russian' },
        kb_en: { uk: 'Англійську', ru: 'Английскую', en: 'English' },
        kb_he: { uk: 'Іврит (עִברִית)', ru: 'Иврит (עִברִית)', en: 'Hebrew (עִברִית)' }
    });

    var keys = {
        uk: 'kb_hide_uk_final',
        ru: 'kb_hide_ru_final',
        en: 'kb_hide_en_final',
        he: 'kb_hide_he_final'
    };

    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    function apply() {
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        if (Lampa.Storage.get(keys.ru, 'true') === 'true') $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        if (Lampa.Storage.get(keys.en, 'false') === 'true') $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (Lampa.Storage.get(keys.he, 'true') === 'true') $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
    }

    function openMenu() {
        var items = [];
        items.push({ title: Lampa.Lang.translate('kb_header'), separator: true });

        var list = [
            { code: 'ru', name: 'kb_ru' },
            { code: 'uk', name: 'kb_uk' },
            { code: 'en', name: 'kb_en' },
            { code: 'he', name: 'kb_he' }
        ];

        list.forEach(function(item) {
            items.push({
                title: Lampa.Lang.translate(item.name),
                checkbox: true,
                checked: Lampa.Storage.get(keys[item.code], item.code === 'ru' ? 'true' : 'false') === 'true',
                code: item.code
            });
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('kb_title'),
            items: items,
            onSelect: function(a) {
                if (a.checkbox && a.code) {
                    var key = keys[a.code];
                    Lampa.Storage.set(key, Lampa.Storage.get(key, 'false') === 'true' ? 'false' : 'true');
                    apply();
                    openMenu();
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // Найбезпечніший спосіб для Lampa 3.0+ — через SettingsApi
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_hide_plugin',
        name: Lampa.Lang.translate('kb_title'),
        icon: icon
    });

    Lampa.SettingsApi.addParam({
        component: 'keyboard_hide_plugin',
        param: {
            name: 'open_keyboard_menu',
            type: 'trigger',
            default: false
        },
        field: {
            name: Lampa.Lang.translate('kb_title'),
            description: ''
        },
        onRender: function(el) {
            el.off('hover:enter').on('hover:enter', openMenu);
        }
    });

    // Приховування при запуску
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            setTimeout(apply, 1000);
        }
    });

    if (window.appready) {
        setTimeout(apply, 1000);
    }

    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'start') setTimeout(apply, 300);
    });

})();
