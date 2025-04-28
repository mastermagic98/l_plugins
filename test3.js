(function () {
    'use strict';

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';

    function getFormattedDate(offset, unit, end) {
        var today = new Date();
        if (unit === 'year') today.setFullYear(today.getFullYear() + offset);
        else if (unit === 'month') today.setMonth(today.getMonth() + offset);
        else if (unit === 'week') today.setDate(today.getDate() + offset * 7);
        var year = today.getFullYear();
        var month = String(end ? 12 : today.getMonth() + 1).padStart(2, '0');
        var day = String(end ? 31 : today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    function get(url, page, resolve, reject, useRegion) {
        var lang = Lampa.Storage.get('language', 'ru');
        var full_url = `${tmdb_base_url}${url}&api_key=${tmdb_api_key}&language=${lang}&page=${page}`;
        if (useRegion) full_url += `®ion=${getRegion()}`;
        console.log('API Request:', full_url);
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result);
            resolve(result);
        }, function (error) {
            console.log('API Error:', url, error);
            reject(error);
        });
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(5);

        status.onComplite = function () {
            var fulldata = [];
            ['popular', 'now_playing', 'upcoming', 'genres', 'series'].forEach(function (key) {
                if (status.data[key]) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main completed:', fulldata);
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };

        var excludeRegions = 'JP,KR,TR,MX,BR,AR,CO,CN';
        var excludeLanguages = 'ja,ko,tr,es,pt,zh';

        get(`/movie/popular?sort_by=popularity.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular'), 'popular', `/movie/popular?sort_by=popularity.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get(`/movie/now_playing?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', `/movie/now_playing?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, function () {
            get(`/discover/movie?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
                append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', `/discover/movie?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json);
            }, status.error.bind(status));
        }, true);

        get(`/movie/upcoming?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0, 'month')}&release_date.lte=${getFormattedDate(12, 'month', true)}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming'), 'upcoming', `/movie/upcoming?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0, 'month')}&release_date.lte=${getFormattedDate(12, 'month', true)}&without_genres=16&without_keywords=210024,287501,33511®ion!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get(`/discover/movie?sort_by=release_date.desc`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_genres'), 'genres', `/discover/movie?sort_by=release_date.desc`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), false);

        get(`/discover/tv?sort_by=first_air_date.desc&first_air_date.gte=${getFormattedDate(-1, 'year')}&first_air_date.lte=${getFormattedDate(1, 'year', true)}&without_genres=99,10763`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_series'), 'series', `/discover/tv?sort_by=first_air_date.desc&first_air_date.gte=${getFormattedDate(-1, 'year')}&first_air_date.lte=${getFormattedDate(1, 'year', true)}&without_genres=99,10763`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), false);
    }

    function full(params, oncomplite, onerror) {
        get(params.url, params.page, function (result) {
            if (result && result.results && result.results.length) {
                oncomplite(result);
            } else {
                console.log('Full: No results for', params.url);
                onerror();
            }
        }, function (error) {
            console.log('Full error:', params.url, error);
            onerror();
        }, params.type === 'popular' || params.type === 'now_playing' || params.type === 'upcoming');
    }

    async function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var userLang = Lampa.Storage.get('language', 'ru');
        var langPriority = userLang === 'uk' ? ['uk', 'en'] :
                          userLang === 'ru' ? ['ru', 'en'] :
                          ['en'];
        var allTrailers = [];
        var selectedTrailer = null;

        for (var lang of langPriority) {
            try {
                var url = `${tmdb_base_url}/${type}/${card.id}/videos?api_key=${tmdb_api_key}&language=${lang}`;
                console.log('Videos request:', url);
                var response = await fetch(url);
                var result = await response.json();
                console.log('Videos result for', lang, ':', result);

                if (result.results && result.results.length) {
                    result.results.forEach(function (video) {
                        if (video.type === 'Trailer' && video.site === 'YouTube' && !['zh', 'ja', 'ko', 'tr', 'es', 'pt'].includes(video.iso_639_1)) {
                            video.requested_lang = lang;
                            allTrailers.push(video);
                        }
                    });
                }
            } catch (error) {
                console.log('Videos error for', lang, ':', error);
            }
        }

        console.log('All trailers found:', allTrailers);

        for (var lang of langPriority) {
            selectedTrailer = allTrailers.find(function (video) {
                return (video.iso_639_1 === lang || video.requested_lang === lang) && video.type === 'Trailer' && video.site === 'YouTube';
            });
            if (selectedTrailer) {
                selectedTrailer.iso_639_1 = lang;
                break;
            }
        }

        if (selectedTrailer) {
            console.log('Selected trailer:', selectedTrailer);
            oncomplite({ results: [selectedTrailer] });
        } else {
            console.log('No trailers found for card:', card.id);
            onerror();
        }
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
                this.card.find('.card__view').append('<div class="card__lang">-</div>');
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
            console.log('Playing video ID:', id);
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

        this.setTrailerLanguage = function (lang) {
            if (!this.is_youtube) {
                console.log('Setting trailer language:', lang || '-');
                this.card.find('.card__lang').text(lang ? lang.toUpperCase() : '-');
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();

            if (!_this2.is_youtube) {
                Api.videos(data, function (videos) {
                    var userLang = Lampa.Storage.get('language', 'ru');
                    var video = videos.results[0];
                    if (video) {
                        _this2.setTrailerLanguage(video.iso_639_1);
                    }
                }, function () {
                    _this2.setTrailerLanguage('-');
                });
            }

            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
                if (!_this2.is_youtube) {
                    Api.videos(data, function (videos) {
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var video = videos.results[0];
                        if (video) {
                            _this2.setTrailerLanguage(video.iso_639_1);
                            if (userLang === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                            } else if (userLang === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                            } else if (userLang === 'uk' && video.iso_639_1 !== 'uk') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_uk_trailer'));
                            } else if (userLang === 'ru' && video.iso_639_1 !== 'ru') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                            }
                        }
                    }, function () {
                        _this2.setTrailerLanguage('-');
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    });
                }
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    Api.videos(data, function (videos) {
                        var userLang = Lampa.Storage.get('language', 'ru');
                        var video = videos.results[0];
                        if (video && video.key) {
                            _this2.play(video.key);
                            _this2.setTrailerLanguage(video.iso_639_1);
                        } else {
                            _this2.setTrailerLanguage('-');
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        _this2.setTrailerLanguage('-');
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
                        var video = videos.results[0];
                        if (video && video.key) {
                            items.push({
                                title: Lampa.Lang.translate('title_trailers'),
                                separator: true
                            });
                            items.push({
                                title: video.name || 'Trailer',
                                id: video.key,
                                subtitle: video.iso_639_1 === userLang ? 'Local' : video.iso_639_1
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
                                    _this2.setTrailerLanguage(videos.results[0].iso_639_1);
                                }
                            },
                            onBack: function () {
                                Lampa.Controller.toggle('content');
                            }
                        });
                    }, function () {
                        Lampa.Loading.stop();
                        _this2.setTrailerLanguage('-');
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
        var last;
        var filters;

        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);

            if (data.type === 'popular') {
                filters = $('<div class="items-line__filters"></div>');
                var filterItems = [
                    { title: Lampa.Lang.translate('filter_week'), period: 'week' },
                    { title: Lampa.Lang.translate('filter_month'), period: 'month' },
                    { title: Lampa.Lang.translate('filter_year'), period: 'year', selected: true }
                ];
                filterItems.forEach(function (item) {
                    var filter = $(`<span class="filter-item ${item.selected ? 'selected' : ''}">${item.title}</span>`);
                    filter.on('hover:enter', function () {
                        var newUrl = data.url.replace(/release_date\.gte=[^&]*/, `release_date.gte=${getFormattedDate(-1, item.period)}`);
                        newUrl = newUrl.replace(/release_date\.lte=[^&]*/, `release_date.lte=${getFormattedDate(0, item.period)}`);
                        Lampa.Activity.push({
                            url: newUrl,
                            title: data.title,
                            component: 'trailers_full',
                            type: data.type,
                            page: 1
                        });
                    });
                    filters.append(filter);
                });
                content.find('.items-line__title').after(filters);
            }

            if (data.type === 'genres') {
                filters = $('<div class="items-line__filters"></div>');
                var genres = [
                    { id: '', name: Lampa.Lang.translate('genre_all') },
                    { id: 16, name: Lampa.Lang.translate('genre_anime') },
                    { id: 36, name: Lampa.Lang.translate('genre_history') },
                    { id: 28, name: Lampa.Lang.translate('genre_action') },
                    { id: 37, name: Lampa.Lang.translate('genre_western') },
                    { id: 10752, name: Lampa.Lang.translate('genre_war') },
                    { id: 80, name: Lampa.Lang.translate('genre_crime') },
                    { id: 99, name: Lampa.Lang.translate('genre_documentary') },
                    { id: 18, name: Lampa.Lang.translate('genre_drama') },
                    { id: 10751, name: Lampa.Lang.translate('genre_family') },
                    { id: 27, name: Lampa.Lang.translate('genre_horror') },
                    { id: 35, name: Lampa.Lang.translate('genre_comedy') },
                    { id: 10749, name: Lampa.Lang.translate('genre_romance') },
                    { id: 10402, name: Lampa.Lang.translate('genre_music') },
                    { id: 16, name: Lampa.Lang.translate('genre_animation') },
                    { id: 12, name: Lampa.Lang.translate('genre_adventure') },
                    { id: 10770, name: Lampa.Lang.translate('genre_tv_movie') },
                    { id: 53, name: Lampa.Lang.translate('genre_thriller') },
                    { id: 878, name: Lampa.Lang.translate('genre_sci_fi') },
                    { id: 14, name: Lampa.Lang.translate('genre_fantasy') }
                ];
                genres.forEach(function (genre) {
                    var filter = $(`<span class="filter-item ${genre.id === '' ? 'selected' : ''}">${genre.name}</span>`);
                    filter.on('hover:enter', function () {
                        var newUrl = `/discover/movie?sort_by=release_date.desc${genre.id ? `&with_genres=${genre.id}` : ''}`;
                        Lampa.Activity.push({
                            url: newUrl,
                            title: genre.name,
                            component: 'trailers_full',
                            type: 'genres',
                            page: 1,
                            genre_id: genre.id
                        });
                    });
                    filters.append(filter);
                });
                content.find('.items-line__title').after(filters);
            }

            this.bind();
            body.append(scroll.render());
        };

        this.bind = async function () {
            for (var element of data.results) {
                try {
                    var trailer = await new Promise(function (resolve, reject) {
                        Api.videos(element, function (videos) {
                            resolve(videos.results[0]);
                        }, function () {
                            reject();
                        });
                    });
                    if (trailer) {
                        this.append(element);
                    }
                } catch (e) {
                    console.log('No trailer for:', element.id);
                }
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
            filters && filters.remove();
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
            if (object.type === 'genres' && object.genre_id) {
                var sortButton = $('<div class="sort-button selector">${Lampa.Lang.translate('sort_by_date')}</div>');
                sortButton.on('hover:enter', function () {
                    var sortItems = [
                        { title: Lampa.Lang.translate('sort_by_date'), sort: 'release_date.desc', selected: true },
                        { title: Lampa.Lang.translate('sort_by_rating'), sort: 'vote_average.desc' }
                    ];
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('sort_title'),
                        items: sortItems,
                        onSelect: function (item) {
                            var newUrl = object.url.replace(/sort_by=[^&]*/, `sort_by=${item.sort}`);
                            Lampa.Activity.push({
                                url: newUrl,
                                title: object.title,
                                component: 'trailers_full',
                                type: object.type,
                                page: 1,
                                genre_id: object.genre_id
                            });
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        }
                    });
                });
                html.append(sortButton);
            }

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

        this.append = async function (data, append) {
            var _this2 = this;
            for (var element of data.results) {
                try {
                    var trailer = await new Promise(function (resolve, reject) {
                        Api.videos(element, function (videos) {
                            resolve(videos.results[0]);
                        }, function () {
                            reject();
                        });
                    });
                    if (trailer) {
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
                    }
                } catch (e) {
                    console.log('No trailer for:', element.id);
                }
            }
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
                    page: next.page,
                    genre_id: object.genre_id
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
        trailers_now_playing: {
            ru: 'Сейчас в кино',
            uk: 'Зараз у кіно',
            en: 'Now Playing'
        },
        trailers_upcoming: {
            ru: 'Ожидаемые',
            uk: 'Очікувані',
            en: 'Upcoming'
        },
        trailers_genres: {
            ru: 'Жанры',
            uk: 'Жанри',
            en: 'Genres'
        },
        trailers_series: {
            ru: 'Сериалы',
            uk: 'Серіали',
            en: 'Series'
        },
        trailers_no_trailers: {
            ru: 'Трейлеров не найдено',
            uk: 'Трейлерів не знайдено',
            en: 'No trailers found'
        },
        trailers_no_uk_trailer: {
            ru: 'Нет украинского трейлера',
            uk: 'Немає українського трейлера',
            en: 'No Ukrainian trailer'
        },
        trailers_no_ru_trailer: {
            ru: 'Нет русского трейлера',
            uk: 'Немає російського трейлера',
            en: 'No Russian trailer'
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
        filter_week: {
            ru: 'За неделю',
            uk: 'За тиждень',
            en: 'This Week'
        },
        filter_month: {
            ru: 'За месяц',
            uk: 'За місяць',
            en: 'This Month'
        },
        filter_year: {
            ru: 'За год',
            uk: 'За рік',
            en: 'This Year'
        },
        genre_all: {
            ru: 'Все жанры',
            uk: 'Всі жанри',
            en: 'All Genres'
        },
        genre_anime: {
            ru: 'Аниме',
            uk: 'Аніме',
            en: 'Anime'
        },
        genre_history: {
            ru: 'Исторический',
            uk: 'Історичний',
            en: 'History'
        },
        genre_action: {
            ru: 'Боевик',
            uk: 'Бойовик',
            en: 'Action'
        },
        genre_western: {
            ru: 'Вестерн',
            uk: 'Вестерн',
            en: 'Western'
        },
        genre_war: {
            ru: 'Военный',
            uk: 'Військовий',
            en: 'War'
        },
        genre_crime: {
            ru: 'Криминал',
            uk: 'Кримінал',
            en: 'Crime'
        },
        genre_documentary: {
            ru: 'Документальный',
            uk: 'Документальний',
            en: 'Documentary'
        },
        genre_drama: {
            ru: 'Драма',
            uk: 'Драма',
            en: 'Drama'
        },
        genre_family: {
            ru: 'Семейный',
            uk: 'Сімейний',
            en: 'Family'
        },
        genre_horror: {
            ru: 'Ужасы',
            uk: 'Жахи',
            en: 'Horror'
        },
        genre_comedy: {
            ru: 'Комедия',
            uk: 'Комедія',
            en: 'Comedy'
        },
        genre_romance: {
            ru: 'Мелодрама',
            uk: 'Мелодрама',
            en: 'Romance'
        },
        genre_music: {
            ru: 'Музыка',
            uk: 'Музика',
            en: 'Music'
        },
        genre_animation: {
            ru: 'Мультфильм',
            uk: 'Мультфільм',
            en: 'Animation'
        },
        genre_adventure: {
            ru: 'Приключения',
            uk: 'Пригоди',
            en: 'Adventure'
        },
        genre_tv_movie: {
            ru: 'Телефильм',
            uk: 'Телефільм',
            en: 'TV Movie'
        },
        genre_thriller: {
            ru: 'Триллер',
            uk: 'Трилер',
            en: 'Thriller'
        },
        genre_sci_fi: {
            ru: 'Фантастика',
            uk: 'Фантастика',
            en: 'Sci-Fi'
        },
        genre_fantasy: {
            ru: 'Фэнтези',
            uk: 'Фентезі',
            en: 'Fantasy'
        },
        sort_title: {
            ru: 'Сортировка',
            uk: 'Сортування',
            en: 'Sort'
        },
        sort_by_date: {
            ru: 'По дате',
            uk: 'За датою',
            en: 'By Date'
        },
        sort_by_rating: {
            ru: 'По рейтингу',
            uk: 'За рейтингом',
            en: 'By Rating'
        }
    });

    function startPlugin() {
        console.log('startPlugin called');
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
                position: relative;
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
            .card.card--trailer .card__lang {
                position: absolute;
                top: 0.5em;
                right: 0.5em;
                background: #000000b8;
                color: white;
                padding: 0.2em 0.5em;
                border-radius: 3px;
                font-size: 0.9em;
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
            .items-line__filters {
                margin: 0.5em 0;
                display: flex;
                gap: 0.5em;
                flex-wrap: wrap;
            }
            .filter-item {
                padding: 0.3em 0.8em;
                background: #333;
                border-radius: 3px;
                cursor: pointer;
                color: #fff;
                font-size: 0.9em;
            }
            .filter-item.selected {
                background: #007bff;
            }
            .sort-button {
                padding: 0.5em 1em;
                background: #007bff;
                color: #fff;
                border-radius: 3px;
                margin-bottom: 1em;
                cursor: pointer;
                display: inline-block;
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
            console.log('add called');
            var menuList = $('.menu .menu__list').eq(0);
            if (!menuList.length) {
                console.warn('Menu list not found, trying alternative selector');
                menuList = $('.menu__list').first();
            }
            if (!menuList.length) {
                console.error('No menu list found');
                return;
            }
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
                console.log('Trailers button clicked');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            menuList.append(button);
            console.log('Button appended to menu');
            $('body').append(Lampa.Template.get('trailer_style', {}, true));
        }

        if (window.appready) {
            console.log('App already ready, calling add');
            add();
        } else {
            console.log('Waiting for app ready event');
            Lampa.Listener.follow('app', function (e) {
                console.log('App event:', e.type);
                if (e.type === 'ready') {
                    add();
                }
            });
        }

        // Додатковий таймер як запасний варіант
        setTimeout(function () {
            if (!window.plugin_trailers_ready) {
                console.log('Fallback: Forcing add after timeout');
                add();
            }
        }, 5000);
    }

    if (!window.plugin_trailers_ready) {
        console.log('Plugin not ready, starting');
        startPlugin();
    } else {
        console.log('Plugin already initialized');
    }
})();
