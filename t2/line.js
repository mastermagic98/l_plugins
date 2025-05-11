// l_plugins/t2/line.js
import { Trailer } from './trailer.js';

export function Line(data) {
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
                { title: Lampa.Lang.translate('trailers_filter_all'), value: 'all', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'all' }
            ];
            Lampa.Select.show({
                title: Lampa.Lang.translate('trailers_filter'),
                items: items,
                onSelect: function (item) {
                    Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                    _this.load(true);
                    Lampa.Controller.toggle('content');
                },
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        });
        content.find('.items-line__title').after(filter);

        moreButton = Lampa.Template.get('more', {});
        more = new Trailer(moreButton, { type: 'more' });
        more.create();
        moreButton = more.render();
        moreButton.addClass('selector');
        moreButton.on('hover:enter', function () {
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: 1
            });
        });

        scroll.onWheel = function (step) {
            if (step > 0 && active < items.length - 1) {
                _this.right();
            } else if (step < 0 && active > 0) {
                _this.left();
            }
        };

        this.load();

        scroll.onScroll = function () {
            if (!isLoading && scroll.isEnd(1000)) {
                _this.load();
            }
        };

        body.append(scroll.render());
    };

    this.load = function (reset) {
        if (isLoading) return;
        isLoading = true;

        if (reset) {
            loadedIndex = 0;
            scroll.clear();
            items.forEach(function (item) {
                item.destroy();
            });
            items = [];
            active = 0;
        }

        var results = data.results.slice(loadedIndex, loadedIndex + visibleCards);
        var filterType = Lampa.Storage.get('trailers_' + data.type + '_filter', 'day');

        if (results.length) {
            results.forEach(function (item, index) {
                var trailer = new Trailer(item, { type: data.type });
                trailer.create();
                items.push(trailer);
                scroll.append(trailer.render());
                if (index === 0 && !last) {
                    last = trailer.card;
                    trailer.card.addClass('card--focus');
                }
            });
            loadedIndex += results.length;
            isLoading = false;
        } else if (data.results.length > loadedIndex) {
            scroll.append(moreButton);
            isLoading = false;
        } else {
            isLoading = false;
        }
    };

    this.left = function () {
        if (active > 0) {
            active--;
            last = items[active].card;
            Lampa.Controller.moveTo(last, scroll.render());
            scroll.scrollTo(last);
        }
    };

    this.right = function () {
        if (active < items.length - 1) {
            active++;
            last = items[active].card;
            Lampa.Controller.moveTo(last, scroll.render());
            scroll.scrollTo(last);
        }
    };

    this.toggle = function () {
        Lampa.Controller.add('trailers_line', {
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                if (last) {
                    Lampa.Controller.collectionFocus(last, scroll.render());
                }
            },
            left: function () {
                _this.left();
            },
            right: function () {
                _this.right();
            },
            up: function () {
                Lampa.Controller.toggle('menu');
            },
            down: function () {
                Lampa.Controller.toggle('content');
            },
            back: function () {
                Lampa.Controller.toggle('menu');
            }
        });
        Lampa.Controller.toggle('trailers_line');
    };

    this.render = function () {
        return content;
    };

    this.destroy = function () {
        scroll.destroy();
        items.forEach(function (item) {
            item.destroy();
        });
        more && more.destroy();
        content.remove();
    };
}
