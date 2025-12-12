(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.kb_multi_hide_plugin_ready) return;
    window.kb_multi_hide_plugin_ready = true;

    const keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    const languages = ['Українська', 'Русский', 'English', 'עִברִית'];

    // Приховує вибрані мови у selectbox
    function applyHidden() {
        try {
            $('.selectbox-item').show(); // спочатку показуємо всі
            if (Lampa.Storage.get(keys.uk) === 'true') $('.selectbox-item:contains("Українська")').hide();
            if (Lampa.Storage.get(keys.ru) === 'true') $('.selectbox-item:contains("Русский")').hide();
            if (Lampa.Storage.get(keys.en) === 'true') $('.selectbox-item:contains("English")').hide();
            if (Lampa.Storage.get(keys.he) === 'true') $('.selectbox-item:contains("עִברִית")').hide();
        } catch (e) { }
    }

    // Відкриття меню вибору мов
    function openMenu() {
        const items = [
            { title: 'Вимкнути розкладку', separator: true }
        ];

        languages.forEach(lang => {
            const key = Object.keys(keys).find(k => {
                if (k === 'uk' && lang === 'Українська') return true;
                if (k === 'ru' && lang === 'Русский') return true;
                if (k === 'en' && lang === 'English') return true;
                if (k === 'he' && lang === 'עִברִית') return true;
            });

            items.push({
                title: lang,
                checkbox: true,
                checked: Lampa.Storage.get(keys[key]) === 'true',
                code: key
            });
        });

        Lampa.Select.show({
            title: 'Вимкнути розкладку',
            items,
            onSelect(item) {
                if (!item.code) return;
                const key = item.code;
                const val = Lampa.Storage.get(key) === 'true' ? 'false' : 'true';
                Lampa.Storage.set(key, val);

                setTimeout(applyHidden, 130);
                setTimeout(openMenu, 160);
            },
            onBack() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // Додаємо пункт у налаштування
    function ensureSettingsEntry() {
        try {
            const root = Lampa.Settings.main().render();
            if (!root.length) return;
            if (root.find('[data-kb-plugin]').length) return;

            const icon = '<svg fill="#fff" width="38" height="38" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

            const html = '<div class="settings-folder selector" data-kb-plugin>' +
                '<div class="settings-folder__icon">' + icon + '</div>' +
                '<div class="settings-folder__name">Вимкнути розкладку</div>' +
                '</div>';

            const more = root.find('[data-component="more"]');
            if (more.length) more.before(html);
            else root.append(html);

            $(document).on('hover:enter click', '[data-kb-plugin]', openMenu);

        } catch (e) { }
    }

    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') {
            setTimeout(ensureSettingsEntry, 200);
            setTimeout(applyHidden, 400);
        }
    });

    if (window.appready) {
        setTimeout(ensureSettingsEntry, 200);
        setTimeout(applyHidden, 400);
    }

    new MutationObserver(() => setTimeout(ensureSettingsEntry, 150))
        .observe(document.body, { childList: true, subtree: true });

})();
