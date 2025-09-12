// == Nezha Dashboard IP 点击跳转 itdog ==
(function(){
  'use strict';

  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/;

  function isIPv4(text){
    return ipv4.test(text);
  }

  function getPingUrl(ip){
    return `https://www.itdog.cn/ping/${ip}`;
  }

  // 事件委托：捕获表格或整个 document 的点击事件
  document.addEventListener('click', function(e){
    const text = e.target.textContent.trim();
    if(isIPv4(text)){
      window.open(getPingUrl(text), '_blank');
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

})();
