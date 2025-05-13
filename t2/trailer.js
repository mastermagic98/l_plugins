(function () {
    function trailer(data, params) {
        var _this = this;

        this.card;

        this.build = function () {
            _this.card = $('<div class="trailer card--trailer"><div class="trailer__content"></div></div>');
            _this.card.data('card', data);
        };

        this.cardImgBackground = function (card_data) {
            if (card_data.backdrop_path) {
                _this.card.find('.trailer__content').addClass('bg--trailer').css({
                    'background-image': 'url(https://image.tmdb.org/t/p/w500' + card_data.backdrop_path + ')'
                });
            } else if (card_data.poster_path) {
                _this.card.find('.trailer__content').addClass('bg--trailer').css({
                    'background-image': 'url(https://image.tmdb.org/t/p/w500' + card_data.poster_path + ')'
                });
            }
        };

        this.image = function () {
            var img = document.createElement('img');
            var url = 'https://image.tmdb.org/t/p/w500' + (data.poster_path || data.backdrop_path || '');

            img.onerror = function () {
                img.src = './img/img_broken.svg';
            };

            img.onload = function () {
                _this.card.find('.trailer__content').css({
                    'background-image': 'url(' + url + ')'
                }).addClass('bg--trailer');
            };

            img.src = url;
        };

        this.loadTrailerInfo = function () {
            var content = _this.card.find('.trailer__content');
            var title = data.title || data.name;

            content.append('<div class="trailer__details"><div class="trailer__title">' + title + '</div></div>');

            if (data.vote_average) content.find('.trailer__details').append('<div class="trailer__rate">IMDb: ' + parseFloat(data.vote_average).toFixed(1) + '</div>');
        };

        this.play = function (id) {
            var videos = _this.card.data('videos');

            Lampa.TMDB.video(data.id, data.name ? 'tv' : 'movie', function (v) {
                var video = v.results.find(function (a) {
                    return a.key == id;
                });

                if (video) {
                    var link = 'https://www.youtube.com/watch?v=' + video.key;
                    Lampa.Player.play({
                        url: link,
                        title: data.title || data.name,
                        quality: {
                            selected: '1080p'
                        }
                    });
                    Lampa.Player.opened();
                }
            });
        };

        this.create = function () {
            _this.build();

            var is_youtube = params && params.youtube;

            if (!is_youtube) {
                Lampa.TMDB.video(data.id, data.name ? 'tv' : 'movie', function (videos) {
                    _this.card.data('videos', videos);

                    var btn = $('<div class="trailer__btn selector"></div>');

                    if (videos.results && videos.results.length) {
                        btn.on('hover:enter', function () {
                            var list = [];

                            videos.results.forEach(function (video) {
                                list.push({
                                    title: video.name,
                                    source: video.key,
                                    url: video.key
                                });
                            });

                            Lampa.Select.show({
                                title: Lampa.Lang.translate('title_action'),
                                items: list,
                                onSelect: function (item) {
                                    _this.play(item.url);
                                },
                                onBack: function () {
                                    Lampa.Controller.toggle('content');
                                }
                            });
                        });
                    } else {
                        _this.card = null;
                        return;
                    }

                    _this.card.find('.trailer__content').append(btn);
                    _this.image();
                    _this.loadTrailerInfo();
                }, function () {
                    _this.card = null;
                });
            } else {
                _this.card.find('.trailer__content').append('<div class="trailer__btn selector"></div>').addClass('youtube');

                _this.card.find('.trailer__btn').on('hover:enter', function () {
                    _this.play(data.youtube);
                });

                _this.image();
                _this.loadTrailerInfo();
            }

            _this.card.on('hover:focus', function (e) {
                scroll.update(_this.card, true);
            }).on('hover:enter', function () {
                var videos = _this.card.data('videos');

                if (videos && videos.results && videos.results.length == 1) {
                    _this.play(videos.results[0].key);
                }
            }).on('hover:long', function () {
                Lampa.TMDB.get(data.name ? 'tv' : 'movie', data.id, function (elem) {
                    elem.card = _this.card;

                    Lampa.Activity.push({
                        url: '',
                        component: 'full',
                        id: data.id,
                        method: data.name ? 'tv' : 'movie',
                        card: elem,
                        source: 'tmdb'
                    });
                });
            });
        };

        this.destroy = function () {
            if (_this.card) _this.card.remove();
            _this.card = null;
        };

        this.visible = function () {
            if (Lampa.Platform.is('webos')) {
                _this.card.find('img').each(function () {
                    var img = $(this)[0];

                    if (img.onerror) img.onerror();
                });
            }
        };

        this.render = function () {
            return _this.card;
        };
    }

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.trailer = trailer;
})();
