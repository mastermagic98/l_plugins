(function () {
    'use strict';

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        var date = new Date(dateStr);
        if (isNaN(date.getTime())) return '-';
        var lang = (Lampa && Lampa.Platform && typeof Lampa.Platform.language === 'function' && Lampa.Platform.language()) || 'uk';
        if (lang === 'en') {
            return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        }
        return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
    }

    var TrailersComponent = {
        baseImageUrl: 'https://image.tmdb.org/t/p/w500',
        filters: {
            period: ['today', 'week', 'month', 'year'],
            type: ['movies', 'series']
        },
        filter: function () {
            return {
                period: this.filters.period[0],
                type: this.filters.type[0]
            };
        },
        getFilterItems: function () {
            var items = [];
            var _this = this;
            this.filters.period.forEach(function (p) {
                items.push({
                    title: Lampa.Lang.translate('trailers_filter_' + p),
                    value: p
                });
            });
            this.filters.type.forEach(function (t) {
                items.push({
                    title: Lampa.Lang.translate('trailers_' + t),
                    value: t
                });
            });
            return items;
        },
        render_cards: function (data, category) {
            var _this = this;
            data.results.forEach(function (item) {
                var releaseDate = item.release_date || item.first_air_date;
                var formattedDate = category === 'in_theaters' ? '' : formatDate(releaseDate);
                console.log('[Trailers]','Card:',item.id,'Title:',item.title || item.name,'Date:',formattedDate);
            });
        },
        createCard: function (item, category) {
            var card = document.createElement('div');
            card.className = 'trailers-card';
            var img = document.createElement('img');
            img.src = this.baseImageUrl + (item.poster_path || item.backdrop_path);
            var title = document.createElement('div');
            title.className = 'trailers-card__title';
            title.textContent = item.title || item.name;
            var date = document.createElement('div');
            date.className = 'trailers-card__date';
            var releaseDate = item.release_date || item.first_air_date;
            date.textContent = category === 'in_theaters' ? '' : formatDate(releaseDate);
            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(date);
            return card;
        },
        contextmenu: function () {
            return [{
                title: Lampa.Lang.translate('trailers_view'),
                action: function () {
                    console.log('[Trailers]','Context menu action triggered');
                }
            }];
        },
        create: function () {
            console.log('[Trailers]','Creating component');
            var container = document.createElement('div');
            container.className = 'trailers-list';
            return container;
        },
        render: function () {
            var container = this.create();
            return container;
        },
        getCategoryTitle: function (category) {
            return Lampa.Lang.translate('trailers_' + category);
        },
        visible: function () {
            console.log('[Trailers]','Component visible');
        },
        destroy: function () {
            console.log('[Trailers]','Component destroyed');
        }
    };

    window.TrailersComponent = TrailersComponent;
})();
