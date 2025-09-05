(function () {
    'use strict';

    // Додаємо переклади для назв, описів опцій і кольорів
    Lampa.Lang.add({
        color_plugin: {(function () {
    'use strict';

    // Додаємо переклади для назв, описів опцій і кольорів
    Lampa.Lang.add({
        color_plugin: {
            ru: 'Настройка цветов',
            en: 'Color settings',
            uk: 'Налаштування кольорів'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        color_plugin_enabled_description: {
            ru: 'Дозволяє змінювати колір виділення та затемнення елементів інтерфейсу',
            en: 'Allows changing the highlight and dimming color of interface elements',
            uk: 'Дозволяє змінювати колір виділення та затемнення елементів інтерфейсу'
        },
        main_color: {
            ru: 'Цвет выделения',
            en: 'Highlight color',
            uk: 'Колір виділення'
        },
        main_color_description: {
            ru: 'Можна вибрати чи вказати колір для виділених елементів',
            en: 'You can select or specify a color for highlighted elements',
            uk: 'Можна вибрати чи вказати колір для виділених елементів'
        },
        enable_highlight: {
            ru: 'Включить рамку',
            en: 'Enable border',
            uk: 'Увімкнути рамку'
        },
        enable_highlight_description: {
            ru: 'Вмикається біла рамка на виділених елементах',
            en: 'Enables a white border on highlighted elements',
            uk: 'Вмикається біла рамка на виділених елементах'
        },
        enable_dimming: {
            ru: 'Применить цвет затемнения',
            en: 'Apply dimming color',
            uk: 'Застосувати колір затемнення'
        },
        enable_dimming_description: {
            ru: 'Змінюється колір затемних елементів',
            en: 'Changes the color of dimmed elements',
            uk: 'Змінюється колір затемнених елементів'
        },
        enable_rounding: {
            ru: 'Заокруглення',
            en: 'Rounding',
            uk: 'Заокруглення'
        },
        enable_rounding_description: {
            ru: 'Вмикає заокруглення кутів для виділених елементів',
            en: 'Enables corner rounding for highlighted elements',
            uk: 'Вмикає заокруглення кутів для виділених елементів'
        },
        default_color: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        custom_hex_input: {
            ru: 'Введи HEX-код цвета',
            en: 'Enter HEX color code',
            uk: 'Введи HEX-код кольору'
        },
        hex_input_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        },
        red: { ru: 'Красный', en: 'Red', uk: 'Червоний' },
        orange: { ru: 'Оранжевый', en: 'Orange', uk: 'Помаранчевий' },
        amber: { ru: 'Янтарный', en: 'Amber', uk: 'Бурштиновий' },
        yellow: { ru: 'Желтый', en: 'Yellow', uk: 'Жовтий' },
        lime: { ru: 'Лаймовый', en: 'Lime', uk: 'Лаймовий' },
        green: { ru: 'Зеленый', en: 'Green', uk: 'Зелений' },
        emerald: { ru: 'Изумрудный', en: 'Emerald', uk: 'Смарагдовий' },
        teal: { ru: 'Бирюзовый', en: 'Teal', uk: 'Бірюзовий' },
        cyan: { ru: 'Голубой', en: 'Cyan', uk: 'Блакитний' },
        sky: { ru: 'Небесный', en: 'Sky', uk: 'Небесний' },
        blue: { ru: 'Синий', en: 'Blue', uk: 'Синій' },
        indigo: { ru: 'Индиго', en: 'Indigo', uk: 'Індиго' },
        violet: { ru: 'Фиолетовый', en: 'Violet', uk: 'Фіолетовий' },
        purple: { ru: 'Пурпурный', en: 'Purple', uk: 'Пурпуровий' },
        fuchsia: { ru: 'Фуксия', en: 'Fuchsia', uk: 'Фуксія' },
        pink: { ru: 'Розовый', en: 'Pink', uk: 'Рожевий' },
        rose: { ru: 'Розовый', en: 'Rose', uk: 'Трояндовий' },
        slate: { ru: 'Сланцевый', en: 'Slate', uk: 'Сланцевий' },
        gray: { ru: 'Серый', en: 'Gray', uk: 'Сірий' },
        zinc: { ru: 'Цинковый', en: 'Zinc', uk: 'Цинковий' },
        neutral: { ru: 'Нейтральный', en: 'Neutral', uk: 'Нейтральний' },
        stone: { ru: 'Каменный', en: 'Stone', uk: 'Кам’яний' }
    });

    // Об'єкт для зберігання налаштувань і палітри
    var ColorPlugin = {
        settings: {
            main_color: Lampa.Storage.get('color_plugin_main_color', '#353535'),
            enabled: Lampa.Storage.get('color_plugin_enabled', 'true') === 'true',
            highlight_enabled: Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true',
            dimming_enabled: Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true',
            rounding_enabled: Lampa.Storage.get('color_plugin_rounding_enabled', 'true') === 'true'
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'),
                '#fb2c36': 'Red 1', '#e7000b': 'Red 2', '#c10007': 'Red 3', '#9f0712': 'Red 4', '#82181a': 'Red 5', '#460809': 'Red 6',
                '#ff6900': 'Orange 1', '#f54900': 'Orange 2', '#ca3500': 'Orange 3', '#9f2d00': 'Orange 4', '#7e2a0c': 'Orange 5', '#441306': 'Orange 6',
                '#fe9a00': 'Amber 1', '#e17100': 'Amber 2', '#bb4d00': 'Amber 3', '#973c00': 'Amber 4', '#7b3306': 'Amber 5', '#461901': 'Amber 6',
                '#f0b100': 'Yellow 1', '#d08700': 'Yellow 2', '#a65f00': 'Yellow 3', '#894b00': 'Yellow 4', '#733e0a': 'Yellow 5', '#432004': 'Yellow 6',
                '#7ccf00': 'Lime 1', '#5ea500': 'Lime 2', '#497d00': 'Lime 3', '#3c6300': 'Lime 4', '#35530e': 'Lime 5', '#192e03': 'Lime 6',
                '#00c950': 'Green 1', '#00a63e': 'Green 2', '#008236': 'Green 3', '#016630': 'Green 4', '#0d542b': 'Green 5', '#032e15': 'Green 6',
                '#00bc7d': 'Emerald 1', '#009966': 'Emerald 2', '#007a55': 'Emerald 3', '#006045': 'Emerald 4', '#004f3b': 'Emerald 5', '#002c22': 'Emerald 6',
                '#00bba7': 'Teal 1', '#009689': 'Teal 2', '#00786f': 'Teal 3', '#005f5a': 'Teal 4', '#0b4f4a': 'Teal 5', '#022f2e': 'Teal 6',
                '#00b8db': 'Cyan 1', '#0092b8': 'Cyan 2', '#007595': 'Cyan 3', '#005f78': 'Cyan 4', '#104e64': 'Cyan 5', '#053345': 'Cyan 6',
                '#00a6f4': 'Sky 1', '#0084d1': 'Sky 2', '#0069a8': 'Sky 3', '#00598a': 'Sky 4', '#024a70': 'Sky 5', '#052f4a': 'Sky 6',
                '#2b7fff': 'Blue 1', '#155dfc': 'Blue 2', '#1447e6': 'Blue 3', '#193cb8': 'Blue 4', '#1c398e': 'Blue 5', '#162456': 'Blue 6',
                '#615fff': 'Indigo 1', '#4f39f6': 'Indigo 2', '#432dd7': 'Indigo 3', '#372aac': 'Indigo 4', '#312c85': 'Indigo 5', '#1e1a4d': 'Indigo 6',
                '#8e51ff': 'Violet 1', '#7f22fe': 'Violet 2', '#7008e7': 'Violet 3', '#5d0ec0': 'Violet 4', '#4d179a': 'Violet 5', '#2f0d68': 'Violet 6',
                '#ad46ff': 'Purple 1', '#9810fa': 'Purple 2', '#8200db': 'Purple 3', '#6e11b0': 'Purple 4', '#59168b': 'Purple 5', '#3c0366': 'Purple 6',
                '#e12afb': 'Fuchsia 1', '#c800de': 'Fuchsia 2', '#a800b7': 'Fuchsia 3', '#8a0194': 'Fuchsia 4', '#721378': 'Fuchsia 5', '#4b004f': 'Fuchsia 6',
                '#f6339a': 'Pink 1', '#e60076': 'Pink 2', '#c6005c': 'Pink 3', '#a3004c': 'Pink 4', '#861043': 'Pink 5', '#510424': 'Pink 6',
                '#ff2056': 'Rose 1', '#ec003f': 'Rose 2', '#c70036': 'Rose 3', '#a50036': 'Rose 4', '#8b0836': 'Rose 5', '#4d0218': 'Rose 6',
                '#62748e': 'Slate 1', '#45556c': 'Slate 2', '#314158': 'Slate 3', '#1d293d': 'Slate 4', '#0f172b': 'Slate 5', '#020618': 'Slate 6',
                '#6a7282': 'Gray 1', '#4a5565': 'Gray 2', '#364153': 'Gray 3', '#1e2939': 'Gray 4', '#101828': 'Gray 5', '#030712': 'Gray 6',
                '#71717b': 'Zinc 1', '#52525c': 'Zinc 2', '#3f3f46': 'Zinc 3', '#27272a': 'Zinc 4', '#18181b': 'Zinc 5', '#09090b': 'Zinc 6',
                '#737373': 'Neutral 1', '#525252': 'Neutral 2', '#404040': 'Neutral 3', '#262626': 'Neutral 4', '#171717': 'Neutral 5', '#0a0a0a': 'Neutral 6',
                '#79716b': 'Stone 1', '#57534d': 'Stone 2', '#44403b': 'Stone 3', '#292524': 'Stone 4', '#1c1917': 'Stone 5', '#0c0a09': 'Stone 6'
            }
        }
    };

    // Змінна для запобігання рекурсії
    var isSaving = false;

    // Функція для конвертації HEX у RGB
    function hexToRgb(hex) {
        var cleanHex = hex.replace('#', '');
        var r = parseInt(cleanHex.substring(0, 2), 16);
        var g = parseInt(cleanHex.substring(2, 4), 16);
        var b = parseInt(cleanHex.substring(4, 6), 16);
        return r + ', ' + g + ', ' + b;
    }

    // Функція для конвертації RGB у HEX
    function rgbToHex(rgb) {
        var matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!matches) return rgb;
        function hex(n) {
            return ('0' + parseInt(n).toString(16)).slice(-2);
        }
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
    }

    // Функція для валідації HEX-коду
    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // Функція для оновлення inline-стилів елемента з датою
    function updateDateElementStyles() {
        var elements = document.querySelectorAll('div[style*="position: absolute; left: 1em; top: 1em;"]');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.querySelector('div[style*="font-size: 2.6em"]')) {
                element.style.background = 'var(--main-color)';
            }
        }
    }

    // Функція для оновлення canvas fillStyle
    function updateCanvasFillStyle(context) {
        if (context && context.fillStyle) {
            var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
            context.fillStyle = 'rgba(' + rgbColor + ', 1)';
        }
    }

    // Функція для оновлення іконки плагіна
    function updatePluginIcon() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) {
                menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            }
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            if (Lampa.Settings && Lampa.Settings.render) {
                Lampa.Settings.render();
            }
        }
    }

    // Функція для збереження всіх налаштувань
    function saveSettings() {
        if (isSaving) {
            return;
        }
        isSaving = true;
        Lampa.Storage.set('color_plugin_main_color', ColorPlugin.settings.main_color);
        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        Lampa.Storage.set('color_plugin_rounding_enabled', ColorPlugin.settings.rounding_enabled.toString());
        isSaving = false;
    }

    // Функція для застосування стилів
    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
        }

        var rgbColor = hexToRgb(ColorPlugin.settings.main_color);

        var highlightStyles = ColorPlugin.settings.highlight_enabled ? (
            '-webkit-box-shadow: inset 0 0 0 0.15em #fff;' +
            'box-shadow: inset 0 0 0 0.15em #fff;'
        ) : '';

        var dimmingStyles = ColorPlugin.settings.dimming_enabled ? (
            '.full-start__rate {' +
                'background: rgba(var(--main-color-rgb), 0.15);' +
            '}' +
            '.full-start__rate > div:first-child {' +
                'background: rgba(var(--main-color-rgb), 0.15);' +
            '}' +
            '.reaction {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.full-start__button {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.card__vote {' +
                'background: rgba(var(--main-color-rgb), 0.5);' +
            '}' +
            '.items-line__more {' +
                'background: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.card__icons-inner {' +
                'background: rgba(var(--main-color-rgb), 0.5);' +
            '}' +
            '.simple-button--filter > div {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}'
        ) : '';

        var roundingStyles = ColorPlugin.settings.rounding_enabled ? (
            '.card.focus .card__view::after,' +
            '.card:hover .card__view::after {' +
                'content: "";' +
                'position: absolute;' +
                'top: -0.3em;' +
                'left: -0.3em;' +
                'right: -0.3em;' +
                'bottom: -0.3em;' +
                'border: 0.3em solid var(--main-color);' +
                'border-radius: var(--card-radius);' +
                'z-index: -1;' +
                'pointer-events: none;' +
                'background-color: var(--main-color);' +
            '}' +
            '.settings-param.focus {' +
                'color: #fff;' +
                'border-radius: var(--menu-radius);' +
                'background: var(--main-color);' +
            '}' +
            '.simple-button.focus {' +
                'color: #fff;' +
                'background: var(--main-color);' +
            '}' +
            '.torrent-serial.focus,' +
            '.torrent-file.focus {' +
                'background: var(--main-color);' +
            '}' +
            '.torrent-item.focus::after {' +
                'content: "";' +
                'position: absolute;' +
                'top: -0.5em;' +
                'left: -0.5em;' +
                'right: -0.5em;' +
                'bottom: -0.5em;' +
                'border: 0.3em solid var(--main-color);' +
                'border-radius: 0.7em;' +
                'z-index: -1;' +
                'background: var(--main-color);' +
            '}' +
            '.tag-count.focus,' +
            '.full-person.focus,' +
            '.full-review.focus {' +
                'color: #fff;' +
                'background: var(--main-color);' +
            '}' +
            '.selectbox-item.focus {' +
                'color: #fff;' +
                'border-radius: var(--menu-radius);' +
                'background: var(--main-color);' +
            '}' +
            '.settings-folder.focus {' +
                'color: #fff;' +
                'border-radius: var(--menu-radius);' +
                'background: var(--main-color);' +
            '}'
        ) : '';

        style.innerHTML = [
            ':root {' +
                '--main-color: ' + ColorPlugin.settings.main_color + ';' +
                '--main-color-rgb: ' + rgbColor + ';' +
            '}',
            '.modal__title {' +
                'font-size: 1.7em !important;' +
            '}',
            '.modal__head {' +
                'margin-bottom: 0 !important;' +
            '}',
            '.modal .scroll__content {' +
                'padding: 1.0em 0 !important;' +
            '}',
            '.menu__ico, .menu__ico:hover, .menu__ico.traverse, ' +
            '.head__action, .head__action.focus, .head__action:hover, .settings-param__ico {' +
                'color: #ffffff !important;' +
                'fill: #ffffff !important;' +
            '}',
            '.menu__ico.focus {' +
                'color: #ffffff !important;' +
                'fill: #ffffff !important;' +
                'stroke: none !important;' +
            '}',
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], ' +
            '.menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], ' +
            '.menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], ' +
            '.menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], ' +
            '.menu__item:hover .menu__ico circle[fill] {' +
                'fill: #ffffff !important;' +
            '}',
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item:hover .menu__ico [stroke] {' +
                'stroke: #fff !important;' +
            '}',
            '.menu__item, .menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
            '.console__tab, .console__tab.focus, ' +
            '.settings-param, .settings-param.focus, ' +
            '.selectbox-item, .selectbox-item.focus, .selectbox-item:hover, ' +
            '.full-person, .full-person.focus, ' +
            '.full-start__button, .full-start__button.focus, ' +
            '.full-descr__tag, .full-descr__tag.focus, ' +
            '.simple-button, .simple-button.focus, ' +
            '.player-panel .button, .player-panel .button.focus, ' +
            '.search-source, .search-source.active, ' +
            '.radio-item, .radio-item.focus, ' +
            '.lang__selector-item, .lang__selector-item.focus, ' +
            '.modal__button, .modal__button.focus, ' +
            '.search-history-key, .search-history-key.focus, ' +
            '.simple-keyboard-mic, .simple-keyboard-mic.focus, ' +
            '.full-review-add, .full-review-add.focus, ' +
            '.full-review, .full-review.focus, ' +
            '.tag-count, .tag-count.focus, ' +
            '.settings-folder, .settings-folder.focus, ' +
            '.noty, ' +
            '.radio-player, .radio-player.focus {' +
                'color: #ffffff !important;' +
            '}',
            '.console__tab {' +
                'background-color: rgba(221, 221, 221, 0.06);' +
            '}',
            '.console__tab.focus {' +
                'background: var(--main-color);' +
                'color: #fff;' +
                highlightStyles +
            '}',
            '.menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.simple-button.focus, .head__action.focus, .head__action:hover, ' +
            '.player-panel .button.focus, .search-source.active {' +
                'background: var(--main-color);' +
            '}',
            '.full-start__button.focus, .settings-param.focus, .items-line__more.focus, ' +
            '.menu__item.focus, .settings-folder.focus, .head__action.focus, ' +
            '.selectbox-item.focus, .simple-button.focus, .navigation-tabs__button.focus {' +
                highlightStyles +
            '}',
            '.timetable__item.focus::before {' +
                'background-color: var(--main-color);' +
                highlightStyles +
            '}',
            '.navigation-tabs__button.focus {' +
                'background-color: var(--main-color);' +
                'color: #fff;' +
                highlightStyles +
            '}',
            '.items-line__more.focus {' +
                'color: #fff;' +
                'background-color: var(--main-color);' +
            '}',
            '.timetable__item.focus {' +
                'color: #fff;' +
            '}',
            '.broadcast__device.focus {' +
                'background-color: var(--main-color);' +
                'color: #fff;' +
            '}',
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
                'background-color: var(--main-color) !important;' +
            '}',
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
            '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
            '.full-review-add.focus, .full-review.focus, ' +
            '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
            '.selectbox-item.focus, .selectbox-item:hover {' +
                'background: var(--main-color);' +
            '}',
            '.online.focus {' +
                'box-shadow: 0 0 0 0.2em var(--main-color);' +
            '}',
            '.online_modss.focus::after, .online-prestige.focus::after, ' +
            '.radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, ' +
            '.iptv-channel.last--focus::before {' +
                'border-color: var(--main-color) !important;' +
            '}',
            '.card-more.focus .card-more__box::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {' +
                'border-color: var(--main-color) !important;' +
            '}',
            '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, ' +
            '.card-episode.focus .full-episode::after, .register.focus::after, ' +
            '.season-episode.focus::after, .full-episode.focus::after, ' +
            '.full-review-add.focus::after, .card.focus .card__view::after, ' +
            '.card:hover .card__view::after, .extensions__item.focus:after, ' +
            '.torrent-item.focus::after, .extensions__block-add.focus:after {' +
                'border-color: var(--main-color);' +
            '}',
            '.broadcast__scan > div {' +
                'background-color: var(--main-color);' +
            '}',
            '.card:hover .card__view, .card.focus .card__view {' +
                'border-color: var(--main-color);' +
            '}',
            '.noty {' +
                'background: var(--main-color);' +
            '}',
            '.radio-player.focus {' +
                'background-color: var(--main-color);' +
            '}',
            '.explorer-card__head-img.focus::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.color_square.focus {' +
                'border: 0.3em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}',
            'body.glass--style .selectbox-item.focus, ' +
            'body.glass--style .settings-folder.focus, ' +
            'body.glass--style .settings-param.focus {' +
                'background-color: var(--main-color);' +
            '}',
            'body.glass--style .settings-folder.focus .settings-folder__icon {' +
                '-webkit-filter: none;' +
                'filter: none;' +
            '}',
            dimmingStyles,
            roundingStyles,
            '.timetable__item--any::before {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}',
            '.element {' +
                'background: var(--main-color);' +
            '}',
            '.bookmarks-folder__layer {' +
                'background: var(--main-color);' +
            '}',
            '.color_square.default {' +
                'background-color: #fff;' +
                'width: 35px;' +
                'height: 35px;' +
                'border-radius: 4px;' +
                'position: relative;' +
            '}',
            '.color_square.default::after {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 3px;' +
                'background-color: #353535;' +
                'transform: rotate(45deg);' +
            '}',
            '.color_square.default::before {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 3px;' +
                'background-color: #353535;' +
                'transform: rotate(-45deg);' +
            '}',
            '.color_square {' +
                'width: 35px;' +
                'height: 35px;' +
                'border-radius: 4px;' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: center;' +
                'align-items: center;' +
                'cursor: pointer;' +
                'color: #ffffff !important;' +
                'font-size: 10px;' +
                'text-align: center;' +
            '}',
            '.color-family-outline {' +
                'display: flex;' +
                'flex-direction: row;' +
                'overflow: hidden;' +
                'gap: 10px;' +
                'border-radius: 8px;' +
                'margin-bottom: 1px;' +
                'padding: 5px;' +
            '}',
            '.color-family-name {' +
                'width: 80px;' +
                'height: 35px;' +
                'border-width: 2px;' +
                'border-style: solid;' +
                'border-radius: 4px;' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: center;' +
                'align-items: center;' +
                'cursor: default;' +
                'color: #ffffff !important;' +
                'font-size: 10px;' +
                'font-weight: bold;' +
                'text-align: center;' +
                'text-transform: capitalize;' +
            '}',
            '.color_square .hex {' +
                'font-size: 9px;' +
                'opacity: 0.9;' +
                'text-transform: uppercase;' +
                'z-index: 1;' +
            '}',
            '.hex-input {' +
                'width: 360px;' +
                'height: 35px;' +
                'border-radius: 8px;' +
                'border: 2px solid #ddd;' +
                'position: relative;' +
                'cursor: pointer;' +
                'display: flex;' +
                'flex-direction: column;' +
                'align-items: center;' +
                'justify-content: center;' +
                'color: #fff !important;' +
                'font-size: 12px;' +
                'font-weight: bold;' +
                'text-shadow: 0 0 2px #000;' +
                'background-color: #353535;' +
            '}',
            '.hex-input.focus {' +
                'border: 0.2em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}',
            '.hex-input .label {' +
                'position: absolute;' +
                'top: 1px;' +
                'font-size: 10px;' +
            '}',
            '.hex-input .value {' +
                'position: absolute;' +
                'bottom: 1px;' +
                'font-size: 10px;' +
            '}',
            '.color-picker-container {' +
                'display: grid;' +
                'grid-template-columns: 1fr 1fr;' +
                'gap: 140px;' +
                'padding: 0;' +
            '}',
            '.color-picker-container > div:nth-child(2) {' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: flex-end;' +
            '}',
            '@media (max-width: 768px) {' +
                '.color-picker-container {' +
                    'grid-template-columns: 1fr;' +
                '}' +
                '.color-picker-container > div:nth-child(2) {' +
                    'justify-content: flex-start;' +
                '}' +
            '}',
            '.head__action {' +
                'opacity: 0.80;' +
            '}',
            '.full-start__rate > div:first-child {' +
                'color: #1ed5a9;' +
                'font-weight: var(--rating-weight);' +
                'background: none;' +
            '}',
            '.navigation-bar__body {' +
                'background: rgba(0, 0, 0, var(--navigation-bar-opacity));' +
            '}',
            '.console {' +
                'background: var(--dark-bg);' +
            '}',
            '.bookmarks-folder__layer {' +
                'background: rgba(0, 0, 0, var(--bookmarks-layer-opacity));' +
            '}',
            '.selector__body, .modal-layer {' +
                'background-color: var(--dark-bg);' +
            '}',
            '.card__marker > span {' +
                'max-width: 11em;' +
            '}',
            '.online.focus {' +
                'box-shadow: 0 0 0 0.2em var(--main-color);' +
                'background: var(--main-color);' +
            '}',
            '.noty {' +
                'color: #ffffff;' +
            '}',
            '.head__action.focus {' +
                'background: var(--main-color);' +
                'color: #fff;' +
            '}',
            '.selector:hover {' +
                'opacity: 0.8;' +
            '}',
            '.online-prestige.focus::after {' +
                'border: solid .3em var(--main-color) !important;' +
                'background-color: #871818;' +
            '}',
            '.full-episode.focus::after,' +
            '.card-episode.focus .full-episode::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.wrap__left {' +
                'box-shadow: 15px 0px 20px 0px var(--dark-bg) !important;' +
            '}',
            '.card__type {' +
                'background: var(--main-color) !important;' +
            '}',
            '.new-interface .card.card--wide+.card-more .card-more__box,' +
            '.card-more__box {' +
                'background: rgba(0, 0, 0, var(--card-more-box-opacity));' +
            '}',
            '.helper {' +
                'background: var(--main-color);' +
            '}',
            '.extensions__item,' +
            '.extensions__block-add {' +
                'background-color: var(--menu-bg);' +
            '}',
            '.extensions__item.focus:after,' +
            '.extensions__block-empty.focus:after,' +
            '.extensions__block-add.focus:after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.settings-input--free,' +
            '.settings-input__content,' +
            '.extensions {' +
                'background-color: var(--dark-bg);' +
            '}',
            '.modal__content {' +
                'background-color: var(--darker-bg) !important;' +
                'max-height: 90vh;' +
                'overflow: hidden;' +
                'box-shadow: var(--modal-shadow) !important;' +
            '}',
            '.settings__content,' +
            '.selectbox__content {' +
                'position: fixed;' +
                'right: -100%;' +
                'display: flex;' +
                'background: var(--darker-bg);' +
                'top: 1em;' +
                'left: 98%;' +
                'max-height: calc(100vh - 2em);' +
                'border-radius: var(--menu-radius);' +
                'padding: 0.5em;' +
                'transform: translateX(100%);' +
                'transition: transform 0.3s ease;' +
                'overflow-y: auto;' +
                'box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;' +
            '}',
            '.settings__title,' +
            '.selectbox__title {' +
                'font-size: var(--title-size);' +
                'font-weight: 300;' +
                'text-align: center;' +
            '}',
            '.scroll--mask {' +
                '-webkit-mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);' +
                'mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);' +
            '}',
            '.full-start__button.focus {' +
                'color: white !important;' +
                'background: var(--main-color) !important;' +
            '}',
            '.menu__list {' +
                'padding-left: 0;' +
            '}',
            'body.advanced--animation .head .head__action.focus,' +
            'body.advanced--animation .head .head__action:hover,' +
            'body.advanced--animation .menu .menu__item.focus,' +
            'body.advanced--animation .menu .menu__item:hover,' +
            'body.advanced--animation .full-start__button.focus,' +
            'body.advanced--animation .full-start__button:hover,' +
            'body.advanced--animation .simple-button.focus,' +
            'body.advanced--animation .simple-button:hover,' +
            'body.advanced--animation .full-descr__tag.focus,' +
            'body.advanced--animation .full-descr__tag:hover,' +
            'body.advanced--animation .tag-count.focus,' +
            'body.advanced--animation .tag-count:hover,' +
            'body.advanced--animation .full-review.focus,' +
            'body.advanced--animation .full-review:hover,' +
            'body.advanced--animation .full-review-add.focus,' +
            'body.advanced--animation .full-review-add:hover {' +
                'animation: none !important;' +
            '}',
            '.full-review-add.focus::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.explorer__left {' +
                'display: none;' +
            '}',
            '.explorer__files {' +
                'width: 100%;' +
            '}',
            '.notification-item {' +
                'border: 2px solid var(--main-color) !important;' +
            '}',
            '.notification-date {' +
                'background: var(--main-color) !important;' +
            '}',
            '.card__quality {' +
                'color: #fff;' +
                'background: var(--main-color) !important;' +
            '}',
            '.modal {' +
                'position: fixed;' +
                'top: 0;' +
                'left: 0;' +
                'right: 0;' +
                'bottom: 0;' +
                'align-items: center;' +
            '}',
            '.noty__body {' +
                'box-shadow: 0 -2px 6px rgb(22 22 22 / 50%);' +
                'background: var(--main-color);' +
            '}',
            '.card__title {' +
                'text-align: center;' +
                'font-size: 1.2em;' +
                'line-height: 1.1;' +
            '}',
            '.background__one.visible, .background__two.visible {' +
                'opacity: 0;' +
            '}',
            '.card__age {' +
                'text-align: center;' +
                'color: #ffffff7a;' +
            '}',
            'body {' +
                'margin: 1 !important;' +
                'background: var(--dark-bg) !important;' +
            '}',
            '.card__vote {' +
                'position: absolute;' +
                'top: var(--vote-top);' +
                'left: var(--vote-left);' +
                'bottom: var(--vote-bottom);' +
                'right: var(--vote-right);' +
                'background: var(--vote-background);' +
                'color: #ffffff;' +
                'font-size: var(--vote-font-size);' +
                'font-weight: 700;' +
                'padding: 0.5em;' +
                'border-radius: var(--vote-border-radius);' +
                'display: flex;' +
                'flex-direction: column;' +
                'align-items: center;' +
            '}',
            'body.glass--style.platform--browser .card .card__icons-inner,' +
            'body.glass--style.platform--browser .card .card__marker,' +
            'body.glass--style.platform--browser .card .card__vote,' +
            'body.glass--style.platform--browser .card .card-watched,' +
            'body.glass--style.platform--nw .card .card__icons-inner,' +
            'body.glass--style.platform--nw .card .card__marker,' +
            'body.glass--style.platform--nw .card .card__vote,' +
            'body.glass--style.platform--nw .card .card-watched,' +
            'body.glass--style.platform--apple .card .card__icons-inner,' +
            'body.glass--style.platform--apple .card .card__marker,' +
            'body.glass--style.platform--apple .card .card__vote,' +
            'body.glass--style.platform--apple .card .card-watched {' +
                'background-color: rgba(0, 0, 0, 0.3);' +
                '-webkit-backdrop-filter: blur(1em);' +
                'backdrop-filter: none;' +
                'background: var(--main-color);' +
            '}',
            '@media screen and (max-width: 480px) {' +
                '.settings__content,' +
                '.selectbox__content {' +
                    'left: 0 !important;' +
                    'top: unset !important;' +
                    'border-top-left-radius: 2em !important;' +
                    'border-top-right-radius: 2em !important;' +
                '}' +
                '.ru-title-full,' +
                '.ru-title-full:hover {' +
                    'max-width: none !important;' +
                    'text-align: center !important;' +
                '}' +
                '.full-start-new__body {' +
                    'text-align: center !important;' +
                '}' +
                '.full-start-new__rate-line {' +
                    'padding-top: 0.5em !important;' +
                    'display: flex;' +
                    'justify-content: center;' +
                    'margin-bottom: 0em;' +
                '}' +
                '.full-start-new__tagline {' +
                    'margin-bottom: 0.5em !important;' +
                    'margin-top: 0.5em !important;' +
                '}' +
                '.full-start-new__title img {' +
                    'object-fit: contain;' +
                    'max-width: var(--max-image-width) !important;' +
                    'max-height: 5em !important;' +
                '}' +
                '.selectbox.animate .selectbox__content,' +
                '.settings.animate .settings__content {' +
                    'background: var(--darker-bg);' +
                '}' +
            '}',
            '@media screen and (max-width: 580px) {' +
                '.full-descr__text {' +
                    'text-align: justify;' +
                '}' +
                '.items-line__head {' +
                    'justify-content: var(--center-align-details, center) !important;' +
                '}' +
                '.full-descr__details {' +
                    'justify-content: var(--center-align-details, center) !important;' +
                '}' +
            '}',
            '@media screen and (max-width: 480px) {' +
                '.full-start-new__details > span:nth-of-type(7) {' +
                    'display: block;' +
                    'order: 2;' +
                    'opacity: 40%;' +
                '}' +
                '.full-descr__tags {' +
                    'justify-content: var(--center-align-details, center) !important;' +
                '}' +
                '.items-line__more {' +
                    'display: none;' +
                '}' +
                '.full-descr__info-body {' +
                    'justify-content: var(--center-align-details, center) !important;' +
                    'display: flex;' +
                '}' +
                '.full-descr__details > * {' +
                    'text-align: center;' +
                '}' +
            '}',
            '@media screen and (max-width: 580px) {' +
                '.full-start-new__buttons {' +
                    'overflow: auto;' +
                    'display: flex !important;' +
                    'justify-content: var(--center-align-details, center) !important;' +
                    'flex-wrap: wrap !important;' +
                    'max-width: 100% !important;' +
                    'margin: 0.5em auto !important;' +
                '}' +
            '}',
            '@media screen and (max-width: 767px) {' +
                '.full-start-new__details {' +
                    'display: flex !important;' +
                    'justify-content: var(--center-align-details, center) !important;' +
                    'flex-wrap: wrap !important;' +
                    'max-width: 100% !important;' +
                    'margin: 0.5em auto !important;' +
                '}' +
            '}',
            '@media screen and (max-width: 480px) {' +
                '.full-start-new__reactions {' +
                    'display: flex !important;' +
                    'justify-content: var(--center-align-details, center) !important;' +
                    'flex-wrap: wrap !important;' +
                    'max-width: 100% !important;' +
                    'margin: 0.5em auto !important;' +
                '}' +
            '}'
        ].join('');

        updateDateElementStyles();
    }

    // Функція для створення HTML для вибору кольору
    function createColorHtml(color, name) {
        var className = color === 'default' ? 'color_square selector default' : 'color_square selector';
        var style = color === 'default' ? '' : 'background-color: ' + color + ';';
        var hex = color === 'default' ? '' : color.replace('#', '');
        var content = color === 'default' ? '' : '<div class="hex">' + hex + '</div>';
        return '<div class="' + className + '" tabindex="0" style="' + style + '" title="' + name + '">' + content + '</div>';
    }

    // Функція для створення HTML для назви сімейства
    function createFamilyNameHtml(name, color) {
        return '<div class="color-family-name" style="border-color: ' + (color || '#353535') + ';">' + Lampa.Lang.translate(name.toLowerCase()) + '</div>';
    }

    // Функція для розбиття масиву кольорів на групи по 6
    function chunkArray(arr, size) {
        var result = [];
        for (var i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    // Функція для створення модального вікна вибору кольору
    function openColorPicker() {
        var colorKeys = Object.keys(ColorPlugin.colors.main);
        var families = [
            'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Teal', 'Cyan',
            'Sky', 'Blue', 'Indigo', 'Violet', 'Purple', 'Fuchsia', 'Pink', 'Rose', 'Slate',
            'Gray', 'Zinc', 'Neutral', 'Stone'
        ];
        var colorsByFamily = [];

        for (var i = 0; i < families.length; i++) {
            var family = families[i];
            var familyColors = colorKeys.filter(function(key) {
                return ColorPlugin.colors.main[key].indexOf(family) === 0 && key !== 'default';
            });
            if (familyColors.length > 0) {
                colorsByFamily.push({
                    name: family,
                    colors: familyColors
                });
            }
        }

        var colorContent = colorsByFamily.map(function(family) {
            var firstColor = family.colors[0];
            var familyNameHtml = createFamilyNameHtml(family.name, firstColor);
            var groupContent = family.colors.map(function(color) {
                return createColorHtml(color, ColorPlugin.colors.main[color]);
            }).join('');
            return '<div class="color-family-outline">' + familyNameHtml + groupContent + '</div>';
        });

        // Розподіляємо кольори між двома колонками
        var midPoint = Math.ceil(colorContent.length / 2);
        var leftColumn = colorContent.slice(0, midPoint).join('');
        var rightColumn = colorContent.slice(midPoint).join('');

        var defaultButton = createColorHtml('default', Lampa.Lang.translate('default_color'));
        var hexValue = Lampa.Storage.get('color_plugin_custom_hex', '') || '#353535';
        var hexDisplay = hexValue.replace('#', '');
        var inputHtml = '<div class="color_square selector hex-input" tabindex="0" style="background-color: ' + hexValue + ';">' +
                        '<div class="label">' + Lampa.Lang.translate('custom_hex_input') + '</div>' +
                        '<div class="value">' + hexDisplay + '</div>' +
                        '</div>';
        var topRowHtml = '<div style="display: flex; gap: 30px; padding: 0; justify-content: center; margin-bottom: 10px;">' +
                         defaultButton + inputHtml + '</div>';

        var modalContent = '<div class="color-picker-container">' +
                           '<div>' + leftColumn + '</div>' +
                           '<div>' + rightColumn + '</div>' +
                           '</div>';
        var modalHtml = $('<div>' + topRowHtml + modalContent + '</div>');

        try {
            Lampa.Modal.open({
                title: Lampa.Lang.translate('main_color'),
                size: 'medium',
                align: 'center',
                html: modalHtml,
                className: 'color-picker-modal',
                onBack: function () {
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                },
                onSelect: function (a) {
                    if (a.length > 0 && a[0] instanceof HTMLElement) {
                        var selectedElement = a[0];
                        var color;

                        if (selectedElement.classList.contains('hex-input')) {
                            Lampa.Noty.show(Lampa.Lang.translate('hex_input_hint'));
                            Lampa.Modal.close();
                            var inputOptions = {
                                name: 'color_plugin_custom_hex',
                                value: Lampa.Storage.get('color_plugin_custom_hex', ''),
                                placeholder: Lampa.Lang.translate('settings_cub_not_specified')
                            };

                            Lampa.Input.edit(inputOptions, function (value) {
                                if (value === '') {
                                    Lampa.Noty.show('HEX-код не введено.');
                                    Lampa.Controller.toggle('settings_component');
                                    Lampa.Controller.enable('menu');
                                    return;
                                }
                                if (!isValidHex(value)) {
                                    Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
                                    Lampa.Controller.toggle('settings_component');
                                    Lampa.Controller.enable('menu');
                                    return;
                                }
                                Lampa.Storage.set('color_plugin_custom_hex', value);
                                ColorPlugin.settings.main_color = value;
                                Lampa.Storage.set('color_plugin_main_color', value);
                                applyStyles();
                                updateCanvasFillStyle(window.draw_context);
                                saveSettings();
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                if (Lampa.Settings && Lampa.Settings.render) {
                                    Lampa.Settings.render();
                                }
                            });
                            return;
                        } else if (selectedElement.classList.contains('default')) {
                            color = '#353535';
                        } else {
                            color = selectedElement.style.backgroundColor || ColorPlugin.settings.main_color;
                            color = color.includes('rgb') ? rgbToHex(color) : color;
                        }

                        ColorPlugin.settings.main_color = color;
                        Lampa.Storage.set('color_plugin_main_color', color);
                        applyStyles();
                        updateCanvasFillStyle(window.draw_context);
                        saveSettings();
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('settings_component');
                        Lampa.Controller.enable('menu');
                        if (Lampa.Settings && Lampa.Settings.render) {
                            Lampa.Settings.render();
                        }
                    }
                }
            });
        } catch (e) {}
    }

    // Функція для оновлення видимості параметрів
    function updateParamsVisibility(body) {
        var params = [
            '.settings-param[data-name="color_plugin_main_color"]',
            '.settings-param[data-name="color_plugin_highlight_enabled"]',
            '.settings-param[data-name="color_plugin_dimming_enabled"]',
            '.settings-param[data-name="color_plugin_rounding_enabled"]'
        ];
        setTimeout(function() {
            for (var i = 0; i < params.length; i++) {
                var selector = params[i];
                var elements = body ? body.find(selector) : $(selector);
                var displayValue = ColorPlugin.settings.enabled ? 'block' : 'none';
                elements.each(function(index, element) {
                    $(element).css('display', displayValue);
                });
            }
        }, 100);
    }

    // Функція для ініціалізації плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
        ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
        ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';
        ColorPlugin.settings.rounding_enabled = Lampa.Storage.get('color_plugin_rounding_enabled', 'true') === 'true';

        // Додаємо компонент до меню налаштувань
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'color_plugin',
                name: Lampa.Lang.translate('color_plugin'),
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
            });

            // Увімкнення/вимкнення плагіна
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('color_plugin_enabled'),
                    description: Lampa.Lang.translate('color_plugin_enabled_description')
                },
                onChange: function (value) {
                    ColorPlugin.settings.enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                    applyStyles();
                    updateCanvasFillStyle(window.draw_context);
                    updateParamsVisibility();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', 'block');
                    }
                }
            });

            // Колір виділення
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_main_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('main_color'),
                    description: Lampa.Lang.translate('main_color_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    }
                },
                onChange: function () {
                    openColorPicker();
                }
            });

            // Увімкнення/вимкнення рамки
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_highlight_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.highlight_enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('enable_highlight'),
                    description: Lampa.Lang.translate('enable_highlight_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    }
                },
                onChange: function (value) {
                    ColorPlugin.settings.highlight_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                    applyStyles();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                }
            });

            // Застосувати колір затемнення
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_dimming_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.dimming_enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('enable_dimming'),
                    description: Lampa.Lang.translate('enable_dimming_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    }
                },
                onChange: function (value) {
                    ColorPlugin.settings.dimming_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                    applyStyles();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                }
            });

            // Увімкнення/вимкнення заокруглення
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_rounding_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.rounding_enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('enable_rounding'),
                    description: Lampa.Lang.translate('enable_rounding_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                    }
                },
                onChange: function (value) {
                    ColorPlugin.settings.rounding_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_rounding_enabled', ColorPlugin.settings.rounding_enabled.toString());
                    applyStyles();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility();
        }

        // Додаємо слухач для оновлення видимості при відкритті налаштувань
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'color_plugin') {
                updateParamsVisibility(e.body);
            }
        });
    }

    // Запускаємо плагін після готовності програми
    if (window.appready && Lampa.SettingsApi) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready' && Lampa.SettingsApi) {
                initPlugin();
            }
        });
    }

    // Оновлюємо стилі та видимість параметрів при зміні налаштувань
    Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'color_plugin_enabled') {
            ColorPlugin.settings.enabled = e.value === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updateParamsVisibility();
        }
    });

    // Оновлюємо стилі та видимість при взаємодії з меню
    Lampa.Listener.follow('settings_component', function (event) {
        if (event.type === 'open') {
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';
            ColorPlugin.settings.rounding_enabled = Lampa.Storage.get('color_plugin_rounding_enabled', 'true') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility();
        } else if (event.type === 'close') {
            saveSettings();
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
        }
    });
})();
            ru: 'Настройка цветов',
            en: 'Color settings',
            uk: 'Налаштування кольорів'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        color_plugin_enabled_description: {
            ru: 'Дозволяє змінювати колір виділення та затемнення елементів інтерфейсу',
            en: 'Allows changing the highlight and dimming color of interface elements',
            uk: 'Дозволяє змінювати колір виділення та затемнення елементів інтерфейсу'
        },
        main_color: {
            ru: 'Цвет выделения',
            en: 'Highlight color',
            uk: 'Колір виділення'
        },
        main_color_description: {
            ru: 'Можна вибрати чи вказати колір для виділених елементів',
            en: 'You can select or specify a color for highlighted elements',
            uk: 'Можна вибрати чи вказати колір для виділених елементів'
        },
        enable_highlight: {
            ru: 'Включить рамку',
            en: 'Enable border',
            uk: 'Увімкнути рамку'
        },
        enable_highlight_description: {
            ru: 'Вмикається біла рамка на виділених елементах',
            en: 'Enables a white border on highlighted elements',
            uk: 'Вмикається біла рамка на виділених елементах'
        },
        enable_dimming: {
            ru: 'Применить цвет затемнения',
            en: 'Apply dimming color',
            uk: 'Застосувати колір затемнення'
        },
        enable_dimming_description: {
            ru: 'Змінюється колір затемних елементів',
            en: 'Changes the color of dimmed elements',
            uk: 'Змінюється колір затемнених елементів'
        },
        default_color: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        custom_hex_input: {
            ru: 'Введи HEX-код цвета',
            en: 'Enter HEX color code',
            uk: 'Введи HEX-код кольору'
        },
        hex_input_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        },
        red: { ru: 'Красный', en: 'Red', uk: 'Червоний' },
        orange: { ru: 'Оранжевый', en: 'Orange', uk: 'Помаранчевий' },
        amber: { ru: 'Янтарный', en: 'Amber', uk: 'Бурштиновий' },
        yellow: { ru: 'Желтый', en: 'Yellow', uk: 'Жовтий' },
        lime: { ru: 'Лаймовый', en: 'Lime', uk: 'Лаймовий' },
        green: { ru: 'Зеленый', en: 'Green', uk: 'Зелений' },
        emerald: { ru: 'Изумрудный', en: 'Emerald', uk: 'Смарагдовий' },
        teal: { ru: 'Бирюзовый', en: 'Teal', uk: 'Бірюзовий' },
        cyan: { ru: 'Голубой', en: 'Cyan', uk: 'Блакитний' },
        sky: { ru: 'Небесный', en: 'Sky', uk: 'Небесний' },
        blue: { ru: 'Синий', en: 'Blue', uk: 'Синій' },
        indigo: { ru: 'Индиго', en: 'Indigo', uk: 'Індиго' },
        violet: { ru: 'Фиолетовый', en: 'Violet', uk: 'Фіолетовий' },
        purple: { ru: 'Пурпурный', en: 'Purple', uk: 'Пурпуровий' },
        fuchsia: { ru: 'Фуксия', en: 'Fuchsia', uk: 'Фуксія' },
        pink: { ru: 'Розовый', en: 'Pink', uk: 'Рожевий' },
        rose: { ru: 'Розовый', en: 'Rose', uk: 'Трояндовий' },
        slate: { ru: 'Сланцевый', en: 'Slate', uk: 'Сланцевий' },
        gray: { ru: 'Серый', en: 'Gray', uk: 'Сірий' },
        zinc: { ru: 'Цинковый', en: 'Zinc', uk: 'Цинковий' },
        neutral: { ru: 'Нейтральный', en: 'Neutral', uk: 'Нейтральний' },
        stone: { ru: 'Каменный', en: 'Stone', uk: 'Кам’яний' }
    });

    // Об'єкт для зберігання налаштувань і палітри
    var ColorPlugin = {
        settings: {
            main_color: Lampa.Storage.get('color_plugin_main_color', '#353535'),
            enabled: Lampa.Storage.get('color_plugin_enabled', 'true') === 'true',
            highlight_enabled: Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true',
            dimming_enabled: Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true'
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'),
                '#fb2c36': 'Red 1', '#e7000b': 'Red 2', '#c10007': 'Red 3', '#9f0712': 'Red 4', '#82181a': 'Red 5', '#460809': 'Red 6',
                '#ff6900': 'Orange 1', '#f54900': 'Orange 2', '#ca3500': 'Orange 3', '#9f2d00': 'Orange 4', '#7e2a0c': 'Orange 5', '#441306': 'Orange 6',
                '#fe9a00': 'Amber 1', '#e17100': 'Amber 2', '#bb4d00': 'Amber 3', '#973c00': 'Amber 4', '#7b3306': 'Amber 5', '#461901': 'Amber 6',
                '#f0b100': 'Yellow 1', '#d08700': 'Yellow 2', '#a65f00': 'Yellow 3', '#894b00': 'Yellow 4', '#733e0a': 'Yellow 5', '#432004': 'Yellow 6',
                '#7ccf00': 'Lime 1', '#5ea500': 'Lime 2', '#497d00': 'Lime 3', '#3c6300': 'Lime 4', '#35530e': 'Lime 5', '#192e03': 'Lime 6',
                '#00c950': 'Green 1', '#00a63e': 'Green 2', '#008236': 'Green 3', '#016630': 'Green 4', '#0d542b': 'Green 5', '#032e15': 'Green 6',
                '#00bc7d': 'Emerald 1', '#009966': 'Emerald 2', '#007a55': 'Emerald 3', '#006045': 'Emerald 4', '#004f3b': 'Emerald 5', '#002c22': 'Emerald 6',
                '#00bba7': 'Teal 1', '#009689': 'Teal 2', '#00786f': 'Teal 3', '#005f5a': 'Teal 4', '#0b4f4a': 'Teal 5', '#022f2e': 'Teal 6',
                '#00b8db': 'Cyan 1', '#0092b8': 'Cyan 2', '#007595': 'Cyan 3', '#005f78': 'Cyan 4', '#104e64': 'Cyan 5', '#053345': 'Cyan 6',
                '#00a6f4': 'Sky 1', '#0084d1': 'Sky 2', '#0069a8': 'Sky 3', '#00598a': 'Sky 4', '#024a70': 'Sky 5', '#052f4a': 'Sky 6',
                '#2b7fff': 'Blue 1', '#155dfc': 'Blue 2', '#1447e6': 'Blue 3', '#193cb8': 'Blue 4', '#1c398e': 'Blue 5', '#162456': 'Blue 6',
                '#615fff': 'Indigo 1', '#4f39f6': 'Indigo 2', '#432dd7': 'Indigo 3', '#372aac': 'Indigo 4', '#312c85': 'Indigo 5', '#1e1a4d': 'Indigo 6',
                '#8e51ff': 'Violet 1', '#7f22fe': 'Violet 2', '#7008e7': 'Violet 3', '#5d0ec0': 'Violet 4', '#4d179a': 'Violet 5', '#2f0d68': 'Violet 6',
                '#ad46ff': 'Purple 1', '#9810fa': 'Purple 2', '#8200db': 'Purple 3', '#6e11b0': 'Purple 4', '#59168b': 'Purple 5', '#3c0366': 'Purple 6',
                '#e12afb': 'Fuchsia 1', '#c800de': 'Fuchsia 2', '#a800b7': 'Fuchsia 3', '#8a0194': 'Fuchsia 4', '#721378': 'Fuchsia 5', '#4b004f': 'Fuchsia 6',
                '#f6339a': 'Pink 1', '#e60076': 'Pink 2', '#c6005c': 'Pink 3', '#a3004c': 'Pink 4', '#861043': 'Pink 5', '#510424': 'Pink 6',
                '#ff2056': 'Rose 1', '#ec003f': 'Rose 2', '#c70036': 'Rose 3', '#a50036': 'Rose 4', '#8b0836': 'Rose 5', '#4d0218': 'Rose 6',
                '#62748e': 'Slate 1', '#45556c': 'Slate 2', '#314158': 'Slate 3', '#1d293d': 'Slate 4', '#0f172b': 'Slate 5', '#020618': 'Slate 6',
                '#6a7282': 'Gray 1', '#4a5565': 'Gray 2', '#364153': 'Gray 3', '#1e2939': 'Gray 4', '#101828': 'Gray 5', '#030712': 'Gray 6',
                '#71717b': 'Zinc 1', '#52525c': 'Zinc 2', '#3f3f46': 'Zinc 3', '#27272a': 'Zinc 4', '#18181b': 'Zinc 5', '#09090b': 'Zinc 6',
                '#737373': 'Neutral 1', '#525252': 'Neutral 2', '#404040': 'Neutral 3', '#262626': 'Neutral 4', '#171717': 'Neutral 5', '#0a0a0a': 'Neutral 6',
                '#79716b': 'Stone 1', '#57534d': 'Stone 2', '#44403b': 'Stone 3', '#292524': 'Stone 4', '#1c1917': 'Stone 5', '#0c0a09': 'Stone 6'
            }
        }
    };

    // Змінна для запобігання рекурсії
    var isSaving = false;

    // Функція для конвертації HEX у RGB
    function hexToRgb(hex) {
        var cleanHex = hex.replace('#', '');
        var r = parseInt(cleanHex.substring(0, 2), 16);
        var g = parseInt(cleanHex.substring(2, 4), 16);
        var b = parseInt(cleanHex.substring(4, 6), 16);
        return r + ', ' + g + ', ' + b;
    }

    // Функція для конвертації RGB у HEX
    function rgbToHex(rgb) {
        var matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!matches) return rgb;
        function hex(n) {
            return ('0' + parseInt(n).toString(16)).slice(-2);
        }
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
    }

    // Функція для валідації HEX-коду
    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // Функція для оновлення inline-стилів елемента з датою
    function updateDateElementStyles() {
        var elements = document.querySelectorAll('div[style*="position: absolute; left: 1em; top: 1em;"]');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.querySelector('div[style*="font-size: 2.6em"]')) {
                element.style.background = 'var(--main-color)';
            }
        }
    }

    // Функція для оновлення canvas fillStyle
    function updateCanvasFillStyle(context) {
        if (context && context.fillStyle) {
            var rgbColor = hexToRgb(ColorPlugin.settings.main_color);
            context.fillStyle = 'rgba(' + rgbColor + ', 1)';
        }
    }

    // Функція для оновлення іконки плагіна
    function updatePluginIcon() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            console.log('ColorPlugin: Lampa.SettingsApi.components is not available, updating menu item icon directly.');
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) {
                menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            }
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            console.log('ColorPlugin: Updated component icon');
            if (Lampa.Settings && Lampa.Settings.render) {
                Lampa.Settings.render();
            }
        }
    }

    // Функція для перевірки стилів body.black--style
    function checkBodyStyles() {
        var body = document.body;
        var hasBlackStyle = body.classList.contains('black--style');
        var hasGlassStyle = body.classList.contains('glass--style');
        var computedStyle = window.getComputedStyle(body);
        var background = computedStyle.background || computedStyle.backgroundColor;
        console.log('ColorPlugin: body.black--style present: ' + hasBlackStyle + ', glass--style present: ' + hasGlassStyle + ', background: ' + background);
    }

    // Функція для збереження всіх налаштувань
    function saveSettings() {
        if (isSaving) {
            console.log('ColorPlugin: saveSettings skipped to prevent recursion');
            return;
        }
        isSaving = true;
        console.log('ColorPlugin: Saving settings', {
            main_color: ColorPlugin.settings.main_color,
            enabled: ColorPlugin.settings.enabled,
            highlight_enabled: ColorPlugin.settings.highlight_enabled,
            dimming_enabled: ColorPlugin.settings.dimming_enabled
        });
        Lampa.Storage.set('color_plugin_main_color', ColorPlugin.settings.main_color);
        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        isSaving = false;
    }

    // Функція для застосування стилів
    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
        }

        var rgbColor = hexToRgb(ColorPlugin.settings.main_color);

        var highlightStyles = ColorPlugin.settings.highlight_enabled ? (
            '-webkit-box-shadow: inset 0 0 0 0.15em #fff;' +
            'box-shadow: inset 0 0 0 0.15em #fff;'
        ) : '';

        var dimmingStyles = ColorPlugin.settings.dimming_enabled ? (
            '.full-start__rate {' +
                'background: rgba(var(--main-color-rgb), 0.15);' +
            '}' +
            '.full-start__rate > div:first-child {' +
                'background: rgba(var(--main-color-rgb), 0.15);' +
            '}' +
            '.reaction {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.full-start__button {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.card__vote {' +
                'background: rgba(var(--main-color-rgb), 0.5);' +
            '}' +
            '.items-line__more {' +
                'background: rgba(var(--main-color-rgb), 0.3);' +
            '}' +
            '.card__icons-inner {' +
                'background: rgba(var(--main-color-rgb), 0.5);' +
            '}' +
            '.simple-button--filter > div {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}'
        ) : '';

        style.innerHTML = [
            ':root {' +
                '--main-color: ' + ColorPlugin.settings.main_color + ';' +
                '--main-color-rgb: ' + rgbColor + ';' +
            '}',
            '.modal__title {' +
                'font-size: 1.7em !important;' +
            '}',
            '.modal__head {' +
                'margin-bottom: 0 !important;' +
            '}',
            '.modal .scroll__content {' +
                'padding: 1.0em 0 !important;' +
            '}',
            '.menu__ico, .menu__ico:hover, .menu__ico.traverse, ' +
            '.head__action, .head__action.focus, .head__action:hover, .settings-param__ico {' +
                'color: #ffffff !important;' +
                'fill: #ffffff !important;' +
            '}',
            '.menu__ico.focus {' +
                'color: #ffffff !important;' +
                'fill: #ffffff !important;' +
                'stroke: none !important;' +
            '}',
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], ' +
            '.menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], ' +
            '.menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], ' +
            '.menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], ' +
            '.menu__item:hover .menu__ico circle[fill] {' +
                'fill: #ffffff !important;' +
            '}',
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item:hover .menu__ico [stroke] {' +
                'stroke: #fff !important;' +
            '}',
            '.menu__item, .menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
            '.console__tab, .console__tab.focus, ' +
            '.settings-param, .settings-param.focus, ' +
            '.selectbox-item, .selectbox-item.focus, .selectbox-item:hover, ' +
            '.full-person, .full-person.focus, ' +
            '.full-start__button, .full-start__button.focus, ' +
            '.full-descr__tag, .full-descr__tag.focus, ' +
            '.simple-button, .simple-button.focus, ' +
            '.player-panel .button, .player-panel .button.focus, ' +
            '.search-source, .search-source.active, ' +
            '.radio-item, .radio-item.focus, ' +
            '.lang__selector-item, .lang__selector-item.focus, ' +
            '.modal__button, .modal__button.focus, ' +
            '.search-history-key, .search-history-key.focus, ' +
            '.simple-keyboard-mic, .simple-keyboard-mic.focus, ' +
            '.full-review-add, .full-review-add.focus, ' +
            '.full-review, .full-review.focus, ' +
            '.tag-count, .tag-count.focus, ' +
            '.settings-folder, .settings-folder.focus, ' +
            '.noty, ' +
            '.radio-player, .radio-player.focus {' +
                'color: #ffffff !important;' +
            '}',
            '.console__tab {' +
                'background-color: rgba(221, 221, 221, 0.06);' +
            '}',
            '.console__tab.focus {' +
                'background: var(--main-color);' +
                'color: #fff;' +
                highlightStyles +
            '}',
            '.menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.simple-button.focus, .head__action.focus, .head__action:hover, ' +
            '.player-panel .button.focus, .search-source.active {' +
                'background: var(--main-color);' +
            '}',
            '.full-start__button.focus, .settings-param.focus, .items-line__more.focus, ' +
            '.menu__item.focus, .settings-folder.focus, .head__action.focus, ' +
            '.selectbox-item.focus, .simple-button.focus, .navigation-tabs__button.focus {' +
                highlightStyles +
            '}',
            '.timetable__item.focus::before {' +
                'background-color: var(--main-color);' +
                highlightStyles +
            '}',
            '.navigation-tabs__button.focus {' +
                'background-color: var(--main-color);' +
                'color: #fff;' +
                highlightStyles +
            '}',
            '.items-line__more.focus {' +
                'color: #fff;' +
                'background-color: var(--main-color);' +
            '}',
            '.timetable__item.focus {' +
                'color: #fff;' +
            '}',
            '.broadcast__device.focus {' +
                'background-color: var(--main-color);' +
                'color: #fff;' +
            '}',
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
                'background-color: var(--main-color) !important;' +
            '}',
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
            '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
            '.full-review-add.focus, .full-review.focus, ' +
            '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
            '.selectbox-item.focus, .selectbox-item:hover {' +
                'background: var(--main-color);' +
            '}',
            '.online.focus {' +
                'box-shadow: 0 0 0 0.2em var(--main-color);' +
            '}',
            '.online_modss.focus::after, .online-prestige.focus::after, ' +
            '.radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, ' +
            '.iptv-channel.last--focus::before {' +
                'border-color: var(--main-color) !important;' +
            '}',
            '.card-more.focus .card-more__box::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {' +
                'border-color: var(--main-color) !important;' +
            '}',
            '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, ' +
            '.card-episode.focus .full-episode::after, .register.focus::after, ' +
            '.season-episode.focus::after, .full-episode.focus::after, ' +
            '.full-review-add.focus::after, .card.focus .card__view::after, ' +
            '.card:hover .card__view::after, .extensions__item.focus:after, ' +
            '.torrent-item.focus::after, .extensions__block-add.focus:after {' +
                'border-color: var(--main-color);' +
            '}',
            '.broadcast__scan > div {' +
                'background-color: var(--main-color);' +
            '}',
            '.card:hover .card__view, .card.focus .card__view {' +
                'border-color: var(--main-color);' +
            '}',
            '.noty {' +
                'background: var(--main-color);' +
            '}',
            '.radio-player.focus {' +
                'background-color: var(--main-color);' +
            '}',
            '.explorer-card__head-img.focus::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}',
            '.color_square.focus {' +
                'border: 0.3em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}',
            'body.glass--style .selectbox-item.focus, ' +
            'body.glass--style .settings-folder.focus, ' +
            'body.glass--style .settings-param.focus {' +
                'background-color: var(--main-color);' +
            '}',
            'body.glass--style .settings-folder.focus .settings-folder__icon {' +
                '-webkit-filter: none;' +
                'filter: none;' +
            '}',
            dimmingStyles,
            '.timetable__item--any::before {' +
                'background-color: rgba(var(--main-color-rgb), 0.3);' +
            '}',
            '.element {' +
                'background: var(--main-color);' +
            '}',
            '.bookmarks-folder__layer {' +
                'background-color: var(--main-color);' +
            '}',
            '.color_square.default {' +
                'background-color: #fff;' +
                'width: 35px;' +
                'height: 35px;' +
                'border-radius: 4px;' +
                'position: relative;' +
            '}',
            '.color_square.default::after {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 3px;' +
                'background-color: #353535;' +
                'transform: rotate(45deg);' +
            '}',
            '.color_square.default::before {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 3px;' +
                'background-color: #353535;' +
                'transform: rotate(-45deg);' +
            '}',
            '.color_square {' +
                'width: 35px;' +
                'height: 35px;' +
                'border-radius: 4px;' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: center;' +
                'align-items: center;' +
                'cursor: pointer;' +
                'color: #ffffff !important;' +
                'font-size: 10px;' +
                'text-align: center;' +
            '}',
            '.color-family-outline {' +
                'display: flex;' +
                'flex-direction: row;' +
                'overflow: hidden;' +
                'gap: 10px;' +
                'border-radius: 8px;' +
                'margin-bottom: 1px;' +
                'padding: 5px;' +
            '}',
            '.color-family-name {' +
                'width: 80px;' +
                'height: 35px;' +
                'border-width: 2px;' +
                'border-style: solid;' +
                'border-radius: 4px;' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: center;' +
                'align-items: center;' +
                'cursor: default;' +
                'color: #ffffff !important;' +
                'font-size: 10px;' +
                'font-weight: bold;' +
                'text-align: center;' +
                'text-transform: capitalize;' +
            '}',
            '.color_square .hex {' +
                'font-size: 7px;' +
                'opacity: 0.9;' +
                'text-transform: uppercase;' +
                'z-index: 1;' +
            '}',
            '.hex-input {' +
                'width: 360px;' +
                'height: 35px;' +
                'border-radius: 8px;' +
                'border: 2px solid #ddd;' +
                'position: relative;' +
                'cursor: pointer;' +
                'display: flex;' +
                'flex-direction: column;' +
                'align-items: center;' +
                'justify-content: center;' +
                'color: #fff !important;' +
                'font-size: 12px;' +
                'font-weight: bold;' +
                'text-shadow: 0 0 2px #000;' +
                'background-color: #353535;' +
            '}',
            '.hex-input.focus {' +
                'border: 0.2em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}',
            '.hex-input .label {' +
                'position: absolute;' +
                'top: 1px;' +
                'font-size: 10px;' +
            '}',
            '.hex-input .value {' +
                'position: absolute;' +
                'bottom: 1px;' +
                'font-size: 10px;' +
            '}',
            '.color-picker-container {' +
                'display: grid;' +
                'grid-template-columns: 1fr 1fr;' +
                'gap: 140px;' +
                'padding: 0;' +
            '}',
            '.color-picker-container > div:nth-child(2) {' +
                'display: flex;' +
                'flex-direction: column;' +
                'justify-content: flex-end;' +
            '}',
            '@media (max-width: 768px) {' +
                '.color-picker-container {' +
                    'grid-template-columns: 1fr;' +
                '}' +
                '.color-picker-container > div:nth-child(2) {' +
                    'justify-content: flex-start;' +
                '}' +
            '}'
        ].join('');

        updateDateElementStyles();
        checkBodyStyles();
        console.log('ColorPlugin: Applied styles, main_color: ' + ColorPlugin.settings.main_color + ', enabled: ' + ColorPlugin.settings.enabled + ', highlight_enabled: ' + ColorPlugin.settings.highlight_enabled + ', dimming_enabled: ' + ColorPlugin.settings.dimming_enabled);
    }

    // Функція для створення HTML для вибору кольору
    function createColorHtml(color, name) {
        var className = color === 'default' ? 'color_square selector default' : 'color_square selector';
        var style = color === 'default' ? '' : 'background-color: ' + color + ';';
        var hex = color === 'default' ? '' : color.replace('#', '');
        var content = color === 'default' ? '' : '<div class="hex">' + hex + '</div>';
        return '<div class="' + className + '" tabindex="0" style="' + style + '" title="' + name + '">' + content + '</div>';
    }

    // Функція для створення HTML для назви сімейства
    function createFamilyNameHtml(name, color) {
        return '<div class="color-family-name" style="border-color: ' + (color || '#353535') + ';">' + Lampa.Lang.translate(name.toLowerCase()) + '</div>';
    }

    // Функція для розбиття масиву кольорів на групи по 6
    function chunkArray(arr, size) {
        var result = [];
        for (var i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    // Функція для створення модального вікна вибору кольору
    function openColorPicker() {
        var colorKeys = Object.keys(ColorPlugin.colors.main);
        var families = [
            'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Teal', 'Cyan',
            'Sky', 'Blue', 'Indigo', 'Violet', 'Purple', 'Fuchsia', 'Pink', 'Rose', 'Slate',
            'Gray', 'Zinc', 'Neutral', 'Stone'
        ];
        var colorsByFamily = [];

        for (var i = 0; i < families.length; i++) {
            var family = families[i];
            var familyColors = colorKeys.filter(function(key) {
                return ColorPlugin.colors.main[key].indexOf(family) === 0 && key !== 'default';
            });
            if (familyColors.length > 0) {
                colorsByFamily.push({
                    name: family,
                    colors: familyColors
                });
            }
        }

        var colorContent = colorsByFamily.map(function(family) {
            var firstColor = family.colors[0];
            var familyNameHtml = createFamilyNameHtml(family.name, firstColor);
            var groupContent = family.colors.map(function(color) {
                return createColorHtml(color, ColorPlugin.colors.main[color]);
            }).join('');
            return '<div class="color-family-outline">' + familyNameHtml + groupContent + '</div>';
        });

        // Розподіляємо кольори між двома колонками
        var midPoint = Math.ceil(colorContent.length / 2);
        var leftColumn = colorContent.slice(0, midPoint).join('');
        var rightColumn = colorContent.slice(midPoint).join('');

        var defaultButton = createColorHtml('default', Lampa.Lang.translate('default_color'));
        var hexValue = Lampa.Storage.get('color_plugin_custom_hex', '') || '#353535';
        var hexDisplay = hexValue.replace('#', '');
        var inputHtml = '<div class="color_square selector hex-input" tabindex="0" style="background-color: ' + hexValue + ';">' +
                        '<div class="label">' + Lampa.Lang.translate('custom_hex_input') + '</div>' +
                        '<div class="value">' + hexDisplay + '</div>' +
                        '</div>';
        var topRowHtml = '<div style="display: flex; gap: 30px; padding: 0; justify-content: center; margin-bottom: 10px;">' +
                         defaultButton + inputHtml + '</div>';

        var modalContent = '<div class="color-picker-container">' +
                           '<div>' + leftColumn + '</div>' +
                           '<div>' + rightColumn + '</div>' +
                           '</div>';
        var modalHtml = $('<div>' + topRowHtml + modalContent + '</div>');

        try {
            Lampa.Modal.open({
                title: Lampa.Lang.translate('main_color'),
                size: 'medium',
                align: 'center',
                html: modalHtml,
                className: 'color-picker-modal',
                onBack: function () {
                    saveSettings();
                    Lampa.Modal.close();
                    Lampa.Controller.toggle('settings_component');
                    Lampa.Controller.enable('menu');
                },
                onSelect: function (a) {
                    if (a.length > 0 && a[0] instanceof HTMLElement) {
                        var selectedElement = a[0];
                        var color;

                        if (selectedElement.classList.contains('hex-input')) {
                            Lampa.Noty.show(Lampa.Lang.translate('hex_input_hint'));
                            Lampa.Modal.close();
                            var inputOptions = {
                                name: 'color_plugin_custom_hex',
                                value: Lampa.Storage.get('color_plugin_custom_hex', ''),
                                placeholder: Lampa.Lang.translate('settings_cub_not_specified')
                            };

                            Lampa.Input.edit(inputOptions, function (value) {
                                if (value === '') {
                                    Lampa.Noty.show('HEX-код не введено.');
                                    Lampa.Controller.toggle('settings_component');
                                    Lampa.Controller.enable('menu');
                                    return;
                                }
                                if (!isValidHex(value)) {
                                    Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
                                    Lampa.Controller.toggle('settings_component');
                                    Lampa.Controller.enable('menu');
                                    return;
                                }
                                Lampa.Storage.set('color_plugin_custom_hex', value);
                                ColorPlugin.settings.main_color = value;
                                Lampa.Storage.set('color_plugin_main_color', value);
                                applyStyles();
                                updateCanvasFillStyle(window.draw_context);
                                saveSettings();
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                if (Lampa.Settings && Lampa.Settings.render) {
                                    Lampa.Settings.render();
                                }
                            });
                            return;
                        } else if (selectedElement.classList.contains('default')) {
                            color = '#353535';
                        } else {
                            color = selectedElement.style.backgroundColor || ColorPlugin.settings.main_color;
                            color = color.includes('rgb') ? rgbToHex(color) : color;
                        }

                        ColorPlugin.settings.main_color = color;
                        Lampa.Storage.set('color_plugin_main_color', color);
                        applyStyles();
                        updateCanvasFillStyle(window.draw_context);
                        saveSettings();
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('settings_component');
                        Lampa.Controller.enable('menu');
                        if (Lampa.Settings && Lampa.Settings.render) {
                            Lampa.Settings.render();
                        }
                    }
                }
            });
        } catch (e) {
            console.error('ColorPlugin: Error in openColorPicker', e);
        }
    }

    // Функція для оновлення видимості параметрів
    function updateParamsVisibility(body) {
        var params = [
            '.settings-param[data-name="color_plugin_main_color"]',
            '.settings-param[data-name="color_plugin_highlight_enabled"]',
            '.settings-param[data-name="color_plugin_dimming_enabled"]'
        ];
        console.log('ColorPlugin: updateParamsVisibility called, enabled:', ColorPlugin.settings.enabled);
        setTimeout(function() {
            for (var i = 0; i < params.length; i++) {
                var selector = params[i];
                var elements = body ? body.find(selector) : $(selector);
                console.log('ColorPlugin: Selector', selector, 'found', elements.length, 'elements');
                if (elements.length) {
                    var displayValue = ColorPlugin.settings.enabled ? 'block' : 'none';
                    elements.each(function(index, element) {
                        $(element).css('display', displayValue);
                        console.log('ColorPlugin: Set display to', displayValue, 'for element with data-name:', selector);
                    });
                } else {
                    console.warn('ColorPlugin: No elements found for selector', selector);
                }
            }
        }, 100);
    }

    // Функція для ініціалізації плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
        ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
        ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';
        console.log('ColorPlugin: Initialized with settings', ColorPlugin.settings);

        // Додаємо компонент до меню налаштувань
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'color_plugin',
                name: Lampa.Lang.translate('color_plugin'),
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
            });

            // Увімкнення/вимкнення плагіна
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('color_plugin_enabled'),
                    description: Lampa.Lang.translate('color_plugin_enabled_description')
                },
                onChange: function (value) {
                    console.log('ColorPlugin: color_plugin_enabled changed to', value);
                    ColorPlugin.settings.enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                    applyStyles();
                    updateCanvasFillStyle(window.draw_context);
                    updateParamsVisibility();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', 'block');
                        console.log('ColorPlugin: Rendered color_plugin_enabled, display: block');
                    } else {
                        console.warn('ColorPlugin: item.css is not a function for color_plugin_enabled', item);
                    }
                }
            });

            // Колір виділення
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_main_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('main_color'),
                    description: Lampa.Lang.translate('main_color_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                        console.log('ColorPlugin: Rendered color_plugin_main_color, display:', ColorPlugin.settings.enabled ? 'block' : 'none');
                    } else {
                        console.warn('ColorPlugin: item.css is not a function for color_plugin_main_color', item);
                    }
                },
                onChange: function () {
                    openColorPicker();
                }
            });

            // Увімкнення/вимкнення рамки
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_highlight_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.highlight_enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('enable_highlight'),
                    description: Lampa.Lang.translate('enable_highlight_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                        console.log('ColorPlugin: Rendered color_plugin_highlight_enabled, display:', ColorPlugin.settings.enabled ? 'block' : 'none');
                    } else {
                        console.warn('ColorPlugin: item.css is not a function for color_plugin_highlight_enabled', item);
                    }
                },
                onChange: function (value) {
                    ColorPlugin.settings.highlight_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                    applyStyles();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                }
            });

            // Застосувати колір затемнення
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_dimming_enabled',
                    type: 'trigger',
                    default: ColorPlugin.settings.dimming_enabled.toString()
                },
                field: {
                    name: Lampa.Lang.translate('enable_dimming'),
                    description: Lampa.Lang.translate('enable_dimming_description')
                },
                onRender: function (item) {
                    if (item && typeof item.css === 'function') {
                        item.css('display', ColorPlugin.settings.enabled ? 'block' : 'none');
                        console.log('ColorPlugin: Rendered color_plugin_dimming_enabled, display:', ColorPlugin.settings.enabled ? 'block' : 'none');
                    } else {
                        console.warn('ColorPlugin: item.css is not a function for color_plugin_dimming_enabled', item);
                    }
                },
                onChange: function (value) {
                    ColorPlugin.settings.dimming_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                    applyStyles();
                    saveSettings();
                    if (Lampa.Settings && Lampa.Settings.render) {
                        Lampa.Settings.render();
                    }
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility();
        }

        // Додаємо слухач для оновлення видимості при відкритті налаштувань
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'color_plugin') {
                console.log('ColorPlugin: Settings opened for color_plugin');
                updateParamsVisibility(e.body);
            }
        });
    }

    // Запускаємо плагін після готовності програми
    if (window.appready && Lampa.SettingsApi) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready' && Lampa.SettingsApi) {
                initPlugin();
            }
        });
    }

    // Оновлюємо стилі та видимість параметрів при зміні налаштувань
    Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'color_plugin_enabled') {
            console.log('ColorPlugin: Storage change detected for color_plugin_enabled, value:', e.value);
            ColorPlugin.settings.enabled = e.value === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updateParamsVisibility();
        }
    });

    // Оновлюємо стилі та видимість при взаємодії з меню
    Lampa.Listener.follow('settings_component', function (event) {
        if (event.type === 'open') {
            console.log('ColorPlugin: settings_component opened');
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
            updateParamsVisibility();
        } else if (event.type === 'close') {
            console.log('ColorPlugin: settings_component closed');
            saveSettings();
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon();
        }
    });
})();
