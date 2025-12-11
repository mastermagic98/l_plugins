(function () {
    'use strict';

    var plugin_name = 'Приховати клавіатуру';

    // Твоя SVG-іконка як data-uri
    var keyboard_icon = 'data:image/svg+xml;base64,' + btoa('<svg width="800" height="800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21 13.29a.9.9 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.54.54 1 1 0 1 0 1.84 0 1 1 0 0 0-.21-.33M13.5 11h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2m-4 0h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2m-3-2h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m.71 4.29a1 1 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.33.21 1 1 0 0 0-.21.33 1 1 0 1 0 1.92.38.84.84 0 0 0-.08-.38 1 1 0 0 0-.21-.33"/></svg>');

    var defaults = {
        default_lang: 'uk',
        hide_uk: false,
        hide_en: false,
        hide_he: false,
        hide_ru: true
    };

    function getSettings() {
        var s = Lampa.Storage.get('keyboard_manager', {});
        if (Object.keys(s).length === 0) {
            Lampa.Storage.set('keyboard_manager', defaults);
            return defaults;
        }
        return s;
    }

    function applyHiding() {
        var s = getSettings();
        if (s.hide_uk) $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        if (s.hide_en) $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (s.hide_he) $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
        if (s.hide_ru) $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
    }

    function setDefaultLanguage() {
        var s = getSettings();
        Lampa.Storage.set('keyboard_default_lang', s.default_lang);

        setTimeout(function () {
            var btn = $('.hg-button.hg-functionBtn.hg-button-LANG');
            if (btn.length === 0) return;

            var target = '';
            if (s.default_lang === 'uk') target = 'Й';
            if (s.default_lang === 'en') target = 'Q';
            if (s.default_lang === 'he') target = 'ש';
            if (s.default_lang === 'ru') target = 'Й';

            var attempts = 0;
            var checker = setInterval(function () {
                attempts++;
                if ($('.hg-button.hg-activeButton:contains("' + target + '")').length > 0 || attempts > 15) {
                    clearInterval(checker);
                    return;
                }
                btn.trigger('hover:enter');
            }, 100);
        }, 350);
    }

    function start() {
        var settings = getSettings();

        // Додаємо пункт у меню налаштувань (як "Інше")
        Lampa.Settings.main().render().find('[data-component="more"]').before(
            '<div class="settings-folder selector" data-action="keyboard_manager">' +
                '<div class="settings-folder__icon">' +
                    '<img src="' + keyboard_icon + '">' +
                '</div>' +
                '<div class="settings-folder__name">' + plugin_name + '</div>' +
            '</div>'
        );

        // Обробник натискання — відкриваємо вікно вибору як для сторінок
        $(document).off('hover:enter', '[data-action="keyboard_manager"]').on('hover:enter', '[data-action="keyboard_manager"]', function () {
            var items = [];

            // Українська
            items.push({
                title: 'Українська',
                selected: settings.default_lang === 'uk',
                lang_code: 'uk',
                hidden: settings.hide_uk
            });

            // English
            items.push({
                title: 'English',
                selected: settings.default_lang === 'en',
                lang_code: 'en',
                hidden: settings.hide_en
            });

            // עִברִית
            items.push({
                title: 'עִברִית',
                selected: settings.default_lang === 'he',
                lang_code: 'he',
                hidden: settings.hide_he
            });

            // Русский
            items.push({
                title: 'Русский',
                selected: settings.default_lang === 'ru',
                lang_code: 'ru',
                hidden: settings.hide_ru
            });

            Lampa.Select.show({
                title: 'Вибрати мову клавіатури',
                items: items,
                onSelect: function (item) {
                    if (item.lang_code) {
                        settings.default_lang = item.lang_code;
                        Lampa.Storage.set('keyboard_default_lang', item.lang_code);
                    }

                    // Перемикаємо видимість (toggle)
                    if (item.lang_code === 'uk') settings.hide_uk = !settings.hide_uk;
                    if (item.lang_code === 'en') settings.hide_en = !settings.hide_en;
                    if (item.lang_code === 'he') settings.hide_he = !settings.hide_he;
                    if (item.lang_code === 'ru') settings.hide_ru = !settings.hide_ru;

                    Lampa.Storage.set('keyboard_manager', settings);
                    applyHiding();
                    setDefaultLanguage();
                },
                onBack: function () {
                    Lampa.Controller.toggle('settings_component');
                }
            });
        });

        // При відкритті пошуку
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'start') {
                setTimeout(function () {
                    applyHiding();
                    setDefaultLanguage();
                }, 300);
            }
        });

        // Якщо додаток вже готовий
        if (window.appready) {
            setTimeout(function () {
                applyHiding();
                setDefaultLanguage();
            }, 600);
        }
    }

    // Запуск плагіну
    if (window.appready) {
        start();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                start();
            }
        });
    }

})();
