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
            gap:4px;
            margin-bottom:2px;
        }
    `;
    document.head.appendChild(style);

    // ---------- IP解析 ----------
    function parseIPs(text){
        if(!text) return {v4:[], v6:[]};

        const tokens = text.split(/[\s,\/|;]+/).map(t => t.trim()).filter(Boolean);
        const v4 = [], v6 = [];

        const reV4 = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
        const reV6Bracket = /^\[[0-9a-fA-F:]+\](?::\d+)?$/;
        const reDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/;

        for(let t of tokens){
            if (reV4.test(t)) { v4.push(t); continue; }
            if (reV6Bracket.test(t)) { v6.push(t); continue; }

            if (
                t.includes(':') &&
                !t.includes('.') &&
                /^[0-9a-fA-F:]+$/.test(t) &&
                (t.match(/:/g) || []).length >= 2 &&
                (/[a-fA-F]/.test(t) || t.includes("::")) &&
                t.length >= 10 &&
                !reDateTime.test(t)
            ) {
                v6.push(t);
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

    // ---------- 渲染 ----------
    function appendButtons(cell){
        if(!cell) return;

        const text = cell.textContent.trim();
        if(!text) return;

        // ✅ 文本没变直接跳过（防闪关键）
        if (cell.dataset.nzLastText === text) return;
        cell.dataset.nzLastText = text;

        // 删除旧按钮
        const old = cell.querySelector('.nezha-ping-wrap');
        if (old) old.remove();

        const {v4, v6} = parseIPs(text);
        if (!v4.length && !v6.length) return;

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        v4.forEach(tok => {
            wrap.appendChild(createButton(tok, true, /:\d+$/.test(tok)));
        });

        v6.forEach(tok => {
            wrap.appendChild(createButton(tok, false, /^\[[0-9a-fA-F:]+\]:\d+$/.test(tok)));
        });

        cell.insertAdjacentElement('afterbegin', wrap);
    }

    function processTable(){
        document.querySelectorAll('tbody tr td').forEach(appendButtons);
    }

    // ---------- 防抖 ----------
    let timer = null;
    function schedule(){
        clearTimeout(timer);
        timer = setTimeout(processTable, 100);
    }

    // ---------- 初始化 ----------
    function init(){
        processTable();

        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        const observer = new MutationObserver((mutations) => {
            let valid = false;

            for (const m of mutations) {

                // ❌ 忽略我们自己插入的按钮变化（核心防闪）
                if (m.target.closest && m.target.closest('.nezha-ping-wrap')) continue;

                // ✅ 只处理表格内容变化
                if (
                    m.target.nodeType === 1 &&
                    (
                        m.target.tagName === 'TD' ||
                        m.target.tagName === 'TR' ||
                        m.target.closest('td')
                    )
                ) {
                    valid = true;
                    break;
                }
            }

            if (valid) schedule();
        });

        observer.observe(tbody, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
