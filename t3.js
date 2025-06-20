(function () {
    'use strict';

    if (window.SeasonsEpisodesPlugin && window.SeasonsEpisodesPlugin.__initialized) return;
    window.SeasonsEpisodesPlugin = window.SeasonsEpisodesPlugin || {};
    window.SeasonsEpisodesPlugin.__initialized = true;

    Lampa.Lang.add({
        seasons_episodes_title: {
            en: "Seasons & Episodes",
            uk: "Сезони та епізоди",
            ru: "Сезоны и эпизоды"
        },
        seasons_label: {
            en: "Season",
            uk: "Сезон",
            ru: "Сезон"
        },
        episodes_label: {
            en: "Episodes",
            uk: "Епізоди",
            ru: "Эпизоды"
        },
        no_episodes: {
            en: "No episodes available",
            uk: "Епізоди відсутні",
            ru: "Эпизоды отсутствуют"
        }
    });

    var SeasonsEpisodesPlugin = {
        init: function() {
            this.addSeasonsEpisodesBlock();
        },

        addSeasonsEpisodesBlock: function() {
            Lampa.Listener.follow('full', function(e) {
                console.log('[SeasonsEpisodesPlugin] Full event:', e.type, 'Data:', e.data, 'Activity:', Lampa.Activity.active());
                if (e.type === 'render' && e.data && e.data.movie && e.data.movie.media_type === 'tv') {
                    console.log('[SeasonsEpisodesPlugin] Processing TV show:', e.data.movie.title);

                    function tryAddBlock(attempts) {
                        var container = $('.full-start-new, .full-start');
                        var rightBlock = container.find('.full-start-new__right');
                        console.log('[SeasonsEpisodesPlugin] Container found:', container.length, 'Right block found:', rightBlock.length);

                        if (!container.length || !rightBlock.length) {
                            if (attempts < 5) {
                                console.log('[SeasonsEpisodesPlugin] Retrying in 300ms, attempt:', attempts + 1);
                                setTimeout(function() { tryAddBlock(attempts + 1); }, 300);
                            } else {
                                console.log('[SeasonsEpisodesPlugin] Failed to find container or right block after 5 attempts');
                            }
                            return;
                        }

                        if (container.find('.seasons-episodes-block').length) {
                            console.log('[SeasonsEpisodesPlugin] Block already exists');
                            return;
                        }

                        var block = $('<div class="seasons-episodes-block" style="margin-bottom: 1em; width: 100%; max-width: 600px; background: transparent;"></div>');
                        var select = $('<select class="seasons-select" style="padding: 0.5em; border-radius: 0.5em; border: 1px solid #ccc; width: 100%; max-width: 200px; margin-bottom: 0.5em;"></select>');
                        var episodesContainer = $('<div class="episodes-container" style="display: flex; flex-wrap: wrap; gap: 0.5em;"></div>');

                        block.append('<div style="font-weight: bold; margin-bottom: 0.5em;">' + Lampa.Lang.translate('seasons_episodes_title') + '</div>');
                        block.append(select);
                        block.append(episodesContainer);

                        container[0].insertBefore(block[0], rightBlock[0]);
                        console.log('[SeasonsEpisodesPlugin] Block inserted before .full-start-new__right');

                        var movieId = e.data.movie.id;
                        var path = 'tv/' + movieId + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                        var url = Lampa.TMDB.api(path);

                        new Lampa.Reguest().silent(url, function(response) {
                            try {
                                var json = typeof response === 'string' ? JSON.parse(response) : response;
                                console.log('[SeasonsEpisodesPlugin] TMDB seasons response:', json);

                                if (json && json.seasons && json.seasons.length) {
                                    json.seasons.forEach(function(season) {
                                        if (season.season_number >= 0) {
                                            var option = $('<option value="' + season.season_number + '">' + Lampa.Lang.translate('seasons_label') + ' ' + season.season_number + '</option>');
                                            select.append(option);
                                        }
                                    });

                                    select.on('change', function() {
                                        var seasonNumber = parseInt(select.val(), 10);
                                        loadEpisodes(seasonNumber);
                                    });

                                    loadEpisodes(json.seasons[0].season_number);
                                } else {
                                    episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                                    console.log('[SeasonsEpisodesPlugin] No seasons found');
                                }
                            } catch (err) {
                                console.log('[SeasonsEpisodesPlugin] Error parsing TMDB response:', err);
                                episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                            }
                        }, function(err) {
                            console.log('[SeasonsEpisodesPlugin] Error fetching TMDB data:', err);
                            episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                        });

                        function loadEpisodes(seasonNumber) {
                            console.log('[SeasonsEpisodesPlugin] Loading episodes for season:', seasonNumber);
                            episodesContainer.empty();

                            var path = 'tv/' + movieId + '/season/' + seasonNumber + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                            var url = Lampa.TMDB.api(path);

                            new Lampa.Reguest().silent(url, function(response) {
                                try {
                                    var json = typeof response === 'string' ? JSON.parse(response) : response;
                                    console.log('[SeasonsEpisodesPlugin] Episodes response:', json);

                                    if (json && json.episodes && json.episodes.length) {
                                        json.episodes.forEach(function(episode) {
                                            var button = $('<button class="episode-button selector" style="padding: 0.5em 1em; border-radius: 0.5em; background: #444; color: #fff; border: none; cursor: pointer; flex: 0 0 auto;">' + 
                                                Lampa.Lang.translate('episodes_label') + ' ' + episode.episode_number + '</button>');

                                            button.on('hover:enter', function() {
                                                Lampa.Activity.push({
                                                    url: 'tv/' + movieId + '/season/' + seasonNumber + '/episode/' + episode.episode_number,
                                                    title: episode.name || Lampa.Lang.translate('episodes_label') + ' ' + episode.episode_number,
                                                    component: 'player',
                                                    source: 'tmdb',
                                                    id: movieId,
                                                    season: seasonNumber,
                                                    episode: episode.episode_number
                                                });
                                            });

                                            episodesContainer.append(button);
                                        });
                                    } else {
                                        episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                                        console.log('[SeasonsEpisodesPlugin] No episodes found');
                                    }
                                } catch (err) {
                                    console.log('[SeasonsEpisodesPlugin] Error parsing episodes:', err);
                                    episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                                }
                            }, function(err) {
                                console.log('[SeasonsEpisodesPlugin] Error fetching episodes:', err);
                                episodesContainer.text(Lampa.Lang.translate('no_episodes'));
                            });
                        }
                    }

                    tryAddBlock(0);

                    // Оновлені адаптивні стилі
                    var style = $('<style>' +
                        '.seasons-episodes-block { display: block !important; visibility: visible !important; }' +
                        '@media (max-width: 768px) {' +
                        '  .seasons-episodes-block { max-width: 100% !important; padding: 0 0.5em; box-sizing: border-box; }' +
                        '  .seasons-select { max-width: 100% !important; box-sizing: border-box; }' +
                        '  .episodes-container { justify-content: flex-start; }' +
                        '  .episode-button { flex: 0 0 48%; text-align: center; margin-bottom: 0.5em; }' +
                        '}' +
                        '@media (max-width: 480px) {' +
                        '  .episode-button { flex: 0 0 100%; }' +
                        '}' +
                        '</style>');
                    $('head').append(style);
                }
            });
        }
    };

    function startPlugin() {
        if (window.appready) {
            SeasonsEpisodesPlugin.init();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') SeasonsEpisodesPlugin.init();
            });
        }
    }

    startPlugin();
})();
