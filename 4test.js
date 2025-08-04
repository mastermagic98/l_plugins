(function() {
    console.log("[Lampa Safe Styles] Оптимизированная версия с выбором цвета в компоненте");

    // Кеш элементов
    const elementsCache = new Map();
    let stylesApplied = false;

    /**
     * Добавление стилей с кешированием элементов
     */
    function safeAddStyleToElements(selector, styles) {
        if (!elementsCache.has(selector)) {
            elementsCache.set(selector, {
                elements: document.querySelectorAll(selector),
                styled: false
            });
        }

        const cacheEntry = elementsCache.get(selector);
        if (cacheEntry.styled) return;

        cacheEntry.elements.forEach(el => {
            if (el && !el.dataset.lampaStyled) {
                Object.entries(styles).forEach(([property, value]) => {
                    el.style.setProperty(property, value, 'important');
                });
                el.dataset.lampaStyled = 'true';
            }
        });
        
        cacheEntry.styled = true;
    }

    /**
     * Применение базовых стилей
     */
    function applyStyles() {
        if (stylesApplied) return;
        
        // Стили для body
        if (!document.body.dataset.lampaStyled) {
            document.body.style.setProperty('background', '#141414', 'important');
            document.body.dataset.lampaStyled = 'true';
        }	
        
        // Применение сохраненного акцентного цвета
        const savedColor = Lampa.Storage.get('accent_color', '#c22222');
        document.documentElement.style.setProperty('--accent-color', savedColor);
        
        stylesApplied = true;
    }

    /**
     * Добавление всех CSS стилей
     */
    function addCardStyles() {
        const styleId = 'lampa-safe-css';
        if (document.getElementById(styleId)) return;

        const fullCSS = `
            :root {
                --dark-bg: #141414;
                --darker-bg: #1a1a1a;
                --menu-bg: #181818;
                --accent-color: #c22222; /* Дефолтный цвет, будет переопределен */
                --card-radius: 1.4em;
                --menu-radius: 1.2em;
            }

            /* Карточки */
            .card.focus .card__view::after,
            .card.hover .card__view::after {
                content: "";
                position: absolute;
                top: -0.3em;
                left: -0.3em;
                right: -0.3em;
                bottom: -0.3em;
                border: 0.3em solid var(--accent-color);
                border-radius: var(--card-radius);
                z-index: -1;
                pointer-events: none;
                background-color: var(--accent-color);
            }
            
            /* Элементы в фокусе */
            .settings-param.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }
            
            .simple-button.focus {
                color: #fff;
                background: var(--accent-color);
            }
			
			.head__action {
				opacity: 0.80;
			}
			
			/* Градиентный текст для рейтинга */
            .full-start__rate > div:first-child {
                color: #1ed5a9;
				font-weight: bold;
				background: none;
            }
			
            .torrent-serial.focus,
            .torrent-file.focus {
                background: var(--accent-color);
            }
            
            .torrent-item.focus::after {
                content: "";
                position: absolute;
                top: -0.5em;
                left: -0.5em;
                right: -0.5em;
                bottom: -0.5em;
                border: 0.3em solid var(--accent-color);
                border-radius: 0.7em;
                z-index: -1;
                background: var(--accent-color);
            }
            
            .tag-count.focus,
            .full-person.focus,
            .full-review.focus {
                color: #fff;
                background: var(--accent-color);
            }
			
			.navigation-bar__body { 
				background: rgba(0, 0, 0, 0.3);
			}
			.console {
				background: #141414;
			}
			.bookmarks-folder__layer {
				background: rgba(0, 0, 0, 0.3);
			}
			.selector__body, .modal-layer {
				background-color: #141414;
			}

            .menu__item.focus, 
            .menu__item.traverse, 
            .menu__item.hover {
                color: #fff;
                background: var(--accent-color);
            }
            
            .card__marker > span {
                max-width: 11em;
            }
            
            .menu__item.focus .menu__ico path[fill],
            .menu__item.focus .menu__ico rect[fill],
            .menu__item.focus .menu__ico circle[fill],
            .menu__item.traverse .menu__ico path[fill],
            .menu__item.traverse .menu__ico rect[fill],
            .menu__item.traverse .menu__ico circle[fill],
            .menu__item.hover .menu__ico path[fill],
            .menu__item.hover .menu__ico rect[fill],
            .menu__item.hover .menu__ico circle[fill] {
                fill: #ffffff;
            }
            
            .online.focus {
                box-shadow: 0 0 0 0.2em var(--accent-color);
                background: var(--accent-color);
            }
            
            .menu__item.focus .menu__ico [stroke],
            .menu__item.traverse .menu__ico [stroke],
            .menu__item.hover .menu__ico [stroke] {
                stroke: #ffffff;
            }
            
            .noty {
                color: #ffffff;
            }
            
            .head__action.focus {
                background: var(--accent-color);
                color: #fff;
            }
            
            .selector:hover {
                opacity: 0.8;
            }
            
            .online-prestige.focus::after {
                border: solid .3em var(--accent-color) !important;
                background-color: #871818;
            }
            
            .full-episode.focus::after,
            .card-episode.focus .full-episode::after {
                border: 0.3em solid var(--accent-color);
            }
            
            .wrap__left {
                box-shadow: 15px 0px 20px 0px var(--dark-bg) !important;
            }
            
            .card-more.focus .card-more__box::after {
                border: 0.3em solid var(--accent-color);
            }
            
            .card__type {
                background: var(--accent-color) !important;
            }
            
            .new-interface .card.card--wide+.card-more .card-more__box {
                background: rgba(0, 0, 0, 0.3);
            }
            
            .helper {
                background: var(--accent-color);
            }
            
            .extensions__item,
            .extensions__block-add {
                background-color: var(--menu-bg);
            }
            
            .extensions__item.focus:after,
            .extensions__block-empty.focus:after,
            .extensions__block-add.focus:after {
                border: 0.3em solid var(--accent-color);
            }
            
            .settings-input--free,
            .settings-input__content,
            .extensions {
                background-color: var(--dark-bg);
            }
            
            .modal__content {
                background-color: var(--darker-bg) !important;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
            }
            
            .settings__content, 
            .selectbox__content {
                position: fixed;
                right: -100%;
                display: flex;
                background: var(--darker-bg);
                top: 1em;
                left: 98%;
                max-height: calc(100vh - 2em);
                border-radius: var(--menu-radius);
                padding: 0.5em;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                overflow-y: auto;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
            }
			
			.card-more__box {
				background: rgba(0, 0, 0, 0.3);
			}

			.items-line__more.focus {
				background-color: var(--accent-color);
				color: #fff;
			}

            .settings__title, 
            .selectbox__title {
                font-size: 2.5em;
                font-weight: 300;
                text-align: center;
            }
            
            .scroll--mask {
                -webkit-mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
                mask-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 8%, rgb(255, 255, 255) 92%, rgba(255, 255, 255, 0) 100%);
            }
			
			.full-start__button.focus {
				color: white !important;
				background: var(--accent-color) !important;
			}
            
            .menu__item {
                border-radius: 0em 15em 14em 0em;
            }
            
            .menu__list {
                padding-left: 0;
            }
            
            body.advanced--animation .head .head__action.focus,
            body.advanced--animation .head .head__action.hover,
            body.advanced--animation .menu .menu__item.focus,
            body.advanced--animation .menu .menu__item.hover,
            body.advanced--animation .full-start__button.focus,
            body.advanced--animation .full-start__button.hover,
            body.advanced--animation .simple-button.focus,
            body.advanced--animation .simple-button.hover,
            body.advanced--animation .full-descr__tag.focus,
            body.advanced--animation .full-descr__tag.hover,
            body.advanced--animation .tag-count.focus,
            body.advanced--animation .tag-count.hover,
            body.advanced--animation .full-review.focus,
            body.advanced--animation .full-review.hover,
            body.advanced--animation .full-review-add.focus,
            body.advanced--animation .full-review-add.hover {
                animation: none !important;
            }
            
            .full-review-add.focus::after {
                border: 0.3em solid var(--accent-color);
            }
            
			.explorer__left {
				display: none;
			}
			.explorer__files {
				width: 100%;
			}
			
            .notification-item {
                border: 2px solid var(--accent-color) !important;
            }
            
            .notification-date {
                background: var(--accent-color) !important;
            }
			
			.card__quality {
				color: #fff;
				background: var(--accent-color) !important;
			}
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                align-items: center;
            }
            
            .noty__body {
                box-shadow: 0 -2px 6px rgb(22 22 22 / 50%);
                background: var(--accent-color);
            }
			
			.card__title {
				text-align: center;
				font-size: 1.2em;
				line-height: 1.1;
			}
			
			.background__one.visible, .background__two.visible {
				opacity: 0;
			}
			
			.card__age {
				text-align: center;
				color: #ffffff7a;
			}
			
			
			body {
				margin: 1 !important;
			}
            
            /* Стили для рейтинга на карточке */
            .card__vote {
                position: absolute;
                top: 0;
                right: 0em;
                background: var(--accent-color);
                color: #ffffff;
                font-size: 1.5em;
                font-weight: 700;
                padding: 0.5em;
                border-radius: 0em 0.5em 0em 0.5em;
                display: flex;
                flex-direction: column;
                align-items: center;
                bottom: auto;
            }						
            
            /* Стиль для элемента selectbox в фокусе */
            .selectbox-item.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }
            
            /* Стиль для папки настроек в фокусе */
            .settings-folder.focus {
                color: #fff;
                border-radius: var(--menu-radius);
                background: var(--accent-color);
            }
			
			body.glass--style.platform--browser .card .card__icons-inner, body.glass--style.platform--browser .card .card__marker, body.glass--style.platform--browser .card .card__vote, body.glass--style.platform--browser .card .card-watched, body.glass--style.platform--nw .card .card__icons-inner, body.glass--style.platform--nw .card .card__marker, body.glass--style.platform--nw .card .card__vote, body.glass--style.platform--nw .card .card-watched, body.glass--style.platform--apple .card .card__icons-inner, body.glass--style.platform--apple .card .card__marker, body.glass--style.platform--apple .card .card__vote, body.glass--style.platform--apple .card .card-watched {
				background-color: rgba(0, 0, 0, 0.3);
				-webkit-backdrop-filter: blur(1em);
				backdrop-filter: none;
				background: var(--accent-color);
			}

            /* Стили для секции выбора цвета */
            .color-picker__section {
                padding: 1em;
                background: var(--darker-bg);
                border-radius: var(--menu-radius);
                margin-bottom: 1em;
            }
            
            .color-picker__title {
                font-size: 1.5em;
                color: #fff;
                margin-bottom: 0.5em;
            }
            
            .color-picker__input {
                width: 100%;
                height: 3em;
                margin-bottom: 1em;
            }
            
            .color-picker__slider {
                width: 100%;
                margin: 0.5em 0;
                background: linear-gradient(to right, #000, #fff);
            }
            
            .color-picker__slider.red {
                background: linear-gradient(to right, rgb(0, var(--g), var(--b)), rgb(255, var(--g), var(--b)));
            }
            
            .color-picker__slider.green {
                background: linear-gradient(to right, rgb(var(--r), 0, var(--b)), rgb(var(--r), 255, var(--b)));
            }
            
            .color-picker__slider.blue {
                background: linear-gradient(to right, rgb(var(--r), var(--g), 0), rgb(var(--r), var(--g), 255));
            }
            
            .color-picker__slider.saturation {
                background: linear-gradient(to right, #808080, rgb(var(--r), var(--g), var(--b)));
            }
            
            .color-picker__label {
                color: #fff;
                margin-right: 0.5em;
            }
            
            .color-picker__hex-input {
                width: 100%;
                padding: 0.5em;
                margin-top: 0.5em;
                background: var(--dark-bg);
                color: #fff;
                border: 1px solid #fff;
                border-radius: 0.5em;
            }

            /* Мобильные стили */
            @media screen and (max-width: 480px) {
                .settings__content,
                .selectbox__content {
                    left: 0 !important;
                    top: unset !important;
                    border-top-left-radius: 2em !important;
                    border-top-right-radius: 2em !important;
                }
                
                .ru-title-full,
                .ru-title-full:hover {
                    max-width: none !important;
                    text-align: center !important;
                }
                
                .full-start-new__body {
                    text-align: center !important;
                }
                
                .full-start-new__rate-line {
                    padding-top: 0.5em !important;
                    display: flex;
                    justify-content: center;
                    margin-bottom: 0em;
                }
                
                .full-start-new__tagline {
                    margin-bottom: 0.5em !important;
                    margin-top: 0.5em !important;
                }
            }
			
			@media screen and (max-width: 480px) {
				.full-start-new__title img {
					object-fit: contain;
					max-width: 10em !important;
					max-height: 5em !important;
				}
			}
								
			
            @media screen and (max-width: 580px) {
                .full-descr__text {
                    text-align: justify;
                }
                
                .items-line__head {
                    justify-content: center !important;
                }
                
                .full-descr__details {
                    justify-content: center !important;
                }
            }
			
			
			@media screen and (max-width: 480px) {
			.full-start-new__details > span:nth-of-type(7) {
				display: block;
				order: 2;
				opacity: 40%;		
			}
			}

            @media screen and (max-width: 480px) {
                .full-descr__tags {
                    justify-content: center !important;
                }
                
                .items-line__more {
                    display: none;
                }
                
                .full-descr__info-body {
                    justify-content: center !important;
                    display: flex;
                }
                
                .full-descr__details > * {
                    text-align: center;
                }
            }
            
            @media screen and (max-width: 580px) {
                .full-start-new__buttons {
                    overflow: auto;
                    display: flex !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }
            
            @media screen and (max-width: 767px) {
                .full-start-new__details {
                    display: flex !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }
			
			@media screen and (max-width: 480px) {
				.selectbox.animate .selectbox__content, .settings.animate .settings__content {
					background: #1a1a1a;
				}
			}
            
            @media screen and (max-width: 480px) {
                .full-start-new__reactions {
                    display: flex !important;
                    justify-content: center !important;
                    flex-wrap: wrap !important;
                    max-width: 100% !important;
                    margin: 0.5em auto !important;
                }
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = fullCSS;
        document.head.appendChild(style);
    }

    /**
     * Конвертация RGB в HSL и обратно
     */
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    }

    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
    }

    /**
     * Добавление секции выбора цвета в компонент styleinter
     */
    function createColorPickerComponent() {
        const html = Lampa.Template.get('styleinter_color_picker');
        if (!html) {
            console.error('Шаблон styleinter_color_picker не найден');
            return '';
        }

        const colorSection = document.createElement('div');
        colorSection.className = 'color-picker__section';

        const title = document.createElement('div');
        title.className = 'color-picker__title';
        title.textContent = Lampa.Lang.translate('color_picker_title');
        colorSection.appendChild(title);

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-picker__input';
        colorInput.value = Lampa.Storage.get('accent_color', '#c22222');
        colorSection.appendChild(colorInput);

        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.className = 'color-picker__hex-input';
        hexInput.placeholder = '#RRGGBB';
        hexInput.value = colorInput.value;
        colorSection.appendChild(hexInput);

        const slidersContainer = document.createElement('div');
        slidersContainer.className = 'color-picker__sliders';

        const slidersData = [
            { class: 'red', label: 'spectrum' },
            { class: 'green', label: 'spectrum' },
            { class: 'blue', label: 'spectrum' },
            { class: 'saturation', label: 'saturation' }
        ];

        const sliders = slidersData.map(data => {
            const sliderContainer = document.createElement('div');
            const label = document.createElement('span');
            label.className = 'color-picker__label';
            label.textContent = Lampa.Lang.translate(data.label);
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = `color-picker__slider ${data.class}`;
            slider.min = data.class === 'saturation' ? '0' : '0';
            slider.max = data.class === 'saturation' ? '100' : '255';
            slider.value = data.class === 'saturation' ? '100' : '0';
            
            sliderContainer.appendChild(label);
            sliderContainer.appendChild(slider);
            slidersContainer.appendChild(sliderContainer);
            return slider;
        });

        colorSection.appendChild(slidersContainer);

        let r = parseInt(colorInput.value.slice(1, 3), 16);
        let g = parseInt(colorInput.value.slice(3, 5), 16);
        let b = parseInt(colorInput.value.slice(5, 7), 16);
        let [h, s, l] = rgbToHsl(r, g, b);
        sliders[0].value = r;
        sliders[1].value = g;
        sliders[2].value = b;
        sliders[3].value = s;

        function updateSliderStyles() {
            document.documentElement.style.setProperty('--r', sliders[0].value);
            document.documentElement.style.setProperty('--g', sliders[1].value);
            document.documentElement.style.setProperty('--b', sliders[2].value);
        }
        updateSliderStyles();

        colorInput.addEventListener('input', () => {
            const hex = colorInput.value;
            hexInput.value = hex;
            document.documentElement.style.setProperty('--accent-color', hex);
            Lampa.Storage.set('accent_color', hex);
            
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
            [h, s, l] = rgbToHsl(r, g, b);
            sliders[0].value = r;
            sliders[1].value = g;
            sliders[2].value = b;
            sliders[3].value = s;
            updateSliderStyles();
        });

        hexInput.addEventListener('input', () => {
            const hex = hexInput.value.trim();
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorInput.value = hex;
                document.documentElement.style.setProperty('--accent-color', hex);
                Lampa.Storage.set('accent_color', hex);
                
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
                [h, s, l] = rgbToHsl(r, g, b);
                sliders[0].value = r;
                sliders[1].value = g;
                sliders[2].value = b;
                sliders[3].value = s;
                updateSliderStyles();
            } else {
                hexInput.style.borderColor = '#ff0000';
                setTimeout(() => hexInput.style.borderColor = '#fff', 1000);
            }
        });

        sliders.forEach((slider, index) => {
            slider.addEventListener('input', () => {
                r = parseInt(sliders[0].value);
                g = parseInt(sliders[1].value);
                b = parseInt(sliders[2].value);
                s = parseInt(sliders[3].value);
                
                if (index < 3) {
                    [h, s, l] = rgbToHsl(r, g, b);
                    sliders[3].value = s;
                } else {
                    [r, g, b] = hslToRgb(h, s, l);
                    sliders[0].value = r;
                    sliders[1].value = g;
                    sliders[2].value = b;
                }
                
                const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                colorInput.value = hex;
                hexInput.value = hex;
                document.documentElement.style.setProperty('--accent-color', hex);
                Lampa.Storage.set('accent_color', hex);
                updateSliderStyles();
            });
        });

        return colorSection.outerHTML;
    }

    /**
     * Добавление компонента в меню настроек
     */
    Lampa.SettingsApi.addComponent({
        component: 'styleinter',
        name: Lampa.Lang.translate('style_interface'),
        html: createColorPickerComponent,
        icon: `
        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
        </svg>
        `
    });

    // Оптимизированный наблюдатель за DOM
    const observer = new MutationObserver(() => {
        if (!stylesApplied) {
            requestAnimationFrame(applyStyles);
        }
    });

    // Инициализация
    function init() {
        applyStyles();
        addCardStyles();
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Резервная проверка каждые 30 секунд
        const backupInterval = setInterval(() => {
            if (!stylesApplied) applyStyles();
        }, 30000);
        
        // Функция остановки
        window.stopLampaSafeStyles = () => {
            clearInterval(backupInterval);
            observer.disconnect();
            
            const style = document.getElementById('lampa-safe-css');
            if (style) style.remove();
            
            document.querySelectorAll('[data-lampa-styled]').forEach(el => {
                el.removeAttribute('data-lampa-styled');
            });
            
            elementsCache.clear();
            stylesApplied = false;
            
            console.log("[Lampa Safe Styles] Плагин остановлен");
        };
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
