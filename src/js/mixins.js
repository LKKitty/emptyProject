// mixins 选项接受一个混入对象的数组。这些混入实例对象可以像正常的实例对象一样包含选项，他们将在 Vue.extend() 里最终选择使用相同的选项合并逻辑合并。举例：如果你的混入包含一个钩子而创建组件本身也有一个，两个函数将被调用。
let OpenId = getCookie("OpenId")
console.log(OpenId)
let status = parseInt(getHrefUrl(location.href).id)// 0 添加  1修改
let dataIndex =parseInt(getHrefUrl(location.href).index)// 如果是修改状态则需要用到
var mixin = {
  data: function () {
    return {
      openid:OpenId, //OpenId
      dataIndex:dataIndex , //查询Id
      cachId: 0, // 0添加 1保存  有值时 为值的Id
      subId:0,//凭证修改ID
      caseId: 0,//案件id
      status: status== 0 ? false : true,
      isEdit: false, // false 添加页面下的提交   true 修改状态下点击提交
    readonly: status== 0 ? false : true, //输入框是否只读  true 只读 false 可填
    isNameRead: false, //是否显示提示
    timer:'',
    oldDay:'2019-07-08',
    areaList:{}
    }
  },
  created(){
    this.areaList = areaList
    // this.readonly= status== 0 ? false : true
  },
  // watch:{readonly:function(value) {
  //   this.readonly = value
  // }},
  methods:{
    // 是否只读、
    isReadonly() {
      if(this.readonly){
        // 如果是只读状态，则不作操作
        return true
      }
      return false
    },
    
    // 自动保存
    autoSave(name,form){
      this.timer=setInterval(() =>{
        this.setCookie(name,JSON.stringify(this[form]),5)
      },1000*dataSaveTime)
    },
    encodeUnicode(str) {
      let res = [];
      if(typeof str == "number"){
        return str;
      }
      for (let i = 0; i < str.length; i++) {
          res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
      }
      return  "\\u" + res.join("\\u");
    },
    decodeUnicode(str) {
      if(typeof str == "number"){
        return str;
      }
      return unescape(str.replace(/\\u/gi, '%u'))
    },
    setCookie(c_name,value,expiredays) {
      // console.log(value)
      // var exdate=new Date()
      // exdate.setDate(exdate.getDate()+expiredays)
      // document.cookie=c_name+ "=" +value+
      // ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
      var d = new Date();
    d.setTime(d.getTime() + (expiredays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = c_name + "=" +this.encodeUnicode(value) + "; " + expires;
    },
    //取回cookie
    getCookie(c_name)
    {
      let c_start,c_end
    if (document.cookie.length>0)
      {
      c_start=document.cookie.indexOf(c_name + "=")
      if (c_start!=-1)
        { 
        c_start=c_start + c_name.length+1 
        c_end=document.cookie.indexOf(";",c_start)
        if (c_end==-1) c_end=document.cookie.length
        return this.decodeUnicode(document.cookie.substring(c_start,c_end))
        } 
      }
    return ""
    },
    // 删除cookie
    delCookie(name)
    {
      var exp = new Date();
      exp.setTime(exp.getTime() - 1000);
      var cval=this.getCookie(name);
      if(cval!=null)
      document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    },
    // 点击输入框蒙层
    inputMaskClick(e) {
      // 把所有的提示语关闭
      let tip = document.getElementsByClassName('tip-text-box')
      for(let i = 0;i<tip.length;i++) {
        tip[i].style.display='none'
      }
      // 显示当前提示语
      e.target.parentNode.lastChild.style.display='block'
    },
    // input框失去焦点
    inputBlur(e){
      if(this.isReadonly()) return
       //只读
      let inputMask = e.target.previousSibling.previousSibling
      // 显示蒙层
      inputMask.style.display="block"
      let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
      window.scrollTo(0, Math.max(scrollHeight - 1, 0))
    },
    // input框聚集焦点
    inputFoucs(e){
    },
    // 点击提示按钮
    errIconClick(e){
      if(this.isReadonly()) return
      // 把所有的提示语关闭
      let tip = document.getElementsByClassName('tip-text-box')
      for(let i = 0;i<tip.length;i++) {
        tip[i].style.display='none'
      }
      // console.log()
      // e.target.previousSibling.previousSibling.lastChild.style.display='block'
      e.target.parentNode.getElementsByClassName('tip-text-box')[0].style.display='block'
      
    },
    // 点击已阅读
    alread(e) {
      // 提示语消失
      e.target.parentNode.style.display='none'
      // 输入框聚焦
      e.target.parentNode.previousSibling.previousSibling.focus()
      // e.target.parentNode.previousSibling.previousSibling.focus()
      // e.target.parentNode.parentNode.classList.remove('active')
      // input蒙层消失
      e.target.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.style.display="none"
    },
    // 有弹出层时点击已阅读
    pup_alread(e,picker){
      // 提示语消失
      e.target.parentNode.style.display='none'
      this[picker] = true //弹出对应的选择器
    },
    clearNoNum(obj){
      obj = obj.replace(/[^\d.]/g,"");  //清除“数字”和“.”以外的字符
      obj = obj.replace(/^\./g,"");  //验证第一个字符是数字而不是.
      obj = obj.replace(/\.{2,}/g,"."); //只保留第一个. 清除多余的.
      obj = obj.replace(".","$#$").replace(/\./g,"").replace("$#$",".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
      if(obj === '') {
        obj=''
      } else {
        return parseInt(obj)
      }
  },
    upImg(file){
      vant.Toast.loading({
        message: '正在上传...',
        loadingType: 'spinner',
        duration:0
      });
      var formData = new FormData();
          formData.append("upfile", file);
      return new Promise((resolve, reject) => {
        axios({
          method:'post',
          url:'/Home/UpLoadImg',
          data:formData
        })
          .then( res => {
            vant.Toast.clear()
            resolve(res.data.Data);
          })
          .catch(rej => {
            vant.Toast.fail('上传失败，请刷新页面重新上传');
            reject(rej);
          })
      })
    },
    // 上传图片进行压缩，还在试验中，项目暂时没用
    upImg2(file){
      let _that = this
      // 压缩图片需要的一些元素和对象
      var reader = new FileReader(file), img = new Image();
      img.crossOrigin="anonymous"; //关键
      reader.readAsDataURL(file);
      // 选择的文件对象
      var file = null;
      // 缩放图片需要的canvas
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      //base64地址图片加载完毕后
      img.onload = function () {
        // 图片原始尺寸
        var originWidth = this.width;
        var originHeight = this.height;
        // 最大尺寸限制
        var maxWidth = 400, maxHeight = 400;
        // 目标尺寸
        var targetWidth = originWidth, targetHeight = originHeight;
        // 图片尺寸超过400x400的限制
        if (originWidth > maxWidth || originHeight > maxHeight) {
            if (originWidth / originHeight > maxWidth / maxHeight) {
                // 更宽，按照宽度限定尺寸
                targetWidth = maxWidth;
                targetHeight = Math.round(maxWidth * (originHeight / originWidth));
            } else {
                targetHeight = maxHeight;
                targetWidth = Math.round(maxHeight * (originWidth / originHeight));
            }
        }
            
        // canvas对图片进行缩放
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        // 清除画布
        context.clearRect(0, 0, targetWidth, targetHeight);
        // 图片压缩
        let a = context.drawImage(img, 0, 0, targetWidth, targetHeight);
        setTimeout(() =>{
          console.log(img,img.src)
          console.log(a)
        },500)
        _that.form.cardImg2=[]
        _that.form.cardImg2.push({
          url:img.src
        })
        // var formData =dataURLtoBlod(a)
        // return new Promise((resolve, reject) => {
        //   axios({
        //     method:'post',
        //     url:'/Home/UpLoadImg',
        //     data:formData
        //   })
        //     .then( res => {
        //       vant.Toast.clear()
        //       console.log(res.data.Data)
        //       resolve(res.data.Data);
        //     })
        //     .catch(rej => {
        //       vant.Toast.fail('上传失败，请刷新页面重新上传');
        //       reject(rej);
        //     })
        // })
      };
      // 文件base64化，以便获知图片原始尺寸
      reader.onload = function(file) {
        img.src = file.target.result;
      };
    },
    // 上传图片的base64格式 没用到
    upImgBase64(file){
      vant.Toast.loading({
        message: '正在上传...',
        loadingType: 'spinner',
        duration:0
      });
      // 压缩图片需要的一些元素和对象
      var formData = dataURLtoBlod(file)
      return axios({
          method:'post',
          url:'/Home/qiniuUploadimgs',
          data:formData
        }).then((res) =>{
          vant.Toast.clear()
          return res.data
        })
    },
    delImg(data,index) {
      if(index === '无') {
        this.iform[data] = ''
        return
      }
      this.$delete(data,index)
    },
    formatTime(value,day=false){
      if(value) {
        let time = formatTime(value)
        time = time.split('-')
        return time
      }
    },
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`
      }
      return value;
    },
    oldTime(date){
      let dd = date.substring(6, date.length-2);
      var d = new Date(parseInt(dd))
      return formatTime(d,true)
    },
    imagePreviewSrc(type) {
      let src= type
      vant.ImagePreview([
        src
      ]);
    },
    // 回滚
    scrollT(id,other=false){
      let d =document.getElementById(id)
      let activeDom= d
      if(other) {
        activeDom=id
      }
      activeDom.scrollIntoView({block: "center",behavior:"smooth"})
      activeDom.classList.add('active')
      activeDom.style.color=
      setTimeout(()=>{
        activeDom.classList.remove('active')
      },4000)
    },
    // 显示蒙层
    showPicker(picker){
      if(this.isReadonly()) return
      this[picker] = true
    },
  }
}