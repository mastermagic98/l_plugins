(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.kb_full_plugin_ready) return;
    window.kb_full_plugin_ready = true;

    // --- Ключі для збереження стану ---
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

    // --- Приховування вибраних мов ---
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

    // --- Відкриття меню мов ---
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

    // --- Запит про вимкнення розкладки ---
    function askDisableLayout() {
        Lampa.Modal.confirm('Вимкнути розкладку?', function(result) {
            if (result) openLanguageMenu();
        });
    }

    // --- Слухач на вибір типу клавіатури ---
    $(document).off('hover:enter', '[data-name="keyboard_type"]').on('hover:enter', '[data-name="keyboard_type"]', function() {
        const value = $(this).find('.settings-param__value').text().trim();
        if (value === 'Вбудована') {
            askDisableLayout();
        }
    });

    // --- Ініціалізація ---
    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') setTimeout(applyHidden, 300);
    });

    if (window.appready) setTimeout(applyHidden, 300);
    new MutationObserver(applyHidden).observe(document.body, { childList: true, subtree: true });

})();
