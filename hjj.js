// == Nezha Dashboard IP Ping/TCPing 按钮（修复 IPv4:port 被误判为 IPv6/日期时间被误判）==
(function(){
    'use strict';

    if (!location.href.includes('/dashboard')) return;

    // ---------- 样式 ----------
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

    // ---------- 工具：解析单元格里的 IP token ----------
    function parseIPs(text){
        if(!text) return {v4:[], v6:[]};
        // 常见分隔符：空格 / , | ;
        const tokens = text.split(/[\s,\/|;]+/).map(t => t.trim()).filter(Boolean);
        const v4 = [], v6 = [];

        // IPv4 (支持可选 :port)
        const reV4 = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;

        // 带方括号的 IPv6 形式（可选端口）
        const reV6Bracket = /^\[[0-9a-fA-F:]+\](?::\d+)?$/;

        for(let t of tokens){
            if (reV4.test(t)) { 
                v4.push(t);
                continue;
            }
            if (reV6Bracket.test(t)) { 
                v6.push(t);
                continue;
            }
            // 纯 IPv6（避免把日期/时间误判）
            if (
                t.includes(':') &&                     // 必须有冒号
                !t.includes('.') &&                    // 不能有点
                /^[0-9a-fA-F:]+$/.test(t) &&           // 仅允许十六进制+冒号
                (t.match(/:/g) || []).length >= 2      // 至少两个冒号
            ) {
                v6.push(t);
                continue;
            }
        }
        return {v4, v6};
    }

    // ---------- 创建按钮 ----------
    function createButton(token, isIPv4, hasPort){
        const a = document.createElement('a');
        a.className = 'nezha-ping-btn';

        if (hasPort) {
            a.textContent = isIPv4 ? 'Tcpingv4' : 'Tcpingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/tcping/${token}`
                : `https://www.itdog.cn/tcping_ipv6/${token}`;
        } else {
            a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/ping/${token}`
                : `https://www.itdog.cn/ping_ipv6/${token}`;
        }

        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    // ---------- 在单元格插入按钮 ----------
    function appendButtons(cell){
        if(!cell) return;
        if(cell.dataset.nzPingProcessed === '1') return;

        const text = cell.textContent.trim();
        if(!text) return;

        const {v4, v6} = parseIPs(text);
        if (v4.length === 0 && v6.length === 0) return;

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        v4.forEach(tok => {
            const hasPort = /:\d+$/.test(tok);
            wrap.appendChild(createButton(tok, true, hasPort));
        });

        v6.forEach(tok => {
            const hasPort = /^\[[0-9a-fA-F:]+\]:\d+$/.test(tok);
            wrap.appendChild(createButton(tok, false, hasPort));
        });

        if (wrap.children.length > 0) {
            cell.insertAdjacentElement('afterbegin', wrap);
            cell.dataset.nzPingProcessed = '1';
        }
    }

    // ---------- 遍历表格 ----------
    function processTable(){
        document.querySelectorAll('tbody tr td').forEach(td => appendButtons(td));
    }

    // ---------- 初始化 ----------
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
