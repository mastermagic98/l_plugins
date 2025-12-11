(function () {
    'use strict';

    // === Багатомовність плагіну ===
    Lampa.Lang.add({
        keyboard_lang_disable: {
            ru: 'Вимкнення розкладок клавіатури',
            uk: 'Вимкнення розкладок клавіатури',
            en: 'Keyboard Layouts Disable',
            be: 'Адключэнне раскладак клавіятуры',
            zh: '禁用键盘布局'
        },
        keyboard_lang_disable_desc: {
            ru: 'Приховує непотрібні розкладки віртуальної клавіатури (українська, російська, англійська, іврит)',
            uk: 'Приховує непотрібні розкладки віртуальної клавіатури (українська, російська, англійська, іврит)',
            en: 'Hides unnecessary virtual keyboard layouts (Ukrainian, Russian, English, Hebrew)',
            zh: '隐藏不需要的虚拟键盘布局（乌克兰语、俄语、英语、希伯来语）'
        }
    });

    function startPlugin() {
        var manifest = {
            type: 'other',
            version: '1.0.0',
            name: Lampa.Lang.translate('keyboard_lang_disable'),
            description: Lampa.Lang.translate('keyboard_lang_disable_desc'),
            component: 'keyboard_lang_disable',
            icon: '<svg width="800" height="800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21 13.29a.9.9 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.54.54 1 1 0 1 0 1.84 0 1 1 0 0 0-.21-.33M13.5 11h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2m-4 0h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2m-3-2h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2m.71 4.29a1 1 0 0 0-.33-.21 1 1 0 0 0-.76 0 .9.9 0 0 0-.33.21 1 1 0 0 0-.21.33 1 1 0 1 0 1.92.38.84.84 0 0 0-.08-.38 1 1 0 0 0-.21-.33"/></svg>'
        };
        Lampa.Manifest.plugins = manifest;

        // === Кнопка в розділі "Інтерфейс" ===
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { type: 'button' },
            field: {
                name: Lampa.Lang.translate('keyboard_lang_disable'),
                description: Lampa.Lang.translate('keyboard_lang_disable_desc')
            },
            onChange: function () {
                Lampa.Settings.create('keyboard_lang_disable', {
                    title: Lampa.Lang.translate('keyboard_lang_disable'),
                    component: 'keyboard_lang_disable',
                    onBack: function () {
                        Lampa.Settings.create('interface');
                    }
                });
            }
        });

        // === Заголовок розділу ===
        Lampa.SettingsApi.addParam({
            component: 'keyboard_lang_disable',
            param: { type: 'title' },
            field: { name: Lampa.Lang.translate('keyboard_lang_disable') }
        });

        // === Функція для приховування розкладок ===
        function hideKeyboardLanguages() {
            // Примусово встановлюємо англійську як дефолт (або будь-яку іншу, що не приховується)
            Lampa.Storage.set('keyboard_default_lang', 'default');

            // Українська
            var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
            if (elementUA.length > 0) {
                elementUA.parent('div').hide();
            }

            // Російська
            var elementRU = $('.selectbox-item.selector > div:contains("Русский")');
            if (elementRU.length > 0) {
                elementRU.parent('div').hide();
            }

            // Англійська
            var elementEN = $('.selectbox-item.selector > div:contains("English")');
            if (elementEN.length > 0) {
                elementEN.parent('div').hide();
            }

            // Іврит
            var elementHE = $('.selectbox-item.selector > div:contains("עִברִית")');
            if (elementHE.length > 0) {
                elementHE.parent('div').hide();
            }
        }

        // === Перевірка та приховування при відкритті клавіатури ===
        var checkInterval = null;

        function startChecking() {
            if (checkInterval) {
                clearInterval(checkInterval);
            }
            hideKeyboardLanguages(); // Одразу при старті
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

        // === Налаштування увімкнення/вимкнення плагіну ===
        Lampa.SettingsApi.addParam({
            component: 'keyboard_lang_disable',
            param: { type: 'toggle', name: 'keyboard_lang_disable_enabled' },
            field: {
                name: 'Увімкнути приховування розкладок',
                description: 'Приховує українську, російську, англійську та іврит'
            },
            default: true,
            onChange: function (value) {
                Lampa.Storage.set('keyboard_lang_disable_enabled', value);
                if (value) {
                    startChecking();
                } else {
                    stopChecking();
                }
            },
            onRender: function (element, param) {
                var saved = Lampa.Storage.get('keyboard_lang_disable_enabled', true);
                param.value = saved;
                element.prop('checked', saved);
                if (saved) {
                    startChecking();
                }
            }
        });

        // === Початкове застосування при завантаженні ===
        setTimeout(function () {
            var enabled = Lampa.Storage.get('keyboard_lang_disable_enabled', true);
            if (enabled) {
                startChecking();
            }
        }, 1000);
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
