(function () {
    'use strict';

    if (!window.Lampa) return;
    if (window.kb_prompt_plugin_ready) return;
    window.kb_prompt_plugin_ready = true;

    const keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    const languages = ['Українська', 'Русский', 'English', 'עִברִית'];

    // --- Функція для приховування мов ---
    function applyHidden() {
        try {
            $('.selectbox-item').show(); // показуємо всі спочатку
            if (Lampa.Storage.get(keys.uk) === 'true') $('.selectbox-item:contains("Українська")').hide();
            if (Lampa.Storage.get(keys.ru) === 'true') $('.selectbox-item:contains("Русский")').hide();
            if (Lampa.Storage.get(keys.en) === 'true') $('.selectbox-item:contains("English")').hide();
            if (Lampa.Storage.get(keys.he) === 'true') $('.selectbox-item:contains("עִברִית")').hide();
        } catch (e) { }
    }

    // --- Меню вибору мов ---
    function openLanguageMenu() {
        const items = [
            { title: 'Вибір мови', separator: true }
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
                setTimeout(applyHidden, 100);
                setTimeout(openLanguageMenu, 120);
            },
            onBack() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // --- Обробка вибору типу клавіатури ---
    $(document).off('hover:enter', '[data-name="keyboard_type"]').on('hover:enter', '[data-name="keyboard_type"]', function() {
        const value = $(this).find('.settings-param__value').text().trim();
        if (value === 'Вбудована') {
            Lampa.Modal.confirm('Вимкнути розкладку?', function(result) {
                if (result) openLanguageMenu();
            });
        }
    });

    // --- Слухач для застосування прихованих мов при запуску ---
    Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') setTimeout(applyHidden, 300);
    });

    if (window.appready) setTimeout(applyHidden, 300);

})();
