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

    async function fetchSubs(imdb, season, episode) {
        const key = `${imdb}_${season || 0}_${episode || 0}`;
        if (cache[key]) return cache[key];

        try {
            const url = season && episode
                ? `${OSV3}subtitles/series/${imdb}:${season}:${episode}.json`
                : `${OSV3}subtitles/movie/${imdb}.json`;

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

        if (!activity || !playdata || !movie || !movie.imdb_id) return;

        const imdb = movie.imdb_id;
        const isSeries = !!movie.first_air_date;

        const season = isSeries ? playdata.season : undefined;
        const episode = isSeries ? playdata.episode : undefined;

        const interfaceLang = getInterfaceLang();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        const osSubs = await fetchSubs(imdb, season, episode);

        let subs = osSubs
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

        subs.forEach(s => {
            if (!current.find(c => c.url === s.url)) {
                current.push(s);
            }
        });

        current.sort((a, b) => {
            return priority.indexOf(a.lang) - priority.indexOf(b.lang);
        });

        if (!current.length) return;

        const defaultIndex = current.findIndex(s => s.lang === priority[0]);

        Lampa.Player.subtitles(current, defaultIndex >= 0 ? defaultIndex : 0);
    }

    Lampa.Player.listener.follow('start', function () {
        setTimeout(setupSubs, 500);
    });

})();
