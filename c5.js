(function(){
  'use strict';

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:18px; line-height:18px; font-size:11px; padding:0 6px;
      margin-left:6px; border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid #ccc;
      background:#f5f5f5; color:#000;
      vertical-align:middle; text-decoration:none;
    }
    .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark .nezha-ping-btn {
      border:1px solid #555; background:#2f2f2f; color:#fff;
    }
    .nezha-ip-frag { white-space:pre-wrap; }
  `;
  document.head.appendChild(style);

  // IPv4 正则
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/;

  function extractIPs(text){
    return [...new Set((text.replace(/\s+/g,'').match(ipv4) || []))];
  }

  function getPingUrl(ip){
    return `https://www.itdog.cn/ping/${ip}`;
  }

  function injectPing(container){
    if(container.dataset.nzPingProcessed==='1') return;
    const ips = extractIPs(container.textContent);
    if(ips.length===0) return;

    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(container.textContent));
    ips.forEach(ip=>{
      const a = document.createElement('a');
      a.className='nezha-ping-btn';
      a.textContent='Ping';
      a.href=getPingUrl(ip);
      a.target='_blank';
      a.rel='noopener noreferrer';
      frag.appendChild(a);
    });

    container.replaceChildren(frag);
    container.classList.add('nezha-ip-frag');
    container.dataset.nzPingProcessed='1';
  }

  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td=>{
      if(!td.textContent) return;
      if(td.querySelector('.nezha-ping-btn')) return;
      injectPing(td);
    });
  }

  // 初次处理
  processTable();

  // 监听 DOM 变化
  const observer = new MutationObserver(processTable);
  observer.observe(document.body,{childList:true, subtree:true, characterData:true});

  // 定时兜底
  setInterval(processTable,4000);

})();
