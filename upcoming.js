(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var base_url = 'https://api.themoviedb.org/3';
    var trailerCache = {};
    var categoryCache = {};

    function getInterfaceLanguage() {
        var lang = Lampa.Storage.get('language', 'ru');
        if (lang === 'ru') return 'ru-RU';
        if (lang === 'uk') return 'uk-UA';
        return 'en-US';
    }

    function getShortLanguageCode() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang; // Повертаємо 'ru', 'uk' або 'en'
    }

    function applyWithoutKeywords(params) {
        var baseExcludedKeywords = [
            '346488',
            '158718',
            '41278',
            '13141',
            '345822',
            '315535',
            '290667',
            '323477',
            '290609',
            '210024'
        ];
        params.without_keywords = baseExcludedKeywords.join(',');
        return params;
    }

    function applyGenreFilter(params) {
        var allowedGenres = [
            28,    // боевики
            35,    // комедии
            16,    // мультфильмы
            10762, // детское
            12,    // приключения
            878,   // фантастика
            10751, // семейные
            14     // фэнтези
        ];
        params.with_genres = allowedGenres.join(',');
        return params;
    }

    function fetchTMDB(endpoint, params, resolve, reject) {
        var url = new URL(base_url + endpoint);
        params.api_key = Lampa.TMDB.key();
        params = applyWithoutKeywords(params);
        params = applyGenreFilter(params);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        console.log('TMDB Request: ' + url.toString());
        network.silent(url.toString(), function (data) {
            console.log('TMDB Response for ' + endpoint + ': ', data);
            resolve(data);
        }, function (error) {
            console.log('TMDB Error for ' + endpoint + ': ', error);
            reject(error);
        });
    }

    function get(endpoint, params, cacheKey, resolve, reject) {
        if (cacheKey && trailerCache[cacheKey]) {
            console.log('Using cache for ' + cacheKey);
            resolve(trailerCache[cacheKey]);
            return;
        }
        fetchTMDB(endpoint, params, function (data) {
            if (cacheKey) trailerCache[cacheKey] = data;
            resolve(data);
        }, reject);
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);
        status.onComplite = function () {
            var fulldata = [];
            var categories = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
            categories.forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main: Fetched categories with data: ', fulldata);
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };

        var today = new Date().toISOString().split('T')[0];
        var oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        oneMonthAgo = oneMonthAgo.toISOString().split('T')[0];
        var oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        oneMonthLater = oneMonthLater.toISOString().split('T')[0];

        var lang = getInterfaceLanguage();

        get('/movie/popular', { language: lang, page: 1 }, 'popular_movies', function (json) {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/movie/popular', json);
        }, status.error.bind(status));
        get('/movie/now_playing', { language: lang, page: 1 }, 'in_theaters', function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', json);
        }, status.error.bind(status));
        get('/movie/upcoming', { language: lang, page: 1 }, 'upcoming_movies', function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', json);
        }, status.error.bind(status));
        get('/tv/popular', { language: lang, page: 1 }, 'popular_series', function (json) {
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/tv/popular', json);
        }, status.error.bind(status));
        get('/tv/on_the_air', { language: lang, page: 1 }, 'new_series_seasons', function (json) {
            append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/tv/on_the_air', json);
        }, status.error.bind(status));
        get('/tv/airing_today', { language: lang, page: 1 }, 'upcoming_series', function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/tv/airing_today', json);
        }, status.error.bind(status));
    }

    function full(params, oncomplite, onerror) {
        var cacheKey = params.url + '_page_' + params.page;
        var lang = getInterfaceLanguage();
        get(params.url, { language: lang, page: params.page }, cacheKey, oncomplite, onerror);
    }

    function videos(card, oncomplite, onerror) {
        var endpoint = (card.name ? '/tv' : '/movie') + '/' + card.id + '/videos';
        var lang = getInterfaceLanguage();
        fetchTMDB(endpoint, { language: lang }, oncomplite, onerror);
    }

    function clear() {
        network.clear();
        trailerCache = {};
        categoryCache = {};
    }

    var Api = {
        get: get,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };

    function Trailer(data, params) {
        this.build = function () {
            this.card = Lampa.Template.get('trailer', data);
            this.img = this.card.find('img')[0];
            this.is_youtube = params.type === 'rating';

            // Визначаємо назву відповідно до мови інтерфейсу
            var lang = Lampa.Storage.get('language', 'ru');
            var title = data.title || data.name;
            if (data.translations && data.translations.translations) {
                var translation = data.translations.translations.find(t => t.iso_639_1 === lang) ||
                                 data.translations.translations.find(t => t.iso_639_1 === 'en');
                if (translation && translation.data && (translation.data.title || translation.data.name)) {
                    title = translation.data.title || translation.data.name;
                }
            }
            this.card.find('.card__title').text(title);

            if (!this.is_youtube) {
                var releaseDate = (data.release_date || data.first_air_date || '0000').slice(0, 4);
                this.card.find('.card__details').text(releaseDate + ' - ' + (data.original_title || data.original_name));
            } else {
                this.card.find('.card__details').remove();
            }

            // Додаємо дату прем'єри у правий верхній кут у форматі DD-MM-YYYY
            var premiereDate = data.release_date || data.first_air_date || 'N/A';
            var formattedDate = 'N/A';
            if (premiereDate !== 'N/A') {
                var dateParts = premiereDate.split('-');
                if (dateParts.length === 3) {
                    formattedDate = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]; // Перетворюємо YYYY-MM-DD на DD-MM-YYYY
                }
            }
            this.card.find('.card__view').append(`
                <div class="card__premiere" style="position: absolute; top: 0.5em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;">${formattedDate}</div>
            `);

            // Додаємо мову трейлера нижче дати
            this.card.find('.card__view').append(`
                <div class="card__trailer-lang" style="position: absolute; top: 2em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;"></div>
            `);

            // Додаємо рейтинг у правий нижній кут
            var rating = data.vote_average ? data.vote_average.toFixed(1) : '—';
            this.card.find('.card__view').append(`
                <div class="card__rating" style="position: absolute; bottom: 0.5em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;">${rating}</div>
            `);
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
            }
            return '';
        };

        this.image = function () {
            var _this = this;
            this.img.onload = function () {
                _this.card.addClass('card--loaded');
                _this.updateTrailerLanguage();
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.svg';
            };
        };

        this.updateTrailerLanguage = function () {
            var _this = this;
            var interfaceLang = getShortLanguageCode();
            Api.videos(data, function (videos) {
                var lang = '—';
                if (videos.results.length) {
                    var preferredVideo = videos.results.find(v => v.iso_639_1 === interfaceLang) ||
                                        videos.results.find(v => v.iso_639_1 === 'ru') ||
                                        videos.results.find(v => v.iso_639_1 === 'en') ||
                                        videos.results[0];
                    lang = preferredVideo.iso_639_1.toUpperCase();
                }
                _this.card.find('.card__trailer-lang').text(lang);
            }, function () {
                _this.card.find('.card__trailer-lang').text('—');
            });
        };

        this.play = function (id) {
            if (Lampa.Manifest.app_digital >= 183) {
                var item = {
                    title: Lampa.Utils.shortText(data.title || data.name, 50),
                    id: id,
                    youtube: true,
                    url: 'https://www.youtube.com/watch?v=' + id,
                    icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                    template: 'selectbox_icon'
                };
                Lampa.Player.play(item);
                Lampa.Player.playlist([item]);
            } else {
                Lampa.YouTube.play(id);
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    var interfaceLang = getShortLanguageCode();
                    Api.videos(data, function (videos) {
                        var video = videos.results.find(v => v.iso_639_1 === interfaceLang) ||
                                    videos.results.find(v => v.iso_639_1 === 'ru') ||
                                    videos.results.find(v => v.iso_639_1 === 'en') ||
                                    videos.results[0];
                        if (video) {
                            _this2.play(video.key);
                        } else {
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    });
                }
            }).on('hover:long', function () {
                if (!_this2.is_youtube) {
                    var items = [{
                        title: Lampa.Lang.translate('trailers_view'),
                        view: true
                    }];
                    Lampa.Loading.start(function () {
                        Api.clear();
                        Lampa.Loading.stop();
                    });
                    var interfaceLang = getShortLanguageCode();
                    Api.videos(data, function (videos) {
                        Lampa.Loading.stop();
                        if (videos.results.length) {
                            items.push({
                                title: Lampa.Lang.translate('title_trailers'),
                                separator: true
                            });
                            videos.results.forEach(function (video) {
                                items.push({
                                    title: video.name + ' (' + video.iso_639_1.toUpperCase() + ')',
                                    id: video.key
                                });
                            });
                        }
                        Lampa.Select.show({
                            title: Lampa.Lang.translate('title_action'),
                            items: items,
                            onSelect: function (item) {
                                Lampa.Controller.toggle('content');
                                if (item.view) {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: data.id,
                                        method: data.name ? 'tv' : 'movie',
                                        card: data,
                                        source: 'tmdb'
                                    });
                                } else {
                                    _this2.play(item.id);
                                }
                            },
                            onBack: function () {
                                Lampa.Controller.toggle('content');
                            }
                        });
                    });
                } else if (Lampa.Search) {
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: [{
                            title: Lampa.Lang.translate('search')
                        }],
                        onSelect: function (item) {
                            Lampa.Controller.toggle('content');
                            Lampa.Search.open({
                                input: data.title || data.name
                            });
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        }
                    });
                }
            });
            this.image();
        };

        this.destroy = function () {
            this.img.onerror = this.img.onload = null;
            this.img.src = '';
            this.card.remove();
            this.card = this.img = null;
        };

        this.visible = function () {
            if (this.visibled) return;
            if (params.type === 'rating') this.img.src = 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg';
            else if (data.backdrop_path) this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
            else if (data.poster_path) this.img.src = Lampa.Api.img(data.poster_path);
            else this.img.src = './img/img_broken.svg';
            this.visibled = true;
        };

        this.render = function () {
            return this.card;
        };
    }

    function Line(data) {
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var items = [];
        var active = 0;
        var more, last;

        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);
            body.append(scroll.render());
            this.bind();
        };

        this.bind = function () {
            data.results.slice(0, light ? 6 : data.results.length).forEach(this.append.bind(this));
            this.more();
            Lampa.Layer.update();
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };

        this.append = function (element) {
            var _this = this;
            var card = new Trailer(element, { type: data.type });
            card.create();
            card.visible();
            card.onFocus = function (target, card_data, is_mouse) {
                last = target;
                active = items.indexOf(card);
                if (!is_mouse) scroll.update(items[active].render(), true);
                if (_this.onFocus) _this.onFocus(card_data);
            };
            scroll.append(card.render());
            items.push(card);
        };

        this.more = function () {
            more = Lampa.Template.get('more').addClass('more--trailers');
            more.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: data.url,
                    component: 'trailers_full',
                    type: data.type,
                    page: light ? 1 : 2
                });
            });
            more.on('hover:focus', function (e) {
                last = e.target;
                active = items.length; // Set active to "More" index
                scroll.update(more, true);
            });
            scroll.append(more);
        };

        this.toggle = function () {
            var _this2 = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                },
                right: function () {
                    console.log('Line: Right navigation, active: ' + active + ', items length: ' + items.length);
                    if (active < items.length - 1) { // Move to next card
                        active++;
                        Navigator.move('right');
                        scroll.update(items[active].render(), true);
                        console.log('Line: Moved right to card, new active: ' + active);
                    } else if (active === items.length - 1) { // Move to "More"
                        active = items.length;
                        scroll.update(more, true);
                        Lampa.Controller.collectionFocus(more[0], scroll.render());
                        console.log('Line: Moved right to More, new active: ' + active);
                    } else { // Cycle back to first card
                        active = 0;
                        scroll.update(items[active].render(), true);
                        Lampa.Controller.collectionFocus(items[active].render()[0], scroll.render());
                        console.log('Line: Cycled right to first card, new active: ' + active);
                    }
                },
                left: function () {
                    console.log('Line: Left navigation, active: ' + active);
                    if (active > 0) {
                        active--;
                        if (active === items.length) { // Moving from "More" to last card
                            scroll.update(items[items.length - 1].render(), true);
                            Lampa.Controller.collectionFocus(items[items.length - 1].render()[0], scroll.render());
                            console.log('Line: Moved left from More to last card, new active: ' + active);
                        } else {
                            Navigator.move('left');
                            scroll.update(items[active].render(), true);
                            console.log('Line: Moved left to card, new active: ' + active);
                        }
                    } else if (active === 0) { // Cycle to "More"
                        active = items.length;
                        scroll.update(more, true);
                        Lampa.Controller.collectionFocus(more[0], scroll.render());
                        console.log('Line: Cycled left to More, new active: ' + active);
                    }
                },
                down: this.onDown,
                up: this.onUp,
                gone: function () {},
                back: this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () {
            return content;
        };

        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            content.remove();
            more.remove();
            items = [];
        };
    }

    function Component$1(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div></div>');
        var active = 0;
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;

        this.create = function () {
            Api.main(this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            scroll.minus();
            html.append(scroll.render());
            data.forEach(function (element) {
                _this.append(element);
            });

            if (light) {
                scroll.onWheel = function (step) {
                    if (step > 0) _this.down();
                    else _this.up();
                };
            }

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (element) {
            var item = new Line(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onToggle = function () {
                active = items.indexOf(item);
            };
            item.wrap = $('<div></div>');
            if (light) {
                scroll.append(item.wrap);
            } else {
                scroll.append(item.render());
            }
            items.push(item);
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.detach = function () {
            if (light) {
                items.forEach(function (item) {
                    item.render().detach();
                });
                items.slice(active, active + 2).forEach(function (item) {
                    item.wrap.append(item.render());
                });
            }
        };

        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            this.detach();
            items[active].toggle();
            scroll.update(items[active].render());
        };

        this.up = function () {
            active--;
            if (active < 0) {
                active = 0;
                this.detach();
                Lampa.Controller.toggle('head');
            } else {
                this.detach();
                items[active].toggle();
            }
            scroll.update(items[active].render());
        };

        this.start = function () {
            var _this2 = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () {
                    if (items.length) {
                        _this2.detach();
                        items[active].toggle();
                    }
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    function Component(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="category-full category-full--trailers"></div>');
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var total_pages = 0;
        var last, waitload;

        this.create = function () {
            Api.full(object, this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            var empty = new Lampa.Empty();
            scroll.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.next = function () {
            var _this = this;
            if (waitload) return;
            if (object.page < 30 && object.page < total_pages) {
                waitload = true;
                object.page++;
                Api.full(object, function (result) {
                    _this.append(result, true);
                    waitload = false;
                }, function () {});
            }
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };

        this.append = function (data, append) {
            var _this2 = this;
            data.results.forEach(function (element) {
                var card = new Trailer(element, { type: object.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    scroll.update(card.render(), true);
                    if (!light && !newlampa && scroll.isEnd()) _this2.next();
                };
                body.append(card.render());
                items.push(card);
                if (append) Lampa.Controller.collectionAppend(card.render());
            });
        };

        this.build = function (data) {
            var _this3 = this;
            if (data.results.length) {
                total_pages = data.total_pages;
                scroll.minus();
                html.append(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && light && items.length) this.more();
                scroll.append(body);
                if (newlampa) {
                    active = 0; // Ensure active is defined
                    scroll.onEnd = this.next.bind(this);
                    scroll.onWheel = function (step) {
                        if (!Lampa.Controller.own(_this3)) _this3.start();
                        if (step > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    };
                }
                this.activity.loader(false);
                this.activity.toggle();
            } else {
                html.append(scroll.render());
                this.empty();
            }
        };

        this.more = function () {
            var more = $('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:focus', function (e) {
                Lampa.Controller.collectionFocus(last || false, '', scroll.element());
                var next = Lampa.Arrays.clone(object);
                delete next.activity;
                active = 0; // Reset active for the new activity
                next.page++;
                Lampa.Activity.push(next);
            });
            body.append(more);
        };

        this.back = function () {
            last = items[0] ? items[0].render()[0] : false;
            var more = $('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:focus', function (e) {
                if (object.page > 1) {
                    Lampa.Activity.backward();
                } else {
                    Lampa.Controller.toggle('head');
                }
            });
            body.prepend(more);
        };

        this.start = function () {
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                link: this,
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.element());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            body.remove();
            items = [];
        };
    }

    Lampa.Lang.add({
        trailers_popular_movies: { ru: 'Популярные фильмы', uk: 'Популярні фільми', en: 'Popular Movies' },
        trailers_in_theaters: { ru: 'В кинотеатрах', uk: 'У кінотеатрах', en: 'In Theaters' },
        trailers_upcoming_movies: { ru: 'Скоро в кино', uk: 'Скоро в кіно', en: 'Upcoming Movies' },
        trailers_popular_series: { ru: 'Популярные сериалы', uk: 'Популярні серіали', en: 'Popular Series' },
        trailers_new_series: { ru: 'Новые сезоны сериалов', uk: 'Нові сезони серіалів', en: 'New Series Seasons' },
        trailers_upcoming_series: { ru: 'Скоро', uk: 'Скоро', en: 'TV Shows' },
        trailers_no_trailers: { ru: 'Нет трейлеров', uk: 'Немає трейлерів', en: 'No trailers' },
        trailers_view: { ru: 'Подробнее', uk: 'Докладніше', en: 'More' },
        title_trailers: { ru: 'Трейлеры', uk: 'Трейлери', en: 'Trailers' }
    });

    function startPlugin() {
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', `
            <div class="card selector card--trailer layer--render layer--visible">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="card__promo">
                        <div class="card__promo-text">
                            <div class="card__title"></div>
                        </div>
                        <div class="card__details"></div>
                    </div>
                </div>
                <div class="card__play">
                    <img src="./img/icons/player/play.png">
                </div>
            </div>
        `);
        Lampa.Template.add('trailers_style', `
            <style>
            .card.card--trailer,
            .card-more.more--later {
                width: 25px;
            }
            .card.card--trailer .card__view {
                padding-bottom: 50%;
                margin-bottom: 0;
                position: relative;
            }
            .card.card--trailer .card__details {
                margin-top: 0.8em;
            }
            .card.card--trailer .card__play {
                position: absolute;
                top: 1.4em;
                left: 1.5em;
                background: rgba(0, 0, 0, 0.72);
                width: 2.2em;
                height: 2.2em;
                border-radius: 50%;
                text-align: center;
                padding-top: 0.6em;
            }
            .card.card--trailer .card__play img {
                width: 0.9em;
                height: 1em;
            }
            .card-more.more--trailers .card-more__box {
                padding-bottom: 50%;
            }
            .category-full--trailers .card {
                margin-bottom: 1.5em;
                width: 33.3%
            }
            @media screen and (max-width: 767px) {
                .category-full--trailers .card {
                    width: 50%;
                }
            }
            @media screen and (max-width: 400px) {
                .category-full--trailers .card {
                    width: 100%;
                }
            }
            .card__premiere, .card__trailer-lang-lang, .card__rating {
                font-size: 0.9em;
                z-index: 1;
            }
            </style>
        `);

        function add() {
            var button = $(`<li class="menu__item selector">
                <div class="menu__ico">
                    <svg height="30" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.53 3.23955 77.41 6.62828 78.33 10.9306C80 18.32 80 35 80 35C80 35 80 51.68 78.33 59.32C77.41 63.32 74.54 66.71 71.32 67.89C65.48 70 40 70 40 70C40 70 14.52 70 8.68 67.897C5.44 66.71 2.53 63.41 1.65 59.41C0 51.43 0 35 0 35C0 35 0 18.57 1.65 10.93C2.53 6.61 5.44 3.22 8.67 2.08C14.51 0 40 0 40 0C40 0 65.48 0 71.32 2.08ZM55.64 35L29.97 49.32V20.67L55.64 35Z" fill="white"/>
                    </svg>
                </div>
                <div class="menu__text">${Lampa.Lang.translate('title_trailers')}</div>
            </li>`);
            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(button);
            $('body').append(Lampa.Template.get('trailers_style', {}, true));
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') add();
            });
        }
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
