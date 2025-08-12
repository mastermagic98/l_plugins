(function() {
    'use strict';

    // Ініціалізація TV-версії Lampa
    Lampa.Platform.tv();

    // Головна функція менеджера тем
    function ThemeManagerPlugin() {
        // Застосовуємо збережену тему при завантаженні
        function applySavedTheme() {
            var savedTheme = localStorage.getItem("selectedTheme");
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
            var defaultThemeData = {
                url: "https://bylampa.github.io/themes/categories/stroke.json",
                title: "Focus Pack",
                component: "my_themes",
                page: 1
            };

            var savedData = Lampa.Storage.get("themesCurrent");
            var themeData;
            
            try {
                themeData = savedData && savedData !== '' ? JSON.parse(savedData) : defaultThemeData;
            } catch (e) {
                console.error('Помилка парсингу даних тем:', e);
                themeData = defaultThemeData;
            }

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
                    function(data) { 
                        try {
                            var parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                            self.buildInterface(parsedData); 
                        } catch (e) {
                            console.error('Помилка завантаження тем:', e);
                            self.showError();
                        }
                    },
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
                if (!Array.isArray(themes)) {
                    console.error('Отримані дані не є масивом тем:', themes);
                    this.showError();
                    return;
                }

                Lampa.Background.change('');

                // Створюємо UI елементи
                this.createTemplates();
                this.appendThemeCards(themes);
                this.setupController();

                this.activity.loader(false);
                this.activity.toggle();
            };

            // Інші методи класу ThemesGallery залишаються без змін...
            // (Тут мають бути всі інші методи з попереднього коду)
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
