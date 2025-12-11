(function () {
    'use strict';

    Lampa.Plugin.add({
        id: 'keyboard_pro',
        title: 'Keyboard Pro',
        description: 'Розширені налаштування клавіатури',
        version: '1.0.0',
        author: 'Ти',
        init: initPlugin
    });

    function initPlugin() {

        if (Lampa.Manifest.app_digital < 300) return;
        if (window.keyboard_pro_plugin) return;

        window.keyboard_pro_plugin = true;

        // === Переклади ===
        Lampa.Lang.add({
            keyboard_title:          { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
            keyboard_default:        { uk: 'Мова за замовчуванням', ru: 'Язык по умолчанию', en: 'Default language' },
            keyboard_uk:             { uk: 'Українська', ru: 'Украинская', en: 'Ukrainian' },
            keyboard_ru:             { uk: 'Російська', ru: 'Русская', en: 'Russian' },
            keyboard_en:             { uk: 'Англійська', ru: 'Английская', en: 'English' },
            keyboard_he:             { uk: 'Іврит (עִברִית)', ru: 'Иврит (עִברִית)', en: 'Hebrew (עִברִית)' },
            keyboard_hide:           { uk: 'Приховати зі списку', ru: 'Скрыть из списка', en: 'Hide from list' },
            keyboard_profile_name:   { uk: 'Назва профілю (необовʼязково)', ru: 'Имя профиля', en: 'Profile name' }
        });

        // === Storage ===
        const storage = {
            default_lang: 'keyboard_default_lang',
            hide_uk: 'keyboard_hide_uk',
            hide_ru: 'keyboard_hide_ru',
            hide_en: 'keyboard_hide_en',
            hide_he: 'keyboard_hide_he',
            profile_name: 'keyboard_profile_name'
        };

        // === Пункт меню ===
        Lampa.SettingsApi.addEntry({
            id: 'keyboard_pro',
            name: Lampa.Lang.translate('keyboard_title'),
            icon: '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M6.21,13.29..."/></svg>',
            component: 'keyboard_pro_component'
        });

        // === Компонент ===
        Lampa.Component.add('keyboard_pro_component', {
            render(){
                return [{
                    name: 'open_menu',
                    title: Lampa.Lang.translate('keyboard_title'),
                    component: 'button',
                    action: openKeyboardMenu
                }];
            }
        });

        // === Меню ===
        function openKeyboardMenu() {
            const def = Lampa.Storage.get(storage.default_lang, 'uk');

            const items = [];

            items.push({title: Lampa.Lang.translate('keyboard_default'), separator: true});

            ['uk','ru','en','he'].forEach(function(l){
                items.push({
                    title: Lampa.Lang.translate('keyboard_' + l),
                    radio: true,
                    selected: def === l,
                    lang: l
                });
            });

            items.push({title: Lampa.Lang.translate('keyboard_hide'), separator: true});

            ['uk','ru','en','he'].forEach(function(l){
                items.push({
                    title: Lampa.Lang.translate('keyboard_' + l),
                    checkbox: true,
                    selected: Lampa.Storage.get(storage['hide_' + l], 'false') === 'true',
                    lang: l
                });
            });

            items.push({title: Lampa.Lang.translate('keyboard_profile_name'), separator: true});
            items.push({
                title: Lampa.Storage.get(storage.profile_name,''),
                input: true,
                placeholder: Lampa.Lang.translate('keyboard_profile_name')
            });

            Lampa.Select.show({
                title: Lampa.Lang.translate('keyboard_title'),
                items,
                onSelect(item){
                    if(item.radio && item.lang){
                        Lampa.Storage.set(storage.default_lang, item.lang);
                        forceDefaultKeyboard();
                        openKeyboardMenu();
                        return;
                    }

                    if(item.checkbox && item.lang){
                        const key = storage['hide_' + item.lang];
                        const newVal = Lampa.Storage.get(key,'false') === 'true' ? 'false' : 'true';
                        Lampa.Storage.set(key, newVal);
                        openKeyboardMenu();
                        return;
                    }

                    if(item.input){
                        Lampa.Input.edit({
                            title: Lampa.Lang.translate('keyboard_profile_name'),
                            value: Lampa.Storage.get(storage.profile_name,''),
                            onChange(txt){
                                Lampa.Storage.set(storage.profile_name, txt);
                            }
                        });
                        return;
                    }
                },
                onBack(){
                    Lampa.Controller.toggle('settings_component');
                }
            });
        }

        function forceDefaultKeyboard() {
            const lang = Lampa.Storage.get(storage.default_lang, 'uk');
            Lampa.Storage.set('keyboard_default_lang', lang);
        }

        Lampa.Listener.follow('full', function(e){
            if(e.type === 'start'){
                setTimeout(forceDefaultKeyboard, 300);
            }
        });

        if(window.appready){
            setTimeout(forceDefaultKeyboard, 500);
        }
    }

})();
