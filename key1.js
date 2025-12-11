(function () {
'use strict';
Lampa.Manifest.plugins = {
name: 'keyboard_layout_disable',
version: '1.2',
description: 'Вимкнення вибраних розкладок віртуальної клавіатури (Українська, Російська, English, עִברִית)'
};
// Визначаємо опції для мультиселекту
var keyboardOptions = [
{ value: 'ua', title: 'Українська' },
{ value: 'ru', title: 'Російська' },
{ value: 'en', title: 'English' },
{ value: 'he', title: 'עִברִית' }
];
// Ініціалізуємо мультиселект параметр (за замовчуванням порожній масив)
Lampa.Params.multiselect('keyboard_layout_disable', keyboardOptions, []);
// Додаємо параметр до категорії "Інше"
if (Lampa.Settings.categories) {
var otherCategory = Lampa.Settings.categories.filter(function(cat) {
return cat.name === 'Інше';
})[0];
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
var parsed;
try {
parsed = (typeof stored === 'string') ? JSON.parse(stored) : stored;
} catch (e) {
parsed = [];
}
return (parsed && parsed.length !== undefined) ? parsed : [];
}
// Функція для створення HTML мультиселекту в налаштуваннях
function createMultiselectHtml() {
var currentValue = getDisabledLayouts();
var selectedTitles = [];
var i;
for (i = 0; i < keyboardOptions.length; i++) {
if (currentValue.indexOf(keyboardOptions[i].value) !== -1) {
selectedTitles.push(keyboardOptions[i].title);
}
}
var valueText = selectedTitles.length > 0 ? selectedTitles.join(', ') : 'Нічого не вибрано';
var html = '' +
'Вимкнути розкладки клавіатури' +
'' + valueText + '' +
'Виберіть розкладки для вимкнення' +
'Під вибором типу клавіатури' +
'';
for (i = 0; i < keyboardOptions.length; i++) {
var option = keyboardOptions[i];
var checked = currentValue.indexOf(option.value) !== -1 ? ' checked' : '';
html += '<input type="checkbox" value="' + option.value + '"' + checked + '>' + option.title + '';
}
html += '';
return html;
}
// Лісенер для вставки мультиселекту в налаштуваннях
if (Lampa.SettingsListener) {
Lampa.SettingsListener.add(function (component) {
if (component === 'other') {
var checkInterval = setInterval(function() {
var place = $('div[data-name="keyboard_type"]').parent();
if (place.length > 0 && !$('div[data-name="keyboard_layout_disable"]').length) {
place.after(createMultiselectHtml());
clearInterval(checkInterval);
}
}, 100);
setTimeout(function() {
clearInterval(checkInterval);
}, 5000);
}
});
}
// Обробник зміни чекбоксів
$(document).on('change', 'div[data-name="keyboard_layout_disable"] input[type="checkbox"]', function() {
var currentValue = getDisabledLayouts();
var value = this.value;
var index = currentValue.indexOf(value);
if (this.checked && index === -1) {
currentValue.push(value);
} else if (!this.checked && index !== -1) {
currentValue.splice(index, 1);
}
Lampa.Storage.set('keyboard_layout_disable', JSON.stringify(currentValue));
// Оновлення тексту значення
var selectedTitles = [];
var j;
for (j = 0; j < currentValue.length; j++) {
var val = currentValue[j];
var opt = null;
var k;
for (k = 0; k < keyboardOptions.length; k++) {
if (keyboardOptions[k].value === val) {
opt = keyboardOptions[k];
break;
}
}
if (opt) {
selectedTitles.push(opt.title);
}
}
var titlesText = selectedTitles.length > 0 ? selectedTitles.join(', ') : 'Нічого не вибрано';
$('div[data-name="keyboard_layout_disable"] .settings-param__value').text(titlesText);
});
// Функція приховування розкладок
function hideLayouts() {
var disabled = getDisabledLayouts();
var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
if (langButton.length === 0) {
return;
}
// Українська
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
var elementEN = $('.selectbox-item.selector > div:contains("English"), .selectbox-item.selector > div:contains("Английский"), .selectbox-item.selector > div:contains("Англійська")');
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
// Ініціалізація приховування
function initHide() {
setInterval(function () {
var langButton = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded');
if (langButton.length > 0) {
hideLayouts();
}
}, 500);
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
$(document).ready(function() {
setTimeout(initHide, 2000);
});
}
// Реакція на зміну налаштувань
if (Lampa.Listener && Lampa.Listener.follow) {
Lampa.Listener.follow('settings', function (e) {
if (e.type === 'update' && e.name === 'keyboard_layout_disable') {
setTimeout(hideLayouts, 300);
}
});
}
// Додаткове приховування при натисканні кнопки LANG
$(document).on('click', 'div.hg-button.hg-functionBtn.hg-button-LANG', function() {
setTimeout(hideLayouts, 100);
});
})();
