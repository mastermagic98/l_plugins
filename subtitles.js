(function () {
    'use strict';

    const OPENSUBTITLES_V3 = "https://opensubtitles-v3.strem.io/";
    const cache = new Map(); // більш сучасний та зручний варіант для кешу

    async function fetchSubtitles(imdb_id, season, episode) {
        if (!imdb_id) return [];

        const cacheKey = `${imdb_id}_${season || 0}_${episode || 0}`;

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        let url;

        if (season && episode) {
            url = `${OPENSUBTITLES_V3}subtitles/series/${imdb_id}:${season}:${episode}.json`;
        } else {
            url = `${OPENSUBTITLES_V3}subtitles/movie/${imdb_id}.json`;
        }

        try {
            const response = await fetch(url, {
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) return [];

            const data = await response.json();
            const subtitles = Array.isArray(data.subtitles) ? data.subtitles : [];

            cache.set(cacheKey, subtitles);
            return subtitles;

        } catch (e) {
            console.log('OpenSubtitles v3 fetch error:', e?.message);
            return [];
        }
    }

    function normalizeLang(lang) {
        if (!lang) return '';
        const l = lang.toLowerCase();
        if (l === 'eng' || l === 'en') return 'eng';
        if (l === 'ukr' || l === 'uk') return 'ukr';
        if (l === 'rus' || l === 'ru') return 'rus';
        return '';
    }

    async function addOpenSubtitles() {
        try {
            const activity = Lampa.Activity.active?.();
            if (!activity) return;

            const player = Lampa.Player;
            if (!player.playdata || !player.activity) return;

            const movie = activity.movie || player.activity.movie;
            if (!movie?.imdb_id) return;

            const isSeries = Boolean(movie.first_air_date || movie.number_of_seasons);
            const season = isSeries ? player.playdata.season : undefined;
            const episode = isSeries ? player.playdata.episode : undefined;

            const rawSubs = await fetchSubtitles(movie.imdb_id, season, episode);

            if (!rawSubs.length) return;

            // Беремо тільки потрібні мови та готуємо до формату Lampa
            const desiredSubs = rawSubs
                .filter(s => s.url && s.lang)
                .map(s => {
                    const normLang = normalizeLang(s.lang);
                    if (!['eng', 'ukr', 'rus'].includes(normLang)) return null;

                    return {
                        label: normLang,           // eng / ukr / rus
                        url: s.url,
                        lang: normLang,
                        default: normLang === 'eng' // англійська за замовчуванням
                    };
                })
                .filter(Boolean);

            if (!desiredSubs.length) return;

            // Поточні субтитри (вже додані плеєром або іншими плагінами)
            const currentSubs = (player.playdata?.subtitles || []).map(s => ({
                label: s.label,
                url: s.url,
                lang: normalizeLang(s.lang || s.label)
            }));

            // Об'єднуємо, уникаємо дублів за url
            const allSubs = [...currentSubs];

            desiredSubs.forEach(newSub => {
                if (!allSubs.some(ex => ex.url === newSub.url)) {
                    allSubs.push(newSub);
                }
            });

            if (allSubs.length <= currentSubs.length) return; // нічого нового не додали

            // Сортування: eng → ukr → rus
            allSubs.sort((a, b) => {
                const order = { eng: 1, ukr: 2, rus: 3 };
                return (order[a.lang] || 999) - (order[b.lang] || 999);
            });

            // Знаходимо індекс англійської (або перший, якщо англ немає)
            let defaultIndex = allSubs.findIndex(s => s.lang === 'eng');
            if (defaultIndex === -1) defaultIndex = 0;

            // Встановлюємо субтитри
            player.subtitles(allSubs, defaultIndex);

            console.log(`[OpenSubtitles-v3] додано ${allSubs.length - currentSubs.length} субтитрів`);

        } catch (e) {
            console.error('OpenSubtitles plugin error:', e);
        }
    }

    // Запускаємо через невелику затримку після старту плеєра
    Lampa.Player.listener.follow('start', () => {
        setTimeout(addOpenSubtitles, 700);
    });

    // Додатковий захист — якщо плеєр вже запущений при завантаженні плагіна
    if (Lampa.Player.opened && Lampa.Player.activity) {
        setTimeout(addOpenSubtitles, 1200);
    }

})();
