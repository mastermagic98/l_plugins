(function () {
    'use strict';

    // Додаємо переклади
    Lampa.Lang.add({
        color_plugin: { ru: 'Настройка цветов', en: 'Color settings', uk: 'Налаштування кольорів' },
        main_color: { ru: 'Основной цвет', en: 'Main color', uk: 'Основний колір' },
        background_color: { ru: 'Цвет фона', en: 'Background color', uk: 'Колір фону' },
        transparent_white: { ru: 'Прозрачный фон', en: 'Transparent background', uk: 'Прозорий фон' },
        icon_color: { ru: 'Цвет иконок', en: 'Icons color', uk: 'Колір іконок' },
        color_plugin_enabled: { ru: 'Включить плагин', en: 'Enable plugin', uk: 'Увімкнути плагін' },
        default_color: { ru: 'По умолчанию', en: 'Default', uk: 'За замовчуванням' },
        custom_hex_input: { ru: 'HEX-код цвета', en: 'HEX color code', uk: 'HEX-код кольору' },
        hex_input_hint: { ru: 'Используйте формат #FFFFFF, например #123524', en: 'Use the format #FFFFFF, for example #123524', uk: 'Використовуйте формат #FFFFFF, наприклад #123524' }
    });

    // Об'єкт для зберігання налаштувань
    var ColorPlugin = {
        settings: {
            main_color: '#353535',
            background_color: '#1d1f20',
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

    // Функція для видалення вбудованих стилів і атрибутів SVG
    function removeInlineSvgStyles() {
        console.log('ColorPlugin: Removing inline SVG styles and attributes');
        var selectors = [
            '.head__action .icon svg path, .head__action .icon svg rect, .head__action .icon svg circle, .head__action .icon svg polygon, .head__action .icon svg polyline, .head__action .icon svg [stroke]',
            '.head__action.lamp .icon svg path, .head__action.lamp .icon svg rect, .head__action.lamp .icon svg circle, .head__action.lamp .icon svg polygon, .head__action.lamp .icon svg polyline, .head__action.lamp .icon svg [stroke]',
            '.head__settings .icon svg path, .head__settings .icon svg rect, .head__settings .icon svg circle, .head__settings .icon svg polygon, .head__settings .icon svg polyline, .head__settings .icon svg [stroke]',
            '.selector.open--search .icon svg path, .selector.open--search .icon svg rect, .selector.open--search .icon svg circle, .selector.open--search .icon svg polygon, .selector.open--search .icon svg polyline, .selector.open--search .icon svg [stroke]',
            '.settings-folder__icon svg path, .settings-folder__icon svg rect, .settings-folder__icon svg circle, .settings-folder__icon svg polygon, .settings-folder__icon svg polyline, .settings-folder__icon svg [stroke]',
            '.menu__item[data-component="color_plugin"] .menu__ico svg path, .menu__item[data-component="color_plugin"] .menu__ico svg rect, .menu__item[data-component="color_plugin"] .menu__ico svg circle, .menu__item[data-component="color_plugin"] .menu__ico svg polygon, .menu__item[data-component="color_plugin"] .menu__ico svg polyline, .menu__item[data-component="color_plugin"] .menu__ico svg [stroke]',
            '.head__action i, .head__action.lamp i, .head__settings i, .selector.open--search i, .head__icon'
        ];
        selectors.forEach(function(selector) {
            var elements = document.querySelectorAll(selector);
            elements.forEach(function(el) {
                if (el.style.fill && el.style.fill !== 'none') {
                    console.log('ColorPlugin: Removing inline fill for', selector, ':', el.style.fill);
                    el.style.fill = '';
                }
                if (el.style.stroke && el.style.stroke !== 'none') {
                    console.log('ColorPlugin: Removing inline stroke for', selector, ':', el.style.stroke);
                    el.style.stroke = '';
                }
                if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
                    console.log('ColorPlugin: Removing fill attribute for', selector, ':', el.getAttribute('fill'));
                    el.setAttribute('fill', ColorPlugin.settings.icon_color);
                }
                if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                    console.log('ColorPlugin: Removing stroke attribute for', selector, ':', el.getAttribute('stroke'));
                    el.setAttribute('stroke', ColorPlugin.settings.icon_color);
                }
                if (el.tagName.toLowerCase() === 'i' || el.classList.contains('icon') || el.classList.contains('head__icon')) {
                    console.log('ColorPlugin: Setting color for icon element', selector, ':', el.style.color);
                    el.style.color = ColorPlugin.settings.icon_color;
                }
            });
        });
    }

    // Функція для оновлення іконки плагіна
    function updatePluginIcon() {
        console.log('ColorPlugin: Updating plugin icon with color:', ColorPlugin.settings.icon_color);
        var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
        if (menuItem) {
            menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="' + ColorPlugin.settings.icon_color + '" fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            var svg = menuItem.querySelector('svg');
            if (svg) {
                svg.querySelectorAll('path, rect, circle, polygon, polyline').forEach(function(el) {
                    if (!el.hasAttribute('fill') || el.getAttribute('fill') !== 'none') {
                        el.setAttribute('fill', ColorPlugin.settings.icon_color);
                        el.style.fill = ColorPlugin.settings.icon_color;
                    }
                    if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                        el.setAttribute('stroke', ColorPlugin.settings.icon_color);
                        el.style.stroke = ColorPlugin.settings.icon_color;
                    }
                });
            }
        }
        if (Lampa.SettingsApi && Lampa.SettingsApi.components) {
            var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
            if (component) {
                component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="' + ColorPlugin.settings.icon_color + '" fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
                Lampa.Settings.render();
            }
        }
    }

    // Функція для застосування стилів
    function applyStyles() {
        console.log('ColorPlugin: Applying styles, enabled:', ColorPlugin.settings.enabled);
        if (!ColorPlugin.settings.enabled) {
            var oldStyle = document.getElementById('color-plugin-styles');
            if (oldStyle) oldStyle.remove();
            console.log('ColorPlugin: Plugin disabled, styles removed');
            return;
        }

        var style = document.getElementById('color-plugin-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'color-plugin-styles';
            document.head.appendChild(style);
            console.log('ColorPlugin: Created new style element');
        }

        style.innerHTML = (
            ':root {' +
                '--main-color: ' + ColorPlugin.settings.main_color + ';' +
                '--background-color: ' + ColorPlugin.settings.background_color + ';' +
                '--transparent-white: ' + ColorPlugin.settings.transparent_white + ';' +
            '}' +
            // Ліве меню: іконки та текст
            '.menu__ico path[fill]:not([fill="none"]), .menu__ico.focus path[fill]:not([fill="none"]), ' +
            '.menu__item.focus .menu__ico path[fill]:not([fill="none"]), .menu__item.traverse .menu__ico path[fill]:not([fill="none"]), .menu__item.hover .menu__ico path[fill]:not([fill="none"]), ' +
            '.menu__ico rect[fill]:not([fill="none"]), .menu__ico.focus rect[fill]:not([fill="none"]), .menu__item.focus .menu__ico rect[fill]:not([fill="none"]), .menu__item.traverse .menu__ico rect[fill]:not([fill="none"]), .menu__item.hover .menu__ico rect[fill]:not([fill="none"]), ' +
            '.menu__ico circle[fill]:not([fill="none"]), .menu__ico.focus circle[fill]:not([fill="none"]), .menu__item.focus .menu__ico circle[fill]:not([fill="none"]), .menu__item.traverse .menu__ico circle[fill]:not([fill="none"]), .menu__item.hover .menu__ico circle[fill]:not([fill="none"]), ' +
            '.menu__ico polygon[fill]:not([fill="none"]), .menu__ico.focus polygon[fill]:not([fill="none"]), .menu__item.focus .menu__ico polygon[fill]:not([fill="none"]), .menu__item.traverse .menu__ico polygon[fill]:not([fill="none"]), .menu__item.hover .menu__ico polygon[fill]:not([fill="none"]), ' +
            '.menu__ico polyline[fill]:not([fill="none"]), .menu__ico.focus polyline[fill]:not([fill="none"]), .menu__item.focus .menu__ico polyline[fill]:not([fill="none"]), .menu__item.traverse .menu__ico polyline[fill]:not([fill="none"]), .menu__item.hover .menu__ico polyline[fill]:not([fill="none"]) {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__ico [stroke]:not([stroke="none"]), .menu__ico.focus [stroke]:not([stroke="none"]), .menu__item.focus .menu__ico [stroke]:not([stroke="none"]), .menu__item.traverse .menu__ico [stroke]:not([stroke="none"]), .menu__item.hover .menu__ico [stroke]:not([stroke="none"]) {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__ico, .menu__ico.focus, .menu__item.focus .menu__ico, .menu__item.traverse .menu__ico, .menu__item.hover .menu__ico {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item .menu__title, .menu__item.focus .menu__title, .menu__item.traverse .menu__title, .menu__item.hover .menu__title {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Іконка плагіна
            '.menu__item[data-component="color_plugin"] .menu__ico path[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico path[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico path[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico path[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"] .menu__ico rect[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico rect[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico rect[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico rect[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"] .menu__ico circle[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico circle[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico circle[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico circle[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"] .menu__ico polygon[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico polygon[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico polygon[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico polygon[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"] .menu__ico polyline[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico polyline[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico polyline[fill]:not([fill="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico polyline[fill]:not([fill="none"]) {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item[data-component="color_plugin"] .menu__ico [stroke]:not([stroke="none"]), ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico [stroke]:not([stroke="none"]), ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico [stroke]:not([stroke="none"]), ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico [stroke]:not([stroke="none"]) {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Верхнє меню: іконки
            '.head .head__action .icon, .head .head__action.focus .icon, .head .head__action.traverse .icon, .head .head__action:hover .icon, ' +
            '.head .head__action.lamp .icon, .head .head__action.lamp.focus .icon, .head .head__action.lamp.traverse .icon, .head .head__action.lamp:hover .icon, ' +
            '.head .head__settings .icon, .head .head__settings.focus .icon, .head .head__settings.traverse .icon, .head .head__settings:hover .icon, ' +
            '.head .selector.open--search .icon, .head .selector.open--search.focus .icon, .head .selector.open--search.traverse .icon, .head .selector.open--search:hover .icon, ' +
            '.head .head__icon, .head .head__icon.focus, .head .head__icon.traverse, .head .head__icon:hover, ' +
            '.head .head__action i, .head .head__action.lamp i, .head .head__settings i, .head .selector.open--search i {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'filter: none !important;' +
                '-webkit-filter: none !important;' +
            '}' +
            '.head .head__action .icon path[fill]:not([fill="none"]), .head .head__action.focus .icon path[fill]:not([fill="none"]), .head .head__action.traverse .icon path[fill]:not([fill="none"]), .head .head__action:hover .icon path[fill]:not([fill="none"]), ' +
            '.head .head__action.lamp .icon path[fill]:not([fill="none"]), .head .head__action.lamp.focus .icon path[fill]:not([fill="none"]), .head .head__action.lamp.traverse .icon path[fill]:not([fill="none"]), .head .head__action.lamp:hover .icon path[fill]:not([fill="none"]), ' +
            '.head .head__settings .icon path[fill]:not([fill="none"]), .head .head__settings.focus .icon path[fill]:not([fill="none"]), .head .head__settings.traverse .icon path[fill]:not([fill="none"]), .head .head__settings:hover .icon path[fill]:not([fill="none"]), ' +
            '.head .selector.open--search .icon path[fill]:not([fill="none"]), .head .selector.open--search.focus .icon path[fill]:not([fill="none"]), .head .selector.open--search.traverse .icon path[fill]:not([fill="none"]), .head .selector.open--search:hover .icon path[fill]:not([fill="none"]), ' +
            '.head .head__action .icon rect[fill]:not([fill="none"]), .head .head__action.focus .icon rect[fill]:not([fill="none"]), .head .head__action.traverse .icon rect[fill]:not([fill="none"]), .head .head__action:hover .icon rect[fill]:not([fill="none"]), ' +
            '.head .head__action.lamp .icon rect[fill]:not([fill="none"]), .head .head__action.lamp.focus .icon rect[fill]:not([fill="none"]), .head .head__action.lamp.traverse .icon rect[fill]:not([fill="none"]), .head .head__action.lamp:hover .icon rect[fill]:not([fill="none"]), ' +
            '.head .head__settings .icon rect[fill]:not([fill="none"]), .head .head__settings.focus .icon rect[fill]:not([fill="none"]), .head .head__settings.traverse .icon rect[fill]:not([fill="none"]), .head .head__settings:hover .icon rect[fill]:not([fill="none"]), ' +
            '.head .selector.open--search .icon rect[fill]:not([fill="none"]), .head .selector.open--search.focus .icon rect[fill]:not([fill="none"]), .head .selector.open--search.traverse .icon rect[fill]:not([fill="none"]), .head .selector.open--search:hover .icon rect[fill]:not([fill="none"]), ' +
            '.head .head__action .icon circle[fill]:not([fill="none"]), .head .head__action.focus .icon circle[fill]:not([fill="none"]), .head .head__action.traverse .icon circle[fill]:not([fill="none"]), .head .head__action:hover .icon circle[fill]:not([fill="none"]), ' +
            '.head .head__action.lamp .icon circle[fill]:not([fill="none"]), .head .head__action.lamp.focus .icon circle[fill]:not([fill="none"]), .head .head__action.lamp.traverse .icon circle[fill]:not([fill="none"]), .head .head__action.lamp:hover .icon circle[fill]:not([fill="none"]), ' +
            '.head .head__settings .icon circle[fill]:not([fill="none"]), .head .head__settings.focus .icon circle[fill]:not([fill="none"]), .head .head__settings.traverse .icon circle[fill]:not([fill="none"]), .head .head__settings:hover .icon circle[fill]:not([fill="none"]), ' +
            '.head .selector.open--search .icon circle[fill]:not([fill="none"]), .head .selector.open--search.focus .icon circle[fill]:not([fill="none"]), .head .selector.open--search.traverse .icon circle[fill]:not([fill="none"]), .head .selector.open--search:hover .icon circle[fill]:not([fill="none"]), ' +
            '.head .head__action .icon polygon[fill]:not([fill="none"]), .head .head__action.focus .icon polygon[fill]:not([fill="none"]), .head .head__action.traverse .icon polygon[fill]:not([fill="none"]), .head .head__action:hover .icon polygon[fill]:not([fill="none"]), ' +
            '.head .head__action.lamp .icon polygon[fill]:not([fill="none"]), .head .head__action.lamp.focus .icon polygon[fill]:not([fill="none"]), .head .head__action.lamp.traverse .icon polygon[fill]:not([fill="none"]), .head .head__action.lamp:hover .icon polygon[fill]:not([fill="none"]), ' +
            '.head .head__settings .icon polygon[fill]:not([fill="none"]), .head .head__settings.focus .icon polygon[fill]:not([fill="none"]), .head .head__settings.traverse .icon polygon[fill]:not([fill="none"]), .head .head__settings:hover .icon polygon[fill]:not([fill="none"]), ' +
            '.head .selector.open--search .icon polygon[fill]:not([fill="none"]), .head .selector.open--search.focus .icon polygon[fill]:not([fill="none"]), .head .selector.open--search.traverse .icon polygon[fill]:not([fill="none"]), .head .selector.open--search:hover .icon polygon[fill]:not([fill="none"]), ' +
            '.head .head__action .icon polyline[fill]:not([fill="none"]), .head .head__action.focus .icon polyline[fill]:not([fill="none"]), .head .head__action.traverse .icon polyline[fill]:not([fill="none"]), .head .head__action:hover .icon polyline[fill]:not([fill="none"]), ' +
            '.head .head__action.lamp .icon polyline[fill]:not([fill="none"]), .head .head__action.lamp.focus .icon polyline[fill]:not([fill="none"]), .head .head__action.lamp.traverse .icon polyline[fill]:not([fill="none"]), .head .head__action.lamp:hover .icon polyline[fill]:not([fill="none"]), ' +
            '.head .head__settings .icon polyline[fill]:not([fill="none"]), .head .head__settings.focus .icon polyline[fill]:not([fill="none"]), .head .head__settings.traverse .icon polyline[fill]:not([fill="none"]), .head .head__settings:hover .icon polyline[fill]:not([fill="none"]), ' +
            '.head .selector.open--search .icon polyline[fill]:not([fill="none"]), .head .selector.open--search.focus .icon polyline[fill]:not([fill="none"]), .head .selector.open--search.traverse .icon polyline[fill]:not([fill="none"]), .head .selector.open--search:hover .icon polyline[fill]:not([fill="none"]) {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.head .head__action .icon [stroke]:not([stroke="none"]), .head .head__action.focus .icon [stroke]:not([stroke="none"]), .head .head__action.traverse .icon [stroke]:not([stroke="none"]), .head .head__action:hover .icon [stroke]:not([stroke="none"]), ' +
            '.head .head__action.lamp .icon [stroke]:not([stroke="none"]), .head .head__action.lamp.focus .icon [stroke]:not([stroke="none"]), .head .head__action.lamp.traverse .icon [stroke]:not([stroke="none"]), .head .head__action.lamp:hover .icon [stroke]:not([stroke="none"]), ' +
            '.head .head__settings .icon [stroke]:not([stroke="none"]), .head .head__settings.focus .icon [stroke]:not([stroke="none"]), .head .head__settings.traverse .icon [stroke]:not([stroke="none"]), .head .head__settings:hover .icon [stroke]:not([stroke="none"]), ' +
            '.head .selector.open--search .icon [stroke]:not([stroke="none"]), .head .selector.open--search.focus .icon [stroke]:not([stroke="none"]), .head .selector.open--search.traverse .icon [stroke]:not([stroke="none"]), .head .selector.open--search:hover .icon [stroke]:not([stroke="none"]) {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Меню налаштувань
            '.settings .settings-folder__icon path[fill]:not([fill="none"]), .settings .settings-folder__icon.focus path[fill]:not([fill="none"]), .settings .settings-folder__icon.traverse path[fill]:not([fill="none"]), .settings .settings-folder__icon:hover path[fill]:not([fill="none"]), ' +
            '.settings .settings-folder__icon rect[fill]:not([fill="none"]), .settings .settings-folder__icon.focus rect[fill]:not([fill="none"]), .settings .settings-folder__icon.traverse rect[fill]:not([fill="none"]), .settings .settings-folder__icon:hover rect[fill]:not([fill="none"]), ' +
            '.settings .settings-folder__icon circle[fill]:not([fill="none"]), .settings .settings-folder__icon.focus circle[fill]:not([fill="none"]), .settings .settings-folder__icon.traverse circle[fill]:not([fill="none"]), .settings .settings-folder__icon:hover circle[fill]:not([fill="none"]), ' +
            '.settings .settings-folder__icon polygon[fill]:not([fill="none"]), .settings .settings-folder__icon.focus polygon[fill]:not([fill="none"]), .settings .settings-folder__icon.traverse polygon[fill]:not([fill="none"]), .settings .settings-folder__icon:hover polygon[fill]:not([fill="none"]), ' +
            '.settings .settings-folder__icon polyline[fill]:not([fill="none"]), .settings .settings-folder__icon.focus polyline[fill]:not([fill="none"]), .settings .settings-folder__icon.traverse polyline[fill]:not([fill="none"]), .settings .settings-folder__icon:hover polyline[fill]:not([fill="none"]) {' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.settings .settings-folder__icon [stroke]:not([stroke="none"]), .settings .settings-folder__icon.focus [stroke]:not([stroke="none"]), .settings .settings-folder__icon.traverse [stroke]:not([stroke="none"]), .settings .settings-folder__icon:hover [stroke]:not([stroke="none"]) {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            // Решта стилів
            '.console__tab.focus, .menu__item.focus, .menu__item.traverse, .menu__item.hover, ' +
            '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
            '.simple-button.focus, .head__action.focus, .head__action.hover, ' +
            '.player-panel .button.focus, .search-source.active {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.navigation-tabs__button.focus, .time-line > div, .player-panel__position, ' +
            '.player-panel__position > div:after {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
                'background-color: ' + ColorPlugin.settings.main_color + ' !important;' +
            '}' +
            '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
            '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
            '.torrent-serial__progress, .full-review-add.focus, .full-review.focus, ' +
            '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
            '.selectbox-item.focus, .selectbox-item.hover {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
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
                'background-color: ' + ColorPlugin.settings.icon_color + ';' +
                'color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.broadcast__scan > div, .broadcast__device.focus {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.card:hover .card__img, .card.focus .card__img {' +
                'border-color: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.noty {' +
                'background: ' + ColorPlugin.settings.main_color + ';' +
            '}' +
            '.radio-player.focus {' +
                'background-color: ' + ColorPlugin.settings.main_color + ';' +
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

        // Видаляємо вбудовані стилі SVG
        removeInlineSvgStyles();
        // Оновлюємо іконку плагіна
        updatePluginIcon();
        // Дебаг-логування
        console.log('ColorPlugin: Applied styles, icon_color: ' + ColorPlugin.settings.icon_color + ', main_color: ' + ColorPlugin.settings.main_color);
        var topIcons = document.querySelectorAll(
            '.head__action .icon, .head__action.lamp .icon, .head__settings .icon, .selector.open--search .icon, .head__icon, ' +
            '.head__action i, .head__action.lamp i, .head__settings i, .selector.open--search i'
        );
        console.log('ColorPlugin: Found ' + topIcons.length + ' elements in top menu icons');
        topIcons.forEach(function(icon) {
            console.log('ColorPlugin: Top menu icon - tag:', icon.tagName, 'class:', icon.className, 'style.color:', icon.style.color || 'none', 'style.fill:', icon.style.fill || 'none', 'fill attribute:', icon.getAttribute('fill') || 'none');
        });
        var leftMenuIcons = document.querySelectorAll(
            '.menu__ico svg, .menu__ico path, .menu__ico rect, .menu__ico circle, .menu__ico polygon, .menu__ico polyline'
        );
        console.log('ColorPlugin: Found ' + leftMenuIcons.length + ' elements in left menu icons');
        leftMenuIcons.forEach(function(icon) {
            console.log('ColorPlugin: Left menu icon - tag:', icon.tagName, 'class:', icon.className, 'style.fill:', icon.style.fill || 'none', 'fill attribute:', icon.getAttribute('fill') || 'none');
        });
        var leftMenuText = document.querySelectorAll('.menu__item .menu__title');
        console.log('ColorPlugin: Found ' + leftMenuText.length + ' text elements in left menu');
        leftMenuText.forEach(function(text) {
            console.log('ColorPlugin: Left menu text - style.color:', text.style.color || 'none');
        });
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
        var groupedColors = chunkArray(colorKeys, 5);
        var colorContent = groupedColors.map(function (group) {
            var groupContent = group.map(function (color) {
                return createColorHtml(color, colors[color]);
            }).join('');
            return '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 11.25px; justify-items: center; padding: 10px;">' + groupContent + '</div>';
        }).join('');

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
                            color = {
                                main_color: '#353535',
                                background_color: '#1d1f20',
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

    // Ініціалізація плагіна
    function initPlugin() {
        console.log('ColorPlugin: Initializing plugin');
        // Завантажуємо збережені налаштування
        ColorPlugin.settings.main_color = Lampa.Storage.get('color_plugin_main_color', '#353535');
        ColorPlugin.settings.background_color = Lampa.Storage.get('color_plugin_background_color', '#1d1f20');
        ColorPlugin.settings.transparent_white = Lampa.Storage.get('color_plugin_transparent_white', 'rgba(255,255,255,0.2)');
        ColorPlugin.settings.icon_color = Lampa.Storage.get('color_plugin_icon_color', '#000');
        ColorPlugin.settings.enabled = Lampa.Storage.get('color_plugin_enabled', true);
        console.log('ColorPlugin: Loaded settings:', ColorPlugin.settings);

        // Додаємо компонент до меню налаштувань
        if (Lampa.SettingsApi) {
            console.log('ColorPlugin: Adding component to SettingsApi');
            Lampa.SettingsApi.addComponent({
                component: 'color_plugin',
                name: Lampa.Lang.translate('color_plugin'),
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="' + ColorPlugin.settings.icon_color + '" fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
            });

            // Основний колір
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: { name: 'color_plugin_main_color', type: 'button' },
                field: { name: Lampa.Lang.translate('main_color') },
                onChange: function () { openColorPicker('main_color', ColorPlugin.colors.main, 'main_color'); }
            });

            // Колір фону
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: { name: 'color_plugin_background_color', type: 'button' },
                field: { name: Lampa.Lang.translate('background_color') },
                onChange: function () { openColorPicker('background_color', ColorPlugin.colors.background, 'background_color'); }
            });

            // Прозорий фон
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: { name: 'color_plugin_transparent_white', type: 'button' },
                field: { name: Lampa.Lang.translate('transparent_white') },
                onChange: function () { openColorPicker('transparent_white', ColorPlugin.colors.transparent, 'transparent_white'); }
            });

            // Колір іконок
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: { name: 'color_plugin_icon_color', type: 'button' },
                field: { name: Lampa.Lang.translate('icon_color') },
                onChange: function () { openColorPicker('icon_color', ColorPlugin.colors.icon, 'icon_color'); }
            });

            // Увімкнення/вимкнення плагіна
            Lampa.SettingsApi.addParam({
                component: 'color_plugin',
                param: { name: 'color_plugin_enabled', type: 'trigger', default: true },
                field: { name: Lampa.Lang.translate('color_plugin_enabled'), description: 'Увімкнути або вимкнути плагін зміни кольорів' },
                onChange: function (value) {
                    ColorPlugin.settings.enabled = value === 'true';
                    Lampa.Storage.set('color_plugin_enabled', ColorPlugin.settings.enabled);
                    console.log('ColorPlugin: Plugin enabled changed to:', ColorPlugin.settings.enabled);
                    applyStyles();
                    Lampa.Settings.render();
                }
            });

            // Застосовуємо стилі при ініціалізації
            applyStyles();
        } else {
            console.warn('ColorPlugin: Lampa.SettingsApi is not available');
            applyStyles();
        }

        // Додаємо MutationObserver для динамічного оновлення
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length || mutation.removedNodes.length) {
                    console.log('ColorPlugin: DOM changed, reapplying styles');
                    removeInlineSvgStyles();
                    applyStyles();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запускаємо плагін після готовності програми
    console.log('ColorPlugin: Waiting for app ready');
    if (window.appready && Lampa.SettingsApi) {
        console.log('ColorPlugin: App is ready, initializing');
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            console.log('ColorPlugin: App event:', event.type);
            if (event.type === 'ready') {
                initPlugin();
            }
        });
    }

    // Оновлюємо стилі при відкритті налаштувань
    Lampa.Listener.follow('settings_component', function (event) {
        console.log('ColorPlugin: Settings component event:', event.type);
        if (event.type === 'open') {
            applyStyles();
            Lampa.Settings.render();
        }
    });
})();
