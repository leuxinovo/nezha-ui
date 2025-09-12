// == Nezha Dashboard IP Ping 按钮（按钮在 IP 下方，美观版）==
(function(){
  'use strict';

  if (!location.href.includes('/dashboard')) return;

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .nezha-ip-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .nezha-ip-text {
      margin-bottom: 4px;
    }
    .nezha-ping-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .nezha-ping-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      padding: 0 8px;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      border: 1px solid #ccc;
      background: #f5f5f5;
      color: #000;
      text-decoration: none;
    }
    .nezha-ping-btn:hover { filter: brightness(0.95); }
    html.dark .nezha-ping-btn {
      border: 1px solid #555;
      background: #2f2f2f;
      color: #fff;
    }
  `;
  document.head.appendChild(style);

  function createPingButton(ip, isIPv4){
    const a = document.createElement('a');
    a.className = 'nezha-ping-btn';
    a.textContent = 'Ping';
    a.href = isIPv4 ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function appendPingButtons(cell){
    if(!cell) return;
    if(cell.dataset.nzPingProcessed === '1') return;

    const text = cell.textContent.trim();
    if(!text) return;

    // 拆分 IPv4/IPv6
    const parts = text.split('/');
    const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0]) ? parts[0] : null;
    const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null);

    // 新建包装容器
    const wrap = document.createElement('div');
    wrap.className = 'nezha-ip-wrap';

    // IP 文本
    const ipText = document.createElement('div');
    ipText.className = 'nezha-ip-text';
    ipText.textContent = text;
    wrap.appendChild(ipText);

    // 按钮行
    const btnWrap = document.createElement('div');
    btnWrap.className = 'nezha-ping-wrap';

    if(v4){
      const btn4 = createPingButton(v4, true);
      btnWrap.appendChild(btn4);
    }
    if(v6){
      const btn6 = createPingButton(v6, false);
      btnWrap.appendChild(btn6);
    }

    if(btnWrap.children.length > 0){
      wrap.appendChild(btnWrap);
    }

    // 替换原有内容（保留 Vue 渲染过的 td 节点，只替换内部）
    cell.innerHTML = '';
    cell.appendChild(wrap);

    cell.dataset.nzPingProcessed = '1';
  }

  function processTable(){
    document.querySelectorAll('tbody tr td').forEach(td => appendPingButtons(td));
  }

  processTable();

  const observer = new MutationObserver(processTable);
  observer.observe(document.body, {childList:true, subtree:true, characterData:true});

  setInterval(processTable, 4000);
})();
