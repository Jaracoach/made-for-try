/* buildAthleteHTML(plan, libIndex) -> full self-contained HTML string.
   libIndex: { exercise_id: {name, source_title, grupo, media(dataURI), cues[]} }
   Estático legible SIN JS + reproductor guiado CON JS. */
function buildAthleteHTML(plan, libIndex){
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function dose(e){return e.mode==='TIME' ? (e.target+' s') : (e.target+' reps');}
  function progLabel(s){return s.progression==='VERTICAL' ? 'Por estaciones (vertical)' : 'Circuito (horizontal)';}
  function methodLine(s){
    var parts=[progLabel(s), s.series+' '+(s.series==1?'serie':'series')];
    if(s.progression==='VERTICAL'){ parts.push('descanso '+s.rest_series+' s entre series'); if(s.exercises.length>1) parts.push(s.rest_exercises+' s al cambiar de ejercicio'); }
    else { if(s.exercises.length>1) parts.push('descanso '+s.rest_exercises+' s entre ejercicios'); if(s.series>1) parts.push(s.rest_series+' s entre vueltas'); }
    return parts.join(' · ');
  }
  // collect used media
  var used={};
  plan.sessions.forEach(function(s){ s.exercises.forEach(function(e){ used[e.exercise_id]=true; }); });
  var MEDIA={};
  Object.keys(used).forEach(function(id){ var l=libIndex[id]||{}; MEDIA[id]={name:l.name||id, source_title:l.source_title||'', grupo:l.grupo||'', media:l.media||'', cues:l.cues||[]}; });

  // ---- static (no-JS) render ----
  function staticSession(s, idx){
    var head='<div class="s-head"><div class="s-kicker">Sesión '+(idx+1)+(s.date?(' · '+esc(s.date)):'')+'</div><h2 class="s-name">'+esc(s.name)+'</h2>'+
      '<div class="s-method">'+esc(methodLine(s))+'</div>'+
      (s.muscle_groups&&s.muscle_groups.length?'<div class="s-groups">'+s.muscle_groups.map(function(g){return '<span class="g">'+esc(g)+'</span>';}).join('')+'</div>':'')+
      '<button class="start-btn" data-si="'+idx+'">▶ Iniciar sesión guiada</button>'+
      '<span class="start-hint needjs">¿El botón no reacciona? Ábrelo en tu navegador (⋯ → «Abrir en el navegador»).</span>'+
      '<div class="done-badge" id="done-'+idx+'" hidden></div></div>';
    var items=s.exercises.map(function(e,i){
      var m=MEDIA[e.exercise_id]||{}; var fl=e.flip?' style="transform:scaleX(-1)"':'';
      var img=m.media?('<img loading="lazy"'+fl+' src="'+m.media+'" alt="'+esc(e.name)+'">'):'<div class="noimg">sin imagen</div>';
      var cues=(m.cues&&m.cues.length)?'<ul class="cues">'+m.cues.map(function(c){return '<li>'+esc(c)+'</li>';}).join('')+'</ul>':'';
      var note=e.note?('<div class="ex-note">'+esc(e.note)+'</div>'):'';
      var mtag=e.flip?' <span class="mirtag">⇋ espejo</span>':'';
      return '<article class="ex"><div class="ex-n">'+(i+1)+'</div><div class="ex-media">'+img+'</div>'+
        '<div class="ex-body"><div class="ex-name">'+esc(e.name)+mtag+'</div>'+
        '<div class="ex-dose"><b>'+s.series+' × '+esc(dose(e))+'</b>'+(m.grupo?(' · '+esc(m.grupo)):'')+'</div>'+note+cues+'</div></article>';
    }).join('');
    return '<section class="s-card">'+head+'<div class="ex-list">'+items+'</div></section>';
  }
  var staticHTML=plan.sessions.map(staticSession).join('');

  var PLAN_JSON=JSON.stringify(plan).replace(/<\//g,'<\\/'), MEDIA_JSON=JSON.stringify(MEDIA).replace(/<\//g,'<\\/');

  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'+
  '<title>'+esc(plan.title||'Entrenamiento de fuerza')+' · Made For Try</title>'+
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'+
  '<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'+
  '<style>'+CSS+'</style></head><body>'+
  '<div class="wrap"><header class="top"><div class="eyebrow">Made For Try · Entrenamiento de fuerza</div>'+
  '<h1 class="title">'+esc(plan.title||'Tu entrenamiento')+'</h1>'+
  (plan.athlete_name?'<div class="who">Para: '+esc(plan.athlete_name)+'</div>':'')+
  '<div class="hint">Funciona en el <b>celular</b> y en el computador, sin conexión. Para el cronómetro, los descansos automáticos y el sonido, ábrelo en tu <b>navegador</b> (Chrome/Safari) y toca <b>Iniciar sesión guiada</b> — la pantalla se mantiene encendida durante el entrenamiento. Si lo abriste desde la vista previa de WhatsApp y los botones no responden, usa el menú <b>“Abrir en el navegador”</b>. Aun como lista, tienes tu rutina completa con los videos.</div>'+
  '<div class="openbrowser needjs"><span class="ob-t">▶ Para el cronómetro, abre en el navegador</span>Estás viendo la <b>vista previa</b> (WhatsApp, Archivos o Vista rápida) y ahí el <b>cronómetro no funciona</b>. En el <b>celular</b>: toca el menú <b>compartir</b> o <b>⋯</b> y elige <u>«Abrir en el navegador»</u> (Safari o Chrome). En el <b>computador</b>: ábrelo con doble clic. Después toca <b>Iniciar sesión guiada</b>.</div>'+
  '<noscript><div class="noscript">Estás viendo la versión de solo lectura. Para el modo guiado con cronómetro, abre este archivo en tu navegador (Chrome o Safari).</div></noscript></header>'+
  staticHTML+
  '<footer class="foot">Made For Try · Plan hecho por tu entrenador. Calienta antes de empezar y escucha a tu cuerpo: si algo duele o te mareas, detente. Si tienes una lesión o condición médica, consúltalo con tu entrenador antes de realizarlo.</footer></div>'+
  '<div class="player" id="player" aria-hidden="true"><div class="p-inner">'+
    '<button class="p-exit" id="pExit" aria-label="Salir">✕</button>'+
    '<div class="p-progress"><div class="p-bar" id="pBar"></div></div>'+
    '<div class="p-stage" id="pStage"></div>'+
    '<div class="p-controls" id="pControls"></div>'+
  '</div></div>'+
  '<script>var PLAN='+PLAN_JSON+';var MEDIA='+MEDIA_JSON+';'+PLAYER_JS+'</script>'+
  '</body></html>';
}

var CSS = [
"*{margin:0;padding:0;box-sizing:border-box}",
"html{-webkit-text-size-adjust:100%}",
"body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(1200px 700px at 78% -12%,#26143d 0,rgba(38,20,61,0) 58%),radial-gradient(900px 600px at 5% 8%,#1a1030 0,rgba(26,16,48,0) 55%),#0C0A11;color:#ECE9F2;line-height:1.5;padding:clamp(16px,4vw,44px);min-height:100vh}",
".wrap{max-width:820px;margin:0 auto}",
".eyebrow{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#AE52F4;margin-bottom:12px}",
".title{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(34px,7vw,60px);line-height:.95;text-transform:uppercase}",
".who{color:#8B8399;margin-top:6px;font-size:15px}",
".hint{color:#C6B7EA;background:rgba(174,82,244,.08);border:1px solid #2A2338;border-radius:12px;padding:12px 14px;margin-top:16px;font-size:13.5px}",
".hint b{color:#ECE9F2}",
".noscript{color:#F5B544;border:1px solid #F5B544;border-radius:10px;padding:10px 12px;margin-top:12px;font-size:13px}",
"html[data-js='1'] .needjs{display:none!important}",
".openbrowser{display:block;margin-top:14px;color:#0c0a11;background:#F5B544;border-radius:12px;padding:14px 16px;font-size:14px;font-weight:600;line-height:1.5}",
".openbrowser .ob-t{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:17px;text-transform:uppercase;display:block;margin-bottom:4px}",
".openbrowser u{text-underline-offset:2px}",
".start-hint{display:block;margin-top:8px;font-family:'Space Mono',monospace;font-size:11.5px;color:#F5B544;line-height:1.45}",
".s-card{margin-top:26px;background:#141019;border:1px solid #2A2338;border-radius:18px;padding:clamp(16px,3vw,24px)}",
".s-kicker{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B8399}",
".s-name{font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:clamp(24px,4vw,34px);text-transform:uppercase;line-height:1.02;margin-top:4px}",
".s-method{font-family:'Space Mono',monospace;font-size:12px;color:#38C6E4;margin-top:8px}",
".s-groups{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
".s-groups .g{font-family:'Space Mono';font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8B8399;border:1px solid #2A2338;border-radius:999px;padding:3px 9px}",
".start-btn{margin-top:16px;font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700;color:#0c0a11;background:#47D98D;border:0;border-radius:12px;padding:12px 18px;cursor:pointer}",
".start-btn:hover{filter:brightness(1.05)}",
".done-badge{margin-top:10px;font-family:'Space Mono';font-size:11px;color:#47D98D}",
".ex-list{display:flex;flex-direction:column;gap:12px;margin-top:18px}",
".ex{display:grid;grid-template-columns:26px 96px 1fr;gap:12px;align-items:start;background:#0f0c16;border:1px solid #2A2338;border-radius:14px;padding:12px}",
".ex-n{font-family:'Saira Condensed';font-weight:800;font-size:20px;color:#AE52F4;text-align:center}",
".ex-media{width:96px;height:96px;border-radius:10px;overflow:hidden;background:#0a0810}",
".ex-media img{width:100%;height:100%;object-fit:cover;display:block}",
".noimg{display:flex;align-items:center;justify-content:center;height:100%;color:#8B8399;font-size:10px;font-family:'Space Mono'}",
".ex-name{font-family:'Saira Condensed',sans-serif;font-weight:700;font-size:18px;text-transform:uppercase;line-height:1.05}",
".ex-dose{font-family:'Space Mono',monospace;font-size:12px;color:#8B8399;margin-top:3px}",
".ex-dose b{color:#38C6E4}",
".ex-note{font-family:'Space Mono',monospace;font-size:12px;color:#F5B544;margin-top:6px;background:rgba(245,181,68,.08);border:1px solid #2A2338;border-radius:8px;padding:6px 9px}",
".mirtag{font-family:'Space Mono',monospace;font-size:10px;color:#38C6E4;border:1px solid #2A2338;border-radius:6px;padding:1px 6px;white-space:nowrap}",
".p-note{font-family:'Space Mono',monospace;font-size:13px;color:#F5B544;background:rgba(245,181,68,.1);border-radius:10px;padding:8px 14px;max-width:44ch}",
".cues{list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:4px}",
".cues li{font-size:12.5px;color:#C6B7EA;display:flex;gap:7px}",
".cues li::before{content:'›';color:#47D98D;font-weight:700}",
".foot{margin-top:34px;padding-top:18px;border-top:1px solid #2A2338;color:#8B8399;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.04em}",
/* player */
".player{position:fixed;inset:0;background:#0C0A11;display:none;z-index:80}",
".player.open{display:block}",
".p-inner{max-width:640px;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:clamp(14px,4vw,28px)}",
".p-exit{position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:12px;border:1px solid #2A2338;background:transparent;color:#ECE9F2;font-size:18px;cursor:pointer}",
".p-progress{height:6px;background:#1E1829;border-radius:999px;overflow:hidden;margin:34px 0 10px}",
".p-bar{height:100%;width:0;background:#AE52F4;transition:width .3s}",
".p-stage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;min-height:0}",
".p-phase{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8B8399}",
".p-name{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(26px,6vw,40px);text-transform:uppercase;line-height:1}",
".p-media{width:min(320px,72vw);aspect-ratio:1;border-radius:16px;overflow:hidden;background:#0a0810;border:1px solid #2A2338}",
".p-media img{width:100%;height:100%;object-fit:cover;display:block}",
".p-serie{font-family:'Space Mono',monospace;font-size:13px;color:#38C6E4;letter-spacing:.06em}",
".p-timer{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(64px,20vw,120px);line-height:1;font-variant-numeric:tabular-nums}",
".p-timer.rest{color:#38C6E4}",
".p-target{font-family:'Saira Condensed',sans-serif;font-weight:800;font-size:clamp(40px,12vw,84px);color:#F5B544;line-height:1}",
".p-cues{color:#C6B7EA;font-size:13px;max-width:44ch;display:flex;flex-direction:column;gap:3px}",
".p-next{color:#8B8399;font-family:'Space Mono';font-size:12px}",
".p-controls{display:flex;gap:10px;justify-content:center;padding:14px 0 4px;flex-wrap:wrap}",
".p-btn{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.04em;text-transform:uppercase;font-weight:700;border-radius:12px;padding:14px 20px;cursor:pointer;border:1px solid #2A2338;background:#141019;color:#ECE9F2}",
".p-btn.primary{background:#47D98D;color:#0c0a11;border-color:transparent}",
".p-btn.big{flex:1;min-width:180px;font-size:15px}",
".p-done{font-family:'Saira Condensed';font-weight:800;font-size:clamp(30px,7vw,46px);text-transform:uppercase;color:#47D98D}",
"@media (prefers-reduced-motion:reduce){.p-bar{transition:none}}"
].join("\n");

var PLAYER_JS = [
"(function(){",
"var root=document.documentElement; root.setAttribute('data-js','1');",
"var AC=null;function audioInit(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC&&AC.state==='suspended')AC.resume();}catch(e){}}",
"function beep(f,d,type){try{if(!AC)return;var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(0.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.35,AC.currentTime+0.01);g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+d);o.start();o.stop(AC.currentTime+d+0.02);}catch(e){}}",
"var wake=null;function wakeOn(){try{if(navigator.wakeLock&&player.classList.contains('open'))navigator.wakeLock.request('screen').then(function(w){wake=w;}).catch(function(){});}catch(e){}}",
"function wakeOff(){try{if(wake){wake.release();wake=null;}}catch(e){}}",
"function goFS(){try{if(player.requestFullscreen)player.requestFullscreen().catch(function(){});}catch(e){}}",
"function exitFS(){try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});}catch(e){}}",
"var player=document.getElementById('player'),stage=document.getElementById('pStage'),controls=document.getElementById('pControls'),bar=document.getElementById('pBar');",
"function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}",
"function keyDone(si){var s=PLAN.sessions[si];return 'mft_done_'+PLAN.plan_id+'_'+s.session_id;}",
"function getDone(si){try{return localStorage.getItem(keyDone(si));}catch(e){return null;}}",
"function setDone(si){try{localStorage.setItem(keyDone(si),new Date().toISOString());}catch(e){}}",
"function refreshBadges(){PLAN.sessions.forEach(function(s,si){var d=getDone(si),el=document.getElementById('done-'+si);if(el){if(d){el.hidden=false;el.textContent='✓ Marcada como hecha';}else{el.hidden=true;}}});}",
"function buildSteps(s){var steps=[],S=s.series,ex=s.exercises;",
"  function work(e,se){return {kind:'work',e:e,serie:se,series:S};}",
"  function rest(sec,label,nextName){return {kind:'rest',sec:sec,label:label,next:nextName};}",
"  if(s.progression==='VERTICAL'){",
"    for(var i=0;i<ex.length;i++){for(var se=1;se<=S;se++){steps.push(work(ex[i],se));",
"      if(se<S)steps.push(rest(s.rest_series,'Descanso',ex[i].name));",
"      else if(i<ex.length-1)steps.push(rest(s.rest_exercises,'Cambio de ejercicio',ex[i+1].name));}}",
"  } else {",
"    for(var se=1;se<=S;se++){for(var i=0;i<ex.length;i++){steps.push(work(ex[i],se));",
"      if(i<ex.length-1)steps.push(rest(s.rest_exercises,'Descanso',ex[i+1].name));",
"      else if(se<S)steps.push(rest(s.rest_series,'Descanso · vuelta '+(se+1),ex[0].name));}}",
"  } return steps;}",
"var cur=null;",
"function start(si){var s=PLAN.sessions[si];cur={si:si,s:s,steps:buildSteps(s),i:0,timer:null,remain:0,paused:false};player.classList.add('open');player.setAttribute('aria-hidden','false');audioInit();wakeOn();goFS();render();}",
"function stop(){if(cur&&cur.timer)clearInterval(cur.timer);cur=null;player.classList.remove('open');player.setAttribute('aria-hidden','true');wakeOff();exitFS();refreshBadges();}",
"function vib(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}",
"function fmt(n){n=Math.max(0,Math.round(n));var m=Math.floor(n/60),s=n%60;return m>0?(m+':'+(s<10?'0':'')+s):(''+s);}",
"function setBar(){bar.style.width=(cur.steps.length?((cur.i)/cur.steps.length*100):0)+'%';}",
"function clearTimer(){if(cur.timer){clearInterval(cur.timer);cur.timer=null;}}",
"function next(){clearTimer();cur.i++;render();}",
"function render(){setBar();var st=cur.steps[cur.i];if(!st){return finish();}",
"  if(st.kind==='work'){renderWork(st);}else{renderRest(st);}}",
"function mediaBox(e){var m=MEDIA[e.exercise_id]||{};var f=e.flip?' style=\"transform:scaleX(-1)\"':'';return m.media?('<div class=\"p-media\"><img'+f+' src=\"'+m.media+'\" alt=\"\"></div>'):'';}",
"function renderWork(st){var e=st.e,m=MEDIA[e.exercise_id]||{};",
"  var cues=(m.cues&&m.cues.length)?('<div class=\"p-cues\">'+m.cues.slice(0,3).map(function(c){return '<div>› '+esc(c)+'</div>';}).join('')+'</div>'):'';",
"  var note=e.note?('<div class=\"p-note\">'+esc(e.note)+'</div>'):'';",
"  var nm=esc(e.name)+(e.flip?' <span class=\"mirtag\">⇋ espejo</span>':'');",
"  var serie='<div class=\"p-serie\">Serie '+st.serie+' / '+st.series+'</div>';",
"  if(e.mode==='TIME'){",
"    stage.innerHTML='<div class=\"p-phase\">Trabajo</div>'+mediaBox(e)+'<div class=\"p-name\">'+nm+'</div>'+serie+note+'<div class=\"p-timer\" id=\"tmr\">'+fmt(e.target)+'</div>'+cues;",
"    controls.innerHTML='<button class=\"p-btn\" id=\"pause\">Pausa</button><button class=\"p-btn\" id=\"skip\">Saltar</button>';",
"    document.getElementById('skip').onclick=next;document.getElementById('pause').onclick=togglePause;",
"    startCountdown(e.target,function(){beep(880,0.18,'square');vib(200);next();});",
"  } else {",
"    stage.innerHTML='<div class=\"p-phase\">Trabajo</div>'+mediaBox(e)+'<div class=\"p-name\">'+nm+'</div>'+serie+note+'<div class=\"p-target\">'+e.target+' reps</div>'+cues;",
"    controls.innerHTML='<button class=\"p-btn primary big\" id=\"doneSet\">Serie completada ✓</button>';",
"    document.getElementById('doneSet').onclick=function(){beep(700,0.1);vib(120);next();};",
"  }}",
"function renderRest(st){",
"  stage.innerHTML='<div class=\"p-phase\">Descanso</div><div class=\"p-name\">'+esc(st.label)+'</div><div class=\"p-timer rest\" id=\"tmr\">'+fmt(st.sec)+'</div>'+(st.next?('<div class=\"p-next\">Sigue: '+esc(st.next)+'</div>'):'');",
"  controls.innerHTML='<button class=\"p-btn\" id=\"pause\">Pausa</button><button class=\"p-btn primary\" id=\"skip\">Saltar descanso</button>';",
"  document.getElementById('skip').onclick=next;document.getElementById('pause').onclick=togglePause;",
"  startCountdown(st.sec,function(){beep(880,0.18,'square');vib(200);next();});}",
"function startCountdown(sec,onEnd){cur.remain=sec;cur.paused=false;cur.onEnd=onEnd;clearTimer();",
"  cur.timer=setInterval(function(){if(cur.paused)return;cur.remain--;var t=document.getElementById('tmr');if(t)t.textContent=fmt(cur.remain);if(cur.remain<=3&&cur.remain>0)beep(660,0.07,'sine');if(cur.remain<=0){clearTimer();onEnd();}},1000);}",
"function togglePause(){cur.paused=!cur.paused;var b=document.getElementById('pause');if(b)b.textContent=cur.paused?'Reanudar':'Pausa';}",
"function finish(){clearTimer();setBar();bar.style.width='100%';setDone(cur.si);beep(523,0.12);setTimeout(function(){beep(659,0.12);},130);setTimeout(function(){beep(784,0.22);},280);",
"  stage.innerHTML='<div class=\"p-done\">¡Sesión completada!</div><div class=\"p-next\">Buen trabajo. Registrada como hecha en este dispositivo.</div>';",
"  controls.innerHTML='<button class=\"p-btn primary big\" id=\"close\">Cerrar</button>';document.getElementById('close').onclick=stop;vib([120,60,120]);}",
"document.getElementById('pExit').onclick=stop;",
"document.addEventListener('keydown',function(e){if(e.key==='Escape'&&player.classList.contains('open'))stop();});",
"document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&player.classList.contains('open'))wakeOn();});",
"[].slice.call(document.querySelectorAll('.start-btn')).forEach(function(b){b.onclick=function(){start(+b.getAttribute('data-si'));};});",
"refreshBadges();",
"})();"
].join("\n");

if(typeof module!=='undefined'){module.exports={buildAthleteHTML:buildAthleteHTML};}
