!function(){
    "use strict";

    // Додаємо переклади
    Lampa.Lang.add({
        logoplugin_name: {
            en: 'Logos instead of names',
            uk: 'Логотипи замість назв',
            ru: 'Логотипы вместо названий'
        },
        logoplugin_description: {
            en: 'Displays movie logos instead of text',
            uk: 'Відображає логотипи фільмів замість тексту',
            ru: 'Отображает логотипы фильмов вместо текста'
        },
        logoplugin_hide: {
            en: 'Hide',
            uk: 'Приховати',
            ru: 'Скрыть'
        },
        logoplugin_show: {
            en: 'Show',
            uk: 'Відображати',
            ru: 'Отображать'
        }
    });

    // Додаємо параметр у налаштування
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: {
                1: Lampa.Lang.translate('logoplugin_hide'),
                0: Lampa.Lang.translate('logoplugin_show')
            },
            default: "0"
        },
        field: {
            name: Lampa.Lang.translate('logoplugin_name'),
            description: Lampa.Lang.translate('logoplugin_description')
        }
    });

    // Основна логіка плагіну
    if (!window.logoplugin) {
        window.logoplugin = !0;
        Lampa.Listener.follow("full", function(a) {
            if ("complite" == a.type && "1" != Lampa.Storage.get("logo_glav")) {
                var e = a.data.movie;
                var t = Lampa.TMDB.api(e.name ? "tv" : "movie/" + e.id + "/images?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language"));
                console.log(t);
                $.get(t, function(e) {
                    if (e.logos && e.logos[0]) {
                        var t = e.logos[0].file_path;
                        if ("" != t) {
                            a.object.activity.render().find(".full-start-new__title").html(
                                '<img style="margin-top: 5px;max-height: 125px;" src="' + 
                                Lampa.TMDB.image("/t/p/w300" + t.replace(".svg", ".png")) + 
                                '" />'
                            );
                        }
                    }
                });
            }
        });
    }
}();
