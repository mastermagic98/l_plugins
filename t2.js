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
        season_seria_label: {
            en: "Season: {season} / Episode: {episode}",
            uk: "Сезон: {season} / Серія: {episode}"
        },
        season_seria_completed: {
            en: "Season: {season} completed",
            uk: "Сезон: {season} завершено"
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

        // Додаємо CSS для батьківського контейнера, щоб забезпечити позиціонування
        var style = $('<style>.full-start__poster, .full-start-new__poster { position: relative; }</style>');
        $('head').append(style);

        // Підписка на події компонента full
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite' && Lampa.Activity.active().component === 'full') {
                var data = Lampa.Activity.active().card;

                // Перевірка, чи це серіал із джерела tmdb
                if (data && data.source === 'tmdb' && data.seasons && data.last_episode_to_air) {
                    var seasonNumber = data.last_episode_to_air.season_number;
                    var episodeNumber = data.last_episode_to_air.episode_number;
                    var nextEpisode = data.next_episode_to_air;
                    var seasons = data.seasons;

                    // Знаходимо кількість епізодів у сезоні
                    var seasonData = seasons.find(function (season) {
                        return season.season_number === seasonNumber;
                    });
                    var episodeCount = seasonData ? seasonData.episode_count : episodeNumber;

                    // Визначаємо, чи є наступний епізод
                    var displayEpisodeNumber = nextEpisode && new Date(nextEpisode.air_date) <= Date.now()
                        ? nextEpisode.episode_number
                        : episodeNumber;

                    // Формуємо текст для відображення
                    var labelText;
                    if (nextEpisode) {
                        labelText = Lampa.Lang.translate('season_seria_label')
                            .replace('{season}', seasonNumber)
                            .replace('{episode}', displayEpisodeNumber + ' / ' + episodeCount);
                    } else {
                        labelText = Lampa.Lang.translate('season_seria_completed')
                            .replace('{season}', seasonNumber);
                    }

                    // Формуємо тег із текстом (без іконки)
                    var newSeriaTag = '<div class="card--new_seria" style="position: absolute; bottom: 0.8em; right: 0.8em; background: #ff4242; color: #fff; padding: 0.4em 0.6em; font-size: 1.2em; border-radius: 0.3em; z-index: 10;">' +
                        '<span>' + Lampa.Lang.translate(labelText) + '</span></div>';

                    // Додаємо тег до картки
                    var activityRender = Lampa.Activity.active().activity.render();
                    var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);

                    // Якщо тег ще не доданий і є контейнер картки
                    if (!$('.card--new_seria', activityRender).length && cardContainer.length) {
                        // Додаємо тег всередину контейнера постера
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
