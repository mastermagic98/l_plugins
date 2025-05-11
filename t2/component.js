//
// l_plugins/t2/component.js
import { Trailer } from './trailer.js';
import { Line } from './line.js';
import { Api } from './api.js';

export function Component(object) {
    var _this = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var items = [];
    var html = $('<div></div>');
    var active = 0;
    var last;

    this.create = function () {
        scroll.render().addClass('trailers-full');

        Api.full(object, function (data) {
            var results = data.results || [];
            results.forEach(function (item, index) {
                var trailer = new Trailer(item, { type: object.type });
                trailer.create();
                items.push(trailer);
                scroll.append(trailer.render());
                if (index === 0) {
                    last = trailer.card;
                    trailer.card.addClass('card--focus');
                }
            });

            if (data.total_pages > data.page) {
                var moreButton = Lampa.Template.get('more', {});
                var more = new Trailer(moreButton, { type: 'more' });
                more.create();
                moreButton = more.render();
                moreButton.addClass('selector');
                moreButton.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: object.url,
                        title: object.title,
                        component: 'trailers_full',
                        type: object.type,
                        page: data.page + 1
                    });
                });
                scroll.append(moreButton);
                items.push(more);
            }

            scroll.onWheel = function (step) {
                if (step > 0 && active < items.length - 1) {
                    _this.right();
                } else if (step < 0 && active > 0) {
                    _this.left();
                }
            };

            _this.toggle();
        }, function () {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_data'));
        });

        html.append(scroll.render());
        return html;
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
        Lampa.Controller.add('trailers_full', {
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
        Lampa.Controller.toggle('trailers_full');
    };

    this.render = function () {
        return html;
    };

    this.destroy = function () {
        scroll.destroy();
        items.forEach(function (item) {
            item.destroy();
        });
        html.remove();
    };
}

export function Component$1(object) {
    var _this = this;
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var items = [];
    var html = $('<div></div>');

    this.create = function () {
        scroll.render().addClass('trailers-main');

        Api.main(function (data) {
            data.forEach(function (item) {
                var line = new Line(item);
                line.create();
                items.push(line);
                scroll.append(line.render());
            });

            _this.toggle();
        }, function () {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_data'));
        });

        html.append(scroll.render());
        return html;
    };

    this.start = function () {
        Lampa.Controller.toggle('trailers_main');
    };

    this.toggle = function () {
        Lampa.Controller.add('trailers_main', {
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(false, scroll.render());
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
        Lampa.Controller.toggle('trailers_main');
    };

    this.render = function () {
        return html;
    };

    this.destroy = function () {
        scroll.destroy();
        items.forEach(function (item) {
            item.destroy();
        });
        html.remove();
    };
}
