// == 字体注入模块 ==
(function injectFontFamily() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      font-family: "Roboto", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    }
  `;
  document.head.appendChild(style);
})();
