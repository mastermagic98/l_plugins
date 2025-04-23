!function(){
    "use strict";

    Lampa.Lang.add({
        logo_glav_label: {
            en: 'Logos instead of names',
            uk: 'Логотипи замість назв',
            ru: 'Логотипы вместо названий'
        },
        logo_glav_descr: {
            en: 'Displays movie logos instead of text',
            uk: 'Відображає логотипи фільмів замість тексту',
            ru: 'Отображает логотипы фильмов вместо текста'
        },
        logo_glav_hide: {
            en: 'Hide',
            uk: 'Сховати',
            ru: 'Скрыть'
        },
        logo_glav_show: {
            en: 'Show',
            uk: 'Показати',
            ru: 'Показать'
        }
    });

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: {
                1: Lampa.Lang.translate('logo_glav_hide'),
                0: Lampa.Lang.translate('logo_glav_show')
            },
            default: "0"
        },
        field: {
            name: Lampa.Lang.translate('logo_glav_label'),
            description: Lampa.Lang.translate('logo_glav_descr')
        }
    });

    if (!window.logoplugin) {
        window.logoplugin = !0;

        Lampa.Listener.follow("full", function(a){
            if (a.type === "complite" && Lampa.Storage.get("logo_glav") !== "1") {
                var movie = a.data.movie;
                var url = Lampa.TMDB.api((movie.name ? "tv/" : "movie/") + movie.id + "/images?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language"));
                
                $.get(url, function(response){
                    if (response.logos && response.logos.length > 0) {
                        var path = response.logos[0].file_path;
                        if (path && path !== "") {
                            var img = Lampa.TMDB.image("/t/p/original" + path); // SVG підтримка
                            var html = '<img style="margin-top: 5px; max-height: 200px; max-width: 90%; image-rendering: auto;" src="' + img + '" />';
                            a.object.activity.render().find(".full-start-new__title").html(html);
                        }
                    }
                });
            }
        });
    }
}();
