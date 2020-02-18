/*
 * @Author: kkitty
 * @Date: 2019-10-21 11:50:41
 * @LastEditors: kkitty
 * @LastEditTime: 2019-10-30 09:47:36
 * @Description: Happy life
 */

document.oncontextmenu = new Function('event.returnValue=false;')
document.onselectstart = new Function('event.returnValue=false;')
/**
 * @description: 判断页面是否长时间微操作
 */
function time5min() {
  var timeCount = 0
  var outTime = 5 //分钟
  window.setInterval(go, 1000)
  function go() {
    timeCount++
    if (timeCount == outTime * 60) {
      let indexHref = location.href
      if(indexHref.indexOf("index") != -1 ) {
        window.location.reload()
      } else {
        window.location.reload()
    }
  }
  var x
  var y
  //监听鼠标
  document.onmousemove = function(event) {
    var x1 = event.clientX
    var y1 = event.clientY
    if (x != x1 || y != y1) {
      timeCount = 0
    }
    x = x1
    y = y1
  }
  // 监听是否触摸
  document.addEventListener('touchmove', function(event) {
    timeCount = 0
  })
  //监听键盘
  document.onkeydown = function() {
    timeCount = 0
  }
}
}
// 执行
time5min()
