(function () {
  'use strict';
	
function add() {
  Lampa.Storage.set('keyboard_default_lang', 'default')
  var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
  if(elementUA.length > 0) elementUA.parent('div').hide();
  Lampa.Storage.set('keyboard_default_lang', 'default')
  var elementXZ = $('.selectbox-item.selector > div:contains("עִברִית")');
  if(elementXZ.length > 0) elementXZ.parent('div').hide();
}

setInterval(function() {
  var elementCHlang = $('div.hg-button.hg-functionBtn.hg-button-LANG.selector.binded')
  if (elementCHlang.length > 0){
    Lampa.Storage.set('keyboard_default_lang', 'default')
    var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
    if(elementUA.length > 0) elementUA.parent('div').hide();
    Lampa.Storage.set('keyboard_default_lang', 'default')
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

