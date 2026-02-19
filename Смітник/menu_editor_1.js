/**
 * Lampa Menu Editor Plus
 * 
 * Расширенный редактор меню для приложения Lampa с дополнительными кнопками
 * 
 * ФУНКЦИОНАЛ:
 * 1. Редактирование главного (левого) меню - сортировка и скрытие пунктов
 * 2. Редактирование верхнего меню - сортировка и скрытие иконок
 * 3. Редактирование меню настроек - сортировка и скрытие разделов
 * 4. Дополнительные кнопки в верхнем меню:
 *    - Очистка кеша
 *    - Перезагрузка приложения
 *    - Консоль разработчика
 *    - Выход из приложения (с поддержкой всех платформ)
 * 5. Скрытие нижней панели навигации на телефонах
 * 
 * ВЕРСИЯ: 2.0 (расширенная)
 */

(function() {    
    'use strict'    
    
    function startPlugin() {    
        window.plugin_menu_editor_ready = true    
    
        function initialize() {    
            // Добавляем переводы
            Lampa.Lang.add({    
                menu_editor_title: {    
                    ru: 'Редактирование меню',    
                    uk: 'Редагування меню',    
                    en: 'Menu Editor'    
                },    
                menu_editor_left: {    
                    ru: 'Главное меню',    
                    uk: 'Головне меню',    
                    en: 'Main Menu'    
                },    
                menu_editor_top: {    
                    ru: 'Верхнее меню',    
                    uk: 'Верхнє меню',    
                    en: 'Top Menu'    
                },    
                menu_editor_settings: {    
                    ru: 'Меню настроек',    
                    uk: 'Меню налаштувань',    
                    en: 'Settings Menu'    
                },    
                menu_editor_hide_nav: {    
                    ru: 'Скрыть панель навигации',    
                    uk: 'Приховати панель навігації',    
                    en: 'Hide Navigation Bar'    
                },    
                menu_editor_add_clear_cache_button: {    
                    ru: 'Добавить кнопку очистки кеша в верхнее меню',    
                    uk: 'Додати кнопку очищення кешу у верхнє меню',    
                    en: 'Add clear cache button to top menu'    
                },
                // Переводы для дополнительных кнопок
                head_action_reload: {    
                    ru: 'Перезагрузка',    
                    uk: 'Перезавантаження',    
                    en: 'Reload',
                    be: 'Перазагрузка'
                },
                head_action_console: {    
                    ru: 'Консоль',    
                    uk: 'Консоль',    
                    en: 'Console',
                    be: 'Кансоль'
                },
                head_action_exit: {    
                    ru: 'Выход',    
                    uk: 'Вихід',    
                    en: 'Exit',
                    be: 'Выхад'
                },
                // Заголовок секции дополнительных кнопок
                menu_editor_extra_buttons: {    
                    ru: 'Дополнительные кнопки',    
                    uk: 'Додаткові кнопки',    
                    en: 'Extra Buttons'
                },
                menu_editor_add_reload_button: {    
                    ru: 'Добавить кнопку перезагрузки',    
                    uk: 'Додати кнопку перезавантаження',    
                    en: 'Add reload button'
                },
                menu_editor_add_console_button: {    
                    ru: 'Добавить кнопку консоли',    
                    uk: 'Додати кнопку консолі',    
                    en: 'Add console button'
                },
                menu_editor_add_exit_button: {    
                    ru: 'Добавить кнопку выхода',    
                    uk: 'Додати кнопку виходу',    
                    en: 'Add exit button'
                },
                // Стандартные переводы для верхнего меню
                head_action_clear_cache: {    
                    ru: 'Очистить кеш',    
                    uk: 'Очистити кеш',    
                    en: 'Clear cache'    
                },    
                head_action_search: {    
                    ru: 'Поиск',    
                    en: 'Search',    
                    uk: 'Пошук',    
                    zh: '搜索'    
                },    
                head_action_feed: {    
                    ru: 'Лента',    
                    en: 'Feed',    
                    uk: 'Стрічка',    
                    zh: '动态'    
                },    
                head_action_notice: {    
                    ru: 'Уведомления',    
                    en: 'Notifications',    
                    uk: 'Сповіщення',    
                    zh: '通知'    
                },    
                head_action_settings: {    
                    ru: 'Настройки',    
                    en: 'Settings',    
                    uk: 'Налаштування',    
                    zh: '设置'    
                },    
                head_action_profile: {    
                    ru: 'Профиль',    
                    en: 'Profile',    
                    uk: 'Профіль',    
                    zh: '个人资料'    
                },    
                head_action_fullscreen: {    
                    ru: 'Полный экран',    
                    en: 'Fullscreen',    
                    uk: 'Повноекранний режим',    
                    zh: '全屏'    
                },    
                head_action_broadcast: {    
                    ru: 'Трансляции',    
                    en: 'Broadcast',    
                    uk: 'Трансляції',    
                    zh: '直播'    
                },    
                no_name: {    
                    ru: 'Элемент без названия',    
                    en: 'Unnamed element',    
                    uk: 'Елемент без назви',    
                    zh: '未命名元素'    
                }    
            })    

            /**
             * Создание дополнительных кнопок (перезагрузка, консоль, выход)
             * Кнопки создаются только если они включены в настройках
             */
            function createExtraButtons() {
                // SVG иконки для новых кнопок
                const reloadSVG = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"/></svg>';
                
                const consoleSVG = '<svg width="30" height="30" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M877.685565 727.913127l-0.584863-0.365539a32.898541 32.898541 0 0 1-8.041866-46.423497 411.816631 411.816631 0 1 0-141.829267 145.777092c14.621574-8.992268 33.62962-5.117551 43.645398 8.772944l0.146216 0.073108a30.412874 30.412874 0 0 1-7.968758 43.206751l-6.141061 4.020933a475.201154 475.201154 0 1 1 163.615412-164.419599 29.974227 29.974227 0 0 1-42.841211 9.357807z m-537.342843-398.584106c7.164571-7.091463 24.71046-9.650239 33.26408 0 10.600641 11.185504 7.164571 29.462472 0 37.138798l-110.612207 107.468569L370.901811 576.14119c7.164571 7.091463 8.114974 27.342343 0 35.384209-9.796455 9.723347-29.828011 8.188081-36.480827 1.535265L208.309909 487.388236a18.423183 18.423183 0 0 1 0-25.953294l132.032813-132.032813z m343.314556 0l132.032813 132.032813a18.423183 18.423183 0 0 1 0 25.953294L689.652124 613.133772c-6.652816 6.579708-25.587754 10.746857-36.553935 0-10.30821-10.235102-7.091463-31.290168 0-38.381632l108.345863-100.669537-111.855041-108.638294c-7.164571-7.676326-9.504023-26.611265 0-36.04218 9.284699-9.138484 26.903696-7.091463 34.068267 0z m-135.54199-26.318833c3.582286-9.504023 21.347498-15.498868 32.679217-11.258612 10.819965 4.020933 17.180349 19.008046 14.256035 28.512069l-119.896906 329.716493c-3.509178 9.504023-20.616419 13.305632-30.193551 9.723347-10.161994-3.509178-21.201282-17.545889-17.545888-26.976804l120.627985-329.716493z" fill="currentColor"/></svg>';
                
                const exitSVG = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" fill="currentColor"/></svg>';

                // Кнопка перезагрузки
                if (Lampa.Storage.get('add_reload_button', false)) {
                    let reloadBtn = Lampa.Head.addIcon(reloadSVG, () => {
                        location.reload();
                    });
                    reloadBtn.addClass('head__action head__action--reload');
                }

                // Кнопка консоли
                if (Lampa.Storage.get('add_console_button', false)) {
                    let consoleBtn = Lampa.Head.addIcon(consoleSVG, () => {
                        try { 
                            Lampa.Controller.toggle('console'); 
                        } catch (e) {}
                    });
                    consoleBtn.addClass('head__action head__action--console');
                }

                // Кнопка выхода с поддержкой всех платформ
                if (Lampa.Storage.get('add_exit_button', false)) {
                    let exitBtn = Lampa.Head.addIcon(exitSVG, () => {
                        try {
                            Lampa.Activity.out();
                            if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
                            if (Lampa.Platform.is('webos')) window.close();
                            if (Lampa.Platform.is('android')) Lampa.Android.exit();
                            if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
                        } catch (e) {}
                    });
                    exitBtn.addClass('head__action head__action--exit');
                }
            }

            /**
             * Применение настроек левого меню
             * Сортировка и скрытие пунктов главного меню
             */
            function applyLeftMenu() {    
                let sort = Lampa.Storage.get('menu_sort', [])    
                let hide = Lampa.Storage.get('menu_hide', [])    
    
                let menu = $('.menu')    
                if(!menu.length) return    
    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = menu.find('.menu__list:eq(0) .menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) item.appendTo(menu.find('.menu__list:eq(0)'))    
                    })    
                }    
    
                $('.menu .menu__item').removeClass('hidden')    
    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.menu .menu__list').find('.menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) {    
                            item.addClass('hidden')    
                        }    
                    })    
                }    
            }    
    
            /**
             * Применение настроек верхнего меню
             * Сортировка, скрытие и создание дополнительных кнопок
             */
            function applyTopMenu() {    
                let sort = Lampa.Storage.get('head_menu_sort', [])    
                let hide = Lampa.Storage.get('head_menu_hide', [])    
    
                let actionsContainer = $('.head__actions')    
                if(!actionsContainer.length) return    
    
                // Удаляем все старые кастомные кнопки перед обновлением
                $('.head__action.head__action--clear-cache').remove()    
                $('.head__action.head__action--reload').remove()
                $('.head__action.head__action--console').remove()
                $('.head__action.head__action--exit').remove()
    
                // Создаём кнопку очистки кэша если нужно
                if (Lampa.Storage.get('add_clear_cache_button', false)) {    
                    let cacheBtn = Lampa.Head.addIcon(    
                        `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">    
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>    
                        </svg>`,    
                        () => {    
                            Lampa.Storage.clear(false)    
                            Lampa.Cache.clearAll()    
                            Lampa.Noty.show(Lampa.Lang.translate('settings_clear_cache_only'))    
                        }    
                    )    
                    cacheBtn.addClass('head__action head__action--clear-cache')    
                }

                // Создаём дополнительные кнопки
                createExtraButtons()
    
                // Собираем все элементы для сортировки
                let elements = {};
                actionsContainer.find('.head__action').each(function() {
                    let $el = $(this);
                    let classes = $el.attr('class').split(' ');
                    let uniqueClass = classes.find(c =>     
                        c.startsWith('open--') ||     
                        c.startsWith('notice--') ||     
                        c.startsWith('full--') ||  
                        c === 'head__action--clear-cache' ||
                        c === 'head__action--reload' ||
                        c === 'head__action--console' ||
                        c === 'head__action--exit'
                    );
                    if (uniqueClass) {
                        elements[uniqueClass] = $el;
                    }
                });

                // Применяем сортировку если она есть
                if (sort.length > 0) {
                    sort.forEach((className) => {
                        if (elements[className]) {
                            actionsContainer.append(elements[className]);
                            delete elements[className];
                        }
                    });
                    
                    // Добавляем новые элементы в конец
                    Object.keys(elements).forEach(className => {
                        actionsContainer.append(elements[className]);
                    });
                }

                // Применяем скрытие элементов
                $('.head__action').removeClass('hide');
                if (hide.length) {    
                    hide.forEach((uniqueClass) => {    
                        let item = $('.head__action.' + uniqueClass)    
                        if(item.length) item.addClass('hide');
                    });
                }
            }

            /**
             * Применение настроек меню настроек
             * Сортировка и скрытие разделов в настройках
             */
            function applySettingsMenu() {    
                let sort = Lampa.Storage.get('settings_menu_sort', [])    
                let hide = Lampa.Storage.get('settings_menu_hide', [])    
    
                let settingsContainer = $('.settings .scroll__body > div')    
                if(!settingsContainer.length) return    
    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.appendTo(settingsContainer)    
                    })    
                }    
    
                $('.settings-folder').removeClass('hide')    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.addClass('hide')    
                    })    
                }    
            }    
    
            /**
             * Получение названия пункта верхнего меню по его классу
             * @param {string} mainClass - CSS класс элемента
             * @returns {string} - Локализованное название
             */
            function getHeadActionName(mainClass) {    
                let titleKey = '';    
    
                if (mainClass.includes('open--search')) {    
                    titleKey = 'head_action_search';    
                } else if (mainClass.includes('open--feed')) {    
                    titleKey = 'head_action_feed';    
                } else if (mainClass.includes('notice--')) {    
                    titleKey = 'head_action_notice';    
                } else if (mainClass.includes('open--settings')) {    
                    titleKey = 'head_action_settings';    
                } else if (mainClass.includes('open--profile')) {    
                    titleKey = 'head_action_profile';    
                } else if (mainClass.includes('full--screen')) {    
                    titleKey = 'head_action_fullscreen';    
                } else if (mainClass.includes('open--broadcast')) {    
                    titleKey = 'head_action_broadcast';    
                } else if (mainClass === 'head__action--clear-cache') {    
                    titleKey = 'head_action_clear_cache';    
                } else if (mainClass === 'head__action--reload') {    
                    titleKey = 'head_action_reload';
                } else if (mainClass === 'head__action--console') {    
                    titleKey = 'head_action_console';
                } else if (mainClass === 'head__action--exit') {    
                    titleKey = 'head_action_exit';
                }    
    
                return titleKey ? Lampa.Lang.translate(titleKey) : Lampa.Lang.translate('no_name');    
            }    
    
            /**
             * Открытие редактора левого меню
             */
            function editLeftMenu() {    
                let list = $('<div class="menu-edit-list"></div>')    
                let menu = $('.menu')    
    
                menu.find('.menu__item').each(function(){    
                    let item_orig = $(this)    
                    let item_clone = $(this).clone()    
                    let text = item_clone.find('.menu__text').text().trim()    
                    let isFirstSection = item_orig.closest('.menu__list').is('.menu__list:eq(0)')    
                        
                    let moveButtons = isFirstSection ? `    
                        <div class="menu-edit-list__move move-up selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__move move-down selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>` : '';    
    
                    let item_sort = $(`<div class="menu-edit-list__item">    
                        <div class="menu-edit-list__icon"></div>    
                        <div class="menu-edit-list__title">${text}</div>    
                        ${moveButtons}    
                        <div class="menu-edit-list__toggle toggle selector">    
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>    
                                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                    </div>`)    
    
                    item_sort.find('.menu-edit-list__icon').append(item_clone.find('.menu__ico').html())    
    
                    if(isFirstSection) {    
                        item_sort.find('.move-up').on('hover:enter', ()=>{    
                            let prev = item_sort.prev()    
                            while(prev.length && prev.data('isSecondSection')) {    
                                prev = prev.prev()    
                            }    
                            if(prev.length){    
                                item_sort.insertBefore(prev)    
                                item_orig.insertBefore(item_orig.prev())    
                            }    
                        })    
    
                        item_sort.find('.move-down').on('hover:enter', ()=>{    
                            let next = item_sort.next()    
                            while(next.length && next.data('isSecondSection')) {    
                                next = next.next()    
                            }    
                            if(next.length){    
                                item_sort.insertAfter(next)    
                                item_orig.insertAfter(item_orig.next())    
                            }    
                        })    
                    } else {    
                        item_sort.data('isSecondSection', true)    
                    }    
    
                    item_sort.find('.toggle').on('hover:enter', ()=>{    
                        item_orig.toggleClass('hidden')    
                        item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)    
                    }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)    
    
                    list.append(item_sort)    
                })    
    
                Lampa.Modal.open({    
                    title: Lampa.Lang.translate('menu_editor_left'),    
                    html: list,    
                    size: 'small',    
                    scroll_to_center: true,    
                    onBack: ()=>{    
                        saveLeftMenu()    
                        Lampa.Modal.close()    
                        Lampa.Controller.toggle('settings_component')    
                    }    
                })    
            }    
    
            /**
             * Открытие редактора верхнего меню
             */
            function editTopMenu() {    
                let list = $('<div class="menu-edit-list"></div>');    
                let actionsContainer = $('.head__actions');    
                let items = [];    
                    
                // Получаем сохраненные настройки
                let savedSort = Lampa.Storage.get('head_menu_sort', []);    
                let savedHide = Lampa.Storage.get('head_menu_hide', []);    
                    
                // Собираем все кнопки из DOM
                actionsContainer.find('.head__action').each(function(){    
                    let item_orig = $(this);    
                        
                    let allClasses = item_orig.attr('class').split(' ');    
                    let mainClass = allClasses.find(c =>     
                        c.startsWith('open--') ||     
                        c.startsWith('notice--') ||     
                        c.startsWith('full--') ||
                        c === 'head__action--clear-cache' ||
                        c === 'head__action--reload' ||
                        c === 'head__action--console' ||
                        c === 'head__action--exit'
                    ) || '';    
                        
                    let displayName = getHeadActionName(mainClass);    
                        
                    items.push({    
                        element: item_orig,    
                        class: mainClass,    
                        displayName: displayName,    
                        svg: item_orig.find('svg').clone(),    
                        isHidden: item_orig.hasClass('hide')
                    });    
                });    
                    
                // Сортируем согласно сохраненному порядку
                if (savedSort.length > 0) {    
                    let sortedItems = [];    
                    savedSort.forEach(className => {    
                        let foundItem = items.find(item => item.class === className);    
                        if (foundItem) {    
                            sortedItems.push(foundItem);    
                        }    
                    });    
                    // Новые элементы добавляем в конец
                    items.forEach(item => {    
                        if (!savedSort.includes(item.class)) {    
                            sortedItems.push(item);    
                        }    
                    });    
                    items = sortedItems;    
                }    
                    
                // Создаем элементы редактора
                items.forEach((item, index) => {    
                    let item_sort = $(`<div class="menu-edit-list__item" data-class="${item.class}" data-index="${index}">    
                        <div class="menu-edit-list__icon"></div>    
                        <div class="menu-edit-list__title">${item.displayName}</div>    
                        <div class="menu-edit-list__move move-up selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__move move-down selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__toggle toggle selector">    
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                            </svg>  
                        </div>  
                    </div>`);    
                        
                    item_sort.find('.menu-edit-list__icon').append(item.svg.clone());    
                        
                    // Устанавливаем состояние видимости
                    let isHidden = item.isHidden;
                    item_sort.find('.dot').attr('opacity', isHidden ? 0 : 1);    
                        
                    // Обработчик перемещения вверх
                    item_sort.find('.move-up').on('hover:enter', function() {    
                        let current = item_sort;    
                        let prev = current.prev();    
                        if(prev.length) {    
                            current.insertBefore(prev);    
                                
                            let currentClass = current.data('class');    
                            let prevClass = prev.data('class');    
                            let currentEl = $('.head__action.' + CSS.escape(currentClass));    
                            let prevEl = $('.head__action.' + CSS.escape(prevClass));    
                            
                            if (currentEl.length && prevEl.length) {    
                                currentEl.insertBefore(prevEl);    
                            }
                        }    
                    });    
                        
                    // Обработчик перемещения вниз
                    item_sort.find('.move-down').on('hover:enter', function() {    
                        let current = item_sort;    
                        let next = current.next();    
                        if(next.length) {    
                            current.insertAfter(next);    
                                
                            let currentClass = current.data('class');    
                            let nextClass = next.data('class');    
                            let currentEl = $('.head__action.' + CSS.escape(currentClass));    
                            let nextEl = $('.head__action.' + CSS.escape(nextClass));    
                            
                            if (currentEl.length && nextEl.length) {    
                                currentEl.insertAfter(nextEl);    
                            }
                        }    
                    });    
                        
                    // Обработчик переключения видимости
                    item_sort.find('.toggle').on('hover:enter', function() {    
                        let className = item_sort.data('class');    
                        let targetElement = $('.head__action.' + CSS.escape(className));    
                        
                        if (targetElement.length) {    
                            targetElement.toggleClass('hide');    
                            item_sort.find('.dot').attr('opacity', targetElement.hasClass('hide') ? 0 : 1);    
                        } else {
                            let currentOpacity = item_sort.find('.dot').attr('opacity');
                            item_sort.find('.dot').attr('opacity', currentOpacity === '1' ? 0 : 1);
                        }
                    });    
                        
                    list.append(item_sort);    
                });    
                    
                Lampa.Modal.open({    
                    title: Lampa.Lang.translate('menu_editor_top'),    
                    html: list,    
                    size: 'small',    
                    scroll_to_center: true,    
                    onBack: ()=>{    
                        saveTopMenu();    
                        Lampa.Modal.close();    
                        Lampa.Controller.toggle('settings_component');    
                    }    
                });
            }  
    
            /**
             * Открытие редактора меню настроек
             */
            function editSettingsMenu() {  
                Lampa.Controller.toggle('settings');    
                setTimeout(()=>{  
                    let settings = $('.settings');    
                    if(!settings.length || !settings.find('.settings-folder').length){    
                        Lampa.Noty.show('Меню настроек еще не загружено');    
                        return;    
                    }    
                    let list = $('<div class="menu-edit-list"></div>');    
                    settings.find('.settings-folder').each(function(){    
                        let item_orig = $(this);    
                        let item_clone = $(this).clone();    
                        let name = item_clone.find('.settings-folder__name').text().trim();    
                        let item_sort = $(`<div class="menu-edit-list__item">    
                            <div class="menu-edit-list__icon"></div>    
                            <div class="menu-edit-list__title">${name}</div>    
                            <div class="menu-edit-list__move move-up selector">    
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                    <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                                </svg>    
                            </div>    
                            <div class="menu-edit-list__move move-down selector">    
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                    <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                                </svg>    
                            </div>    
                            <div class="menu-edit-list__toggle toggle selector">    
                                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                    <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                    <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                        </div>`);    
                        let icon = item_clone.find('.settings-folder__icon svg, .settings-folder__icon img');    
                        if(icon.length) {    
                            item_sort.find('.menu-edit-list__icon').append(icon.clone());    
                        }    
                        item_sort.find('.move-up').on('hover:enter', ()=>{    
                            let prev = item_sort.prev();    
                            if(prev.length){    
                                item_sort.insertBefore(prev);    
                                item_orig.insertBefore(item_orig.prev());    
                            }    
                        });    
                        item_sort.find('.move-down').on('hover:enter', ()=>{    
                            let next = item_sort.next();    
                            if(next.length){    
                                item_sort.insertAfter(next);    
                                item_orig.insertAfter(item_orig.next());    
                            }    
                        });    
                        item_sort.find('.toggle').on('hover:enter', ()=>{    
                            item_orig.toggleClass('hide');    
                            item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1);    
                        }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1);    
                        list.append(item_sort);    
                    });    
                    Lampa.Modal.open({    
                        title: Lampa.Lang.translate('menu_editor_settings'),    
                        html: list,    
                        size: 'small',    
                        scroll_to_center: true,    
                        onBack: ()=>{    
                            saveSettingsMenu();    
                            Lampa.Modal.close();    
                            Lampa.Controller.toggle('settings_component');    
                        }    
                    });    
                }, 300);    
            }    
    
            /**
             * Сохранение настроек левого меню
             */
            function saveLeftMenu() {    
                let sort = [];    
                let hide = [];    
    
                $('.menu .menu__list:eq(0) .menu__item').each(function(){    
                    let name = $(this).find('.menu__text').text().trim();    
                    sort.push(name);    
                });    
    
                $('.menu .menu__item').each(function(){    
                    if($(this).hasClass('hidden')){    
                        let name = $(this).find('.menu__text').text().trim();    
                        hide.push(name);    
                    }    
                });    
    
                Lampa.Storage.set('menu_sort', sort);    
                Lampa.Storage.set('menu_hide', hide);    
            }    
    
            /**
             * Сохранение настроек верхнего меню
             */
            function saveTopMenu() {    
                let sort = [];    
                let hide = [];    
    
                // Собираем порядок из редактора
                $('.menu-edit-list .menu-edit-list__item').each(function(){    
                    let className = $(this).data('class');    
                    if (className) {    
                        sort.push(className);    
                        
                        let isVisible = $(this).find('.dot').attr('opacity') === '1';
                        if (!isVisible) {    
                            hide.push(className);    
                        }    
                    }    
                });    
    
                // Если редактор не открыт, читаем из DOM
                if (sort.length === 0) {
                    $('.head__action').each(function(){    
                        let classes = $(this).attr('class').split(' ');    
                        let uniqueClass = classes.find(c =>     
                            c.startsWith('open--') ||     
                            c.startsWith('notice--') ||     
                            c.startsWith('full--') ||  
                            c === 'head__action--clear-cache' ||
                            c === 'head__action--reload' ||
                            c === 'head__action--console' ||
                            c === 'head__action--exit'
                        );    
                        if(uniqueClass) {    
                            sort.push(uniqueClass);    
                            if($(this).hasClass('hide')){    
                                hide.push(uniqueClass);    
                            }    
                        }    
                    });
                }

                Lampa.Storage.set('head_menu_sort', sort);    
                Lampa.Storage.set('head_menu_hide', hide);    
            }    
    
            /**
             * Сохранение настроек меню настроек
             */
            function saveSettingsMenu() {    
                let sort = [];    
                let hide = [];    
    
                $('.settings-folder').each(function(){    
                    let name = $(this).find('.settings-folder__name').text().trim();    
                    sort.push(name);    
                    if($(this).hasClass('hide')){    
                        hide.push(name);    
                    }    
                });    
    
                Lampa.Storage.set('settings_menu_sort', sort);    
                Lampa.Storage.set('settings_menu_hide', hide);    
            }    
    
            /**
             * Добавление настроек плагина в интерфейс Lampa
             */
            function addSettings() {    
                Lampa.SettingsApi.addComponent({    
                    component: 'menu_editor',    
                    icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">    
                        <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>  
                    </svg>`,    
                    name: Lampa.Lang.translate('menu_editor_title')    
                });    
    
                // Основные редакторы меню
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'edit_left_menu',    
                        type: 'button',    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_left'),    
                    },    
                    onChange: editLeftMenu    
                });    
    
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'edit_top_menu',    
                        type: 'button',    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_top'),    
                    },    
                    onChange: editTopMenu    
                });    
    
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'edit_settings_menu',    
                        type: 'button',    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_settings'),    
                    },    
                    onChange: editSettingsMenu    
                });    

                // Секция дополнительных кнопок
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'extra_buttons_header',    
                        type: 'title',
                        default: 'Дополнительные кнопки'
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_extra_buttons'),    
                    }    
                });
    
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'add_clear_cache_button',    
                        type: 'trigger',    
                        default: false    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_add_clear_cache_button'),    
                        description: 'Добавляет кнопку очистки кеша в верхнее меню'    
                    },    
                    onChange: function(value) {    
                        setTimeout(applyTopMenu, 100);    
                    }    
                });

                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'add_reload_button',    
                        type: 'trigger',    
                        default: false    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_add_reload_button'),    
                        description: 'Добавляет кнопку перезагрузки в верхнее меню'    
                    },    
                    onChange: function(value) {    
                        setTimeout(applyTopMenu, 100);    
                    }    
                });

                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'add_console_button',    
                        type: 'trigger',    
                        default: false    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_add_console_button'),    
                        description: 'Добавляет кнопку консоли в верхнее меню'    
                    },    
                    onChange: function(value) {    
                        setTimeout(applyTopMenu, 100);    
                    }    
                });

                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'add_exit_button',    
                        type: 'trigger',    
                        default: false    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_add_exit_button'),    
                        description: 'Добавляет кнопку выхода в верхнее меню'    
                    },    
                    onChange: function(value) {    
                        setTimeout(applyTopMenu, 100);    
                    }    
                });
    
                // Опция скрытия навигационной панели
                Lampa.SettingsApi.addParam({    
                    component: 'menu_editor',    
                    param: {    
                        name: 'hide_navigation_bar',    
                        type: 'trigger',    
                        default: false    
                    },    
                    field: {    
                        name: Lampa.Lang.translate('menu_editor_hide_nav'),    
                        description: 'Скрывает нижнюю панель навигации на телефоне'    
                    },    
                    onChange: function(value) {    
                        if (Lampa.Storage.field('hide_navigation_bar') == true) {    
                            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');    
                            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));    
                        }    
                        if (Lampa.Storage.field('hide_navigation_bar') == false) {    
                            $('#hide_nav_bar').remove();    
                        }    
                    }    
                });    
    
                // Применяем скрытие навигации при загрузке если включено
                if (Lampa.Storage.field('hide_navigation_bar') == true) {    
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');    
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));    
                }    
            }    
    
            // Инициализация настроек
            addSettings();    
    
            // Применяем настройки при загрузке приложения
            setTimeout(() => {    
                applyLeftMenu();    
                setTimeout(applyTopMenu, 300);    
            }, 500);    
    
            // Слушатели событий для применения настроек
            Lampa.Listener.follow('menu', (e) => {    
                if(e.type === 'end') {    
                    setTimeout(applyLeftMenu, 200);    
                }    
            });    
    
            Lampa.Listener.follow('activity', (e) => {    
                if(e.type === 'start' && e.component === 'settings') {    
                    setTimeout(applySettingsMenu, 500);    
                }    
            });    
    
            if(Lampa.Settings && Lampa.Settings.listener) {    
                Lampa.Settings.listener.follow('open', (e) => {    
                    setTimeout(applySettingsMenu, 300);    
                });    
            }    
        }    
    
        // Запуск плагина после готовности приложения
        if(window.appready) initialize();    
        else {    
            Lampa.Listener.follow('app', function (e) {    
                if (e.type == 'ready') initialize();    
            });    
        }    
    }    
    
    // Предотвращение повторной инициализации
    if(!window.plugin_menu_editor_ready) startPlugin();    
})();