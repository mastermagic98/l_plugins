(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

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

    async function fetchSubs(id, isTmdb, season, episode) {
        if (!id) return [];

        const key = `${isTmdb ? 'tmdb' : 'imdb'}_${id}_${season || 0}_${episode || 0}`;
        if (cache[key]) return cache[key];

        try {
            let pathId = isTmdb ? `tmdb:${id}` : id;
            let url;

            if (season && episode) {
                url = `${OSV3}subtitles/series/${pathId}:${season}:${episode}.json`;
            } else {
                url = `${OSV3}subtitles/movie/${pathId}.json`;
            }

            const r = await fetch(url);
            const j = await r.json();

            return (cache[key] = j.subtitles || []);
        } catch (e) {
            console.warn('[OS Subs]', e);
            return [];
        }
    }

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

        const interfaceLang = (Lampa.Storage.get('language') || 'en').toLowerCase();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        let subs = [];

        /* 1️⃣ IMDB */
        if (imdb) {
            subs = await fetchSubs(imdb, false, season, episode);
        }

        /* 2️⃣ TMDB fallback */
        if (!subs.length && tmdb) {
            subs = await fetchSubs(tmdb, true, season, episode);
        }

        if (!subs.length) return;

        let processed = subs
            .filter(s => s.url && LANG_MAP[s.lang])
            .map(s => ({
                lang: s.lang,
                url: s.url,
                label: LANG_MAP[s.lang].labels[interfaceLang] 
                    || LANG_MAP[s.lang].labels.en
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

        current.sort((a, b) =>
            priority.indexOf(a.lang) - priority.indexOf(b.lang)
        );

        const idx = current.findIndex(s => s.lang === priority[0]);

        Lampa.Player.subtitles(current, idx >= 0 ? idx : 0);
    }

    Lampa.Player.listener.follow('start', function () {
        setTimeout(setupSubs, 500);
    });

})();
