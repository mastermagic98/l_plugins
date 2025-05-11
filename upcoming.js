(function () {
    'use strict';
    // Версія 1.56: Виправлено фільтрацію upcoming_movies для регіону UA, прибрано vote_count.gte=1, збільшено maxPages до 10, додано очищення кешу при зміні мови, додано логування

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
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return '-';
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

    function getInterfaceLanguage() {
        return Lampa.Storage.get('language', 'ru');
    }

    function getPreferredLanguage() {
        var lang = Lampa.Storage.get('language', 'ru');
        if (lang === 'uk') {
            return ['uk', 'en'];
        } else if (lang === 'ru') {
            return ['ru', 'en'];
        } else {
            return ['en'];
        }
    }

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
        var language = getInterfaceLanguage();

        var upcoming_url = `${tmdb_base_url}/discover/movie?api_key=${tmdb_api_key}&language=${language}&page=${page}®ion=${region}&primary_release_date.gte=${today}&primary_release_date.lte=${sixMonthsLater}&sort_by=popularity.desc`;
        network.silent(upcoming_url, function (data) {
            if (data.results && data.results.length) {
                var totalRequests = data.results.length;
                var completedRequests = 0;

                function finalizeResults() {
                    var filteredResults = data.results.filter(function (m) {
                        if (m.release_date) return true;
                        if (m.release_details?.results?.length) {
                            return m.release_details.results.some(function (r) {
                                return r.iso_3166_1 === region && r.release_dates?.length && r.release_dates[0]?.release_date;
                            });
                        }
                        return false;
                    });
                    filteredResults.sort(function (a, b) {
                        var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
                        var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
                        return new Date(dateA) - new Date(dateB);
                    });
                    console.log('TMDB results:', data.results.length, 'Filtered results:', filteredResults.length);
                    data.results = filteredResults;
                    data.total_results = filteredResults.length;
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
            var today = getFormattedDate(0);
            var sixMonthsLater = getFormattedDate(-180);
            var targetCards = 20;
            var accumulatedResults = [];
            var loadedPages = new Set();
            var currentPage = params.page;
            var maxPages = 10;

            var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
            if (cachedData && cachedData.results && cachedData.results.length > 0) {
                accumulatedResults = cachedData.results.filter(function (m) {
                    if (m.release_date) return true;
                    if (m.release_details?.results?.length) {
                        return m.release_details.results.some(function (r) {
                            return r.iso_3166_1 === getRegion() && r.release_dates?.length && r.release_dates[0]?.release_date;
                        });
                    }
                    return false;
                });
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
                var pageResults = accumulatedResults.slice(startIdx, endIdx);
                var result = {
                    page: params.page,
                    results: pageResults,
                    total_pages: Math.ceil(accumulatedResults.length / targetCards) || 1,
                    total_results: accumulatedResults.length
                };
                if (pageResults.length > 0 && accumulatedResults.length >= startIdx + 1) {
                    oncomplite(result);
                    return;
                }
            }

            function fetchNextPage() {
                if (loadedPages.has(currentPage) || currentPage > maxPages) {
                    finalizeResults();
                    return;
                }

                loadedPages.add(currentPage);
                getUpcomingMovies(currentPage, function (result) {
                    if (result && result.results && result.results.length) {
                        accumulatedResults = accumulatedResults.concat(result.results);
                        var startIdx = (params.page - 1) * targetCards;
                        var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
                        if (accumulatedResults.length >= endIdx || currentPage >= maxPages) {
                            finalizeResults();
                        } else {
                            currentPage++;
                            fetchNextPage();
                        }
                    } else {
                        finalizeResults();
                    }
                }, function () {
                    if (currentPage < maxPages) {
                        currentPage++;
                        fetchNextPage();
                    } else {
                        finalizeResults();
                    }
                });
            }

            function finalizeResults() {
                var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
                finalResults = finalResults.filter(function (m) {
                    if (m.release_date) return true;
                    if (m.release_details?.results?.length) {
                        return m.release_details.results.some(function (r) {
                            return r.iso_3166_1 === getRegion() && r.release_dates?.length && r.release_dates[0]?.release_date;
                        });
                    }
                    return false;
                });
                finalResults.sort(function (a, b) {
                    var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === getRegion(); })?.release_dates[0]?.release_date || a.release_date;
                    var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === getRegion(); })?.release_dates[0]?.release_date || b.release_date;
                    return new Date(dateA) - new Date(dateB);
                });
                console.log('Accumulated results:', accumulatedResults.length, 'Final results:', finalResults.length);
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = Math.min(params.page * targetCards, finalResults.length);
                var pageResults = finalResults.slice(startIdx, endIdx);
                var result = {
                    page: params.page,
                    results: pageResults.length > 0 ? pageResults : finalResults.slice(0, targetCards),
                    total_pages: Math.ceil(finalResults.length / targetCards) || 1,
                    total_results: finalResults.length
                };
                categoryCache['upcoming_movies'] = {
                    results: finalResults,
                    timestamp: Date.now()
                };
                Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
                oncomplite(result);
            }

            fetchNextPage();
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
                if (this.rating !== '-') {
                    this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div>');
                } else {
                    this.card.find('.card__view').append('<div class="card__rating">-</div>');
                }
                this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
                this.card.find('.card__view').append('<div class="card__release-date"></div>');
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

        this.loadTrailerInfo = function () {
            var _this = this;
            if (!this.is_youtube && !this.trailer_lang) {
                Api.videos(data, function (videos) {
                    var trailers = videos.results ? videos.results.filter(function (v) {
                        return v.type === 'Trailer';
                    }) : [];
                    var preferredLangs = getPreferredLanguage();
                    var video = trailers.find(function (v) {
                        return preferredLangs.includes(v.iso_639_1);
                    }) || trailers[0];
                    _this.trailer_lang = video ? video.iso_639_1 : '-';
                    if (_this.trailer_lang !== '-') {
                        _this.card.find('.card__trailer-lang').text(_this.trailer_lang.toUpperCase());
                    } else {
                        _this.card.find('.card__trailer-lang').text('-');
                    }

                    if (params.type === 'in_theaters' || params.type === 'upcoming_movies') {
                        if (data.release_details && data.release_details.results) {
                            var region = getRegion();
                            var releaseInfo = data.release_details.results.find(function (r) {
                                return r.iso_3166_1 === region;
                            });
                            if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
                                var releaseDate = releaseInfo.release_dates[0].release_date;
                                _this.release_date = formatDateToDDMMYYYY(releaseDate);
                            } else if (data.release_date) {
                                _this.release_date = formatDateToDDMMYYYY(data.release_date);
                            }
                        } else if (data.release_date) {
                            _this.release_date = formatDateToDDMMYYYY(data.release_date);
                        }
                    } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
                        if (data.release_details && data.release_details.first_air_date) {
                            _this.release_date = formatDateToDDMMYYYY(data.release_details.first_air_date);
                        }
                    }
                    _this.card.find('.card__release-date').text(_this.release_date);
                }, function () {
                    _this.trailer_lang = '-';
                    _this.card.find('.card__trailer-lang').text('-');
                    _this.card.find('.card__release-date').text('-');
                });
            }
        };

        this.play = function (id) {
            if (!id) {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                return;
            }
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
                Lampa.Noty.show('Помилка відтворення трейлера: ' + e.message);
            }
        };

        this.create = function () {
            var _this2 = this;
            this.build();
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
                _this2.loadTrailerInfo();
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    Api.videos(data, function (videos) {
                        var preferredLangs = getPreferredLanguage();
                        var trailers = videos.results ? videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        }) : [];
                        var video = trailers.find(function (v) {
                            return preferredLangs.includes(v.iso_639_1);
                        }) || trailers[0];
                        if (video && video.key) {
                            if (preferredLangs[0] === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
                            } else if (preferredLangs[0] === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                            }
                            _this2.play(video.key);
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
                        var preferredLangs = getPreferredLanguage();
                        var trailers = videos.results ? videos.results.filter(function (v) {
                            return v.type === 'Trailer';
                        }) : [];
                        if (trailers.length) {
                            items.push({
                                title: Lampa.Lang.translate('title_trailers'),
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
            this.loadTrailerInfo();
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
        var _this = this;
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var items = [];
        var active = 0;
        var more;
        var filter;
        var moreButton;
        var last;
        var visibleCards = light ? 6 : 10;
        var loadedIndex = 0;
        var isLoading = false;

        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);

            filter = $('<div class="items-line__more selector"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
            filter.css({
                display: 'inline-block',
                marginLeft: '10px',
                cursor: 'pointer',
                padding: '0.5em',
                background: 'transparent',
                border: 'none'
            });
            filter.on('hover:enter', function () {
                var items = [
                    { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                    { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                    { title: Lampa.Lang.translate('trailers_filter_all'), value: 'all', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'all' }
                ];
                Lampa.Select.show({
                    title: Lampa.Lang.translate('trailers_filter'),
                    items: items,
                    onSelect: function (item) {
                        Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                        _this.load(true);
                        Lampa.Controller.toggle('content');
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('content');
                    }
                });
            });
            content.find('.items-line__title').after(filter);

            moreButton = Lampa.Template.get('more', {});
            more = new Trailer(moreButton, { type: 'more' });
            more.create();
            moreButton = more.render();
            moreButton.addClass('selector');
            moreButton.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: data.url,
                    title: data.title,
                    component: 'trailers_full',
                    type: data.type,
                    page: 1
                });
            });

            scroll.onWheel = function (step) {
                if (step > 0 && active < items.length - 1) {
                    _this.right();
                } else if (step < 0 && active > 0) {
                    _this.left();
                }
            };

            this.load();

            scroll.onScroll = function () {
                if (!isLoading && scroll.isEnd(1000)) {
                    _this.load();
                }
            };

            body.append(scroll.render());
        };

        this.load = function (reset) {
            if (isLoading) return;
            isLoading = true;

            if (reset) {
                loadedIndex = 0;
                scroll.clear();
                items.forEach(function (item) {
                    item.destroy();
                });
                items = [];
                active = 0;
            }

            var results = data.results.slice(loadedIndex, loadedIndex + visibleCards);
            var filterType = Lampa.Storage.get('trailers_' + data.type + '_filter', 'day');

            if (results.length) {
                results.forEach(function (item, index) {
                    var trailer = new Trailer(item, { type: data.type });
                    trailer.create();
                    items.push(trailer);
                    scroll.append(trailer.render());
                    if (index === 0 && !last) {
                        last = trailer.card;
                        trailer.card.addClass('card--focus');
                    }
                });
                loadedIndex += results.length;
                isLoading = false;
            } else if (data.results.length > loadedIndex) {
                scroll.append(moreButton);
                isLoading = false;
            } else {
                isLoading = false;
            }
        };

        this.left = function () {
            if (active > 0) {
                active--;
                last = items[active].card;
                Lampa.Controller.moveTo(last, scroll.render());
                scroll.scrollTo(last);
            }
        };

        this.right = function () {
            if (active < items.length - 1) {
                active++;
                last = items[active].card;
                Lampa.Controller.moveTo(last, scroll.render());
                scroll.scrollTo(last);
            }
        };

        this.toggle = function () {
            Lampa.Controller.add('trailers_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    if (last) {
                        Lampa.Controller.collectionFocus(last, scroll.render());
                    }
                },
                left: function () {
                    _this.left();
                },
                right: function () {
                    _this.right();
                },
                up: function () {
                    Lampa.Controller.toggle('menu');
                },
                down: function () {
                    Lampa.Controller.toggle('content');
                },
                back: function () {
                    Lampa.Controller.toggle('menu');
                }
            });
            Lampa.Controller.toggle('trailers_line');
        };

        this.render = function () {
            return content;
        };

        this.destroy = function () {
            scroll.destroy();
            items.forEach(function (item) {
                item.destroy();
            });
            more && more.destroy();
            content.remove();
        };
    }

    function Component(object) {
        var _this = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var items = [];
        var html = $('<div></div>');
        var active = 0;
        var last;

        this.create = function () {
            scroll.render().addClass('trailers-full');

            Api.full(object, function (data) {
                var results = data.results || [];
                results.forEach(function (item, index) {
                    var trailer = new Trailer(item, { type: object.type });
                    trailer.create();
                    items.push(trailer);
                    scroll.append(trailer.render());
                    if (index === 0) {
                        last = trailer.card;
                        trailer.card.addClass('card--focus');
                    }
                });

                if (data.total_pages > data.page) {
                    var moreButton = Lampa.Template.get('more', {});
                    var more = new Trailer(moreButton, { type: 'more' });
                    more.create();
                    moreButton = more.render();
                    moreButton.addClass('selector');
                    moreButton.on('hover:enter', function () {
                        Lampa.Activity.push({
                            url: object.url,
                            title: object.title,
                            component: 'trailers_full',
                            type: object.type,
                            page: data.page + 1
                        });
                    });
                    scroll.append(moreButton);
                    items.push(more);
                }

                scroll.onWheel = function (step) {
                    if (step > 0 && active < items.length - 1) {
                        _this.right();
                    } else if (step < 0 && active > 0) {
                        _this.left();
                    }
                };

                _this.toggle();
            }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_data'));
            });

            html.append(scroll.render());
            return html;
        };

        this.left = function () {
            if (active > 0) {
                active--;
                last = items[active].card;
                Lampa.Controller.moveTo(last, scroll.render());
                scroll.scrollTo(last);
            }
        };

        this.right = function () {
            if (active < items.length - 1) {
                active++;
                last = items[active].card;
                Lampa.Controller.moveTo(last, scroll.render());
                scroll.scrollTo(last);
            }
        };

        this.toggle = function () {
            Lampa.Controller.add('trailers_full', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    if (last) {
                        Lampa.Controller.collectionFocus(last, scroll.render());
                    }
                },
                left: function () {
                    _this.left();
                },
                right: function () {
                    _this.right();
                },
                up: function () {
                    Lampa.Controller.toggle('menu');
                },
                down: function () {
                    Lampa.Controller.toggle('content');
                },
                back: function () {
                    Lampa.Controller.toggle('menu');
                }
            });
            Lampa.Controller.toggle('trailers_full');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            scroll.destroy();
            items.forEach(function (item) {
                item.destroy();
            });
            html.remove();
        };
    }

    function Component$1(object) {
        var _this = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var items = [];
        var html = $('<div></div>');

        this.create = function () {
            scroll.render().addClass('trailers-main');

            Api.main(function (data) {
                data.forEach(function (item) {
                    var line = new Line(item);
                    line.create();
                    items.push(line);
                    scroll.append(line.render());
                });

                _this.toggle();
            }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_data'));
            });

            html.append(scroll.render());
            return html;
        };

        this.toggle = function () {
            Lampa.Controller.add('trailers_main', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                up: function () {
                    Lampa.Controller.toggle('menu');
                },
                down: function () {
                    Lampa.Controller.toggle('content');
                },
                back: function () {
                    Lampa.Controller.toggle('menu');
                }
            });
            Lampa.Controller.toggle('trailers_main');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            scroll.destroy();
            items.forEach(function (item) {
                item.destroy();
            });
            html.remove();
        };
    }

    function startPlugin() {
        if (window.plugin_trailers_ready) return;
        window.plugin_trailers_ready = true;

        // Очищення кешу при зміні мови
        var currentLang = Lampa.Storage.get('language', 'ru');
        var lastLang = Lampa.Storage.get('trailer_last_lang', '');
        if (currentLang !== lastLang) {
            ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'].forEach(function (key) {
                categoryCache[key] = null;
                Lampa.Storage.set('trailer_category_cache_' + key, null);
            });
            Lampa.Storage.set('trailer_last_lang', currentLang);
        }

        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);

        Lampa.Template.add('trailer', [
            '<div class="card card--trailer selector">',
            '    <div class="card__view">',
            '        <img class="card__img" />',
            '    </div>',
            '    <div class="card__info">',
            '        <div class="card__title"></div>',
            '        <div class="card__details"></div>',
            '    </div>',
            '</div>'
        ].join(''));

        Lampa.Template.add('items_line', [
            '<div class="items-line">',
            '    <div class="items-line__header">',
            '        <div class="items-line__title"></div>',
            '    </div>',
            '    <div class="items-line__body"></div>',
            '</div>'
        ].join(''));

        Lampa.Template.add('more', [
            '<div class="card card--more selector">',
            '    <div class="card__view">',
            '        <div class="card__more">',
            '            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">',
            '                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.92 5 11v5l-2 2v1h18v-1l-2-2z"/>',
            '            </svg>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join(''));

        var menu_item = {
            title: Lampa.Lang.translate('trailers_main'),
            url: '',
            component: 'trailers_main',
            tab: 'trailers'
        };

        var menu = Lampa.Storage.get('menu', '[]').filter(function (m) {
            return m.component !== 'trailers_main';
        });

        var settings_menu = Lampa.Storage.get('settings_menu', '[]').filter(function (m) {
            return m.component !== 'trailers_settings';
        });

        menu.splice(1, 0, menu_item);
        Lampa.Storage.set('menu', menu);

        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                setTimeout(function () {
                    if (Lampa.Storage.get('trailers_start', true)) {
                        Lampa.Storage.set('trailers_start', false);
                        Lampa.Activity.push({
                            url: '',
                            title: Lampa.Lang.translate('trailers_main'),
                            component: 'trailers_main',
                            page: 1
                        });
                    }
                }, 1000);
            }
        });
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
