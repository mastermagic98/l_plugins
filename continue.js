(function () {  
    'use strict';  
      
    // Language configuration  
    const texts = {  
        'en': {  
            button: 'Continue',  
            name: 'Continue Watching',  
            description: 'Button to continue from the last torserv distribution'  
        },  
        'ru': {  
            button: 'Продолжить',  
            name: 'Продолжить просмотр',  
            description: 'Кнопка продолжения с последней torserv раздачи'  
        },  
        'uk': {  
            button: 'Продовжити',  
            name: 'Продовжити перегляд',  
            description: 'Кнопка продовження з останньої torserv роздачі'  
        }  
    };  
      
    // Get current language (you can modify this logic to detect user's language)  
    const currentLang = localStorage.getItem('lampa_language') || 'en';  
    const t = texts[currentLang] || texts['en'];  
      
    var currentCard = null;  
    var originalPlay = Lampa.Player.play;  
    var timeTracker = null;  
    var isResuming = false;  
    var resumePosition = 0;  
      
    Lampa.Listener.follow('full', function(e) {  
        if (e.type === 'complite') {  
            currentCard = e.object.card || e.object;  
            setTimeout(function() { addButton(currentCard); }, 500);  
        }  
    });  
      
    Lampa.Player.play = function(params) {  
        if (!isResuming && params && params.url && currentCard && currentCard.id) {  
            var data = Lampa.Storage.get('cp_' + currentCard.id) || {};  
            data.id = currentCard.id;  
            data.title = currentCard.title || currentCard.name || 'Unknown';  
            data.url = params.url;  
            if (!data.position) data.position = 0;  
            data.timestamp = Date.now();  
            Lampa.Storage.set('cp_' + currentCard.id, data);  
            startTracking();  
        }  
        return originalPlay.apply(this, arguments);  
    };  
      
    function startTracking() {  
        if (timeTracker) clearInterval(timeTracker);  
          
        timeTracker = setInterval(function() {  
            if (!currentCard || !currentCard.id) return;  
              
            try {  
                var video = $('video').get(0);  
                if (!video || !video.currentTime) return;  
                  
                var time = Math.floor(video.currentTime);  
                if (time < 1) return;  
                  
                var data = Lampa.Storage.get('cp_' + currentCard.id);  
                if (data && data.url) {  
                    data.position = time;  
                    Lampa.Storage.set('cp_' + currentCard.id, data);  
                }  
            } catch(e) {}  
        }, 1000);  
          
        Lampa.Listener.follow('player', function(e) {  
            if (e.type === 'destroy' || e.type === 'stop') {  
                if (timeTracker) {  
                    clearInterval(timeTracker);  
                    timeTracker = null;  
                }  
            }  
        });  
    }  
      
    function watchForVideo() {  
        var checkInterval = setInterval(function() {  
            var video = $('video').get(0);  
              
            if (video && resumePosition > 0) {  
                clearInterval(checkInterval);  
                  
                var trySeek = function() {  
                    if (video.readyState >= 2 && video.duration > 0) {  
                        video.currentTime = resumePosition;  
                        resumePosition = 0;  
                    } else {  
                        setTimeout(trySeek, 500);  
                    }  
                };  
                  
                setTimeout(trySeek, 2000);  
            }  
        }, 100);  
          
        setTimeout(function() {  
            clearInterval(checkInterval);  
        }, 10000);  
    }  
      
    function addButton(card) {  
        try {  
            var data = Lampa.Storage.get('cp_' + card.id);  
            if (!data || !data.url || !data.position || data.position < 10) return;  
              
            $('.cp-resume-btn').remove();  
              
            var m = Math.floor(data.position / 60);  
            var s = data.position % 60;  
            var time = ' (' + m + ':' + (s < 10 ? '0' : '') + s + ')';  
              
            var btn = $('<div class="full-start__button selector cp-resume-btn">' +  
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">' +  
                '<path d="M8 5v14l11-7z"/></svg>' +  
                '<span>' + t.button + time + '</span></div>');  
              
            btn.on('hover:enter', function() {  
                isResuming = true;  
                resumePosition = data.position;  
                watchForVideo();  
                  
                Lampa.Player.play({  
                    url: data.url,  
                    title: data.title,  
                    card: card  
                });  
                  
                setTimeout(function() {  
                    isResuming = false;  
                }, 2000);  
            });  
              
            var container = $('.full-start-new__buttons');  
            if (container.length > 0) {  
                container.prepend(btn);  
                Lampa.Controller.enable('content');  
            }  
        } catch(e) {}  
    }  
})();
