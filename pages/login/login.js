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
    // 检查手机号授权结果
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '需要授权手机号才能继续使用',
        icon: 'none'
      });
      return;
    }

    const phoneCode = e.detail.code;
    wx.showLoading({ title: '登录中...', mask: true });

    // 登录流程：获取code -> 调用登录接口
    this.getWxLoginCode()
      .then(code => {
        // 调用登录接口
        return api.user.wechatUserLogin({
          code,
          phoneCode
        });
      })
      .then(res => {
        // 保存用户信息
        this.saveUserInfo(res.data);
        
        // 检查店铺状态
        return api.user.checkShop();
      })
      .then(shopRes => {
        this.handleShopStatus(shopRes.data);
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
        fail: (err) => reject(new Error(err.errMsg || '获取code失败'))
      });
    });
  },
  
  /**
   * 保存用户信息
   */
  saveUserInfo(data) {
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('openid', data.user.openid);
    wx.setStorageSync('userId', data.user.id);
    wx.setStorageSync('userInfo', data.user);
  },
  
  /**
   * 处理店铺状态
   */
  handleShopStatus(data) {
    if (!data) return;
    
    // 保存店铺信息
    if (data.shopId) {
      wx.setStorageSync('shopId', data.shopId);
      if (data.shop) {
        wx.setStorageSync('shopInfo', data.shop);
      }
    }
    
    // 处理店铺状态结果
    if (data.hasShop) {
      if (data.shop?.auditStatus === 0) {
        wx.showToast({
          title: '店铺审核中',
          icon: 'none',
          duration: 2000
        });
      } else {
        this.navigateToMainPage();
      }
    } else {
      this.navigateToShopOpen();
    }
  },
  
  /**
   * 跳转到主页
   */
  navigateToMainPage() {
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/productindex/index'
      });
    }, 1000);
  },
  
  /**
   * 跳转到开店页面
   */
  navigateToShopOpen() {
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/shop/open'
      });
    }, 1000);
  }
});