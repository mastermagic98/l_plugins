(function() {
    'use strict';
    
    // Реєстрація плагіна
    function UaTrailers() {
        var that = this;
        
        // Налаштування плагіна
        this.settings = {
            title: 'Українські трейлери',
            subtitle: 'Нові трейлери українською мовою',
            plugin_id: 'ua_trailers',
            version: '1.0.0',
            max_results: 30,
            API_KEY: 'AIzaSyDPe5ZuSEuDl-Ux7viX9zY0rA_SDTLghNo', // Потрібно замінити на справжній API-ключ YouTube
            search_query: 'трейлер українською',
            published_after: '' // Буде встановлено при ініціалізації
        };
        
        // Списки контенту
        this.categories = [
            {
                title: 'Нові трейлери',
                url: ''
            },
            {
                title: 'Фільми',
                url: '&videoDefinition=high&videoDuration=short&q=трейлер+українською+фільм'
            },
            {
                title: 'Серіали',
                url: '&videoDefinition=high&videoDuration=short&q=трейлер+українською+серіал'
            },
            {
                title: 'Мультфільми',
                url: '&videoDefinition=high&videoDuration=short&q=трейлер+українською+мультфільм'
            }
        ];
        
        // Ініціалізація плагіна
        this.init = function() {
            // Встановлюємо дату для пошуку - 3 місяці тому
            var date = new Date();
            date.setMonth(date.getMonth() - 3);
            that.settings.published_after = date.toISOString();
            
            // Створення головної сторінки
            Lampa.Component.add('ua_trailers', that.component);
            
            // Додаємо розділ в меню
            var button = $('<li class="menu__item selector">\
                <div class="menu__ico">\
                    <svg height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">\
                        <path fill="currentColor" d="M444.7,68.5H67.3c-6.7,0-12.2,5.5-12.2,12.2v350.6c0,6.7,5.5,12.2,12.2,12.2h377.4c6.7,0,12.2-5.5,12.2-12.2V80.7C456.9,74,451.4,68.5,444.7,68.5z M226.2,241.7v-90.6l86.2,45.3L226.2,241.7z M432.4,418.9H79.6V93.1h352.9V418.9z"/>\
                    </svg>\
                </div>\
                <div class="menu__text">' + that.settings.title + '</div>\
            </li>');
            
            button.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: that.settings.title,
                    component: 'ua_trailers',
                    page: 1
                });
            });
            
            $('.menu .menu__list').eq(0).append(button);
            
            // Обробник стилів
            Lampa.Template.add('trailer_style', '<style>body.ua_trailers--open .player{z-index:100} .trailer-card{position:relative;width:100%;height:100%}.trailer-card__img{position:relative;padding-bottom:56%;width:100%;background:#373d43}.trailer-card__view{position:absolute;top:0;left:0;right:0;bottom:0}.trailer-card__img img{position:absolute;top:0;left:0;height:100%;width:100%;object-fit:cover;border-radius:.3em;opacity:0;transition:opacity .3s}.trailer-card__img img.loaded{opacity:1}.trailer-card .card__icons{position:absolute;top:0.3em;right:0.3em;left:initial;bottom:initial}</style>');
            
            $('body').append(Lampa.Template.get('trailer_style', {}, true));
        };
        
        // Компонент плагіна
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
                
                // Заголовок
                this.activity.loader(true);
                
                scroll.create();
                html.append(scroll.render());
                scroll.append(body);
                
                this.createFilterPanel();
                this.loadCategory();
                
                this.activity.toggle();
            };
            
            this.createFilterPanel = function() {
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
                
                // Підготовка запиту до YouTube API
                var publishedAfter = that.settings.published_after ? '&publishedAfter=' + that.settings.published_after : '';
                var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=' + that.settings.max_results + '&relevanceLanguage=uk&regionCode=UA&key=' + that.settings.API_KEY + publishedAfter + object.url;
                
                network.silent(url, function(json) {
                    if (json && json.items && json.items.length) {
                        _this.build(json.items);
                        
                        // Додаємо nextPageToken для пагінації
                        if (json.nextPageToken) {
                            object.nextPageToken = json.nextPageToken;
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
                        <div class="trailer-card"><div class="trailer-card__img">\
                            <div class="trailer-card__view">\
                                <img src="' + element.snippet.thumbnails.high.url + '" class="img--radius" />\
                            </div>\
                        </div>\
                        <div class="card__title">' + element.snippet.title + '</div>\
                        <div class="card__age">' + Lampa.Utils.parseTime(element.snippet.publishedAt) + '</div>\
                        </div>\
                    </div>');
                    
                    item.on('hover:enter', function() {
                        _this.playVideo(element.id.videoId, element.snippet.title);
                    });
                    
                    item.find('img').on('load', function() {
                        $(this).addClass('loaded');
                    });
                    
                    row.append(item);
                    items.push(item);
                });
                
                body.append(row);
                
                // Lazy load
                Lampa.Controller.enable('content');
            };
            
            this.playVideo = function(videoId, title) {
                Lampa.Modal.close();
                
                var player = window.open('https://www.youtube.com/embed/' + videoId + '?autoplay=1', '_blank');
                
                if (!player || player.closed || typeof player.closed == 'undefined') {
                    Lampa.Noty.show('Не вдалося відкрити відео. Перевірте налаштування блокування спливаючих вікон.');
                    
                    // Альтернативний метод - відкрити у внутрішньому плеєрі
                    var video = {
                        title: title,
                        url: 'https://www.youtube.com/watch?v=' + videoId,
                        tv: true
                    };
                    
                    Lampa.Player.play(video);
                    Lampa.Player.playlist([video]);
                }
            };
            
            this.nextPage = function() {
                var _this = this;
                
                if (waitload) return;
                
                if (object.nextPageToken) {
                    waitload = true;
                    object.page++;
                    
                    var publishedAfter = that.settings.published_after ? '&publishedAfter=' + that.settings.published_after : '';
                    var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=' + that.settings.max_results + '&relevanceLanguage=uk&regionCode=UA&key=' + that.settings.API_KEY + publishedAfter + object.url + '&pageToken=' + object.nextPageToken;
                    
                    network.silent(url, function(json) {
                        if (json && json.items && json.items.length) {
                            _this.build(json.items);
                            
                            object.nextPageToken = json.nextPageToken || null;
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
        
        this.append = function() {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    that.init();
                }
            });
        };
    }
    
    var uaTrailers = new UaTrailers();
    uaTrailers.append();
})();
