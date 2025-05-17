(function () {
'use strict';
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
(function() {
    var lang_map = { 'uk': 'uk-UA', 'ru': 'ru-RU', 'en': 'en-US' };
    var api_key = 'YOUR_TMDB_API_KEY';

    function getReleaseDetails(id, type, lang) {
        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/release_dates?api_key=' + api_key;
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            var release = data.results.find(function(r) { return r.iso_3166_1 === lang_map[lang] || r.iso_3166_1 === 'US'; });
            return release ? { release_date: release.release_dates[0].release_date.split('T')[0] } : {};
        }).catch(function(error) {
            console.error('Trailers', 'Error fetching release details:', error);
            return {};
        });
    }

    function getTrailers(id, type, lang) {
        var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '/videos?api_key=' + api_key + '&language=' + lang_map[lang];
        return fetch(url).then(function(response) {
            return response.json();
        }).then(function(data) {
            var trailers = data.results ? data.results.filter(function(v) {
                return v.type === 'Trailer' && v.site === 'YouTube';
            }) : [];
            return trailers;
        }).catch(function(error) {
            console.error('Trailers', 'Error fetching trailers:', error);
            return [];
        });
    }

    window.TrailersAPI = {
        get: function(category, params) {
            var lang = Lampa.Storage.get('language', 'uk');
            var page = params.page || 1;
            var url = '';
            var type = 'movie';

            if (category === 'in_theaters') {
                url = 'https://api.themoviedb.org/3/movie/now_playing?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'upcoming_movies') {
                url = 'https://api.themoviedb.org/3/movie/upcoming?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'popular_movies') {
                url = 'https://api.themoviedb.org/3/movie/popular?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
            } else if (category === 'popular_series') {
                url = 'https://api.themoviedb.org/3/tv/popular?api_key=' + api_key + '&language=' + lang_map[lang] + '&page=' + page;
                type = 'tv';
            }

            return fetch(url).then(function(response) {
                return response.json();
            }).then(function(data) {
                var results = data.results || [];
                var promises = results.map(function(item) {
                    var id = item.id;
                    var p1 = category === 'in_theaters' ? getTrailers(id, type, lang) : Promise.resolve([]);
                    var p2 = (category === 'upcoming_movies' || category === 'popular_movies') ? getReleaseDetails(id, type, lang) : Promise.resolve({});
                    return Promise.all([p1, p2]).then(function([trailers, release]) {
                        if (category === 'in_theaters' && trailers.length === 0) return null;
                        item.release_details = release;
                        item.trailers = trailers;
                        return item;
                    });
                });

                return Promise.all(promises).then(function(items) {
                    return {
                        results: items.filter(function(item) { return item !== null; }),
                        page: data.page,
                        total_pages: data.total_pages,
                        has_next: data.page < data.total_pages
                    };
                });
            }).catch(function(error) {
                console.error('Trailers', 'Error fetching data:', error);
                return { results: [], page: 1, total_pages: 1, has_next: false };
            });
        }
    };
})();
(function() {
    var component = {
        render_cards: function(data, category, params) {
            var _this = this;
            console.log('Trailers', 'render_cards', category, params);

            var lang = Lampa.Storage.get('language', 'uk');
            var list = document.createElement('div');
            list.className = 'trailers-list';

            data.results.forEach(function(card) {
                var item = _this.createCard(card, category);
                if (item) list.appendChild(item);
            });

            if (data.has_next) {
                var more = document.createElement('div');
                more.className = 'trailers-category__more';
                more.textContent = Lampa.Lang.translate('more');
                more.addEventListener('click', function() {
                    params.page++;
                    _this.full(category, params);
                });
                list.appendChild(more);
            }

            return list;
        },

        createCard: function(card, category) {
            if (!card) return null;

            var _this = this;
            var lang = Lampa.Storage.get('language', 'uk');
            var item = document.createElement('div');
            item.className = 'trailers-card';

            var img = document.createElement('div');
            img.className = 'trailers-card__img';
            var image = document.createElement('img');
            var poster = card.poster_path ? 'https://image.tmdb.org/t/p/w300' + card.poster_path : './img/no-poster.png';
            image.src = poster;
            img.appendChild(image);
            item.appendChild(img);

            var title = document.createElement('div');
            title.className = 'trailers-card__title';
            title.textContent = lang === 'en' ? (card.title || card.name || '') : (card.title_uk || card.title_ru || card.title || card.name || '');
            item.appendChild(title);

            var date = '';
            if (category === 'upcoming_movies' || category === 'popular_movies') {
                if (card.release_details && card.release_details.release_date) {
                    date = card.release_details.release_date;
                } else if (card.release_date) {
                    date = card.release_date;
                }
            } else if (category === 'popular_series') {
                if (card.first_air_date) {
                    date = card.first_air_date;
                }
            }

            if (date) {
                var dateEl = document.createElement('div');
                dateEl.className = 'trailers-card__date';
                dateEl.textContent = date;
                item.appendChild(dateEl);
            }

            console.log('Trailers', 'Card:', card.id, 'Title:', title.textContent, 'Date:', date);

            item.addEventListener('click', function() {
                Lampa.Activity.push({
                    url: '',
                    title: title.textContent,
                    component: 'trailers_player',
                    id: card.id,
                    type: category
                });
            });

            return item;
        },

        render: function(params) {
            console.log('Trailers', 'render', params);
            var container = document.createElement('div');
            var categories = [
                { title: Lampa.Lang.translate('title_in_theaters'), type: 'in_theaters', page: 1 },
                { title: Lampa.Lang.translate('title_upcoming'), type: 'upcoming_movies', page: 1 },
                { title: Lampa.Lang.translate('title_popular'), type: 'popular_movies', page: 1 },
                { title: Lampa.Lang.translate('title_series'), type: 'popular_series', page: 1 }
            ];

            categories.forEach(function(category) {
                var title = document.createElement('div');
                title.className = 'trailers-category__title';
                title.textContent = category.title;
                container.appendChild(title);

                var list = document.createElement('div');
                list.className = 'trailers-category__list';
                container.appendChild(list);

                window.TrailersAPI.get(category.type, { page: category.page }).then(function(data) {
                    list.appendChild(component.render_cards(data, category.type, { page: category.page }));
                });
            });

            return container;
        },

        full: function(category, params) {
            console.log('Trailers', 'full', category, params);
            window.TrailersAPI.get(category, params).then(function(data) {
                var list = document.querySelector('.trailers-category__list');
                list.innerHTML = '';
                list.appendChild(component.render_cards(data, category, params));
            });
        },

        clear: function() {
            console.log('Trailers', 'clear');
        },

        init: function() {
            console.log('Trailers', 'Component initialized');
        },

        destroy: function() {
            console.log('Trailers', 'Component destroyed');
        }
    };

    window.TrailersComponent = component;
})();
(function() {
    function startPlugin() {
        console.log('Trailers', 'startPlugin called');

        if (!window.TrailersComponent) {
            console.error('Trailers', 'Component not defined');
            return;
        }

        console.log('Trailers', 'Registering component');
        try {
            // Register component
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;
            console.log('Trailers', 'Component added via Lampa.Components');

            // Try Lampa.Component.add
            if (typeof Lampa.Component?.add === 'function') {
                Lampa.Component.add('trailers', window.TrailersComponent);
                console.log('Trailers', 'Component added via Lampa.Component.add');
            }

            // Add CSS
            Lampa.Template.add('trailers_css', '<style>.trailers-list{display:flex;flex-wrap:wrap;gap:20px}.trailers-card{width:150px;cursor:pointer}.trailers-card__img img{width:100%;border-radius:8px}.trailers-card__title{font-size:14px;margin-top:8px;color:#fff}.trailers-card__date{font-size:12px;color:#999;margin-top:4px}.trailers-category__title{font-size:18px;margin:20px 0 10px;color:#fff}.trailers-category__more{font-size:14px;color:#1e88e5;cursor:pointer;margin-top:10px}</style>');
            console.log('Trailers', 'CSS added');

            // Add to menu
            try {
                Lampa.Menu = Lampa.Menu || {};
                Lampa.Menu.items = Lampa.Menu.items || [];
                Lampa.Menu.items.push({
                    title: 'Трейлери',
                    component: 'trailers'
                });
                console.log('Trailers', 'Menu item added via Lampa.Menu.items');
                console.log('Trailers', 'Menu item details:', Lampa.Menu.items[Lampa.Menu.items.length - 1]);

                // Delayed menu render
                setTimeout(function() {
                    if (typeof Lampa.Menu?.render === 'function') {
                        Lampa.Menu.render();
                        console.log('Trailers', 'Menu rendered via Lampa.Menu.render');
                    }
                    if (typeof Lampa.Menu?.init === 'function') {
                        Lampa.Menu.init();
                        console.log('Trailers', 'Menu initialized via Lampa.Menu.init');
                    }
                }, 1000);
            } catch (e) {
                console.error('Trailers', 'Error adding menu item:', e.message);
            }
        } catch (e) {
            console.error('Trailers', 'Error adding component:', e.message);
        }
    }

    console.log('Trailers', 'init.js loaded');
    startPlugin();
})();
})();
