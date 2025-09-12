// == Nezha Dashboard IP Ping/TCPing 按钮（自动区分是否有端口）==
(function(){
    'use strict';

    if (!location.href.includes('/dashboard')) return;

    // 样式
    const style = document.createElement('style');
    style.textContent = `
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
            flex-direction:row;
            flex-wrap:nowrap;
            gap:4px;
            margin-bottom:2px; /* 挤到 IP 上方 */
        }
    `;
    document.head.appendChild(style);

    // 创建按钮
    function createButton(ip, isIPv4, hasPort){
        const a = document.createElement('a');
        a.className='nezha-ping-btn';

        if (hasPort) {
            // 有端口 → TCPing
            a.textContent = isIPv4 ? 'TCPingv4' : 'TCPingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/tcping/${ip}`
                : `https://www.itdog.cn/tcping_ipv6/${ip}`;
        } else {
            // 无端口 → Ping
            a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/ping/${ip}`
                : `https://www.itdog.cn/ping_ipv6/${ip}`;
        }

        a.target='_blank';
        a.rel='noopener noreferrer';
        return a;
    }

    // 在 IP 单元格里加按钮
    function appendButtons(cell){
        if(!cell) return;
        if(cell.dataset.nzPingProcessed==='1') return;

        const text = cell.textContent.trim();
        if(!text) return;

        // IPv4 (支持端口)
        const v4 = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(text) ? text : null;

        // IPv6 (支持带端口 [::]:80 这种格式，或者裸 IPv6)
        let v6 = null;
        if (text.includes(':') && !v4) {
            v6 = text;
        }

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        if(v4){
            const hasPort = v4.includes(':');
            wrap.appendChild(createButton(v4, true, hasPort));
        }
        if(v6){
            const hasPort = v6.includes(']');
            wrap.appendChild(createButton(v6, false, hasPort));
        }

        if(wrap.children.length > 0){
            cell.insertAdjacentElement('afterbegin', wrap);
        }

        cell.dataset.nzPingProcessed='1';
    }

    function processTable(){
        document.querySelectorAll('tbody tr td').forEach(td => appendButtons(td));
    }

    function init(){
        processTable();
        // MutationObserver 监听异步渲染
        const observer = new MutationObserver(processTable);
        observer.observe(document.body, {childList:true, subtree:true, characterData:true});
        setTimeout(processTable, 200);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
