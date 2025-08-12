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
                $('head').append($('<link rel="stylesheet" href="' + savedTheme + '">'));
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
                    setTimeout(function() {
                        // Розміщуємо наш пункт після розділу "Розмір інтерфейсу"
                        $(".settings-param > div:contains('Мої теми')").parent()
                            .insertAfter($("div[data-name='interface_size']"));

                        element.on("hover:enter", function() {
                            setTimeout(function() {
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
        function ThemesGallery(activityData) {
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

            // Створюємо інтерфейс
            this.create = function() {
                this.activity.loader(true);
                var self = this;
                this.request.silent(
                    this.activity.url,
                    function(data) { self.buildInterface(data); },
                    function() { self.showError(); }
                );
                return this.render();
            };

            // Показуємо помилку завантаження
            this.showError = function() {
                var emptyView = new Lampa.Empty();
                this.container.append(emptyView.render());
                this.start = emptyView.start;
                this.activity.loader(false);
                this.activity.toggle();
            };

            // Будуємо інтерфейс
            this.buildInterface = function(themes) {
                Lampa.Background.change('');

                // Створюємо UI елементи
                this.createTemplates();
                this.appendThemeCards(themes);
                this.setupController();

                this.activity.loader(false);
                this.activity.toggle();
            };

            // Створюємо HTML-шаблони
            this.createTemplates = function() {
                Lampa.Template.add("button_category", [
                    '<div id="button_category">',
                    '<style>',
                    '.themes .card--collection { width: 14.2% !important; }',
                    '.scroll__content { padding: 1.5em 0 !important; }',
                    '.info { height: 9em !important; }',
                    '@media (max-width: 385px) {',
                    '  .themes .card--collection { width: 33.3% !important; }',
                    '}',
                    '@media (max-width: 580px) {',
                    '  .themes .card--collection { width: 25% !important; }',
                    '}',
                    '</style>',
                    '<div class="full-start__button selector view--category">',
                    '<svg viewBox="0 0 24 24">',
                    '<path d="M20,10H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2C22,10.9,21.1,10,20,10z"/>',
                    '<path d="M4,8h12c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6C2,7.1,2.9,8,4,8z"/>',
                    '<path d="M16,16H4c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2C18,16.9,17.1,16,16,16z"/>',
                    '</svg>',
                    '<span>Категорії тем</span>',
                    '</div>',
                    '</div>'
                ].join(''));

                Lampa.Template.add('info_tvtv', [
                    '<div class="info layer--width">',
                    '<div class="info__left">',
                    '<div class="info__title"></div>',
                    '</div>',
                    '<div class="info__right">',
                    '<div id="stantion_filtr"></div>',
                    '</div>',
                    '</div>'
                ].join(''));

                var categoryButton = Lampa.Template.get('button_category');
                this.infoElement = Lampa.Template.get("info_tvtv");
                this.infoElement.find("#stantion_filtr").append(categoryButton);

                var self = this;
                this.infoElement.find(".view--category").on("hover:enter hover:click", function() {
                    self.showCategories();
                });

                this.scroll.render().addClass('layer--wheight').data("mheight", this.infoElement);
                this.container.append(this.infoElement.append());
                this.container.append(this.scroll.render());
            };

            // Додаємо картки тем
            this.appendThemeCards = function(themes) {
                var self = this;
                themes.forEach(function(theme) {
                    var card = Lampa.Template.get("card", {
                        title: theme.title,
                        release_year: ''
                    });

                    card.addClass("card--collection")
                        .find(".card__img").css({ cursor: "pointer", 'background-color': "#353535a6" }).end()
                        .css({ 'text-align': 'center' });

                    var cardImage = card.find(".card__img")[0];
                    
                    cardImage.onload = function() { card.addClass("card--loaded"); };
                    cardImage.onerror = function() { cardImage.src = "./img/img_broken.svg"; };
                    cardImage.src = theme.logo;

                    // Додаємо позначку для встановленої теми
                    if (localStorage.getItem("selectedTheme") === theme.css) {
                        self.addInstalledBadge(card);
                    }

                    // Обробники подій
                    card.on('hover:focus', function() {
                        self.focusedCard = card[0];
                        self.scroll.update(card, true);
                        self.infoElement.find('.info__title').text(theme.title);
                    });

                    card.on("hover:enter", function() {
                        self.showThemeOptions(theme, card);
                    });

                    self.themesContainer.append(card);
                    self.cards.push(card);
                });

                this.scroll.append(this.themesContainer);
                this.themesContainer.append('<div id="spacer" style="height: 25em;"></div>');
            };

            // Додаємо позначку "Встановлено"
            this.addInstalledBadge = function(card) {
                var badge = $('<div class="card__quality">Установлена</div>').css({
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
            };

            // Показуємо опції теми
            this.showThemeOptions = function(theme, card) {
                var self = this;
                Lampa.Select.show({
                    title: theme.title,
                    items: [
                        { title: "Установити" },
                        { title: "Видалити" }
                    ],
                    onBack: function() { Lampa.Controller.toggle('content'); },
                    onSelect: function(option) {
                        if (option.title === "Установити") {
                            self.installTheme(theme, card);
                        } else {
                            self.removeTheme();
                        }
                    }
                });
            };

            // Встановлюємо тему
            this.installTheme = function(theme, card) {
                $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
                $('head').append($('<link rel="stylesheet" href="' + theme.css + '">'));

                localStorage.setItem('selectedTheme', theme.css);
                $(".card__quality").remove();
                this.addInstalledBadge(card);

                // Зберігаємо поточні налаштування
                this.backupSettings();
                Lampa.Controller.toggle("content");
            };

            // Видаляємо тему
            this.removeTheme = function() {
                $("link[rel='stylesheet'][href^='https://bylampa.github.io/themes/css/']").remove();
                localStorage.removeItem("selectedTheme");
                $(".card__quality").remove();

                // Відновлюємо налаштування
                this.restoreSettings();
                Lampa.Controller.toggle("content");
            };

            // Зберігаємо поточні налаштування
            this.backupSettings = function() {
                var self = this;
                ['background', 'glass_style', 'black_style'].forEach(function(setting) {
                    if (Lampa.Storage.get(setting)) {
                        Lampa.Storage.set('my_' + setting, Lampa.Storage.get(setting));
                    }
                });
            };

            // Відновлюємо налаштування
            this.restoreSettings = function() {
                var self = this;
                ['background', 'glass_style', 'black_style'].forEach(function(setting) {
                    if (Lampa.Storage.get('my_' + setting)) {
                        Lampa.Storage.set(setting, Lampa.Storage.get('my_' + setting));
                        Lampa.Storage.remove('my_' + setting);
                    }
                });
            };

            // Показуємо категорії тем
            this.showCategories = function() {
                var self = this;
                Lampa.Select.show({
                    title: "Категорії тем",
                    items: this.categories,
                    onSelect: function(category) {
                        Lampa.Activity.push({
                            url: category.url,
                            title: category.title,
                            component: "my_themes",
                            page: 1
                        });
                        Lampa.Storage.set("themesCurrent", JSON.stringify(Lampa.Activity.active()));
                    },
                    onBack: function() { Lampa.Controller.toggle("content"); }
                });
            };

            // Налаштовуємо управління
            this.setupController = function() {
                var self = this;
                Lampa.Controller.add("content", {
                    toggle: function() {
                        Lampa.Controller.collectionSet(self.scroll.render());
                        Lampa.Controller.collectionFocus(self.focusedCard, self.scroll.render());
                    },
                    left: function() {
                        return Navigator.canmove("left") ? Navigator.move('left') : Lampa.Controller.toggle('menu');
                    },
                    right: function() {
                        return Navigator.canmove("right") ? Navigator.move("right") : self.showCategories();
                    },
                    up: function() {
                        if (Navigator.canmove('up')) {
                            Navigator.move('up');
                        } else if (!self.infoElement.find('.view--category').hasClass("focus")) {
                            Lampa.Controller.collectionSet(self.infoElement);
                            Navigator.move("right");
                        } else {
                            Lampa.Controller.toggle("head");
                        }
                    },
                    down: function() {
                        if (Navigator.canmove("down")) {
                            Navigator.move('down');
                        } else if (self.infoElement.find(".view--category").hasClass('focus')) {
                            Lampa.Controller.toggle('content');
                        }
                    },
                    back: function() { Lampa.Activity.backward(); }
                });
            };

            this.render = function() { return this.container; };
            this.start = function() { Lampa.Controller.toggle("content"); };
            this.pause = function() {};
            this.stop = function() {};
            this.destroy = function() {
                this.request.clear();
                this.scroll.destroy();
                this.container.remove();
                this.themesContainer.remove();
            };
        }

        // Ініціалізація плагіна
        function init() {
            applySavedTheme();
            addSettingsMenuItem();

            // Реєструємо компонент
            Lampa.Component.add('my_themes', ThemesGallery);

            // Слідкуємо за змінами
            Lampa.Storage.listener.follow("change", function(e) {
                if (e.name === 'activity' && Lampa.Activity.active().component !== "my_themes") {
                    $('#button_category').remove();
                }
            });
        }

        // Запускаємо після готовності додатка
        if (window.appready) {
            init();
        } else {
            Lampa.Listener.follow("app", function(e) {
                if (e.type === "ready") init();
            });
        }
    }

    // Запуск плагіна
    ThemeManagerPlugin();
})();
