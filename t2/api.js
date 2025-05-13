import { getRegion, getInterfaceLanguage } from './utils.js';

var trailerCache = {};
var categoryCache = {};
var CACHE_TTL = 24 * 60 * 60 * 1000;

function clearExpiredCache() {
    console.log('Clearing expired cache'); // Діагностика
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
    console.log('finalizeResults called:', { json, type }); // Діагностика
    if (!json.results) {
        console.error('No results in JSON:', json);
        status.append({}, {});
        return;
    }
    var items = json.results.map(function (item) {
        return {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: item.release_date || item.first_air_date,
            original_title: item.original_title,
            original_name: item.original_name,
            name: item.name,
            release_details: item.release_details || {}
        };
    });
    results[type] = {
        title: Lampa.Lang.translate('trailers_' + type),
        results: items,
        type: type
    };
    status.append({}, {});
}

var Api = {
    clear: function clear() {
        trailerCache = {};
        categoryCache = {};
    },
    videos: function videos(data, success, fail) {
        var key = data.id + '_' + (data.name ? 'tv' : 'movie');
        if (trailerCache[key] && trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp < CACHE_TTL) {
            success(trailerCache[key].data);
        } else {
            Lampa.TMDB.video(data.id, data.name ? 'tv' : 'movie', function (json) {
                trailerCache[key] = {
                    data: json,
                    timestamp: Date.now()
                };
                success(json);
            }, fail);
        }
    },
    getLocalMoviesInTheaters: function getLocalMoviesInTheaters(status, results) {
        console.log('getLocalMoviesInTheaters called'); // Діагностика
        var key = 'in_theaters_' + getRegion();
        if (categoryCache[key] && categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp < CACHE_TTL) {
            finalizeResults(categoryCache[key].data, status, results, 'in_theaters');
        } else {
            var today = new Date();
            var priorDate = new Date(new Date().setDate(today.getDate() - 30));
            var dateString = priorDate.getFullYear() + '-' + (priorDate.getMonth() + 1) + '-' + priorDate.getDate();
            Lampa.TMDB.api('discover/movie?region=' + getRegion() + '&language=' + getInterfaceLanguage() + '&sort_by=popularity.desc&release_date.gte=' + dateString + '&with_release_type=3|2', function (json) {
                console.log('TMDB response:', json); // Діагностика
                if (json.results) {
                    var status = new Lampa.Status(json.results.length);
                    status.onComplite = function () {
                        finalizeResults(json, status, results, 'in_theaters');
                    };
                    json.results.forEach(function (item, i) {
                        Lampa.TMDB.release(item.id, 'movie', function (release) {
                            json.results[i].release_details = release;
                            status.append(item.id, {});
                        }, function () {
                            status.append(item.id, {});
                        });
                    });
                    categoryCache[key] = {
                        data: json,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
                } else {
                    console.error('No results for in_theaters'); // Діагностика
                    status.append({}, {});
                }
            }, function () {
                console.error('TMDB request failed'); // Діагностика
                status.append({}, {});
            });
        }
    },
    // ... (інші методи, як getUpcomingMovies, getNewSeriesSeasons тощо, залишаються без змін)
};

function main(status, results) {
    console.log('main called:', { status, results }); // Діагностика
    if (!(status instanceof Lampa.Status)) {
        console.error('Invalid status object:', status);
        return;
    }
    Api.getLocalMoviesInTheaters(status, results);
    Api.getUpcomingMovies(status, results);
    Api.getNewSeriesSeasons(status, results);
    Api.getUpcomingSeries(status, results);
    Api.getPopularTrailers(status, results);
}

export { Api, main };
