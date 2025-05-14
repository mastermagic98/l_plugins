var network = new Lampa.Reguest();
var tmdb_api_key = Lampa.TMDB.key();
var tmdb_base_url = 'https://api.themoviedb.org/3';
var trailerCache = {};
var categoryCache = {};

function get(url, page, resolve, reject) {
    var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage();
    network.silent(full_url, resolve, reject);
}

function getLocalMoviesInTheaters(page, resolve, reject) {
    var region = getRegion();
    var language = getInterfaceLanguage();
    var today = new Date();
    var daysThreshold = 45;
    var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    var now_playing_url = `${tmdb_base_url}/movie/now_playing?api_key=${tmdb_api_key}&language=${language}&page=${page}®ion=${region}&primary_release_date.gte=${startDate}`;
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

function getUpcomingMovies(page, resolve, reject) {
    var region = getRegion();
    var today = getFormattedDate(0);
    var sixMonthsLater = getFormattedDate(-180);
    var lang = Lampa.Storage.get('language', 'ru');
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
    var preferredLangs = getPreferredLanguage();
    var maxPages = 30; // Максимальна кількість сторінок для запобігання надмірних запитів
    var allMoviesWithTrailers = [];
    var currentPage = 1;
    var totalPages = 1;

    function fetchPage(pageToFetch) {
        var upcoming_url = `${tmdb_base_url}/movie/upcoming?api_key=${tmdb_api_key}&language=${language}&page=${pageToFetch}®ion=${region}`;
        network.silent(upcoming_url, function (data) {
            if (data.results && data.results.length) {
                totalPages = Math.min(data.total_pages || maxPages, maxPages);
                var totalRequests = data.results.length;
                var completedRequests = 0;

                function processPageResults() {
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                        if (currentPage < totalPages && pageToFetch === currentPage) {
                            currentPage++;
                            fetchPage(currentPage);
                        } else {
                            finalizeResults();
                        }
                    }
                }

                data.results.forEach(function (movie) {
                    var movie_id = movie.id;
                    if (movie_id) {
                        var release_url = `${tmdb_base_url}/movie/${movie_id}/release_dates?api_key=${tmdb_api_key}`;
                        var video_url = `${tmdb_base_url}/movie/${movie_id}/videos?api_key=${tmdb_api_key}&language=${preferredLangs[0] || 'en'}`;
                        var cacheKey = 'movie_' + movie_id;

                        // Перевірка кешу трейлерів
                        if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                            network.silent(release_url, function (release_data) {
                                movie.release_details = release_data;
                                // Фільтруємо за датами
                                var releaseDate = movie.release_date || (release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date);
                                if (releaseDate && new Date(releaseDate) >= new Date(today) && new Date(releaseDate) <= new Date(sixMonthsLater)) {
                                    allMoviesWithTrailers.push(movie);
                                }
                                processPageResults();
                            }, function () {
                                movie.release_details = { results: [] };
                                processPageResults();
                            });
                        } else {
                            // Перевіряємо наявність трейлера
                            network.silent(video_url, function (video_data) {
                                var trailers = video_data.results ? video_data.results.filter(function (v) {
                                    return v.type === 'Trailer';
                                }) : [];
                                var hasTrailer = trailers.length > 0;

                                if (hasTrailer) {
                                    trailerCache[cacheKey] = { id: movie_id, results: trailers };
                                    network.silent(release_url, function (release_data) {
                                        movie.release_details = release_data;
                                        // Фільтруємо за датами
                                        var releaseDate = movie.release_date || (release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date);
                                        if (releaseDate && new Date(releaseDate) >= new Date(today) && new Date(releaseDate) <= new Date(sixMonthsLater)) {
                                            allMoviesWithTrailers.push(movie);
                                        }
                                        processPageResults();
                                    }, function () {
                                        movie.release_details = { results: [] };
                                        processPageResults();
                                    });
                                } else {
                                    processPageResults();
                                }
                            }, function () {
                                processPageResults();
                            });
                        }
                    } else {
                        processPageResults();
                    }
                });
            } else {
                finalizeResults();
            }
        }, function () {
            if (pageToFetch === 1) {
                reject();
            } else {
                finalizeResults();
            }
        });
    }

    function finalizeResults() {
        var filteredResults = allMoviesWithTrailers.filter(function (m) {
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
        var result = {
            page: page,
            results: filteredResults.slice((page - 1) * 20, page * 20), // Повертаємо лише потрібну сторінку
            total_pages: Math.ceil(filteredResults.length / 20) || 1,
            total_results: filteredResults.length
        };
        resolve(result);
    }

    fetchPage(page);
}

function main(oncomplite, onerror) {
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
        append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: json.results || [] });
    }, function () {
        append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', { results: [] });
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

function full(params, oncomplite, onerror) {
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
        var targetCards = 20;
        var region = getRegion();
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);

        // Перевірка кешу
        var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            var startIdx = (params.page - 1) * targetCards;
            var endIdx = Math.min(params.page * targetCards, cachedData.results.length);
            var pageResults = cachedData.results.slice(startIdx, endIdx);
            var result = {
                page: params.page,
                results: pageResults,
                total_pages: Math.ceil(cachedData.results.length / targetCards) || 1,
                total_results: cachedData.results.length
            };
            if (pageResults.length > 0) {
                oncomplite(result);
                return;
            }
        }

        // Завантаження даних
        getUpcomingMovies(params.page, function (result) {
            if (result && result.results && result.results.length) {
                // Зберігаємо всі результати в кеші
                if (params.page === 1) {
                    categoryCache['upcoming_movies'] = {
                        results: result.results,
                        timestamp: Date.now()
                    };
                    Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
                } else {
                    var existingCache = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', { results: [] });
                    existingCache.results = [...new Set([...existingCache.results, ...result.results].map(JSON.stringify))].map(JSON.parse);
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

function videos(card, oncomplite, onerror) {
    var type = card.name ? 'tv' : 'movie';
    var id = card.id;
    var cacheKey = type + '_' + id;

    if (trailerCache[cacheKey]) {
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
                trailerCache[cacheKey] = { id: id, results: [englishTrailer] };
                oncomplite({ id: id, results: [englishTrailer] });
            } else {
                trailerCache[cacheKey] = { id: id, results: [] };
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
                trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
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

function clear() {
    network.clear();
    trailerCache = {};
    categoryCache = {};
    ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
        Lampa.Storage.set('trailer_category_cache_' + key, null);
    });
}

var Api = {
    get: get,
    main: main,
    full: full,
    videos: videos,
    clear: clear
};
