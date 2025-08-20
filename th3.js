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
            ru: 'Основной цвет',
            en: 'Main color',
            uk: 'Основний колір'
        },
        background_color: {
            ru: 'Цвет фона',
            en: 'Background color',
            uk: 'Колір фону'
        },
        text_color: {
            ru: 'Цвет текста',
            en: 'Text color',
            uk: 'Колір тексту'
        },
        transparent_white: {
            ru: 'Прозрачный фон',
            en: 'Transparent background',
            uk: 'Прозорий фон'
        },
        icon_color: {
            ru: 'Цвет иконок',
            en: 'Icons color',
            uk: 'Колір іконок'
        },
        color_plugin_enabled: {
            ru: 'Включить плагин',
            en: 'Enable plugin',
            uk: 'Увімкнути плагін'
        },
        default_color: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        custom_hex_input: {
            ru: 'HEX-код цвета',
            en: 'HEX color code',
            uk: 'HEX-код кольору'
        },
        hex_input_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        }
    });

    // Об'єкт для зберігання налаштувань
    var ColorPlugin = {
        settings: {
            main_color: '#353535',
            background_color: '#1d1f20',
            text_color: '#fff',
            transparent_white: 'rgba(255,255,255,0.2)',
            icon_color: '#000',
            enabled: true
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'),
                '#e71500': 'Темно-бордовий',
                '#e1284e': 'Амарант',
                '#0c705b': 'Вечірнє море',
                '#2e8b2e': 'Мантіс',
                '#3b88d5': 'Маринер',
                '#1e779c': 'Блюмін',
                '#008d8b': 'Бірюзовий',
                '#823398': 'Фуксія',
                '#944729': 'Охра'
            },
            background: {
                '#4A0C0C': 'Темно-червоний',
                '#4A2400': 'Темно-помаранчевий',
                '#4A3600': 'Темно-золотий',
                '#0F2E1A': 'Темно-зелений',
                '#0C2A17': 'Темно-салатовий',
                '#0A1E29': 'Темно-блакитний',
                '#001433': 'Темно-синій',
                '#001C33': 'Темно-яскраво-синій',
                '#1A1833': 'Темно-фіолетовий',
                '#2D1742': 'Темно-ліловий',
                '#4A0F24': 'Темно-малиновий',
                '#4A1E29': 'Темно-кораловий',
                '#4A3D00': 'Темно-жовтий',
                '#0A2733': 'Темно-аквамарин',
                '#0A2333': 'Темно-бірюзовий'
            },
            text: {
                '#ffffff': 'Білий',
                '#dddddd': 'Світло-сірий',
                '#b0b0b0': 'Сірий',
                '#000000': 'Чорний'
            },
            transparent: {
                'rgba(255,255,255,0.2)': 'Прозорий білий 20%',
                'rgba(255,255,255,0.1)': 'Прозорий білий 10%',
                'rgba(255,255,255,0.3)': 'Прозорий білий 30%',
                'rgba(0,0,0,0.2)': 'Прозорий чорний 20%'
            },
            icon: {
                '#000000': 'Чорний',
                '#ffffff': 'Білий',
                '#dddddd': 'Світло-сірий',
                '#9f0712': 'Темно-червоний',
                '#fef3c6': 'Світло-жовтий',
                '#497d00': 'Темно-зелений',
                '#007595': 'Морський синій'
            }
        }
    };

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

    // Функція для оновлення іконки плагіна
    function updatePluginIcon() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            console.warn('ColorPlugin: Lampa.SettingsApi.components is not available.');
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) {
                menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color + '"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            }
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color + '"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            Lampa.Settings.render();
        }
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

        style.innerHTML = (
            ':root {' +
                '--main-color: ' + ColorPlugin.settings.main_color + ';' +
                '--background-color: ' + ColorPlugin.settings.background_color + ';' +
                '--text-color: ' + ColorPlugin.settings.text_color + ';' +
                '--transparent-white: ' + ColorPlugin.settings.transparent_white + ';' +
            '}' +
            '.menu__ico, .menu__ico.focus {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.console__tab.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.simple-button.focus, .head__action.focus, .head__action.hover, ' +
            '.player-panel .button.focus, .search-source.active {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.navigation-tabs__button.focus, .time-line > div, .player-panel__position, ' +
            '.player-panel__position > div:after {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
                'background-color: ' + ColorPlugin.settings.main_color + ' !important;' +
                'color: ' + ColorPlugin.settings.text_color + ' !important;' +
            '}' +
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
            '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
            '.torrent-serial__progress, .full-review-add.focus, .full-review.focus, ' +
            '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
            '.selectbox-item.focus, .selectbox-item.hover {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.online.focus {' +
                'box-shadow: 0 0 0 0.2em ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.online_modss.focus::after, .online-prestige.focus::after, ' +
            '.radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, ' +
            '.iptv-channel.last--focus::before {' +
                'border-color: ' + ColorPlugin.settings.main_color + ' !important;' +
            '}' +
            '.card-more.focus .card-more__box::after {' +
                'border: 0.3em solid ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.iptv-playlist-item.focus::after, .iptv-playlist-item.hover::after {' +
                'border-color: ' + ColorPlugin.settings.main_color + ' !important;' +
            '}' +
            '.ad-bot.focus .ad-bot__content::after, .ad-bot.hover .ad-bot__content::after, ' +
            '.card-episode.focus .full-episode::after, .register.focus::after, ' +
            '.season-episode.focus::after, .full-episode.focus::after, ' +
            '.full-review-add.focus::after, .card.focus .card__view::after, ' +
            '.card.hover .card__view::after, .extensions__item.focus:after, ' +
            '.torrent-item.focus::after, .extensions__block-add.focus:after {' +
                'border-color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.torrent-serial__size {' +
                'background-color: ' + ColorPlugin.settings.text_color + ';' +
                'color: ' + ColorPlugin.settings.icon_color + ';' +
            '}' +
            '.broadcast__scan > div, .broadcast__device.focus {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.card:hover .card__img, .card.focus .card__img {' +
                'border-color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.noty {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.radio-player.focus {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            '.explorer-card__head-img.focus::after {' +
                'border: 0.3em solid ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.color_square.focus {' +
                'border: 0.3em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}' +
            'body.glass--style .selectbox-item.focus, ' +
            'body.glass--style .settings-folder.focus, ' +
            'body.glass--style .settings-param.focus {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
                'color: ' + ColorPlugin.settings.text_color + ';' +
            '}' +
            // Запобігаємо перезапису кольору глобальними стилями
            '.settings-param.focus .settings-param__descr div:not([class]) {' +
                'background-color: transparent !important;' +
            '}' +
            // Стили для квадратів у settings-param__descr (з фокусом і без)
            '.settings-param[data-name="color_plugin_main_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_main_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_main_color"] .settings-param__descr div[style*="background-color"], ' +
            '.settings-param[data-name="color_plugin_main_color"][class*="focus"] .settings-param__descr div {' +
                'background-color: ' + ColorPlugin.settings.main_color + ' !important;' +
                'width: 2em !important;' +
                'height: 2em !important;' +
                'display: inline-block !important;' +
                'border: 2px solid rgb(255, 255, 255) !important;' +
            '}' +
            '.settings-param[data-name="color_plugin_background_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_background_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_background_color"] .settings-param__descr div[style*="background-color"], ' +
            '.settings-param[data-name="color_plugin_background_color"][class*="focus"] .settings-param__descr div {' +
                'background-color: ' + ColorPlugin.settings.background_color + ' !important;' +
                'width: 2em !important;' +
                'height: 2em !important;' +
                'display: inline-block !important;' +
                'border: 2px solid rgb(255, 255, 255) !important;' +
            '}' +
            '.settings-param[data-name="color_plugin_text_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_text_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_text_color"] .settings-param__descr div[style*="background-color"], ' +
            '.settings-param[data-name="color_plugin_text_color"][class*="focus"] .settings-param__descr div {' +
                'background-color: ' + ColorPlugin.settings.text_color + ' !important;' +
                'width: 2em !important;' +
                'height: 2em !important;' +
                'display: inline-block !important;' +
                'border: 2px solid rgb(255, 255, 255) !important;' +
            '}' +
            '.settings-param[data-name="color_plugin_transparent_white"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_transparent_white"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_transparent_white"] .settings-param__descr div[style*="background-color"], ' +
            '.settings-param[data-name="color_plugin_transparent_white"][class*="focus"] .settings-param__descr div {' +
                'background-color: ' + ColorPlugin.settings.transparent_white + ' !important;' +
                'width: 2em !important;' +
                'height: 2em !important;' +
                'display: inline-block !important;' +
                'border: 2px solid rgb(255, 255, 255) !important;' +
            '}' +
            '.settings-param[data-name="color_plugin_icon_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_icon_color"] .settings-param__descr div, ' +
            '.settings-param.focus[data-name="color_plugin_icon_color"] .settings-param__descr div[style*="background-color"], ' +
            '.settings-param[data-name="color_plugin_icon_color"][class*="focus"] .settings-param__descr div {' +
                'background-color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'width: 2em !important;' +
                'height: 2em !important;' +
                'display: inline-block !important;' +
                'border: 2px solid rgb(255, 255, 255) !important;' +
            '}' +
            '.color_square.default {' +
                'background-color: #fff;' +
                'position: relative;' +
            '}' +
            '.color_square.default::after {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 2px;' +
                'background-color: #000;' +
                'transform: rotate(45deg);' +
            '}' +
            '.color_square.default::before {' +
                'content: "";' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 10%;' +
                'right: 10%;' +
                'height: 2px;' +
                'background-color: #000;' +
                'transform: rotate(-45deg);' +
            '}' +
            '.color_square {' +
                'width: 45px;' +
                'height: 45px;' +
                'border-radius: 6px;' +
            '}' +
            '.hex-input {' +
                'width: 360px;' +
                'height: 60px;' +
                'border-radius: 8px;' +
                'border: 1px solid #ddd;' +
                'position: relative;' +
                'cursor: pointer;' +
                'display: flex;' +
                'flex-direction: column;' +
                'align-items: center;' +
                'justify-content: center;' +
                'color: #fff;' +
                'font-size: 14px;' +
                'font-weight: bold;' +
                'text-shadow: 0 0 2px #000;' +
                'background-color: #000000;' +
            '}' +
            '.hex-input.focus {' +
                'border: 0.3em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}' +
            '.hex-input .label {' +
                'position: absolute;' +
                'top: 10px;' +
                'font-size: 12px;' +
            '}' +
            '.hex-input .value {' +
                'position: absolute;' +
                'bottom: 10px;' +
                'font-size: 14px;' +
            '}'
        );

        // Оновлюємо іконку плагіна
        updatePluginIcon();
        console.log('ColorPlugin: Applied styles, icon_color: ' + ColorPlugin.settings.icon_color + ', main_color: ' + ColorPlugin.settings.main_color);
    }

    // Функція для створення HTML для вибору кольору
    function createColorHtml(color, name) {
        var className = color === 'default' ? 'color_square selector default' : 'color_square selector';
        var style = color === 'default' ? '' : 'background-color: ' + color + ';';
        return '<div class="' + className + '" tabindex="0" style="' + style + '" title="' + name + '"></div>';
    }

    // Функція для розбиття масиву кольорів на групи
    function chunkArray(arr, size) {
        var result = [];
        for (var i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    // Функція для створення модального вікна вибору кольору
    function openColorPicker(paramName, colors, title) {
        var colorKeys = Object.keys(colors);
        var groupedColors = chunkArray(colorKeys, 5); // Сітка 5x2
        var
