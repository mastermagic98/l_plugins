(function () {
    'use strict';

    // Language support
    const translations = {
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

    // Translation function
    function t(key) {
        const lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        return translations[key][lang] || translations[key].en;
    }

    // Load selected theme from localStorage and apply it
    let selectedTheme = localStorage.getItem('selectedTheme');
    if (selectedTheme) {
        let themeLink = $(`<link rel="stylesheet" href="${selectedTheme}">`);
        $('head').append(themeLink);
    }

    // Add "My Themes" settings parameter
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'my_themes',
            type: 'card'
        },
        field: {
            name: t('my_themes'),
            description: t('description')
        },
        onRender: function (settings) {
            setTimeout(() => {
                $('.settings-folder').last().after($('<div class="my_themes category-full"></div>'));
                settings.on('hover:enter hover:click', () => {
                    setTimeout(() => {
                        if ($('.view--category').length || $('#button_category').length) {
                            window.activity.back();
                        }
                    }, 50);

                    setTimeout(() => {
                        let themesCurrent = localStorage.getItem('themesCurrent');
                        let activityData = themesCurrent ? JSON.parse(themesCurrent) : {
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

    // Themes component
    function ThemesComponent(params) {
        let request = new Lampa.Reguest();
        let scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        let items = [];
        let html = $('<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right"><div id="stantion_filtr"></div></div></div>');
        let body = $('<div class="my_themes category-full"></div>');
        let info;
        let last;
        let categories = [
            { title: t('focus_pack'), url: 'https://bylampa.github.io/themes/categories/stroke.json' },
            { title: t('color_gallery'), url: 'https://bylampa.github.io/themes/categories/color_gallery.json' }
        ];

        this.create = function () {
            this.activity.loader(true);
            request.follow(params.url, this.build.bind(this), () => {
                let empty = new Lampa.Empty();
                html.append(empty.render());
                this.activity.loader(false);
                this.activity.toggle();
            });
            return this.render();
        };

        this.append = function (data) {
            data.forEach(item => {
                let card = Lampa.Template.get('card', { title: item.title, release_year: '' });
                card.addClass('card--collection');
                card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                card.css({ textAlign: 'center' });

                let img = card.find('.card__img')[0];
                img.onload = () => card.addClass('card--loaded');
                img.onerror = () => img.src = './img/img_broken.svg';
                img.src = item.css;

                $('.info__title').text(item.title);

                function addInstallButton() {
                    let button = document.createElement('div');
                    button.innerText = t('install');
                    button.classList.add('selector');
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

                card.on('hover:focus', () => {
                    last = card[0];
                    scroll.collectionFocus(card);
                    info.find('.info__title').text(item.title);
                });

                card.on('hover:enter hover:click', () => {
                    let menuItems = [
                        { title: t('install') },
                        { title: t('delete') }
                    ];
                    Lampa.Select.show({
                        title: '',
                        items: menuItems,
                        onBack: () => Lampa.Controller.toggle('content'),
                        onSelect: (selected) => {
                            if (selected.title === t('install')) {
                                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').rect>remove();
                                let themeLink = $(`<link rel="stylesheet" href="${item.css}">`);
                                $('head').append(themeLink);
                                localStorage.setItem('selectedTheme', item.css);
                                console.log(t('theme_installed'), item.css);
                                $('.card__quality').remove();
                                addInstallButton();

                                if (Lampa.Storage.get('myBackground') === true) {
                                    let bg = Lampa.Storage.get('myBackground');
                                    Lampa.Storage.set('background', bg);
                                    Lampa.Storage.set('myBackground', 'false');
                                }
                                if (Lampa.Storage.get('glass_style') === true) {
                                    let glass = Lampa.Storage.get('glass_style');
                                    Lampa.Storage.set('myGlassStyle', glass);
                                    Lampa.Storage.set('glass_style', 'false');
                                }
                                if (Lampa.Storage.get('black_style') === true) {
                                    let black = Lampa.Storage.get('black_style');
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
        };

        this.build = function (data) {
            Lampa.Listener.change('');
            Lampa.Template.add('button_category', `
                <div id='button_category'>
                    <style>
                        @media screen and (max-width: 2560px) {
                            .themes .card--collection { width: 14.2% !important; }
                            .scroll__content { padding: 1.5em 0 !important; }
                            .info { height: 9em !important; }
                            .info__title-original { font-size: 1.2em; }
                        }
                        @media screen and (max-width: 385px) {
                            .info__right { display: contents !important; }
                            .themes .card--collection { width: 33.3% !important; }
                        }
                        @media screen and (max-width: 580px) {
                            .info__right { display: contents !important; }
                            .themes .card--collection { width: 25% !important; }
                        }
                    </style>
                    <div class="full-start__button selector view--category">
                        <svg style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 24 24" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g id="info"/>
                            <g id="icons">
                                <g id="menu">
                                    <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z" fill="currentColor"/>
                                    <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z" fill="currentColor"/>
                                    <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z" fill="currentColor"/>
                                </g>
                            </g>
                        </svg>
                        <span>${t('theme_categories')}</span>
                    </div>
                </div>
            `);
            Lampa.Template.add('info_tvtv', '');
            let button = Lampa.Template.get('button_category');
            info = Lampa.Template.get('info_tvtv');
            info.find('#stantion_filtr').append(button);
            info.find('.view--category').on('hover:focus', () => this.selectGroup());
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
                onSelect: (item) => {
                    Lampa.Activity.push({
                        url: item.url,
                        title: item.title,
                        component: 'my_themes',
                        page: 1
                    });
                    Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.data()));
                },
                onBack: () => Lampa.Controller.toggle('content')
            });
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.enabled(scroll.render());
                    Lampa.Controller.collectionSet(last || true, scroll.render());
                },
                left: () => {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: () => {
                    if (Navigator.canmove('right')) Navigator.move('right');
                    else this.selectGroup();
                },
                up: () => {
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
                down: () => {
                    if (Navigator.canmove('down')) Navigator.move('down');
                    else if (info.find('.view--category').hasClass('focus')) {
                        Lampa.Controller.toggle('content');
                    }
                },
                back: () => Lampa.Activity.backward()
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

    // Register the Themes component
    Lampa.Component.add('my_themes', ThemesComponent);

    // Remove theme stylesheet when not in 'my_themes' component
    Lampa.Storage.listener.follow('app', (e) => {
        if (e.name === 'activity' && Lampa.Activity.data().component !== 'my_themes') {
            $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
        }
    });

    // Initialize on app ready
    if (window.appready) {
        ThemesComponent();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.name === 'ready') ThemesComponent();
        });
    }
})();
