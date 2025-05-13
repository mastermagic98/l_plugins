(function () {
    function line(data) {
        var _this = this;

        this.element;

        this.create = function () {
            _this.element = $('<div class="line"><div class="line__title">' + Lampa.Utils.shortText(data.title, 34) + '</div><div class="line__cards scroll--h"></div></div>');

            data.results.forEach(function (item) {
                var card = new window.plugin_upcoming.trailer(item);
                card.create();
                var rendered = card.render();

                if (rendered) _this.element.find('.line__cards').append(rendered);
            });

            _this.element.find('.line__cards .trailer').on('hover:focus', function (e, data) {
                scroll.update($(this), true);
                Lampa.Background.change(Lampa.TMDB.image('backdrop_path', data.backdrop_path, true));
            });
        };

        this.toggle = function () {
            var cards = _this.element.find('.line__cards .trailer');

            if (cards.length) {
                Lampa.Controller.enabled().collectionSet(_this.element.find('.line__cards'));
                Lampa.Controller.collectionFocus(cards.eq(0), _this.element.find('.line__cards'));
            }
        };

        this.render = function () {
            return _this.element;
        };

        this.destroy = function () {
            if (_this.element) _this.element.remove();
            _this.element = null;
        };
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.line = line;
})();
