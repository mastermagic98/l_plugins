(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    var CONFIG = { 
        tmdbApiKey: '', 
        cacheTime: 23 * 60 * 60 * 1000, 
        language: 'uk',
        endpoint: 'https://wh.lme.isroot.in/',
        timeout: 10000,
        queue: { maxParallel: 10 }, 
        cache: {
            key: 'lme_wh_cache_v5', 
            size: 3000,
            positiveTtl: 1000 * 60 * 60 * 24,
            negativeTtl: 1000 * 60 * 60 * 6
        }
    };

    const PROXIES =[
        'https://cors.lampa.stream/',
        'https://my-finder.kozak-bohdan.workers.dev/?url=',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?url='
    ];

    var inflight = {};
    var lmeCache = null;
    var listCache = {};      
    var tmdbItemCache = {};  
    var itemUrlCache = {};   
    var seasonsCache = {};

    Lampa.Lang.add({
        main: 'Головна UA',
    title_main: 'Головна UA',
    title_tmdb: 'Головна UA'
    });

    var safeStorage = (function () {
        var memoryStore = {};
        try {
            if (typeof window.localStorage !== 'undefined') {
                var testKey = '__season_test_v5__';
                window.localStorage.setItem(testKey, '1');
                window.localStorage.removeItem(testKey);
                return window.localStorage;
            }
        } catch (e) {}
        return {
            getItem: function (k) { return memoryStore.hasOwnProperty(k) ? memoryStore[k] : null; },
            setItem: function (k, v) { memoryStore[k] = String(v); },
            removeItem: function (k) { delete memoryStore[k]; }
        };
    })();

    try { seasonsCache = JSON.parse(safeStorage.getItem('seasonBadgeCacheV5') || '{}'); } catch (e) {}

    function debounce(func, wait) {
        var timer;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { func.apply(context, args); }, wait);
        };
    }

    function Cache(config) {
        var self = this;
        var storage = {};
        function cleanupExpired() {
            var now = Date.now(), changed = false, keys = Object.keys(storage);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i], node = storage[key];
                if (!node || !node.timestamp || typeof node.value !== 'boolean') { delete storage[key]; changed = true; continue; }
                var ttl = node.value ? config.positiveTtl : config.negativeTtl;
                if (node.timestamp <= now - ttl) { delete storage[key]; changed = true; }
            }
            if (changed) self.save();
        }
        self.save = debounce(function () { Lampa.Storage.set(config.key, storage); }, 400);
        self.init = function () { storage = Lampa.Storage.get(config.key, {}) || {}; cleanupExpired(); };
        self.get = function (id) {
            var node = storage[id];
            if (!node || !node.timestamp || typeof node.value !== 'boolean') return null;
            var ttl = node.value ? config.positiveTtl : config.negativeTtl;
            if (node.timestamp > Date.now() - ttl) return node.value;
            delete storage[id]; self.save(); return null;
        };
        self.set = function (id, value) {
            cleanupExpired();
            storage[id] = { timestamp: Date.now(), value: !!value };
            self.save();
        };
    }

    var requestQueue = {
        activeCount: 0, queue:[], maxParallel: CONFIG.queue.maxParallel,
        add: function (task) { this.queue.push(task); this.process(); },
        process: function () {
            var _this = this;
            while (this.activeCount < this.maxParallel && this.queue.length) {
                var task = this.queue.shift(); this.activeCount++;
                Promise.resolve().then(task)["catch"](function () {})["finally"](function () { _this.activeCount--; _this.process(); });
            }
        }
    };

    async function fetchHtml(url) {
        for (let proxy of PROXIES) {
            try {
                let proxyUrl = proxy.includes('?url=') ? proxy + encodeURIComponent(url) : proxy + url;
                let res = await fetch(proxyUrl);
                if (res.ok) {
                    let text = await res.text();
                    if (text && text.length > 500 && text.includes('<html') && !text.includes('just a moment...')) {
                        return text;
                    }
                }
            } catch (e) {}
        }
        return '';
    }

    function getTmdbKey() {
        let custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || CONFIG.tmdbApiKey || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    function getTmdbEndpoint(path) {
        let url = Lampa.TMDB.api(path);
        if (!url.includes('api_key')) url += (url.includes('?') ? '&' : '?') + 'api_key=' + getTmdbKey();
        if (!url.startsWith('http')) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    function safeFetch(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest(); xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, json: function() { return Promise.resolve(JSON.parse(xhr.responseText)); } });
                    else reject(new Error('HTTP ' + xhr.status));
                }
            };
            xhr.onerror = function () { reject(new Error('Network error')); }; xhr.send(null);
        });
    }

    async function fetchTmdbWithFallback(type, id) {
        let endpoint = getTmdbEndpoint(`${type}/${id}?language=uk`);
        let res = await fetch(PROXIES[0] + endpoint).then(r=>r.json()).catch(()=>null);
        if (res && (!res.overview || res.overview.trim() === '')) {
            let enEndpoint = getTmdbEndpoint(`${type}/${id}?language=en`);
            let enRes = await fetch(PROXIES[0] + enEndpoint).then(r=>r.json()).catch(()=>null);
            if (enRes && enRes.overview) res.overview = enRes.overview;
        }
        return res;
    }

    function createMediaMeta(data) {
        var tmdbId = parseInt(data && data.id, 10);
        if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
        var mediaKind = String(data.media_type || '').toLowerCase();
        if (mediaKind !== 'tv' && mediaKind !== 'movie') {
            if (data.original_name || data.first_air_date || data.number_of_seasons) mediaKind = 'tv';
            else if (data.title || data.original_title || data.release_date) mediaKind = 'movie';
            else return null;
        }
        return { tmdbId: tmdbId, mediaKind: mediaKind, serial: mediaKind === 'tv' ? 1 : 0, cacheKey: mediaKind + ':' + tmdbId };
    }

    function isSuccessResponse(response) {
        if (response === true) return true;
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            if (response.error || response.status === 'error' || response.success === false || response.ok === false) return false;
            if (response.success === true || response.status === 'success' || response.ok === true) return true;
            return Object.keys(response).length > 0;
        }
        return false;
    }

    function loadFlag(meta) {
        if (!inflight[meta.cacheKey]) {
            inflight[meta.cacheKey] = new Promise(function (resolve) {
                requestQueue.add(function () {
                    var url = CONFIG.endpoint + '?tmdb_id=' + encodeURIComponent(meta.tmdbId) + '&serial=' + meta.serial + '&silent=true';
                    return new Promise(function (res) { Lampa.Network.silent(url, function (r) { res(isSuccessResponse(r)); }, function () { res(false); }, null, { timeout: CONFIG.timeout }); })
                    .then(function (isSuccess) { lmeCache.set(meta.cacheKey, isSuccess); resolve(isSuccess); })
                    .finally(function () { delete inflight[meta.cacheKey]; });
                });
            });
        }
        return inflight[meta.cacheKey];
    }

    function renderFlag(cardHtml) {
        var view = cardHtml.querySelector('.card__view');
        if (!view || view.querySelector('.card__ua_flag')) return;
        var badge = document.createElement('div');
        badge.className = 'card__ua_flag';
        view.appendChild(badge);
    }

    function fetchSeriesData(tmdbId) {
        return new Promise(function (resolve, reject) {
            var now = (new Date()).getTime();
            if (seasonsCache[tmdbId] && (now - seasonsCache[tmdbId].timestamp < CONFIG.cacheTime)) return resolve(seasonsCache[tmdbId].data);
            
            if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.tv === 'function') {
                Lampa.TMDB.tv(tmdbId, function (data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('seasonBadgeCacheV5', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }, reject, { language: CONFIG.language });
            } else {
                var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + CONFIG.language;
                safeFetch(url).then(function (r) { return r.json(); }).then(function(data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('seasonBadgeCacheV5', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }).catch(reject);
            }
        });
    }

    function renderSeasonBadge(cardHtml, tmdbData) {
        if (!tmdbData || !tmdbData.last_episode_to_air) return;
        var last = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.filter(function(s) { return s.season_number === last.season_number; })[0];
        
        if (currentSeason && last.season_number > 0) {
            var isComplete = currentSeason.episode_count > 0 && last.episode_number >= currentSeason.episode_count;
            var text = isComplete ? "S" + last.season_number : "S" + last.season_number + " " + last.episode_number + "/" + currentSeason.episode_count;
            
            var typeBadge = cardHtml.querySelector('.card__type');
            if (!typeBadge) {
                var view = cardHtml.querySelector('.card__view');
                if (!view) return;
                typeBadge = document.createElement('div');
                typeBadge.className = 'card__type';
                view.appendChild(typeBadge);
            }
            var bgColor = isComplete ? 'rgba(46, 204, 113, 0.8)' : 'rgba(170, 20, 20, 0.8)';
            typeBadge.innerHTML = text;
            typeBadge.classList.add('card__type--season');
            typeBadge.style.backgroundColor = bgColor;
        }
    }

    function getColor(rating, alpha) {
        var rgb = '';
        if (rating >= 0 && rating <= 3) rgb = '231, 76, 60';
        else if (rating > 3 && rating <= 5) rgb = '230, 126, 34';
        else if (rating > 5 && rating <= 6.5) rgb = '241, 196, 15';
        else if (rating > 6.5 && rating < 8) rgb = '52, 152, 219';
        else if (rating >= 8 && rating <= 10) rgb = '46, 204, 113';
        return rgb ? 'rgba(' + rgb + ', ' + alpha + ')' : null;
    }

    function extractItemLinks(html) {
        let doc = new DOMParser().parseFromString(html, "text/html");
        let links =[];
        doc.querySelectorAll('a[href]').forEach(a => {
            let href = a.getAttribute('href');
            if (href && href.match(/\/\d+-[^/]+\.html$/) && !href.includes('#')) {
                let fullUrl = href.startsWith('http') ? href : 'https://uaserials.com' + href;
                if (!links.includes(fullUrl)) links.push(fullUrl);
            }
        });
        return links;
    }

    async function getImdbId(url) {
        if (itemUrlCache[url]) return itemUrlCache[url];
        let html = await fetchHtml(url);
        let match = html.match(/imdb\.com\/title\/(tt\d+)/i);
        let id = match ? match[1] : null;
        if (id) itemUrlCache[url] = id;
        return id;
    }

    async function processInQueue(items, processFn, concurrency = 5) {
        let results =[];
        let index = 0;
        async function worker() {
            while (index < items.length) {
                let currentIndex = index++;
                try {
                    let res = await processFn(items[currentIndex]);
                    if (res) results.push(res);
                } catch (e) {}
            }
        }
        let workers =[];
        for (let i = 0; i < concurrency; i++) workers.push(worker());
        await Promise.all(workers);
        return results;
    }

    async function processSingleItem(url) {
        let imdb = await getImdbId(url);
        if (!imdb) return null;
        if (tmdbItemCache[imdb]) return tmdbItemCache[imdb];

        let endpoint = getTmdbEndpoint(`find/${imdb}?external_source=imdb_id&language=uk`);
        try {
            let data = await fetch(PROXIES[0] + endpoint).then(r => r.json());
            let res = null;
            if (data.movie_results && data.movie_results.length > 0) { res = data.movie_results[0]; res.media_type = 'movie'; }
            else if (data.tv_results && data.tv_results.length > 0) { res = data.tv_results[0]; res.media_type = 'tv'; }
            
            if (res && (!res.overview || res.overview.trim() === '')) {
                let enEndpoint = getTmdbEndpoint(`find/${imdb}?external_source=imdb_id&language=en`);
                let enData = await fetch(PROXIES[0] + enEndpoint).then(r => r.json());
                let enRes = (enData.movie_results && enData.movie_results.length > 0) ? enData.movie_results[0] : (enData.tv_results && enData.tv_results.length > 0) ? enData.tv_results[0] : null;
                if (enRes && enRes.overview) res.overview = enRes.overview;
            }

            if (res) tmdbItemCache[imdb] = res;
            return res;
        } catch(e) { return null; }
    }

    async function fetchCatalogPage(url, limit = 15) {
        if (listCache[url]) return listCache[url];
        let listHtml = await fetchHtml(url);
        let links = extractItemLinks(listHtml).slice(0, limit); 
        let tmdbItems = await processInQueue(links, processSingleItem, 5);
        
        let unique = {};
        let finalItems = tmdbItems.filter(item => {
            if (!item || !item.id || !item.backdrop_path) return false;
            if (unique[item.id]) return false;
            unique[item.id] = true;
            return true;
        });

        if (finalItems.length > 0) listCache[url] = finalItems;
        return finalItems;
    }

    async function getLmeTmdbItems(items) {
        let promises = items.map(async (item) => {
            if(!item || !item.id) return null;
            let parts = item.id.split(':');
            if (parts.length !== 2) return null;
            let type = parts[0], id = parts[1];
            let tmdbData = await fetchTmdbWithFallback(type, id);
            if (tmdbData && !tmdbData.error && tmdbData.backdrop_path) {
                tmdbData.media_type = type;
                return tmdbData;
            }
            return null;
        });
        let results = await Promise.all(promises);
        return results.filter(Boolean);
    }

    function analyzeAndInvert(imgElement) {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = imgElement.naturalWidth || imgElement.width;
            canvas.height = imgElement.naturalHeight || imgElement.height;
            if (canvas.width === 0 || canvas.height === 0) return;
            ctx.drawImage(imgElement, 0, 0);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var darkPixels = 0, totalPixels = 0;
            for (var i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 10) continue; 
                totalPixels++;
                var brightness = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
                if (brightness < 120) darkPixels++;
            }
            if (totalPixels > 0 && (darkPixels / totalPixels) >= 0.85) imgElement.style.filter += " brightness(0) invert(1)";
        } catch (e) { }
    }

    function fetchLogo(movie, itemElement) {
        var langPref = Lampa.Storage.get('ym_logo_lang', 'uk_en');
        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
        var cacheKey = 'logo_uas_v8_' + quality + '_' + langPref + '_' + movie.media_type + '_' + movie.id;
        var cachedUrl = Lampa.Storage.get(cacheKey);

        function applyLogo(url) {
            if (url && url !== 'none') {
                var img = new Image();
                img.crossOrigin = "anonymous"; 
                img.className = 'card-custom-logo';
                img.onload = function() { analyzeAndInvert(img); itemElement.find('.card__view').append(img); };
                img.src = url;
            } else {
                var textLogo = document.createElement('div');
                textLogo.className = 'card-custom-logo-text';
                
                var txt = movie.title || movie.name;
                if (langPref === 'en') {
                    txt = movie.original_title || movie.original_name || txt;
                }
                
                textLogo.innerText = txt;
                itemElement.find('.card__view').append(textLogo);
            }
        }
        
        if (cachedUrl) { applyLogo(cachedUrl); return; }

        let endpoint = getTmdbEndpoint(`${movie.media_type}/${movie.id}/images?include_image_language=uk,en,null`);
        fetch(PROXIES[0] + endpoint).then(r => r.json()).then(function(res) {
            var finalLogo = 'none';
            if (res.logos && res.logos.length > 0) {
                var found = null;
                if (langPref === 'uk') {
                    found = res.logos.find(l => l.iso_639_1 === 'uk');
                } else if (langPref === 'en') {
                    found = res.logos.find(l => l.iso_639_1 === 'en');
                } else {
                    found = res.logos.find(l => l.iso_639_1 === 'uk') || res.logos.find(l => l.iso_639_1 === 'en');
                }

                if (found) finalLogo = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + found.file_path);
            }
            Lampa.Storage.set(cacheKey, finalLogo);
            applyLogo(finalLogo);
        }).catch(function() {
            Lampa.Storage.set(cacheKey, 'none');
            applyLogo('none');
        });
    }

    function makeTitleButtonItem(title, url, iconUrl) {
        return {
            title: title,
            is_title_btn: true,
            url: url,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: title }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--title-btn');
                        item.empty(); 

                        if (!url) {
                            item.removeClass('selector focusable'); 
                            item.addClass('card--title-btn-static');
                        }

                        var iconHtml = iconUrl ? '<img src="' + iconUrl + '" class="title-btn-icon" />' : '';
                        item.append('<div class="title-btn-text">' + iconHtml + title + '</div>');
                    },
                    onlyEnter: function () {
                        if (url) {
                            Lampa.Activity.push({
                                url: url,
                                title: title,
                                component: 'category_full',
                                page: 1,
                                source: 'uas_pro_source'
                            });
                        }
                    }
                }
            }
        };
    }

    function makeWideCardItem(movie) {
        return {
            title: movie.title || movie.name,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', movie, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--wide-custom');
                        var view = item.find('.card__view');
                        view.empty(); 
                        
                        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                        var imgUrl = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + movie.backdrop_path);
                        view.css({
                            'background-image': 'url(' + imgUrl + ')', 'background-size': 'cover', 'background-position': 'center',
                            'padding-bottom': '56.25%', 'height': '0', 'position': 'relative'
                        });
                        
                        view.append('<div class="card-backdrop-overlay"></div>');

                        if (movie.vote_average > 0) {
                            var voteDiv = document.createElement('div');
                            voteDiv.className = 'card__vote';
                            voteDiv.innerText = movie.vote_average.toFixed(1);
                            view.append(voteDiv);
                        }

                        var yearStr = (movie.release_date || movie.first_air_date || '').toString().substring(0, 4);
                        if (yearStr && yearStr.length === 4) {
                            var ageDiv = document.createElement('div');
                            ageDiv.className = 'card-badge-age'; 
                            ageDiv.innerText = yearStr;
                            view.append(ageDiv);
                        }

                        fetchLogo(movie, item);

                        var descText = movie.overview || 'Опис відсутній.';
                        item.append('<div class="custom-title-bottom">' + (movie.title || movie.name) + '</div>');
                        item.append('<div class="custom-overview-bottom">' + descText + '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({ url: '', component: 'full', id: movie.id, method: movie.media_type, card: movie, source: 'tmdb' });
                    }
                }
            }
        };
    }

    async function loadRow(urlId, loadUrl, title, callback) {
        try {
            let items = await fetchCatalogPage(loadUrl, 15);
            let mapped = items.map(makeWideCardItem);
            callback({ 
                results: mapped, 
                title: '', 
                source: 'uas_pro_source', 
                uas_content_row: true, 
                params: { items: { mapping: 'line', view: 15 } } 
            });
        } catch(e) { callback({ results:[] }); }
    }

    async function loadCommunityGemsRow(callback) {
        try {
            let listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=15&page=1';
            let res = await safeFetch(listUrl).then(r=>r.json()).catch(()=>({items:[]}));
            let items = Array.isArray(res) ? res : (res.items ||[]);

            let tmdbItems = await getLmeTmdbItems(items);
            let mappedResults = tmdbItems.map(makeWideCardItem);

            callback({ 
                results: mappedResults, 
                title: '', 
                source: 'uas_pro_source', 
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } } 
            });
        } catch(e) { callback({ results:[] }); }
    }

    async function loadRandomCollectionRow(callback) {
        try {
            let listHtml = await fetchHtml('https://uaserials.com/collections/');
            let doc = new DOMParser().parseFromString(listHtml, "text/html");
            let collLinks =[];
            doc.querySelectorAll('a[href]').forEach(a => {
                let href = a.getAttribute('href');
                if (href && href.match(/\/collections\/\d+/)) {
                    let fUrl = href.startsWith('http') ? href : 'https://uaserials.com' + href;
                    if (!collLinks.includes(fUrl)) collLinks.push(fUrl);
                }
            });
            if (collLinks.length === 0) throw new Error("No collections");

            let randomUrl = collLinks[Math.floor(Math.random() * collLinks.length)];
            let items = await fetchCatalogPage(randomUrl, 15);
            
            callback({ 
                results: items.map(makeWideCardItem), 
                title: '', 
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } } 
            });
        } catch(e) { callback({ results:[] }); }
    }

    Lampa.Api.sources.uas_pro_source = {
        list: async function (params, oncomplete, onerror) {
            let page = params.page || 1;
            let baseUrl = '';
            let isLME = false;

            if (params.url === 'uas_movies_new') baseUrl = 'https://uaserials.com/films/p/';
            else if (params.url === 'uas_movies_pop') baseUrl = 'https://uaserials.my/filmss/w/';
            else if (params.url === 'uas_series_new') baseUrl = 'https://uaserials.com/series/p/';
            else if (params.url === 'uas_series_pop') baseUrl = 'https://uaserials.com/series/w/';
            else if (params.url === 'uas_community') isLME = true;
            else return onerror();

            try {
                let mapped =[];
                let totalPages = 50; 

                if (isLME) {
                    let listUrl = `https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=20&page=${page}`;
                    let res = await safeFetch(listUrl).then(r=>r.json());
                    let items = Array.isArray(res) ? res : (res.items ||[]);
                    totalPages = res.total_pages || 10;
                    
                    mapped = await getLmeTmdbItems(items); 
                } else {
                    let uasPage = page + 1; 
                    let listUrl = `${baseUrl}page/${uasPage}/`;
                    
                    let items = await fetchCatalogPage(listUrl, 20); 
                    mapped = items; 
                }

                if (mapped.length > 0) {
                    oncomplete({
                        results: mapped,
                        page: page,
                        total_pages: totalPages
                    });
                } else { onerror(); }
            } catch (e) { onerror(); }
        }
    };

    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        Lampa.SettingsApi.addComponent({
    component: 'ymainpage',
    name: 'YMainPage',
    icon: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`
});

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'uas_support_yarik', type: 'button' },
    field: { 
        name: "Підтримати розробників: Yarik's Mod's",
        description: 'https://lampalampa.free.nf/' 
    }
});

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'uas_support_lme', type: 'button' },
    field: { 
        name: 'Підтримати розробників: LampaME',
        description: 'https://lampame.github.io/' 
    }
});

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'uas_show_flag', type: 'trigger', default: true },
    field: { 
        name: 'Відображення UA озвучок',
        description: 'Пошук та відображення прапорця на картках' 
    }
});

var langValues = {
    'uk': 'Тільки українською',
    'uk_en': 'Укр + Англ (за замовчуванням)',
    'en': 'Тільки англійською'
};

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'ym_logo_lang', type: 'select', values: langValues, default: 'uk_en' },
    field: { 
        name: 'Мова логотипів',
        description: 'Оберіть пріоритет мови для логотипів' 
    }
});

var qualValues = {
    'w300': 'w300 (за замовчуванням)',
    'w500': 'w500',
    'w780': 'w780',
    'original': 'Оригінал'
};

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'ym_img_quality', type: 'select', values: qualValues, default: 'w300' },
    field: { 
        name: 'Якість зображень (Фон/Лого)',
        description: 'Впливає на швидкість завантаження сторінки' 
    }
});

const rows = [
    { id: 'ym_row_movies_new', title: 'Новинки фільмів', defOrder: '1' },
    { id: 'ym_row_movies_watch', title: 'Популярні фільми', defOrder: '2' },
    { id: 'ym_row_series_new', title: 'Новинки серіалів', defOrder: '3' },
    { id: 'ym_row_series_pop', title: 'Популярні серіали', defOrder: '4' },
    { id: 'ym_row_community', title: 'Знахідки спільноти LME', defOrder: '5' },
    { id: 'ym_row_random', title: 'Випадкова підбірка', defOrder: '6' }
];

let orderValues = {
    '1': 'Позиція 1',
    '2': 'Позиція 2',
    '3': 'Позиція 3',
    '4': 'Позиція 4',
    '5': 'Позиція 5',
    '6': 'Позиція 6'
};

rows.forEach(r => {
    Lampa.SettingsApi.addParam({
        component: 'ymainpage',
        param: { name: r.id, type: 'trigger', default: true },
        field: { 
            name: 'Увімкнути / Вимкнути: ' + r.title,
            description: 'Показувати цей рядок на головній' 
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'ymainpage',
        param: { name: r.id + '_order', type: 'select', values: orderValues, default: r.defOrder },
        field: { 
            name: 'Порядок: ' + r.title,
            description: 'Яким по рахунку виводити цей рядок' 
        }
    });
});

Lampa.SettingsApi.addParam({
    component: 'ymainpage',
    param: { name: 'uas_pro_tmdb_btn', type: 'button' },
    field: { 
        name: 'Власний TMDB API ключ',
        description: 'Натисніть, щоб ввести ключ (працює першочергово)' 
    }
});

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'ymainpage') {
                e.body.find('[data-name="uas_support_yarik"]').on('hover:enter', function () {
                    window.open('https://lampalampa.free.nf/', '_blank');
                });
                
                e.body.find('[data-name="uas_support_lme"]').on('hover:enter', function () {
                    window.open('https://lampame.github.io/main/#uk', '_blank');
                });

                e.body.find('[data-name="uas_pro_tmdb_btn"]').on('hover:enter', function () {
                    var currentKey = Lampa.Storage.get('uas_pro_tmdb_apikey') || '';
                    Lampa.Input.edit({
                        title: 'Введіть TMDB API ключ', value: currentKey, free: true, nosave: true
                    }, function (new_val) {
                        if (new_val !== undefined) {
                            Lampa.Storage.set('uas_pro_tmdb_apikey', new_val.trim());
                            Lampa.Noty.show('TMDB ключ збережено. Перезапустіть застосунок.');
                        }
                    });
                });
            }
        });
    }

    function overrideApi() {
        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
    var rowDefs =[
        { id: 'ym_row_movies_new', defOrder: 1, type: 'uas', url: 'uas_movies_new', loadUrl: 'https://uaserials.com/films/p/', title: 'Новинки фільмів', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Ukraine_film_clapperboard.svg' },

        { id: 'ym_row_movies_watch', defOrder: 2, type: 'uas', url: 'uas_movies_pop', loadUrl: 'https://uaserials.my/filmss/w/', title: 'Популярні фільми', icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Filmreel-icon.svg' },

        { id: 'ym_row_series_new', defOrder: 3, type: 'uas', url: 'uas_series_new', loadUrl: 'https://uaserials.com/series/p/', title: 'Новинки серіалів', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Mplayer.svg' },

        { id: 'ym_row_series_pop', defOrder: 4, type: 'uas', url: 'uas_series_pop', loadUrl: 'https://uaserials.com/series/w/', title: 'Популярні серіали', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Tvfilm.svg' },

        { id: 'ym_row_community', defOrder: 5, type: 'community', url: 'uas_community', title: 'Знахідки спільноти LME', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Anime_eye_film.png' },

        { id: 'ym_row_random', defOrder: 6, type: 'random', url: '', title: 'Випадкова підбірка', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Magicfilm_icon.svg' }
    ];

            let activeRows =[];
            for (let def of rowDefs) {
                let enabled = Lampa.Storage.get(def.id) !== false;
                let order = parseInt(Lampa.Storage.get(def.id + '_order')) || def.defOrder;
                if (enabled) activeRows.push({ ...def, order: order });
            }
            activeRows.sort((a, b) => a.order - b.order);
            
            let parts_data =[];
            
            activeRows.forEach(def => {
                parts_data.push((cb) => {
                    cb({
                        results:[makeTitleButtonItem(def.title, def.url, def.icon)],
                        title: '', 
                        uas_title_row: true, 
                        params: { items: { mapping: 'line', view: 1 } }
                    });
                });

                parts_data.push((cb) => {
                    if (def.type === 'uas') loadRow(def.url, def.loadUrl, def.title, cb);
                    else if (def.type === 'community') loadCommunityGemsRow(cb);
                    else if (def.type === 'random') loadRandomCollectionRow(cb);
                });
            });

            if(parts_data.length === 0) {
                parts_data.push((cb) => loadRow('uas_movies_new', 'https://uaserials.com/films/p/', 'Новинки фільмів', cb));
            }

            Lampa.Api.partNext(parts_data, 2, oncomplite, onerror);
        };
    }

    function start() {
        if (window.uaserials_pro_v8_loaded) return;
        window.uaserials_pro_v8_loaded = true;

        lmeCache = new Cache(CONFIG.cache);
        lmeCache.init();

        createSettings();

        var style = document.createElement('style');
        style.innerHTML = `
            .card .card__age { display: none !important; }

            .card__view .card-badge-age { 
                display: block !important; right: 0 !important; top: 0 !important; padding: 0.2em 0.45em !important; 
                background: rgba(0, 0, 0, 0.6) !important; 
                position: absolute !important; margin-top: 0 !important; font-size: 1.1em !important; 
                z-index: 10 !important; color: #fff !important; font-weight: bold !important;
            }

            .card--wide-custom { width: 25em !important; margin-right: 0.2em !important; margin-bottom: 0 !important; position: relative; cursor: pointer; transition: transform 0.2s ease, z-index 0.2s ease; z-index: 1; }
            
            .card--wide-custom .card__view { border-radius: 0.4em !important; overflow: hidden !important; box-shadow: 0 3px 6px rgba(0,0,0,0.5); }
            .card--wide-custom .card-backdrop-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); pointer-events: none; border-radius: 0.4em !important; z-index: 1; }
            
            .card--wide-custom.focus { z-index: 99 !important; transform: scale(1.08); }
            .card--wide-custom.focus .card__view { box-shadow: 0 10px 25px rgba(0,0,0,0.9) !important; border: 3px solid #fff !important; outline: none !important; }
            .card--wide-custom.focus .card__view::after, .card--wide-custom.focus .card__view::before { display: none !important; content: none !important; }

            .card-custom-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70% !important; height: 70% !important; max-width: 70% !important; max-height: 70% !important; padding: 0 !important; margin: 0 !important; object-fit: contain; z-index: 5; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.8)); pointer-events: none; transition: filter 0.3s ease; }
            
            .card-custom-logo-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-height: 70%; text-align: center; font-size: 2em; font-weight: 600; color: #fff; text-shadow: none !important; z-index: 5; pointer-events: none; word-wrap: break-word; white-space: normal; line-height: 1.2; font-family: sans-serif; display: flex; align-items: center; justify-content: center; }

            .card--wide-custom > div:not(.card__view):not(.custom-title-bottom):not(.custom-overview-bottom) { display: none !important; }
            .custom-title-bottom { width: 100%; text-align: left; font-size: 1.1em; font-weight: bold; margin-top: 0.3em; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 0.2em; }
            .custom-overview-bottom { width: 100%; text-align: left; font-size: 0.85em; color: #bbb; line-height: 1.2; margin-top: 0.2em; padding: 0 0.2em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; }
            
            .card__vote { right: 0 !important; bottom: 0 !important; padding: 0.2em 0.45em !important; z-index: 2; position: absolute !important; font-weight: bold; background: rgba(0,0,0,0.6); }
            .card__type { position: absolute !important; left: 0 !important; top: 0 !important; width: auto !important; height: auto !important; line-height: 1 !important; padding: 0.3em !important; background: rgba(0, 0, 0, 0.5) !important; display: flex !important; align-items: center; justify-content: center; z-index: 2; color: #fff !important; transition: background 0.3s !important; }
            .card__type svg { width: 1.5em !important; height: 1.5em !important; }
            .card__type.card__type--season { font-size: 1.1em !important; font-weight: bold !important; padding: 0.2em 0.45em !important; font-family: Roboto, Arial, sans-serif !important; }
            .card__ua_flag { position: absolute !important; left: 0 !important; bottom: 0 !important; width: 2.4em !important; height: 1.4em !important; font-size: 1.3em !important; background: linear-gradient(180deg, #0057b8 50%, #ffd700 50%) !important; opacity: 0.8 !important; z-index: 2; }
            
            .card--wide-custom .card-badge-age { border-radius: 0 0 0 0.5em !important; }
            .card--wide-custom .card__vote { border-radius: 0.5em 0 0 0 !important; } 
            .card--wide-custom .card__type { border-radius: 0 0 0.5em 0 !important; }  
            .card--wide-custom .card__ua_flag { border-radius: 0 0.5em 0 0 !important; }

            .card:not(.card--wide-custom) .card-badge-age { border-radius: 0 0.8em 0 0.8em !important; }
            .card:not(.card--wide-custom) .card__vote { border-radius: 0.8em 0 0.8em 0 !important; }
            .card:not(.card--wide-custom) .card__type { border-radius: 0.8em 0 0.8em 0 !important; }
            .card:not(.card--wide-custom) .card__ua_flag { border-radius: 0 0.8em 0 0.8em !important; }

            .items-line[data-uas-title-row="true"] .items-line__head { display: none !important; }
            .items-line[data-uas-content-row="true"] .items-line__head { display: none !important; }
            
            .items-line[data-uas-title-row="true"] { margin-top: 0 !important; margin-bottom: 0.5em !important; padding-top: 0 !important; padding-bottom: 0 !important; }
            .items-line[data-uas-title-row="true"] .items-line__body { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
            .items-line[data-uas-title-row="true"] .scroll__item { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
            
            .items-line[data-uas-content-row="true"] { margin-top: 0.1em !important; margin-bottom: 0.5em !important; padding-top: 0 !important; padding-bottom: 0 !important; }
            .items-line[data-uas-content-row="true"] .items-line__body { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }
            .items-line[data-uas-content-row="true"] .scroll__item { margin-top: 0 !important; margin-bottom: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; }

            .card--title-btn {
                width: 100vw !important; 
                max-width: 100% !important; 
                height: auto !important;
                background: transparent !important;
                border-radius: 0 !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: flex-start !important; 
                padding: 0.3em 1.5em !important; 
                cursor: pointer !important;
                border: none !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; 
                box-shadow: none !important;
                box-sizing: border-box !important;
            }

            .card--title-btn.focus {
                background: transparent !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
                box-shadow: none !important;
                outline: none !important;
                transform: none !important;
            }

            .title-btn-text {
                display: flex !important;
                align-items: center !important;
                font-size: 1.4em !important;
                font-weight: bold !important;
                color: #777 !important; 
                border: none !important; 
                padding: 0 !important;
                line-height: 1.2 !important;
                text-align: left !important;
                transition: color 0.2s ease, transform 0.2s ease !important;
            }

            .title-btn-icon {
                height: 1.1em !important;
                width: auto !important;
                margin-right: 0.5em !important;
                filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5)) !important;
            }

            .card--title-btn.focus .title-btn-text {
                color: #fff !important; 
                transform: scale(1.05) !important; 
                transform-origin: left center !important; 
                text-shadow: none !important; 
                box-shadow: none !important; 
            }

            .card--title-btn-static {
                cursor: default !important;
            }
            .card--title-btn-static .title-btn-text {
                opacity: 0.5 !important; 
            }

            .card--title-btn .card__view, 
            .card--title-btn .card__view::after, 
            .card--title-btn .card__view::before {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        Lampa.Listener.follow('line', function (e) {
            if (e.type === 'create' && e.data && e.line && e.line.render) {
                var el = e.line.render();
                if (e.data.uas_title_row) el.attr('data-uas-title-row', 'true');
                if (e.data.uas_content_row) el.attr('data-uas-content-row', 'true');
            }
        });

        var initialFocusHandled = true; 

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                initialFocusHandled = false;
            }
        });

        Lampa.Listener.follow('controller', function (e) {
            if (e.type === 'focus' && !initialFocusHandled) {
                initialFocusHandled = true; 
                var target = $(e.target);
                if (target.hasClass('card--title-btn')) {
                    setTimeout(function() {
                        Lampa.Controller.move('down');
                    }, 20); 
                }
            }
        });

        var CardMaker = Lampa.Maker.map('Card');
        var originalOnVisible = CardMaker.Card.onVisible;

        CardMaker.Card.onVisible = function () {
            originalOnVisible.apply(this, arguments);
            var cardInstance = this;
            var html = this.html;
            var data = this.data;
            if (!html || !data) return;

            if (data.is_title_btn) return;

            var isWideCard = html.classList.contains('card--wide-custom') || $(html).hasClass('card--wide-custom');

            var view = html.querySelector('.card__view');
            if (view && data) {
                var ageBadge = view.querySelector('.card-badge-age');
                if (!ageBadge) {
                    var yearStr = (data.release_date || data.first_air_date || '').toString().substring(0, 4);
                    if (yearStr && yearStr.length === 4) {
                        ageBadge = document.createElement('div');
                        ageBadge.className = 'card-badge-age';
                        ageBadge.innerText = yearStr;
                        view.appendChild(ageBadge);
                    }
                }
            }

            var vote = html.getElementsByClassName('card__vote');
            if (vote.length > 0) {
                var color = getColor(parseFloat(vote[0].textContent.trim()), 0.8);
                if (color) vote[0].style.backgroundColor = color;
            }

            var showFlag = Lampa.Storage.get('uas_show_flag');
            if (showFlag === null || showFlag === undefined) showFlag = true;

            if (showFlag && data.id && !isWideCard) {
                var oldFlag = html.querySelector('.card__ua_flag');
                if (oldFlag) oldFlag.remove();

                var meta = createMediaMeta(data);
                if (meta) {
                    var cached = lmeCache.get(meta.cacheKey);
                    if (cached === true) renderFlag(html);
                    else if (cached !== false) {
                        loadFlag(meta).then(function (isSuccess) {
                            if (isSuccess && cardInstance.html.parentNode) renderFlag(cardInstance.html);
                        });
                    }
                }
            } else if (!showFlag && !isWideCard) {
                var oldFlag = html.querySelector('.card__ua_flag');
                if (oldFlag) oldFlag.remove();
            }

            if ((data.media_type === 'tv' || data.name || data.number_of_seasons) && data.id) {
                fetchSeriesData(data.id).then(function(tmdbData) {
                    if (cardInstance.html.parentNode && cardInstance.data === data) {
                        renderSeasonBadge(cardInstance.html, tmdbData);
                    }
                }).catch(function(){});
            }
        };

        overrideApi();
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();
