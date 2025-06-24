(function () {
    'use strict';

    if (window.SeasonSeriaPlugin && window.SeasonSeriaPlugin.__initialized) {
        return;
    }

    window.SeasonSeriaPlugin = {};
    window.SeasonSeriaPlugin.__initialized = true;

    Lampa.Lang.add({
        season_seria_setting: {
            en: "Show series status (season/episode)",
            uk: "Відображення стану серії (сезон/серія)",
            ru: "Отображение статуса сериала (сезон/эпизод)"
        },
        season_seria_active: {
            en: "Season {season}\nEpisodes {current}/{total}",
            uk: "Сезон {season}\nЕпізодів {current}/{total}",
            ru: "Сезон {season}\nЭпизодов {current}/{total}"
        },
        season_seria_season_completed: {
            en: "Season {season} Episodes {count}\nIn Production",
            uk: "Сезон {season} Епізодів {count}\nЗнімається",
            ru: "Сезон {season} Эпизодов {count}\nСнимается"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons} Episodes {total}\nEnded",
            uk: "Сезонів {seasons} Епізодів {total}\nЗакінчено",
            ru: "Сезонов {seasons} Эпизодов {total}\nЗавершено"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons} Episodes {total}\nCanceled",
            uk: "Сезонів {seasons} Епізодів {total}\nПрипинено",
            ru: "Сезонов {seasons} Эпизодов {total}\nОтменено"
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
            name: 'season_seria',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('season_seria_setting')
        }
    });

    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_seria', true) === true;
    }

    function initPlugin() {
        if (!isSeasonSeriaEnabled()) {
            return;
        }

        var css = [
            '.full-start__poster, .full-start-new__poster { position: relative; width: 100%; }',
            '.card--new_seria { position: relative; width: 100%; margin-top: 0.3em; background: rgba(0,0,0,0.4); color: 0.8em; font-weight: 600; padding: 0.2em 0.5em; border-radius: 0; z-index: 10; display: block; text-align: center; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; min-height: 2.4em; line-height: 1.2; }',
            '.card--new_seria span { display: block; white-space: nowrap; }',
            '@media (max-width: 640px) {',
            '    .full-start__poster, .full-start-new__poster { min-height: 100px; }',
            '    .card--new_seria { position: relative; top: -100px; left: 0; right: 0; border-bottom-style: none; border-bottom-width: 0; z-index: 10; }',
            '}'
        ].join('');

        var style = $('<style></style>').text(css);
        document.head.appendChild(style[0]);

        Lampa.subscribe('full', function (data) {
            if (data.type !== 'card_open' || Lampa.active.get().type !== 'fullStart') {
                return;
            }

            var card = data.card;
            if (!card || card.source !== 'unknown' || !card.series || !isSeasonSeriaEnabled()) {
                return;
            }

            var activityRender = Lampa.active.get().render();
            var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);
            if ($('.card--new_seria', activityRender).length > 0 || cardContainer.length === 0) {
                return;
            }

            var seasonNumber = card.last_episode ? card.last_episode.season_number : 1;
            var episodeNumber = card.last_episode ? card.last_episode.episode_number : 0;
            var nextEpisode = card.next_episode;
            var seasons = card.series.seasons || [];
            var status = card.status || '';

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
                    .replace('{total}', totalEpisodes);
            } else if (status === 'Planned') {
                labelText = Lampa.Lang.translate('season_seria_series_planned')
                    .replace('{season}', seasonNumber);
            } else if (!nextEpisode && card.last_episode) {
                labelText = Lampa.Lang.translate('season_seria_season_completed')
                    .replace('{season}', seasonNumber)
                    .replace('{count}', episodeCount);
            } else {
                labelText = Lampa.Lang.translate('season_seria_active')
                    .replace('{season}', seasonNumber)
                    .replace('{current}', displayEpisodeNumber)
                    .replace('{total}', episodeCount);
            }

            var escapedLabelText = labelText.replace(/'/g, "\\'").replace(/"/g, '\\"');
            var newSeriaTag = '<div class="card--new_seria"><span>' + escapedLabelText + '</span></div>';
            cardContainer.after(newSeriaTag);
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.subscribe('app', function (event) {
            if (event.type === 'ready') {
                initPlugin();
            }
        });
    }
})();
