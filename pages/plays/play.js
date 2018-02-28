var postsData = require('../../data/posts-data.js')
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    postList: '',
    ondetail: false,
    message: false,
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    callbackcount: 10,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
  },

  onShow: function () {

    var _this = this;
    _this.refresh();
  },

  //TODO 终止订单逻辑
  onStopTap: function (event) {
    wx.showModal({
      title: '中断订单联系调度中心',
      content: '18033498809',
      showCancel: false,
      confirmText:'返回',
      success: function (res) {
        
      }
    })
    //app.cancel_order(event.currentTarget.id)
    //this.remove(event)
  },

  //打开详情逻辑
  ondetail: function (event) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 200
    })
    var that = this
  

    var dataset = event.target.dataset;
    var Index = dataset.index;

    var ondetail = this.data.ondetail
    if (ondetail == false) {
      setTimeout(function () {

        var postList = that.data.postList
        var postList_detail = postList[Index]

        that.setData({
          ondetail: true,
          postList_detail: postList_detail
        })
      }, 200)
    }
    else { }
  },

  //关闭详情逻辑
  close_detail: function () {
    this.setData({
      ondetail: false
    })
  },

  //TODO 完成订单逻辑
  onConfirmTap: function (event) {
    wx.showModal({
      title: '确定完成订单？',
      content: '确认后，订单会提交后台审核',
      success: (res) => {
        //更改订单状态
        if (res.confirm) {
          app.finish_order(event.currentTarget.id)
          this.remove(event)
        }
      }
    })
  },

  //todo 获取验证码逻辑
  confirmNumber: function () {
    console.log('你点击了获取验证码')
    wx.showToast({
      title: '点击了获取验证码',
      duration: 1000
    })
  },

  //加载更多
  addMore: function () {
    var _this = this;

    // 获得当前登录用户
    const user = AV.User.current();

    var query = new AV.Query('Orders');
    query.equalTo('state', '1');
    query.equalTo('acceptUser', user);

    query.descending('updatedAt');// 按时间，降序排列

    query.limit(_this.data.callbackcount);
    var num = _this.data.callbackcount * (_this.data.searchPageNum);
    query.skip(num);// 跳过 num 条结果

    query.find().then(function (todos) {

      if (todos.length == 0 || todos.length < _this.data.callbackcount) {
        _this.setData({
          searchLoading: false,
          searchLoadingComplete: true
        });
        return;
      }

      var postsData2 = JSON.stringify(todos);
      var aa = JSON.parse(postsData2);

      _this.setData({
        postList: _this.data.postList.concat(aa),
        searchPageNum: _this.data.searchPageNum + 1
      });

    }).then(function (todos) {
      // 更新成功
    }, function (error) {
      // 异常处理
    });
  },

  //移除
  remove: function (e) {

    var dataset = e.target.dataset;
    var Index = dataset.index;

    //通过`index`识别要删除第几条数据，第二个数据为要删除的项目数量，通常为1
    this.data.postList.splice(Index, 1);

    //渲染数据
    this.setData({
      postList: this.data.postList
    });
  },

  //初始化页面数据
  refresh: function () {
    var _this = this;
    // 获得当前登录用户
    const user = AV.User.current();

    // var priorityQuery = new AV.Query('Orders');
    // priorityQuery.equalTo('state', '1');//已接

    // var statusQuery = new AV.Query('Orders');
    // statusQuery.equalTo('state', '2');//已完成

    // var query = AV.Query.or(priorityQuery, statusQuery);

    var query = new AV.Query('Orders');
    query.equalTo('state', '1');
    query.equalTo('acceptUser', user);

    query.descending('updatedAt');// 按时间，降序排列
    query.limit(_this.data.callbackcount);

    query.find().then(function (todos) {

      if (todos.length == 0) {
        _this.setData({
          searchLoading: false,
          searchLoadingComplete: false,
          message: true
        });
      } else if (todos.length < _this.data.callbackcount) {
        _this.setData({
          searchLoading: false,
          searchLoadingComplete: false,
          message: false
        });
      } else {
        _this.setData({
          searchLoading: true,
          searchLoadingComplete: false,
          message: false
        });
      }

      var postsData2 = JSON.stringify(todos);
      var aa = JSON.parse(postsData2);
      _this.setData({
        postList: aa,
        searchPageNum: 1 //初始化加载次数
      });

    }).then(function (todos) {
      // 更新成功
    }, function (error) {
      // 异常处理
    });

  },

  //下拉刷新
  onPullDownRefresh: function () {
    var _this = this;
    //console.log(_this.data.searchPageNum)
    _this.refresh();
  },
})