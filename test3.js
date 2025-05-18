(function () {
    'use strict';

    // Utility functions
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

    // Network and API setup
    var network = new Lampa.Reguest();
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';
    var trailerCache = {};
    var categoryCache = {};

    // Check and load cache from storage
    function loadCachedData() {
        var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
        keys.forEach(function(key) {
            var cached = Lampa.Storage.get('trailer_category_cache_' + key);
            if (cached && cached.timestamp && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
                categoryCache[key] = cached;
            }
        });
    }

    // Helper functions for API calls
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
            var upcoming_url = `${tmdb_base_url}/movie/upcoming?api_key=${tmdb_api_key}&language=${language}&page=${pageToFetch}&region=${region}`;
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

    function getPopularMovies(page, resolve, reject) {
        get('/discover/movie?sort_by=popularity.desc&vote_count.gte=100&include_adult=false&include_video=true', page, resolve, reject);
    }

    function getPopularSeries(page, resolve, reject) {
        var twentyYearsAgo = getFormattedDate(365 * 20);  // 20 years ago
        var today = getFormattedDate(0);
        get('/discover/tv?sort_by=popularity.desc&first_air_date.gte=' + twentyYearsAgo + 
            '&first_air_date.lte=' + today + '&vote_count.gte=50', page, resolve, reject);
    }

    function getNewSeriesSeasons(page, resolve, reject) {
        var threeMonthsAgo = getFormattedDate(90);
        var threeMonthsLater = getFormattedDate(-90);
        var url = '/discover/tv?sort_by=popularity.desc&first_air_date.gte=' + threeMonthsAgo + 
                '&first_air_date.lte=' + threeMonthsLater + '&vote_count.gte=10';
                
        network.silent(tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage(), function(data) {
            if (data.results && data.results.length) {
                var totalRequests = data.results.length;
                var completedRequests = 0;
                var processedSeries = [];
                
                function finalizeResults() {
                    if (completedRequests === totalRequests) {
                        data.results = processedSeries;
                        resolve(data);
                    }
                }
                
                data.results.forEach(function(series) {
                    var series_id = series.id;
                    if (series_id) {
                        var seasons_url = `${tmdb_base_url}/tv/${series_id}?api_key=${tmdb_api_key}&language=${getInterfaceLanguage()}`;
                        network.silent(seasons_url, function(details) {
                            if (details.seasons && details.seasons.length) {
                                var video_url = `${tmdb_base_url}/tv/${series_id}/videos?api_key=${tmdb_api_key}&language=${getPreferredLanguage()[0]}`;
                                network.silent(video_url, function(video_data) {
                                    var hasTrailer = video_data.results && video_data.results.some(function(v) {
                                        return v.type === 'Trailer';
                                    });
                                    
                                    if (hasTrailer) {
                                        series.seasons_info = details.seasons;
                                        series.number_of_seasons = details.number_of_seasons;
                                        processedSeries.push(series);
                                    }
                                    
                                    completedRequests++;
                                    finalizeResults();
                                }, function() {
                                    completedRequests++;
                                    finalizeResults();
                                });
                            } else {
                                completedRequests++;
                                finalizeResults();
                            }
                        }, function() {
                            completedRequests++;
                            finalizeResults();
                        });
                    } else {
                        completedRequests++;
                        finalizeResults();
                    }
                });
            } else {
                resolve(data);
            }
        }, reject);
    }

    function getUpcomingSeries(page, resolve, reject) {
        var today = getFormattedDate(0);
        var sixMonthsLater = getFormattedDate(-180);
        var url = '/discover/tv?sort_by=popularity.desc&first_air_date.gte=' + today + 
                '&first_air_date.lte=' + sixMonthsLater;
                
        network.silent(tmdb_base_url + url + '&api_key=' + tmdb_api_key + '&page=' + page + '&language=' + getInterfaceLanguage(), function(data) {
            if (data.results && data.results.length) {
                var totalRequests = data.results.length;
                var completedRequests = 0;
                var processedSeries = [];
                
                function finalizeResults() {
                    if (completedRequests === totalRequests) {
                        processedSeries.sort(function(a, b) {
                            return new Date(a.first_air_date) - new Date(b.first_air_date);
                        });
                        data.results = processedSeries;
                        resolve(data);
                    }
                }
                
                data.results.forEach(function(series) {
                    var series_id = series.id;
                    if (series_id) {
                        var video_url = `${tmdb_base_url}/tv/${series_id}/videos?api_key=${tmdb_api_key}&language=${getPreferredLanguage()[0]}`;
                        network.silent(video_url, function(video_data) {
                            var hasTrailer = video_data.results && video_data.results.some(function(v) {
                                return v.type === 'Trailer';
                            });
                            
                            if (hasTrailer) {
                                processedSeries.push(series);
                            }
                            
                            completedRequests++;
                            finalizeResults();
                        }, function() {
                            completedRequests++;
                            finalizeResults();
                        });
                    } else {
                        completedRequests++;
                        finalizeResults();
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

        // Check if we have cached data that's still valid
        loadCachedData();
        
        if (categoryCache.popular_movies && categoryCache.popular_movies.timestamp) {
            status.append('popular_movies', {
                results: categoryCache.popular_movies.results,
                title: getTranslatedTitle('popular_movies'),
                type: 'popular_movies'
            });
        } else {
            getPopularMovies(1, function (json) {
                append(getTranslatedTitle('popular_movies'), 'popular_movies', '/discover/movie?sort_by=popularity.desc&vote_count.gte=100&include_adult=false&include_video=true', json);
            }, status.error.bind(status));
        }

        if (categoryCache.in_theaters && categoryCache.in_theaters.timestamp) {
            status.append('in_theaters', {
                results: categoryCache.in_theaters.results,
                title: getTranslatedTitle('in_theaters'),
                type: 'in_theaters'
            });
        } else {
            getLocalMoviesInTheaters(1, function (json) {
                append(getTranslatedTitle('in_theaters'), 'in_theaters', '', json);
            }, status.error.bind(status));
        }

        if (categoryCache.upcoming_movies && categoryCache.upcoming_movies.timestamp) {
            status.append('upcoming_movies', {
                results: categoryCache.upcoming_movies.results,
                title: getTranslatedTitle('upcoming_movies'),
                type: 'upcoming_movies'
            });
        } else {
            getUpcomingMovies(1, function (json) {
                append(getTranslatedTitle('upcoming_movies'), 'upcoming_movies', '', json);
            }, status.error.bind(status));
        }

        if (categoryCache.popular_series && categoryCache.popular_series.timestamp) {
            status.append('popular_series', {
                results: categoryCache.popular_series.results,
                title: getTranslatedTitle('popular_series'),
                type: 'popular_series'
            });
        } else {
            getPopularSeries(1, function (json) {
                append(getTranslatedTitle('popular_series'), 'popular_series', '/discover/tv?sort_by=popularity.desc&vote_count.gte=50', json);
            }, status.error.bind(status));
        }

        if (categoryCache.new_series_seasons && categoryCache.new_series_seasons.timestamp) {
            status.append('new_series_seasons', {
                results: categoryCache.new_series_seasons.results,
                title: getTranslatedTitle('new_series_seasons'),
                type: 'new_series_seasons'
            });
        } else {
            getNewSeriesSeasons(1, function (json) {
                append(getTranslatedTitle('new_series_seasons'), 'new_series_seasons', '', json);
            }, status.error.bind(status));
        }

        if (categoryCache.upcoming_series && categoryCache.upcoming_series.timestamp) {
            status.append('upcoming_series', {
                results: categoryCache.upcoming_series.results,
                title: getTranslatedTitle('upcoming_series'),
                type: 'upcoming_series'
            });
        } else {
            getUpcomingSeries(1, function (json) {
                append(getTranslatedTitle('upcoming_series'), 'upcoming_series', '', json);
            }, status.error.bind(status));
        }
    }

    // Translation helper
    function getTranslatedTitle(key) {
        var lang = getInterfaceLanguage();
        var translations = {
            'popular_movies': {
                'uk': 'ÐŸÐ¾Ð¿ÑƒÐ»ÑÑ€Ð½Ñ– Ñ„Ñ–Ð»ÑŒÐ¼Ð¸',
                'ru': 'ÐŸÐ¾Ð¿ÑƒÐ»ÑÑ€Ð½Ñ‹Ðµ Ñ„Ð¸Ð»ÑŒÐ¼Ñ‹',
                'en': 'Popular Movies'
            },
            'in_theaters': {
                'uk': 'Ð£ Ð¿Ñ€Ð¾ÐºÐ°Ñ‚Ñ–',
                'ru': 'Ð’ Ð¿Ñ€Ð¾ÐºÐ°Ñ‚Ðµ',
                'en': 'In Theaters'
            },
            'upcoming_movies': {
                'uk': 'ÐžÑ‡Ñ–ÐºÑƒÐ²Ð°Ð½Ñ– Ñ„Ñ–Ð»ÑŒÐ¼Ð¸',
                'ru': 'ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ðµ Ñ„Ð¸Ð»ÑŒÐ¼Ñ‹',
                'en': 'Upcoming Movies'
            },
            'popular_series': {
                'uk': 'ÐŸÐ¾Ð¿ÑƒÐ»ÑÑ€Ð½Ñ– ÑÐµÑ€Ñ–Ð°Ð»Ð¸',
                'ru': 'ÐŸÐ¾Ð¿ÑƒÐ»ÑÑ€Ð½Ñ‹Ðµ ÑÐµÑ€Ð¸Ð°Ð»Ñ‹',
                'en': 'Popular TV Shows'
            },
            'new_series_seasons': {
                'uk': 'ÐÐ¾Ð²Ñ– ÑÐµÐ·Ð¾Ð½Ð¸ ÑÐµÑ€Ñ–Ð°Ð»Ñ–Ð²',
                'ru': 'ÐÐ¾Ð²Ñ‹Ðµ ÑÐµÐ·Ð¾Ð½Ñ‹ ÑÐµÑ€Ð¸Ð°Ð»Ð¾Ð²',
                'en': 'New TV Seasons'
            },
            'upcoming_series': {
                'uk': 'ÐžÑ‡Ñ–ÐºÑƒÐ²Ð°Ð½Ñ– ÑÐµÑ€Ñ–Ð°Ð»Ð¸',
                'ru': 'ÐžÐ¶Ð¸Ð´Ð°ÐµÐ¼Ñ‹Ðµ ÑÐµÑ€Ð¸Ð°Ð»Ñ‹',
                'en': 'Upcoming TV Shows'
            },
            'more': {
                'uk': 'Ð©Ðµ',
                'ru': 'Ð•Ñ‰Ñ‘',
                'en': 'More'
            },
            'watch_trailer': {
                'uk': 'Ð”Ð¸Ð²Ð¸Ñ‚Ð¸ÑÑ Ñ‚Ñ€ÐµÐ¹Ð»ÐµÑ€',
                'ru': 'Ð¡Ð¼Ð¾Ñ‚Ñ€ÐµÑ‚ÑŒ Ñ‚Ñ€ÐµÐ¹Ð»ÐµÑ€',
                'en': 'Watch Trailer'
            },
            'release_date': {
                'uk': 'Ð”Ð°Ñ‚Ð° Ð²Ð¸Ñ…Ð¾Ð´Ñƒ',
                'ru': 'Ð”Ð°Ñ‚Ð° Ð²Ñ‹Ñ…Ð¾Ð´Ð°',
                'en': 'Release Date'
            },
            'trailer_language': {
                'uk': 'ÐœÐ¾Ð²Ð° Ñ‚Ñ€ÐµÐ¹Ð»ÐµÑ€Ñƒ',
                'ru': 'Ð¯Ð·Ñ‹Ðº Ñ‚Ñ€ÐµÐ¹Ð»ÐµÑ€Ð°',
                'en': 'Trailer Language'
            },
            'rating': {
                'uk': 'Ð ÐµÐ¹Ñ‚Ð¸Ð½Ð³',
                'ru': 'Ð ÐµÐ¹Ñ‚Ð¸Ð½Ð³',
                'en': 'Rating'
            },
            'soon': {
                'uk': 'Ð¡ÐºÐ¾Ñ€Ð¾',
                'ru': 'Ð¡ÐºÐ¾Ñ€Ð¾',
                'en': 'Coming Soon'
            },
            'loading': {
                'uk': 'Ð—Ð°Ð²Ð°Ð½Ñ‚Ð°Ð¶ÐµÐ½Ð½Ñ...',
                'ru': 'Ð—Ð°Ð³Ñ€ÑƒÐ·ÐºÐ°...',
                'en': 'Loading...'
            },
            'error': {
                'uk': 'ÐŸÐ¾Ð¼Ð¸Ð»ÐºÐ° Ð·Ð°Ð²Ð°Ð½Ñ‚Ð°Ð¶ÐµÐ½Ð½Ñ',
                'ru': 'ÐžÑˆÐ¸Ð±ÐºÐ° Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸',
                'en': 'Loading Error'
            },
            'trailers': {
                'uk': 'Ð¢Ñ€ÐµÐ¹Ð»ÐµÑ€Ð¸',
                'ru': 'Ð¢Ñ€ÐµÐ¹Ð»ÐµÑ€Ñ‹',
                'en': 'Trailers'
            },
            'no_trailers': {
                'uk': 'Ð¢Ñ€ÐµÐ¹Ð»ÐµÑ€Ð¸ Ð½Ðµ Ð·Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾',
                'ru': 'Ð¢Ñ€ÐµÐ¹Ð»ÐµÑ€Ñ‹ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ñ‹',
                'en': 'No trailers found'
            }
        };
        
        return translations[key][lang] || translations[key]['en'];
    }

    // Get trailer information
    function getTrailer(element, call) {
        var isMovie = element.name ? false : true;
        var id = element.id;
        var url;

        if (isMovie) {
            url = tmdb_base_url + '/movie/' + id + '/videos?api_key=' + tmdb_api_key;
        } else {
            url = tmdb_base_url + '/tv/' + id + '/videos?api_key=' + tmdb_api_key;
        }

        var preferredLangs = getPreferredLanguage();
        var allTrailers = [];
        var preferredTrailers = [];

        function fetchVideos(lang, callback) {
            network.silent(url + '&language=' + lang, function(json) {
                if (json.results && json.results.length) {
                    var trailers = json.results.filter(function(video) {
                        return video.type === 'Trailer' && video.site === 'YouTube';
                    });
                    
                    trailers.forEach(function(trailer) {
                        trailer.language = lang;
                        if (lang === preferredLangs[0]) {
                            preferredTrailers.push(trailer);
                        }
                        allTrailers.push(trailer);
                    });
                }
                callback();
            }, function() {
                callback();
            });
        }

        function processTrailers() {
            var finalTrailers = preferredTrailers.length ? preferredTrailers : allTrailers;

            if (finalTrailers.length) {
                call({
                    results: finalTrailers
                });
            } else {
                // If no trailers in preferred languages, try English as fallback
                if (preferredLangs[0] !== 'en' && !preferredLangs.includes('en')) {
                    fetchVideos('en', function() {
                        call({
                            results: allTrailers
                        });
                    });
                } else {
                    call({
                        results: []
                    });
                }
            }
        }

        fetchVideos(preferredLangs[0], function() {
            if (preferredLangs.length > 1 && !preferredTrailers.length) {
                fetchVideos(preferredLangs[1], processTrailers);
            } else {
                processTrailers();
            }
        });
    }

    // Card component class
    function Card(data, params) {
        var card = Lampa.Template.get('card', {
            title: data.title || data.name || '',
            release_date: data.release_date || data.first_air_date || ''
        });

        this.image = card.find('.card__img')[0];
        this.image.onload = function () {
            card.addClass('card--loaded');
        };
        this.image.onerror = function (e) {
            card.addClass('card--loaded');
            card.addClass('card--background');
            e.target.src = '';
        };

        if (data.poster_path) {
            this.image.src = Lampa.TMDB.image('w500', data.poster_path);
        } else if (data.profile_path) {
            this.image.src = Lampa.TMDB.image('w500', data.profile_path);
        } else {
            card.addClass('card--loaded');
            card.addClass('card--background');
        }

        // Add release date if needed
        if (params.cardType !== 'popular_movies') {
            var releaseDate = data.release_date || data.first_air_date;
            if (releaseDate) {
                var dateElement = document.createElement('div');
                dateElement.className = 'card__release-date';
                dateElement.textContent = formatDateToDDMMYYYY(releaseDate);
                card.find('.card__view')[0].appendChild(dateElement);
            }
        }

        // Add rating for in_theaters items
        if (params.cardType === 'in_theaters' && data.vote_average) {
            var ratingElement = document.createElement('div');
            ratingElement.className = 'card__rating';
            ratingElement.textContent = data.vote_average.toFixed(1);
            card.find('.card__view')[0].appendChild(ratingElement);
        }

        // Add upcoming badge
        if ((params.cardType === 'upcoming_movies' || params.cardType === 'upcoming_series') && data.release_date || data.first_air_date) {
            var now = new Date();
            var releaseDate = new Date(data.release_date || data.first_air_date);
            if (releaseDate > now) {
                var upcomingElement = document.createElement('div');
                upcomingElement.className = 'card__upcoming';
                upcomingElement.textContent = getTranslatedTitle('soon');
                card.find('.card__view')[0].appendChild(upcomingElement);
            }
        }

        this.card = card[0];
        this.render = function () {
            return card;
        };
    }

    // Trailer view component
    function TrailerList(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var items = [];
        var html = $('<div class="trailer-list"></div>');
        var body = $('<div class="trailer-list__body"></div>');
        var selectize = {
            scroll: $('.trailer-list__selectize', scroll.render()),
            position: 0,
            size: 0,
            offset: 0
        };
        var trailers = [];
        var active = 0;
        var ignore = false;
        var filter = {};

        this.create = function () {
            html.append(scroll.render());
            scroll.append(body);
            selectize.scroll.addClass('hide');

            this.load();

            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Controller.add('content', {
                toggle: function toggle() {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function left() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function right() {
                    Navigator.move('right');
                },
                up: function up() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function down() {
                    Navigator.move('down');
                },
                back: function back() {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');

            body.empty();

            scroll.body.before($('<div class="trailer-list__title"><span>' + object.title + '</span></div>'));

            if (object.results.length > 0) {
                trailers = object.results;

                setTimeout(function () {
                    _this.draw();
                }, 100);
            } else {
                body.append($('<div class="trailer-list__empty">' + getTranslatedTitle('no_trailers') + '</div>'));
            }
        };

        this.draw = function () {
            var _this = this;
            trailers.forEach(function (trailer, index) {
                var item = $('<div class="trailer-list__item selector"><div class="trailer-list__item-name">' + trailer.name + '</div></div>');
                
                if (trailer.language) {
                    item.append($('<div class="trailer-list__item-language">' + getTranslatedTitle('trailer_language') + ': ' + trailer.language.toUpperCase() + '</div>'));
                }
                
                item.on('hover:enter', function () {
                    _this.playTrailer(trailer.key);
                }).on('hover:focus', function () {
                    active = index;
                });

                body.append(item);
                items.push(item);
            });

            scroll.update();
            _this.focusItem(0);
        };

        this.focusItem = function (index) {
            active = Math.max(0, Math.min(items.length - 1, index));
            items.forEach(function (item, i) {
                item.toggleClass('focused', i === active);
            });
            scroll.update(items[active], true);
        };

        this.playTrailer = function (trailerKey) {
            var video = {
                url: 'https://www.youtube.com/watch?v=' + trailerKey,
                timeline: null
            };
            Lampa.Player.play(video);
            Lampa.Player.playlist([video]);
        };

        this.toggle = function () {
            Lampa.Controller.add('content', {
                toggle: function toggle() {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function left() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function right() {
                    Navigator.move('right');
                },
                up: function up() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function down() {
                    Navigator.move('down');
                },
                back: function back() {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };
    }

    // Function to create a full category view
    function CategoryView(params) {
        var content = Lampa.Template.get('items_line', {
            title: params.title
        });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({
            horizontal: true,
            step: 300
        });
        var items = [];
        var active = 0;
        var more;
        
        this.create = function() {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(params.title);
            
            this.empty();
            
            scroll.onEnd = this.next.bind(this);
            
            body.append(scroll.render());
            
            // Add "More" button
            more = $('<div class="items-line__more selector"><span>' + getTranslatedTitle('more') + '</span></div>');
            more.on('hover:enter', this.showAll.bind(this)).on('hover:focus', function() {
                more.addClass('focused');
                scroll.element().find('.selector').removeClass('focused');
            });
            content.append(more);
            
            return content;
        };
        
        this.empty = function() {
            scroll.clear();
            scroll.reset();
            items = [];
        };
        
        this.next = function() {
            if (params.page < params.total_pages) {
                params.page++;
                
                var loader = document.createElement('div');
                loader.className = 'items-line__loader';
                loader.innerHTML = '<div class="broadcast__scan"><div></div></div>';
                
                body.append(loader);
                
                this.loadData(function(data) {
                    $(loader).remove();
                    this.append(data.results);
                }.bind(this), function() {
                    $(loader).remove();
                    Lampa.Noty.show(getTranslatedTitle('error'));
                });
            }
        };
        
        this.loadData = function(oncomplite, onerror) {
            var url = params.url;
            
            if (url) {
                get(url, params.page, oncomplite, onerror);
            } else {
                // Handle different categories
                var handlers = {
                    'in_theaters': getLocalMoviesInTheaters,
                    'upcoming_movies': getUpcomingMovies,
                    'new_series_seasons': getNewSeriesSeasons,
                    'upcoming_series': getUpcomingSeries
                };
                
                if (handlers[params.type]) {
                    handlers[params.type](params.page, oncomplite, onerror);
                } else {
                    onerror();
                }
            }
        };
        
        this.append = function(data) {
            var _this = this;
            
            data.forEach(function(element) {
                var card = new Card(element, { cardType: params.type });
                
                card.render().on('hover:focus', function() {
                    scroll.element().find('.selector').removeClass('focused');
                    more.removeClass('focused');
                    $(this).addClass('focused');
                    
                    active = items.indexOf(card);
                }).on('hover:enter', function() {
                    // Get and show trailer when card is clicked
                    getTrailer(element, function(trailer_data) {
                        if (trailer_data.results && trailer_data.results.length) {
                            var trailer_modal = new TrailerList({
                                title: element.title || element.name,
                                results: trailer_data.results
                            });
                            Lampa.Activity.push({
                                url: '',
                                title: getTranslatedTitle('watch_trailer'),
                                component: 'trailer_list',
                                page: 1,
                                content: trailer_modal,
                                filmId: element.id,
                                isTrailer: true
                            });
                        } else {
                            Lampa.Noty.show(getTranslatedTitle('no_trailers'));
                        }
                    });
                });
                
                scroll.append(card.render());
                items.push(card);
            });
        };
        
        this.showAll = function() {
            var full_data = [];
            var total_loaded = 0;
            var total_pages = Math.min(params.total_pages || 1, 5); // Limit to 5 pages for performance
            
            var loader = $('<div class="broadcast__scan"><div></div></div>');
            var loader_text = $('<div class="broadcast__text"></div>');
            
            var modal = $('<div><div class="broadcast" style="pointer-events: none;"></div></div>');
            modal.find('.broadcast').append(loader).append(loader_text);
            
            $('body').append(modal);
            
            loader_text.text(getTranslatedTitle('loading') + ' 1/' + total_pages);
            
            function load(page) {
                var handler = function(data) {
                    if (data && data.results) {
                        full_data = full_data.concat(data.results);
                    }
                    
                    total_loaded++;
                    loader_text.text(getTranslatedTitle('loading') + ' ' + (total_loaded + 1) + '/' + total_pages);
                    
                    if (total_loaded < total_pages) {
                        load(page + 1);
                    } else {
                        modal.remove();
                        
                        var activity = {
                            url: params.url || '',
                            title: params.title,
                            component: 'category_full',
                            page: 1,
                            results: full_data,
                            type: params.type,
                            category_id: params.category_id
                        };
                        
                        Lampa.Activity.push(activity);
                    }
                };
                
                params.page = page;
                _this.loadData(handler, function() {
                    total_loaded++;
                    if (total_loaded < total_pages) {
                        load(page + 1);
                    } else {
                        modal.remove();
                        
                        if (full_data.length) {
                            var activity = {
                                url: params.url || '',
                                title: params.title,
                                component: 'category_full',
                                page: 1,
                                results: full_data,
                                type: params.type,
                                category_id: params.category_id
                            };
                            
                            Lampa.Activity.push(activity);
                        } else {
                            Lampa.Noty.show(getTranslatedTitle('no_trailers'));
                        }
                    }
                });
            }
            
            load(1);
        };
    }

    // Full category view component
    function FullCategory(params) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var items = [];
        var html = $('<div class="category-full"></div>');
        var body = $('<div class="category-full__body"></div>');
        var active = 0;
        
        this.create = function() {
            html.append(scroll.render());
            scroll.append(body);
            scroll.minus(56); // Account for header height
            
            this.load();
            
            return html;
        };
        
        this.load = function() {
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function() {
                    Navigator.move('right');
                },
                up: function() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function() {
                    Navigator.move('down');
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            
            Lampa.Controller.toggle('content');
            
            this.drawItems();
        };
        
        this.drawItems = function() {
            var _this = this;
            
            // Create grid layout
            var itemsGrid = $('<div class="category-full__grid"></div>');
            body.empty().append(itemsGrid);
            
            if (params.results && params.results.length) {
                params.results.forEach(function(element, index) {
                    var card = new Card(element, { cardType: params.type });
                    var cardWrap = $('<div class="category-full__item selector"></div>').append(card.render());
                    
                    cardWrap.on('hover:focus', function() {
                        itemsGrid.find('.selector').removeClass('focused');
                        $(this).addClass('focused');
                        active = index;
                        scroll.update(cardWrap);
                    }).on('hover:enter', function() {
                        // Get and show trailer when card is clicked
                        getTrailer(element, function(trailer_data) {
                            if (trailer_data.results && trailer_data.results.length) {
                                var trailer_modal = new TrailerList({
                                    title: element.title || element.name,
                                    results: trailer_data.results
                                });
                                Lampa.Activity.push({
                                    url: '',
                                    title: getTranslatedTitle('watch_trailer'),
                                    component: 'trailer_list',
                                    page: 1,
                                    content: trailer_modal,
                                    filmId: element.id,
                                    isTrailer: true
                                });
                            } else {
                                Lampa.Noty.show(getTranslatedTitle('no_trailers'));
                            }
                        });
                    });
                    
                    itemsGrid.append(cardWrap);
                    items.push(cardWrap);
                });
                
                scroll.update();
                _this.focusItem(0);
            } else {
                itemsGrid.append($('<div class="category-full__empty">' + getTranslatedTitle('no_trailers') + '</div>'));
            }
        };
        
        this.focusItem = function(index) {
            active = Math.max(0, Math.min(items.length - 1, index));
            items.forEach(function(item, i) {
                item.toggleClass('focused', i === active);
            });
            
            if (items[active]) {
                scroll.update(items[active]);
            }
        };
        
        this.toggle = function() {
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: function() {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function() {
                    Navigator.move('right');
                },
                up: function() {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function() {
                    Navigator.move('down');
                },
                back: function() {
                    Lampa.Activity.backward();
                }
            });
            
            Lampa.Controller.toggle('content');
        };
    }

    // Create and register custom components
    Lampa.Component.add('trailer_list', TrailerList);
    Lampa.Component.add('category_full', FullCategory);

    // Main plugin view
    function startPlugin() {
        Lampa.Template.add('items_line', '<div class="items-line"><div class="items-line__title"></div><div class="items-line__body"></div></div>');
        
        // Add CSS for the plugin
        var styles = `
            .items-line__more {
                padding: 0.5em 1em;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 0.3em;
                margin: 1em;
                text-align: center;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .items-line__more:hover, .items-line__more.focused {
                background-color: rgba(255, 255, 255, 0.2);
            }
            .card__release-date {
                position: absolute;
                bottom: 0.5em;
                left: 0.5em;
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 0.3em;
                padding: 0.2em 0.5em;
                font-size: 0.9em;
                color: #fff;
            }
            .card__rating {
                position: absolute;
                top: 0.5em;
                right: 0.5em;
                background-color: rgba(255, 184, 0, 0.8);
                border-radius: 0.3em;
                padding: 0.2em 0.5em;
                font-size: 0.9em;
                color: #000;
                font-weight: bold;
            }
            .card__upcoming {
                position: absolute;
                top: 0.5em;
                left: 0.5em;
                background-color: rgba(220, 53, 69, 0.8);
                border-radius: 0.3em;
                padding: 0.2em 0.5em;
                font-size: 0.9em;
                color: #fff;
                font-weight: bold;
            }
            .trailer-list {
                padding: 2em;
            }
            .trailer-list__title {
                font-size: 1.8em;
                margin-bottom: 1em;
            }
            .trailer-list__item {
                padding: 1em;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 0.3em;
                margin-bottom: 0.5em;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .trailer-list__item:hover, .trailer-list__item.focused {
                background-color: rgba(255, 255, 255, 0.2);
            }
            .trailer-list__item-name {
                font-size: 1.2em;
                margin-bottom: 0.3em;
            }
            .trailer-list__item-language {
                font-size: 0.9em;
                color: rgba(255, 255, 255, 0.7);
            }
            .trailer-list__empty {
                text-align: center;
                padding: 2em;
                font-size: 1.2em;
                color: rgba(255, 255, 255, 0.7);
            }
            .trailer-list__loader {
                text-align: center;
                padding: 2em;
            }
            .category-full {
                padding: 2em;
            }
            .category-full__grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                grid-gap: 1em;
            }
            .category-full__item {
                position: relative;
                transition: transform 0.3s;
            }
            .category-full__item.focused {
                transform: scale(1.05);
                z-index: 10;
            }
            .category-full__empty {
                grid-column: 1 / -1;
                text-align: center;
                padding: 2em;
                font-size: 1.2em;
                color: rgba(255, 255, 255, 0.7);
            }
        `;
        
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = styles;
        document.head.appendChild(style);
        
        // Register plugin with Lampa
        var plugin = {
            component: 'trailers',
            name: 'Ð¢Ñ€ÐµÐ¹Ð»ÐµÑ€Ð¸',
            icon: '<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M216 72H40a16 16 0 0 0-16 16v80a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V88a16 16 0 0 0-16-16Zm0 96H40V88h176v80Zm-52-40a12 12 0 0 1-12 12h-48a12 12 0 0 1-12-12v-16a12 12 0 0 1 12-12h48a12 12 0 0 1 12 12Z"/></svg>',
            
            onStart: function() {
                // Load cached data when plugin starts
                loadCachedData();
            },
            
            render: function render(data) {
                var start = data.page || 1;
                var html = $('<div></div>');
                
                // Create each category view
                main(function(items) {
                    items.forEach(function(item) {
                        var view = new CategoryView({
                            title: item.title,
                            url: item.url,
                            page: start,
                            total_pages: item.total_pages || 1,
                            type: item.type,
                            results: item.results,
                            category_id: item.type
                        });
                        
                        html.append(view.create());
                    });
                    
                    this.activity.loader(false);
                    this.activity.toggle();
                    
                }, function() {
                    html.append('<div class="empty-list" style="margin-top:5em;text-align:center">' + getTranslatedTitle('error') + '</div>');
                    this.activity.loader(false);
                    this.activity.toggle();
                }.bind(this));
                
                return html;
            },
        };
        
        Lampa.Component.add('trailers', plugin);
        
        // Add to menu
        Lampa.Menu.follow('main', function(model) {
            var favoritesItem = model.find(function(item) {
                return item.id === 'favorites';
            });
            
            var index = model.indexOf(favoritesItem);
            if (index >= 0) {
                model.splice(index + 1, 0, {
                    id: 'trailers',
                    title: getTranslatedTitle('trailers'),
                    component: 'trailers',
                    icon: plugin.icon
                });
            } else {
                model.push({
                    id: 'trailers',
                    title: getTranslatedTitle('trailers'),
                    component: 'trailers',
                    icon: plugin.icon
                });
            }
        });
    }

    // Start the plugin
    if (window.appready) {
        startPlugin();
    } else {
        document.addEventListener('app:ready', startPlugin);
    }
})();
