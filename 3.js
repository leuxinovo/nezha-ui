// == Nezha Dashboard IP Ping 按钮（IPv4 + IPv6 修正版，修复重复按钮）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // IPv4
  const ipv4 = /\b(?:25[0-5]|2[0-4]\d|1?\d{1,2})(?:\.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){3}\b/g;

  // IPv6 完整匹配，包括压缩形式，但不单独匹配 "::"
  const ipv6 = /\b(?:[0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{0,4}\b/g;

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

  function createPingButton(ip){
    const a = document.createElement('a');
    a.className='nezha-ping-btn';
    a.textContent='Ping';
    a.href = ipv4.test(ip) ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target='_blank';
    a.rel='noopener noreferrer';
    return a;
  }

  function appendPingButtons(cell){
    if(!cell || cell.dataset.nzPingProcessed==='1') return;
    const text = cell.textContent;
    if(!text) return;

    // IPv4
    const v4s = text.match(ipv4) || [];

    // IPv6
    let v6s = [];
    text.replace(ipv6, match => {
      // 跳过纯 "::" 或太短的误匹配
      if(match.includes(':') && match !== '::' && !v4s.includes(match)) v6s.push(match);
    });

    // 合并去重
    const ips = [...new Set([...v4s, ...v6s])];
    if(ips.length===0) return;

    // 添加按钮
    ips.forEach(ip => {
      if([...cell.children].some(c=>c.dataset.ip === ip)) return;
      const btn = createPingButton(ip);
      btn.dataset.ip = ip;
      cell.appendChild(btn);
    });

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
