(function () {
    'use strict';

    // Тільки для Lampa 3.0+
    if (Lampa.Manifest.app_digital < 300) return;

    if (window.keyboard_pro_plugin) return;
    window.keyboard_pro_plugin = true;

    // === Переклади ===
    Lampa.Lang.add({
        keyboard_title:          { uk: 'Клавіатура',            ru: 'Клавиатура',            en: 'Keyboard' },
        keyboard_default:        { uk: 'Мова за замовчуванням', ru: 'Язык по умолчанию',    en: 'Default language' },
        keyboard_uk:             { uk: 'Українська',            ru: 'Украинская',            en: 'Ukrainian' },
        keyboard_ru:             { uk: 'Російська',             ru: 'Русская',               en: 'Russian' },
        keyboard_en:             { uk: 'Англійська',            ru: 'Английская',            en: 'English' },
        keyboard_he:             { uk: 'Іврит (עִברִית)',       ru: 'Иврит (עִברִית)',       en: 'Hebrew (עִברִית)' },
        keyboard_hide:           { uk: 'Приховати зі списку',   ru: 'Скрыть из списка',      en: 'Hide from list' },
        keyboard_profile_name:   { uk: 'Назва профілю (необовʼязково)', ru: 'Имя профиля (необязательно)', en: 'Profile name (optional)' }
    });

    // Ключі в Storage
    var storage = {
        default_lang: 'keyboard_default_lang',   // uk | ru | en | he
        hide_uk:      'keyboard_hide_uk',
        hide_ru:      'keyboard_hide_ru',
        hide_en:      'keyboard_hide_en',
        ',
        hide_he:      'keyboard_hide_he',
        profile_name: 'keyboard_profile_name'
    };

    // Іконка
    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

    // Додаємо розділ у налаштування
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_pro',
        name: Lampa.Lang.translate('keyboard_title'),
        icon: icon
    });

    // === Головний обробник ===
    Lampa.SettingsApi.addParam({
        component: 'keyboard_pro',
        param: { name: 'open_menu', type: 'trigger', default: false },
        field: { name: Lampa.Lang.translate('keyboard_title'), description: '' },
        onRender: function (el) {
            el.off('hover:enter').on('hover:enter', openKeyboardMenu);
        }
    });

    // === Відкриття меню з галочками та радіокнопками ===
    function openKeyboardMenu() {
        var defaultLang = Lampa.Storage.get(storage.default_lang, 'uk');

        var items = [];

        // ——— Мова за замовчуванням (радіокнопки) ———
        items.push({ title: Lampa.Lang.translate('keyboard_default'), separator: true });

        items.push({
            title: Lampa.Lang.translate('keyboard_uk'),
            selected: defaultLang === 'uk',
            radio: true,
            lang: 'uk'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_ru'),
            selected: defaultLang === 'ru',
            radio: true,
            lang: 'ru'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_en'),
            selected: defaultLang === 'en',
            radio: true,
            lang: 'en'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_he'),
            selected: defaultLang.translate('keyboard_he'),
            selected: defaultLang === 'he',
            radio: true,
            lang: 'he'
        });

        // ——— Приховати зі списку (галочки) ———
        items.push({ title: Lampa.Lang.translate('keyboard_hide'), separator: true });

        items.push({
            title: Lampa.Lang.translate('keyboard_uk'),
            selected: Lampa.Storage.get(storage.hide_uk, 'false') === 'true' && defaultLang !== 'uk',
            checkbox: true,
            lang: 'uk'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_ru'),
            selected: Lampa.Storage.get(storage.hide_ru, 'true') === 'true' && defaultLang !== 'ru',
            checkbox: true,
            lang: 'ru'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_en'),
            selected: Lampa.Storage.get(storage.hide_en, 'false') === 'true' && defaultLang !== 'en',
            checkbox: true,
            lang: 'en'
        });
        items.push({
            title: Lampa.Lang.translate('keyboard_he'),
            selected: Lampa.Storage.get(storage.hide_he, 'true') === 'true' && defaultLang !== 'he',
            checkbox: true,
            lang: 'he'
        });

        // ——— Поле введення тексту (наприклад, назва профілю) ———
        items.push({ title: Lampa.Lang.translate('keyboard_profile_name'), separator: true });
        items.push({
            title: Lampa.Storage.get(storage.profile_name, ''),
            input: true,
            placeholder: Lampa.Lang.translate('keyboard_profile_name')
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('keyboard_title'),
            items: items,
            onSelect: function (item) {
                // Радіокнопки — вибір мови за замовчуванням
                if (item.radio && item.lang) {
                    Lampa.Storage.set(storage.default_lang, item.lang);
                    Lampa.Storage.set('keyboard_default_lang', item.lang); // для самої Lampa
                    forceDefaultKeyboard();
                }

                // Галочки — приховати мову
                if (item.checkbox && item.lang) {
                    var key = storage['hide_' + item.lang];
                    var newVal = Lampa.Storage.get(key, 'false') === 'true' ? 'false' : 'true';
                    Lampa.Storage.set(key, newVal);
                }

                // Поле вводу
                if (item.input !== undefined) {
                    Lampa.Input.edit({
                        title: Lampa.Lang.translate('keyboard_profile_name'),
                        value: Lampa.Storage.get(storage.profile_name, ''),
                        onChange: function (text) {
                            Lampa.Storage.set(storage.profile_name, text);
                        }
                    });
                    return; // не закриваємо меню
                }

                applyHiding();
                openKeyboardMenu(); // оновлюємо меню з новими галочками
            },
            onBack: function () {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }

    // === Приховування розкладок ===
    function applyHiding() {
        var def = Lampa.Storage.get(storage.default_lang, 'uk');

        // Українська
        if (Lampa.Storage.get(storage.hide_uk, 'false') === 'true' && def !== 'uk') {
            $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        }
        // Російська
        if (Lampa.Storage.get(storage.hide_ru, 'true') === 'true' && def !== 'ru') {
            $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        }
        // Англійська
        if (Lampa.Storage.get(storage.hide_en, 'false') === 'true' && def !== 'en') {
            $('.selectbox-item.selector > div:contains("English")').parent().hide();
        }
        // Іврит
        if (Lampa.Storage.get(storage.hide_he, 'true') === 'true' && def !== 'he') {
            $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
        }
    }

    // === Примусово встановити мову за замовчуванням ===
    function forceDefaultKeyboard() {
        var lang = Lampa.Storage.get(storage.default_lang, 'uk');
        Lampa.Storage.set('keyboard_default_lang', lang);

        setTimeout(function () {
            var btn = $('.hg-button.hg-functionBtn.hg-button-LANG');
            if (btn.length === 0) return;

            var target = { uk: 'Й', ru: 'Й', en: 'Q', he: 'ש' }[lang] || 'Й';

            var attempts = 0;
            var int = setInterval(function () {
                if ($('.hg-button.hg-activeButton:contains("' + target + '")').length > 0 || attempts > 20) {
                    clearInterval(int);
                } else {
                    btn.trigger('hover:enter');
                }
                attempts++;
            }, 100);
        }, 300);
    }

    // === MutationObserver + запуск при пошуку ===
    var observer = new MutationObserver(applyHiding);
    observer.observe(document.body, { childList: true, subtree: true });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            setTimeout(function () {
                applyHiding();
                forceDefaultKeyboard();
            }, 300);
        }
    });

    // Застосовуємо при старті
    if (window.appready) {
        setTimeout(function () {
            applyHiding();
            forceDefaultKeyboard();
        }, 1000);
    }

})();
