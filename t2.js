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
            'min-height: 2.2em; ' + // Однакова висота для обох тегів
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
            'white-space: pre; ' + // Зберігає \n для двох рядків
            '}' +
            '</style>');
        $('head').append(style);

        // Підписка на події компонента full
        Lampa.Listener.follow('full', function (event) {
            if (event.type === 'complite' && L
