function Trailer(data, params) {
    this.build = function () {
        this.card = Lampa.Template.get('trailer', data);
        this.img = this.card.find('img')[0];
        this.is_youtube = params.type === 'rating';
        this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
        this.trailer_lang = '';
        this.release_date = '-';

        if (!this.is_youtube) {
            var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            var title = data.title || data.name || data.original_title || data.original_name;
            this.card.find('.card__title').text(title);
            this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name));
            if (this.rating !== '-') {
                this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div>');
            } else {
                this.card.find('.card__view').append('<div class="card__rating">-</div>');
            }
            this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
            this.card.find('.card__view').append('<div class="card__release-date"></div>');
        } else {
            this.card.find('.card__title').text(data.name);
            this.card.find('.card__details').remove();
        }
    };

    this.cardImgBackground = function (card_data) {
        if (Lampa.Storage.field('background')) {
            if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
            }
            return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
        }
        return '';
    };

    this.image = function () {
        var _this = this;
        this.img.onload = function () {
            _this.card.addClass('card--loaded');
        };
        this.img.onerror = function () {
            _this.img.src = './img/img_broken.svg';
        };
    };

    this.loadTrailerInfo = function () {
        var _this = this;
        if (!this.is_youtube && !this.trailer_lang) {
            Api.videos(data, function (videos) {
                var trailers = videos.results ? videos.results.filter(function (v) {
                    return v.type === 'Trailer';
                }) : [];
                var preferredLangs = getPreferredLanguage();
                var video = trailers.find(function (v) {
                    return preferredLangs.includes(v.iso_639_1);
                }) || trailers[0];
                _this.trailer_lang = video ? video.iso_639_1 : '-';
                if (_this.trailer_lang !== '-') {
                    _this.card.find('.card__trailer-lang').text(_this.trailer_lang.toUpperCase());
                } else {
                    _this.card.find('.card__trailer-lang').text('-');
                }

                if (params.type === 'in_theaters' || params.type === 'upcoming_movies') {
                    if (data.release_details && data.release_details.results) {
                        var region = getRegion();
                        var releaseInfo = data.release_details.results.find(function (r) {
                            return r.iso_3166_1 === region;
                        });
                        if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
                            var releaseDate = releaseInfo.release_dates[0].release_date;
                            _this.release_date = formatDateToDDMMYYYY(releaseDate);
                        } else if (data.release_date) {
                            _this.release_date = formatDateToDDMMYYYY(data.release_date);
                        }
                    } else if (data.release_date) {
                        _this.release_date = formatDateToDDMMYYYY(data.release_date);
                    }
                } else if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
                    if (data.release_details && data.release_details.first_air_date) {
                        _this.release_date = formatDateToDDMMYYYY(data.release_details.first_air_date);
                    }
                }
                _this.card.find('.card__release-date').text(_this.release_date);
            }, function () {
                _this.trailer_lang = '-';
                _this.card.find('.card__trailer-lang').text('-');
                _this.card.find('.card__release-date').text('-');
            });
        }
    };

    this.play = function (id) {
        if (!id) {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            return;
        }
        try {
            if (Lampa.Manifest.app_digital >= 183) {
                var item = {
                    title: Lampa.Utils.shortText(data.title || data.name, 50),
                    id: id,
                    youtube: true,
                    url: 'https://www.youtube.com/watch?v=' + id,
                    icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                    template: 'selectbox_icon'
                };
                Lampa.Player.play(item);
                Lampa.Player.playlist([item]);
            } else {
                Lampa.YouTube.play(id);
            }
        } catch (e) {
            Lampa.Noty.show('Помилка відтворення трейлера: ' + e.message);
        }
    };

    this.create = function () {
        var _this2 = this;
        this.build();
        this.card.on('hover:focus', function (e, is_mouse) {
            Lampa.Background.change(_this2.cardImgBackground(data));
            _this2.onFocus(e.target, data, is_mouse);
            _this2.loadTrailerInfo();
        }).on('hover:enter', function () {
            if (_this2.is_youtube) {
                _this2.play(data.id);
            } else {
                Api.videos(data, function (videos) {
                    var preferredLangs = getPreferredLanguage();
                    var trailers = videos.results ? videos.results.filter(function (v) {
                        return v.type === 'Trailer';
                    }) : [];
                    var video = trailers.find(function (v) {
                        return preferredLangs.includes(v.iso_639_1);
                    }) || trailers[0];
                    if (video && video.key) {
                        if (preferredLangs[0] === 'uk' && video.iso_639_1 !== 'uk' && video.iso_639_1 !== 'en') {
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ua_trailer'));
                        } else if (preferredLangs[0] === 'ru' && video.iso_639_1 !== 'ru' && video.iso_639_1 !== 'en') {
                            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_ru_trailer'));
                        }
                        _this2.play(video.key);
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                    }
                }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                });
            }
        }).on('hover:long', function () {
            if (!_this2.is_youtube) {
                var items = [{
                    title: Lampa.Lang.translate('trailers_view'),
                    view: true
                }];
                Lampa.Loading.start(function () {
                    Api.clear();
                    Lampa.Loading.stop();
                });
                Api.videos(data, function (videos) {
                    Lampa.Loading.stop();
                    var preferredLangs = getPreferredLanguage();
                    var trailers = videos.results ? videos.results.filter(function (v) {
                        return v.type === 'Trailer';
                    }) : [];
                    if (trailers.length) {
                        items.push({
                            title: Lampa.Lang.translate('title_trailers'),
                            separator: true
                        });
                        trailers.forEach(function (video) {
                            if (video.key && preferredLangs.includes(video.iso_639_1)) {
                                items.push({
                                    title: video.name || 'Trailer',
                                    id: video.key,
                                    subtitle: video.iso_639_1
                                });
                            }
                        });
                    }
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: items,
                        onSelect: function (item) {
                            Lampa.Controller.toggle('content');
                            if (item.view) {
                                Lampa.Activity.push({
                                    url: '',
                                    component: 'full',
                                    id: data.id,
                                    method: data.name ? 'tv' : 'movie',
                                    card: data,
                                    source: 'tmdb'
                                });
                            } else {
                                _this2.play(item.id);
                            }
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        }
                    });
                }, function () {
                    Lampa.Loading.stop();
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                });
            }
        });
        this.image();
        this.loadTrailerInfo();
    };

    this.destroy = function () {
        this.img.onerror = null;
        this.img.onload = null;
        this.img.src = '';
        this.card.remove();
        this.card = null;
        this.img = null;
    };

    this.visible = function () {
        if (this.visibled) return;
        if (params.type === 'rating') {
            this.img.src = 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg';
        } else if (data.backdrop_path) {
            this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
        } else if (data.poster_path) {
            this.img.src = Lampa.Api.img(data.poster_path);
        } else {
            this.img.src = './img/img_broken.svg';
        }
        this.visibled = true;
    };

    this.render = function () {
        return this.card;
    };
}

function Line(data) {
    var _this = this;
    var content = Lampa.Template.get('items_line', { title: data.title });
    var body = content.find('.items-line__body');
    var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
    var items = [];
    var active = 0;
    var more;
    var filter;
    var moreButton;
    var last;
    var visibleCards = light ? 6 : 10;
    var loadedIndex = 0;
    var isLoading = false;

    this.create = function () {
        scroll.render().find('.scroll__body').addClass('items-cards');
        content.find('.items-line__title').text(data.title);

        filter = $('<div class="items-line__more selector"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
        filter.css({
            display: 'inline-block',
            marginLeft: '10px',
            cursor: 'pointer',
            padding: '0.5em',
            background: 'transparent',
            border: 'none'
        });
        filter.on('hover:enter', function () {
            var items = [
                { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
                { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
            ];
            Lampa.Select.show({
                title: Lampa.Lang.translate('trailers_filter'),
                items: items,
                onSelect: function (item) {
                    Lampa.Storage.set('trailer_category_cache_' + data.type, null);
                    categoryCache[data.type] = null;
                    Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                    Lampa.Activity.push({
                        url: item.value === 'day' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                             item.value === 'week' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                             item.value === 'month' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(30) :
                             '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(365),
                        title: data.title,
                        component: 'trailers_main',
                        type: data.type,
                        page: 1
                    });
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        });

        moreButton = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
        moreButton.on('hover:enter', function () {
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: Math.floor(loadedIndex / visibleCards) + 2
            });
        });

        content.find('.items-line__title').after(filter);
        filter.after(moreButton);

        this.bind();
        body.append(scroll.render());

        var debouncedLoad = debounce(function () {
            if (scroll.isEnd() && !isLoading) {
                loadMoreCards();
            }
        }, 200);
        scroll.render().on('scroll', debouncedLoad);
    };

    function loadMoreCards() {
        if (isLoading) return;
        isLoading = true;

        var remainingCards = data.results.slice(loadedIndex, loadedIndex + visibleCards);
        if (remainingCards.length > 0) {
            remainingCards.forEach(function (element) {
                var card = new Trailer(element, { type: data.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data, is_mouse) {
                    last = target;
                    active = items.indexOf(card);
                    if (_this.onFocus) _this.onFocus(card_data);
                    scroll.update(card.render(), true);
                    if (items.length > 0 && items.indexOf(card) === items.length - 1) {
                        var message = Lampa.Lang.translate('trailers_last_movie').replace('[title]', card_data.title || card_data.name);
                        Lampa.Noty.show(message);
                    }
                };
                scroll.append(card.render());
                items.push(card);
            });
            loadedIndex += remainingCards.length;
            Lampa.Layer.update();
            isLoading = false;
        } else {
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: Math.floor(loadedIndex / visibleCards) + 2
            });
            isLoading = false;
        }
    }

    this.bind = function () {
        loadMoreCards();
        this.more();
        Lampa.Layer.update();
    };

    this.cardImgBackground = function (card_data) {
        if (Lampa.Storage.field('background')) {
            if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
            }
            return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
        }
        return '';
    };

    this.more = function () {
        more = Lampa.Template.get('more');
        more.addClass('more--trailers');
        more.on('hover:enter', function () {
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: Math.floor(loadedIndex / visibleCards) + 2
            });
        });
        more.on('hover:focus', function (e) {
            last = e.target;
            scroll.update(more, true);
        });
        scroll.append(more);
    };

    this.toggle = function () {
        var _this2 = this;
        Lampa.Controller.add('items_line', {
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                if (last && items.length) {
                    scroll.update($(last), true);
                }
            },
            right: function () {
                if (Navigator.canmove('right')) {
                    Navigator.move('right');
                    if (last && items.length) {
                        scroll.update($(last), true);
                    }
                }
                Lampa.Controller.enable('items_line');
            },
            left: function () {
                if (Navigator.canmove('left')) {
                    Navigator.move('left');
                    if (last && items.length) {
                        scroll.update($(last), true);
                    }
                } else if (_this2.onLeft) {
                    _this2.onLeft();
                } else {
                    Lampa.Controller.toggle('menu');
                }
            },
            down: this.onDown,
            up: this.onUp,
            gone: function () {},
            back: this.onBack
        });
        Lampa.Controller.toggle('items_line');
    };

    this.render = function () {
        return content;
    };

    this.destroy = function () {
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        content.remove();
        more && more.remove();
        filter && filter.remove();
        moreButton && moreButton.remove();
        items = [];
    };
}

function Component$1(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
    var items = [];
    var html = $('<div></div>');
    var active = 0;
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;

    this.create = function () {
        Api.main(this.build.bind(this), this.empty.bind(this));
        return this.render();
    };

    this.empty = function () {
        var empty = new Lampa.Empty();
        html.append(empty.render());
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
    };

    this.build = function (data) {
        var _this = this;
        scroll.minus();
        html.append(scroll.render());
        data.forEach(this.append.bind(this));
        if (light) {
            scroll.onWheel = function (step) {
                if (step > 0) _this.down();
                else _this.up();
            };
        }
        this.activity.loader(false);
        this.activity.toggle();
    };

    this.append = function (element) {
        var item = new Line(element);
        item.create();
        item.onDown = this.down.bind(this);
        item.onUp = this.up.bind(this);
        item.onBack = this.back.bind(this);
        item.onToggle = function () {
            active = items.indexOf(item);
        };
        item.wrap = $('<div></div>');
        if (light) {
            scroll.append(item.wrap);
        } else {
            scroll.append(item.render());
        }
        items.push(item);
    };

    this.back = function () {
        Lampa.Activity.backward();
    };

    this.detach = function () {
        if (light) {
            items.forEach(function (item) {
                item.render().detach();
            });
            items.slice(active, active + 2).forEach(function (item) {
                item.wrap.append(item.render());
            });
        }
    };

    this.down = function () {
        active++;
        active = Math.min(active, items.length - 1);
        this.detach();
        items[active].toggle();
        scroll.update(items[active].render());
    };

    this.up = function () {
        active--;
        if (active < 0) {
            active = 0;
            this.detach();
            Lampa.Controller.toggle('head');
        } else {
            this.detach();
            items[active].toggle();
        }
        scroll.update(items[active].render());
    };

    this.start = function () {
        var _this2 = this;
        if (Lampa.Activity.active().activity !== this.activity) return;
        Lampa.Controller.add('content', {
            toggle: function () {
                if (items.length) {
                    _this2.detach();
                    items[active].toggle();
                }
            },
            left: function () {
                if (Navigator.canmove('left')) Navigator.move('left');
                else Lampa.Controller.toggle('menu');
            },
            right: function () {
                Navigator.move('right');
            },
            up: function () {
                if (Navigator.canmove('up')) Navigator.move('up');
                else Lampa.Controller.toggle('head');
            },
            down: function () {
                if (Navigator.canmove('down')) Navigator.move('down');
            },
            back: this.back
        });
        Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};
    this.render = function () {
        return html;
    };

    this.destroy = function () {
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        html.remove();
        items = [];
    };
}

function Component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
    var items = [];
    var html = $('<div></div>');
    var body = $('<div class="category-full category-full--trailers"></div>');
    var newlampa = Lampa.Manifest.app_digital >= 166;
    var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
    var total_pages = 0;
    var last;
    var waitload = false;
    var active = 0;

    this.create = function () {
        Api.full(object, this.build.bind(this), this.empty.bind(this));
        return this.render();
    };

    this.empty = function () {
        var empty = new Lampa.Empty();
        scroll.append(empty.render());
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
    };

    this.next = function () {
        var _this = this;
        if (waitload) return;
        if (object.page < total_pages && object.page < 30) {
            waitload = true;
            object.page++;
            Api.full(object, function (result) {
                if (result.results && result.results.length) {
                    _this.append(result, true);
                } else {
                    Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                }
                waitload = false;
            }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
                waitload = false;
            });
        } else {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_more_data'));
        }
    };

    this.cardImgBackground = function (card_data) {
        if (Lampa.Storage.field('background')) {
            if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
            }
            return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
        }
        return '';
    };

    this.append = function (data, append) {
        var _this2 = this;
        if (!append) body.empty();
        data.results.forEach(function (element) {
            var card = new Trailer(element, { type: object.type });
            card.create();
            card.visible();
            card.onFocus = function (target, card_data) {
                last = target;
                scroll.update(card.render(), true);
                if (!light && !newlampa && scroll.isEnd()) _this2.next();
                if (items.length > 0 && items.indexOf(card) === items.length - 1) {
                    var message = Lampa.Lang.translate('trailers_last_movie').replace('[title]', card_data.title || card_data.name);
                    Lampa.Noty.show(message);
                }
            };
            body.append(card.render());
            items.push(card);
        });
        var cardCount = data.results.length;
        if (cardCount < 20) {
            for (var i = cardCount; i < 20; i++) {
                var placeholder = $('<div class="card card--placeholder" style="width: 33.3%; margin-bottom: 1.5em; visibility: hidden;"></div>');
                body.append(placeholder);
            }
        }
    };

    this.build = function (data) {
        var _this3 = this;
        if (data.results && data.results.length) {
            total_pages = data.total_pages || 1;
            scroll.minus();
            html.append(scroll.render());
            this.append(data);
            if (light && items.length) this.back();
            if (total_pages > data.page && items.length) {
                this.more();
            }
            scroll.append(body);
            if (newlampa) {
                scroll.onEnd = this.next.bind(this);
                scroll.onWheel = function (step) {
                    if (!Lampa.Controller.own(_this3)) _this3.start();
                    if (step > 0) Navigator.move('down');
                    else if (active > 0) Navigator.move('up');
                }.bind(this);
                var debouncedLoad = debounce(function () {
                    if (scroll.isEnd() && !waitload) {
                        _this3.next();
                    }
                }, 100);
                scroll.render().on('scroll', debouncedLoad);
            }
            this.activity.loader(false);
            this.activity.toggle();
        } else {
            html.append(scroll.render());
            this.empty();
        }
    };

    this.more = function () {
        var _this = this;
        var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
        more.on('hover:enter', function () {
            var next = Lampa.Arrays.clone(object);
            delete next.activity;
            next.page = (next.page || 1) + 1;
            Lampa.Activity.push({
                url: next.url,
                title: object.title || Lampa.Lang.translate('title_trailers'),
                component: 'trailers_full',
                type: next.type,
                page: next.page
            });
        });
        body.append(more);
    };

    this.back = function () {
        last = items[0].render()[0];
        var more = $('<div class="selector" style="width: 100%; height: 5px"></div>');
        more.on('hover:enter', function () {
            if (object.page > 1) {
                Lampa.Activity.backward();
            } else {
                Lampa.Controller.toggle('head');
            }
        });
        body.prepend(more);
    };

    this.start = function () {
        if (Lampa.Activity.active().activity !== this.activity) return;
        Lampa.Controller.add('content', {
            link: this,
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(last || false, scroll.render());
            },
            left: function () {
                if (Navigator.canmove('left')) Navigator.move('left');
                else Lampa.Controller.toggle('menu');
            },
            right: function () {
                Navigator.move('right');
            },
            up: function () {
                if (Navigator.canmove('up')) Navigator.move('up');
                else Lampa.Controller.toggle('head');
            },
            down: function () {
                if (Navigator.canmove('down')) Navigator.move('down');
            },
            back: function () {
                Lampa.Activity.backward();
            }
        });
        Lampa.Controller.toggle('content');
    };

    this.pause = function () {};
    this.stop = function () {};
    this.render = function () {
        return html;
    };

    this.destroy = function () {
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        html.remove();
        body.remove();
        items = [];
    };
}
