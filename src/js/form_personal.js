// let status = parseInt(getHrefUrl(location.href).id) // 0 添加  1修改
var vm =new Vue({
  el:'#app',
  mixins: [mixin],
  data:{
    cashDataTimer: null, //如果数据库有缓存的情况下，每隔十秒进行数据库缓存
    proveTimer: null , //缓存继承信息时间器
    isRapeat: true, //重复提交
    tipShow: true,// //是否显示损失申报说明 修改状态不显示
    readMsg:'投入时所开收据中记载的 集资参与人本人的姓名', //重要提示语
    showCardPicker: false,
    cardTypes:['中华人民共和国居民身份证','护照','港澳居民来往内地通行证','台湾居民来往大陆通行证','其他证件'], //证件类型
    minDate: new Date(1945,0, 1),
    currentDate: new Date(),
    timePickerShow:false,//时间选择器
    cardTypeShowText1:['身份证正面','护照正面','通行证正面','通行证正面','其他证正面'],
    cardTypeShowText2:['身份证反面','护照内页','通行证反面','通行证反面','其他证反面'],
    emlImg1:['../images/emlImg/idcard1.jpg','../images/emlImg/hz1.jpg','../images/emlImg/hk1.png','../images/emlImg/taiwan1.png'], //例图正面
    emlImg2:['../images/emlImg/idcard2.jpg','../images/emlImg/hz2.jpg','../images/emlImg/hk2.png','../images/emlImg/taiwan2.png'], //例图反面
    card1ShowImg:false, //证件正面图片
    showHousePicker:false, //是否显示户籍地址选择器
    showCurrentAddrPicker:false, //是否显示户籍地址选择器
    // 新增继承信息
    iform:{
      inherit:'本人', //继承人身份
      sinheritName: '', //被继承人名字
      sinheritNum: '', //被继承人证件号码
      cardImg1:'',
      cardImg2:'',
      isRprove: true, //亲属关系证明
      isDeathprove: true, //被继承人死亡证明
      isJprove: true, //证实继承权利的公证文书证明
      rproveImg:'', //亲属关系证明图片
      deathproveImg: '' , //被继承人死亡证明图片
      jproveImg: '' , //证实继承权利的公证文书图片
    },
    form:{
      name:'', //姓名
      sex:'男', //性别
      cardTypeText:'中华人民共和国居民身份证',//证件类型
      cardTypeIndex:0, //类型下标
      othercardName:'',//其他证件名称
      idcard:'', //证件号码
      birthday:'', //生日
      houseAddr: '', //户籍地址
      houseAddrDe: '', //户籍详细地址
      currentAddr:'',//现居地址
      currentAddrDe:'',//现居详细地址
      tel:'', //本人手机号码
      otherTel: '' //其他电话
    }
  },
  created(){
  },
  mounted() {
    if(this.status) {
      this.getData() //从数据库获取信息
    } else {
      this.getCashData()
      // 如果状态是false，则是从添加按钮进入 status false
    }
  },
  methods:{
    // getData
    getData() {
      let _that=this
      let p = this.form
      // alert(p)
      _that.$axios({
        method:'post',
        url:'/WebApi/GetInformationBycid',
        data:{
          cid:this.dataIndex
        }
      }).then((res) =>{
        let d = res.data.Data
        this.oldDay = this.oldTime(d.UpdateTime)
        _that.personal_data(d)
      })
    },
    // 请求是否数据库已经有缓存
    getCashData(){
      let _that = this
      _that.$axios({
        method:'post',
        url:'/WebApi/SelectInfo',
        data:{
          OpenId:_that.openid
        }
      }).then((res) =>{
        // 如果数据库已经有缓存，则用数据库的信息
        if(res.data.ResultCode === 1000) {
          let data = res.data.Data.Information
          _that.personal_data(data)
          _that.caseId = data.CaserosterId
          _that.setCookie('caseId',data.CaserosterId,5) //将案件Id 进行缓存
           // 数据库有缓存将本地个人信息置为0
          setCookie('personForm',0,365)
           // 数据库有缓存将本地新增个人信息置为0
          setCookie('inheritForm',0,365)
          // 如果数据库已经有缓存，则每隔十秒进行数据库保存
          this.cashDataTimer=setInterval(() =>{
            _that.edit(1,false)
          },1000*dataSaveTime)
        } else {
          //  如果案件ID存在则删除
          if(_that.getCookie('caseId')) {
            _that.delCookie('caseId')   
          }
          _that.caseId = 0
          // 进行前端页面的缓存功能
          this.autoSave('personForm','form') //进行缓存
          // 缓存新增的继承信息
          this.proveTimer=setInterval(() =>{
            this.setCookie('inheritForm',JSON.stringify(this.iform),5)
          },1000*dataSaveTime)
          // 如果数据库没有缓存，则判断是否前端存有缓存信息
          if(_that.getCookie('personForm') != 0) {
            _that.form= JSON.parse(_that.getCookie('personForm'))  //如果前端有缓存则用前端缓存
          } else {
            _that.form = _that.form //否则为默认数据
          }
          // 如果数据库没有缓存，则判断是否前端存有缓存信息
          if(_that.getCookie('inheritForm') != 0) {
            _that.iform= JSON.parse(_that.getCookie('inheritForm'))  //如果前端有缓存则用前端缓存
          } else {
            _that.iform = _that.iform //否则为默认数据
          }
        }
      })
    },
    // 将后台个人信息转成本地信息
    personal_data(d){
        // this.oldDay = this.oldTime(d.UpdateTime)
      let p = this.form //本地个人信息
      let iform = this.iform //新增继承信息
      // 申报人身份
      iform.inherit = d.Sftype?d.Sftype:'本人'
      iform.sinheritName = d.BjName?d.BjName:'' //被继承人姓名
      iform.sinheritNum = d.BjIdcard?d.BjIdcard:'' //被继承人证件号码
      iform.cardImg1 = d.Idimg1?d.Idimg1:''//身份证正面
      iform.cardImg2 = d.Idimg2?d.Idimg2:''//身份证反面
      iform.isRprove = d.Shipor === '有'?true:false
      iform.rproveImg = d.Shipimg?d.Shipimg:''
      iform.isDeathprove = d.Dieor === '有'?true:false
      iform.deathproveImg = d.Dieimg?d.Dieimg:''
      iform.isJprove = d.Zsor=== '有'?true:false
      iform.jproveImg = d.Zsimg?d.Zsimg:''
      p.name=d.InName?d.InName:''
      p.sex=d.Sex ? d.Sex: ''
      p.cardTypeText=d.Idtype ?d.Idtype :''
      if(d.Idtype  === '其他证件') {
        p.othercardName=d.Idcard?d.Idcard:''
      } else {
        p.idcard=d.Idcard?d.Idcard:''
      }
      p.birthday=d.Idyear?d.Idyear:''
      p.houseAddr=d.Idaddress ? d.Idaddress:''
      p.houseAddrDe=d.Dtaddress1 ? d.Dtaddress1:''
      p.currentAddr=d.Nowaddress ? d.Nowaddress:''
      p.currentAddrDe=d.Dtaddress2 ? d.Dtaddress2:''
      p.tel= d.Phone ? d.Phone:''
      p.otherTel=d.Tel ? d.Tel:''
      document.title=d.InName?d.InName+'个人信息':'个人信息'
      this.subId=d.Id
      this.form=p
    },
    // 监听申报说明
    tipConfirm(e){
      if(e){
        this.tipShow = !this.tipShow
        window.scrollTo(0,0);
      }
    },
    // 选择继承人身份
    chooseInherit(value){
      if(this.isReadonly()) return
      if(value === '本人') {
        this.iform.isRprove=false
        this.iform.isDeathprove=false
        this.iform.isJprove=false
        this.iform.sinheritName=''
        this.iform.sinheritNum=''
        this.iform.rproveImg=''
        this.iform.deathproveImg=''
        this.iform.jproveImg=''
      }
      this.iform.inherit=value
    },
    // 选择性别
    chooseSex(sex){
      if(this.isReadonly()) return
      if(sex === '男') {
        this.form.sex = '男'
      } else {
        this.form.sex = '女'
      }
    },
     // 选择亲属关系证明 
    chooseRprov(value){
      if(this.isReadonly()) return
      if(value === '有') {
        this.iform.isRprove = true
      } else {
        this.iform.isRprove = false
        this.iform.rproveImg=''
      }
    },
     // 选择被继承人死亡证明 
    chooseDprov(value){
      if(this.isReadonly()) return
      if(value === '有') {
        this.iform.isDeathprove = true
      } else {
        this.iform.isDeathprove = false
        this.iform.deathproveImg=''
      }
    },
     // 选择证实继承权利的公证文书 
    chooseJprov(value){
      if(this.isReadonly()) return
      if(value === '有') {
        this.iform.isJprove = true
      } else {
        this.iform.isJprove = false
        this.iform.jproveImg=''
      }
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
    // 选择身份证类型
    onCardConfirm(value) {
      console.log(this.form.cardTypeText,value)
      // 如果选的值跟之前的不相同 则清空相对应的数据
      if(this.form.cardTypeText != value) {
        this.form.idcard = '' //清空证件号码
        this.form. cardImg1 = [] // 清空正反面
        this.form. cardImg2 = [] // 清空正反面
      }
      let index = this.cardTypes.findIndex(item =>{
        return item===value
      })
      this.form.cardTypeText = value;
      this.form.cardTypeIndex = index
      this.showCardPicker = false;
    },
    // 判断继承人身份证
    inputBlurCard2(e) {
      let form = this.iform
      if(form.sinheritNum==='' || (!formatIdcard.test(form.sinheritNum))) {
        vant.Toast('请填写被继承人正确的证件号码');
        this.scrollT('sinheritNum')
        return 
      }
      if(!this.status) {
        axios({
          method:'post',
          url:'/WebApi/IdCardIshave',
          data:Qs.stringify({BjIdcard:form.sinheritNum,Id:this.subId})
        }).then((res) =>{
          if(res.data.ResultCode !== 1000) {
            vant.Toast(res.data.Message+'，请重新填写')
            form.sinheritNum = ''
            this.scrollT('sinheritNum')
          } else {
          }
        })
      } else if(this.status && !this.readonly) {
        axios({
          method:'post',
          url:'/WebApi/IdCardIshave',
          data:Qs.stringify({card:form.sinheritNum,Id:this.subId})
        }).then((res) =>{
          if(res.data.ResultCode !== 1000) {
            vant.Toast(res.data.Message+'，请重新填写')
            form.sinheritNum = ''
            this.scrollT('sinheritNum')
          } else {
          }
        })
      } else {

      }
    },
    // 判断身份证
    inputBlurCard(e) {
      let form = this.form
        if(form.cardTypeText === '中华人民共和国居民身份证'){
          if(form.idcard.trim()==='' || (!formatIdcard.test(form.idcard))) {
            vant.Toast('请填写正确的证件号码');
            this.scrollT('idcard')
            return 
          }
          if(!this.status) {
            axios({
              method:'post',
              url:'/WebApi/IdCardIshave',
              data:Qs.stringify({card:form.idcard,Id:this.subId})
            }).then((res) =>{
              if(res.data.ResultCode !== 1000) {
                vant.Toast(res.data.Message+'，请重新填写')
                form.idcard = ''
                this.scrollT('idcard')
              } else {
              }
            })
          } else if(this.status && !this.readonly) {
            axios({
              method:'post',
              url:'/WebApi/IdCardIshave',
              data:Qs.stringify({card:form.idcard,Id:this.subId})
            }).then((res) =>{
              if(res.data.ResultCode !== 1000) {
                vant.Toast(res.data.Message+'，请重新填写')
                form.idcard = ''
                this.scrollT('idcard')
              } else {
              }
            })
          } else {

          }
        }
      
    },
    // 选择生日
    onTimefirm(value){
      let time = formatTime(value)
      time = time.split('-')
      this.form.birthday = time[0]+'年'+time[1]+'月'
      this.timePickerShow=!this.timePickerShow
    },
    // 身份证正面
    card1afterRead(file) {
      this.card1ShowImg=!this.card1ShowImg
      this.form.cardImg1 = file.content
      console.log(file.content);
    },
    //图片上传
    afterRead1(e) {
      let _that=this
      let inputDOM = this.$refs.inputer1;
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.iform.cardImg1 = res
      })
    },
    afterRead2(file) {
      let _that=this
      let inputDOM = this.$refs.inputer2;
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.iform.cardImg2 = res
      })
    },
    // 亲属证明图片上传
    afterReadPrevImg1(e) {
      let _that=this
      let inputDOM = this.$refs.inputer3;
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.iform.rproveImg = res
      })
    },
    // 被继承人死亡证明图片上传
    afterReadPrevImg2(e) {
      let _that=this
      let inputDOM = this.$refs.inputer4;
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.iform.deathproveImg = res
      })
    },
    // 证实继承权利的公证文书图片上传
    afterReadPrevImg3(e) {
      let _that=this
      let inputDOM = this.$refs.inputer5;
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.iform.jproveImg = res
      })
    },
    // 插件上传图片
    vantAfterRead(file) {
      let _that=this
      // let formdata = dataURLtoBlod(file.content)
      this.upImgBase64(file.content).then((res)=>{
        _that.form.cardImg1=[]
        _that.form.cardImg1.push({
          url:res
        })
      })
    },
    // 确认选择户籍地址省市
    onHouseConfirm(value) {
      this.showHousePicker = false;
      if(value[0].name === value[1].name) {
        this.form.houseAddr=value[0].name
        return
      }
      this.form.houseAddr=value[0].name+value[1].name
    },
    // 确认选择现居地址省市
    onCurrentAddrfirm(value) {
      this.showCurrentAddrPicker = false;
      if(value[0].name === value[1].name) {
        this.form.currentAddr=value[0].name
        return
      }
      this.form.currentAddr=value[0].name+value[1].name
    },
    // 例图预览
    imagePreview(type) {
      let src= ''
      if(type === '正面') {
        src=this.emlImg1[this.form.cardTypeIndex]
      } else {
        src=this.emlImg2[this.form.cardTypeIndex]
      }
      vant.ImagePreview([
        src
      ]);
    },
    // 点击确认提交
    submit(){
      let _that=this
      // 如果是只读状态则为不可修改状态，点修改变成可修改状态
      if(this.readonly){
        document.getElementById('name').scrollIntoView({block: "center",behavior:"smooth"})
        vant.Toast('请修改后进行保存~');
        this.readonly=!this.readonly
        this.isEdit = !this.isEdit //点击修改状态后
        return
      }
      // 可修改状态下，进行校验提交
      let check = this.check()
      if(check) {
      // 校验成功之后
        check.then((res)=>{
          if(_that.iform.inherit === '本人') {
            _that.idcard_check()
          } else {
            axios({
              method:'post',
              url:'/WebApi/IdCardIshave',
              data:Qs.stringify({BjIdcard:_that.iform.sinheritNum,Id:_that.subId})
            }).then((res) =>{
                if(res.data.ResultCode !== 1000) {
                  vant.Toast(res.data.Message+'，请重新填写')
                  _that.iform.sinheritNum = ''
                  _that.scrollT('idcard')
                } else {
                  _that.idcard_check()
                }
              })
          }
        })
      }
    },
    // 提交前判断身份证
    idcard_check(){
      let _that=this
      if(_that.form.cardTypeText ==='中华人民共和国居民身份证') {
        axios({
          method:'post',
          url:'/WebApi/IdCardIshave',
          data:Qs.stringify({card:_that.form.idcard,Id:_that.subId})
        }).then((res) =>{
          if(res.data.ResultCode !== 1000) {
            vant.Toast(res.data.Message+'，请重新填写')
            form.idcard = ''
            _that.scrollT('idcard')
          } else {
             // sessionStorage.setItem('personForm','') //清空缓存
            // 如果是点击修改后提交
            if(_that.isEdit) {
              console.log('你修改了个人信息')
              // status 0 正式提交
              _that.edit(0)
              return
            }
            // 缓存数据
            _that.setCookie('personForm',JSON.stringify(_that.form),5) //总体保存一次
            _that.setCookie('inheriForm',JSON.stringify(_that.iform),5) //总体保存一次继承信息
            // 如果案件Id 为 0
            if(_that.caseId === 0) {
              clearInterval(_that.timer) //清除定时器
              clearInterval(_that.proveTimer) //清除定时器
              // 直接进入案件页面
              location.href="./form_case.html?id=0"
            } else {
              clearInterval(_that.cashDataTimer) //清除定时器
              // 如果案件Id不为0 则向数据库保存一次 status 1保存 保存后进入案件页面
              _that.edit(1)
            }
          }
        })
      } else {
        // sessionStorage.setItem('personForm','') //清空缓存
        // 如果是点击修改后提交
        if(_that.isEdit) {
          console.log('你修改了个人信息')
          // status 0 正式提交
          _that.edit(0)
          return
        }
        // 缓存数据
        _that.setCookie('personForm',JSON.stringify(_that.form),5) //总体保存一次
        _that.setCookie('inheritForm',JSON.stringify(_that.iform),5) //总体保存一次继承信息
        // 如果案件Id 为 0
        if(_that.caseId === 0) {
          clearInterval(_that.timer) //清除定时器
          clearInterval(_that.proveTimer) //清除定时器
          // 直接进入案件页面
          location.href="./form_case.html?id=0"
        } else {
          clearInterval(_that.cashDataTimer) //清除定时器
          // 如果案件Id不为0 则向数据库保存一次 status 1保存 保存后进入案件页面
          _that.edit(1)
        }
      }
    },
    // 修改
    edit(status,isSubmit=true){
      let _that=this
      if(isSubmit) {
        vant.Toast.loading({
          message: '加载中...',
          loadingType: 'spinner',
          duration:0
        });
      }
      let p = this.form
      let iform = this.iform
      let caseId ='' 
      if(parseInt(status) === 0) {
        caseId = this.dataIndex
      } else {
        caseId = this.caseId
      }
      let idCard
      if(p.cardTypeText === '其他证件') {
        idCard = p.othercardName 
      } else {
        idCard = p.idcard
      }
      // 如果选中的值不是身份证 清空户籍住址 生日为空
      if(p.cardTypeText !=='中华人民共和国居民身份证') {
          p.houseAddr = ''
          p.houseAddrDe = ''
      }
      if(p.cardTypeText ==='中华人民共和国居民身份证') {
          p.birthday=''
      }
      axios({
        method:'post',
        url:'/WebApi/UpdateInformation',
        data:Qs.stringify({
          Id:this.subId,//个人信息Id
          CaserosterId:caseId, //案件Id
          Status:parseInt(status),
          Sftype:iform.inherit,
          BjName:iform.sinheritName,
          BjIdcard:iform.sinheritNum,
          Idimg1: iform.cardImg1?iform.cardImg1:'',
          Idimg2: iform.cardImg2?iform.cardImg2:'',
          Shipor:iform.isRprove?'有':'无',
          Shipimg:iform.rproveImg?iform.rproveImg:'',
          Dieor:iform.isDeathprove?'有':'无',
          Dieimg:iform.deathproveImg?iform.deathproveImg:'',
          Zsor:iform.isJprove?'有':'无',
          Zsimg:iform.jproveImg?iform.jproveImg:'',
          InName: p.name,
          Sex: p.sex,
          Idtype: p.cardTypeText,
          Idcard: idCard,
          Idyear: p.birthday,
          Idaddress: p.houseAddr,
          Dtaddress1: p.houseAddrDe,
          Nowaddress: p.currentAddr,
          Dtaddress2: p.currentAddrDe,
          Phone: p.tel ,
          Tel: p.otherTel ,
        })
      }).then((res) =>{
        if(parseInt(status) === 0) {
          vant.Toast.clear()
          if(res.data.Message ==='操作成功') {
            vant.Dialog.alert({
              message: '修改成功'
            }).then(() => {
              // on close
              location.href="/WebApi/Index"
              // location.href="./allIndex.html"
            });
          } else {
            vant.Dialog.alert({
              message: '修改失败，请重试'
            }).then(() => {
              // on close
            });
          }
        } else {
          // 进入案件页面
          if(isSubmit) {
            vant.Toast.clear()
            location.href="./form_case.html?id=0"
          }
        }
      })
    },
    // 校验
    check() {
      let form = this.form
      let iform =this.iform
      let card = false
      if(iform.inherit === '继承人') {
        if(iform.sinheritName.trim() === '') {
          vant.Toast('请填写被继承人姓名');
          this.scrollT('sinheritName')
          return
        }
        if(iform.sinheritNum === '' || !formatIdcard.test(iform.sinheritNum)) {
          vant.Toast('请填写被继承人正确的18位身份证号码');
          this.scrollT('sinheritNum')
          return
        }
      }
      if(form.name.trim()==='') {
        if(form.inherit === '继承人') {
          vant.Toast('请填写继承人姓名');
        } else {
          vant.Toast('请填写姓名');
        }
        this.scrollT('name')
        return
      }
      //如果选择的证件是身份证，校验身份证判断户籍地址和详细地址
      if(form.cardTypeText === '中华人民共和国居民身份证') {
        if(form.idcard.trim()==='' || (!formatIdcard.test(form.idcard))) {
          vant.Toast('请填写正确的证件号码');
          this.scrollT('idcard')
          return 
        } 
        if(iform.cardImg1=== ''){
          vant.Toast(`请上传${this.cardTypeShowText1[form.cardTypeIndex]}`);
          this.scrollT('cardImg1')
          return 
        }
        if(iform.cardImg2=== ''){
          vant.Toast(`请上传${this.cardTypeShowText2[form.cardTypeIndex]}`);
          this.scrollT('cardImg2')
          card = true
          return 
        }
        // 如果选择的是继承人
        if(iform.inherit === '继承人') {
          if(iform.isRprove && iform.rproveImg === ''){
            vant.Toast(`请上传亲属关系证明`);
            this.scrollT('proveImg1')
            card = true
            return 
          }
          if(iform.isDeathprove && iform.deathproveImg === ''){
            vant.Toast(`请上传被继承人死亡证明`);
            this.scrollT('proveImg2')
            card = true
            return 
          }
          if(iform.isJprove && iform.jproveImg === ''){
            vant.Toast(`请上传证实继承权利的公证文书或法院判决`);
            this.scrollT('proveImg3')
            card = true
            return 
          }
        }
        if(form.houseAddr.trim() ==='') {
          vant.Toast('请选择户籍地址省市')
          this.scrollT('houseAddr')
          return
        }
        if(form.houseAddrDe.trim() ==='') {
          vant.Toast('请填写详细的户籍地址')
          this.scrollT('houseAddrDe')
          card = true
          return
        }
        // 不分证件都要填写
        if(form.currentAddr.trim() ==='') {
          vant.Toast('请选择现居地址省市')
          this.scrollT('currentAddr')
          return
        }
        if(form.currentAddrDe.trim() ==='') {
          vant.Toast('请填写详细的现居地址')
          this.scrollT('currentAddrDe')
          return
        }
        if(form.tel.trim() ==='' || (!formatTel.test(form.tel))) {
          vant.Toast('请填写正确11位手机号码')
          this.scrollT('tel')
          return
        }
        if(form.otherTel) {
          if(!formatTel.test(form.otherTel)) {
            vant.Toast('请填写正确11位电话号码')
            this.scrollT('otherTel')
            return
          }
        }
        // 继承人和本人的身份证不能相同
        if(iform.inherit === '继承人') {
          if(iform.sinheritNum === form.idcard) {
            vant.Toast('继承人和本人的身份证不能相同')
            this.scrollT('idcard')
            return
          }
        }
        return new Promise((resolve)=>{
          console.log('校验成功')
          resolve(true)
        },(reject)=>{
          console.log('失败')
          reject()
        })
      } else {
        if(form.birthday.trim() ==='') {
          vant.Toast('请选择出生年月')
          this.scrollT('birthday')
          return
        }
        // 其他证件
        if(form.cardTypeText === '其他证件') {
          if(form.othercardName.trim()==='') {
            vant.Toast('请填写其他证件名称');
            form.idcard = '' //证件号码置为空
            this.scrollT('othercard')
            return
          }
        } else {
          if(form.idcard.trim()==='') {
            vant.Toast('请填写正确的证件号码');
            this.scrollT('idcard')
            return
          }
        }
        // 不分证件都要填写
        if(iform.cardImg1=== ''){
          vant.Toast(`请上传${this.cardTypeShowText1[form.cardTypeIndex]}`);
          this.scrollT('cardImg1')
          return 
        }
        if(iform.cardImg2=== ''){
          vant.Toast(`请上传${this.cardTypeShowText2[form.cardTypeIndex]}`);
          this.scrollT('cardImg2')
          return 
        }
        // 如果选择的是继承人
        if(iform.inherit === '继承人') {
          if(iform.isRprove && iform.rproveImg === ''){
            vant.Toast(`请上传亲属关系证明`);
            this.scrollT('proveImg1')
            card = true
            return 
          }
          if(iform.isDeathprove && iform.deathproveImg === ''){
            vant.Toast(`请上传被继承人死亡证明`);
            this.scrollT('proveImg2')
            card = true
            return 
          }
          if(iform.isJprove && iform.jproveImg === ''){
            vant.Toast(`请上传证实继承权利的公证文书或法院判决`);
            this.scrollT('proveImg3')
            card = true
            return 
          }
        }
        if(form.currentAddr.trim() ==='') {
          vant.Toast('请选择现居地址省市')
          this.scrollT('currentAddr')
          return
        }
        if(form.currentAddrDe.trim() ==='') {
          vant.Toast('请填写详细的现居地址')
          this.scrollT('currentAddrDe')
          return
        }
        if(form.tel.trim() ==='' || (!formatTel.test(form.tel))) {
          vant.Toast('请填写正确11位手机号码')
          this.scrollT('tel')
          return
        }
        if(form.otherTel) {
          if(!formatTel.test(form.otherTel)) {
            vant.Toast('请填写正确11位电话号码')
            this.scrollT('otherTel')
            return
          }
        }
        // 继承人和本人的身份证不能相同
        if(iform.inherit === '继承人') {
          if(iform.sinheritNum === form.idcard) {
            vant.Toast('继承人和本人的身份证不能相同')
            this.scrollT('idcard')
            return
          }
        }
        return new Promise((resolve)=>{
          console.log('校验成功')
          resolve()
        },(reject)=>{
          console.log('失败')
          reject()
        })
      }
    }
  }
})