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

                    // Додаємо тег із інформацією на картку
                    var activityRender = Lampa.Activity.active().activity.render();
                    var newSeriaTag = '<div class="card--new_seria" style="right: -0.6em!important; position: absolute; background: #ff4242; color: #fff; bottom: .6em!important; padding: 0.4em 0.4em; font-size: 1.2em; -webkit-border-radius: 0.3em; -moz-border-radius: 0.3em; border-radius: 0.3em;">' +
                        '<img src="./img/icons/menu/movie.svg" /> <div>' + Lampa.Lang.translate(labelText) + '</div></div>';

                    // Якщо тег ще не доданий
                    if (!$('.card--new_seria', activityRender).length) {
                        // Для екрану шириною більше 585px додаємо тег після .full-start-new__details
                        if (window.innerWidth > 585 && !$('.full-start-new.cardify').length) {
                            $('.full-start-new__details', activityRender).append(newSeriaTag);
                        } else {
                            // Для інших випадків додаємо до .full-start__tags або після .full-start__poster
                            if ($('.full-start__tags', activityRender).length) {
                                $('.full-start__tags', activityRender).append(
                                    '<span class="full-start-new__split">●</span><div class="card--new_seria"><div>' + Lampa.Lang.translate(labelText) + '</div></div>'
                                );
                            } else {
                                $('.full-start__poster,.full-start-new__poster', activityRender).after(
                                    '<div class="full-start__tag card--new_seria"><img src="./img/icons/menu/movie.svg" /> <div>' + Lampa.Lang.translate(labelText) + '</div></div>'
                                );
                            }
                        }
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
