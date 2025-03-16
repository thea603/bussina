// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '账户登录'
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

  /**
   * 登录按钮点击事件
   */
  login: function() {
    wx.navigateTo({
      url: '/pages/login/register?type=login'
    })
  },

  /**
   * 注册开店按钮点击事件
   */
  register() {
    wx.navigateTo({
      url: '/pages/login/register?type=register'
    })
  },

  // 登录成功后的处理函数
  handleLoginSuccess: function() {
    // 显示登录成功提示
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 登录成功后跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/productindex/index'
          });
        }, 1500);
      }
    });
  }
})