(function(){
    window.TrailersComponent = {
        baseImageUrl: 'https://image.tmdb.org/t/p/w500',

        filter: function(){
            this.filters = [];
            var periods = this.getFilterItems();

            this.filters.push({
                title: Lampa.Lang.translate('trailers_filter'),
                separator: true,
                items: periods
            });

            this.filters.push({
                title: Lampa.Lang.translate('trailers_filter'),
                separator: true,
                items: {
                    movies: Lampa.Lang.translate('trailers_movies'),
                    series: Lampa.Lang.translate('trailers_series')
                }
            });
        },

        getFilterItems: function(){
            var periods = {
                today: Lampa.Lang.translate('trailers_filter_today'),
                week: Lampa.Lang.translate('trailers_filter_week'),
                month: Lampa.Lang.translate('trailers_filter_month'),
                year: Lampa.Lang.translate('trailers_filter_year')
            };

            return periods;
        },

        render_cards: function(data, params){
            params = params || {};
            var container = $('<div class="trailers-list"></div>');

            if(!data || !Array.isArray(data)){
                console.error('[Trailers]','No data or invalid data format:',data);
                return container;
            }

            data.forEach(function(item){
                if(item && item.id && item.title && item.poster_path){
                    var card = this.createCard(item, params);
                    container.append(card);
                    console.log('[Trailers]','Card:',item.id,'Title:',item.title,'Date:',item.release_date || item.first_air_date || '-');
                }
            }.bind(this));

            return container;
        },

        createCard: function(data, params){
            params = params || {};
            var card = $('<div class="trailers-card"></div>');
            var img = $('<div class="trailers-card__img"><img src="'+(this.baseImageUrl+data.poster_path)+'" alt="'+(data.title || '')+'"></div>');
            var title = $('<div class="trailers-card__title">'+(data.title || '')+'</div>');
            var releaseDate = formatDate(data.release_date || data.first_air_date);
            if(params.category === 'in_theaters') releaseDate = '';
            var date = $('<div class="trailers-card__date">'+releaseDate+'</div>');

            card.append(img).append(title).append(date);

            card.on('hover:enter', function(){
                var videos = data.videos && data.videos.results ? data.videos.results.filter(function(v){ return v.type === 'Trailer' && v.site === 'YouTube'; }) : [];
                var lang = (Lampa.Platform.language ? Lampa.Platform.language() : 'uk').split('-')[0];
                var no_trailer_key = lang === 'uk' ? 'trailers_no_ua_trailer' : lang === 'ru' ? 'trailers_no_ru_trailer' : 'trailers_no_trailers';

                if(videos.length > 0){
                    Lampa.Player.play({
                        url: 'https://www.youtube.com/watch?v='+videos[0].key,
                        title: data.title,
                        quality: {'1080': '1080p', '720': '720p'}
                    });
                } else {
                    Lampa.Noty.show(Lampa.Lang.translate(no_trailer_key));
                    console.log('[Trailers]','No YouTube trailer for:',data.id,data.title);
                }
            });

            card.on('hover:focus', function(){
                if(typeof params.onFocus === 'function') params.onFocus(data);
            });

            return card;
        },

        contextmenu: function(){
            var menu = [];

            menu.push({
                title: Lampa.Lang.translate('trailers_view'),
                view: true
            });

            return menu;
        },

        create: function(params){
            params = params || {};
            this.filter();

            return this.render(params);
        },

        render: function(params){
            params = params || {};
            var content = $('<div class="trailers-content"></div>');
            var category = params.category || 'popular_movies';
            var filter = params.filter || {};

            console.log('[Trailers]','Rendering category:',category);

            try{
                var self = this;
                return Api.getData(category, params.page || 1, filter).then(function(data){
                    if(data && data.results){
                        var cards = self.render_cards(data.results, {
                            category: category,
                            onFocus: params.onFocus
                        });

                        var title = $('<div class="trailers-category__title">'+self.getCategoryTitle(category)+'</div>');
                        content.append(title).append(cards);

                        if(data.total_pages > (params.page || 1)){
                            var more = $('<div class="trailers-category__more">'+Lampa.Lang.translate('trailers_more')+'</div>');
                            more.on('hover:enter', function(){
                                self.render({
                                    category: category,
                                    page: (params.page || 1) + 1,
                                    filter: filter,
                                    onFocus: params.onFocus
                                }).then(function(nextContent){
                                    content.append(nextContent);
                                });
                            });
                            content.append(more);
                        } else {
                            console.log('[Trailers]','No more data for category:',category);
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
                        }
                    } else {
                        console.error('[Trailers]','No results for category:',category);
                    }
                    return content;
                }).catch(function(e){
                    console.error('[Trailers]','Error rendering category:',category,'Error:',e.message);
                    return content;
                });
            } catch(e){
                console.error('[Trailers]','Error rendering category:',category,'Error:',e.message);
                return content;
            }
        },

        getCategoryTitle: function(category){
            var titles = {
                'popular_movies': Lampa.Lang.translate('trailers_popular_movies'),
                'upcoming_movies': Lampa.Lang.translate('trailers_upcoming_movies'),
                'in_theaters': Lampa.Lang.translate('trailers_in_theaters'),
                'popular_series': Lampa.Lang.translate('trailers_popular_series'),
                'new_series_seasons': Lampa.Lang.translate('trailers_new_series_seasons'),
                'upcoming_series': Lampa.Lang.translate('trailers_upcoming_series')
            };

            return titles[category] || 'Unknown';
        },

        visible: function(){
            console.log('[Trailers]','Component visible');
        },

        append: function(params){
            params = params || {};
            return this.render(params);
        },

        update: function(params){
            params = params || {};
            return this.render(params);
        },

        full: function(params){
            params = params || {};
            return this.render(params);
        },

        clear: function(){
            console.log('[Trailers]','Clearing component');
        },

        init: function(){
            console.log('[Trailers]','Component initialized');
        },

        destroy: function(){
            console.log('[Trailers]','Component destroyed');
        }
    };
})();
