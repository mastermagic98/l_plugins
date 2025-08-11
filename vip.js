(function () {
    const replacements = {
        "checkPremium\\(\\) \\{": "checkPremium() { return 1;",
        "this.add = function \\(\\) \\{": "this.add = function () { return;",
        "full-start__button selector button--subscribe": "full-start__button selector button--subscribe hide",
        "\\[[^\\n\\r]+/plugin/vast'": "['{localhost}/vast.js']"
    };

    // Функція заміни рядків у тексті за replacements
    function applyReplacements(text) {
        for (const pattern in replacements) {
            const re = new RegExp(pattern, 'g');
            text = text.replace(re, replacements[pattern]);
        }
        return text;
    }

    // Перехоплення fetch, щоб замінити код Lampa на льоту
    const originalFetch = window.fetch;
    window.fetch = async function(resource, options) {
        const response = await originalFetch.call(this, resource, options);

        // Якщо це js-файл Lampa (можна адаптувати під конкретний URL)
        if (typeof resource === 'string' && resource.includes('lampa') && resource.endsWith('.js')) {
            const text = await response.text();
            const replacedText = applyReplacements(text);

            // Повертаємо змінений Response із заміненим кодом
            return new Response(replacedText, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }

        return response;
    };

    // Очистка кешу IndexedDB, localStorage і перезавантаження
    function clearCacheAndReload() {
        if ('indexedDB' in window) {
            indexedDB.databases().then(dbs => {
                dbs.forEach(db => {
                    if (db.name && db.name.startsWith('lampa')) {
                        indexedDB.deleteDatabase(db.name);
                    }
                });
            });
        }
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch(e) {
            console.warn('Cannot clear storage:', e);
        }
        setTimeout(() => location.reload(true), 500);
    }

    // Почекати завантаження Lampa, потім очистити кеш і перезавантажити
    document.addEventListener('lampa-ready', () => {
        clearCacheAndReload();
    });
})();
