(function () {
    function Line(params) {
        var _this = this;
        this.params = params;
        this.cards = [];
        this.container = $('<div class="items-line category-full category-full--trailers"></div>');
        this.more = $('<div class="card-more more--trailers selector"><div class="card-more__box"><div class="card-more__title">' + Lampa.Lang.translate('trailers_more') + '</div></div></div>');
        this.container.append(this.more);
        this.page = 1;
        this.load = window.plugin_upcoming.utils.debounce(function () {
            _this.loading(true);
            window.plugin_upcoming.Api.full({
                category: _this.params.category,
                page: _this.page
            }, function (data) {
                _this.loading(false);
                data.results.forEach(function (item) {
                    var card = new window.plugin_upcoming.Trailer(item, _this.params);
                    _this.cards.push(card);
                    _this.container.append(card.card);
                });
                if (_this.page >= data.total_pages) {
                    _this.more.hide();
                    if (data.results.length === 1) {
                        var title = data.results[0].title;
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_last_movie').replace('[title]', title));
                    } else if (!data.results.length) {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
                    }
                }
            }, function () {
                _this.loading(false);
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            });
        }, 100);
        this.more.on('hover:enter', function () {
            _this.page++;
            _this.load();
        });
        this.loading(false);
        this.load();
    }

    Line.prototype.loading = function (status) {
        if (status) {
            this.container.addClass('loading');
        } else {
            this.container.removeClass('loading');
        }
    };

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Line = Line;
})();
