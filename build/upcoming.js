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
var Api = {
    clear: function () {
        console.log('Trailers', 'Clear cache');
    },

    videos: function (data, success, fail) {
        var type = data.type || (data.name ? 'tv' : 'movie');
        Lampa.TMDB.videos(type, data.id, success, fail);
    },

    category: function (params, oncomplite, onerror) {
        var lang = Lampa.Storage.get('language', 'ru');
        var page = params.page || 1;
        var url = params.url.replace('{page}', page).replace('{lang}', lang);

        Lampa.TMDB.get(url, function (data) {
            var results = data.results || [];
            console.log('Trailers', params.type + ' results:', results.length, 'Page:', page);
            oncomplite({
                title: params.title,
                results: results,
                page: data.page,
                total_pages: data.total_pages,
                type: params.type,
                url: params.url
            });
        }, onerror);
    },

    full: function (params, oncomplite, onerror) {
        this.category(params, oncomplite, onerror);
    },

    getLocalMoviesInTheaters: function (params, oncomplite, onerror) {
        var lang = Lampa.Storage.get('language', 'ru');
        var region = lang === 'ru' ? 'RU' : lang === 'uk' ? 'UA' : 'US';
        var page = params.page || 1;
        var url = 'movie/now_playing?language=' + lang + '&page=' + page + '&region=' + region;

        Lampa.TMDB.get(url, function (data) {
            var results = data.results || [];
            var total_pages = data.total_pages || 1;
            console.log('Trailers', 'In theaters results:', results.length, 'Page:', page);

            var filtered_results = [];
            var pending = results.length;
            var completed = 0;

            function checkComplete() {
                if (completed >= pending) {
                    console.log('Trailers', 'In theaters final results:', filtered_results.length, 'Page:', page);
                    oncomplite({
                        title: params.title,
                        results: filtered_results,
                        page: data.page,
                        total_pages: total_pages,
                        type: params.type,
                        url: params.url
                    });
                }
            }

            if (!results.length) {
                checkComplete();
                return;
            }

            results.forEach(function (movie) {
                var release_url = 'movie/' + movie.id + '/release_dates';
                Lampa.TMDB.get(release_url, function (release_data) {
                    movie.release_details = release_data.results?.find(function (r) { return r.iso_3166_1 === region; })?.release_dates[0]?.release_date || movie.release_date;

                    Api.videos(movie, function (video_data) {
                        var trailers = video_data.results ? video_data.results.filter(function (v) {
                            return v.type === 'Trailer' && v.iso_639_1 === lang;
                        }) : [];
                        if (trailers.length) {
                            filtered_results.push(movie);
                        }
                        completed++;
                        checkComplete();
                    }, function () {
                        completed++;
                        checkComplete();
                    });
                }, function () {
                    movie.release_details = movie.release_date;
                    completed++;
                    checkComplete();
                });
            });
        }, onerror);
    }
};
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

            // Try Lampa.Component.register
            if (typeof Lampa.Component?.register === 'function') {
                Lampa.Component.register('trailers', window.TrailersComponent);
                console.log('Trailers', 'Component registered via Lampa.Component.register');
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
                    component: 'trailers',
                    name: 'trailers',
                    id: 'trailers',
                    enabled: true,
                    visible: true
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
                    if (typeof Lampa.Menu?.refresh === 'function') {
                        Lampa.Menu.refresh();
                        console.log('Trailers', 'Menu refreshed via Lampa.Menu.refresh');
                    }
                    if (typeof Lampa.Menu?.reload === 'function') {
                        Lampa.Menu.reload();
                        console.log('Trailers', 'Menu reloaded via Lampa.Menu.reload');
                    }
                    console.log('Trailers', 'Menu state after render:', Lampa.Menu);
                }, 2000);

                // Log menu and component state
                console.log('Trailers', 'Available components:', Object.keys(Lampa.Components || {}));
                console.log('Trailers', 'Menu items:', Lampa.Menu.items);
                console.log('Trailers', 'Lampa.Menu:', Lampa.Menu);
                console.log('Trailers', 'TrailersComponent methods:', Object.keys(window.TrailersComponent));
                if (typeof Lampa.Component?.get === 'function') {
                    console.log('Trailers', 'Component exists:', !!Lampa.Component.get('trailers'));
                }
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
