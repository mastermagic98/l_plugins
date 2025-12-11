(function () {
    'use strict';

    // === Багатомовність плагіну ===
    Lampa.Lang.add({
        keyboard_switch_off: {
            ru: 'Отключение клавиатуры',
            en: 'Keyboard Layout Disable',
            uk: 'Вимкнення розкладки клавіатури',
            be: 'Адключэнне раскладкі клавіятуры'
        },
        keyboard_switch_off_desc: {
            ru: 'Отключает выбранную языковую раскладку виртуальной клавиатуры в настройках',
            en: 'Disables the selected language layout of the virtual keyboard in settings',
            uk: 'Вимикає обрану мовну розкладку віртуальної клавіатури в налаштуваннях',
            be: 'Адключае выбраную моўную раскладку віртуальнай клавіятуры ў наладах'
        }
    });

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '1.1.0',
            name: Lampa.Lang.translate('keyboard_switch_off'),
            description: Lampa.Lang.translate('keyboard_switch_off_desc'),
            component: 'keyboard_switch_off',
            icon: '<svg width="800" height="800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21 13.29a.9.9 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.54.54 1 1 0 1 0 1.84 0 1 1 0 0 0-.21-.33M13.5 11h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0-2m-4 0h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2m-3-2h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m.71 4.29a1 1 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.33.21 1 1 0 0 0-.21.33 1 1 0 1 0 1.92.38.84.84 0 0 0-.08-.38 1 1 0 0 0-.21-.33"/></svg>'
        };
        Lampa.Manifest.plugins = manifest;

        // === Кнопка в розділі "Інтерфейс" ===
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { type: 'button' },
            field: {
                name: Lampa.Lang.translate('keyboard_switch_off'),
                description: Lampa.Lang.translate('keyboard_switch_off_desc')
            },
            onChange: function () {
                Lampa.Settings.create('keyboard_switch_off', {
                    title: Lampa.Lang.translate('keyboard_switch_off'),
                    component: 'keyboard_switch_off',
                    onBack: function () {
                        Lampa.Settings.create('interface');
                    }
                });
            }
        });

        // === Заголовок розділу ===
        Lampa.SettingsApi.addParam({
            component: 'keyboard_switch_off',
            param: { type: 'title' },
            field: { name: Lampa.Lang.translate('keyboard_switch_off') }
        });

        // === Параметр вибору мови для відключення ===
        Lampa.SettingsApi.addParam({
            component: 'keyboard_switch_off',
            param: {
                name: 'KeyboardSwitchOff',
                type: 'select',
                values: {
                    SwitchOff_None: 'Не отключать',
                    SwitchOff_UA: 'Українська',
                    SwitchOff_RU: 'Русский',
                    SwitchOff_EN: 'English',
                    SwitchOff_HE: 'עִברִית (Hebrew)'
                },
                default: 'SwitchOff_None'
            },
            field: {
                name: 'Неиспользуемая клавиатура',
                description: 'Выберите язык для отключения'
            },
            onChange: applyKeyboardSetting,
            onRender: function (element, param) {
                var saved = Lampa.Storage.get('KeyboardSwitchOff', 'SwitchOff_None');
                element.val(saved);
                applyKeyboardSetting(saved);
            }
        });

        // === Функція застосування налаштувань ===
        function applyKeyboardSetting(value) {
            if (typeof value === 'object') {
                value = Lampa.Storage.get('KeyboardSwitchOff', 'SwitchOff_None');
            } else {
                Lampa.Storage.set('KeyboardSwitchOff', value);
            }

            // Скидаємо попередні зміни (показуємо всі варіанти)
            var allSelectors = [
                '.selectbox-item.selector > div:contains("Українська")',
                '.selectbox-item.selector > div:contains("Русский")',
                '.selectbox-item.selector > div:contains("English")',
                '.selectbox-item.selector > div:contains("עִברִית")',
                '.selectbox-item.selector > div:contains("Hebrew")'
            ];
            var allItems = document.querySelectorAll(allSelectors.join(', '));
            for (var j = 0; j < allItems.length; j++) {
                allItems[j].parentNode.style.display = '';
            }

            // Застосовуємо нове значення
            if (value === 'SwitchOff_None') {
                Lampa.Storage.set('keyboard_default_lang', 'default');
                return;
            }

            if (value === 'SwitchOff_UA') {
                Lampa.Storage.set('keyboard_default_lang', 'default');
                var elementUA = document.querySelectorAll('.selectbox-item.selector > div:contains("Українська")');
                for (var i = 0; i < elementUA.length; i++) {
                    elementUA[i].parentNode.style.display = 'none';
                }
            }

            if (value === 'SwitchOff_RU') {
                Lampa.Storage.set('keyboard_default_lang', 'uk');
                var elementRU = document.querySelectorAll('.selectbox-item.selector > div:contains("Русский")');
                for (var i = 0; i < elementRU.length; i++) {
                    elementRU[i].parentNode.style.display = 'none';
                }
            }

            if (value === 'SwitchOff_EN') {
                var currentLang = Lampa.Storage.get('language', 'ru');
                if (currentLang === 'uk') {
                    Lampa.Storage.set('keyboard_default_lang', 'uk');
                } else {
                    Lampa.Storage.set('keyboard_default_lang', 'default');
                }
                var elementEN = document.querySelectorAll('.selectbox-item.selector > div:contains("English")');
                for (var i = 0; i < elementEN.length; i++) {
                    elementEN[i].parentNode.style.display = 'none';
                }
            }

            if (value === 'SwitchOff_HE') {
                Lampa.Storage.set('keyboard_default_lang', 'default');
                var elementHE = document.querySelectorAll('.selectbox-item.selector > div:contains("עִברִית"), .selectbox-item.selector > div:contains("Hebrew")');
                for (var i = 0; i < elementHE.length; i++) {
                    elementHE[i].parentNode.style.display = 'none';
                }
            }

            // Оновлюємо налаштування клавіатури (якщо відкрито)
            setTimeout(function () {
                if (typeof Lampa.Settings !== 'undefined' && Lampa.Settings.main) {
                    Lampa.Settings.update();
                }
            }, 100);
        }

        // Застосовуємо налаштування при старті (якщо вже вибрано)
        setTimeout(function () {
            var currentValue = Lampa.Storage.get('KeyboardSwitchOff', 'SwitchOff_None');
            if (currentValue !== 'SwitchOff_None') {
                applyKeyboardSetting(currentValue);
            }
        }, 500);
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
