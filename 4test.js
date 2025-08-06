(function () {
    'use strict';

    // Словник перекладів для підтримки кількох мов
    var translations = {
        my_themes: {
            en: 'My Themes',
            ru: 'Мои темы',
            uk: 'Мої теми'
        },
        description: {
            en: 'Change the palette of application elements',
            ru: 'Измени палитру элементов приложения',
            uk: 'Зміни палітру елементів програми'
        },
        install: {
            en: 'Install',
            ru: 'Установить',
            uk: 'Встановити'
        },
        delete: {
            en: 'Delete',
            ru: 'Удалить',
            uk: 'Видалити'
        },
        theme_categories: {
            en: 'Theme Categories',
            ru: 'Категории тем',
            uk: 'Категорії тем'
        },
        focus_pack: {
            en: 'Focus Pack',
            ru: 'Focus Pack',
            uk: 'Фокус Пак'
        },
        color_gallery: {
            en: 'Color Gallery',
            ru: 'Color Gallery',
            uk: 'Галерея Кольорів'
        },
        theme_installed: {
            en: 'Theme installed:',
            ru: 'Тема установлена:',
            uk: 'Тема встановлена:'
        },
        red: {
            en: 'Red',
            ru: 'Красная',
            uk: 'Червона'
        },
        green: {
            en: 'Green',
            ru: 'Зелёная',
            uk: 'Зелена'
        },
        violet: {
            en: 'Violet',
            ru: 'Фиолетовая',
            uk: 'Фіолетова'
        },
        dark_blue: {
            en: 'Dark Blue',
            ru: 'Тёмно-синяя',
            uk: 'Темно-синя'
        },
        orange: {
            en: 'Orange',
            ru: 'Оранжевая',
            uk: 'Помаранчева'
        },
        pink: {
            en: 'Pink',
            ru: 'Розовая',
            uk: 'Рожева'
        }
    };

    // Резервні тестові дані для тем
    var fallbackThemes = [
        {
            title: 'Red',
            css: 'https://bylampa.github.io/themes/css/red.css',
            logo: 'https://via.placeholder.com/150?text=Red'
        },
        {
            title: 'Green',
            css: 'https://bylampa.github.io/themes/css/green.css',
            logo: 'https://via.placeholder.com/150?text=Green'
        },
        {
            title: 'Violet',
            css: 'https://bylampa.github.io/themes/css/violet.css',
            logo: 'https://via.placeholder.com/150?text=Violet'
        }
    ];

    // Нормалізація назви теми
    function normalizeTitle(title) {
        console.log('Нормалізація назви:', title);
        var map = {
            'Красная': 'red',
            'Зелёная': 'green',
            'Фиолетовая': 'violet',
            'Синяя': 'dark_blue',
            'Оранжевая': 'orange',
            'Розовая': 'pink',
            'Тёмно-синяя': 'dark_blue'
        };
        var normalized = map[title] || title.toLowerCase().replace(/\s/g, '_');
        console.log('Нормалізована назва:', normalized);
        return normalized;
    }

    // Отримання перекладу для заданої мови
    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        return translations[key] && translations[key][lang] ? translations[key][lang] : translations[key] && translations[key].en ? translations[key].en : key;
    }

    // Отримання кольору фокусування
    function getFocusColor() {
        var themeLink = $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]');
        console.log('Посилання на тему:', themeLink.length ? themeLink.attr('href') : 'немає');
        if (themeLink.length) {
            var themeUrl = themeLink.attr('href');
            var colorMap = {
                'red.css': 'rgba(255, 0, 0, 0.3)',
                'green.css': 'rgba(0, 128, 0, 0.3)',
                'violet.css': 'rgba(128, 0, 128, 0.3)',
                'dark_blue.css': 'rgba(0, 0, 128, 0.3)',
                'orange.css': 'rgba(255, 165, 0, 0.3)',
                'pink.css': 'rgba(255, 192, 203, 0.3)',
                'red_stroke.css': 'rgba(255, 0, 0, 0.3)',
                'green_stroke.css': 'rgba(0, 128, 0, 0.3)',
                'violet_stroke.css': 'rgba(128, 0, 128, 0.3)',
                'dark_blue_stroke.css': 'rgba(0, 0, 128, 0.3)',
                'orange_stroke.css': 'rgba(255, 165, 0, 0.3)',
                'pink_stroke.css': 'rgba(255, 192, 203, 0.3)'
            };
            return colorMap[themeUrl.split('/').pop()] || 'var(--focus-color, rgba(255, 255, 255, 0.2))';
        }
        return 'var(--focus-color, rgba(255, 255, 255, 0.2))';
    }

    // Оновлення стилів фокусування
    function updateFocusStyle() {
        setTimeout(function () {
            var focusColor = getFocusColor();
            var styleElement = $('#dynamic-focus-style');
            if (!styleElement.length) {
                styleElement = $('<style id="dynamic-focus-style"></style>');
                $('head').append(styleElement);
            }
            styleElement.text(
                '.my_themes .selector.focus { background: ' + focusColor + ' !important; }' +
                '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }'
            );
            console.log('Оновлено колір фокусу:', focusColor);
        }, 100);
    }

    // Завантаження збереженої теми
    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            var themeLink = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeLink);
            updateFocusStyle();
        }
    } catch (e) {
        console.log('Помилка завантаження теми з localStorage:', e);
    }

    // Додавання компонента в меню налаштувань
    try {
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>'
        });
        console.log('Додано компонент налаштувань:', $('.settings-component__icon').length);
    } catch (e) {
        console.log('Помилка додавання компонента:', e);
    }

    // Додавання параметра для відкриття меню тем
    Lampa.SettingsApi.addParam({
        component: 'my_themes',
        param: {
            name: 'open_themes',
            type: 'trigger',
            default: ''
        },
        field: {
            name: t('my_themes'),
            description: t('description')
        },
        onChange: function () {
            try {
                if ($('.view--category').length || $('#button_category').length) {
                    if (window.activity && window.activity.back) {
                        window.activity.back();
                    }
                }
                var themesCurrent = localStorage.getItem('themesCurrent');
                var activityData = themesCurrent ? JSON.parse(themesCurrent) : {
                    url: 'https://bylampa.github.io/themes/categories/stroke.json',
                    title: t('focus_pack'),
                    component: 'my_themes',
                    page: 1
                };
                Lampa.Activity.push(activityData);
                Lampa.Storage.set('themesCurrent', JSON.stringify(activityData));
            } catch (e) {
                console.log('Помилка в onChange:', e);
            }
        }
    });

    // Компонент для управління темами
    function ThemesComponent(params) {
        var self = this;

        // Ініціалізація параметрів
        if (!params) {
            params = {
                url: 'https://bylampa.github.io/themes/categories/stroke.json',
                title: t('focus_pack'),
                component: 'my_themes',
                page: 1
            };
        }

        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div class="info layer--width"></div>');
        var info = $('<div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div>');
        var body = $('<div class="my_themes category-full"></div>');
        var last;
        var items = [];
        var categories = [
            { title: t('focus_pack'), url: 'https://bylampa.github.io/themes/categories/stroke.json' },
            { title: t('color_gallery'), url: 'https://bylampa.github.io/themes/categories/color_gallery.json' }
        ];

        // Створення компонента
        this.create = function () {
            try {
                console.log('Створення компонента, URL:', params.url);
                this.activity.loader(true);
                $.get(params.url, function (data) {
                    console.log('Дані успішно отримано:', data);
                    this.build(data);
                }.bind(this)).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log('Помилка завантаження даних із:', params.url, 'Статус:', textStatus, 'Помилка:', errorThrown);
                    console.log('Використовуємо резервні дані');
                    this.build(fallbackThemes);
                }.bind(this));
                return this.render();
            } catch (e) {
                console.log('Помилка в create:', e);
                this.build(fallbackThemes);
                return this.render();
            }
        };

        // Додавання карток тем
        this.append = function (data) {
            try {
                console.log('Додавання даних:', data);
                if (!Array.isArray(data)) {
                    console.log('Дані не є масивом:', data);
                    return;
                }
                body.empty();
                items = [];
                data.forEach(function (item, index) {
                    if (!item.title || !item.css) {
                        console.log('Некоректний елемент на позиції', index, ':', item);
                        return;
                    }
                    console.log('Обробка елемента:', item.title);
                    item.title = normalizeTitle(item.title);
                    var card = Lampa.Template.get('card', { title: t(item.title), release_year: '' });
                    if (!card || card.length === 0) {
                        console.log('Помилка: шаблон card не знайдено для', item.title);
                        card = $('<div class="card card--collection selector"><div class="card__view"><img class="card__img" /><div class="card__quality"></div></div><div class="card__title">' + t(item.title) + '</div></div>');
                    }
                    card.addClass('card--collection selector');
                    card.css({
                        textAlign: 'center',
                        display: 'inline-block',
                        visibility: 'visible',
                        opacity: 1
                    });
                    card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6', width: '100%', height: 'auto' });

                    var img = card.find('.card__img')[0];
                    img.onload = function () {
                        card.addClass('card--loaded');
                        console.log('Зображення завантажено:', item.title);
                    };
                    img.onerror = function () {
                        img.src = 'data:image/svg+xml;base64,' + btoa(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
                            '<rect fill="#444" width="150" height="150"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20">No Image</text>' +
                            '</svg>'
                        );
                        console.log('Помилка завантаження зображення:', item.title);
                    };
                    var imageUrl = item.logo && item.logo !== 'url_to_image' ? item.logo : 'https://via.placeholder.com/150?text=' + encodeURIComponent(t(item.title));
                    img.src = imageUrl;

                    if (localStorage.getItem('selectedTheme') === item.css) {
                        var installedButton = document.createElement('div');
                        installedButton.innerText = t('install');
                        installedButton.className = 'card__quality';
                        card.find('.card__view').append(installedButton);
                        $(installedButton).css({
                            position: 'absolute',
                            left: '-3%',
                            bottom: '70%',
                            padding: '0.4em',
                            background: '#ffe216',
                            color: '#000',
                            fontSize: '0.8em',
                            WebkitBorderRadius: '0.3em',
                            MozBorderRadius: '0.3em',
                            borderRadius: '0.3em',
                            textTransform: 'uppercase'
                        });
                    }

                    card.on('hover:focus', function () {
                        last = card[0];
                        $('.selector').removeClass('focus');
                        card.addClass('focus');
                        if (scroll && scroll.collectionFocus) {
                            scroll.collectionFocus(card);
                        }
                        html.find('.info__title').text(t(item.title));
                        console.log('Фокус на картці:', t(item.title));
                    });

                    card.on('hover:enter hover:click', function () {
                        var menuItems = [
                            { title: t('install') },
                            { title: t('delete') }
                        ];
                        Lampa.Select.show({
                            title: '',
                            items: menuItems,
                            onBack: function () { Lampa.Controller.toggle('content'); },
                            onSelect: function (selected) {
                                if (selected.title === t('install')) {
                                    $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                    var themeLink = $('<link rel="stylesheet" href="' + item.css + '">');
                                    $('head').append(themeLink);
                                    localStorage.setItem('selectedTheme', item.css);
                                    $('.card__quality').remove();
                                    var installedButton = document.createElement('div');
                                    installedButton.innerText = t('install');
                                    installedButton.className = 'card__quality';
                                    card.find('.card__view').append(installedButton);
                                    $(installedButton).css({
                                        position: 'absolute',
                                        left: '-3%',
                                        bottom: '70%',
                                        padding: '0.4em',
                                        background: '#ffe216',
                                        color: '#000',
                                        fontSize: '0.8em',
                                        WebkitBorderRadius: '0.3em',
                                        MozBorderRadius: '0.3em',
                                        borderRadius: '0.3em',
                                        textTransform: 'uppercase'
                                    });
                                    updateFocusStyle();
                                    if (Lampa.Storage.get('myBackground') === true) {
                                        var bg = Lampa.Storage.get('myBackground');
                                        Lampa.Storage.set('background', bg);
                                        Lampa.Storage.set('myBackground', 'false');
                                    }
                                    if (Lampa.Storage.get('glass_style') === true) {
                                        var glass = Lampa.Storage.get('glass_style');
                                        Lampa.Storage.set('myGlassStyle', glass);
                                        Lampa.Storage.set('glass_style', 'false');
                                    }
                                    if (Lampa.Storage.get('black_style') === true) {
                                        var black = Lampa.Storage.get('black_style');
                                        Lampa.Storage.set('myBlackStyle', black);
                                        Lampa.Storage.set('black_style', 'false');
                                    }
                                    Lampa.Controller.toggle('content');
                                } else if (selected.title === t('delete')) {
                                    $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                    localStorage.removeItem('selectedTheme');
                                    $('.card__quality').remove();
                                    updateFocusStyle();
                                    if (localStorage.getItem('myBackground')) {
                                        Lampa.Storage.set('myBackground', Lampa.Storage.get('myBackground'));
                                        localStorage.removeItem('myBackground');
                                    }
                                    if (localStorage.getItem('myGlassStyle')) {
                                        Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                                        localStorage.removeItem('myGlassStyle');
                                    }
                                    if (localStorage.getItem('myBlackStyle')) {
                                        Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                                        localStorage.removeItem('myBlackStyle');
                                    }
                                    Lampa.Controller.toggle('content');
                                }
                            }
                        });
                    });

                    body.append(card);
                    items.push(card);
                    console.log('Додано картку:', item.title, 'Загальна кількість:', items.length);
                });
                console.log('Додано карток:', items.length);
                scroll.render().find('.scroll__content').append(body);
                console.log('Body додано до scroll__content:', body.parent().length);
            } catch (e) {
                console.log('Помилка в append:', e);
            }
        };

        // Побудова інтерфейсу
        this.build = function (data) {
            try {
                console.log('Отримані дані:', data);
                Lampa.Template.add('button_category', '<div id="button_category">' +
                    '<style>' +
                    '@media screen and (max-width: 2560px) {' +
                    '.themes .card--collection { width: 14.2% !important; margin-top: 1em !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important; }' +
                    '.my_themes .selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }' +
                    '.settings-component__icon svg { display: block !important; }' +
                    '.scroll__content { padding: 1.5em 0 !important; box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.info { height: 9em !important; margin-bottom: 0.5em !important; }' +
                    '.info__left { float: left; width: 100%; }' +
                    '.info__right { display: none !important; }' +
                    '.info__title-original { font-size: 1.2em; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '}' +
                    '@media screen and (max-width: 385px) {' +
                    '.themes .card--collection { width: 33.3% !important; margin-top: 1em !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important; }' +
                    '.my_themes .selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }' +
                    '.settings-component__icon svg { display: block !important; }' +
                    '.info__right { display: none !important; }' +
                    '.scroll__content { box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '}' +
                    '@media screen and (max-width: 580px) {' +
                    '.themes .card--collection { width: 25% !important; margin-top: 1em !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important; }' +
                    '.my_themes .selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }' +
                    '.settings-component__icon svg { display: block !important; }' +
                    '.info__right { display: none !important; }' +
                    '.scroll__content { box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '}' +
                    '</style>' +
                    '<div class="full-start__button selector view--category">' +
                    '<svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<g id="info"/>' +
                    '<g id="icons">' +
                    '<g id="menu">' +
                    '<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>' +
                    '<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>' +
                    '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>' +
                    '</g></g></svg>' +
                    '<span>' + t('theme_categories') + '</span>' +
                    '</div></div>');
                var button = Lampa.Template.get('button_category');
                info.empty().append(button);
                var categoryButton = info.find('.view--category');
                categoryButton.addClass('selector').on('hover:focus', function () {
                    $('.selector').removeClass('focus');
                    $(this).addClass('focus');
                    Lampa.Controller.toggle('content');
                    console.log('Фокус на кнопці категорії');
                }).on('hover:enter', self.selectGroup.bind(self));
                scroll.render().addClass('layer--wheight').data('mheight', info);
                html.empty().append(info).append(scroll.render());
                if (data && Array.isArray(data) && data.length) {
                    this.append(data);
                } else {
                    console.log('Дані порожні або некоректні, використовуємо резервні дані');
                    this.append(fallbackThemes);
                }
                setTimeout(function () {
                    self.activity.loader(false);
                    self.activity.toggle();
                    console.log('Картки у DOM:', scroll.render().find('.card').length);
                }, 100);
            } catch (e) {
                console.log('Помилка в build:', e);
                this.append(fallbackThemes);
                self.activity.loader(false);
                self.activity.toggle();
            }
        };

        // Вибір категорії тем
        this.selectGroup = function () {
            try {
                Lampa.Select.show({
                    title: t('theme_categories'),
                    items: categories,
                    onSelect: function (item) {
                        var activityData = {
                            url: item.url,
                            title: item.title,
                            component: 'my_themes',
                            page: 1
                        };
                        Lampa.Activity.push(activityData);
                        Lampa.Storage.set('themesCurrent', JSON.stringify(activityData));
                    },
                    onBack: function () { 
                        Lampa.Controller.toggle('content'); 
                    }
                });
            } catch (e) {
                console.log('Помилка в selectGroup:', e);
            }
        };

        // Ініціалізація навігації
        this.start = function () {
            try {
                console.log('Картки:', scroll.render().find('.card').length);
                console.log('Кнопка категорії:', info.find('.view--category').length);
                Lampa.Controller.add('content', {
                    toggle: function () {
                        $('.selector').removeClass('focus');
                        if (scroll.render().find('.card').length > 0) {
                            var firstCard = scroll.render().find('.card')[0];
                            Navigator.focus(firstCard);
                            $(firstCard).addClass('focus');
                            console.log('Фокус на першій картці');
                        } else if (info.find('.view--category').length > 0) {
                            var categoryButton = info.find('.view--category')[0];
                            Navigator.focus(categoryButton);
                            $(categoryButton).addClass('focus');
                            console.log('Фокус на кнопці категорії');
                        }
                    },
                    left: function () {
                        if (Navigator.canmove('left')) {
                            Navigator.move('left');
                            $('.selector').removeClass('focus');
                            var focused = $('.selector:hover')[0];
                            if (focused) {
                                Navigator.focus(focused);
                                $(focused).addClass('focus');
                                console.log('Переміщення вліво, фокус:', focused);
                            }
                        } else {
                            Lampa.Controller.toggle('menu');
                        }
                    },
                    right: function () {
                        if (Navigator.canmove('right')) {
                            Navigator.move('right');
                            $('.selector').removeClass('focus');
                            var focused = $('.selector:hover')[0];
                            if (focused) {
                                Navigator.focus(focused);
                                $(focused).addClass('focus');
                                console.log('Переміщення вправо, фокус:', focused);
                            }
                        } else {
                            self.selectGroup();
                        }
                    },
                    up: function () {
                        if (Navigator.canmove('up')) {
                            Navigator.move('up');
                            $('.selector').removeClass('focus');
                            var focused = $('.selector:hover')[0];
                            if (focused) {
                                Navigator.focus(focused);
                                $(focused).addClass('focus');
                                console.log('Переміщення вгору, фокус:', focused);
                            }
                        } else {
                            if (info.find('.view--category').length > 0 && !info.find('.view--category').hasClass('focus')) {
                                var categoryButton = info.find('.view--category')[0];
                                Navigator.focus(categoryButton);
                                $('.selector').removeClass('focus');
                                $(categoryButton).addClass('focus');
                                console.log('Переміщення вгору до кнопки категорії');
                            } else {
                                Lampa.Controller.toggle('head');
                            }
                        }
                    },
                    down: function () {
                        if (Navigator.canmove('down')) {
                            Navigator.move('down');
                            $('.selector').removeClass('focus');
                            var focused = $('.selector:hover')[0];
                            if (focused) {
                                Navigator.focus(focused);
                                $(focused).addClass('focus');
                                console.log('Переміщення вниз, фокус:', focused);
                            }
                        } else if (info.find('.view--category').hasClass('focus')) {
                            if (scroll.render().find('.card').length > 0) {
                                var firstCard = scroll.render().find('.card')[0];
                                Navigator.focus(firstCard);
                                $('.selector').removeClass('focus');
                                $(firstCard).addClass('focus');
                                console.log('Переміщення вниз до першої картки');
                            }
                        }
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });
                Lampa.Controller.toggle('content');
            } catch (e) {
                console.log('Помилка в start:', e);
            }
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { 
            return html; 
        };
        this.destroy = function () {
            try {
                scroll.destroy();
                if (info) info.remove();
                html.remove();
                body.remove();
                items = null;
                html = null;
                body = null;
                info = null;
            } catch (e) {
                console.log('Помилка в destroy:', e);
            }
        };
    }

    // Реєстрація компонента
    Lampa.Component.add('my_themes', ThemesComponent);

    // Слухач подій для скидання теми
    Lampa.Storage.listener.follow('app', function (e) {
        if (e.name === 'egg' && Lampa.Activity.active().component !== 'my_themes') {
            $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
            updateFocusStyle();
        }
    });
})();
