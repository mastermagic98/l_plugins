(function() {
    'use strict';

    window.TrailersComponent = {
        async render_cards(data, params = {}) {
            let container = $('<div class="trailers-list"></div>');
            if (!data || !Array.isArray(data)) {
                console.error('Trailers', 'No data or invalid data format:', data);
                return container;
            }
            data.forEach(item => {
                if (item && item.id && item.title && item.poster_path) {
                    let card = this.createCard(item, params);
                    container.append(card);
                    console.log('Trailers', 'Card:', item.id, 'Title:', item.title, 'Date:', item.release_date || item.first_air_date || '-');
                }
            });
            return container;
        },

        createCard(data, params = {}) {
            let card = $('<div class="trailers-card"></div>');
            let img = $('<div class="trailers-card__img"><img src="' + (this.baseImageUrl + data.poster_path) + '" alt="' + (data.title || '') + '"></div>');
            let title = $('<div class="trailers-card__title">' + (data.title || '') + '</div>');
            let releaseDate = formatDate(data.release_date || data.first_air_date);
            if (params.category === 'in_theaters') releaseDate = '';
            let date = $('<div class="trailers-card__date">' + releaseDate + '</div>');

            card.append(img).append(title).append(date);

            card.on('hover:enter', () => {
                let videos = data.videos && data.videos.results ? data.videos.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube') : [];
                if (videos.length > 0) {
                    Lampa.Player.play({
                        url: 'https://www.youtube.com/watch?v=' + videos[0].key,
                        title: data.title,
                        quality: { '1080': '1080p', '720': '720p' }
                    });
                } else {
                    console.log('Trailers', 'No YouTube trailer for:', data.id, data.title);
                }
            });

            return card;
        },

        async render(params = {}) {
            let content = $('<div class="trailers-content"></div>');
            let category = params.category || 'popular_movies';
            console.log('Trailers', 'Rendering category:', category);

            try {
                let data = await Api.getData(category, params.page || 1);
                if (data && data.results) {
                    let cards = await this.render_cards(data.results, { category: category });
                    let title = $('<div class="trailers-category__title">' + this.getCategoryTitle(category) + '</div>');
                    content.append(title).append(cards);

                    if (data.total_pages > params.page) {
                        let more = $('<div class="trailers-category__more">Load more</div>');
                        more.on('hover:enter', () => {
                            this.render({ category: category, page: (params.page || 1) + 1 }).then(nextContent => {
                                content.append(nextContent);
                            });
                        });
                        content.append(more);
                    }
                } else {
                    console.error('Trailers', 'No results for category:', category);
                }
            } catch (e) {
                console.error('Trailers', 'Error rendering category:', category, 'Error:', e.message);
            }

            return content;
        },

        getCategoryTitle(category) {
            const titles = {
                'popular_movies': Lampa.Lang.translate('title_popular') || 'Популярні',
                'upcoming_movies': Lampa.Lang.translate('title_upcoming') || 'Очікувані',
                'in_theaters': Lampa.Lang.translate('title_in_theaters') || 'У прокаті'
            };
            return titles[category] || 'Unknown';
        },

        async full(params = {}) {
            let content = await this.render(params);
            return content;
        },

        clear() {
            console.log('Trailers', 'Clearing component');
        },

        init() {
            console.log('Trailers', 'Component initialized');
            this.baseImageUrl = 'https://image.tmdb.org/t/p/w500';
        },

        destroy() {
            console.log('Trailers', 'Component destroyed');
        }
    };
})();
