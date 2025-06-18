            // Для страницы актера
            if (e.type === 'start' && e.component === 'actor') {
                log("[PERSON-PLUGIN] Actor page started");
                
                if (e.object && e.object.id) {
                    currentPersonId = parseInt(e.object.id, 10);
                    log("[PERSON-PLUGIN] Found actor ID in e.object.id:", currentPersonId);
                    
                    // Используем улучшенное ожидание контейнера
                    waitForContainer(function() {
                        addSubscribeButton();
                    });
                }
            }
            // При активации страницы плагина
            else if (e.type === 'resume' && e.component === 'category_full' && e.object && e.object.source === PLUGIN_NAME) {
                log("[PERSON-PLUGIN] Persons list resumed");
                // Обновляем список при возврате
                setTimeout(function() {
                    Lampa.Activity.reload();
                }, 100);
        });
}
        // Запускаем проверку текущей активности
        setTimeout(checkCurrentActivity, 1500);
        
        // Добавляем стили
        addButtonStyles();
    }

    // Запуск плагина
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
}();
