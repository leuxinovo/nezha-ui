#### 美化字体
```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/leuxinovo/nezha-ui@main/font-inject.css">
```
#### 哪吒周期性流量进度条显示
##### 屏蔽服务中流量周期版
直接把下面的代码放入哪吒后台自定义代码
```
<script src="https://cdn.jsdelivr.net/gh/leuxinovo/nezha-ui@main/traffic-display.js"></script>
```
也可以自信更改
```
/* 周期性流量进度条 */
<script>
  window.TrafficScriptConfig = {
    showTrafficStats: true,    // 显示流量统计
    insertAfter: true,         // 如果开启总流量卡片, 放置在总流量卡片后面
    interval: 60000,           // 60秒刷新缓存, 单位毫秒
    toggleInterval: 4000,      // 4秒切换流量进度条右上角内容, 0秒不切换, 单位毫秒
    duration: 500,             // 缓进缓出切换时间, 单位毫秒
    enableLog: false           // 开启日志
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/leuxinovo/nezha-ui@main/traffic-display.js"></script>
```
##### 不屏蔽服务中流量周期版
```
<script src="https://cdn.jsdelivr.net/gh/leuxinovo/nezha-ui@main/traffic-display2.js"></script>
```
也可以自信更改
```
/* 周期性流量进度条 */
<script>
  window.TrafficScriptConfig = {
    showTrafficStats: true,    // 显示流量统计
    insertAfter: true,         // 如果开启总流量卡片, 放置在总流量卡片后面
    interval: 60000,           // 60秒刷新缓存, 单位毫秒
    toggleInterval: 4000,      // 4秒切换流量进度条右上角内容, 0秒不切换, 单位毫秒
    duration: 500,             // 缓进缓出切换时间, 单位毫秒
    enableLog: false           // 开启日志
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/leuxinovo/nezha-ui@main/traffic-display2.js"></script>
```
