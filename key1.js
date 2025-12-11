(function () {
    'use strict';

    // Назви мов у віртуальній клавіатурі Lampa
    var languages = {
        ru: { name: 'Русский',      text: 'Русский' },
        uk: { name: 'Українська',   text: 'Українська' },
        en: { name: 'English',      text: 'English' },
        he: { name: 'עִברִית',     text: 'עִברִית' }
    };

    // Налаштування за замовчуванням (вимкнені — false)
    var defaultSettings = {
        ru: false,
        uk: false,
        en: false,
        he: false
    };

    // Завантажуємо збережені налаштування
    function getSettings() {
        var saved = Lampa.Storage.get('keyboard_hide_langs', '{}');
        try {
            saved = JSON.parse(saved);
        } catch (e) {
            saved = {};
        }
        // Доповнюємо відсутніми ключами
        for (var key in defaultSettings) {
            if (typeof saved[key] === 'undefined') {
                saved[key] = defaultSettings[key];
            }
        }
        return saved;
    }

    // Зберігаємо налаштування
    function setSettings(data) {
        Lampa.Storage.set('keyboard_hide_langs', JSON.stringify(data));
    }

    // Основна функція приховування мов
    function hideLanguages() {
        var settings = getSettings();

        // Примусово ставимо default, щоб не було випадково іншої мови
        Lampa.Storage.set('keyboard_default_lang', 'default');

        Object.keys(languages).forEach(function (key) {
            var lang = languages[key];
            var $item = $('.selectbox-item.selector > div:contains("' + lang.text + '")');

            if ($item.length > 0) {
                if (settings[key]) {
                    $item.parent('div').hide();        // Приховуємо
                } else {
                    $item.parent('div').show();        // Показуємо
                }
            }
        });
    }

    // Інтервал для відстеження появи клавіатури
    function startWatcher() {
        setInterval(function () {
            var $langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
            if ($langButton.length > 0) {
                hideLanguages();
            }
        }, 300); // Кожні 300 мс — достатньо швидко і не навантажує
    }

    // Додаємо пункт у меню
    function addMenuItem() {
        var settings = getSettings();

        var menuItem = {
            title: 'Вимкнення клавіатур',
            items: [
                {
                    title: 'Російська',
                    selected: settings.ru,
                    action: function () {
                        settings.ru = !settings.ru;
                        setSettings(settings);
                        hideLanguages();
                        Lampa.Controller.toggle('settings_component');
                        setTimeout(function () { Lampa.Controller.toggle('settings_component'); }, 100);
                    }
                },
                {
                    title: 'Українська',
                    selected: settings.uk,
                    action: function () {
                        settings.uk = !settings.uk;
                        setSettings(settings);
                        hideLanguages();
                        Lampa.Controller.toggle('settings_component');
                        setTimeout(function () { Lampa.Controller.toggle('settings_component'); }, 100);
                    }
                },
                {
                    title: 'English',
                    selected: settings.en,
                    action: function () {
                        settings.en = !settings.en;
                        setSettings(settings);
                        hideLanguages();
                        Lampa.Controller.toggle('settings_component');
                        setTimeout(function () { Lampa.Controller.toggle('settings_component'); }, 100);
                    }
                },
                {
                    title: 'עִברִית (Іврит)',
                    selected: settings.he,
                    action: function () {
                        settings.he = !settings.he;
                        setSettings(settings);
                        hideLanguages();
                        Lampa.Controller.toggle('settings_component');
                        setTimeout(function () { Lampa.Controller.toggle('settings_component'); }, 100);
                    }
                }
            ]
        };

        // Додаємо в головне меню налаштувань
        Lampa.Settings.items = Lampa.Settings.items || [];
        var exists = false;
        for (var i = 0; i < Lampa.Settings.items.length; i++) {
            if (Lampa.Settings.items[i].title === 'Вимкнення клавіатур') {
                Lampa.Settings.items[i] = menuItem;
                exists = true;
                break;
            }
        }
        if (!exists) {
            Lampa.Settings.items.push(menuItem);
        }

        // Оновлюємо меню
        if (Lampa.Settings && Lampa.Settings.update) {
            Lampa.Settings.update();
        }
    }

    // Запуск при готовності додатка
    function startPlugin() {
        hideLanguages();
        startWatcher();
        addMenuItem();
    }

    // Чекаємо готовності Lampa
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
