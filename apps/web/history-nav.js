/* Phúc Nguyên Work: shared browser-history navigation controls */
(()=>{
  const back=document.querySelector('[data-history-back]');
  const forward=document.querySelector('[data-history-forward]');
  if(!back||!forward)return;
  let canForward=false;
  const refresh=()=>{back.disabled=history.length<=1;forward.disabled=!canForward;};
  back.addEventListener('click',()=>{if(history.length>1)history.back();});
  forward.addEventListener('click',()=>{if(canForward)history.forward();});
  addEventListener('popstate',()=>{canForward=true;refresh();});
  addEventListener('hashchange',refresh);
  const push=history.pushState.bind(history),replace=history.replaceState.bind(history);
  history.pushState=function(){const result=push(...arguments);canForward=false;refresh();return result;};
  history.replaceState=function(){const result=replace(...arguments);refresh();return result;};
  document.addEventListener('click',event=>{if(event.target.closest('a[href]')){canForward=false;refresh();}});
  refresh();
})();
