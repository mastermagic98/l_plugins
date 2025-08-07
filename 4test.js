// Додаємо переклад для пункту меню
Lampa.Lang.add({
    my_themes: {
        uk: 'Мої теми',
        ru: 'Мои темы',
        en: 'My Themes'
    }
});

// Реєстрація компонента в меню налаштувань Lampa
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 397.117 L 481.281 397.117 L 481.281 145.313 L 30.721 145.313 L 30.721 397.117 L 292.833 397.117 L 314.433 428.593 L 20.48 428.593 C 9.179 428.593 0 419.183 0 407.607 L 0 103.346 C 0 91.642 9.179 82.362 20.48 82.362 L 491.522 82.362 C 502.818 82.362 512 91.642 512 103.346 L 512 407.607 C 512 419.183 502.818 428.593 491.522 428.593 Z M 427.041 500.036 C 413.25 511.314 390.56 505.805 376.194 487.542 L 230.819 275.968 C 216.48 257.706 216.548 261.248 230.303 249.837 C 244.066 238.459 240.708 237.706 255.037 255.837 L 425.954 446.462 C 440.289 464.625 440.801 488.659 427.041 500.036 Z M 389.665 474.757 C 389.665 474.757 387.554 477.183 380.449 482.986 C 391.105 500.756 412 497.544 412 497.544 C 392.162 485.544 389.665 474.757 389.665 474.757 Z M 136.581 196.92 C 164.868 197.083 168.383 204.166 177.63 233.216 C 194.626 279.281 271.361 221.182 223.809 201.084 C 176.219 180.986 108.127 196.723 136.581 196.92 Z M 322.145 22.788 C 313.313 29.476 312.32 39.51 312.32 39.51 L 309.056 61.378 L 202.91 61.378 L 199.62 39.543 C 199.62 39.543 198.685 29.509 189.857 22.788 C 180.901 16.066 173.98 10.329 180.901 9.444 C 187.744 8.491 251.328 9.246 256.001 9.444 C 260.671 9.246 324.224 8.491 331.072 9.444 C 337.986 10.296 331.072 16.035 322.145 22.788 Z" style="fill: currentColor; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>'
});

// Функція для конвертації HSL у RGB
function hslToRgb(h, s, l) {
    s = s / 100;
    l = l / 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { red: r, green: g, blue: b };
}

// Функція для конвертації RGB у HSL
function rgbToHsl(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / d + 2;
        } else {
            h = (r - g) / d + 4;
        }
        h = h * 60;
    }

    return Math.round(h);
}

// Функція для створення інтерфейсу вибору кольору
function createColorPicker(content) {
    console.log('[MyThemes] Починаємо створення інтерфейсу вибору кольору');

    // Очищаємо вміст
    content.innerHTML = '';

    // Створюємо контейнер
    var container = document.createElement('div');
    container.style.padding = '20px';
    container.style.background = '#333';
    container.style.borderRadius = '10px';
    container.style.maxWidth = '400px';
    container.style.margin = '0 auto';
    container.style.color = '#fff';
    container.style.display = 'block';
    container.style.zIndex = '1000';

    // Ініціалізація значень кольору (Hue: 0–360, Alpha: 0–100)
    var values = { hue: 0, alpha: 100 };

    // Створюємо повзунок для відтінку (Hue)
    var hueLabel = document.createElement('label');
    hueLabel.textContent = 'Відтінок: ';
    hueLabel.style.display = 'block';
    hueLabel.style.margin = '10px 0 5px';

    var hueInput = document.createElement('input');
    hueInput.type = 'range';
    hueInput.min = '0';
    hueInput.max = '360';
    hueInput.value = values.hue.toString();
    hueInput.id = 'color_hue';
    hueInput.style.width = '100%';

    hueInput.oninput = function() {
        values.hue = parseInt(this.value);
        updateTheme();
    };

    container.appendChild(hueLabel);
    container.appendChild(hueInput);

    // Створюємо повзунок для прозорості (Alpha)
    var alphaLabel = document.createElement('label');
    alphaLabel.textContent = 'Прозорість: ';
    alphaLabel.style.display = 'block';
    alphaLabel.style.margin = '10px 0 5px';

    var alphaInput = document.createElement('input');
    alphaInput.type = 'range';
    alphaInput.min = '0';
    alphaInput.max = '100';
    alphaInput.value = values.alpha.toString();
    alphaInput.id = 'color_alpha';
    alphaInput.style.width = '100%';

    alphaInput.oninput = function() {
        values.alpha = parseInt(this.value);
        updateTheme();
    };

    container.appendChild(alphaLabel);
    container.appendChild(alphaInput);

    // Створюємо поле для HEX-коду
    var hexLabel = document.createElement('label');
    hexLabel.textContent = 'HEX-код: ';
    hexLabel.style.display = 'block';
    hexLabel.style.margin = '10px 0 5px';

    var hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.placeholder = '#FFFFFF';
    hexInput.style.width = '100%';
    hexInput.style.padding = '5px';
    hexInput.style.borderRadius = '5px';

    // Обробник для HEX-коду
    hexInput.oninput = function() {
        var hex = this.value.replace('#', '');
        if (hex.length === 6) {
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                values.hue = rgbToHsl(r, g, b);
                document.getElementById('color_hue').value = values.hue;
                updateTheme();
            }
        }
    };

    container.appendChild(hexLabel);
    container.appendChild(hexInput);

    // Функція для оновлення теми
    function updateTheme() {
        console.log('[MyThemes] Оновлення теми з Hue:', values.hue, 'Alpha:', values.alpha);

        // Конвертуємо HSL у RGB
        var rgb = hslToRgb(values.hue, 100, 50); // Saturation=100%, Lightness=50%
        var hex = '#' + ((1 << 24) + (rgb.red << 16) + (rgb.green << 8) + rgb.blue).toString(16).slice(1);
        hexInput.value = hex;

        // Формуємо RGBA
        var rgba = 'rgba(' + rgb.red + ',' + rgb.green + ',' + rgb.blue + ',' + (values.alpha / 100) + ')';

        // Оновлюємо змінну --accent-color у :root
        var style = document.createElement('style');
        style.id = 'custom-theme';
        style.textContent = ':root { --accent-color: ' + rgba + ' !important; }';

        var oldStyle = document.getElementById('custom-theme');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);

        // Зберігаємо налаштування
        Lampa.Storage.set('custom_theme', {
            hue: values.hue,
            alpha: values.alpha
        });
    }

    // Завантажуємо збережені налаштування
    var savedTheme = Lampa.Storage.get('custom_theme', null);
    if (savedTheme) {
        console.log('[MyThemes] Завантажено збережені налаштування:', savedTheme);
        values.hue = savedTheme.hue;
        values.alpha = savedTheme.alpha;
        document.getElementById('color_hue').value = savedTheme.hue;
        document.getElementById('color_alpha').value = savedTheme.alpha;
        updateTheme();
    } else {
        console.log('[MyThemes] Немає збережених налаштувань, використовуємо стандартні');
        updateTheme();
    }

    // Додаємо контейнер до вмісту
    content.appendChild(container);
    console.log('[MyThemes] Інтерфейс вибору кольору додано до DOM');
}

// Додаємо обробник для рендерингу компонента
Lampa.SettingsApi.addComponent({
    component: 'my_themes',
    name: Lampa.Lang.translate('my_themes'),
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" focusable="false" aria-hidden="true"><path d="M 491.522 428.593 L 427.586 428.593 L 399.361 rogation: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000057, 0.000065)"></path></svg>',
    onRender: function(content) {
        console.log('[MyThemes] Викликано onRender для my_themes');
        createColorPicker(content);
    }
});
