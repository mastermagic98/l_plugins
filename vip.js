(function () {
    'use strict';

    function patchLampa() {
        // Патч checkPremium
        if (Lampa.Account && typeof Lampa.Account.checkPremium === 'function') {
            Lampa.Account.checkPremium = function () { return 1; };
        }

        // Патч this.add (для прикладу у Player або іншому модулі)
        if (Lampa.Player && typeof Lampa.Player.add === 'function') {
            Lampa.Player.add = function () { return; };
        }

        // Приховуємо кнопку
        let btn = document.querySelector('.full-start__button.selector.button--subscribe');
        if (btn) btn.classList.add('hide');

        // Заміна шляху vast
        if (Lampa.Params && Lampa.Params.vast) {
            Lampa.Params.vast = '{localhost}/vast.js';
        }

        console.log('[PremiumPatch] Патчі застосовані');
    }

    if (window.Lampa) {
        patchLampa();
    } else {
        document.addEventListener('lampa-ready', patchLampa);
    }
})();
