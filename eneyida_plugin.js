(function() {
  'use strict';

  var main_url = 'https://eneyida.tv';
  var proxy_urls = ['http://cors.cfhttp.top/', 'https://cors-anywhere.herokuapp.com/']; // Резервний проксі
  var current_proxy = proxy_urls[0];
  var modalopen = false;

  function EneyidaAPI(component, _object) {
    var network = new Lampa.Reguest();
    var object = _object;
    var extract = {};
    var filter_items = {};
    var choice = {
      season: 0,
      voice: 0,
      voice_name: ''
    };

    function normalizeString(str) {
      return str ? str.toLowerCase().replace(/[^a-zа-я0-9]/g, '') : '';
    }

    this.searchByTitle = function(_object, query) {
      var _this = this;
      object = _object;
      var year = parseInt((object.movie.release_date || object.movie.first_air_date || '0000').slice(0, 4));
      var orig = object.movie.original_name || object.movie.original_title || object.movie.title || object.movie.name;
      var url = current_proxy + main_url;
      url = Lampa.Utils.addUrlComponent(url, 'do=search&subaction=search&story=' + encodeURIComponent(query.replace(' ', '+')));

      Lampa.Noty.show('Пошук: ' + query + ' (рік: ' + year + ', оригінальна назва: ' + orig + ')');
      network.clear();
      network.timeout(8000);
      network.silent(url, function(html) {
        if (!html) {
          Lampa.Noty.show('Порожня відповідь від сервера для пошуку');
          component.doesNotAnswer();
          return;
        }

        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var cards = Array.from(doc.querySelectorAll('div.short_in')).map(function(item) {
            var title = item.querySelector('a.short_title')?.textContent?.trim() || 'Без назви';
            var href = item.querySelector('a.short_title')?.getAttribute('href') || '';
            var poster = main_url + (item.querySelector('a.short_img img')?.getAttribute('data-src') || '');
            var subtitle = item.querySelector('div.short_subtitle')?.textContent?.trim() || '';
            var yearText = subtitle.match(/\d{4}/)?.[0] || '';
            var originalTitle = subtitle.split('•')[1]?.trim() || title;
            var itemYear = yearText ? parseInt(yearText) : 0;
            return { title: title, href: href, year: itemYear, original_title: originalTitle, poster: poster };
          });

          Lampa.Noty.show('Знайдено ' + cards.length + ' результатів');
          if (cards.length === 0) {
            Lampa.Noty.show('Результати відсутні');
            component.doesNotAnswer();
            return;
          }

          var card = cards.find(function(c) {
            return c.year >= year - 2 && c.year <= year + 2 && 
                   (normalizeString(c.original_title) == normalizeString(orig) || normalizeString(c.title) == normalizeString(orig));
          }) || (cards.length == 1 ? cards[0] : null);

          if (card) {
            Lampa.Noty.show('Точний збіг: ' + card.title + ' (' + card.original_title + ', ' + card.year + '), URL: ' + card.href);
            _this.find(card.href, card.title);
          } else {
            Lampa.Noty.show('Відображаємо схожі результати');
            component.similars(cards);
            component.loading(false);
          }
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу HTML пошуку: ' + e.message);
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка запиту пошуку: ' + a.status + ' (' + url + ')');
        if (current_proxy !== proxy_urls[1]) {
          Lampa.Noty.show('Спроба з резервним проксі: ' + proxy_urls[1]);
          current_proxy = proxy_urls[1];
          _this.searchByTitle(_object, query);
        } else {
          component.doesNotAnswer();
        }
      });
    };

    this.find = function(url, title) {
      if (!url) {
        Lampa.Noty.show('Помилка: URL сторінки контенту відсутній');
        component.doesNotAnswer();
        return;
      }

      var full_url = url.startsWith('http') ? current_proxy + url : current_proxy + main_url + (url.startsWith('/') ? url : '/' + url);
      Lampa.Noty.show('Завантаження сторінки контенту: ' + full_url);
      network.clear();
      network.timeout(10000);
      network.silent(full_url, function(html) {
        if (!html) {
          Lampa.Noty.show('Порожня відповідь від сторінки контенту: ' + full_url);
          component.doesNotAnswer();
          return;
        }

        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var full_info = doc.querySelectorAll('.full_info li');
          var player_url = doc.querySelector('.tabs_b.visible iframe')?.getAttribute('src') || '';
          var tags = Array.from(full_info[1]?.querySelectorAll('a') || []).map(a => a.textContent);
          var is_series = tags.includes('серіал') || tags.includes('мультсеріал') || !player_url.includes('/vod/');

          if (!player_url) {
            Lampa.Noty.show('Фрейм плеєра не знайдено на сторінці: ' + full_url);
            component.doesNotAnswer();
            return;
          }

          Lampa.Noty.show('Знайдено плеєр: ' + player_url);
          if (is_series) {
            extractSeries(player_url, title);
          } else {
            extractMovie(player_url, title);
          }
          filter();
          append(filtred());
          component.loading(false);
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу сторінки контенту: ' + e.message);
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження сторінки контенту: ' + a.status + ' (' + full_url + ')');
        if (current_proxy !== proxy_urls[1]) {
          Lampa.Noty.show('Спроба з резервним проксі: ' + proxy_urls[1]);
          current_proxy = proxy_urls[1];
          _this.find(url, title);
        } else {
          component.doesNotAnswer();
        }
      });
    };

    function extractSeries(player_url, title) {
      var full_player_url = player_url.startsWith('http') ? current_proxy + player_url : current_proxy + player_url;
      Lampa.Noty.show('Завантаження плеєра: ' + full_player_url);
      network.silent(full_player_url, function(html) {
        if (!html) {
          Lampa.Noty.show('Порожня відповідь від плеєра');
          component.doesNotAnswer();
          return;
        }

        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var player_script = Array.from(doc.querySelectorAll('script')).find(s => s.textContent.includes('file:'))?.textContent || '';
          var player_json = player_script.match(/file: *['"](.+?)['"]/);
          if (!player_json) {
            Lampa.Noty.show('JSON плеєра не знайдено');
            component.doesNotAnswer();
            return;
          }

          var json = JSON.parse(player_json[1]);
          var transl_id = 0;
          extract = {};

          json.forEach(function(season) {
            var seas_num = parseInt(season.title.replace(' сезон', '')) || ++transl_id;
            season.folder.forEach(function(episode) {
              episode.folder.forEach(function(dub) {
                var ep_num = parseInt(episode.title.replace(' серія', '')) || 1;
                var items = [{
                  id: seas_num + '_' + ep_num,
                  comment: ep_num + ' ' + Lampa.Lang.translate('torrent_serial_episode'),
                  file: dub.file,
                  episode: ep_num,
                  season: seas_num,
                  quality: 720,
                  translation: transl_id,
                  subtitle: dub.subtitle || ''
                }];

                if (!extract[transl_id]) extract[transl_id] = { json: [], file: '' };
                extract[transl_id].json.push({
                  id: seas_num,
                  comment: seas_num + ' ' + Lampa.Lang.translate('torrent_serial_season'),
                  folder: items,
                  translation: transl_id
                });
              });
            });
          });
          Lampa.Noty.show('Оброблено серіал: ' + Object.keys(extract).length + ' перекладів');
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу JSON: ' + e.message + ' (скрипт: ' + player_script.substring(0, 100) + '...)');
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження плеєра: ' + a.status + ' (' + full_player_url + ')');
        component.doesNotAnswer();
      });
    }

    function extractMovie(player_url, title) {
      var full_player_url = player_url.startsWith('http') ? current_proxy + player_url : current_proxy + player_url;
      Lampa.Noty.show('Завантаження плеєра: ' + full_player_url);
      network.silent(full_player_url, function(html) {
        if (!html) {
          Lampa.Noty.show('Порожня відповідь від плеєра');
          component.doesNotAnswer();
          return;
        }

        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var player_script = Array.from(doc.querySelectorAll('script')).find(s => s.textContent.includes('file:'))?.textContent || '';
          var file_url = player_script.match(/file: *["'](.+?)["']/i)?.[1] || '';
          var subtitle = player_script.match(/subtitle: *["'](.+?)["']/i)?.[1] || '';
          var qualities = file_url ? [720] : [];
          var transl_id = 1;

          if (!file_url) {
            Lampa.Noty.show('Посилання на файл не знайдено в скрипті плеєра');
            component.doesNotAnswer();
            return;
          }

          extract[transl_id] = {
            file: file_url,
            translation: title,
            quality: 720,
            qualities: qualities,
            subtitle: subtitle
          };
          Lampa.Noty.show('Фільм оброблено: ' + (file_url ? 'посилання знайдено' : 'посилання відсутнє'));
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу даних фільму: ' + e.message + ' (скрипт: ' + player_script.substring(0, 100) + '...)');
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження даних фільму: ' + a.status + ' (' + full_player_url + ')');
        component.doesNotAnswer();
      });
    }

    function getFile(element, max_quality) {
      var translat = extract[element.translation];
      var file = translat.file || '';
      var subtitle = translat.subtitle || '';
      var quality = {};

      if (file) {
        var link = file.slice(0, file.lastIndexOf('_')) + '_';
        var orin = file.split('?');
        orin = orin.length > 1 ? '?' + orin.slice(1).join('?') : '';
        quality['720p'] = file;
      }

      return { file: file, quality: quality, subtitle: subtitle };
    }

    function filter() {
      filter_items = { season: [], voice: [], voice_info: [] };

      for (var transl_id in extract) {
        var trans = extract[transl_id];
        if (trans.json) {
          var s = trans.json.length;
          while (s--) filter_items.season.push(Lampa.Lang.translate('torrent_serial_season') + ' ' + (trans.json.length - s));
          filter_items.voice.push(trans.json[0]?.comment || 'Default');
          filter_items.voice_info.push({ id: transl_id });
        } else {
          filter_items.voice.push(trans.translation);
          filter_items.voice_info.push({ id: transl_id });
        }
      }

      component.filter(filter_items, choice);
    }

    function filtred() {
      var filtred = [];

      for (var transl_id in extract) {
        var element = extract[transl_id];
        if (element.json) {
          element.json.forEach(function(season) {
            if (season.id == choice.season + 1) {
              season.folder.forEach(function(media) {
                if (media.translation == filter_items.voice_info[choice.voice].id) {
                  filtred.push({
                    episode: media.episode,
                    season: media.season,
                    title: Lampa.Lang.translate('torrent_serial_episode') + ' ' + media.episode,
                    quality: media.quality + 'p',
                    translation: media.translation,
                    voice_name: filter_items.voice[choice.voice],
                    subtitle: media.subtitle
                  });
                }
              });
            }
          });
        } else {
          filtred.push({
            title: element.translation,
            quality: element.quality + 'p',
            translation: transl_id,
            voice_name: element.translation,
            subtitle: element.subtitle
          });
        }
      }

      return filtred;
    }

    function append(items) {
      component.reset();
      if (!items.length) {
        Lampa.Noty.show('Немає елементів для відображення');
        component.doesNotAnswer();
        return;
      }

      component.draw(items, {
        onEnter: function(item, html) {
          var extra = getFile(item, item.quality);
          if (extra.file) {
            var playlist = [toPlayElement(item)];
            Lampa.Player.play(playlist[0]);
            Lampa.Player.playlist(playlist);
            Lampa.Noty.show('Відтворення: ' + item.title);
          } else {
            Lampa.Noty.show(Lampa.Lang.translate('online_nolink'));
          }
        },
        onContextMenu: function(item, html, data, call) {
          call(getFile(item, item.quality));
        }
      });
    }

    function toPlayElement(element) {
      var extra = getFile(element, element.quality);
      var subtitle = extra.subtitle ? {
        name: extra.subtitle.substringAfterLast('[').substringBefore(']') || 'Default',
        url: extra.subtitle.substringAfter(']') || ''
      } : null;
      return {
        title: element.title,
        url: extra.file.replace('https://', 'http://'),
        quality: extra.quality,
        subtitle: subtitle,
        headers: { Referer: 'https://tortuga.wtf/' }
      };
    }

    this.extendChoice = function(saved) {
      Lampa.Arrays.extend(choice, saved, true);
    };

    this.reset = function() {
      component.reset();
      choice = { season: 0, voice: 0, voice_name: '' };
      extract = {};
      filter();
      append(filtred());
    };

    this.filter = function(type, a, b) {
      choice[a.stype] = b.index;
      if (a.stype == 'voice') choice.voice_name = filter_items.voice[b.index];
      component.reset();
      filter();
      append(filtred());
    };

    this.destroy = function() {
      network.clear();
      extract = null;
    };
  }

  function component(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var files = new Lampa.Explorer(object);
    var filter = new Lampa.Filter(object);
    var source = new EneyidaAPI(this, object);
    var balanser = 'eneyida';
    var initialized = false;

    this.initialize = function() {
      initialized = true;
      files.appendFiles(scroll.render());
      files.appendHead(filter.render());
      scroll.body().addClass('torrent-list');
      scroll.minus(files.render().find('.explorer__files-head'));
      this.search();
    };

    this.search = function() {
      this.activity.loader(true);
      source.searchByTitle(object, object.search || object.movie.original_title || object.movie.original_name || object.movie.title || object.movie.name);
    };

    this.similars = function(json) {
      if (!json || !json.length) {
        Lampa.Noty.show('Немає результатів для відображення');
        component.doesNotAnswer();
        return;
      }

      json.forEach(function(elem) {
        if (!elem.href) {
          Lampa.Noty.show('Помилка: відсутній href для ' + elem.title);
          return;
        }
        var item = Lampa.Template.get('online_prestige_folder', {
          title: elem.title || 'Без назви',
          info: elem.year ? elem.year : '',
          time: ''
        });
        if (elem.poster) {
          item.find('.online-prestige__folder').replaceWith('<div class="online-prestige__img"><img src="' + elem.poster + '" alt="' + elem.title + '"></div>');
        }
        item.on('hover:enter', function() {
          component.reset();
          Lampa.Noty.show('Обрано: ' + elem.title + ', перехід до ' + elem.href);
          source.find(elem.href, elem.title);
        }).on('hover:focus', function(e) {
          scroll.update($(e.target), true);
        });
        scroll.append(item);
      });
      Lampa.Noty.show('Відображено ' + json.length + ' результатів');
    };

    this.reset = function() {
      scroll.clear();
    };

    this.loading = function(status) {
      this.activity.loader(status);
      if (!status) this.activity.toggle();
    };

    this.filter = source.filter;
    this.append = source.append;
    this.doesNotAnswer = function() {
      this.reset();
      var html = Lampa.Template.get('online_does_not_answer', { balanser: balanser });
      scroll.append(html);
      this.loading(false);
    };

    this.start = function() {
      if (!initialized) this.initialize();
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
      Lampa.Controller.add('content', {
        toggle: function() {
          Lampa.Controller.collectionSet(scroll.render(), files.render());
        },
        up: function() {
          Navigator.move('up');
        },
        down: function() {
          Navigator.move('down');
        },
        right: function() {
          filter.show(Lampa.Lang.translate('title_filter'), 'filter');
        },
        left: function() {
          Lampa.Controller.toggle('menu');
        }
      });
      Lampa.Controller.toggle('content');
    };

    this.render = function() {
      return files.render();
    };

    this.destroy = function() {
      files.destroy();
      scroll.destroy();
      source.destroy();
      if (modalopen) {
        modalopen = false;
        Lampa.Modal.close();
      }
    };
  }

  function startPlugin() {
    window.online_eneyida = true;
    var manifest = {
      type: 'video',
      version: '1.0.7',
      name: 'Онлайн - Eneyida',
      description: 'Плагін для пошуку фільмів і серіалів на Eneyida.tv',
      component: 'online_eneyida',
      onContextMenu: function(object) {
        return {
          name: Lampa.Lang.translate('online_watch'),
          description: ''
        };
      },
      onContextLauch: function(object) {
        resetTemplates();
        Lampa.Component.add('online_eneyida', component);
        try {
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'online_eneyida',
            search: object.title,
            search_one: object.title,
            search_two: object.original_title,
            movie: object,
            page: 1
          });
          Lampa.Noty.show('Активність запущено: ' + object.title);
        } catch (err) {
          Lampa.Noty.show('Помилка запуску активності: ' + err.message);
        }
      }
    };

    Lampa.Manifest.plugins = manifest;
    Lampa.Lang.add({
      online_watch: {
        uk: 'Дивитися онлайн',
        en: 'Watch online'
      },
      online_nolink: {
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link'
      },
      title_online: {
        uk: 'Онлайн',
        en: 'Online'
      },
      online_balanser_dont_work: {
        uk: 'Пошук не дав результатів',
        en: 'The search did not return any results'
      },
      torrent_serial_episode: {
        uk: 'серія',
        en: 'episode'
      },
      torrent_serial_season: {
        uk: 'сезон',
        en: 'season'
      }
    });

    Lampa.Template.add('online_prestige_css', `
      <style>
        .online-prestige{position:relative;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:flex;}
        .online-prestige__body{padding:1.2em;line-height:1.3;flex-grow:1;}
        .online-prestige__img{position:relative;width:13em;flex-shrink:0;min-height:8.2em;}
        .online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:.3em;opacity:0;transition:opacity .3s;}
        .online-prestige__img--loaded>img{opacity:1;}
        .online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;background-size:contain;}
        .online-prestige__head,.online-prestige__footer{display:flex;justify-content:space-between;align-items:center;}
        .online-prestige__title{font-size:1.7em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;}
        .online-prestige__info{display:flex;align-items:center;}
        .online-prestige__quality{padding-left:1em;white-space:nowrap;}
        .online-prestige+.online-prestige{margin-top:1.5em;}
        .online-empty__title{font-size:2em;margin-bottom:.9em;}
      </style>
    `);

    function resetTemplates() {
      Lampa.Template.add('online_prestige_full', `
        <div class="online-prestige online-prestige--full selector">
          <div class="online-prestige__img">
            <img alt="">
            <div class="online-prestige__loader"></div>
          </div>
          <div class="online-prestige__body">
            <div class="online-prestige__head">
              <div class="online-prestige__title">{title}</div>
              <div class="online-prestige__time">{time}</div>
            </div>
            <div class="online-prestige__footer">
              <div class="online-prestige__info">{info}</div>
              <div class="online-prestige__quality">{quality}</div>
            </div>
          </div>
        </div>
      `);
      Lampa.Template.add('online_does_not_answer', `
        <div class="online-empty">
          <div class="online-empty__title">#{online_balanser_dont_work}</div>
        </div>
      `);
      Lampa.Template.add('online_prestige_folder', `
        <div class="online-prestige online-prestige--folder selector">
          <div class="online-prestige__folder">
            <svg viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="20" width="128" height="92" rx="13" fill="white"></rect>
              <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>
              <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>
            </svg>
          </div>
          <div class="online-prestige__body">
            <div class="online-prestige__head">
              <div class="online-prestige__title">{title}</div>
              <div class="online-prestige__time">{time}</div>
            </div>
            <div class="online-prestige__footer">
              <div class="online-prestige__info">{info}</div>
            </div>
          </div>
        </div>
      `);
    }

    var button = `<div class="full-start__button selector view--online" data-subtitle="Eneyida v${manifest.version}">
      <svg width="135" height="147" viewBox="0 0 135 147" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M121.5 96.8823C139.5 86.49 139.5 60.5092 121.5 50.1169L41.25 3.78454C23.25 -6.60776 0.750004 6.38265 0.750001 27.1673L0.75 51.9742C4.70314 35.7475 23.6209 26.8138 39.0547 35.7701L94.8534 68.1505C110.252 77.0864 111.909 97.8693 99.8725 109.369L121.5 96.8823Z" fill="currentColor"/>
        <path d="M63 84.9836C80.3333 94.991 80.3333 120.01 63 130.017L39.75 143.44C22.4167 153.448 0.749999 140.938 0.75 120.924L0.750001 94.0769C0.750002 74.0621 22.4167 61.5528 39.75 71.5602L63 84.9836Z" fill="currentColor"/>
      </svg>
      <span>#{title_online}</span>
    </div>`;

    resetTemplates();
    Lampa.Component.add('online_eneyida', component);
    Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
        var btn = $(Lampa.Lang.translate(button));
        btn.on('hover:enter', function() {
          resetTemplates();
          Lampa.Component.add('online_eneyida', component);
          try {
            Lampa.Activity.push({
              url: '',
              title: Lampa.Lang.translate('title_online'),
              component: 'online_eneyida',
              search: e.data.movie.title,
              search_one: e.data.movie.title,
              search_two: e.data.movie.original_title,
              movie: e.data.movie,
              page: 1
            });
            Lampa.Noty.show('Активність запущено: ' + e.data.movie.title);
          } catch (err) {
            Lampa.Noty.show('Помилка запуску активності: ' + err.message);
          }
        });
        e.object.activity.render().find('.view--torrent').after(btn);
      }
    });
  }

  if (!window.online_eneyida) startPlugin();
})();
