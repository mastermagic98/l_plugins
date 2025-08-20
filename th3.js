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
        custom_color: {
            ru: 'Свой цвет',
            en: 'Custom color',
            uk: 'Інший колір'
        },
        hex_hint: {
            ru: 'Используйте формат #FFFFFF, например #123524',
            en: 'Use the format #FFFFFF, for example #123524',
            uk: 'Використовуйте формат #FFFFFF, наприклад #123524'
        }
    });

    // Об'єкт для зберігання налаштувань
    var ColorPlugin = {
        settings: {
            main_color: '#353535', // Колір за замовчуванням
            background_color: '#1d1f20',
            text_color: '#fff',
            transparent_white: 'rgba(255,255,255,0.2)',
            icon_color: '#000',
            enabled: true
        },
        colors: {
            main: {
                'default': Lampa.Lang.translate('default_color'), // Перший у списку
                '#e40c2b': 'Червоний',
                '#4d7cff': 'Синій',
                '#ffeb3b': 'Жовтий',
                '#3da18d': 'М’ятний',
                '#ff9f4d': 'Помаранчевий',
                '#a64dff': 'Пурпурний',
                '#4caf50': 'Зелений',
                '#ff69b4': 'Рожевий',
                '#00bcd4': 'Бірюзовий' // Новий колір замість custom
            },
            background: {
                '#1d1f20': 'Темно-сірий',
                '#000000': 'Чорний',
                '#0a1b2a': 'Темно-синій',
                '#081822': 'Глибокий синій',
                '#1a102b': 'Темно-фіолетовий',
                '#1f0e04': 'Темно-коричневий',
                '#4b0e2b': 'Темно-рожевий'
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
                '#dddddd': 'Світло-сірий'
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
            '.menu__ico {' +
                'color: ' + ColorPlugin.settings.icon_color + ';' +
                '-webkit-filter: invert(1);' +
                'filter: invert(1);' +
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
            '.color_input_hint {' +
                'display: none;' +
                'color: #fff;' +
                'font-size: 14px;' +
                'text-align: center;' +
                'padding: 5px 0;' +
                'text-shadow: 0 0 2px #000;' +
            '}' +
            '.settings-param[data-type="input"] .color_input:focus + .color_input_hint {' +
                'display: block;' +
            '}'
        );
    }

    // Функція для створення HTML для вибору кольору
    function createColorHtml(color, name) {
        var className = color === 'default' ? 'color_square selector default' : 'color_square selector';
        var style = color === 'default' ? '' : 'background-color: ' + color + ';';
        return '<div class="' + className + '" tabindex="0" style="' + style + ' width: 60px; height: 60px; border-radius: 8px; cursor: pointer;" title="' + name + '"></div>';
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
        var groupedColors = chunkArray(colorKeys, 5); // Сітка 5x2 для 10 елементів
        var colorContent = groupedColors.map(function (group) {
            var groupContent = group.map(function (color) {
                return createColorHtml(color, colors[color]);
            }).join('');
            return '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; justify-items: center; padding: 10px;">' + groupContent + '</div>';
        }).join('');

        // Додаємо поле для введення HEX-коду з написом "Інший колір"
        var inputHtml = '<div class="settings-param selector" data-type="input" data-name="color_hex" style="padding: 10px; text-align: center;">' +
                        '<div style="font-size: 16px; color: #fff; margin-bottom: 5px;">' + Lampa.Lang.translate('custom_color') + '</div>' +
                        '<input type="text" class="color_input" value="#" maxlength="7" />' +
                        '<div class="color_input_hint">' + Lampa.Lang.translate('hex_hint') + '</div>' +
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

                        if (selectedElement.classList.contains('color_input')) {
                            // Викликаємо Lampa.Input.edit для редагування HEX-коду
                            var inputField = modalHtml.find('.color_input')[0];
                            var inputOptions = {
                                value: inputField.value || '#',
                                name: 'color_hex'
                            };
                            Lampa.Input.edit(inputOptions, function (value) {
                                if (value === '#' || !isValidHex(value)) {
                                    Lampa.Noty.show('Невірний формат HEX-коду. Використовуйте формат #FFFFFF.');
                                    Lampa.Controller.toggle('settings_component');
                                    return;
                                }
                                try {
                                    ColorPlugin.settings[paramName] = value;
                                    Lampa.Storage.set('color_plugin_' + paramName, value);
                                    applyStyles();
                                    var descr = $('.settings-param[data-name="color_plugin_' + paramName + '"] .settings-param__descr div');
                                    if (descr.length) {
                                        descr.css('background-color', value);
                                    }
                                } finally {
                                    Lampa.Modal.close();
                                    Lampa.Controller.toggle('settings_component');
                                    Lampa.Controller.enable('menu');
                                    Lampa.Settings.render();
                                }
                            });
                            return; // Чекаємо введення через Lampa.Input.edit
                        } else if (selectedElement.classList.contains('default')) {
                            color = '#353535'; // Колір за замовчуванням
                            ColorPlugin.settings[paramName] = color;
                            Lampa.Storage.set('color_plugin_' + paramName, color);
                            applyStyles();
                            var descr = $('.settings-param[data-name="color_plugin_' + paramName + '"] .settings-param__descr div');
                            if (descr.length) {
                                descr.css('background-color', color);
                            }
                            Lampa.Modal.close();
                            Lampa.Controller.toggle('settings_component');
                            Lampa.Controller.enable('menu');
                            Lampa.Settings.render();
                        } else {
                            color = selectedElement.style.backgroundColor || ColorPlugin.settings[paramName];
                            color = color.includes('rgb') ? rgbToHex(color) : color;
                            ColorPlugin.settings[paramName] = color;
                            Lampa.Storage.set('color_plugin_' + paramName, color);
                            applyStyles();
                            var descr = $('.settings-param[data-name="color_plugin_' + paramName + '"] .settings-param__descr div');
                            if (descr.length) {
                                descr.css('background-color', color);
                            }
                            Lampa.Modal.close();
                            Lampa.Controller.toggle('settings_component');
                            Lampa.Controller.enable('menu');
                            Lampa.Settings.render();
                        }
                    }
                }
            });

            // Обробники для поля вводу
            var inputField = modalHtml.find('.color_input')[0];
            if (inputField) {
                // Показ/приховування підказки
                inputField.addEventListener('focus', function () {
                    var hint = modalHtml.find('.color_input_hint')[0];
                    if (hint) {
                        hint.style.display = 'block';
                    }
                    inputField.setSelectionRange(1, 1); // Курсор після #
                });
                inputField.addEventListener('blur', function () {
                    var hint = modalHtml.find('.color_input_hint')[0];
                    if (hint) {
                        hint.style.display = 'none';
                    }
                });

                // Запобігаємо видаленню # і обмежуємо курсор
                inputField.addEventListener('keydown', function (e) {
                    var cursorPos = inputField.selectionStart;
                    var value = inputField.value;

                    // Запобігаємо видаленню # (позиція 0)
                    if ((e.keyCode === 8 || e.keyCode === 46) && cursorPos <= 1) {
                        e.preventDefault();
                    }

                    // Запобігаємо переміщенню курсора на позицію 0
                    if (e.keyCode === 37 && cursorPos <= 1) { // Стрілка вліво
                        e.preventDefault();
                        inputField.setSelectionRange(1, 1);
                    }

                    // Обмежуємо введення до 7 символів (# + 6 цифр)
                    if (value.length >= 7 && e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 13 && e.keyCode !== 27) {
                        e.preventDefault();
                    }
                });

                // Перевірка введення, щоб зберегти #
                inputField.addEventListener('input', function () {
                    if (!inputField.value.startsWith('#')) {
                        inputField.value = '#' + inputField.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6);
                    }
                });
            }
        } catch (e) {}
    }

    // Ініціалізація плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.background_color = Lampa.Storage.get('color_plugin_background_color', '#1d1f20');
        ColorPlugin.settings.text_color = Lampa.Storage.get('color_plugin_text_color', '#fff');
        ColorPlugin.settings.transparent_white = Lampa.Storage.get('color_plugin_transparent_white', 'rgba(255,255,255,0.2)');
        ColorPlugin.settings.icon_color = Lampa.Storage.get('color_plugin_icon_color', '#000');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', true);

        // Додаємо компонент до меню налаштувань
        Lampa.SettingsApi.addComponent({
            component: 'color_plugin',
            name: Lampa.Lang.translate('color_plugin'),
            icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
        });

        // Додаємо параметри до налаштувань
        if (Lampa.SettingsApi) {
            // Основний колір
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_main_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('main_color'),
                    description: '<div style="width: 2em; height: 2em; background-color: ' + ColorPlugin.settings.main_color + '; display: inline-block; border: 1px solid #ddd;"></div>'
                },
                onRender: function (item) {
                    var descr = item.find('.settings-param__descr div');
                    if (descr.length) {
                        descr.css('background-color', ColorPlugin.settings.main_color);
                    }
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
                    name: Lampa.Lang.translate('background_color'),
                    description: '<div style="width: 2em; height: 2em; background-color: ' + ColorPlugin.settings.background_color + '; display: inline-block; border: 1px solid #ddd;"></div>'
                },
                onRender: function (item) {
                    var descr = item.find('.settings-param__descr div');
                    if (descr.length) {
                        descr.css('background-color', ColorPlugin.settings.background_color);
                    }
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
                    name: Lampa.Lang.translate('text_color'),
                    description: '<div style="width: 2em; height: 2em; background-color: ' + ColorPlugin.settings.text_color + '; display: inline-block; border: 1px solid #ddd;"></div>'
                },
                onRender: function (item) {
                    var descr = item.find('.settings-param__descr div');
                    if (descr.length) {
                        descr.css('background-color', ColorPlugin.settings.text_color);
                    }
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
                    name: Lampa.Lang.translate('transparent_white'),
                    description: '<div style="width: 2em; height: 2em; background-color: ' + ColorPlugin.settings.transparent_white + '; display: inline-block; border: 1px solid #ddd;"></div>'
                },
                onRender: function (item) {
                    var descr = item.find('.settings-param__descr div');
                    if (descr.length) {
                        descr.css('background-color', ColorPlugin.settings.transparent_white);
                    }
                },
                onChange: function () {
                    openColorPicker('transparent_white', ColorPlugin.colors.transparent, 'transparent_white');
                }
            });

            // Колір іконок
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('icon_color'),
                    description: '<div style="width: 2em; height: 2em; background-color: ' + ColorPlugin.settings.icon_color + '; display: inline-block; border: 1px solid #ddd;"></div>'
                },
                onRender: function (item) {
                    var descr = item.find('.settings-param__descr div');
                    if (descr.length) {
                        descr.css('background-color', ColorPlugin.settings.icon_color);
                    }
                },
                onChange: function () {
                    openColorPicker('icon_color', ColorPlugin.colors.icon, 'icon_color');
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
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
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
