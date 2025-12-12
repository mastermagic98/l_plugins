(function () {
    'use strict';

    // Захист від дублювання / старих версій
    if (!window.Lampa || !Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;

    // Ключі налаштувань
    var keys = {
        uk: 'kb_hide_uk_final',
        ru: 'kb_hide_ru_final',
        en: 'kb_hide_en_final',
        he: 'kb_hide_he_final'
    };

    // Іконка (SVG)
    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    // Малий хелпер для логів (видно у UI)
    function log(msg) {
        try { Lampa.Noty.show(msg); } catch (e) { console.log('kb_hide_plugin: ' + msg); }
    }

    // Безпечний читач Storage (повертає 'true' або 'false')
    function getBool(key, def) {
        var v = Lampa.Storage.get(key, def === true ? 'true' : 'false');
        return v === 'true';
    }

    // Стабільний apply: спочатку показуємо всі, потім ховаємо потрібні
    function showAllSelectors() {
        try {
            $('.selectbox-item__title').closest('.selectbox-item').show();
            $('.selectbox-item.selector').show();
            $('.selectbox-item').show();
        } catch (e) { /* silent */ }
    }

    function apply() {
        try {
            showAllSelectors();

            if (getBool(keys.uk, false)) {
                $('.selectbox-item__title:contains("Українська")').closest('.selectbox-item').hide();
                $('.selectbox-item:contains("Українська")').hide();
            }

            if (getBool(keys.ru, false)) {
                $('.selectbox-item__title:contains("Русский")').closest('.selectbox-item').hide();
                $('.selectbox-item:contains("Русский")').hide();
            }

            if (getBool(keys.en, false)) {
                $('.selectbox-item__title:contains("English")').closest('.selectbox-item').hide();
                $('.selectbox-item:contains("English")').hide();
            }

            if (getBool(keys.he, false)) {
                $('.selectbox-item__title:contains("עִברִית")').closest('.selectbox-item').hide();
                $('.selectbox-item:contains("עִбрִית")').hide();
                $('.selectbox-item:contains("עִברִית")').hide();
            }
        } catch (e) {
            console.error('kb_hide_plugin apply error', e);
        }
    }

    // Побудова пунктів меню — повертає масив items гарантовано у вірному вигляді
    function buildItems() {
        var langs = [
            { title: "Українська", code: "uk" },
            { title: "Русский", code: "ru" },
            { title: "English", code: "en" },
            { title: "עִברִית", code: "he" }
        ];

        var items = [];
        items.push({ title: 'Вимкнути розкладку', separator: true });

        langs.forEach(function (i) {
            // додаємо і checked, і selected — на випадок різних версій Lampa
            var checked = getBool(keys[i.code], false);
            items.push({
                title: i.title,
                checkbox: true,
                checked: checked,
                selected: checked,
                code: i.code
            });
        });

        return items;
    }

    // Функція, яка гарантовано покаже Selectbox і наповнить його (з захистом)
    function openMenu() {
        try {
            var items = buildItems();

            // додатковий захист: якщо items пустий — покажемо Noty і повернемося
            if (!items || !items.length) {
                log('Помилка: items порожні');
                return;
            }

            // викликаємо Select.show
            Lampa.Select.show({
                title: 'Вимкнути розкладку',
                items: items,
                onSelect: function (a) {
                    try {
                        if (!a || (!a.checkbox && !a.code)) return;

                        var key = keys[a.code];
                        var next = Lampa.Storage.get(key) === 'true' ? 'false' : 'true';
                        Lampa.Storage.set(key, next);

                        // застосувати і оновити меню з невеликою затримкою
                        setTimeout(apply, 120);
                        setTimeout(openMenu, 150);
                    } catch (err) {
                        console.error('kb_hide_plugin onSelect error', err);
                    }
                },
                onBack: function () {
                    try { Lampa.Controller.toggle('settings_component'); } catch (e) {}
                }
            });
        } catch (e) {
            console.error('kb_hide_plugin openMenu error', e);
            log('Відкриття меню не вдалось — див. консоль');
        }
    }

    /* ========== Надійна реєстрація в налаштуваннях ========== */

    // 1) Перш за все пробуємо простий addComponent з onEnter (більш чистий варіант)
    try {
        Lampa.SettingsApi.addComponent({
            component: 'keyboard_hide_plugin',
            name: 'Вимкнути розкладку',
            icon: icon,
            onEnter: openMenu // якщо API підтримує — буде працювати
        });
    } catch (e) {
        // ignore
    }

    // 2) Фолбек: якщо addComponent не створив clickable елемент (залежно від версії),
    // — додаємо елемент в DOM вручну у блоці Settings через MutationObserver.
    function ensureSettingsEntry() {
        try {
            var render = Lampa.Settings.main().render();
            if (!render || !render.length) return;

            // Захист: якщо вже є — не додаємо
            if (render.find('[data-kb-plugin]').length) return;

            var html = '<div class="settings-folder selector" data-kb-plugin>' +
                '<div class="settings-folder__icon">' + icon + '</div>' +
                '<div class="settings-folder__name">Вимкнути розкладку</div>' +
                '</div>';

            var more = render.find('[data-component="more"]');
            if (more.length) more.before(html); else render.append(html);

            // Прив'язка події click/hover:enter
            $(document).off('hover:enter', '[data-kb-plugin]').on('hover:enter', '[data-kb-plugin]', function () {
                openMenu();
            });

            // Додатково прив'язуємо click для середовищ, де hover:enter не спрацьовує
            $(document).off('click', '[data-kb-plugin]').on('click', '[data-kb-plugin]', function () {
                openMenu();
            });
        } catch (e) {
            console.error('kb_hide_plugin ensureSettingsEntry error', e);
        }
    }

    // Викликаємо ensureSettingsEntry після готовності UI та періодично невеликий чек
    try {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(ensureSettingsEntry, 300);
                setTimeout(apply, 800);
            }
        });
    } catch (e) { /* ignore */ }

    // Якщо вже ready
    if (window.appready) {
        setTimeout(ensureSettingsEntry, 250);
        setTimeout(apply, 800);
    }

    // MutationObserver — на випадок динамічного рендеру меню
    try {
        new MutationObserver(function () {
            // поки список налаштувань може перерендеритись — із затримкою ставимо ensure
            setTimeout(ensureSettingsEntry, 200);
            setTimeout(apply, 350);
        }).observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* ignore */ }

    // Listener follow full/ start
    try {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'start') {
                setTimeout(apply, 300);
            }
        });
    } catch (e) { /* ignore */ }

    // Фінальний лог
    setTimeout(function () {
        log('Плагін: Увімкнено — натисніть "Вимкнути розкладку" у Налаштуваннях');
    }, 500);

})();
