(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.kb_full_plugin_ready) return;
    window.kb_full_plugin_ready = true;

    const keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    const languages = [
        { code: 'uk', title: 'Українська' },
        { code: 'ru', title: 'Русский' },
        { code: 'en', title: 'English' },
        { code: 'he', title: 'עִברִית' }
    ];

    function applyHidden() {
        try {
            $('.selectbox-item').show();
            languages.forEach(lang => {
                if (Lampa.Storage.get(keys[lang.code]) === 'true') {
                    $('.selectbox-item:contains("' + lang.title + '")').hide();
                }
            });
        } catch (e) {}
    }

    function openLanguageMenu() {
        const items = languages.map(lang => ({
            title: lang.title,
            checkbox: true,
            checked: Lampa.Storage.get(keys[lang.code]) === 'true',
            code: lang.code
        }));

        Lampa.Select.show({
            title: 'Вимкнути розкладку',
            items: items,
            onSelect(item) {
                if (!item.code) return;
                const key = item.code;
                Lampa.Storage.set(key, Lampa.Storage.get(key) === 'true' ? 'false' : 'true');
                setTimeout(applyHidden, 100);
                setTimeout(openLanguageMenu, 120);
            },
            onBack() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    function askDisableLayout() {
        Lampa.Modal.confirm('Вимкнути розкладку?', result => {
            if (result) openLanguageMenu();
        });
    }

    // --- Додаємо тригер у SettingsApi ---
    Lampa.SettingsApi.addParam({
        component: 'keyboard_settings_plugin', 
        param: {
            name: 'keyboard_switch_trigger',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Вбудована клавіатура',
            description: 'Натисніть для вимкнення розкладки'
        },
        onRender(el) {
            el.off('hover:enter').on('hover:enter', function () {
                // тільки якщо вибрана "Вбудована"
                const value = Lampa.Storage.get('keyboard_type') || 'Вбудована';
                if (value === 'Вбудована') {
                    askDisableLayout();
                }
            });
        }
    });

    // Ініціалізація
    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') setTimeout(applyHidden, 300);
    });

    if (window.appready) setTimeout(applyHidden, 300);
    new MutationObserver(applyHidden).observe(document.body, { childList: true, subtree: true });

})();
