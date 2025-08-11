(function () {
    'use strict';

    // Твої заміни
    const replacements = {
        "checkPremium\\(\\) \\{": "checkPremium() { return 1;",
        "this.add = function \\(\\) \\{": "this.add = function () { return;",
        "full-start__button selector button--subscribe": "full-start__button selector button--subscribe hide",
        "\\[[^\n\r]+'/plugin/vast'": "['{localhost}/vast.js']"
    };

    // Підміна функції appendChild, щоб перехопити завантаження Lampa.js
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function (element) {
        if (element.tagName === 'SCRIPT' && element.src.includes('/lampa.js')) {
            fetch(element.src)
                .then(r => r.text())
                .then(code => {
                    for (let pattern in replacements) {
                        code = code.replace(new RegExp(pattern, 'g'), replacements[pattern]);
                    }
                    const blob = new Blob([code], { type: 'application/javascript' });
                    const url = URL.createObjectURL(blob);
                    element.src = url;
                    originalAppendChild.call(this, element);
                });
            return element;
        }
        return originalAppendChild.call(this, element);
    };
})();
