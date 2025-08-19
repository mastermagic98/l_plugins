(function() {
    'use strict';

    // Об'єкт для зберігання налаштувань
    var ColorPlugin = {
        settings: {
            theme: 'custom_color',
            main_color: '#e40c2b',
            background_color: '#1d1f20',
            text_color: '#fff',
            transparent_white: 'rgba(255,255,255,0.2)',
            icon_color: '#000',
            enabled: true
        }
    };

    // Функція для застосування стилів
    function applyStyles() {
        if (!ColorPlugin.settings.enabled) {
            // Видаляємо стилі, якщо плагін відключений
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            return;
        }

        // Створюємо або оновлюємо CSS стилі
        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
        }

        // Формуємо CSS на основі налаштувань
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
            '}'
        );
    }

    // Функція для оновлення видимості параметрів
    function updateColorVisibility(theme) {
        var colorParams = ['main_color', 'background_color', 'text_color', 'transparent_white', 'icon_color'];
        for (var i = 0; i < colorParams.length; i++) {
            var param = Lampa.SettingsApi.getParameter('color_plugin_' + colorParams[i]);
            if (param) {
                param.visible(theme === 'custom_color');
            }
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.theme = Lampa.Storage.get('color_plugin_theme', 'custom_color');
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#e40c2b');
        ColorPlugin.settings.background_color = Lampa.Storage.get('color_plugin_background_color', '#1d1f20');
        ColorPlugin.settings.text_color = Lampa.Storage.get('color_plugin_text_color', '#fff');
        ColorPlugin.settings.transparent_white = Lampa.Storage.get('color_plugin_transparent_white', 'rgba(255,255,255,0.2)');
        ColorPlugin.settings.icon_color = Lampa.Storage.get('color_plugin_icon_color', '#000');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', true);

        // Додаємо параметри до налаштувань
        if (Lampa.SettingsApi) {
            // Параметр вибору теми
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_theme',
                    type: 'select',
                    values: {
                        custom_color: 'Користувацька',
                        default: 'LAMPA'
                    },
                    default: 'custom_color'
                },
                field: {
                    name: Lampa.Lang.translate('Тема'),
                    description: 'Виберіть тему для інтерфейсу'
                },
                onChange: function(value) {
                    ColorPlugin.settings.theme = value;
                    Lampa.Storage.set('color_plugin_theme', value);
                    Lampa.Settings.update();
                    applyStyles();
                    updateColorVisibility(value);
                }
            });

            // Параметр основного кольору
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_main_color',
                    type: 'input',
                    default: '#e40c2b'
                },
                field: {
                    name: Lampa.Lang.translate('Основний колір'),
                    description: 'Виберіть основний колір (наприклад, #e40c2b)'
                },
                onChange: function(value) {
                    ColorPlugin.settings.main_color = value;
                    Lampa.Storage.set('color_plugin_main_color', value);
                    Lampa.Settings.update();
                    if (ColorPlugin.settings.theme === 'custom_color') {
                        applyStyles();
                    }
                }
            });

            // Параметр кольору фону
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_background_color',
                    type: 'input',
                    default: '#1d1f20'
                },
                field: {
                    name: Lampa.Lang.translate('Колір фону'),
                    description: 'Виберіть колір фону (наприклад, #1d1f20)'
                },
                onChange: function(value) {
                    ColorPlugin.settings.background_color = value;
                    Lampa.Storage.set('color_plugin_background_color', value);
                    Lampa.Settings.update();
                    if (ColorPlugin.settings.theme === 'custom_color') {
                        applyStyles();
                    }
                }
            });

            // Параметр кольору тексту
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_text_color',
                    type: 'input',
                    default: '#fff'
                },
                field: {
                    name: Lampa.Lang.translate('Колір тексту'),
                    description: 'Виберіть колір тексту (наприклад, #fff)'
                },
                onChange: function(value) {
                    ColorPlugin.settings.text_color = value;
                    Lampa.Storage.set('color_plugin_text_color', value);
                    Lampa.Settings.update();
                    if (ColorPlugin.settings.theme === 'custom_color') {
                        applyStyles();
                    }
                }
            });

            // Параметр прозорого фону
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_transparent_white',
                    type: 'input',
                    default: 'rgba(255,255,255,0.2)'
                },
                field: {
                    name: Lampa.Lang.translate('Прозорий фон'),
                    description: 'Виберіть колір прозорого фону (наприклад, rgba(255,255,255,0.2))'
                },
                onChange: function(value) {
                    ColorPlugin.settings.transparent_white = value;
                    Lampa.Storage.set('color_plugin_transparent_white', value);
                    Lampa.Settings.update();
                    if (ColorPlugin.settings.theme === 'custom_color') {
                        applyStyles();
                    }
                }
            });

            // Параметр кольору іконок
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color',
                    type: 'input',
                    default: '#000'
                },
                field: {
                    name: Lampa.Lang.translate('Колір іконок'),
                    description: 'Виберіть колір іконок (наприклад, #000)'
                },
                onChange: function(value) {
                    ColorPlugin.settings.icon_color = value;
                    Lampa.Storage.set('color_plugin_icon_color', value);
                    Lampa.Settings.update();
                    if (ColorPlugin.settings.theme === 'custom_color') {
                        applyStyles();
                    }
                }
            });

            // Параметр увімкнення/вимкнення плагіна
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_enabled',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('Увімкнути плагін'),
                    description: 'Увімкнути або вимкнути плагін зміни кольорів'
                },
                onChange: function(value) {
                    ColorPlugin.settings.enabled = value;
                    Lampa.Storage.set('color_plugin_enabled', value);
                    Lampa.Settings.update();
                    applyStyles();
                }
            });

            // Ініціалізація видимості параметрів при відкритті налаштувань
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name === 'color_plugin') {
                    updateColorVisibility(ColorPlugin.settings.theme);
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
        }
    }

    // Запускаємо ініціалізацію плагіна
    initPlugin();

    // Додаємо плагін до Lampa
    Lampa.Plugin.add({
        name: 'ColorPlugin',
        version: '1.0.0',
        init: initPlugin
    });
})();
