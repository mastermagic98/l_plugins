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
        if (!card || !container || !isSeasonSeriaEnabled() || $('.card--new_seria', container).length) return;

        // Перевірка тегу .card__type
        var cardTypeElement = cardElement.find('.card__type');
        var cardTypeText = cardTypeElement.length ? cardTypeElement.text().toLowerCase() : '';
        console.log('Card type:', cardTypeText, 'Card data:', JSON.stringify(card, null, 2)); // Дебаг

        // Перевірка, чи це серіал
        var isSeries = cardTypeText.includes('serial') ||
                       cardTypeText.includes('tv') ||
                       cardTypeText.includes('серіал') ||
                       card.media_type === 'tv' ||
                       (card.movie && card.movie.media_type === 'tv') ||
                       card.seasons ||
                       card.last_episode_to_air;

        if (isSeries) {
            console.log('addSeriaTag called for series:', card); // Дебаг
            var seasonNumber = card.last_episode_to_air?.season_number || 1;
            var episodeNumber = card.last_episode_to_air?.episode_number || 0;
            var nextEpisode = card.next_episode_to_air;
            var seasons = card.seasons || [];
            var status = card.status || '';

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
            var displayEpisodeNumber = nextEpisode && new Date(nextEpisode.air_date) <= Date.now()
                ? nextEpisode.episode_number
                : episodeNumber;

            // Формуємо текст
            var labelText;
            if (status === 'Ended' || status === 'Canceled') {
                labelText = Lampa.Lang.translate(status === 'Ended' ? 'season_seria_series_ended' : 'season_seria_series_canceled')
                    .replace('{seasons}', seasons.length || 1)
                    .replace('{episodes}', totalEpisodes);
            } else if (status === 'Planned' && !card.last_episode_to_air) {
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
            console.log('Tag added to:', container); // Дебаг
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        console.log('initPlugin called'); // Дебаг

        // Додаємо CSS
        var style = $('<style>' +
            '.card, .card__poster, .card__image, .full-start__poster, .full-start-new__poster { position: relative; }' +
            '.card--new_seria { ' +
            'position: absolute; ' +
            'left: 0.3em; ' +
            'bottom: 0.3em; ' +
            'background: rgba(0, 0, 0, 0.5); ' +
            'color: #fff; ' +
            'font-size: 0.5em; ' +
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
                var data = Lampa.Activity.active().card;
                var activityRender = Lampa.Activity.active().activity.render();
                var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);
                addSeriaTag(data, cardContainer, $(activityRender));
            }
        });

        // Періодичне сканування карток
        setInterval(function () {
            console.log('Scanning cards'); // Дебаг
            $('.card').each(function () {
                var cardElement = $(this);
                var cardData = cardElement.data('card');
                if (cardData) {
                    console.log('Processing card:', JSON.stringify(cardData, null, 2)); // Дебаг
                    var container = cardElement.find('.card__poster, .card__image') || cardElement;
                    addSeriaTag(cardData, container, cardElement);
                }
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
