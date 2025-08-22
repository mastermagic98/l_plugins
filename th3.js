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

    // Функція для конвертації HEX у RGB для фільтрів
    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16) / 255;
        var g = parseInt(hex.slice(3, 5), 16) / 255;
        var b = parseInt(hex.slice(5, 7), 16) / 255;
        return { r: r, g: g, b: b };
    }

    // Функція для створення CSS-фільтра для зміни кольору
    function createColorFilter(hex) {
        var rgb = hexToRgb(hex);
        var filter = 'brightness(0) saturate(100%) invert(1) sepia(100%) saturate(10000%) hue-rotate(' +
                     (Math.atan2(rgb.g - rgb.b, rgb.r - rgb.g) * 180 / Math.PI) + 'deg) ' +
                     'brightness(' + (Math.sqrt(rgb.r * rgb.r + rgb.g * rgb.g + rgb.b * rgb.b) * 100) + '%)';
        return filter;
    }

    // Функція для обробки зовнішніх SVG-іконок
    function updateExternalSvgIcons() {
        var icons = document.querySelectorAll('.settings-param__ico img[src*=".svg"], .settings-param__icon img[src*=".svg"], .settings__icon img[src*=".svg"], .settings .settings-param svg, .settings .settings-param__content svg');
        icons.forEach(function (icon) {
            if (icon.tagName.toLowerCase() === 'img' && icon.src.endsWith('.svg')) {
                // Для <img src="icon.svg"> застосовуємо фільтр
                icon.style.filter = createColorFilter(ColorPlugin.settings.icon_color);
            } else if (icon.tagName.toLowerCase() === 'svg') {
                // Для вбудованих SVG змінюємо атрибути
                var elements = icon.querySelectorAll('[fill="white"], [fill="#ffffff"], [stroke="white"]');
                elements.forEach(function (el) {
                    if (el.getAttribute('fill') === 'white' || el.getAttribute('fill') === '#ffffff') {
                        el.setAttribute('fill', ColorPlugin.settings.icon_color);
                    }
                    if (el.getAttribute('stroke') === 'white') {
                        el.setAttribute('stroke', ColorPlugin.settings.icon_color);
                    }
                });
            }
        });
    }

    // Функція для оновлення іконки плагіну
    function updatePluginIcon() {
        var iconSvg = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color + '" stroke="' + ColorPlugin.settings.icon_color + '" stroke-width="1"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';

        // Спробуємо оновити через SettingsApi
        if (Lampa.SettingsApi && Lampa.SettingsApi.components) {
            var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
            if (component) {
                component.icon = iconSvg;
                Lampa.Settings.render();
                return;
            }
        }

        // Резервний варіант: вставляємо SVG напряму
        var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
        if (menuItem) {
            menuItem.innerHTML = iconSvg;
            // Застосовуємо стилі напряму для резервного варіанту
            menuItem.style.color = ColorPlugin.settings.icon_color;
            menuItem.style.fill = ColorPlugin.settings.icon_color;
            menuItem.style.stroke = ColorPlugin.settings.icon_color;
            var svg = menuItem.querySelector('svg');
            if (svg) {
                svg.style.strokeWidth = '1px';
                svg.style.fill = ColorPlugin.settings.icon_color;
                svg.style.stroke = ColorPlugin.settings.icon_color;
            }
        } else {
            console.warn('ColorPlugin: .menu__item[data-component="color_plugin"] .menu__ico not found.');
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
            // Логотип
            '.head__logo-icon img {' +
                'filter: ' + createColorFilter(ColorPlugin.settings.icon_color) + ' !important;' +
            '}' +
            // Іконки меню ліворуч, заголовка і налаштувань праворуч
            '.menu__ico, .menu__ico.focus, .menu__ico:hover, .menu__ico.traverse, ' +
            '.head__action, .head__action.focus, .head__action:hover, ' +
            '.settings-param__ico, .settings-param__ico.focus, .settings-param__ico:hover, ' +
            '.settings-param__icon, .settings-param__icon.focus, .settings-param__icon:hover, ' +
            '.settings__icon, .settings__icon.focus, .settings__icon:hover, ' +
            '.settings .settings-param svg, .settings .settings-param.focus svg, .settings .settings-param:hover svg, ' +
            '.settings .settings-param__content svg, .settings .settings-param__content.focus svg, .settings .settings-param__content:hover svg, ' +
            '.settings-param__ico svg, .settings-param__icon svg, .settings__icon svg {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Фільтр для <img src="icon.svg"> у меню налаштувань
            '.settings-param__ico img[src*=".svg"], .settings-param__icon img[src*=".svg"], .settings__icon img[src*=".svg"], ' +
            '.settings .settings-param img[src*=".svg"], .settings .settings-param__content img[src*=".svg"] {' +
                'filter: ' + createColorFilter(ColorPlugin.settings.icon_color) + ' !important;' +
            '}' +
            // Виправлення товщини і кольору іконки плагіну
            '.menu__item[data-component="color_plugin"] .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"]:hover .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico svg {' +
                'stroke-width: 1px !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Перекриваємо color для контейнерів іконок (без .settings)
            '.settings-param, .settings-param.focus, .settings-param:hover, ' +
            '.settings-param__content, .settings-param__content.focus, .settings-param__content:hover, ' +
            '.settings-param__ico, .settings-param__ico.focus, .settings-param__ico:hover, ' +
            '.settings-param__icon, .settings-param__icon.focus, .settings-param__icon:hover, ' +
            '.settings__icon, .settings__icon.focus, .settings__icon:hover {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Запобігаємо додаванню контуру для іконок із fill у menu__ico
            '.menu__ico path[fill], .menu__ico.focus path[fill], .menu__ico:hover path[fill], .menu__ico.traverse path[fill] {' +
                'stroke: none !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Перекриваємо стилі з app.css для SVG-елементів у menu__ico (fill)
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], ' +
            '.menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], ' +
            '.menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], ' +
            '.menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], ' +
            '.menu__item:hover .menu__ico circle[fill] {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'stroke: none !important;' +
            '}' +
            // Перекриваємо стилі з app.css для SVG-елементів у menu__ico (stroke)
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], ' +
            '.menu__item:hover .menu__ico [stroke], .menu__ico [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Перекриваємо білий колір для іконок у меню налаштувань (fill)
            '.settings .settings-param.focus .settings-param__ico path[fill], .settings .settings-param.focus .settings-param__ico rect[fill], ' +
            '.settings .settings-param.focus .settings-param__ico circle[fill], .settings .settings-param:hover .settings-param__ico path[fill], ' +
            '.settings .settings-param:hover .settings-param__ico rect[fill], .settings .settings-param:hover .settings-param__ico circle[fill], ' +
            '.settings-param__ico [fill], .settings-param__icon [fill], .settings__icon [fill], ' +
            '.settings .settings-param svg path[fill], .settings .settings-param svg rect[fill], .settings .settings-param svg circle[fill], ' +
            '.settings .settings-param__content svg path[fill], .settings .settings-param__content svg rect[fill], .settings .settings-param__content svg circle[fill], ' +
            '.settings .settings-param svg[fill], .settings .settings-param__content svg[fill], ' +
            '.settings-param__ico svg path[fill], .settings-param__ico svg rect[fill], .settings-param__ico svg circle[fill], ' +
            '.settings-param__icon svg path[fill], .settings-param__icon svg rect[fill], .settings-param__icon svg circle[fill], ' +
            '.settings__icon svg path[fill], .settings__icon svg rect[fill], .settings__icon svg circle[fill] {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Перекриваємо білий колір для іконок у меню налаштувань (stroke)
            '.settings svg [stroke], ' +
            '.settings .settings-param.focus .settings-param__ico [stroke], .settings .settings-param:hover .settings-param__ico [stroke], ' +
            '.settings-param__ico [stroke], .settings-param__icon [stroke], .settings__icon [stroke], ' +
            '.settings .settings-param svg [stroke], .settings .settings-param__content svg [stroke], ' +
            '.settings-param__ico svg [stroke], .settings-param__icon svg [stroke], .settings__icon svg [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Переконаємося, що масштаб іконок не змінюється
            '.menu__ico, .menu__item.focus .menu__ico, .menu__item:hover .menu__ico, .menu__item.traverse .menu__ico {' +
                'transform: none !important;' +
                'width: 24px !important;' +
                'height: 24px !important;' +
            '}' +
            // Фіксований розмір для іконок у меню налаштувань
            '.settings-param__ico, .settings-param__icon, .settings__icon, ' +
            '.settings .settings-param svg, .settings .settings-param__content svg, ' +
            '.settings-param__ico svg, .settings-param__icon svg, .settings__icon svg {' +
                'width: 31.1833px !important;' +
                'height: 31.1833px !important;' +
            '}' +
            '.console__tab.focus, .menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.impulse-button.focus, .simple-button.focus, .head__action.focus, .head__action:hover, ' +
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
            '.selectbox-item.focus, .selectbox-item:hover {' +
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
            '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {' +
                'border-color: ' + ColorPlugin.settings.main_color + ' !important;' +
            '}' +
            '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, ' +
            '.card-episode.focus .full-episode::after, .register.focus::after, ' +
            '.season-episode.focus::after, .full-episode.focus::after, ' +
            '.full-review-add.focus::after, .card.focus .card__view::after, ' +
            '.card:hover .card__view::after, .extensions__item.focus:after, ' +
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

        // Оновлюємо іконку плагіну
        updatePluginIcon();
        // Оновлюємо зовнішні SVG-іконки
        updateExternalSvgIcons();
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
        var colorContent = groupedColors.map(function (group) {
            var groupContent = group.map(function (color) {
                return createColorHtml(color, colors[color]);
            }).join('');
            return '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 11.25px; justify-items: center; padding: 10px;">' + groupContent + '</div>';
        }).join('');

        // Блок для введення HEX-коду у стилі color_square
        var hexValue = Lampa.Storage.get('color_plugin_custom_hex', '') || '#000000';
        var inputHtml = '<div style="padding: 10px; display: flex; justify-content: center;">' +
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
                            Lampa.Noty.show(Lampa.Lang.translate('hex_input_hint')); // Показуємо підказку
                            Lampa.Modal.close(); // Закриваємо модальне вікно перед викликом клавіатури
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
                            color = {
                                main_color: '#353535',
                                background_color: '#1d1f20',
                                text_color: '#fff',
                                transparent_white: 'rgba(255,255,255,0.2)',
                                icon_color: '#000'
                            }[paramName];
                        } else {
                            color = selectedElement.style.backgroundColor || ColorPlugin.settings[paramName];
                            color = color.includes('rgb') ? rgbToHex(color) : color;
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
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'color_plugin',
                name: Lampa.Lang.translate('color_plugin'),
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="' + ColorPlugin.settings.icon_color + '" stroke="' + ColorPlugin.settings.icon_color + '" stroke-width="1"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
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

            // Колір іконок
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: {
                    name: 'color_plugin_icon_color',
                    type: 'button'
                },
                field: {
                    name: Lampa.Lang.translate('icon_color')
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
    function startPlugin() {
        if (window.appready && Lampa.SettingsApi) {
            initPlugin();
            updatePluginIcon();
            updateExternalSvgIcons();
        } else {
            Lampa.Listener.follow('app', function (event) {
                if (event.type === 'ready' && Lampa.SettingsApi) {
                    initPlugin();
                    updatePluginIcon();
                    updateExternalSvgIcons();
                }
            });
        }
    }

    // Оновлюємо стилі, іконку плагіну та зовнішні SVG при відкритті налаштувань
    Lampa.Listener.follow('settings_component', function (event) {
        if (event.type === 'open') {
            applyStyles();
            updatePluginIcon();
            updateExternalSvgIcons();
            Lampa.Settings.render();
        }
    });

    // Запускаємо плагін
    startPlugin();
})();
