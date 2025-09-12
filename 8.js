// == Nezha Dashboard IP Ping 按钮（按钮固定在 IP 下方）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ip-text {
      display:block;
      margin-bottom:2px;
    }
    .nezha-ping-wrap {
      display:flex;
      flex-wrap:wrap;
      gap:4px;
      margin-top:2px;
    }
    .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:18px; line-height:18px; font-size:11px; padding:0 6px;
      border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid #ccc; background:#f5f5f5; color:#000;
      text-decoration:none;
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

    // 解析 IPv4 / IPv6
    const parts = text.split('/');
    const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0]) ? parts[0] : null;
    const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null);

    // 包装 IP
    const ipDiv = document.createElement('div');
    ipDiv.className = 'nezha-ip-text';
    ipDiv.textContent = text;

    // 创建按钮容器
    const wrap = document.createElement('div');
    wrap.className = 'nezha-ping-wrap';

    if(v4){
      const btn4 = createPingButton(v4, true);
      wrap.appendChild(btn4);
    }
    if(v6){
      const btn6 = createPingButton(v6, false);
      wrap.appendChild(btn6);
    }

    // 清空单元格，重新排版
    cell.innerHTML = '';
    cell.appendChild(ipDiv);
    if(wrap.children.length > 0){
      cell.appendChild(wrap);
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
