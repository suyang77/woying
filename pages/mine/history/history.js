// pages/mine/history/history.js
const AV = require('../../../utils/av-live-query-weapp-min');

Page({
  data: {
    ondetail: false,
    res_arr:[],
    date_arr:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成,将日期归类，后期后台成熟，请交给后台去完成。
   */
  onReady: function () {
    //获取用户
    const user = AV.User.current()
    //获取用户objid
    var user_id = user.id
    //查询该用户的历史完成订单
    var query = new AV.Query("Orders")
    var todoFolder = AV.Object.createWithoutData('_User', user_id);
    var user_query=query.equalTo('acceptUser', todoFolder);
    var state_query = query.contains("state","2")
    var query = AV.Query.and(user_query, state_query);
    query.descending('updatedAt');
    query.find().then(res=>{
      console.log(res)
      //res_arr为结果的大数组，date_arr为该日期下所有数组的归类
      var res_arr = this.data.res_arr
      var date_arr = this.data.date_arr
      //处理日期
      var At = this.change_date(res[0].updatedAt)
      //初始化日期数组
      var date_res = res[0]
      var arr = [date_res]
      res_arr.push(arr)
      //初始化日期
      date_arr.push(At)
      this.setData({ res_arr })
      this.setData({ date_arr })
      //把某一属性归类的方法，归类成一个数组
      for (var i = 0; i < res.length; i++) { 
         //处理日期
        var At = this.change_date(res[i].updatedAt)
        var At_N = this.change_date(res[i + 1].updatedAt)
        console.log(At_N)
        var date_res = res[i]
        var date_res_N = res[i + 1]
        //若相同时间，则放上一个数组
        if (At == At_N) {
          res_arr[res_arr.length - 1].push(date_res_N)
        }
        //不同时再设置新的arr，同时push上数组
        else {
          //新设订单数组,PUSH上去
          var arr = [date_res_N]
          res_arr.push(arr)
          //放上下一个时间
          date_arr.push(At_N)
        }
        this.setData({ res_arr })
        this.setData({ date_arr })
      }
    })
  },

  //处理成年月日方法
  change_date:function(date){
    var date = new Date(date)
    var y= date.getFullYear()
    var m = date.getMonth()+1
    var d = date.getDate()
    var normal_date = y + "年" + m + "月" + d+"日"
    return normal_date
  },

  //打开详情逻辑
  ondetail: function (event) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 200
    })
    var that = this

    console.log(event)

    var dataset = event.target;
    var Index = dataset.id;

    var ondetail = this.data.ondetail
    if (ondetail == false) {

      var query = new AV.Query('Orders');
      query.get(Index).then(res => this.setData({postList_detail:res,
        ondetail: true})
      );

      // setTimeout(function () {

      //   var postList = that.data.postList
      //   var postList_detail = postList[Index]

      //   that.setData({
      //     ondetail: true,
      //     postList_detail: postList_detail
      //   })
      // }, 200)
    }
    else { }
  },

  //关闭详情逻辑
  close_detail: function () {
    this.setData({
      ondetail: false
    })
  },
})

