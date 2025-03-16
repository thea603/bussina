// pages/shop/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      name: '科汇园店',
      id: '10086'
    },
    shopData: {
      todayOrders: 128,
      todayRevenue: 3280,
      totalProducts: 1024
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '我的'
    });
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

  // 导航到店铺信息页面
  navigateToShopInfo: function() {
    wx.navigateTo({
      url: '/pages/shop/info'
    });
  },
  
  // 导航到员工管理页面
  navigateToStaff: function() {
    wx.navigateTo({
      url: '/pages/shop/staff'
    });
  },
  
  // 导航到销售统计页面
  navigateToSales: function() {
    wx.navigateTo({
      url: '/pages/shop/sales'
    });
  },
  
  // 导航到财务管理页面
  navigateToFinance: function() {
    wx.navigateTo({
      url: '/pages/shop/finance'
    });
  },
  
  // 导航到帮助中心页面
  navigateToHelp: function() {
    wx.navigateTo({
      url: '/pages/shop/help'
    });
  },
  
  // 导航到意见反馈页面
  navigateToFeedback: function() {
    wx.navigateTo({
      url: '/pages/shop/feedback'
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
  },

  // 显示店铺二维码
  showShopQrcode: function() {
    wx.showModal({
      title: '店铺二维码',
      content: '这里将显示店铺的二维码图片',
      showCancel: false,
      confirmText: '关闭'
    });
    
    // 实际应用中，您可能需要使用wx.previewImage来预览二维码图片
    // 或者使用自定义弹窗组件来展示二维码
  }
})