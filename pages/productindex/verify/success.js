Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
  },

  onLoad: function(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  // 继续核销 - 返回到数字核销页面
  continueVerify: function() {
    wx.navigateBack();
  },

  // 返回首页
  backToHome: function() {
    wx.switchTab({
      url: '/pages/productindex/index'
    });
  },
  
  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
}) 