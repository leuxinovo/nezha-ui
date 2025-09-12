// == Nezha Dashboard IP Ping 按钮（完整 JS 脚本）==
(function(){
  'use strict';

  // 只在 Dashboard 页面生效
  if (!location.href.includes('/dashboard')) return;

  // IPv4 正则
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/g;
  // IPv6 正则（标准 + :: 压缩）
  const ipv6 = /\b((?:[0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{1,4}|::)\b/g;

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
    .nezha-ip-wrapper { display:inline-flex; align-items:center; flex-wrap:wrap; gap:4px; }
  `;
  document.head.appendChild(style);

  // 创建 Ping 按钮
  function createPingButton(ip){
    const a = document.createElement('a');
    a.className='nezha-ping-btn';
    a.textContent='Ping';
    a.href = ipv4.test(ip) ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target='_blank';
    a.rel='noopener noreferrer';
    return a;
  }

  // 处理单个单元格
  function processIPCell(cell){
    if(!cell || cell.dataset.nzPingProcessed==='1') return;
    let text = cell.textContent.trim();
    if(!text) return;

    // 移除旧 wrapper
    const existingWrappers = cell.querySelectorAll('.nezha-ip-wrapper');
    existingWrappers.forEach(w=>w.remove());

    // 匹配 IPv4 和 IPv6
    const v4s = text.match(ipv4) || [];
    const v6s = text.match(ipv6) || [];
    const ips = [...new Set([...v4s, ...v6s])];
    if(ips.length===0) return;

    // 创建 wrapper
    const wrapper = document.createElement('span');
    wrapper.className='nezha-ip-wrapper';

    let remainingText = text;
    ips.forEach(ip=>{
      const idx = remainingText.indexOf(ip);
      if(idx===-1) return;
      const before = remainingText.slice(0, idx);
      if(before) wrapper.appendChild(document.createTextNode(before));
      const ipNode = document.createTextNode(ip);
      wrapper.appendChild(ipNode);
      wrapper.appendChild(createPingButton(ip));
      remainingText = remainingText.slice(idx + ip.length);
    });
    if(remainingText) wrapper.appendChild(document.createTextNode(remainingText));

    cell.textContent=''; // 清空原内容
    cell.appendChild(wrapper);
    cell.dataset.nzPingProcessed='1';
  }

  // 遍历表格
  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td=>{
      processIPCell(td);
    });
  }

  // 初次处理
  processTable();

  // 动态监听 DOM 变化
  const observer = new MutationObserver(processTable);
  observer.observe(document.body,{childList:true, subtree:true, characterData:true});

  // 定时兜底
  setInterval(processTable,4000);

})();
