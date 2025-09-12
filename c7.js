// == Nezha Dashboard IP Ping 按钮（IPv4 + IPv6）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return; // 限制只在 Dashboard 页面

  // IPv4 正则
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/g;
  // IPv6 正则（匹配标准 IPv6 和 :: 压缩形式）
  const ipv6 = /\b((?:[0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{1,4}|::)\b/g;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:18px; line-height:18px; font-size:11px; padding:0 6px;
      margin-left:4px; border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid #ccc;
      background:#f5f5f5; color:#000; vertical-align:middle; text-decoration:none;
    }
    .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark .nezha-ping-btn {
      border:1px solid #555; background:#2f2f2f; color:#fff;
    }
  `;
  document.head.appendChild(style);

  function createPingButton(ip){
    const a = document.createElement('a');
    a.className = 'nezha-ping-btn';
    a.textContent = 'Ping';
    a.href = ipv4.test(ip) ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function processIPCell(cell){
    if(!cell || cell.dataset.nzPingProcessed === '1') return;

    let text = cell.textContent.trim();
    if(!text) return;

    // 清空旧按钮
    const existingBtns = cell.querySelectorAll('.nezha-ping-btn');
    existingBtns.forEach(btn => btn.remove());

    // 匹配 IPv4
    const v4s = text.match(ipv4) || [];
    // 匹配 IPv6
    const v6s = text.match(ipv6) || [];
    const ips = [...new Set([...v4s, ...v6s])];

    if(ips.length===0) return;

    ips.forEach(ip=>{
      const btn = createPingButton(ip);
      cell.appendChild(btn);
    });

    cell.dataset.nzPingProcessed = '1';
  }

  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td=>{
      processIPCell(td);
    });
  }

  // 初次处理
  processTable();

  // 监听 DOM 变化（动态渲染支持）
  const observer = new MutationObserver(processTable);
  observer.observe(document.body,{childList:true, subtree:true, characterData:true});

  // 定时兜底
  setInterval(processTable,4000);

})();
