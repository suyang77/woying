var postsData = require('../../data/posts-data.js')
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({
  data: {
    text: "完成今日订单后,请填写并提交完成表单",
    hiddenmodalput: true,
    postList: '',
    phone: '',
    code: '',
    rcode: '',
    rphone: '',
    buffer_orderId: '',
    codeDis: '',
    tis: '获取验证码',
    num: '',
    removeIndex: '',

    message: false,
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    callbackcount: 10,      //返回数据的个数  
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  

  },
  onShow: function () {
    //var Orders = AV.Object.extend('Orders');
    //var orders = new Orders();
    //orders.set('onum', '工作');
    //orders.save();

    var _this = this;
    _this.refresh();
  },

  onConfirmTap: function (event) {
    //console.log(event.currentTarget.id)
    var _this = this;
    const user = AV.User.current();
    var phone = user.get('phone');

    if (phone == null || phone == '') {

      this.setData({
        hiddenmodalput: !this.data.hiddenmodalput,
        buffer_orderId: event.currentTarget.id,
        removeIndex: event.target.dataset.index
      })
    } else {
      
      wx.showModal({
        title: '确定接受订单？',
        content: '确认后，可在已接订单中查看',
        success: (res) => {
          //更改订单状态
          if (res.confirm) {
            app.relation_order(event.currentTarget.id);
            _this.remove(event);
          }
        }
      })
      
    }
  },

  //todo 点击提交之后逻辑
  confirm: function () {

    var _this = this;

    var reg = /^0?(13|14|15|17|18|19)[0-9]{9}$/;

    if (!reg.test(_this.data.phone)) {
      wx.showToast({
        title: '手机号码有误',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if (_this.data.phone != _this.data.rphone || _this.data.code != _this.data.rcode) {
      wx.showToast({
        title: '验证码有误',
        icon: 'none',
        duration: 1000
      })
      return;
    }

    var query = new AV.Query('_User');
    query.equalTo('phone', _this.data.phone);
    query.find().then(function (user) {

      if (user.length == 0) {
        // 获得当前登录用户
        const user = AV.User.current();
        user.set('phone', _this.data.phone);
        user.save().then(function (userInfo) {

          _this.setData({
            hiddenmodalput: true
          })

          wx.showModal({
            title: '确定接受订单？',
            content: '确认后，可在已接订单中查看',
            success: (res) => {
              //更改订单状态
              if (res.confirm) {
                app.relation_order(_this.data.buffer_orderId);//建立订单关联
                //移除相关数据
                _this.data.postList.splice(_this.data.removeIndex, 1);
                _this.setData({
                  postList: _this.data.postList
                });
              }
            }
          })

        }, function (error) {
          console.error(error);
        });

      } else {
        wx.showToast({
          title: '该号码已经被注册',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  cancel: function () {
    this.setData({
      hiddenmodalput: true
    })
    console.log('你点击了取消')

  },

  //todo 获取验证码逻辑
  confirmNumber: function () {
    var _this = this;
    var reg = /^0?(13|14|15|17|18|19)[0-9]{9}$/;

    if (reg.test(_this.data.phone)) {

      wx.request({//获取验证码
        url: 'http://huayoutong.com/mobile/send_vali_message3',
        data: {
          phoneNum: _this.data.phone,
          content: '短信校验码：',
          key: '8826as8'

        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res.data.result.content);

          _this.setData({
            tis: "获取验证码(60)",
            codeDis: true,
            num: 59
          })

          let time = setInterval(() => {
            let num = _this.data.num
            num--
            var aac = "获取验证码(" + num + ")";

            _this.setData({
              tis: aac,
              num: num
            })
            if (num == 0) {
              clearInterval(time)
              _this.setData({
                tis: "获取验证码",
                codeDis: false
              })
            }
          }, 1000)

          _this.setData({
            rcode: res.data.result.content,
            rphone: _this.data.phone
          })
        }
      })
    } else {
      wx.showToast({
        title: '手机号码有误',
        icon: 'none',
        duration: 1000
      })
    }

  },

  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  codeInput: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  //初始化页面数据
  refresh: function () {
    var _this = this;
    
    var query = new AV.Query('Orders');
    query.equalTo('state', '0');//0-发布，1-已被接，2-已完成
    query.descending('createdAt');// 按时间，降序排列
    query.limit(_this.data.callbackcount);

    query.find().then(function (todos) {

      if (todos.length == 0) {
        _this.setData({
          searchLoading: false,
          searchLoadingComplete: false,
          message: true
        });
        wx.showToast({
          title: '暂无新订单发布',
          icon: 'none',
          duration: 1500
        })

      }else if (todos.length < _this.data.callbackcount) {
        _this.setData({
          searchLoading: false,
          searchLoadingComplete: false,
          message: false
        });
      }else{
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

  goToDayOrders: function () {
    //console.log('今日订单');
    wx.navigateTo({
      url: '../../pages/mine/orders/order',  //跳转页面的路径，可带参数 ？隔开，不同参数用 & 分隔；相对路径，不需要.wxml后缀
      success: function () { }
    })
  },

  //移除
  remove: function (e) {

    var dataset = e.target.dataset;
    var Index = dataset.index;
    //console.log(Index);

    //通过`index`识别要删除第几条数据，第二个数据为要删除的项目数量，通常为1
    this.data.postList.splice(Index, 1);

    //渲染数据
    this.setData({
      postList: this.data.postList
    });
  },

  //加载更多
  addMore: function () {
    var _this = this;

    var query = new AV.Query('Orders');
    query.equalTo('state', '0');//0-发布，1-已被接，2-已完成
    query.descending('createdAt');// 按时间，降序排列

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

  //下拉刷新
  onPullDownRefresh: function () {
    var _this = this;
    //console.log(_this.data.searchPageNum)
    _this.refresh();
    wx.stopPullDownRefresh();
  },
})