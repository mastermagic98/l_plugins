/**
 * Lampa Plugin – Movie Identifier v2
 * Пошук фільму/серіалу за скріншотом
 * https://www.movie-identifier.com/
 */
(function () {
  'use strict';

  var PLUGIN_KEY   = 'movie_identifier';
  var PLUGIN_TITLE = 'Пошук за фото';

  var SVG_CAM = [
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"',
    ' stroke="currentColor" stroke-width="2"',
    ' stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8',
    'a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>',
    '<circle cx="12" cy="13" r="4"/>',
    '</svg>',
  ].join('');

  /* ══════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════ */
  var CSS = [
    '#mi-head-btn{',
      'display:inline-flex;align-items:center;gap:6px;',
      'padding:0 14px;height:40px;border-radius:20px;cursor:pointer;',
      'background:rgba(26,140,255,.18);border:1px solid rgba(26,140,255,.45);',
      'color:#fff;font-size:14px;font-weight:600;',
      'transition:background .18s,border-color .18s,transform .12s;',
      'flex-shrink:0;user-select:none;margin-right:8px;',
    '}',
    '#mi-head-btn:hover,#mi-head-btn.selected{',
      'background:rgba(26,140,255,.4);border-color:#1a8cff;transform:scale(1.04);',
    '}',
    '#mi-head-btn svg{flex-shrink:0;}',

    '#mi-overlay{',
      'position:fixed;inset:0;z-index:99999;',
      'background:rgba(0,0,0,.84);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      'display:flex;align-items:center;justify-content:center;',
      'opacity:0;transition:opacity .22s;pointer-events:none;',
    '}',
    '#mi-overlay.mi-show{opacity:1;pointer-events:all;}',

    '#mi-card{',
      'background:#0f1923;',
      'border:1px solid rgba(255,255,255,.08);',
      'border-radius:16px;padding:28px 32px;',
      'width:min(520px,94vw);',
      'box-shadow:0 32px 80px rgba(0,0,0,.7);',
      'display:flex;flex-direction:column;gap:18px;',
    '}',
    '#mi-card h2{margin:0;color:#fff;font-size:18px;display:flex;align-items:center;gap:8px;}',
    '#mi-card h2 em{color:#4da6ff;font-style:normal;}',

    '#mi-drop{',
      'border:2px dashed rgba(77,166,255,.4);border-radius:10px;',
      'min-height:150px;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;gap:8px;',
      'cursor:pointer;transition:all .18s;',
      'color:rgba(255,255,255,.5);font-size:14px;',
      'position:relative;overflow:hidden;',
      'background:rgba(77,166,255,.04);',
    '}',
    '#mi-drop:hover,#mi-drop.mi-dg{border-color:#4da6ff;background:rgba(77,166,255,.1);color:#fff;}',
    '#mi-drop input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:0;}',
    '#mi-drop-preview{max-width:100%;max-height:140px;border-radius:6px;object-fit:contain;display:none;pointer-events:none;}',
    '#mi-drop-icon{font-size:32px;line-height:1;}',

    '#mi-loader{display:none;flex-direction:column;align-items:center;gap:10px;color:rgba(255,255,255,.6);font-size:14px;}',
    '#mi-loader.mi-show{display:flex;}',
    '.mi-spin{width:38px;height:38px;border-radius:50%;border:3px solid rgba(77,166,255,.2);border-top-color:#4da6ff;animation:miSpin .7s linear infinite;}',
    '@keyframes miSpin{to{transform:rotate(360deg)}}',

    '#mi-results{display:flex;flex-direction:column;gap:8px;max-height:340px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#1a8cff transparent;}',
    '.mi-ri{display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.04);border-radius:8px;padding:10px 12px;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s,transform .12s;}',
    '.mi-ri:hover,.mi-ri.selected{background:rgba(77,166,255,.15);border-color:rgba(77,166,255,.5);transform:translateX(4px);}',
    '.mi-ri-poster{width:44px;height:62px;border-radius:5px;object-fit:cover;background:rgba(255,255,255,.07);flex-shrink:0;}',
    '.mi-ri-poster-ph{width:44px;height:62px;border-radius:5px;background:rgba(255,255,255,.06);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;}',
    '.mi-ri-body{flex:1;min-width:0;}',
    '.mi-ri-title{color:#fff;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.mi-ri-meta{color:rgba(255,255,255,.45);font-size:12px;margin-top:3px;}',
    '.mi-ri-conf{font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:rgba(77,166,255,.18);color:#7dc6ff;flex-shrink:0;}',

    '#mi-footer{display:flex;gap:10px;justify-content:flex-end;}',
    '.mi-fbtn{padding:8px 20px;border-radius:20px;cursor:pointer;font-size:14px;font-weight:600;border:none;transition:transform .12s,background .15s;}',
    '.mi-fbtn:hover,.mi-fbtn.selected{transform:scale(1.05);}',
    '#mi-btn-cancel{background:rgba(255,255,255,.1);color:#fff;}',
    '#mi-btn-search{background:linear-gradient(135deg,#1a8cff,#0055cc);color:#fff;}',
    '#mi-btn-search:disabled{opacity:.4;pointer-events:none;}',
    '.mi-msg{color:rgba(255,255,255,.5);text-align:center;padding:18px 0;font-size:14px;}',
    '.mi-err{color:#ff6b6b;text-align:center;font-size:13px;}',
  ].join('');

  /* ══════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════ */
  function $q(s){ return document.querySelector(s); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];}); }

  /* ══════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════ */
  var st = { file: null };

  /* ══════════════════════════════════════════════
     CSS INJECT
  ══════════════════════════════════════════════ */
  function injectCSS(){
    if (document.getElementById('mi-css')) return;
    var s = document.createElement('style');
    s.id = 'mi-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════
     BUILD OVERLAY
  ══════════════════════════════════════════════ */
  function buildOverlay(){
    if (document.getElementById('mi-overlay')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div id="mi-overlay">',
        '<div id="mi-card">',
          '<h2>',SVG_CAM,' Пошук за <em>фото</em></h2>',
          '<div id="mi-drop" tabindex="0" role="button">',
            '<input type="file" id="mi-file" accept="image/*" tabindex="-1">',
            '<img id="mi-drop-preview" alt="">',
            '<div id="mi-drop-icon">📷</div>',
            '<div id="mi-drop-label">Натисніть або перетягніть скріншот</div>',
            '<div id="mi-drop-hint" style="font-size:11px;color:rgba(255,255,255,.25)">JPEG · PNG · WEBP</div>',
          '</div>',
          '<div id="mi-loader"><div class="mi-spin"></div><span>Аналізую зображення…</span></div>',
          '<div id="mi-results"></div>',
          '<div id="mi-footer">',
            '<button class="mi-fbtn selector" id="mi-btn-cancel">Закрити</button>',
            '<button class="mi-fbtn selector" id="mi-btn-search" disabled>🔍 Шукати</button>',
          '</div>',
        '</div>',
      '</div>',
    ].join('');
    document.body.appendChild(wrap.firstElementChild);
    bindOverlayEvents();
  }

  /* ══════════════════════════════════════════════
     OPEN / CLOSE / RESET
  ══════════════════════════════════════════════ */
  function openOverlay(){
    buildOverlay();
    resetUI();
    var ov = $q('#mi-overlay');
    if (ov) { ov.classList.add('mi-show'); }
    setTimeout(function(){ var b=$q('#mi-btn-cancel'); b&&b.focus(); }, 80);
  }

  function closeOverlay(){
    var ov = $q('#mi-overlay');
    if (ov) ov.classList.remove('mi-show');
  }

  function resetUI(){
    st.file = null;
    var r=$q('#mi-results');       if(r) r.innerHTML='';
    var l=$q('#mi-loader');        if(l) l.classList.remove('mi-show');
    var p=$q('#mi-drop-preview');  if(p){p.style.display='none';p.src='';}
    var i=$q('#mi-drop-icon');     if(i){i.style.display='';i.textContent='📷';}
    var b=$q('#mi-drop-label');    if(b){b.style.display='';b.textContent='Натисніть або перетягніть скріншот';}
    var h=$q('#mi-drop-hint');     if(h) h.style.display='';
    var s=$q('#mi-btn-search');    if(s) s.disabled=true;
  }

  /* ══════════════════════════════════════════════
     FILE HANDLER
  ══════════════════════════════════════════════ */
  function handleFile(file){
    if (!file||!file.type.startsWith('image/')) return;
    st.file = file;
    var reader = new FileReader();
    reader.onload = function(e){
      var src = e.target.result;
      var p=$q('#mi-drop-preview'); if(p){p.src=src;p.style.display='block';}
      var i=$q('#mi-drop-icon');    if(i) i.style.display='none';
      var b=$q('#mi-drop-label');   if(b) b.textContent=file.name;
      var h=$q('#mi-drop-hint');    if(h) h.style.display='none';
      var s=$q('#mi-btn-search');   if(s){s.disabled=false;s.focus();}
    };
    reader.readAsDataURL(file);
  }

  /* ══════════════════════════════════════════════
     BIND OVERLAY
  ══════════════════════════════════════════════ */
  function bindOverlayEvents(){
    var ov = $q('#mi-overlay');
    var fi = $q('#mi-file');
    var dr = $q('#mi-drop');
    var bc = $q('#mi-btn-cancel');
    var bs = $q('#mi-btn-search');

    if(bc) bc.addEventListener('click', closeOverlay);
    if(bs) bs.addEventListener('click', doSearch);
    if(ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeOverlay(); });
    if(fi) fi.addEventListener('change', function(){ if(fi.files&&fi.files[0]) handleFile(fi.files[0]); });

    if(dr){
      dr.addEventListener('dragover',  function(e){ e.preventDefault(); dr.classList.add('mi-dg'); });
      dr.addEventListener('dragleave', function(){ dr.classList.remove('mi-dg'); });
      dr.addEventListener('drop', function(e){
        e.preventDefault(); dr.classList.remove('mi-dg');
        var f=e.dataTransfer&&e.dataTransfer.files;
        if(f&&f[0]) handleFile(f[0]);
      });
      dr.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') fi&&fi.click(); });
    }

    document.addEventListener('keydown', function(e){
      if(e.key==='Escape'&&$q('#mi-overlay.mi-show')) closeOverlay();
    });
  }

  /* ══════════════════════════════════════════════
     SEARCH
  ══════════════════════════════════════════════ */
  function doSearch(){
    if (!st.file) return;
    var l=$q('#mi-loader'); if(l) l.classList.add('mi-show');
    var r=$q('#mi-results'); if(r) r.innerHTML='';
    var s=$q('#mi-btn-search'); if(s) s.disabled=true;

    var fd = new FormData();
    fd.append('image', st.file);

    fetch('https://www.movie-identifier.com/identify', {
      method:'POST', headers:{'Accept':'application/json'}, body:fd,
    })
    .then(function(res){ if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); })
    .then(function(data){
      var l2=$q('#mi-loader'); if(l2) l2.classList.remove('mi-show');
      var s2=$q('#mi-btn-search'); if(s2) s2.disabled=false;
      renderResults(data);
    })
    .catch(function(err){
      console.warn('[MI] fetch error:',err);
      var l2=$q('#mi-loader'); if(l2) l2.classList.remove('mi-show');
      var s2=$q('#mi-btn-search'); if(s2) s2.disabled=false;
      fallback();
    });
  }

  function fallback(){
    var r=$q('#mi-results');
    if(r) r.innerHTML='<div class="mi-err">Прямий запит заблоковано (CORS).<br>Відкриваємо movie-identifier.com…</div>';
    setTimeout(function(){ window.open('https://www.movie-identifier.com/','_blank'); },1000);
  }

  /* ══════════════════════════════════════════════
     RENDER RESULTS
  ══════════════════════════════════════════════ */
  function renderResults(data){
    var r=$q('#mi-results'); if(!r) return;
    var items=[];
    if (Array.isArray(data)) items=data;
    else if(data&&Array.isArray(data.results)) items=data.results;
    else if(data&&(data.title||data.name)) items=[data];

    if(!items.length){ r.innerHTML='<div class="mi-msg">Нічого не знайдено 😔</div>'; return; }

    var html='';
    items.slice(0,8).forEach(function(item,i){
      var title=esc(item.title||item.name||'Невідомо');
      var year=item.year||(item.release_date&&item.release_date.slice(0,4))||'';
      var type=item.media_type==='tv'?'Серіал':item.media_type==='movie'?'Фільм':(item.type||'');
      var conf=item.confidence?Math.round(item.confidence*100)+'%':(item.vote_average?'★ '+item.vote_average:'');
      var img=item.poster_path?'https://image.tmdb.org/t/p/w92'+item.poster_path:(item.poster||'');
      var poster=img
        ?'<img class="mi-ri-poster" src="'+img+'" alt="" loading="lazy">'
        :'<div class="mi-ri-poster-ph">🎬</div>';
      html+='<div class="mi-ri selector" data-i="'+i+'" tabindex="0">'+poster+'<div class="mi-ri-body"><div class="mi-ri-title">'+title+'</div><div class="mi-ri-meta">'+[type,year].filter(Boolean).join(' · ')+'</div></div>'+(conf?'<div class="mi-ri-conf">'+conf+'</div>':'')+'</div>';
    });
    r.innerHTML=html;

    r.querySelectorAll('.mi-ri').forEach(function(el){
      var idx=parseInt(el.getAttribute('data-i'),10);
      el.addEventListener('click', function(){ openInLampa(items[idx]); });
      el.addEventListener('keydown', function(e){ if(e.key==='Enter') openInLampa(items[idx]); });
    });
  }

  /* ══════════════════════════════════════════════
     OPEN IN LAMPA
  ══════════════════════════════════════════════ */
  function openInLampa(item){
    var title=item.title||item.name||'';
    closeOverlay();
    try{
      if(item.id&&item.media_type&&window.Lampa&&Lampa.Activity){
        Lampa.Activity.push({component:'full',id:item.id,method:item.media_type,card:item,source:'tmdb'});
        return;
      }
    }catch(e){}
    try{
      if(window.Lampa){
        if(Lampa.Search) Lampa.Search.open(title);
        else Lampa.Activity.push({component:'search',search:title,search_auto:true});
      }
    }catch(e){ console.warn('[MI]',e); }
  }

  /* ══════════════════════════════════════════════
     ADD BUTTON TO HEAD
     Lampa uses .head element; we try many selectors
  ══════════════════════════════════════════════ */
  function addHeaderButton(){
    if (document.getElementById('mi-head-btn')) return;

    // All known Lampa head zones (ordered by specificity)
    var zones = [
      '.head .head__right',
      '.head .head__menu',
      '.head',
      '.header__right',
      '.header .header__icons',
      '.header',
      'header',
    ];

    var target = null;
    for (var i=0; i<zones.length; i++){
      var el = document.querySelector(zones[i]);
      if (el){ target=el; break; }
    }

    if (!target){
      console.log('[MI] Head container not found yet, will retry…');
      return false;
    }

    var btn = document.createElement('div');
    btn.id        = 'mi-head-btn';
    btn.className = 'selector';
    btn.setAttribute('tabindex','0');
    btn.setAttribute('role','button');
    btn.innerHTML  = SVG_CAM + '<span style="margin-left:5px">'+PLUGIN_TITLE+'</span>';

    btn.addEventListener('click', openOverlay);
    btn.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ') openOverlay(); });

    target.insertBefore(btn, target.firstChild);
    console.log('[MI] Button injected →', target.className||target.tagName);
    return true;
  }

  /* ══════════════════════════════════════════════
     WATCH DOM (MutationObserver + interval fallback)
  ══════════════════════════════════════════════ */
  function watchHead(){
    if (typeof MutationObserver !== 'undefined'){
      var obs = new MutationObserver(function(){
        if (!document.getElementById('mi-head-btn')) addHeaderButton();
      });
      obs.observe(document.documentElement, {childList:true, subtree:true});
    }

    var tries=0, iv=setInterval(function(){
      tries++;
      if (tries>120){ clearInterval(iv); return; }
      if (document.getElementById('mi-head-btn')){ clearInterval(iv); return; }
      addHeaderButton();
    }, 500);
  }

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init(){
    injectCSS();
    buildOverlay();
    addHeaderButton();
    watchHead();

    if (window.Lampa && Lampa.Listener){
      Lampa.Listener.follow('app', function(e){
        if (e.type==='ready'||e.type==='start'){
          setTimeout(addHeaderButton, 300);
        }
      });
    }

    // Register as Lampa component (shows in main menu)
    if (window.Lampa && Lampa.Component){
      try{
        Lampa.Component.add(PLUGIN_KEY,{
          name:PLUGIN_TITLE, icon:SVG_CAM, launch:openOverlay,
        });
      }catch(e){}
    }

    console.log('[MovieIdentifier] v2 loaded ✓');
  }

  /* ══════════════════════════════════════════════
     BOOT – wait for Lampa if needed
  ══════════════════════════════════════════════ */
  function boot(){
    if (window.Lampa && Lampa.Listener){
      Lampa.Listener.follow('app', function(e){
        if(e.type==='ready') init();
      });
      // Safety fallback if event already fired
      setTimeout(init, 1500);
    } else {
      var tries=0, iv=setInterval(function(){
        tries++;
        if(window.Lampa||tries>100){ clearInterval(iv); init(); }
      },200);
    }
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
