(function () {
    var network = new Lampa.Reguest();
    var trailerCache = {};
    var categoryCache = {};

    function get(url, oncomplite, onerror) {
        network.silent(Lampa.TMDB.api(url), oncomplite, onerror);
    }

    function getLocalMoviesInTheaters(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region = window.plugin_upcoming.utils.getRegion();
        get('discover/movie?primary_release_date.lte=' + date + '&sort_by=popularity.desc&with_release_type=3|2®ion=' + region + '&page=' + page, oncomplite, onerror);
    }

    function getUpcomingMovies(page, oncomplite, onerror) {
        var date = window.plugin_upcoming.utils.getFormattedDate();
        var region = window.plugin_upcoming.utils.getRegion();
        get('discover/movie?primary_release_date.gte=' + date + '&sort_by=popularity.desc®ion=' + region + '&page=' + page, function (data) {
            if (data.results) {
                data.results = data.results.filter(function (item) {
                    return item.release_date;
                });
            }
            oncomplite(data);
        }, onerror);
    }

    function main(params, oncomplite, onerror) {
        var data = { lines: [] };
        var appendLine = function appendLine(key, title, filter) {
            data.lines.push({
                title: Lampa.Lang.translate(title),
                component: 'trailers_line',
                filter: filter,
                params: { category: key }
            });
        };
        appendLine('popular_movies', 'trailers_popular', true);
        appendLine('in_theaters', 'trailers_in_theaters', false);
        appendLine('upcoming_movies', 'trailers_upcoming_movies', true);
        appendLine('popular_series', 'trailers_popular_series', true);
        appendLine('new_series_seasons', 'trailers_new_series_seasons', true);
        appendLine('upcoming_series', 'trailers_upcoming_series', true);
        oncomplite(data);
    }

    function full(params, oncomplite, onerror) {
        var category = params.category;
        var page = params.page || 1;
        var cacheKey = category + '_' + page;
        if (categoryCache[cacheKey]) {
            return oncomplite(categoryCache[cacheKey]);
        }
        var onData = function onData(data) {
            var results = data.results || [];
            results = results.map(function (item) {
                return {
                    id: item.id,
                    title: item.title || item.name,
                    original_title: item.original_title || item.original_name,
                    poster_path: item.poster_path,
                    backdrop_path: item.backdrop_path,
                    release_date: item.release_date || item.first_air_date,
                    vote_average: item.vote_average,
                    media_type: category.indexOf('series') !== -1 ? 'tv' : 'movie'
                };
            });
            var response = {
                results: results,
                page: data.page,
                total_pages: data.total_pages,
                total_results: data.total_results
            };
            categoryCache[cacheKey] = response;
            Lampa.Storage.set('trailer_category_cache_' + cacheKey, response);
            oncomplite(response);
        };
        var cached = Lampa.Storage.get('trailer_category_cache_' + cacheKey);
        if (cached) {
            categoryCache[cacheKey] = cached;
            return oncomplite(cached);
        }
        if (category === 'popular_movies') {
            get('movie/popular?page=' + page, onData, onerror);
        } else if (category === 'in_theaters') {
            getLocalMoviesInTheaters(page, onData, onerror);
        } else if (category === 'upcoming_movies') {
            getUpcomingMovies(page, onData, onerror);
        } else if (category === 'popular_series') {
            get('tv/popular?page=' + page, onData, onerror);
        } else if (category === 'new_series_seasons') {
            get('tv/on_the_air?page=' + page, onData, onerror);
        } else if (category === 'upcoming_series') {
            var date = window.plugin_upcoming.utils.getFormattedDate();
            get('discover/tv?first_air_date.gte=' + date + '&sort_by=popularity.desc&page=' + page, onData, onerror);
        } else {
            onerror();
        }
    }

    function videos(id, media_type, oncomplite, onerror) {
        var cacheKey = media_type + '_' + id;
        if (trailerCache[cacheKey]) {
            return oncomplite(trailerCache[cacheKey]);
        }
        var onData = function onData(result) {
            var trailers = result.results ? result.results.filter(function (v) {
                return v.type === 'Trailer';
            }) : [];
            var preferredLangs = window.plugin_upcoming.utils.getPreferredLanguage();
            var video = trailers.find(function (v) {
                return preferredLangs.includes(v.iso_639_1);
            }) || trailers[0];
            var lang = Lampa.Storage.get('language', 'ru');
            if (!video) {
                var error = lang === 'uk' ? 'trailers_no_ua_trailer' : lang === 'ru' ? 'trailers_no_ru_trailer' : 'trailers_no_trailers';
                return onerror(Lampa.Lang.translate(error));
            }
            var response = {
                key: video.key,
                site: video.site,
                lang: video.iso_639_1,
                name: video.name
            };
            trailerCache[cacheKey] = response;
            oncomplite(response);
        };
        get(media_type + '/' + id + '/videos', onData, onerror);
    }

    function clear() {
        network.clear();
        trailerCache = {};
        categoryCache = {};
        ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
            Lampa.Storage.set('trailer_category_cache_' + key, null);
        });
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Api = {
        get: get,
        getLocalMoviesInTheaters: getLocalMoviesInTheaters,
        getUpcomingMovies: getUpcomingMovies,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };
})();
