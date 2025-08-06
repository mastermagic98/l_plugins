(function () {
    'use strict';

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
        return translations[key]?.[lang] || translations[key]?.en || key;
    }

    try {
        var selectedTheme = localStorage.getItem('selectedTheme');
        if (selectedTheme) {
            var themeLink = $('<link rel="stylesheet" href="' + selectedTheme + '">');
            $('head').append(themeLink);
        }
    } catch (e) {}

    try {
        Lampa.SettingsApi.addComponent({
            component: 'my_themes',
            name: t('my_themes'),
            icon: '<svg fill="none" width="24px" height="24px" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-width="1.5" d="m 12.52,3.08629 -1.49808,0 -0.6618,0.72 1.92,0 0,5.76 -10.56,0 0,-5.76 6.1428,0 0.50724,-0.72 -6.89016,0 c -0.26508,0 -0.48,0.21492 -0.48,0.48 l 0,6.96 c 0,0.26508 0.21492,0.48 0.48,0.48 l 11.04,0 c 0.26508,0 0.48,-0.21492 0.48,-0.48 l 0,-6.96 c 0,-0.26508 -0.21492,-0.48 -0.48,-0.48 z M 11.0092,1.45069 C 10.68664,1.19101 10.153,1.31893 9.81664,1.73629 L 6.40984,6.57661 C 6.07348,6.99385 6.07516,6.91417 6.39736,7.17361 6.71956,7.43329 6.64192,7.45189 6.97828,7.03465 L 10.9834,2.67661 c 0.33636,-0.4176 0.34812,-0.96636 0.0258,-1.22592 z m -0.87612,0.57936 c 0,0 -0.04992,-0.05796 -0.21588,-0.19068 0.24888,-0.40644 0.738,-0.33192 0.738,-0.33192 -0.46368,0.27384 -0.52212,0.5226 -0.52212,0.5226 z M 4.19992,8.38453 C 4.864,8.37933 4.94668,8.21929 5.16316,7.55257 5.5624,6.50041 7.36024,7.82809 6.24604,8.28889 5.13184,8.74993 3.53584,8.38969 4.19992,8.38453 Z m 4.35096,3.98292 C 8.34304,12.21457 8.32072,11.98489 8.32072,11.98489 l -0.078,-0.4986 -2.48568,0 -0.07824,0.49824 c 0,0 -0.02172,0.22992 -0.22968,0.3828 -0.20784,0.15288 -0.37188,0.28416 -0.20784,0.30648 0.15804,0.02136 1.6488,0.0019 1.75872,0 0.11016,0.0019 1.60056,0.02136 1.75848,0 0.16392,-0.02208 -2.4e-4,-0.15312 -0.2076,-0.30636 z"/></svg>'
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

    // Виправлення стилів
    try {
        Lampa.Template.add('button_category', `
            <div id="button_category">
                <style>
                    .my_themes .card--collection { width: 14.2% !important; margin-top: 1em !important; }
                    .my_themes .info { height: auto !important; margin-bottom: 0.5em !important; }
                    .my_themes .info__left { float: left; width: 100%; }
                    .my_themes .info__right { display: none !important; }
                    .my_themes .layer--wheight { box-shadow: none !important; background: none !important; }
                    .my_themes .layer--wheight::before, .my_themes .layer--wheight::after { display: none !important; }
                    .my_themes .view--category { display: flex; align-items: center; margin: 0.5em auto; }
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                    <span>${t('theme_categories')}</span>
                </div>
            </div>
        `);
    } catch (e) {}

(function () {
    const themes = [
        {
            name: 'Зелена тема',
            properties: {
                'background-color': '#1a2e1a',
                '--button-color': '#4CAF50',
                '--text-color': '#ffffff'
            }
        },
        {
            name: 'Темна тема',
            properties: {
                'background-color': '#121212',
                '--button-color': '#bb86fc',
                '--text-color': '#ffffff'
            }
        },
        {
            name: 'Світла тема',
            properties: {
                'background-color': '#ffffff',
                '--button-color': '#6200ee',
                '--text-color': '#000000'
            }
        }
    ];

    function applyTheme(theme) {
        const root = document.documentElement;

        Object.entries(theme.properties).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        Lampa.Storage.set('selected_theme', theme.name);
    }

    function createThemeButton(theme) {
        const button = document.createElement('div');
        button.classList.add('settings-param__selector');
        button.innerText = theme.name;
        button.addEventListener('click', () => applyTheme(theme));
        return button;
    }

    function createThemeSettingsPage() {
        const html = document.createElement('div');
        html.classList.add('settings-param');
        html.innerHTML = `
            <div class="settings-param__name">Тема інтерфейсу</div>
            <div class="settings-param__value"></div>
        `;

        const valueContainer = html.querySelector('.settings-param__value');

        themes.forEach(theme => {
            valueContainer.appendChild(createThemeButton(theme));
        });

        return html;
    }

    function init() {
        const savedThemeName = Lampa.Storage.get('selected_theme');
        const savedTheme = themes.find(t => t.name === savedThemeName);
        if (savedTheme) {
            applyTheme(savedTheme);
        }

        Lampa.SettingsApi.addComponent({
            component: 'themesettings',
            name: 'Теми',
            category: 'Інше',
            onRender: (body) => {
                body.appendChild(createThemeSettingsPage());
            }
        });

        Lampa.SettingsApi.update();
    }

    if (window.appready) {
        init();
    } else {
        document.addEventListener('appready', init);
    }
})();

})();
