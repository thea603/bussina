// pages/login/login.js
const api = require('../../utils/api.js');
const auth = require('../../utils/auth.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
    statusBarHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: ''
    });
    
    // 隐藏返回首页按钮
    if (wx.hideHomeButton) {
      wx.hideHomeButton();
    }
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
  login() {
    wx.navigateTo({
      url: '/pages/login/register?type=login'
    });
  },

  /**
   * 注册开店按钮点击事件
   */
  register() {
    wx.navigateTo({
      url: '/pages/login/register?type=register'
    });
  },

  /**
   * 微信按钮获取手机号回调
   */
  getUserProfile(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '需要授权手机号才能继续使用',
        icon: 'none'
      });
      return;
    }

    const phoneCode = e.detail.code;
    wx.showLoading({ title: '登录中...' });

    // 登录流程：获取OpenID -> 获取新code -> 调用登录接口
    this.getWxLoginCode()
      .then(code => this.getOpenId(code))
      .then(res => {
        if (!res.data?.openid) {
          throw new Error('获取OpenID失败');
        }
        
        // 保存openid
        wx.setStorageSync('openid', res.data.openid);
        
        // 重新获取code
        return this.getWxLoginCode();
      })
      .then(newCode => {
        // 调用新的登录接口
        return api.user.wechatUserLogin({
          code: newCode,
          phoneCode: phoneCode
        });
      })
      .then(res => {
        // 保存用户信息
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userId', res.data.user.id);
        wx.setStorageSync('userInfo', res.data.user);
        wx.setStorageSync('wechatInfo', res.data);
        
        // 检查店铺状态
        return api.user.checkShop();
      })
      .then(shopRes => {
        if (shopRes.data && shopRes.data.shopId) {
          wx.setStorageSync('shopId', shopRes.data.shopId);
          if (shopRes.data.shop) {
            wx.setStorageSync('shopInfo', shopRes.data.shop);
          }
        }
        
        // 处理店铺状态结果
        if (shopRes.data && shopRes.data.hasShop) {
          if (shopRes.data.shop && shopRes.data.shop.auditStatus === 0) {
            wx.showToast({
              title: '店铺审核中',
              icon: 'none',
              duration: 2000
            });
          } else {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/productindex/index'
              });
            }, 1500);
          }
        } else {
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/shop/open'
            });
          }, 1500);
        }
      })
      .catch(err => {
        console.error('登录错误:', err);
        wx.showToast({
          title: err.message || '登录失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 获取微信登录凭证(code)
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => res.code ? resolve(res.code) : reject(new Error('获取code失败')),
        fail: reject
      });
    });
  },
  
  /**
   * 获取OpenID
   */
  getOpenId(code) {
    return api.user.wxLogin({ code });
  },

  // 登录成功后的处理
  handleLoginSuccess: function(res) {
    // 保存登录数据
    auth.saveLoginData({
      token: res.token,
      openid: res.openid,
      userId: res.userId,
      userInfo: res.userInfo,
      shopId: res.shopId,
      shopInfo: res.shopInfo
    });

    // 返回上一页或跳转到首页
    const pages = getCurrentPages();
    if (pages.length > 0) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 登录失败的处理
  handleLoginFail: function(err) {
    // 清除可能存在的旧登录数据
    auth.clearLoginData();
    
    wx.showToast({
      title: err.message || '登录失败，请重试',
      icon: 'none'
    });
  }
});