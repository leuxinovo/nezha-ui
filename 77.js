// == Nezha Dashboard IP Ping 按钮（overlay 版 - 不修改单元格 DOM）==
(function(){
  'use strict';

  // 只在包含 /dashboard 的页面生效（按需修改）
  if (!location.href.includes('/dashboard')) return;

  // ---- UI 容器 & 样式 ----
  const OVERLAY_ID = 'nezha-ip-ping-overlay';
  let overlayRoot = document.getElementById(OVERLAY_ID);
  if (!overlayRoot) {
    overlayRoot = document.createElement('div');
    overlayRoot.id = OVERLAY_ID;
    overlayRoot.style.position = 'absolute';
    overlayRoot.style.top = '0';
    overlayRoot.style.left = '0';
    overlayRoot.style.pointerEvents = 'none'; // 默认为不可点，具体按钮会启用 pointer-events
    overlayRoot.style.zIndex = 99999;
    document.body.appendChild(overlayRoot);
  }

  const style = document.createElement('style');
  style.textContent = `
    #${OVERLAY_ID} .nezha-ping-box {
      position: absolute;
      pointer-events: auto; /* 允许点击内部按钮 */
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;
      transform-origin: left top;
      white-space: nowrap;
    }
    #${OVERLAY_ID} .nezha-ping-btn {
      display:inline-flex; align-items:center; justify-content:center;
      height:20px; line-height:20px; font-size:12px; padding:0 8px;
      border-radius:6px; cursor:pointer; user-select:none;
      border:1px solid rgba(0,0,0,0.12); background:#f3f4f6; color:#111;
      text-decoration:none;
    }
    #${OVERLAY_ID} .nezha-ping-btn:hover { filter:brightness(0.95); }
    html.dark #${OVERLAY_ID} .nezha-ping-btn {
      border:1px solid rgba(255,255,255,0.08); background:#2b2b2b; color:#fff;
    }
  `;
  document.head.appendChild(style);

  // ---- IP 检测函数（优先按 "/" 切分，不单独匹配 '::'） ----
  const ipv4Test = /\b(?:25[0-5]|2[0-4]\d|1?\d{1,2})(?:\.(?:25[0-5]|2[0-4]\d|1?\d{1,2})){3}\b/;
  const ipv6Test = /([0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{0,4}/;

  function detectIPsFromText(text){
    if(!text || typeof text !== 'string') return { v4: null, v6: null };
    text = text.trim();
    // 优先按 / 分割：支持 "ipv4/ipv6" 形式
    const parts = text.split('/').map(s=>s.trim()).filter(Boolean);
    if(parts.length >= 2){
      const v4cand = parts[0];
      const v6cand = parts.slice(1).join('/'); // 若中间包含其它 /，合并余下部分
      const v4 = ipv4Test.test(v4cand) ? v4cand : null;
      const v6 = (v6cand && v6cand !== '::' && v6cand.includes(':')) ? v6cand : null;
      return { v4, v6 };
    }
    // 否则回退到正则提取
    const v4m = text.match(ipv4Test);
    const v6m = text.match(ipv6Test);
    const v4 = v4m ? v4m[0] : null;
    let v6 = null;
    if(v6m){
      const cand = v6m[0];
      if(cand && cand !== '::' && cand.includes(':')) v6 = cand;
    } else if(text.includes('::') && text.trim() !== '::'){
      const cand2 = (text.match(/[0-9A-Fa-f:]{3,}/) || [null])[0];
      if(cand2 && cand2.includes(':') && cand2 !== '::') v6 = cand2;
    }
    return { v4, v6 };
  }

  // ---- Overlay 管理 ----
  // 使用 WeakMap 将真实单元格节点映射到 overlay 元素（便于自动回收）
  const cellMap = new WeakMap();

  function makeButtonElement(ip, isV4){
    const a = document.createElement('a');
    a.className = 'nezha-ping-btn';
    a.textContent = 'Ping';
    const safe = encodeURIComponent(ip);
    a.href = isV4 ? `https://www.itdog.cn/ping/${safe}` : `https://www.itdog.cn/ping_ipv6/${safe}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.ip = ip;
    return a;
  }

  function createOrUpdateOverlayForCell(cell){
    try {
      const txt = (cell.innerText || cell.textContent || '').trim();
      if(!txt) { removeOverlayForCell(cell); return; }

      const { v4, v6 } = detectIPsFromText(txt);
      if(!v4 && !v6) { removeOverlayForCell(cell); return; }

      // 获得或创建 overlay 元素
      let box = cellMap.get(cell);
      if(!box){
        box = document.createElement('div');
        box.className = 'nezha-ping-box';
        overlayRoot.appendChild(box);
        cellMap.set(cell, box);
      }

      // 更新按钮集合（只保留需要的按钮）
      const wanted = [];
      if(v4) wanted.push({ip:v4, v4:true});
      if(v6) wanted.push({ip:v6, v4:false});

      // existing ips
      const existingBtns = Array.from(box.querySelectorAll('.nezha-ping-btn'));
      const existingIps = new Set(existingBtns.map(b=>b.dataset.ip));

      // add missing
      wanted.forEach(w=>{
        if(!existingIps.has(w.ip)){
          const btn = makeButtonElement(w.ip, w.v4);
          box.appendChild(btn);
        }
      });

      // remove extra
      existingBtns.forEach(btn=>{
        if(!wanted.some(w=>w.ip === btn.dataset.ip)){
          btn.remove();
        }
      });

      // 计算位置并显示（放在 cell 底部）
      positionOverlay(box, cell);
    } catch(e){
      console.error('[nezha-ip-ping] overlay error', e);
    }
  }

  function removeOverlayForCell(cell){
    const box = cellMap.get(cell);
    if(box){
      box.remove();
      cellMap.delete(cell);
    }
  }

  function positionOverlay(box, cell){
    // 若 cell 不在页面（被移除），清理
    if(!document.body.contains(cell)){
      box.remove();
      return;
    }
    const rect = cell.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    // 放在单元格底部偏 4px
    const left = rect.left + scrollX;
    const top = rect.bottom + scrollY + 4;
    box.style.left = `${Math.max(0, Math.round(left))}px`;
    box.style.top = `${Math.max(0, Math.round(top))}px`;
    // 如果希望 box 宽度不超过 cell 宽，可设置 min/max
    // box.style.maxWidth = `${Math.round(rect.width)}px`;
  }

  // ---- 主扫描与更新逻辑（防抖） ----
  let scheduleTimer = null;
  function scheduleScan(delay = 120){
    if(scheduleTimer) return;
    scheduleTimer = setTimeout(()=>{
      scheduleTimer = null;
      scanAndSync();
    }, delay);
  }

  function scanAndSync(){
    // 获取所有 tbody td（在哪吒面板通常为服务器列表）
    const tds = Array.from(document.querySelectorAll('tbody tr td'));
    const seen = new Set();

    // 为每个 td 创建或更新 overlay
    tds.forEach(td=>{
      const txt = (td.innerText || td.textContent || '').trim();
      if(!txt) return;
      // 仅处理可能包含 ip 的单元格（有数字或冒号）
      if(!/[0-9:\.]/.test(txt)) return;

      createOrUpdateOverlayForCell(td);
      seen.add(td);
    });

    // 移除不在页面上的 overlays
    // cellMap 是 WeakMap，不能直接遍历，但我们可以清理 overlayRoot 中不再对应的 box：若 box.parentNode === overlayRoot 且找不到对应 cell (by matching dataset?) 
    // 我们 instead iterate overlayRoot children and test if their associated cell still exists by checking position (we stored cell in WeakMap but not backref). Simpler: remove boxes whose cell is no longer in document by checking each entry in cellMap via a temporary array.
    // Because WeakMap not iterable, we instead rely on overlayRoot children: each box has a reference to its "related cell" via expando property.
    // So ensure we set box._nezhaCellRef = cell earlier
    Array.from(overlayRoot.children).forEach(box => {
      const cellRef = box._nezhaCellRef;
      if(!cellRef || !document.body.contains(cellRef)){
        box.remove();
      }
    });
    // Finally reposition any remaining boxes (in case layout changed)
    Array.from(overlayRoot.children).forEach(box => {
      const cellRef = box._nezhaCellRef;
      if(cellRef) positionOverlay(box, cellRef);
    });
  }

  // small helper: when we create box, set backref
  function createBoxForCell(cell){
    const box = document.createElement('div');
    box.className = 'nezha-ping-box';
    box._nezhaCellRef = cell;
    overlayRoot.appendChild(box);
    cellMap.set(cell, box);
    return box;
  }

  // Adjust createOrUpdateOverlayForCell to use createBoxForCell
  function createOrUpdateOverlayForCell(cell){
    try {
      const txt = (cell.innerText || cell.textContent || '').trim();
      if(!txt) { removeOverlayForCell(cell); return; }

      const { v4, v6 } = detectIPsFromText(txt);
      if(!v4 && !v6) { removeOverlayForCell(cell); return; }

      // box
      let box = cellMap.get(cell);
      if(!box){
        box = createBoxForCell(cell);
      }

      const wanted = [];
      if(v4) wanted.push({ip:v4, v4:true});
      if(v6) wanted.push({ip:v6, v4:false});

      const existingBtns = Array.from(box.querySelectorAll('.nezha-ping-btn'));
      const existingIps = new Set(existingBtns.map(b=>b.dataset.ip));

      wanted.forEach(w=>{
        if(!existingIps.has(w.ip)){
          const btn = makeButtonElement(w.ip, w.v4);
          box.appendChild(btn);
        }
      });

      existingBtns.forEach(btn=>{
        if(!wanted.some(w=>w.ip === btn.dataset.ip)){
          btn.remove();
        }
      });

      positionOverlay(box, cell);
    } catch(e){
      console.error('[nezha-ip-ping] overlay error', e);
    }
  }

  // ---- 事件绑定 ----
  // MutationObserver（动态渲染）
  const mo = new MutationObserver(() => scheduleScan(120));
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  // resize / scroll -> 更新位置
  window.addEventListener('resize', () => scheduleScan(80));
  window.addEventListener('scroll', () => scheduleScan(40), true);

  // 周期兜底
  setInterval(scanAndSync, 5000);

  // 首次延迟扫描（让 Vue 有时间渲染）
  setTimeout(scanAndSync, 500);

})();
