// == Nezha Dashboard IP Ping 按钮（固定在 IP 下方，区分 v4/v6，并排显示）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ip-wrap {
      display:flex;
      flex-direction:column; /* 垂直排列 */
      align-items:flex-start;
    }
    .nezha-ip-text {
      margin-bottom:2px;
    }
    .nezha-ping-btn {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      height:18px;
      line-height:18px;
      font-size:11px;
      padding:0 6px;
      margin-right:4px;
      border-radius:6px;
      cursor:pointer;
      user-select:none;
      border:1px solid #ccc;
      background:#f5f5f5;
      color:#000;
      text-decoration:none;
      white-space:nowrap;
    }
    .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark .nezha-ping-btn {
      border:1px solid #555;
      background:#2f2f2f;
      color:#fff;
    }
    .nezha-ping-wrap {
      display:flex;
      flex-direction:row;   /* 横向排列 */
      flex-wrap:nowrap;
      gap:4px;
    }
  `;
  document.head.appendChild(style);

  function createPingButton(ip, isIPv4){
    const a = document.createElement('a');
    a.className='nezha-ping-btn';
    a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
    a.href = isIPv4
      ? `https://www.itdog.cn/ping/${ip}`
      : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target='_blank';
    a.rel='noopener noreferrer';
    return a;
  }

  function appendPingButtons(cell){
    if(!cell) return;
    if(cell.dataset.nzPingProcessed==='1') return;

    const text = cell.textContent.trim();
    if(!text) return;

    // 拆分 IPv4/IPv6
    const parts = text.split('/');
    const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0]) ? parts[0] : null;
    const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null);

    // 创建 IP + 按钮整体容器
    const wrap = document.createElement('div');
    wrap.className = 'nezha-ip-wrap';

    // 原 IP
    const ipText = document.createElement('div');
    ipText.className = 'nezha-ip-text';
    ipText.textContent = text;
    wrap.appendChild(ipText);

    // 按钮区域
    const btnWrap = document.createElement('div');
    btnWrap.className = 'nezha-ping-wrap';

    if(v4){
      btnWrap.appendChild(createPingButton(v4, true));
    }
    if(v6){
      btnWrap.appendChild(createPingButton(v6, false));
    }

    if(btnWrap.children.length > 0){
      wrap.appendChild(btnWrap);
    }

    // 替换原内容
    cell.textContent = '';
    cell.appendChild(wrap);

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
