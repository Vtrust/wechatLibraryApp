//personal.js
//获取应用实例
const websocket = require('../../config.js').host1;
const host = require('../../config.js').host2;
var util = require("../../utils/util.js");

var app = getApp()
Page({
  data: {
    userInfo: {},
    borrowBook: [],
    reserveBook: [],
    recommendBook: [],
    recommend: false,
    remind: 0,
    remindLevel: 0,
    userId: ''
  },
  // 页面加载前
  onLoad: function () {
    wx.showToast({// 消息显示
      title: '加载中',
      icon: 'loading',
      duration: 20000
    })
    var that = this;
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function (res) {
            var userName = res.userInfo.nickName;// 获取用户名
            wx.connectSocket({
              url: websocket
            });
            wx.onSocketOpen(function (res) {
              //连接成功发送当前用户名
              wx.sendSocketMessage({
                data: userName
              });
            });
          }
        });
      }
    });
    wx.onSocketMessage(function (res) {
      console.log(res.data);
      var data = res.data;
      var dataArray = data.split("_");
      if (dataArray[0] == 'dataChange') {
        getApp().globalData.dataChange = true;
      } else if (dataArray[0] == 'message') {
        wx.showModal({
          title: '您有新的消息！',
          content: dataArray[1] + '\n立即跳转个人消息面？',
          success: function (res) {
            if (res.confirm) {
              //console.log('用户点击确定')
              wx.navigateTo({
                url: '/pages/news/news'
              })
            } else if (res.cancel) {
              //console.log('用户点击取消')
            }
          }
        })
      }

    });
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            success: function (res) {
              var userName = res.userInfo.nickName;// 获取用户名
              //console.log(userName);
              // webSocket部分
              //console.log("将要连接服务器。");
              wx.connectSocket({
                url: websocket
              });
              wx.onSocketOpen(function (res) {
                //连接成功发送当前用户名
                wx.sendSocketMessage({
                  data: userName
                });
              });
            }
          });
        }
      });
    });
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function (res) {
            var userName = res.userInfo.nickName;// 获取用户名
            that.setData({
              userId: userName
            })
          }
        });
      }
    });
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
      });
      // 网络请求查询用户
      wx.request({
        url: host + '/signup/ifExist',
        data: {
          userId: userInfo.nickName,
        },
        method: 'GET',
        success: function (res) {
          if (res.data == "notExist") {// 若用户不存在则跳转注册页面
            console.log("跳转");
            wx.redirectTo({
              url: '/pages/signup/signup'
            })
          } else {
            console.log("设置缓存");
            wx.setStorage({
              key: "userId",
              data: userInfo.nickName
            });
            // 设置全局变量
            getApp().globalData.userId = userInfo.nickName;

            // 网络请求个人中心数据
            wx.request({
              url: host + '/personal?userId=' + userInfo.nickName,//传给服务器用户ID
              data: {},
              method: 'GET',
              success: function (res) {
                /*设置page.data中的borrowBook、reserveBook、recommendBook数据*/
                var borrowBook = res.data.borrowBook;
                var reserveBook = res.data.reserveBook;
                var recommendBook = res.data.recommendBook;
                var remind = res.data.remind;
                var remindLevel = res.data.remindLevel;
                that.setData({
                  borrowBook: util.imgChange(borrowBook),
                  reserveBook: util.imgChange(reserveBook),
                  recommendBook: util.imgChange(recommendBook),
                  remind: remind,
                  remindLevel: remindLevel
                }),
                  getApp().globalData.messageNum = remind;
                getApp().globalData.remindLevel = remindLevel;
                wx.hideLoading();
              },
              fail: function () {
                wx.showModal({
                  title: '提示',
                  content: res.data,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('连接失败，是否刷新？')
                      wx.navigateTo({
                        url: '/pages/personal/personal'
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            })
          }
        }
      })
    })
  },
  // 页面开启前
  onShow: function () {
    console.log('页面开启前');
    var that = this;
    if (getApp().globalData.dataChange) {
      wx.showToast({// 消息显示
        title: '加载中',
        icon: 'loading',
        duration: 20000
      })
      console.log('888888888888888888');
      // 网络请求个人中心数据
      wx.request({
        url: host + '/personal?userId=' + this.data.userId,//传给服务器用户ID
        data: {},
        method: 'GET',
        success: function (res) {
          /*设置page.data中的borrowBook、reserveBook、recommendBook数据*/
          var borrowBook = res.data.borrowBook;
          var reserveBook = res.data.reserveBook;
          var recommendBook = res.data.recommendBook;
          var remind = res.data.remind;
          that.setData({
            borrowBook: util.imgChange(borrowBook),
            reserveBook: util.imgChange(reserveBook),
            recommendBook: util.imgChange(recommendBook),
            remind: remind
          }),
            getApp().globalData.messageNum = remind;
          wx.hideLoading();
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: res.data,
            success: function (res) {
              if (res.confirm) {
                console.log('连接失败，是否刷新？')
                wx.navigateTo({
                  url: '/pages/personal/personal'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          console.log("err");
        }
      })
      getApp().globalData.dataChange = false;
    } else {
      //获取消息数
      that.setData({
        remind: getApp().globalData.messageNum,
        remindLevel: getApp().globalData.remindLevel
      })

    }

    // 设置推荐标志位
    wx.getStorage({
      key: 'recommend',
      success: function (res) {
        var recommend = res.data;
        if (recommend == true) {
          that.setData({
            recommend: true
          })
        }
        else if (recommend == false) {
          that.setData({
            recommend: false
          })
        }
      },
      fail: function () {
        console.log('获取标志位信息失败');
      }
    })
  },
  // 页面关闭时
  /* onUnload: function () {
     wx.closeSocket();
   },*/

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function (res) {
            var userName = res.userInfo.nickName;// 获取用户名
            that.setData({
              userId: userName
            })
          }
        });
      }
    });
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
      });
      // 网络请求查询用户
      wx.request({
        url: host + '/signup/ifExist',
        data: {
          userId: userInfo.nickName,
        },
        method: 'GET',
        success: function (res) {
          if (res.data == "notExist") {// 若用户不存在则跳转注册页面
            console.log("跳转");
            wx.redirectTo({
              url: '/pages/signup/signup'
            })
          } else {
            console.log("设置缓存");
            wx.setStorage({
              key: "userId",
              data: userInfo.nickName
            });
            // 设置全局变量
            getApp().globalData.userId = userInfo.nickName;

            // 网络请求个人中心数据
            wx.request({
              url: host + '/personal?userId=' + userInfo.nickName,//传给服务器用户ID
              data: {},
              method: 'GET',
              success: function (res) {
                /*设置page.data中的borrowBook、reserveBook、recommendBook数据*/
                var borrowBook = res.data.borrowBook;
                var reserveBook = res.data.reserveBook;
                var recommendBook = res.data.recommendBook;
                var remind = res.data.remind;
                var remindLevel = res.data.remindLevel;
                that.setData({
                  borrowBook: util.imgChange(borrowBook),
                  reserveBook: util.imgChange(reserveBook),
                  recommendBook: util.imgChange(recommendBook),
                  remind: remind,
                  remindLevel: remindLevel
                }),
                getApp().globalData.messageNum = remind;
                getApp().globalData.remindLevel = remindLevel;
                wx.stopPullDownRefresh()
              },
              fail: function () {
                wx.showModal({
                  title: '提示',
                  content: res.data,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('连接失败，是否刷新？')
                      wx.navigateTo({
                        url: '/pages/personal/personal'
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            })
          }
        }
      })
    })
  },



  // 跳转书籍详情页面
  bookDetail: function (e) {
    var bookId = e.currentTarget.dataset.hi;
    console.log(bookId);
    wx.navigateTo({
      url: '/pages/bookDetail/bookDetail?bookId=' + bookId
    })
  },
  // 跳转个人资料界面
  personDetail: function (e) {
    wx.navigateTo({
      url: '/pages/personDetail/personDetail'
    })
  },
  // 跳转消息界面
  news: function (e) {
    wx.navigateTo({
      url: '/pages/news/news'
    })
  }
})
