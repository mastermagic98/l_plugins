(function() {
  'use strict';

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

    this.create = function() {
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
      filter.on('hover:enter', function() {
        var items = [
          { title: Lampa.Lang.translate('trailers_filter_today'), value: 'day', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'day' },
          { title: Lampa.Lang.translate('trailers_filter_week'), value: 'week', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'week' },
          { title: Lampa.Lang.translate('trailers_filter_month'), value: 'month', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'month' },
          { title: Lampa.Lang.translate('trailers_filter_year'), value: 'year', selected: Lampa.Storage.get('trailers_' + data.type + '_filter', 'day') === 'year' }
        ];
        Lampa.Select.show({
          title: Lampa.Lang.translate('trailers_filter'),
          items: items,
          onSelect: function(item) {
            Lampa.Storage.set('trailer_category_cache_' + data.type, null);
            TrailerPlugin.Api.categoryCache[data.type] = null;
            Lampa.Storage.set('trailers_' + data.type + '_filter', item.value);
            Lampa.Activity.push({
              url: item.value === 'day' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                   item.value === 'week' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc' :
                   item.value === 'month' ? '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + TrailerPlugin.Utils.getFormattedDate(30) :
                   '/discover/' + (data.type.includes('movie') ? 'movie' : 'tv') + '?sort_by=popularity.desc&release_date.gte=' + TrailerPlugin.Utils.getFormattedDate(365),
              title: data.title,
              component: 'trailers_main',
              type: data.type,
              page: 1
            });
          },
          onBack: function() {
            Lampa.Controller.toggle('content');
          }
        });
      });

      moreButton = $('<div class="items-line__more selector">' + Lampa.Lang.translate('trailers_more') + '</div>');
      moreButton.on('hover:enter', function() {
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

      var debouncedLoad = TrailerPlugin.Utils.debounce(function() {
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
        remainingCards.forEach(function(element) {
          var card = new TrailerPlugin.Trailer(element, { type: data.type });
          card.create();
          card.visible();
          card.onFocus = function(target, card_data, is_mouse) {
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

    this.bind = function() {
      loadMoreCards();
      this.more();
      Lampa.Layer.update();
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
      }
      return '';
    };

    this.more = function() {
      more = Lampa.Template.get('more');
      more.addClass('more--trailers');
      more.on('hover:enter', function() {
        Lampa.Activity.push({
          url: data.url,
          title: data.title,
          component: 'trailers_full',
          type: data.type,
          page: Math.floor(loadedIndex / visibleCards) + 2
        });
      });
      more.on('hover:focus', function(e) {
        last = e.target;
        scroll.update(more, true);
      });
      scroll.append(more);
    };

    this.toggle = function() {
      var _this2 = this;
      Lampa.Controller.add('items_line', {
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
          if (last && items.length) {
            scroll.update($(last), true);
          }
        },
        right: function() {
          if (Navigator.canmove('right')) {
            Navigator.move('right');
            if (last && items.length) {
              scroll.update($(last), true);
            }
          }
          Lampa.Controller.enable('items_line');
        },
        left: function() {
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
        gone: function() {},
        back: this.onBack
      });
      Lampa.Controller.toggle('items_line');
    };

    this.render = function() {
      return content;
    };

    this.destroy = function() {
      Lampa.Arrays.destroy(items);
      scroll.destroy();
      content.remove();
      more && more.remove();
      filter && filter.remove();
      moreButton && moreButton.remove();
      items = [];
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Line = Line;
})();
