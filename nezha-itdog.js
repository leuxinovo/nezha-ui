// == Nezha Dashboard IP Ping/TCPing 按钮（修复 IPv4:port 被误判为 IPv6）==
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
    // 支持的 token 形式示例：
    //  - IPv4: 1.2.3.4 或 1.2.3.4:80
    //  - IPv6: 2001:db8::1
    //  - IPv6 带端口（推荐带方括号）: [2001:db8::1]:443
    function parseIPs(text){
        if(!text) return {v4:[], v6:[]};
        // 常见分隔符：空格 / , | ;
        const tokens = text.split(/[\s,\/|;]+/).map(t => t.trim()).filter(Boolean);
        const v4 = [], v6 = [];

        // IPv4 (支持可选 :port)
        const reV4 = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;

        // 带方括号的 IPv6 形式（可选端口）: [::1] 或 [::1]:80
        const reV6Bracket = /^\[[0-9a-fA-F:]+\](?::\d+)?$/;

        for(let t of tokens){
            if (reV4.test(t)) { // 先判断 IPv4（含端口）
                v4.push(t);
                continue;
            }
            if (reV6Bracket.test(t)) { // 带方括号的 IPv6（含端口）
                v6.push(t);
                continue;
            }
            // 纯 IPv6（包含 ':' 且不包含 '.'，避免把 IPv4:port 误判）
            if (t.includes(':') && !t.includes('.')) {
                v6.push(t);
                continue;
            }
            // 其它（忽略）
        }
        return {v4, v6};
    }

    // ---------- 创建按钮（当 hasPort 为 true 时使用 tcping） ----------
    function createButton(token, isIPv4, hasPort){
        const a = document.createElement('a');
        a.className = 'nezha-ping-btn';

        if (hasPort) {
            // 有端口 → TCPing（IPv4 / IPv6 分别）
            a.textContent = isIPv4 ? 'Tcpingv4' : 'Tcpingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/tcping/${token}`
                : `https://www.itdog.cn/tcping_ipv6/${token}`;
        } else {
            // 无端口 → 普通 Ping
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
            const hasPort = /:\d+$/.test(tok); // IPv4: 末尾 :digits
            wrap.appendChild(createButton(tok, true, hasPort));
        });

        v6.forEach(tok => {
            // 仅当为带方括号并带端口的形式视为明确带端口
            const hasPort = /^\[[0-9a-fA-F:]+\]:\d+$/.test(tok);
            wrap.appendChild(createButton(tok, false, hasPort));
        });

        if (wrap.children.length > 0) {
            cell.insertAdjacentElement('afterbegin', wrap); // 插到单元格开头（IP 上方）
            cell.dataset.nzPingProcessed = '1';
        }
    }

    // ---------- 遍历表格 ----------
    function processTable(){
        document.querySelectorAll('tbody tr td').forEach(td => appendButtons(td));
    }

    // ---------- 初始化（兼容 Vue 异步渲染） ----------
    function init(){
        processTable();
        const observer = new MutationObserver(processTable);
        observer.observe(document.body, {childList:true, subtree:true, characterData:true});
        // 兜底延迟
        setTimeout(processTable, 200);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
