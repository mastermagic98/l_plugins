(function () {
    'use strict';

    if (window.SeasonSeriaPlugin && window.SeasonSeriaPlugin.__initialized) return;
    window.SeasonSeriaPlugin = window.SeasonSeriaPlugin || {};
    window.SeasonSeriaPlugin.__initialized = true;

    Lampa.Lang.add({
        season_seria_setting: {
            en: "Show series status (season/episode)",
            uk: "Відображення стану серіалу (сезон/серія)",
            ru: "Отображение статуса сериала (сезон/эпизод)"
        },
        season_seria_active: {
            en: "Season {season}\nEpisodes {current}/{total}",
            uk: "Сезон {season}\nЕпізодів {current}/{total}",
            ru: "Сезон {season}\nЭпизодов {current}/{total}"
        },
        season_seria_season_completed: {
            en: "Season {season} Episodes {episodes}\nIn Production",
            uk: "Сезон {season} Епізодів {episodes}\nЗнімається",
            ru: "Сезон {season} Эпизодов {episodes}\nСнимается"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons} Episodes {episodes}\nEnded",
            uk: "Сезонів {seasons} Епізодів {episodes}\nЗакінчено",
            ru: "Сезонов {seasons} Эпизодов {episodes}\nЗавершено"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons} Episodes {episodes}\nCanceled",
            uk: "Сезонів {seasons} Епізодів {episodes}\nПрипинено",
            ru: "Сезонов {seasons} Эпизодов {episodes}\nОтменено"
        },
        season_seria_series_planned: {
            en: "Season {season}\nPlanned",
            uk: "Сезон {season}\nЗаплановано",
            ru: "Сезон {season}\nЗапланировано"
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'season_and_seria',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('season_seria_setting')
        }
    });

    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_and_seria', true) === true;
    }

    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        var style = $('<style>' +
            '.full-start__poster, .full-start-new__poster { position: relative; width: 100%; }' +
            '.card--new_seria { position: relative; width: auto; margin-top: 0.3em; background: rgba(0,0,0,0.5); color: #fff; font-size: 1.1em; font-weight: 700; padding: 0.2em 0.5em; border-radius: 1em; z-index: 10; text-align: center; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; min-height: 2.4em; line-height: 1.2; }' +
            '.card--new_seria span { display: block; white-space: pre; }' +
            '.orientation--portrait:not(.size--big) .card--new_seria { position: absolute; top: 3.2em; right: 0.5em; width: auto; max-width: 50%; font-size: 1em; padding: 0.15em 0.4em; border-radius: 0.5em; z-index: 11; background: rgba(0,0,0,0.3) !important; }' +
            '.orientation--landscape .card--new_seria, .size--big .card--new_seria { width: auto !important; float: right !important; margin-top: 0.3em !important; margin-bottom: 0.5em !important; }' +
            '</style>');
        $('head').append(style);

        Lampa.Listener.follow('full', function (event) {
            if (event.type !== 'complite' || Lampa.Activity.active().component !== 'full') return;

            var data = Lampa.Activity.active().card;
            if (!data || data.source !== 'tmdb' || !data.seasons || !isSeasonSeriaEnabled()) return;

            var activityRender = Lampa.Activity.active().activity.render();
            var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);
            if ($('.card--new_seria', activityRender).length || !cardContainer.length) return;

            var seasonNumber = data.last_episode_to_air ? data.last_episode_to_air.season_number : 1;
            var episodeNumber = data.last_episode_to_air ? data.last_episode_to_air.episode_number : 0;
            var nextEpisode = data.next_episode_to_air;
            var seasons = data.seasons;
            var status = data.status || '';

            var seasonData = null;
            for (var i = 0; i < seasons.length; i++) {
                if (seasons[i].season_number === seasonNumber) {
                    seasonData = seasons[i];
                    break;
                }
            }
            var episodeCount = seasonData ? seasonData.episode_count : episodeNumber;

            var totalEpisodes = 0;
            for (var j = 0; j < seasons.length; j++) {
                totalEpisodes += seasons[j].episode_count || 0;
            }

            var displayEpisodeNumber = nextEpisode && new Date(nextEpisode.air_date) <= new Date()
                ? nextEpisode.episode_number
                : episodeNumber;

            var labelText;
            if (status === 'Ended' || status === 'Canceled') {
                labelText = Lampa.Lang.translate(status === 'Ended' ? 'season_seria_series_ended' : 'season_seria_series_canceled')
                    .replace('{seasons}', seasons.length)
                    .replace('{episodes}', totalEpisodes);
            } else if (status === 'Planned') {
                labelText = Lampa.Lang.translate('season_seria_series_planned')
                    .replace('{season}', seasonNumber);
            } else if (!nextEpisode && data.last_episode_to_air) {
                labelText = Lampa.Lang.translate('season_seria_season_completed')
                    .replace('{season}', seasonNumber)
                    .replace('{episodes}', episodeCount);
            } else {
                labelText = Lampa.Lang.translate('season_seria_active')
                    .replace('{season}', seasonNumber)
                    .replace('{current}', displayEpisodeNumber)
                    .replace('{total}', episodeCount);
            }

            var newSeriaTag = '<div class="card--new_seria"><span>' + Lampa.Lang.translate(labelText) + '</span></div>';

            if (document.body.classList.contains('orientation--portrait') && !document.body.classList.contains('size--big')) {
                cardContainer.append(newSeriaTag);
            } else {
                cardContainer.after(newSeriaTag);
            }
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') initPlugin();
        });
    }
})();
