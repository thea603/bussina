// app.js
const auth = require('./utils/auth.js');

App({
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    const shopInfo = wx.getStorageSync('shopInfo');

    // 如果有token和用户信息，说明已经登录
    if (token && userInfo) {
      // 设置全局数据
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
      this.globalData.shopInfo = shopInfo;
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    shopInfo: null
  }
})
