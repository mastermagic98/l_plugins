'use strict';

Lampa.Manifest({
    type: 'plugin',
    name: 'Вимкнення розкладок клавіатури',
    description: 'Дозволяє вимкнути українську, російську та іврит розкладки віртуальної клавіатури. Налаштування в Налаштування → Інше → Під вибором типу клавіатури.',
    version: '1.0',
    author: 'Grok',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik02LjIxIDEzLjI5YS45LjkgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uNTQuNTQgMSAxIDAgMSAwIDEuODQgMCAxIDEgMCAwIDAtLjIxLS4zM00xMy41IDExaDFhMSAxIDAgMCAwIDAtMmgxaDEgMCAwIDAgMCAyaC0xaDEgMCAwIDAgMCAyTTloMGgxYTEgMSAwIDAgMCAwLTJoLTFhMSAxIDAgMCAwIDAgMm0tM01oLTFhMSAxIDAgMCAwIDAgMmgxaDEgMCAwIDAgMCAyTTIwIDVINGEzIDMgMCAwIDAtMyAzdjhhMyAzIDAgMCAwIDMgM2gxNmEzIDMgMCAwIDAgMy0zVjhhMyAzIDAgMCAwLTMtM20xIDExYTEgMSAwIDAgMS0xIDFINGExIDEgMCAwIDEtMS0xVjhhMSAxIDAgMCAxIDEtMWgxNmExIDEgMCAwIDEgMXY4Wm0tNkg5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yTTMuNS03aC0xYTEgMSAwIDAgMCAwIDJoMWExIDEgMCAwIDAgMC0yTTQuMjEgNC4yOWExIDEgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uMzMuMjEgMSAxIDAgMCAwLS4yMS4zMyAxIDEgMCAxIDAgMS45Mi4zOC44NC44NCAwIDAgMC0uMDgtLjM4IDEgMCAwIDAtLjIxLS4zMyIvPjwvc3ZnPg=='
});

Lampa.Params.select('keyboard_layout_disable', {
    'none': 'Не вимикати нічого',
    'ua': 'Вимкнути українську',
    'ru': 'Вимкнути російську',
    'he': 'Вимкнути іврит',
    'ua_ru': 'Вимкнути українську та російську',
    'ua_he': 'Вимкнути українську та іврит',
    'ru_he': 'Вимкнути російську та іврит',
    'all': 'Вимкнути всі три (укр, рос, іврит)'
}, 'none');

Lampa.Settings.categories.push({
    name: 'Інше',
    component: 'other',
    params: ['keyboard_layout_disable']
});

Lampa.SettingsListener.add(function (component) {
    if (component === 'other') {
        var select = Lampa.Params.select('keyboard_layout_disable');
        if (select) {
            var html = '<div class="settings-param selector" data-type="select" data-name="keyboard_layout_disable" data-title="Вимкнення розкладок клавіатури">' +
                       '<div class="settings-param__name">Вимкнення розкладок клавіатури</div>' +
                       '<div class="settings-param__value">' + select[Lampa.Storage.get('keyboard_layout_disable','none')] + '</div>' +
                       '<div class="settings-param__status">Під вибором типу клавіатури</div></div>';
            var place = $('div[data-name="keyboard_type"]:first').parent();
            if (place.length) {
                place.after(html);
            }
        }
    }
});

function hideLayouts() {
    var value = Lampa.Storage.get('keyboard_layout_disable', 'none');
    if (value === 'none') return;

    var hideUA = (value === 'ua' || value === 'ua_ru' || value === 'ua_he' || value === 'all');
    var hideRU = (value === 'ru' || value === 'ua_ru' || value === 'ru_he' || value === 'all');
    var hideHE = (value === 'he' || value === 'ua_he' || value === 'ru_he' || value === 'all');

    if (hideUA) {
        var elementUA = $('.selectbox-item.selector > div:contains("Українська"), .selectbox-item.selector > div:contains("Украинская")');
        if (elementUA.length > 0) elementUA.parent('div').hide();
    }

    if (hideRU) {
        var elementRU = $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Російська")');
        if (elementRU.length > 0) elementRU.parent('div').hide();
    }

    if (hideHE) {
        var elementHE = $('.selectbox-item.selector > div:contains("עִברִית")');
        if (elementHE.length > 0) elementHE.parent('div').hide();
    }
}

function initHide() {
    setInterval(function () {
        var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
        if (langButton.length > 0) {
            hideLayouts();
        }
    }, 500);

    // Одноразовий запуск при завантаженні
    hideLayouts();
}

Lampa.Listener.follow('app', function (e) {
    if (e.type === 'ready') {
        initHide();
    }
});

Lampa.Listener.follow('settings', function (e) {
    if (e.type === 'update') {
        if (e.name === 'keyboard_layout_disable') {
            // Після зміни параметра перезапустимо приховування
            setTimeout(hideLayouts, 300);
        }
    }
});
