(function () {
    'use strict';

    // Назви мов у віртуальній клавіатурі Lampa (текст для пошуку :contains)
    var languages = {
        ru: { text: 'Русский' },
        uk: { text: 'Українська' },
        en: { text: 'English' },
        he: { text: 'עִברִית' }
    };

    // Налаштування за замовчуванням (true = приховати мову)
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
        // Доповнюємо відсутніми ключами значеннями за замовчуванням
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

    // Функція приховування/показу мов на основі налаштувань
    function hideLanguages() {
        var settings = getSettings();

        // Примусово встановлюємо default мову, щоб уникнути конфліктів
        Lampa.Storage.set('keyboard_default_lang', 'default');

        // Проходимо по всіх мовах і застосовуємо налаштування
        for (var key in languages) {
            var lang = languages[key];
            var $item = $('.selectbox-item.selector > div:contains("' + lang.text + '")');
            if ($item.length > 0) {
                var $parent = $item.parent('div');
                if (settings[key]) {
                    $parent.hide();  // Приховуємо, якщо чекбокс увімкнено
                } else {
                    $parent.show();  // Показуємо, якщо вимкнено
                }
            }
        }
    }

    // Watcher для динамічного відстеження появи кнопки клавіатури
    function startWatcher() {
        setInterval(function () {
            var $langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
            if ($langButton.length > 0) {
                hideLanguages();
            }
        }, 300);  // Інтервал 300 мс — баланс між швидкістю та навантаженням
    }

    // Функція створення меню в налаштуваннях (використовуємо Lampa.Settings.main)
    function createMenu() {
        var settings = getSettings();
        var html = '<div class="settings-folder selector" data-component="keyboard_hide" data-parent="main">';
        html += '<div class="settings-folder__title selector">' +
                '<div class="settings-folder__name">Вимкнення клавіатур</div>' +
                '<div class="settings-folder__icon"></div>' +
                '</div>';
        html += '<div class="settings-folder__content" data-component="keyboard_hide_content">';
        
        // Чекбокс для російської
        html += '<div class="simple-settings-item">';
        html += '<div class="settings-item__left">Російська</div>';
        html += '<div class="settings-item__right">';
        html += '<div class="simple-settings-item__value checkbox" data-key="ru">' +
                '<div class="checkbox__input ' + (settings.ru ? 'active' : '') + '"></div>' +
                '</div></div></div>';

        // Чекбокс для української
        html += '<div class="simple-settings-item">';
        html += '<div class="settings-item__left">Українська</div>';
        html += '<div class="settings-item__right">';
        html += '<div class="simple-settings-item__value checkbox" data-key="uk">' +
                '<div class="checkbox__input ' + (settings.uk ? 'active' : '') + '"></div>' +
                '</div></div></div>';

        // Чекбокс для англійської
        html += '<div class="simple-settings-item">';
        html += '<div class="settings-item__left">English</div>';
        html += '<div class="settings-item__right">';
        html += '<div class="simple-settings-item__value checkbox" data-key="en">' +
                '<div class="checkbox__input ' + (settings.en ? 'active' : '') + '"></div>' +
                '</div></div></div>';

        // Чекбокс для івриту
        html += '<div class="simple-settings-item">';
        html += '<div class="settings-item__left">עִברִית (Іврит)</div>';
        html += '<div class="settings-item__right">';
        html += '<div class="simple-settings-item__value checkbox" data-key="he">' +
                '<div class="checkbox__input ' + (settings.he ? 'active' : '') + '"></div>' +
                '</div></div></div>';

        html += '</div></div>';

        // Додаємо HTML у контейнер налаштувань (після існуючих items)
        var $settingsMain = $('.settings__body.settings__category--main .settings__item:last');
        if ($settingsMain.length > 0) {
            $settingsMain.after(html);
        } else {
            $('.settings__body.settings__category--main').append(html);
        }

        // Обробник кліків по чекбоксах
        $(document).on('hover:enter', '.checkbox[data-key]', function (e) {
            var key = $(this).attr('data-key');
            settings[key] = !settings[key];
            setSettings(settings);
            hideLanguages();  // Миттєво застосовуємо зміни

            // Оновлюємо візуал чекбоксу
            if (settings[key]) {
                $(this).find('.checkbox__input').addClass('active');
            } else {
                $(this).find('.checkbox__input').removeClass('active');
            }

            // Закриваємо/відкриваємо меню для ефекту (стандартний toggle)
            Lampa.Controller.toggle('settings_component');
            setTimeout(function () {
                Lampa.Controller.toggle('settings_component');
            }, 100);
        });

        // Обробник для відкриття підрозділу
        $(document).on('hover:enter', '[data-component="keyboard_hide"] .settings-folder__title', function () {
            var content = $(this).next('.settings-folder__content');
            content.slideToggle(200);
        });
    }

    // Ініціалізація плагіну
    function initPlugin() {
        hideLanguages();  // Початкове приховування
        startWatcher();   // Запуск watcher
        createMenu();     // Створення меню
    }

    // Чекаємо готовності додатка Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });
    }

})();
