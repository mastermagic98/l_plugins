(function () {
    'use strict';

    // Налаштування платформи для телевізора
    Lampa.Platform.tv();

    // Механізм захисту від налагодження
    (function () {
        // Перевірка на спроби налагодження
        var checkDebug = function () {
            return checkDebug.toString().search('(((.+)+)+)+$').toString().constructor(checkDebug).search('(((.+)+)+)+$');
        };
        checkDebug();

        // Перевизначення методів консолі для запобігання налагодженню
        var consoleOverride = function () {
            var global = (function () {
                try {
                    return Function('return (function() {}.constructor("return this")())')();
                } catch (e) {
                    return window;
                }
            })();
            var consoleMethods = ['log', 'warn', 'info', 'error', 'exception', 'table', 'trace'];
            consoleMethods.forEach(function (method) {
                var original = global.console[method] || function () {};
                global.console[method] = function () {
                    return original.apply(original, arguments);
                };
            });
        };
        consoleOverride();
    })();

    // Об'єкт локалізації для трьох мов
    var translations = {
        uk: {
            my_themes: 'Мої теми',
            description: 'Змінити палітру елементів додатка',
            categories: 'Категорії тем',
            install: 'Встановити',
            remove: 'Видалити',
            installed: 'Встановлено',
            theme_installed: 'Тема встановлена:',
            focus_pack: 'Фокус Пак',
            color_gallery: 'Колірна галерея',
            gradient_style: 'Градієнтний стиль',
            access_error: 'Помилка доступу',
            language: 'Мова',
            select_language: 'Вибрати мову'
        },
        en: {
            my_themes: 'My Themes',
            description: 'Change the color palette of the application',
            categories: 'Theme Categories',
            install: 'Install',
            remove: 'Remove',
            installed: 'Installed',
            theme_installed: 'Theme installed:',
            focus_pack: 'Focus Pack',
            color_gallery: 'Color Gallery',
            gradient_style: 'Gradient Style',
            access_error: 'Access Error',
            language: 'Language',
            select_language: 'Select Language'
        },
        ru: {
            my_themes: 'Мои темы',
            description: 'Измени палитру элементов приложения',
            categories: 'Категории тем',
            install: 'Установить',
            remove: 'Удалить',
            installed: 'Установлена',
            theme_installed: 'Тема установлена:',
            focus_pack: 'Фокус Пак',
            color_gallery: 'Цветная галерея',
            gradient_style: 'Градиентный стиль',
            access_error: 'Ошибка доступа',
            language: 'Язык',
            select_language: 'Выбрать язык'
        }
    };

    // Отримання або встановлення поточної мови (за замовчуванням українська)
    var currentLanguage = localStorage.getItem('appLanguage') || 'uk';

    // Функція для отримання тексту за ключем і поточною мовою
    function t(key) {
        return translations[currentLanguage][key] || translations.uk[key];
    }

    // Перевірка доступу
    if (Lampa.Manifest.origin !== 'bylampa') {
        Lampa.Noty.show(t('access_error'));
        return;
    }

    // Завантаження вибраної теми з localStorage
    var selectedTheme = localStorage.getItem('selectedTheme');
    if (selectedTheme) {
        $('head').append(`<link rel="stylesheet" href="${selectedTheme}">`);
    }

    // Додавання пункту "Мої теми" до налаштувань
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'my_themes',
            type: 'static'
        },
        field: {
            name: t('my_themes'),
            description: t('description')
        },
        onRender: function (item) {
            setTimeout(function () {
                $('.settings-param > div:contains("' + t('my_themes') + '")').parent().insertAfter($('div[data-name="interface_size"]'));
                item.on('hover:enter', function () {
                    setTimeout(function () {
                        if ($('.settings-param').length || $('.settings-folder').length) {
                            window.history.back();
                        }
                    }, 50);
                    setTimeout(function () {
                        var activityData = Lampa.Storage.get('themesCurrent');
                        var activity = activityData ? JSON.parse(JSON.stringify(activityData)) : {
                            url: 'https://bylampa.github.io/themes/categories/color_gallery.json',
                            title: t('focus_pack'),
                            component: 'my_themes',
                            page: 1
                        };
                        Lampa.Activity.push(activity);
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                    }, 100);
                });
            }, 0);
        }
    });

    // Додавання пункту "Мова" до налаштувань
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'language',
            type: 'static'
        },
        field: {
            name: t('language'),
            description: t('select_language')
        },
        onRender: function (item) {
            item.on('hover:enter', function () {
                var languages = [
                    { title: 'Українська', code: 'uk' },
                    { title: 'English', code: 'en' },
                    { title: 'Русский', code: 'ru' }
                ];
                Lampa.Select.show({
                    title: t('select_language'),
                    items: languages,
                    onSelect: function (lang) {
                        currentLanguage = lang.code;
                        localStorage.setItem('appLanguage', currentLanguage);
                        // Оновлення UI після зміни мови
                        Lampa.Activity.push({
                            url: Lampa.Activity.active().url,
                            title: t('focus_pack'),
                            component: 'my_themes',
                            page: 1
                        });
                        Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('content');
                    }
                });
            });
        }
    });

    // Компонент тем
    function ThemeComponent(params) {
        var request = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        var items = [];
        var html = $('<div class="my_themes category-full"></div>');
        var body = $('<div></div>');
        var info, last;
        var categories = [
            { title: t('focus_pack'), url: 'https://bylampa.github.io/themes/categories/color_gallery.json' },
            { title: t('color_gallery'), url: 'https://bylampa.github.io/themes/categories/stroke.json' },
            { title: t('gradient_style'), url: 'https://bylampa.github.io/themes/categories/gradient_style.json' }
        ];

        this.create = function () {
            this.activity.loader(true);
            request.silent(params.url, this.build.bind(this), function () {
                var empty = new Lampa.Empty();
                html.append(empty.render());
                this.start = empty.start;
                this.activity.loader(false);
                this.activity.toggle();
            });
            this.append();
        };

        this.append = function (data) {
            data.forEach(function (element) {
                var card = Lampa.Template.get('card', { title: element.title, release_year: '' });
                card.addClass('card--collection');
                card.find('.card__img').css({ cursor: 'pointer', backgroundColor: '#353535a6' });
                card.css({ 'text-align': 'center' });
                var img = card.find('.card__img')[0];
                img.onerror = function () {
                    card.addClass('card--loaded');
                };
                img.onload = function () {
                    img.src = './img/img_broken.svg';
                };
                img.src = element.logo;

                // Позначення вибраної теми
                if (localStorage.getItem('selectedTheme') === element.css) {
                    var quality = document.createElement('div');
                    quality.innerText = t('installed');
                    quality.classList.add('card__quality');
                    card.find('.card__view').append(quality);
                    $(quality).css({
                        position: 'absolute',
                        left: '-3%',
                        bottom: '70%',
                        padding: '0.4em 0.4em',
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
                    scroll.update(card, true);
                    info.find('.info__title').text(element.title);
                });

                card.on('hover:enter', function () {
                    var menu = Lampa.Controller.enabled().name;
                    var itemsMenu = [];
                    itemsMenu.push({ title: t('install') });
                    itemsMenu.push({ title: t('remove') });
                    Lampa.Select.show({
                        title: '',
                        items: itemsMenu,
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        },
                        onSelect: function (item) {
                            if (item.title === t('install')) {
                                $('#stantion_filtr').remove();
                                $('head').append(`<link rel="stylesheet" href="${element.css}">`);
                                localStorage.setItem('selectedTheme', element.css);
                                console.log(t('theme_installed'), element.css);
                                $('.card__quality').length > 0 && $('.card__quality').remove();

                                var quality = document.createElement('div');
                                quality.innerText = t('installed');
                                quality.classList.add('card__quality');
                                card.find('.card__view').append(quality);
                                $(quality).css({
                                    position: 'absolute',
                                    left: '-3%',
                                    bottom: '70%',
                                    padding: '0.4em 0.4em',
                                    background: '#ffe216',
                                    color: '#000',
                                    fontSize: '0.8em',
                                    WebkitBorderRadius: '0.3em',
                                    MozBorderRadius: '0.3em',
                                    borderRadius: '0.3em',
                                    textTransform: 'uppercase'
                                });

                                // Скидання інших стилів, якщо вони активні
                                if (Lampa.Storage.get('myBackground') === true) {
                                    var bg = Lampa.Storage.get('myBackground');
                                    Lampa.Storage.set('background', bg);
                                    Lampa.Storage.set('myBackground', 'false');
                                }
                                if (Lampa.Storage.get('myGlassStyle') === true) {
                                    var glass = Lampa.Storage.get('glass_style');
                                    Lampa.Storage.set('glass_style', glass);
                                    Lampa.Storage.set('myGlassStyle', 'false');
                                }
                                if (Lampa.Storage.get('myBlackStyle') === true) {
                                    var black = Lampa.Storage.get('black_style');
                                    Lampa.Storage.set('black_style', black);
                                    Lampa.Storage.set('myBlackStyle', 'false');
                                }
                                Lampa.Controller.toggle('content');
                            } else if (item.title === t('remove')) {
                                $('#stantion_filtr').remove();
                                localStorage.removeItem('selectedTheme');
                                $('.card__quality').remove();
                                if (localStorage.getItem('background')) {
                                    Lampa.Storage.set('background', Lampa.Storage.get('background'));
                                    localStorage.removeItem('background');
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

        this.bu
ild = function (data) {
            Lampa.Background.change('');
            Lampa.Template.addClass('info_tvtv', 'mheight');
            var button = Lampa.Template.get('button_category');
            info = Lampa.Template.get('info_tvtv');
            info.find('.info__right').append(button);
            info.find('.view--category').on('hover:enter hover:click', this.selectGroup.bind(this));
            scroll.render().addClass('layer--wheight').data('mheight', info);
            html.append(info.append());
            html.append(scroll.render());
            this.append(data);
            scroll.append(body);
            $('.my_themes').append('<div id="spacer" style="height: 25em;"></div>');
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.selectGroup = function () {
            Lampa.Select.show({
                title: t('categories'),
                items: categories,
                onSelect: function (item) {
                    Lampa.Activity.push({
                        url: item.url,
                        title: item.title,
                        component: 'my_themes',
                        page: 1
                    });
                    Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
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
                            Lampa.Controller.collectionSet(info);
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
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };

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
    Lampa.Component.add('my_themes', ThemeComponent);

    // Очищення button_category при зміні активності
    Lampa.Storage.listener.follow('app', function (e) {
        if (e.name === 'activity' && Lampa.Activity.active().component !== 'my_themes') {
            setTimeout(function () {
                $('#button_category').remove();
            }, 0);
        }
    });

    // Запуск, якщо додаток готовий, або очікування події appready
    if (window.appready) {
        ThemeComponent();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'appready') {
                ThemeComponent();
            }
        });
    }
})();
