// pages/me/index.js
Page({
  data: {
    userInfo: {
      name: '科汇园店',
      id: '10086'
    },
    shopData: {
      todayOrders: 128,
      todayRevenue: 3280,
      totalProducts: 1024
    },
    shopInfo: {}
  },

  onLoad: function() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的'
    });

    // 从本地缓存获取店铺信息
    const shopInfo = wx.getStorageSync('shopInfo');
    if (shopInfo) {
      this.setData({
        shopInfo: shopInfo
      });
    }
  },

  onShow: function() {
    // 每次显示页面时重新获取店铺信息，确保信息是最新的
    const shopInfo = wx.getStorageSync('shopInfo');
    if (shopInfo) {
      this.setData({
        shopInfo: shopInfo
      });
    }
  },

  // 显示店铺二维码
  showShopQrcode: function() {
    wx.showModal({
      title: '店铺二维码',
      content: '这里将显示店铺的二维码图片',
      showCancel: false,
      confirmText: '关闭'
    });
  },
  
  // 导航到设置页面
  navigateToSetting: function() {
    wx.navigateTo({
      url: '/pages/me/withdraw'
    });
  },

  // 导航到店铺信息页面
  navigateToShopInfo: function() {
    wx.navigateTo({
      url: '/pages/me/shop-info'
    });
  },
  
  // 导航到员工管理页面
  navigateToStaff: function() {
    wx.navigateTo({
      url: '/pages/me/staff'
    });
  },
  
  // 导航到销售统计页面
  navigateToSales: function() {
    wx.navigateTo({
      url: '/pages/me/sales'
    });
  },
  
  // 导航到财务管理页面
  navigateToFinance: function() {
    wx.navigateTo({
      url: '/pages/me/finance'
    });
  },
  
  // 导航到帮助中心页面
  navigateToHelp: function() {
    wx.navigateTo({
      url: '/pages/me/help'
    });
  },
  
  // 导航到意见反馈页面
  navigateToFeedback: function() {
    wx.navigateTo({
      url: '/pages/me/feedback'
    });
  },
  
  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          // 清除本地存储的用户信息和token
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');
          
          // 跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
}) 