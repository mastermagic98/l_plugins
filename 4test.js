(function () {
    'use strict';

    // Словник перекладів для трьох мов
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

    // Функція для нормалізації title до ключа
    function normalizeTitle(title) {
        var map = {
            'Красная': 'red',
            'Зелёная': 'green',
            'Фиолетовая': 'violet',
            'Тёмно-синяя': 'dark_blue',
            'Оранжевая': 'orange',
            'Розовая': 'pink'
        };
        return map[title] || title.toLowerCase().replace(/\s/g, '_');
    }

    // Функція для отримання перекладу
    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        return translations[key] && translations[key][lang] ? translations[key][lang] : translations[key] && translations[key].en ? translations[key].en : key;
    }

    // Функція для отримання кольору фокусування з теми
    function getFocusColor() {
        var themeLink = $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]');
        if (themeLink.length) {
            var themeUrl = themeLink.attr('href');
            var colorMap = {
                'red.css': 'rgba(255, 0, 0, 0.3)',
                'green.css': 'rgba(0, 128, 0, 0.3)',
                'violet.css': 'rgba(128, 0, 128, 0.3)',
                'dark_blue.css': 'rgba(0, 0, 128, 0.3)',
                'orange.css': 'rgba(255, 165, 0, 0.3)',
                'pink.css': 'rgba(255, 192, 203, 0.3)'
            };
            return colorMap[themeUrl.split('/').pop()] || 'var(--focus-color, rgba(255, 255, 255, 0.2))';
        }
        return 'var(--focus-color, rgba(255, 255, 255, 0.2))';
    }

    // Оновлення стилю фокусування
    function updateFocusStyle() {
        var focusColor = getFocusColor();
        var styleElement = $('#dynamic-focus-style');
        if (!styleElement.length) {
            styleElement = $('<style id="dynamic-focus-style"></style>');
            $('head').append(styleElement);
        }
        styleElement.text(
            '.selector.focus { background: ' + focusColor + ' !important; }' +
            '.card--collection.focus { background: none !important; outline: none !important; }'
        );
        console.log('Focus color updated:', focusColor);
    }

    // Завантаження вибраної теми з localStorage
    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            var themeLink = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeLink);
            updateFocusStyle();
        }
    } catch (e) {}

    // Додавання компонента в меню налаштувань
    try {
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>'
        });

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
                } catch (e) {}
            }
        });
    } catch (e) {}

    // Компонент для управління темами
    function ThemesComponent(params) {
        // Зберігаємо контекст для методів
        var self = this;

        // Перевірка параметрів
        if (!params) {
            params = {
                url: 'https://bylampa.github.io/themes/categories/stroke.json',
                title: t('focus_pack'),
                component: 'my_themes',
                page: 1
            };
        }

        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"><div id="stantion_filtr"></div></div></div>');
        var body = $('<div class="my_themes category-full"></div>');
        var info = html;
        var last;
        var items = [];
        var categories = [
            { title: t('focus_pack'), url: 'https://bylampa.github.io/themes/categories/stroke.json' },
            { title: t('color_gallery'), url: 'https://bylampa.github.io/themes/categories/color_gallery.json' }
        ];

        this.create = function () {
            try {
                this.activity.loader(true);
                $.get(params.url, this.build.bind(this)).fail(function () {
                    var empty = new Lampa.Empty();
                    html.append(empty.render());
                    this.activity.loader(false);
                    this.activity.toggle();
                });
                return this.render();
            } catch (e) {
                console.log('Error in create:', e);
                return this.render();
            }
        };

        this.append = function (data) {
            try {
                console.log('Appending data:', data);
                data.forEach(function (item) {
                    item.title = normalizeTitle(item.title);
                    var card = Lampa.Template.get('card', { title: t(item.title), release_year: '' });
                    card.addClass('card--collection selector');
                    card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                    card.css({ textAlign: 'center' });

                    var img = card.find('.card__img')[0];
                    img.onload = function () {
                        card.addClass('card--loaded');
                    };
                    img.onerror = function () {
                        img.src = 'data:image/svg+xml;base64,' + btoa(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
                            '<rect fill="#444" width="150" height="150"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20">No Image</text>' +
                            '</svg>'
                        );
                    };
                    var imageUrl = item.logo || '';
                    if (!imageUrl) {
                        img.src = 'data:image/svg+xml;base64,' + btoa(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
                            '<rect fill="#444" width="150" height="150"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20">No Image</text>' +
                            '</svg>'
                        );
                    } else {
                        img.src = imageUrl;
                    }

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
                });

                // Додаємо body до .info__left перед .info__create
                info.find('.info__create').before(body);
            } catch (e) {
                console.log('Error in append:', e);
            }
        };

        this.build = function (data) {
            try {
                console.log('Received data:', data);
                Lampa.Template.add('button_category', '<div id="button_category">' +
                    '<style>' +
                    '@media screen and (max-width: 2560px) {' +
                    '.themes .card--collection { width: 14.2% !important; margin-top: 1em !important; }' +
                    '.selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.card--collection.focus { background: none !important; outline: none !important; }' +
                    '.scroll__content { padding: 1.5em 0 !important; box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.info { height: 9em !important; margin-bottom: 0.5em !important; }' +
                    '.info__left { float: left; width: 100%; }' +
                    '.info__right { display: none !important; }' +
                    '.info__title-original { font-size: 1.2em; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.settings::before, .settings::after, .settings__content::before, .settings__content::after, .layer--width::before, .layer--width::after, .scroll::before, .scroll::after { display: none !important; }' +
                    '.settings-folders, .settings-folder, .settings-param { box-shadow: none !important; background: none !important; }' +
                    '.settings-folders::before, .settings-folders::after, .settings-folder::before, .settings-folder::after, .settings-param::before, .settings-param::after { display: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '}' +
                    '@media screen and (max-width: 385px) {' +
                    '.themes .card--collection { width: 33.3% !important; margin-top: 1em !important; }' +
                    '.selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.card--collection.focus { background: none !important; outline: none !important; }' +
                    '.info__right { display: none !important; }' +
                    '.scroll__content { box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.settings::before, .settings::after, .settings__content::before, .settings__content::after, .layer--width::before, .layer--width::after, .scroll::before, .scroll::after { display: none !important; }' +
                    '.settings-folders, .settings-folder, .settings-param { box-shadow: none !important; background: none !important; }' +
                    '.settings-folders::before, .settings-folders::after, .settings-folder::before, .settings-folder::after, .settings-param::before, .settings-param::after { display: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '}' +
                    '@media screen and (max-width: 580px) {' +
                    '.themes .card--collection { width: 25% !important; margin-top: 1em !important; }' +
                    '.selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.card--collection.focus { background: none !important; outline: none !important; }' +
                    '.info__right { display: none !important; }' +
                    '.scroll__content { box-shadow: none !important; background: none !important; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.settings::before, .settings::after, .settings__content::before, .settings__content::after, .layer--width::before, .layer--width::after, .scroll::before, .scroll::after { display: none !important; }' +
                    '.settings-folders, .settings-folder, .settings-param { box-shadow: none !important; background: none !important; }' +
                    '.settings-folders::before, .settings-folders::after, .settings-folder::before, .settings-folder::after, .settings-param::before, .settings-param::after { display: none !important; }' +
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
                    '<path d="M4,8h12c1.1,0-2,0.9-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>' +
                    '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>' +
                    '</g></g></svg>' +
                    '<span>' + t('theme_categories') + '</span>' +
                    '</div></div>');
                var button = Lampa.Template.get('button_category');
                info.find('.info__left').prepend(button);
                var categoryButton = info.find('.view--category');
                categoryButton.addClass('selector').on('hover:focus', function () {
                    $('.selector').removeClass('focus');
                    $(this).addClass('focus');
                    Lampa.Controller.toggle('content');
                }).on('hover:enter', self.selectGroup.bind(self));
                scroll.render().addClass('layer--wheight').data('mheight', info);
                html.append(info);
                html.append(scroll.render());
                this.append(data);
                this.activity.loader(false);
                this.activity.toggle();
            } catch (e) {
                console.log('Error in build:', e);
            }
        };

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
                console.log('Error in selectGroup:', e);
            }
        };

        this.start = function () {
            try {
                console.log('Cards:', scroll.render().find('.card').length);
                console.log('Category button:', info.find('.view--category').length);
                Lampa.Controller.add('content', {
                    toggle: function () {
                        $('.selector').removeClass('focus');
                        if (scroll.render().find('.card').length > 0) {
                            var firstCard = scroll.render().find('.card')[0];
                            Navigator.focus(firstCard);
                            $(firstCard).addClass('focus');
                        } else if (info.find('.view--category').length > 0) {
                            var categoryButton = info.find('.view--category')[0];
                            Navigator.focus(categoryButton);
                            $(categoryButton).addClass('focus');
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
                            }
                        } else {
                            if (info.find('.view--category').length > 0 && !info.find('.view--category').hasClass('focus')) {
                                var categoryButton = info.find('.view--category')[0];
                                Navigator.focus(categoryButton);
                                $('.selector').removeClass('focus');
                                $(categoryButton).addClass('focus');
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
                            }
                        } else if (info.find('.view--category').hasClass('focus')) {
                            if (scroll.render().find('.card').length > 0) {
                                var firstCard = scroll.render().find('.card')[0];
                                Navigator.focus(firstCard);
                                $('.selector').removeClass('focus');
                                $(firstCard).addClass('focus');
                            }
                        }
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });
                Lampa.Controller.toggle('content');
            } catch (e) {
                console.log('Error in start:', e);
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
            } catch (e) {}
        };
    }

    // Реєстрація компонента
    try {
        Lampa.Component.add('my_themes', ThemesComponent);
    } catch (e) {}

    // Видалення стилів теми при зміні компонента
    try {
        Lampa.Storage.listener.follow('app', function (e) {
            if (e.name === 'egg' && Lampa.Activity.active().component !== 'my_themes') {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                updateFocusStyle();
            }
        });
    } catch (e) {}
})();
