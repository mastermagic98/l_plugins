(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';

    function getFormattedDate(daysAgo, monthsAhead) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        if (monthsAhead) today.setMonth(today.getMonth() + monthsAhead);
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function formatReleaseDate(dateStr) {
        if (!dateStr) return 'N/A';
        var date = new Date(dateStr);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        return day + '.' + month + '.' + year;
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    function get(url, page, resolve, reject, useRegion) {
        var lang = Lampa.Storage.get('language', 'ru');
        var region = getRegion();
        var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&language=' + lang + '&page=' + page;
        if (useRegion) full_url += '&region=' + region;
        console.log('API Request:', full_url);
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result);
            if (result && result.results) {
                resolve(result);
            } else {
                console.log('API Warning: No results in response', url);
                resolve({ results: [] });
            }
        }, function (error) {
            console.log('API Error:', url, error);
            Lampa.Noty.show('Не вдалося отримати дані для ' + url);
            resolve({ results: [] });
        });
    }

    function getSeasonInfo(card, callback) {
        if (!card.name) return callback(null);
        var url = tmdb_base_url + '/tv/' + card.id + '?api_key=' + tmdb_api_key;
        network.silent(url, function (result) {
            callback({
                season: result.number_of_seasons,
                episode: result.seasons && result.seasons.length ? result.seasons[result.seasons.length - 1].episode_count : 1
            });
        }, function () {
            callback(null);
        });
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);

        status.onComplite = function () {
            var fulldata = [];
            ['popular_movies', 'popular_series', 'now_playing', 'upcoming', 'new_series', 'new_seasons'].forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                } else {
                    console.log('No data for category:', key, status.data[key]);
                }
            });
            console.log('Main completed:', fulldata);
            if (fulldata.length) oncomplite(fulldata);
            else {
                console.log('No data to display');
                onerror();
            }
        };

        var append = function (title, name, url, json) {
            console.log('Appending data for:', name, 'Results:', json.results.length);
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };

        var popularMoviesUrl = '/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&release_date.gte=2005-01-01';
        get(popularMoviesUrl, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', popularMoviesUrl, json);
        }, function () {
            get('/discover/movie?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, false);

        var popularSeriesUrl = '/discover/tv?sort_by=vote_average.desc&vote_count.gte=1000&first_air_date.gte=2005-01-01';
        get(popularSeriesUrl, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', popularSeriesUrl, json);
        }, function () {
            get('/discover/tv?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, false);

        get('/discover/movie?sort_by=release_date.desc&release_date.gte=' + getFormattedDate(90), 1, function (json) {
            append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', '/discover/movie?sort_by=release_date.desc&release_date.gte=' + getFormattedDate(90), json);
        }, function () {
            get('/discover/movie?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', '/discover/movie?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, true);

        get('/movie/upcoming?release_date.gte=' + getFormattedDate() + '&release_date.lte=' + getFormattedDate(0, 12), 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming'), 'upcoming', '/movie/upcoming?release_date.gte=' + getFormattedDate() + '&release_date.lte=' + getFormattedDate(0, 12), json);
        }, function () {
            get('/discover/movie?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_upcoming'), 'upcoming', '/discover/movie?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, true);

        get('/tv/on_the_air?first_air_date.gte=' + getFormattedDate(90), 1, function (json) {
            append(Lampa.Lang.translate('trailers_new_series'), 'new_series', '/tv/on_the_air?first_air_date.gte=' + getFormattedDate(90), json);
        }, function () {
            get('/discover/tv?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_new_series'), 'new_series', '/discover/tv?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, true);

        get('/tv/airing_today?first_air_date.gte=' + getFormattedDate(90), 1, function (json) {
            append(Lampa.Lang.translate('trailers_new_seasons'), 'new_seasons', '/tv/airing_today?first_air_date.gte=' + getFormattedDate(90), json);
        }, function () {
            get('/discover/tv?sort_by=popularity.desc', 1, function (json) {
                append(Lampa.Lang.translate('trailers_new_seasons'), 'new_seasons', '/discover/tv?sort_by=popularity.desc', json);
            }, status.error.bind(status));
        }, true);
    }

    function full(params, oncomplite, onerror) {
        get(params.url, params.page, function (result) {
            console.log('Full results for:', params.url, result.results ? result.results.length : 0);
            if (result && result.results && result.results.length) {
                oncomplite(result);
            } else {
                console.log('Full: No results for', params.url);
                onerror();
            }
        }, function () {
            console.log('Full error:', params.url);
            onerror();
        }, params.type === 'now_playing' || params.type === 'upcoming' || params.type === 'new_series' || params.type === 'new_seasons');
    }

    function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var url = tmdb_base_url + '/' + type + '/' + card.id + '/videos?api_key=' + tmdb_api_key;
        console.log('Videos request:', url);
        network.silent(url, function (result) {
            console.log('Videos result:', result);
            oncomplite(result);
        }, function (error) {
            console.log('Videos error:', error);
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
                var title = data.title || data.name;
                this.card.find('.card__title').text(title);
                this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
                this.card.find('.card__view').append('<div class="card__language"></div>');
                
                var _this = this;
                if (params.type === 'popular_series' || params.type === 'new_series' || params.type === 'new_seasons') {
                    getSeasonInfo(data, function (info) {
                        if (info) {
                            var seasonText = Lampa.Lang.translate('season') + ' ' + info.season;
                            if (params.type === 'popular_series') {
                                seasonText += ', ' + info.episode + ' ' + Lampa.Lang.translate('episode');
                            }
                            _this.card.find('.card__view').append('<div class="card__season">' + seasonText + '</div>');
                        }
                        appendRatingOrDate();
                    });
                } else {
                    appendRatingOrDate();
                }

                function appendRatingOrDate() {
                    if (params.type === 'upcoming' && data.release_date) {
                        _this.card.find('.card__view').append('<div class="card__release">' + formatReleaseDate(data.release_date) + '</div>');
                    }
                    var ratingOrDate = data.vote_average ? data.vote_average.toFixed(1) : (params.type === 'upcoming' && data.release_date ? 'N/A' : 'N/A');
                    _this.card.find('.card__view').append('<div class="card__rating">' + ratingOrDate + '</div>');
                }
            } else {
                this.card.find('.card__title').text(data.name);
                this.card.find('.card__details').remove();
            }
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
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.svg';
            };
        };

        this.play = function (id, language) {
            if (!id) {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
            console.log('Playing video ID:', id);
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
            if (!this.is_youtube) {
                this.card.find('.card__language').text(language.toUpperCase());
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
                    _this2.play(data.id, 'EN');
                } else {
                    Api.videos(data, function (videos) {
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var trailers = videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        });
                        var video = trailers.find(function (v) {
                            return v.iso_639_1 === userLang || v.iso_639_1 === 'ua';
                        }) || trailers.find(function (v) {
                            return v.iso_639_1 === 'ru';
                        }) || trailers.find(function (v) {
                            return v.iso_639_1 === 'en';
                        }) || trailers[0];

                        var language = video ? (video.iso_639_1 === 'ua' ? 'UK' : video.iso_639_1.toUpperCase()) : 'EN';
                        if (video && video.key) {
                            if (userLang === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'ua') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_uk_trailer'));
                            }
                            _this2.play(video.key, language);
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
                                    _this2.play(item.id, item.subtitle === 'Local' ? userLang.toUpperCase() : item.subtitle.toUpperCase());
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
                this.img.src = 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg';
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
        var items = [];
        var active = 0;
        var more;
        var filter;
        var last;

        this.create = function () {
            console.log('Creating line for:', data.title, 'Results:', data.results.length);
            content.find('.items-line__title').text(data.title);

            if (data.type === 'popular_movies') {
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
                                url: item.value === 'day' ? '/trending/movie/day' :
                                     item.value === 'week' ? '/trending/movie/week' :
                                     item.value === 'month' ? '/discover/movie?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(30) :
                                     '/discover/movie?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(365),
                                title: Lampa.Lang.translate('trailers_popular_movies'),
                                component: 'trailers_main',
                                type: 'popular_movies',
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
            body.append($('<div class="items-cards"></div>'));
            content.on('mouseover', function () {
                Lampa.Controller.enable('items_line');
            });
        };

        this.bind = function () {
            console.log('Binding items for:', data.title);
            if (data.results && data.results.length) {
                data.results.forEach(this.append.bind(this));
            } else {
                console.log('No results to bind for:', data.title);
            }
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
            console.log('Appending card:', element.title || element.name);
            var card = new Trailer(element, { type: data.type });
            card.create();
            card.visible();
            card.onFocus = function (target, card_data, is_mouse) {
                last = target;
                active = items.indexOf(card);
                if (_this.onFocus) _this.onFocus(card_data);
            };
            body.find('.items-cards').append(card.render());
            items.push(card);
        };

        this.more = function () {
            var _this = this;
            more = Lampa.Template.get('more');
            more.addClass('more--trailers selector');
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
                active = items.length;
            });
            body.find('.items-cards').append(more);
            items.push({ render: function () { return more; } });
        };

        this.toggle = function () {
            var _this2 = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(body);
                    Lampa.Controller.collectionFocus(last || (items.length ? items[0].render() : false), body);
                },
                right: function () {
                    if (active < items.length - 1) {
                        active++;
                        Lampa.Controller.collectionFocus(items[active].render(), body);
                    } else {
                        Navigator.move('right');
                    }
                },
                left: function () {
                    if (active > 0) {
                        active--;
                        Lampa.Controller.collectionFocus(items[active].render(), body);
                    } else if (Navigator.canmove('left')) {
                        Navigator.move('left');
                    } else if (_this2.onLeft) {
                        _this2.onLeft();
                    } else {
                        Lampa.Controller.toggle('menu');
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
            content.remove();
            more && more.remove();
            filter && filter.remove();
            items = [];
        };
    }

    function Component$1(object) {
        var items = [];
        var html = $('<div></div>');
        var active = 0;

        this.create = function () {
            Api.main(this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Displaying empty state');
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            console.log('Building main component with data:', data.length, 'categories');
            html.append($('<div class="content-container"></div>'));
            data.forEach(this.append.bind(this));
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (element) {
            console.log('Appending category:', element.title);
            var item = new Line(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onToggle = function () {
                active = items.indexOf(item);
            };
            html.find('.content-container').append(item.render());
            items.push(item);
        };

        this.back = function () {
            Lampa.Activity.backward();
        };

        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            items[active].toggle();
            if (items[active].items && items[active].items.length) {
                items[active].active = 0;
                Lampa.Controller.collectionFocus(items[active].items[0].render(), items[active].body);
            }
        };

        this.up = function () {
            active--;
            if (active < 0) {
                active = 0;
                Lampa.Controller.toggle('head');
            } else {
                items[active].toggle();
                if (items[active].items && items[active].items.length) {
                    items[active].active = 0;
                    Lampa.Controller.collectionFocus(items[active].items[0].render(), items[active].body);
                }
            }
        };

        this.start = function () {
            var _this2 = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () {
                    if (items.length) {
                        items[active].toggle();
                        if (items[active].items && items[active].items.length) {
                            items[active].active = 0;
                            Lampa.Controller.collectionFocus(items[active].items[0].render(), items[active].body);
                        }
                    }
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
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
            html.remove();
            items = [];
        };
    }

    function Component(object) {
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="category-full category-full--trailers"></div>');
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var total_pages = 0;
        var last;
        var waitload = false;

        this.create = function () {
            Api.full(object, this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Displaying empty state for full component');
            var empty = new Lampa.Empty();
            body.append(empty.render());
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
            console.log('Appending full results:', data.results ? data.results.length : 0);
            if (data.results && data.results.length) {
                data.results.forEach(function (element) {
                    var card = new Trailer(element, { type: object.type });
                    card.create();
                    card.visible();
                    card.onFocus = function (target, card_data) {
                        last = target;
                        if (!newlampa && _this2.body.children().length - 1 === _this2.items.indexOf(card)) _this2.next();
                    };
                    body.append(card.render());
                    items.push(card);
                    if (append) Lampa.Controller.collectionAppend(card.render());
                });
            } else {
                console.log('No results to append for full component');
            }
        };

        this.build = function (data) {
            var _this3 = this;
            console.log('Building full component with:', data.results ? data.results.length : 0, 'results');
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                html.append(body);
                this.append(data);
                if (total_pages > data.page && items.length) this.more();
                if (newlampa) {
                    this.next.bind(this);
                }
                this.activity.loader(false);
                this.activity.toggle();
            } else {
                console.log('No results for full component, showing empty state');
                html.append(body);
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
                    Lampa.Controller.collectionSet(body);
                    Lampa.Controller.collectionFocus(last || false, body);
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
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
            html.remove();
            body.remove();
            items = [];
        };
    }

    Lampa.Lang.add({
        trailers_popular_movies: {
            ru: 'Популярные фильмы',
            uk: 'Популярні фільми',
            en: 'Popular Movies'
        },
        trailers_popular_series: {
            ru: 'Популярные сериалы',
            uk: 'Популярні серіали',
            en: 'Popular Series'
        },
        trailers_now_playing: {
            ru: 'В прокате фильмы',
            uk: 'В прокаті фільми',
            en: 'Now Playing Movies'
        },
        trailers_upcoming: {
            ru: 'Ожидаемые фильмы',
            uk: 'Очікувані фільми',
            en: 'Upcoming Movies'
        },
        trailers_new_series: {
            ru: 'Новые сериалы',
            uk: 'Нові серіали',
            en: 'New Series'
        },
        trailers_new_seasons: {
            ru: 'Новые сезоны',
            uk: 'Нові сезони',
            en: 'New Seasons'
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
        },
        season: {
            ru: 'Сезон',
            uk: 'Сезон',
            en: 'Season'
        },
        episode: {
            ru: 'серия',
            uk: 'серія',
            en: 'episode'
        }
    });

    function startPlugin() {
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', [
            '<div class="card selector card--trailer layer--render layer--visible">',
                '<div class="card__view">',
                    '<img src="./img/img_load.svg" class="card__img">',
                    '<div class="card__promo">',
                        '<div class="card__promo-text">',
                            '<div class="card__title"></div>',
                        '</div>',
                        '<div class="card__details"></div>',
                    '</div>',
                '</div>',
                '<div class="card__play">',
                    '<img src="./img/icons/player/play.svg">',
                '</div>',
            '</div>'
        ].join(''));
        Lampa.Template.add('trailer_style', [
            '<style>',
            '.card.card--trailer,',
            '.card-more.more--trailers {',
                'width: 25.7em;',
                'margin-right: 1em;',
            '}',
            '.card.card--trailer .card__view {',
                'padding-bottom: 56%;',
                'margin-bottom: 0;',
                'position: relative;',
            '}',
            '.card.card--trailer .card__details {',
                'margin-top: 0.8em;',
            '}',
            '.card.card--trailer .card__play {',
                'position: absolute;',
                'top: 1.4em;',
                'left: 1.5em;',
                'background: #000000b8;',
                'width: 2.2em;',
                'height: 2.2em;',
                'border-radius: 100%;',
                'text-align: center;',
                'padding-top: 0.6em;',
            '}',
            '.card.card--trailer .card__play img {',
                'width: 0.9em;',
                'height: 1em;',
            '}',
            '.card.card--trailer .card__language {',
                'position: absolute;',
                'top: 10px;',
                'right: 10px;',
                'background: rgba(0,0,0,0.7);',
                'color: white;',
                'padding: 5px 10px;',
                'border-radius: 4px;',
                'font-size: 14px;',
            '}',
            '.card.card--trailer .card__season {',
                'position: absolute;',
                'bottom: 50px;',
                'right: 10px;',
                'color: white;',
                'font-size: 14px;',
                'font-weight: bold;',
            '}',
            '.card.card--trailer .card__release {',
                'position: absolute;',
                'bottom: 30px;',
                'right: 10px;',
                'color: white;',
                'font-size: 14px;',
            '}',
            '.card.card--trailer .card__rating {',
                'position: absolute;',
                'bottom: 10px;',
                'right: 10px;',
                'color: white;',
                'font-size: 18px;',
                'font-weight: bold;',
            '}',
            '.card-more.more--trailers .card-more__box {',
                'padding-bottom: 56%;',
            '}',
            '.category-full--trailers .card {',
                'margin-bottom: 1.5em;',
            '}',
            '.category-full--trailers .card {',
                'width: 33.3%;',
            '}',
            '.items-line__filter {',
                'display: inline-block;',
                'margin-left: 10px;',
                'cursor: pointer;',
            '}',
            '.items-line__filter svg {',
                'width: 20px;',
                'height: 20px;',
                'vertical-align: middle;',
            '}',
            '.items-line {',
                'padding: 10px 0;',
            '}',
            '.items-cards {',
                'display: flex;',
                'flex-wrap: nowrap;',
            '}',
            '@media screen and (max-width: 767px) {',
                '.category-full--trailers .card {',
                    'width: 50%;',
                '}',
            '}',
            '@media screen and (max-width: 400px) {',
                '.category-full--trailers .card {',
                    'width: 100%;',
                '}',
            '}',
            '</style>'
        ].join(''));

        function add() {
            var button = $([
                '<li class="menu__item selector">',
                    '<div class="menu__ico">',
                        '<svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">',
                            '<path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>',
                        '</svg>',
                    '</div>',
                    '<div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div>',
                '</li>'
            ].join(''));
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
