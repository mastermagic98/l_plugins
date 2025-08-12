(function() {
    'use strict';

    // Ініціалізація TV-режиму
    Lampa.Platform.tv();

    function ThemeManager() {
        // Застосування збереженої теми
        function applySavedTheme() {
            const savedTheme = localStorage.getItem("selectedTheme");
            if (savedTheme) {
                $('head').append(`<link rel="stylesheet" href="${savedTheme}">`);
            }
        }

        // Додаємо пункт в налаштування
        function addSettingsItem() {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: 'my_themes',
                    type: 'static'
                },
                field: {
                    name: "Мої теми",
                    description: "Змінити оформлення додатка"
                },
                onRender: function(element) {
                    setTimeout(() => {
                        $(".settings-param > div:contains('Мої теми')").parent()
                            .insertAfter($("div[data-name='interface_size']"));

                        element.on("hover:enter", () => {
                            openThemesGallery();
                        });
                    }, 50);
                }
            });
        }

        // Відкриття галереї тем
        function openThemesGallery() {
            const defaultData = {
                url: "https://bylampa.github.io/themes/categories/stroke.json",
                title: "Focus Pack",
                component: "my_themes"
            };

            const savedData = Lampa.Storage.get("themesCurrent");
            const themeData = savedData ? JSON.parse(savedData) : defaultData;

            Lampa.Activity.push(themeData);
        }

        // Клас для роботи з галереєю тем
        class ThemesGallery {
            constructor(activityData) {
                this.activity = activityData;
                this.request = new Lampa.Reguest();
                this.scroll = new Lampa.Scroll({
                    mask: true,
                    over: true,
                    step: 250
                });
                this.cards = [];
                this.container = $('<div></div>');
                this.themesContainer = $('<div class="my_themes"></div>');
                this.infoElement = null;
                this.focusedCard = null;

                this.categories = [
                    {
                        title: "Focus Pack",
                        url: "https://bylampa.github.io/themes/categories/stroke.json"
                    },
                    {
                        title: "Color Gallery", 
                        url: "https://bylampa.github.io/themes/categories/color_gallery.json"
                    },
                    {
                        title: "Gradient Style",
                        url: "https://bylampa.github.io/themes/categories/gradient_style.json"
                    }
                ];
            }

            create() {
                this.activity.loader(true);
                
                if (!this.activity.url) {
                    this.activity.url = this.categories[0].url;
                }

                this.request.silent(
                    this.activity.url,
                    (data) => this.build(data),
                    () => this.showError()
                );

                return this.render();
            }

            build(themes) {
                if (!Array.isArray(themes)) {
                    console.error('Invalid themes data:', themes);
                    return this.showError();
                }

                Lampa.Background.change('');
                this.createUI();
                this.addThemeCards(themes);
                this.setupControls();
                this.activity.loader(false);
                this.activity.toggle();
            }

            createUI() {
                // Додаємо стилі для інтерфейсу
                const styles = `
                    <style>
                        .my_themes { padding: 0 2.5em; }
                        .my_themes .card--collection { 
                            width: 14.28% !important; 
                            margin-bottom: 1.5em; 
                        }
                        .my_themes .card__img { 
                            height: 10em !important;
                            background-color: #353535a6;
                            background-size: contain;
                        }
                        .theme-categories-btn {
                            padding: 0.5em 1em;
                            font-size: 1em;
                            margin: 0 1em;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 0.5em;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 0.3em;
                            transition: all 0.2s ease;
                        }
                        .theme-categories-btn svg {
                            width: 1.2em;
                            height: 1.2em;
                            fill: currentColor;
                        }
                        .theme-categories-btn.focus,
                        .theme-categories-btn:hover {
                            background: rgba(255, 255, 255, 0.2);
                            transform: scale(1.05);
                        }
                        @media (max-width: 800px) {
                            .my_themes .card--collection { width: 20% !important; }
                        }
                        @media (max-width: 600px) {
                            .my_themes .card--collection { width: 25% !important; }
                        }
                        @media (max-width: 400px) {
                            .my_themes .card--collection { width: 33.33% !important; }
                        }
                    </style>
                `;

                // Створюємо кнопку категорій
                const categoriesBtn = `
                    <div class="theme-categories-btn selector">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 10H4c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM4 8h12c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2zm12 8H4c-1.1 0-2 .9-2 2s.9 2 2 2h12c1.1 0 2-.9 2-2s-.9-2-2-2z"></path>
                        </svg>
                        <span>Категорії тем</span>
                    </div>
                `;

                // Інформаційний блок
                this.infoElement = $(`
                    <div class="info layer--width">
                        <div class="info__left">
                            <div class="info__title"></div>
                        </div>
                        <div class="info__right">
                            ${styles}
                            ${categoriesBtn}
                        </div>
                    </div>
                `);

                // Обробник кнопки категорій
                this.infoElement.find('.theme-categories-btn').on('hover:enter', () => {
                    this.showCategories();
                });

                this.scroll.render().addClass('layer--wheight');
                this.container.append(this.infoElement);
                this.container.append(this.scroll.render());
            }

            addThemeCards(themes) {
                themes.slice(0, 30).forEach(theme => {
                    if (!theme?.css || !theme?.logo) return;

                    const card = Lampa.Template.get("card", {
                        title: theme.title || 'Без назви',
                        release_year: ''
                    });

                    card.addClass('card--collection')
                        .css({ 'text-align': 'center' });

                    const img = card.find('.card__img')[0];
                    img.onload = () => card.addClass('card--loaded');
                    img.onerror = () => img.src = './img/img_broken.svg';
                    img.src = theme.logo;

                    if (localStorage.getItem('selectedTheme') === theme.css) {
                        this.addInstalledBadge(card);
                    }

                    card.on('hover:focus', () => {
                        this.focusedCard = card[0];
                        this.scroll.update(card, true);
                        this.infoElement.find('.info__title').text(theme.title || 'Без назви');
                    });

                    card.on('hover:enter', () => {
                        this.showThemeOptions(theme, card);
                    });

                    this.themesContainer.append(card);
                    this.cards.push(card);
                });

                this.scroll.append(this.themesContainer);
                this.themesContainer.append('<div style="height: 10em;"></div>');
            }

            addInstalledBadge(card) {
                card.find('.card__view').append(
                    $(`<div class="card__quality">Установлена</div>`).css({
                        position: 'absolute',
                        left: '5%',
                        bottom: '85%',
                        padding: '0.3em 0.6em',
                        background: '#ffe216',
                        color: '#000',
                        'font-size': '0.8em',
                        'border-radius': '0.3em',
                        'text-transform': 'uppercase',
                        'font-weight': 'bold'
                    })
                );
            }

            showThemeOptions(theme, card) {
                Lampa.Select.show({
                    title: theme.title || 'Тема',
                    items: [
                        { title: 'Установити' },
                        { title: 'Видалити' }
                    ],
                    onSelect: (item) => {
                        if (item.title === 'Установити') {
                            this.installTheme(theme, card);
                        } else {
                            this.removeTheme();
                        }
                    },
                    onBack: () => Lampa.Controller.toggle('content')
                });
            }

            installTheme(theme, card) {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                $('head').append(`<link rel="stylesheet" href="${theme.css}">`);

                localStorage.setItem('selectedTheme', theme.css);
                $('.card__quality').remove();
                this.addInstalledBadge(card);

                // Зберігаємо поточні налаштування
                ['background', 'glass_style', 'black_style'].forEach(setting => {
                    if (Lampa.Storage.get(setting) {
                        Lampa.Storage.set(`my_${setting}`, Lampa.Storage.get(setting));
                    }
                });

                Lampa.Controller.toggle('content');
            }

            removeTheme() {
                $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                localStorage.removeItem('selectedTheme');
                $('.card__quality').remove();

                // Відновлюємо налаштування
                ['background', 'glass_style', 'black_style'].forEach(setting => {
                    if (Lampa.Storage.get(`my_${setting}`)) {
                        Lampa.Storage.set(setting, Lampa.Storage.get(`my_${setting}`));
                        Lampa.Storage.remove(`my_${setting}`);
                    }
                });

                Lampa.Controller.toggle('content');
            }

            showCategories() {
                Lampa.Select.show({
                    title: 'Категорії тем',
                    items: this.categories,
                    onSelect: (category) => {
                        Lampa.Activity.push({
                            url: category.url,
                            title: category.title,
                            component: 'my_themes'
                        });
                    },
                    onBack: () => Lampa.Controller.toggle('content')
                });
            }

            setupControls() {
                Lampa.Controller.add('content', {
                    toggle: () => {
                        Lampa.Controller.collectionSet(this.scroll.render());
                        Lampa.Controller.collectionFocus(this.focusedCard, this.scroll.render());
                    },
                    left: () => Navigator.canmove('left') 
                        ? Navigator.move('left') 
                        : Lampa.Controller.toggle('menu'),
                    right: () => Navigator.canmove('right') 
                        ? Navigator.move('right') 
                        : this.showCategories(),
                    up: () => {
                        if (Navigator.canmove('up')) {
                            Navigator.move('up');
                        } else if (!this.infoElement.find('.theme-categories-btn').hasClass('focus')) {
                            Lampa.Controller.collectionSet(this.infoElement);
                            Navigator.move('right');
                        } else {
                            Lampa.Controller.toggle('head');
                        }
                    },
                    down: () => {
                        if (Navigator.canmove('down')) {
                            Navigator.move('down');
                        } else if (this.infoElement.find('.theme-categories-btn').hasClass('focus')) {
                            Lampa.Controller.toggle('content');
                        }
                    },
                    back: () => Lampa.Activity.backward()
                });
            }

            showError() {
                const emptyView = new Lampa.Empty();
                this.container.append(emptyView.render());
                this.start = emptyView.start;
                this.activity.loader(false);
                this.activity.toggle();
            }

            start() {
                Lampa.Controller.toggle('content');
            }

            render() {
                return this.container;
            }

            pause() {}
            stop() {}
            destroy() {
                this.request.clear();
                this.scroll.destroy();
                this.container.remove();
                this.themesContainer.remove();
            }
        }

        // Ініціалізація плагіна
        function init() {
            applySavedTheme();
            addSettingsItem();
            Lampa.Component.add('my_themes', ThemesGallery);

            Lampa.Storage.listener.follow('change', (e) => {
                if (e.name === 'activity' && Lampa.Activity.active().component !== 'my_themes') {
                    $('.theme-categories-btn').parent().remove();
                }
            });
        }

        // Запуск після готовності додатка
        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow('app', (e) => {
                if (e.type === 'ready') init();
            });
        }
    }

    // Запускаємо менеджер тем
    new ThemeManager();
})();
