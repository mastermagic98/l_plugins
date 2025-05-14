(function () {
    var ComponentMain = {
        init: function (params) {
            this.params = params || {};
            this.container = $('<div class="category-full"></div>');
            this.lines = [];
            return this;
        },
        start: function () {
            var _this = this;
            window.plugin_upcoming.Api.main(this.params, function (data) {
                data.lines.forEach(function (line) {
                    var l = new window.plugin_upcoming.Line(line.params);
                    _this.lines.push(l);
                    _this.container.append(l.container);
                    if (line.filter) {
                        var filter = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_filter') + '</div>');
                        l.container.append(filter);
                        filter.on('hover:enter', function () {
                            var menu = [];
                            ['day', 'week', 'month', 'year'].forEach(function (period) {
                                menu.push({
                                    title: Lampa.Lang.translate('trailers_filter_' + period),
                                    period: period
                                });
                            });
                            Lampa.Select.show({
                                title: Lampa.Lang.translate('trailers_filter'),
                                items: menu,
                                onSelect: function onSelect(item) {
                                    l.params.filter = item.period;
                                    l.cards.forEach(function (c) {
                                        return c.card.remove();
                                    });
                                    l.cards = [];
                                    l.page = 1;
                                    l.container.find('.card').remove();
                                    l.more.show();
                                    l.load();
                                }
                            });
                        });
                    }
                });
            }, function () {
                Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
            });
            return this;
        },
        build: function () {
            return this.container;
        },
        update: function () {
            return this.container;
        },
        render: function () {
            return this.container;
        },
        destroy: function () {
            this.container.remove();
            this.lines.forEach(function (line) {
                line.destroy();
            });
            this.lines = [];
            this.params = null;
        }
    };

    var ComponentFull = {
        init: function (params) {
            this.params = params || {};
            this.container = $('<div class="category-full category-full--trailers"></div>');
            this.line = null;
            return this;
        },
        start: function () {
            this.line = new window.plugin_upcoming.Line(this.params);
            this.container.append(this.line.container);
            return this;
        },
        build: function () {
            return this.container;
        },
        update: function () {
            return this.container;
        },
        render: function () {
            return this.container;
        },
        destroy: function () {
            this.container.remove();
            if (this.line) this.line.destroy();
            this.line = null;
            this.params = null;
        }
    };

    window.plugin_upcoming = window.plugin_upcoming || {};
    window.plugin_upcoming.ComponentMain = ComponentMain;
    window.plugin_upcoming.ComponentFull = ComponentFull;
})();
