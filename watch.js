(function() {
    'use strict';

    Lampa.Listener.follow('full', function(e) {
        if (e.type == 'complite') {
			setTimeout(function(){
				$(".view--online",Lampa.Activity.active().activity.render()).empty().append("<svg width='28' height='29' viewBox='0 0 28 29' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='14' cy='14.5' r='13' stroke='currentColor' stroke-width='2.7'></circle><path d='M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z' fill='currentColor'></path></svg><span>Смотреть</span>");
				$(".view--online_mod",Lampa.Activity.active().activity.render()).empty().append("<svg width='28' height='29' viewBox='0 0 28 29' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='14' cy='14.5' r='13' stroke='currentColor' stroke-width='2.7'></circle><path d='M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z' fill='currentColor'></path></svg><span>Смотреть</span>");
				$(".button--play",Lampa.Activity.active().activity.render()).css({'display':'none'});
			},10);
	   }
    })
})();
