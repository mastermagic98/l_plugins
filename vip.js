(function () {
    'use strict';

    function init() {
        var plugin = function () {};

        plugin.prototype.boot = function () {
            // Виконуємо заміни у коді програми
            Lampa.Utils.putScriptReplace({
                "checkPremium\\(\\) \\{": "checkPremium() { return 1;",
                "this.add = function \\(\\) \\{": "this.add = function () { return;",
                "full-start__button selector button--subscribe": "full-start__button selector button--subscribe hide",
                "\\[[^\n\r]+'/plugin/vast'": "['{localhost}/vast.js']"
            });
        };

        plugin.prototype.start = function () {
            console.log('[PremiumPatch] Плагін активований');
        };

        Lampa.Plugins.add({
            id: 'premium_patch',
            title: 'Premium Patch',
            description: 'Активує преміум та приховує рекламу',
            version: '1.0',
            author: 'Ти',
            onStart: function () {
                var p = new plugin();
                p.boot();
                p.start();
            }
        });
    }

    if (window.Lampa && Lampa.Plugins) {
        init();
    } else {
        document.addEventListener('lampa-ready', init);
    }
})();
