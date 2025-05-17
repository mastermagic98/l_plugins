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
    var Component = {
        render_cards: function (data, params) {
            var cards = [];
            var lang = Lampa.Storage.get('language', 'ru');

            data.forEach(function (item) {
                var results = item.results || [];
                results.forEach(function (card) {
                    var is_movie = !card.name;
                    var title = is_movie ? (card.title || '') : (card.name || '');
                    var original_title = is_movie ? (card.original_title || '') : (card.original_name || '');
                    var date = '';

                    // Add date for upcoming_movies and popular_movies
                    if (item.type === 'upcoming_movies' || item.type === 'popular_movies') {
                        if (card.release_details && card.release_details.release_date) {
                            date = card.release_details.release_date;
                        } else if (card.release_date) {
                            date = card.release_date;
                        }
                    } else if (!is_movie && card.first_air_date) {
                        date = card.first_air_date;
                    }

                    if (date) {
                        try {
                            date = Lampa.Utils.dateFormat(new Date(date), lang === 'ru' ? 'DD.MM.YYYY' : lang === 'uk' ? 'DD.MM.YYYY' : 'MM/DD/YYYY');
                        } catch (e) {
                            console.log('Trailers', 'Date parse error:', card.id, date);
                            date = '';
                        }
                    }

                    console.log('Trailers', 'Card:', card.id, 'Title:', title, 'Date:', date);

                    var img = card.poster_path ? 'https://image.tmdb.org/t/p/w300' + card.poster_path : './img/poster.png';
                    var card_data = {
                        id: card.id,
                        type: is_movie ? 'movie' : 'tv',
                        title: title,
                        original_title: original_title,
                        img: img,
                        date: date,
                        category_type: item.type,
                        category_url: item.url
                    };
                    cards.push(card_data);
                });
            });

            var html = $('<div class="trailers-list"></div>');

            cards.forEach(function (card) {
                var card_html = $('<div class="trailers-card selector"></div>');
                var img = $('<div class="trailers-card__img"><img src="' + card.img + '" /></div>');
                var title = $('<div class="trailers-card__title">' + card.title + '</div>');
                var date_html = card.date ? $('<div class="trailers-card__date">' + card.date + '</div>') : $();

                card_html.append(img).append(title);
                if (card.date) {
                    card_html.append(date_html);
                }

                card_html.data('card', card);

                card_html.on('hover:enter', function () {
                    var _card = $(this).data('card');
                    Api.videos(_card, function (videos) {
                        if (videos.results && videos.results.length) {
                            var video = videos.results[0];
                            var url = 'https://www.youtube.com/watch?v=' + video.key;
                            Lampa.Player.play({
                                url: url,
                                title: _card.title,
                                quality: { 1080: url },
                                only_one_player: true
                            });
                            Lampa.Player.playlist([{
                                url: url,
                                title: _card.title
                            }]);
                        }
                    }, function () {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailer'));
                    });
                });

                html.append(card_html);
            });

            if (params && params.append) {
                params.append.append(html);
            }

            return cards.length ? html : false;
        },

        render: function (data, params) {
            var html = $('<div></div>');

            data.forEach(function (item) {
                var title = $('<div class="trailers-category__title">' + item.title + '</div>');
                var list = Component.render_cards([item], params);
                var more = item.type && item.url ? $('<div class="trailers-category__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>') : $();

                more.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: item.url,
                        title: item.title,
                        component: 'trailers_full',
                        type: item.type,
                        page: 1
                    });
                });

                var category = $('<div class="trailers-category"></div>');
                category.append(title);
                if (list) category.append(list);
                category.append(more);

                html.append(category);
            });

            return html;
        },

        full: function (data, params) {
            var html = Component.render_cards([data], { append: false });
            if (html) {
                var title = $('<div class="trailers-category__title">' + data.title + '</div>');
                var category = $('<div class="trailers-category"></div>');
                category.append(title).append(html);
                return category;
            }
            return $('<div></div>');
        },

        clear: function () {
            // Clear logic if needed
        }
    };

    console.log('Trailers', 'Component defined');
    window.TrailersComponent = Component;
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
            Lampa.Component.add('trailers', window.TrailersComponent);
            Lampa.Components = Lampa.Components || {};
            Lampa.Components['trailers'] = window.TrailersComponent;
            Lampa.Template.add('trailers_css', '<style>.trailers-list{display:flex;flex-wrap:wrap;gap:20px}.trailers-card{width:150px;cursor:pointer}.trailers-card__img img{width:100%;border-radius:8px}.trailers-card__title{font-size:14px;margin-top:8px;color:#fff}.trailers-card__date{font-size:12px;color:#999;margin-top:4px}.trailers-category__title{font-size:18px;margin:20px 0 10px;color:#fff}.trailers-category__more{font-size:14px;color:#1e88e5;cursor:pointer;margin-top:10px}</style>');
            console.log('Trailers', 'Component and CSS added');
        } catch (e) {
            console.error('Trailers', 'Error adding component:', e.message);
        }

        Lampa.Listener.follow('app', {
            ready: function () {
                console.log('Trailers', 'App ready, ensuring component is added');
                try {
                    Lampa.Component.add('trailers', window.TrailersComponent);
                    Lampa.Components['trailers'] = window.TrailersComponent;
                    console.log('Trailers', 'Component added in app.ready');
                } catch (e) {
                    console.error('Trailers', 'Error in app.ready:', e.message);
                }
            }
        });
    }

    console.log('Trailers', 'init.js loaded');
    startPlugin();
})();
})();
