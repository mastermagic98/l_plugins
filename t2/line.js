(function () {
    function Line(params) {
        this.params = params;
        this.container = $('<div class="items-line"></div>');
        this.cards = [];
        this.page = 1;
        this.count = 20;
        this.more = $('<div class="card-more more--trailers"><div class="card-more__box"><div class="card-more__text">' + Lampa.Lang.translate('trailers_more') + '</div></div></div>');
        console.log('[Line] Initialized with params:', params);

        this.load = function () {
            if (this.params.category) {
                var url = Lampa.TMDB.url(this.params.type + '/' + this.params.category);
                var language = Lampa.Storage.get('language', 'uk');
                var region = language === 'uk' ? 'UA' : language === 'ru' ? 'RU' : 'US';

                if (this.params.filter) {
                    url = Lampa.TMDB.url('trending/' + this.params.type + '/' + this.params.filter);
                }

                Lampa.TMDB.get(
                    url,
                    {
                        language: language,
                        region: region,
                        page: this.page
                    },
                    function (data) {
                        if (data.results && data.results.length) {
                            data.results.forEach(function (item) {
                                var card = new window.plugin_upcoming.Trailer(item, this.params);
                                this.cards.push(card);
                                this.container.append(card.card);
                            }.bind(this));

                            if (data.results.length < this.count) {
                                this.more.hide();
                            } else {
                                this.container.append(this.more);
                            }
                        } else {
                            this.more.hide();
                            if (this.page === 1) {
                                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                            }
                        }

                        if (!data.results.length && this.page > 1) {
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
                        }

                        this.page++;
                    }.bind(this),
                    function () {
                        this.more.hide();
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    }.bind(this)
                );
            }
        }.bind(this);

        this.load();

        this.more.on('hover:enter', function () {
            this.load();
        }.bind(this));

        this.destroy = function () {
            this.cards.forEach(function (c) {
                c.card.remove();
            });
            this.cards = [];
            this.container.remove();
            this.more.remove();
        };
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Line = Line;
})();
