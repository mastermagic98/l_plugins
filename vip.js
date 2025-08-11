(function () {
    'use strict';

    var plugin = function () {};

    plugin.prototype.boot = function () {
        // Додаємо правила заміни
        Lampa.Utils.putScriptReplace({
            "checkPremium\\(\\) \\{": "checkPremium() { return 1;", // завжди преміум
            "this.add = function \\(\\) \\{": "this.add = function () { return;", // блокуємо add()
            "full-start__button selector button--subscribe": "full-start__button selector button--subscribe hide", // ховаємо кнопку
            "\\[[^\n\r]+'/plugin/vast'": "['{localhost}/vast.js']" // заміна шляху vast.js
        });
    };

    plugin.prototype.start = function () {
        console.log('[PremiumPatch] Плагін активований');
    };

    Lampa.Plugin.register('premium_patch', plugin);

})();

