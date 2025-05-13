var LampaPlugin;
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./t2/index.js ***!
  \*********************/
(function () {
  function init() {
    console.log('init called');
    Lampa.Lang.add({
      upcoming_in_theaters: {
        ru: 'В кинотеатрах',
        uk: 'У кінотеатрах',
        en: 'In Theaters',
        be: 'У кiнатэатрах',
        zh: '影院上映',
        pt: 'Nos Cinemas'
      },
      upcoming_upcoming: {
        ru: 'Скоро',
        uk: 'Незабаром',
        en: 'Upcoming',
        be: 'Хутка',
        zh: '即将上映',
        pt: 'Em Breve'
      },
      upcoming_series_new: {
        ru: 'Новые сезоны',
        uk: 'Нові сезони',
        en: 'New Seasons',
        be: 'Новыя сезоны',
        zh: '新季',
        pt: 'Novas Temporadas'
      },
      upcoming_series_upcoming: {
        ru: 'Скоро сериалы',
        uk: 'Незабаром серіали',
        en: 'Upcoming Series',
        be: 'Хутка серыялы',
        zh: '即将推出的系列',
        pt: 'Séries em Breve'
      },
      upcoming_popular: {
        ru: 'Популярное',
        uk: 'Популярне',
        en: 'Popular',
        be: 'Папулярнае',
        zh: '热门',
        pt: 'Popular'
      },
      upcoming_empty: {
        ru: 'Здесь пусто',
        uk: 'Тут порожньо',
        en: 'Nothing here',
        be: 'Тут пустэча',
        zh: '这里什么也没有',
        pt: 'Nada aqui'
      },
      title_upcoming: {
        ru: 'Скоро',
        uk: 'Незабаром',
        en: 'Upcoming',
        be: 'Хутка',
        zh: '即将上映',
        pt: 'Em Breve'
      }
    });
    Lampa.Plugin.add({
      url: '',
      title: Lampa.Lang.translate('title_upcoming'),
      icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
      in_menu: true,
      in_cub: true,
      status: 1,
      start: function () {
        console.log('Plugin start triggered');
        Lampa.Activity.push({
          url: '',
          title: Lampa.Lang.translate('title_upcoming'),
          component: 'upcoming',
          page: 1
        });
      }
    });
    window.plugin_upcoming.ready();
  }
  function ready() {
    console.log('ready called');
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'app_ready') {
        console.log('Lampa app ready');
      }
    });
    window.plugin_upcoming.templates();
  }
  window.plugin_upcoming = window.plugin_upcoming || {};
  window.plugin_upcoming.init = init;
  window.plugin_upcoming.ready = ready;
  init();
})();
LampaPlugin = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=t2.js.map