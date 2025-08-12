(function() {
    'use strict';

    // Ініціалізація TV-версії Lampa
    Lampa.Platform.tv();

    // Головна функція менеджера тем
    function ThemeManagerPlugin() {
        // Застосовуємо збережену тему при завантаженні
        function applySavedTheme() {
            const savedTheme = localStorage.getItem("selectedTheme");
            if (savedTheme) {
                $('head').append(`<link rel="stylesheet" href="${savedTheme}">`);
                console.log('Застосовано збережену тему:', savedTheme);
            }
        }

        // Додаємо пункт меню в налаштування
        function addSettingsMenuItem() {
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
                        // Розміщуємо наш пункт після розділу "Розмір інтерфейсу"
                        $(".settings-param > div:contains('Мої теми')").parent()
                            .insertAfter($("div[data-name='interface_size']"));

                        element.on("hover:enter", () => {
                            setTimeout(() => {
                                openThemesGallery();
                            }, 100);
                        });
                    }, 0);
                }
            });
        }

        // Відкриваємо галерею тем
        function openThemesGallery() {
            const defaultThemeData = {
                url: "https://bylampa.github.io/themes/categories/stroke.json",
                title: "Focus Pack",
                component: "my_themes",
                page: 1
            };

            const savedData = Lampa.Storage.get("themesCurrent");
            const themeData = savedData ? JSON.parse(savedData) : defaultThemeData;

            Lampa.Activity.push(themeData);
            Lampa.Storage.set("themesCurrent", JSON.stringify(themeData));
        }

        // Клас для роботи з галереєю тем
        class ThemesGallery {
            constructor(activityData) {
                this.activity = activityData;
                this.request = new Lampa.Reguest();
                this.scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
                this.cards = [];
                this.container = $('<div></div>');
                this.themesContainer = $('<div class="my_themes category-full"></div>');
                this.infoElement = null;
                this.focusedCard = null;

                this.categories = [
                    { title: "Focus Pack", url: "https://bylampa.github.io/themes/categories/stroke.json" },
                    { title: "Color Gallery", url: "https://bylampa.github.io/themes/categories/color_gallery.json" },
                    { title: "Gradient Style", url: "https://bylampa.github.io/themes/categories/gradient_style.json" }
                ];
            }

            // Створюємо інтерфейс
            create() {
                this.activity.loader(true);
                this.request.silent(
                    this.activity.url,
                    data => this.buildInterface(data),
                    () => this.showError()
                );
                return this.render();
            }

            // Показуємо помилку завантаження
            showError() {
                const emptyView = new Lampa.Empty();
                this.container.append(emptyView.render());
                this.start = emptyView.start;
                this.activity.loader(false);
                this.activity.toggle();
            }

            // Будуємо інтерфейс
            buildInterface(themes) {
                Lampa.Background.change('');

                // Створюємо UI елементи
                this.createTemplates();
                this.appendThemeCards(themes);
                this.setupController();

                this.activity.loader(false);
                this.activity.toggle();
            }

            // Створюємо HTML-шаблони
            createTemplates() {
                Lampa.Template.add("button_category", `
                    <div id="button_category">
                        <style>
                            .themes .card--collection { width: 14.2% !important; }
                            .scroll__content { padding: 1.5em 0 !important; }
                            .info { height: 9em !important; }
                            @media (max-width: 385px) {
                                .themes .card--collection { width: 33.3% !important; }
                            }
                            @media (max-width: 580px) {
                                .themes .card--collection { width: 25% !important; }
                            }
                        </style>
                        <div class="full-start__button selector view--category">
                            <svg viewBox="0 0 24 24">
                                <path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z"/>
                                <path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z"/>
                                <path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z"/>
                            </svg>
                            <span>Категорії тем</span>
                        </div>
                    </div>
                `);

                Lampa.Template.add('info_tvtv', `
                    <div class="info layer--width">
                        <div class="info__left">
                            <div class="info__title"></div>
                        </div>
                        <div class="info__right">
                            <div id="stantion_filtr"></div>
                        </div>
                    </div>
                `);

                const categoryButton = Lampa.Template.get('button_category');
                this.infoElement = Lampa.Template.get("info_tvtv");
                this.infoElement.find("#stantion_filtr").append(categoryButton);

                this.infoElement.find(".view--category").on("hover:enter hover:click", () => {
                    this.showCategories();
                });

                this.scroll.render().addClass('layer--wheight').data("mheight", this.infoElement);
                this.container.append(this.infoElement.append());
                this.container.append(this.scroll.render());
            }

            // Додаємо картки тем
            appendThemeCards(themes) {
                themes.forEach(theme => {
                    const card = Lampa.Template.get("card", {
                        title: theme.title,
                        release_year: ''
                    });

                    card.addClass("card--collection")
                        .find(".card__img").css({ cursor: "pointer", 'background-color': "#353535a6" }).end()
                        .css({ 'text-align': 'center' });

                    const cardImage = card.find(".card__img")[0];
                    
                    cardImage.onload = () => card.addClass("card--loaded");
                    cardImage.onerror = () => cardImage.src = "./img/img_broken.svg";
                    cardImage.src = theme.logo;

                    // Додаємо позначку для встановленої теми
                    if (localStorage.getItem("selectedTheme") === theme.css) {
                        this.addInstalledBadge(card);
                    }

                    // Обробники подій
                    card.on('hover:focus', () => {
                        this.focusedCard = card[0];
                        this.scroll.update(card, true);
                        this.infoElement.find('.info__title').text(theme.title);
                    });

                    card.on("hover:enter", () => {
                        this.showThemeOptions(theme, card);
                    });

                    this.themesContainer.append(card);
                    this.cards.push(card);
                });

                this.scroll.append(this.themesContainer);
                this.themesContainer.append('<div id="spacer" style="height: 25em;"></div>');
            }

            // Додаємо позначку "Встановлено"
            addInstalledBadge(card) {
                const badge = $('<div class="card__quality">Установлена</div>').css({
                    position: "absolute",
                    left: "-3%",
                    bottom: "70%",
                    padding: "0.4em 0.4em",
                    background: '#ffe216',
                    color: '#000',
                    fontSize: "0.8em",
                    borderRadius: "0.3em",
                    textTransform: "uppercase"
                });
                card.find('.card__view').append(badge);
            }

            // Показуємо опції теми
            showThemeOptions(theme, card) {
                Lampa.Select.show({
                    title: theme.title,
                    items: [
                        { title: "Установити" },
                        { title: "Видалити" }
                    ],
                    onBack: () => Lampa.Controller.toggle('content'),
                    onSelect: (option) => {
                        if (option.title === "Установити") {
                            this.installTheme(theme, card);
                        } else {
                            this.removeTheme();
                        }
                    }
                });
            }

            // Встановлюємо тему
            installTheme(theme, card) {
                $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
                $('head').append(`<link rel="stylesheet" href="${theme.css}">`);

                localStorage.setItem('selectedTheme', theme.css);
                $(".card__quality").remove();
                this.addInstalledBadge(card);

                // Зберігаємо поточні налаштування
                this.backupSettings();
                Lampa.Controller.toggle("content");
            }

            // Видаляємо тему
            removeTheme() {
                $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
                localStorage.removeItem("selectedTheme");
                $(".card__quality").remove();

                // Відновлюємо налаштування
                this.restoreSettings();
                Lampa.Controller.toggle("content");
            }

            // Зберігаємо поточні налаштування
            backupSettings() {
                ['background', 'glass_style', 'black_style'].forEach(setting => {
                    if (Lampa.Storage.get(setting) {
                        Lampa.Storage.set(`my_${setting}`, Lampa.Storage.get(setting));
                    }
                });
            }

            // Відновлюємо налаштування
            restoreSettings() {
                ['background', 'glass_style', 'black_style'].forEach(setting => {
                    if (Lampa.Storage.get(`my_${setting}`)) {
                        Lampa.Storage.set(setting, Lampa.Storage.get(`my_${setting}`));
                        Lampa.Storage.remove(`my_${setting}`);
                    }
                });
            }

            // Показуємо категорії тем
            showCategories() {
                Lampa.Select.show({
                    title: "Категорії тем",
                    items: this.categories,
                    onSelect: (category) => {
                        Lampa.Activity.push({
                            url: category.url,
                            title: category.title,
                            component: "my_themes",
                            page: 1
                        });
                        Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
                    },
                    onBack: () => Lampa.Controller.toggle("content")
                });
            }

            // Налаштовуємо управління
            setupController() {
                Lampa.Controller.add("content", {
                    toggle: () => {
                        Lampa.Controller.collectionSet(this.scroll.render());
                        Lampa.Controller.collectionFocus(this.focusedCard, this.scroll.render());
                    },
                    left: () => Navigator.canmove("left") ? Navigator.move('left') : Lampa.Controller.toggle('menu'),
                    right: () => Navigator.canmove("right") ? Navigator.move("right") : this.showCategories(),
                    up: () => {
                        if (Navigator.canmove('up')) {
                            Navigator.move('up');
                        } else if (!this.infoElement.find('.view--category').hasClass("focus")) {
                            Lampa.Controller.collectionSet(this.infoElement);
                            Navigator.move("right");
                        } else {
                            Lampa.Controller.toggle("head");
                        }
                    },
                    down: () => {
                        Navigator.canmove("down") ? Navigator.move('down') 
                            : this.infoElement.find(".view--category").hasClass('focus') && Lampa.Controller.toggle('content');
                    },
                    back: () => Lampa.Activity.backward()
                });
            }

            render() { return this.container; }
            start() { Lampa.Controller.toggle("content"); }
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
            addSettingsMenuItem();

            // Реєструємо компонент
            Lampa.Component.add('my_themes', ThemesGallery);

            // Слідкуємо за змінами
            Lampa.Storage.listener.follow("change", (e) => {
                if (e.name === 'activity' && Lampa.Activity.active().component !== "my_themes") {
                    $('#button_category').remove();
                }
            });
        }

        // Запускаємо після готовності додатка
        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow("app", (e) => {
                if (e.type === "ready") init();
            });
        }
    }

    // Запуск плагіна
    ThemeManagerPlugin();
})();
