(function () {
    'use strict';
    // Версія 1.18 Додано розширене логування для трейлерів, щоб перевірити наявність ua. Замінено N/A на ---. Для серіалів змінено запит на /discover/tv із with_type=2 (Miniseries), виключено типи 0,1,3,4,5. Збережено підвантаження карток, розмір 33.3% із адаптивністю. Мова JavaScript ES5

    // Власна функція debounce для обробки подій із затримкою
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
    var trailerCache = {}; // Кеш для зберігання результатів запитів

    function getFormattedDate(daysAgo) {
        var today = new Date();
        if (daysAgo) today.setDate(today.getDate() - daysAgo);
        var year = today.getFullYear();
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var day = String(today.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function getRegion() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang === 'uk' ? 'UA' : lang === 'ru' ? 'RU' : 'US';
    }

    function getPreferredLanguage() {
        var lang = Lampa.Storage.get('language', 'ru');
        if (lang === 'uk' || lang === 'ua') {
            return ['ua', 'en']; // Пріоритет для ua: ua, en (без ru)
        } else if (lang === 'ru') {
            return ['ru', 'en']; // Пріоритет для ru: ru, en (без ua)
        } else {
            return ['en']; // За замовчуванням: тільки en
        }
    }

    function get(url, page, resolve, reject, useRegion, noLang) {
        var full_url = tmdb_base_url + url + '?api_key=' + tmdb_api_key + '&page=' + page;
        if (!noLang) full_url += '&language=uk-UA'; // Використовуємо uk-UA для всіх запитів, де не вказано інше
        if (useRegion) full_url += '®ion=' + getRegion();
        console.log('Сформований URL:', full_url);
        network.silent(full_url, function (result) {
            console.log('API Result:', url, result);
            resolve(result);
        }, function (error) {
            console.log('API Error:', url, error);
            reject(error);
        });
    }

    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);
        status.onComplite = function () {
            var fulldata = [];
            var keys = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'upcoming_seasons', 'upcoming_new_series'];
            keys.forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main completed:', fulldata);
            if (fulldata.length) oncomplite(fulldata);
            else {
                console.log('No data to display');
                onerror();
            }
        };

        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };

        // Запит для Популярні фільми
        get('/trending/movie/day', 1, function (json) {
            append(Lampa.Lang.translate('trailers_popular_movies'), 'popular_movies', '/trending/movie/day', json.results.length ? { results: json.results } : { results: [] });
        }, status.error.bind(status), false);

        get('/movie/now_playing', 1, function (json) {
            append(Lampa.Lang.translate('trailers_in_theaters'), 'in_theaters', '/movie/now_playing', json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        // Запит для Очікувані фільми
        get('/movie/upcoming?language=uk-UA&page=1®ion=UA', 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', json.results.length ? json : { results: [] });
        }, status.error.bind(status), false, true);

        // Оновлений запит для Популярні серіали: лише Miniseries (with_type=2), виключено 0,1,3,4,5
        get('/discover/tv?sort_by=popularity.desc&with_type=2', 1, function (json) {
            // Додаткова фільтрація, якщо типи все ж повертаються
            var filteredResults = json.results.filter(function (item) {
                // Отримуємо тип через додатковий запит, якщо потрібно, але тут спираємося на with_type
                return true; // with_type=2 уже фільтрує Miniseries, додаткова перевірка не потрібна
            });
            append(Lampa.Lang.translate('trailers_popular_series'), 'popular_series', '/discover/tv?with_type=2', filteredResults.length ? { results: filteredResults } : { results: [] });
        }, status.error.bind(status), false);

        get('/tv/on_the_air', 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_seasons'), 'upcoming_seasons', '/tv/on_the_air', json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);

        get('/tv/airing_today', 1, function (json) {
            append(Lampa.Lang.translate('trailers_upcoming_new_series'), 'upcoming_new_series', '/tv/airing_today', json.results.length ? json : { results: [] });
        }, status.error.bind(status), true);
    }

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
        trailers_upcoming_movies: {
            ru: 'Ожидаемые фильмы',
            uk: 'Очікувані фільми',
            en: 'Upcoming Movies'
        },
        trailers_upcoming_new_series: {
            ru: 'Новые сериали',
            uk: 'Нові серіали',
            en: 'New Series'
        }
    });

    function startPlugin() {
        if (window.plugin_trailers_ready) return;
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', Component$1);
        Lampa.Component.add('trailers_full', Component);
        Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
        Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');

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
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') add();
            });
        }
    }

    if (!window.plugin_trailers_ready) startPlugin();
})();
