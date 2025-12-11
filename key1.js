(function () {
    'use strict';

    // === Багатомовність плагіну (uk, ru, en) ===
    Lampa.Lang.add({
        keyboard_lang_disable_toggle: {
            ru: 'Приховувати розкладки',
            en: 'Hide layouts',
            uk: 'Приховувати розкладки'
        },
        keyboard_lang_disable_toggle_desc: {
            ru: 'Приховує українську, російську, англійську та іврит у вбудованій клавіатурі',
            en: 'Hides Ukrainian, Russian, English and Hebrew in the built-in keyboard',
            uk: 'Приховує українську, російську, англійську та іврит у вбудованій клавіатурі'
        }
    });

    function startPlugin() {
        // === Функція приховування розкладок ===
        function hideKeyboardLanguages() {
            Lampa.Storage.set('keyboard_default_lang', 'default');

            var elUA = $('.selectbox-item.selector > div:contains("Українська")');
            if (elUA.length > 0) {
                elUA.parent('div').hide();
            }

            var elRU = $('.selectbox-item.selector > div:contains("Русский")');
            if (elRU.length > 0) {
                elRU.parent('div').hide();
            }

            var elEN = $('.selectbox-item.selector > div:contains("English")');
            if (elEN.length > 0) {
                elEN.parent('div').hide();
            }

            var elHE = $('.selectbox-item.selector > div:contains("עִברִית")');
            if (elHE.length > 0) {
                elHE.parent('div').hide();
            }
        }

        var checkInterval = null;

        function startChecking() {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            hideKeyboardLanguages();
            checkInterval = setInterval(function () {
                var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
                if (langButton.length > 0) {
                    hideKeyboardLanguages();
                }
            }, 500);
        }

        function stopChecking() {
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
            }
        }

        // === Центральна функція оновлення видимості та стану ===
        function updateVisibilityAndState() {
            var keyboardType = Lampa.Storage.get('keyboard_type', 'lampa');
            var enabled = Lampa.Storage.get('keyboard_lang_disable_enabled', true);

            // Шукаємо всі можливі параметри (може бути кілька через перерендери)
            var toggleParams = $('.settings-param[data-name="keyboard_lang_disable_enabled"]');

            if (toggleParams.length === 0) {
                return;
            }

            if (keyboardType === 'lampa') {
                toggleParams.show();
                if (enabled) {
                    startChecking();
                } else {
                    stopChecking();
                }
            } else {
                toggleParams.hide();
                stopChecking();
            }

            // Оновлюємо стан чекбоксу
            toggleParams.find('input[type="checkbox"]').prop('checked', enabled);
        }

        // === Додаємо toggle в розділ keyboard ===
        Lampa.SettingsApi.addParam({
            component: 'keyboard',
            param: {
                type: 'toggle',
                name: 'keyboard_lang_disable_enabled'
            },
            field: {
                name: Lampa.Lang.translate('keyboard_lang_disable_toggle'),
                description: Lampa.Lang.translate('keyboard_lang_disable_toggle_desc')
            },
            default: true,
            onChange: function (value) {
                Lampa.Storage.set('keyboard_lang_disable_enabled', value);
                updateVisibilityAndState();
            },
            onBaseRender: function () {
                // Викликається при кожному рендері всього розділу keyboard
                setTimeout(updateVisibilityAndState, 100);
            },
            onRender: function (element, param) {
                // Викликається для конкретного елемента
                updateVisibilityAndState();
                var saved = Lampa.Storage.get('keyboard_lang_disable_enabled', true);
                element.prop('checked', saved);
            }
        });

        // === Слухаємо зміну типу клавіатури ===
        Lampa.SettingsApi.addListener('keyboard', 'keyboard_type', function (value) {
            updateVisibilityAndState();
        });

        // === Декілька спроб ініціалізації для надійності ===
        var initAttempts = 0;
        var initInterval = setInterval(function () {
            updateVisibilityAndState();
            initAttempts++;
            if (initAttempts > 10) {
                clearInterval(initInterval);
            }
        }, 800);

        // === Додатковий слухач повного готовності налаштувань ===
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'ready') {
                setTimeout(updateVisibilityAndState, 300);
            }
        });

        // === Початкове застосування ===
        setTimeout(updateVisibilityAndState, 1500);
    }

    // === Запуск плагіну ===
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
