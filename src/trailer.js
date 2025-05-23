(function() {
  'use strict';

  function Trailer(data, params) {
    var _this = this;
    this.card = null;
    this.img = null;
    this.is_youtube = params.type === 'rating';
    this.rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
    this.trailer_lang = '';
    this.release_date = '-';
    this.visibled = false;

    this.build = function() {
      var title = data.title || data.name || data.original_title || data.original_name;
      if (!title) {
        console.warn('Skipping card: missing title/name', data);
        return;
      }

      var lang = TrailerPlugin.Utils.getInterfaceLanguage();
      var hasTranslatedTitle = lang === 'uk' ? !!data.title : lang === 'ru' ? !!data.title : true;
      if (!hasTranslatedTitle) {
        console.warn('Skipping card: no translated title for lang', lang, data);
        return;
      }

      this.card = Lampa.Template.get('trailer', data);
      this.img = this.card.find('img')[0];

      if (!this.is_youtube) {
        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        this.card.find('.card__title').text(title);
        this.card.find('.card__details').text(create + ' - ' + (data.original_title || data.original_name || ''));
        if (this.rating !== '-') {
          this.card.find('.card__view').append('<div class="card__rating">' + this.rating + '</div>');
        } else {
          this.card.find('.card__view').append('<div class="card__rating">-</div>');
        }
        this.card.find('.card__view').append('<div class="card__trailer-lang"></div>');
        this.card.find('.card__view').append('<div class="card__release-date"></div>');
      } else {
        this.card.find('.card__title').text(data.name || title);
        this.card.find('.card__details').remove();
      }
    };

    this.cardImgBackground = function(card_data) {
      if (Lampa.Storage.field('background')) {
        if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
          return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + card_data.id + '/hqdefault.jpg' : '';
        }
        return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + card_data.id + '/hqdefault.jpg' : '';
      }
      return '';
    };

    this.image = function() {
      if (!this.card || !this.img) {
        console.warn('Skipping image load: no card or img', data);
        return;
      }
      this.img.onload = function() {
        _this.card.addClass('card--loaded');
      };
      this.img.onerror = function() {
        _this.img.src = './img/img_broken.svg';
      };
    };

    this.loadTrailerInfo = function() {
      if (!this.card || this.is_youtube || this.trailer_lang) {
        console.warn('Skipping trailer info: no card or already loaded', data);
        return;
      }

      TrailerPlugin.Api.videos(data, function(videos) {
        var trailers = videos.results ? videos.results.filter(function(v) {
          return v.type === 'Trailer';
        }) : [];
        var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
        var video = trailers.find(function(v) {
          return preferredLangs.includes(v.iso_639_1);
        }) || trailers[0];
        _this.trailer_lang = video ? video.iso_639_1 : '-';
        _this.card.find('.card__trailer-lang').text(_this.trailer_lang.toUpperCase());

        var region = TrailerPlugin.Utils.getRegion();
        if (data.release_details && data.release_details.results) {
          var releaseInfo = data.release_details.results.find(function(r) {
            return r.iso_3166_1 === region;
          });
          if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
            _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(releaseInfo.release_dates[0].release_date);
          } else if (data.release_date || data.first_air_date) {
            _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date || data.first_air_date);
          }
        } else if (data.release_date || data.first_air_date) {
          _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date || data.first_air_date);
        }
        _this.card.find('.card__release-date').text(_this.release_date);
      }, function() {
        _this.trailer_lang = '-';
        _this.card.find('.card__trailer-lang').text('-');

        var region = TrailerPlugin.Utils.getRegion();
        if (data.release_details && data.release_details.results) {
          var releaseInfo = data.release_details.results.find(function(r) {
            return r.iso_3166_1 === region;
          });
          if (releaseInfo && releaseInfo.release_dates && releaseInfo.release_dates.length) {
            _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(releaseInfo.release_dates[0].release_date);
          } else if (data.release_date || data.first_air_date) {
            _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date || data.first_air_date);
          }
        } else if (data.release_date || data.first_air_date) {
          _this.release_date = TrailerPlugin.Utils.formatDateToDDMMYYYY(data.release_date || data.first_air_date);
        }
        _this.card.find('.card__release-date').text(_this.release_date);
      });
    };

    this.play = function(id) {
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

    this.create = function() {
      var _this2 = this;
      this.build();

      if (!this.card) {
        console.warn('Card creation failed:', data);
        return;
      }

      this.card.on('hover:focus', function(e, is_mouse) {
        Lampa.Background.change(_this2.cardImgBackground(data));
        _this2.onFocus(e.target, data, is_mouse);
        _this2.loadTrailerInfo();
      }).on('hover:enter', function() {
        if (_this2.is_youtube) {
          _this2.play(data.id);
        } else {
          TrailerPlugin.Api.videos(data, function(videos) {
            var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
            var trailers = videos.results ? videos.results.filter(function(v) {
              return v.type === 'Trailer';
            }) : [];
            var video = trailers.find(function(v) {
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
          }, function() {
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          });
        }
      }).on('hover:long', function() {
        if (!_this2.is_youtube) {
          var items = [{
            title: Lampa.Lang.translate('trailers_view'),
            view: true
          }];
          Lampa.Loading.start(function() {
            TrailerPlugin.Api.clear();
            Lampa.Loading.stop();
          });
          TrailerPlugin.Api.videos(data, function(videos) {
            Lampa.Loading.stop();
            var preferredLangs = TrailerPlugin.Utils.getPreferredLanguage();
            var trailers = videos.results ? videos.results.filter(function(v) {
              return v.type === 'Trailer';
            }) : [];
            if (trailers.length) {
              items.push({
                title: Lampa.Lang.translate('title_trailers'),
                separator: true
              });
              trailers.forEach(function(video) {
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
              onSelect: function(item) {
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
              onBack: function() {
                Lampa.Controller.toggle('content');
              }
            });
          }, function() {
            Lampa.Loading.stop();
            Lampa.Noty.show(Lampa.Lang.translate('trailers_no_trailers'));
          });
        }
      });
      this.image();
      this.loadTrailerInfo();
    };

    this.destroy = function() {
      if (this.img) {
        this.img.onerror = null;
        this.img.onload = null;
        this.img.src = '';
      }
      if (this.card) {
        this.card.remove();
      }
      this.card = null;
      this.img = null;
    };

    this.visible = function() {
      if (this.visibled || !this.card) return;
      if (this.card) {
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
      }
    };

    this.render = function() {
      if (!this.card) {
        console.warn('Render skipped: null card', data);
        return null;
      }
      return this.card;
    };
  }

  window.TrailerPlugin = window.TrailerPlugin || {};
  window.TrailerPlugin.Trailer = Trailer;
})();
