// == Nezha Dashboard IP Ping 按钮（稳定版，只在 /dashboard 页面生效，按钮在 IP 上方，并排显示）==
(function(){
    'use strict'; // 启用严格模式，避免一些潜在的 JS 错误

    // 仅在 /dashboard 页面生效
    // location.pathname 返回 URL 中的路径部分，如 /dashboard、/dashboard/server
    if (location.pathname !== '/dashboard') return;

    // ---------- 样式 ----------
    // 创建 <style> 标签并添加到 <head> 中，用于按钮和容器的样式
    const style = document.createElement('style');
    style.textContent = `
        /* 按钮基本样式 */
        .nezha-ping-btn {
            display:inline-flex;           /* 内联块 + flex布局 */
            align-items:center;           /* 垂直居中 */
            justify-content:center;       /* 水平居中 */
            height:18px;                  /* 高度 */
            line-height:18px;             /* 文字垂直居中 */
            font-size:11px;               /* 字体大小 */
            padding:0 6px;                /* 左右内边距 */
            margin-right:4px;             /* 按钮间距 */
            border-radius:6px;            /* 圆角 */
            cursor:pointer;               /* 鼠标样式 */
            user-select:none;             /* 禁止选中文字 */
            border:1px solid #ccc;        /* 边框 */
            background:#f5f5f5;           /* 背景色 */
            color:#000;                   /* 文字颜色 */
            text-decoration:none;         /* 去掉下划线 */
            white-space:nowrap;           /* 不换行 */
        }

        /* 鼠标悬停时微调亮度 */
        .nezha-ping-btn:hover { filter:brightness(0.95); }

        /* 深色模式 */
        html.dark .nezha-ping-btn {
            border:1px solid #555;
            background:#2f2f2f;
            color:#fff;
        }

        /* 按钮容器，用于将多个按钮并排显示并放在 IP 上方 */
        .nezha-ping-wrap {
            display:flex;                /* flex布局 */
            flex-direction:row;          /* 横向排列 */
            flex-wrap:nowrap;            /* 不换行 */
            gap:4px;                     /* 按钮间距 */
            margin-bottom:2px;           /* 挤到 IP 上方 */
        }
    `;
    document.head.appendChild(style); // 将样式添加到页面头部

    // ---------- 创建单个 Ping 按钮 ----------
    function createPingButton(ip, isIPv4){
        const a = document.createElement('a'); // 创建 <a> 标签
        a.className='nezha-ping-btn';          // 添加按钮样式类
        a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6'; // 按钮文字

        // 根据类型设置跳转链接
        a.href = isIPv4
            ? `https://www.itdog.cn/ping/${ip}`      // IPv4 Ping
            : `https://www.itdog.cn/ping_ipv6/${ip}`; // IPv6 Ping

        a.target='_blank';            // 新窗口打开
        a.rel='noopener noreferrer';  // 安全属性，防止新窗口获取原窗口引用
        return a;
    }

    // ---------- 给单元格添加按钮 ----------
    function appendPingButtons(cell){
        if(!cell) return;                   // 空单元格跳过
        if(cell.dataset.nzPingProcessed==='1') return; // 已处理过的跳过

        const text = cell.textContent.trim(); // 获取单元格文本
        if(!text) return;                     // 空文本跳过

        // 拆分 IPv4/IPv6
        const parts = text.split('/'); // 一般格式 IPv4/IPv6
        const v4 = parts[0] && /^\d{1,3}(\.\d{1,3}){3}$/.test(parts[0]) ? parts[0] : null; // IPv4正则
        const v6 = parts[1] && parts[1].includes(':') ? parts[1] : (text.includes(':') ? text : null); // IPv6简单判断

        // 创建按钮容器
        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        // 如果有 IPv4，则创建按钮并添加到容器
        if(v4){
            const btn4 = createPingButton(v4, true);
            wrap.appendChild(btn4);
        }

        // 如果有 IPv6，则创建按钮并添加到容器
        if(v6){
            const btn6 = createPingButton(v6, false);
            wrap.appendChild(btn6);
        }

        // 如果有按钮，则插入到单元格开头（保证在 IP 上方）
        if(wrap.children.length > 0){
            cell.insertAdjacentElement('afterbegin', wrap);
        }

        // 标记单元格已处理，避免重复添加
        cell.dataset.nzPingProcessed='1';
    }

    // ---------- 遍历表格处理所有单元格 ----------
    function processTable(){
        document.querySelectorAll('tbody tr td').forEach(td => appendPingButtons(td));
    }

    // ---------- 初始化 ----------
    function init(){
        processTable(); // 先处理一次

        // 监听异步渲染（Vue异步更新表格）
        const observer = new MutationObserver(processTable);
        observer.observe(document.body, {childList:true, subtree:true, characterData:true});

        // 兜底延迟处理，保证异步渲染表格也处理
        setTimeout(processTable, 200);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
