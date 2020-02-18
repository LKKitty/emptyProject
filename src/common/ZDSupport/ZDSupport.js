'use strict';
/**
 * 遮罩层
 */
var zdLayer;
/**
 * 长按按钮消失
 */
var timer;
var timers;
/**
 * 获取当前路径
 */
var path = document.scripts;
path = path[path.length - 1].src.substring(
  0,
  path[path.length - 1].src.lastIndexOf('/') + 1
);
/**
 * @param {draggable?:boolean,path?:string,style?:object,link?:string} options
 * 传入一个options对象，可选参数有
 * darggable 可选， 是否可拖动，默认false
 * style 可选，logo样式 默认：大小86px，圆形，背景色rgb(140,106,111)
 * path 可选，logo图片相对路径，默认 './'
 * link 可选，点击图标跳转链接，默认：没有值，不跳转
 */

var WeSaltLogo = (function() {
  var defaultStyle = {
    position: 'absolute',
    borderRadius: '50%',
    width: '77px',
    height: '77px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    mozTransitionProperty: 'all',
    webkitTransitionProperty: 'all',
    oTransitionProperty: 'all',
    transitionProperty: 'all',
    zIndex: 999,
    right: '11px',
    bottom: '11px'
  };
  var middleDivStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(' + path + '/logo.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundSize: 'contain'
  };
  var bgStyle = {
    width: '73%',
    height: '73%',
    borderRadius: '50%',
    backgroundColor: 'rgba(222,97,76,0.8)',
    backgroundPosition: 'center',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: '-1'
  };
  var layerStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'none',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center',
    backgroundSize: 'auto',
    zIndex: 9998
  };
  var defaultOptions = {
    right: '11px',
    bottom: '11px',
    draggable: true,
    style: bgStyle
  };
  var WeSaltLogo = function WeSaltLogo(options) {
    this.opts = mergeObj(defaultOptions, options);
    this.div = this.createDiv(options);
    document.body.appendChild(this.div);
    this.drag(this.opts.draggable);

    //遮罩层
    zdLayer = document.createElement('div');
    document.body.appendChild(zdLayer);
    this.dealWithStyleSheet(zdLayer, layerStyle);
    if (
      document.documentElement.clientWidth >
      document.documentElement.clientHeight
    )
      zdLayer.style.backgroundImage = 'url(' + path + '/across.png)';
    else zdLayer.style.backgroundImage = 'url(' + path + '/vertical.png)';

    zdLayer.addEventListener('click', function() {
      zdLayer.style.display = 'none';
    });

    return this.div;
  };
  WeSaltLogo.prototype.createDiv = function() {
    var self = this;
    var div = document.createElement('div');
    var border = document.createElement('div');
    var bgBlock = document.createElement('div');
    div.appendChild(bgBlock);
    div.appendChild(border);

    if (typeof self.opts.left != 'undefined') {
      defaultStyle.right = 'auto';
      defaultStyle.left = self.opts.left;
    }

    if (typeof self.opts.bottom != 'undefined') {
      defaultStyle.bottom = self.opts.bottom;
    }

    this.dealWithStyleSheet(div, defaultStyle);
    this.dealWithStyleSheet(border, middleDivStyle);
    this.dealWithStyleSheet(bgBlock, self.opts.style);
    return div;
  };
  WeSaltLogo.prototype.drag = function(draggable) {
    var _this = this;
    this.div.addEventListener('click', function() {
      if (zdLayer.style.display == 'block') zdLayer.style.display = 'none';
      else zdLayer.style.display = 'block';
    });
    dragOnTouchScreen(this.div);
    dragOnPCScreen(this.div, this.opts.link);
  };
  WeSaltLogo.prototype.dealWithStyleSheet = function(dom, styleSheet) {
    var style = Object.assign({}, styleSheet);
    setStyle(dom, style);
  };

  function setStyle(div, styleSheet) {
    for (var v in styleSheet) {
      div.style[v] = styleSheet[v];
    }
  }

  function dragOnTouchScreen(dom) {
    var oW, oH, oLeft, oTop;
    var maxX = document.documentElement.clientWidth - dom.offsetWidth,
      maxY = document.documentElement.clientHeight - dom.offsetHeight,
      minX = 0,
      minY = 0;

    dom.addEventListener(
      'touchstart',
      function(e) {
        timer = 0;
        timers = setInterval(function() {
          timer += 1;
        }, 1000);
        var touches = e.touches[0];
        oW = touches.clientX - dom.offsetLeft;
        oH = touches.clientY - dom.offsetTop;
        //阻止页面的滑动默认事件
        document.addEventListener('touchmove', defaultEvent, false);
      },
      false
    );
    dom.addEventListener(
      'touchmove',
      function(e) {
        var touches = e.touches[0];
        oLeft = touches.clientX - oW;
        oTop = touches.clientY - oH;
        setPos(dom, oLeft, oTop, 0);
      },
      false
    );
    dom.addEventListener(
      'touchend',
      function(e) {
        clearInterval(timers);
        if (timer >= 3) {
          dom.style.display = 'none';
        }
        oLeft = oLeft < minX ? minX : oLeft > maxX ? maxX : oLeft;
        oTop = oTop < minY ? minY : oTop > maxY ? maxY : oTop;

        setPos(dom, oLeft, oTop, 1000);
        document.removeEventListener('touchmove', defaultEvent, false);
      },
      false
    );

    function defaultEvent(e) {
      e.preventDefault();
    }
  }

  function dragOnPCScreen(box, link) {
    var disx = 0,
      disy = 0,
      oLeft,
      oTop,
      beginX,
      beginY,
      endX,
      endY;
    var maxX = document.documentElement.clientWidth - box.offsetWidth,
      maxY = document.documentElement.clientHeight - box.offsetHeight,
      minX = 0,
      minY = 0;

    box.onmousedown = function(evt) {
      var oevent = evt || window.event;
      beginX = oevent.clientX;
      beginY = oevent.clientY;
      disx = oevent.clientX - box.offsetLeft;
      disy = oevent.clientY - box.offsetTop;
      document.onmousemove = function(evt) {
        var oevent = evt || window.event;
        oLeft = oevent.clientX - disx;
        oTop = oevent.clientY - disy;
        oLeft = oLeft < minX ? minX : oLeft > maxX ? maxX : oLeft;
        oTop = oTop < minY ? minY : oTop > maxY ? maxY : oTop;
        setPos(box, oLeft, oTop, 0);
      };
      document.onmouseup = function(evt) {
        var oevent = evt || window.event;
        endX = oevent.clientX;
        endY = oevent.clientY;

        var isJump = checkJump(beginX, beginY, endX, endY, link && link !== '');
        if (isJump) {
          window.location.href = link;
        }

        oLeft = oLeft < minX ? minX : oLeft > maxX ? maxX : oLeft;
        oTop = oTop < minY ? minY : oTop > maxY ? maxY : oTop;
        setPos(box, oLeft, oTop, 1000);
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  }

  function setPos(dom, l, t, dur) {
    dom.style.transitionDuration = dur + 'ms';
    dom.style.left = l + 'px';
    dom.style.top = t + 'px';
  }

  function checkJump(x1, y1, x2, y2, hasLink) {
    var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    return d < 7 && hasLink;
  }

  function mergeObj(obj1, obj2) {
    if (Object.prototype.toString.call(obj1) !== '[object Object]') return null;
    var obj = Object.assign({}, obj1);
    for (var key2 in obj2) {
      if (
        Object.prototype.toString.call(obj[key2]) === '[object Object]' ||
        Object.prototype.toString.call(obj[key2]) === '[object Array]'
      ) {
        obj[key2] =
          mergeObj(obj1[key2], obj2[key2]) === null
            ? obj2[key2]
            : mergeObj(obj1[key2], obj2[key2]);
      } else {
        obj[key2] = obj2[key2];
      }
    }
    return obj;
  }
  return WeSaltLogo;
})();
var options = {
  style: {
    'background-color': 'rgba(2,72,162,0.6)' //可选，logo样式
  }
};
window.onload = function() {
  new WeSaltLogo(options);
};
