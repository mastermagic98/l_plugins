(function () {
    'use strict';

    var DEFAULT_PLUGIN = 'default';

    // Общие стили для качества видео (будут добавлены ко всем темам)
    var qualityColorsCSS = `
        .card__quality, 
        .card-v2 .card__quality {
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        /* 4K */
        .card__quality[data-quality="4K"],
        .card-v2 .card__quality[data-quality="4K"] {
            background: linear-gradient(135deg, #8a2be2, #6a5acd) !important;
            color: white !important;
        }
        
        /* WEB-DL */
        .card__quality[data-quality="WEB-DL"],
        .card-v2 .card__quality[data-quality="WEB-DL"] {
            background: linear-gradient(135deg, #1e90ff, #4169e1) !important;
            color: black !important;
        }
        
        /* BD/BDRIP */
        .card__quality[data-quality="BD"],
        .card__quality[data-quality="BDRIP"],
        .card-v2 .card__quality[data-quality="BD"],
        .card-v2 .card__quality[data-quality="BDRIP"] {
            background: linear-gradient(135deg, #ffd700, #daa520) !important;
            color: black !important;
        }
        
        /* HDTV */
        .card__quality[data-quality="HDTV"],
        .card-v2 .card__quality[data-quality="HDTV"] {
            background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
            color: white !important;
        }
        
        /* TC/TS/TELECINE */
        .card__quality[data-quality="TC"],
        .card__quality[data-quality="TS"],
        .card__quality[data-quality="TELECINE"],
        .card-v2 .card__quality[data-quality="TC"],
        .card-v2 .card__quality[data-quality="TS"],
        .card-v2 .card__quality[data-quality="TELECINE"] {
            background: linear-gradient(135deg, #ff6b6b, #e74c3c) !important;
            color: white !important;
        }
        
        /* VHS */
        .card__quality[data-quality="VHS"],
        .card-v2 .card__quality[data-quality="VHS"] {
            background: linear-gradient(135deg, #00cccc, #009999) !important;
            color: white !important;
        }
        
        /* DVDRIP */
        .card__quality[data-quality="DVDRIP"],
        .card-v2 .card__quality[data-quality="DVDRIP"] {
            background: linear-gradient(135deg, #88ff88, #aaffaa) !important;
            color: black !important;
        }
        
        /* DVB */
        .card__quality[data-quality="DVB"],
        .card-v2 .card__quality[data-quality="DVB"] {
            background: linear-gradient(135deg, #ffddbb, #ff99cc) !important;
            color: black !important;
        }
        
        /* По умолчанию */
        .card__quality:not([data-quality]),
        .card-v2 .card__quality:not([data-quality]) {
            background: #fff816 !important;
            color: black !important;
        }
    `;

    // Встроенные темы CSS
    var themes = {
        prisma: `
        
/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    color: #000;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
            var pluginItem = $('<div class="icon-item selector">' +
                '<img src="' + themeIcons[plugin.key] + '">' +
                '<div style="color: lightgray; text-align: center; margin-top: 5px;">' + plugin.name + '</div>' +
                '</div>');

            pluginItem.on('hover:focus', function () {
                $('.icon-item').removeClass('focused');
                $(this).addClass('focused');
            });

            pluginItem.on('hover:enter', function () {
                removeCurrentPlugin();
                plugin.apply();
                iconElement.attr('src', themeIcons[plugin.key]);
                if (Lampa && Lampa.Storage) {
                    Lampa.Storage.set('selectedPlugin', plugin.key);
                }
                Lampa.Modal.close();
                setTimeout(function() { location.reload(); }, 500);
            });

            pluginGrid.append(pluginItem);
        });

        html.append(modalTitle);
        html.append(pluginGrid);
        html.append(resetBtn);

       Lampa.Modal.open({
            title: '',
            html: html,
            size: 'middle',
            position: 'center',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }


    // Добавляем функцию для установки атрибутов качества
    function applyQualityAttributes() {
        document.querySelectorAll('.card__quality, .card-v2 .card__quality').forEach(el => {
            const quality = el.textContent.trim().toUpperCase();
            el.setAttribute('data-quality', quality);
        });
    }

    // Модифицируем функцию applyTheme
    function applyTheme(themeKey) {
        var style = document.createElement('style');
        style.id = themeKey + '-theme';
        style.textContent = themes[themeKey];
        document.head.appendChild(style);
        
        // Применяем атрибуты качества
        applyQualityAttributes();
        
        // Наблюдаем за динамическим контентом
        new MutationObserver(() => applyQualityAttributes())
            .observe(document.body, {childList: true, subtree: true});
    }

    if (window.appready) {
        addPluginIcon();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                addPluginIcon();
            }
        });
    }
})();
