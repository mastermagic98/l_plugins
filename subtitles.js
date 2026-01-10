(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

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
            console.warn('[OS Subs] fetch error', e);
            return [];
        }
    }

    async function setupSubs() {
        const activity = Lampa.Activity.active?.();
        const playdata = Lampa.Player.playdata?.();
        const movie = activity?.movie;

        if (!activity || !playdata || !movie) return;
        if (!movie.imdb_id) return;

        const imdb = movie.imdb_id;
        const isSeries = !!movie.first_air_date;

        const season = isSeries ? playdata.season : undefined;
        const episode = isSeries ? playdata.episode : undefined;

        const osSubs = await fetchSubs(imdb, season, episode);

        const filtered = osSubs
            .filter(s =>
                s.url &&
                (s.lang === 'eng' || s.lang === 'ukr' || s.lang === 'rus')
            )
            .map(s => ({
                label:
                    s.lang === 'eng'
                        ? 'ENG'
                        : s.lang === 'ukr'
                            ? 'UKR'
                            : 'RUS',
                url: s.url,
                lang: s.lang
            }));

        const current = (playdata.subtitles || []).map(s => ({
            label: s.label,
            url: s.url,
            lang: s.lang || ''
        }));

        const all = [...current];

        filtered.forEach(s => {
            if (!all.find(x => x.url === s.url)) {
                all.push(s);
            }
        });

        if (!all.length) return;

        const idx = all.findIndex(s => s.lang === 'eng');

        Lampa.Player.subtitles(all, idx >= 0 ? idx : 0);
    }

    Lampa.Player.listener.follow('start', function () {
        setTimeout(setupSubs, 500);
    });

})();
