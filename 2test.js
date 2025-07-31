(function() {
    console.log("[Lampa Safe Styles] Оптимизированная версия (без градиентов)");

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
                --accent-color: #c22222;
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
        
        // Резервная проверка каждые 30 секунд (реже для оптимизации)
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
