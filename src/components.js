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
