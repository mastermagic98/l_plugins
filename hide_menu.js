(function() {  
    'use strict';  
  
    var plugin_name = 'hide_menu_items';  
    var settings = {  
        // За замовчуванням всі пункти НЕ приховані  
        hide_sport: false,  
        hide_timeline: false,      // Стрічка  
        hide_torrents: false,      // Торренти  
        hide_schedule: false,      // Розклад  
        hide_subscriptions: false, // Підписки  
        hide_bookmarks: false,     // Вибране  
        hide_anime: false,         // Аніме  
        hide_catalog: false,       // Каталог  
        hide_persons: false,       // Особи  
        hide_info: false,          // Інформація  
        hide_console: false,       // Консоль  
        hide_settings: false,      // Налаштування (тільки в лівому меню)  
        hide_filter: false         // Фільтр  
    };  
  
    function loadSettings() {  
        var saved = Lampa.Storage.get(plugin_name, '{}');  
        try {  
            var parsed = JSON.parse(saved);  
            Object.assign(settings, parsed);  
        } catch(e) {}  
    }  
  
    function saveSettings() {  
        Lampa.Storage.set(plugin_name, JSON.stringify(settings));  
    }  
  
    function hideMenuItems() {  
        var menuSelectors = {  
            'sport': {  
                enabled: settings.hide_sport,  
                selectors: [  
                    '.menu__item[data-action="sport"]',  
                    '.sidebar__item[data-action="sport"]',  
                    '[data-action="sport"]:not(.head__action)',  
                    '.navigation__item[data-action="sport"]'  
                ]  
            },  
            'timeline': {  
                enabled: settings.hide_timeline,  
                selectors: [  
                    '.menu__item[data-action="timeline"]',  
                    '.sidebar__item[data-action="timeline"]',  
                    '[data-action="timeline"]:not(.head__action)',  
                    '.navigation__item[data-action="timeline"]'  
                ]  
            },  
            'torrents': {  
                enabled: settings.hide_torrents,  
                selectors: [  
                    '.menu__item[data-action="torrents"]',  
                    '.sidebar__item[data-action="torrents"]',  
                    '[data-action="torrents"]:not(.head__action)',  
                    '.navigation__item[data-action="torrents"]'  
                ]  
            },  
            'schedule': {  
                enabled: settings.hide_schedule,  
                selectors: [  
                    '.menu__item[data-action="schedule"]',  
                    '.sidebar__item[data-action="schedule"]',  
                    '[data-action="schedule"]:not(.head__action)',  
                    '.navigation__item[data-action="schedule"]'  
                ]  
            },  
            'subscriptions': {  
                enabled: settings.hide_subscriptions,  
                selectors: [  
                    '.menu__item[data-action="subscriptions"]',  
                    '.sidebar__item[data-action="subscriptions"]',  
                    '[data-action="subscriptions"]:not(.head__action)',  
                    '.navigation__item[data-action="subscriptions"]'  
                ]  
            },  
            'bookmarks': {  
                enabled: settings.hide_bookmarks,  
                selectors: [  
                    '.menu__item[data-action="bookmarks"]',  
                    '.sidebar__item[data-action="bookmarks"]',  
                    '[data-action="bookmarks"]:not(.head__action)',  
                    '.navigation__item[data-action="bookmarks"]'  
                ]  
            },  
            'anime': {  
                enabled: settings.hide_anime,  
                selectors: [  
                    '.menu__item[data-action="anime"]',  
                    '.sidebar__item[data-action="anime"]',  
                    '[data-action="anime"]:not(.head__action)',  
                    '.navigation__item[data-action="anime"]'  
                ]  
            },  
            'catalog': {  
                enabled: settings.hide_catalog,  
                selectors: [  
                    '.menu__item[data-action="catalog"]',  
                    '.sidebar__item[data-action="catalog"]',  
                    '[data-action="catalog"]:not(.head__action)',  
                    '.navigation__item[data-action="catalog"]'  
                ]  
            },  
            'persons': {  
                enabled: settings.hide_persons,  
                selectors: [  
                    '.menu__item[data-action="persons"]',  
                    '.sidebar__item[data-action="persons"]',  
                    '[data-action="persons"]:not(.head__action)',  
                    '.navigation__item[data-action="persons"]'  
                ]  
            },  
            'info': {  
                enabled: settings.hide_info,  
                selectors: [  
                    '.menu__item[data-action="info"]',  
                    '.sidebar__item[data-action="info"]',  
                    '[data-action="info"]:not(.head__action)',  
                    '.navigation__item[data-action="info"]',  
                    '.menu__item[data-component="info"]',  
                    '.sidebar__item[data-component="info"]'  
                ]  
            },  
            'console': {  
                enabled: settings.hide_console,  
                selectors: [  
                    '.menu__item[data-action="console"]',  
                    '.sidebar__item[data-action="console"]',  
                    '[data-action="console"]:not(.head__action)',  
                    '.navigation__item[data-action="console"]'  
                ]  
            },  
            'settings': {  
                enabled: settings.hide_settings,  
                selectors: [  
                    // Приховуємо тільки в лівому меню, НЕ в шапці  
                    '.menu__item[data-action="settings"]',  
                    '.sidebar__item[data-action="settings"]',  
                    '.navigation__item[data-action="settings"]'  
                    // НЕ включаємо .head__action або інші селектори шапки  
                ]  
            },  
            'filter': {  
                enabled: settings.hide_filter,  
                selectors: [  
                    '.menu__item[data-action="filter"]',  
                    '.sidebar__item[data-action="filter"]',  
                    '[data-action="filter"]:not(.head__action)',  
                    '.navigation__item[data-action="filter"]'  
                ]  
            }  
        };  
  
        Object.keys(menuSelectors).forEach(function(key) {  
            var config = menuSelectors[key];  
            if (config.enabled) {  
                config.selectors.forEach(function(selector) {  
                    try {  
                        var elements = document.querySelectorAll(selector);  
                        elements.forEach(function(element) {  
                            // Перевіряємо чи елемент існує та чи він видимий  
                            if (element && element.offsetParent !== null) {  
                                element.style.display = 'none';  
                            }  
                        });  
                    } catch(e) {  
                        // Ігноруємо помилки селекторів  
                        console.warn('Selector error for ' + key + ':', e);  
                    }  
                });  
            }  
        });  
    }  
  
    function createSettingsInterface() {  
        // Створюємо окрему секцію для налаштувань плагіна  
        Lampa.SettingsApi.addComponent({  
            component: 'hide_menu_plugin',  
            name: 'Приховування меню',  
            icon: '<svg viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/></svg>'  
        });  
  
        var settingsItems = [  
            { key: 'hide_sport', title: 'Приховати Спорт' },  
            { key: 'hide_timeline', title: 'Приховати Стрічка' },  
            { key: 'hide_torrents', title: 'Приховати Торренти' },  
            { key: 'hide_schedule', title: 'Приховати Розклад' },  
            { key: 'hide_subscriptions', title: 'Приховати Підписки' },  
            { key: 'hide_bookmarks', title: 'Приховати Вибране' },  
            { key: 'hide_anime', title: 'Приховати Аніме' },  
            { key: 'hide_catalog', title: 'Приховати Каталог' },  
            { key: 'hide_persons', title: 'Приховати Особи' },  
            { key: 'hide_info', title: 'Приховати Інформація' },  
            { key: 'hide_console', title: 'Приховати Консоль' },  
            { key: 'hide_settings', title: 'Приховати Налаштування (тільки в меню)' },  
            { key: 'hide_filter', title: 'Приховати Фільтр' }  
        ];  
  
        settingsItems.forEach(function(item) {  
            Lampa.SettingsApi.addParam({  
                component: 'hide_menu_plugin',  
                param: {  
                    name: plugin_name + '_' + item.key,  
                    type: 'trigger',  
                    default: settings[item.key]  
                },  
                field: {  
                    name: item.title,  
                    description: 'Увімкнути/вимкнути приховування пункту меню'  
                },  
                onChange: function(value) {  
                    settings[item.key] = value;  
                    saveSettings();  
                    setTimeout(hideMenuItems, 100);  
                }  
            });  
        });  
  
        // Додаємо кнопку для показу всіх пунктів  
        Lampa.SettingsApi.addParam({  
            component: 'hide_menu_plugin',  
            param: {  
                name: plugin_name + '_show_all',  
                type: 'button'  
            },  
            field: {  
                name: 'Показати всі пункти меню',  
                description: 'Вимкнути приховування всіх пунктів'  
            },  
            onChange: function() {  
                Object.keys(settings).forEach(function(key) {  
                    settings[key] = false;  
                });  
                saveSettings();  
                // Показуємо всі елементи  
                showAllMenuItems();  
            }  
        });  
    }  
  
    function showAllMenuItems() {  
        // Показуємо всі приховані елементи  
        var allSelectors = [  
            '.menu__item', '.sidebar__item', '.navigation__item'  
        ];  
          
        allSelectors.forEach(function(selector) {  
            var elements = document.querySelectorAll(selector);  
            elements.forEach(function(element) {  
                if (element.style.display === 'none') {  
                    element.style.display = '';  
                }  
            });  
        });  
    }  
  
    function startPlugin() {  
        loadSettings();  
        createSettingsInterface();  
          
        // Застосування приховування після завантаження  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type == 'ready') {  
                setTimeout(hideMenuItems, 1000);  
                setTimeout(hideMenuItems, 3000);  
            }  
        });  
  
        // Застосування при зміні активності  
        Lampa.Activity.listener.follow('activity', function(e) {  
            if (e.type == 'start') {  
                setTimeout(hideMenuItems, 500);  
            }  
        });  
  
        // Застосування при зміні компонентів  
        Lampa.Listener.follow('component', function(e) {  
            if (e.type == 'add') {  
                setTimeout(hideMenuItems, 200);  
            }  
        });  
  
        // Застосування при зміні DOM  
        var observer = new MutationObserver(function(mutations) {  
            var shouldUpdate = false;  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    shouldUpdate = true;  
                }  
            });  
            if (shouldUpdate) {  
                setTimeout(hideMenuItems, 100);  
            }  
        });  
  
        // Спостерігаємо за змінами в DOM  
        if (document.body) {  
            observer.observe(document.body, {  
                childList: true,  
                subtree: true  
            });  
        }  
    }  
  
    // Запуск плагіна  
    if (window.Lampa) {  
        startPlugin();  
    } else {  
        document.addEventListener('DOMContentLoaded', startPlugin);  
    }  
  
})();
