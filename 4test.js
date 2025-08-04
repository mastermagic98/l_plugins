(function () {
    'use strict';

    // Встановлення платформи на TV
    Lampa.Platform.tv();

    // Словник перекладів для трьох мов
    var translations = {
        my_themes: {
            en: 'My Themes',
            ru: 'Мои темы',
            uk: 'Мої теми'
        },
        my_themes_category: {
            en: 'Themes',
            ru: 'Темы',
            uk: 'Теми'
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
        var lang = Lampa.Storage.get('language') || (navigator.language && navigator.language.split('-')[0]) || 'en';
        return translations[key][lang] || translations[key].en;
    }

    // Завантаження вибраної теми з localStorage та її застосування
    var selectedTheme = localStorage.getItem('selectedTheme');
    if (selectedTheme) {
        var themeLink = jQuery('<link rel="stylesheet" href="' + selectedTheme + '">');
        jQuery('head').append(themeLink);
    }

    // Додавання категорії "Теми" до меню налаштувань
    console.log('Ініціалізація плагіна тем'); // Дебаг: перевірка запуску плагіна
    Lampa.SettingsApi.addComponent({
        component: 'my_themes_category',
        name: t('my_themes_category'),
        icon: '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">' +
              '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.949 8.949 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>' +
              '</svg>'
    });

    // Додавання параметру "Мої теми" до категорії
    Lampa.SettingsApi.addParam({
        component: 'my_themes_category',
        param: {
            name: 'my_themes',
            type: 'card'
        },
        field: {
            name: t('my_themes'),
            description: t('description')
        },
        onRender: function (settings) {
            console.log('Викликано onRender для my_themes'); // Дебаг: перевірка виклику onRender
            console.log('Кількість .settings-param: ' + jQuery('.settings-param').length); // Дебаг: перевірка селектора
            console.log('Кількість .settings: ' + jQuery('.settings').length); // Дебаг: перевірка іншого селектора

            setTimeout(function () {
                // Додавання обробника для переходу до компонента тем
                settings.on('hover:enter hover:click', function () {
                    console.log('Клік по Мої теми'); // Дебаг: перевірка кліку
                    setTimeout(function () {
                        if (jQuery('.view--category').length || jQuery('#button_category').length) {
                            window.activity.back();
                        }
                    }, 50);
                    setTimeout(function () {
                        var themesCurrent = localStorage.getItem('themesCurrent');
                        var activityData = themesCurrent ? JSON.parse(themesCurrent) : {
                            url: 'https://bylampa.github.io/themes/categories/stroke.json',
                            title: t('focus_pack'),
                            component: 'my_themes',
                            page: 1
                        };
                        Lampa.Activity.push(activityData);
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
                    }, 100);
                });
            }, 0);
        }
    });

    // Компонент для роботи з темами
    function ThemesComponent(params) {
        var request = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var items = [];
        var html = jQuery('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"><div id="stantion_filtr"></div></div></div>');
        var body = jQuery('<div class="my_themes category-full"></div>');
        var info;
        var last;
        var categories = [
            { title: t('focus_pack'), url: 'https://bylampa.github.io/themes/categories/stroke.json' },
            { title: t('color_gallery'), url: 'https://bylampa.github.io/themes/categories/color_gallery.json' }
        ];

        this.create = function () {
            // Активуємо завантажувач
            this.activity.loader(true);
            request.follow(params.url, this.build.bind(this), function () {
                var empty = new Lampa.Empty();
                html.append(empty.render());
                this.activity.loader(false);
                this.activity.toggle();
            });
            return this.render();
        };

        this.append = function (data) {
            data.forEach(function (item) {
                var card = Lampa.Template.get('card', { title: item.title, release_year: '' });
                card.addClass('card--collection');
                card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                card.css({ textAlign: 'center' });

                var img = card.find('.card__img')[0];
                img.onload = function () { card.addClass('card--loaded'); };
                img.onerror = function () { img.src = './img/img_broken.svg'; };
                img.src = item.css;

                jQuery('.info__title').text(item.title);

                // Функція для додавання кнопки "Встановити"
                function addInstallButton() {
                    var button = document.createElement('div');
                    button.innerText = t('install');
                    button.className = 'selector';
                    card.find('.card__view').append(button);
                    jQuery(button).css({
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
                    scroll.collectionFocus(card);
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
                                jQuery('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                var themeLink = jQuery('<link rel="stylesheet" href="' + item.css + '">');
                                jQuery('head').append(themeLink);
                                localStorage.setItem('selectedTheme', item.css);
                                console.log(t('theme_installed'), item.css);
                                jQuery('.card__quality').remove();
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
                                jQuery('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                                localStorage.removeItem('selectedTheme');
                                jQuery('.card__quality').remove();
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
        };

        this.build = function (data) {
            Lampa.Listener.change('');
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
                '</div></div>'
            );
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
        };

        this.selectGroup = function () {
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
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.enabled(scroll.render());
                    Lampa.Controller.collectionSet(last || true, scroll.render());
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
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            request.clear();
            scroll.destroy();
            if (info) info.remove();
            html.remove();
            body.remove();
            request = null;
            items = null;
            html = null;
            body = null;
            info = null;
        };
    }

    // Реєстрація компонента тем
    Lampa.Component.add('my_themes', ThemesComponent);

    // Видалення стилів тем, коли компонент не активний
    Lampa.Storage.listener.follow('app', function (e) {
        if (e.name === 'activity' && Lampa.Activity.data().component !== 'my_themes') {
            jQuery('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
        }
    });

    // Ініціалізація при готовності програми
    console.log('Перевірка window.appready: ' + window.appready); // Дебаг: перевірка стану appready
    if (window.appready) {
        console.log('Запуск ThemesComponent при appready');
        ThemesComponent();
    } else {
        Lampa.Listener.follow('app', function (e) {
            console.log('Lampa.Listener app ready викликано'); // Дебаг: перевірка слухача
            if (e.name === 'ready') ThemesComponent();
        });
    }
})();
