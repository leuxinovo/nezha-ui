// == Nezha Dashboard IP/TCPing 按钮（根据页面切换，按钮在 IP 上方，并排显示）==
(function(){
    'use strict';

    const path = location.pathname;

    // 只在 /dashboard 和 /dashboard/service 生效
    if (path !== '/dashboard' && path !== '/dashboard/service') return;

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

    // 创建按钮函数
    function createButton(ip, isIPv4){
        const a = document.createElement('a');
        a.className='nezha-ping-btn';

        if (path === '/dashboard') {
            // 普通 Ping
            a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/ping/${ip}`
                : `https://www.itdog.cn/ping_ipv6/${ip}`;
        } else {
            // /dashboard/service 用 TCPing
            a.textContent = isIPv4 ? 'TCPingv4' : 'TCPingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/tcping/${ip}`
                : `https://www.itdog.cn/tcping_ipv6/${ip}`;
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

        // 拆分 IPv4/IPv6
        const parts = text.split('/');
        const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(parts[0]) ? parts[0] : null;
        const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null);

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        if(v4){
            wrap.appendChild(createButton(v4, true));
        }
        if(v6){
            wrap.appendChild(createButton(v6, false));
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
