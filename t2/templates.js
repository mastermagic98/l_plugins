export const translations = {
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
};

export function initTemplates() {
    Lampa.Template.add('trailer', '<div class="card selector card--trailer layer--render layer--visible"><div class="card__view"><img src="./img/img_load.svg" class="card__img"><div class="card__promo"><div class="card__promo-text"><div class="card__title"></div></div><div class="card__details"></div></div></div><div class="card__play"><img src="./img/icons/player/play.svg"></div></div>');
    Lampa.Template.add('trailer_style', '<style>.card.card--trailer,.card-more.more--trailers{width:25.7em}.card.card--trailer .card__view{padding-bottom:56%;margin-bottom:0}.card.card--trailer .card__details{margin-top:0.8em}.card.card--trailer .card__play{position:absolute;top:50%;transform:translateY(-50%);left:1.5em;background:#000000b8;width:2.2em;height:2.2em;border-radius:100%;text-align:center;padding-top:0.6em}.card.card--trailer .card__play img{width:0.9em;height:1em}.card.card--trailer .card__rating{position:absolute;bottom:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card.card--trailer .card__trailer-lang{position:absolute;top:0.5em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;text-transform:uppercase;font-size:1.2em}.card.card--trailer .card__release-date{position:absolute;top:2em;right:0.5em;background:#000000b8;padding:0.2em 0.5em;border-radius:3px;font-size:1.2em}.card-more.more--trailers .card-more__box{padding-bottom:56%}.category-full--trailers{display:flex;flex-wrap:wrap;justify-content:space-between}.category-full--trailers .card{width:33.3%;margin-bottom:1.5em}.category-full--trailers .card .card__view{padding-bottom:56%;margin-bottom:0}.items-line__more{display:inline-block;margin-left:10px;cursor:pointer;padding:0.5em 1em}@media screen and (max-width:767px){.category-full--trailers .card{width:50%}}@media screen and (max-width:400px){.category-full--trailers .card{width:100%}}</style>');
}
