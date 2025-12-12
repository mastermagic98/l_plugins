(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;

    var keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    var icon = '<svg fill="#fff" width="38" height="38" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    function getValue(key) {
        return Lampa.Storage.get(key, 'false') === 'true';
    }

    function apply() {
        try {
            $('.selectbox-item').show();

            if (getValue(keys.uk))
                $('.selectbox-item:contains("Українська")').hide();

            if (getValue(keys.ru))
                $('.selectbox-item:contains("Русский")').hide();

            if (getValue(keys.en))
                $('.selectbox-item:contains("English")').hide();

            if (getValue(keys.he))
                $('.selectbox-item:contains("עִברִית")').hide();

        } catch (e) { }
    }

    function buildItems() {
        return [
            { title: 'Вимкнути розкладку', separator: true },

            {
                title: 'Українська',
                checkbox: true,
                checked: getValue(keys.uk),
                code: 'uk'
            },
            {
                title: 'Русский',
                checkbox: true,
                checked: getValue(keys.ru),
                code: 'ru'
            },
            {
                title: 'English',
                checkbox: true,
                checked: getValue(keys.en),
                code: 'en'
            },
            {
                title: 'עִברִית',
                checkbox: true,
                checked: getValue(keys.he),
                code: 'he'
            }
        ];
    }

    function openMenu() {
        var items = buildItems();

        Lampa.Select.show({
            title: 'Вимкнути розкладку',
            items: items,
            onSelect: function (item) {
                if (!item.code) return;

                var key = keys[item.code];
                var val = Lampa.Storage.get(key) === 'true' ? 'false' : 'true';
                Lampa.Storage.set(key, val);

                setTimeout(apply, 130);
                setTimeout(openMenu, 160);
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function ensureSettingsEntry() {
        try {
            var root = Lampa.Settings.main().render();
            if (!root.length) return;

            if (root.find('[data-kb-plugin]').length) return;

            var html =
                '<div class="settings-folder selector" data-kb-plugin>' +
                '<div class="settings-folder__icon">' + icon + '</div>' +
                '<div class="settings-folder__name">Вимкнути розкладку</div>' +
                '</div>';

            var more = root.find('[data-component="more"]');
            if (more.length) more.before(html);
            else root.append(html);

            $(document).on('hover:enter', '[data-kb-plugin]', openMenu);
            $(document).on('click', '[data-kb-plugin]', openMenu);

        } catch (e) { }
    }

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            setTimeout(ensureSettingsEntry, 200);
            setTimeout(apply, 400);
        }
    });

    if (window.appready) {
        setTimeout(ensureSettingsEntry, 200);
        setTimeout(apply, 400);
    }

    new MutationObserver(function () {
        setTimeout(ensureSettingsEntry, 150);
    }).observe(document.body, { childList: true, subtree: true });

})();
