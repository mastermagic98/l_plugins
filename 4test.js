(function () {
    'use strict';

    // Словник перекладів
    var translations = {
        my_themes: { en: 'My Themes', ru: 'Мои темы', uk: 'Мої теми' },
        description: { en: 'Change the palette of application elements', ru: 'Измени палитру элементов приложения', uk: 'Зміни палітру елементів програми' },
        install: { en: 'Install', ru: 'Установить', uk: 'Встановити' },
        delete: { en: 'Delete', ru: 'Удалить', uk: 'Видалити' },
        theme_categories: { en: 'Theme Categories', ru: 'Категории тем', uk: 'Категорії тем' },
        focus_pack: { en: 'Focus Pack', ru: 'Focus Pack', uk: 'Фокус Пак' },
        color_gallery: { en: 'Color Gallery', ru: 'Color Gallery', uk: 'Галерея Кольорів' },
        theme_installed: { en: 'Theme installed:', ru: 'Тема установлена:', uk: 'Тема встановлена:' },
        red: { en: 'Red', ru: 'Красная', uk: 'Червона' },
        green: { en: 'Green', ru: 'Зелёная', uk: 'Зелена' },
        violet: { en: 'Violet', ru: 'Фиолетовая', uk: 'Фіолетова' },
        dark_blue: { en: 'Dark Blue', ru: 'Тёмно-синяя', uk: 'Темно-синя' },
        orange: { en: 'Orange', ru: 'Оранжевая', uk: 'Помаранчева' },
        pink: { en: 'Pink', ru: 'Розовая', uk: 'Рожева' }
    };

    // Функція для нормалізації title
    function normalizeTitle(title) {
        console.log('Normalizing title:', title);
        var map = {
            'Красная': 'red',
            'Зелёная': 'green',
            'Фиолетовая': 'violet',
            'Синяя': 'dark_blue',
            'Тёмно-синяя': 'dark_blue',
            'Оранжевая': 'orange',
            'Розовая': 'pink'
        };
        return map[title] || title.toLowerCase().replace(/\s/g, '_');
    }

    // Функція для отримання перекладу
    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        console.log('Language:', lang);
        return translations[key] && translations[key][lang] ? translations[key][lang] : translations[key] && translations[key].en ? translations[key].en : key;
    }

    // Функція для отримання кольору фокусування
    function getFocusColor() {
        var themeLink = $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]');
        console.log('Theme link:', themeLink.length ? themeLink.attr('href') : 'none');
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
        setTimeout(function () {
            var focusColor = getFocusColor();
            var styleElement = $('#dynamic-focus-style');
            if (!styleElement.length) {
                styleElement = $('<style id="dynamic-focus-style"></style>');
                $('head').append(styleElement);
            }
            styleElement.text(
                '.my_themes .selector.focus { background: ' + focusColor + ' !important; }' +
                '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }' +
                '.settings, .settings__content { background: rgba(0, 0, 0, 0.8) !important; }' +
                '.settings-component__icon svg { display: block !important; width: 24px; height: 24px; }' +
                '.info__left { margin-bottom: 1em; }' +
                '.wrap__content.layer--height.layer--width { width: 100% !important; min-height: 100vh !important; }' +
                '.activitys.layer--width, .activity.layer--width { width: 100% !important; }' +
                '.info.layer--width { width: 100% !important; height: auto !important; }' +
                '.scroll.scroll--mask.scroll--over.layer--wheight { width: 100% !important; height: 100% !important; }' +
                '.scroll__content { width: 100% !important; height: 100% !important; padding: 1.5em 0 !important; }' +
                '.scroll__body { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; padding: 1em; }' +
                '.my_themes.category-full { margin-top: 4em; width: 100% !important; min-height: 100vh !important; display: flex; flex-wrap: wrap; justify-content: center; }' +
                '#spacer { height: 25em; }'
            );
            console.log('Focus color updated:', focusColor);
        }, 100);
    }

    // Завантаження вибраної теми
    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            var themeLink = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeLink);
            updateFocusStyle();
        }
    } catch (e) {
        console.log('Error loading theme from localStorage:', e);
    }

    // Додавання компонента в меню налаштувань
    try {
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/></svg>'
        });
        console.log('Settings component added:', $('.settings-component__icon').length, $('.settings-component__icon').html());
        console.log('Settings menu HTML:', $('.settings').html());
    } catch (e) {
        console.log('Error adding component:', e);
    }

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
                console.log('Error in onChange:', e);
            }
        }
    });

    // Компонент для управління темами
    function ThemesComponent(params) {
        var self = this;

        if (!params) {
            params = {
                url: 'https://bylampa.github.io/themes/categories/stroke.json',
                title: t('focus_pack'),
                component: 'my_themes',
                page: 1
            };
        }

        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var html = $('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"></div></div>');
        var infoRight = html.find('.info__right');
        var body = $('<div class="my_themes category-full"><div class="scroll__body"></div></div>');
        var scrollBody = body.find('.scroll__body');
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
                scrollBody.empty();
                data.forEach(function (item) {
                    console.log('Processing item:', item.title);
                    item.title = normalizeTitle(item.title);
                    var card = Lampa.Template.get('card', { title: t(item.title), release_year: '' });
                    card.addClass('card--collection selector layer--visible layer--render');
                    card.find('.card__img').css({ cursor: 'pointer', backgroundColor: 'rgba(53, 53, 53, 0.65)' });
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
                        console.log('Card focused:', t(item.title));
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

                    scrollBody.append(card);
                    items.push(card);
                });
                scrollBody.append('<div id="spacer" style="height: 25em;"></div>');
                console.log('Cards appended:', items.length);
                console.log('Scroll body exists:', scrollBody.length);
                scroll.render().find('.scroll__content').empty().append(body);
                console.log('Body appended to DOM:', body.parent().length);
                setTimeout(function () {
                    console.log('Cards in DOM:', scroll.render().find('.card').length);
                    console.log('Scroll content HTML:', scroll.render().find('.scroll__content').html());
                    console.log('my_themes HTML:', $('.my_themes.category-full').html());
                    console.log('Scroll body HTML:', scrollBody.html());
                }, 1000);
            } catch (e) {
                console.log('Error in append:', e);
            }
        };

        this.build = function (data) {
            try {
                console.log('Received data:', data);
                Lampa.Template.add('button_category', '<div id="stantion_filtr"><div id="button_category">' +
                    '<style>' +
                    '@media screen and (max-width: 2560px) {' +
                    '.themes .card--collection { width: 14.2% !important; margin-right: 1em; }' +
                    '.my_themes .selector.focus { background: var(--focus-color, rgba(255, 255, 255, 0.2)) !important; }' +
                    '.my_themes .card.focus, .my_themes .card--collection.focus { background: none !important; outline: none !important; border: none !important; }' +
                    '.settings, .settings__content { background: rgba(0, 0, 0, 0.8) !important; }' +
                    '.settings-component__icon svg { display: block !important; width: 24px; height: 24px; }' +
                    '.scroll.scroll--mask.scroll--over.layer--wheight { width: 100% !important; height: 100% !important; }' +
                    '.scroll__content { width: 100% !important; height: 100% !important; padding: 1.5em 0 !important; box-shadow: none !important; background: none !important; }' +
                    '.scroll__body { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; padding: 1em; }' +
                    '.scroll__content::before, .scroll__content::after { display: none !important; }' +
                    '.info.layer--width { width: 100% !important; height: 9em !important; margin-bottom: 0.5em !important; }' +
                    '.info__left { float: none; width: 100%; display: flex; justify-content: flex-end; }' +
                    '.info__title, .info__title-original { font-size: 1.2em; display: none; }' +
                    '.info__create { display: none; }' +
                    '.info__right { display: contents !important; }' +
                    '.layer--wheight { box-shadow: none !important; background: none !important; }' +
                    '.layer--wheight::before, .layer--wheight::after { display: none !important; }' +
                    '.layer--width, .scroll { box-shadow: none !important; background: none !important; }' +
                    '.settings::before, .settings::after, .settings__content::before, .settings__content::after, .layer--width::before, .layer--width::after, .scroll::before, .scroll::after { display: none !important; }' +
                    '.settings-folders, .settings-folder, .settings-param { box-shadow: none !important; background: none !important; }' +
                    '.settings-folders::before, .settings-folders::after, .settings-folder::before, .settings-folder::after, .settings-param::before, .settings-param::after { display: none !important; }' +
                    '.full-start__button { width: fit-content !important; margin: 0.5em 0; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }' +
                    '.view--category { display: flex; align-items: center; margin: 0.5em 0; }' +
                    '.view--category svg { margin-right: 0.3em; }' +
                    '.my_themes.category-full { margin-top: 4em; width: 100% !important; min-height: 100vh !important; display: flex; flex-wrap: wrap; justify-content: center; }' +
                    '#spacer { height: 25em; }' +
                    '}' +
                    '@media screen and (max-width: 385px) {' +
                    '.themes .card--collection { width: 33.3% !important; margin-right: 1em; }' +
                    '.info__right { display: contents !important; }' +
                    '.my_themes.category-full { margin-top: 4em; width: 100% !important; min-height: 100vh !important; }' +
                    '}' +
                    '@media screen and (max-width: 580px) {' +
                    '.themes .card--collection { width: 25% !important; margin-right: 1em; }' +
                    '.info__right { display: contents !important; }' +
                    '.my_themes.category-full { margin-top: 4em; width: 100% !important; min-height: 100vh !important; }' +
                    '}' +
                    '</style>' +
                    '<div class="full-start__button selector view--category">' +
                    '<svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<g id="info"/>' +
                    '<g id="icons"><g id="menu">' +
                    '<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>' +
                    '<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>' +
                    '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>' +
                    '</g></g></svg>' +
                    '<span>' + t('theme_categories') + '</span>' +
                    '</div></div></div>');
                html.empty();
                var button = Lampa.Template.get('button_category');
                infoRight.empty().append(button);
                var categoryButton = infoRight.find('.view--category');
                categoryButton.addClass('selector').on('hover:focus', function () {
                    $('.selector').removeClass('focus');
                    $(this).addClass('focus');
                    Lampa.Controller.toggle('content');
                    console.log('Category button focused');
                }).on('hover:enter', self.selectGroup.bind(self));
                scroll.render().addClass('layer--wheight').data('mheight', html);
                html.append(scroll.render());
                this.append(data);
                this.activity.loader(false);
                this.activity.toggle();
                console.log('Icon check:', $('.settings-component__icon svg').length, $('.settings-component__icon').html());
                console.log('Final HTML:', html.html());
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
                console.log('Category button:', infoRight.find('.view--category').length);
                console.log('Scroll body exists:', body.find('.scroll__body').length);
                Lampa.Controller.add('content', {
                    toggle: function () {
                        $('.selector').removeClass('focus');
                        if (infoRight.find('.view--category').length > 0) {
                            var categoryButton = infoRight.find('.view--category')[0];
                            Navigator.focus(categoryButton);
                            $(categoryButton).addClass('focus');
                            console.log('Focused category button');
                        } else if (scroll.render().find('.card').length > 0) {
                            var firstCard = scroll.render().find('.card')[0];
                            Navigator.focus(firstCard);
                            $(firstCard).addClass('focus');
                            console.log('Focused first card');
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
                                console.log('Moved left, focused:', focused);
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
                                console.log('Moved right, focused:', focused);
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
                                console.log('Moved up, focused:', focused);
                            }
                        } else {
                            if (infoRight.find('.view--category').length > 0 && !infoRight.find('.view--category').hasClass('focus')) {
                                var categoryButton = infoRight.find('.view--category')[0];
                                Navigator.focus(categoryButton);
                                $('.selector').removeClass('focus');
                                $(categoryButton).addClass('focus');
                                console.log('Moved up to category button');
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
                                console.log('Moved down, focused:', focused);
                            }
                        } else if (infoRight.find('.view--category').hasClass('focus')) {
                            if (scroll.render().find('.card').length > 0) {
                                var firstCard = scroll.render().find('.card')[0];
                                Navigator.focus(firstCard);
                                $('.selector').removeClass('focus');
                                $(firstCard).addClass('focus');
                                console.log('Moved down to first card');
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
                html.remove();
                body.remove();
                items = null;
                html = null;
                body = null;
            } catch (e) {
                console.log('Error in destroy:', e);
            }
        };
    }

    Lampa.Component.add('my_themes', ThemesComponent);

    Lampa.Storage.listener.follow('app', function (e) {
        if (e.name === 'egg' && Lampa.Activity.active().component !== 'my_themes') {
            $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
            updateFocusStyle();
        }
    });
})();
