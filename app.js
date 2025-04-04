// app.js
const auth = require('./utils/auth.js');
const interceptor = require('./utils/interceptor.js');
const tokenUtil = require('./utils/tokenUtil.js');

App({
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const shopInfo = wx.getStorageSync('shopInfo');

    // 如果有token和用户信息，说明已经登录
    if (token && userInfo) {
      // 验证token是否有效
      if (tokenUtil.isTokenValid()) {
        // 设置全局数据
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = userInfo;
        this.globalData.shopInfo = shopInfo;
      } else {
        // token无效，清除登录状态并跳转到登录页
        console.log('Token无效，需要重新登录');
        this.clearLoginStatus();
      }
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.globalData.wxLoginCode = res.code;
      }
    })
  },

  // 页面显示时检查登录状态
  onShow(options) {
    // 获取当前页面路径
    const pages = getCurrentPages();
    const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
    const route = currentPage ? currentPage.route : '';

    console.log('App onShow, 当前页面:', route);

    // 调用路由拦截器检查登录状态
    if (currentPage) {
      interceptor.routeInterceptor({
        path: route,
        options: options
      });
    }
  },

  // 清除登录状态
  clearLoginStatus() {
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('openid');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('shopInfo');
    wx.removeStorageSync('shopId');
    wx.removeStorageSync('userId');

    // 重置全局数据
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
    this.globalData.shopInfo = null;

    // 跳转到登录页面
    const pages = getCurrentPages();
    const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
    const route = currentPage ? currentPage.route : '';

    // 如果当前不在登录页，跳转到登录页
    if (route && !route.includes('/pages/login/login')) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },

  globalData: {
    isLoggedIn: false,
    userInfo: null,
    shopInfo: null,
    wxLoginCode: null
  }
})
