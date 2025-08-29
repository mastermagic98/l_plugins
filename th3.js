function applyStyles() {
    if (!ColorPlugin.settings.enabled) {
        var oldStyle = document.getElementById('color-plugin-styles');
        if (oldStyle) oldStyle.remove();
        return;
    }

    var style = document.getElementById('color-plugin-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'color-plugin-styles';
        document.head.appendChild(style);
    }

    var rgbColor = hexToRgb(ColorPlugin.settings.main_color);

    var highlightStyles = ColorPlugin.settings.highlight_enabled ? (
        '-webkit-box-shadow: inset 0 0 0 0.15em #fff;' +
        '-moz-box-shadow: inset 0 0 0 0.15em #fff;' +
        'box-shadow: inset 0 0 0 0.15em #fff;'
    ) : '';

    var dimmingStyles = ColorPlugin.settings.dimming_enabled ? (
        '.full-start__rate {' +
            'background: rgba(var(--main-color-rgb), 0.15);' +
        '}' +
        '.full-start__rate > div:first-child {' +
            'background: rgba(var(--main-color-rgb), 0.15);' +
        '}' +
        '.reaction {' +
            'background-color: rgba(var(--main-color-rgb), 0.3);' +
        '}' +
        '.full-start__button {' +
            'background-color: rgba(var(--main-color-rgb), 0.3);' +
        '}' +
        '.card__vote {' +
            'background: rgba(var(--main-color-rgb), 0.5);' +
        '}' +
        '.items-line__more {' +
            'background: rgba(var(--main-color-rgb), 0.3);' +
        '}' +
        '.card__icons-inner {' +
            'background: rgba(var(--main-color-rgb), 0.5);' +
        '}' +
        '.simple-button--filter > div {' +
            'background-color: rgba(var(--main-color-rgb), 0.3);' +
        '}'
    ) : '';

    style.innerHTML = [
        ':root {' +
            '--main-color: ' + ColorPlugin.settings.main_color + ';' +
            '--main-color-rgb: ' + rgbColor + ';' +
        '}',
        '.modal__title {' +
            'font-size: 1.7em !important;' +
        '}',
        '.modal .scroll__content {' +
            'padding: 1.0em 0 !important;' +
        '}',
        '.menu__ico, .menu__ico:hover, .menu__ico.traverse, ' +
        '.head__action, .head__action.focus, .head__action:hover, .settings-param__ico {' +
            'color: #ffffff !important;' +
            'fill: #ffffff !important;' +
        '}',
        '.menu__ico.focus {' +
            'color: #ffffff !important;' +
            'fill: #ffffff !important;' +
            'stroke: none !important;' +
        '}',
        '.menu__item.focus .menu__ico path[fill], .menu__item.focus .menu__ico rect[fill], ' +
        '.menu__item.focus .menu__ico circle[fill], .menu__item.traverse .menu__ico path[fill], ' +
        '.menu__item.traverse .menu__ico rect[fill], .menu__item.traverse .menu__ico circle[fill], ' +
        '.menu__item:hover .menu__ico path[fill], .menu__item:hover .menu__ico rect[fill], ' +
        '.menu__item:hover .menu__ico circle[fill] {' +
            'fill: #ffffff !important;' +
        '}',
        '.menu__item.focus .menu__ico [stroke], .menu__item.traverse .menu__ico [stroke], .menu__item:hover .menu__ico [stroke] {' +
            'stroke: #fff !important;' +
        '}',
        '.menu__item, .menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
        '.console__tab, .console__tab.focus, ' +
        '.settings-param, .settings-param.focus, ' +
        '.selectbox-item, .selectbox-item.focus, .selectbox-item:hover, ' +
        '.full-person, .full-person.focus, ' +
        '.full-start__button, .full-start__button.focus, ' +
        '.full-descr__tag, .full-descr__tag.focus, ' +
        '.simple-button, .simple-button.focus, ' +
        '.player-panel .button, .player-panel .button.focus, ' +
        '.search-source, .search-source.active, ' +
        '.radio-item, .radio-item.focus, ' +
        '.lang__selector-item, .lang__selector-item.focus, ' +
        '.modal__button, .modal__button.focus, ' +
        '.search-history-key, .search-history-key.focus, ' +
        '.simple-keyboard-mic, .simple-keyboard-mic.focus, ' +
        '.full-review-add, .full-review-add.focus, ' +
        '.full-review, .full-review.focus, ' +
        '.tag-count, .tag-count.focus, ' +
        '.settings-folder, .settings-folder.focus, ' +
        '.noty, ' +
        '.radio-player, .radio-player.focus {' +
            'color: #ffffff !important;' +
        '}',
        '.console__tab {' +
            'background-color: rgba(221, 221, 221, 0.06);' +
        '}',
        '.console__tab.focus {' +
            'background: var(--main-color);' +
            'color: #fff;' +
            highlightStyles +
        '}',
        '.menu__item.focus, .menu__item.traverse, .menu__item:hover, ' +
        '.full-person.focus, .full-start__button.focus, .full-descr__tag.focus, ' +
        '.simple-button.focus, .head__action.focus, .head__action:hover, ' +
        '.player-panel .button.focus, .search-source.active {' +
            'background: var(--main-color);' +
        '}',
        '.full-start__button.focus, .settings-param.focus, .items-line__more.focus, ' +
        '.menu__item.focus, .settings-folder.focus, .head__action.focus, ' +
        '.selectbox-item.focus, .simple-button.focus, .navigation-tabs__button.focus {' +
            highlightStyles +
        '}',
        '.timetable__item.focus::before {' +
            'background-color: var(--main-color);' +
            highlightStyles +
        '}',
        '.navigation-tabs__button.focus {' +
            'background-color: var(--main-color);' +
            'color: #fff;' +
            highlightStyles +
        '}',
        '.items-line__more.focus {' +
            'color: #fff;' +
            'background-color: var(--main-color);' +
        '}',
        '.timetable__item.focus {' +
            'color: #fff;' +
        '}',
        '.broadcast__device.focus {' +
            'background-color: var(--main-color);' +
            'color: #fff;' +
        '}',
        '.iptv-menu__list-item.focus, .iptv-program__timeline>div {' +
            'background-color: var(--main-color) !important;' +
        '}',
        '.radio-item.focus, .lang__selector-item.focus, .simple-keyboard .hg-button.focus, ' +
        '.modal__button.focus, .search-history-key.focus, .simple-keyboard-mic.focus, ' +
        '.full-review-add.focus, .full-review.focus, ' +
        '.tag-count.focus, .settings-folder.focus, .settings-param.focus, ' +
        '.selectbox-item.focus, .selectbox-item:hover {' +
            'background: var(--main-color);' +
        '}',
        '.online.focus {' +
            'box-shadow: 0 0 0 0.2em var(--main-color);' +
        '}',
        '.online_modss.focus::after, .online-prestige.focus::after, ' +
        '.radio-item.focus .radio-item__imgbox:after, .iptv-channel.focus::before, ' +
        '.iptv-channel.last--focus::before {' +
            'border-color: var(--main-color) !important;' +
        '}',
        '.card-more.focus .card-more__box::after {' +
            'border: 0.3em solid var(--main-color);' +
        '}',
        '.iptv-playlist-item.focus::after, .iptv-playlist-item:hover::after {' +
            'border-color: var(--main-color) !important;' +
        '}',
        '.ad-bot.focus .ad-bot__content::after, .ad-bot:hover .ad-bot__content::after, ' +
        '.card-episode.focus .full-episode::after, .register.focus::after, ' +
        '.season-episode.focus::after, .full-episode.focus::after, ' +
        '.full-review-add.focus::after, .card.focus .card__view::after, ' +
        '.card:hover .card__view::after, .extensions__item.focus:after, ' +
        '.torrent-item.focus::after, .extensions__block-add.focus:after {' +
            'border-color: var(--main-color);' +
        '}',
        '.broadcast__scan > div {' +
            'background-color: var(--main-color);' +
        '}',
        '.card:hover .card__view, .card.focus .card__view {' +
            'border-color: var(--main-color);' +
        '}',
        '.noty {' +
            'background: var(--main-color);' +
        '}',
        '.radio-player.focus {' +
            'background-color: var(--main-color);' +
        '}',
        '.explorer-card__head-img.focus::after {' +
            'border: 0.3em solid var(--main-color);' +
        '}',
        '.color_square.focus {' +
            'border: 0.3em solid var(--main-color);' +
            'transform: scale(1.1);' +
        '}',
        'body.glass--style .selectbox-item.focus, ' +
        'body.glass--style .settings-folder.focus, ' +
        'body.glass--style .settings-param.focus {' +
            'background-color: var(--main-color);' +
        '}',
        'body.glass--style .settings-folder.focus .settings-folder__icon {' +
            '-webkit-filter: none;' +
            'filter: none;' +
        '}',
        dimmingStyles,
        '.timetable__item--any::before {' +
            'background-color: rgba(var(--main-color-rgb), 0.3);' +
        '}',
        '.element {' +
            'background: var(--main-color);' +
        '}',
        '.bookmarks-folder__layer {' +
            'background-color: var(--main-color);' +
        '}',
        '.color_square.default {' +
            'background-color: #fff;' +
            'width: 30px;' +
            'height: 30px;' +
            'border-radius: 4px;' +
            'position: relative;' +
        '}',
        '.color_square.default::after {' +
            'content: "";' +
            'position: absolute;' +
            'top: 50%;' +
            'left: 10%;' +
            'right: 10%;' +
            'height: 3px;' +
            'background-color: #353535;' +
            'transform: rotate(45deg);' +
        '}',
        '.color_square.default::before {' +
            'content: "";' +
            'position: absolute;' +
            'top: 50%;' +
            'left: 10%;' +
            'right: 10%;' +
            'height: 3px;' +
            'background-color: #353535;' +
            'transform: rotate(-45deg);' +
        '}',
        '.color_square {' +
            'width: 30px;' +
            'height: 30px;' +
            'border-radius: 4px;' +
            'display: flex;' +
            'flex-direction: column;' +
            'justify-content: center;' +
            'align-items: center;' +
            'cursor: pointer;' +
            'color: #ffffff !important;' +
            'font-size: 10px;' +
            'text-align: center;' +
        '}',
        '.color-family-outline {' +
            'display: flex;' +
            'flex-direction: row;' +
            'overflow: hidden;' +
            'gap: 10px;' +
            'border-radius: 8px;' +
            'margin-bottom: 10px;' +
            'padding: 5px;' +
        '}',
        '.color-family-name {' +
            'width: 80px;' +
            'height: 30px;' +
            'border-width: 2px;' +
            'border-style: solid;' +
            'border-radius: 4px;' +
            'display: flex;' +
            'flex-direction: column;' +
            'justify-content: center;' +
            'align-items: center;' +
            'cursor: default;' +
            'color: #ffffff !important;' +
            'font-size: 10px;' +
            'font-weight: bold;' +
            'text-align: center;' +
            'text-transform: capitalize;' +
        '}',
        '.color_square .hex {' +
            'font-size: 7px;' +
            'opacity: 0.9;' +
            'text-transform: uppercase;' +
            'z-index: 1;' +
        '}',
        '.hex-input {' +
            'width: 360px;' +
            'height: 30px;' +
            'border-radius: 8px;' +
            'border: 2px solid #ddd;' +
            'position: relative;' +
            'cursor: pointer;' +
            'display: flex;' +
            'flex-direction: column;' +
            'align-items: center;' +
            'justify-content: center;' +
            'color: #fff !important;' +
            'font-size: 12px;' +
            'font-weight: bold;' +
            'text-shadow: 0 0 2px #000;' +
            'background-color: #353535;' +
        '}',
        '.hex-input.focus {' +
            'border: 0.2em solid var(--main-color);' +
            'transform: scale(1.1);' +
        '}',
        '.hex-input .label {' +
            'position: absolute;' +
            'top: 1px;' +
            'font-size: 10px;' +
        '}',
        '.hex-input .value {' +
            'position: absolute;' +
            'bottom: 1px;' +
            'font-size: 10px;' +
        '}',
        '.color-picker-container {' +
            'display: grid;' +
            'grid-template-columns: 1fr 1fr;' +
            'gap: 10px;' +
            'padding: 0;' +
        '}'
    ].join('');

    updateDateElementStyles();
    updatePluginIcon();
    checkBodyStyles();
    saveSettings();

    console.log('ColorPlugin: Applied styles, main_color: ' + ColorPlugin.settings.main_color + ', enabled: ' + ColorPlugin.settings.enabled + ', highlight_enabled: ' + ColorPlugin.settings.highlight_enabled + ', dimming_enabled: ' + ColorPlugin.settings.dimming_enabled);
}
