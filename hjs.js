<script>
// == Nezha Dashboard IP/TCPing 按钮 ==
(function(){
    'use strict';

    // 支持路径前缀匹配
    function isTargetPath(){
        const path = location.pathname.replace(/\/+$/, '');
        return path === '/dashboard' || path.startsWith('/dashboard/service');
    }

    // 样式（只加一次）
    if (!document.getElementById('nezha-ping-style')) {
        const style = document.createElement('style');
        style.id = 'nezha-ping-style';
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
                margin-bottom:2px;
            }
        `;
        document.head.appendChild(style);
    }

    function createButton(ip, isIPv4, hasPort){
        const path = location.pathname.replace(/\/+$/, '');
        const a = document.createElement('a');
        a.className='nezha-ping-btn';

        if (path === '/dashboard') {
            a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
            a.href = isIPv4 ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
        } else {
            if (hasPort) {
                a.textContent = isIPv4 ? 'TCPingv4' : 'TCPingv6';
                a.href = isIPv4 ? `https://www.itdog.cn/tcping/${ip}` : `https://www.itdog.cn/tcping_ipv6/${ip}`;
            } else {
                a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
                a.href = isIPv4 ? `https://www.itdog.cn/ping/${ip}` : `https://www.itdog.cn/ping_ipv6/${ip}`;
            }
        }

        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    function appendButtons(cell){
        if(!cell || cell.dataset.nzPingProcessed==='1') return;

        const text = cell.textContent.trim();
        if(!text) return;

        const parts = text.split('/');
        const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(parts[0]) ? parts[0] : null;
        const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null);

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        if(v4){
            wrap.appendChild(createButton(v4, true, v4.includes(':')));
        }
        if(v6){
            wrap.appendChild(createButton(v6, false, v6.includes(']')));
        }

        if(wrap.children.length > 0){
            cell.insertAdjacentElement('afterbegin', wrap);
            cell.dataset.nzPingProcessed='1';
        }
    }

    function processTable(){
        if (!isTargetPath()) return;
        document.querySelectorAll('tbody tr td').forEach(td => appendButtons(td));
    }

    // 监听 DOM 变化（Vue 渲染 & 路由切换）
    const observer = new MutationObserver(processTable);
    observer.observe(document.body, {childList:true, subtree:true});

    // 初始运行
    setInterval(processTable, 1000);
})();
</script>
