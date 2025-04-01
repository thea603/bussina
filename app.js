// app.js
const auth = require('./utils/auth.js');

App({
  onLaunch: function () {
    // 检查登录状态
    if (!auth.checkLoginStatus()) {
      // 如果未登录或登录已过期，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
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
    userInfo: null
  }
})
