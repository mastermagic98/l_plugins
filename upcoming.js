(function () {
    'use strict';

    function debounce(func, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    }

    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';
    var trailerCache = {};
    var categoryCache = {};

    function getFormattedDate(daysAgo) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        return today.toISOString().split('T')[0];
    }

    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return '-';
        var date = new Date(dateStr);
        return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + date.getFullYear();
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    function getInterfaceLanguage() {
        return Lampa.Storage.get('language', 'ru');
    }

    function getPreferredLanguages() {
        var lang = Lampa.Storage.get('language', 'ru');
        if (lang === 'uk') return ['uk', 'en'];
        if (lang === 'ru') return ['ru', 'en'];
        return ['en'];
    }

    function get(url, page, resolve, reject) {
        network.silent(tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage(), resolve, reject);
    }

    function fetchMovies(page, resolve, reject, options) {
        var region = getRegion();
        var language = getInterfaceLanguage();
        var today = new Date();
        var url = options.url || '/discover/movie?sort_by=popularity.desc&vote_count.gte=1®ion=' + region + '&language=' + language + '&page=' + page;

        if (options.nowPlaying) {
            var startDate = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            url = '/movie/now_playing?primary_release_date.gte=' + startDate;
        } else if (options.upcoming) {
            var sixMonthsLater = getFormattedDate(-180);
            url = '/discover/movie?primary_release_date.gte=' + today.toISOString().split('T')[0] + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1';
        }

        network.silent(tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&language=' + language + '&page=' + page + '®ion=' + region, function (data) {
            if (!data.results || !data.results.length) return resolve(data);

            var totalRequests = data.results.length;
            var completedRequests = 0;

            function finalizeResults() {
                var filteredResults = [];
                for (var i = 0; i < data.results.length; i++) {
                    var m = data.results[i];
                    if (options.nowPlaying) {
                        var releaseInfo = m.release_details && m.release_details.results && m.release_details.results.length ? m.release_details.results[0] : null;
                        var releaseDateStr = releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length ? releaseInfo.release_dates[0].release_date : m.release_date;
                        var releaseDate = new Date(releaseDateStr);
                        if (releaseDate >= new Date(startDate) && releaseDate <= today) {
                            filteredResults.push(m);
                        }
                    } else if (m.release_date || (m.release_details && m.release_details.results && m.release_details.results.length)) {
                        filteredResults.push(m);
                    }
                }

                filteredResults.sort(function (a, b) {
                    var dateA = a.release_details && a.release_details.results && a.release_details.results.length && a.release_details.results[0].iso_3166_1 === region ? a.release_details.results[0].release_dates[0].release_date : a.release_date;
                    var dateB = b.release_details && b.release_details.results && b.release_details.results.length && b.release_details.results[0].iso_3166_1 === region ? b.release_details.results[0].release_dates[0].release_date : b.release_date;
                    return new Date(options.upcoming ? dateA : dateB) - new Date(options.upcoming ? dateB : dateA);
                });

                data.results = filteredResults;
                resolve(data);
            }

            for (var i = 0; i < data.results.length; i++) {
                (function (movie) {
                    var movie_id = movie.id;
                    if (movie_id) {
                        network.silent(tmdb_base_url + '/movie/' + movie_id + '/release_dates?api_key=' + tmdb_api_key, function (release_data) {
                            movie.release_details = release_data;
                            if (++completedRequests === totalRequests) finalizeResults();
                        }, function () {
                            movie.release_details = { results: [] };
                            if (++completedRequests === totalRequests) finalizeResults();
                        });
                    } else {
                        movie.release_details = { results: [] };
                        if (++completedRequests === totalRequests) finalizeResults();
                    }
                })(data.results[i]);
            }
        }, reject);
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);
        status.onComplite = function () {
            var fulldata = [];
            var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    categoryCache[key] = { results: status.data[key].results, timestamp: Date.now() };
                    Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
                    fulldata.push(status.data[key]);
                }
            }
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };

        function append(title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        }

        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);
        var threeMonthsAgo = getFormattedDate(90);
        var threeMonthsLater = getFormattedDate(-90);

        fetchMovies(1, function (json) {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: [] });
        }, {});

        fetchMovies(1, function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: [] });
        }, { nowPlaying: true });

        fetchMovies(1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
        }, { upcoming: true });

        get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
            var filteredResults = [];
            if (json.results) {
                for (var i = 0; i < json.results.length; i++) {
                    var item = json.results[i];
                    if (!item.genre_ids || (item.genre_ids.indexOf(99) === -1 && item.genre_ids.indexOf(10763) === -1 && item.genre_ids.indexOf(10764) === -1)) {
                        filteredResults.push(item);
                    }
                }
            }
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: filteredResults });
        }, function () {
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: [] });
        });

        get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
            if (json.results) {
                for (var i = 0; i < json.results.length; i++) {
                    json.results[i].release_details = { first_air_date: json.results[i].first_air_date };
                }
            }
            append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: [] });
        });

        get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
            if (json.results) {
                for (var i = 0; i < json.results.length; i++) {
                    json.results[i].release_details = { first_air_date: json.results[i].first_air_date };
                }
            }
            append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
        });
    }

    function full(params, oncomplite, onerror) {
        var targetCards = 20;
        var cachedData = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, null);

        if (cachedData && cachedData.results && cachedData.results.length) {
            var filteredResults = [];
            for (var i = 0; i < cachedData.results.length; i++) {
                var m = cachedData.results[i];
                if (params.type.indexOf('series') !== -1 || m.release_date || (m.release_details && m.release_details.results && m.release_details.results.length)) {
                    filteredResults.push(m);
                }
            }
            var startIdx = (params.page - 1) * targetCards;
            var pageResults = filteredResults.slice(startIdx, startIdx + targetCards);
            if (pageResults.length) {
                return oncomplite({
                    page: params.page,
                    results: pageResults,
                    total_pages: Math.ceil(filteredResults.length / targetCards) || 1,
                    total_results: filteredResults.length
                });
            }
        }

        var fetchFunction = params.type.indexOf('series') !== -1 ? get : fetchMovies;
        var fetchOptions = {
            nowPlaying: params.type === 'in_theaters',
            upcoming: params.type === 'upcoming_movies'
        };

        fetchFunction(params.url || '/discover/' + (params.type.indexOf('series') !== -1 ? 'tv' : 'movie'), params.page, function (result) {
            if (!result || !result.results || !result.results.length) return onerror();

            if (params.type.indexOf('series') !== -1) {
                for (var i = 0; i < result.results.length; i++) {
                    result.results[i].release_details = { first_air_date: result.results[i].first_air_date };
                }
            }

            var filteredResults = [];
            for (var i = 0; i < result.results.length; i++) {
                var m = result.results[i];
                if (params.type.indexOf('series') !== -1 || m.release_date || (m.release_details && m.release_details.results && m.release_details.results.length)) {
                    filteredResults.push(m);
                }
            }

            result.results = filteredResults;
            result.total_results = filteredResults.length;
            result.total_pages = Math.ceil(filteredResults.length / targetCards) || 1;

            if (params.page === 1) {
                categoryCache[params.type] = { results: filteredResults, timestamp: Date.now() };
            } else {
                var existingCache = categoryCache[params.type] || { results: [] };
                var uniqueResults = [];
                var seen = {};
                for (var i = 0; i < existingCache.results.length; i++) {
                    var str = JSON.stringify(existingCache.results[i]);
                    if (!seen[str]) {
                        uniqueResults.push(existingCache.results[i]);
                        seen[str] = true;
                    }
                }
                for (var i = 0; i < filteredResults.length; i++) {
                    var str = JSON.stringify(filteredResults[i]);
                    if (!seen[str]) {
                        uniqueResults.push(filteredResults[i]);
                        seen[str] = true;
                    }
                }
                existingCache.results = uniqueResults;
                categoryCache[params.type] = existingCache;
            }
            Lampa.Storage.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
            oncomplite(result);
        }, onerror, fetchOptions);
    }

    function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var id = card.id;
        var cacheKey = type + '_' + id;

        if (trailerCache[cacheKey]) return oncomplite(trailerCache[cacheKey]);

        var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key;
        var preferredLangs = getPreferredLanguages();
        var attempts = 0;
        var tmdbTrailers = [];

        function tryFetch(langIndex) {
            if (attempts >= preferredLangs.length + 1) {
                var englishTrailer = null;
                for (var i = 0; i < tmdbTrailers.length; i++) {
                    if (tmdbTrailers[i].iso_639_1 === 'en') {
                        englishTrailer = tmdbTrailers[i];
                        break;
                    }
                }
                trailerCache[cacheKey] = { id: id, results: englishTrailer ? [englishTrailer] : [] };
                return englishTrailer ? oncomplite(trailerCache[cacheKey]) : onerror();
            }

            var fetchUrl = langIndex < preferredLangs.length ? url + '&language=' + preferredLangs[langIndex] : url;
            network.silent(fetchUrl, function (result) {
                var trailers = result.results && result.results.length ? result.results.filter(function (v) { return v.type === 'Trailer'; }) : [];
                for (var i = 0; i < trailers.length; i++) {
                    tmdbTrailers.push(trailers[i]);
                }
                var preferredTrailer = null;
                for (var i = 0; i < trailers.length; i++) {
                    if (preferredLangs.indexOf(trailers[i].iso_639_1) !== -1) {
                        preferredTrailer = trailers[i];
                        break;
                    }
                }
                if (preferredTrailer) {
                    trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
                    oncomplite(trailerCache[cacheKey]);
                } else {
                    attempts++;
                    tryFetch(langIndex + 1);
                }
            }, function () {
                attempts++;
                tryFetch(langIndex + 1);
            });
        }

        tryFetch(0);
    }

    function clear() {
        network.clear();
        trailerCache = {};
        categoryCache = {};
        var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
        for (var i = 0; i < keys.length; i++) {
            Lampa.Storage.set('trailer_category_cache_' + keys[i], null);
        }
    }

    var Api = { get: get, main: main, full: full, videos: videos, clear: clear };

    function Trailer(data, params) {
        this.build = function () {
            this.card = Lampa.Template.get('trailer', data);
            this.img = this.card.find('img')[0];
            this.is_youtube = params.type === 'rating';
            this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
            this.trailer_lang = '';
            this.release_date = '-';

            if (!this.is_youtube) {
                var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
                var title = data.title || data.name || data.original_title || data.original_name;
                this.card.find('.card__title').text(title);
                this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
                this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div><div class="card__trailer-lang"></div><div class="card__release-date"></div>');
            } else {
                this.card.find('.card__title').text(data.name);
                this.card.find('.card__details').remove();
            }
        };

        this.cardImgBackground = function (card_data) {
            if (!Lampa.Storage.field('background')) return '';
            var path = card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790 ? 'original' : 'w500') : '';
            return path || (this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '');
        };

        this.image = function () {
            var _this = this;
            this.img.onload = function () { _this.card.addClass('card--loaded'); };
            this.img.onerror = function () { _this.img.src = './img/img_broken.svg'; };
        };

        this.loadTrailerInfo = function () {
            var _this = this;
            if (this.is_youtube || this.trailer_lang) return;

            Api.videos(data, function (videos) {
                var trailers = videos.results && videos.results.length ? videos.results.filter(function (v) { return v.type === 'Trailer'; }) : [];
                var video = null;
                for (var i = 0; i < trailers.length; i++) {
                    if (getPreferredLanguages().indexOf(trailers[i].iso_639_1) !== -1) {
                        video = trailers[i];
                        break;
                    }
                }
                if (!video && trailers.length) video = trailers[0];
                _this.trailer_lang = video ? video.iso_639_1 : '-';
                _this.card.find('.card__trailer-lang').text(_this.trailer_lang === '-' ? '-' : _this.trailer_lang.toUpperCase());

                if (params.type === 'popular_movies' || params.type === 'in_theaters' || params.type === 'upcoming_movies') {
                    var region = getRegion();
                    var releaseInfo = null;
                    if (data.release_details && data.release_details.results) {
                        for (var i = 0; i < data.release_details.results.length; i++) {
                            if (data.release_details.results[i].iso_3166_1 === region) {
                                releaseInfo = data.release_details.results[i];
                                break;
                            }
                        }
                    }
                    _this.release_date = formatDateToDDMMYYYY(releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length ? releaseInfo.release_dates[0].release_date : data.release_date);
                } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
                    _this.release_date = formatDateToDDMMYYYY(data.release_details && data.release_details.first_air_date ? data.release_details.first_air_date : '');
                }
                _this.card.find('.card__release-date').text(_this.release_date);
            }, function () {
                _this.trailer_lang = '-';
                _this.card.find('.card__trailer-lang').text('-');
                _this.card.find('.card__release-date').text('-');
            });
        };

        this.play = function (id) {
            if (!id) return Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            try {
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
            } catch (e) {
                Lampa.Noty.show('Ошибка воспроизведения трейлера: ' + e.message);
            }
        };

        this.create = function () {
            var _this = this;
            this.build();
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this.cardImgBackground(data));
                if (_this.onFocus) _this.onFocus(e.target, data, is_mouse);
                _this.loadTrailerInfo();
            }).on('hover:enter', function () {
                if (_this.is_youtube) return _this.play(data.id);
                Api.videos(data, function (videos) {
                    var preferredLangs = getPreferredLanguages();
                    var video = null;
                    var trailers = videos.results && videos.results.length ? videos.results.filter(function (v) { return v.type === 'Trailer'; }) : [];
                    for (var i = 0; i < trailers.length; i++) {
                        if (preferredLangs.indexOf(trailers[i].iso_639_1) !== -1) {
                            video = trailers[i];
                            break;
                        }
                    }
                    if (!video && trailers.length) video = trailers[0];
                    if (video && video.key) {
                        if (preferredLangs[0] === 'uk' && preferredLangs.indexOf(video.iso_639_1) === -1) Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
                        else if (preferredLangs[0] === 'ru' && preferredLangs.indexOf(video.iso_639_1) === -1) Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                        _this.play(video.key);
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    }
                }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                });
            }).on('hover:long', function () {
                if (_this.is_youtube) return;
                var items = [{ title: Lampa.Lang.translate('trailers_view'), view: true }];
                Lampa.Loading.start(function () { Api.clear(); Lampa.Loading.stop(); });
                Api.videos(data, function (videos) {
                    Lampa.Loading.stop();
                    var preferredLangs = getPreferredLanguages();
                    var trailers = videos.results && videos.results.length ? videos.results.filter(function (v) { return v.type === 'Trailer'; }) : [];
                    if (trailers.length) {
                        items.push({ title: Lampa.Lang.translate('title_trailers'), separator: true });
                        for (var i = 0; i < trailers.length; i++) {
                            var video = trailers[i];
                            if (video.key && preferredLangs.indexOf(video.iso_639_1) !== -1) {
                                items.push({ title: video.name || 'Trailer', id: video.key, subtitle: video.iso_639_1 });
                            }
                        }
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
                                _this.play(item.id);
                            }
                        },
                        onBack: function () { Lampa.Controller.toggle('content'); }
                    });
                }, function () {
                    Lampa.Loading.stop();
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                });
            });
            this.image();
            this.loadTrailerInfo();
        };

        this.destroy = function () {
            this.img.onerror = this.img.onload = null;
            this.img.src = '';
            this.card.remove();
            this.card = this.img = null;
        };

        this.visible = function () {
            if (this.visibled) return;
            this.img.src = params.type === 'rating' ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : data.backdrop_path ? Lampa.Api.img(data.backdrop_path, 'w500') : data.poster_path ? Lampa.Api.img(data.poster_path) : './img/img_broken.svg';
            this.visibled = true;
        };

        this.render = function () { return this.card; };
    }

    function Line(data) {
        var _this = this;
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 768;
        var items = [];
        var active = 0;
        var more, filter, moreButton, last;
        var visibleCards = light ? 6 : 10;
        var loadedIndex = 0;
        var isLoading = false;

        this.create = function () {
            console.log('Line: Creating with title: ' + data.title + ', results length: ' + (data.results ? data.results.length : 0));
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);

            filter = jQuery('<div class="items-line__filter selector"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
            filter.css({ display: 'inline-block', marginLeft: '10px', cursor: 'pointer', padding: '0.5em', background: 'transparent', border: 'none' });
            filter.on('hover:enter', function () {
                console.log('Line: Filter button clicked');
                var filterItems = [
                    { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                    { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                    { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
                    { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
                ];
                Lampa.Select.show({
                    title: Lampa.Lang.translate('trailers_filter'),
                    items: filterItems,
                    onSelect: function (item) {
                        Lampa.Storage.set('trailer_category_cache_' + data.type, null);
                        categoryCache[data.type] = null;
                        Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                        Lampa.Activity.push({
                            url: item.value === 'day' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                                 item.value === 'week' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                                 item.value === 'month' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(30) :
                                 '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(365),
                            title: data.title,
                            component: 'trailers_main',
                            type: data.type,
                            page: 1
                        });
                    },
                    onBack: function () { Lampa.Controller.toggle('content'); }
                });
            });

            moreButton = jQuery('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
            moreButton.on('hover:enter', function () {
                console.log('Line: More button clicked');
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
            });

            content.find('.items-line__title').after(filter).after(moreButton);
            body.append(scroll.render());

            var debouncedLoad = debounce(function () {
                if (scroll.isEnd() && !isLoading) loadMore();
            }, 200);
            scroll.render().on('scroll', debouncedLoad);
            this.bind();
        };

        function loadMore() {
            if (isLoading) {
                console.log('Line: loadMore: Already loading, skipping');
                return;
            }
            isLoading = true;

            console.log('Line: loadMore: Loading from index ' + loadedIndex + ', remaining cards: ' + (data.results ? data.results.length - loadedIndex : 0));
            var remainingCards = data.results ? data.results.slice(loadedIndex, loadedIndex + visibleCards) : [];
            if (remainingCards.length) {
                for (var i = 0; i < remainingCards.length; i++) {
                    var element = remainingCards[i];
                    var card = new Trailer(element, { type: data.type });
                    card.create();
                    card.visible();
                    card.onFocus = function (target, card_data) {
                        last = target;
                        active = items.indexOf(card);
                        scroll.update(card.render(), true);
                        console.log('Line: onFocus - active set to: ' + active);
                    };
                    scroll.append(card.render());
                    items.push(card);
                }
                loadedIndex += remainingCards.length;
                Lampa.Layer.update();
                isLoading = false;
            } else {
                console.log('Line: loadMore: No more cards, pushing activity');
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
                isLoading = false;
            }
        }

        this.bind = function () {
            console.log('Line: Binding data, results length: ' + (data.results ? data.results.length : 0));
            loadMore();
            this.loadMore();
            Lampa.Layer.update();
        };

        this.loadMore = function () {
            console.log('Line: Adding more button');
            more = Lampa.Template.get('more').addClass('more--trailers card--more');
            more.on('hover:enter', function () {
                console.log('Line: More button entered');
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
            }).on('hover:focus', function (e) {
                last = e.target;
                active = items.length;
                scroll.update(more, true);
                console.log('Line: More button focused - active set to: ' + active);
            });
            scroll.append(more);
        };

        this.toggle = function () {
            console.log('Line: Toggling controller, active: ' + active + ', items length: ' + items.length);
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                    if (last && items.length) scroll.update(jQuery(last), true);
                    console.log('Line: Toggle - last element focused');
                },
                right: function () {
                    console.log('Line: Right navigation, active: ' + active + ', items length: ' + items.length);
                    if (active < items.length) {
                        if (Navigator.canmove('right')) {
                            active++;
                            Navigator.move('right');
                            scroll.update(active === items.length ? more : items[active].render(), true);
                            console.log('Line: Moved right to ' + (active === items.length ? 'More' : 'card') + ', new active: ' + active);
                        } else {
                            console.log('Line: Cannot move right, staying at active: ' + active);
                        }
                    } else {
                        Lampa.Controller.toggle('menu');
                        console.log('Line: Moved to menu');
                    }
                },
                left: function () {
                    console.log('Line: Left navigation, active: ' + active);
                    if (active > 0) {
                        if (Navigator.canmove('left')) {
                            active--;
                            Navigator.move('left');
                            scroll.update(items[active].render(), true);
                            console.log('Line: Moved left to card, new active: ' + active);
                        } else {
                            console.log('Line: Cannot move left, staying at active: ' + active);
                        }
                    } else if (active === 0) {
                        if (_this.onLeft) _this.onLeft();
                        else Lampa.Controller.toggle('menu');
                        console.log('Line: Moved to menu or onLeft');
                    }
                },
                down: this.onDown,
                up: this.onUp,
                back: this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };

        this.render = function () { return content; };

        this.destroy = function () {
            console.log('Line: Destroying');
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            content.remove();
            if (more) more.remove();
            if (filter) filter.remove();
            if (moreButton) moreButton.remove();
            items = [];
        };
    }

    function Component$1(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = jQuery('<div></div>');
        var active = 0;
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 768;

        this.create = function () {
            console.log('Component$1: Creating main component');
            Api.main(this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Component$1: Empty state');
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.build = function (data) {
            console.log('Component$1: Building with ' + data.length + ' items');
            scroll.minus();
            html.append(scroll.render());
            for (var i = 0; i < data.length; i++) {
                this.append(data[i]);
            }
            if (light) {
                var _this = this;
                scroll.onWheel = function (step) {
                    if (step > 0) _this.down();
                    else _this.up();
                };
            }
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.append = function (element) {
            console.log('Component$1: Appending element ' + element.title + ', results length: ' + (element.results ? element.results.length : 0));
            var item = new Line(element);
            item.create();
            item.onDown = this.down;
            item.onUp = this.up;
            item.onBack = this.back;
            item.onToggle = function () { active = items.indexOf(item); };
            item.wrap = jQuery('<div></div>');
            scroll.append(light ? item.wrap : item.render());
            items.push(item);
        };

        this.back = function () {
            console.log('Component$1: Back triggered');
            Lampa.Activity.backward();
        };

        this.detach = function () {
            console.log('Component$1: Detaching items, light mode: ' + light);
            if (light && items.length) {
                for (var i = 0; i < items.length; i++) {
                    var rendered = items[i].render();
                    if (rendered && typeof rendered.detach === 'function') {
                        rendered.detach();
                    }
                }
                for (var i = active; i < active + 2 && i < items.length; i++) {
                    var rendered = items[i].render();
                    if (rendered && items[i].wrap) {
                        items[i].wrap.append(rendered);
                    }
                }
            }
        };

        this.down = function () {
            console.log('Component$1: Moving down, active: ' + active);
            active = Math.min(active + 1, items.length - 1);
            if (this.detach) this.detach();
            items[active].toggle();
            scroll.update(items[active].render());
        };

        this.up = function () {
            console.log('Component$1: Moving up, active: ' + active);
            active--;
            if (active < 0) {
                active = 0;
                if (this.detach) this.detach();
                Lampa.Controller.toggle('head');
            } else {
                if (this.detach) this.detach();
                items[active].toggle();
            }
            scroll.update(items[active].render());
        };

        this.start = function () {
            console.log('Component$1: Starting, activity match: ' + (Lampa.Activity.active().activity === this.activity));
            if (Lampa.Activity.active().activity !== this.activity) return;
            var _this = this;
            Lampa.Controller.add('content', {
                toggle: function () {
                    console.log('Component$1: Toggling content, items: ' + items.length);
                    if (items.length) {
                        if (_this.detach) _this.detach();
                        items[active].toggle();
                    }
                },
                left: function () {
                    console.log('Component$1: Left navigation');
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    console.log('Component$1 Right navigation');
                    Navigator.move('right');
                },
                up: function () {
                    console.log('Component$1: Up navigation');
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    console.log('Component$1: Down navigation');
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            console.log('Component$1: Destroying component');
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = [];
        }
    }

    function Component(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
        var items = [];
        var html = jQuery('<div></div>');
        var body = jQuery('<div class="category-full category-full--trailers"></div>');
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 768;
        var total_pages = 0;
        var last, waitload = false, active = 0;

        this.create = function () {
            console.log('Component: Creating full component');
            Api.full(object, this.build.bind(this), this.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            console.log('Component: Empty state');
            var empty = new Lampa.Empty();
            scroll.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };

        this.next = function () {
            console.log('Component: Fetching next page');
            var _this = this;
            if (waitload || object.page >= total_pages || object.page >= 30) {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
                return;
            }
            waitload = true;
            object.page++;
            Api.full(object, function (result) {
                if (result.results && result.results.length) _this.append(result, true);
                else Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                waitload = false;
            }, function () {
                console.log('Component: Failed to load next page');
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                waitload = false;
            });
        };

        this.append = function (data, append) {
            console.log('Component: Appending data, results length: ' + (data.results ? data.results.length : 0));
            var _this = this;
            if (!append) body.empty();
            for (var i = 0; i < data.results.length; i++) {
                var element = data.results[i];
                var card = new Trailer(element, { type: object.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    scroll.update(card.render(), true);
                    if (!light && !newlampa && scroll.isEnd()) {
                        _this.next();
                    }
                };
                body.append(card.render());
                items.push(card);
            }

            if (data.results.length < 20) {
                for (var i = data.results.length; i < 20; i++) {
                    body.append(jQuery('<div class="card card--placeholder" style="width: 33.3%; margin-bottom: 1.5em; visibility: hidden;"></div>'));
                }
            }
        };

        this.build = function (data) {
            console.log('Component: Building full component, results length: ' + (data.results ? data.results.length : 0));
            var _this = this;
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                scroll.minus();
                html.append(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && items.length) this.loadMore();
                scroll.append(body);
                if (newlampa) {
                    scroll.onEnd = function () { _this.next(); };
                    scroll.onWheel = function (step) {
                        if (!_this.activity || !_this.activity.loader) _this.start();
                        if (step > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    };
                    var debouncedLoad = debounce(function () {
                        if (scroll.isEnd() && !waitload) _this.next();
                    }, 100);
                    scroll.render().on('scroll', debouncedLoad);
                }
                this.activity.loader(false);
                this.activity.toggle();
            } else {
                html.append(scroll.render());
                this.empty();
            }
        };

        this.loadMore = function () {
            var more = jQuery('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:enter', function () {
                var next = Lampa.Arrays.clone(object);
                delete next.activity;
                next.page = (next.page || 0) + 1;
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
            if (items.length) last = items[0].render()[0];
            var more = jQuery('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:enter', function () {
                if (object.page > 1) Lampa.Activity.backward();
                else Lampa.Controller.toggle('head');
            });
            body.prepend(more);
        };

        this.start = function () {
            console.log('Component: Starting full component');
            if (Lampa.Activity.active().activity !== this.activity) return;
            var _this = this;
            Lampa.Controller.add('content', {
                toggle: function () {
                    console.log('Component: Toggling content');
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

        this.pause = this.stop = function () {};
        this.render = function () { return html; };
        this.destroy = function () {
            console.log('Component: Destroying');
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            body.remove();
            items = [];
        };
    }

    Lampa.Lang.add({
        trailers_popular: { ru: 'Популярное', uk: 'Популярне', en: 'Popular' },
        trailers_in_theaters: { ru: 'В прокате', uk: 'В прокаті', en: 'In Theaters' },
        trailers_upcoming_movies: { ru: 'Ожидаемые фильмы', uk: 'Очікувані фільми', en: 'Upcoming Movies' },
        trailers_popular_series: { ru: 'Популярные сериалы', uk: 'Популярні серіали', en: 'Popular Series' },
        trailers_new_series_seasons: { ru: 'Новые сериалы и сезоны', uk: 'Нові серіали та сезони', en: 'New Series and Seasons' },
        trailers_upcoming_series: { ru: 'Ожидаемые сериалы', uk: 'Очікувані серіали', en: 'Upcoming Series' },
        trailers_no_trailers: { ru: 'Нет трейлеров', uk: 'Немає трейлерів', en: 'No trailers' },
        trailers_no_ua_trailer: { ru: 'Нет украинского трейлера', uk: 'Немає українського трейлера', en: 'No Ukrainian trailer' },
        trailers_no_ru_trailer: { ru: 'Нет русского трейлера', uk: 'Немає російського трейлера', en: 'No Russian trailer' },
        trailers_view: { ru: 'Подробнее', uk: 'Детальніше', en: 'More' },
        title_trailers: { ru: 'Трейлеры', uk: 'Трейлери', en: 'Trailers' },
        trailers_filter: { ru: 'Фильтр', uk: 'Фільтр', en: 'Filter' },
        trailers_filter_today: { ru: 'Сегодня', uk: 'Сьогодні', en: 'Today' },
        trailers_filter_week: { ru: 'Неделя', uk: 'Тиждень', en: 'Week' },
        trailers_filter_month: { ru: 'Месяц', uk: 'Місяць', en: 'Month' },
        trailers_filter_year: { ru: 'Год', uk: 'Рік', en: 'Year' },
        trailers_movies: { ru: 'Фильмы', uk: 'Фільми', en: 'Movies' },
        trailers_series: { ru: 'Сериалы', uk: 'Серіали', en: 'Series' },
        trailers_more: { ru: 'Ещё', uk: 'Ще', en: 'More' },
        trailers_popular_movies: { ru: 'Популярные фильмы', uk: 'Популярні фільми', en: 'Popular Movies' },
        trailers_no_more_data: { ru: 'Больше нет данных для загрузки', uk: 'Більше немає даних для завантаження', en: 'No more data to load' }
    });

    function startPlugin() {
        if (window.plugin_trailers_ready) {
            console.log('Trailers plugin already loaded');
            return;
        }
        console.log('Starting Trailers plugin');
        console.log('TMDB API key: ' + (Lampa.TMDB && Lampa.TMDB.key()));
        window.plugin_trailers_ready = true;

        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img" /><div class="card__promo"><div class="card__promo-text"><div><div class="card__title"></div></div><div class="card__details"></div></div><div class="card__play"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div>');
        Lampa.Template.add('trailer_style', '<style>.card.card--trailer, .card--more {width: 25.7em;}.card.card--trailer .card__view {padding-bottom: 56%; margin-bottom: 0;}.card.card--trailer .card__details {margin-top: 0.8em;}.card.card--trailer .card__play {position: absolute; top: 50%; transform: translateY(-50%); left: 1.5em; background: rgba(0,0,0,0.7); padding: 0.2em; width: 2.2em; height: 2.2em; border-radius: 1em; display: flex; align-items: center; justify-content: center;}.card.card--trailer .card__play svg {width: 1.5em; height: 1.5em;}.card.card--trailer .card__rating {position: absolute; bottom: 0.5em; right: 0.5em; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 0.3em; font-size: 1.1em;}.card.card--trailer .card__trailer-lang {position: absolute; top: 0.5em; right: 0.5em; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 0.3em; text-transform: uppercase; font-size: 1.1em;}.card.card--trailer .card__release-date {position: absolute; top: 2em; right: 0.5em; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 0.3em; font-size: 1.1em;}.card--more .card-more__box {padding-bottom: 56%;}.category-full--trailers {display: flex; flex-wrap: wrap; justify-content: space-between;}.category-full--trailers .card {width: 33.3%; margin-bottom: 1.5em;}.category-full--trailers .card .card__view {padding-bottom: 56%; margin-bottom: 0;}.items-line__more {display: inline-block; margin-left: 10px; cursor: pointer; padding: 0.5em 1em;}@media screen and (max-width: 767px) {.category-full--trailers .card {width: 50%;}}@media screen and (max-width: 400px) {.category-full--trailers .card {width: 100%;}}</style>');

        function add() {
            console.log('Adding Trailers button to menu');
            var button = jQuery('<li class="menu__item selector"><div class="menu__ico"><svg height="40" viewBox="0 0 80 70" width="40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2397 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.6356V20.3644L55.5909 35.0004Z" fill="currentColor" /></svg></div><div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div></li>');
            button.on('hover:enter', function () {
                console.log('Trailers menu item clicked');
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });

            var menuList = jQuery('.menu__list').first();
            if (menuList.length) {
                menuList.append(button);
                console.log('Button appended to menu list');
            } else {
                jQuery('.menu').append(button);
                console.log('Button appended to menu container as fallback');
            }
            jQuery('body').append(Lampa.Template.get('trailer_style'));
            Lampa.Storage.listener.follow('change', function (e) {
                if (e.name === 'language') {
                    console.log('Language changed, clearing cache');
                    Api.clear();
                }
            });
        }

        if (!(Lampa.TMDB && Lampa.TMDB.key())) {
            console.log('TMDB API key missing');
            Lampa.Noty.show('TMDB API key is missing. Trailers plugin cannot be loaded.');
            return;
        }

        add();
    }

    if (!window.appready) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log('App ready, starting plugin');
                startPlugin();
            }
        });
        console.log('Scheduling fallback plugin start');
        setTimeout(startPlugin, 300);
    } else {
        console.log('App already ready, starting plugin');
        startPlugin();
    }
})();
