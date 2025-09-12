// == Nezha Dashboard IP 点击跳转 itdog ==
(function(){
  'use strict';

  // 限制只在 Dashboard 页面运行
  if (!location.href.includes('/dashboard')) return;

  // IPv4 正则
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/;

  function isIPv4(text){
    return ipv4.test(text);
  }

  function getPingUrl(ip){
    return `https://www.itdog.cn/ping/${ip}`;
  }

  // 事件委托：监听整个 document 的点击事件
  document.addEventListener('click', function(e){
    const target = e.target;
    if (!target) return;

    const text = target.textContent.trim();
    if(isIPv4(text)){
      // 点击 IPv4 文本就跳转
      window.open(getPingUrl(text), '_blank');
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  // 可选：给鼠标悬停 IPv4 显示小提示
  document.addEventListener('mouseover', function(e){
    const target = e.target;
    if(!target) return;
    const text = target.textContent.trim();
    if(isIPv4(text)){
      target.style.cursor = 'pointer';
      target.title = '点击跳转 itdog Ping';
    }
  }, true);

})();
