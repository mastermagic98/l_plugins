(function() {            
    'use strict';            
            
    function startPlugin() {            
        window.plugin_menu_editor_ready = true        
                
        function initialize() {        
            // Проверка версии и добавление стилей        
            try {        
                const lampaVersion = Lampa.Manifest ? Lampa.Manifest.app_digital : 0        
                const needsIconFix = lampaVersion < 300
                        
                if (needsIconFix) {        
                    const iconStyles = `        
                        <style id="menu-editor-icon-fix">        
                            .menu-edit-list__item {        
                                display: flex !important;        
                                padding: 0.3em !important;        
                                border-radius: 0.3em !important;        
                                align-items: center !important;        
                            }        
                                    
                            .menu-edit-list__item:nth-child(even) {        
                                background: rgba(255, 255, 255, 0.1) !important;        
                            }        
                                    
                            .menu-edit-list__icon {        
                                width: 2.4em !important;        
                                height: 2.4em !important;        
                                margin-right: 1em !important;        
                                flex-shrink: 0 !important;        
                                border-radius: 100% !important;        
                                display: flex !important;        
                                align-items: center !important;        
                                justify-content: center !important;        
                            }        
                                    
                            .menu-edit-list__icon > svg,        
                            .menu-edit-list__icon > img {        
                                width: 1.4em !important;        
                                height: 1.4em !important;        
                            }
        
                            .menu-edit-list__title {        
                                font-size: 1.3em !important;        
                                font-weight: 300 !important;        
                                line-height: 1.2 !important;        
                                flex-grow: 1 !important;        
                            }        
                                    
                            .menu-edit-list__move,        
                            .menu-edit-list__toggle {        
                                width: 2.4em !important;        
                                height: 2.4em !important;        
                                display: flex !important;        
                                align-items: center !important;        
                                justify-content: center !important;        
                            }        
                                    
                            .menu-edit-list__move svg {        
                                width: 1em !important;        
                                height: 1em !important;        
                            }        
                                    
                            .menu-edit-list__toggle svg {        
                                width: 1.2em !important;        
                                height: 1.2em !important;        
                            }        
                                    
                            .menu-edit-list__move.focus,        
                            .menu-edit-list__toggle.focus {        
                                background: rgba(255, 255, 255, 1) !important;        
                                border-radius: 0.3em !important;        
                                color: #000 !important;        
                            }        
                        </style>        
                    `        
                    $('head').append(iconStyles)        
                }        
            } catch(e) {        
                console.log('Menu Editor', 'Version check failed:', e)        
            }

            // Добавляем кнопку Расширения
            function addExtensionsButton() {
                // Проверяем, не существует ли уже кнопка
                if ($('#EXTENSIONS').length) return;
                
                var icon_server_extensions = '<svg height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="21" height="21" rx="2" fill="currentColor"></rect><mask id="path-2-inside-1_154:24" fill="currentColor"><rect x="2" y="27" width="17" height="17" rx="2"></rect></mask><rect x="2" y="25" width="17" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="27" y="2" width="17" height="17" rx="2" fill="currentColor"></rect><rect x="27" y="32" width="17" height="3" fill="currentColor"></rect><rect x="34" y="25" width="3" height="17" fill="currentColor"></rect></svg>';
                
                var extensionsBUTT = '<div id="EXTENSIONS" class="head__action selector">' + icon_server_extensions + '</div>';
                
                // Добавляем кнопку в контейнер действий
                $('div.head__action.selector.open--settings').before(extensionsBUTT);
                
                // Добавляем обработчики событий
                $('#EXTENSIONS').on('hover:enter hover:click hover:touch', function() {
                    Lampa.Extensions.show({
                        with_installed: true
                    });
                });
                
                // Добавляем CSS для анимации при наведении
                $('<style>')
                    .prop('type', 'text/css')
                    .html(`
                        #EXTENSIONS:hover svg {
                            transform: scale(1.1);
                            transition: transform 0.3s ease;
                        }
                        #EXTENSIONS svg {
                            transition: transform 0.3s ease;
                        }
                    `)
                    .appendTo('head');
            }
            
            // Добавляем переводы (включая переводы для верхнего меню)    
            Lampa.Lang.add({            
                menu_editor_title: {            
                    ru: 'Редактирование меню',            
                    uk: 'Редагування меню',            
                    en: 'Menu Editor'            
                },            
                menu_editor_left: {            
                    ru: 'Левое меню',            
                    uk: 'Ліве меню',            
                    en: 'Left Menu'            
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
                menu_editor_hide_nav_desc: {
                    ru: 'Скрывает нижнюю панель навигации',
                    uk: 'Приховує нижню панель навігації',
                    en: 'Hides the bottom navigation bar'
                },    
                // Переводы для верхнего меню
                head_action_sources: {    
                    ru: 'Источники',    
                    en: 'Sources',    
                    uk: 'Джерела',    
                    zh: '来源'    
                },    
                head_action_search: {    
                    ru: 'Поиск',    
                    en: 'Search',    
                    uk: 'Пошук',    
                    zh: '搜索'    
                },
                head_action_ai_search: {    
                    ru: 'AI Поиск',    
                    en: 'AI Search',    
                    uk: 'AI Пошук',    
                    zh: 'AI 搜索'    
                },    
                head_action_feed: {    
                    ru: 'Лента',    
                    en: 'Feed',    
                    uk: 'Стрічка',    
                    zh: '动态'    
                },
                head_action_premium: {    
                    ru: 'Премиум',    
                    en: 'Premium',    
                    uk: 'Преміум',    
                    zh: '优质的'    
                },
                head_action_noticescreen: {    
                    ru: 'Уведомления Un',    
                    en: 'Notifications Un',    
                    uk: 'Сповіщення Un',    
                    zh: '通知联合国'    
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
                head_action_extensions: {    
                    ru: 'Расширения',    
                    en: 'Extensions',    
                    uk: 'Розширення',    
                    zh: '擴充'    
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
                head_action_console: {    
                    ru: 'Консоль',    
                    en: 'Console',    
                    uk: 'Консоль',    
                    zh: '控制台'    
                },
                head_action_reload: {    
                    ru: 'Перезагрузка',    
                    en: 'Reload',    
                    uk: 'Перезавантаження',    
                    zh: '重新加载'    
                },
                head_action_exit: {    
                    ru: 'Выход',    
                    en: 'Exit',    
                    uk: 'Вихід',    
                    zh: '退出'    
                },
                head_action_additional_menu: {    
                    ru: 'Дополнительное меню',    
                    en: 'Additional Menu',    
                    uk: 'Додаткове меню',    
                    zh: '附加菜单'    
                },    
                no_name: {    
                    ru: 'Элемент без названия',    
                    en: 'Unnamed element',    
                    uk: 'Елемент без назви',    
                    zh: '未命名元素'    
                }    
            })  
  
            // ИСПРАВЛЕНО: Применение настроек левого меню с улучшенной поддержкой версий 
            function applyLeftMenu() {      
                let sort = Lampa.Storage.get('menu_sort', [])      
                let hide = Lampa.Storage.get('menu_hide', [])      
                    
                // Применяем порядок только к первой секции    
                let firstList = $('.menu .menu__list:eq(0)')    
                    
                if(sort.length) {      
                    sort.forEach((name) => {      
                        let item = firstList.find('.menu__item').filter(function() {      
                            return $(this).find('.menu__text').text().trim() === name      
                        })      
                        if(item.length) item.appendTo(firstList)      
                    })      
                }      
                    
                // ИСПРАВЛЕНИЕ: Применяем скрытие ко всем пунктам меню из обеих секций  
                // Сначала снимаем все скрытия  
                $('.menu .menu__item').removeClass('hidden')      
                  
                if(hide.length) {      
                    hide.forEach((name) => {      
                        // Ищем в обеих секциях отдельно  
                        let item = $('.menu .menu__list').find('.menu__item').filter(function() {      
                            return $(this).find('.menu__text').text().trim() === name      
                        })      
                        if(item.length) {  
                            item.addClass('hidden')  
                            console.log('Menu Editor: Hidden item:', name, item.length)  
                        }  
                    })      
                }  
                  
                // Дополнительная проверка через небольшой таймаут для уверенности  
                setTimeout(() => {  
                    if(hide.length) {      
                        hide.forEach((name) => {      
                            let item = $('.menu .menu__list').find('.menu__item').filter(function() {      
                                return $(this).find('.menu__text').text().trim() === name      
                            })      
                            if(item.length && !item.hasClass('hidden')) {  
                                item.addClass('hidden')  
                                console.log('Menu Editor: Re-applied hidden to:', name)  
                            }  
                        })      
                    }  
                }, 100)  
            }      
      
            // Применение настроек верхнего меню      
            function applyTopMenu() {      
                let sort = Lampa.Storage.get('head_menu_sort', [])      
                let hide = Lampa.Storage.get('head_menu_hide', [])      
                      
                let actionsContainer = $('.head__actions')      
                if(!actionsContainer.length) return      
                      
                if(sort.length) {      
                    sort.forEach((uniqueClass) => {      
                        let item = '';
                        if (uniqueClass === 'MRELOAD' || uniqueClass === 'RELOAD' || uniqueClass === 'EXTENSIONS') {
                            // Ищем по ID
                            item = $('#' + uniqueClass);
                        } else {
                            // Ищем по классу
                            item = $('.head__action.' + uniqueClass);
                        }
                        if(item.length) item.appendTo(actionsContainer)      
                    })      
                }      
          
                $('.head__action').removeClass('hide')      
                if(hide.length) {      
                    hide.forEach((uniqueClass) => {      
                        let item = '';
                        if (uniqueClass === 'MRELOAD' || uniqueClass === 'RELOAD' || uniqueClass === 'EXTENSIONS') {
                            item = $('#' + uniqueClass);
                        } else {
                            item = $('.head__action.' + uniqueClass);
                        }
                        if(item.length) item.addClass('hide')      
                    })      
                }      
            }
      
            // Применение настроек к меню настроек      
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
    
            // Функция для получения названия верхнего меню    
            function getHeadActionName(mainClass, element) {    
                let titleKey = '';

                // Сначала проверяем ID элемента
                let elementId = element.attr('id');
                if (elementId === 'MRELOAD' || elementId === 'RELOAD') {
                    titleKey = 'head_action_reload';
                } else if (elementId === 'EXTENSIONS') {
                    titleKey = 'head_action_extensions';
                }
                // Затем проверяем классы - в порядке специфичности
                else if (mainClass.includes('sources')) {    
                    titleKey = 'head_action_sources';  
                } else if (mainClass.includes('open--search')) {    
                    titleKey = 'head_action_search';
                } else if (mainClass.includes('ai-search')) {    
                    titleKey = 'head_action_ai_search';    
                } else if (mainClass.includes('open--feed')) {    
                    titleKey = 'head_action_feed';
                } else if (mainClass.includes('open--premium')) {    
                    titleKey = 'head_action_premium';
                } else if (mainClass.includes('notice-screen')) {    
                    titleKey = 'head_action_noticescreen';     
                } else if (mainClass.includes('open--notice')) {    
                    titleKey = 'head_action_notice';    
                } else if (mainClass.includes('open--settings')) {    
                    titleKey = 'head_action_settings';    
                } else if (mainClass.includes('open--profile')) {    
                    titleKey = 'head_action_profile';    
                } else if (mainClass.includes('full-screen')) {    
                    titleKey = 'head_action_fullscreen';    
                } else if (mainClass.includes('open--broadcast')) {    
                    titleKey = 'head_action_broadcast';    
                } else if (mainClass.includes('console-screen')) {    
                    titleKey = 'head_action_console';
                } else if (mainClass.includes('reload')) {    
                    titleKey = 'head_action_reload';
                } else if (mainClass.includes('exit')) {    
                    titleKey = 'head_action_exit';
                } else if (mainClass.includes('extensions')) {    
                    titleKey = 'head_action_extensions';    
                } else if (mainClass === 'head__settings') {    
                    titleKey = 'head_action_additional_menu';     
                }      
        
                return titleKey ? Lampa.Lang.translate(titleKey) : Lampa.Lang.translate('no_name');    
            }

            // Функция для редактирования левого меню (Исправлено: удалены стрелочки для второй секции)    
            function editLeftMenu() {          
                let list = $('<div class="menu-edit-list"></div>')          
                let menu = $('.menu')          
                    
                // Обрабатываем все пункты меню из обеих секций    
                menu.find('.menu__item').each(function(){          
                    let item_orig = $(this)          
                    let item_clone = $(this).clone()    
                        
                    let text = item_clone.find('.menu__text').text().trim()    
                        
                    // Проверяем, пункт ли из первой секции (можно перемещать)    
                    let isFirstSection = item_orig.closest('.menu__list').is('.menu__list:eq(0)')    
                        
                    // Создаем HTML без кнопок перемещения для второй секции  
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
    
                    // Кнопки перемещения работают только для первой секции    
                    if(isFirstSection) {    
                        item_sort.find('.move-up').on('hover:enter', ()=>{          
                            let prev = item_sort.prev()          
                            // Ищем предыдущий элемент из первой секции     
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
                            // Ищем следующий элемент из первой секции          
                            while(next.length && next.data('isSecondSection')) {    
                                next = next.next()    
                            }    
                            if(next.length){          
                                item_sort.insertAfter(next)          
                                item_orig.insertAfter(item_orig.next())          
                            }          
                        })    
                    } else {    
                        // Обозначаем элементы из второй секции    
                        item_sort.data('isSecondSection', true)    
                    }    
    
                    // Скрытие работает для всех пунктов    
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
    
            // Функция редактирования верхнего меню    
            function editTopMenu() {          
                let list = $('<div class="menu-edit-list"></div>')            
                let head = $('.head')            
                
                head.find('.head__action').each(function(){            
                    let item_orig = $(this)          
                    let item_clone = $(this).clone()           
                              
                    let allClasses = item_clone.attr('class').split(' ')          
                    let mainClass = allClasses.find(c =>       
                        c.startsWith('open--') ||           
                        c.startsWith('notice-') ||           
                        c.startsWith('full-') ||
                        c.startsWith('console-') ||
                        c.includes('sources') ||
                        c.includes('ai-search') ||
                        c.includes('m-reload-screen') ||
                        c.includes('reload') ||
                        c.includes('extensions') ||
                        c.includes('exit')       
                    ) || ''

                    // Если не нашли специфичный класс, тогда ищем head__settings
                    if (!mainClass) {
                        mainClass = allClasses.find(c => c.includes('head__settings')) || ''
                    }          
                        
                    let displayName = getHeadActionName(mainClass, item_orig)   
                              
                    let item_sort = $(`<div class="menu-edit-list__item">            
                        <div class="menu-edit-list__icon"></div>            
                        <div class="menu-edit-list__title">${displayName}</div>            
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
                    </div>`)            
                
                    let svg = item_clone.find('svg')            
                    if(svg.length) {            
                        item_sort.find('.menu-edit-list__icon').append(svg.clone())            
                    } else if (mainClass.includes('open--profile')) {
                        // SVG для профиля
                        item_sort.find('.menu-edit-list__icon').html(`<svg style="width: 1.6em; height: 1.6em;" width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24.1445" cy="24.2546" r="23.8115" fill="white" fill-opacity="0.2"></circle>
                            <path d="M24.1464 9.39355C19.9003 9.39355 16.4294 12.8645 16.4294 17.1106C16.4294 21.3567 19.9003 24.8277 24.1464 24.8277C28.3925 24.8277 31.8635 21.3567 31.8635 17.1106C31.8635 12.8645 28.3925 9.39355 24.1464 9.39355ZM37.3901 30.9946C37.1879 30.4891 36.9184 30.0173 36.6151 29.5792C35.0649 27.2877 32.6723 25.7712 29.9764 25.4005C29.6395 25.3669 29.2688 25.4342 28.9991 25.6364C27.5838 26.6811 25.8989 27.2203 24.1465 27.2203C22.3941 27.2203 20.7092 26.6811 19.2938 25.6364C19.0242 25.4342 18.6535 25.3331 18.3165 25.4005C15.6206 25.7712 13.1943 27.2877 11.6779 29.5792C11.3746 30.0173 11.105 30.5228 10.9028 30.9946C10.8018 31.1968 10.8354 31.4327 10.9365 31.6349C11.2061 32.1067 11.5431 32.5785 11.8464 32.9828C12.3181 33.6232 12.8236 34.196 13.3965 34.7352C13.8683 35.2069 14.4075 35.645 14.9467 36.0831C17.6089 38.0714 20.8103 39.116 24.1128 39.116C27.4153 39.116 30.6167 38.0713 33.2789 36.0831C33.8181 35.6788 34.3573 35.2069 34.8291 34.7352C35.3683 34.196 35.9074 33.6231 36.3793 32.9828C36.7162 32.5447 37.0196 32.1067 37.2891 31.6349C37.4575 31.4327 37.4912 31.1967 37.3901 30.9946Z" fill="white"></path>
                        </svg>`);
                    } else if (elementId === 'EXTENSIONS') {
                        // SVG для расширений
                        item_sort.find('.menu-edit-list__icon').html(`<svg style="width: 1.6em; height: 1.6em;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 11H19V7C19 5.89 18.1 5 17 5H13V3.5C13 2.12 11.88 1 10.5 1C9.12 1 8 2.12 8 3.5V5H4C2.9 5 2 5.9 2 7V10.8H3.5C4.99 10.8 6.2 12.01 6.2 13.5C6.2 14.99 4.99 16.2 3.5 16.2H2V20C2 21.1 2.9 22 4 22H7.8V20.5C7.8 19.01 9.01 17.8 10.5 17.8C11.99 17.8 13.2 19.01 13.2 20.5V22H17C18.1 22 19 21.1 19 20V16H20.5C21.88 16 23 14.88 23 13.5C23 12.12 21.88 11 20.5 11Z" fill="white"/>
                        </svg>`);
                    }
                                   
                    item_sort.find('.move-up').on('hover:enter', ()=>{            
                        let prev = item_sort.prev()          
                        if(prev.length){          
                            item_sort.insertBefore(prev)          
                            item_orig.insertBefore(item_orig.prev())          
                        }          
                    })            
                
                    item_sort.find('.move-down').on('hover:enter', ()=>{            
                        let next = item_sort.next()          
                        if(next.length){          
                            item_sort.insertAfter(next)          
                            item_orig.insertAfter(item_orig.next())          
                        }          
                    })            
                
                    item_sort.find('.toggle').on('hover:enter', ()=>{            
                        item_orig.toggleClass('hide')          
                        item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)          
                    }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)            
                
                    list.append(item_sort)            
                })            
                
                Lampa.Modal.open({            
                    title: Lampa.Lang.translate('menu_editor_top'),          
                    html: list,          
                    size: 'small',          
                    scroll_to_center: true,          
                    onBack: ()=>{            
                        saveTopMenu()          
                        Lampa.Modal.close()          
                        Lampa.Controller.toggle('settings_component')          
                    }          
                })            
            }    
                
            // Функция редактирования меню настроек    
            function editSettingsMenu() {
                Lampa.Controller.toggle('settings')          
                          
                setTimeout(()=>{          
                    let settings = $('.settings')          
                              
                    if(!settings.length || !settings.find('.settings-folder').length){          
                        Lampa.Noty.show('Меню настроек еще не загружено')          
                        return          
                    }          
                              
                    let list = $('<div class="menu-edit-list"></div>')          
                              
                    settings.find('.settings-folder').each(function(){          
                        let item_orig = $(this)          
                        let item_clone = $(this).clone()    
                            
                        let name = item_clone.find('.settings-folder__name').text().trim()    
                            
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
                        </div>`)          
              
                        let icon = item_clone.find('.settings-folder__icon svg, .settings-folder__icon img')          
                        if(icon.length) {          
                            item_sort.find('.menu-edit-list__icon').append(icon.clone())          
                        }          
              
                        item_sort.find('.move-up').on('hover:enter', ()=>{          
                            let prev = item_sort.prev()          
                            if(prev.length){          
                                item_sort.insertBefore(prev)          
                                item_orig.insertBefore(item_orig.prev())          
                            }          
                        })          
              
                        item_sort.find('.move-down').on('hover:enter', ()=>{          
                            let next = item_sort.next()          
                            if(next.length){          
                                item_sort.insertAfter(next)          
                                item_orig.insertAfter(item_orig.next())          
                            }          
                        })          
              
                        item_sort.find('.toggle').on('hover:enter', ()=>{          
                            item_orig.toggleClass('hide')          
                            item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)          
                        }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)          
              
                        list.append(item_sort)          
                    })          
              
                    Lampa.Modal.open({          
                        title: Lampa.Lang.translate('menu_editor_settings'),          
                        html: list,          
                        size: 'small',          
                        scroll_to_center: true,          
                        onBack: ()=>{          
                            saveSettingsMenu()          
                            Lampa.Modal.close()          
                            Lampa.Controller.toggle('settings_component')          
                        }          
                    })          
                }, 300)          
            }
            // ИСПРАВЛЕНО: Сохранение настроек левого меню с логированием  
            function saveLeftMenu() {          
                let sort = []          
                let hide = []          
    
                // Сохраняем порядок только для первой секции    
                $('.menu .menu__list:eq(0) .menu__item').each(function(){          
                    let name = $(this).find('.menu__text').text().trim()          
                    sort.push(name)          
                })    
    
                // Сохраняем скрытые пункты из обеих секций    
                $('.menu .menu__item').each(function(){    
                    if($(this).hasClass('hidden')){    
                        let name = $(this).find('.menu__text').text().trim()    
                        hide.push(name)  
                        console.log('Menu Editor: Saving hidden item:', name)  
                    }          
                })          
    
                console.log('Menu Editor: Saved hide list:', hide)  
                Lampa.Storage.set('menu_sort', sort)          
                Lampa.Storage.set('menu_hide', hide)          
            }          
                
            // Сохранение настроек верхнего меню            
            function saveTopMenu() {            
                let sort = []            
                let hide = []            
                
                $('.head__action').each(function(){      
                    let item = $(this);
                    let uniqueClass = '';
        
                    // Сначала проверяем ID
                    let elementId = item.attr('id');
                    if (elementId === 'MRELOAD' || elementId === 'RELOAD' || elementId === 'EXTENSIONS') {
                        uniqueClass = elementId;
                    } else {
                    // Если ID нет, ищем по классам     
                    let classes = item.attr('class').split(' ')      
                    uniqueClass = classes.find(c =>       
                        c.startsWith('open--') ||           
                        c.startsWith('notice-') ||           
                        c.startsWith('full-') ||
                        c.startsWith('console-') ||
                        c.includes('sources') ||
                        c.includes('ai-search') ||
                        c.includes('m-reload-screen') ||
                        c.includes('reload') ||
                        c.includes('extensions') ||
                        c.includes('exit')
                    )

                    if (!uniqueClass) {
                        uniqueClass = classes.find(c => c.includes('head__settings'));
                    }
                }      
              
                    if(uniqueClass) {      
                        sort.push(uniqueClass)      
                        if($(this).hasClass('hide')){      
                            hide.push(uniqueClass)      
                        }      
                    }      
                })            
                
                console.log('Menu Editor: Saved top menu sort order:', sort);
                console.log('Menu Editor: Saved top menu hidden items:', hide);
                
                Lampa.Storage.set('head_menu_sort', sort)            
                Lampa.Storage.set('head_menu_hide', hide)            
            }            
                
            // Сохранение настроек меню настроек            
            function saveSettingsMenu() {            
                let sort = []            
                let hide = []            
                
                $('.settings-folder').each(function(){            
                    let name = $(this).find('.settings-folder__name').text().trim()            
                    sort.push(name)            
                    if($(this).hasClass('hide')){            
                        hide.push(name)            
                    }            
                })            
                
                Lampa.Storage.set('settings_menu_sort', sort)            
                Lampa.Storage.set('settings_menu_hide', hide)  
                
                // При изменении меню сбрасываем флаг первого открытия
                Lampa.Storage.set('menu_editor_first_open', true);
                console.log('Menu Editor: Reset first open flag due to menu changes');
            }            
                
            // Добавляем отдельный раздел в настройки            
            function addSettings() {            
                Lampa.SettingsApi.addComponent({            
                    component: 'menu_editor',            
                    icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">            
                        <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>            
                    </svg>`,            
                    name: Lampa.Lang.translate('menu_editor_title')            
                })            
                
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
                })            
                
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
                })            
                
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
                })        
                
                Lampa.SettingsApi.addParam({            
                    component: 'menu_editor',            
                    param: {            
                        name: 'hide_navigation_bar',            
                        type: 'trigger',            
                        default: false            
                    },            
                    field: {            
                        name: Lampa.Lang.translate('menu_editor_hide_nav'),            
                        description: Lampa.Lang.translate('menu_editor_hide_nav_desc')            
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
                })            
                
                if (Lampa.Storage.field('hide_navigation_bar') == true) {            
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');            
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));            
                }            
            }        
                    
            // Инициализация функций
            addExtensionsButton();
            addSettings();      
              
            // ИСПРАВЛЕНО: Увеличен таймаут и добавлен слушатель события меню  
            setTimeout(() => {      
                applyLeftMenu()      
                setTimeout(applyTopMenu, 300)      
            }, 1000)  // Увеличено с 500 до 1000  
              
            // Дополнительный слушатель события завершения инициализации меню  
            Lampa.Listener.follow('menu', (e) => {  
                if(e.type === 'end') {  
                    setTimeout(applyLeftMenu, 200)  
                }  
            })  
                  
            // Просто применяем настройки при открытии настроек
            Lampa.Listener.follow('activity', function(e) {      
                if(e.type === 'start' && e.component === 'settings') {      
                  setTimeout(applySettingsMenu, 500)      
                }      
            })         
                  
            if(Lampa.Settings && Lampa.Settings.listener) {      
                Lampa.Settings.listener.follow('open', function(e) {      
                  setTimeout(applySettingsMenu, 300)      
                })      
            }      
        }             
                
        if(window.appready) initialize()            
        else {            
            Lampa.Listener.follow('app', function (e) {            
                if (e.type == 'ready') initialize()            
            })            
        }            
    }            
            
    if(!window.plugin_menu_editor_ready) startPlugin()            
})();
