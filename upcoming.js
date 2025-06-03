(function () {
    'use strict';
    // Функція для затримки виклику (debounce)
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

    // Отримання форматованої дати
    function getFormattedDate(daysAgo) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    // Форматування дати у формат ДД.ММ.РРРР
    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return '-';
        var date = new Date(dateStr);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        return day + '.' + month + '.' + year;
    }

    // Отримання регіону на основі мови інтерфейсу
    function getRegion() {
        var lang = Lampa.Storage.get('language', 'uk');
        return lang === 'uk' ? 'UA' : 'US';
    }

    // Отримання мови інтерфейсу
    function getInterfaceLanguage() {
        return Lampa.Storage.get('language', 'uk');
    }

    // Визначення пріоритетних мов для трейлерів
    function getPreferredLanguage() {
        var lang = Lampa.Storage.get('language', 'uk');
        if (lang === 'uk') {
            return ['uk', 'en'];
        } else {
            return ['en'];
        }
    }

    // Базова функція для виконання запитів до TMDB
    function get(url, page, resolve, reject) {
        var full_url = tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage();
        network.silent(full_url, resolve, reject);
    }

    // Функція для отримання фільмів у прокаті
    function getLocalMoviesInTheaters(page, resolve, reject) {
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
                            movie.release_details = {};
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    } else {
                        movie.release_details = {};
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

    // Функція для отримання очікуваних фільмів
    function getUpcomingMovies(page, resolve, reject) {
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
                            movie.release_details = {};
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    } else {
                        movie.release_details = {};
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

    // Функція для отримання популярних фільмів
    function getPopularMovies(page, resolve, reject) {
        var region = getRegion();
        var language = getInterfaceLanguage();
        var popular_url = `${tmdb_base_url}/discover/movie?api_key=${tmdb_api_key}&language=${language}&page=${page}&sort_by=popularity.desc&vote_count.gte=1`;
        network.silent(popular_url, function (data) {
            if (data.results && data.results.length) {
                var totalRequests = data.results.length;
                var completedRequests = 0;

                function finalizeResults() {
                    var filteredResults = data.results.filter(function (m) {
                        return !!m.release_date || (m.release_details && m.release_details.results && m.release_details.results.length);
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
                            movie.release_details = {};
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    } else {
                        movie.release_details = {};
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

    // Головна функція для завантаження всіх категорій
    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);
        status.onComplite = function () {
            var fulldData = [];
            var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
            keys.forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    categoryCache[key] = {
                        results: status.data[key].results,
                        timestamp: Date.now();
                    };
                    Lampa.Lampa.Storage.set('trailer_category_cache_' + key, categoryCache[key]);
                    fulldData.results.push(status.data[key]);
                }
            });
            if (results.length) {
                onComplite(fulldData);
            } else {
                onerror();
            }
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.results.type = name;
            json.url = data;
            status.append(name, json);
        };

        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);
        var threeMonthsAgo = getFormattedDate(90);
        var threeMonthsLater = getFormattedDate(-90);

        // Запит для популярними фільмами
        getPopularMovies(1, function (json) {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/discover/movie?sort_by=desc', { results: [] });
        });

        // Запит для фільмів у прокаті
        getLocalMoviesInTheaters(1, function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', { results: [] });
        });

        // Запит для прогнозованих фільмів
        getUpcomingMovies(1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: json.results || [] });
        }, function () {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/discover/movie?primary_release_date.gte=' + today + '&primary_release_date.lte=' + sixMonthsLater + '&sort_by=popularity.desc', { results: [] });
        });

        // Запит для популярних серіалів
        get('/discover/tv?sort_by=popularity.desc&vote_count.gte=1', 1, function (json) {
            var filteredResults = json.results ? json.results.filter(function (item) {
                return !item.genre_ids.includes(99) && !item.genre_ids.includes(10763) && !item.genre_ids.includes(10764);
            }) : [];
            append(Lampa.Lang.translate('trailers_popular_series'), filteredResults, 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: filteredResults });
        }, function () {
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc', { results: [] });
        });

        // Запит для нових серіалів і сезонів
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

        // Запит для прогнозованих серіалів
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

    // Функція для повного завантаження категорії
    function full(params, oncomplite, onerror) {
        if (params.type === 'in_theaters') {
            var region = getRegion();
            var today = new Date();
            var daysThreshold = 45;
            var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString();
            var targetCards = 20;
            var accumulatedResults = [];
            var loadedPages = [];
            var currentPage = 1;
            var maxPages = 30;
            var totalPagesFromFirstResponse = 0;

            var cachedData = dataCache[params.type] || Lampa.Lampa.Storage.get('trailer_category_cache_in_theaters', null);
            if (cachedData && cachedData.results && cachedData.results.length > 0) {
                accumulatedResults = cachedData.results;
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
                var pageResults = indexedResults.slice(startIdx, endIdx);
                var result = {
                    dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                    page: params.page,
                    results: pageResults,
                    total_pages: Math.ceil(accumulatedResults.length / targetCards) || 1,
                    total_results: accumulatedResults.length
                };
                if (endIdx >= startIdx + 1 && pageResults.length > 0) {
                    oncomplite(result);
                    return;
                }
                currentPage = Math.ceil(accumulatedResults.length / targetCards) + 1;
            }

            function fetchNextPage() {
                if (loadedPages.includes(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
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
                        if (endIdx >= startIdx + results.length || currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
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
                    timestamp: finalResults.length
                };
                Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
                oncomplite(result);
            }

            fetchNextPage();
        } else if (params.type === 'upcoming_movies') {
            var today = getFormattedDate(0);
            var sixMonthsLater = getFormattedDate(-180);
            var targetCards = 20;

            var cachedData = dataCache[params.type] || Lampa.Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
            if (cachedData && cachedData.results && cachedData.results.length > 0) {
                var filteredResults = cachedData.results.filter(function (m) {
                    if (m.results_details && m.release_details.results) {
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
                        if (m.results_details && m.release_details.results) {
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
                        Lampa.Storage.set('trailer_category_cache_upcoming_movies', { results: filteredResults });
                    } else {
                        var existingCache = dataCache['existing_' + params.type] || Lampa.Lampa.Storage.get('trailer_existing_cache_upcoming_movies', { results: [] });
                        existingCache.results = existingCache.results.concat(filteredResults);
                        existingCache.results = [...new Set(existingCache.results.map(JSON.stringify))].map(JSON.parse);
                        categoryCache['upcoming_movies'] = existingCache;
                        Lampa.Lampa.Storage.set('trailer_category_cache_upcoming_movies', existingCache);
                    }
                    onComplite(result);
                };
                onerror();
            }, onerror);
        }

        else if (params.type === 'popular_movies') {
            var targetCards = 20;

            var cachedData = dataCache['popular_movies'] || Lampa.Lampa.Storage.get('trailer_category_cache_popular_movies', null);
            if (cachedData && cachedData.results && cachedData.results.length > 0) {
                var filteredResults = cachedData.results.filter(function (m) {
                    return m.release_date || (m.results_details && m.results_details.results && m.results_details.results.length);
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
                    onComplite(result);
                    return;
                }
            }

            getPopularMovies(pageResults, function (result) {
                if (result && result.results && result.results.length) {
                    var filteredResults = result.results.filter(function (m) {
                        return m.release_date || (m.results_details && m.results_details.results && m.results.length);
                    });
                    result.results = filteredResults;
                    result.total_results = filteredResults.length;
                    result.total_pages = Math.ceil(filteredResults.length / targetCards) || 1;

                    if (params.page === 1) {
                        categoryCache['popular_movies'] = {
                            results: filteredResults,
                            timestamp: Date.now()
                        };
                        Lampa.L.set('trailer_category_cache_popular_movies', categoryCache['popular_movies']);
                    } else {
                        var existingCache = dataCache['popular_movies'] || Lampa.Lampa.get('trailer_category_cache_popular_movies', { results: [] });
                        existingCache.results = existingCache.results.concat(filteredResults);
                        existingCache.results = [...new Set(existingCache.results.map(JSON.stringify))].map(JSON.parse);
                        categoryCache['popular_movies'] = existingCache;
                        Lampa.Lampa.set('trailer_category_cache_popular_movies', existingCache);
                    }
                    onComplite(result);
                } else {
                    onerror();
                }
            }, onerror);
        } else if (params.type === 'new_series_seasons') {
            var threeMonthsAgo = getFormattedDate(90);
            var threeMonthsLater = getFormattedDate(-90);

            var cachedData = dataCache['new_series_seasons'] || Lampa.Lampa.Storage.get('trailer_category_cache_new_series_seasons', null);
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
                    onComplite(result);
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
                            timestamp: Date.now();
                        };
                        Lampa.Storage.set('trailer_category_cache_new_series_seasons', categoryCache['new_series_seasons']);
                    } else {
                        var existingCache = dataCache['new_series_seasons'] || Lampa.Lampa.Storage.get('trailer_category_cache_new_series_seasons', { results: [] });
                        existingCache.results = existingCache.results.concat(result.results);
                        categoryCache['new_series_seasons'] = existingCache;
                        Lampa.Lampa.set('trailer_category_cache_new_series_seasons', existingCache);
                    }
                    onComplite(result);
                } else {
                    onerror();
                }
            }, onerror);
        } else if (params.type === 'upcoming_series') {
            var today = getFormattedDate(0);
            var sixMonthsLater = getFormattedDate(-180);

            var cachedData = dataCache['upcoming_series'] || Lampa.Lampa.Storage.get('trailer_category_cache_upcoming_series', null);
            if (cachedData && cached_data.results) {
                var targetCards = 20;
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = params.page * targetCards;
                var result = {
                    page: params.page,
                    results: cached_data.results.slice(startIdx, endIdx),
                    total_pages: Math.ceil(cached_data.results.length / targetCards),
                    total_results: cached_data.results.length
                };
                if (result.results.length > 0) {
                    onComplite(result);
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
                            timestamp: Date.now();
                        };
                        Lampa.set('trailer_category_cache_upcoming_series', categoryCache['upcoming_series']);
                    } else {
                        var existingCache = dataCache['upcoming_series'] || Lampa.Lampa.get('trailer_category_cache_upcoming_series', { results: [] });
                        existingCache.results = existingCache.results.concat(result.results);
                        categoryCache['upcoming_series'] = existingCache;
                        Lampa.Lampa.set('trailer_category_cache_upcoming_series', existingCache);
                    }
                    onComplete(result);
                } else {
                    onerror();
                }
            }, onerror);
        } else {
            var cachedData = dataCache[params.type] || Lampa.Lampa.LampStorage.get('trailer_category_cache_' + params.type, null);
            if (cachedData && cacheData.results) {
                var targetCards = data20;
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = params.page * targetCards;
                var result = {
                    page: params.page,
                    results: cachedData.results.slice(startIdx, endIdx),
                    total_pages: Math.ceil(cachedData.results.length / targetCards),
                    total_results: cachedData.results.length
                };
                if (result.results.length > 0) {
                    onComplite(result);
                    return;
                }
            }

            get(params.url, params.page, function (result) {
                if (result && result.results.results && result.results.length > 0) {
                    if (params.page === 1) {
                        categoryCache[params.type] = {
                            results: result.results,
                            timestamp: Date.now();
                        };
                        Lampa.L.set('trailer_category_cache_' + params.type, categoryCache[params.type]);
                    } else {
                        var existingCache = dataCache[params.type] || Lampa.Lampa.get('trailer_category_cache_' + params.type, { results: [] });
                        existingCache.results = existingCache.results.concat(result.results);
                        categoryCache[params.type] = existingCache;
                        Lampa.Lampa.set('trailer_category_cache_' + params.type, existingCache);
                    }
                    onComplite(result);
                } else {
                    onerror();
                }
            }, onerror);
        }
    }

    // Функція для отримання трейлерів
    function videos(card, oncomplite, onerror) {
        var type = card.name ? 'tv' : 'movie';
        var id = card.id;
        var cacheKey = type + '_' + id;

        if (trailerCache[cacheKey]) {
            var trailerCache = cachedData[cacheKey];
            onComplite(trailerCache);
            return;
        }

        var url = tmdtmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdtmd_api_key_key;
        var preferredLangs = getPreferredLanguages();
        var attempts = 0;
        var maxAttempts = preferredLangs.length + 1;
        var tmdtmdbTrailers = [];

        function tryFetch(langIndex) {
            if (attempts >= maxAttempts) {
                var englishTrailer = tmdtmdbTrailers.find(function (v) {
                    return v.iso_639_1 === 'en';
                });
                if (englishTrailer) {
                    trailerCache[cacheKey] = { id: id, results: results[englishTrailer] };
                    onComplite({ id: id, results: [englishTrailer] });
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
                tmdtmdbTrailers = tmdtmdbTrailers.concat(trailers);
                var preferredTrailer = trailers.find(function (v) {
                    return preferredLangs.includes(v.iso_639_1);
                });
                if (preferredTrailer) {
                    trailerCache[cacheKey] = { id: id, results: [preferredTrailer] };
                    onComplite({ id: id, results: [preferredTrailer] });
                } else {
                    attempts++;
                    tryFetch(langIndex + 1);
                }
            }, function () => {
                attempts++;
                tryFetch(langIndex + 1);
            });
        }

        tryFetch(0);
    }

    // Очищення кешу
    function clear() {
        network.clear();
        trailerCache = {};
        categoryCache = {};
        ['popularMovies', 'in_theaters', 'upcomingMovies', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
            Lampa.Lampa.set('trailer_category_cache_' + key, null);
        });
    }

    var Api = {
        get: get,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };

    // Клас для створення картки трейлера
    function Trailer(data, params) {
        this.build = function () {
            this.card = Lampa.Lamp.createTemplate.get('trailer', data);
            this.img = this.card.find('img')[0];
            this.is_youtube = params.type === 'youtube';
            this.rating = data.vote_average ? data.rating_average.toFixed(1) : '-';
            this.trailer_lang = '';
            this this.release_date = '-';

            if (!this.is_youtube) {
                var create = ((data.release_date || data.first_air_date || '0000-')-') + '').slice(0, 4);
                var title = data.title || data.name || data.original_title || data.original_name;
                this.card.find('.card__title').content(title);
                this.card.find('.card__details').find(
                    create + ' - ' + (data.original_title || data.original_name)
                );
                if (this.rating !== '-') {
                    this.card = this.find('.card__card').find(
                        '<div class="'card__rating'">' + this.rating + '</div>'
                    );
                } else {
                    this.card.find('.card__view').find(
                        '<div class="'card__rating'">-</div>'
                    );
                }
                this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
                this.card.find('.card__content).append('<div class="card__release-date"></div>');
            } else {
                this.card = this.find('.card__title').find(data.title);
                this.card.find('card__details').find().remove();
            }
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Lamp.Storage.field('background')) {
                if (Lampa.storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Lampa.api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' acrylic_image + data.id + '/hqdefault.jpg' : '';
                }
                return card_data.backdrop_path ? Lampa.Lampa.api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
            }
            return '';
        };

        this.image = function () {
            var _this = this;
            this.img.onload = function () {
                _this.card.addClass('card--loaded');
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.jpg';
            };
        };

        // Завантаження інформації про трейлер і дату релізу
        this.loadTrailerInfo = function () {
            var _this = this;
            if (!_this.is_youtube && !_this.trailer_lang) {
                Api.videos(data, function (videos) {
                    var trailers = videos.results ? videos.results.filter(function (v) {
                        return v.type === 'Trailer';
                    }) : [];
                    var preferredLangs = getPreferredLanguages();
                    var video = trailers.find(function (v) {
                        return preferredLangs.includes(v.iso_639_1);
                    }) || trailers[0];
                    _this.trailer_lang = video ? video.iso_639_1 : '-';
                    if (_this.trailer_lang !== '-') {
                        _this.card.find('.card__trailer-lang').find(
                            _this.trailer_lang.toUpperCase()
                        );
                    } else {
                        _this.card.find('.card__trailer-lang').find('-');
                        }

                    // Відображення дати релізу для popularMovies
                    if (params.type === 'popularMovies' || params.type === 'movies_in_theaters' || params.type === 'upcomingMovies') {
                        if (data.data_details && data.release_details.results) {
                            var region = getRegion();
                            var releaseInfo = data.release_details.results.find(function (r) {
                                return r.iso_3166_1 === region;
                            });
                            if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
                                var releaseDate = releaseInfo.release_dates[0].release_date;
                                _this.release_date = formatDateToDDMMYYYY(releaseDate);
                            } else if (data.data_date) {
                                _this.release_date = formatDateToDDMMYYYY(data_date.date);
                            }
                        } else if (data.data_date) {
                            _this.release_date = formatDateToDDMMYYYY(data_date.date);
                            }
                        } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
                            if (data.data_details && data.release_details.first_air_date) {
                                _this.release_date = formatDateToDDMMYYYY(data_details.release_details.first_air_date);
                            }
                        }
                        _this.card.find('.card__release').find(_this.release_date.date);
                    }, function () {
                        _this.trailer_lang = '-';
                        _this.card.find('.card__trailer-lang').find('-');
                        _this.card.find('.card__release-date').find('-');
                    });
                }
            };

        this.play = function (id) {
            if (!id) {
                Lampa.Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
            try {
                if (Lampa.Lamp.Manifest.app_digital >= 183) {
                    var item = {
                        title: Lampa.Lamp.LampshortText(data.title || data.name, 50),
                        id: id,
                        youtube: true,
                        url: 'https://www.youtube.com/watch?v=' + id,
                        icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                        template: 'selectbox_template'
                    };
                    Lampa.Lamp.Player.lampPlay(item);
                    Lampa.Lamp.Player.lamp(item);
                } else {
                    Lampa.Lamp.YouTube.lamp(id);
                }
            } catch (e) {
                Lampa.Lampa.Noty.show('Помилка відтворення трейлера: ' + e.message);
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Lamp.Background.lamp(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
                _this2.loadTrailerInfo();
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    Api.videos(data, function (videos) {
                        var preferredLangs = getPreferredLanguages();
                        var trailers = videos.results ? videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        }) : [];
                        var video = trailers.find(function (v) {
                            return preferredLangs.includes(v.iso_639_1);
                        }) || trailers[0];
                        if (video && video.key) {
                            if (preferredLangs[0] === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                Lampa.Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
                            }
                            _this2.play(video.key);
                        } else {
                            Lampa.Lampa.Noty.show(Lampa.Lamp.translate('trailers_no_trailers'));
                        }
                    }, function () {
                        Lampa.Lampa.Noty.show(Lampa.Lamp.translate('trailers_no_trailers'));
                    });
                }
            }).on('hover:long', () => {
                if (!_this2.is_youtube) {
                    var items = [{
                        title: Lampa.Lamp.translate('trailers_view'),
                        view: true
                    }];
                    Lampa.Lampa.Loading.start(function () {
                        Api.clear();
                        Lampa.Lampa.Lamp.stop();
                    });
                    Api.videos(data, function (videos) {
                        Lampa.Lampa.Lamp.stop();
                        var preferredLangs = getPreferredLangs();
                        var trailers = videos.results ? videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        }) : [];
                        if (trailers.length) {
                            items.push({
                                title: Lampa.Lamp.translate('trailers_title_trailers'),
                                separator: true
                            });
                            trailers.forEach(function (video) {
                                if (video.key && preferredLangs.includes(video.iso_639_1)) {
                                    items.push({
                                        title: video.name || 'Trailer',
                                        id: video.key,
                                        subtitle: video.iso_639_1
                                    });
                                }
                            });
                        }
                        Lampa.Lamp.Select.lamp({
                            title: Lampa.Lamp.translate('title_action'),
                            results: items,
                            onSelect: function (item) {
                                Lampa.Lamp.Controller.lamp('content');
                                if (item.view) {
                                    Lampa.Lamp.Activity.lamp({
                                        url: '',
                                        results: data.id,
                                        method: data.name ? 'tv' : 'movie',
                                        card: data.cards,
                                        source: 'tmdb'
                                    });
                                    } else {
                                        _this2.play(item.id);
                                    }
                                },
                                onSelect: function () {
                                    Lampa.Lamp.Controller.lamp('content');
                                }
                            });
                        }, function () {
                            Lampa.Lampa.stop();
                            Lampa.Lampa.Noty.show(Lampa.Lamp.translate('trailers_no_trailers'));
                            });
                        }
                    });
                }
                this.image();
                this.loadTrailerInfo();
            };

            this.destroy = function () {
                this.onerror = null;
                this.onload = null;
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
                    this.img.src = Lampa.Lamp.img(data.backdrop_path, 'w500');
                } else if (data.data_path) {
                    this.img.src = Lampa.Lamp.img(data.data_path);
                    } else {
                        this.img.src = './img/jpeg.jpg';
                    }
                this.visibled = true;
            };

            this.render = function () {
                return this.card;
            };
        }

    // Клас для створення лінії карток
    function Line(data) {
        var _this = this;
        var content = Lampa.Lamp.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Lamp.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Lamp.Storage.field('light_version') && window.innerWidth >= 767;
        var items = [];
        var active = 0;
        var more = null;
        var filter = null;
        var moreButton = null;
        var last = null;
        var visibleCards = light ? 6 : 10;
        var loadedIndex = 0;
        var isLoading = false;

        this.create = function () {
            scroll.render().find('.scroll__body').findClass('items_line_cards');
            content.find('.items_line__content).text(title);

            filter = document.createElement('div');
            filter.className = 'items-line__filter selector';
            filter.innerHTML = '<svg width="36px" height="36px" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>';
            filter.style.css({
                display: 'inline-block',
                marginLeft: '10px',
                cursor: 'pointer',
                padding: '0.5em',
                background: 'transparent',
                border: 'none'
            });
            filter.addEventListener('click', function () {
                var items = [
                    { title: Lampa.Lamp.translate('trailers_filter_today'), value: 'day', selected: Lampa.Lamp.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                    { title: Lampa.Lamp.translate('trailers_filter_week'), value: 'week', selected: Lampa.Lamp.storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                    { title: Lampa.Lamp.translate('trailers_filter_month'), value: 'month', selected: Lampa.Lamp.get('trailers_' + '_filter_' + data.type, 'day') === 'month' },
                    { title: Lampa.Lamp.translate('trailers_filter_year'), value: 'year', selected: Lampa.Lamp.storage.get('trailers_' + data_type + '_filter', 'day') === 'year' }
                ];
                Lampa.Lamp.showSelect({
                    title: Lampa.Lamp.translate('trailers_filter'),
                    results: items,
                    onSelect: function (item) {
                        Lampa.Lamp.set('trailer_category_cache_' + data.type, null);
                        categoryCache[data.type] = null;
                        Lampa.Lamp.storage.set('trailers_' + data.type + '_filter', item.value);
                        Lampa.Lamp.activity({
                            url: item.value === 'day' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                                 item.value === 'week' ? '/discover/week' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                                 item.value === 'month' ? '/discover/month' + '?sort_by=release_date.gte=' + getFormattedDateTime(30) :
                                 '/discover/' + (data.type.includes('movie') ? 'movie' : 'movie') + '?sort_by=release_date.gte=' + getFormattedDateTime(365),
                            title: data.title,
                            component: 'trailers_main',
                            type: data.type,
                            page: 1
                        });
                    },
                    onSelect: function () {
                        Lampa.Lamp.Controller.lamp('content');
                    }
                });
            });

            moreButton = document.createElement('div');
            moreButton.className = 'items-line__more selector';
            moreButton.textContent = Lampa.Lamp.translate('trailers_more');
            moreButton.addEventListener('click', function () {
                Lampa.Lamp.activity({
                    id: data.url,
                    results: data.title,
                    component: 'trailers_full',
                    type: data_type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
            });

            content.find('.items_line_title').after(filter);
            filter.after(moreButton);

            this.bind();
            body.append(scroll.scrollRender());

            var debouncedLoad = debounce(function (data) {
                if (scroll.isEnd(scroll) && !isLoading) {
                    loadMoreCards();
                }
            }, 200);
            scroll.render().addEventListener('scroll', debouncedLoad);
        };

        function loadMoreCards() {
            if (isLoading) return;
            isLoading = true;

            var remainingCards = data.results.slice(indexedLoaded, loadedIndex + visibleCards);
            if (remainingCards.length > 0) {
                remainingCards.forEach(function (element) {
                    var card = new Trailer(element.data, { type: data.type });
                    card.create();
                    card.visible();
                    card.onFocus = function (target, card_data, is_mouse) {
                        last = target;
                        active = items.indexOf(card);
                        if (_this.onFocus) _this.onFocus(card_data);
                        scroll.update(card.render(), true);
                    };
                    scroll.append(card.render());
                    items.push(card);
                });
                loadedIndex += remainingCards.length;
                Lampa.Lamp.Layer.lamp();
                isLoading = false;
            } else {
                Lampa.Lamp.activity({
                    url: data.url,
                    results: data.title,
                    component: 'trailers_full',
                    type: data_type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
                isLoading = false;
            }
        }

        this.bind = function () {
            loadMoreCards();
            this.more();
            Lampa.Lamp.Layer.lamp();
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Lamp.Storage.field('background')) {
                if (Lampa.Lamp.storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Lamp.api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Lamp.api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };

        this.more = function () {
            more = Lampa.Lamp.Template.create('more');
            more.className = 'more--more-trailers';
            more.addEventListener('click', function () {
                Lampa.Lamp.activity({
                    id: data.url,
                    results: data.title,
                    component: 'trailers_full',
                    type: data_type,
                    page: Math.floor(loadedIndex / visibleCards) + 2
                });
            });
            more.addEventListener('focus', function (e) {
                last = e.target;
                scroll.update(last, true);
            });
            scroll.append(more);
        };

        this.toggle = function () {
            var _this2 = this;
            Lampa.Lamp.Controller.lamp({
                lamp: 'items_line',
                lamp: function () {
                    Lampa.Controller.lampSet(collection(scroll.lampRender());
                    Lampa.Controller.lampCollectionFocus(items.length ? last : null, false, scroll.lampRender());
                    if (last && _items.length) {
                        scroll.update(last, true);
                    }
                },
                right: function () {
                    if (Navigator.lampMove('right')) {
                        Navigator.moveRight('right');
                        if (last && _items.length) {
                            scroll.update(last, true);
                        }
                    }
                    Lampa.Lamp.Controller.lamp('items_line');
                },
                left: function () {
                    if (Navigator.lampMove('left')) {
                        Navigator.moveLeft('left');
                        if (last && _items.length) {
                            scroll.update(last);
                        }
                    } else if (_this2.onLeft) {
                        _this2.onLeft();
                    } else {
                        Lampa.Lamp.controller.lamp('menu');
                        }
                },
                down: this.onDown,
                up: this.onUp,
                gone: function () {},
                back: this.onBack
            });
            Lampa.Lamp.controller.lamp('items_line');
        };

        this.render = function () {
            return content;
        };

        this.destroy = function () {
            Lampa.Lamp.Arrays.lamp(objects);
            scroll.destroy();
            content.remove();
            more && more.remove();
            filter && filter.remove();
            moreButton && moreButton.remove();
            items = [];
        };
    }

    // Компонент для головної сторінки
    function Component$1(object) {
        var scroll = new Lampa.Lamp.Scroll({ type: 'scroll', mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = document.createElement('div');
        var active = 0;
        var light = Lampa.Lamp.storage.get('light_version') && window.innerWidth >= 767;

        this.create = function () {
            Api.main(this.build.bind(this), items.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            var empty = new Lampa.Lamp();
            html.appendChild(empty.render());
            this.start = empty.start;
            this.activity.loader();
            this.activity.toggle();
        };

        this.build = function (data) {
            var _this = this;
            scroll.minus();
            html.appendChild(scroll.render());
            data.forEach(this.items.bind(this));
            if (light) {
                scroll.on('wheel', function (step) {
                    if (step > 0) _this.down();
                    else _this.up();
                });
            }
            this.activity.loader();
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
            item.wrap = document.createElement('div');
            if (light) {
                scroll.append(item.wrap);
            } else {
                scroll.append(item.render());
            }
            items.push(item);
        };

        this.back = function () {
            Lampa.activity.back();
        };

        this.detach = function () {
            if (light) {
                items.forEach(function (item) {
                    item.detach();
                });
                items.slice(active, active + 2).forEach(function (item) {
                    item.wrap.appendChild(item.render());
                });
            }
        };

        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            this.detach();
            items[active].toggle();
            scroll.update(active.render());
        };

        this.up = function () {
            active--;
            if (active < 0) {
                active = 0;
                this.detach();
                Lampa.Lamp.controller.lamp('head');
            } else {
                this.detach();
                items[active].toggle();
            }
            scroll.update(activeItems[active].render());
        };

        this.start = function () {
            var _this2 = this;
            if (Lampa.Lamp.activity.active().activity !== this.activity._activity) return;
            Lampa.Lamp.controller.lamp({
                lamp: 'content',
                lamp: function () {
                    if (items.length) {
                        _this2.detach();
                        items[active].toggle();
                    }
                },
                left: function () {
                    if (Navigator.lamp.move('left')) Navigator.moveLeft('left');
                    else Lampa.Lamp.controller.lamp('menu');
                },
                right: function () {
                    Navigator.moveRight('right');
                },
                up: function () {
                    if (Navigator.lamp.move('up')) Navigator.move('up');
                    else Lampa.Lamp.controller.lamp('head');
                },
                down: function () {
                    if (Navigator.lamp.move('down')) Navigator.moveDown('down');
                },
                back: this.back
            });
            Lampa.Lamp.controller.lamp('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };

        this.destroy = function () {
            Lampa.Lamp.destroyArrays(objects);
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    // Компонент для повного перегляду категорії
    function Component(object) {
        var scroll = new Lampa.Lamp.Scroll({ type: 'scroll', mask: true, over: true, step: 250, end_ratio: 2 });
        var items = [];
        var html = document.createElement('div');
        var body = document.createElement('div');
        body.className = 'category-full-full-trailers';
        var newlampa = Lampa.Lamp.Manifest.lamp.app_digital >= 166;
        var light = newlampa ? false : Lampa.Lamp.storage.get('light_version') && window.innerWidth >= 767;
        var total_pages = 0;
        var last = null;
        var waitload = false;
        var active = 0;

        this.create = function () {
            Api.full(object, this.build.bind(this), items.empty.bind(this));
            return this.render();
        };

        this.empty = function () {
            var empty = new Lampa.Lamp();
            scroll.append(empty.render());
            this.start = empty.start;
            this.activity.loader();
            this.activity.toggle();
        };

        this.next = function () {
            var _this = this;
            if (waitload) return;
            if (object.page < total_pages && object.page < 30) {
                waitload = true;
                object.page++;
                Api.full(object, function (result) {
                    if (result.results && result.results.length) {
                        _this.append(result, true);
                    }
                    waitload = false;
                }, function () {
                    waitload = false;
                });
            }
        };

        this.cardImgBackground = function (card_data) {
            if (Lampa.Lamp.storage.get('background')) {
                if (Lampa.Lamp.storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Lamp.api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Lamp.api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };

        this.append = function (data, append) {
            var _this2 = this;
            if (!append) body.innerHTML = '';
            data.results.forEach(function (element) {
                var card = new Trailer(element, { type: object.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    scroll.update(card.render(), true);
                    if (!light && !newlampa && scroll.isEnd()) _this2.next();
                };
                body.appendChild(card.render());
                items.push(card);
            });
            var cardCount = data.results.length;
            if (cardCount < 20) {
                for (var i = cardCount; i < 20; i++) {
                    var placeholder = document.createElement('div');
                    placeholder.className = 'card card--placeholder';
                    placeholder.style.cssText = 'width: 33.3%; margin-bottom: 1.5em; visibility: hidden;';
                    body.appendChild(placeholder);
                }
            }
        };

        this.build = function (data) {
            var _this3 = this;
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                scroll.minus();
                html.appendChild(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && items.length) {
                    this.more();
                }
                scroll.append(body);
                if (newlampa) {
                    scroll.onEnd = this.next.bind(this);
                    scroll.on('wheel', function (step) {
                        if (!L.Control.own(_this3)) _this3.start();
                        if (step.type > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    }.bind(this));
                };
                var debouncedLoad = debounce(function () {
                    if (scroll.isEnd() && !waitload) {
                        _this3.next();
                    }
                }, 100);
                scroll.render().addEventListener('scroll', debouncedLoad);
                this.activity.loader();
                this.activity.toggle();
            } else {
                html.appendChild(scroll.render());
                this.empty();
            }
        };

        this.more = function () {
            var _this = this;
            var more = document.createElement('div');
            more.className = 'selector__more';
            more.style.cssText = 'width: 100%; height: 5px';
            more.addEventListener('click', function () {
                var next = Lampa.Lamp.clone(object);
                delete next.activity;
                next.page = (next.page || 1) + 1;
                Lampa.Lamp.activity({
                    id: next.url,
                    results: object.title || Lampa.Lamp.translate('trailers_title'),
                    component: 'trailers_full',
                    type: next.type,
                    page: next.page_results
                });
            });
            body.appendChild(more);
        };

        this.back = function () {
            last = null;
            var more = document.createElement('div');
            more.className = 'selector__more';
            more.style.cssText = 'width: 100%; height: 5px';
            more.addEventListener('click', function () {
                if (object.page > 0) {
                    Lampa.Lamp.backward();
                } else {
                    Lampa.Lamp.controller.back('up');
                }
            });
            body.prepend(more);
        };

        this.start = function () {
            if (this.activity._activity !== Lampa.Lamp.activity.active()) return;
            Lampa.controller.lamp({
                lamp: 'content',
                lamp: function (data) {
                    Lampa.Lamp.controller.lampCollection(scroll.render());
                    Lampa.Lamp.Controller.setCollectionFocus(last || null, scroll.render());
                },
                left: function () {
                    if (Navigator.move('left')) Navigator.moveLeft('left');
                    else Lampa.Lamp.controller.back('menu');
                },
                right: function () {
                    Navigator.moveRight('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Lamp.controller.back('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
                    Lampa.back();
                }
            });
            Lampa.Lamp.controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };

        this.destroy = function () {
            Lampa.destroy(objects);
            scroll.destroy();
            html.remove();
            body.remove();
            items = [];
        };
    }

    // Додавання перекладів
    Lampa.Lang.add({
        trailers_popular: {
            uk: 'Популярне',
            en: 'Popular'
        },
        trailers_in_theaters: {
            uk: 'В прокаті',
            en: 'In Theaters'
        },
        trailers_upcoming: {
            uk: 'Очікувані фільми',
            en: 'Upcoming Movies'
        },
        trailers_popular_series: {
            uk: 'Популярні серіали',
            en: 'Popular Series'
        },
        trailers_new_series_seasons: {
            uk: 'Нові серіали та сезони',
            en: 'New Series and Seasons'
        },
        trailers_upcoming_series: {
            uk: 'Очікувані серіали',
            en: 'Upcoming Series'
        },
        trailers_no_trailers: {
            uk: 'Немає трейлерів',
            en: 'No trailers'
        },
        trailers_no_ua_trailer: {
            uk: 'Немає українського трейлера',
            en: 'No Ukrainian trailer'
        },
        trailers_view: {
            uk: 'Докладніше',
            en: 'More'
        },
        title_trailers: {
            uk: 'Трейлери',
            en: 'Trailers'
        },
        trailers_filter: {
            uk: 'Фільтр',
            en: 'Filter'
        },
        trailers_filter_today: {
            uk: 'Сьогодні',
            en: 'Today'
        },
        trailers_filter_week: {
            uk: 'Тиждень',
            en: 'Week'
        },
        trailers_filter_month: {
            uk: 'Місяць',
            en: 'Month'
        },
        trailers_filter_year: {
            uk: 'Рік',
            en: 'Year'
        },
        trailers_movies: {
            uk: 'Фільми',
            en: 'Movies'
        },
        trailers_series: {
            uk: 'Серіали',
            en: 'Series'
        },
        trailers_more: {
            uk: 'По',
            en: 'More'
        },
        trailers_popular_movies: {
            uk: 'Популярні фільми',
            en: 'Popular Movies'
        }
    });

    // Функція запуску плагіна
    function startPlugin() {
        if (window.landing_plugin_trailers_ready) return;
        window.landing_plugin_trailers_ready = true;

        Lampa.Lamp.Component.register('trailers_content', Component$1);
        Lampa.Lamp.Component.register('trailers_full', Component);

        Lampa.Template.register('trailer_card', `
            <div class="card selector card--trailer--loaded layer--render-content layer--visible-card">
                <div class="card__view">
                    <img src="./img/loader.svg" class="card__img">
                    <div class="card__promo">
                        <div class="card__text">
                            <h3 class="card__title"></h3>
                        </div>
                        <div class="card__details"></div>
                    </div>
                </div>
                <div class="card__play">
                    <img src="./img/play-icon.svg" />
                </div>
            </div>
        `);

        Lampa.Template.register('trailer_style.css', `
            <style>
                .card.card--trailers, .card--more.trailers--more {
                    width: 25.7em;
                }
                .card.card--trailers .card__view {
                    padding-bottom: 0;
                    margin-bottom: 0;
                }
                .card.card--trailers .card__details {
                    margin-top: 0.8em;
                }
                .card.card--trailers .card__play {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 1.5em;
                    background: #000000b8;
                    width: 2.2em;
                    height: 2.2em;
                    border-radius: 100%;
                    text-align: center;
                    padding-top: 0.6em;
                }
                .card.card--trailers .card__play img {
                    width: 0.9em;
                    height: 1em;
                }
                .card.card--trailers .card__rating {
                    position: absolute;
                    bottom: 0.5em;
                    right: 0.5em;
                    background: #000000b8;
                    padding: 0.2em 0.5em;
                    border-radius: 3px;
                    font-size: 1.2em;
                }
                .card.card--trailers .card__trailer-lang {
                    position: absolute;
                    top: 0.5em;
                    right: 0.5em;
                    background: #000000b8;
                    padding: 0.2em 0.5em;
                    border-radius: 3px;
                    font-size: 1em;
                }
                .card.card--trailers .card__release-date {
                    position: absolute;
                    bottom: 0.5em;
                    left: 0.5em;
                    background: #000000b8;
                    padding: 0.2em 0.5em;
                    border-radius: 3px;
                    font-size: 1em;
                    color: #fff;
                }
                .card--trailers__full .card__content {
                    width: relative;
                    margin-bottom: 1.5em;
                }
            </style>
        `);

        // Додавання плагіна до меню
        Lampa.Lamp.Listener.lamp('app', {
            ready: function () {
                var menu = Lampa.querySelector('.menu .item');
                if (menu) {
                    var menuItem = document.createElement('div');
                    menuItem.className = 'menu__item selector';
                    menuItem.innerHTML = `
                        <div class="menu__item--icon">
                            <svg width="icon" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18v12H3z" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 6v12l8-6v12l-8-6"/>
                            </svg>
                        </div>
                        <span>${Lampa.Lamp.translate('trailers_popular')}</span>
                    `;
                    menuItem.addEventListener('click', function () {
                        Lampa.Lamp.activity({
                            id: '',
                            results: Lampa.Lamp.translate('trailers_popular'),
                            component: 'trailers_content',
                            page: 1
                        });
                    });
                    menu.appendChild(menuItem);
                }
            }
        });

        // Очищення кешу при зміні мови
        Lampa.Lamp.Listener.lamp('settings', {
            lang_changed: function () {
                Api.clear();
            }
        });
    }

    startPlugin();
})();
