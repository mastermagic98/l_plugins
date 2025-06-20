(function () {
    'use strict';

    if (window.SeasonsPlugin && window.SeasonsPlugin.__initialized) return;
    window.SeasonsPlugin = window.SeasonsPlugin || {};
    window.SeasonsPlugin.__initialized = true;

    Lampa.Lang.add({
        seasons_title: {
            en: "Seasons",
            uk: "Сезони",
            ru: "Сезоны"
        },
        seasons_no_data: {
            en: "No seasons available",
            uk: "Немає доступних сезонів",
            ru: "Нет доступных сезонов"
        }
    });

    var SeasonsPlugin = {
        init: function() {
            this.addSeasonsBlock();
        },

        addSeasonsBlock: function() {
            Lampa.Listener.follow('full', function(e) {
                console.log('[SeasonsPlugin] Full event:', e.type, 'Component:', Lampa.Activity.active().component, 'Media type:', e.data && e.data.movie ? e.data.movie.media_type : 'N/A');
                if (e.type === 'complite' && Lampa.Activity.active().component === 'full' && e.data && e.data.movie && e.data.movie.media_type === 'tv') {
                    console.log('[SeasonsPlugin] Adding seasons block for TV show');
                    var container = $('.full-start', e.activity.element);
                    if (!container.length) {
                        console.log('[SeasonsPlugin] Container .full-start not found');
                        return;
                    }

                    var buttonsContainer = container.find('.full-start__buttons');
                    if (!buttonsContainer.length) {
                        console.log('[SeasonsPlugin] Buttons container .full-start__buttons not found');
                        return;
                    }

                    var seasonsBlock = $('.seasons-block', e.activity.element);
                    if (seasonsBlock.length) {
                        console.log('[SeasonsPlugin] Seasons block already exists');
                        return;
                    }

                    var movie = e.data.movie;
                    var tmdbId = movie.id;
                    var seasonsBlock = $('<div class="seasons-block" style="margin-bottom: 1em; padding: 0.5em; border-radius: 0.5em; background: rgba(0, 0, 0, 0.8); z-index: 2; position: relative;"></div>');
                    seasonsBlock.append('<div class="seasons-title" style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em;">' + Lampa.Lang.translate('seasons_title') + '</div>');

                    var path = 'tv/' + tmdbId + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                    var url = Lampa.TMDB.api(path);

                    new Lampa.Reguest().silent(url, function(response) {
                        try {
                            var json = typeof response === 'string' ? JSON.parse(response) : response;
                            console.log('[SeasonsPlugin] TMDB response:', json);

                            if (json && json.seasons && json.seasons.length) {
                                var seasonsSelect = $('<select class="seasons-select" style="width: 100%; padding: 0.5em; border-radius: 0.3em; background: #333; color: #fff; border: none;"></select>');
                                json.seasons.forEach(function(season) {
                                    if (season.season_number >= 0) {
                                        seasonsSelect.append('<option value="' + season.season_number + '">Season ' + season.season_number + ' (' + (season.air_date ? season.air_date.split('-')[0] : 'N/A') + ')</option>');
                                    }
                                });

                                var episodesList = $('<div class="episodes-list" style="margin-top: 0.5em; max-height: 150px; overflow-y: auto;"></div>');
                                seasonsBlock.append(seasonsSelect).append(episodesList);

                                seasonsSelect.on('change', function() {
                                    var seasonNumber = $(this).val();
                                    console.log('[SeasonsPlugin] Selected season:', seasonNumber);
                                    loadEpisodes(seasonNumber);
                                });

                                loadEpisodes(json.seasons[0].season_number);
                            } else {
                                seasonsBlock.append('<div>' + Lampa.Lang.translate('seasons_no_data') + '</div>');
                            }

                            buttonsContainer.before(seasonsBlock);

                            // Адаптивні стилі для мобільних
                            var style = $('<style>' +
                                '@media screen and (max-width: 580px) {' +
                                '.seasons-block {' +
                                '    margin: 0 -1em 1em;' +
                                '    padding: 1em;' +
                                '    border-radius: 0.5em 0.5em 0 0;' +
                                '    background: rgba(0, 0, 0, 0.9);' +
                                '    z-index: 3;' +
                                '}' +
                                '.seasons-title {' +
                                '    font-size: 1.1em;' +
                                '}' +
                                '.seasons-select {' +
                                '    font-size: 0.9em;' +
                                '}' +
                                '.episodes-list {' +
                                '    max-height: 120px;' +
                                '}' +
                                '}' +
                                '</style>');
                            $('head').append(style);
                        } catch (err) {
                            console.log('[SeasonsPlugin] Error parsing TMDB response:', err);
                            seasonsBlock.append('<div>' + Lampa.Lang.translate('seasons_no_data') + '</div>');
                            buttonsContainer.before(seasonsBlock);
                        }
                    }, function(error) {
                        console.log('[SeasonsPlugin] TMDB request error:', error);
                        seasonsBlock.append('<div>' + Lampa.Lang.translate('seasons_no_data') + '</div>');
                        buttonsContainer.before(seasonsBlock);
                    });

                    function loadEpisodes(seasonNumber) {
                        var episodesPath = 'tv/' + tmdbId + '/season/' + seasonNumber + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                        var episodesUrl = Lampa.TMDB.api(episodesPath);

                        new Lampa.Reguest().silent(episodesUrl, function(episodesResponse) {
                            try {
                                var episodesJson = typeof episodesResponse === 'string' ? JSON.parse(episodesResponse) : episodesResponse;
                                console.log('[SeasonsPlugin] Episodes response:', episodesJson);

                                episodesList.empty();
                                if (episodesJson && episodesJson.episodes && episodesJson.episodes.length) {
                                    episodesJson.episodes.forEach(function(episode) {
                                        var episodeItem = $('<div class="episode-item" style="padding: 0.3em 0; cursor: pointer;">' +
                                            '<span>Episode ' + episode.episode_number + ': ' + (episode.name || 'N/A') + '</span>' +
                                            '</div>');
                                        episodeItem.on('hover:enter', function() {
                                            console.log('[SeasonsPlugin] Selected episode:', episode.episode_number);
                                            Lampa.Player.play({
                                                url: '',
                                                title: movie.title || movie.name,
                                                season: seasonNumber,
                                                episode: episode.episode_number,
                                                source: 'tmdb',
                                                id: tmdbId
                                            });
                                            Lampa.Player.playlist([{
                                                title: episode.name || 'Episode ' + episode.episode_number,
                                                season: seasonNumber,
                                                episode: episode.episode_number
                                            }]);
                                        });
                                        episodesList.append(episodeItem);
                                    });
                                } else {
                                    episodesList.append('<div>No episodes available</div>');
                                }
                            } catch (err) {
                                console.log('[SeasonsPlugin] Error parsing episodes response:', err);
                                episodesList.empty().append('<div>No episodes available</div>');
                            }
                        }, function(error) {
                            console.log('[SeasonsPlugin] Episodes request error:', error);
                            episodesList.empty().append('<div>No episodes available</div>');
                        });
                    }
                }
            });
        }
    };

    function startPlugin() {
        if (window.appready) {
            SeasonsPlugin.init();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') SeasonsPlugin.init();
            });
        }
    }

    startPlugin();
})();
