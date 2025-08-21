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
            ru: 'Цвет иконок (общий)',
            en: 'Icons color (global)',
            uk: 'Колір іконок (загальний)'
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
        },
        // Нові ключі для груп
        icon_group_left: {
            ru: 'Иконки левого меню',
            en: 'Left menu icons',
            uk: 'Іконки лівого меню'
        },
        icon_group_top: {
            ru: 'Иконки верхнего меню (хедер)',
            en: 'Top header icons',
            uk: 'Іконки верхнього меню (хедер)'
        },
        icon_group_right: {
            ru: 'Иконки правых настроек',
            en: 'Right settings icons',
            uk: 'Іконки правих налаштувань'
        }
    });

    // Об'єкт для зберігання налаштувань
    var ColorPlugin = {
        settings: {
            main_color: '#353535',
            background_color: '#1d1f20',
            text_color: '#ffffff',
            transparent_white: 'rgba(255,255,255,0.2)',

            // Раніше був один icon_color — тепер три незалежні змінні:
            icon_color_left: '#497d00',  // ліве меню
            icon_color_top: '#ffffff',   // верхній хедер
            icon_color_right: '#9f0712', // праві налаштування (і іконка самого плагіна)

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
            // Набір для іконок (спільний для трьох груп)
            icon: {
                '#000000': 'Чорний',
                '#ffffff': 'Білий',
                '#dddddd': 'Світло-сірий',
                '#9f0712': 'Темно-червоний',
                '#fef3c6': 'Світло-жовтий',
                '#497d00': 'Темно-зелений',
                '#007595': 'Морський синій',
                '#3b88d5': 'Маринер',
                '#e1284e': 'Амарант'
            }
        }
    };

    // Функція для конвертації RGB у HEX
    function rgbToHex(rgb) {
        var matches = rgb && rgb.match ? rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/) : null;
        if (!matches) return rgb;
        function hex(n) {
            return ('0' + parseInt(n, 10).toString(16)).slice(-2);
        }
        return '#' + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
    }

    // Функція для валідації HEX-коду
    function isValidHex(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    // Оновлення іконки самого плагіна (відображається у правих налаштуваннях)
    function updatePluginIcon() {
        try {
            if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
                var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
                if (menuItem) {
                    menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color_right + '"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
                }
                return;
            }
            var component = Lampa.SettingsApi.components.find(function (c) { return c.component === 'color_plugin'; });
            if (component) {
                component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color_right + '"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
                Lampa.Settings.render();
            }
        } catch (e) {
            console.warn('ColorPlugin: updatePluginIcon error', e);
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

        // Увага: жорстке розділення трьох груп іконок + збережено попередні акценти
        style.innerHTML =
            ':root {' +
                '--main-color: ' + ColorPlugin.settings.main_color + ';' +
                '--background-color: ' + ColorPlugin.settings.background_color + ';' +
                '--text-color: ' + ColorPlugin.settings.text_color + ';' +
                '--transparent-white: ' + ColorPlugin.settings.transparent_white + ';' +
                '--icon-left: ' + ColorPlugin.settings.icon_color_left + ';' +
                '--icon-top: ' + ColorPlugin.settings.icon_color_top + ';' +
                '--icon-right: ' + ColorPlugin.settings.icon_color_right + ';' +
            '}' +

            /* ----------------- ЛІВЕ МЕНЮ: ІКОНКИ -----------------
               Тільки ліва колонка меню. Фіксуємо звичайний стан та фокус/hover/traverse.
               SVG використовує currentColor, тож виставляємо через color.
            */
            '.menu .menu__item .menu__ico {' +
                'color: var(--icon-left) !important;' +
            '}' +
            '.menu .menu__item.focus .menu__ico, ' +
            '.menu .menu__item.hover .menu__ico, ' +
            '.menu .menu__item.traverse .menu__ico {' +
                'color: var(--icon-left) !important;' +
            '}' +

            /* ----------------- ВЕРХНІЙ ХЕДЕР: ІКОНКИ -----------------
               Діємо тільки на елементи хедера. Не чіпаємо ліве меню та праві налаштування.
            */
            '.head .head__action svg, .head .head__action .icon, .head .head__action {' +
                'color: var(--icon-top) !important;' +
                'fill: var(--icon-top) !important;' +
            '}' +
            '.head .head__action.focus svg, .head .head__action.hover svg, .head .head__action.focus, .head .head__action.hover {' +
                'color: var(--icon-top) !important;' +
                'fill: var(--icon-top) !important;' +
            '}' +

            /* ----------------- ПРАВІ НАЛАШТУВАННЯ: ІКОНКИ -----------------
               Селектори для списків налаштувань, іконок папок/параметрів.
            */
            '.settings, .settings__content, .settings-param, .settings-folder {' +
                '--cp-right-icon: var(--icon-right);' +
            '}' +
            '.settings .settings-param .settings-param__name .menu__ico, ' +
            '.settings .settings-param .menu__ico, ' +
            '.settings .settings-folder .menu__ico, ' +
            '.settings .menu__ico {' +
                'color: var(--cp-right-icon) !important;' +
            '}' +
            '.settings .settings-param.focus .menu__ico, ' +
            '.settings .settings-folder.focus .menu__ico, ' +
            '.settings .selectbox-item.focus .menu__ico {' +
                'color: var(--cp-right-icon) !important;' +
            '}' +

            /* ----------------- ІНШІ АКЦЕНТИ З ПОПЕРЕДНЬОЇ ВЕРСІЇ ----------------- */
            '.console__tab.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.simple-button.focus, .head__action.focus, .head__action.hover, ' +
            '.player-panel .button.focus, .search-source.active {' +
                'background: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.navigation-tabs__button.focus, .time-line > div, .player-panel__position, ' +
            '.player-panel__position > div:after {' +
                'background-color: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
                'background-color: var(--main-color) !important;' +
                'color: var(--text-color) !important;' +
            '}' +
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
            '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
            '.torrent-serial__progress, .full-review-add.focus, .full-review.focus, ' +
            '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
            '.selectbox-item.focus, .selectbox-item.hover {' +
                'background: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.online.focus {' +
                'box-shadow: 0 0 0 0.2em var(--main-color);' +
            '}' +
            '.online_modss.focus::after, .online-prestige.focus::after, ' +
            '.radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, ' +
            '.iptv-channel.last--focus::before {' +
                'border-color: var(--main-color) !important;' +
            '}' +
            '.card-more.focus .card-more__box::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}' +
            '.iptv-playlist-item.focus::after, .iptv-playlist-item.hover::after {' +
                'border-color: var(--main-color) !important;' +
            '}' +
            '.ad-bot.focus .ad-bot__content::after, .ad-bot.hover .ad-bot__content::after, ' +
            '.card-episode.focus .full-episode::after, .register.focus::after, ' +
            '.season-episode.focus::after, .full-episode.focus::after, ' +
            '.full-review-add.focus::after, .card.focus .card__view::after, ' +
            '.card.hover .card__view::after, .extensions__item.focus:after, ' +
            '.torrent-item.focus::after, .extensions__block-add.focus:after {' +
                'border-color: var(--main-color);' +
            '}' +
            '.torrent-serial__size {' +
                'background-color: var(--text-color);' +
                'color: var(--icon-right);' +
            '}' +
            '.broadcast__scan > div, .broadcast__device.focus {' +
                'background-color: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.card:hover .card__img, .card.focus .card__img {' +
                'border-color: var(--main-color);' +
            '}' +
            '.noty {' +
                'background: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.radio-player.focus {' +
                'background-color: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.explorer-card__head-img.focus::after {' +
                'border: 0.3em solid var(--main-color);' +
            '}' +
            '.color_square.focus {' +
                'border: 0.3em solid var(--main-color);' +
                'transform: scale(1.1);' +
            '}' +
            'body.glass--style .selectbox-item.focus, ' +
            'body.glass--style .settings-folder.focus, ' +
            'body.glass--style .settings-param.focus {' +
                'background-color: var(--main-color);' +
                'color: var(--text-color);' +
            '}' +
            '.color_square.default {' +
                'background-color: #ffffff;' +
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
            '}';

        updatePluginIcon();
        console.log('ColorPlugin: styles applied. Left:', ColorPlugin.settings.icon_color_left, 'Top:', ColorPlugin.settings.icon_color_top, 'Right:', ColorPlugin.settings.icon_color_right);
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
        var i;
        for (i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    // Функція для створення модального вікна вибору кольору
    function openColorPicker(paramName, colors, title) {
        var colorKeys = Object.keys(colors);
        var groupedColors = chunkArray(colorKeys, 5);
        var colorContent = groupedColors.map(function (group) {
            var groupContent = group.map(function (color) {
                return createColorHtml(color, colors[color]);
            }).join('');
            return '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 11.25px; justify-items: center; padding: 10px;">' + groupContent + '</div>';
        }).join('');

        var hexValue = Lampa.Storage.get('color_plugin_custom_hex', '') || '#000000';
        var inputHtml =
            '<div style="padding: 10px; display: flex; justify-content: center;">' +
                '<div class="color_square selector hex-input" tabindex="0" style="background-color: ' + hexValue + ';">' +
                    '<div class="label">' + Lampa.Lang.translate('custom_hex_input') + '</div>' +
                    '<div class="value">' + hexValue + '</div>' +
                '</div>' +
            '</div>';

        var modalHtml = $('<div>' + colorContent + inputHtml + '</div>');

        try {
            Lampa.Modal.open({
                title: Lampa.Lang.translate(title),
                size: 'medium',
                align: 'center',
                html: modalHtml,
                onBack: function () {
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
                                ColorPlugin.settings[paramName] = value;
                                Lampa.Storage.set('color_plugin_' + paramName, value);
                                applyStyles();
                                Lampa.Controller.toggle('settings_component');
                                Lampa.Controller.enable('menu');
                                Lampa.Settings.render();
                            });
                            return;
                        } else if (selectedElement.classList.contains('default')) {
                            var defaults = {
                                main_color: '#353535',
                                background_color: '#1d1f20',
                                text_color: '#ffffff',
                                transparent_white: 'rgba(255,255,255,0.2)',
                                icon_color_left: '#497d00',
                                icon_color_top: '#ffffff',
                                icon_color_right: '#9f0712'
                            };
                            color = defaults[paramName];
                        } else {
                            color = selectedElement.style.backgroundColor || ColorPlugin.settings[paramName];
                            color = color && color.indexOf('rgb') !== -1 ? rgbToHex(color) : color;
                        }

                        ColorPlugin.settings[paramName] = color;
                        Lampa.Storage.set('color_plugin_' + paramName, color);
                        applyStyles();
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

    // Ініціалізація плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.background_color = Lampa.Storage.get('color_plugin_background_color', '#1d1f20');
        ColorPlugin.settings.text_color = Lampa.Storage.get('color_plugin_text_color', '#ffffff');
        ColorPlugin.settings.transparent_white = Lampa.Storage.get('color_plugin_transparent_white', 'rgba(255,255,255,0.2)');

        // Три незалежні групи іконок
        ColorPlugin.settings.icon_color_left = Lampa.Storage.get('color_plugin_icon_color_left', '#497d00');
        ColorPlugin.settings.icon_color_top = Lampa.Storage.get('color_plugin_icon_color_top', '#ffffff');
        ColorPlugin.settings.icon_color_right = Lampa.Storage.get('color_plugin_icon_color_right', '#9f0712');

        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', true);

        if (Lampa.SettingsApi) {
            // Компонент у налаштуваннях
            Lampa.SettingsApi.addComponent({
                component: 'color_plugin',
                name: Lampa.Lang.translate('color_plugin'),
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color_right + '"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
            });

            // Основний колір
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_main_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('main_color')
                },
                onChange: function () {
                    openColorPicker('main_color', ColorPlugin.colors.main, 'main_color');
                }
            });

            // Колір фону
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_background_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('background_color')
                },
                onChange: function () {
                    openColorPicker('background_color', ColorPlugin.colors.background, 'background_color');
                }
            });

            // Колір тексту
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_text_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('text_color')
                },
                onChange: function () {
                    openColorPicker('text_color', ColorPlugin.colors.text, 'text_color');
                }
            });

            // Прозорий фон
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_transparent_white',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('transparent_white')
                },
                onChange: function () {
                    openColorPicker('transparent_white', ColorPlugin.colors.transparent, 'transparent_white');
                }
            });

            // КОЛІР ІКОНОК — ЛІВЕ МЕНЮ
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color_left',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('icon_group_left')
                },
                onChange: function () {
                    openColorPicker('icon_color_left', ColorPlugin.colors.icon, 'icon_group_left');
                }
            });

            // КОЛІР ІКОНОК — ВЕРХНІЙ ХЕДЕР
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color_top',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('icon_group_top')
                },
                onChange: function () {
                    openColorPicker('icon_color_top', ColorPlugin.colors.icon, 'icon_group_top');
                }
            });

            // КОЛІР ІКОНОК — ПРАВІ НАЛАШТУВАННЯ
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color_right',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('icon_group_right')
                },
                onChange: function () {
                    openColorPicker('icon_color_right', ColorPlugin.colors.icon, 'icon_group_right');
                }
            });

            // Увімкнення/вимкнення плагіна
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_enabled',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('color_plugin_enabled'),
                    description: 'Увімкнути або вимкнути плагін зміни кольорів'
                },
                onChange: function (value) {
                    ColorPlugin.settings.enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled);
                    applyStyles();
                    Lampa.Settings.render();
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
        }
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

    // Оновлюємо стилі при відкритті налаштувань
    Lampa.Listener.follow('settings_component', function (event) {
        if (event.type === 'open') {
            applyStyles();
            Lampa.Settings.render();
        }
    });
})();
