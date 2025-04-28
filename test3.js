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
        var status = new Lampa.Status(5); // П’ять категорій: Популярне, Зараз у кіно, Очікувані, Жанри, Серіали

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

        // Популярне (за рік за замовчуванням)
        get(`/movie/popular?sort_by=popularity.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular'), 'popular', `/movie/popular?sort_by=popularity.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        // Зараз у кіно
        get(`/movie/now_playing?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', `/movie/now_playing?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, function () {
            get(`/discover/movie?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
                append(Lampa.Lang.translate('trailers_now_playing'), 'now_playing', `/discover/movie?sort_by=release_date.desc&release_date.gte=${getFormattedDate(-1, 'year')}&release_date.lte=${getFormattedDate(0, 'year')}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json);
            }, status.error.bind(status));
        }, true);

        // Очікувані (наступні 12 місяців)
        get(`/movie/upcoming?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0, 'month')}&release_date.lte=${getFormattedDate(12, 'month', true)}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming'), 'upcoming', `/movie/upcoming?sort_by=release_date.asc&release_date.gte=${getFormattedDate(0, 'month')}&release_date.lte=${getFormattedDate(12, 'month', true)}&without_genres=16&without_keywords=210024,287501,33511&region!=${excludeRegions}&with_original_language!=${excludeLanguages}`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        // Жанри (за замовчуванням усі жанри)
        get(`/discover/movie?sort_by=release_date.desc`, 1, function (json) {
            append(Lampa.Lang.translate('trailers_genres'), 'genres', `/discover/movie?sort_by=release_date.desc`, json.results.length ? json : { results: [] });
        }, status.error.bind(status), false);

        // Серіали (без змін)
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
            more.addClass('more--
