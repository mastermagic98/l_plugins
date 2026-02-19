Спочатку я проаналізую проблему: попередній підхід з приховуванням елементів у DOM меню selectbox не спрацював надійно, ймовірно через динамічний рендеринг або неточний таймінг. З наданим кодом Lampa видно, що розкладки клавіатури зберігаються в модулі KeyboardLayouts, який експортує об'єкт з функціями get, add тощо, а самі дані в internal layers. Меню мов генерується на основі доступних ключів у layers для різних режимів (наприклад, Object.keys(layers.default) або подібне, виключаючи 'sim'). Тому кращий спосіб "вимикати" мови - динамічно видаляти відповідні ключі з layers для всіх режимів (search, clarify, default, nums), якщо мова позначена як прихована. Це автоматично прибере їх з меню вибору, без потреби в DOM-маніпуляціях.

Дії, які я виконаю:
1. Додам функцію getCode для мапінгу назв мов на коди в layers ('Українська' -> 'uk', 'Русский' -> 'default', 'English' -> 'en', 'עִברִית' -> 'he').
2. На початку плагіна збережу оригінальну копію всіх layers за допомогою JSON.parse(JSON.stringify()), щоб можна було відновлювати видалені мови.
3. У функції applyHiding для кожної мови, якщо hide=true, видалю ключ code з layers[mode] для всіх mode; якщо hide=false, відновлю з оригіналу.
4. Застосую applyHiding при старті аплікації (через Lampa.Listener 'full' start і window.appready).
5. У openLanguageMenu після зміни Storage викличу applyHiding() і перевідкрию меню для оновлення чекбоксів.
6. Видалю непотрібний listener на 'select' і DOM-маніпуляції, бо модифікація layers вирішить проблему з меню автоматично.
7. Залишу підтвердження через Lampa.Select.show замість Modal.confirm для сумісності.
8. Додам консольне логування в applyHiding для відладки (можна видалити пізніше).
9. Забезпечу, щоб плагін працював тільки якщо Lampa.KeyboardLayouts існує.

Ось повний код плагіна JavaScript для Lampa v3.0 без скорочень:

(function () {
    'use strict';
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;
    if (window.keyboard_multi_hide_plugin) return;
    if (!Lampa.KeyboardLayouts) return;
    window.keyboard_multi_hide_plugin = true;
    const LANGUAGES = ['Українська', 'Русский', 'English', 'עִברִית'];
    const STORAGE_KEYS = {
        'Українська': 'keyboard_hide_uk',
        'Русский': 'keyboard_hide_ru',
        'English': 'keyboard_hide_en',
        'עִברִית': 'keyboard_hide_he'
    };
    // Отримання коду мови для layers
    function getCode(lang) {
        switch (lang) {
            case 'Українська': return 'uk';
            case 'Русский': return 'default';
            case 'English': return 'en';
            case 'עִברִית': return 'he';
        }
    }
    // Збереження оригінальних layers
    const layouts = Lampa.KeyboardLayouts;
    let original_layers = {};
    Object.keys(layouts.get()).forEach(mode => {
        original_layers[mode] = JSON.parse(JSON.stringify(layouts.get(mode)));
    });
    // Функція застосування приховування (видалення/відновлення ключів у layers)
    function applyHiding() {
        Object.keys(original_layers).forEach(mode => {
            let layer = layouts.get(mode) || {};
            LANGUAGES.forEach(lang => {
                const code = getCode(lang);
                const hide = Lampa.Storage.get(STORAGE_KEYS[lang], 'false') === 'true';
                if (hide) {
                    if (layer[code]) {
                        delete layer[code];
                        console.log('Keyboard Hide: Removed ' + code + ' from ' + mode);
                    }
                } else {
                    if (original_layers[mode][code] && !layer[code]) {
                        layer[code] = original_layers[mode][code];
                        console.log('Keyboard Hide: Restored ' + code + ' to ' + mode);
                    }
                }
            });
        });
    }
    // Функція відкриття списку мов
    function openLanguageMenu() {
        const items = LANGUAGES.map(lang => ({
            title: lang,
            checkbox: true,
            selected: Lampa.Storage.get(STORAGE_KEYS[lang], 'false') === 'true',
            lang: lang
        }));
        Lampa.Select.show({
            title: 'Вимкнути розкладку',
            items: items,
            onSelect(item) {
                if (item.checkbox && item.lang) {
                    const key = STORAGE_KEYS[item.lang];
                    const newVal = Lampa.Storage.get(key, 'false') === 'true' ? 'false' : 'true';
                    Lampa.Storage.set(key, newVal);
                    applyHiding();
                    openLanguageMenu(); // оновлюємо меню
                }
            },
            onBack() {
                Lampa.Controller.toggle('settings_component');
            }
        });
    }
    // Додаємо компонент у Налаштування
    Lampa.SettingsApi.addComponent({
        component: 'keyboard_multi_hide_plugin',
        name: 'Вимкнути розкладку',
        icon: '<svg fill="#fff" width="38px" height="38px" viewBox="0 0 24 24"><path d="M20 5H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Zm1 11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8Zm-6-3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2Zm3.5-4h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Z"/></svg>'
    });
    // Додаємо параметр тригер
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
                // Заміна Modal.confirm на Select.show для підтвердження
                Lampa.Select.show({
                    title: 'Вимкнути розкладку?',
                    items: [
                        { title: 'Так', selected: true },
                        { title: 'Ні' }
                    ],
                    onSelect: function (item) {
                        if (item.title === 'Так') {
                            openLanguageMenu();
                        }
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component');
                    }
                });
            });
        }
    });
    // Застосування приховування при старті
    Lampa.Listener.follow('full', e => e.type === 'start' && setTimeout(applyHiding, 300));
    if (window.appready) setTimeout(applyHiding, 500);
})();
