(function () {
  'use strict';
	
function add() {
  
  var elementUA = $('.selectbox-item.selector > div:contains("Русский")');
  if(elementUA.length > 0) elementUA.parent('div').hide();
//  Lampa.Storage.set('keyboard_default_lang', 'uk-UA')
  var elementXZ = $('.selectbox-item.selector > div:contains("עִברִית")');
  if(elementXZ.length > 0) elementXZ.parent('div').hide();
}

setInterval(function() {
  var elementCHlang = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded')
  if (elementCHlang.length > 0){
    var elementUA = $('.selectbox-item.selector > div:contains("Русский")');
    if(elementUA.length > 0) elementUA.parent('div').hide();
//    Lampa.Storage.set('keyboard_default_lang', 'uk-UA')
    var elementXZ = $('.selectbox-item.selector > div:contains("עִברִית")');
    if(elementXZ.length > 0) elementXZ.parent('div').hide();
  }
 }, 0)

if(window.appready) add();
  else {
    Lampa.Listener.follow('app', function(e) {
      if(e.type == 'ready') {
        add();
      }
    });
  }
})();

