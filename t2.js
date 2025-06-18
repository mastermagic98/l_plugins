(function () {
    'use strict';

    // Перевірка, чи плагін уже ініціалізовано
    if (window.SeasonSeriaWindow && window.SeasonSeriaPlugin.__initialized) return;
    window.SeasonSeriaPlugin = window.SeasonSeriaPlugin || {};
    window.SeasonSeriaPlugin.___initialized = true;

    // Додавання локалізації для англійської та української мов
    Lampa.Lang.add({
        season_seria_setting: {
            en: "Show series status (season/episode)",
            uk: "Відображення стану серіалу (сезон/серія)"
        },
        season_seria_active: {
            en: "Season {season}\nEpisodes {current}/{total}",
            uk: "Сезон {season}\nЕпізодів {current}/{total}"
        },
        season_seria_season_completed: {
            en: "Season {season}\nEpisodes {episodes}",
            uk: "Сезон {season}\nЕпізодів {episodes}"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons} Episodes {episodes}\nEnded",
            uk: "Сезонів {seasons} Епізодів {episodes}\nЗакінчено}"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons} Episodes {episodes}\nCanceled",
            uk: "Сезонів {seasons} Епізодів {episodes}\nПрипинено}"
        },
        season_seria_series_planned: {
            en: "Season {season}\nPlanned",
            uk: "Сезон {season}\nЗаплановано}"
        }
    });

    // Додавання параметра в налаштування Lampa
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'season_and_seria',
            type: 'select',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('season_seria_setting')
        },
        onRender: function () {
            // Приховуємо елемент із атрибутом data-name="card_interfice_cover"
            setTimeout(function () {
                $('div[data-name="card_interfice_cover"]').hide();
            }, 0);
        }
    });

    // Перевірка, чи ввімкнено відображення сезону та серії
    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_and_seria') !== false;
    }

    // Функція ініціалізації плагіну
    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        // Додаємо CSS для батьківського контейнера та стилів тегу
        var style = $('<style>' +
            '.full-start__poster, .full-start-new__poster { position: relative; width: 100%; }' +
            '.card--new_seria { ' +
            'position: relative; ' +
            'width: 100%; ' +
            'margin-top: 0.3em; ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 1.1em; ' +
            'font-weight: 700; ' +
            'padding: 0.2em 0.5em; ' +
            'border-radius: 1em; ' +
            'z-index: 10; ' +
            'display: block; ' +
            'text-align: center; ' +
            '-webkit-user-select: none; ' +
            '-moz-user-select: none; ' +
            '-ms-user-select: none; ' +
            'user-select: none; ' +
            'min-height: 2.4em; ' +
            'line-height: 1.2; ' +
            '}' +
            '.card--new_seria span { ' +
            'display: block; ' +
            'white-space: pre; ' +
            '}' +
            '</style>');
        $('head').append(style);

        // Підписка на події компонента full
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite' && Lampa.Activity.active().component === 'full') {
                var data = Lampa.Activity.active().card;

                // Перевірка, чи це серіал із джерела tmdb
                if (data && data.source === 'tmdb' && data.seasons && isSeasonSeriaEnabled()) {
                    var activityRender = Lampa.Activity.active().activity.render();
                    var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);

                    // Додавання тегу сезону та серії (.card--new_seria)
                    if (!$('.card--new_seria', activityRender).length && cardContainer.length) {
                        var seasonNumber = data.last_episode_to_air ? data.last_episode_to_air.season_number : 1;
                        var episodeNumber = data.last_episode_to_air ? data.last_episode_to_air.episode_number : 0;
                        var nextEpisode = data.next_episode_to_air;
                        var seasons = data.seasons;
                        var status = data.status || '';

                        // Знаходимо кількість епізодів у сезоні
                        var seasonData = seasons.find(function (season) {
                            return season.season_number === seasonNumber;
                        });
                        var episodeCount = seasonData ? seasonData.episode_count : episodeNumber;

                        // Обчислюємо загальну кількість епізодів
                        var totalEpisodes = seasons.reduce(function (sum, season) {
                            return sum + (season.episode_count || 0);
                        }, 0);

                        // Визначаємо, чи є наступний епізод
                        var displayEpisodeNumber = nextEpisode && new Date(nextEpisode.air_date) <= Date.now()
                            ? nextEpisode.episode_number
                            : episodeNumber;

                        // Формуємо текст для відображення
                        var labelText;
                        if (['Ended', 'Canceled'].includes(status)) {
                            // Випадок 3: Серіал закінчено або припинено
                            labelText = Lampa.Lang.translate(status === 'Ended' ? 'season_seria_series_ended' : 'season_seria_series_canceled')
                                .replace('{seasons}', seasons.length)
                                .replace('{episodes}', totalEpisodes);
                        } else if (['Planned'].includes(status)) {
                            // Статус Planned: ще не почався
                            labelText = Lampa.Lang.translate('season_seria_series_planned')
                                .replace('{season}', seasonNumber);
                        } else if (!nextEpisode && data.last_episode_to_air) {
                            // Випадок 2: Сезон завершено
                            labelText = Lampa.Lang.translate('season_seria_season_completed')
                                .replace('{season}', seasonNumber)
                                .replace('{episodes}', episodeCount);
                        } else {
                            // Випадок 1: Активний сезон (Returning Series, In Production, Pilot)
                            labelText = Lampa.Lang.translate('season_seria_active')
                                .replace('{season}', seasonNumber)
                                .replace('{current}', displayEpisodeNumber)
                                .replace('{total}', episodeCount);
                        }

                        // Формуємо тег із текстом
                        var newSeriaTag = '<div class="card--new_seria">' +
                            '<span>' + Lampa.Lang.translate(labelText) + '</span></div>';

                        // Додаємо тег під картку
                        cardContainer.after(newSeriaTag);
                    }
                }
            }
        });
    }

    // Запуск плагіну після готовності додатку
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initPlugin();
            }
        });
    }
})();
