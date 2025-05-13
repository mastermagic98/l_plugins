import { getFormattedDate, getRegion, getInterfaceLanguage, getPreferredLanguage } from './utils.js';

var network = new Lampa.Reguest();
var tmdb_api_key = Lampa.TMDB.key();
var tmdb_base_url = 'https://api.themoviedb.org/3';
var trailerCache = {};
var categoryCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 години в мілісекундах

// Очищення застарілого кешу
function clearExpiredCache() {
    // Очищення trailerCache
    console.log('Clearing expired cache'); // Діагностика
    for (var key in trailerCache) {
        if (trailerCache[key].timestamp && Date.now() - trailerCache[key].timestamp > CACHE_TTL) {
            delete trailerCache[key];
        }
    }
    // Очищення categoryCache
    for (var key in categoryCache) {
        if (categoryCache[key].timestamp && Date.now() - categoryCache[key].timestamp > CACHE_TTL) {
            delete categoryCache[key];
            Lampa.Storage.set('trailer_category_cache_' + key, null);
        }
    }
}

export function get(url, page, resolve, reject) {
    var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage();
    network.silent(full_url, resolve, reject);
}

export function getLocalMoviesInTheaters(page, resolve, reject) {
    var region = getRegion();
    var language = getInterfaceLanguage();
    var today = new Date();
    var daysThreshold = 45;
    var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    var now_playing_url = `${tmdb_base_url}/movie/now_playing?api_key=${tmdb_api_key}&language=${language}&page=${page}&region=${region}&primary_release_date.gte=${startDate}`;
    network.silent(now_playing_url, function (data) {
        if (data.results && data.results.length) {
            var totalRequests = data.results.length;
            var completedRequests = 0;

            function finalizeResults() {
                var filteredResults = data.results.filter(function (m) {
                    if (m.release_details && m.release_details.results) {
                        var regionRelease = m.release_details.results.find(function (r) {
                            return r.iso_3166_1 === region;
                        });
                        if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
                            var releaseDate = new Date(regionRelease.release_dates[0].release_date);
                            return releaseDate >= new Date(startDate) && releaseDate <= today;
                        }
                    }
                    if (m.release_date) {
                        var globalReleaseDate = new Date(m.release_date);
                        return globalReleaseDate >= new Date(startDate) && globalReleaseDate <= today;
                    }
                    return false;
                });
                filteredResults.sort(function (a, b) {
                    var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
                    var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
                    return new Date(dateB) - new Date(dateA);
                });
                data.results = filteredResults;
                resolve(data);
            }

            data.results.forEach(function (movie) {
                var movie_id = movie.id;
                if (movie_id) {
                    var release_url = `${tmdb_base_url}/movie/${movie_id}/release_dates?api_key=${tmdb_api_key}`;
                    network.silent(release_url, function (release_data) {
                        movie.release_details = release_data;
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            finalizeResults();
                        }
                    }, function () {
                        movie.release_details = { results: [] };
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            finalizeResults();
                        }
                    });
                } else {
                    movie.release_details = { results: [] };
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                        finalizeResults();
                    }
                }
            });
        } else {
            resolve(data);
        }
    }, reject);
}

export function getUpcomingMovies(page, resolve, reject) {
    var region = getRegion();
    var today = getFormattedDate(0);
    var sixMonthsLater = getFormattedDate(-180);
    var language = getInterfaceLanguage();

    var upcoming_url = `${tmdb_base_url}/discover/movie?api_key=${tmdb_api_key}&language=${language}&page=${page}&region=${region}&primary_release_date.gte=${today}&primary_release_date.lte=${sixMonthsLater}&sort_by=popularity.desc&vote_count.gte=1`;
    network.silent(upcoming_url, function (data) {
        if (data.results && data.results.length) {
            var totalRequests = data.results.length;
            var completedRequests = 0;

            function finalizeResults() {
                var filteredResults = data.results.filter(function (m) {
                    if (m.release_details && m.release_details.results) {
                        var regionRelease = m.release_details.results.find(function (r) {
                            return r.iso_3166_1 === region;
                        });
                        if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
                            return true;
                        }
                    }
                    return !!m.release_date;
                });
                filteredResults.sort(function (a, b) {
                    var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
                    var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
                    return new Date(dateA) - new Date(dateB);
                });
                data.results = filteredResults;
                resolve(data);
            }

            data.results.forEach(function (movie) {
                var movie_id = movie.id;
                if (movie_id) {
                    var release_url = `${tmdb_base_url}/movie/${movie_id}/release_dates?api_key=${tmdb_api_key}`;
                    network.silent(release_url, function (release_data) {
                        movie.release_details = release_data;
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            finalizeResults();
                        }
                    }, function () {
                        movie.release_details = { results: [] };
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            finalizeResults();
                        }
                    });
                } else {
                    movie.release_details = { results: [] };
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                        finalizeResults();
                    }
                }
            });
        } else {
            resolve(data);
        }
    }, reject);
}

export function main(oncomplite, onerror) {
    var status = new Lampa.Status(6);
    status.onComplite = function () {
        var fulldata = [];
        var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
        keys.forEach(function (key) {
            if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                categoryCache[key] = {
                    results: status.data[key].results,
                    timestamp: Date.now()
                };
                Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
                fulldata.push(status.data[key]);
            }
        });
        if (fulldata.length) {
            oncomplite(fulldata);
        } else {
            onerror();
        }
    };

    var append = function (title, name, url, json) {
        json.title = title;
        json.type = name;
        json.url = url;
        status.append(name, json);
    };

    var today = getFormattedDate(0);
    var sixMonthsLater = getFormattedDate(-180);
    var threeMonthsAgo = getFormattedDate(90);
    var threeMonthsLater = getFormattedDate(-90);

    get('/discover/movie?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
        append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: [] });
    });

    getLocalMoviesInTheaters(1, function (json) {
        append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: [] });
    });

    getUpcomingMovies(1, function (json) {
        append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
        var filteredResults = json.results ? json.results.filter(function (item) {
            return !item.genre_ids.includes(99) && !item.genre_ids.includes(10763) && !item.genre_ids.includes(10764);
        }) : [];
        append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: filteredResults });
    }, function () {
        append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
        if (json.results) {
            json.results.forEach(function (series) {
                series.release_details = { first_air_date: series.first_air_date };
            });
        }
        append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc', { results: [] });
    });

    get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
        if (json.results) {
            json.results.forEach(function (series) {
                series.release_details = { first_air_date: series.first_air_date };
            });
        }
        append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_upcoming_series'), 'upcoming_series', '/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
    });
}

export function full(params, oncomplite, onerror) {
    clearExpiredCache(); // Очищаємо застарілий кеш перед використанням
    if (params.type === 'in_theaters') {
        var region = getRegion();
        var today = new Date();
        var daysThreshold = 45;
        var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        var targetCards = 20;
        var accumulatedResults = [];
        var loadedPages = new Set();
        var currentPage = 1;
        var maxPages = 30;
        var totalPagesFromFirstResponse = 0;

        var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            accumulatedResults = cachedData.results;
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
            var pageResults = accumulatedResults.slice(startIdx, endIdx);
            var result = {
                dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                page: params.page,
                results: pageResults,
                total_pages: Math.ceil(accumulatedResults.length / targetCards) || 1,
                total_results: accumulatedResults.length
            };
            if (accumulatedResults.length >= startIdx + 1 && pageResults.length > 0) {
                oncomplite(result);
                return;
            }
            currentPage = Math.ceil(accumulatedResults.length / targetCards) + 1;
        }

        function fetchNextPage() {
            if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                finalizeResults();
                return;
            }

            loadedPages.add(currentPage);
            getLocalMoviesInTheaters(currentPage, function (result) {
                if (result && result.results && result.results.length) {
                    accumulatedResults = accumulatedResults.concat(result.results);
                    if (currentPage === 1) {
                        totalPagesFromFirstResponse = result.total_pages || maxPages;
                    }
                    var startIdx = (params.page - 1) * targetCards;
                    var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
                    if (accumulatedResults.length >= startIdx + 1 || currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
                        finalizeResults();
                    } else {
                        currentPage++;
                        fetchNextPage();
                    }
                } else {
                    if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
                        currentPage++;
                        fetchNextPage();
                    } else {
                        finalizeResults();
                    }
                }
            }, onerror);
        }

        function finalizeResults() {
            var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
            finalResults.sort(function (a, b) {
                var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
                var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
                return new Date(dateB) - new Date(dateA);
            });
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = Math.min(params.page * targetCards, finalResults.length);
            var pageResults = finalResults.slice(startIdx, endIdx);
            var result = {
                dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                page: params.page,
                results: pageResults.length > 0 ? pageResults : finalResults.slice(0, targetCards),
                total_pages: Math.ceil(finalResults.length / targetCards) || 1,
                total_results: finalResults.length
            };
            categoryCache['in_theaters'] = {
                results: finalResults,
                timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
            oncomplite(result);
        }

        fetchNextPage();
    } else if (params.type === 'upcoming_movies') {
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);
        var targetCards = 20;

        var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            var filteredResults = cachedData.results.filter(function (m) {
                if (m.release_details && m.release_details.results) {
                    var regionRelease = m.release_details.results.find(function (r) {
                        return r.iso_3166_1 === getRegion();
                    });
                    if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
                        return true;
                    }
                }
                return !!m.release_date;
            });
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = Math.min(params.page * targetCards, filteredResults.length);
            var pageResults = filteredResults.slice(startIdx, endIdx);
            var result = {
                page: params.page,
                results: pageResults,
                total_pages: Math.ceil(filteredResults.length / targetCards) || 1,
                total_results: filteredResults.length
            };
            if (pageResults.length > 0) {
                oncomplite(result);
                return;
            }
        }

        getUpcomingMovies(params.page, function (result) {
            if (result && result.results && result.results.length) {
                var filteredResults = result.results.filter(function (m) {
                    if (m.release_details && m.release_details.results) {
                        var regionRelease = m.release_details.results.find(function (r) {
                            return r.iso_3166_1 === getRegion();
                        });
                        if (regionRelease && regionRelease.release_dates && regionRelease.release_dates.length) {
                            return true;
                        }
                    }
                    return !!m.release_date;
                });
                result.results = filteredResults;
                result.total_results = filteredResults.length;
                result.total_pages = Math.ceil(filteredResults.length / targetCards) || 1;

                if (params.page === 1) {
                    categoryCache['upcoming_movies'] = {
                        results: filteredResults,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
                } else {
                    var existingCache = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', { results: [] });
                    existingCache.results = existingCache.results.concat(filteredResults);
                    existingCache.results = [...new Set(existingCache.results.map(JSON.stringify))].map(JSON.parse);
                    categoryCache['upcoming_movies'] = existingCache;
                    Lampa.Storage.set('trailer_category_cache_upcoming_movies', existingCache);
                }
                oncomplite(result);
            } else {
                onerror();
            }
        }, onerror);
    } else if (params.type === 'new_series_seasons') {
        var threeMonthsAgo = getFormattedDate(90);
        var threeMonthsLater = getFormattedDate(-90);

        var cachedData = categoryCache['new_series_seasons'] || Lampa.Storage.get('trailer_category_cache_new_series_seasons', null);
        if (cachedData && cachedData.results) {
            var targetCards = 20;
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = params.page * targetCards;
            var result = {
                page: params.page,
                results: cachedData.results.slice(startIdx, endIdx),
                total_pages: Math.ceil(cachedData.results.length / targetCards),
                total_results: cachedData.results.length
            };
            if (result.results.length > 0) {
                oncomplite(result);
                return;
            }
        }

        get('/discover/tv?air_date.gte=' + threeMonthsAgo + '&air_date.lte=' + threeMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function (result) {
            if (result && result.results && result.results.length) {
                result.results.forEach(function (series) {
                    series.release_details = { first_air_date: series.first_air_date };
                });
                if (params.page === 1) {
                    categoryCache['new_series_seasons'] = {
                        results: result.results,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_new_series_seasons', categoryCache['new_series_seasons']);
                } else {
                    var existingCache = categoryCache['new_series_seasons'] || Lampa.Storage.get('trailer_category_cache_new_series_seasons', { results: [] });
                    existingCache.results = existingCache.results.concat(result.results);
                    categoryCache['new_series_seasons'] = existingCache;
                    Lampa.Storage.set('trailer_category_cache_new_series_seasons', existingCache);
                }
                oncomplite(result);
            } else {
                onerror();
            }
        }, onerror);
    } else if (params.type === 'upcoming_series') {
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);

        var cachedData = categoryCache['upcoming_series'] || Lampa.Storage.get('trailer_category_cache_upcoming_series', null);
        if (cachedData && cachedData.results) {
            var targetCards = 20;
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = params.page * targetCards;
            var result = {
                page: params.page,
                results: cachedData.results.slice(startIdx, endIdx),
                total_pages: Math.ceil(cachedData.results.length / targetCards),
                total_results: cachedData.results.length
            };
            if (result.results.length > 0) {
                oncomplite(result);
                return;
            }
        }

        get('/discover/tv?first_air_date.gte=' + today + '&first_air_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc&vote_count.gte=1', params.page, function (result) {
            if (result && result.results && result.results.length) {
                result.results.forEach(function (series) {
                    series.release_details = { first_air_date: series.first_air_date };
                });
                if (params.page === 1) {
                    categoryCache['upcoming_series'] = {
                        results: result.results,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_upcoming_series', categoryCache['upcoming_series']);
                } else {
                    var existingCache = categoryCache['upcoming_series'] || Lampa.Storage.get('trailer_category_cache_upcoming_series', { results: [] });
                    existingCache.results = existingCache.results.concat(result.results);
                    categoryCache['upcoming_series'] = existingCache;
                    Lampa.Storage.set('trailer_category_cache_upcoming_series', existingCache);
                }
                oncomplite(result);
            } else {
                onerror();
            }
        }, onerror);
    } else {
        var cachedData = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, null);
        if (cachedData && cachedData.results) {
            var targetCards = 20;
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = params.page * targetCards;
            var result = {
                page: params.page,
                results: cachedData.results.slice(startIdx, endIdx),
                total_pages: Math.ceil(cachedData.results.length / targetCards),
                total_results: cachedData.results.length
            };
            if (result.results.length > 0) {
                oncomplite(result);
                return;
            }
        }

        get(params.url, params.page, function (result) {
            if (result && result.results && result.results.length) {
                if (params.page === 1) {
                    categoryCache[params.type] = {
                        results: result.results,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
                } else {
                    var existingCache = categoryCache[params.type] || Lampa.Storage.get('trailer_category_cache_' + params.type, { results: [] });
                    existingCache.results = existingCache.results.concat(result.results);
                    categoryCache[params.type] = existingCache;
                    Lampa.Storage.set('trailer_category_cache_' + params.type, existingCache);
                }
                oncomplite(result);
            } else {
                onerror();
            }
        }, onerror);
    }
}

export function videos(card, oncomplite, onerror) {
    clearExpiredCache(); // Очищаємо застарілий кеш перед використанням
    var type = card.name ? 'tv' : 'movie';
    var id = card.id;
    var cacheKey = type + '_' + id;

    if (trailerCache[cacheKey] && trailerCache[cacheKey].timestamp && Date.now() - trailerCache[cacheKey].timestamp < CACHE_TTL) {
        oncomplite(trailerCache[cacheKey]);
        return;
    }

    var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key;
    var preferredLangs = getPreferredLanguage();
    var attempts = 0;
    var maxAttempts = preferredLangs.length + 1;
    var tmdbTrailers = [];

    function tryFetch(langIndex) {
        if (attempts >= maxAttempts) {
            var englishTrailer = tmdbTrailers.find(function (v) {
                return v.iso_639_1 === 'en';
            });
            if (englishTrailer) {
                trailerCache[cacheKey] = { id: id, results: [englishTrailer], timestamp: Date.now() };
                oncomplite({ id: id, results: [englishTrailer] });
            } else {
                trailerCache[cacheKey] = { id: id, results: [], timestamp: Date.now() };
                onerror();
            }
            return;
        }

        var fetchUrl = url;
        if (langIndex < preferredLangs.length) {
            fetchUrl += '&language=' + preferredLangs[langIndex];
        }
        network.silent(fetchUrl, function (result) {
            var trailers = result.results ? result.results.filter(function (v) {
                return v.type === 'Trailer';
            }) : [];
            tmdbTrailers = tmdbTrailers.concat(trailers);
            var preferredTrailer = trailers.find(function (v) {
                return preferredLangs.includes(v.iso_639_1);
            });
            if (preferredTrailer) {
                trailerCache[cacheKey] = { id: id, results: [preferredTrailer], timestamp: Date.now() };
                oncomplite({ id: id, results: [preferredTrailer] });
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

export function clear() {
    network.clear();
    trailerCache = {};
    categoryCache = {};
    ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
        Lampa.Storage.set('trailer_category_cache_' + key, null);
    });
}

export const Api = {
    get,
    getLocalMoviesInTheaters,
    getUpcomingMovies,
    main,
    full,
    videos,
    clear
};
