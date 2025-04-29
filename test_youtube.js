(function () {
    "use strict";
    console.log('Trailers plugin: Script execution started at', new Date().toISOString());

    // Додаємо переклади
    Lampa.Lang.add({
        title_trailers: {
            ru: "Трейлеры",
            en: "Trailers",
            uk: "Трейлери",
            be: "Трэйлеры",
            zh: "预告片",
            pt: "Trailers",
            bg: "Трейлъри"
        },
        trailers_popular: {
            ru: "Популярные",
            uk: "Популярні",
            en: "Popular"
        },
        trailers_no_trailers: {
            ru: "Трейлеров не найдено",
            uk: "Трейлерів не знайдено",
            en: "No trailers found"
        },
        trailers_period_day: {
            ru: "День",
            uk: "День",
            en: "Day"
        },
        trailers_period_week: {
            ru: "Неделя",
            uk: "Тиждень",
            en: "Week"
        },
        trailers_period_year: {
            ru: "Год",
            uk: "Рік",
            en: "Year"
        }
    });

    // Зберігаємо налаштування
    var mediaType = Lampa.Storage.get('trailers_media_type', 'movie'); // movie або tv
    var period = Lampa.Storage.get('trailers_period', 'week'); // day, week, year
    var tmdb_api_key = Lampa.TMDB.key();
    var tmdb_base_url = 'https://api.themoviedb.org/3';
    var network = new Lampa.Reguest();

    // Функція для форматування дати
    function getFormattedDate(offsetDays, isEnd) {
        var today = new Date();
        if (offsetDays) today.setDate(today.getDate() + offsetDays);
        var year = today.getFullYear();
        var month = String(isEnd ? 12 : today.getMonth() + 1).padStart(2, '0');
        var day = String(isEnd ? 31 : today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Запит до TMDB API
    function get(url, page, resolve, reject) {
        var lang = Lampa.Storage.get('language', 'ru');
        var full_url = `${tmdb_base_url}${url}&api_key=${tmdb_api_key}&language=${lang}&page=${page}`;
        console.log('Trailers plugin: API Request:', full_url);
        network.silent(full_url, resolve, reject);
    }

    // Пошук трейлерів з пріоритетом на україномовні
    async function getTrailers(card) {
        var type = card.name ? 'tv' : 'movie';
        var langPriority = ['uk', 'ru', 'en']; // Пріоритет: українська, російська, англійська
        var allTrailers = [];
        var selectedTrailer = null;

        for (var lang of langPriority) {
            try {
                var url = `${tmdb_base_url}/${type}/${card.id}/videos?api_key=${tmdb_api_key}&language=${lang}`;
                console.log('Trailers plugin: Videos request:', url);
                var response = await fetch(url);
                var result = await response.json();
                console.log('Trailers plugin: Videos result for', lang, ':', result);
                if (result.results && result.results.length) {
                    result.results.forEach(function (video) {
                        if (video.type === 'Trailer' && video.site === 'YouTube') {
                            video.requested_lang = lang;
                            allTrailers.push(video);
                        }
                    });
                }
            } catch (error) {
                console.log('Trailers plugin: Videos error for', lang, ':', error);
            }
        }

        for (var lang of langPriority) {
            selectedTrailer = allTrailers.find(function (video) {
                return (video.iso_639_1 === lang || video.requested_lang === lang) && video.type === 'Trailer' && video.site === 'YouTube';
            });
            if (selectedTrailer) {
                selectedTrailer.iso_639_1 = lang;
                break;
            }
        }

        return selectedTrailer;
    }

    // Компонент для відображення карток
    function TrailerCard(data) {
        this.card = null;
        this.img = null;
        this.trailer = null;

        this.create = function () {
            console.log('Trailers plugin: Creating card for', data.title || data.name);
            this.card = $('<div class="card selector card--trailer layer--render layer--visible"></div>');
            var view = $('<div class="card__view"></div>').css({ 'padding-bottom': '56%', 'position': 'relative' });
            this.img = $('<img src="./img/img_load.svg" class="card__img">');
            var title = $('<div class="card__title"></div>').text(data.title || data.name);
            var promo = $('<div class="card__promo"><div class="card__promo-text"></div></div>');
            promo.find('.card__promo-text').append(title);
            var lang = $('<div class="card__lang">-</div>').css({ 
                'position': 'absolute', 'top': '0.5em', 'right': '0.5em', 
                'background': '#000000b8', 'color': 'white', 'padding': '0.2em 0.5em', 
                'border-radius': '3px', 'font-size': '0.9em' 
            });
            var rating = $('<div class="card__rating"></div>').text(data.vote_average ? data.vote_average.toFixed(1) : '-').css({ 
                'position': 'absolute', 'bottom': '0.5em', 'right': '0.5em', 
                'background': '#000000b8', 'color': 'white', 'padding': '0.2em 0.5em', 
                'border-radius': '3px', 'font-size': '1.2em' 
            });
            view.append(this.img).append(promo).append(lang).append(rating);
            this.card.append(view);

            // Завантаження зображення
            this.img.on('load', () => this.card.addClass('card--loaded'));
            this.img.on('error', () => this.img.attr('src', './img/img_broken.svg'));
            if (data.backdrop_path) {
                this.img.attr('src', Lampa.Api.img(data.backdrop_path, 'w500'));
            } else if (data.poster_path) {
                this.img.attr('src', Lampa.Api.img(data.poster_path));
            } else {
                this.img.attr('src', './img/img_broken.svg');
            }

            // Пошук трейлера
            getTrailers(data).then(trailer => {
                this.trailer = trailer;
                if (trailer) {
                    lang.text(trailer.iso_639_1.toUpperCase());
                }
            }).catch(() => {
                lang.text('-');
            });

            // Обробка натискання
            this.card.on('hover:enter', () => {
                if (this.trailer && this.trailer.key) {
                    Lampa.YouTube.play(this.trailer.key);
                } else {
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                }
            });
        };

        this.render = function () {
            return this.card;
        };

        this.destroy = function () {
            this.img.off('load').off('error');
            this.card.off('hover:enter');
            this.card.remove();
            this.card = null;
            this.img = null;
            this.trailer = null;
        };
    }

    // Компонент для списку трейлерів
    function TrailersList(object) {
        var scroll = new Lampa.Scroll({ horizontal: true });
        var items = [];
        var html = $('<div></div>');

        this.create = function () {
            console.log('Trailers plugin: Creating TrailersList');
            scroll.render().find('.scroll__body').addClass('items-cards');
            html.append(scroll.render());

            // Запит популярних фільмів/серіалів
            var dateRange;
            if (period === 'day') dateRange = getFormattedDate(-1);
            else if (period === 'week') dateRange = getFormattedDate(-7);
            else dateRange = getFormattedDate(-365);

            get(`/${mediaType}/popular?sort_by=vote_average.desc&primary_release_date.gte=${dateRange}`, 1, 
                (result) => {
                    console.log('Trailers plugin: API response:', result);
                    if (result.results && result.results.length) {
                        result.results.forEach(item => {
                            var card = new TrailerCard(item);
                            card.create();
                            scroll.append(card.render());
                            items.push(card);
                        });
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    }
                    this.activity.loader(false);
                    this.activity.toggle();
                }, 
                () => {
                    console.log('Trailers plugin: API request failed');
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    this.activity.loader(false);
                    this.activity.toggle();
                }
            );
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(false, scroll.render());
                },
                left: () => Lampa.Controller.toggle('menu'),
                right: () => Navigator.move('right'),
                up: () => Lampa.Controller.toggle('head'),
                down: () => Navigator.move('down'),
                back: () => Lampa.Activity.backward()
            });
            Lampa.Controller.toggle('content');
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            items.forEach(item => item.destroy());
            scroll.destroy();
            html.remove();
            items = [];
        };
    }

    // Головний компонент
    function TrailersMain(object) {
        this.create = function () {};
        this.build = function () {};
        this.start = function () {};
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {};
        this.destroy = function () {};
    }

    // Додавання меню
    function add() {
        console.log('Trailers plugin: Adding menu button at', new Date().toISOString());
        var ico = `
            <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>
            </svg>
        `;
        var menu_items = $(`
            <li class="menu__item selector" data-action="trailers">
                <div class="menu__ico">${ico}</div>
                <div class="menu__text">${Lampa.Lang.translate('title_trailers')}</div>
            </li>
        `);

        // Додаємо кнопки вибору "Фільми" і "Серіали"
        var switcher = $('<div class="trailers-switcher"></div>');
        var movieButton = $('<div class="menu__item selector"><div class="menu__text">Фільми</div></div>');
        var seriesButton = $('<div class="menu__item selector"><div class="menu__text">Серіали</div></div>');
        if (mediaType === 'movie') movieButton.addClass('active');
        else seriesButton.addClass('active');

        movieButton.on('hover:enter', function () {
            console.log('Trailers plugin: Switching to movies');
            Lampa.Storage.set('trailers_media_type', 'movie');
            mediaType = 'movie';
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                component: 'trailers_main',
                page: 1
            });
        });

        seriesButton.on('hover:enter', function () {
            console.log('Trailers plugin: Switching to series');
            Lampa.Storage.set('trailers_media_type', 'tv');
            mediaType = 'tv';
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                component: 'trailers_main',
                page: 1
            });
        });

        switcher.append(movieButton).append(seriesButton);

        // Додаємо кнопки вибору періоду
        var periodSelect = $('<div class="period-select"></div>');
        var periods = ['day', 'week', 'year'];
        periods.forEach(function (p) {
            var periodButton = $(`<span class="period-button selector">${Lampa.Lang.translate('trailers_period_' + p)}</span>`);
            if (p === period) periodButton.addClass('active');
            periodButton.on('hover:enter', function () {
                console.log('Trailers plugin: Switching period to', p);
                Lampa.Storage.set('trailers_period', p);
                period = p;
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_trailers'),
                    component: 'trailers_main',
                    page: 1
                });
            });
            periodSelect.append(periodButton);
        });

        // Додаємо обробник для кнопки "Трейлери"
        menu_items.on('hover:enter', function () {
            console.log('Trailers plugin: Menu button clicked');
            var content = $('<div></div>');
            content.append(switcher).append(periodSelect);
            var list = new TrailersList();
            list.activity = {
                loader: (state) => state ? Lampa.Loading.start() : Lampa.Loading.stop(),
                toggle: () => Lampa.Controller.toggle('content')
            };
            list.create();
            content.append(list.render());
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_trailers'),
                component: 'trailers_main',
                page: 1,
                content: content
            });
        });

        // Додаємо в друге меню
        var secondMenu = $(".menu .menu__list").eq(1);
        if (secondMenu.length) {
            console.log('Trailers plugin: Appending to second menu');
            secondMenu.append(menu_items);
        } else {
            console.log('Trailers plugin: Second menu not found, trying first menu');
            var firstMenu = $(".menu .menu__list").eq(0);
            if (firstMenu.length) {
                firstMenu.append(menu_items);
            } else {
                console.log('Trailers plugin: No menus available');
            }
        }
    }

    // Ініціалізація плагіна
    function createTrailersPlugin() {
        console.log('Trailers plugin: createTrailersPlugin called at', new Date().toISOString());
        if (window.plugin_trailers_ready) {
            console.log('Trailers plugin: Already initialized');
            return;
        }
        window.plugin_trailers_ready = true;
        Lampa.Component.add('trailers_main', TrailersMain);
        if (window.appready) {
            console.log('Trailers plugin: appready true, calling add');
            add();
        } else {
            console.log('Trailers plugin: waiting for app ready');
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    console.log('Trailers plugin: app ready event, calling add');
                    add();
                }
            });
        }
    }

    if (!window.plugin_trailers_ready) {
        console.log('Trailers plugin: Initializing plugin');
        createTrailersPlugin();
    } else {
        console.log('Trailers plugin: Plugin already initialized');
    }
})();
