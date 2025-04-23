!function() {
    "use strict";

    // Language-specific settings labels
    var langSettings = {
        uk: {
            name: "Логотипи замість назв",
            description: "Відображає логотипи фільмів замість тексту"
        },
        ru: {
            name: "Логотипы вместо названий",
            description: "Отображает логотипы фильмов вместо текста"
        },
        en: {
            name: "Logos instead of titles",
            description: "Displays movie logos instead of text"
        }
    };

    // Get current language, default to English
    var currentLang = Lampa.Storage.get("language") || "en";
    if (currentLang !== "uk" && currentLang !== "ru" && currentLang !== "en") {
        currentLang = "en";
    }

    // Use language-specific settings
    var settings = langSettings[currentLang];

    // Add settings parameter for logo toggle
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: {
                "1": currentLang === "uk" ? "Приховати" : currentLang === "ru" ? "Скрыть" : "Hide",
                "0": currentLang === "uk" ? "Відображати" : currentLang === "ru" ? "Отображать" : "Display"
            },
            "default": "0"
        },
        field: {
            name: settings.name,
            description: settings.description
        }
    });

    // Initialize plugin only once
    if (!window.logoplugin) {
        window.logoplugin = true;

        // Listen for 'full' activity events
        Lampa.Listener.follow("full", function(event) {
            if (event.type === "complite" && Lampa.Storage.get("logo_glav") !== "1") {
                var movie = event.data.movie;
                var mediaType = movie.name ? "tv" : "movie";
                var languages = [currentLang];
                
                // Define fallback languages
                if (currentLang === "uk") {
                    languages = ["uk", "ru", "en"];
                } else if (currentLang === "ru") {
                    languages = ["ru", "en"];
                } else {
                    languages = ["en"];
                }

                // Function to try fetching logo for a given language
                function tryFetchLogo(langIndex) {
                    if (langIndex >= languages.length) {
                        return; // No logos found
                    }
                    var lang = languages[langIndex];
                    var apiUrl = Lampa.TMDB.api(mediaType + "/" + movie.id + "/images?api_key=" + Lampa.TMDB.key() + "&language=" + lang);
                    console.log("Fetching logos for language: " + lang, apiUrl);

                    $.get(apiUrl, function(response) {
                        if (response.logos && response.logos[0]) {
                            var logoPath = response.logos[0].file_path;
                            if (logoPath !== "") {
                                // Render logo in place of title
                                var imgSrc = Lampa.TMDB.image("/t/p/w300" + logoPath.replace(".svg", ".png"));
                                event.object.activity.render().find(".full-start-new__title").html(
                                    '<img style="margin-top: 5px; max-height: 125px;" src="' + imgSrc + '" />'
                                );
                            }
                        } else {
                            // Try next language
                            tryFetchLogo(langIndex + 1);
                        }
                    });
                }

                // Start fetching with the first language
                tryFetchLogo(0);
            }
        });
    }
}();
