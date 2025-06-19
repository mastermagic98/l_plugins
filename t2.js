(function () {
    'use strict';

    if (window.ActorsPlugin && window.ActorsPlugin.__initialized) return;
    window.ActorsPlugin = window.ActorsPlugin || {};
    window.ActorsPlugin.__initialized = true;

    Lampa.Lang.add({
        actors_setting: {
            en: "Actors Settings",
            uk: "Налаштування акторів",
            ru: "Настройки актёров"
        },
        actors_show_button: {
            en: "Show Actors Button",
            uk: "Показувати кнопку акторів",
            ru: "Показывать кнопку актёров"
        },
        actors_title: {
            en: "Actors",
            uk: "Актори",
            ru: "Актёры"
        },
        actors_search_placeholder: {
            en: "Search actors...",
            uk: "Пошук акторів...",
            ru: "Поиск актёров..."
        },
        actors_search_button: {
            en: "Search",
            uk: "Пошук",
            ru: "Поиск"
        },
        actors_not_found: {
            en: "No actors found",
            uk: "Акторів не знайдено",
            ru: "Актёры не найдены"
        }
    });

    var ActorsPlugin = {
        settings: {
            showActors: true
        },
        pluginName: 'actors_plugin',
        storageKey: 'actors_saved',
        pageSize: 20,

        init: function() {
            this.registerTemplates();
            this.loadSettings();
            this.createSettings();
            this.addActorsButton();
            this.initStorageListener();
            this.hideCardType();
            this.addSearchField();
            this.initStorage();
            this.addActorsService();
        },

        registerTemplates: function() {
            Lampa.Template.add('settings_actors', '<div></div>');
        },

        saveSettings: function() {
            var settingsToSave = {
                showActors: this.settings.showActors
            };
            Lampa.Storage.set('actors_settings', settingsToSave);
        },

        loadSettings: function() {
            var saved = Lampa.Storage.get('actors_settings');
            if (!saved) return;
            this.settings.showActors = saved.showActors !== undefined ? saved.showActors : true;
        },

        createSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    type: 'button',
                    component: 'actors'
                },
                field: {
                    name: Lampa.Lang.translate('actors_setting')
                },
                onChange: function() {
                    Lampa.Settings.create('actors', {
                        title: Lampa.Lang.translate('actors_setting'),
                        template: 'settings_actors',
                        onBack: function() { Lampa.Settings.create('interface'); }
                    });
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'actors',
                param: {
                    name: 'show_actors',
                    type: 'trigger',
                    default: this.settings.showActors
                },
                field: {
                    name: Lampa.Lang.translate('actors_show_button')
                }
            });
        },

        initStorageListener: function() {
            Lampa.Storage.listener.follow('change', function(e) {
                if (e.name === 'show_actors') {
                    ActorsPlugin.settings.showActors = Lampa.Storage.get('show_actors', true);
                    ActorsPlugin.saveSettings();
                    ActorsPlugin.toggleActorsButton();
                }
            });
        },

        toggleActorsButton: function() {
            $('.actors-plugin-button').toggle(this.settings.showActors);
        },

        addActorsButton: function() {
            var ico = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 20 20"><path fill="currentColor" fill-rule="evenodd" d="M10 10c-2.216 0-4.019-1.794-4.019-4S7.783 2 10 2s4.019 1.794 4.019 4-1.802 4-4.019 4zm3.776.673a5.978 5.978 0 0 0 2.182-5.603C15.561 2.447 13.37.348 10.722.042 7.07-.381 3.972 2.449 3.972 6c0 1.89.88 3.574 2.252 4.673C2.852 11.934.39 14.895.004 18.891A1.012 1.012 0 0 0 1.009 20a.99.99 0 0 0 .993-.891C2.404 14.646 5.837 12 10 12s7.596 2.646 7.999 7.109a.99.99 0 0 0 .993.891c.596 0 1.06-.518 1.003-1.109-.386-3.996-2.847-6.957-6.22-8.218z" clip-rule="evenodd" opacity="1" data-original="#000000" class=""></path></svg>';
            var button = $('<li class="menu__item selector actors-plugin-button" data-action="actors"><div class="menu__ico">' + ico + '</div><div class="menu__text">' + Lampa.Lang.translate('actors_title') + '</div></li>');

            button.on('hover:enter', this.showActors.bind(this));
            $('.menu .menu__list').eq(0).append(button);
            this.toggleActorsButton();
        },

        showActors: function() {
            Lampa.Activity.push({
                url: "person/popular",
                title: Lampa.Lang.translate('actors_title'),
                region: "RU",
                language: "ru-RU",
                component: "category_full",
                source: "tmdb",
                card_type: "true",
                page: 1
            });
        },

        hideCardType: function() {
            var style = $('<style>.category-full[data-url="person/popular"] .card__type { display: none !important; }</style>');
            $('head').append(style);
        },

        addSearchField: function() {
            Lampa.Listener.follow('full', function(e) {
                if (e.type === 'render' && Lampa.Activity.active().component === 'category_full' && Lampa.Activity.active().url === 'person/popular') {
                    var container = $('.category-full', Lampa.Activity.active().activity.render());
                    if (container.length && !container.find('.actors-search').length) {
                        var searchWrapper = $('<div class="actors-search" style="margin: 1em; display: flex; gap: 0.5em;"></div>');
                        var searchInput = $('<input type="text" class="actors-search-input" placeholder="' + Lampa.Lang.translate('actors_search_placeholder') + '" style="padding: 0.5em; border-radius: 0.5em; border: 1px solid #ccc; flex: 1;">');
                        var searchButton = $('<button class="actors-search-button" style="padding: 0.5em 1em; border-radius: 0.5em; background: #444; color: #fff; border: none; cursor: pointer;">' + Lampa.Lang.translate('actors_search_button') + '</button>');

                        searchWrapper.append(searchInput).append(searchButton);
                        container.prepend(searchWrapper);

                        searchButton.on('click', function() {
                            var query = searchInput.val().trim();
                            if (query) {
                                Lampa.Activity.push({
                                    url: "search",
                                    title: Lampa.Lang.translate('actors_title'),
                                    component: "category_full",
                                    query: query,
                                    source: "tmdb",
                                    type: "person",
                                    page: 1
                                });
                            }
                        });

                        searchInput.on('keypress', function(event) {
                            if (event.keyCode === 13) {
                                searchButton.click();
                            }
                        });
                    }
                }
            });
        },

        initStorage: function() {
            var current = Lampa.Storage.get(this.storageKey);
            if (!current || !Array.isArray(current)) {
                Lampa.Storage.set(this.storageKey, []);
            }
        },

        getActorIds: function() {
            var ids = Lampa.Storage.get(this.storageKey, []);
            return Array.isArray(ids) ? ids : [];
        },

        addActorsService: function() {
            var self = this;
            var cache = {};

            var actorsService = {
                list: function(params, onComplete, onError) {
                    var page = parseInt(params.page, 10) || 1;
                    var startIndex = (page - 1) * self.pageSize;
                    var endIndex = startIndex + self.pageSize;

                    var actorIds = self.getActorIds();
                    var pageIds = actorIds.slice(startIndex, endIndex);

                    if (pageIds.length === 0) {
                        onComplete({
                            results: [],
                            page: page,
                            total_pages: Math.ceil(actorIds.length / self.pageSize),
                            total_results: actorIds.length
                        });
                        return;
                    }

                    var loaded = 0;
                    var results = [];
                    var currentLang = Lampa.Storage.get('language', 'ru-RU');

                    for (var i = 0; i < pageIds.length; i++) {
                        (function(i) {
                            var actorId = pageIds[i];

                            if (cache[actorId]) {
                                results.push(cache[actorId]);
                                checkComplete();
                                return;
                            }

                            var path = 'person/' + actorId + '?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang;
                            var url = Lampa.TMDB.api(path);

                            new Lampa.Reguest().silent(url, function(response) {
                                try {
                                    var json = typeof response === 'string' ? JSON.parse(response) : response;

                                    if (json && json.id) {
                                        var actorCard = {
                                            id: json.id,
                                            title: json.name,
                                            name: json.name,
                                            poster_path: json.profile_path,
                                            profile_path: json.profile_path,
                                            type: "actor",
                                            source: "tmdb",
                                            original_type: "person",
                                            media_type: "person",
                                            known_for_department: json.known_for_department,
                                            gender: json.gender || 0,
                                            popularity: json.popularity || 0
                                        };

                                        cache[actorId] = actorCard;
                                        results.push(actorCard);
                                    }
                                } catch (e) {}
                                checkComplete();
                            }, function(errorMsg) {
                                checkComplete();
                            });
                        })(i);
                    }

                    function checkComplete() {
                        loaded++;
                        if (loaded >= pageIds.length) {
                            var validResults = results.filter(function(item) {
                                return !!item;
                            });

                            validResults.sort(function(a, b) {
                                return pageIds.indexOf(a.id) - pageIds.indexOf(b.id);
                            });

                            onComplete({
                                results: validResults,
                                page: page,
                                total_pages: Math.ceil(actorIds.length / self.pageSize),
                                total_results: actorIds.length
                            });
                        }
                    }
                }
            };

            Lampa.Api.sources[this.pluginName] = actorsService;
        }
    };

    function startPlugin() {
        if (window.appready) {
            ActorsPlugin.init();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') ActorsPlugin.init();
            });
        }
    }

    startPlugin();
})();
