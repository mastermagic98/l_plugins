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
        // Переклади для назв тем
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

    // Функція для отримання перекладу
    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        console.log('Використовується мова: ' + lang);
        return translations[key] && translations[key][lang] ? translations[key][lang] : translations[key] && translations[key].en ? translations[key].en : key;
    }

    // Завантаження вибраної теми з localStorage
    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            var themeLink = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeLink);
            console.log('Завантажено тему: ' + selectedTheme);
        }
    } catch (e) {
        console.error('Помилка при завантаженні теми: ' + e);
    }

    // Додавання компонента в меню налаштувань
    try {
        console.log('Реєструємо компонент my_themes у SettingsApi');
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg fill="none" width="800px" height="800px" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="m 12.52,3.08629 -1.49808,0 -0.6618,0.72 1.92,0 0,5.76 -10.56,0 0,-5.76 6.1428,0 0.50724,-0.72 -6.89016,0 c -0.26508,0 -0.48,0.21492 -0.48,0.48 l 0,6.96 c 0,0.26508 0.21492,0.48 0.48,0.48 l 11.04,0 c 0.26508,0 0.48,-0.21492 0.48,-0.48 l 0,-6.96 c 0,-0.26508 -0.21492,-0.48 -0.48,-0.48 z M 11.0092,1.45069 C 10.68664,1.19101 10.153,1.31893 9.81664,1.73629 L 6.40984,6.57661 C 6.07348,6.99385 6.07516,6.91417 6.39736,7.17361 6.71956,7.43329 6.64192,7.45189 6.97828,7.03465 L 10.9834,2.67661 c 0.33636,-0.4176 0.34812,-0.96636 0.0258,-1.22592 z m -0.87612,0.57936 c 0,0 -0.04992,-0.05796 -0.21588,-0.19068 0.24888,-0.40644 0.738,-0.33192 0.738,-0.33192 -0.46368,0.27384 -0.52212,0.5226 -0.52212,0.5226 z M 4.19992,8.38453 C 4.864,8.37933 4.94668,8.21929 5.16316,7.55257 5.5624,6.50041 7.36024,7.82809 6.24604,8.28889 5.13184,8.74993 3.53584,8.38969 4.19992,8.38453 Z m 4.35096,3.98292 C 8.34304,12.21457 8.32072,11.98489 8.32072,11.98489 l -0.078,-0.4986 -2.48568,0 -0.07824,0.49824 c 0,0 -0.02172,0.22992 -0.22968,0.3828 -0.20784,0.15288 -0.37188,0.28416 -0.20784,0.30648 0.15804,0.02136 1.6488,0.0019 1.75872,0 0.11016,0.0019 1.60056,0.02136 1.75848,0 0.16392,-0.02208 -2.4e-4,-0.15312 -0.2076,-0.30636 z"/>' +
                  '</svg>'
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
                console.log('Клік по пункту меню "Мої теми"');
                try {
                    if ($('.view--category').length || $('#button_category').length) {
                        if (window.activity && window.activity.back) {
                            console.log('Виконуємо window.activity.back');
                            window.activity.back();
                        } else {
                            console.warn('window.activity.back недоступний');
                        }
                    }
                    var themesCurrent = localStorage.getItem('themesCurrent');
                    var activityData = themesCurrent ? JSON.parse(themesCurrent) : {
                        url: 'https://bylampa.github.io/themes/categories/stroke.json',
                        title: t('focus_pack'),
                        component: 'my_themes',
                        page: 1
                    };
                    console.log('Запускаємо активність: ' + JSON.stringify(activityData));
                    Lampa.Activity.push(activityData);
                    Lampa.Storage.set('themesCurrent', JSON.stringify(activityData));
                } catch (e) {
                    console.error('Помилка при кліку по пункту меню: ' + e);
                }
            }
        });
    } catch (e) {
        console.error('Помилка при додаванні компонента my_themes у SettingsApi: ' + e);
    }

    // Компонент для управління темами
    function ThemesComponent(params) {
        // Перевірка параметрів
        if (!params) {
            console.warn('Параметри для ThemesComponent не передані, використовуємо значення за замовчуванням');
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
                console.log('Викликано метод create з параметрами: ' + JSON.stringify(params));
                this.activity.loader(true);

                // Використовуємо jQuery AJAX
                $.get(params.url, this.build.bind(this)).fail(function () {
                    console.log('Помилка завантаження даних, рендеримо пустий екран');
                    var empty = new Lampa.Empty();
                    html.append(empty.render());
                    this.activity.loader(false);
                    this.activity.toggle();
                });

                return this.render();
            } catch (e) {
                console.error('Помилка в методі create: ' + e);
                return this.render();
            }
        };

        this.append = function (data) {
            try {
                console.log('Викликано метод append з даними: ' + JSON.stringify(data));
                data.forEach(function (item) {
                    console.log('Обробка елемента: ' + JSON.stringify(item));
                    var card = Lampa.Template.get('card', { title: t(item.title), release_year: '' });
                    card.addClass('card--collection');
                    card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                    card.css({ textAlign: 'center' });

                    var img = card.find('.card__img')[0];
                    img.onload = function () {
                        console.log('Зображення завантажено: ' + img.src);
                        card.addClass('card--loaded');
                    };
                    img.onerror = function () {
                        console.error('Помилка завантаження зображення: ' + img.src);
                        img.src = 'data:image/svg+xml;base64,' + btoa(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
                            '<rect fill="#444" width="150" height="150"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20">No Image</text>' +
                            '</svg>'
                        );
                    };
                    var imageUrl = item.logo || '';
                    console.log('Спроба завантаження зображення: ' + imageUrl);
                    if (!imageUrl) {
                        console.warn('Немає URL зображення для: ' + item.title);
                        img.src = 'data:image/svg+xml;base64,' + btoa(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
                            '<rect fill="#444" width="150" height="150"/>' +
                            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="20">No Image</text>' +
                            '</svg>'
                        );
                    } else {
                        img.src = imageUrl;
                    }

                    html.find('.info__title').text(t(item.title));

                    function addInstallButton() {
                        var button = document.createElement('div');
                        button.innerText = t('install');
                        button.className = 'selector';
                        card.find('.card__view').append(button);
                        $(button).css({
                            position: 'absolute',
                            left: '-3%',
                            bottom: '0.8em',
                            padding: '0.4em 0.4em',
                            background: '#000',
                            color: '#ffe216',
                            fontSize: '0.3em',
                            WebkitBorderRadius: '0.3em',
                            MozBorderRadius: '0.3em',
                            borderRadius: '0.3em',
                            textTransform: 'uppercase'
                        });
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
                    } else {
                        addInstallButton();
                    }

                    card.on('hover:focus', function () {
                        last = card[0];
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
                                    console.log(t('theme_installed') + ' ' + item.css);
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
            } catch (e) {
                console.error('Помилка в методі append: ' + e);
            }
        };

        this.build = function (data) {
            try {
                console.log('Викликано метод build');
                Lampa.Template.add('button_category', '<div id="button_category">' +
                    '<style>' +
                    '@media screen and (max-width: 2560px) {' +
                    '.themes .card--collection { width: 14.2% !important; margin-top: 1em !important; }' +
                    '.scroll__content { padding: 0.5em 0 !important; }' +
                    '.info { height: auto !important; margin-bottom: 0.5em !important; }' +
                    '.info__left { float: left; width: 100%; }' +
                    '.info__right { display: none !important; }' +
                    '.view--category { display: inline-block; margin: 0.5em 0 0.5em 0.5em; }' +
                    '}' +
                    '@media screen and (max-width: 385px) {' +
                    '.themes .card--collection { width: 33.3% !important; margin-top: 1em !important; }' +
                    '}' +
                    '@media screen and (max-width: 580px) {' +
                    '.themes .card--collection { width: 25% !important; margin-top: 1em !important; }' +
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
                info.find('.info__left').prepend(button);
                info.find('.view--category').on('click', function () {
                    console.log('Клік по кнопці "Категорії тем"');
                    this.selectGroup();
                }.bind(this));
                scroll.render().addClass('layer--wheight').data('mheight', info);
                html.append(info);
                html.append(scroll.render());
                this.append(data);
                scroll.append(body);
                this.activity.loader(false);
                this.activity.toggle();
            } catch (e) {
                console.error('Помилка в методі build: ' + e);
            }
        };

        this.selectGroup = function () {
            try {
                console.log('Викликано метод selectGroup');
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
                        console.log('Запускаємо активність у selectGroup: ' + JSON.stringify(activityData));
                        Lampa.Activity.push(activityData);
                        Lampa.Storage.set('themesCurrent', JSON.stringify(activityData));
                    },
                    onBack: function () { 
                        console.log('Викликано onBack у selectGroup');
                        Lampa.Controller.toggle('content'); 
                    }
                });
            } catch (e) {
                console.error('Помилка в методі selectGroup: ' + e);
            }
        };

        this.start = function () {
            try {
                console.log('Викликано метод start');
                console.log('Тип html: ' + (html instanceof jQuery ? 'jQuery' : typeof html));
                console.log('Тип scroll.render(): ' + (scroll.render() instanceof jQuery ? 'jQuery' : typeof scroll.render()));
                console.log('Тип info: ' + (info instanceof jQuery ? 'jQuery' : typeof info));
                Lampa.Controller.add('content', {
                    toggle: function () {
                        console.log('Викликано toggle в Controller');
                        if (scroll.render().find('.card').length > 0) {
                            Navigator.focus(scroll.render().find('.card')[0]);
                        } else if (info.find('.view--category').length > 0) {
                            Navigator.focus(info.find('.view--category')[0]);
                        }
                    },
                    left: function () {
                        console.log('Викликано left в Controller');
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        console.log('Викликано right в Controller');
                        if (Navigator.canmove('right')) Navigator.move('right');
                        else this.selectGroup();
                    },
                    up: function () {
                        console.log('Викликано up в Controller');
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else {
                            if (info.find('.view--category').length > 0 && !info.find('.view--category').hasClass('focus')) {
                                Navigator.focus(info.find('.view--category')[0]);
                            } else {
                                Lampa.Controller.toggle('head');
                            }
                        }
                    },
                    down: function () {
                        console.log('Викликано down в Controller');
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else if (info.find('.view--category').hasClass('focus')) {
                            if (scroll.render().find('.card').length > 0) {
                                Navigator.focus(scroll.render().find('.card')[0]);
                            }
                        }
                    },
                    back: function () {
                        console.log('Викликано back в Controller');
                        Lampa.Activity.backward();
                    }
                });
                Lampa.Controller.toggle('content');
            } catch (e) {
                console.error('Помилка в методі start: ' + e);
            }
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { 
            console.log('Викликано render, тип html: ' + (html instanceof jQuery ? 'jQuery' : typeof html));
            return html; 
        };
        this.destroy = function () {
            try {
                console.log('Викликано метод destroy');
                scroll.destroy();
                if (info) info.remove();
                html.remove();
                body.remove();
                items = null;
                html = null;
                body = null;
                info = null;
            } catch (e) {
                console.error('Помилка в методі destroy: ' + e);
            }
        };
    }

    // Реєстрація компонента
    try {
        console.log('Реєструємо компонент my_themes');
        Lampa.Component.add('my_themes', ThemesComponent);
    } catch (e) {
        console.error('Помилка при реєстрації компонента my_themes: ' + e);
    }

    // Видалення стилів теми при зміні компонента
    try {
        console.log('Додаємо слухача для Storage.listener');
        Lampa.Storage.listener.follow('app', function (e) {
            if (e.name === 'egg' && Lampa.Activity.active().component !== 'my_themes') {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
            }
        });
    } catch (e) {
        console.error('Помилка в слухачі Storage.listener: ' + e);
    }
})();
