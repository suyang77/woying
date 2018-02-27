Page({
  data: {

  },

  onclickus: function () {
    wx.navigateTo({
      url: '../mine/callus/call',
    })
  },

  onclickHistory: function () {
    wx.navigateTo({
      url: 'history/history',
    })
  },

//修改测试
  onclickToday:function(){
    wx.navigateTo({
      url: '../mine/orders/order',
    })
  }
  

})