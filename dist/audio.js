/* Original background score, procedural ambience and cues; no autoplay. */
(function(){
  'use strict';
  var Context=window.AudioContext||window.webkitAudioContext;
  var context=null,master=null,noiseBuffer=null,ambience=null;
  var muted=false,active=false,unlocked=false,night=1,resuming=null,platformPaused=false;
  var effects=[];
  var music=document.getElementById('background-music'),musicState='ready',musicAttempt=0,api;
  function notify(){if(api&&typeof api.onStatusChange==='function')api.onStatusChange()}
  function status(){return muted?'muted':musicState}
  function startMusic(){
    if(!music)return;
    music.volume=.8;
    // Keep a real load failure visible until an explicit unmute/replay retry.
    if(music.error){musicState='failed';notify();return}
    if(!music.paused)return;
    var request=++musicAttempt;
    musicState='loading';notify();
    try{
      var pending=music.play();
      if(pending)pending.then(function(){
        if(request!==musicAttempt)return;
        if(muted||!active||document.hidden||platformPaused){music.pause();return}
        musicState='playing';notify();
      },function(error){
        if(request!==musicAttempt)return;
        if(muted||!active||document.hidden||platformPaused)return;
        musicState=error.name==='NotAllowedError'?'blocked':'failed';notify();
      });
    }catch(e){musicState='failed';notify()}
  }
  if(music){
    music.addEventListener('playing',function(){
      if(muted||!active||document.hidden||platformPaused){music.pause();return}
      musicState='playing';notify();
    });
    music.addEventListener('waiting',function(){if(active&&!muted&&!music.error){musicState='loading';notify()}});
    music.addEventListener('pause',function(){
      if(!active)musicState='stopped';
      else if(music.error)musicState='failed';
      else if(musicState!=='blocked'&&musicState!=='failed')musicState='paused';
      notify();
    });
    music.addEventListener('error',function(){musicAttempt++;music.pause();musicState='failed';notify()});
  }

  function ramp(param,value,seconds){
    var now=context.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value,now);
    param.linearRampToValueAtTime(value,now+seconds);
  }
  function ensureContext(){
    if(context)return true;
    if(typeof Context!=='function')return false;
    try{
      context=new Context();
      master=context.createGain();master.gain.value=0;
      var limiter=context.createDynamicsCompressor();
      limiter.threshold.value=-14;limiter.knee.value=8;limiter.ratio.value=6;
      limiter.attack.value=.005;limiter.release.value=.2;
      master.connect(limiter);limiter.connect(context.destination);
      return true;
    }catch(e){
      if(context)try{context.close().catch(function(){})}catch(err){}
      context=null;master=null;return false;
    }
  }
  function resume(){
    if(!context||context.state==='running'||resuming)return;
    try{
      resuming=context.resume();
      resuming.then(function(){
        resuming=null;
        if(muted||document.hidden||platformPaused)pause();
      },function(){resuming=null});
    }catch(e){resuming=null}
  }
  function pause(){
    musicAttempt++;if(music)music.pause();
    if(!context||context.state==='closed')return;
    try{context.suspend().catch(function(){})}catch(e){}
  }
  function noise(){
    if(noiseBuffer)return noiseBuffer;
    noiseBuffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate);
    var data=noiseBuffer.getChannelData(0),last=0;
    for(var i=0;i<data.length;i++){
      last=(last+.035*(Math.random()*2-1))/1.025;
      var edge=Math.min(1,i/1024,(data.length-1-i)/1024);
      data[i]=last*3*edge;
    }
    return noiseBuffer;
  }
  function startAmbience(){
    if(ambience)return;
    var hum=context.createOscillator(),harmonic=context.createOscillator();
    var humGain=context.createGain(),harmonicGain=context.createGain();
    hum.type='sine';hum.frequency.value=110+(night-1)*1.5;humGain.gain.value=.025;
    harmonic.type='sine';harmonic.frequency.value=218.5;harmonicGain.gain.value=.012;
    hum.connect(humGain);humGain.connect(master);
    harmonic.connect(harmonicGain);harmonicGain.connect(master);
    var fan=context.createBufferSource(),filter=context.createBiquadFilter(),fanGain=context.createGain();
    fan.buffer=noise();fan.loop=true;filter.type='lowpass';filter.frequency.value=650+(night-1)*90;
    fanGain.gain.value=.045;fan.connect(filter);filter.connect(fanGain);fanGain.connect(master);
    hum.start();harmonic.start();fan.start();
    ambience={sources:[hum,harmonic,fan],nodes:[hum,humGain,harmonic,harmonicGain,fan,filter,fanGain],hum:hum,filter:filter};
  }
  function start(){
    if(muted||document.hidden||platformPaused)return false;
    active=true;unlocked=true;
    startMusic();
    if(ensureContext()){startAmbience();ramp(master.gain,.72,.12);resume();return true}
    return !!music;
  }
  function track(source,nodes){
    var item={source:source,nodes:nodes};effects.push(item);
    source.onended=function(){
      item.nodes.forEach(function(node){node.disconnect()});
      effects=effects.filter(function(other){return other!==item});
    };
  }
  function tone(frequency,endFrequency,offset,duration,volume,type){
    var source=context.createOscillator(),gain=context.createGain(),at=context.currentTime+offset;
    source.type=type||'sine';source.frequency.setValueAtTime(frequency,at);
    source.frequency.exponentialRampToValueAtTime(endFrequency||frequency,at+duration);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    source.connect(gain);gain.connect(master);track(source,[source,gain]);
    source.start(at);source.stop(at+duration+.02);
  }
  function hiss(duration,volume,frequency){
    var source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),at=context.currentTime;
    source.buffer=noise();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.02);
    gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    source.connect(filter);filter.connect(gain);gain.connect(master);track(source,[source,filter,gain]);
    source.start(at);source.stop(at+duration+.02);
  }
  function play(type){
    if(!start())return;
    try{
      if(type==='scan'){
        tone(880,660,0,.18,.2,'triangle');tone(1174,880,.13,.2,.12,'sine');
      }else if(type==='camera'){
        hiss(.45,.65,1200);tone(660,440,.08,.22,.15,'triangle');
      }else if(type==='door'){
        hiss(.65,.4,420);tone(784,784,0,.42,.2);tone(523,523,.2,.6,.17);
      }else if(type==='bad'){
        tone(164,82,0,.5,.18,'sawtooth');tone(164,82,.3,.45,.12,'triangle');hiss(.7,.45,700);
      }else if(type==='night'){
        tone(220,110,0,.95,.14,'triangle');tone(329,164,.2,.8,.09);hiss(1,.3,380);
      }
    }catch(e){}
  }
  function stopEffects(){
    effects.slice().forEach(function(item){try{item.source.stop()}catch(e){}});
  }
  function stopAmbience(){
    if(!ambience)return;
    ambience.sources.forEach(function(source){try{source.stop()}catch(e){}});
    ambience.nodes.forEach(function(node){node.disconnect()});ambience=null;
  }
  function finish(ending){
    active=false;stopAmbience();stopEffects();
    musicAttempt++;if(music){music.pause();music.currentTime=0;if(music.error)music.load()}
    musicState='stopped';notify();
    if(muted||document.hidden||platformPaused||!ensureContext())return;
    ramp(master.gain,.72,.04);resume();
    try{
      if(ending==='truth'){
        tone(261.63,261.63,0,1.8,.16);tone(329.63,329.63,.18,1.6,.13);tone(392,392,.36,1.5,.1);
      }else if(ending==='silence'){
        tone(110,28,0,1.4,.16);hiss(.8,.35,240);
      }else{
        tone(146.83,73.42,0,1.6,.16,'triangle');tone(155.56,77.78,.12,1.5,.1);
      }
    }catch(e){}
  }
  function setMuted(value){
    muted=!!value;
    if(muted){
      if(context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime)}
      stopEffects();pause();
    }
    else if(active){if(music&&music.error){musicAttempt++;music.load()}start()}
    notify();
  }
  function setPaused(value){
    platformPaused=!!value;
    if(platformPaused){stopEffects();pause()}
    else if(unlocked&&active&&!muted&&!document.hidden)start();
  }
  function setNight(value){
    night=value;
    if(ambience){ramp(ambience.hum.frequency,110+(night-1)*1.5,.8);ramp(ambience.filter.frequency,650+(night-1)*90,.8)}
  }
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){stopEffects();pause()}
    else if(unlocked&&active&&!muted)start();
  });
  window.addEventListener('pagehide',function(){stopEffects();pause()});
  window.addEventListener('pageshow',function(){if(unlocked&&active&&!muted)start()});
  document.addEventListener('pointerdown',function(){if(unlocked&&active&&!muted)start()});
  document.addEventListener('keydown',function(){if(unlocked&&active&&!muted)start()});
  api={start:start,play:play,finish:finish,setMuted:setMuted,setPaused:setPaused,setNight:setNight,status:status,supported:typeof Context==='function'||!!music};
  window.ElevatorAudio=api;
})();
