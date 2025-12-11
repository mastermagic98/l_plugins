'use strict';

Lampa.Manifest({
    type: 'plugin',
    name: 'Вимкнення розкладок клавіатури',
    description: 'Дозволяє вимкнути українську, російську, англійську та іврит розкладки віртуальної клавіатури. Налаштування в Налаштування → Інше → Під вибором типу клавіатури.',
    version: '1.1',
    author: 'Grok',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik02LjIxIDEzLjI5YS45LjkgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uNTQuNTQgMSAxIDAgMSAwIDEuODQgMCAxIDEgMCAwIDAtLjIxLS4zM00xMy41IDExaDFhMSAxIDAgMCAwIDAtMmgxaDEgMCAwIDAgMCAyaC0xaDEgMCAwIDAgMCAyTTloMGgxYTEgMSAwIDAgMCAwLTJoLTFhMSAxIDAgMCAwIDAgMm0tM01oLTFhMSAxIDAgMCAwIDAgMmgxaDEgMCAwIDAgMCAyTTIwIDVINGEzIDMgMCAwIDAtMyAzdjhhMyAzIDAgMCAwIDMgM2gxNmEzIDMgMCAwIDAgMy0zVjhhMyAzIDAgMCAwLTMtM20xIDExYTEgMSAwIDAgMS0xIDFINGExIDEgMCAwIDEtMS0xVjhhMSAxIDAgMCAxIDEtMWgxNmExIDEgMCAwIDEgMXY4Wm0tNkg5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yTTMuNS03aC0xYTEgMSAwIDAgMCAwIDJoMWExIDEgMCAwIDAgMC0yTTQuMjEgNC4yOWExIDEgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uMzMuMjEgMSAxIDAgMCAwLS4yMS4zMyAxIDEgMCAxIDAgMS45Mi4zOC44NC44NCAwIDAgMC0uMDgtLjM4IDEgMCAwIDAtLjIxLS4zMyIvPjwvc3ZnPg=='
});

// Мультиселект параметр (зберігається як масив)
Lampa.Params.multiselect('keyboard_layout_disable', [
    {value: 'ua', title: 'Українська'},
    {value: 'ru', title: 'Російська'},
    {value: 'en', title: 'English'},
    {value: 'he', title: 'עִברִית'}
], []);

// Додаємо параметр до категорії "Інше"
Lampa.Settings.categories.push({
    name: 'Інше',
    component: 'other',
    params: ['keyboard_layout_disable']
});

// Вставляємо мультиселект під параметром вибору типу клавіатури
Lampa.SettingsListener.add(function (component) {
    if (component === 'other') {
        var place = $('div[data-name="keyboard_type"]:first').parent();
        if (place.length && !$('div[data-name="keyboard_layout_disable"]').length) {
            var currentValue = Lampa.Storage.get('keyboard_layout_disable', '[]');
            var html = '<div class="settings-param selector" data-type="multiselect" data-name="keyboard_layout_disable">' +
                       '<div class="settings-param__name">Вимкнути розкладки клавіатури</div>' +
                       '<div class="settings-param__value">' + (currentValue.length ? currentValue.map(function(v){return Lampa.Params.multiselect('keyboard_layout_disable').find(function(i){return i.value===v}).title;}).join(', ') : 'Нічого не вибрано') + '</div>' +
                       '<div class="settings-param__status">Під вибором типу клавіатури</div></div>';
            place.after(html);
        }
    }
});

function hideLayouts() {
    var disabled = Lampa.Storage.get('keyboard_layout_disable', '[]'); // масив вибраних

    // Українська (можливі варіанти написання)
    if (disabled.indexOf('ua') !== -1) {
        var elementUA = $('.selectbox-item.selector > div:contains("Українська"), .selectbox-item.selector > div:contains("Украинская")');
        if (elementUA.length > 0) {
            elementUA.parent('div').hide();
        }
    }

    // Російська
    if (disabled.indexOf('ru') !== -1) {
        var elementRU = $('.selectbox-item.selector > div:contains("Русский"), .selectbox-item.selector > div:contains("Російська")');
        if (elementRU.length > 0) {
            elementRU.parent('div').hide();
        }
    }

    // English
    if (disabled.indexOf('en') !== -1) {
        var elementEN = $('.selectbox-item.selector > div:contains("English"), .selectbox-item.selector > div:contains("Английский")');
        if (elementEN.length > 0) {
            elementEN.parent('div').hide();
        }
    }

    // Іврит
    if (disabled.indexOf('he') !== -1) {
        var elementHE = $('.selectbox-item.selector > div:contains("עִברִית")');
        if (elementHE.length > 0) {
            elementHE.parent('div').hide();
        }
    }
}

function initHide() {
    // Періодична перевірка наявності кнопки зміни мови
    setInterval(function () {
        var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
        if (langButton.length > 0) {
            hideLayouts();
        }
    }, 500);

    // Одноразовий запуск при старті
    hideLayouts();
}

// Запуск після повного завантаження додатка
Lampa.Listener.follow('app', function (e) {
    if (e.type === 'ready') {
        initHide();
    }
});

// Реагуємо на зміну налаштувань
Lampa.Listener.follow('settings', function (e) {
    if (e.type === 'update' && e.name === 'keyboard_layout_disable') {
        // Невелика затримка, щоб меню встигло оновитися
        setTimeout(hideLayouts, 300);
    }
});
