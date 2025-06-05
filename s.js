(function() {
    'use strict';

    // Полифилл для Promise (минимальная реализация)
    (function() {
        if (typeof window.Promise === 'function') return;
        function Promise(executor) {
            var self = this;
            self.status = 'pending';
            self.value = undefined;
            self.onResolved = [];
            self.onRejected = [];
            function resolve(value) {
                if (self.status === 'pending') {
                    self.status = 'resolved';
                    self.value = value;
                    for (var i = 0; i < self.onResolved.length; i++) {
                        self.onResolved[i](value);
                    }
                }
            }
            function reject(reason) {
                if (self.status === 'pending') {
                    self.status = 'rejected';
                    self.value = reason;
                    for (var i = 0; i < self.onRejected.length; i++) {
                        self.onRejected[i](reason);
                    }
                }
            }
            try {
                executor(resolve, reject);
            } catch (e) {
                reject(e);
            }
        }
        Promise.prototype.then = function(onResolved, onRejected) {
            var self = this;
            return new Promise(function(resolve, reject) {
                function handle(value) {
                    try {
                        var result = onResolved ? onResolved(value) : value;
                        if (result && typeof result.then === 'function') {
                            result.then(resolve, reject);
                        } else {
                            resolve(result);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
                function handleReject(reason) {
                    if (onRejected) {
                        try {
                            var result = onRejected(reason);
                            resolve(result);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(reason);
                    }
                }
                if (self.status === 'resolved') {
                    setTimeout(function() { handle(self.value); }, 0);
                } else if (self.status === 'rejected') {
                    setTimeout(function() { handleReject(self.value); }, 0);
                } else {
                    self.onResolved.push(handle);
                    self.onRejected.push(handleReject);
                }
            });
        };
        Promise.prototype.catch = function(onRejected) {
            return this.then(null, onRejected);
        };
        Promise.resolve = function(value) {
            return new Promise(function(resolve) { resolve(value); });
        };
        Promise.reject = function(reason) {
            return new Promise(function(resolve, reject) { reject(reason); });
        };
        window.Promise = Promise;
    })();

    // Полифилл для fetch (на основе XMLHttpRequest)
    (function() {
        if (typeof window.fetch === 'function') return;
        window.fetch = function(url, options) {
            options = options || {};
            var method = (options.method || 'GET').toUpperCase();
            if (method !== 'GET') {
                throw new Error('Polyfill supports only GET requests');
            }
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                if (options.headers) {
                    for (var header in options.headers) {
                        if (options.headers.hasOwnProperty(header)) {
                            xhr.setRequestHeader(header, options.headers[header]);
                        }
                    }
                }
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var response = {
                            status: xhr.status,
                            ok: xhr.status >= 200 && xhr.status < 300,
                            json: function() {
                                return new Promise(function(res, rej) {
                                    try {
                                        res(JSON.parse(xhr.responseText));
                                    } catch (e) {
                                        rej(e);
                                    }
                                });
                            }
                        };
                        if (response.ok) {
                            resolve(response);
                        } else {
                            reject(new Error('HTTP error ' + xhr.status));
                        }
                    }
                };
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                xhr.send();
            });
        };
    })();

    var config = {
        cacheTTL: 48 * 60 * 60 * 1000,
        tmdbApiKey: 'тмдб apikey сюда',
        tmdbBaseUrl: 'https://api.themoviedb.org/3',
        apiLanguage: 'ru-RU',
        maxRetries: 3,
        retryDelay: 2000,
        maxConcurrentRequests: 3,
        imageLoadTimeout: 5000,
        recentEpisodeThreshold: 30 * 86400 * 1000,
        rescanInterval: 15000,
        debug: true
    };

    function log(message) {
        if (config.debug) {
            console.log.apply(console, arguments);
        }
    }

    var pluginState = {
        observer: null,
        initialScanTimer: null,
        periodicRescanTimer: null,
        styleTagAdded: false
    };

    var cache = {
        data: {},
        titleSearch: {},
        processedCards: {},
        get: function(key) {
            var item = this.data[key];
            if (item && Date.now() - item.timestamp < config.cacheTTL) {
                return item.data;
            }
            if (item) {
                delete this.data[key];
            }
            return null;
        },
        set: function(key, data) {
            var cacheData = { data: data, timestamp: Date.now() };
            this.data[key] = cacheData;
            if (Object.keys(this.data).length > 1000) {
                var oldestKey = Object.keys(this.data).sort(function(a, b) {
                    return cache.data[a].timestamp - cache.data[b].timestamp;
                })[0];
                delete this.data[oldestKey];
                sessionStorage.removeItem('series_label_' + oldestKey);
            }
            try {
                sessionStorage.setItem('series_label_' + key, JSON.stringify(cacheData));
            } catch (e) {
                console.warn('Failed to save to sessionStorage:', key, e);
            }
        },
        getTitleSearch: function(title) {
            var item = this.titleSearch[title];
            if (item && Date.now() - item.timestamp < config.cacheTTL) {
                return { tmdbId: item.tmdbId, type: item.type };
            }
            if (item) {
                delete this.titleSearch[title];
            }
            return null;
        },
        setTitleSearch: function(title, tmdbId, type) {
            var cacheData = { tmdbId: tmdbId, type: type, timestamp: Date.now() };
            this.titleSearch[title] = cacheData;
            try {
                sessionStorage.setItem('series_title_' + title, JSON.stringify(cacheData));
            } catch (e) {
                console.warn('Failed to save title search to sessionStorage:', title, e);
            }
        },
        markCardProcessed: function(cardId) {
            this.processedCards[cardId] = Date.now();
            var self = this;
            setTimeout(function() {
                delete self.processedCards[cardId];
            }, 30000);
        },
        isCardProcessed: function(cardId) {
            return this.processedCards.hasOwnProperty(cardId);
        },
        loadFromStorage: function() {
            try {
                for (var i = sessionStorage.length - 1; i >= 0; i--) {
                    var key = sessionStorage.key(i);
                    if (key.indexOf('series_label_') === 0 || key.indexOf('series_title_') === 0) {
                        var item = JSON.parse(sessionStorage.getItem(key));
                        if (item && Date.now() - item.timestamp < config.cacheTTL) {
                            if (key.indexOf('series_label_') === 0) {
                                this.data[key.replace('series_label_', '')] = item;
                            } else {
                                this.titleSearch[key.replace('series_title_', '')] = item;
                            }
                        } else {
                            sessionStorage.removeItem(key);
                        }
                    }
                }
            } catch (e) {
                console.warn('Failed to load from sessionStorage:', e);
            }
        },
        clearProcessedCards: function() {
            this.processedCards = {};
        }
    };

    cache.loadFromStorage();

    var requestQueue = {
        queue: [],
        activeRequests: 0,
        add: function(task) {
            this.queue.push(task);
            this.process();
        },
        process: function() {
            var self = this;
            if (self.activeRequests >= config.maxConcurrentRequests || !self.queue.length) {
                return;
            }
            self.activeRequests++;
            var task = self.queue.shift();
            task().then(function() {
                self.activeRequests--;
                self.process();
            }).catch(function(e) {
                console.error('Error during task execution in queue:', e);
                self.activeRequests--;
                self.process();
            });
        }
    };

    function debouncedProcessCard(card) {
        requestQueue.add(function() {
            return processCard(card);
        });
    }

    function waitLampa(attempts) {
        if (typeof attempts === 'undefined') {
            attempts = 20;
        }
        if (window.Lampa && window.Lampa.Platform) {
            initPlugin();
        } else if (attempts > 0) {
            setTimeout(function() {
                waitLampa(attempts - 1);
            }, 500);
        } else {
            console.error('Lampa platform not found after maximum attempts');
        }
    }

    function initPlugin() {
        if (pluginState.observer) {
            pluginState.observer.disconnect();
            pluginState.observer = null;
        }
        if (pluginState.initialScanTimer) {
            clearTimeout(pluginState.initialScanTimer);
            pluginState.initialScanTimer = null;
        }
        if (pluginState.periodicRescanTimer) {
            clearInterval(pluginState.periodicRescanTimer);
            pluginState.periodicRescanTimer = null;
        }

        if (window.Lampa && Lampa.Platform) {
            Lampa.Platform.tv();
        }
        cache.clearProcessedCards();

        if (!pluginState.styleTagAdded) {
            var styleTag = document.createElement('style');
            styleTag.id = "series-label-plugin-styles";
            styleTag.innerHTML = '.series-label-plugin {' +
                'position: absolute;' +
                'top: 2%;' +
                'right: 2%;' +
                'color: white;' +
                'padding: 0.3em 0.6em;' +
                'font-size: 1vmin;' +
                'border-radius: 0.3em;' +
                'z-index: 100;' +
                'font-weight: bold;' +
                'text-shadow: 0.1em 0.1em 0.2em rgba(0,0,0,0.7);' +
                'box-shadow: 0 0.2em 0.5em rgba(0,0,0,0.3);' +
                'line-height: 1.2;' +
                'white-space: nowrap;' +
            '}' +
            '.series-label-plugin.awaiting { background-color: #4caf50; }' +
            '.series-label-plugin.ended { background-color: #f44336; }' +
            '.series-label-plugin.upcoming { background-color: #ffeb3b; color: black; }' +
            '@media screen and (max-width: 600px) {' +
                '.series-label-plugin {' +
                    'font-size: 0.9vmin;' +
                    'padding: 0.2em 0.5em;' +
                    'top: 1%;' +
                    'right: 1%;' +
                '}' +
            '}' +
            '@media screen and (min-width: 601px) and (max-width: 1024px) {' +
                '.series-label-plugin {' +
                    'font-size: 1vmin;' +
                    'padding: 0.3em 0.6em;' +
                '}' +
            '}' +
            '@media screen and (min-width: 1025px) {' +
                '.series-label-plugin {' +
                    'font-size: 1.1vmin;' +
                    'padding: 0.4em 0.7em;' +
                '}' +
            '}';
            document.head.appendChild(styleTag);
            pluginState.styleTagAdded = true;
        }

        setupObserver();
    }

    function parseDate(dateStr) {
        if (!dateStr) {
            return null;
        }
        try {
            var months = {
                'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
                'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
                'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12'
            };
            var date;
            var isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
                date = new Date(isoMatch[1] + '-' + isoMatch[2] + '-' + isoMatch[3] + 'T00:00:00Z');
            } else {
                var ruMatch = dateStr.match(/(\d+)\s+([а-я]+)\s*(\d{4})?/i);
                if (ruMatch) {
                    var day = ruMatch[1].length === 1 ? '0' + ruMatch[1] : ruMatch[1];
                    var month = months[ruMatch[2].toLowerCase()];
                    var year = ruMatch[3] || new Date().getFullYear();
                    if (month) {
                        date = new Date(year + '-' + month + '-' + day + 'T00:00:00Z');
                    }
                }
            }
            return (!date || isNaN(date.getTime())) ? null : date;
        } catch (e) {
            return null;
        }
    }

    function calculateDaysUntil(dateStr) {
        var date = parseDate(dateStr);
        if (!date) {
            return null;
        }
        var today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        var diffTime = date.getTime() - today.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
    }

    function calculateDaysSince(dateStr) {
        var date = parseDate(dateStr);
        if (!date) {
            return null;
        }
        var today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        var diffTime = today.getTime() - date.getTime();
        return diffTime < 0 ? null : Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    function createLabel(text, status) {
        var label = document.createElement('div');
        label.className = 'series-label-plugin ' + status;
        label.textContent = text;
        return label;
    }

    function searchTmdbByTitle(title, preferSeries, year) {
        var cachedResult = cache.getTitleSearch(title);
        if (cachedResult) {
            return Promise.resolve(cachedResult);
        }

        var url = config.tmdbBaseUrl + '/search/multi?api_key=' + config.tmdbApiKey + '&language=' + config.apiLanguage + '&query=' + encodeURIComponent(title) + '&include_adult=false';
        if (year) {
            url += '&primary_release_year=' + year;
        }
        return fetch(url).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            return response.json();
        }).then(function(data) {
            if (data.results && data.results.length > 0) {
                var results = data.results.filter(function(item) {
                    return item.media_type === 'tv' || item.media_type === 'movie';
                });
                var match = results.filter(function(item) {
                    return (item.title && item.title.toLowerCase() === title.toLowerCase() || item.name && item.name.toLowerCase() === title.toLowerCase()) &&
                                 (!year || (item.release_date && item.release_date.indexOf(year) === 0 || item.first_air_date && item.first_air_date.indexOf(year) === 0));
                })[0] || (preferSeries && results.filter(function(item) {
                    return item.media_type === 'tv' &&
                                 (item.name && item.name.toLowerCase().indexOf(title.toLowerCase()) !== -1 || item.original_name && item.original_name.toLowerCase().indexOf(title.toLowerCase()) !== -1) &&
                                 (!year || item.first_air_date && item.first_air_date.indexOf(year) === 0);
                })[0]) || results.filter(function(item) {
                    return (item.name && item.name.toLowerCase().indexOf(title.toLowerCase()) !== -1 || item.original_name && item.original_name.toLowerCase().indexOf(title.toLowerCase()) !== -1 ||
                                  item.title && item.title.toLowerCase().indexOf(title.toLowerCase()) !== -1 || item.original_title && item.original_title.toLowerCase().indexOf(title.toLowerCase()) !== -1) &&
                                 (!year || (item.release_date && item.release_date.indexOf(year) === 0 || item.first_air_date && item.first_air_date.indexOf(year) === 0));
                })[0];

                if (match) {
                    var type = match.media_type;
                    cache.setTitleSearch(title, match.id, type);
                    return { tmdbId: match.id, type: type };
                }
                cache.setTitleSearch(title, null, 'movie');
                return { tmdbId: null, type: 'movie' };
            }
            cache.setTitleSearch(title, null, 'movie');
            return { tmdbId: null, type: 'movie' };
        }).catch(function(e) {
            cache.setTitleSearch(title, null, 'movie');
            return { tmdbId: null, type: 'movie' };
        });
    }

    function getTmdbEpisodeData(tmdbId) {
        var cachedData = cache.get('tv_' + tmdbId);
        if (cachedData) {
            return Promise.resolve(cachedData);
        }

        var url = config.tmdbBaseUrl + '/tv/' + tmdbId + '?api_key=' + config.tmdbApiKey + '&language=' + config.apiLanguage + '&append_to_response=next_episode_to_air,last_episode_to_air';
        return fetch(url).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            return response.json();
        }).then(function(data) {
            if (data.status === "Ended" || data.status === "Canceled") {
                var result = { status: 'ended' };
                cache.set('tv_' + tmdbId, result);
                return result;
            }

            if (data.next_episode_to_air && data.next_episode_to_air.air_date) {
                var nextAirDate = parseDate(data.next_episode_to_air.air_date);
                var daysUntilNext = calculateDaysUntil(data.next_episode_to_air.air_date);
                if (nextAirDate && daysUntilNext !== null) {
                    var result = { status: 'upcoming', date: data.next_episode_to_air.air_date, parsedDate: nextAirDate, days: daysUntilNext };
                    cache.set('tv_' + tmdbId, result);
                    return result;
                }
            }

            if (data.in_production || data.status === "Returning Series") {
                var lastAiredDateStr = data.last_episode_to_air && data.last_episode_to_air.air_date || data.last_air_date;
                if (lastAiredDateStr) {
                    var daysSinceLast = calculateDaysSince(lastAiredDateStr);
                    if (daysSinceLast !== null && daysSinceLast < (config.recentEpisodeThreshold / (86400 * 1000))) {
                        var result = { status: 'awaiting', lastEpisodeDate: lastAiredDateStr };
                        cache.set('tv_' + tmdbId, result);
                        return result;
                    }
                }
                var result = { status: 'awaiting_unknown' };
                cache.set('tv_' + tmdbId, result);
                return result;
            }

            if ((data.status === "Planned" || data.status === "Pilot") && data.first_air_date) {
                var firstAirDate = parseDate(data.first_air_date);
                var daysUntilFirst = calculateDaysUntil(data.first_air_date);
                if (firstAirDate && daysUntilFirst !== null && daysUntilFirst > 0) {
                    var result = { status: 'upcoming_first', date: data.first_air_date, parsedDate: firstAirDate, days: daysUntilFirst };
                    cache.set('tv_' + tmdbId, result);
                    return result;
                }
            }

            var result = { status: 'awaiting_unknown' };
            cache.set('tv_' + tmdbId, result);
            return result;
        }).catch(function(e) {
            return { status: 'error_fetching' };
        });
    }

    function waitForImageLoad(card, title) {
        var img = card.querySelector('img[data-src], img[src]');
        if (!img) {
            return Promise.resolve(true);
        }
        var src = img.dataset && img.dataset.src || img.src;
        if (src && src.indexOf('img_load.svg') === -1 && img.complete && img.naturalHeight !== 0) {
            return Promise.resolve(true);
        }

        return new Promise(function(resolve) {
            var timeout = setTimeout(function() {
                resolve(true);
            }, config.imageLoadTimeout);
            function listener() {
                clearTimeout(timeout);
                img.removeEventListener('load', listener);
                img.removeEventListener('error', errorListener);
                resolve(true);
            }
            function errorListener() {
                clearTimeout(timeout);
                img.removeEventListener('load', listener);
                img.removeEventListener('error', errorListener);
                resolve(true);
            }
            img.addEventListener('load', listener);
            img.addEventListener('error', errorListener);
        });
    }

    function getCardData(card) {
        var tmdbId = card.dataset && (card.dataset.id || card.dataset.tmdb_id || card.dataset.tmdb ||
            card.dataset.series_id || card.dataset.media_id || card.dataset.content_id);
        var type = card.dataset && card.dataset.type;
        var titleElement = card.querySelector('.card__title, .card__name');
        var title = titleElement && titleElement.textContent && titleElement.textContent.trim();
        var yearElement = card.querySelector('.card__year, .card__age');
        var year = yearElement && yearElement.textContent && yearElement.textContent.trim().match(/\d{4}/) && yearElement.textContent.trim().match(/\d{4}/)[0];

        var jsonDataAttr = card.dataset && card.dataset.json;
        if (!tmdbId && card.getAttribute) {
            tmdbId = tmdbId || card.getAttribute('data-id') || card.getAttribute('data-tmdb_id') ||
                     card.getAttribute('data-tmdb') || card.getAttribute('data-series_id') ||
                     card.getAttribute('data-media_id') || card.getAttribute('data-content_id');
        }
        if (!type && card.getAttribute) {
            type = card.getAttribute('data-type');
        }
        if (jsonDataAttr) {
            try {
                var jsonData = JSON.parse(jsonDataAttr);
                if (jsonData.id && !tmdbId) {
                    tmdbId = String(jsonData.id);
                }
                if (jsonData.media_type && !type) {
                    type = jsonData.media_type;
                }
                if (jsonData.name && !title) {
                    title = jsonData.name;
                }
                if (jsonData.first_air_date && !year) {
                    year = jsonData.first_air_date.substring(0,4);
                }
                if (jsonData.release_date && !year) {
                    year = jsonData.release_date.substring(0,4);
                }
            } catch (e) {}
        }

        var cardIdForProcessedSet = tmdbId || (title + '_' + year) || String(Math.random()).slice(2);
        if (!type) {
            if ((card.className.indexOf('card--tv') !== -1 || card.className.indexOf('card--serial') !== -1 ||
                card.className.indexOf('card--series') !== -1 || card.querySelector('.card__serial, .card__tv, .card__series'))) {
                type = 'tv';
            } else if (card.className.indexOf('card--movie') !== -1 || card.querySelector('.card__movie')) {
                type = 'movie';
            }
        }
        return { tmdbId: tmdbId, type: type, title: title, cardId: cardIdForProcessedSet, year: year };
    }

    function fetchWithRetry(url, options, retries) {
        options = options || {};
        retries = retries || config.maxRetries;
        var attempt = 1;

        function attemptFetch() {
            return fetch(url, options).then(function(response) {
                if (!response.ok) {
                    if (response.status === 404 || response.status === 401) {
                        throw new Error('HTTP error ' + response.status);
                    }
                    throw new Error('HTTP error ' + response.status);
                }
                return response.json();
            }).catch(function(e) {
                if (attempt === retries || e.message.indexOf('404') !== -1 || e.message.indexOf('401') !== -1) {
                    throw e;
                } else {
                    attempt++;
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(attemptFetch());
                        }, config.retryDelay * attempt);
                    });
                }
            });
        }

        return attemptFetch();
    }

    function restoreLabelFromCache(card, tmdbId, title) {
        var tmdbData = cache.get('tv_' + tmdbId);
        if (tmdbData && tmdbData.status !== 'error_fetching') {
            var labelText = null;
            var labelStatus = 'awaiting';
            if (tmdbData.status === 'ended') {
                labelText = 'Завершён';
                labelStatus = 'ended';
            } else if (tmdbData.status === 'upcoming' || tmdbData.status === 'upcoming_first') {
                if (tmdbData.days !== null) {
                    if (tmdbData.days === 0) {
                        labelText = 'Серия сегодня';
                    } else if (tmdbData.days === 1) {
                        labelText = 'Серия завтра';
                    } else {
                        labelText = 'Серия через ' + tmdbData.days + ' ' + (tmdbData.days >= 2 && tmdbData.days <= 4 ? 'дня' : 'дней');
                    }
                    labelStatus = 'upcoming';
                }
            } else if (tmdbData.status === 'awaiting') {
                var daysSince = tmdbData.lastEpisodeDate ? calculateDaysSince(tmdbData.lastEpisodeDate) : null;
                labelText = daysSince !== null ? daysSince + ' дн. назад' : 'Нет инф.';
                labelStatus = 'awaiting';
            } else if (tmdbData.status === 'awaiting_unknown') {
                labelText = 'Нет инф.';
                labelStatus = 'awaiting';
            }
            if (labelText) {
                applyLabelToCard(card, labelText, labelStatus);
                card.className = card.className + ' series-label-processed-by-plugin';
                return true;
            }
        }
        return false;
    }

    function processCard(card) {
        if (!card || !card.className) {
            console.warn('Invalid card:', card);
            return Promise.resolve();
        }

        var cardData = getCardData(card);
        var tmdbId = cardData.tmdbId;
        var type = cardData.type;
        var title = cardData.title;
        var cardId = cardData.cardId;
        var year = cardData.year;

        if (card.querySelector('.series-label-plugin') && card.className.indexOf('series-label-processed-by-plugin') === -1) {
            card.className = card.className + ' series-label-processed-by-plugin';
            return Promise.resolve();
        }

        if (cache.isCardProcessed(cardId)) {
            if (!card.querySelector('.series-label-plugin') && tmdbId && type === 'tv') {
                return restoreLabelFromCache(card, tmdbId, title).then(function(result) {
                    return Promise.resolve();
                });
            }
            return Promise.resolve();
        }

        cache.markCardProcessed(cardId);
        return waitForImageLoad(card, title).then(function() {
            var preferSeries = type === 'tv' || (!type && (card.className.indexOf('card--tv') !== -1 || card.className.indexOf('card--serial') !== -1));
            if (!tmdbId && title) {
                return searchTmdbByTitle(title, preferSeries, year).then(function(searchResult) {
                    tmdbId = searchResult.tmdbId;
                    if (!type) {
                        type = searchResult.type;
                    }
                    return continueProcessing();
                });
            } else if (tmdbId && !type && title) {
                return searchTmdbByTitle(title, preferSeries, year).then(function(searchResult) {
                    if (searchResult && searchResult.tmdbId == tmdbId) {
                        type = searchResult.type;
                    } else if (!type) {
                        type = preferSeries ? 'tv' : 'movie';
                    }
                    return continueProcessing();
                });
            } else {
                return continueProcessing();
            }

            function continueProcessing() {
                if (!tmdbId || type !== 'tv') {
                    card.className = card.className + ' series-label-processed-by-plugin';
                    return Promise.resolve();
                }

                return getTmdbEpisodeData(tmdbId).then(function(tmdbData) {
                    if (tmdbData && tmdbData.status !== 'error_fetching') {
                        var labelText = null;
                        var labelStatus = 'awaiting';
                        if (tmdbData.status === 'ended') {
                            labelText = 'Завершён';
                            labelStatus = 'ended';
                        } else if (tmdbData.status === 'upcoming' || tmdbData.status === 'upcoming_first') {
                            if (tmdbData.days !== null) {
                                if (tmdbData.days === 0) {
                                    labelText = 'Серия сегодня';
                                } else if (tmdbData.days === 1) {
                                    labelText = 'Серия завтра';
                                } else {
                                    labelText = 'Серия через ' + tmdbData.days + ' ' + (tmdbData.days >= 2 && tmdbData.days <= 4 ? 'дня' : 'дней');
                                }
                                labelStatus = 'upcoming';
                            }
                        } else if (tmdbData.status === 'awaiting') {
                            var daysSince = tmdbData.lastEpisodeDate ? calculateDaysSince(tmdbData.lastEpisodeDate) : null;
                            labelText = daysSince !== null ? daysSince + ' дн. назад' : 'Нет инф.';
                            labelStatus = 'awaiting';
                        } else if (tmdbData.status === 'awaiting_unknown') {
                            labelText = 'Нет инф.';
                            labelStatus = 'awaiting';
                        }
                        if (labelText) {
                            applyLabelToCard(card, labelText, labelStatus);
                        }
                    }
                    card.className = card.className + ' series-label-processed-by-plugin';
                });
            }
        });
    }

    function applyLabelToCard(card, text, status) {
        log('Applying label to card:', { text: text, status: status, cardId: getCardData(card).cardId });
        var view = card.querySelector('.card__view');
        if (!view) {
            console.warn('No .card__view found, appending to:', card.querySelector('.card__poster, .card__img') && card.querySelector('.card__poster, .card__img').className || 'card root');
            var labelContainer = card.querySelector('.card__poster, .card__img') || card;
            if (getComputedStyle(labelContainer).position === 'static') {
                labelContainer.style.position = 'relative';
            }
            labelContainer.appendChild(createLabel(text, status));
            return;
        }

        var existingLabel = view.querySelector('.series-label-plugin');
        if (existingLabel) {
            existingLabel.parentNode.removeChild(existingLabel);
        }
        if (getComputedStyle(view).position === 'static') {
            view.style.position = 'relative';
        }
        view.appendChild(createLabel(text, status));
    }

    function findCardsContainer() {
        var selectors = [
            '.cards', '.content__cards', '.scroll__content', '.content .scroll__content',
            '.selector .scroll__content', '.content__items', '.items', '.catalog__content', '.grid__content'
        ];
        for (var i = 0; i < selectors.length; i++) {
            var container = document.querySelector(selectors[i]);
            if (container && container.querySelector('.card')) {
                return container;
            }
        }
        return document.body;
    }

    function setupObserver() {
        if (pluginState.observer) {
            pluginState.observer.disconnect();
        }

        var cardsContainer = findCardsContainer();
        console.log('Cards container:', cardsContainer);
        pluginState.observer = new MutationObserver(function(mutations) {
            console.log('MutationObserver triggered with', mutations.length, 'mutations');
            var cardsToProcess = {};
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.matches && node.matches('.card')) {
                                var cardId = node.dataset && node.dataset.id || String(Math.random()).slice(2);
                                cardsToProcess[cardId] = node;
                            } else if (node.querySelectorAll) {
                                var cards = node.querySelectorAll('.card');
                                for (var j = 0; j < cards.length; j++) {
                                    var cardId = cards[j].dataset && cards[j].dataset.id || String(Math.random()).slice(2);
                                    cardsToProcess[cardId] = cards[j];
                                }
                            }
                        }
                    }
                }
            });

            var cardsArray = [];
            for (var key in cardsToProcess) {
                if (cardsToProcess.hasOwnProperty(key)) {
                    cardsArray.push(cardsToProcess[key]);
                }
            }
            console.log('Cards to process:', cardsArray.length);
            if (cardsArray.length > 0) {
                cardsArray.forEach(function(card) {
                    if (!card.querySelector('.series-label-plugin') && card.className.indexOf('series-label-processed-by-plugin') === -1) {
                        debouncedProcessCard(card);
                    }
                });
            }
        });

        pluginState.observer.observe(cardsContainer, {
            childList: true,
            subtree: true
        });

        if (pluginState.initialScanTimer) {
            clearTimeout(pluginState.initialScanTimer);
        }
        pluginState.initialScanTimer = setTimeout(function() {
            var cards = cardsContainer.querySelectorAll('.card');
            var visibleCards = Array.prototype.filter.call(cards, function(card) {
                var rect = card.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            });
            console.log('Initial scan: processing', visibleCards.length, 'visible cards');
            for (var i = 0; i < visibleCards.length; i++) {
                (function(index) {
                    setTimeout(function() {
                        debouncedProcessCard(visibleCards[index]);
                    }, 100 * index);
                })(i);
            }
        }, 2000);

        if (pluginState.periodicRescanTimer) {
            clearInterval(pluginState.periodicRescanTimer);
        }
        pluginState.periodicRescanTimer = setInterval(function() {
            var cards = cardsContainer.querySelectorAll('.card:not(.series-label-processed-by-plugin)');
            cards = Array.prototype.filter.call(cards, function(card) {
                return !card.querySelector('.series-label-plugin');
            });
            var visibleCards = [];
            for (var i = 0; i < cards.length; i++) {
                var rect = cards[i].getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    visibleCards.push(cards[i]);
                }
            }
            if (visibleCards.length > 0) {
                console.log('Periodic scan: processing', visibleCards.length, 'visible cards');
                for (var i = 0; i < visibleCards.length; i++) {
                    (function(index) {
                        setTimeout(function() {
                            debouncedProcessCard(visibleCards[index]);
                        }, 100 * index);
                    })(i);
                }
            }
        }, config.rescanInterval);
    }

    setTimeout(waitLampa, 300);
})();