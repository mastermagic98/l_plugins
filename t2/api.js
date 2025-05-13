import { getRegion, getInterfaceLanguage } from './utils.js';

var trailerCache = {};
var categoryCache = {};
var CACHE_TTL = 24 * 60 * 60 * 1000;

function clearExpiredCache() {
    console.log('Clearing expired cache');
    if (typeof Lampa === 'undefined' || !Lampa.Storage) {
        console.log('Lampa.Storage not available, skipping cache clear');
        return;
    }
    for (var key in trailerCache) {
        if (trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp > CACHE_TTL) {
            delete trailerCache[key];
        }
    }
    for (var key in categoryCache) {
        if (categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp > CACHE_TTL) {
            delete categoryCache[key];
            Lampa.Storage.set('trailer_category_cache_' + key, null);
        }
    }
}

setInterval(clearExpiredCache, 3600 * 1000);

function finalizeResults(json, status, results, type) {
    console.log('finalizeResults called:', { type, resultsLength: json.results ? json.results.length : 0 });
    if (!json.results) {
        console.error('No results in JSON:', json);
        if (status && typeof status.append === 'function') {
            status.append({}, {});
        }
        return;
    }
    var items = json.results.map(function (item) {
        return {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average, // Виправлено з item.vot
            release_date: item.release_date || item.first_air_date,
            original_title: item.original_title,
            original_name: item.original_name,
            name: item.name,
            release_details: item.release_details || {}
        };
    });
    results[type] = {
        title: Lampa && Lampa.Lang ? Lampa.Lang.translate('trailers_' + type) : type,
        results: items,
        type: type
    };
    if (status && typeof status.append === 'function') {
        status.append({}, {});
    }
}

var Api = {
    clear: function clear() {
        trailerCache = {};
        categoryCache = {};
    },
    videos: function videos(data, success, fail) {
        if (!Lampa || !Lampa.TMDB) {
            console.error('Lampa.TMDB is undefined');
            if (typeof fail === 'function') fail();
            return;
        }
        var key = data.id + '_' + (data.name ? 'tv' : 'movie');
        if (trailerCache[key] && trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp < CACHE_TTL) {
            console.log('Using cached videos for:', key);
            success(trailerCache[key].data);
        } else {
            Lampa.TMDB.video(data.id, data.name ? 'tv' : 'movie', function (json) {
                console.log('TMDB video response:', json);
                trailerCache[key] = {
                    data: json,
                    timestamp: Date.now()
                };
                success(json);
            }, function () {
                console.error('TMDB video request failed');
                if (typeof fail === 'function') fail();
            });
        }
    },
    getLocalMoviesInTheaters: function getLocalMoviesInTheaters(status, results) {
        console.log('getLocalMoviesInTheaters called');
        if (!Lampa || !Lampa.TMDB) {
            console.error('Lampa.TMDB is undefined');
            if (status && typeof status.append === 'function') {
                status.append({}, {});
            }
            return;
        }
        var key = 'in_theaters_' + getRegion();
        if (categoryCache[key] && categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp < CACHE_TTL) {
            console.log('Using cached data for:', key);
            finalizeResults(categoryCache[key].data, status, results, 'in_theaters');
        } else {
            var today = new Date();
            var priorDate = new Date(new Date().setDate(today.getDate() - 30));
            var dateString = priorDate.getFullYear() + '-' + (priorDate.getMonth() + 1).toString().padStart(2, '0') + '-' + priorDate.getDate().toString().padStart(2, '0');
            Lampa.TMDB.api('discover/movie?region=' + getRegion() + '&language=' + getInterfaceLanguage() + '&sort_by=popularity.desc&release_date.gte=' + dateString + '&with_release_type=3|2', function (json) {
                console.log('TMDB response for in_theaters:', json);
                if (json.results) {
                    var localStatus = new Lampa.Status(json.results.length);
                    localStatus.onComplite = function () {
                        finalizeResults(json, status, results, 'in_theaters');
                    };
                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, 'movie', function (release) {
                            json.results[i].release_details = release;
                            localStatus.append(item.id, {});
                        }, function () {
                            localStatus.append(item.id, {});
                        });
                    });
                    categoryCache[key] = {
                        data: json,
                        timestamp: Date.now()
                    };
                    if (Lampa && Lampa.Storage) {
                        Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
                    }
                } else {
                    console.error('No results for in_theaters');
                    if (status && typeof status.append === 'function') {
                        status.append({}, {});
                    }
                }
            }, function () {
                console.error('TMDB request failed for in_theaters');
                if (status && typeof status.append === 'function') {
                    status.append({}, {});
                }
            });
        }
    },
    getUpcomingMovies: function getUpcomingMovies(status, results) {
        console.log('getUpcomingMovies called');
        if (!Lampa || !Lampa.TMDB) {
            console.error('Lampa.TMDB is undefined');
            if (status && typeof status.append === 'function') {
                status.append({}, {});
            }
            return;
        }
        var key = 'upcoming_' + getRegion();
        if (categoryCache[key] && categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp < CACHE_TTL) {
            console.log('Using cached data for:', key);
            finalizeResults(categoryCache[key].data, status, results, 'upcoming');
        } else {
            var today = new Date();
            var nextMonth = new Date(new Date().setMonth(today.getMonth() + 1));
            var dateString = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');
            var endDateString = nextMonth.getFullYear() + '-' + (nextMonth.getMonth() + 1).toString().padStart(2, '0') + '-' + nextMonth.getDate().toString().padStart(2, '0');
            Lampa.TMDB.api('discover/movie?region=' + getRegion() + '&language=' + getInterfaceLanguage() + '&sort_by=popularity.desc&release_date.gte=' +
