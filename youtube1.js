(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key(); // Отримуємо ключ API TMDB із Lampa
    var tmdb_base_url = 'https://api.themoviedb.org/3';

    // Функція для форматування дати у форматі YYYY-MM-DD
    function getFormattedDate(daysAgo) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Визначення регіону залежно від мови
    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    // Основна функція для запитів до TMDB
    function get(url, page, resolve, reject, useRegion) {
        var lang = Lampa.Storage.get('language', 'ru');
        var full_url = `${tmdb_base_url}${url}&api_key=${tmdb_api_key}&language=${lang}&page=${page}`;
        if (useRegion) full_url += `®ion=${getRegion()}`;
        console.log('API Request:', full_url); // Діагностика
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result); // Діагностика
            resolve(result);
        }, function (error) {
            console.log('API Error:', url, error); // Діагностика
            reject(error);
        });
    }

    // Головна функція для отримання списків категорій
    function main(oncomplite, onerror) {
        var status = new Lampa.Status(5); // П'ять категорій

        status.onComplite = function () {
            var fulldata = [];
            ['popular', 'streaming', 'on_tv', 'for_rent', 'in_theaters'].forEach(function (key) {
                if (status.data[key] && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main completed:', fulldata); // Діагностика
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };

        var popularFilter = Lampa.Storage.get('trailers_popular_filter', 'day');
        var popularUrl = popularFilter === 'day' ? '/trending/all/day' :
                         popularFilter === 'week' ? '/trending/all/week' :
                         popularFilter === 'month' ? `/discover/movie?sort_by=popularity.desc&release_date.gte=${getFormattedDate(30)}` :
                         `/discover/movie?sort_by=popularity.desc&release_date.gte=${getFormattedDate(365)}`;

        // Запити для категорій
        get(popularUrl, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular'), 'popular', popularUrl, json.results.length ? json : { results: [] });
        }, function () {
            // Резервний запит для "Популярное"
            get('/discover/movie?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_popular'), 'popular', '/discover/movie?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, false);

        get(`/discover/movie?with_watch_monetization_types=flatrate`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_streaming'), 'streaming', `/discover/movie?with_watch_monetization_types=flatrate`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get(`/tv/on_the_air`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_on_tv'), 'on_tv', '/tv/on_the_air', json.results.length ? json : { results: [] });
        }, function () {
            // Резервний запит для "По ТВ"
            get('/discover/tv?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_on_tv'), 'on_tv', '/discover/tv?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, false);

        get(`/discover/movie?with_watch_monetization_types=rent`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_for_rent'), 'for_rent', `/discover/movie?with_watch_monetization_types=rent`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get(`/movie/now_playing`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', json.results.length ? json : { results: [] });
        }, function () {
            // Резервний запит для "В кінотеатрах"
            get('/discover/movie?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/discover/movie?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, false);
    }

    // Функція для отримання повного списку для пагінації
    function full(params, oncomplite, onerror) {
        get(params.url, params.page, function (result) {
            if (result && result.results && result.results.length) {
                oncomplite(result);
            } else {
                console.log('Full: No results for', params.url); // Діагностика
                onerror();
            }
        }, function (error) {
            console.log('Full error:', params.url, error); // Діагностика
            onerror();
        }, params.type === 'streaming' || params.type === 'for_rent');
    }

    // Функція для отримання трейлерів із пріоритетом мови
    function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var url = `${tmdb_base_url}/${type}/${card.id}/videos?api_key=${tmdb_api_key}`; // Без language, щоб отримати всі трейлери
        console.log('Videos request:', url); // Діагностика
        network.silent(url, function (result) {
            console.log('Videos result:', result); // Діагностика
            oncomplite(result);
        }, function (error) {
            console.log('Videos error:', error); // Діагностика
            onerror();
        });
    }

    function clear() {
        network.clear();
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

            if (!this.is_youtube) {
                var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
                this.card.find('.card__title').text(data.title || data.name);
                this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
            } else {
                this.card.find('.card__title').text(data.name);
                this.card.find('.card__details').remove();
            }
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? `https://img.youtube.com/vi/${data.id}/hqdefault.jpg` : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? `https://img.youtube.com/vi/${data.id}/hqdefault.jpg` : '';
            }
            return '';
        };

        this.image = function () {
            var _this = this;
            this.img.onload = function () {
                _this.card.addClass('card--loaded');
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.svg';
            };
        };

        this.play = function (id) {
            if (!id) {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
            console.log('Playing video ID:', id); // Діагностика
            if (Lampa.Manifest.app_digital >= 183) {
                var item = {
                    title: Lampa.Utils.shortText(data.title || data.name, 50),
                    id: id,
                    youtube: true,
                    url: `https://www.youtube.com/watch?v=${id}`,
                    icon: `<img class="size-youtube" src="https://img.youtube.com/vi/${id}/default.jpg" />`,
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
                    Api.videos(data, function (videos) {
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var trailers = videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        });
                        // Пріоритет: uk/ua → ru → en
                        var video = trailers.find(function (v) {
                            return v.iso_639_1 === userLang || v.iso_639_1 === 'ua';
                        }) || trailers.find(function (v) {
                            return v.iso_639_1 === 'ru';
                        }) || trailers.find(function (v) {
                            return v.iso_639_1 === 'en';
                        }) || trailers[0];

                        if (video && video.key) {
                            if (userLang === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'ua') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_uk_trailer'));
                            }
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
                    Api.videos(data, function (videos) {
                        Lampa.Loading.stop();
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var trailers = videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        });
                        if (trailers.length) {
                            items.push({
                                title: Lampa.Lang.translate('title_trailers'),
                                separator: true
                            });
                            trailers.forEach(function (video) {
                                if (video.key) {
                                    items.push({
                                        title: video.name || 'Trailer',
                                        id: video.key,
                                        subtitle: video.iso_639_1 === userLang || video.iso_639_1 === 'ua' ? 'Local' : video.iso_639_1
                                    });
                                }
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
                    }, function () {
                        Lampa.Loading.stop();
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    });
                }
            });
            this.image();
        };

        this.destroy = function () {
            this.img.onerror = null;
            this.img.onload = null;
            this.img.src = '';
            this.card.remove();
            this.card = null;
            this.img = null;
        };

        this.visible = function () {
            if (this.visibled) return;
            if (params.type === 'rating') {
                this.img.src = `https://img.youtube.com/vi/${data.id}/hqdefault.jpg`;
            } else if (data.backdrop_path) {
                this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
            } else if (data.poster_path) {
                this.img.src = Lampa.Api.img(data.poster_path);
            } else {
                this.img.src = './img/img_broken.svg';
            }
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
        var more;
        var filter;
        var last;

        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);

            // Додаємо кнопку фільтра для категорії "Популярное"
            if (data.type === 'popular') {
                filter = $('<div class="items-line__filter selector"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
                filter.on('hover:enter', function () {
                    var items = [
                        { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_popular_filter', 'day') === 'day' },
                        { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_popular_filter', 'day') === 'week' },
                        { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_popular_filter', 'day') === 'month' },
                        { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_popular_filter', 'day') === 'year' }
                    ];
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('trailers_filter'),
                        items: items,
                        onSelect: function (item) {
                            Lampa.Storage.set('trailers_popular_filter', item.value);
                            Lampa.Activity.push({
                                url: item.value === 'day' ? '/trending/all/day' :
                                     item.value === 'week' ? '/trending/all/week' :
                                     item.value === 'month' ? `/discover/movie?sort_by=popularity.desc&release_date.gte=${getFormattedDate(30)}` :
                                     `/discover/movie?sort_by=popularity.desc&release_date.gte=${getFormattedDate(365)}`,
                                title: Lampa.Lang.translate('trailers_popular'),
                                component: 'trailers_main',
                                type: 'popular',
                                page: 1
                            });
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        }
                    });
                });
                content.find('.items-line__title').after(filter);
            }

            this.bind();
            body.append(scroll.render());
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
            more = Lampa.Template.get('more');
            more.addClass('more--trailers');
            more.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: 2
                });
            });
            more.on('hover:focus', function (e) {
                last = e.target;
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
                    Navigator.move('right');
                    Lampa.Controller.enable('items_line');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else if (_this2.onLeft) _this2.onLeft();
                    else Lampa.Controller.toggle('menu');
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
            more && more.remove();
            filter && filter.remove();
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
            data.forEach(this.append.bind(this));
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
        var last;
        var waitload = false;

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
                    if (result.results && result.results.length) {
                        _this.append(result, true);
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    }
                    waitload = false;
                }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    waitload = false;
                });
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
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                scroll.minus();
                html.append(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && items.length) this.more();
                scroll.append(body);
                if (newlampa) {
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
            var _this = this;
            var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
            more.on('hover:enter', function () {
                var next = Lampa.Arrays.clone(object);
                delete next.activity;
                next.page = (next.page || 1) + 1;
                Lampa.Activity.push({
                    url: next.url,
                    title: object.title || Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_full',
                    type: next.type,
                    page: next.page
                });
            });
            body.append(more);
        };

        this.back = function () {
            last = items[0].render()[0];
            var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
            more.on('hover:enter', function () {
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
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
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
        trailers_popular: {
            ru: 'Популярное',
            uk: 'Популярне',
            en: 'Popular'
        },
        trailers_streaming: {
            ru: 'Онлайн',
            uk: 'Онлайн',
            en: 'Streaming'
        },
        trailers_on_tv: {
            ru: 'По ТВ',
            uk: 'По ТВ',
            en: 'On TV'
        },
        trailers_for_rent: {
            ru: 'Напрокат',
            uk: 'Напрокат',
            en: 'For Rent'
        },
        trailers_in_theaters: {
            ru: 'В кинотеатрах',
            uk: 'В кінотеатрах',
            en: 'In Theaters'
        },
        trailers_no_trailers: {
            ru: 'Нет трейлеров',
            uk: 'Немає трейлерів',
            en: 'No trailers'
        },
        trailers_no_uk_trailer: {
            ru: 'Нет украинского трейлера',
            uk: 'Немає українського трейлера',
            en: 'No Ukrainian trailer'
        },
        trailers_view: {
            ru: 'Подробнее',
            uk: 'Докладніше',
            en: 'More'
        },
        title_trailers: {
            ru: 'Трейлеры',
            uk: 'Трейлери',
            en: 'Trailers'
        },
        trailers_filter: {
            ru: 'Фильтр',
            uk: 'Фільтр',
            en: 'Filter'
        },
        trailers_filter_today: {
            ru: 'Сегодня',
            uk: 'Сьогодні',
            en: 'Today'
        },
        trailers_filter_week: {
            ru: 'Неделя',
            uk: 'Тиждень',
            en: 'Week'
        },
        trailers_filter_month: {
            ru: 'Месяц',
            uk: 'Місяць',
            en: 'Month'
        },
        trailers_filter_year: {
            ru: 'Год',
            uk: 'Рік',
            en: 'Year'
        }
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
                    <img src="./img/icons/player/play.svg">
                </div>
            </div>
        `);
        Lampa.Template.add('trailer_style', `
            <style>
            .card.card--trailer,
            .card-more.more--trailers {
                width: 25.7em;
            }
            .card.card--trailer .card__view {
                padding-bottom: 56%;
                margin-bottom: 0;
            }
            .card.card--trailer .card__details {
                margin-top: 0.8em;
            }
            .card.card--trailer .card__play {
                position: absolute;
                top: 1.4em;
                left: 1.5em;
                background: #000000b8;
                width: 2.2em;
                height: 2.2em;
                border-radius: 100%;
                text-align: center;
                padding-top: 0.6em;
            }
            .card.card--trailer .card__play img {
                width: 0.9em;
                height: 1em;
            }
            .card-more.more--trailers .card-more__box {
                padding-bottom: 56%;
            }
            .category-full--trailers .card {
                margin-bottom: 1.5em;
            }
            .category-full--trailers .card {
                width: 33.3%;
            }
            .items-line__filter {
                display: inline-block;
                margin-left: 10px;
                cursor: pointer;
            }
            .items-line__filter svg {
                width: 20px;
                height: 20px;
                vertical-align: middle;
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
            </style>
        `);

        function add() {
            var button = $(`
                <li class="menu__item selector">
                    <div class="menu__ico">
                        <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="menu__text">${Lampa.Lang.translate('title_trailers')}</div>
                </li>
            `);
            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(button);
            $('body').append(Lampa.Template.get('trailer_style', {}, true));
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
