(function () {
    'use strict';

    // Реєстрація плагіна у меню
    Lampa.SettingsApi.addComponent({
        title: "Мій плагін",
        component: "my_plugin_settings",
        icon: "<i class='mdi mdi-cog-outline'></i>",
        onRender: function (body) {
            body.empty().append('<div class="settings-item">Налаштування мого плагіна</div>');
        }
    });

    // Головне меню плагіна
    Lampa.Component.add('my_plugin_settings', function () {
        let self = this;

        self.create = function () {
            self.activity = {};
            
            // Список пунктів
            self.items = [
                {
                    title: "Вимкнути розкладку",
                    subtitle: "Перемикає режим",
                    onclick: () => self.openLayoutMenu()
                },
                {
                    title: "Інша опція",
                    subtitle: "Демо",
                    onclick: () => Lampa.Noty.show("Працює")
                }
            ];
        };

        // Підменю (важливо!)
        self.openLayoutMenu = function () {
            let menu = [];

            menu.push({
                title: "Виконати дію",
                onclick: () => {
                    Lampa.Noty.show("Дія виконана");
                }
            });

            menu.push({
                title: "Назад",
                onclick: () => {
                    Lampa.Activity.back();
                }
            });

            let component = {
                render: () => {
                    let list = $('<div class="settings-container"></div>');
                    menu.forEach(m => {
                        let item = $('<div class="settings-item">' + m.title + '</div>');
                        item.on('click', () => m.onclick());
                        list.append(item);
                    });
                    return list;
                },
                onBack: () => {
                    Lampa.Activity.replace({ component: 'my_plugin_settings' });
                    return true;
                }
            };

            Lampa.Activity.push({
                component: component,
                title: "Налаштування розкладки"
            });
        };

        // Рендер головного меню
        self.render = function () {
            let body = $('<div class="settings-container"></div>');

            self.items.forEach(item => {
                let el = $('<div class="settings-item">' + item.title + '<br><small>' + (item.subtitle || '') + '</small></div>');
                el.on('click', item.onclick);
                body.append(el);
            });

            return body;
        };

        // Обробник "Назад"
        self.onBack = function () {
            return true; // повернення в меню Lampa
        };

        self.create();
    });
})();
