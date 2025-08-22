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
    function updatePluginTcon() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.components) {
            console.warn('ColorPlugin: Lampa.SettingsApi.components is not available.');
            var menuItem = document.querySelector('.menu__item[data-component="color_plugin"] .menu__ico');
            if (menuItem) {
                menuItem.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
                var svg = menuItem.querySelector('svg');
                if (svg) {
                    svg.style.fill = ColorPlugin.settings.icon_color;
                    console.log('ColorPlugin: Updated plugin icon color to', ColorPlugin.settings.icon_color);
                }
            }
            return;
        }
        var component = Lampa.SettingsApi.components.find(function(c) { return c.component === 'color_plugin'; });
        if (component) {
            component.icon = '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>';
            Lampa.Settings.render();
        }
    }

    // Функція для видалення вбудованих стилів SVG
    function removeInlineSvgStyles() {
        var selectors = [
            '.head .head__settings .icon svg path, .head .head__settings .icon svg rect, .head .head__settings .icon svg circle, .head .head__settings .icon svg polygon, .head .head__settings .icon svg polyline, .head .head__settings .icon svg [stroke]',
            '.head .head__action .icon svg path, .head .head__action .icon svg rect, .head .head__action .icon svg circle, .head .head__action .icon svg polygon, .head .head__action .icon svg polyline, .head .head__action .icon svg [stroke]',
            '.head .selector.open--search .icon svg path, .head .selector.open--search .icon svg rect, .head .selector.open--search .icon svg circle, .head .selector.open--search .icon svg polygon, .head .selector.open--search .icon svg polyline, .head .selector.open--search .icon svg [stroke]',
            '.settings .settings-folder__icon svg path, .settings .settings-folder__icon svg rect, .settings .settings-folder__icon svg circle, .settings .settings-folder__icon svg polygon, .settings .settings-folder__icon svg polyline, .settings .settings-folder__icon svg [stroke]',
            '.settings .settings-folder__icon[component="interface"] svg path, .settings .settings-folder__icon[component="interface"] svg rect, .settings .settings-folder__icon[component="interface"] svg circle, .settings .settings-folder__icon[component="interface"] svg polygon, .settings .settings-folder__icon[component="interface"] svg polyline, .settings .settings-folder__icon[component="interface"] svg [stroke]',
            '.settings .settings-folder__icon[component="player"] svg path, .settings .settings-folder__icon[component="player"] svg rect, .settings .settings-folder__icon[component="player"] svg circle, .settings .settings-folder__icon[component="player"] svg polygon, .settings .settings-folder__icon[component="player"] svg polyline, .settings .settings-folder__icon[component="player"] svg [stroke]',
            '.settings .settings-folder__icon[component="parser"] svg path, .settings .settings-folder__icon[component="parser"] svg rect, .settings .settings-folder__icon[component="parser"] svg circle, .settings .settings-folder__icon[component="parser"] svg polygon, .settings .settings-folder__icon[component="parser"] svg polyline, .settings .settings-folder__icon[component="parser"] svg [stroke]',
            '.settings .settings-folder__icon[component="torrserver"] svg path, .settings .settings-folder__icon[component="torrserver"] svg rect, .settings .settings-folder__icon[component="torrserver"] svg circle, .settings .settings-folder__icon[component="torrserver"] svg polygon, .settings .settings-folder__icon[component="torrserver"] svg polyline, .settings .settings-folder__icon[component="torrserver"] svg [stroke]',
            '.settings .settings-folder__icon[component="other"] svg path, .settings .settings-folder__icon[component="other"] svg rect, .settings .settings-folder__icon[component="other"] svg circle, .settings .settings-folder__icon[component="other"] svg polygon, .settings .settings-folder__icon[component="other"] svg polyline, .settings .settings-folder__icon[component="other"] svg [stroke]',
            '.menu__item[data-component="color_plugin"] .menu__ico svg path, .menu__item[data-component="color_plugin"] .menu__ico svg rect, .menu__item[data-component="color_plugin"] .menu__ico svg circle, .menu__item[data-component="color_plugin"] .menu__ico svg polygon, .menu__item[data-component="color_plugin"] .menu__ico svg polyline, .menu__item[data-component="color_plugin"] .menu__ico svg [stroke]'
        ];
        selectors.forEach(function(selector) {
            var elements = document.querySelectorAll(selector);
            elements.forEach(function(el) {
                if (el.style.fill) {
                    console.log('ColorPlugin: Removing inline fill for', selector, ':', el.style.fill);
                    el.style.fill = '';
                }
                if (el.style.stroke) {
                    console.log('ColorPlugin: Removing inline stroke for', selector, ':', el.style.stroke);
                    el.style.stroke = '';
                }
            });
        });
    }

    // Оновлена функція для застосування стилів
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
            // Стиль для іконки плагіна "Налаштування кольорів"
            '.menu__item[data-component="color_plugin"] .menu__ico, ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico, ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico, ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico, ' +
            '.menu__item[data-component="color_plugin"] .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico svg, ' +
            '.menu__item[data-component="color_plugin"] .menu__ico path[fill], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico path[fill], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico path[fill], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico path[fill], ' +
            '.menu__item[data-component="color_plugin"] .menu__ico rect[fill], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico rect[fill], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico rect[fill], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico rect[fill], ' +
            '.menu__item[data-component="color_plugin"] .menu__ico circle[fill], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico circle[fill], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico circle[fill], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico circle[fill], ' +
            '.menu__item[data-component="color_plugin"] .menu__ico polygon[fill], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico polygon[fill], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico polygon[fill], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico polygon[fill], ' +
            '.menu__item[data-component="color_plugin"] .menu__ico polyline[fill], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico polyline[fill], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico polyline[fill], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico polyline[fill] {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item[data-component="color_plugin"] .menu__ico [stroke], ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico [stroke], ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico [stroke], ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item[data-component="color_plugin"] .menu__ico img, ' +
            '.menu__item[data-component="color_plugin"].focus .menu__ico img, ' +
            '.menu__item[data-component="color_plugin"].traverse .menu__ico img, ' +
            '.menu__item[data-component="color_plugin"].hover .menu__ico img {' +
                '-webkit-filter: none !important;' +
                'filter: none !important;' +
            '}' +
            // Стиль для іконок лівого меню
            '.menu__ico, .menu__ico.focus, .menu__item.focus .menu__ico, ' +
            '.menu__item.traverse .menu__ico, .menu__item.hover .menu__ico, ' +
            '.menu__item.focus .menu__ico svg, .menu__item.traverse .menu__ico svg, .menu__item.hover .menu__ico svg, ' +
            '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], .menu__item.focus .menu__ico circle[fill], .menu__item.focus .menu__ico polygon[fill], .menu__item.focus .menu__ico polyline[fill], ' +
            '.menu__item.traverse .menu__ico path[fill], .menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], .menu__item.traverse .menu__ico polygon[fill], .menu__item.traverse .menu__ico polyline[fill], ' +
            '.menu__item.hover .menu__ico path[fill], .menu__item.hover .menu__ico rect[fill], .menu__item.hover .menu__ico circle[fill], .menu__item.hover .menu__ico polygon[fill], .menu__item.hover .menu__ico polyline[fill] {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item.hover .menu__ico [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.menu__item.focus .menu__ico img, .menu__item.traverse .menu__ico img, .menu__item.hover .menu__ico img {' +
                '-webkit-filter: none !important;' +
                'filter: none !important;' +
            '}' +
            // Стиль для іконок верхнього меню
            '.head .head__action .icon, .head .head__settings .icon, .head .selector.open--search .icon, ' +
            '.head .head__action.focus .icon, .head .head__settings.focus .icon, .head .selector.open--search.focus .icon, ' +
            '.head .head__action.traverse .icon, .head .head__settings.traverse .icon, .head .selector.open--search.traverse .icon, ' +
            '.head .head__action:hover .icon, .head .head__settings:hover .icon, .head .selector.open--search:hover .icon, ' +
            '.head .head__action .icon svg, .head .head__settings .icon svg, .head .selector.open--search .icon svg, ' +
            '.head .head__action.focus .icon svg, .head .head__settings.focus .icon svg, .head .selector.open--search.focus .icon svg, ' +
            '.head .head__action.traverse .icon svg, .head .head__settings.traverse .icon svg, .head .selector.open--search.traverse .icon svg, ' +
            '.head .head__action:hover .icon svg, .head .head__settings:hover .icon svg, .head .selector.open--search:hover .icon svg, ' +
            '.head .head__action .icon path[fill], .head .head__action.focus .icon path[fill], .head .head__action.traverse .icon path[fill], .head .head__action:hover .icon path[fill], ' +
            '.head .head__settings .icon path[fill], .head .head__settings.focus .icon path[fill], .head .head__settings.traverse .icon path[fill], .head .head__settings:hover .icon path[fill], ' +
            '.head .selector.open--search .icon path[fill], .head .selector.open--search.focus .icon path[fill], .head .selector.open--search.traverse .icon path[fill], .head .selector.open--search:hover .icon path[fill], ' +
            '.head .head__action .icon rect[fill], .head .head__action.focus .icon rect[fill], .head .head__action.traverse .icon rect[fill], .head .head__action:hover .icon rect[fill], ' +
            '.head .head__settings .icon rect[fill], .head .head__settings.focus .icon rect[fill], .head .head__settings.traverse .icon rect[fill], .head .head__settings:hover .icon rect[fill], ' +
            '.head .selector.open--search .icon rect[fill], .head .selector.open--search.focus .icon rect[fill], .head .selector.open--search.traverse .icon rect[fill], .head .selector.open--search:hover .icon rect[fill], ' +
            '.head .head__action .icon circle[fill], .head .head__action.focus .icon circle[fill], .head .head__action.traverse .icon circle[fill], .head .head__action:hover .icon circle[fill], ' +
            '.head .head__settings .icon circle[fill], .head .head__settings.focus .icon circle[fill], .head .head__settings.traverse .icon circle[fill], .head .head__settings:hover .icon circle[fill], ' +
            '.head .selector.open--search .icon circle[fill], .head .selector.open--search.focus .icon circle[fill], .head .selector.open--search.traverse .icon circle[fill], .head .selector.open--search:hover .icon circle[fill], ' +
            '.head .head__action .icon polygon[fill], .head .head__action.focus .icon polygon[fill], .head .head__action.traverse .icon polygon[fill], .head .head__action:hover .icon polygon[fill], ' +
            '.head .head__settings .icon polygon[fill], .head .head__settings.focus .icon polygon[fill], .head .head__settings.traverse .icon polygon[fill], .head .head__settings:hover .icon polygon[fill], ' +
            '.head .selector.open--search .icon polygon[fill], .head .selector.open--search.focus .icon polygon[fill], .head .selector.open--search.traverse .icon polygon[fill], .head .selector.open--search:hover .icon polygon[fill], ' +
            '.head .head__action .icon polyline[fill], .head .head__action.focus .icon polyline[fill], .head .head__action.traverse .icon polyline[fill], .head .head__action:hover .icon polyline[fill], ' +
            '.head .head__settings .icon polyline[fill], .head .head__settings.focus .icon polyline[fill], .head .head__settings.traverse .icon polyline[fill], .head .head__settings:hover .icon polyline[fill], ' +
            '.head .selector.open--search .icon polyline[fill], .head .selector.open--search.focus .icon polyline[fill], .head .selector.open--search.traverse .icon polyline[fill], .head .selector.open--search:hover .icon polyline[fill] {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.head .head__action .icon [stroke], .head .head__action.focus .icon [stroke], .head .head__action.traverse .icon [stroke], .head .head__action:hover .icon [stroke], ' +
            '.head .head__settings .icon [stroke], .head .head__settings.focus .icon [stroke], .head .head__settings.traverse .icon [stroke], .head .head__settings:hover .icon [stroke], ' +
            '.head .selector.open--search .icon [stroke], .head .selector.open--search.focus .icon [stroke], .head .selector.open--search.traverse .icon [stroke], .head .selector.open--search:hover .icon [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.head .head__action .icon img, .head .head__action.focus .icon img, .head .head__action.traverse .icon img, .head .head__action:hover .icon img, ' +
            '.head .head__settings .icon img, .head .head__settings.focus .icon img, .head .head__settings.traverse .icon img, .head .head__settings:hover .icon img, ' +
            '.head .selector.open--search .icon img, .head .selector.open--search.focus .icon img, .head .selector.open--search.traverse .icon img, .head .selector.open--search:hover .icon img {' +
                '-webkit-filter: none !important;' +
                'filter: none !important;' +
            '}' +
            // Стиль для іконок меню налаштувань (усі компоненти)
            '.settings .settings-folder__icon, .settings .settings-folder__icon.focus, .settings .settings-folder__icon.traverse, .settings .settings-folder__icon:hover, ' +
            '.settings .settings-folder__icon[component="interface"], .settings .settings-folder__icon[component="interface"].focus, .settings .settings-folder__icon[component="interface"].traverse, .settings .settings-folder__icon[component="interface"]:hover, ' +
            '.settings .settings-folder__icon[component="player"], .settings .settings-folder__icon[component="player"].focus, .settings .settings-folder__icon[component="player"].traverse, .settings .settings-folder__icon[component="player"]:hover, ' +
            '.settings .settings-folder__icon[component="parser"], .settings .settings-folder__icon[component="parser"].focus, .settings .settings-folder__icon[component="parser"].traverse, .settings .settings-folder__icon[component="parser"]:hover, ' +
            '.settings .settings-folder__icon[component="torrserver"], .settings .settings-folder__icon[component="torrserver"].focus, .settings .settings-folder__icon[component="torrserver"].traverse, .settings .settings-folder__icon[component="torrserver"]:hover, ' +
            '.settings .settings-folder__icon[component="other"], .settings .settings-folder__icon[component="other"].focus, .settings .settings-folder__icon[component="other"].traverse, .settings .settings-folder__icon[component="other"]:hover, ' +
            '.settings .settings-folder__icon svg, .settings .settings-folder__icon.focus svg, .settings .settings-folder__icon.traverse svg, .settings .settings-folder__icon:hover svg, ' +
            '.settings .settings-folder__icon[component="interface"] svg, .settings .settings-folder__icon[component="interface"].focus svg, .settings .settings-folder__icon[component="interface"].traverse svg, .settings .settings-folder__icon[component="interface"]:hover svg, ' +
            '.settings .settings-folder__icon[component="player"] svg, .settings .settings-folder__icon[component="player"].focus svg, .settings .settings-folder__icon[component="player"].traverse svg, .settings .settings-folder__icon[component="player"]:hover svg, ' +
            '.settings .settings-folder__icon[component="parser"] svg, .settings .settings-folder__icon[component="parser"].focus svg, .settings .settings-folder__icon[component="parser"].traverse svg, .settings .settings-folder__icon[component="parser"]:hover svg, ' +
            '.settings .settings-folder__icon[component="torrserver"] svg, .settings .settings-folder__icon[component="torrserver"].focus svg, .settings .settings-folder__icon[component="torrserver"].traverse svg, .settings .settings-folder__icon[component="torrserver"]:hover svg, ' +
            '.settings .settings-folder__icon[component="other"] svg, .settings .settings-folder__icon[component="other"].focus svg, .settings .settings-folder__icon[component="other"].traverse svg, .settings .settings-folder__icon[component="other"]:hover svg, ' +
            '.settings .settings-folder__icon path[fill], .settings .settings-folder__icon.focus path[fill], .settings .settings-folder__icon.traverse path[fill], .settings .settings-folder__icon:hover path[fill], ' +
            '.settings .settings-folder__icon[component="interface"] path[fill], .settings .settings-folder__icon[component="interface"].focus path[fill], .settings .settings-folder__icon[component="interface"].traverse path[fill], .settings .settings-folder__icon[component="interface"]:hover path[fill], ' +
            '.settings .settings-folder__icon[component="player"] path[fill], .settings .settings-folder__icon[component="player"].focus path[fill], .settings .settings-folder__icon[component="player"].traverse path[fill], .settings .settings-folder__icon[component="player"]:hover path[fill], ' +
            '.settings .settings-folder__icon[component="parser"] path[fill], .settings .settings-folder__icon[component="parser"].focus path[fill], .settings .settings-folder__icon[component="parser"].traverse path[fill], .settings .settings-folder__icon[component="parser"]:hover path[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] path[fill], .settings .settings-folder__icon[component="torrserver"].focus path[fill], .settings .settings-folder__icon[component="torrserver"].traverse path[fill], .settings .settings-folder__icon[component="torrserver"]:hover path[fill], ' +
            '.settings .settings-folder__icon[component="other"] path[fill], .settings .settings-folder__icon[component="other"].focus path[fill], .settings .settings-folder__icon[component="other"].traverse path[fill], .settings .settings-folder__icon[component="other"]:hover path[fill], ' +
            '.settings .settings-folder__icon rect[fill], .settings .settings-folder__icon.focus rect[fill], .settings .settings-folder__icon.traverse rect[fill], .settings .settings-folder__icon:hover rect[fill], ' +
            '.settings .settings-folder__icon[component="interface"] rect[fill], .settings .settings-folder__icon[component="interface"].focus rect[fill], .settings .settings-folder__icon[component="interface"].traverse rect[fill], .settings .settings-folder__icon[component="interface"]:hover rect[fill], ' +
            '.settings .settings-folder__icon[component="player"] rect[fill], .settings .settings-folder__icon[component="player"].focus rect[fill], .settings .settings-folder__icon[component="player"].traverse rect[fill], .settings .settings-folder__icon[component="player"]:hover rect[fill], ' +
            '.settings .settings-folder__icon[component="parser"] rect[fill], .settings .settings-folder__icon[component="parser"].focus rect[fill], .settings .settings-folder__icon[component="parser"].traverse rect[fill], .settings .settings-folder__icon[component="parser"]:hover rect[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] rect[fill], .settings .settings-folder__icon[component="torrserver"].focus rect[fill], .settings .settings-folder__icon[component="torrserver"].traverse rect[fill], .settings .settings-folder__icon[component="torrserver"]:hover rect[fill], ' +
            '.settings .settings-folder__icon[component="other"] rect[fill], .settings .settings-folder__icon[component="other"].focus rect[fill], .settings .settings-folder__icon[component="other"].traverse rect[fill], .settings .settings-folder__icon[component="other"]:hover rect[fill], ' +
            '.settings .settings-folder__icon circle[fill], .settings .settings-folder__icon.focus circle[fill], .settings .settings-folder__icon.traverse circle[fill], .settings .settings-folder__icon:hover circle[fill], ' +
            '.settings .settings-folder__icon[component="interface"] circle[fill], .settings .settings-folder__icon[component="interface"].focus circle[fill], .settings .settings-folder__icon[component="interface"].traverse circle[fill], .settings .settings-folder__icon[component="interface"]:hover circle[fill], ' +
            '.settings .settings-folder__icon[component="player"] circle[fill], .settings .settings-folder__icon[component="player"].focus circle[fill], .settings .settings-folder__icon[component="player"].traverse circle[fill], .settings .settings-folder__icon[component="player"]:hover circle[fill], ' +
            '.settings .settings-folder__icon[component="parser"] circle[fill], .settings .settings-folder__icon[component="parser"].focus circle[fill], .settings .settings-folder__icon[component="parser"].traverse circle[fill], .settings .settings-folder__icon[component="parser"]:hover circle[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] circle[fill], .settings .settings-folder__icon[component="torrserver"].focus circle[fill], .settings .settings-folder__icon[component="torrserver"].traverse circle[fill], .settings .settings-folder__icon[component="torrserver"]:hover circle[fill], ' +
            '.settings .settings-folder__icon[component="other"] circle[fill], .settings .settings-folder__icon[component="other"].focus circle[fill], .settings .settings-folder__icon[component="other"].traverse circle[fill], .settings .settings-folder__icon[component="other"]:hover circle[fill], ' +
            '.settings .settings-folder__icon polygon[fill], .settings .settings-folder__icon.focus polygon[fill], .settings .settings-folder__icon.traverse polygon[fill], .settings .settings-folder__icon:hover polygon[fill], ' +
            '.settings .settings-folder__icon[component="interface"] polygon[fill], .settings .settings-folder__icon[component="interface"].focus polygon[fill], .settings .settings-folder__icon[component="interface"].traverse polygon[fill], .settings .settings-folder__icon[component="interface"]:hover polygon[fill], ' +
            '.settings .settings-folder__icon[component="player"] polygon[fill], .settings .settings-folder__icon[component="player"].focus polygon[fill], .settings .settings-folder__icon[component="player"].traverse polygon[fill], .settings .settings-folder__icon[component="player"]:hover polygon[fill], ' +
            '.settings .settings-folder__icon[component="parser"] polygon[fill], .settings .settings-folder__icon[component="parser"].focus polygon[fill], .settings .settings-folder__icon[component="parser"].traverse polygon[fill], .settings .settings-folder__icon[component="parser"]:hover polygon[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] polygon[fill], .settings .settings-folder__icon[component="torrserver"].focus polygon[fill], .settings .settings-folder__icon[component="torrserver"].traverse polygon[fill], .settings .settings-folder__icon[component="torrserver"]:hover polygon[fill], ' +
            '.settings .settings-folder__icon[component="other"] polygon[fill], .settings .settings-folder__icon[component="other"].focus polygon[fill], .settings .settings-folder__icon[component="other"].traverse polygon[fill], .settings .settings-folder__icon[component="other"]:hover polygon[fill], ' +
            '.settings .settings-folder__icon polyline[fill], .settings .settings-folder__icon.focus polyline[fill], .settings .settings-folder__icon.traverse polyline[fill], .settings .settings-folder__icon:hover polyline[fill], ' +
            '.settings .settings-folder__icon[component="interface"] polyline[fill], .settings .settings-folder__icon[component="interface"].focus polyline[fill], .settings .settings-folder__icon[component="interface"].traverse polyline[fill], .settings .settings-folder__icon[component="interface"]:hover polyline[fill], ' +
            '.settings .settings-folder__icon[component="player"] polyline[fill], .settings .settings-folder__icon[component="player"].focus polyline[fill], .settings .settings-folder__icon[component="player"].traverse polyline[fill], .settings .settings-folder__icon[component="player"]:hover polyline[fill], ' +
            '.settings .settings-folder__icon[component="parser"] polyline[fill], .settings .settings-folder__icon[component="parser"].focus polyline[fill], .settings .settings-folder__icon[component="parser"].traverse polyline[fill], .settings .settings-folder__icon[component="parser"]:hover polyline[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] polyline[fill], .settings .settings-folder__icon[component="torrserver"].focus polyline[fill], .settings .settings-folder__icon[component="torrserver"].traverse polyline[fill], .settings .settings-folder__icon[component="torrserver"]:hover polyline[fill], ' +
            '.settings .settings-folder__icon[component="other"] polyline[fill], .settings .settings-folder__icon[component="other"].focus polyline[fill], .settings .settings-folder__icon[component="other"].traverse polyline[fill], .settings .settings-folder__icon[component="other"]:hover polyline[fill] {' +
                'color: ' + ColorPlugin.settings.icon_color + ' !important;' +
                'fill: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.settings .settings-folder__icon [stroke], .settings .settings-folder__icon.focus [stroke], .settings .settings-folder__icon.traverse [stroke], .settings .settings-folder__icon:hover [stroke], ' +
            '.settings .settings-folder__icon[component="interface"] [stroke], .settings .settings-folder__icon[component="interface"].focus [stroke], .settings .settings-folder__icon[component="interface"].traverse [stroke], .settings .settings-folder__icon[component="interface"]:hover [stroke], ' +
            '.settings .settings-folder__icon[component="player"] [stroke], .settings .settings-folder__icon[component="player"].focus [stroke], .settings .settings-folder__icon[component="player"].traverse [stroke], .settings .settings-folder__icon[component="player"]:hover [stroke], ' +
            '.settings .settings-folder__icon[component="parser"] [stroke], .settings .settings-folder__icon[component="parser"].focus [stroke], .settings .settings-folder__icon[component="parser"].traverse [stroke], .settings .settings-folder__icon[component="parser"]:hover [stroke], ' +
            '.settings .settings-folder__icon[component="torrserver"] [stroke], .settings .settings-folder__icon[component="torrserver"].focus [stroke], .settings .settings-folder__icon[component="torrserver"].traverse [stroke], .settings .settings-folder__icon[component="torrserver"]:hover [stroke], ' +
            '.settings .settings-folder__icon[component="other"] [stroke], .settings .settings-folder__icon[component="other"].focus [stroke], .settings .settings-folder__icon[component="other"].traverse [stroke], .settings .settings-folder__icon[component="other"]:hover [stroke] {' +
                'stroke: ' + ColorPlugin.settings.icon_color + ' !important;' +
            '}' +
            '.settings .settings-folder__icon img, .settings .settings-folder__icon.focus img, .settings .settings-folder__icon.traverse img, .settings .settings-folder__icon:hover img, ' +
            '.settings .settings-folder__icon[component="interface"] img, .settings .settings-folder__icon[component="interface"].focus img, .settings .settings-folder__icon[component="interface"].traverse img, .settings .settings-folder__icon[component="interface"]:hover img, ' +
            '.settings .settings-folder__icon[component="player"] img, .settings .settings-folder__icon[component="player"].focus img, .settings .settings-folder__icon[component="player"].traverse img, .settings .settings-folder__icon[component="player"]:hover img, ' +
            '.settings .settings-folder__icon[component="parser"] img, .settings .settings-folder__icon[component="parser"].focus img, .settings .settings-folder__icon[component="parser"].traverse img, .settings .settings-folder__icon[component="parser"]:hover img, ' +
            '.settings .settings-folder__icon[component="torrserver"] img, .settings .settings-folder__icon[component="torrserver"].focus img, .settings .settings-folder__icon[component="torrserver"].traverse img, .settings .settings-folder__icon[component="torrserver"]:hover img, ' +
            '.settings .settings-folder__icon[component="other"] img, .settings .settings-folder__icon[component="other"].focus img, .settings .settings-folder__icon[component="other"].traverse img, .settings .settings-folder__icon[component="other"]:hover img {' +
                '-webkit-filter: none !important;' +
                'filter: none !important;' +
            '}' +
            // Решта стилів
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
        updatePluginTcon();
        console.log('ColorPlugin: Applied styles, icon_color: ' + ColorPlugin.settings.icon_color + ', main_color: ' + ColorPlugin.settings.main_color);
        // Дебаг-логування для перевірки іконок
        console.log('ColorPlugin: Applying icon_color to plugin icon: .menu__item[data-component="color_plugin"] .menu__ico');
        console.log('ColorPlugin: Applying icon_color to left menu: .menu__ico, .menu__ico.focus, .menu__item.focus .menu__ico, .menu__item.traverse .menu__ico, .menu__item.hover .menu__ico');
        console.log('ColorPlugin: Applying icon_color to top menu: .head__action .icon, .head__settings .icon, .selector.open--search .icon');
        console.log('ColorPlugin: Applying icon_color to settings menu: .settings-folder__icon, including components [interface, player, parser, torrserver, other]');
        var pluginIcon = document.querySelectorAll('.menu__item[data-component="color_plugin"] .menu__ico svg path[fill], .menu__item[data-component="color_plugin"].focus .menu__ico svg path[fill]');
        console.log('ColorPlugin: Found ' + pluginIcon.length + ' SVG elements in plugin icon');
        pluginIcon.forEach(function(icon) {
            console.log('ColorPlugin: Plugin icon SVG element style - fill: ' + icon.style.fill);
        });
        var topMenuIcons = document.querySelectorAll(
            '.head .head__settings.focus .icon svg path[fill], .head .head__settings.traverse .icon svg path[fill], .head .head__settings:hover .icon svg path[fill], ' +
            '.head .head__action.focus .icon svg path[fill], .head .head__action.traverse .icon svg path[fill], .head .head__action:hover .icon svg path[fill], ' +
            '.head .selector.open--search.focus .icon svg path[fill], .head .selector.open--search.traverse .icon svg path[fill], .head .selector.open--search:hover .icon svg path[fill]'
        );
        console.log('ColorPlugin: Found ' + topMenuIcons.length + ' SVG elements in top menu icons');
        topMenuIcons.forEach(function(icon) {
            console.log('ColorPlugin: Top menu SVG element style - fill: ' + icon.style.fill);
        });
        var settingsIcons = document.querySelectorAll(
            '.settings .settings-folder__icon svg path[fill], .settings .settings-folder__icon.focus svg path[fill], .settings .settings-folder__icon.traverse svg path[fill], .settings .settings-folder__icon:hover svg path[fill], ' +
            '.settings .settings-folder__icon[component="interface"] svg path[fill], .settings .settings-folder__icon[component="interface"].focus svg path[fill], .settings .settings-folder__icon[component="interface"].traverse svg path[fill], .settings .settings-folder__icon[component="interface"]:hover svg path[fill], ' +
            '.settings .settings-folder__icon[component="player"] svg path[fill], .settings .settings-folder__icon[component="player"].focus svg path[fill], .settings .settings-folder__icon[component="player"].traverse svg path[fill], .settings .settings-folder__icon[component="player"]:hover svg path[fill], ' +
            '.settings .settings-folder__icon[component="parser"] svg path[fill], .settings .settings-folder__icon[component="parser"].focus svg path[fill], .settings .settings-folder__icon[component="parser"].traverse svg path[fill], .settings .settings-folder__icon[component="parser"]:hover svg path[fill], ' +
            '.settings .settings-folder__icon[component="torrserver"] svg path[fill], .settings .settings-folder__icon[component="torrserver"].focus svg path[fill], .settings .settings-folder__icon[component="torrserver"].traverse svg path[fill], .settings .settings-folder__icon[component="torrserver"]:hover svg path[fill], ' +
            '.settings .settings-folder__icon[component="other"] svg path[fill], .settings .settings-folder__icon[component="other"].focus svg path[fill], .settings .settings-folder__icon[component="other"].traverse svg path[fill], .settings .settings-folder__icon[component="other"]:hover svg path[fill]'
        );
        console.log('ColorPlugin: Found ' + settingsIcons.length + ' SVG elements in settings menu icons');
        settingsIcons.forEach(function(icon) {
            console.log('ColorPlugin: Settings menu SVG element style - fill: ' + icon.style.fill);
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
                icon: '<svg width="24px" height="24px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.003a7 7 0 0 0-7 7v.43c.09 1.51 1.91 1.79 3 .7a1.87 1.87 0 0 1 2.64 2.64c-1.1 1.16-.79 3.07.8 3.2h.6a7 7 0 1 0 0-14l-.04.03zm0 13h-.52a.58.58 0 0 1-.36-.14.56.56 0 0 1-.15-.3 1.24 1.24 0 0 1 .35-1.08 2.87 2.87 0 0 0 0-4 2.87 2.87 0 0 0-4.06 0 1 1 0 0 1-.9.34.41.41 0 0 1-.22-.12.42.42 0 0 1-.1-.29v-.37a6 6 0 1 1 6 6l-.04-.04zM9 3.997a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 7.007a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-7-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
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
