(function () {
    'use strict';

    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;

    Lampa.Lang.add({
        kb_title: { uk: 'Вимкнути розкладку', ru: 'Отключить раскладку', en: 'Disable layout' }
    });

    var keys = {
        uk: 'kb_hide_uk_final',
        ru: 'kb_hide_ru_final',
        en: 'kb_hide_en_final',
        he: 'kb_hide_he_final'
    };

    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    function apply() {
        if (Lampa.Storage.get(keys.uk) === 'true') $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        if (Lampa.Storage.get(keys.ru) === 'true') $('.selectbox-item.selector > div:contains("Русский")').parent().hide();
        if (Lampa.Storage.get(keys.en) === 'true') $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (Lampa.Storage.get(keys.he) === 'true') $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
    }

    function openMenu() {
        var items = [
            { title: 'Українська', code: 'uk' },
            { title: 'Русский', code: 'ru' },
            { title: 'English', code: 'en' },
            { title: 'עִברִית', code: 'he' }
        ].map(function (item) {
            return {
                title: item.title,
                checkbox: true,
                checked: Lampa.Storage.get(keys[item.code], 'false') === 'true',
                code: item.code
            };
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('kb_title'),
            items: items,
            onSelect: function (a) {
                if (a.checkbox) {
                    var key = keys[a.code];
                    var v = Lampa.Storage.get(key) === 'true' ? 'false' : 'true';
                    Lampa.Storage.set(key, v);

                    setTimeout(apply, 200);
                    openMenu();
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    /*
     * Єдиний пункт у меню → відкриває селект мов
     */
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_hide_plugin',
        name: Lampa.Lang.translate('kb_title'),
        icon: icon,
        onEnter: openMenu   // <<< ГОЛОВНЕ — відкриває Selectbox одразу
    });

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') setTimeout(apply, 1000);
    });

    if (window.appready) setTimeout(apply, 1000);

    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') setTimeout(apply, 300);
    });

})();
