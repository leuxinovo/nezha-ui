// == Nezha Dashboard IP Ping 按钮（按钮永远在 IP 下方）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ip-box {
      display:flex;
      flex-direction:column;
      align-items:flex-start;
    }
    .nezha-ip-text {
      font-size: 13px;
      margin-bottom: 2px;
      white-space:nowrap;
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

  // 创建按钮
  function createPingButton(ip, isIPv4){
    const a = document.createElement('a');
    a.className = 'nezha-ping-btn';
    a.textContent = 'Ping';
    a.href = isIPv4 
      ? `https://www.itdog.cn/ping/${encodeURIComponent(ip)}`
      : `https://www.itdog.cn/ping_ipv6/${encodeURIComponent(ip)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  // 处理单元格
  function processCell(cell){
    if(!cell) return;

    // 已经处理过就跳过
    if(cell.querySelector('.nezha-ip-box')) return;

    const rawText = (cell.innerText || '').trim();
    if(!rawText) return;

    // 拆分 IPv4 / IPv6
    const parts = rawText.split('/');
    const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0]) ? parts[0] : null;
    const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (rawText.includes(':') ? rawText : null);

    if(!v4 && !v6) return;

    // 创建包装盒
    const box = document.createElement('div');
    box.className = 'nezha-ip-box';

    // IP 文本
    const ipDiv = document.createElement('div');
    ipDiv.className = 'nezha-ip-text';
    ipDiv.textContent = rawText;
    box.appendChild(ipDiv);

    // 按钮容器
    const wrap = document.createElement('div');
    wrap.className = 'nezha-ping-wrap';
    if(v4) wrap.appendChild(createPingButton(v4, true));
    if(v6) wrap.appendChild(createPingButton(v6, false));
    box.appendChild(wrap);

    // 清空并替换
    cell.innerHTML = '';
    cell.appendChild(box);
  }

  // 扫描表格
  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td => processCell(td));
  }

  // 初次执行
  setTimeout(processTable, 500);

  // 监听 DOM 更新
  const observer = new MutationObserver(processTable);
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});

  // 定时兜底
  setInterval(processTable, 5000);

})();
