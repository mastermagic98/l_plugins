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

    function startPlugin(){
        console.log('[Trailers]','startPlugin called');

        if(!window.TrailersComponent){
            console.error('[Trailers]','TrailersComponent not defined');
            return;
        }

        try{
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;

            if(typeof Lampa.Component === 'object' && typeof Lampa.Component.add === 'function'){
                Lampa.Component.add('trailers',window.TrailersComponent);
            }

            Lampa.Template.add('trailers_css',`
                <style>
                    .trailers-list { display: flex; flex-wrap: wrap; gap: 20px; }
                    .trailers-card { width: 150px; cursor: pointer; }
                    .trailers-card__img img { width: 100%; border-radius: 8px; }
                    .trailers-card__title { font-size: 14px; margin-top: 8px; color: #fff; }
                    .trailers-card__date { font-size: 12px; color: #999; margin-top: 4px; }
                    .trailers-category__title { font-size: 18px; margin: 20px 0 10px; color: #fff; }
                    .trailers-category__more { font-size: 14px; color: #1e88e5; cursor: pointer; margin-top: 10px; }
                </style>
            `);

            try{
                Lampa.Menu = Lampa.Menu || {};
                Lampa.Menu.items = Lampa.Menu.items || [];
                Lampa.Menu.items.push({
                    title: 'Трейлери',
                    component: 'trailers'
                });

                console.log('[Trailers]','Menu item added');
                console.log('[Trailers]','Menu item details:',Lampa.Menu.items[Lampa.Menu.items.length - 1]);
                console.log('[Trailers]','Available components:',Object.keys(Lampa.Components));
                console.log('[Trailers]','Menu items:',Lampa.Menu.items);
                console.log('[Trailers]','TrailersComponent methods:',Object.keys(window.TrailersComponent));

                if(typeof Lampa.Menu.ready === 'function') {
                    Lampa.Menu.ready();
                    console.log('[Trailers]','Menu updated via Lampa.Menu.ready');
                }
                if(typeof Lampa.Menu.render === 'function') {
                    Lampa.Menu.render();
                    console.log('[Trailers]','Menu updated via Lampa.Menu.render');
                }
                setTimeout(function(){
                    if(typeof Lampa.Menu.render === 'function') {
                        Lampa.Menu.render();
                        console.log('[Trailers]','Menu updated via delayed Lampa.Menu.render');
                    }
                    console.log('[Trailers]','Final menu items:',Lampa.Menu.items);
                },500);
            }
            catch(e){
                console.error('[Trailers]','Error adding menu item:',e.message);
            }
        }
        catch(e){
            console.error('[Trailers]','Error registering component:',e.message);
        }
    }

    console.log('[Trailers]','init.js loaded');
    startPlugin();
})();
