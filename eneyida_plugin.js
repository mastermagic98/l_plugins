var plugin = {
    url: 'https://eneyida.tv',
    types: ['movie', 'series', 'anime', 'cartoon', 'cartoon-series'],
    catalog: [
        {type: 'movie', id: 'films', name: 'Фільми'},
        {type: 'series', id: 'series', name: 'Серіали'},
        {type: 'anime', id: 'anime', name: 'Аніме'},
        {type: 'cartoon', id: 'cartoon', name: 'Мультфільми'},
        {type: 'cartoon-series', id: 'cartoon-series', name: 'Мультсеріали'}
    ],
    search: {
        url: function(query) {
            return this.url + '?do=search&subaction=search&story=' + encodeURIComponent(query.replace(' ', '+'));
        },
        parse: function(html) {
            var items = [];
            $(html).find('article.short').each(function() {
                var el = $(this);
                var title = el.find('a.short_title').text().trim();
                var href = el.find('a.short_title').attr('href');
                var poster = plugin.url + el.find('a.short_img img').attr('data-src');
                
                items.push({
                    title: title,
                    url: href,
                    poster: poster
                });
            });
            return items;
        }
    },
    element: {
        url: function(type, id, page) {
            return this.url + '/' + id + '/page/' + page;
        },
        parse: function(html) {
            var items = [];
            $(html).find('article.short').each(function() {
                var el = $(this);
                var title = el.find('a.short_title').text().trim();
                var href = el.find('a.short_title').attr('href');
                var poster = plugin.url + el.find('a.short_img img').attr('data-src');
                
                items.push({
                    title: title,
                    url: href,
                    poster: poster
                });
            });
            return items;
        }
    },
    media: {
        url: function(url) {
            return url;
        },
        parse: function(html) {
            var $html = $(html);
            var fullInfo = $html.find('.full_info li');
            var title = $html.find('div.full_header-title h1').text().trim();
            var poster = plugin.url + $html.find('.full_content-poster img').attr('src');
            var banner = $html.find('.full_header__bg-img').css('background-image').replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            var tags = fullInfo.eq(1).find('a').map(function() { return $(this).text(); }).get();
            var year = parseInt(fullInfo.eq(0).find('a').text()) || null;
            var playerUrl = $html.find('.tabs_b.visible iframe').attr('src');
            var description = $html.find('.full_content-desc p').text().trim();
            var trailer = $html.find('div#trailer_place iframe').attr('src') || '';
            var rating = parseInt($html.find('.r_kp span, .r_imdb span').text()) || null;
            var actors = fullInfo.eq(4).find('a').map(function() { return $(this).text(); }).get();
            
            var isSeries = tags.includes('фільм') || tags.includes('мультфільм') || playerUrl.includes('/vod/') ? false : true;
            
            var media = {
                title: title,
                poster: poster,
                background: banner ? plugin.url + banner : null,
                year: year,
                plot: description,
                genres: tags,
                rating: rating,
                actors: actors,
                trailer: trailer,
                recommendations: []
            };
            
            $html.find('.short.related_item').each(function() {
                var el = $(this);
                media.recommendations.push({
                    title: el.find('a.short_title').text().trim(),
                    url: el.find('a.short_title').attr('href'),
                    poster: plugin.url + el.find('a.short_img img').attr('data-src')
                });
            });
            
            if (isSeries) {
                media.type = 'series';
                media.episodes = [];
                
                var playerHtml = Lampa.Request.sync(playerUrl);
                var playerRawJson = $(playerHtml).find('script').html()
                    .match(/file: '([^']+)'/)[1];
                    
                var seasons = JSON.parse(playerRawJson) || [];
                seasons.forEach(function(season) {
                    season.folder.forEach(function(episode) {
                        episode.folder.forEach(function(dub) {
                            media.episodes.push({
                                season: parseInt(season.title.replace(' сезон', '')) || 1,
                                episode: parseInt(episode.title.replace(' серія', '')) || 1,
                                title: episode.title,
                                url: playerUrl,
                                dub: dub.title,
                                stream: dub.file,
                                subtitle: dub.subtitle || null
                            });
                        });
                    });
                });
            } else {
                media.type = 'movie';
                media.stream = playerUrl;
            }
            
            return media;
        }
    },
    stream: {
        parse: function(url, callback) {
            var playerHtml = Lampa.Request.sync(url);
            var scriptContent = $(playerHtml).find('script').html();
            var m3u8Url = scriptContent.match(/file: "([^"]+)"/)[1];
            var subtitleUrl = scriptContent.match(/subtitle: "([^"]+)"/) ? scriptContent.match(/subtitle: "([^"]+)"/)[1] : null;
            
            var stream = {
                url: m3u8Url.replace('https://', 'http://'),
                referer: 'https://tortuga.wtf/'
            };
            
            if (subtitleUrl) {
                stream.subtitle = {
                    lang: subtitleUrl.match(/\[([^\]]+)\]/)[1],
                    url: subtitleUrl.match(/\]([^\[]+)/)[1]
                };
            }
            
            callback(stream);
        }
    }
};

Lampa.Plugin.register('eneyida', plugin);
