(function () {  
    'use strict';  
  
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;  
    if (window.keyboard_multi_hide_plugin) return;  
    window.keyboard_multi_hide_plugin = true;  
  
    const LANGUAGES = ['Українська', 'Русский', 'English', 'עִברִית'];  
    const STORAGE_KEYS = {  
        'Українська': 'keyboard_hide_uk',  
        'Русский': 'keyboard_hide_ru',  
        'English': 'keyboard_hide_en',  
        'עִברִית': 'keyboard_hide_he'  
    };  
  
    function findLanguageElement(lang) {  
        return $('.selectbox-item.selector').filter(function () {  
            return $(this).text().trim() === lang;  
        });  
    }  
  
    function applyHiding() {  
        LANGUAGES.forEach(lang => {  
            const hide = Lampa.Storage.get(STORAGE_KEYS[lang], 'false') === 'true';  
            const element = findLanguageElement(lang);  
            if (element.length) element.toggle(!hide);  
        });  
    }  
  
    function openLanguageMenu() {  
        function buildItems() {  
            return LANGUAGES.map(lang => ({  
                title: lang,  
                checkbox: true,  
                selected: Lampa.Storage.get(STORAGE_KEYS[lang], 'false') === 'true',  
                lang: lang  
            }));  
        }  
  
        let items = buildItems();  
  
        Lampa.Select.show({  
            title: 'Вимкнути розкладку',  
            items: items,  
            onSelect(item) {  
                try {  
                    if (item.checkbox && item.lang) {  
                        const key = STORAGE_KEYS[item.lang];  
                        const newVal = Lampa.Storage.get(key, 'false') === 'true' ? 'false' : 'true';  
                        Lampa.Storage.set(key, newVal);  
                        applyHiding();  
                        // Оновлюємо список без закриття меню  
                        items = buildItems();  
                        Lampa.Select.update(items);  
                    }  
                } catch (e) {  
                    console.error('keyboard_multi_hide_plugin onSelect error:', e);  
                    Lampa.Noty.show('Помилка при зміні мови: ' + e.message);  
                }  
            },  
            onBack() {  
                Lampa.Controller.toggle('settings_component');  
            }  
        });  
    }  
  
    Lampa.SettingsApi.addComponent({  
        component: 'keyboard_multi_hide_plugin',  
        name: 'Вимкнути розкладку',  
        icon: '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>'  
    });  
  
    Lampa.SettingsApi.addParam({  
        component: 'keyboard_multi_hide_plugin',  
        param: {  
            name: 'select_keyboard_menu',  
            type: 'trigger',  
            default: false  
        },  
        field: {  
            name: 'Вибір мови',  
            description: 'Вимкнути розкладку для обраних мов'  
        },  
        onRender(el) {  
            el.off('hover:enter').on('hover:enter', function () {  
                Lampa.Modal.confirm({  
                    title: 'Вимкнути розкладку?',  
                    text: 'Бажаєте вимкнути одну або декілька мов клавіатури?',  
                    ok: 'Так',  
                    cancel: 'Ні',  
                    onSelect: function (a) {  
                        if (a) openLanguageMenu();  
                    }  
                });  
            });  
        }  
    });  
  
    Lampa.Listener.follow('full', e => e.type === 'start' && setTimeout(applyHiding, 300));  
    if (window.appready) setTimeout(applyHiding, 500);  
})();
