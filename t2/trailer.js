(function () {
    function Trailer(data, params) {
        var _this = this;
        this.card = Lampa.Template.get('trailer', true);
        this.data = data;
        this.params = params;
        this.card.addClass('card--trailer');
        var img = this.card.find('.card__img')[0];
        img.onerror = function () {
            img.src = './img/img_broken.svg';
        };
        img.src = Lampa.TMDB.image('w300' + data.poster_path);
        this.card.find('.card__title').text(data.title);
        this.card.find('.card__details').text(window.plugin_upcoming.utils.formatDateToDDMMYYYY(data.release_date));
        if (data.vote_average) {
            this.card.append('<div class="card__rating">' + data.vote_average.toFixed(1) + '</div>');
        }
        if (data.release_date) {
            this.card.append('<div class="card__release-date">' + window.plugin_upcoming.utils.formatDateToDDMMYYYY(data.release_date) + '</div>');
        }
        this.card.on('hover:enter', function () {
            window.plugin_upcoming.Api.videos(data.id, data.media_type, function (video) {
                _this.card.append('<div class="card__trailer-lang">' + video.lang + '</div>');
                Lampa.Player.play({
                    url: 'https://www.youtube.com/watch?v=' + video.key,
                    title: video.name
                });
                Lampa.Player.title(data.title);
            }, function (error) {
                Lampa.Noty.show(error);
            });
        });
        this.card.on('hover:focus', function () {
            Lampa.Scroll.update(_this.card);
        });
        this.card.on('hover:long', function () {
            window.plugin_upcoming.Api.clear();
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
        });
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.Trailer = Trailer;
})();
