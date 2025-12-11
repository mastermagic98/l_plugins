(function () {
    'use strict';

    // Тільки для Lampa 3.0+
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;

    if (window.keyboard_clean_fixed) return;
    window.keyboard_clean_fixed = true;

    // Переклади
    Lampa.Lang.add({
        keyboard_title: { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
        keyboard_uk:    { uk: 'Українська', ru: 'Украинская', en: 'Ukrainian' },
        keyboard_ru:    { uk: 'Російська',   ru: 'Русская',     en: 'Russian' },
        keyboard_en:    { uk: 'Англійська', ru: 'Английская',  en: 'English' },
        keyboard_he:    { uk: 'Іврит (עִברִית)', ru: 'Иврит (עִברִית)', en: 'Hebrew (עִברִית)' }
    });

    var keys = {
        uk: 'kb_hide_uk',
        ru: 'kb_hide_ru',
        en: 'kb_hide_en',
        he: 'kb_hide_he'
    };

    var icon = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.21,13.29a.93.93,0,0,0-.33-.21,1,1,0,0,0-.76,0,.9.9,0,0,0-.54.54,1,1,0,1,0,1.84,0A1,1,0,0,0,6.21,13.29ZM13.5,11h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-4,0h1a1,1,0,0,0,0-2h-1a1,1,0,0,0,0,2Zm-3-2h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM20,5H4A3,3,0,0,0,1,8v8a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V8A3,3,0,0,0,20,5Zm1,11a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V8A1,1,0,0,1,4,7H20a1,1,0,0,1,1,1Zm-6-3H9a1,1,0,0,0,0,2h6a1,1,0,0,0,0-2Zm3.5-4h-1a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm.71,4.29a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,.93.93,0,0,0-.33.21,1,1,0,0,0-.21.33A1,1,0,1,0,19.5,14a.84.84,0,0,0-.08-.38A1,1,0,0,0,19.21,13.29Z"/></svg>';

    // Приховування клавіатур
    function applyHiding() {
        if (Lampa.Storage.get(keys.uk, 'false') === 'true') $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
        if (Lampa.Storage.get(keys.ru, 'true')  === 'true') $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        if (Lampa.Storage.get(keys.en, 'false') === 'true') $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (Lampa.Storage.get(keys.he, 'true')  === 'true') $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
    }

    // Меню з чекбоксами
    function openMenu() {
        var items = [];

        items.push({ title: 'Приховати клавіатури', separator: true });

        ['uk','ru','en','he'].forEach(function(l){
            items.push({
                title: Lampa.Lang.translate('keyboard_'+l),
                checkbox: true,
                checked: Lampa.Storage.get(keys[l], l==='ru'?'true':'false') === 'true',
                lang: l
            });
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('keyboard_title'),
            items: items,
            onSelect: function(a){
                if (a.checkbox && a.lang){
                    var k = keys[a.lang];
                    Lampa.Storage.set(k, Lampa.Storage.get(k,'false')==='true' ? 'false' : 'true');
                    applyHiding();
                    openMenu(); // оновлюємо галочки
                }
            },
            onBack: ()=>Lampa.Controller.toggle('settings_component')
        });
    }

    // Найнадійніший спосіб додавання пункту в налаштування для Lampa 3.0+
    function addToSettings() {
        var render = Lampa.Settings.main().render();

        // Додаємо пункт перед "Інше" (або в кінець, якщо "Інше" немає)
        var more = render.find('[data-component="more"]');
        if (more.length) {
            more.before(
                '<div class="settings-folder selector" data-action="keyboard_clean">' +
                    '<div class="settings-folder__icon">'+icon+'</div>' +
                    '<div class="settings-folder__name">'+Lampa.Lang.translate('keyboard_title')+'</div>' +
                '</div>'
            );
        } else {
            {
            render.append(
                '<div class="settings-folder selector" data-action="keyboard_clean">' +
                    '<div class="settings-folder__icon">'+icon+'</div>' +
                    '<div class="settings-folder__name">'+Lampa.Lang.translate('keyboard_title')+'</div>' +
                '</div>'
            );
        }

        // Вішаємо обробник
        $(document).off('hover:enter', '[data-action="keyboard_clean"]').on('hover:enter', '[data-action="keyboard_clean"]', openMenu);
    }

    // Запуск
    Lampa.Listener.follow('app', function(e){
        if (e.type == 'ready'){
            setTimeout(addToSettings, 500);
            setTimeout(applyHiding, 1000);
        }
    });

    // Якщо додаток вже готовий
    if (window.appready){
        setTimeout(addToSettings, 500);
        setTimeout(applyHiding, 1000);
    }

    // Спостерігач за DOM
    new MutationObserver(applyHiding).observe(document.body, {childList:true, subtree:true});

    // При відкритті пошуку
    Lampa.Listener.follow('full', e=>{ if(e.type==='start') setTimeout(applyHiding,300); });

})();
