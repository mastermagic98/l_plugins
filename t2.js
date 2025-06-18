(function () {
    'use strict';

    // Перевірка, чи плагін уже ініціалізовано
    if (window.SeasonSeriaPlugin && window.SeasonSeriaPlugin.__initialized) return;
    window.SeasonSeriaPlugin = window.SeasonSeriaPlugin || {};
    window.SeasonSeriaPlugin.__initialized = true;

    console.log('SeasonSeriaPlugin initialized'); // Дебаг

    // Додавання локалізації
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

    // Додавання параметра в налаштування
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
            setTimeout(function () {
                $('div[data-name="card_interfice_cover"]').hide();
            }, 0);
        }
    });

    // Перевірка, чи ввімкнено відображення
    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_and_seria') !== false;
    }

    // Функція для додавання тегу
    function addSeriaTag(card, container, cardElement) {
        if (!container || !isSeasonSeriaEnabled() || container.find('.card--new_seria').length || cardElement.attr('data-seria-processed')) return;

        // Позначаємо картку як оброблену
        cardElement.attr('data-seria-processed', 'true');

        // Перевірка, чи це серіал
        var isSeries = card?.type === 'series' || card?.media_type === 'tv';
        console.log('Card data:', card ? JSON.stringify(card, null, 2) : 'undefined', 'Is series:', isSeries); // Дебаг

        if (isSeries) {
            console.log('addSeriaTag called for series:', card); // Дебаг
            // Використовуємо значення за замовчуванням
            var seasonNumber = card?.last_episode_to_air?.season_number || 1;
            var episodeNumber = card?.last_episode_to_air?.episode_number || 0;
            var nextEpisode = card?.next_episode_to_air;
            var seasons = card?.seasons || [];
            var status = card?.status || '';

            console.log('Series data:', { seasonNumber, episodeNumber, nextEpisode, seasons, status }); // Дебаг

            // Кількість епізодів у сезоні
            var seasonData = seasons.find(function (season) {
                return season && season.season_number === seasonNumber;
            });
            var episodeCount = seasonData?.episode_count || episodeNumber;

            // Загальна кількість епізодів
            var totalEpisodes = seasons.reduce(function (sum, season) {
                return sum + (season?.episode_count || 0);
            }, 0);

            // Визначаємо наступний епізод
            var displayEpisodeNumber = nextEpisode && new Date(nextEpisode?.air_date) <= Date.now()
                ? nextEpisode.episode_number
                : episodeNumber;

            // Формуємо текст
            var labelText;
            if (status === 'Ended' || status === 'Canceled') {
                labelText = Lampa.Lang.translate(status === 'Ended' ? 'season_seria_series_ended' : 'season_seria_series_canceled')
                    .replace('{seasons}', seasons.length || 1)
                    .replace('{episodes}', totalEpisodes);
            } else if (status === 'Planned' && !card?.last_episode_to_air) {
                labelText = Lampa.Lang.translate('season_seria_series_canceled')
                    .replace('{seasons}', seasons.length || 1)
                    .replace('{episodes}', totalEpisodes);
            } else if (!nextEpisode && ['Returning Series', 'In Production', 'Pilot'].includes(status)) {
                labelText = Lampa.Lang.translate('season_seria_season_completed')
                    .replace('{season}', seasonNumber);
            } else {
                labelText = Lampa.Lang.translate('season_seria_active')
                    .replace('{season}', seasonNumber)
                    .replace('{current}', displayEpisodeNumber)
                    .replace('{total}', episodeCount);
            }

            // Формуємо тег
            var newSeriaTag = '<div class="card--new_seria">' +
                '<span>' + Lampa.Lang.translate(labelText) + '</span></div>';

            container.append(newSeriaTag);
            console.log('Tag added to:', container.attr('class'), 'Container dimensions:', {
                width: container.width(),
                height: container.height()
            }, 'Seria width:', $('.card--new_seria').outerWidth()); // Дебаг
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        console.log('initPlugin called'); // Дебаг

        // Додаємо CSS
        var style = $('<style>' +
            '.full-start__poster { ' +
            'position: relative; ' +
            'width: 100%; ' +
            'height: 100%; ' +
            '}' +
            '.card__vote { ' +
            'position: absolute; ' +
            'right: 0.3em; ' +
            'bottom: 0.3em; ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 1.3em; ' +
            'font-weight: 700; ' +
            'padding: 0.2em 0.5em; ' +
            'border-radius: 1em; ' +
            '}' +
            '.card--new_seria { ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 0.8em; ' +
            'font-weight: 700; ' +
            'padding: 0.4em 0.8em; ' +
            'border-radius: 0.5em; ' +
            'z-index: 10; ' +
            'display: block; ' +
            'width: 100%; ' +
            'min-height: 27px; ' +
            'text-align: center; ' +
            'box-sizing: border-box; ' +
            '-webkit-user-select: none; ' +
            '-moz-user-select: none; ' +
            '-ms-user-select: none; ' +
            'user-select: none; ' +
            'line-height: 1.1; ' +
            'margin-top: 0.5em; ' +
            '}' +
            '.card--new_seria span { ' +
            'display: block; ' +
            'white-space: pre; ' +
            '}' +
            '</style>');
        $('head').append(style);

        // Обробка сторінки full
        function processFull() {
            if (!Lampa.Activity || !Lampa.Activity.active()) {
                console.log('Activity not ready'); // Дебаг
                return;
            }
            var activity = Lampa.Activity.active();
            if (activity.component !== 'full') return;
            console.log('Full page detected'); // Дебаг
            var activityRender = activity.activity.render();
            var cardContainer = $('.full-start__poster', activityRender).parent(); // Контейнер під постером
            var data = activity.card || {};
            console.log('Activity card data:', JSON.stringify(data, null, 2)); // Дебаг

            // Додаємо затримку для забезпечення завантаження даних
            setTimeout(function () {
                if (!Lampa.Activity.active()) return;
                var updatedData = Lampa.Activity.active().card || {};
                console.log('Updated card data:', JSON.stringify(updatedData, null, 2)); // Дебаг
                addSeriaTag(updatedData, cardContainer, $(activityRender));
            }, 1500);
        }

        // MutationObserver для відстеження змін
        var observer = new MutationObserver(function (mutations) {
            var fullPageProcessed = false;
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.matches('.full-start__poster') && !fullPageProcessed) {
                                fullPageProcessed = true;
                                processFull();
                            }
                            var posters = node.querySelectorAll('.full-start__poster');
                            if (posters.length && !fullPageProcessed) {
                                fullPageProcessed = true;
                                processFull();
                            }
                        }
                    }
                }
            });
        });

        // Запуск спостерігача
        observer.observe(document.body, { childList: true, subtree: true });

        // Обробка після завантаження додатку
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                console.log('App ready event, starting plugin'); // Дебаг
                processFull();
            }
        });
    }

    // Запуск плагіна
    initPlugin();
})();
