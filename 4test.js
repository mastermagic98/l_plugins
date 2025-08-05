(function () {
    'use strict';

    // Перевірка наявності фреймворку Lampa
    if (!window.Lampa) {
        console.error('Помилка: Фреймворк Lampa не знайдено');
        return;
    }

    // Налаштування платформи на телевізійний режим
    try {
        Lampa.Platform.tv();
        console.log('Платформа встановлена: TV');
    } catch (e) {
        console.error('Помилка при виклику Lampa.Platform.tv: ' + e);
    }

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
        }
    };

    // Функція для отримання перекладу
    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        console.log('Використовується мова: ' + lang);
        return translations[key][lang] || translations[key].en || key;
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

    // Додавання пункту меню після готовності DOM
    function addMenuItem() {
        try {
            console.log('Спроба прямого додавання пункту меню до DOM');
            console.log('Доступність селектора .settings: ' + $('.settings').length);
            console.log('Доступність селектора .settings-folder: ' + $('.settings-folder').length);
            console.log('Доступність селектора body: ' + $('body').length);
            var container = $('.settings').last();
            if (container.length === 0) {
                console.warn('Селектор .settings не знайдено, пробуємо .settings-folder');
                container = $('.settings-folder').last();
            }
            if (container.length === 0) {
                console.warn('Селектор .settings-folder не знайдено, додаємо до body');
                container = $('body');
            }
            console.log('Вибрано контейнер: ' + (container[0] ? container[0].outerHTML : 'null'));
            var menuItem = $('<div class="settings-param selector" data-name="my_themes">' + t('my_themes') + '</div>');
            container.append(menuItem);
            console.log('Пункт меню додано до DOM, перевірка: ' + $('.settings-param[data-name="my_themes"]').length);
            menuItem.on('hover:enter hover:click', function () {
                console.log('Клік по пункту меню "Мої теми" (DOM)');
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
                    Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
                } catch (e) {
                    console.error('Помилка при кліку по пункту меню (DOM): ' + e);
                }
            });
        } catch (e) {
            console.error('Помилка при прямому додаванні пункту меню до DOM: ' + e);
        }
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
        var info;
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
                    var card = Lampa.Template.get('card', { title: item.title, release_year: '' });
                    card.addClass('card--collection');
                    card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                    card.css({ textAlign: 'center' });

                    var img = card.find('.card__img')[0];
                    img.onload = function () { card.addClass('card--loaded'); };
                    img.onerror = function () { img.src = './img/img_broken.svg'; };
                    img.src = item.css;

                    $('.info__title').text(item.title);

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
                        addInstallButton();
                    }

                    card.on('hover:focus', function () {
                        last = card[0];
                        if (scroll && scroll.collectionFocus) {
                            scroll.collectionFocus(card);
                        }
                        info.find('.info__title').text(item.title);
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
                                    addInstallButton();

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
                    '.themes .card--collection { width: 14.2% !important; }' +
                    '.scroll__content { padding: 1.5em 0 !important; }' +
                    '.info { height: 9em !important; }' +
                    '.info__title-original { font-size: 1.2em; }' +
                    '}' +
                    '@media screen and (max-width: 385px) {' +
                    '.info__right { display: contents !important; }' +
                    '.themes .card--collection { width: 33.3% !important; }' +
                    '}' +
                    '@media screen and (max-width: 580px) {' +
                    '.info__right { display: contents !important; }' +
                    '.themes .card--collection { width: 25% !important; }' +
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
                Lampa.Template.add('info_tvtv', '');
                var button = Lampa.Template.get('button_category');
                info = Lampa.Template.get('info_tvtv');
                info.find('#stantion_filtr').append(button);
                info.find('.view--category').on('hover:focus', this.selectGroup.bind(this));
                scroll.render().addClass('layer--wheight').data('mheight', info);
                html.append(info.append());
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
                        Lampa.Activity.push({
                            url: item.url,
                            title: item.title,
                            component: 'my_themes',
                            page: 1
                        });
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
                    },
                    onBack: function () { Lampa.Controller.toggle('content'); }
                });
            } catch (e) {
                console.error('Помилка в методі selectGroup: ' + e);
            }
        };

        this.start = function () {
            try {
                console.log('Викликано метод start');
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.enabled(scroll.render());
                        Lampa.Controller.collectionSet(last || true, scroll.render().get(0));
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        if (Navigator.canmove('right')) Navigator.move('right');
                        else this.selectGroup();
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else {
                            if (!info.find('.view--category').hasClass('focus')) {
                                Lampa.Controller.enabled(info);
                                Navigator.move('right');
                            } else {
                                Lampa.Controller.toggle('head');
                            }
                        }
                    },
                    down: function () {
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else if (info.find('.view--category').hasClass('focus')) {
                            Lampa.Controller.toggle('content');
                        }
                    },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            } catch (e) {
                console.error('Помилка в методі start: ' + e);
            }
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
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
            if (e.name === 'egg' && Lampa.Activity.data().component !== 'my_themes') {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
            }
        });
    } catch (e) {
        console.error('Помилка в слухачі Storage.listener: ' + e);
    }

    // Ініціалізація при готовності додатку з затримкою
    try {
        console.log('Перевіряємо готовність додатку: ' + window.appready);
        if (window.appready) {
            console.log('Додаток готовий, додаємо пункт меню з затримкою');
            setTimeout(function () {
                addMenuItem();
                console.log('Запускаємо активність my_themes');
                Lampa.Activity.push({
                    url: 'https://bylampa.github.io/themes/categories/stroke.json',
                    title: t('focus_pack'),
                    component: 'my_themes',
                    page: 1
                });
                Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
            }, 1000);
        } else {
            console.log('Очікуємо подію app:ready');
            Lampa.Listener.follow('app', function (e) {
                if (e.name === 'ready') {
                    console.log('Отримано подію app:ready, додаємо пункт меню з затримкою');
                    setTimeout(function () {
                        addMenuItem();
                        console.log('Запускаємо активність my_themes');
                        Lampa.Activity.push({
                            url: 'https://bylampa.github.io/themes/categories/stroke.json',
                            title: t('focus_pack'),
                            component: 'my_themes',
                            page: 1
                        });
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
                    }, 1000);
                }
            });
        }
    } catch (e) {
        console.error('Помилка при ініціалізації активності: ' + e);
    }
})();
