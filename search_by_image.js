(function() {
    'use strict';

    function startPlugin() {
        window.plugin_menu_editor_ready = true

        /* ══════════════════════════════════════════════════
           MOVIE IDENTIFIER – CSS + OVERLAY
        ══════════════════════════════════════════════════ */
        function injectPhotoSearchCSS() {
            if (document.getElementById('mi-css')) return
            var s = document.createElement('style')
            s.id = 'mi-css'
            s.textContent = [
                '#mi-overlay{position:fixed;inset:0;z-index:99999;',
                'background:rgba(0,0,0,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
                'display:flex;align-items:center;justify-content:center;',
                'opacity:0;transition:opacity .22s;pointer-events:none;}',
                '#mi-overlay.mi-show{opacity:1;pointer-events:all;}',

                '#mi-card{background:#0e1822;border:1px solid rgba(255,255,255,.07);',
                'border-radius:18px;padding:30px 36px;width:min(540px,94vw);',
                'box-shadow:0 32px 90px rgba(0,0,0,.75);',
                'display:flex;flex-direction:column;gap:20px;}',

                '#mi-card-title{margin:0;color:#fff;font-size:19px;font-weight:700;',
                'display:flex;align-items:center;gap:10px;}',
                '#mi-card-title span{color:#4da6ff;}',

                '#mi-drop{border:2px dashed rgba(77,166,255,.35);border-radius:12px;',
                'min-height:155px;display:flex;flex-direction:column;',
                'align-items:center;justify-content:center;gap:10px;',
                'cursor:pointer;transition:border-color .18s,background .18s;',
                'color:rgba(255,255,255,.45);font-size:14px;',
                'position:relative;overflow:hidden;background:rgba(77,166,255,.03);}',
                '#mi-drop:hover,#mi-drop.mi-dg{border-color:#4da6ff;background:rgba(77,166,255,.09);color:#fff;}',
                '#mi-drop-preview{max-width:100%;max-height:145px;border-radius:7px;',
                'object-fit:contain;display:none;pointer-events:none;}',
                '#mi-drop-ico{font-size:34px;line-height:1;}',

                '#mi-loader{display:none;flex-direction:column;align-items:center;',
                'gap:12px;color:rgba(255,255,255,.6);font-size:14px;}',
                '#mi-loader.mi-show{display:flex;}',
                '.mi-spin{width:40px;height:40px;border-radius:50%;',
                'border:3px solid rgba(77,166,255,.18);border-top-color:#4da6ff;',
                'animation:miSpin .75s linear infinite;}',
                '@keyframes miSpin{to{transform:rotate(360deg)}}',

                '#mi-results{display:flex;flex-direction:column;gap:9px;',
                'max-height:320px;overflow-y:auto;',
                'scrollbar-width:thin;scrollbar-color:#1a8cff transparent;}',

                '.mi-ri{display:flex;gap:13px;align-items:center;',
                'background:rgba(255,255,255,.04);border-radius:9px;',
                'padding:10px 13px;cursor:pointer;border:1px solid transparent;',
                'transition:background .15s,border-color .15s,transform .12s;}',
                '.mi-ri:hover,.mi-ri.selected{background:rgba(77,166,255,.14);',
                'border-color:rgba(77,166,255,.45);transform:translateX(4px);}',
                '.mi-ri-img{width:46px;height:65px;border-radius:5px;',
                'object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.07);}',
                '.mi-ri-ph{width:46px;height:65px;border-radius:5px;',
                'background:rgba(255,255,255,.06);flex-shrink:0;',
                'display:flex;align-items:center;justify-content:center;font-size:24px;}',
                '.mi-ri-body{flex:1;min-width:0;}',
                '.mi-ri-ttl{color:#fff;font-weight:700;font-size:14px;',
                'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
                '.mi-ri-sub{color:rgba(255,255,255,.42);font-size:12px;margin-top:4px;}',
                '.mi-ri-score{font-size:11px;font-weight:700;flex-shrink:0;',
                'padding:3px 9px;border-radius:12px;',
                'background:rgba(77,166,255,.16);color:#7dc6ff;}',

                '#mi-footer{display:flex;gap:10px;justify-content:flex-end;}',
                '.mi-fbtn{padding:9px 22px;border-radius:22px;border:none;cursor:pointer;',
                'font-size:14px;font-weight:600;transition:transform .12s,opacity .15s;}',
                '.mi-fbtn:hover,.mi-fbtn.selected{transform:scale(1.05);}',
                '#mi-btn-cancel{background:rgba(255,255,255,.1);color:#fff;}',
                '#mi-btn-search{background:linear-gradient(135deg,#1a8cff 0%,#0047bb 100%);color:#fff;}',
                '#mi-btn-search[disabled]{opacity:.38;pointer-events:none;}',
                '.mi-msg{color:rgba(255,255,255,.45);text-align:center;padding:20px 0;font-size:14px;}',
                '.mi-err{color:#ff6b6b;text-align:center;font-size:13px;line-height:1.6;}',
            ].join('')
            document.head.appendChild(s)
        }

        var MI_SVG_CAM = [
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"',
            ' stroke="currentColor" stroke-width="2"',
            ' stroke-linecap="round" stroke-linejoin="round">',
            '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>',
            '<circle cx="12" cy="13" r="4"/>',
            '</svg>',
        ].join('')

        var mi_state = { file: null }

        function mi_q(s) { return document.querySelector(s) }
        function mi_esc(s) {
            return String(s).replace(/[&<>"]/g, function(c){
                return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]
            })
        }

        function buildPhotoOverlay() {
            if (document.getElementById('mi-overlay')) return
            var d = document.createElement('div')
            d.innerHTML = [
                '<div id="mi-overlay">',
                  '<div id="mi-card">',
                    '<div id="mi-card-title">', MI_SVG_CAM, ' Пошук за <span>фото</span></div>',
                    '<div id="mi-drop" tabindex="0" role="button" aria-label="Завантажити скріншот">',
                      '<img id="mi-drop-preview" alt="">',
                      '<div id="mi-drop-ico">📷</div>',
                      '<div id="mi-drop-lbl">Натисніть або перетягніть скріншот</div>',
                      '<div id="mi-drop-hint" style="font-size:11px;color:rgba(255,255,255,.22)">JPEG · PNG · WEBP</div>',
                    '</div>',
                    '<div id="mi-loader"><div class="mi-spin"></div><span>Аналізую зображення…</span></div>',
                    '<div id="mi-results"></div>',
                    '<div id="mi-footer">',
                      '<button class="mi-fbtn selector" id="mi-btn-cancel">Закрити</button>',
                      '<button class="mi-fbtn selector" id="mi-btn-search" disabled>🔍 Шукати</button>',
                    '</div>',
                  '</div>',
                '</div>',
            ].join('')
            document.body.appendChild(d.firstElementChild)
            bindPhotoOverlay()
        }

        function openPhotoOverlay() {
            buildPhotoOverlay()
            resetPhotoUI()
            var ov = mi_q('#mi-overlay')
            if (ov) ov.classList.add('mi-show')
            setTimeout(function(){ var b = mi_q('#mi-btn-cancel'); b && b.focus() }, 80)
        }

        function closePhotoOverlay() {
            var ov = mi_q('#mi-overlay')
            if (ov) ov.classList.remove('mi-show')
        }

        function resetPhotoUI() {
            mi_state.file = null
            var r = mi_q('#mi-results');      if (r) r.innerHTML = ''
            var l = mi_q('#mi-loader');       if (l) l.classList.remove('mi-show')
            var p = mi_q('#mi-drop-preview'); if (p){ p.style.display = 'none'; p.src = '' }
            var i = mi_q('#mi-drop-ico');     if (i){ i.style.display = ''; i.textContent = '📷' }
            var b = mi_q('#mi-drop-lbl');     if (b){ b.style.display = ''; b.textContent = 'Натисніть або перетягніть скріншот' }
            var h = mi_q('#mi-drop-hint');    if (h) h.style.display = ''
            var s = mi_q('#mi-btn-search');   if (s) s.disabled = true
        }

        function getFileInput() {
            var fi = document.getElementById('mi-file-trap')
            if (!fi) {
                fi = document.createElement('input')
                fi.type = 'file'
                fi.id = 'mi-file-trap'
                fi.accept = 'image/*'
                fi.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0'
                fi.addEventListener('change', function(){
                    if (fi.files && fi.files[0]) handlePhotoFile(fi.files[0])
                    fi.value = ''
                })
                document.body.appendChild(fi)
            }
            return fi
        }

        function handlePhotoFile(file) {
            if (!file || !file.type.startsWith('image/')) return
            mi_state.file = file
            var reader = new FileReader()
            reader.onload = function(e) {
                var src = e.target.result
                var p = mi_q('#mi-drop-preview'); if (p){ p.src = src; p.style.display = 'block' }
                var i = mi_q('#mi-drop-ico');     if (i) i.style.display = 'none'
                var b = mi_q('#mi-drop-lbl');     if (b) b.textContent = file.name
                var h = mi_q('#mi-drop-hint');    if (h) h.style.display = 'none'
                var s = mi_q('#mi-btn-search');   if (s){ s.disabled = false; s.focus() }
            }
            reader.readAsDataURL(file)
        }

        function bindPhotoOverlay() {
            var ov = mi_q('#mi-overlay')
            var dr = mi_q('#mi-drop')
            var bc = mi_q('#mi-btn-cancel')
            var bs = mi_q('#mi-btn-search')

            if (bc) bc.addEventListener('click', closePhotoOverlay)
            if (bs) bs.addEventListener('click', doPhotoSearch)
            if (ov) ov.addEventListener('click', function(e){ if (e.target === ov) closePhotoOverlay() })

            if (dr) {
                dr.addEventListener('click', function(e){
                    if (e.target.tagName === 'BUTTON') return
                    getFileInput().click()
                })
                dr.addEventListener('keydown', function(e){
                    if (e.key === 'Enter' || e.key === ' ') getFileInput().click()
                })
                dr.addEventListener('dragover',  function(e){ e.preventDefault(); dr.classList.add('mi-dg') })
                dr.addEventListener('dragleave', function(){ dr.classList.remove('mi-dg') })
                dr.addEventListener('drop', function(e){
                    e.preventDefault(); dr.classList.remove('mi-dg')
                    var f = e.dataTransfer && e.dataTransfer.files
                    if (f && f[0]) handlePhotoFile(f[0])
                })
            }

            document.addEventListener('keydown', function(e){
                if (e.key === 'Escape' && mi_q('#mi-overlay.mi-show')) closePhotoOverlay()
            })
        }

        function doPhotoSearch() {
            if (!mi_state.file) return
            var l = mi_q('#mi-loader');     if (l) l.classList.add('mi-show')
            var r = mi_q('#mi-results');    if (r) r.innerHTML = ''
            var s = mi_q('#mi-btn-search'); if (s) s.disabled = true

            var fd = new FormData()
            fd.append('image', mi_state.file)

            fetch('https://www.movie-identifier.com/identify', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: fd
            })
            .then(function(res){
                if (!res.ok) throw new Error('HTTP ' + res.status)
                return res.json()
            })
            .then(function(data){
                var l2 = mi_q('#mi-loader');     if (l2) l2.classList.remove('mi-show')
                var s2 = mi_q('#mi-btn-search'); if (s2) s2.disabled = false
                renderPhotoResults(data)
            })
            .catch(function(err){
                console.warn('[MI] fetch error:', err)
                var l2 = mi_q('#mi-loader');     if (l2) l2.classList.remove('mi-show')
                var s2 = mi_q('#mi-btn-search'); if (s2) s2.disabled = false
                var r2 = mi_q('#mi-results')
                if (r2) r2.innerHTML = '<div class="mi-err">Прямий запит заблоковано (CORS).<br>Відкриваємо movie-identifier.com у браузері.</div>'
                setTimeout(function(){ window.open('https://www.movie-identifier.com/', '_blank') }, 1200)
            })
        }

        function renderPhotoResults(data) {
            var r = mi_q('#mi-results'); if (!r) return
            var items = []
            if (Array.isArray(data))                   items = data
            else if (data && Array.isArray(data.results)) items = data.results
            else if (data && (data.title || data.name))   items = [data]

            if (!items.length) { r.innerHTML = '<div class="mi-msg">Нічого не знайдено 😔</div>'; return }

            var html = ''
            items.slice(0, 8).forEach(function(item, i){
                var title = mi_esc(item.title || item.name || 'Невідомо')
                var year  = item.year || (item.release_date && item.release_date.slice(0, 4)) || ''
                var type  = item.media_type === 'tv' ? 'Серіал' : item.media_type === 'movie' ? 'Фільм' : (item.type || '')
                var conf  = item.confidence ? Math.round(item.confidence * 100) + '%' : (item.vote_average ? '★ ' + item.vote_average : '')
                var img   = item.poster_path ? 'https://image.tmdb.org/t/p/w92' + item.poster_path : (item.poster || '')
                var poster = img
                    ? '<img class="mi-ri-img" src="' + img + '" alt="" loading="lazy">'
                    : '<div class="mi-ri-ph">🎬</div>'
                html += [
                    '<div class="mi-ri selector" data-i="' + i + '" tabindex="0">',
                      poster,
                      '<div class="mi-ri-body">',
                        '<div class="mi-ri-ttl">' + title + '</div>',
                        '<div class="mi-ri-sub">' + [type, year].filter(Boolean).join(' · ') + '</div>',
                      '</div>',
                      conf ? '<div class="mi-ri-score">' + conf + '</div>' : '',
                    '</div>',
                ].join('')
            })
            r.innerHTML = html

            r.querySelectorAll('.mi-ri').forEach(function(el){
                var idx = parseInt(el.getAttribute('data-i'), 10)
                el.addEventListener('click',   function(){ openResultInLampa(items[idx]) })
                el.addEventListener('keydown', function(e){ if (e.key === 'Enter') openResultInLampa(items[idx]) })
            })
        }

        function openResultInLampa(item) {
            var title = item.title || item.name || ''
            closePhotoOverlay()
            try {
                if (item.id && item.media_type && window.Lampa && Lampa.Activity) {
                    Lampa.Activity.push({ component: 'full', id: item.id, method: item.media_type, card: item, source: 'tmdb' })
                    return
                }
            } catch(e){}
            try {
                if (window.Lampa) {
                    if (Lampa.Search) Lampa.Search.open(title)
                    else Lampa.Activity.push({ component: 'search', search: title, search_auto: true })
                }
            } catch(e){ console.warn('[MI]', e) }
        }

        /* ══════════════════════════════════════════════════
           MAIN PLUGIN
        ══════════════════════════════════════════════════ */
        function initialize() {
            injectPhotoSearchCSS()
            buildPhotoOverlay()
            getFileInput()

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
                menu_editor_add_reload_button: {
                    ru: 'Добавить кнопку перезагрузки в верхнее меню',
                    uk: 'Додати кнопку перезавантаження у верхнє меню',
                    en: 'Add reload button to top menu'
                },
                menu_editor_add_clear_cache_button: {
                    ru: 'Добавить кнопку очистки кеша в верхнее меню',
                    uk: 'Додати кнопку очищення кешу у верхнє меню',
                    en: 'Add clear cache button to top menu'
                },
                menu_editor_add_photo_search_button: {
                    ru: 'Добавить кнопку поиска по фото в верхнее меню',
                    uk: 'Додати кнопку пошуку за фото у верхнє меню',
                    en: 'Add photo search button to top menu'
                },
                head_action_clear_cache: {
                    ru: 'Очистить кеш',
                    uk: 'Очистити кеш',
                    en: 'Clear cache'
                },
                head_action_reload: {
                    ru: 'Перезагрузка',
                    uk: 'Перезавантаження',
                    en: 'Reload'
                },
                head_action_photo_search: {
                    ru: 'Поиск по фото',
                    uk: 'Пошук за фото',
                    en: 'Photo Search'
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

            function applyLeftMenu() {
                let sort = Lampa.Storage.get('menu_sort', [])
                let hide = Lampa.Storage.get('menu_hide', [])

                let menu = $('.menu')
                if (!menu.length) return

                if (sort.length) {
                    sort.forEach((name) => {
                        let item = menu.find('.menu__list:eq(0) .menu__item').filter(function() {
                            return $(this).find('.menu__text').text().trim() === name
                        })
                        if (item.length) item.appendTo(menu.find('.menu__list:eq(0)'))
                    })
                }

                $('.menu .menu__item').removeClass('hidden')

                if (hide.length) {
                    hide.forEach((name) => {
                        let item = $('.menu .menu__list').find('.menu__item').filter(function() {
                            return $(this).find('.menu__text').text().trim() === name
                        })
                        if (item.length) item.addClass('hidden')
                    })
                }
            }

            function applyTopMenu() {
                let sort = Lampa.Storage.get('head_menu_sort', [])
                let hide = Lampa.Storage.get('head_menu_hide', [])

                let actionsContainer = $('.head__actions')
                if (!actionsContainer.length) return

                // Видаляємо всі кастомні кнопки перед повторним додаванням
                $('.head__action.head__action--clear-cache, .head__action.head__action--reload, .head__action.head__action--photo-search').remove()

                if (Lampa.Storage.get('add_clear_cache_button', false)) {
                    let clearBtn = Lampa.Head.addIcon(
                        `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                        </svg>`,
                        () => {
                            Lampa.Storage.clear(false)
                            Lampa.Cache.clearAll()
                            Lampa.Noty.show(Lampa.Lang.translate('settings_clear_cache_only'))
                        }
                    )
                    clearBtn.addClass('head__action head__action--clear-cache')
                }

                if (Lampa.Storage.get('add_reload_button', false)) {
                    let reloadBtn = Lampa.Head.addIcon(
                        `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                        </svg>`,
                        () => { window.location.reload() }
                    )
                    reloadBtn.addClass('head__action head__action--reload')
                }

                // ── КНОПКА ПОШУКУ ЗА ФОТО ──────────────────────────
                if (Lampa.Storage.get('add_photo_search_button', false)) {
                    let photoBtn = Lampa.Head.addIcon(
                        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>`,
                        () => { openPhotoOverlay() }
                    )
                    photoBtn.addClass('head__action head__action--photo-search')
                }

                if (sort.length) {
                    sort.forEach((uniqueClass) => {
                        let item = $('.head__action.' + uniqueClass)
                        if (item.length) item.appendTo(actionsContainer)
                    })
                }

                $('.head__action').removeClass('hide')
                if (hide.length) {
                    hide.forEach((uniqueClass) => {
                        let item = $('.head__action.' + uniqueClass)
                        if (item.length) item.addClass('hide')
                    })
                }
            }

            function applySettingsMenu() {
                let sort = Lampa.Storage.get('settings_menu_sort', [])
                let hide = Lampa.Storage.get('settings_menu_hide', [])

                let settingsContainer = $('.settings .scroll__body > div')
                if (!settingsContainer.length) return

                if (sort.length) {
                    sort.forEach((name) => {
                        let item = $('.settings-folder').filter(function() {
                            return $(this).find('.settings-folder__name').text().trim() === name
                        })
                        if (item.length) item.appendTo(settingsContainer)
                    })
                }

                $('.settings-folder').removeClass('hide')
                if (hide.length) {
                    hide.forEach((name) => {
                        let item = $('.settings-folder').filter(function() {
                            return $(this).find('.settings-folder__name').text().trim() === name
                        })
                        if (item.length) item.addClass('hide')
                    })
                }
            }

            function getHeadActionName(mainClass) {
                let titleKey = ''
                if (mainClass.includes('open--search'))        titleKey = 'head_action_search'
                else if (mainClass.includes('open--feed'))     titleKey = 'head_action_feed'
                else if (mainClass.includes('notice--'))       titleKey = 'head_action_notice'
                else if (mainClass.includes('open--settings')) titleKey = 'head_action_settings'
                else if (mainClass.includes('open--profile'))  titleKey = 'head_action_profile'
                else if (mainClass.includes('full--screen'))   titleKey = 'head_action_fullscreen'
                else if (mainClass.includes('open--broadcast'))titleKey = 'head_action_broadcast'
                else if (mainClass === 'head__action--clear-cache')   titleKey = 'head_action_clear_cache'
                else if (mainClass === 'head__action--reload')        titleKey = 'head_action_reload'
                else if (mainClass === 'head__action--photo-search')  titleKey = 'head_action_photo_search'
                return titleKey ? Lampa.Lang.translate(titleKey) : Lampa.Lang.translate('no_name')
            }

            // ── Допоміжна функція: будує item для списку верхнього меню ──
            function makeHeadListItem({ iconHtml, title, onUp, onDown, onToggle, isHidden }) {
                let item = $(`<div class="menu-edit-list__item">
                    <div class="menu-edit-list__icon">${iconHtml}</div>
                    <div class="menu-edit-list__title">${title}</div>
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

                item.find('.move-up').on('hover:enter',   onUp)
                item.find('.move-down').on('hover:enter', onDown)
                item.find('.toggle').on('hover:enter',    onToggle)
                    .find('.dot').attr('opacity', isHidden ? 0 : 1)

                return item
            }

            function editLeftMenu() {
                let list = $('<div class="menu-edit-list"></div>')
                let menu = $('.menu')

                menu.find('.menu__item').each(function(){
                    let item_orig  = $(this)
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
                        </div>` : ''

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

                    if (isFirstSection) {
                        item_sort.find('.move-up').on('hover:enter', ()=>{
                            let prev = item_sort.prev()
                            while (prev.length && prev.data('isSecondSection')) prev = prev.prev()
                            if (prev.length){ item_sort.insertBefore(prev); item_orig.insertBefore(item_orig.prev()) }
                        })
                        item_sort.find('.move-down').on('hover:enter', ()=>{
                            let next = item_sort.next()
                            while (next.length && next.data('isSecondSection')) next = next.next()
                            if (next.length){ item_sort.insertAfter(next); item_orig.insertAfter(item_orig.next()) }
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

            function editTopMenu() {
                let list = $('<div class="menu-edit-list"></div>')
                let head = $('.head')

                list.empty()

                // Існуючі кнопки шапки
                head.find('.head__action').each(function(){
                    let item_orig  = $(this)
                    if (item_orig.hasClass('head__action--clear-cache') ||
                        item_orig.hasClass('head__action--reload') ||
                        item_orig.hasClass('head__action--photo-search')) return

                    let item_clone = $(this).clone()
                    let allClasses = item_clone.attr('class').split(' ')
                    let mainClass  = allClasses.find(c =>
                        c.startsWith('open--') ||
                        c.startsWith('notice--') ||
                        c.startsWith('full--')
                    ) || ''

                    let displayName = getHeadActionName(mainClass)
                    let svgEl = item_clone.find('svg')
                    let iconHtml = svgEl.length ? svgEl[0].outerHTML : ''

                    let item_sort = makeHeadListItem({
                        iconHtml,
                        title: displayName,
                        onUp:     ()=>{ let p=item_sort.prev(); if(p.length){ item_sort.insertBefore(p); item_orig.insertBefore(item_orig.prev()) } },
                        onDown:   ()=>{ let n=item_sort.next(); if(n.length){ item_sort.insertAfter(n); item_orig.insertAfter(item_orig.next()) } },
                        onToggle: ()=>{ item_orig.toggleClass('hide'); item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1) },
                        isHidden: !item_orig.hasClass('hide')
                    })
                    list.append(item_sort)
                })

                // Кнопка очищення кешу
                if (Lampa.Storage.get('add_clear_cache_button', false)) {
                    let iconHtml = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>`
                    let clearItem = makeHeadListItem({
                        iconHtml,
                        title: Lampa.Lang.translate('head_action_clear_cache'),
                        onUp:     ()=>{ let p=clearItem.prev(); if(p.length){ clearItem.insertBefore(p); $('.head__action--clear-cache').insertBefore($('.head__action--clear-cache').prev()) } },
                        onDown:   ()=>{ let n=clearItem.next(); if(n.length){ clearItem.insertAfter(n); $('.head__action--clear-cache').insertAfter($('.head__action--clear-cache').next()) } },
                        onToggle: ()=>{ $('.head__action--clear-cache').toggleClass('hide'); clearItem.find('.dot').attr('opacity', $('.head__action--clear-cache').hasClass('hide') ? 0 : 1) },
                        isHidden: !$('.head__action--clear-cache').hasClass('hide')
                    })
                    list.append(clearItem)
                }

                // Кнопка перезавантаження
                if (Lampa.Storage.get('add_reload_button', false)) {
                    let iconHtml = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                    </svg>`
                    let reloadItem = makeHeadListItem({
                        iconHtml,
                        title: Lampa.Lang.translate('head_action_reload'),
                        onUp:     ()=>{ let p=reloadItem.prev(); if(p.length){ reloadItem.insertBefore(p); $('.head__action--reload').insertBefore($('.head__action--reload').prev()) } },
                        onDown:   ()=>{ let n=reloadItem.next(); if(n.length){ reloadItem.insertAfter(n); $('.head__action--reload').insertAfter($('.head__action--reload').next()) } },
                        onToggle: ()=>{ $('.head__action--reload').toggleClass('hide'); reloadItem.find('.dot').attr('opacity', $('.head__action--reload').hasClass('hide') ? 0 : 1) },
                        isHidden: !$('.head__action--reload').hasClass('hide')
                    })
                    list.append(reloadItem)
                }

                // ── КНОПКА ПОШУКУ ЗА ФОТО ──────────────────────────
                if (Lampa.Storage.get('add_photo_search_button', false)) {
                    let iconHtml = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>`
                    let photoItem = makeHeadListItem({
                        iconHtml,
                        title: Lampa.Lang.translate('head_action_photo_search'),
                        onUp:     ()=>{ let p=photoItem.prev(); if(p.length){ photoItem.insertBefore(p); $('.head__action--photo-search').insertBefore($('.head__action--photo-search').prev()) } },
                        onDown:   ()=>{ let n=photoItem.next(); if(n.length){ photoItem.insertAfter(n); $('.head__action--photo-search').insertAfter($('.head__action--photo-search').next()) } },
                        onToggle: ()=>{ $('.head__action--photo-search').toggleClass('hide'); photoItem.find('.dot').attr('opacity', $('.head__action--photo-search').hasClass('hide') ? 0 : 1) },
                        isHidden: !$('.head__action--photo-search').hasClass('hide')
                    })
                    list.append(photoItem)
                }

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

            function editSettingsMenu() {
                Lampa.Controller.toggle('settings')

                setTimeout(()=>{
                    let settings = $('.settings')

                    if (!settings.length || !settings.find('.settings-folder').length){
                        Lampa.Noty.show('Меню налаштувань ще не завантажене')
                        return
                    }

                    let list = $('<div class="menu-edit-list"></div>')

                    settings.find('.settings-folder').each(function(){
                        let item_orig  = $(this)
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
                        if (icon.length) item_sort.find('.menu-edit-list__icon').append(icon.clone())

                        item_sort.find('.move-up').on('hover:enter', ()=>{
                            let prev = item_sort.prev()
                            if (prev.length){ item_sort.insertBefore(prev); item_orig.insertBefore(item_orig.prev()) }
                        })
                        item_sort.find('.move-down').on('hover:enter', ()=>{
                            let next = item_sort.next()
                            if (next.length){ item_sort.insertAfter(next); item_orig.insertAfter(item_orig.next()) }
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

            function saveLeftMenu() {
                let sort = [], hide = []
                $('.menu .menu__list:eq(0) .menu__item').each(function(){
                    sort.push($(this).find('.menu__text').text().trim())
                })
                $('.menu .menu__item').each(function(){
                    if ($(this).hasClass('hidden')) hide.push($(this).find('.menu__text').text().trim())
                })
                Lampa.Storage.set('menu_sort', sort)
                Lampa.Storage.set('menu_hide', hide)
            }

            function saveTopMenu() {
                let sort = [], hide = []
                $('.head__action').each(function(){
                    let classes     = $(this).attr('class').split(' ')
                    let uniqueClass = classes.find(c =>
                        c.startsWith('open--') ||
                        c.startsWith('notice--') ||
                        c.startsWith('full--') ||
                        c === 'head__action--clear-cache' ||
                        c === 'head__action--reload' ||
                        c === 'head__action--photo-search'
                    )
                    if (uniqueClass) {
                        sort.push(uniqueClass)
                        if ($(this).hasClass('hide')) hide.push(uniqueClass)
                    }
                })
                Lampa.Storage.set('head_menu_sort', sort)
                Lampa.Storage.set('head_menu_hide', hide)
            }

            function saveSettingsMenu() {
                let sort = [], hide = []
                $('.settings-folder').each(function(){
                    let name = $(this).find('.settings-folder__name').text().trim()
                    sort.push(name)
                    if ($(this).hasClass('hide')) hide.push(name)
                })
                Lampa.Storage.set('settings_menu_sort', sort)
                Lampa.Storage.set('settings_menu_hide', hide)
            }

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
                    param: { name: 'edit_left_menu', type: 'button' },
                    field:  { name: Lampa.Lang.translate('menu_editor_left') },
                    onChange: editLeftMenu
                })

                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'edit_top_menu', type: 'button' },
                    field:  { name: Lampa.Lang.translate('menu_editor_top') },
                    onChange: editTopMenu
                })

                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'edit_settings_menu', type: 'button' },
                    field:  { name: Lampa.Lang.translate('menu_editor_settings') },
                    onChange: editSettingsMenu
                })

                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'add_reload_button', type: 'trigger', default: false },
                    field:  { name: Lampa.Lang.translate('menu_editor_add_reload_button'), description: 'Додає кнопку перезавантаження у верхнє меню' },
                    onChange: function(){ setTimeout(applyTopMenu, 100) }
                })

                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'add_clear_cache_button', type: 'trigger', default: false },
                    field:  { name: Lampa.Lang.translate('menu_editor_add_clear_cache_button'), description: 'Додає кнопку очищення кешу у верхнє меню' },
                    onChange: function(){ setTimeout(applyTopMenu, 100) }
                })

                // ── НАЛАШТУВАННЯ КНОПКИ ФОТО ────────────────────────
                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'add_photo_search_button', type: 'trigger', default: false },
                    field:  {
                        name: Lampa.Lang.translate('menu_editor_add_photo_search_button'),
                        description: 'Додає кнопку пошуку фільму за скріншотом у верхнє меню'
                    },
                    onChange: function(){ setTimeout(applyTopMenu, 100) }
                })

                Lampa.SettingsApi.addParam({
                    component: 'menu_editor',
                    param: { name: 'hide_navigation_bar', type: 'trigger', default: false },
                    field:  { name: Lampa.Lang.translate('menu_editor_hide_nav'), description: 'Приховує нижню панель навігації на телефоні' },
                    onChange: function(){
                        if (Lampa.Storage.field('hide_navigation_bar') == true) {
                            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>')
                            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true))
                        }
                        if (Lampa.Storage.field('hide_navigation_bar') == false) {
                            $('#hide_nav_bar').remove()
                        }
                    }
                })

                if (Lampa.Storage.field('hide_navigation_bar') == true) {
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>')
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true))
                }
            }

            addSettings()

            setTimeout(() => {
                applyLeftMenu()
                setTimeout(applyTopMenu, 300)
            }, 500)

            Lampa.Listener.follow('menu', (e) => {
                if (e.type === 'end') setTimeout(applyLeftMenu, 200)
            })

            Lampa.Listener.follow('activity', (e) => {
                if (e.type === 'start' && e.component === 'settings') setTimeout(applySettingsMenu, 500)
            })

            if (Lampa.Settings && Lampa.Settings.listener) {
                Lampa.Settings.listener.follow('open', (e) => {
                    setTimeout(applySettingsMenu, 300)
                })
            }
        }

        if (window.appready) initialize()
        else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type == 'ready') initialize()
            })
        }
    }

    if (!window.plugin_menu_editor_ready) startPlugin()
})();
