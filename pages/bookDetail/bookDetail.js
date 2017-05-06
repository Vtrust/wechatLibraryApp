Page({
    data: {
        book: {},
        relatedBooks: [],
        ifrelated: 0,
    },
    // 开启页面前
    onLoad: function(option) {
        var that = this;
        console.log(option.bookId);
        wx.request({
            url: 'http://localhost:3000/library/bookDetail',
            data: {
                bookId: '123'
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res) {
                console.log(res.data);
                that.setData({
                    book: res.data.book,
                    relatedBooks: res.data.relatedBooks
                })
                // success
            },
            fail: function(res) {
                console.log('fail');
                // fail
            },
            complete: function(res) {
                // complete
            }
        });

    },
    // 获得书籍详情并更新数据
    bookDetail: function(e) {
        wx.redirectTo({
            url: '/pages/bookDetail/bookDetail'
        })
    },
    // 书籍预约
    reserve: function(e) {
        var that = this;
        console.log(e);
        var that = this
        wx.showToast({
            title: '预约中',
            icon: 'loading',
            duration: 20000
        })
        wx.request({
            url: 'http://localhost:3000/library/bookReserve', //仅为示例，并非真实的接口地址
            data: {
                bookId: e.target.dataset.bookid, //设置发送到后台的bookid
            },
            method: 'post',
            header: {
                'content-type': 'application/json'
            },

            success: function(res) {
                console.log(res.data)
                if (res.data == 'success') {
                    wx.hideLoading();
                    wx.showToast({
                        title: '预约成功',
                        icon: 'success'
                    })
                    that.setData({
                        ifrelated: 1,
                    })

                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: res.data
                    })
                }
            }
        })
    },
    // 取消预约
    cancelReserve: function(e) {
        var that = this;
        console.log(e.target.dataset.bookid);
        var that = this
        wx.showToast({
            title: '预约中',
            icon: 'loading',
            duration: 20000
        })
        wx.request({
            url: 'http://localhost:3000/library/cancelReserve', //仅为示例，并非真实的接口地址
            data: {
                bookId: e.target.dataset.bookid, //设置发送到后台的bookid
            },
            method: 'post',
            header: {
                'content-type': 'application/json'
            },

            success: function(res) {
                console.log(res.data)
                if (res.data == 'success') {
                    wx.hideLoading();
                    wx.showToast({
                        title: '取消成功',
                        icon: 'success'
                    })
                    that.setData({
                        ifrelated: 0,
                    })

                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: '提示',
                        content: res.data
                    })
                }
            }
        })
    },
    // 反回个人中心
    returnPersonal: function(e) {
        wx.switchTab({
            url: '/pages/personal/personal'
        })
    }
})
