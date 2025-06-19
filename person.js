//----------------------------------------------------------
//  Поддержка разработки:
//  OZON Банк  +7 953 235 0002   ( Иван Л. )
//----------------------------------------------------------

(function () {
    'use strict';

    var OnlineCinemas = {
        settings: {
            showActors: true
        },

        init: function() {
            this.registerTemplates();
            this.loadSettings();
            this.createSettings();
            this.addActorsButton();
            this.initStorageListener();
        },

        registerTemplates: function() {
            Lampa.Template.add('settings_online_cinemas', `<div></div>`);
        },

        saveSettings: function() {
            const settingsToSave = {
                showActors: this.settings.showActors
            };
            Lampa.Storage.set('online_cinemas_settings', settingsToSave);
        },

        loadSettings: function() {
            const saved = Lampa.Storage.get('online_cinemas_settings');
            if (!saved) return;

            this.settings.showActors = saved.showActors !== undefined ? saved.showActors : true;
        },

        createSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    type: 'button',
                    component: 'online_cinemas'
                },
                field: {
                    name: 'Настройки актёров',
                    description: 'Показывать кнопку актёров'
                },
                onChange: () => {
                    Lampa.Settings.create('online_cinemas', {
                        title: 'Настройки актёров',
                        template: 'settings_online_cinemas',
                        onBack: () => Lampa.Settings.create('interface')
                    });
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'online_cinemas',
                param: {
                    name: 'show_actors',
                    type: 'trigger',
                    default: this.settings.showActors
                },
                field: {
                    name: 'Показывать кнопку актёров'
                }
            });
        },

        initStorageListener: function() {
            Lampa.Storage.listener.follow('change', e => {
                if(e.name === 'show_actors') {
                    this.settings.showActors = Lampa.Storage.get('show_actors', true);
                    this.saveSettings();
                    this.toggleActorsButton();
                }
            });
        },

        toggleActorsButton: function() {
            $('.online-cinemas-actors').toggle(this.settings.showActors);
        },

        addActorsButton: function() {
            const ico = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';
            const button = $(`<li class="menu__item selector online-cinemas-actors" data-action="actors">
                <div class="menu__ico">${ico}</div>
                <div class="menu__text">Актёры</div>
            </li>`);

            button.on('hover:enter', this.showActors.bind(this));
            $('.menu .menu__list').eq(0).append(button);
            this.toggleActorsButton();
        },

        showActors: function() {
            Lampa.Activity.push({
                url: "person/popular",
                title: "Актёры",
                region: "RU",
                language: "ru-RU",
                component: "category_full",
                source: "tmdb",
                card_type: "true",
                page: 1
            });
        }
    };

    function startPlugin() {
        if (window.OnlineCinemas) return;
        window.OnlineCinemas = OnlineCinemas;

        if (window.appready) {
            OnlineCinemas.init();
        } else {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') OnlineCinemas.init();
            });
        }
    }

    startPlugin();
})();
