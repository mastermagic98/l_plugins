(function () {
    'use strict';
    // Версія 1.48: Виправлення накопичення даних для "У прокаті" при пагінації

    // [Попередній код залишається без змін до функції full]

    function full(params, oncomplite, onerror) {
        if (params.type === 'in_theaters') {
            var region = getRegion();
            var today = new Date();
            var daysThreshold = 45;
            var startDate = new Date(today.getTime() - daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            var targetCards = 20; // Кількість карток на сторінку
            var accumulatedResults = []; // Локальний масив для накопичення
            var loadedPages = new Set();
            var currentPage = 1; // Починаємо з першої сторінки
            var maxPages = 30; // Максимальна кількість сторінок із TMDB
            var totalPagesFromFirstResponse = 0;

            // Перевіряємо кеш
            var cachedData = categoryCache['in_theaters'] || Lampa.Storage.get('trailer_category_cache_in_theaters', null);
            if (cachedData && cachedData.results) {
                accumulatedResults = cachedData.results;
                var startIdx = (params.page - 1) * targetCards;
                var endIdx = Math.min(params.page * targetCards, accumulatedResults.length); // Обмежуємо endIdx
                var pageResults = accumulatedResults.slice(startIdx, endIdx);
                var result = {
                    dates: { maximum: today.toISOString().split('T')[0], minimum: startDate },
                    page: params.page,
                    results: pageResults,
                    total_pages: Math.ceil(accumulatedResults.length / targetCards) || 1,
                    total_results: accumulatedResults.length
                };
                if (pageResults.length > 0 || params.page <= Math.ceil(accumulatedResults.length / targetCards)) {
                    console.log(`Використовуємо кеш для сторінки ${params.page}:`, result);
                    oncomplite(result);
                    return;
                }
                // Якщо кеш не містить достатньо даних, продовжуємо завантаження
                currentPage = Math.max(params.page, 1); // Починаємо з запитуваної сторінки
            }

            function fetchNextPage() {
                if (loadedPages.has(currentPage) || currentPage > maxPages || (totalPagesFromFirstResponse && currentPage > totalPagesFromFirstResponse)) {
                    console.log('All relevant pages loaded or limit reached, finalizing with:', accumulatedResults.length, 'cards');
                    finalizeResults();
                    return;
                }

                loadedPages.add(currentPage);
                getLocalMoviesInTheaters(currentPage, function (result) {
                    if (result && result.results && result.results.length) {
                        console.log('Full results for in_theaters, page ' + currentPage + ':', result);
                        accumulatedResults = accumulatedResults.concat(result.results); // Накопичуємо результати
                        if (currentPage === 1) {
                            totalPagesFromFirstResponse = result.total_pages || maxPages;
                        }

                        // Перевіряємо, чи достатньо карток для поточної сторінки
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
                var endIdx = Math.min(params.page * targetCards, finalResults.length); // Обмежуємо endIdx
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
        } else {
            // [Попередня логіка для інших типів залишається без змін]
        }
    }

    // [Залишок коду залишається без змін]
})();
