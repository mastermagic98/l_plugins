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
        episodes_title: {
            en: "Episodes",
            uk: "Епізоди",
            ru: "Эпизоды"
        },
        select_season: {
            en: "Select Season",
            uk: "Виберіть сезон",
            ru: "Выберите сезон"
        },
        select_episode: {
            en: "Select Episode",
            uk: "Виберіть епізод",
            ru: "Выберите эпизод"
        },
        no_seasons: {
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
                if (e.type === 'complite' && e.data && e.data.movie && e.data.movie.media_type === 'tv') {
                    console.log('[SeasonsPlugin] Adding seasons block');
                    var container = $('.full-start__buttons', e.activity.element);
                    if (!container.length) {
                        console.log('[SeasonsPlugin] Container not found');
                        return;
                    }

                    var seasonsBlock = $('<div class="seasons-block" style="margin-top: 1em; padding: 1em; background: #222; border-radius: 0.5em;"></div>');
                    var seasonsSelect = $('<select class="seasons-select" style="padding: 0.5em; margin-right: 0.5em; border-radius: 0.3em;"></select>');
                    var episodesSelect = $('<select class="episodes-select" style="padding: 0.5em; border-radius: 0.3em;"></select>');

                    seasonsBlock.append('<span style="color: #fff; margin-right: 0.5em;">' + Lampa.Lang.translate('select_season') + '</span>');
                    seasonsBlock.append(seasonsSelect);
                    seasonsBlock.append('<span style="color: #fff; margin: 0 0.5em;">' + Lampa.Lang.translate('select_episode') + '</span>');
                    seasonsBlock.append(episodesSelect);

                    container.after(seasonsBlock);

                    var style = $('<style>' +
                        '@media (max-width: 767px) {' +
                        '.seasons-block {' +
                        'border-top-style: solid !important;' +
                        'border-top-width: 0px !important;' +
                        'margin-top: 0px !important;' +
                        'top: -165px !important;' +
                        '}' +
                        '}' +
                        '</style>');
                    $('head').append(style);

                    var movieId = e.data.movie.id;
                    var path = 'tv/' + movieId + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                    var url = Lampa.TMDB.api(path);

                    new Lampa.Reguest().silent(url, function(response) {
                        try {
                            var json = typeof response === 'string' ? JSON.parse(response) : response;
                            if (json && json.seasons && json.seasons.length) {
                                seasonsSelect.append('<option value="">' + Lampa.Lang.translate('select_season') + '</option>');
                                json.seasons.forEach(function(season) {
                                    if (season.season_number >= 0) {
                                        seasonsSelect.append('<option value="' + season.season_number + '">' + season.name + '</option>');
                                    }
                                });

                                seasonsSelect.on('change', function() {
                                    var seasonNumber = $(this).val();
                                    if (seasonNumber === '') {
                                        episodesSelect.empty().append('<option value="">' + Lampa.Lang.translate('select_episode') + '</option>').prop('disabled', true);
                                        return;
                                    }

                                    episodesSelect.empty().prop('disabled', false);
                                    var seasonPath = 'tv/' + movieId + '/season/' + seasonNumber + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language', 'ru-RU');
                                    var seasonUrl = Lampa.TMDB.api(seasonPath);

                                    new Lampa.Reguest().silent(seasonUrl, function(seasonResponse) {
                                        try {
                                            var seasonJson = typeof seasonResponse === 'string' ? JSON.parse(seasonResponse) : seasonResponse;
                                            if (seasonJson && seasonJson.episodes && seasonJson.episodes.length) {
                                                episodesSelect.append('<option value="">' + Lampa.Lang.translate('select_episode') + '</option>');
                                                seasonJson.episodes.forEach(function(episode) {
                                                    episodesSelect.append('<option value="' + episode.episode_number + '">' + episode.name + ' (Ep. ' + episode.episode_number + ')</option>');
                                                });

                                                episodesSelect.on('change', function() {
                                                    var episodeNumber = $(this).val();
                                                    if (episodeNumber !== '') {
                                                        Lampa.Player.play({
                                                            url: '',
                                                            title: json.name + ' - ' + seasonJson.name + ' - ' + episodeNumber,
                                                            data: {
                                                                id: movieId,
                                                                season: seasonNumber,
                                                                episode: episodeNumber,
                                                                source: 'tmdb'
                                                            }
                                                        });
                                                        Lampa.Player.playlist([{
                                                            title: episodeNumber,
                                                            season: seasonNumber,
                                                            episode: episodeNumber
                                                        }]);
                                                    }
                                                });
                                            } else {
                                                episodesSelect.append('<option value="">' + Lampa.Lang.translate('no_seasons') + '</option>').prop('disabled', true);
                                            }
                                        } catch (err) {
                                            console.log('[SeasonsPlugin] Error parsing episodes:', err);
                                        }
                                    }, function(error) {
                                        console.log('[SeasonsPlugin] Error fetching episodes:', error);
                                        episodesSelect.append('<option value="">' + Lampa.Lang.translate('no_seasons') + '</option>').prop('disabled', true);
                                    });
                                });

                                seasonsSelect.trigger('change');
                            } else {
                                seasonsBlock.text(Lampa.Lang.translate('no_seasons'));
                            }
                        } catch (err) {
                            console.log('[SeasonsPlugin] Error parsing seasons:', err);
                            seasonsBlock.text(Lampa.Lang.translate('no_seasons'));
                        }
                    }, function(error) {
                        console.log('[SeasonsPlugin] Error fetching seasons:', error);
                        seasonsBlock.text(Lampa.Lang.translate('no_seasons'));
                    });
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
