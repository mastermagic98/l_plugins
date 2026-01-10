(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    /* =======================
       МОВА ІНТЕРФЕЙСУ
    ======================= */

    function getInterfaceLang() {
        return (Lampa.Storage.get('language') || 'en').toLowerCase();
    }

    const LANG_LABELS = {
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' }
    };

    const LANG_PRIORITY = {
        uk: ['ukr', 'eng', 'rus'],
        ru: ['rus', 'eng', 'ukr'],
        en: ['eng', 'ukr', 'rus']
    };

    /* =======================
       FETCH SUBS
    ======================= */

    async function fetchSubsById(type, id, season, episode) {
        if (!id) return [];

        const key = `${type}_${id}_${season || 0}_${episode || 0}`;
        if (cache[key]) return cache[key];

        try {
            let url;

            if (season && episode) {
                url = `${OSV3}subtitles/series/${type}:${id}:${season}:${episode}.json`;
            } else {
                url = `${OSV3}subtitles/movie/${type}:${id}.json`;
            }

            const r = await fetch(url);
            const j = await r.json();

            return (cache[key] = j.subtitles || []);
        } catch (e) {
            console.warn('[OS Subs]', type, id, e);
            return [];
        }
    }

    /* =======================
       ОСНОВНА ЛОГІКА
    ======================= */

    async function setupSubs() {
        const activity = Lampa.Activity.active?.();
        const playdata = Lampa.Player.playdata?.();
        const movie = activity?.movie;

        if (!activity || !playdata || !movie) return;

        const imdb = movie.imdb_id;
        const tmdb = movie.id || movie.tmdb_id;

        const isSeries = !!movie.first_air_date;
        const season = isSeries ? playdata.season : undefined;
        const episode = isSeries ? playdata.episode : undefined;

        const interfaceLang = getInterfaceLang();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        let subs = [];

        /* 1️⃣ IMDB */
        if (imdb) {
            subs = await fetchSubsById('imdb_id', imdb, season, episode);
        }

        /* 2️⃣ TMDB (fallback) */
        if (!subs.length && tmdb) {
            subs = await fetchSubsById('tmdb_id', tmdb, season, episode);
        }

        if (!subs.length) return;

        /* =======================
           ФІЛЬТРАЦІЯ + МІТКИ
        ======================= */

        let processed = subs
            .filter(s =>
                s.url &&
                LANG_LABELS[s.lang]
            )
            .map(s => ({
                lang: s.lang,
                url: s.url,
                label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
            }));

        const current = (playdata.subtitles || []).map(s => ({
            lang: s.lang || '',
            url: s.url,
            label: s.label
        }));

        processed.forEach(s => {
            if (!current.find(c => c.url === s.url)) {
                current.push(s);
            }
        });

        current.sort((a, b) => {
            return priority.indexOf(a.lang) - priority.indexOf(b.lang);
        });

        if (!current.length) return;

        const defaultIndex = current.findIndex(s => s.lang === priority[0]);

        Lampa.Player.subtitles(
            current,
            defaultIndex >= 0 ? defaultIndex : 0
        );
    }

    /* =======================
       ХУК НА СТАРТ ПЛЕЄРА
    ======================= */

    Lampa.Player.listener.follow('start', function () {
        setTimeout(setupSubs, 500);
    });

})();
