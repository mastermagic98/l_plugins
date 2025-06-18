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

        // Перевірка .card--tv і .card__type
        var isCardTv = cardElement.hasClass('card--tv');
        var cardTypeElement = cardElement.find('.card__type');
        var cardTypeText = cardTypeElement.length ? cardTypeElement.text().toLowerCase() : '';
        console.log('Card type:', cardTypeText, 'Is card--tv:', isCardTv, 'Card data:', card ? JSON.stringify(card, null, 2) : 'undefined'); // Дебаг

        // Перевірка, чи це серіал
        var isSeries = isCardTv || cardTypeText.includes('serial') || cardTypeText.includes('tv') || cardTypeText.includes('серіал');

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
            }, 'Vote height:', $('.card__vote').outerHeight(), 'Seria height:', $('.card--new_seria').outerHeight()); // Дебаг
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        console.log('initPlugin called'); // Дебаг

        // Додаємо CSS
        var style = $('<style>' +
            '.card--tv .card__view, .full-start__poster, .full-start-new__poster { ' +
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
            'position: absolute; ' +
            'left: 0.3em; ' +
            'bottom: 0.3em; ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 0.8em; ' +
            'font-weight: 700; ' +
            'padding: 0.4em 0.8em; ' +
            'border-radius: 0.5em; ' +
            'z-index: 10; ' +
            'display: inline-block; ' +
            'vertical-align: middle; ' +
            '-webkit-user-select: none; ' +
            '-moz-user-select: none; ' +
            '-ms-user-select: none; ' +
            'user-select: none; ' +
            'line-height: 1.1; ' +
            'min-width: 2.5em; ' +
            'min-height: 27px; ' +
            'text-align: center; ' +
            '}' +
            '.card--new_seria span { ' +
            'display: block; ' +
            'white-space: pre; ' +
            '}' +
            '</style>');
        $('head').append(style);

        // Обробка детального перегляду
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite' && Lampa.Activity.active().component === 'full') {
                console.log('Full event triggered'); // Дебаг
                var activity = Lampa.Activity.active();
                var activityRender = activity.activity.render();
                var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender).first(); // Беремо лише перший постер
                var tmdbId = activity.card?.id || activity.activity.data('id');
                console.log('TMDB ID:', tmdbId); // Дебаг

                if (tmdbId && Lampa.TMDB) {
                    // Асинхронне отримання даних із TMDB
                    Lampa.TMDB.get('tv/' + tmdbId, function (data) {
                        console.log('TMDB data:', JSON.stringify(data, null, 2)); // Дебаг
                        addSeriaTag(data, cardContainer, $(activityRender));
                    }, function () {
                        console.log('TMDB request failed'); // Дебаг
                        addSeriaTag({}, cardContainer, $(activityRender)); // Запасний варіант
                    });
                } else {
                    console.log('No TMDB ID or TMDB not available'); // Дебаг
                    var data = activity.card || activity.activity.data('card') || {};
                    console.log('Fallback data:', JSON.stringify(data, null, 2)); // Дебаг
                    addSeriaTag(data, cardContainer, $(activityRender));
                }
            }
        });

        // Періодичне сканування карток
        setInterval(function () {
            console.log('Scanning cards'); // Дебаг
            $('.card--tv').each(function () {
                var cardElement = $(this);
                var cardData = cardElement.data('card');
                console.log('Processing card:', cardData ? JSON.stringify(cardData, null, 2) : 'undefined'); // Дебаг
                var container = cardElement.find('.card__view') || cardElement;
                addSeriaTag(cardData, container, cardElement);
            });
        }, 1000);
    }

    // Запуск плагіна
    if (window.appready) {
        console.log('App ready, starting plugin'); // Дебаг
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                console.log('App ready event, starting plugin'); // Дебаг
                initPlugin();
            }
        });
    }
})();
