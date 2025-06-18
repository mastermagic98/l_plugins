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
            setTimeout(function () {
                $('div[data-name="card_interfice_cover"]').hide();
            }, 0);
        }
    });

    // Перевірка, чи ввімкнено відображення сезону та серії
    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_and_seria') !== false;
    }

    // Функція для додавання тегу до картки
    function addSeriaTag(card, container) {
        if (!card || !container || !isSeasonSeriaEnabled() || $('.card--new_seria', container).length) return;

        console.log('addSeriaTag called:', card); // Дебаг-логування

        // Перевірка, чи це серіал із джерела tmdb
        if (card.source === 'tmdb' && card.movie && card.movie.media_type === 'tv') {
            var seasonNumber = card.last_episode_to_air ? card.last_episode_to_air.season_number : 1;
            var episodeNumber = card.last_episode_to_air ? card.last_episode_to_air.episode_number : 0;
            var nextEpisode = card.next_episode_to_air;
            var seasons = card.seasons || [];
            var status = card.status || '';

            console.log('Card data:', { seasonNumber, episodeNumber, nextEpisode, seasons, status }); // Дебаг

            // Знаходимо кількість епізодів у сезоні
            var seasonData = seasons.find(function (season) {
                return season && season.season_number === seasonNumber;
            });
            var episodeCount = seasonData ? seasonData.episode_count : episodeNumber;

            // Обчислюємо загальну кількість епізодів
            var totalEpisodes = seasons.reduce(function (sum, season) {
                return sum + (season && season.episode_count || 0);
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
            } else if (status === 'Planned' && !card.last_episode_to_air) {
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
                // Запасний варіант
                labelText = Lampa.Lang.translate('season_seria_active')
                    .replace('{season}', seasonNumber)
                    .replace('{current}', displayEpisodeNumber)
                    .replace('{total}', episodeCount);
            }

            // Формуємо тег із текстом
            var newSeriaTag = '<div class="card--new_seria">' +
                '<span>' + Lampa.Lang.translate(labelText) + '</span></div>';

            // Додаємо тег до картки
            container.append(newSeriaTag);
        }
    }

    // Функція ініціалізації плагіну
    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        // Додаємо CSS для батьківського контейнера та стилів тегу
        var style = $('<style>' +
            '.card__view, .card, .full-start__poster, .full-start-new__poster { position: relative; }' +
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

        // Обробка сторінки детального перегляду (компонент full)
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite' && Lampa.Activity.active().component === 'full') {
                var data = Lampa.Activity.active().card;
                var activityRender = Lampa.Activity.active().activity.render();
                var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);
                addSeriaTag(data, cardContainer);
            }
        });

        // Обробка списків карток (компоненти main, category, тощо)
        Lampa.Listener.follow('component', function (event) {
            console.log('Component event:', event.name); // Дебаг
            if (['main', 'category', 'search', 'menu'].includes(event.name)) {
                setTimeout(function () {
                    $('.card__view').each(function () {
                        var cardElement = $(this).closest('.card');
                        var cardData = cardElement.data('card');
                        if (cardData) {
                            console.log('Processing card:', cardData); // Дебаг
                            var container = cardElement.find('.card__view') || cardElement;
                            addSeriaTag(cardData, container);
                        }
                    });
                }, 100); // Затримка для забезпечення завантаження DOM
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
