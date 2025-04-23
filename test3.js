(function(){
    'use strict';
    
    var Subscribe = Lampa.Subscribe;
    var Platform = Lampa.Platform;
    var Lang = Lampa.Lang;
    var Panel = Lampa.PlayerPanel;
    var Network = Lampa.Reguest;
    var Storage = Lampa.Storage;
    var TAG = 'UkrYTTrailers';
    
    // Додаємо переклади
    Lang.add({
        ua_youtube_trailer: {
            ru: 'Трейлер UA',
            uk: 'Трейлер UA',
            en: 'Trailer UA'
        },
        ua_youtube_found_on: {
            ru: 'Найдено на YouTube',
            uk: 'Знайдено на YouTube',
            en: 'Found on YouTube'
        },
        ua_youtube_trailers: {
            ru: 'Украинские трейлеры',
            uk: 'Українські трейлери',
            en: 'Ukrainian trailers'
        },
        ua_youtube_new_trailers: {
            ru: 'Новые трейлеры',
            uk: 'Нові трейлери',
            en: 'New trailers'
        },
        ua_youtube_error_connect: {
            ru: 'Ошибка подключения к YouTube',
            uk: 'Помилка підключення до YouTube',
            en: 'Error connecting to YouTube'
        },
        ua_youtube_movies: {
            ru: 'Фильмы',
            uk: 'Фільми',
            en: 'Movies'
        },
        ua_youtube_series: {
            ru: 'Сериалы',
            uk: 'Серіали',
            en: 'Series'
        },
        ua_youtube_cartoons: {
            ru: 'Мультфильмы',
            uk: 'Мультфільми',
            en: 'Cartoons'
        },
        ua_youtube_api_key_error: {
            ru: 'Для работы плагина необходимо указать API ключ YouTube',
            uk: 'Для роботи плагіна необхідно вказати API ключ YouTube',
            en: 'YouTube API key is required for the plugin to work'
        }
    });
    
    // Очищення рядка пошуку
    function cleanString(str) {
        return str.replace(/[^a-zA-Z\dа-яА-ЯёЁїЇіІєЄґҐ]+/g, ' ').trim().toLowerCase();
    }
    
    // Основний клас плагіна
    function UkrYouTubeTrailers() {
        var that = this;
        
        // Налаштування плагіна
        this.settings = {
            title: Lang.translate('ua_youtube_trailers'),
            subtitle: Lang.translate('ua_youtube_new_trailers'),
            plugin_id: 'ukr_youtube_trailers',
            version: '1.0.0',
            max_results: 30,
            API_KEY: Storage.get('ukr_youtube_trailers_api_key', ''),
            search_query: 'трейлер українською',
            published_after: '', // Буде встановлено при ініціалізації
            proxy: Storage.get('ukr_youtube_trailers_proxy', '')
        };
        
        // Списки контенту
        this.categories = [
            {
                title: Lang.translate('ua_youtube_new_trailers'),
                url: '&relevanceLanguage=uk&q=трейлер+українською&order=date'
            },
            {
                title: Lang.translate('ua_youtube_movies'),
                url: '&relevanceLanguage=uk&q=трейлер+українською+фільм&order=date'
            },
            {
                title: Lang.translate('ua_youtube_series'),
                url: '&relevanceLanguage=uk&q=трейлер+українською+серіал&order=date'
            },
            {
                title: Lang.translate('ua_youtube_cartoons'),
                url: '&relevanceLanguage=uk&q=трейлер+українською+мультфільм&order=date'
            }
        ];
        
        // Пошук трейлерів
        this.findTrailers = function(movie, success, error) {
            if (!that.settings.API_KEY) {
                if (error) error({error: Lang.translate('ua_youtube_api_key_error')});
                return;
            }
            
            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            if (!title) {
                if (error) error({error: 'No title'});
                return;
            }
            
            var year = (movie.release_date || movie.first_air_date || '').toString()
                .replace(/\D+/g, '')
                .substring(0, 4)
                .replace(/^([03-9]\d|1[0-8]|2[1-9]|20[3-9])\d+$/, '');
            
            var query = cleanString([title, year, 'трейлер українською'].join(' '));
            var url = that.settings.proxy + 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video' +
                '&videoDefinition=high&videoDuration=short&maxResults=' + that.settings.max_results +
                '&key=' + that.settings.API_KEY +
                '&publishedAfter=' + that.settings.published_after +
                '&regionCode=UA&relevanceLanguage=uk' +
                '&q=' + encodeURIComponent(query);
            
            var network = new Network();
            network.silent(url, function(json) {
                if (json && json.items && json.items.length) {
                    // Сортування результатів по релевантності
                    var filtered = json.items.filter(function(item){
                        var title_lower = item.snippet.title.toLowerCase();
                        return title_lower.indexOf('трейлер') >= 0 || 
                               title_lower.indexOf('trailer') >= 0 || 
                               title_lower.indexOf('тизер') >= 0 || 
                               title_lower.indexOf('teaser') >= 0;
                    });
                    
                    if (filtered.length === 0) filtered = json.items;
                    
                    var results = filtered.map(function(item){
                        return {
                            id: item.id.videoId,
                            title: item.snippet.title,
                            url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
                            image: item.snippet.thumbnails.high.url,
                            date: item.snippet.publishedAt,
                            duration: 0,
                            youtube: true
                        };
                    });
                    
                    success(results);
                } else {
                    if (error) error({error: 'No results'});
                }
                
                network.clear();
            }, function(a, c) {
                if (error) error({error: network.errorDecode(a, c)});
                network.clear();
            });
        };
        
        // Кешування результатів пошуку
        this.cacheRequest = function(movie, isTv, success, fail) {
            var id = (isTv ? 'tv' : '') + (movie.id || (Lampa.Utils.hash(movie.title || movie.name)*1).toString(36));
            var key = 'UKR_YOUTUBE_trailer_' + id;
            var data = sessionStorage.getItem(key);
            
            if (data) {
                data = JSON.parse(data);
                if (data[0]) typeof success === 'function' && success(data[1]);
                else typeof fail === 'function' && fail(data[1]);
            } else {
                that.findTrailers(movie, function(results) {
                    sessionStorage.setItem(key, JSON.stringify([true, results]));
                    if (typeof success === 'function') success(results);
                }, function(err) {
                    sessionStorage.setItem(key, JSON.stringify([false, err]));
                    if (typeof fail === 'function') fail(err);
                });
            }
        };
        
        // Обробка відео YouTube
        this.playYoutube = function(id) {
            var url = 'https://www.youtube.com/watch?v=' + id;
            Lampa.Player.play({
                url: url,
                title: 'YouTube',
                iptv: true
            });
        };
        
        // Додавання плагіна в меню
        this.addMenu = function() {
            if (!that.settings.API_KEY) {
                console.log(TAG, 'API key not set');
                return;
            }
            
            // Встановлюємо дату для пошуку - 3 місяці тому
            var date = new Date();
            date.setMonth(date.getMonth() - 3);
            that.settings.published_after = date.toISOString();
            
            // Створення головної сторінки
            Lampa.Component.add('ukr_youtube_trailers', that.component);
            
            // Додаємо розділ в меню
            var menu_icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" fill="currentColor"/></svg>';
            
            var button = $('<li class="menu__item selector">\
                <div class="menu__ico">' + menu_icon + '</div>\
                <div class="menu__text">' + that.settings.title + '</div>\
            </li>');
            
            button.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: that.settings.title,
                    component: 'ukr_youtube_trailers',
                    page: 1
                });
            });
            
            $('.menu .menu__list').eq(0).append(button);
        };
        
        // Додавання кнопки на сторінку фільму/серіалу
        this.addButton = function() {
            // Лого для кнопки
            var button_icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" fill="currentColor"/></svg>';
            
            var button = '<div class="full-start__button selector view--ua_youtube_trailer hide" data-subtitle="#{ua_youtube_found_on}">\
                <div class="full-start__button-icon">' + button_icon + '</div>\
                <div class="full-start__button-text">#{ua_youtube_trailer}</div>\
            </div>';
            
            Lampa.Listener.follow('full', function(event) {
                if (event.type === 'complite') {
                    // Перевіряємо наявність API ключа
                    if (!that.settings.API_KEY) return;
                    
                    var render = event.object.activity.render();
                    var btn = $(Lampa.Lang.translate(button));
                    
                    // Додаємо кнопку після стандартної кнопки трейлера або останньої кнопки
                    var trailer_btn = render.find('.view--trailer');
                    if (trailer_btn.length) {
                        trailer_btn.after(btn);
                    } else {
                        render.find('.full-start__button:last').after(btn);
                    }
                    
                    // Знаходимо трейлери для фільму/серіалу
                    var isTv = !!event.object && !!event.object.method && event.object.method === 'tv';
                    that.cacheRequest(event.data.movie, isTv, function(results) {
                        if (results && results.length) {
                            // Створюємо плейлист для плеєра
                            var playlist = results.map(function(item) {
                                return {
                                    title: item.title,
                                    url: item.url,
                                    id: item.id,
                                    youtube: true,
                                    iptv: true
                                };
                            });
                            
                            btn.on('hover:enter', function() {
                                Lampa.Player.play(playlist[0]);
                                Lampa.Player.playlist(playlist);
                            }).removeClass('hide');
                        }
                    });
                }
            });
        };
        
        // Компонент плагіна для відображення каталогу трейлерів
        this.component = function(object) {
            var network = new Lampa.Reguest();
            var scroll = new Lampa.Scroll({mask: true, over: true});
            var items = [];
            var html = $('<div class="category-full"></div>');
            var body = $('<div class="category-full__body"></div>');
            var info;
            var last;
            var waitload = false;
            
            this.create = function() {
                var _this = this;
                
                this.activity.loader(true);
                
                scroll.create();
                html.append(scroll.render());
                scroll.append(body);
                
                this.createFilterPanel();
                this.loadCategory();
                
                this.activity.toggle();
            };
            
            this.createFilterPanel = function() {
                var _this = this;
                var selector = $('<div class="category-full__scroll selector scroll" style="height:5em"></div>');
                var filter = $('<div class="category-full__filter"></div>');
                var items = [];
                
                that.categories.forEach(function(category, i) {
                    var item = $('<div class="selector" data-index="' + i + '">' + category.title + '</div>');
                    item.on('hover:enter', function() {
                        selector.find('.active').removeClass('active');
                        item.addClass('active');
                        
                        object.url = category.url;
                        object.page = 1;
                        
                        _this.clear();
                        _this.loadCategory();
                    });
                    
                    if (i === 0) item.addClass('active');
                    items.push(item);
                });
                
                filter.append(items);
                selector.append(filter);
                scroll.body.prepend(selector);
            };
            
            this.loadCategory = function() {
                var _this = this;
                
                this.activity.loader(true);
                
                if (!that.settings.API_KEY) {
                    var empty = $('<div class="empty-list selector"><div class="empty-list__container"><div class="empty-list__title">' + Lang.translate('ua_youtube_api_key_error') + '</div></div></div>');
                    body.append(empty);
                    _this.activity.loader(false);
                    _this.activity.toggle();
                    return;
                }
                
                // Підготовка запиту до YouTube API
                var publishedAfter = that.settings.published_after ? '&publishedAfter=' + that.settings.published_after : '';
                var url = that.settings.proxy + 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=' + that.settings.max_results + '&key=' + that.settings.API_KEY + publishedAfter + object.url;
                
                if (object.page > 1 && object.pageToken) {
                    url += '&pageToken=' + object.pageToken;
                }
                
                network.silent(url, function(json) {
                    if (json && json.items && json.items.length) {
                        _this.build(json.items);
                        
                        // Додаємо nextPageToken для пагінації
                        if (json.nextPageToken) {
                            object.pageToken = json.nextPageToken;
                            waitload = false;
                            _this.activity.loader(false);
                            _this.activity.toggle();
                        } else {
                            _this.activity.loader(false);
                            _this.activity.toggle();
                        }
                    } else {
                        var empty = $('<div class="empty-list selector"><div class="empty-list__container"><div class="empty-list__title">Нічого не знайдено</div></div></div>');
                        body.append(empty);
                        _this.activity.loader(false);
                        _this.activity.toggle();
                    }
                }, function(a, c) {
                    _this.empty('Помилка: ' + network.errorDecode(a, c));
                    _this.activity.loader(false);
                    _this.activity.toggle();
                });
            };
            
            this.clear = function() {
                waitload = false;
                object.page = 1;
                object.pageToken = '';
                items = [];
                body.empty();
                scroll.reset();
            };
            
            this.empty = function(text) {
                var empty = $('<div class="empty-list selector"><div class="empty-list__container"><div class="empty-list__title">' + text + '</div></div></div>');
                body.append(empty);
            };
            
            this.build = function(data) {
                var _this = this;
                var item;
                
                var row = $('<div class="category-full__row"></div>');
                
                data.forEach(function(element) {
                    item = $('<div class="category-full__item selector">\
                        <div class="card card--collection card--wide">\
                            <div class="card__view">\
                                <img src="' + element.snippet.thumbnails.high.url + '" class="card__img">\
                                <div class="card__play__icon">\
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">\
                                        <path d="M11 0C4.92488 0 0 4.92488 0 11C0 17.0751 4.92488 22 11 22C17.0751 22 22 17.0751 22 11C21.9938 4.92789 17.0721 0.00615 11 0ZM14.7664 11.4014L9.31504 14.8558C9.18594 14.932 9.01483 14.9338 8.88444 14.8604C8.75406 14.7869 8.67335 14.6489 8.67346 14.5V7.59125C8.67335 7.4423 8.75406 7.30435 8.88444 7.23086C9.01483 7.15736 9.18594 7.15919 9.31504 7.23542L14.7664 10.6898C14.8928 10.7647 14.9692 10.9065 14.9692 11.0456C14.9692 11.1847 14.8928 11.3266 14.7664 11.4014Z" fill="white"/>\
                                    </svg>\
                                </div>\
                            </div>\
                            <div class="card__content">\
                                <div class="card__title">' + element.snippet.title + '</div>\
                                <div class="card__age">' + Lampa.Utils.parseTime(element.snippet.publishedAt) + '</div>\
                            </div>\
                        </div>\
                    </div>');
                    
                    item.on('hover:enter', function() {
                        var video = {
                            title: element.snippet.title,
                            url: 'https://www.youtube.com/watch?v=' + element.id.videoId,
                            id: element.id.videoId,
                            youtube: true,
                            iptv: true
                        };
                        
                        Lampa.Player.play(video);
                        Lampa.Player.playlist([video]);
                    });
                    
                    row.append(item);
                    items.push(item);
                });
                
                body.append(row);
                
                // Lazy load
                Lampa.Controller.enable('content');
            };
            
            this.nextPage = function() {
                var _this = this;
                
                if (waitload) return;
                
                if (object.pageToken) {
                    waitload = true;
                    object.page++;
                    
                    var publishedAfter = that.settings.published_after ? '&publishedAfter=' + that.settings.published_after : '';
                    var url = that.settings.proxy + 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=' + that.settings.max_results + '&key=' + that.settings.API_KEY + publishedAfter + object.url + '&pageToken=' + object.pageToken;
                    
                    network.silent(url, function(json) {
                        if (json && json.items && json.items.length) {
                            _this.build(json.items);
                            
                            object.pageToken = json.nextPageToken || '';
                            waitload = false;
                        }
                    }, function(a, c) {
                        Lampa.Noty.show('Помилка завантаження: ' + network.errorDecode(a, c));
                    });
                }
            };
            
            this.start = function() {
                if (Lampa.Activity.active().activity !== this.activity) return;
                
                this.activity.loader(true);
                this.activity.toggle();
            };
            
            this.pause = function() {};
            
            this.stop = function() {};
            
            this.render = function() {
                return html;
            };
            
            this.destroy = function() {
                network.clear();
                scroll.destroy();
                html.remove();
                body.remove();
                network = null;
                items = null;
                html = null;
                body = null;
                info = null;
            };
        };
        
        // Додавання налаштування в меню налаштувань
        this.addSettings = function() {
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name === 'main') {
                    var field = $('<div class="settings-folder selector" data-component="plugin_ukr_youtube_trailers"></div>');
                    
                    field.append('<div class="settings-folder__icon">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" fill="currentColor"/></svg>' +
                    '</div>');
                    
                    field.append('<div class="settings-folder__name">' + that.settings.title + '</div>');
                    
                    $('.settings-body [data-component="more"]').after(field);
                    
                    field.on('hover:enter', function() {
                        Lampa.Settings.create('plugin_ukr_youtube_trailers');
                        
                        Lampa.Settings.main().render();
                    });
                } else if (e.name === 'plugin_ukr_youtube_trailers') {
                    var ApiKey = Storage.get('ukr_youtube_trailers_api_key', '');
                    var Proxy = Storage.get('ukr_youtube_trailers_proxy', '');
                    
                    var catalog = {
                        component: 'settings_ukr_youtube_trailers',
                        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" fill="currentColor"/></svg>',
                        name: Lang.translate('ua_youtube_trailers')
                    };
                    
                    Lampa.Settings.main().render().find('[data-component="settings_ukr_youtube_trailers"]').remove();
                    Lampa.Settings.main().render().find('[data-component="settings"]').after(catalog);
                    
                    catalog = Lampa.Settings.main().render().find('[data-component="settings_ukr_youtube_trailers"]');
                    catalog.on('hover:enter', function() {
                        Lampa.Settings.create('settings_ukr_youtube_trailers');
                        
                        var item = $('<div class="settings-param selector" data-name="api_key"><div class="settings-param__name">API Key</div><div class="settings-param__value"></div></div>');
                        item.find('.settings-param__value').text(ApiKey ? '******' : Lang.translate('params_no_setting'));
                        
                        item.on('hover:enter', function() {
                            Lampa.Input.edit({
                                title: 'API Key',
                                value: ApiKey,
                                free: true,
                                nosave: true
                            }, function(new_value) {
                                if (ApiKey !== new_value) {
                                    Storage.set('ukr_youtube_trailers_api_key', new_value);
                                    ApiKey = new_value;
                                    that.settings.API_KEY = new_value;
                                    item.find('.settings-param__value').text(new_value ? '******' : Lang.translate('params_no_setting'));
                                }
                            });
                        });
                        
                        var item_proxy = $('<div class="settings-param selector" data-name="proxy"><div class="settings-param__name">Proxy URL</div><div class="settings-param__value"></div></div>');
                        item_proxy.find('.settings-param__value').text(Proxy || Lang.translate('params_no_setting'));
                        
                        item_proxy.on('hover:enter', function() {
                            Lampa.Input.edit({
                                title: 'Proxy URL',
                                value: Proxy,
                                free: true,
                                nosave: true
                            }, function(new_value) {
                                if (Proxy !== new_value) {
                                    Storage.set('ukr_youtube_trailers_proxy', new_value);
                                    Proxy = new_value;
                                    that.settings.proxy = new_value;
                                    item_proxy.find('.settings-param__value').text(new_value || Lang.translate('params_no_setting'));
                                }
                            });
                        });
                        
                        Lampa.Settings.following('settings_ukr_youtube_trailers', item);
                        Lampa.Settings.following('settings_ukr_youtube_trailers', item_proxy);
                    });
                }
            });
        };
        
        // Ініціалізація плагіна
        this.init = function() {
            // Додаємо налаштування
            this.addSettings();
            
            // Додаємо розділ в меню
            this.addMenu();
            
            // Додаємо кнопку на сторінку фільму/серіалу
            this.addButton();
        };
    }
    
    var ukrYouTubeTrailers = new UkrYouTubeTrailers();
    
    // Запуск при завантаженні Lampa
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            ukrYouTubeTrailers.init();
        }
    });
})();
