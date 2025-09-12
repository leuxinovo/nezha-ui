// == Nezha Dashboard IP Ping 按钮 ==
(function(){
  'use strict';

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:18px; line-height:18px; font-size:11px; padding:0 6px;
      margin-left:6px; border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid var(--nz-ping-border,#ccc);
      background:var(--nz-ping-bg,#f5f5f5); color:var(--nz-ping-fg,#000);
      vertical-align:middle; text-decoration:none;
    }
    .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark .nezha-ping-btn {
      --nz-ping-border:#555; --nz-ping-bg:#2f2f2f; --nz-ping-fg:#fff;
    }
    .nezha-ip-frag { white-space:pre-wrap; }
  `;
  document.head.appendChild(style);

  // IPv4 正则
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/;

  function getPingUrl(ip){
    return `https://www.itdog.cn/ping/${ip}`;
  }

  function extractIPs(text){
    const normalized = text.replace(/\s+/g,'');
    const v4s = normalized.match(ipv4) || [];
    return [...new Set(v4s)];
  }

  function injectPingAfterIP(container){
    if(container.dataset.nzPingProcessed==='1') return;
    const text = container.textContent;
    const ips = extractIPs(text);
    if(ips.length===0) return;

    const frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(text));

    ips.forEach(ip=>{
      const a = document.createElement('a');
      a.className = 'nezha-ping-btn';
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
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(tr=>{
      Array.from(tr.querySelectorAll('td')).forEach(td=>{
        if(!td.textContent) return;
        if(td.querySelector('.nezha-ping-btn')) return;
        injectPingAfterIP(td);
      });
    });
  }

  // 初次运行
  processTable();

  // 监听 DOM 变化
  let scheduled=false;
  const observer = new MutationObserver(()=>{
    if(scheduled) return;
    scheduled=true;
    setTimeout(()=>{ scheduled=false; processTable(); },200);
  });
  observer.observe(document.body, { childList:true, subtree:true, characterData:true });

  // 定时兜底
  setInterval(processTable,4000);
})();
