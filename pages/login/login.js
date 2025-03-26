// pages/login/login.js
const api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '账户登录'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 登录按钮点击事件
   */
  login: function() {
    wx.navigateTo({
      url: '/pages/login/register?type=login'
    })
  },

  /**
   * 注册开店按钮点击事件
   */
  register() {
    wx.navigateTo({
      url: '/pages/login/register?type=register'
    })
  },

  // 登录成功后的处理函数
  handleLoginSuccess: function() {
    // 显示登录成功提示
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 登录成功后跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/productindex/index'
          });
        }, 1500);
      }
    });
  },

  // 获取手机号
  getPhoneNumber(e) {
    console.log("获取手机号回调", e.detail.errMsg);
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 显示加载提示
      wx.showLoading({
        title: '登录中...',
      });

      // 获取登录凭证
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log("获取code成功：", res.code);
            // 构建登录参数
            const loginParams = {
              code: res.code,
              phoneCode: e.detail.code  // 手机号获取凭证
            };

            // 调用登录接口
            api.user.wxLogin(loginParams)
              .then(res => {
                console.log("登录接口返回：", res);
                if (res.code === 0) {
                  // 保存token
                  wx.setStorageSync('token', res.data.token);
                  
                  // 如果有店铺信息，保存店铺信息
                  if (res.data.shopInfo) {
                    wx.setStorageSync('shopInfo', res.data.shopInfo);
                    // 跳转到首页
                    wx.switchTab({
                      url: '/pages/productindex/index'
                    });
                  } else {
                    // 跳转到注册店铺页面
                    wx.redirectTo({
                      url: '/pages/shop/register/index'
                    });
                  }
                } else {
                  wx.showToast({
                    title: res.msg || '登录失败',
                    icon: 'none'
                  });
                }
              })
              .catch(err => {
                console.error('登录失败:', err);
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
              })
              .finally(() => {
                wx.hideLoading();
              });
          }
        },
        fail: (err) => {
          console.error('wx.login 失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      });
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权手机号才能继续使用',
        icon: 'none'
      });
    }
  },

  // 处理微信登录
  handleWxLogin() {
    wx.showLoading({
      title: '登录中...',
    });

    wx.login({
      success: (res) => {
        if (res.code) {
          console.log("获取code成功：", res.code);
          // 构建登录参数
          const loginParams = {
            code: res.code
          };

          // 调用登录接口
          api.user.wxLogin(loginParams)
            .then(res => {
              console.log("登录接口返回：res", res);
           
            })
            .catch(err => {
              console.error('登录失败:', err);
              wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      },
      fail: (err) => {
        console.error('wx.login 失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    });
  }
})