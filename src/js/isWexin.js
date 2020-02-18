/*
 * @Author: kkitty
 * @Date: 2019-10-21 11:50:42
 * @LastEditors: kkitty
 * @LastEditTime: 2019-10-24 10:53:29
 * @Description: Happy life
 */
function is_weixin() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    if(ua.indexOf('windows') >0) {
      return false
    }
      return true
    } else {
      return false
    }
}
var isWeixin = is_weixin();
var winHeight =
  typeof window.innerHeight != 'undefined'
    ? window.innerHeight
    : document.documentElement.clientHeight;
function loadHtml() {
  var div = document.createElement('div');
  div.id = 'weixin-tip';
  div.innerHTML =
    '<div style="width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;"><img src="../images/open_with_wechat.png" alt="微信打开" /></div>';
  document.body.appendChild(div);
}
function loadStyleText(cssText) {
  var style = document.createElement('style');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  try {
    style.appendChild(document.createTextNode(cssText));
  } catch (e) {
    style.styleSheet.cssText = cssText; //ie9以下
  }
  var head = document.getElementsByTagName('head')[0]; //head标签之间加上style样式
  head.appendChild(style);
}
var cssText =
  '#weixin-tip{position: fixed; left:0; top:0; background: #fff; filter:alpha(opacity=80); width: 100%; height:100%; z-index: 100;} #weixin-tip p{text - align: center; margin-top: 10%; padding:0 5%;}';
if (!isWeixin) {
  loadHtml();
  loadStyleText(cssText);
}

// 禁止移动端微信页面默认下拉
// var overscroll = function(el) {
//   el.addEventListener('touchstart', function(evt) {
//     var top = el.scrollTop,
//       totalScroll = el.scrollHeight,
//       currentScroll = top + el.offsetHeight;
//     if (top === 0) {
//       el.scrollTop = 1;
//     } else if (currentScroll === totalScroll) {
//       el.scrollTop = top - 1;
//     }
//   });
//   el.addEventListener('touchmove', function(evt) {
//     if (el.offsetHeight < el.scrollHeight) evt._isScroller = true;
//   });
// };
// document.addEventListener(
//   'touchmove',
//   function(evt) {
//     if (!evt._isScroller) evt.preventDefault();
//   },
//   {
//     passive: false
//   }
// ); 
document.body.addEventListener(
  'touchmove',
  function(e) {
    // alert(1);
    e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
  },
  { passive: false }
);
