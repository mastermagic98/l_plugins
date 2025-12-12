(function () {
    'use strict';

    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;

    Lampa.Lang.add({
        kb_title: { uk: 'Вимкнути розкладку', ru: 'Отключить раскладку', en: 'Disable layout' },
        kb_select_lang: { uk: 'Вибір мови', ru: 'Выбор языка', en: 'Language selection' }
    });

    // КЛЮЧІ ЗБЕРІГАННЯ
    var keys = {
        uk: 'kb_hide_uk_final',
        ru: 'kb_hide_ru_final',
        en: 'kb_hide_en_final',
        he: 'kb_hide_he_final'
    };

    // ІКОНКА
    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    /*
     * APPLY — приховування вибраних мов у селекторі вибору мов
     */
    function apply() {
        // Українська
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        }

        // Русский
        if (Lampa.Storage.get(keys.ru, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("Русский")').parent().hide();
        }

        // English
        if (Lampa.Storage.get(keys.en, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("English")').parent().hide();
        }

        // עִברִית
        if (Lampa.Storage.get(keys.he, 'false') === 'true') {
            $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
        }
    }

    /*
     * ВІДКРИТТЯ МЕНЮ ВИБОРУ МОВ
     */
    function openMenu() {
        var items = [
            { title: 'Українська', code: 'uk' },
            { title: 'Русский', code: 'ru' },
            { title: 'English', code: 'en' },
            { title: 'עִברִית', code: 'he' }
        ];

        var formatted = items.map(function (item) {
            return {
                title: item.title,
                checkbox: true,
                checked: Lampa.Storage.get(keys[item.code], 'false') === 'true',
                code: item.code
            };
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('kb_title'),
            items: formatted,
            onSelect: function(a) {
                if (a.checkbox) {
                    var key = keys[a.code];
                    var val = Lampa.Storage.get(key, 'false') === 'true' ? 'false' : 'true';
                    Lampa.Storage.set(key, val);

                    setTimeout(apply, 200);
                    openMenu();
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    /*
     * Реєстрація плагіну в меню
     */
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_hide_plugin',
        name: Lampa.Lang.translate('kb_title'),
        icon: icon
    });

    // 1 пункт меню — просто заголовок
    Lampa.SettingsApi.addParam({
        component: 'keyboard_hide_plugin',
        param: { name: 'kb_info', type: 'static' },
        field: {
            name: Lampa.Lang.translate('kb_title')
        }
    });

    // 2 пункт меню — відкриття вибору мов
    Lampa.SettingsApi.addParam({
        component: 'keyboard_hide_plugin',
        param: {
            name: 'open_keyboard_menu',
            type: 'trigger'
        },
        field: {
            name: Lampa.Lang.translate('kb_select_lang'),
            description: ''
        },
        onRender: function(el) {
            el.off('hover:enter').on('hover:enter', openMenu);
        }
    });

    /*
     * Автоматичне застосування після завантаження
     */
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') setTimeout(apply, 1000);
    });

    if (window.appready) {
        setTimeout(apply, 1000);
    }

    new MutationObserver(apply).observe(document.body, {
        childList: true,
        subtree: true
    });

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'start') setTimeout(apply, 300);
    });

})();
