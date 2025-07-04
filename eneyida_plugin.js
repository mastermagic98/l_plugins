(function() {
  'use strict';

  var proxy_url = 'http://cors.cfhttp.top/';
  var main_url = proxy_url + 'https://eneyida.tv';
  var modalopen = false;

  function EneyidaAPI(component, _object) {
    var network = new Lampa.Reguest();
    var object = _object;
    var extract = {};

    function normalizeString(str) {
      return str ? str.toLowerCase().replace(/[^a-zа-я0-9]/g, '') : '';
    }

    this.searchByTitle = function(_object, query) {
      var _this = this;
      object = _object;
      var year = parseInt((object.movie.release_date || object.movie.first_air_date || '0000').slice(0, 4));
      var orig = object.movie.original_name || object.movie.original_title || object.movie.title || object.movie.name;
      var url = main_url;
      url = Lampa.Utils.addUrlComponent(url, 'do=search&subaction=search&story=' + encodeURIComponent(query.replace(' ', '+')));

      console.log('Skaz', 'Search query:', query, 'Year:', year, 'Original title:', orig, 'URL:', url);
      Lampa.Noty.show('Пошук: ' + query + ' (рік: ' + year + ', оригінальна назва: ' + orig + ', URL: ' + url + ')');
      network.clear();
      network.timeout(10000);
      network.silent(url, function(html) {
        if (!html || typeof html !== 'string') {
          Lampa.Noty.show('Порожня або невалідна відповідь від сервера для пошуку: ' + url);
          console.log('Skaz', 'Raw response:', html);
          component.doesNotAnswer();
          return;
        }

        try {
          // Спрощуємо очищення HTML
          html = html.replace(/<!DOCTYPE[^>]*>/gi, '')
                     .replace(/<!--[\s\S]*?-->/g, '')
                     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          console.log('Skaz', 'Cleaned HTML:', html.substring(0, 500) + '...');
          var doc = new DOMParser().parseFromString(html, 'text/html');
          if (!doc || !doc.documentElement || !doc.querySelectorAll) {
            throw new Error('DOMParser повернув невалідний документ');
          }
          var cards = Array.from(doc.querySelectorAll('div.short_in')).map(function(item) {
            var title = item.querySelector('a.short_title')?.textContent?.trim() || 'Без назви';
            var href = item.querySelector('a.short_title')?.getAttribute('href') || '';
            var poster = 'https://eneyida.tv' + (item.querySelector('a.short_img img')?.getAttribute('data-src') || '');
            var subtitle = item.querySelector('div.short_subtitle')?.textContent?.trim() || '';
            var yearText = subtitle.match(/\d{4}/)?.[0] || '';
            var originalTitle = subtitle.split('•')[1]?.trim() || title;
            var itemYear = yearText ? parseInt(yearText) : 0;
            return { title: title, href: href, year: itemYear, original_title: originalTitle, poster: poster, text: title };
          });

          console.log('Skaz', 'Parsed cards:', JSON.stringify(cards));
          Lampa.Noty.show('Знайдено ' + cards.length + ' результатів: ' + (cards[0]?.title || 'немає'));
          if (cards.length === 0) {
            Lampa.Noty.show('Результати пошуку відсутні');
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
          Lampa.Noty.show('Помилка парсингу HTML пошуку: ' + e.message + ' (HTML: ' + html.substring(0, 500) + '...)');
          console.log('Skaz', 'Parsing error:', e.message, 'HTML:', html.substring(0, 500));
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка запиту пошуку: ' + a.status + ' (' + url + ')');
        console.log('Skaz', 'Request error:', a.status, a.statusText);
        component.doesNotAnswer();
      });
    };

    this.find = function(url, title) {
      if (!url) {
        Lampa.Noty.show('Помилка: URL сторінки контенту відсутній');
        component.doesNotAnswer();
        return;
      }

      var full_url = url.startsWith('http') ? proxy_url + url : proxy_url + 'https://eneyida.tv' + (url.startsWith('/') ? url : '/' + url);
      Lampa.Noty.show('Завантаження сторінки контенту: ' + full_url);
      console.log('Skaz', 'Content page URL:', full_url);
      network.clear();
      network.timeout(10000);
      network.silent(full_url, function(html) {
        if (!html || typeof html !== 'string') {
          Lampa.Noty.show('Порожня відповідь від сторінки контенту: ' + full_url);
          console.log('Skaz', 'Content page response:', html);
          component.doesNotAnswer();
          return;
        }

        try {
          html = html.replace(/<!DOCTYPE[^>]*>/gi, '')
                     .replace(/<!--[\s\S]*?-->/g, '')
                     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          console.log('Skaz', 'Content page HTML:', html.substring(0, 500) + '...');
          var doc = new DOMParser().parseFromString(html, 'text/html');
          if (!doc || !doc.documentElement || !doc.querySelectorAll) {
            throw new Error('DOMParser повернув невалідний документ');
          }
          var full_info = doc.querySelectorAll('.full_info li');
          var player_url = doc.querySelector('.tabs_b.visible iframe')?.getAttribute('src') || '';
          var tags = Array.from(full_info[1]?.querySelectorAll('a') || []).map(a => a.textContent);
          var is_series = tags.includes('серіал') || tags.includes('мультсеріал') || !player_url.includes('/vod/');

          if (!player_url) {
            Lampa.Noty.show('Фрейм плеєра не знайдено на сторінці: ' + full_url);
            console.log('Skaz', 'Player iframe not found');
            component.doesNotAnswer();
            return;
          }

          Lampa.Noty.show('Знайдено плеєр: ' + player_url);
          console.log('Skaz', 'Player URL:', player_url);
          if (is_series) {
            extractSeries(player_url, title);
          } else {
            extractMovie(player_url, title);
          }
          append(filtred());
          component.loading(false);
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу сторінки контенту: ' + e.message + ' (HTML: ' + html.substring(0, 500) + '...)');
          console.log('Skaz', 'Content parsing error:', e.message, 'HTML:', html.substring(0, 500));
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження сторінки контенту: ' + a.status + ' (' + full_url + ')');
        console.log('Skaz', 'Content request error:', a.status, a.statusText);
        component.doesNotAnswer();
      });
    };

    function extractSeries(player_url, title) {
      var full_player_url = player_url.startsWith('http') ? proxy_url + player_url : proxy_url + player_url;
      Lampa.Noty.show('Завантаження плеєра: ' + full_player_url);
      console.log('Skaz', 'Player request URL:', full_player_url);
      network.silent(full_player_url, function(html) {
        if (!html || typeof html !== 'string') {
          Lampa.Noty.show('Порожня відповідь від плеєра');
          console.log('Skaz', 'Player response:', html);
          component.doesNotAnswer();
          return;
        }

        try {
          html = html.replace(/<!DOCTYPE[^>]*>/gi, '')
                     .replace(/<!--[\s\S]*?-->/g, '')
                     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          console.log('Skaz', 'Player HTML:', html.substring(0, 500) + '...');
          var doc = new DOMParser().parseFromString(html, 'text/html');
          if (!doc || !doc.documentElement || !doc.querySelectorAll) {
            throw new Error('DOMParser повернув невалідний документ');
          }
          var player_script = Array.from(doc.querySelectorAll('script')).find(s => s.textContent.includes('file:'))?.textContent || '';
          var player_json = player_script.match(/file: *['"](.+?)['"]/);
          if (!player_json) {
            Lampa.Noty.show('JSON плеєра не знайдено');
            console.log('Skaz', 'Player script:', player_script.substring(0, 500));
            component.doesNotAnswer();
            return;
          }

          var json = JSON.parse(player_json[1]);
          var transl_id = 1;
          extract = {};

          json.forEach(function(season, season_index) {
            var seas_num = parseInt(season.title.replace(' сезон', '')) || season_index + 1;
            season.folder.forEach(function(episode) {
              episode.folder.forEach(function(dub) {
                var ep_num = parseInt(episode.title.replace(' серія', '')) || 1;
                extract[seas_num + '_' + ep_num] = {
                  file: dub.file,
                  episode: ep_num,
                  season: seas_num,
                  quality: dub.file.includes('1080') ? 1080 : 720,
                  translation: title,
                  subtitle: dub.subtitle || ''
                };
              });
            });
          });
          Lampa.Noty.show('Оброблено серіал: ' + Object.keys(extract).length + ' епізодів');
          console.log('Skaz', 'Extracted series:', JSON.stringify(extract));
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу JSON: ' + e.message + ' (скрипт: ' + player_script.substring(0, 500) + '...)');
          console.log('Skaz', 'Series parsing error:', e.message, 'Script:', player_script.substring(0, 500));
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження плеєра: ' + a.status + ' (' + full_player_url + ')');
        console.log('Skaz', 'Player request error:', a.status, a.statusText);
        component.doesNotAnswer();
      });
    }

    function extractMovie(player_url, title) {
      var full_player_url = player_url.startsWith('http') ? proxy_url + player_url : proxy_url + player_url;
      Lampa.Noty.show('Завантаження плеєра: ' + full_player_url);
      console.log('Skaz', 'Player request URL:', full_player_url);
      network.silent(full_player_url, function(html) {
        if (!html || typeof html !== 'string') {
          Lampa.Noty.show('Порожня відповідь від плеєра');
          console.log('Skaz', 'Player response:', html);
          component.doesNotAnswer();
          return;
        }

        try {
          html = html.replace(/<!DOCTYPE[^>]*>/gi, '')
                     .replace(/<!--[\s\S]*?-->/g, '')
                     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          console.log('Skaz', 'Player HTML:', html.substring(0, 500) + '...');
          var doc = new DOMParser().parseFromString(html, 'text/html');
          if (!doc || !doc.documentElement || !doc.querySelectorAll) {
            throw new Error('DOMParser повернув невалідний документ');
          }
          var player_script = Array.from(doc.querySelectorAll('script')).find(s => s.textContent.includes('file:'))?.textContent || '';
          var file_url = player_script.match(/file: *["'](.+?\.m3u8)["']/i)?.[1] || '';
          var subtitle = player_script.match(/subtitle: *["'](.+?)["']/i)?.[1] || '';
          var quality = file_url.includes('1080') ? 1080 : 720;
          var qualities = file_url ? [quality] : [];
          var transl_id = 1;

          if (!file_url) {
            Lampa.Noty.show('Посилання на .m3u8 не знайдено в скрипті плеєра');
            console.log('Skaz', 'Player script:', player_script.substring(0, 500));
            component.doesNotAnswer();
            return;
          }

          extract[transl_id] = {
            file: file_url,
            translation: title,
            quality: quality,
            qualities: qualities,
            subtitle: subtitle
          };
          Lampa.Noty.show('Фільм оброблено: ' + (file_url ? 'посилання .m3u8 знайдено: ' + file_url : 'посилання відсутнє'));
          console.log('Skaz', 'Extracted movie:', JSON.stringify(extract));
        } catch (e) {
          Lampa.Noty.show('Помилка парсингу даних фільму: ' + e.message + ' (скрипт: ' + player_script.substring(0, 500) + '...)');
          console.log('Skaz', 'Movie parsing error:', e.message, 'Script:', player_script.substring(0, 500));
          component.doesNotAnswer();
        }
      }, function(a, c) {
        Lampa.Noty.show('Помилка завантаження даних фільму: ' + a.status + ' (' + full_player_url + ')');
        console.log('Skaz', 'Player request error:', a.status, a.statusText);
        component.doesNotAnswer();
      });
    }

    function getFile(element, max_quality) {
      var translat = extract[element.translation] || extract[element.season + '_' + element.episode];
      var file = translat.file || '';
      var subtitle = translat.subtitle || '';
      var quality = {};

      if (file) {
        var link = file;
        quality[translat.quality + 'p'] = file;
      }

      return { file: file, quality: quality, subtitle: subtitle };
    }

    function filtred() {
      var filtred = [];

      for (var transl_id in extract) {
        var element = extract[transl_id];
        if (element.season && element.episode) {
          filtred.push({
            episode: element.episode,
            season: element.season,
            title: 'Епізод ' + element.episode,
            quality: element.quality + 'p',
            translation: transl_id,
            voice_name: element.translation,
            subtitle: element.subtitle
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
            Lampa.Noty.show(Lampa.Lang.translate('lampac_nolink'));
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
        headers: { Referer: 'https://eneyida.tv/' }
      };
    }

    this.reset = function() {
      component.reset();
      extract = {};
      append(filtred());
    };

    this.destroy = function() {
      network.clear();
      extract = null;
    };
  }

  function component(object) {
    var network = new Lampa.Reguest();
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
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
      this.search();
    };

    this.search = function() {
      this.activity.loader(true);
      var query = object.search || object.movie.title || object.movie.name || object.movie.original_title || object.movie.original_name || '';
      if (!query) {
        Lampa.Noty.show('Помилка: Назва для пошуку відсутня');
        this.doesNotAnswer();
        return;
      }
      source.searchByTitle(object, query);
    };

    this.similars = function(json) {
      if (!json || !json.length) {
        Lampa.Noty.show('Немає результатів для відображення');
        console.log('Skaz', 'Similars: No results');
        this.doesNotAnswer();
        return;
      }

      scroll.clear();
      json.forEach(function(elem) {
        if (!elem.href || !elem.title) {
          Lampa.Noty.show('Помилка: відсутній href або title для ' + JSON.stringify(elem));
          console.log('Skaz', 'Invalid similar item:', JSON.stringify(elem));
          return;
        }
        var item = Lampa.Template.get('lampac_prestige_folder', {
          title: elem.title || 'Без назви',
          info: elem.year ? elem.year : '',
          time: ''
        });
        if (elem.poster) {
          item.find('.online-prestige__folder').replaceWith('<div class="online-prestige__img"><img src="' + elem.poster + '" alt="' + elem.title + '"></div>');
          var img = item.find('img')[0];
          img.onerror = function() { img.src = './img/img_broken.svg'; };
          img.onload = function() { item.find('.online-prestige__img').addClass('online-prestige__img--loaded'); };
        }
        item.on('hover:enter', function() {
          this.reset();
          Lampa.Noty.show('Обрано: ' + elem.title + ', перехід до ' + elem.href);
          console.log('Skaz', 'Selected similar:', elem.title, 'URL:', elem.href);
          source.find(elem.href, elem.title);
        }.bind(this)).on('hover:focus', function(e) {
          scroll.update($(e.target), true);
        });
        scroll.append(item);
      }.bind(this));
      Lampa.Noty.show('Відображено ' + json.length + ' результатів');
      console.log('Skaz', 'Similars displayed:', json.length);
      Lampa.Controller.enable('content');
    };

    this.reset = function() {
      scroll.clear();
      scroll.body().append(Lampa.Template.get('lampac_content_loading'));
    };

    this.loading = function(status) {
      this.activity.loader(status);
      if (!status) this.activity.toggle();
    };

    this.append = source.append;

    this.doesNotAnswer = function() {
      this.reset();
      var html = Lampa.Template.get('lampac_does_not_answer', { balanser: balanser });
      html.find('.online-empty__title').text(Lampa.Lang.translate('lampac_balanser_dont_work').replace('{balanser}', 'Eneyida'));
      scroll.append(html);
      this.loading(false);
    };

    this.draw = function(items, params) {
      var _this = this;
      scroll.clear();
      scroll.append(Lampa.Template.get('lampac_prestige_watched', {}));

      items.forEach(function(element, index) {
        var serial = object.movie.name ? true : false;
        var episode_num = element.episode || index + 1;
        var voice_name = element.voice_name || element.title || 'Невідомо';
        if (element.quality) {
          element.qualitys = element.quality;
          element.quality = Lampa.Arrays.getKeys(element.quality)[0];
        }
        Lampa.Arrays.extend(element, {
          voice_name: voice_name,
          info: voice_name.length > 60 ? voice_name.substr(0, 60) + '...' : voice_name,
          quality: '',
          time: Lampa.Utils.secondsToTime((object.movie.runtime || 0) * 60, true)
        });

        var hash_timeline = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title].join('') : object.movie.original_title);
        var hash_behold = Lampa.Utils.hash(element.season ? [element.season, element.episode, object.movie.original_title, element.voice_name].join('') : object.movie.original_title + element.voice_name);
        element.timeline = Lampa.Timeline.view(hash_timeline);

        var html = Lampa.Template.get('lampac_prestige_full', element);
        var loader = html.find('.online-prestige__loader');
        var image = html.find('.online-prestige__img');

        if (serial) {
          image.append('<div class="online-prestige__number">' + ('0' + episode_num).slice(-2) + '</div>');
          loader.remove();
        } else {
          var img = html.find('img')[0];
          img.onerror = function() { img.src = './img/img_broken.svg'; };
          img.onload = function() { image.addClass('online-prestige__img--loaded'); loader.remove(); };
          img.src = Lampa.TMDB.image('t/p/w300' + (object.movie.backdrop_path || ''));
        }

        html.find('.online-prestige__timeline').append(Lampa.Timeline.render(element.timeline));
        html.on('hover:enter', function() {
          if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
          if (params.onEnter) params.onEnter(element, html);
        }).on('hover:focus', function(e) {
          scroll.update($(e.target), true);
        });

        _this.contextMenu({
          html: html,
          element: element,
          onFile: params.onContextMenu,
          onClearAllMark: function() {},
          onClearAllTime: function() {}
        });

        scroll.append(html);
      });

      Lampa.Controller.enable('content');
    };

    this.contextMenu = function(params) {
      params.html.on('hover:long', function() {
        var enabled = Lampa.Controller.enabled().name;
        var menu = [
          { title: Lampa.Lang.translate('lampac_video'), separator: true },
          { title: Lampa.Lang.translate('copy_link'), copylink: true }
        ];
        Lampa.Select.show({
          title: Lampa.Lang.translate('title_action'),
          items: menu,
          onBack: function() { Lampa.Controller.toggle(enabled); },
          onSelect: function(a) {
            Lampa.Controller.toggle(enabled);
            if (a.copylink && params.onFile) {
              params.onFile(function(data) {
                Lampa.Utils.copyTextToClipboard(data.file, function() {
                  Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'));
                }, function() {
                  Lampa.Noty.show(Lampa.Lang.translate('copy_error'));
                });
              });
            }
          }
        });
      });
    };

    this.start = function() {
      if (Lampa.Activity.active().activity !== this.activity) return;
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
      network.clear();
      files.destroy();
      scroll.destroy();
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
      version: '1.0.17',
      name: 'Онлайн - Eneyida',
      description: 'Плагін для пошуку фільмів і серіалів на Eneyida.tv',
      component: 'online_eneyida',
      onContextMenu: function(object) {
        return {
          name: Lampa.Lang.translate('lampac_watch'),
          description: ''
        };
      },
      onContextLauch: function(object) {
        resetTemplates();
        Lampa.Component.add('online_eneyida', component);
        try {
          var movie = object.movie || {};
          if (!movie.title && !movie.name && !movie.original_title && !movie.original_name) {
            console.log('Skaz', 'Invalid movie object:', JSON.stringify(movie));
            Lampa.Noty.show('Помилка: Недостатньо даних у об’єкті movie');
            return;
          }
          var search = movie.title || movie.name || movie.original_title || movie.original_name || '';
          var id = Lampa.Utils.hash(movie.number_of_seasons ? movie.original_name : movie.original_title);
          var all = Lampa.Storage.get('clarification_search', '{}');
          console.log('Skaz', 'object.movie:', JSON.stringify(object.movie));
          console.log('Skaz', 'Activity params:', JSON.stringify({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'online_eneyida',
            search: all[id] ? all[id] : search,
            search_one: search,
            search_two: movie.original_title || movie.original_name,
            movie: movie,
            page: 1,
            clarification: all[id] ? true : false,
            source: 'eneyida'
          }));
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('title_online'),
            component: 'online_eneyida',
            search: all[id] ? all[id] : search,
            search_one: search,
            search_two: movie.original_title || movie.original_name,
            movie: movie,
            page: 1,
            clarification: all[id] ? true : false,
            source: 'eneyida'
          });
          Lampa.Noty.show('Активність запущено: ' + search);
        } catch (err) {
          Lampa.Noty.show('Помилка запуску активності: ' + err.message);
          console.log('Skaz', 'Activity error:', err.message);
        }
      }
    };

    Lampa.Manifest.plugins = manifest;
    Lampa.Lang.add({
      lampac_watch: {
        uk: 'Дивитися онлайн',
        en: 'Watch online'
      },
      lampac_nolink: {
        uk: 'Неможливо отримати посилання',
        en: 'Failed to fetch link'
      },
      title_online: {
        uk: 'Онлайн',
        en: 'Online'
      },
      lampac_balanser_dont_work: {
        uk: 'Пошук на ({balanser}) не дав результатів',
        en: 'Search on ({balanser}) did not return any results'
      },
      copy_secuses: {
        uk: 'Посилання скопійовано',
        en: 'Link copied'
      },
      copy_error: {
        uk: 'Помилка копіювання посилання',
        en: 'Error copying link'
      }
    });

    function resetTemplates() {
      Lampa.Template.add('lampac_css', `
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
          .online-prestige__number{position:absolute;top:0;left:0;background:rgba(0,0,0,0.7);color:white;padding:0.5em;}
        </style>
      `);
      Lampa.Template.add('lampac_prestige_full', `
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
            <div class="online-prestige__timeline"></div>
          </div>
        </div>
      `);
      Lampa.Template.add('lampac_content_loading', `
        <div class="online-empty">
          <div class="online-empty__loader"></div>
        </div>
      `);
      Lampa.Template.add('lampac_does_not_answer', `
        <div class="online-empty">
          <div class="online-empty__title">#{lampac_balanser_dont_work}</div>
        </div>
      `);
      Lampa.Template.add('lampac_prestige_folder', `
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
      Lampa.Template.add('lampac_prestige_watched', `
        <div class="online-prestige-watched">
          <div class="online-prestige-watched__body"></div>
        </div>
      `);
    }

    var button = `
      <div class="full-start__button selector view--online lampac--button" data-subtitle="Eneyida v${manifest.version}">
        <svg width="135" height="147" viewBox="0 0 135 147" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M121.5 96.8823C139.5 86.49 139.5 60.5092 121.5 50.1169L41.25 3.78454C23.25 -6.60776 0.750004 6.38265 0.750001 27.1673L0.75 51.9742C4.70314 35.7475 23.6209 26.8138 39.0547 35.7701L94.8534 68.1505C110.252 77.0864 111.909 97.8693 99.8725 109.369L121.5 96.8823Z" fill="currentColor"/>
          <path d="M63 84.9836C80.3333 94.991 80.3333 120.01 63 130.017L39.75 143.44C22.4167 153.448 0.749999 140.938 0.75 120.924L0.750001 94.0769C0.750002 74.0621 22.4167 61.5528 39.75 71.5602L63 84.9836Z" fill="currentColor"/>
        </svg>
        <span>#{title_online}</span>
      </div>
    `;

    resetTemplates();
    Lampa.Component.add('online_eneyida', component);

    function addButton(e) {
      if (e.render.find('.lampac--button').length) return;
      var btn = $(Lampa.Lang.translate(button));
      btn.on('hover:enter', function() {
        resetTemplates();
        Lampa.Component.add('online_eneyida', component);
        var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
        var all = Lampa.Storage.get('clarification_search', '{}');
        var search = e.movie.title || e.movie.name || e.movie.original_title || e.movie.original_name || '';
        console.log('Skaz', 'e.movie:', JSON.stringify(e.movie));
        console.log('Skaz', 'Activity params:', JSON.stringify({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'online_eneyida',
          search: all[id] ? all[id] : search,
          search_one: search,
          search_two: e.movie.original_title || e.movie.original_name,
          movie: e.movie,
          page: 1,
          clarification: all[id] ? true : false,
          source: 'eneyida'
        }));
        if (!e.movie.title && !e.movie.name && !e.movie.original_title && !e.movie.original_name) {
          Lampa.Noty.show('Помилка: Недостатньо даних у об’єкті movie');
          console.log('Skaz', 'Invalid movie object:', JSON.stringify(e.movie));
          return;
        }
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_online'),
          component: 'online_eneyida',
          search: all[id] ? all[id] : search,
          search_one: search,
          search_two: e.movie.original_title || e.movie.original_name,
          movie: e.movie,
          page: 1,
          clarification: all[id] ? true : false,
          source: 'eneyida'
        });
        Lampa.Noty.show('Активність запущено: ' + search);
      });
      e.render.after(btn);
    }

    Lampa.Listener.follow('full', function(e) {
      if (e.type == 'complite') {
        addButton({ render: e.object.activity.render().find('.view--torrent'), movie: e.data.movie });
      }
    });

    try {
      if (Lampa.Activity.active().component == 'full') {
        addButton({ render: Lampa.Activity.active().activity.render().find('.view--torrent'), movie: Lampa.Activity.active().card });
      }
    } catch (e) {
      console.log('Skaz', 'Error adding button:', e.message);
    }

    if (Lampa.Manifest.app_digital >= 177) {
      Lampa.Storage.sync('online_choice_eneyida', 'object_object');
      Lampa.Storage.sync('online_watched_last', 'object_object');
    }
  }

  if (!window.online_eneyida) startPlugin();
})();
