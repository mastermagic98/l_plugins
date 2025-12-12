(function () {
    'use strict';

    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.kb_hide_final) return;
    window.kb_hide_final = true;

    // Переклади
    Lampa.Lang.add({
        kb_title: { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
        kb_header: { uk: 'Вимкнути розкладку клавіатури', ru: 'Отключить раскладку клавиатуры', en: 'Disable keyboard layout' },
        kb_uk: { uk: 'Українську', ru: 'Украинскую', en: 'Ukrainian' },
        kb_ru: { uk: 'Російську', ru: 'Русскую', en: 'Russian' },
        kb_en: { uk: 'Англійську', ru: 'Английскую', en: 'English' },
        kb_he: { uk: 'Іврит (עִברִית)', ru: 'Иврит (עִברִית)', en: 'Hebrew (עִברִית)' }
    });

    // Унікальні ключі — не конфліктують з іншими плагінами
    var keys = {
        uk: 'keyboard_hide_uk_v3',
        ru: 'keyboard_hide_ru_v3',
        en: 'keyboard_hide_en_v3',
        he: 'keyboard_hide_he_v3'
    };

    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    // Приховування клавіатур
    function apply() {
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        if (Lampa.Storage.get(keys.ru, 'true')  === 'true') $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        if (Lampa.Storage.get(keys.en, 'false') === 'true') $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (Lampa.Storage.get(keys.he, 'true')  === 'true') $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
    }

    // Відкриваємо меню
    function openMenu() {
        var items = [];

        items.push({
            title: Lampa.Lang.translate('kb_header'),
            separator: true
        });

        var list = [
            { code: 'ru', name: 'kb_ru' },
            { code: 'uk', name: 'kb_uk' },
            { code: 'en', name: 'kb_en' },
            { code: 'he', name: 'kb_he' }
        ];

        list.forEach(function (item) {
            var isChecked = Lampa.Storage.get(keys[item.code], item.code === 'ru' ? 'true' : 'false') === 'true';

            items.push({
                title: Lampa.Lang.translate(item.name),
                checkbox: true,
                checked: isChecked,
                code: item.code
            });
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('kb_title'),
            items: items,
            onSelect: function (a) {
                if (a.checkbox && a.code) {
                    {
                    var key = keys[a.code];
                    var current = Lampa.Storage.get(key, 'false') === 'true';
                    Lampa.Storage.set(key, current ? 'false' : 'true');
                    apply();
                    openMenu(); // оновлюємо галочки
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // Додаємо пункт у налаштування (надійний спосіб)
    function addItem() {
        var render = Lampa.Settings.main().render();

        if (render.find('[data-kb-final]').length) return;

        var html = '<div class="settings-folder selector" data-kb-final>'+
            '<div class="settings-folder__icon">'+icon+'</div>'+
            '<div class="settings-folder__name">'+Lampa.Lang.translate('kb_title')+'</div>'+
            '</div>';

        var more = render.find('[data-component="more"]');
        if (more.length) {
            more.before(html);
        } else {
            render.append(html);
        }

        $(document).off('hover:enter', '[data-kb-final]').on('hover:enter', '[data-kb-final]', openMenu);
    );
    }

    // Запуск
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            setTimeout(addItem, 500);
            setTimeout(apply, 1000);
        }
    });

    if (window.appready) {
        setTimeout(addItem, 500);
        setTimeout(apply, 1000);
    }

    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') setTimeout(apply, 300);
    });

})();
