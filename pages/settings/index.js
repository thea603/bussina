const auth = require('../../utils/auth.js');

Page({
  data: {
    shopInfo: {}
  },

  onLoad: function(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '账户与设置'
    });

    // 从本地缓存获取用户信息和店铺信息
    const userInfo = wx.getStorageSync('userInfo') || {};
    const shopInfo = wx.getStorageSync('shopInfo') || {};

    // 处理手机号码脱敏
    const maskedPhone = userInfo.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1***$2') : '';

    this.setData({
      shopInfo: {
        ...shopInfo,
        phone: maskedPhone,
        startTime: shopInfo.startTime || '',
        endTime: shopInfo.endTime || ''
      }
    });
  },

  // 退出登录
  logout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录数据
          auth.clearLoginData();
          
          // 跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  // 导航到店铺图片编辑页面
  navigateToShopImage: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 导航到店铺名称编辑页面
  navigateToShopName: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 导航到营业时间编辑页面
  navigateToBusinessHours: function() {
    wx.navigateTo({
      url: '/pages/settings/business-hours'
    });
  },

  // 导航到店铺地址编辑页面
  navigateToShopAddress: function() {
    wx.navigateTo({
      url: '/pages/settings/shop-address'
    });
  }
}); 