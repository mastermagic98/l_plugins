(function() {
    'use strict';

    // Основной объект плагина
    var naruzhe_themes = {
        // Название плагина
        name: 'naruzhe_themes',
        // Версия плагина
        version: '2.0.1',
        // Настройки по умолчанию
        settings: {
            theme: 'mint_dark'
        }
    };

    // Цвета loader'а для каждой темы
    var loaderColors = {
        "default": '#fff',
        violet_blue: '#6a11cb',
        mint_dark: '#3da18d',
        deep_aurora: '#7e7ed9',
        crystal_cyan: '#7ed0f9',
        amber_noir: '#f4a261',
        velvet_sakura: '#f6a5b0',
        red_stroke: '#e63946',
        green_stroke: '#2a9d8f',
        violet_stroke: '#7209b7',
        dark_blue_stroke: '#1e3a8a',
        orange_stroke: '#f48c06'
    };

    // Функция для применения тем
    function applyTheme(theme) {
        // Удаляем предыдущие стили темы
        $('#interface_mod_theme').remove();

        // Если выбрано "Нет", просто удаляем стили
        if (theme === 'default') return;

        var color = loaderColors[theme] || loaderColors["default"];

        var svgCode = encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"135\" height=\"140\" fill=\"".concat(color, "\"><rect width=\"10\" height=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"20\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"60\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"80\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"100\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"120\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect></svg>"));

        // Создаем новый стиль
        var style = $('<style id="interface_mod_theme"></style>');

        // Определяем стили для разных тем
        var themes = {
            mint_dark: "\n.navigation-bar__body\n{background: rgba(18, 32, 36, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #1e6262dd, #3da18ddd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody {\nbackground: linear-gradient(135deg, #0a1b2a, #1a4036);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img {\nbackground-color: #1e2c2f;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\nbackground: linear-gradient(to right, #1e6262, #3da18d);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #1e6262, #3da18d);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after {\nborder: 0.2em solid #3da18d;\nbox-shadow: 0 0 0.8em rgba(61, 161, 141, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #3da18d, #1e6262);\n}\n.modal__content {\nbackground: rgba(18, 32, 36, 0.96);\nborder: 0em solid rgba(18, 32, 36, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content {\nbackground: rgba(18, 32, 36, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: #1a3b36cc;\nborder: 0.2em solid #3da18d;\n}\n"),
            crystal_cyan: "\n.navigation-bar__body\n{background: rgba(10, 25, 40, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #00d2ffdd, #3a8ee6dd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody {\nbackground: linear-gradient(135deg, #081822, #104059);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img {\nbackground-color: #112b3a;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\nbackground: linear-gradient(to right, #00d2ff, #3a8ee6);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #00d2ff, #3a8ee6);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after {\nborder: 0.2em solid #00d2ff;\nbox-shadow: 0 0 0.8em rgba(72, 216, 255, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #00d2ff, #3a8ee6);\n}\n.modal__content {\nbackground: rgba(10, 25, 40, 0.96);\nborder: 0em solid rgba(10, 25, 40, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content {\nbackground: rgba(10, 25, 40, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nbම
