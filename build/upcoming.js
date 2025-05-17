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
(function () {
    'use strict';
    // Версія 1.53: Виключено фільми без дати релізу в upcoming_movies, виправлено відображення на сторінці "Ще Очікувані фільми"

    Lampa.Lang.add({
        trailers_popular: {
            ru: 'Популярное',
            uk: 'Популярне',
            en: 'Popular'
        },
        trailers_in_theaters: {
            ru: 'В прокате',
            uk: 'В прокаті',
            en: 'In Theaters'
        },
        trailers_upcoming_movies: {
            ru: 'Ожидаемые фильмы',
            uk: 'Очікувані фільми',
            en: 'Upcoming Movies'
        },
        trailers_popular_series: {
            ru: 'Популярные сериалы',
            uk: 'Популярні серіали',
            en: 'Popular Series'
        },
        trailers_new_series_seasons: {
            ru: 'Новые сериалы и сезоны',
            uk: 'Нові серіали та сезони',
            en: 'New Series and Seasons'
        },
        trailers_upcoming_series: {
            ru: 'Ожидаемые сериалы',
            uk: 'Очікувані серіали',
            en: 'Upcoming Series'
        },
        trailers_no_trailers: {
            ru: 'Нет трейлеров',
            uk: 'Немає трейлерів',
            en: 'No trailers'
        },
        trailers_no_ua_trailer: {
            ru: 'Нет украинского трейлера',
            uk: 'Немає українського трейлера',
            en: 'No Ukrainian trailer'
        },
        trailers_no_ru_trailer: {
            ru: 'Нет русского трейлера',
            uk: 'Немає російського трейлера',
            en: 'No Russian trailer'
        },
        trailers_view: {
            ru: 'Подробнее',
            uk: 'Докладніше',
            en: 'More'
        },
        title_trailers: {
            ru: 'Трейлеры',
            uk: 'Трейлери',
            en: 'Trailers'
        },
        trailers_filter: {
            ru: 'Фильтр',
            uk: 'Фільтр',
            en: 'Filter'
        },
        trailers_filter_today: {
            ru: 'Сегодня',
            uk: 'Сьогодні',
            en: 'Today'
        },
        trailers_filter_week: {
            ru: 'Неделя',
            uk: 'Тиждень',
            en: 'Week'
        },
        trailers_filter_month: {
            ru: 'Месяц',
            uk: 'Місяць',
            en: 'Month'
        },
        trailers_filter_year: {
            ru: 'Год',
            uk: 'Рік',
            en: 'Year'
        },
        trailers_movies: {
            ru: 'Фильмы',
            uk: 'Фільми',
            en: 'Movies'
        },
        trailers_series: {
            ru: 'Сериалы',
            uk: 'Серіали',
            en: 'Series'
        },
        trailers_more: {
            ru: 'Ещё',
            uk: 'Ще',
            en: 'More'
        },
        trailers_popular_movies: {
            ru: 'Популярные фильмы',
            uk: 'Популярні фільми',
            en: 'Popular Movies'
        },
        trailers_last_movie: {
            ru: 'Это последний фильм: [title]',
            uk: 'Це останній фільм: [title]',
            en: 'This is the last movie: [title]'
        },
        trailers_no_more_data: {
            ru: 'Больше нет данных для загрузки',
            uk: 'Більше немає даних для завантаження',
            en: 'No more data to load'
        }
    });

    function startPlugin() {
        if (window.plugin_trailers_ready) return;
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
        Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase;font-size:1.2em}.card.card--trailer .card__release-date{position:absolute;top:2em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');

        function add() {
            var button = $('<li class="menu__item selector"><div class="menu__ico"><svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg></div><div class="menu__text">' + Lampa.Lang.translate('title_trailers') + '</div></li>');
            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(button);
            $('body').append(Lampa.Template.get('trailer_style', {}, true));
            Lampa.Storage.listener.follow('change', function (event) {
                if (event.name === 'language') {
                    Api.clear();
                }
            });
        }

        if (Lampa.TMDB && Lampa.TMDB.key()) {
            add();
        } else {
            Lampa.Noty.show('TMDB API key is missing. Trailers plugin cannot be loaded.');
        }
    }

    if (!window.appready) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    } else {
        startPlugin();
    }
})();
})();
