let vm =new Vue({
  el:'#app',
  mixins: [mixin],
  data:{ 
    isRapeat:true,
    showRecriptForm:false,  //是否显示收据表单
    showStoreAddrPicker:false, //是否显示户籍地址选择器
    personData:'',//前端缓存的个人信息
    dataPerson: '', //数据库缓存的个人信息
    personId:'', //请求这个案件的Id
    payEvidences:['银行付款凭证','POS机刷卡凭证','支付宝付款凭证','微信付款凭证','微信支付','现金汇款凭证','无'], //凭证
    caseTimer: null, //实时保存
    imgs:[{url:'../images/index_noData.png'}],
    inherit:'',//继承人身份
    form:{
      storeAddr:'',//门店所在省市
      name:'',//店长名字
      totalMoney: 0, //总投入金额
      cashMoney: '',//返利金额
      bankCards:['',''],//接受返利的银行卡号
      lossMoney:'',//损失金额
      bankAccount:'',//本人银行账户
      whatBank:'',// XX银行
      bankBranch:'',//银行支行
      bankCardImg1:[],//银行卡正面
      bankCardImg2:[],//银行卡反面
      remark:'',//备注
      hasWriteReceiptCount:0, //已经填写成功的收据数量
    },
      receiptsIndex: '',//收据下标
      receipts:[{
        Id:0, //默认为0 0 添加收据
        isubmit:false, //是否点击提交
        investMoney:'',//投入金额
        time:'', //投入时间
        isreceipt:1,//是否有收据
        receiptImgs:[],//收据图片
        receiptNum:'',//收据号
        payWayTexts:['','','','','','',''],//付款方式
        payWayindexs:[0,0,0,0,0,0,0],//付款下标 0:未选中 1:选中
        sideBankCount:'',//对方收款账号
        showEvidenceUp:true,//是否显示上传凭证
        evidenceTexts:[],//选中的凭证
        evidenceIndexs:[0,0,0,0,0,0],//凭证下标 0:未选中 1:选中
        evidenceImgs:[],//凭证照片
      },{
        Id:0, //默认为0 0 添加收据
        isubmit:false, //是否点击提交
        investMoney:'',//投入金额
        time:'', //投入时间
        isreceipt:1,//是否有收据
        receiptImgs:[],//收据图片
        receiptNum:'',//收据号
        payWayTexts:['','','','','','',''],//付款方式
        payWayindexs:[0,0,0,0,0,0,0],//付款下标 0:未选中 1:选中
        sideBankCount:'',//对方收款账号
        showEvidenceUp:true,//是否显示上传凭证
        evidenceTexts:[],//选中的凭证
        evidenceIndexs:[0,0,0,0,0,0],//凭证下标 0:未选中 1:选中
        evidenceImgs:[],//凭证照片
      }],//数据数据
    payWays:['银行转账','POS机','现金汇款（ATM存款、柜台存款等）','支付宝支付','微信支付','现金交给店长代为支付','其他方式'],//付款方式
    payEvidences:['银行付款凭证','POS机刷卡凭证','支付宝付款凭证','微信付款凭证','现金汇款（ATM存款、柜台存款等）凭证','无'], //凭证
  },
  created(){
  },
  mounted() {
    let _that = this
    //如果状态是true，则是从个人中心进入 status true
    if(_that.status) {
      _that.getData(_that.dataIndex) //从数据库获取信息
    } else {
      this.getCashData()
      // // 如果状态是false，则是从添加按钮进入 status false
      // _that.personData =  JSON.parse(_that.getCookie('personForm')) //拿到个人信息的缓存
      // if(!_that.getCookie('caseId') || _that.getCookie('caseId') == 0) {
      //   _that.saveData2(1,OpenId)       
      // }else{
      //   let caseIdNum = parseInt(_that.getCookie('caseId'))
      //   _that.getData(caseIdNum)
      //   _that.caseTimer=setInterval(() =>{
      //     _that.caseId =caseIdNum
      //     // console.log(this.receipts)
      //     this.saveData(1,OpenId)
      //   },1000*dataSaveTime)
      // }
    }
  },
  methods:{
    // getData
    getData(id) {
      let _that=this
      let p = this.form
      axios({
        method:'post',
        url:'/WebApi/GetInformationBycid',
        data:Qs.stringify({
          cid:id,
        })
      }).then((res) =>{
        let d = res.data.Data
        _that.inherit = d.Sftype
      }).then((res) =>{
        _that.$axios({
          method:'post',
          url:'/WebApi/GetCaserosterandSjreceiptById',
          data:{
            cid:id
          }
        }).then((res) =>{
          let d = res.data.Data.CaserosterList //案件信息
          let r = res.data.Data.SjreceiptList //收据数据
          let c = _that.form //我的默认信息
          let totalMoney = 0 //总投入金额
          // c.receipts.length = r.length
          let re=[]
          r.forEach((item,index) =>{
            let tem = _that.receiptData(item) //将收据进行处理
            if(tem.investMoney) {
              c.hasWriteReceiptCount +=1
              console.log(parseInt(tem.investMoney))
              totalMoney += parseInt(tem.investMoney)
            }
            re.push(tem)
          })
          _that.receipts=re
          if(d.UpdateTime) {
            this.oldDay = this.oldTime(d.UpdateTime)
          }
          c.storeAddr=d.Gsaddress?d.Gsaddress:''
          c.name=d.Gsdtaddress?d.Gsdtaddress:''
          c.totalMoney=totalMoney?totalMoney.toFixed(2):0.00
          if(c.cashMoney === 0) {
            c.cashMoney = 0
          } else {
            c.cashMoney= d.Getmoney ? parseInt(d.Getmoney).toFixed(2):''
          }
          c.bankCards=d.Bcard?d.Bcard.split(','):['','']
          c.bankAccount=d.Uscard?d.Uscard:''
          c.whatBank=d.Openbank?d.Openbank:''
          c.bankBranch=d.Openbchird?d.Openbchird:''
          c.bankCardImg1=[]
          if(d.Bankzimg) {
            c.bankCardImg1.push({
              url:d.Bankzimg
            })
          } 
          c.bankCardImg2=[]
          if(d.Bankzimg) {
            c.bankCardImg2.push({
              url:d.Bankfimg
            })
          } 
          c.remark=d.Intro?d.Intro:''
          _that.subId=d.Id
          c.Id = d.Id
          _that.form = c  
          console.log(_that.form,102)
        })
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
          _that.dataPerson = data
          _that.inherit = data.Sftype?data.Sftype:'本人' //继承人身份
          _that.caseId = data.CaserosterId
          _that.setCookie('caseId',data.CaserosterId,5) //将案件Id 进行缓存
          // 如果数据库已经有缓存，则每隔十秒进行数据库保存
          let caseIdNum = parseInt(_that.caseId)
          _that.getData(caseIdNum)
          // 数据库有缓存将本地个人信息置为0
          setCookie('personForm',0,365)
           // 数据库有缓存将本地新增个人信息置为0
          setCookie('inheritForm',0,365)
          _that.caseTimer=setInterval(() =>{
            _that.caseId =caseIdNum
            this.saveData(1,OpenId)
          },1000*dataSaveTime)
        } else {
          //  如果案件ID存在则删除
          if(_that.getCookie('caseId')) {
            _that.delCookie('caseId')   
          }
          //拿到前端个人信息的缓存
          _that.personData =  JSON.parse(_that.getCookie('personForm'))
          let inheritForm =  JSON.parse(_that.getCookie('inheritForm'))
          _that.personData.inherit = inheritForm.inherit
          _that.personData.sinheritName = inheritForm.sinheritName
          _that.personData.sinheritNum = inheritForm.sinheritNum
          _that.personData.cardImg1 = inheritForm.cardImg1
          _that.personData.cardImg2 = inheritForm.cardImg2 
          _that.personData.isRprove = inheritForm.isRprove
          _that.personData.isDeathprove = inheritForm.isDeathprove
          _that.personData.isJprove = inheritForm.isJprove
          _that.personData.rproveImg = inheritForm.rproveImg
          _that.personData.deathproveImg = inheritForm.deathproveImg
          _that.personData.jproveImg = inheritForm.jproveImg
          _that.inherit = _that.personData.inherit ? _that.personData.inherit:'本人' //继承人身份
          _that.caseId = 0
          _that.saveData2(1,OpenId)
        }
      })
    },
    // 例图预览
    imagePreview(src) {
      vant.ImagePreview([
        src
      ]);
    },
    // 监听金额输入
    inputFun(name){
      this.form[name] = this.clearNoNum(this.form[name])
    },
    // 确认选择门店省市
    onStoreAddrfirm(value) {
      this.showStoreAddrPicker = false;
      if(value[0].name === value[1].name) {
        this.form.storeAddr=value[0].name
        return
      }
      this.form.storeAddr=value[0].name+value[1].name
    },
    // 添加收据
    addReceiptClick(){
    let _that = this
    _that.caseId = _that.dataIndex ? _that.dataIndex : parseInt(_that.getCookie('caseId'))
      let c = {
        Id:0, //添加按钮
        isubmit:false, //是否点击提交
        investMoney:'',//投入金额
        time:'', //投入时间
        isreceipt:1,//是否有收据
        receiptNum:'',//收据号
        receiptImgs:[],//收据图片
        payWayTexts:['','','','','','',''],//付款方式
        payWayindexs:[0,0,0,0,0,0,0],//付款下标 0:未选中 1:选中
        sideBankCount:'',//对方收款账号
        showEvidenceUp:true,//是否显示上传凭证
        evidenceTexts:[],//选中的凭证
        evidenceIndexs:[0,0,0,0,0,0],//凭证下标 0:未选中 1:选中
        evidenceImgs:[],//凭证照片
      }
      let tem ={}
        tem.Id= c.Id,
        tem.CaserosterId = _that.caseId,
        tem.Status = 1 //正式提交数据，修改
        tem.Inmoney=c.investMoney
        tem.Intime=c.time
        let url = ''
        tem.SjNo= ''
        if(c.receiptImgs.length!==0){
          url=c.receiptImgs[0].url
          tem.SjNo=c.receiptNum
        }
        tem.Sjimg=url
        tem.Paybank=c.payWayindexs[0]
        tem.Paybankcard=c.payWayTexts[0]
        tem.Paypos=c.payWayindexs[1]
        tem.Payposcard=c.payWayTexts[1]
        tem.Payatm=c.payWayindexs[2]
        tem.Payatmcard=c.payWayTexts[2]
        tem.Payzfb=c.payWayindexs[3]
        tem.Payzfbcard=c.payWayTexts[3]
        tem.Paywx=c.payWayindexs[4]
        tem.Paywxcard=c.payWayTexts[4]
        tem.Paymoney=c.payWayindexs[5]
        tem.Paymoneycard=c.payWayTexts[5]
        tem.Payother=c.payWayindexs[6]
        tem.Payothercard=c.payWayTexts[6]
        tem.Receivecard=c.sideBankCount
        tem.Pztype=c.evidenceTexts
        let imgs = []
      if(c.evidenceImgs.length !== 0) {
        c.evidenceImgs.forEach((item)=>{
          imgs.push(item.url)
        })
        imgs=imgs.join(',')
      }
        tem.Pzimg=imgs
        // 如果是添加收据
          _that.$axios({
            method:'post',
            url:'/WebApi/AddSjreceipt',
            data:tem
          }).then((res) =>{
            if(res.data.ResultCode == 1000) {
              c.Id = res.data.SjId
              this.$set(_that.receipts,_that.receipts.length,c) //更新数据后
            }
          })
    },
    // 删除收据
    delReceipt(index) {
      let _that = this
      let receipts = this.receipts
      let c =  receipts[index]
        vant.Dialog.confirm({
          message: '是否删除第' + (index+1) + '张收据？'
        }).then(() => {
          vant.Toast.loading({
            message: '正在删除...',
            loadingType: 'spinner',
            duration:0
          });
          // 确认删除
          _that.$axios({
            method:'post',
            url:'/WebApi/DeleteSjreceipt',
            data:{ Id:c.Id}
          }).then((res) =>{
            if(res.data.ResultCode == 1000) {
              vant.Toast('删除成功')
              _that.$delete(receipts,index)
              let totalMoney = 0 //更新总投入金额
              let hasWriteReceiptCount = 0 //更新已填写收据数量
              _that.receipts.forEach((item) =>{
                if(item.investMoney) {
                  hasWriteReceiptCount +=1 
                  totalMoney += parseInt(item.investMoney)
                }
              })
              _that.form.totalMoney = totalMoney ?totalMoney.toFixed(2):0.00
              _that.form.hasWriteReceiptCount = hasWriteReceiptCount ? hasWriteReceiptCount : 0
            } else {
              vant.Toast('删除失败')
            }
          })
        }).catch(() => {
          // on cancel
        });
        
      
    },
    // 跳转收据页面
    receiptItemClick(index){
      //显示收据表单页
      this.showRecriptForm = !this.showRecriptForm
      // 此时数据表单页的下标
      this.receiptsIndex = index
    },
    // 添加银行卡
    addBankCard() {
      let bankCards = this.form.bankCards
      this.$set(bankCards,bankCards.length,'')
    },
    //图片上传
    afterRead1(file) {
      let _that=this
      let inputDOM = this.$refs.inputer1;
      // let formData = dataURLtoBlod(file.content)
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.form.bankCardImg1=[]
        _that.form.bankCardImg1.push({
          url:res
        })
      })
    },
    afterRead2(file) {
      let _that=this
      let inputDOM = this.$refs.inputer2;
      // let formData = dataURLtoBlod(file.content)
      this.upImg(inputDOM.files[0]).then((res)=>{
        _that.form.bankCardImg2=[]
        _that.form.bankCardImg2.push({
          url:res
        })
      })
    },
    // 删除银行卡
    delBankCard(index) {
      let bankCards = this.form.bankCards
      let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
      window.scrollTo(0, Math.max(scrollHeight - 1, 0))
      this.$delete(bankCards,index)
    },
    // 过滤银行卡特殊字符
    inputFunBank(index) {
      this.form.bankCards[index] = this.clearNoNum(this.form.bankCards[index])
    },
    // 银行卡失去焦点
    inputBlurBank(e) {
      let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0
      window.scrollTo(0, Math.max(scrollHeight - 1, 0))
    },
    // 监听收据页面的关闭按钮
    receiptclose(e) {
      if(e.showReceipt) {
        this.$refs.top.scrollTop=0
        this.showRecriptForm=!this.showRecriptForm
      }
    },
    // 监听数据页面
    receiptsub(e) {
      if(e.showReceipt) {
        this.showRecriptForm=!this.showRecriptForm
        document.getElementById('storeAddr').scrollIntoView({block: "center",behavior:"smooth"})
        // this.form.receipts[this.receiptsIndex] = e.investMoney
      }
      this.$set(this.receipts, this.receiptsIndex,e.receipt)
      // 统计填写的收据数量
      let counts = []
      let totalMoney = 0
      this.receipts.map((item) =>{
        if(item.investMoney) {
          counts.push(item.investMoney)
          totalMoney += parseInt(item.investMoney)
        }
      })
      this.form.totalMoney = parseInt(totalMoney).toFixed(2) //总投入金额
      this.form.hasWriteReceiptCount= counts.length
    },
    // 点击确认提交
    submit(){
      let _that = this
      // 如果是只读状态则为不可修改状态，点修改变成可修改状态
      if(this.readonly){
        document.getElementById('storeAddr').scrollIntoView({block: "center",behavior:"smooth"})
        vant.Toast('请修改后进行保存~');
        this.readonly=!this.readonly
        this.isEdit = !this.isEdit //点击修改状态后
        return
      }
      // 校验成功之后
      let check = this.check()
      if(check) {
        check.then((res)=>{
          // sessionStorage.setItem('caseForm','') //清空缓存
           // 如果是点击修改后提交
          if(this.isEdit) {
            console.log('你修改了个人信息')
            this.edit()
            return
          } 
          // 报案最终请求
          this.saveData(0,OpenId)
        })
      }
    },
    // 将个人信息本地数据转换成后台格式
    data_person(openId){
      let _that = this
      let p = _that.personData
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
      return  {
        OpenId:openId,
        Id:0,
        Sftype:p.inherit,
        BjName:p.sinheritName,
        BjIdcard:p.sinheritNum,
        Idimg1: p.cardImg1?p.cardImg1:'',
        Idimg2: p.cardImg2?p.cardImg2:'', 
        Shipor:p.isRprove?'有':'无',
        Dieor:p.isDeathprove?'有':'无',
        Zsor:p.isJprove?'有':'无',
        Shipimg:p.rproveImg?p.rproveImg:'',
        Dieimg:p.deathproveImg?p.deathproveImg:'',
        Zsimg:p.jproveImg?p.jproveImg:'',
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
      }
    },
    // 将收据信息本地数据转换成后台格式
    data_receipt(openId){
      let _that = this
      let r = _that.receipts
      let receipts=[]
      // receipts.length = r.length
      for(let i=0;i<r.length;i++) {
        let tem ={}
        tem.Id=r[i].Id || 0
        tem.Status = r[i].isubmit ? 0 : 1
        tem.OpenId=openId
        tem.Inmoney=r[i].investMoney? parseInt(r[i].investMoney).toFixed(2):''
        tem.Intime=r[i].time
        let url = ''
        tem.SjNo =r[i].receiptNum//收据号
        if(r[i].receiptImgs.length!==0){
          url=r[i].receiptImgs[0].url
        }
        tem.Sjimg=url
        tem.Paybank=r[i].payWayindexs[0] || null
        tem.Paybankcard=r[i].payWayTexts[0] || null
        tem.Paypos=r[i].payWayindexs[1] || null
        tem.Payposcard=r[i].payWayTexts[1] || null
        tem.Payatm=r[i].payWayindexs[2] || null
        tem.Payatmcard=r[i].payWayTexts[2] || null
        tem.Payzfb=r[i].payWayindexs[3] || null
        tem.Payzfbcard=r[i].payWayTexts[3] || null
        tem.Paywx=r[i].payWayindexs[4] || null
        tem.Paywxcard=r[i].payWayTexts[4] || null
        tem.Paymoney=r[i].payWayindexs[5] || null
        tem.Paymoneycard=r[i].payWayTexts[5] || null
        tem.Payother=r[i].payWayindexs[6] || null
        tem.Payothercard=r[i].payWayTexts[6] || null
        tem.Receivecard=r[i].sideBankCount
        // 如果只选择现金交给店长代为支付 则对方收款账号为空
        if(r[i].payWayindexs[5] && !r[i].payWayindexs[0] && !r[i].payWayindexs[1] && !r[i].payWayindexs[2] && !r[i].payWayindexs[3] && !r[i].payWayindexs[4] || !r[i].payWayindexs[6]) {
          tem.Receivecard = ''
        }
        //凭证方式
      let evidenceTexts = []
      for(let k= 0;k<r[i].evidenceIndexs.length;k++) {
        // 如果选中付款方式
        if(r[i].evidenceIndexs[k]) {
          evidenceTexts.push(this.payEvidences[k])
        }
      }
      r[i].evidenceTexts = evidenceTexts.length !== 0 ? evidenceTexts.join(',') : ''
      tem.Pztype=r[i].evidenceTexts
        let imgs = []
        if(r[i].evidenceImgs == null || r[i].evidenceImgs === '') {
          imgs=''
        } else {
          r[i].evidenceImgs.forEach((item)=>{
            imgs.push(item.url)
          })
        imgs=imgs.join(',')
        tem.Pzimg=imgs
      }
      receipts.push(tem)
      }
      return receipts
    },
    // 将案件信息本地数据转换成后台格式
    data_case(openId) {
      let _that =this
      let c = _that.form
      let cashMoney = ''
      if(c.cashMoney === 0) {
        cashMoney = 0
      } else {
        cashMoney = c.cashMoney ? parseInt(c.cashMoney).toFixed(2):''
      }
      return {
        OpenId:openId,
        Id:_that.caseId,
        Gsaddress: c.storeAddr,
        Gsdtaddress: c.name,
        Allmoney:c.totalMoney,
        Getmoney:cashMoney,
        Bcard:c.bankCards ? c.bankCards.join(',') : c.bankCards,
        Uscard:c.bankAccount,
        Openbank:c.whatBank,
        Openbchird:c.bankBranch,
        Bankzimg:c.bankCardImg1.length === 0 ? '' : c.bankCardImg1[0].url,
        Bankfimg:c.bankCardImg2.length === 0 ? '' : c.bankCardImg2[0].url,
        Intro:c.remark,
      }
    },
    // 从后台获取个人信息E
    getDataPerson(openId) {
      let _that=this
      axios({
        method:'post',
        url:'/WebApi/GetInformationBycid',
        data:Qs.stringify({
          cid:_that.caseId,
        })
      }).then((res) =>{
        let d = res.data.Data
        d.OpenId=openId
        d.CaserosterId = _that.caseId
        return d
          // p .OpenId=openId,
          // p.name=d.InName?d.InName:''
          // p.sex=d.Sex ? d.Sex: ''
          // p.cardTypeText=d.Idtype ?d.Idtype :''
          // if(d.Idtype  === '其他证件') {
          //   p.othercardName=d.Idcard?d.Idcard:''
          // } else {
          //   p.idcard=d.Idcard?d.Idcard:''
          // }
          // p.birthday=d.Idyear?d.Idyear:''
          // p.cardImg1.push(
          //   {
          //     url:d.Idimg1
          //   }
          // )
          // p.cardImg2.push(
          //   {
          //     url:d.Idimg2
          //   }
          // )
          // p.cardImg1[0].url=d.Idimg1
          // p.cardImg2[0].url=d.Idimg2
          // p.houseAddr=d.Idaddress ? d.Idaddress:''
          // p.houseAddrDe=d.Dtaddress1 ? d.Dtaddress1:''
          // p.currentAddr=d.Nowaddress ? d.Nowaddress:''
          // p.currentAddrDe=d.Dtaddress2 ? d.Dtaddress2:''
          // p.tel= d.Phone ? d.Phone:''
          // p.otherTel=d.Tel ? d.Tel:''
          // document.title=d.InName
          // this.subId=d.Id
          // this.personData=p
      })
    },
    // 有缓存的情况下
    saveData(status,openId){
      let _that =this
      // 个人信息
      // let p_json = _that.data_person(openId) 
      let p_json = _that.dataPerson ? _that.dataPerson : _that.data_person(openId)
      // 收据信息
      let receipts = _that.data_receipt(openId)
      // 案件信息
      let caseData = _that.data_case(openId)
      if(status === 0) {
        vant.Toast.loading({
        message: '加载中...',
        loadingType: 'spinner',
        duration:0
      });
        axios({
          method:'post',
          url:'/WebApi/GetInformationBycid',
          data:Qs.stringify({
            cid:_that.caseId,
          })
        }).then((res) =>{
          let d = res.data.Data
          d.Status=0
          p_json = d
          // p_json.Id = d.Id
          // p_json.CaserosterId = _that.caseId //将个信息的案件Id加上
          return p_json
        }).then((res) =>{
          if(_that.checkPerson(res)) {
            _that.checkPerson(res).then((res) =>{
              axios({
                method:'post',
                url:'/WebApi/Infosubmit',
                data:Qs.stringify({
                  Status: parseInt(status),// 0正式提交  1保存
                  // 个人信息
                  info:res,
                  ca: caseData,
                  // 案件信息
                  sj:receipts
                })
              }).then((res) =>{
                vant.Toast.clear()
                if(status === 0) {
                  if(res.data.ResultCode == 1000) {
                    // 清空caseId 案件Id
                    _that.delCookie('caseId')
                    // 清空个人信息 personForm
                    setCookie('personForm',0,365)
                    // 清空计时器
                    clearInterval(_that.caseTimer)
                    vant.Dialog.alert({
                      message: '添加成功'
                    }).then(() => {
                      console.log(_that.caseTimer)
                      // 返回首页
                      location.href="./index.html"
                    });
                  } else {
                    vant.Dialog.alert({
                      message: '添加失败，请重试'
                    }).then(() => {
                      // on close
                    });
                  }
                  return
                }
              })
            })
          }
        })
      }else {
        p_json= null
        axios({
          method:'post',
          url:'/WebApi/Infosubmit',
          data:Qs.stringify({
            Status: parseInt(status),// 0正式提交  1保存
            // 个人信息
            info: p_json,
            ca: caseData,
            // 案件信息
            sj:receipts
          })
        }).then((res) =>{
          console.log('缓存成功')
        })
      }
    },
    // 无缓存
    saveData2(status,openId){
      let _that =this
      // 个人信息
      let p_json = _that.data_person(openId)
      if(_that.caseId > 0) {
        p_json= null
      }
      // 案件信息
      let caseData = _that.data_case(openId)
      // 收据信息
      let receipts =_that.data_receipt(openId)
        _that.isRapeat=false
        axios({
          method:'post',
          url:'/WebApi/Infosubmit',
          data:Qs.stringify({
            Status: parseInt(status),// 0正式提交  1保存
            // 个人信息
            info: p_json,
            ca:caseData,
            // 案件信息
            sj:receipts
          })
        }).then((res) =>{
          if(status === 0) {
            if(res.data.ResultCode == 1000) {
              // 清空caseId 案件Id
              _that.delCookie('caseId')
                // 清空个人信息 personForm
              setCookie('personForm',0,365)
              // _that.delCookie('personForm')
                // 清空计时器
                clearInterval(_that.caseTimer)
              vant.Dialog.alert({
                message: '添加成功'
              }).then(() => {
                // 返回首页
                location.href="./index.html"
              });
            } else {
              vant.Dialog.alert({
                message: '添加失败，请重试'
              }).then(() => {
                // on close
              });
            }
            return
          }
          if(res.data.CaserosterId >0){
            _that.caseId = parseInt(res.data.CaserosterId)
            _that.setCookie('caseId',_that.caseId,5) //存入案件Id
            _that.getData(_that.caseId)
            _that.caseTimer=setInterval(() =>{
              _that.saveData(1,OpenId)   
            },1000*dataSaveTime)
          }
        })
    },
    // 修改
    edit(){
      let _that=this
      let c = this.form
      let caseData = _that.data_case(OpenId)
      caseData.Id = _that.dataIndex ? _that.dataIndex : _that.caseId //修改
      _that.$axios({
        method:'post',
        url:'/WebApi/UpdateCaseroster',
        data:caseData}).then((res) =>{
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
            message: '提交失败，请重试'
          }).then(() => {
            // on close
          });
        }
      })
    },
    // 校验
    check() {
      let form = this.form
      if(form.storeAddr.trim()==='' || !form.storeAddr) {
        vant.Toast('请选择门店所在省市');
        this.scrollT('storeAddr')
        return
      }
      // 判断收据页面是否保存
      for(let i = 0;i<this.receipts.length;i++) {
        let receiptItem = this.$refs.receiptItem
        if(!this.receipts[0].investMoney || !this.receipts[0].time || !this.receipts[0].isubmit) {
          vant.Toast('投入情况未填写完整，请填写第1张收据并提交1');
          this.scrollT(receiptItem[0],true)
          return
        }
        // 如果已经点击过提交，又返回去修改
        if(this.receipts[i].isubmit){
          // 如果选择有收据
          if(this.receipts[i].isreceipt === 1) {
            if(!this.receipts[i].receiptNum) {
              vant.Toast('投入情况未填写完整，请填写第'+(i+1)+'张收据并提交');
              this.scrollT(receiptItem[i],true)
              return
            }
            if(this.receipts[i].receiptImgs.length ===0) {i
              vant.Toast('投入情况未填写完整，请填写第'+(i+1)+'张收据并提交');
              this.scrollT(receiptItem[i],true)
              return
            }
          }
        }
        // 如果填了金额，却没点提交
        if(this.receipts[i].investMoney && !this.receipts[i].isubmit) {
          vant.Toast('投入情况未填写完整，请填写第'+(i+1)+'张收据并提交');
          this.scrollT(receiptItem[i],true)
          return
        }
      }
      //返利金额
      if(form.cashMoney==='' || form.cashMoney==null) {
        vant.Toast('请填写投入至今的返利总金额');
        this.scrollT('cashMoney')
        return
      }
      // 返利银行卡号
      if(form.bankCards.join('').trim()==='') {
        vant.Toast('请填写银行卡号');
        this.scrollT('bankCards')
        return
      }
      // 本人银行账户
      if(form.bankAccount==='' || form.bankAccount== null || form.bankAccount.trim()==='') {
        vant.Toast('请填写' +this.inherit + '有效银行账号');
        this.scrollT('bankAccount')
        return
      }
      // 开户行
      if(form.whatBank.trim()==='') {
        vant.Toast('请填写具体开户网点');
        this.scrollT('whatBank')
        return
      }
      if(form.bankBranch.trim()==='') {
        vant.Toast('请填写具体开户网点');
        this.scrollT('whatBank')
        return
      }
      // 银行卡正反面
      if(form.bankCardImg1.length===0 || !form.bankCardImg1[0].url ) {
        vant.Toast('请上传银行卡正面');
        this.scrollT('bankCardImg1')
        return
      }
      if(form.bankCardImg2.length===0 || !form.bankCardImg2[0].url ) {
        vant.Toast('请上传银行卡反面');
        this.scrollT('bankCardImg2')
        return
      }
      // 备注
      // if(form.remark.trim() === '') {
      //   vant.Toast('请填写备注');
      //   this.scrollT('remark')
      //   return
      // }
      // 全部校验正确之后提交
      return new Promise((resolve)=>{
        console.log('校验成功')
        resolve()
      },(reject)=>{
        console.log('失败')
        reject()
      })
    },
    // 校验个人信息是否填完
    checkPerson(data) {
      let form = data
      let card = false
      let personHref = './form_personal.html?id=0'
      let caseHref = './form_case.html?id=0'
      let href = caseHref
      if(form.Sftype === '继承人') {
        if(!form.BjName) {
          vant.Toast('被继承人姓名未填写，请返回个人页面进行填写');
          return
        }
        if(!form.BjIdcard || (!formatIdcard.test(form.BjIdcard))) {
          vant.Toast('被继承人证件号码未填写正确，请返回个人页面进行填写');
          return
        }
      }
      if(!form.InName) {
        vant.Toast('个人信息姓名未填写，请返回个人页面进行填写');
        return
      }
      //如果选择的证件是身份证，校验身份证判断户籍地址和详细地址
      if(form.Idtype === '中华人民共和国居民身份证') {
        if(!form.Idcard || (!formatIdcard.test(form.Idcard))) {
          vant.Toast('个人信息证件号码不正确，请返回个人页面进行填写');
          return
        } 
        if(!form.Idimg1){
          vant.Toast('个人信息'+form.Idtype +'正面未上传，请返回个人页面进行上传');
          return 
        }
        if(!form.Idimg2){
          vant.Toast('个人信息'+form.Idtype +'反面未上传，请返回个人页面进行上传');
          return 
        }
        if(form.Sftype === '继承人') {
          if(form.Shipor === '有' && !form.Shipimg){
            vant.Toast('个人信息亲属关系证明未上传，请返回个人页面进行上传');
            return 
          }
          if(form.Dieor === '有' && !form.Dieimg){
            vant.Toast('个人信息继承人死亡证明未上传，请返回个人页面进行上传');
            return 
          }
          if(form.Zsor === '有' && !form.Zsimg){
            vant.Toast('个人信息证实继承权利的公证文书未上传，请返回个人页面进行上传');
            return 
          }
        }
        if(!form.Idaddress) {
          vant.Toast('个人信息户籍地未填写，请返回个人页面进行填写');
          return
        }
        if(!form.Dtaddress1) {
          vant.Toast('个人信息户籍地详细地未填写，请返回个人页面进行填写');
          return
        }
        // 不分证件都要填写
        if(!form.Nowaddress) {
          vant.Toast('个人信息现居地未填写，请返回个人页面进行填写');
          return
        }
        if(!form.Dtaddress2) {
          vant.Toast('个人信息现居详细地未填写，请返回个人页面进行填写');
          return
        }
        if(!form.Phone || (!formatTel.test(form.Phone))) {
          vant.Toast('个人信息本人手机号未填写正确，请返回个人页面进行填写');
          return
        }
        if(form.Tel) {
          if(!formatTel.test(form.Tel)) {
            vant.Toast('个人信息其他手机号未填写正确，请返回个人页面进行填写');
            return
          }
        }
        return new Promise((resolve)=>{
          console.log('校验个人信息成功')
          resolve(true)
        },(reject)=>{
          console.log('校验个人信息')
          reject()
        })
      } else {
        if(!form.Idyear) {
          vant.Toast('个人信息'+form.Idtype +'出生年月未填写正确，请返回个人页面进行填写');
          return 
        }
        // 其他证件
        if(form.Idtype === '其他证件') {
          if(!form.Idcard) {
            vant.Toast('个人信息'+form.Idtype +'名称未填写，请返回个人页面进行填写');
            return 
          }
        } else {
          if(!form.Idcard) {
            vant.Toast('个人信息'+form.Idtype +'号码未填写正确，请返回个人页面进行填写');
            return
          }
        }
        // 不分证件都要填写
        if(!form.Idimg1){
          vant.Toast('个人信息'+form.Idtype +'正面未上传，请返回个人页面进行上传');
          return 
        }
        if(!form.Idimg2){
          vant.Toast('个人信息'+form.Idtype +'反面未上传，请返回个人页面进行上传'); 
          return
        }
        if(form.Sftype === '继承人') {
          if(form.Shipor === '有' && !form.Shipimg){
            vant.Toast('个人信息亲属关系证明未上传，请返回个人页面进行上传');
            return 
          }
          if(form.Dieor === '有' && !form.Dieimg){
            vant.Toast('个人信息继承人死亡证明未上传，请返回个人页面进行上传');
            return 
          }
          if(form.Zsor === '有' && !form.Zsimg){
            vant.Toast('个人信息证实继承权利的公证文书未上传，请返回个人页面进行上传');
            return 
          }
        }
        if(!form.Nowaddress) {
          vant.Toast('个人信息现居地未填写，请返回个人页面进行填写');
          return
        }
        if(!form.Dtaddress2) {
          vant.Toast('个人信息现居详细地未填写，请返回个人页面进行填写');
          return
        }
        if(!form.Phone || (!formatTel.test(form.Phone))) {
          vant.Toast('个人信息本人手机未填写，请返回个人页面进行填写');
          return
        }
        if(form.Tel) {
          if(!formatTel.test(form.Tel)) {
            vant.Toast('个人信息其他手机未填写正确，请返回个人页面进行填写');
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
      }
    },
    // 将后台的收据数据替换成自己的数据
    receiptData(tem) {
      let _that =this
      let c = {
        Id:0, //默认为0 0 添加收据
        isubmit:false, //是否点击提交
        investMoney:'',//投入金额
        time:'', //投入时间
        isreceipt:1,//是否有收据
        receiptImgs:[],//收据图片
        receiptNum:'',//收据号
        payWayTexts:['','','','','','','','',''],//付款方式
        payWayindexs:[0,0,0,0,0,0,0],//付款下标 0:未选中 1:选中
        sideBankCount:'',//对方收款账号
        showEvidenceUp:true,//是否显示上传凭证
        evidenceTexts:[],//选中的凭证
        evidenceIndexs:[0,0,0,0,0,0],//凭证下标 0:未选中 1:选中
        evidenceImgs:[],//凭证照片
      }
      _that.caseId = _that.dataIndex ? _that.dataIndex : _that.getCookie('caseId')
        c.investMoney = tem.Inmoney?parseInt(tem.Inmoney).toFixed(2):''
        c.Id =tem.Id
        c.isubmit = tem.Status === 1 ? false : true
        c.time= tem.Intime?tem.Intime:''
        c.receiptNum = tem.SjNo?tem.SjNo:''
        if(tem.Sjimg) {
          c.receiptImgs.push({
            url:tem.Sjimg
          })
          c.isreceipt = 1
        } else {
          c.receiptImgs=[]
          c.isreceipt = 2
        }
        
        // 银行转账下标
        if(tem.Paybank== 'False' || parseInt(tem.Paybank) == 0 || tem.Paybank== null) {
          c.payWayindexs[0]= 0
        } else {
          c.payWayindexs[0]= 1
        }
        // 银行转账账号
        if(tem.Paybankcard=== null) {
          c.payWayTexts[0]=''
        } else {
          c.payWayTexts[0]=tem.Paybankcard
        }
        // pos机下标
        if(tem.Paypos== 'False' || parseInt(tem.Paypos) == 0 || tem.Paypos== null) {
          c.payWayindexs[1]= 0
        } else {
          c.payWayindexs[1]= 1
        }
        // pos机账号
        if(tem.Payposcard=== null) {
          c.payWayTexts[1]=''
        } else {
          c.payWayTexts[1]=tem.Payposcard
        }
        // atm机下标
        if(tem.Payatm== 'False' || parseInt(tem.Payatm) == 0 || tem.Payatm== null) {
          c.payWayindexs[2]= 0
        } else {
          c.payWayindexs[2]= 1
        }
        // atm机账号
        if(tem.Payatmcard=== null) {
          c.payWayTexts[2]=''
        } else {
          c.payWayTexts[2]=tem.Payatmcard
        }
        // 支付宝下标
        if(tem.Payzfb== 'False' || parseInt(tem.Payzfb) == 0 || tem.Payzfb== null) {
          c.payWayindexs[3]= 0
        } else {
          c.payWayindexs[3]= 1
        }
        // 支付宝账号
        if(tem.Payzfbcard=== null) {
          c.payWayTexts[3]=''
        } else {
          c.payWayTexts[3]=tem.Payzfbcard
        }
        // 微信下标
        if(tem.Paywx== 'False' || parseInt(tem.Paywx) == 0 || tem.Paywx== null) {
          c.payWayindexs[4]= 0
        } else {
          c.payWayindexs[4]= 1
        }
        // 微信账号
        if(tem.Paywxcard=== null) {
          c.payWayTexts[4]=''
        } else {
          c.payWayTexts[4]=tem.Paywxcard
        }
        // 现金交给店长下标
        if(tem.Paymoney== 'False' || parseInt(tem.Paymoney) == 0 || tem.Paymoney== null) {
          c.payWayindexs[5]= 0
        } else {
          c.payWayindexs[5]= 1
        }
        // 现金交给店长账号
        if(tem.Paymoneycard=== null) {
          c.payWayTexts[5]=''
        } else {
          c.payWayTexts[5]=tem.Paymoneycard
        }
        // 其他方式下标
        if(tem.Payother== 'False' || parseInt(tem.Payother) == 0 || tem.Payother== null) {
          c.payWayindexs[6]= 0
        } else {
          c.payWayindexs[6]= 1
        }
        // 其他方式账号
        if(tem.Payothercard=== null) {
          c.payWayTexts[6]=''
        } else {
          c.payWayTexts[6]=tem.Payothercard
        }
        // 对方收款账号
        c.sideBankCount=tem.Receivecard ? tem.Receivecard : ''
        let evidenceTexts = ''
        evidenceTexts=tem.Pztype //凭证方式
        if(!evidenceTexts) {
          c.evidenceIndexs=[0,0,0,0,0,0,0]
        } else {
          evidenceTexts = evidenceTexts.split(',')
          c.evidenceIndexs=[0,0,0,0,0,0,0]
          evidenceTexts.forEach((item,index)=>{
            console.log(item)
            let dd =_that.payEvidences.findIndex((value,index,arr)=> {
              return value == item
            })
            this.$set(c.evidenceIndexs, dd, 1)
          })
        }
        // 凭证
        if(tem.Pzimg == null) {
          c.evidenceImgs=[]
        } else {
          let imgs = []
          let t = tem.Pzimg.split(',')
          console.log(tem.Pzimg.split(','))
          t.forEach((item)=>{
            c.evidenceImgs.push({
              url: item
            })
          })
        }
        return c
    }
  }
})