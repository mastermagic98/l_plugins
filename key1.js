(function () {
'use strict';

Lampa.Manifest({
    type: 'plugin',
    name: 'Вимкнення розкладок клавіатури',
    description: 'Дозволяє вимкнути українську, російську, англійську та іврит розкладки віртуальної клавіатури. Налаштування в Налаштування → Інше → Під вибором типу клавіатури.',
    version: '1.1',
    author: 'Grok',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik02LjIxIDEzLjI5YS45LjkgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uNTQuNTQgMSAxIDAgMSAwIDEuODQgMCAxIDEgMCAwIDAtLjIxLS4zM00xMy41IDExaDFhMSAxIDAgMCAwIDAtMmgxaDEgMCAwIDAgMCAyaC0xaDEgMCAwIDAgMCAyTTloMGgxYTEgMSAwIDAgMCAwLTJoLTFhMSAxIDAgMCAwIDAgMm0tM01oLTFhMSAxIDAgMCAwIDAgMmgxaDEgMCAwIDAgMCAyTTIwIDVINGEzIDMgMCAwIDAtMyAzdjhhMyAzIDAgMCAwIDMgM2gxNmEzIDMgMCAwIDAgMy0zVjhhMyAzIDAgMCAwLTMtM20xIDExYTEgMSAwIDAgMS0xIDFINGExIDEgMCAwIDEtMS0xVjhhMSAxIDAgMCAxIDEtMWgxNmExIDEgMCAwIDEgMXY4Wm0tNkg5YTEgMSAwIDAgMCAwIDJoNmExIDEgMCAwIDAgMC0yTTMuNS03aC0xYTEgMSAwIDAgMCAwIDJoMWExIDEgMCAwIDAgMC0yTTQuMjEgNC4yOWExIDEgMCAwIDAtLjMzLS4yMSAxIDEgMCAwIDAtLjc2IDAgLjkuOSAwIDAgMC0uMzMuMjEgMSAxIDAgMCAwLS4yMS4zMyAxIDEgMCAxIDAgMS45Mi4zOC44NC44NCAwIDAgMC0uMDgtLjM4IDEgMCAwIDAtLjIxLS4zMyIvPjwvc3ZnPg=='
});

// Визначаємо опції для мультиселекту
var keyboardOptions = [
    { value: 'ua', title: 'Українська' },
    { value: 'ru', title: 'Російська' },
    { value: 'en', title: 'English' },
    { value: 'he', title: 'עִברִית' }
];

// Ініціалізуємо мультиселект параметр (за замовчуванням порожній масив)
Lampa.Params.multiselect('keyboard_layout_disable', keyboardOptions, []);

// Додаємо параметр до категорії "Інше", якщо ще не додано
if (Lampa.Settings.categories) {
    var otherCategory = Lampa.Settings.categories.find(function(cat) { return cat.name === 'Інше'; });
    if (otherCategory && otherCategory.params.indexOf('keyboard_layout_disable') === -1) {
        otherCategory.params.push('keyboard_layout_disable');
    } else if (!otherCategory) {
        Lampa.Settings.categories.push({
            name: 'Інше',
            component: 'other',
            params: ['keyboard_layout_disable']
        });
    }
}

// Функція для отримання поточного значення мультиселекту
function getDisabledLayouts() {
    var stored = Lampa.Storage.get('keyboard_layout_disable', '[]');
    try {
        return typeof stored === 'string' ? JSON.parse(stored) : stored;
    } catch (e) {
        return [];
    }
}

// Функція для оновлення значення мультиселекту в Storage
function setDisabledLayouts(value) {
    Lampa.Storage.set('keyboard_layout_disable', JSON.stringify(value));
}

// Функція для створення HTML мультиселекту в налаштуваннях
function createMultiselectHtml() {
    var currentValue = getDisabledLayouts();
    var selectedTitles = [];
    for (var i = 0; i < keyboardOptions.length; i++) {
        if (currentValue.indexOf(keyboardOptions[i].value) !== -1) {
            selectedTitles.push(keyboardOptions[i].title);
        }
    }
    var valueText = selectedTitles.length > 0 ? selectedTitles.join(', ') : 'Нічого не вибрано';

    var html = '<div class="settings-param selector" data-type="multiselect" data-name="keyboard_layout_disable">' +
               '<div class="settings-param__name">Вимкнути розкладки клавіатури</div>' +
               '<div class="settings-param__value">' + valueText + '</div>' +
               '<div class="settings-param__descr">Виберіть розкладки для вимкнення</div>' +
               '<div class="settings-param__status">Під вибором типу клавіатури</div>' +
               '<div class="settings-param__option">' +
               keyboardOptions.map(function(option) {
                   var checked = currentValue.indexOf(option.value) !== -1 ? ' checked' : '';
                   return '<label class="checkbox"><input type="checkbox" value="' + option.value + '"' + checked + '><span>' + option.title + '</span></label>';
               }).join('') +
               '</div></div>';

    return html;
}

// Лісенер для додавання мультиселекту в налаштуваннях
if (Lampa.SettingsListener) {
    Lampa.SettingsListener.add(function (component) {
        if (component === 'other') {
            // Чекаємо, поки завантажиться параметр keyboard_type
            var intervalCheck = setInterval(function() {
                var place = $('div[data-name="keyboard_type"]').parent();
                if (place.length > 0 && !$('div[data-name="keyboard_layout_disable"]').length) {
                    place.after(createMultiselectHtml());
                    clearInterval(intervalCheck);
                }
            }, 100);

            // Таймаут на випадок, якщо не знайде
            setTimeout(function() {
                clearInterval(intervalCheck);
            }, 5000);
        }
    });
}

// Обробник кліку для мультиселекту (симуляція, оскільки Lampa може мати свою логіку)
$(document).on('change', 'div[data-name="keyboard_layout_disable"] input[type="checkbox"]', function() {
    var currentValue = getDisabledLayouts();
    var value = this.value;
    var index = currentValue.indexOf(value);
    if (this.checked && index === -1) {
        currentValue.push(value);
    } else if (!this.checked && index !== -1) {
        currentValue.splice(index, 1);
    }
    setDisabledLayouts(currentValue);
    // Оновлюємо текст значення
    var valueText = currentValue.map(function(v) {
        var opt = keyboardOptions.find(function(o) { return o.value === v; });
        return opt ? opt.title : v;
    }).join(', ') || 'Нічого не вибрано';
    $('div[data-name="keyboard_layout_disable"] .settings-param__value').text(valueText);
});

// Функція для приховування розкладок
function hideLayouts() {
    var disabled = getDisabledLayouts();

    // Перевіряємо наявність меню вибору розкладки
    var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
    if (langButton.length === 0) {
        return;
    }

    // Українська
    if (disabled.indexOf('ua') !== -1) {
        var selectorsUA = [
            '.selectbox-item.selector > div:contains("Українська")',
            '.selectbox-item.selector > div:contains("Украинская")'
        ];
        for (var i = 0; i < selectorsUA.length; i++) {
            var elementUA = $(selectorsUA[i]);
            if (elementUA.length > 0) {
                elementUA.parent('div').hide();
                break;
            }
        }
    }

    // Російська
    if (disabled.indexOf('ru') !== -1) {
        var selectorsRU = [
            '.selectbox-item.selector > div:contains("Русский")',
            '.selectbox-item.selector > div:contains("Російська")'
        ];
        for (var j = 0; j < selectorsRU.length; j++) {
            var elementRU = $(selectorsRU[j]);
            if (elementRU.length > 0) {
                elementRU.parent('div').hide();
                break;
            }
        }
    }

    // English
    if (disabled.indexOf('en') !== -1) {
        var selectorsEN = [
            '.selectbox-item.selector > div:contains("English")',
            '.selectbox-item.selector > div:contains("Английский")',
            '.selectbox-item.selector > div:contains("Англійська")'
        ];
        for (var k = 0; k < selectorsEN.length; k++) {
            var elementEN = $(selectorsEN[k]);
            if (elementEN.length > 0) {
                elementEN.parent('div').hide();
                break;
            }
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

// Ініціалізація приховування
function initHide() {
    // Періодична перевірка кожні 500 мс
    var hideInterval = setInterval(function () {
        var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
        if (langButton.length > 0) {
            hideLayouts();
        }
    }, 500);

    // Зупиняємо інтервал, якщо елемент зник (оптимізація)
    $(document).on('DOMNodeRemoved', 'div.hg-button.hg-functionBtn.hg-button-LANG', function() {
        if ($(this).hasClass('selector') && $(this).hasClass('binded')) {
            clearInterval(hideInterval);
        }
    });

    // Одноразовий запуск
    setTimeout(hideLayouts, 1000);
}

// Запуск після готовності додатка
if (Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            initHide();
        }
    });
} else {
    // Fallback, якщо Listener не доступний
    $(document).ready(function() {
        setTimeout(initHide, 2000);
    });
}

// Реагування на оновлення налаштувань
if (Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('settings', function (e) {
        if (e.type === 'update' && e.name === 'keyboard_layout_disable') {
            setTimeout(hideLayouts, 300);
        }
    });
}
// Додатковий лісенер на закриття/відкриття меню клавіатури для перезапуску приховування
$(document).on('click', 'div.hg-button.hg-functionBtn.hg-button-LANG', function() {
    setTimeout(hideLayouts, 100);
});
    })();
