(function () {
    'use strict';

    // Перевірка, чи плагін уже ініціалізовано
    if (window.SeasonSeriaPlugin && window.SeasonSeriaPlugin.__initialized) return;
    window.SeasonSeriaPlugin = window.SeasonSeriaPlugin || {};
    window.SeasonSeriaPlugin.__initialized = true;

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
            en: "Season {season}\nCompleted",
            uk: "Сезон {season}\nЗавершено"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons} Episodes {episodes}\nEnded",
            uk: "Сезонів {seasons} Епізодів {episodes}\nЗакінчено"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons} Episodes {episodes}\nCanceled",
            uk: "Сезонів {seasons} Епізодів {episodes}\nПрипинено"
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

        // Додаємо CSS для батьківського контейнера та стилів тегів
        var style = $('<style>' +
            '.full-start__poster, .full-start-new__poster { position: relative; }' +
            '.card--new_seria, .card__vote { ' +
            'position: absolute; ' +
            'bottom: 0.3em; ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 1em; ' +
            'font-weight: 700; ' +
            'padding: 0.2em 0.5em; ' +
            'border-radius: 1em; ' +
            'z-index: 10; ' +
            'display: inline-block; ' +
            'vertical-align: middle; ' +
            '-webkit-user-select: none; ' +
            '-moz-user-select: none; ' +
            '-ms-user-select: none; ' +
            'user-select: none; ' +
            'min-height: 2.2em; ' +
            'line-height: 1.2; ' +
            '}' +
            '.card--new_seria { ' +
            'left: 0.3em; ' +
            '}' +
            '.card__vote { ' +
            'right: 0.3em; ' +
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

                // Перевірка, чи це серіал або фільм із джерела tmdb
                if (data && data.source === 'tmdb') {
                    var activityRender = Lampa.Activity.active().activity.render();
                    var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);

                    // Додавання тегу оцінки (.card__vote), якщо є vote_average
                    if (data.vote_average && !$('.card__vote', activityRender).length && cardContainer.length) {
                        var voteText = data.vote_average.toFixed(1);
                        var voteTag = '<div class="card__vote">' + voteText + '</div>';
                        cardContainer.append(voteTag);
                    }

                    // Додавання тегу сезону та серії (.card--new_seria), якщо це серіал
                    if (data.seasons && data.last_episode_to_air && isSeasonSeriaEnabled() && !$('.card--new_seria', activityRender).length && cardContainer.length) {
                        var seasonNumber = data.last_episode_to_air.season_number;
                        var episodeNumber = data.last_episode_to_air.episode_number;
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
                        if (status === 'Ended' || status === 'Canceled') {
                            // Випадок 3: Серіал закінчено або припинено
                            labelText = Lampa.Lang.translate(status === 'Ended' ? 'season_seria_series_ended' : 'season_seria_series_canceled')
                                .replace('{seasons}', seasons.length)
                                .replace('{episodes}', totalEpisodes);
                        } else if (status === 'Planned' && !data.last_episode_to_air) {
                            // Випадок 3: Запланований серіал без епізодів
                            labelText = Lampa.Lang.translate('season_seria_series_canceled')
                                .replace('{seasons}', seasons.length)
                                .replace('{episodes}', totalEpisodes);
                        } else if (!nextEpisode && ['Returning Series', 'In Production', 'Pilot'].includes(status)) {
                            // Випадок 2: Сезон завершено
                            labelText = Lampa.Lang.translate('season_seria_season_completed')
                                .replace('{season}', seasonNumber);
                        } else if (['Returning Series', 'In Production', 'Pilot'].includes(status)) {
                            // Випадок 1: Активний сезон
                            labelText = Lampa.Lang.translate('season_seria_active')
                                .replace('{season}', seasonNumber)
                                .replace('{current}', displayEpisodeNumber)
                                .replace('{total}', episodeCount);
                        } else {
                            // Запасний варіант для невідомого статусу
                            labelText = Lampa.Lang.translate('season_seria_active')
                                .replace('{season}', seasonNumber)
                                .replace('{current}', displayEpisodeNumber)
                                .replace('{total}', episodeCount);
                        }

                        // Формуємо тег із текстом
                        var newSeriaTag = '<div class="card--new_seria">' +
                            '<span>' + Lampa.Lang.translate(labelText) + '</span></div>';

                        // Додаємо тег до картки
                        cardContainer.append(newSeriaTag);
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
