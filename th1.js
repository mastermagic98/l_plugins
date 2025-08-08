(function() {
    'use strict';

    // Основний об'єкт плагіна
    var naruzhe_themes = {
        name: 'naruzhe_themes',
        version: '2.1.0',
        settings: {
            theme: 'custom_color',
            custom_color: '#3da18d', // Початковий колір (аналог mint_dark)
            enabled: true // Стан плагіна (увімкнено/вимкнено)
        }
    };

    // Функція для застосування теми
    function applyTheme(theme, color) {
        // Видаляємо попередні стилі теми
        $('#interface_mod_theme').remove();

        // Якщо плагін відключений або вибрано "default", скидаємо стилі
        if (!naruzhe_themes.settings.enabled || theme === 'default') return;

        // Використовуємо переданий колір або збережений
        var selectedColor = color || naruzhe_themes.settings.custom_color || '#3da18d';

        // Код SVG для лоадера з обраним кольором
        var svgCode = encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"135\" height=\"140\" fill=\"".concat(selectedColor, "\"><rect width=\"10\" height=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"20\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"60\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"80\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"100\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"120\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect></svg>"));

        // Створюємо новий стиль
        var style = $('<style id="interface_mod_theme"></style>');

        // Динамічний стиль на основі вибраного кольору
        var dynamicTheme = "\n.navigation-bar__body\n{background: rgba(20, 20, 20, 0.96);\n}\n.card__quality,\n.card--tv .card__type {\nbackground: linear-gradient(to right, ".concat(selectedColor, "dd, ").concat(selectedColor, "99);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n}\nbody {\nbackground: linear-gradient(135deg, #1a1a1a, ".concat(selectedColor, "33);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img {\nbackground-color: #2a2a2a;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\nbackground: linear-gradient(to right, ".concat(selectedColor, ", ").concat(selectedColor, "cc);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em ").concat(selectedColor, "33;\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, ".concat(selectedColor, ", ").concat(selectedColor, "cc);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em ").concat(selectedColor, "33;\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,\n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after {\nborder: 0.2em solid ".concat(selectedColor, ";\nbox-shadow: 0 0 0.8em ").concat(selectedColor, "33;\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, ".concat(selectedColor, ", ").concat(selectedColor, "cc);\n}\n.modal__content {\nbackground: rgba(20, 20, 20, 0.96);\nborder: 0em solid rgba(20, 20, 20, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content {\nbackground: rgba(20, 20, 20, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: ".concat(selectedColor, "33;\nborder: 0.2em solid ").concat(selectedColor, ";\n}\n");

        // Встановлюємо стиль
        style.html(dynamicTheme);
        $('head').append(style);
    }

    // Додавання шаблонів та базових стилів
    function AddIn() {
        // Шаблон карточки, де рік перенесено вище назви
        Lampa.Template.add('card', "<div class=\"card selector layer--visible layer--render\">\n    <div class=\"card__view\">\n        <img src=\"./img/img_load.svg\" class=\"card__img\" />\n\n        <div class=\"card__icons\">\n            <div class=\"card__icons-inner\">\n                \n            </div>\n        </div>\n    <div class=\"card__age\">{release_year}</div>\n    </div>\n\n    <div class=\"card__title\">{title}</div>\n    </div>");
        // Шаблон карточки виходу епізоду
        Lampa.Template.add('card_episode', "<div class=\"card-episode selector layer--visible layer--render\">\n    <div class=\"card-episode__body\">\n        <div class=\"full-episode\">\n            <div class=\"full-episode__img\">\n                <img />\n            </div>\n\n            <div class=\"full-episode__body\">\n     <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n            <div class=\"full-episode__num hide\">{num}</div>\n                <div class=\"full-episode__name\">{name}</div>\n                <div class=\"full-episode__date\">{date}</div>\n            </div>\n        </div>\n    </div>\n    <div class=\"card-episode__footer hide\">\n        <div class=\"card__imgbox\">\n            <div class=\"card__view\">\n                <img class=\"card__img\" />\n            </div>\n        </div>\n\n        <div class=\"card__left\">\n            <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n        </div>\n    </div>\n</div>");
        // Шаблон карточки фільму/серіалу
        Lampa.Template.add('full_start_new', "<div class=\"full-start-new\">\n\n<div class=\"full-start-new__body\">\n<div class=\"full-start-new__left\">\n<div class=\"full-start-new__poster\">\n<img class=\"full-start-new__img full--poster\" />\n</div>\n</div>\n\n<div class=\"full-start-new__right\">\n<div class=\"full-start-new__head\"></div>\n<div class=\"full-start-new__title\">{title}</div>\n<div class=\"full-start__title-original\">{original_title}</div>\n<div class=\"full-start-new__tagline full--tagline\">{tagline}</div>\n<div class=\"full-start-new__rate-line\">\n<div class=\"full-start__rate rate--tmdb\"><div>{rating}</div><div class=\"source--name\">TMDB</div></div>\n<div class=\"full-start__rate rate--imdb hide\"><div></div><div class=\"source--name\">IMDb</div></div>\n<div class=\"full-start__rate rate--kp hide\"><div></div><div class=\"source--name\">Кинопоиск</div></div>\n\n<div class=\"full-start__pg hide\"></div>\n<div class=\"full-start__status hide\"></div>\n</div>\n<div class=\"full-start-new__details\"></div>\n<div class=\"full-start-new__reactions\">\n<div>#{reactions_none}</div>\n</div>\n\n<div class=\"full-start-new__buttons\">\n<div class=\"full-start__button selector button--play\">\n<svg width=\"28\" height=\"29\" viewBox=\"0 0 28 29\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"14\" cy=\"14.5\" r=\"13\" stroke=\"currentColor\" stroke-width=\"2.7\"/>\n<path d=\"M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z\" fill=\"currentColor\"/>\n</svg>\n\n<span>#{title_watch}</span>\n</div>\n\n<div class=\"full-start__button view--torrent\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\" width=\"50px\" height=\"50px\">\n<path d=\"M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z\" fill=\"currentColor\"/>\n</svg>\n\n<span>#{full_torrents}</span>\n</div>\n\n<div class=\"full-start__button selector view--trailer\">\n<svg height=\"70\" viewBox=\"0 0 80 70\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z\" fill=\"currentColor\"></path>\n</svg>\n\n<span>#{full_trailers}</span>\n</div>\n<div class=\"full-start__button selector button--book\">\n<svg width=\"21\" height=\"32\" viewBox=\"0 0 21 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z\" stroke=\"currentColor\" stroke-width=\"2.5\"/>\n</svg>\n\n<span>#{settings_input_links}</span>\n</div>\n\n<div class=\"full-start__button selector button--reaction\">\n<svg width=\"38\" height=\"34\" viewBox=\"0 0 38 34\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z\" fill=\"currentColor\"/>\n<path d=\"M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z\" fill=\"currentColor\"/>\n</svg>\n\n<span>#{title_reactions}</span>\n</div>\n\n<div class=\"full-start__button selector button--subscribe hide\">\n<svg width=\"25\" height=\"30\" viewBox=\"0 0 25 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z\" fill=\"currentColor\"/>\n<path d=\"M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z\" stroke=\"currentColor\" stroke-width=\"2.5\"/>\n</svg>\n\n<span>#{title_subscribe}</span>\n</div>\n\n<div class=\"full-start__button selector button--options\">\n<svg width=\"38\" height=\"10\" viewBox=\"0 0 38 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"4.88968\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n<circle cx=\"18.9746\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n<circle cx=\"33.0596\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n</svg>\n</div>\n\n</div>\n</div>\n</div>\n</div>");
        // Базові стилі
        var style = "\n        <style>\n" +
            // Круглі чекбокси
            ".selectbox-item__checkbox {\n    border-radius: 100%;\n}\n" +
            ".selectbox-item--checked .selectbox-item__checkbox {\n    background: #ccc;\n}\n" +
            // Рейтинг у карточці
            ".full-start-new__rate-line .full-start__pg {\n    font-size: 1em;\n    background: #fff;\n    color: #000;\n}\n" +
            ".full-start__rate {\n    border-radius: 0.25em;\n    padding: 0.3em;\n    background-color: rgba(0, 0, 0, 0.3);\n}\n" +
            ".full-start__pg, .full-start__status {\n    font-size: 1em;\n    background: #fff;\n    color: #000;\n}\n" +
            // Плашки на карточках
            ".card__title {\n    height: 3.6em;\n    text-overflow: ellipsis;\n    -o-text-overflow: ellipsis;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 3;\n    line-clamp: 3;\n}\n" +
            ".card__age {\n    position: absolute;\n    right: 0em;\n    bottom: 0em;\n    z-index: 10;\n    background: rgba(0, 0, 0, 0.6);\n    color: #ffffff;\n    font-weight: 700;\n    padding: 0.4em 0.6em;\n    -webkit-border-radius: 0.48em 0 0.48em 0;\n    -moz-border-radius: 0.48em 0 0.48em 0;\n    border-radius: 0.48em 0 0.48em 0;\n    line-height: 1.0;\n    font-size: 1.0em;\n}\n" +
            ".card__vote {\n    position: absolute;\n    bottom: auto;\n    right: 0em;\n    top: 0em;\n    background: rgba(0, 0, 0, 0.6);\n    font-weight: 700;\n    color: #fff;\n    -webkit-border-radius: 0 0.34em 0 0.34em;\n    -moz-border-radius: 0 0.34em 0 0.34em;\n    border-radius: 0 0.34em 0 0.34em;\n    line-height: 1.0;\n    font-size: 1.4em;\n}\n" +
            ".card__type {\n    position: absolute;\n    bottom: auto;\n    left: 0em;\n    right: auto;\n    top: 0em;\n    background: rgba(0, 0, 0, 0.6);\n    color: #fff;\n    font-weight: 700;\n    padding: 0.4em 0.6em;\n    -webkit-border-radius: 0.4em 0 0.4em 0;\n    -moz-border-radius: 0.4em 0 0.4em 0;\n    border-radius: 0.4em 0 0.4em 0;\n    line-height: 1.0;\n    font-size: 1.0em;\n}\n" +
            ".card--tv .card__type {\n    color: #fff;\n}\n" +
            ".card__icons {\n    position: absolute;\n    top: 2em;\n    left: 0;\n    right: auto;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    background: rgba(0, 0, 0, 0.6);\n    color: #fff;\n    -webkit-border-radius: 0 0.5em 0.5em 0;\n    -moz-border-radius: 0 0.5em 0.5em 0;\n    border-radius: 0 0.5em 0.5em 0;\n}\n" +
            ".card__icons-inner {\n    background: rgba(0, 0, 0, 0);\n}\n" +
            ".card__marker {\n    position: absolute;\n    left: 0em;\n    top: 4em;\n    bottom: auto;\n    background: rgba(0, 0, 0, 0.6);\n    -webkit-border-radius: 0 0.5em 0.5em 0;\n    -moz-border-radius: 0 0.5em 0.5em 0;\n    border-radius: 0 0.5em 0.5em 0;\n    font-weight: 700;\n    font-size: 1.0em;\n    padding: 0.4em 0.6em;\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    line-height: 1.2;\n    max-width: min(12em, 95%);\n    box-sizing: border-box;\n}\n" +
            ".card__marker > span {\n    max-width: min(12em, 95%);\n}\n" +
            ".card__quality {\n    position: absolute;\n    left: auto;\n    right: 0em;\n    bottom: 2.4em;\n    padding: 0.4em 0.6em;\n    color: #fff;\n    font-weight: 700;\n    font-size: 1.0em;\n    -webkit-border-radius: 0.5em 0 0 0.5em;\n    -moz-border-radius: 0.5em 0 0 0.5em;\n    border-radius: 0.5em 0 0 0.5em;\n    text-transform: uppercase;\n}\n" +
            ".items-line.items-line--type-cards + .items-line.items-line--type-cards {\n    margin-top: 1em;\n}\n" +
            ".card--small .card__view {\n    margin-bottom: 2em;\n}\n" +
            ".items-line--type-cards {\n    min-height: 18em;\n}\n" +
            "@media screen and (min-width: 580px) {\n    .full-start-new {\n        min-height: 80vh;\n        display: flex;\n    }\n}\n" +
            ".full-start-new__buttons .full-start__button:not(.focus) span {\n    display: inline;\n}\n" +
            "@media screen and (max-width: 580px) {\n    .full-start-new__buttons {\n        overflow: auto;\n    }\n    .full-start-new__buttons .full-start__button:not(.focus) span {\n        display: none;\n    }\n}\n" +
            ".full-start__background.loaded {\n    opacity: 0.8;\n}\n" +
            ".full-start__background.dim {\n    opacity: 0.2;\n}\n" +
            ".explorer__files .torrent-filter .simple-button {\n    font-size: 1.2em;\n    -webkit-border-radius: 0.5em;\n    -moz-border-radius: 0.5em;\n    border-radius: 0.5em;\n}\n" +
            ".extensions__item,\n.extensions__block-add,\n.search-source,\n.bookmarks-folder__layer,\n.bookmarks-folder__body,\n.card__img,\n.card__promo,\n.full-episode--next .full-episode__img:after,\n.full-episode__img img,\n.full-episode__body,\n.full-person__photo,\n.card-more__box,\n.full-start__button,\n.simple-button,\n.register {\n    border-radius: 0.5em;\n}\n" +
            ".extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-episode.focus::after,\n.full-review-add.focus::after,\n.card-parser.focus::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.card-more.focus .card-more__box::after,\n.register.focus::after {\n    border-radius: 1em;\n}\n" +
            ".search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\n    border-radius: 0.5em;\n}\n" +
            // Анімації
            ".card {\n    transform: scale(1);\n    transition: transform 0.3s ease;\n}\n" +
            ".card.focus {\n    transform: scale(1.03);\n}\n" +
            ".torrent-item,\n.online-prestige {\n    transform: scale(1);\n    transition: transform 0.3s ease;\n}\n" +
            ".torrent-item.focus,\n.online-prestige.focus {\n    transform: scale(1.01);\n}\n" +
            ".tag-count,\n.full-person,\n.full-episode,\n.simple-button,\n.full-start__button,\n.items-cards .selector,\n.card-more,\n.explorer-card__head-img.selector,\n.card-episode {\n    transform: scale(1);\n    transition: transform 0.3s ease;\n}\n" +
            ".tag-count.focus,\n.full-person.focus,\n.full-episode.focus,\n.simple-button.focus,\n.full-start__button.focus,\n.items-cards .selector.focus,\n.card-more.focus,\n.explorer-card__head-img.selector.focus,\n.card-episode.focus,\n.card-episode.hover {\n    transform: scale(1.02);\n}\n</style>";

        // Додаємо базові стилі
        $('head').append(style);

        // Додаємо меню налаштувань плагіна
        Lampa.SettingsApi.addParam({
            component: 'interface',
            name: 'naruzhe_themes',
            type: 'select',
            field: {
                name: 'Тема',
                values: {
                    custom_color: 'Користувацька',
                    default: 'Без теми'
                },
                default: naruzhe_themes.settings.theme
            },
            onChange: function(value) {
                naruzhe_themes.settings.theme = value;
                Lampa.Storage.set('naruzhe_themes_theme', value);
                applyTheme(value);
                Lampa.SettingsApi.render();
            }
        });

        // Додаємо повзунок для вибору кольору
        Lampa.SettingsApi.addParam({
            component: 'interface',
            name: 'naruzhe_themes_color',
            type: 'input',
            field: {
                name: 'Колір теми',
                type: 'color',
                default: naruzhe_themes.settings.custom_color
            },
            onChange: function(value) {
                naruzhe_themes.settings.custom_color = value;
                Lampa.Storage.set('naruzhe_themes_color', value);
                if (naruzhe_themes.settings.theme === 'custom_color') {
                    applyTheme('custom_color', value);
                }
            }
        });

        // Додаємо кнопку вмикання/вимикання плагіна
        Lampa.SettingsApi.addParam({
            component: 'interface',
            name: 'naruzhe_themes_enabled',
            type: 'toggle',
            field: {
                name: 'Увімкнути плагін',
                default: naruzhe_themes.settings.enabled
            },
            onChange: function(value) {
                naruzhe_themes.settings.enabled = value;
                Lampa.Storage.set('naruzhe_themes_enabled', value);
                applyTheme(naruzhe_themes.settings.theme);
                Lampa.SettingsApi.render();
            }
        });
    }

    // Ініціалізація плагіна
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Завантажуємо збережені налаштування
            naruzhe_themes.settings.theme = Lampa.Storage.get('naruzhe_themes_theme', 'custom_color');
            naruzhe_themes.settings.custom_color = Lampa.Storage.get('naruzhe_themes_color', '#3da18d');
            naruzhe_themes.settings.enabled = Lampa.Storage.get('naruzhe_themes_enabled', true);

            // Застосовуємо шаблони та стилі
            AddIn();

            // Застосовуємо збережену тему
            applyTheme(naruzhe_themes.settings.theme);
        }
    });
})();
