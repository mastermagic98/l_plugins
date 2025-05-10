(function () {
    'use strict';
    // Версія 1.49: Виправлення відображення карток на сторінці "Ще в прокаті"

    // [Попередній код до функції full залишається без змін]

    function full(params, oncomplite, onerror) {
        if (params.type === 'in_theaters') {
            var region = getRegion();
            var today = new Date();
            var daysThreshold = 45;
            var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            var targetCards = 20; // Кількість карток на сторінку
            var accumulatedResults = [];
            var loadedPages = new Set();
            var currentPage = 1; // Завжди починаємо з першої сторінки, якщо кеш не містить потрібних даних
            var maxPages = 30; // Максимальна кількість сторінок із TMDB
            var totalPagesFromFirstResponse = 0;

            // Перевіряємо кеш
            var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
            if (cachedData && cachedData.results) {
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
                // Якщо в кеші достатньо даних для запитуваної сторінки, повертаємо результат
                if (accumulatedResults.length >= startIdx) {
                    console.log(`Використовуємо кеш для сторінки ${params.page}:`, result);
                    oncomplite(result);
                    return;
                }
                // Якщо даних у кеші недостатньо, починаємо завантаження з останньої завантаженої сторінки
                currentPage = Math.ceil(accumulatedResults.length / targetCards) + 1;
            }

            function fetchNextPage() {
                // Перевіряємо, чи потрібно завантажувати наступну сторінку
                if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                    console.log('All relevant pages loaded or limit reached, finalizing with:', accumulatedResults.length, 'cards');
                    finalizeResults();
                    return;
                }

                loadedPages.add(currentPage);
                getLocalMoviesInTheaters(currentPage, function (result) {
                    if (result && result.results && result.results.length) {
                        console.log('Full results for in_theaters, page ' + currentPage + ':', result);
                        accumulatedResults = accumulatedResults.concat(result.results); // Додаємо нові результати
                        if (currentPage === 1) {
                            totalPagesFromFirstResponse = result.total_pages || maxPages;
                        }

                        // Перевіряємо, чи достатньо карток для запитуваної сторінки
                        var startIdx = (params.page - 1) * targetCards;
                        var endIdx = Math.min(params.page * targetCards, accumulatedResults.length);
                        if (accumulatedResults.length >= startIdx + 1 || currentPage >= totalPagesFromFirstResponse || currentPage >= maxPages) {
                            finalizeResults();
                        } else {
                            currentPage++;
                            fetchNextPage();
                        }
                    } else {
                        console.log('Full: No results for in_theaters, page:', currentPage, 'but continuing to next page if within limits');
                        if (currentPage < totalPagesFromFirstResponse && currentPage < maxPages) {
                            currentPage++;
                            fetchNextPage();
                        } else {
                            finalizeResults();
                        }
                    }
                }, function (error) {
                    console.log('Full error for in_theaters:', params.url, error, 'Full Error:', JSON.stringify(error));
                    onerror();
                });
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
                    results: pageResults,
                    total_pages: Math.ceil(finalResults.length / targetCards) || 1,
                    total_results: finalResults.length
                };
                // Зберігаємо в кеш
                categoryCache['in_theaters'] = {
                    results: finalResults,
                    timestamp: Date.now()
                };
                Lampa.Storage.set('trailer_category_cache_in_theaters', categoryCache['in_theaters']);
                console.log(`Фіналізовано для сторінки ${params.page}:`, result);
                oncomplite(result);
            }

            fetchNextPage();
        } else if (params.type === 'new_series_seasons') {
            var threeMonthsAgo = getFormattedDate(90);
            var threeMonthsLater = getFormattedDate(-90);

            // Перевіряємо кеш
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
                    // Зберігаємо в кеш
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
                    console.log('Full results for new_series_seasons:', result);
                    oncomplite(result);
                } else {
                    console.log('Full: No results for new_series_seasons, page:', params.page);
                    onerror();
                }
            }, function (error) {
                console.log('Full error for new_series_seasons:', params.url, error, 'Full Error:', JSON.stringify(error));
                onerror();
            });
        } else if (params.type === 'upcoming_series') {
            var today = getFormattedDate(0);
            var sixMonthsLater = getFormattedDate(-180);

            // Перевіряємо кеш
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
                    // Зберігаємо в кеш
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
                    console.log('Full results for upcoming_series:', result);
                    oncomplite(result);
                } else {
                    console.log('Full: No results for upcoming_series, page:', params.page);
                    onerror();
                }
            }, function (error) {
                console.log('Full error for upcoming_series:', params.url, error, 'Full Error:', JSON.stringify(error));
                onerror();
            });
        } else {
            // Перевіряємо кеш для інших категорій
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
                    // Зберігаємо в кеш
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
                    console.log('Full results:', result);
                    oncomplite(result);
                } else {
                    console.log('Full: No results for', params.url);
                    onerror();
                }
            }, function (error) {
                console.log('Full error:', params.url, error, 'Full Error:', JSON.stringify(error));
                onerror();
            });
        }
    }

    // [Решта коду залишається без змін]

})();
