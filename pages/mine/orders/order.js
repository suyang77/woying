const AV = require('../../../utils/av-live-query-weapp-min')
const sheet = require("../../../model/sheet-model.js")

Page({
  data: {
    choose_station:"",
    //点部选择器value
    range_arr: [
      '跨越点部',
      '点部2',
      '点部3'
    ]
  },


  onLoad:function(){
    //获取用户
    const user = AV.User.current()
    console.log(user.attributes.phone)
    var user_phone = user.attributes.phone
    this.setData({user_phone})
  },

  //提交表单
  onConfirmTap: function (event) {
    var form_value = event.detail.value
    var user_phone = this.data.user_phone
    //检查表单完整性，若不完整则返回0
    var check=this.check_form(form_value)
    console.log(check)
    if(check==0){
      wx.showToast({
        title: '请填写完整信息',
        image:"/images/icon/warn.png"
      })
    }
    //若没验证手机号，则弹出提示
    else if (user_phone==""){
      wx.showModal({
        title: '你的手机号码还没验证',
        content: '提交表单前，请先验证手机号',
        showCancel:false
      })
    }
    else{
      wx.showLoading({
        title: '提交中，请稍后',
      })
      //from表单中的各组件的值
      var range_arr = this.data.range_arr
      var station = this.data.choose_station

      // 继承sheet的表的属性
      new sheet({
        //提交人手机号码
        user_phone:this.data.user_phone,
        // 选择点部
        //station: station,

        //完成但是
        complete: form_value.complete_num,
        // 总金额
        total_amount: form_value.total_amount,
        // 运输趟数
        transport: form_value.transport_num,
        // 点部
        station: form_value.picker,

      }).save().then(
        wx.showToast({
          title: '提交成功',
          mask: true
        }))
        .then(
        setTimeout(function () {
          wx.switchTab({
            url: '../my',
          })
        }, 800)
        )
    }
    
  },

  //TODO 终止订单逻辑
  onStopTap: function () {
    wx.navigateBack({})
  },

  //选择点部
  bindchange: function (event) {
    var arrid = event.detail.value
    var range_arr = this.data.range_arr
    this.setData({
      choose_station: range_arr[arrid]
    })
  },

  //检查订单完整函数
  check_form:function(form){
    for(var value in form){
      if(form[value]==""){
        //代表未填完整
        return 0
      }
    }
  },

})