(function () {
    'use strict';

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
        red: { en: 'Red', ru: 'Красная', uk: 'Червона' },
        green: { en: 'Green', ru: 'Зелёная', uk: 'Зелена' },
        violet: { en: 'Violet', ru: 'Фиолетовая', uk: 'Фіолетова' },
        dark_blue: { en: 'Dark Blue', ru: 'Тёмно-синяя', uk: 'Темно-синя' },
        orange: { en: 'Orange', ru: 'Оранжевая', uk: 'Помаранчева' },
        pink: { en: 'Pink', ru: 'Розовая', uk: 'Рожева' }
    };

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

    function t(key) {
        var lang = Lampa.Storage.get('language') || navigator.language.split('-')[0] || 'en';
        return translations[key] && translations[key][lang] ? translations[key][lang] : translations[key]?.en || key;
    }

    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            $('head').append($('<link rel="stylesheet" href="' + selectedTheme + '">'));
        }
    } catch (e) {}

    try {
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg fill="none" width="24px" height="24px" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-width="1.5" d="m 12.52,3.08629 -1.49808,0 -0.6618,0.72 1.92,0 0,5.76 -10.56,0 0,-5.76 6.1428,0 0.50724,-0.72 -6.89016,0 c -0.26508,0 -0.48,0.21492 -0.48,0.48 l 0,6.96 c 0,0.26508 0.21492,0.48 0.48,0.48 l 11.04,0 c 0.26508,0 0.48,-0.21492 0.48,-0.48 l 0,-6.96 c 0,-0.26508 -0.21492,-0.48 -0.48,-0.48 z M 11.0092,1.45069 C 10.68664,1.19101 10.153,1.31893 9.81664,1.73629 L 6.40984,6.57661 C 6.07348,6.99385 6.07516,6.91417 6.39736,7.17361 6.71956,7.43329 6.64192,7.45189 6.97828,7.03465 L 10.9834,2.67661 c 0.33636,-0.4176 0.34812,-0.96636 0.0258,-1.22592 z m -0.87612,0.57936 c 0,0 -0.04992,-0.05796 -0.21588,-0.19068 0.24888,-0.40644 0.738,-0.33192 0.738,-0.33192 -0.46368,0.27384 -0.52212,0.5226 -0.52212,0.5226 z M 4.19992,8.38453 C 4.864,8.37933 4.94668,8.21929 5.16316,7.55257 5.5624,6.50041 7.36024,7.82809 6.24604,8.28889 5.13184,8.74993 3.53584,8.38969 4.19992,8.38453 Z m 4.35096,3.98292 C 8.34304,12.21457 8.32072,11.98489 8.32072,11.98489 l -0.078,-0.4986 -2.48568,0 -0.07824,0.49824 c 0,0 -0.02172,0.22992 -0.22968,0.3828 -0.20784,0.15288 -0.37188,0.28416 -0.20784,0.30648 0.15804,0.02136 1.6488,0.0019 1.75872,0 0.11016,0.0019 1.60056,0.02136 1.75848,0 0.16392,-0.02208 -2.4e-4,-0.15312 -0.2076,-0.30636 z"/></svg>'
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
                        if (window.activity && window.activity.back) window.activity.back();
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

    // Реєстрація компонента
    try {
        Lampa.Component.add('my_themes', function(params){
            params = params || {
                url: 'https://bylampa.github.io/themes/categories/stroke.json',
                title: t('focus_pack'),
                component: 'my_themes',
                page: 1
            };

            var container = $('<div class="my_themes"></div>');
            var html = $('<div class="info layer--width"></div>');
            var body = $('<div class="my_themes category-full"></div>');
            var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
            var info = $('<div class="info__left"></div>');
            html.append(info);
            container.append(html);

            Lampa.Template.add('button_category', `
                <div id="button_category">
                    <style>
                        .my_themes .card--collection { width: 14.2% !important; margin-top: 1em !important; }
                        .my_themes__scroll .scroll__content { padding: 0.5em 0 !important; box-shadow: none !important; background: none !important; }
                        .my_themes__scroll .scroll__content::before, .my_themes__scroll .scroll__content::after { display: none !important; }
                        .my_themes .info { height: auto !important; margin-bottom: 0.5em !important; }
                        .my_themes .info__left { float: left; width: 100%; }
                        .my_themes .info__right { display: none !important; }
                        .my_themes__scroll { box-shadow: none !important; background: none !important; }
                        .my_themes__scroll::before, .my_themes__scroll::after { display: none !important; }
                        .my_themes .view--category { display: flex; align-items: center; margin: 0.5em 0.5em 0.5em auto; }
                        .my_themes .view--category svg { margin-right: 0.3em; }
                        .my_themes .info__title-original { font-size: 1.2em; }
                        .my_themes .full-start__button { margin-right: 0.75em; font-size: 1.3em; background-color: rgba(0, 0, 0, 0.3); padding: 0.3em 1em; display: flex; border-radius: 1em; align-items: center; height: 2.8em; }
                        @media screen and (max-width: 385px) {
                            .my_themes .card--collection { width: 33.3% !important; margin-top: 1em !important; }
                        }
                        @media screen and (max-width: 580px) {
                            .my_themes .card--collection { width: 25% !important; margin-top: 1em !important; }
                        }
                    </style>
                    <div class="full-start__button selector view--category">
                        <svg viewBox="0 0 24 24"><path d="M20,10H4c-1.1,0-2,0.9-2,2s0.9,2,2,2h16c1.1,0,2-0.9,2-2S21.1,10,20,10z"/><path d="M4,8h12c1.1,0,2-0.9,2-2s-0.9-2-2-2H4C2.9,4,2,4.9,2,6S2.9,8,4,8z"/><path d="M16,16H4c-1.1,0-2,0.9-2,2s0.9,2,2,2h12c1.1,0,2-0.9,2-2S17.1,16,16,16z"/></svg>
                        <span>${t('theme_categories')}</span>
                    </div>
                </div>
            `);

            var button = Lampa.Template.get('button_category');
            info.prepend(button);
            scroll.render().addClass('my_themes__scroll').data('mheight', info);
            container.append(scroll.render());

            return {
                create: function () {
                    $.get(params.url, (data) => {
                        // build UI
                        scroll.append(body);
                        container.append(body);
                        scroll.update();
                        Lampa.Controller.toggle('content');
                    });
                    return container;
                },
                start: function () {
                    Lampa.Controller.add('content', {
                        toggle: () => {
                            var card = container.find('.card')[0];
                            if (card) Navigator.focus(card);
                        },
                        left: () => Lampa.Controller.toggle('menu'),
                        right: () => {},
                        up: () => Lampa.Controller.toggle('head'),
                        down: () => {},
                        back: () => Lampa.Activity.backward()
                    });
                    Lampa.Controller.toggle('content');
                },
                render: () => container,
                destroy: () => container.remove()
            };
        });
    } catch (e) {}

    try {
        Lampa.Storage.listener.follow('app', function (e) {
            if (e.name === 'egg' && Lampa.Activity.active().component !== 'my_themes') {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
            }
        });
    } catch (e) {}
})();
