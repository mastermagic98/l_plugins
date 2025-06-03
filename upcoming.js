function Line(data) {
    var _this = this;
    var content = Lampa.Template.get('items_line', { title: data.title });
    var body = content.find('.items-line__body');
    var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
    var light = Lampa.Storage.field('light_version') && window.innerWidth >= 768;
    var items = [];
    var active = 0;
    var more, filter, moreButton, last;
    var visibleCards = light ? 6 : 10;
    var loadedIndex = 0;
    var isLoading = false;

    this.create = function () {
        console.log('Line: Creating with title: ' + data.title + ', results length: ' + (data.results ? data.results.length : 0));
        scroll.render().find('.scroll__body').addClass('items-cards');
        content.find('.items-line__title').text(data.title);

        filter = jQuery('<div class="items-line__filter selector"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg></div>');
        filter.css({ display: 'inline-block', marginLeft: '10px', cursor: 'pointer', padding: '0.5em', background: 'transparent', border: 'none' });
        filter.on('hover:enter', function () {
            console.log('Line: Filter button clicked');
            var filterItems = [
                { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
                { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
                { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
                { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
            ];
            Lampa.Select.show({
                title: Lampa.Lang.translate('trailers_filter'),
                items: filterItems,
                onSelect: function (item) {
                    Lampa.Storage.set('trailer_category_cache_' + data.type, null);
                    categoryCache[data.type] = null;
                    Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
                    Lampa.Activity.push({
                        url: item.value === 'day' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                             item.value === 'week' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                             item.value === 'month' ? '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(30) :
                             '/discover/' + (data.type.indexOf('movie') !== -1 ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + getFormattedDate(365),
                        title: data.title,
                        component: 'trailers_main',
                        type: data.type,
                        page: 1
                    });
                },
                onBack: function () { Lampa.Controller.toggle('content'); }
            });
        });

        moreButton = jQuery('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
        moreButton.on('hover:enter', function () {
            console.log('Line: More button clicked');
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: Math.floor(loadedIndex / visibleCards) + 2
            });
        });

        content.find('.items-line__title').after(filter).after(moreButton);
        body.append(scroll.render());

        var debouncedLoad = debounce(function () {
            if (scroll.isEnd() && !isLoading) loadMore();
        }, 200);
        scroll.render().on('scroll', debouncedLoad);
        this.bind();
    };

    function loadMore() {
        if (isLoading) {
            console.log('Line: loadMore: Already loading, skipping');
            return;
        }
        isLoading = true;

        console.log('Line: loadMore: Loading from index ' + loadedIndex + ', remaining cards: ' + (data.results ? data.results.length - loadedIndex : 0));
        var remainingCards = data.results ? data.results.slice(loadedIndex, loadedIndex + visibleCards) : [];
        if (remainingCards.length) {
            for (var i = 0; i < remainingCards.length; i++) {
                var element = remainingCards[i];
                var card = new Trailer(element, { type: data.type });
                card.create();
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    active = items.indexOf(card);
                    if (_this.onFocus) _this.onFocus(card_data);
                    scroll.update(card.render(), true);
                };
                scroll.append(card.render());
                items.push(card);
            }
            loadedIndex += remainingCards.length;
            Lampa.Layer.update();
            isLoading = false;
        } else {
            console.log('Line: loadMore: No more cards, pushing activity');
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
        console.log('Line: Binding data, results length: ' + (data.results ? data.results.length : 0));
        loadMore();
        this.loadMore();
        Lampa.Layer.update();
    };

    this.loadMore = function () {
        console.log('Line: Adding more button');
        more = Lampa.Template.get('more').addClass('more--trailers card--more');
        more.on('hover:enter', function () {
            console.log('Line: More button entered');
            Lampa.Activity.push({
                url: data.url,
                title: data.title,
                component: 'trailers_full',
                type: data.type,
                page: Math.floor(loadedIndex / visibleCards) + 2
            });
        }).on('hover:focus', function (e) {
            last = e.target;
            scroll.update(more, true);
        });
        scroll.append(more);
    };

    this.toggle = function () {
        console.log('Line: Toggling controller');
        Lampa.Controller.add('items_line', {
            toggle: function () {
                Lampa.Controller.collectionSet(scroll.render());
                Lampa.Controller.collectionFocus(last || false, scroll.render());
                if (last && items.length) scroll.update(jQuery(last), true);
            },
            right: function () {
                if (Navigator.canmove('right') && active < items.length - 1) {
                    Navigator.move('right');
                } else if (items.length > 0) {
                    Lampa.Controller.toggle('items_line');
                } else {
                    Lampa.Controller.toggle('menu');
                }
            },
            left: function () {
                if (Navigator.canmove('left')) Navigator.move('left');
                else if (_this.onLeft) _this.onLeft();
                else Lampa.Controller.toggle('menu');
            },
            down: this.onDown,
            up: this.onUp,
            back: this.onBack
        });
        Lampa.Controller.toggle('items_line');
    };

    this.render = function () { return content; };

    this.destroy = function () {
        console.log('Line: Destroying');
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        content.remove();
        if (more) more.remove();
        if (filter) filter.remove();
        if (moreButton) moreButton.remove();
        items = [];
    };
}
