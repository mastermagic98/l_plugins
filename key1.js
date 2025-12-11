(function () {
    'use strict';

    // === Багатомовність плагіну (uk, ru, en) ===
    Lampa.Lang.add({
        keyboard_lang_disable: {
            ru: 'Скрытие раскладок клавиатуры',
            en: 'Hide Keyboard Layouts',
            uk: 'Приховати розкладки клавіатури'
        },
        keyboard_lang_disable_desc: {
            ru: 'Скрывает ненужные раскладки встроенной клавиатуры Lampa (украинская, русская, английская, иврит)',
            en: 'Hides unnecessary layouts of the built-in Lampa keyboard (Ukrainian, Russian, English, Hebrew)',
            uk: 'Приховує непотрібні розкладки вбудованої клавіатури Lampa (українська, російська, англійська, іврит)'
        },
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
        // === Маніфест плагіну ===
        var manifest = {
            type: 'other',
            version: '1.0.4',
            name: Lampa.Lang.translate('keyboard_lang_disable'),
            description: Lampa.Lang.translate('keyboard_lang_disable_desc'),
            component: 'keyboard_lang_disable'
        };
        Lampa.Manifest.plugins = manifest;

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

        // === Функція оновлення видимості та стану ===
        function updateVisibilityAndState() {
            var keyboardType = Lampa.Storage.get('keyboard_type', 'lampa');
            var enabled = Lampa.Storage.get('keyboard_lang_disable_enabled', true);
            var toggleParam = $('.settings-param[data-name="keyboard_lang_disable_enabled"]');

            if (!toggleParam || toggleParam.length === 0) {
                return;
            }

            if (keyboardType === 'lampa') {
                toggleParam.show();
                if (enabled) {
                    startChecking();
                } else {
                    stopChecking();
                }
            } else {
                toggleParam.hide();
                stopChecking();
            }
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
            onRender: function (element, param) {
                updateVisibilityAndState();

                var saved = Lampa.Storage.get('keyboard_lang_disable_enabled', true);
                param.value = saved;
                element.prop('checked', saved);
            }
        });

        // === Слухаємо зміну типу клавіатури ===
        Lampa.SettingsApi.addListener('keyboard', 'keyboard_type', function (value) {
            updateVisibilityAndState();
        });

        // === Початкове застосування (з затримкою та перевіркою) ===
        setTimeout(function () {
            updateVisibilityAndState();
        }, 1500);

        // === Додаткова перевірка після повного рендеру налаштувань ===
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'ready') {
                setTimeout(updateVisibilityAndState, 500);
            }
        });
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
