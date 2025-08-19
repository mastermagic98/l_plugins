(function () {
    'use strict';

    // ... (попередній код залишається без змін) ...

    function startPlugin() {
      window.plugin_interface_ready = true;
      var old_interface = Lampa.InteractionMain;
      var new_interface = component;

      Lampa.InteractionMain = function (object) {
        var use = new_interface;
        if (!(object.source == 'tmdb' || object.source == 'cub')) use = new_interface;
        if (window.innerWidth < 767) use = new_interface;
        if (!Lampa.Account.hasPremium()) use = new_interface;
        if (Lampa.Manifest.app_digital < 153) use = new_interface;
        return new use(object);
      };

      Lampa.Template.add('new_interface_style', `
        <style>
        .new-interface .card--small.card--wide {
            width: 18.3em;
        }
        
        .new-interface-info {
            position: relative;
            padding: 1.5em;
            height: 24em;
        }
        
        .new-interface-info__body {
            width: 80%;
            padding-top: 1.1em;
        }
        
        .new-interface-info__head {
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 1em;
            font-size: 1.3em;
            min-height: 1em;
        }
        
        .new-interface-info__head span {
            color: #fff;
        }
        
        .new-interface-info__title {
            font-size: 4em;
            font-weight: 600;
            margin-bottom: 0.3em;
            overflow: hidden;
            -o-text-overflow: ".";
            text-overflow: ".";
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
            margin-left: -0.03em;
            line-height: 1.3;
        }
        
        .new-interface-info__details {
            margin-bottom: 1.6em;
            display: -webkit-box;
            display: -webkit-flex;
            display: -moz-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -webkit-align-items: center;
            -moz-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-flex-wrap: wrap;
            -ms-flex-wrap: wrap;
            flex-wrap: wrap;
            min-height: 1.9em;
            font-size: 1.1em;
        }
        
        .new-interface-info__split {
            margin: 0 1em;
            font-size: 0.7em;
        }
        
        .new-interface-info__description {
            font-size: 1.2em;
            font-weight: 300;
            line-height: 1.5;
            overflow: hidden;
            -o-text-overflow: ".";
            text-overflow: ".";
            display: -webkit-box;
            -webkit-line-clamp: 4;
            line-clamp: 4;
            -webkit-box-orient: vertical;
            width: 70%;
        }
        
        .new-interface .card-more__box {
            padding-bottom: 95%;
        }
        
        .new-interface .full-start__background {
            height: 108%;
            top: -6em;
        }
        
        .new-interface .full-start__rate {
            font-size: 1.3em;
            margin-right: 0;
        }
        
        .new-interface .card__promo {
            display: none;
        }
        
        .new-interface .card.card--wide+.card-more .card-more__box {
            padding-bottom: 95%;
        }
        
        .new-interface .card.card--wide .card-watched {
            display: none !important;
        }
        
        body.light--version .new-interface-info__body {
            width: 69%;
            padding-top: 1.5em;
        }
        
        body.light--version .new-interface-info {
            height: 25.3em;
        }

        /* Виправлені стилі для іконок меню */
        .navigator .navigator__item--icon {
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.2s ease;
        }
        
        .navigator .navigator__item--icon svg {
            fill: rgba(255, 255, 255, 0.6);
            transition: fill 0.2s ease;
        }
        
        .navigator--focus .navigator__item--icon,
        .navigator__item--active .navigator__item--icon {
            color: #fff !important;
        }
        
        .navigator--focus .navigator__item--icon svg,
        .navigator__item--active .navigator__item--icon svg {
            fill: #fff !important;
        }
        </style>
      `);
      $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    if (!window.plugin_interface_ready) startPlugin();
})();
