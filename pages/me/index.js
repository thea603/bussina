// pages/me/index.js
const auth = require('../../utils/auth.js');
const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: {
      name: '科汇园店',
      id: '10086'
    },
    shopInfo: {},
    balance: '0.00',
    todayRevenue: '0.00',
    yesterdayRevenue: '0.00',
    todayOrderCount: '0',
    yesterdayOrderCount: '0',
    isLoading: false
  },

  onLoad: function(options) {
    // 检查登录状态
    if (!auth.checkLoginStatus()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    // 获取店铺信息和用户信息
    const shopInfo = auth.getShopInfo() || {};
    const userInfo = auth.getUserInfo() || {};

    this.setData({
      shopInfo,
      userInfo
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的'
    });

    // 显示加载状态
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 获取店铺统计数据
    this.fetchShopMetrics();
  },

  onShow: function() {
    // 每次显示页面时更新店铺信息和统计数据
    const shopInfo = auth.getShopInfo() || {};
    if (shopInfo) {
      this.setData({
        shopInfo
      });
      this.fetchShopMetrics();
    }
  },

  // 获取店铺统计数据
  fetchShopMetrics: function() {
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    const shopId = wx.getStorageSync('shopId');
    if (!shopId) {
      console.error('获取店铺ID失败');
      wx.hideLoading();
      return;
    }

    api.shop.getMetrics(shopId)
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            todayRevenue: res.data.todayRevenue.toFixed(2),
            yesterdayRevenue: res.data.yesterdayRevenue.toFixed(2),
            todayOrderCount: res.data.todayOrderCount,
            yesterdayOrderCount: res.data.yesterdayOrderCount
          });
        }
      })
      .catch(err => {
        console.error('获取店铺统计数据失败:', err);
      })
      .finally(() => {
        this.setData({ isLoading: false });
        wx.hideLoading();
      });
  },

  // 店铺管理
  navigateToShopManage: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 小工具
  navigateToTools: function() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 账户与设置
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  // 去提现
  navigateToWithdraw: function() {
    wx.navigateTo({
      url: '../me/withdraw'
    });
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