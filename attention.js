// плагін попередження завантаження
(function () {
    'use strict';

    Lampa.Lang.add({
        maxsm_hints_torrents: {
            ru: "Видео не загружается или тормозит? Попробуйте выбрать другую раздачу.",
            en: "Video not loading or lagging? Try a different torrent.",
            uk: "Відео не завантажується чи гальмує? Спробуйте іншу роздачу.",
            be: "Відэа не загружаецца ці тармозіць? Паспрабуйце іншую раздачу.",
            pt: "O vídeo não carrega ou está travando? Experimente outro torrent.",
            zh: "视频卡顿或加载失败？试试换个种子。",
            he: "הווידאו לא נטען או נתקע? נסה טורנט אחר.",
            cs: "Video se nenačítá nebo se seká? Zkuste jiný torrent.",
            bg: "Видеото не се зарежда или засича? Пробвай друг торент."
        },
        maxsm_hints_online: {
            ru: "Видео не загружается или тормозит? Попробуйте выбрать другой источник или озвучку.",
            en: "Video not loading or lagging? Try a different source or audio track.",
            uk: "Відео не завантажується чи гальмує? Спробуйте інше джерело або озвучення.",
            be: "Відэа не загружаецца ці тармозіць? Паспрабуйце іншую крыніцу або агучку.",
            pt: "O vídeo não carrega ou está travando? Tente outra fonte ou dublagem.",
            zh: "视频卡顿或加载失败？试试更换来源或音轨。",
            he: "הווידאו לא נטען או נתקע? נסה מקור או פסקול אחר.",
            cs: "Video se nenačítá nebo se seká? Zkuste jiný zdroj nebo dabing.",
            bg: "Видеото не се зарежда или засича? Пробвай друг източник или озвучаване."
        },
        maxsm_hints_incard: {
            ru: "Информация о фильме может появиться раньше, чем он станет доступен для просмотра.",
            en: "A film may appear in the catalog before it's available to watch.",
            uk: "Інформація про фільм може з’явитися раніше, ніж він стане доступним для перегляду.",
            be: "Інфармацыя пра фільм можа з'явіцца раней, чым ён стане даступны для прагляду.",
            pt: "As informações sobre o filme podem aparecer antes que ele esteja disponível para assistir.",
            zh: "电影信息可能会提前显示，但影片本身尚不可观看。",
            he: "מידע על הסרט עשוי להופיע לפני שהוא זמין לצפייה בפועל.",
            cs: "Informace o filmu se může objevit dříve, než bude možné ho sledovat.",
            bg: "Информацията за филма може да се появи преди самият филм да е достъпен за гледане."
        }
    });

    var CONFIG = {
        online: {
            id: 'hint-online-banner',
            showDuration: 3000,
            fadeDuration: 500,
            repeat: false,
            enabled: true 
        },
        torrents: {
            id: 'hint-torrent-banner',
            showDuration: 4000,
            fadeDuration: 500,
            repeat: false,
            enabled: true 
        },
        incard: {
            id: 'hint-incard-banner',
            showDuration: 4000,
            fadeDuration: 500,
            repeat: false,
            enabled: true 
        }
    };

    function createHintText(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.07); border-radius: 0.5em; margin-left: 1.2em; margin-right: 1.2em; padding: 0.8em; font-size: 1.2em; transition: opacity 0.5s; line-height: 1.4;">' + hintText + '</div>';
    }
    
    function createHintText_incard(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.15); border-radius: 0.5em; margin-bottom: 1.2em; padding: 0.8em;  font-size: 1.2em; transition: opacity 0.5s; line-height: 1.4;">' + hintText + '</div>';
    }
    
    function fadeOutAndRemove($el, duration) {
        var height = $el[0].scrollHeight;
    
        $el.css({
            maxHeight: height + 'px',
            overflow: 'hidden'
        });
    
        // Force reflow
        $el[0].offsetHeight;
    
        // Схлопывание
        $el.css({
            transition: 'opacity ' + duration + 'ms, max-height ' + duration + 'ms, margin-bottom ' + duration + 'ms, padding ' + duration + 'ms',
            opacity: '0',
            maxHeight: '0px',
            marginBottom: '0px',
            paddingTop: '0px',
            paddingBottom: '0px'
        });
    
        // Подождём чуть дольше, чем сама анимация, чтобы DOM спокойно переварил
        setTimeout(function () {
            $el.remove();
        }, duration + 50); // буфер для плавности
    }

    function waitForElement(selector, callback) {
        var check = function () {
            var el = document.querySelector(selector);
            if (el) {
                callback(el);
                return true;
            }
            return false;
        };

        if (typeof MutationObserver !== 'undefined') {
            if (check()) return;

            var observer = new MutationObserver(function () {
                if (check()) observer.disconnect();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            var interval = setInterval(function () {
                if (check()) clearInterval(interval);
            }, 500);
        }
    }

    function initializeHintFeature() {
        var shown = {
            online: false,
            torrents: false,
            incard: false
        };

        Lampa.Storage.listener.follow('change', function (event) {
            if (event.name === 'activity') {
                var component = Lampa.Activity.active().component;

                if (component === 'lampac' && CONFIG.online.enabled && (CONFIG.online.repeat || !shown.online)) {
                    waitForElement('.explorer__files-head', function (el) {
                        var $hint = $(createHintText(Lampa.Lang.translate('maxsm_hints_online'), CONFIG.online.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.online.fadeDuration);
                        }, CONFIG.online.showDuration);

                        shown.online = true;
                    });
                }

                if (component === 'torrents' && CONFIG.torrents.enabled && (CONFIG.torrents.repeat || !shown.torrents)) {
                    waitForElement('.explorer__files-head', function (el) {
                        var $hint = $(createHintText(Lampa.Lang.translate('maxsm_hints_torrents'), CONFIG.torrents.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.torrents.fadeDuration);
                        }, CONFIG.torrents.showDuration);

                        shown.torrents = true;
                    });
                }
                
                if (component === 'full' && CONFIG.incard.enabled && (CONFIG.incard.repeat || !shown.incard)) {
                    waitForElement('.full-start-new__head', function (el) {
                        var $hint = $(createHintText_incard(Lampa.Lang.translate('maxsm_hints_incard'), CONFIG.incard.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.incard.fadeDuration);
                        }, CONFIG.incard.showDuration);

                        shown.incard = true;
                    });
                } 
            }
        });
    }

    if (window.appready) {
        initializeHintFeature();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initializeHintFeature();
            }
        });
    }
})();
