/* P2Game integration; the official SDK owns all host communication. */
(function(){
  'use strict';
  var sdk=window.p2,handlers={},round=0,finishedRound=-1,rendered=false,readySent=false;
  var connected=sdk?Promise.resolve().then(function(){
    return sdk.init({allowStandalone:true,timeoutMs:10000});
  }).catch(function(){return null}):Promise.resolve(null);
  function notify(message,forRound){
    if(forRound===round&&handlers.notify)handlers.notify(message);
  }
  function attach(value){
    handlers=value;
    if(sdk){
      sdk.onPause(function(){if(handlers.pause)handlers.pause()});
      sdk.onResume(function(){if(handlers.resume)handlers.resume()});
      sdk.onBeforeUnload(function(){if(handlers.save)handlers.save()});
    }
    requestAnimationFrame(function(){
      rendered=true;
      connected.then(function(context){
        if(context&&rendered&&!readySent){readySent=true;sdk.ready()}
      });
    });
  }
  function begin(){round++}
  function finish(result){
    if(finishedRound===round)return;
    finishedRound=round;
    var completedRound=round;
    // Snapshot primitive values now: a replay can start while the host responds.
    var score=result.score,level=3;
    var meta={ending:result.ending,correct:result.correct,evidence:result.evidence,breach:result.breach};
    connected.then(async function(context){
      if(!context||sdk.isStandalone)return;
      try{
        var accepted=await sdk.leaderboard.submit('high-score',score,meta);
        if(accepted&&accepted.accepted)notify('Đã gửi điểm lên bảng xếp hạng P2Game.',completedRound);
        else notify('P2Game chưa nhận điểm. Thành tích vẫn được lưu trên máy.',completedRound);
      }catch(error){
        notify(error.code==='UNAUTHENTICATED'?'Đăng nhập trên P2Game để lưu điểm lên bảng xếp hạng.':'Chưa gửi được điểm lên P2Game. Thành tích vẫn được lưu trên máy.',completedRound);
      }finally{
        // Submit before gameOver so the host can validate the still-active session.
        sdk.gameOver({score:score,level:level});
      }
    }).catch(function(){});
  }
  window.ElevatorPlatform={attach:attach,begin:begin,finish:finish};
})();
