(function () {
    'use strict';

    // Додаємо переклади
    Lampa.Lang.add({
        color_plugin: {
            ru: 'Настройка цветов',
            en: 'Color settings',
            uk: 'Налаштування кольорів'
        },
        main_color: {
            ru: 'Цвет выделения',
            en: 'Highlight color',
            uk: 'Колір виділення'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        enable_highlight: {
            ru: 'Включить рамку',
            en: 'Enable border',
            uk: 'Увімкнути рамку'
        },
        enable_dimming: {
            ru: 'Применить цвет затемнения',
            en: 'Apply dimming color',
            uk: 'Застосувати колір затемнення'
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
            console.warn('ColorPlugin: Lampa.SettingsApi.components is not available.');
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) {
                menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            }
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            Lampa.Settings.render();
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
        Lampa.Storage.set('color_plugin_main_color', ColorPlugin.settings.main_color);
        Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
        Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
        Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
        console.log('ColorPlugin: Settings saved', {
            main_color: ColorPlugin.settings.main_color,
            enabled: ColorPlugin.settings.enabled,
            highlight_enabled: ColorPlugin.settings.highlight_enabled,
            dimming_enabled: ColorPlugin.settings.dimming_enabled
        });
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
                'width: 30px;' +
                'height: 30px;' +
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
                'width: 30px;' +
                'height: 30px;' +
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
                'margin-bottom: 10px;' +
                'padding: 5px;' +
            '}',
            '.color-family-name {' +
                'width: 80px;' +
                'height: 30px;' +
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
                'height: 30px;' +
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
                'gap: 10px;' +
                'padding: 0;' +
            '}',
            '@media (max-width: 768px) {' +
                '.color-picker-container {' +
                    'grid-template-columns: 1fr;' +
                '}' +
            '}'
        ].join('');

        updateDateElementStyles();
        updatePluginIcon();
        checkBodyStyles();
        saveSettings();

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
        }).join('');

        var defaultButton = createColorHtml('default', Lampa.Lang.translate('default_color'));
        var hexValue = Lampa.Storage.get('color_plugin_custom_hex', '') || '#353535';
        var hexDisplay = hexValue.replace('#', '');
        var inputHtml = '<div class="color_square selector hex-input" tabindex="0" style="background-color: ' + hexValue + ';">' +
                        '<div class="label">' + Lampa.Lang.translate('custom_hex_input') + '</div>' +
                        '<div class="value">' + hexDisplay + '</div>' +
                        '</div>';
        var topRowHtml = '<div style="display: flex; gap: 30px; padding: 0; justify-content: center; margin-bottom: 10px;">' +
                         defaultButton + inputHtml + '</div>';

        var modalContent = '<div class="color-picker-container">' + colorContent + '</div>';
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
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                Lampa.Settings.render();
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
                        Lampa.Modal.close();
                        Lampa.Controller.toggle('settings_component');
                        Lampa.Controller.enable('menu');
                        Lampa.Settings.render();
                    }
                }
            });
        } catch (e) {
            console.error('ColorPlugin: Error in openColorPicker', e);
        }
    }

    // Функція для оновлення видимості параметрів
    function updateParamsVisibility() {
        var params = ['color_plugin_main_color', 'color_plugin_highlight_enabled', 'color_plugin_dimming_enabled'];
        for (var i = 0; i < params.length; i++) {
            var paramName = params[i];
            var param = Lampa.SettingsApi.getParam(paramName, 'color_plugin');
            if (param && param.field) {
                param.field.hidden = !ColorPlugin.settings.enabled;
            }
        }
        Lampa.Settings.render();
    }

    // Функція для ініціалізації плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
        ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
        ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';

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
                    description: 'Дозволяє змінювати колір виділення та затемнення елементів інтерфейсу'
                },
                onChange: function (value) {
                    ColorPlugin.settings.enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled.toString());
                    applyStyles();
                    updateCanvasFillStyle(window.draw_context);
                    updateParamsVisibility(); // Оновлюємо видимість параметрів
                    Lampa.Settings.render();
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
                    description: 'Можна вибрати чи вказати колір для виділених елементів',
                    hidden: !ColorPlugin.settings.enabled // Приховуємо, якщо плагін вимкнений
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
                    default: 'true'
                },
                field: {
                    name: Lampa.Lang.translate('enable_highlight'),
                    description: 'Вмикається біла рамка на виділених елементах',
                    hidden: !ColorPlugin.settings.enabled // Приховуємо, якщо плагін вимкнений
                },
                onChange: function (value) {
                    ColorPlugin.settings.highlight_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_highlight_enabled', ColorPlugin.settings.highlight_enabled.toString());
                    applyStyles();
                    Lampa.Settings.render();
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
                    description: 'Змінюється колір затемних елементів',
                    hidden: !ColorPlugin.settings.enabled // Приховуємо, якщо плагін вимкнений
                },
                onChange: function (value) {
                    ColorPlugin.settings.dimming_enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_dimming_enabled', ColorPlugin.settings.dimming_enabled.toString());
                    applyStyles();
                    Lampa.Settings.render();
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updateParamsVisibility(); // Оновлюємо видимість параметрів при ініціалізації
        }
    }

    // Запускаємо плагін після готовності програми
    if (window.appready && Lampa.SettingsApi) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready' && Lampa.SettingsApi) {
                initPlugin();
                updatePluginIcon(); // Спробуємо оновити іконку після ініціалізації
            }
        });
    }

    // Оновлюємо стилі, видимість параметрів та зберігаємо налаштування при взаємодії з меню
    Lampa.Listener.follow('settings_component', function (event) {
        if (event.type === 'open') {
            // Оновлюємо налаштування перед відображенням меню
            ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', 'true') === 'true';
            ColorPlugin.settings.highlight_enabled = Lampa.Storage.get('color_plugin_highlight_enabled', 'true') === 'true';
            ColorPlugin.settings.dimming_enabled = Lampa.Storage.get('color_plugin_dimming_enabled', 'true') === 'true';
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon(); // Оновлюємо іконку при відкритті налаштувань
            updateParamsVisibility(); // Оновлюємо видимість параметрів
            Lampa.Settings.render();
        } else if (event.type === 'close') {
            saveSettings();
            applyStyles();
            updateCanvasFillStyle(window.draw_context);
            updatePluginIcon(); // Оновлюємо іконку при закритті налаштувань
        }
    });
})();
