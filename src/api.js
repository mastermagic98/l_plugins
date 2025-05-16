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
    var maxPages = 30;
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

                        if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                            network.silent(release_url, function (release_data) {
                                movie.release_details = release_data;
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
                            network.silent(video_url, function (video_data) {
                                var trailers = video_data.results ? video_data.results.filter(function (v) {
                                    return v.type === 'Trailer';
                                }) : [];
                                var hasTrailer = trailers.length > 0;

                                if (hasTrailer) {
                                    trailerCache[cacheKey] = { id: movie_id, results: trailers };
                                    network.silent(release_url, function (release_data) {
                                        movie.release_details = release_data;
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
            results: filteredResults,
            total_pages: 1,
            total_results: filteredResults.length
        };
        console.log('getUpcomingMovies results:', filteredResults.length, 'Page:', page);
        resolve(result);
    }

    fetchPage(page);
}

function main(oncomplite, onerror) {
    var status = new Lampa.Status(6);
    var lang = Lampa.Storage.get('language', 'ru');
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';
    var preferredLangs = getPreferredLanguage();

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

    get('/trending/movie/week', 1, function (json) {
        if (json.results && json.results.length) {
            var totalRequests = json.results.length;
            var completedRequests = 0;

            function finalizeResults() {
                var filteredResults = json.results.filter(function (m) {
                    return m.title && m.poster_path && m.release_details && m.release_details.release_date;
                });
                console.log('Popular movies results:', filteredResults.length);
                append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/week', { results: filteredResults });
            }

            json.results.forEach(function (movie) {
                var movie_id = movie.id;
                if (movie_id) {
                    var translation_url = `${tmdb_base_url}/movie/${movie_id}/translations?api_key=${tmdb_api_key}`;
                    var video_url = `${tmdb_base_url}/movie/${movie_id}/videos?api_key=${tmdb_api_key}&language=${language}`;
                    var release_url = `${tmdb_base_url}/movie/${movie_id}/release_dates?api_key=${tmdb_api_key}`;
                    var cacheKey = 'movie_' + movie_id;

                    if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                        network.silent(translation_url, function (translation_data) {
                            var hasTranslation = translation_data.translations?.some(function (t) {
                                return t.iso_639_1 === lang && t.data.title;
                            });
                            if (hasTranslation) {
                                network.silent(release_url, function (release_data) {
                                    movie.release_details = { release_date: release_data.results?.find(function (r) { return r.iso_3166_1 === getRegion(); })?.release_dates[0]?.release_date || movie.release_date };
                                    completedRequests++;
                                    if (completedRequests === totalRequests) {
                                        finalizeResults();
                                    }
                                }, function () {
                                    movie.release_details = { release_date: movie.release_date };
                                    completedRequests++;
                                    if (completedRequests === totalRequests) {
                                        finalizeResults();
                                    }
                                });
                            } else {
                                completedRequests++;
                                if (completedRequests === totalRequests) {
                                    finalizeResults();
                                }
                            }
                        }, function () {
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    } else {
                        network.silent(video_url, function (video_data) {
                            var trailers = video_data.results ? video_data.results.filter(function (v) {
                                return v.type === 'Trailer' && v.iso_639_1 === lang;
                            }) : [];
                            var hasTrailer = trailers.length > 0;

                            if (hasTrailer) {
                                trailerCache[cacheKey] = { id: movie_id, results: trailers };
                                network.silent(translation_url, function (translation_data) {
                                    var hasTranslation = translation_data.translations?.some(function (t) {
                                        return t.iso_639_1 === lang && t.data.title;
                                    });
                                    if (hasTranslation) {
                                        network.silent(release_url, function (release_data) {
                                            movie.release_details = { release_date: release_data.results?.find(function (r) { return r.iso_3166_1 === getRegion(); })?.release_dates[0]?.release_date || movie.release_date };
                                            completedRequests++;
                                            if (completedRequests === totalRequests) {
                                                finalizeResults();
                                            }
                                        }, function () {
                                            movie.release_details = { release_date: movie.release_date };
                                            completedRequests++;
                                            if (completedRequests === totalRequests) {
                                                finalizeResults();
                                            }
                                        });
                                    } else {
                                        completedRequests++;
                                        if (completedRequests === totalRequests) {
                                            finalizeResults();
                                        }
                                    }
                                }, function () {
                                    completedRequests++;
                                    if (completedRequests === totalRequests) {
                                        finalizeResults();
                                    }
                                });
                            } else {
                                completedRequests++;
                                if (completedRequests === totalRequests) {
                                    finalizeResults();
                                }
                            }
                        }, function () {
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    }
                } else {
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                        finalizeResults();
                    }
                }
            });
        } else {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/week', { results: [] });
        }
    }, function () {
        append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/week', { results: [] });
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

    get('/trending/tv/week', 1, function (json) {
        if (json.results && json.results.length) {
            var totalRequests = json.results.length;
            var completedRequests = 0;

            function finalizeResults() {
                var filteredResults = json.results.filter(function (s) {
                    return s.name && s.poster_path && s.release_details && s.release_details.first_air_date;
                });
                console.log('Popular series results:', filteredResults.length);
                append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/trending/tv/week', { results: filteredResults });
            }

            json.results.forEach(function (series) {
                var series_id = series.id;
                if (series_id) {
                    var translation_url = `${tmdb_base_url}/tv/${series_id}/translations?api_key=${tmdb_api_key}`;
                    var video_url = `${tmdb_base_url}/tv/${series_id}/videos?api_key=${tmdb_api_key}&language=${language}`;
                    var cacheKey = 'tv_' + series_id;

                    if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                        network.silent(translation_url, function (translation_data) {
                            var hasTranslation = translation_data.translations?.some(function (t) {
                                return t.iso_639_1 === lang && t.data.name;
                            });
                            if (hasTranslation) {
                                series.release_details = { first_air_date: series.first_air_date };
                                completedRequests++;
                                if (completedRequests === totalRequests) {
                                    finalizeResults();
                                }
                            } else {
                                completedRequests++;
                                if (completedRequests === totalRequests) {
                                    finalizeResults();
                                }
                            }
                        }, function () {
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    } else {
                        network.silent(video_url, function (video_data) {
                            var trailers = video_data.results ? video_data.results.filter(function (v) {
                                return v.type === 'Trailer' && v.iso_639_1 === lang;
                            }) : [];
                            var hasTrailer = trailers.length > 0;

                            if (hasTrailer) {
                                trailerCache[cacheKey] = { id: series_id, results: trailers };
                                network.silent(translation_url, function (translation_data) {
                                    var hasTranslation = translation_data.translations?.some(function (t) {
                                        return t.iso_639_1 === lang && t.data.name;
                                    });
                                    if (hasTranslation) {
                                        series.release_details = { first_air_date: series.first_air_date };
                                        completedRequests++;
                                        if (completedRequests === totalRequests) {
                                            finalizeResults();
                                        }
                                    } else {
                                        completedRequests++;
                                        if (completedRequests === totalRequests) {
                                            finalizeResults();
                                        }
                                    }
                                }, function () {
                                    completedRequests++;
                                    if (completedRequests === totalRequests) {
                                        finalizeResults();
                                    }
                                });
                            } else {
                                completedRequests++;
                                if (completedRequests === totalRequests) {
                                    finalizeResults();
                                }
                            }
                        }, function () {
                            completedRequests++;
                            if (completedRequests === totalRequests) {
                                finalizeResults();
                            }
                        });
                    }
                } else {
                    completedRequests++;
                    if (completedRequests === totalRequests) {
                        finalizeResults();
                    }
                }
            });
        } else {
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/trending/tv/week', { results: [] });
        }
    }, function () {
        append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/trending/tv/week', { results: [] });
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
    var lang = Lampa.Storage.get('language', 'ru');
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';

    if (params.type === 'in_theaters') {
        var region = getRegion();
        var today = new Date();
        var daysThreshold = 45;
        var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        var accumulatedResults = [];
        var loadedPages = new Set();
        var currentPage = 1;
        var maxPages = 30;
        var totalPagesFromFirstResponse = 0;

        var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            accumulatedResults = cachedData.results;
            var result = {
                dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                page: params.page,
                results: accumulatedResults,
                total_pages: 1,
                total_results: accumulatedResults.length
            };
            console.log('In theaters cache:', accumulatedResults.length, 'Page:', params.page);
            oncomplite(result);
            return;
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
                    if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
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
            finalResults = finalResults.filter(function (m) {
                return m.poster_path && m.poster_path !== '';
            });
            var result = {
                dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                page: params.page,
                results: finalResults,
                total_pages: 1,
                total_results: finalResults.length
            };
            console.log('In theaters final results:', finalResults.length, 'Page:', params.page);
            categoryCache['in_theaters'] = {
                results: finalResults,
                timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
            oncomplite(result);
        }

        fetchNextPage();
    } else if (params.type === 'upcoming_movies') {
        var region = getRegion();
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);
        var accumulatedResults = [];
        var loadedPages = new Set();
        var currentPage = 1;
        var maxPages = 30;
        var totalPagesFromFirstResponse = 0;

        var cachedData = categoryCache['upcoming_movies'] || Lampa.Storage.get('trailer_category_cache_upcoming_movies', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            accumulatedResults = cachedData.results;
            var result = {
                dates: { maximum: sixMonthsLater, minimum: today },
                page: params.page,
                results: accumulatedResults,
                total_pages: 1,
                total_results: accumulatedResults.length
            };
            console.log('Upcoming movies cache:', accumulatedResults.length, 'Page:', params.page);
            oncomplite(result);
            return;
        }

        function fetchNextPage() {
            if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                finalizeResults();
                return;
            }

            loadedPages.add(currentPage);
            getUpcomingMovies(currentPage, function (result) {
                if (result && result.results && result.results.length) {
                    accumulatedResults = accumulatedResults.concat(result.results);
                    if (currentPage === 1) {
                        totalPagesFromFirstResponse = result.total_pages || maxPages;
                    }
                    if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
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
            }, function () {
                finalizeResults();
            });
        }

        function finalizeResults() {
            var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
            finalResults.sort(function (a, b) {
                var dateA = a.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || a.release_date;
                var dateB = b.release_details?.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || b.release_date;
                return new Date(dateA) - new Date(dateB);
            });
            finalResults = finalResults.filter(function (m) {
                return m.poster_path && m.poster_path !== '';
            });
            var result = {
                dates: { maximum: sixMonthsLater, minimum: today },
                page: params.page,
                results: finalResults,
                total_pages: 1,
                total_results: finalResults.length
            };
            console.log('Upcoming movies final results:', finalResults.length, 'Page:', params.page);
            categoryCache['upcoming_movies'] = {
                results: finalResults,
                timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_upcoming_movies', categoryCache['upcoming_movies']);
            oncomplite(result);
        }

        fetchNextPage();
    } else if (params.type === 'popular_movies') {
        var region = getRegion();
        var accumulatedResults = [];
        var loadedPages = new Set();
        var currentPage = 1;
        var maxPages = 30;
        var totalPagesFromFirstResponse = 0;

        var cachedData = categoryCache['popular_movies'] || Lampa.Storage.get('trailer_category_cache_popular_movies', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            accumulatedResults = cachedData.results;
            var result = {
                page: params.page,
                results: accumulatedResults,
                total_pages: 1,
                total_results: accumulatedResults.length
            };
            console.log('Popular movies cache:', accumulatedResults.length, 'Page:', params.page);
            oncomplite(result);
            return;
        }

        function fetchNextPage() {
            if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                finalizeResults();
                return;
            }

            loadedPages.add(currentPage);
            get('/trending/movie/week', currentPage, function (result) {
                if (result && result.results && result.results.length) {
                    var totalRequests = result.results.length;
                    var completedRequests = 0;

                    function processPageResults() {
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            if (currentPage === 1) {
                                totalPagesFromFirstResponse = result.total_pages || maxPages;
                            }
                            if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
                                finalizeResults();
                            } else {
                                currentPage++;
                                fetchNextPage();
                            }
                        }
                    }

                    result.results.forEach(function (movie) {
                        var movie_id = movie.id;
                        if (movie_id) {
                            var translation_url = `${tmdb_base_url}/movie/${movie_id}/translations?api_key=${tmdb_api_key}`;
                            var video_url = `${tmdb_base_url}/movie/${movie_id}/videos?api_key=${tmdb_api_key}&language=${language}`;
                            var release_url = `${tmdb_base_url}/movie/${movie_id}/release_dates?api_key=${tmdb_api_key}`;
                            var cacheKey = 'movie_' + movie_id;

                            if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                                network.silent(translation_url, function (translation_data) {
                                    var hasTranslation = translation_data.translations?.some(function (t) {
                                        return t.iso_639_1 === lang && t.data.title;
                                    });
                                    if (hasTranslation) {
                                        network.silent(release_url, function (release_data) {
                                            movie.release_details = { release_date: release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || movie.release_date };
                                            if (movie.title && movie.poster_path && movie.release_details.release_date) {
                                                accumulatedResults.push(movie);
                                            }
                                            processPageResults();
                                        }, function () {
                                            movie.release_details = { release_date: movie.release_date };
                                            if (movie.title && movie.poster_path && movie.release_details.release_date) {
                                                accumulatedResults.push(movie);
                                            }
                                            processPageResults();
                                        });
                                    } else {
                                        processPageResults();
                                    }
                                }, function () {
                                    processPageResults();
                                });
                            } else {
                                network.silent(video_url, function (video_data) {
                                    var trailers = video_data.results ? video_data.results.filter(function (v) {
                                        return v.type === 'Trailer' && v.iso_639_1 === lang;
                                    }) : [];
                                    var hasTrailer = trailers.length > 0;

                                    if (hasTrailer) {
                                        trailerCache[cacheKey] = { id: movie_id, results: trailers };
                                        network.silent(translation_url, function (translation_data) {
                                            var hasTranslation = translation_data.translations?.some(function (t) {
                                                return t.iso_639_1 === lang && t.data.title;
                                            });
                                            if (hasTranslation) {
                                                network.silent(release_url, function (release_data) {
                                                    movie.release_details = { release_date: release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || movie.release_date };
                                                    if (movie.title && movie.poster_path && movie.release_details.release_date) {
                                                        accumulatedResults.push(movie);
                                                    }
                                                    processPageResults();
                                                }, function () {
                                                    movie.release_details = { release_date: movie.release_date };
                                                    if (movie.title && movie.poster_path && movie.release_details.release_date) {
                                                        accumulatedResults.push(movie);
                                                    }
                                                    processPageResults();
                                                });
                                            } else {
                                                processPageResults();
                                            }
                                        }, function () {
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
                    if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
                        currentPage++;
                        fetchNextPage();
                    } else {
                        finalizeResults();
                    }
                }
            }, function () {
                finalizeResults();
            });
        }

        function finalizeResults() {
            var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
            finalResults.sort(function (a, b) {
                var dateA = a.release_details?.release_date || a.release_date;
                var dateB = b.release_details?.release_date || b.release_date;
                return new Date(dateB) - new Date(dateA);
            });
            finalResults = finalResults.filter(function (m) {
                return m.poster_path && m.poster_path !== '';
            });
            var result = {
                page: params.page,
                results: finalResults,
                total_pages: 1,
                total_results: finalResults.length
            };
            console.log('Popular movies final results:', finalResults.length, 'Page:', params.page);
            categoryCache['popular_movies'] = {
                results: finalResults,
                timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_popular_movies', categoryCache['popular_movies']);
            oncomplite(result);
        }

        fetchNextPage();
    } else if (params.type === 'popular_series') {
        var region = getRegion();
        var accumulatedResults = [];
        var loadedPages = new Set();
        var currentPage = 1;
        var maxPages = 30;
        var totalPagesFromFirstResponse = 0;

        var cachedData = categoryCache['popular_series'] || Lampa.Storage.get('trailer_category_cache_popular_series', null);
        if (cachedData && cachedData.results && cachedData.results.length > 0) {
            accumulatedResults = cachedData.results;
            var result = {
                page: params.page,
                results: accumulatedResults,
                total_pages: 1,
                total_results: accumulatedResults.length
            };
            console.log('Popular series cache:', accumulatedResults.length, 'Page:', params.page);
            oncomplite(result);
            return;
        }

        function fetchNextPage() {
            if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                finalizeResults();
                return;
            }

            loadedPages.add(currentPage);
            get('/trending/tv/week', currentPage, function (result) {
                if (result && result.results && result.results.length) {
                    var totalRequests = result.results.length;
                    var completedRequests = 0;

                    function processPageResults() {
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            if (currentPage === 1) {
                                totalPagesFromFirstResponse = result.total_pages || maxPages;
                            }
                            if (currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
                                finalizeResults();
                            } else {
                                currentPage++;
                                fetchNextPage();
                            }
                        }
                    }

                    result.results.forEach(function (series) {
                        var series_id = series.id;
                        if (series_id) {
                            var translation_url = `${tmdb_base_url}/tv/${series_id}/translations?api_key=${tmdb_api_key}`;
                            var video_url = `${tmdb_base_url}/tv/${series_id}/videos?api_key=${tmdb_api_key}&language=${language}`;
                            var cacheKey = 'tv_' + series_id;

                            if (trailerCache[cacheKey] && trailerCache[cacheKey].results.length > 0) {
                                network.silent(translation_url, function (translation_data) {
                                    var hasTranslation = translation_data.translations?.some(function (t) {
                                        return t.iso_639_1 === lang && t.data.name;
                                    });
                                    if (hasTranslation) {
                                        series.release_details = { first_air_date: series.first_air_date };
                                        if (series.name && series.poster_path && series.release_details.first_air_date) {
                                            accumulatedResults.push(series);
                                        }
                                        processPageResults();
                                    } else {
                                        processPageResults();
                                    }
                                }, function () {
                                    processPageResults();
                                });
                            } else {
                                network.silent(video_url, function (video_data) {
                                    var trailers = video_data.results ? video_data.results.filter(function (v) {
                                        return v.type === 'Trailer' && v.iso_639_1 === lang;
                                    }) : [];
                                    var hasTrailer = trailers.length > 0;

                                    if (hasTrailer) {
                                        trailerCache[cacheKey] = { id: series_id, results: trailers };
                                        network.silent(translation_url, function (translation_data) {
                                            var hasTranslation = translation_data.translations?.some(function (t) {
                                                return t.iso_639_1 === lang && t.data.name;
                                            });
                                            if (hasTranslation) {
                                                series.release_details = { first_air_date: series.first_air_date };
                                                if (series.name && series.poster_path && series.release_details.first_air_date) {
                                                    accumulatedResults.push(series);
                                                }
                                                processPageResults();
                                            } else {
                                                processPageResults();
                                            }
                                        }, function () {
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
                    if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
                        currentPage++;
                        fetchNextPage();
                    } else {
                        finalizeResults();
                    }
                }
            }, function () {
                finalizeResults();
            });
        }

        function finalizeResults() {
            var finalResults = [...new Set(accumulatedResults.map(JSON.stringify))].map(JSON.parse);
            finalResults.sort(function (a, b) {
                var dateA = a.release_details?.first_air_date || a.first_air_date;
                var dateB = b.release_details?.first_air_date || b.first_air_date;
                return new Date(dateB) - new Date(dateA);
            });
            finalResults = finalResults.filter(function (s) {
                return s.poster_path && s.poster_path !== '';
            });
            var result = {
                page: params.page,
                results: finalResults,
                total_pages: 1,
                total_results: finalResults.length
            };
            console.log('Popular series final results:', finalResults.length, 'Page:', params.page);
            categoryCache['popular_series'] = {
                results: finalResults,
                timestamp: Date.now()
            };
            Lampa.Storage.set('trailer_category_cache_popular_series', categoryCache['popular_series']);
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
    var lang = Lampa.Storage.get('language', 'ru');
    var language = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US';

    if (trailerCache[cacheKey]) {
        var trailers = trailerCache[cacheKey].results.filter(function (v) {
            return v.iso_639_1 === lang;
        });
        if (trailers.length > 0) {
            oncomplite({ id: id, results: trailers });
        } else {
            onerror();
        }
        return;
    }

    var url = tmdb_base_url + '/' + type + '/' + id + '/videos?api_key=' + tmdb_api_key + '&language=' + language;
    network.silent(url, function (result) {
        var trailers = result.results ? result.results.filter(function (v) {
            return v.type === 'Trailer' && v.iso_639_1 === lang;
        }) : [];
        if (trailers.length > 0) {
            trailerCache[cacheKey] = { id: id, results: trailers };
            oncomplite({ id: id, results: trailers });
        } else {
            trailerCache[cacheKey] = { id: id, results: [] };
            onerror();
        }
    }, function () {
        trailerCache[cacheKey] = { id: id, results: [] };
        onerror();
    });
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
