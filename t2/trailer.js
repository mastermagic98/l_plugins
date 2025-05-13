(function () {
    function Trailer(data, params) {
        this.build = function () {};
        this.cardImgBackground = function (card_data) {};
        this.image = function () {};
        this.loadTrailerInfo = function () {};
        this.play = function (id) {};

        this.create = function () {
            var _this2 = this;
            console.log('Trailer.create called:', data);
            this.build();
            if (!this.is_youtube) {
                window.LampaPlugin.Api.videos(data, function (videos) {
                    var trailers = videos.results ? videos.results.filter(function (v) {
                        return v.type === 'Trailer';
                    }) : [];
                    if (trailers.length === 0) {
                        _this2.card = null;
                        return;
                    }
                    // Обробка подій...
                    _this2.image();
                    _this2.loadTrailerInfo();
                }, function () {
                    _this2.card = null;
                });
            } else {
                // YouTube логіка
            }
        };

        this.destroy = function () {};
        this.visible = function () {};
        this.render = function () {
            return this.card || $('<div></div>');
        };
    }

    window.LampaPlugin = window.LampaPlugin || {};
    window.LampaPlugin.Trailer = Trailer;
})();
