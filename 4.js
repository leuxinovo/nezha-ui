// == Nezha Dashboard IP Ping 按钮（IPv4/IPv6 格式专用）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:18px; line-height:18px; font-size:11px; padding:0 6px;
      margin-left:4px; border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid #ccc; background:#f5f5f5; color:#000;
      vertical-align:middle; text-decoration:none;
    }
    .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark .nezha-ping-btn {
      border:1px solid #555; background:#2f2f2f; color:#fff;
    }
  `;
  document.head.appendChild(style);

  function createPingButton(ip, isIPv4){
    const a = document.createElement('a');
    a.className='nezha-ping-btn';
    a.textContent='Ping';
    a.href = isIPv4 ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target='_blank';
    a.rel='noopener noreferrer';
    return a;
  }

  function appendPingButtons(cell){
    if(!cell || cell.dataset.nzPingProcessed==='1') return;
    const text = cell.textContent.trim();
    if(!text) return;

    // 如果格式为 IPv4/IPv6
    const parts = text.split('/');
    let v4 = parts[0] && parts[0].match(/^(\d{1,3}\.){3}\d{1,3}$/) ? parts[0] : null;
    let v6 = parts[1] && parts[1].includes(':') ? parts[1] : null;

    if(!v4 && !v6) return;

    // 保持原内容
    const span = document.createElement('span');
    span.textContent = text;
    cell.textContent = '';
    cell.appendChild(span);

    if(v4){
      const btn4 = createPingButton(v4, true);
      btn4.dataset.ip = v4;
      cell.appendChild(btn4);
    }
    if(v6){
      const btn6 = createPingButton(v6, false);
      btn6.dataset.ip = v6;
      cell.appendChild(btn6);
    }

    cell.dataset.nzPingProcessed='1';
  }

  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td => appendPingButtons(td));
  }

  processTable();

  const observer = new MutationObserver(processTable);
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});

  setInterval(processTable, 4000);
})();
