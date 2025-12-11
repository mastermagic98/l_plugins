(function () {
    'use strict';

    // Уникнення повторного запуску
    if (window.kb_hide_plugin_ready) return;
    window.kb_hide_plugin_ready = true;
    
    // Переклади
/*   Lampa.Lang.add({
        kb_title: { uk: 'Клавіатура', ru: 'Клавиатура', en: 'Keyboard' },
        kb_uk:    { uk: 'Українська', ru: 'Украинская', en: 'Ukrainian' },
        kb_ru:    { uk: 'Російська',  ru: 'Русская',    en: 'Russian' },
        kb_en:    { uk: 'Англійська', ru: 'Английская', en: 'English' },
        kb_he:    { uk: 'עִברִית',      ru: 'עִברִית',      en: 'עִברִית' }
    });

    var k = {
        uk: 'kb_hide_uk_v2',
        ru: 'kb_hide_ru_v2',
        en: 'kb_hide_en_v2',
        he: 'kb_hide_he_v2'
    };
*/
//    var icon_svg = '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1-1V8a1 1 0 0 1-1-1H4a1 1 0 0 1-1 1v8a1 1 0 0 1 1 1h16Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>';

    // Приховуємо вибрані клавіатури
    function hideKeyboards() {
        if (Lampa.Storage.get(k.uk,'false')==='true') $('.selectbox-item.selector > div:contains("Українська")').parent().hide();
//        if (Lampa.Storage.get(k.ru,'true') ==='true') $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Russian")').parent().hide();
        if (Lampa.Storage.get(k.en,'false')==='true') $('.selectbox-item.selector > div:contains("English")').parent().hide();
        if (Lampa.Storage.get(k.he,'true') ==='true') $('.selectbox-item.selector > div:contains("עִברִית")').parent().hide();
    }

    // Меню з нативними чекбоксами
/*    function openMenu = function() {
   var items = [];

        items.push({ title: 'Приховати клавіатури', separator: true });

        ['uk','ru','en','he'].forEach(function(code){
            items.push({
                title: Lampa.Lang.translate('kb_'+code),
                checkbox: true,
                checked: Lampa.Storage.get(k[code], code==='ru'?'true':'false') === 'true',
                code: code
            });
        });

        Lampa.Select.show({
            title: Lampa.Lang.translate('kb_title'),
            items: items,
            onSelect: function(a)=>{
                if (a.checkbox && a.code){
                    var k = k[a.code];
                    Lampa.Storage.set(k, Lampa.Storage.get(k,'false')==='true' ? 'false' : 'true');
                    hideKeyboards();
                    openMenu(); // оновлюємо галочки
                }
            },
            onBack: ()=>Lampa.Controller.toggle('settings_component')
        });
    };

    // Додаємо пункт у налаштування (найнадійніший спосіб)
    function injectSettingsItem() {
        var render = Lampa.Settings.main().render();

        // Уникнення дублювання
        if (render.find('[data-kb-hide-plugin]').length) return;

        var html = `
            <div class="settings-folder selector" data-kb-hide-plugin>
                <div class="settings-folder__icon">${icon_svg}</div>
                <div class="settings-folder__name">${Lampa.Lang.translate('kb_title')}</div>
            </div>
        `;

        var more = render.find('[data-component="more"]');
        if (more.length) {
            more.before(html);
        } else {
            render.append(html);
        }
*/
        // Вішаємо обробник один раз
        $(document).off('hover:enter', '[data-kb-hide-plugin]').on('hover:enter', '[data-kb-hide-plugin]', openMenu);
    }

    // Запуск
    Lampa.Listener.follow('app', function(e){
        if (e.type === 'ready'){
            setTimeout(injectSettingsItem, 600);
        }
    });

    // Якщо додаток вже запущений
    if (window.appready){
        setTimeout(injectSettingsItem, 600);
    }

    // При кожному відкритті пошуку
    Lampa.Listener.follow('full', e=>{
        if (e.type==='start') setTimeout(hideKeyboards, 300);
    });

    // Спостерігач за DOM
//    new MutationObserver(hideKeyboards).observe(document.body, {childList:true, subtree:true});

})();
