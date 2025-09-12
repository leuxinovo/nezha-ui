// == Nezha Dashboard IP 点击跳转 itdog ==
(function(){
  // 样式：可选，美化 IP
  const style = document.createElement('style');
  style.textContent = `
    .server-ip {
      color: #4caf50;
      cursor: pointer;
      transition: color 0.2s;
    }
    .server-ip:hover {
      color: #ff9800;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // 处理所有服务器 IP
  function makeIPsClickable() {
    // 假设 IP 显示在 p 标签或者 span 标签中
    document.querySelectorAll('section.grid.items-center.gap-2 p, section.grid.items-center.gap-2 span').forEach(el=>{
      const ip = el.textContent.trim();
      // 简单匹配 IPv4
      if(/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        el.classList.add('server-ip');
        el.onclick = () => window.open(`https://www.itdog.cn/ping/${ip}`, '_blank');
      }
    });
  }

  // 初始调用一次
  makeIPsClickable();

  // 监听 DOM 变化，动态添加新的 IP 点击事件
  const observer = new MutationObserver(makeIPsClickable);
  observer.observe(document.body, { childList: true, subtree: true });
})();
