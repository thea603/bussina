Page({
  data: {
    // 页面数据
  },
  
  onLoad: function(options) {
    // 页面加载时执行
  },
  
  // 继续新增商品
  continueAdd: function() {
    // 重新打开新建商品页面
    wx.redirectTo({
      url: '/pages/productindex/newproduct/index'
    });
  },
  
  // 返回首页
  backToHome: function() {
    wx.switchTab({
      url: '/pages/productindex/index'
    });
  }
}); 