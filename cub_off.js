// @name: Cub_off
// @version: 1
// @description: Отключение рекламы CUB

(function () {
    'use strict';

    // ========================================================================
    // 1. КОНФИГУРАЦИЯ (Применяем сразу, чтобы Лампа увидела их первой)
    // ========================================================================
    window.lampa_settings = window.lampa_settings || {};
    
    // Включаем все крутые функции
    window.lampa_settings.account_use = true;   // Использовать аккаунт
    window.lampa_settings.plugins_store = true; // Магазин плагинов
    window.lampa_settings.torrents_use = true;  // Торренты
    window.lampa_settings.read_only = false;    // Разрешаем менять настройки руками

    // Отключаем лишнее
    window.lampa_settings.disable_features = { 
        dmca: true,      // Отключаем фильтр пиратства (показывает всё)
        ads: true,       // Выключаем рекламу (на уровне настроек)
        trailers: false, // Трейлеры оставляем
        reactions: false, 
        discuss: false, 
        ai: true,
        blacklist: true  // Отключаем черные списки контента
    };

    var PLUGIN_VERSION = 'CUB OFF v20.0 (Final)';
    
    // Безопасная обертка всего функционала
    try {

        // ====================================================================
        // 2. ГЛУШИТЕЛЬ ОШИБОК CANVAS (Fix broken images)
        // ====================================================================
        var originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function() {
            try {
                return originalDrawImage.apply(this, arguments);
            } catch (e) {
                // Игнорируем ошибки битых картинок, чтобы не было красных экранов
                if (e.name === 'InvalidStateError' || e.message.indexOf('broken') !== -1) return;
            }
        };

        // ====================================================================
        // 3. ПЕРЕХВАТЧИК ПРЕМИУМА (Fake Premium)
        // ====================================================================
        var originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function(obj, prop, descriptor) {
            if (prop === 'hasPremium') {
                descriptor.value = function() { return true; };
                descriptor.writable = true; 
                descriptor.configurable = true;
            }
            return originalDefineProperty.call(this, obj, prop, descriptor);
        };

        // ====================================================================
        // 4. БЕЗОПАСНЫЙ CSS (Скрытие рекламы)
        // ====================================================================
        var injectSafeCSS = function() {
            var style = document.createElement("style");
            style.innerHTML = `
                .ad-server, .ad-preroll, .player-advertising, .layer--advertising {
                    opacity: 0 !important; visibility: hidden !important;
                    z-index: -9999 !important; pointer-events: none !important;
                    position: absolute !important; top: -9999px !important;
                }
                .button--subscribe, .card-promo, .settings--account-premium {
                    display: none !important;
                }
                .cub-off-badge {
                    width: 100%; text-align: center; padding: 15px 0;
                    opacity: 0.6; font-size: 1em; color: #aaaaaa;
                    margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);
                    pointer-events: none;
                }
                .cub-off-badge span { color: #4bbc16; font-weight: bold; }
            `;
            document.body.appendChild(style);
        };

        // ====================================================================
        // 5. УМНЫЙ ПЕРЕХВАТ ТАЙМЕРОВ (Ускорение рекламы)
        // ====================================================================
        var patchTimers = function() {
            var originalSetTimeout = window.setTimeout;
            window.setTimeout = function(func, delay) {
                // Ускоряем только таймеры, похожие на рекламные (3.5 сек)
                if (delay === 3500 || (delay > 3400 && delay < 3600)) {
                    return originalSetTimeout(func, 1);
                }
                return originalSetTimeout(func, delay);
            };
        };

        // ====================================================================
        // 6. GHOST MODE (Блокировка шпионов и логов)
        // ====================================================================
        var killSpyware = function() {
            try {
                localStorage.removeItem('metric_ad_view');
                localStorage.removeItem('vast_device_uid');
            } catch(e) {}

            var interval = setInterval(function() {
                if (typeof Lampa !== 'undefined') {
                    // Глушим метрики
                    if (Lampa.ServiceMetric) {
                        Lampa.ServiceMetric.counter = function() { };
                        Lampa.ServiceMetric.histogram = function() { };
                    }
                    // Глушим глобальные функции рекламы
                    if (window.stat1launch) window.stat1launch = function() {};
                    if (window.stat1error) window.stat1error = function() {};
                    
                    // Выключаем статус разработчика (зеленую плашку ошибок)
                    if (Lampa.Settings && Lampa.Settings.developer) {
                        Lampa.Settings.developer.log = false;
                        Lampa.Settings.developer.active = false;
                        Lampa.Settings.developer.status = false;
                    }
                    clearInterval(interval);
                }
            }, 1000);
            
            // Отключаем проверку через 30 секунд
            setTimeout(function() { clearInterval(interval); }, 30000);
        };

        // ====================================================================
        // 7. UI (Бейджик в настройках)
        // ====================================================================
        var injectInfo = function() {
            var observer = new MutationObserver(function(mutations) {
                var settingsBox = document.querySelector('.settings__content');
                if (settingsBox && !settingsBox.querySelector('.cub-off-badge')) {
                    var badge = document.createElement('div');
                    badge.className = 'cub-off-badge';
                    badge.innerHTML = PLUGIN_VERSION + '<br>Status: <span>Protected</span>';
                    settingsBox.appendChild(badge);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        };

        // ====================================================================
        // 8. ЗАПУСК
        // ====================================================================
        var init = function() {
            injectSafeCSS();
            patchTimers();
            killSpyware();
            injectInfo();
            
            // Финальная страховка премиума
            if (typeof Lampa !== 'undefined' && Lampa.Account) {
                try { Lampa.Account.hasPremium = function() { return true; }; } catch(e) {}
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

    } catch (globalError) {
        console.warn('CUB OFF wrapper error:', globalError);
    }

})();
