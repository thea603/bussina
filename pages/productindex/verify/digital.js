// pages/productindex/verify/digital.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    verifyCode: '', // 用户输入的核销码
    isSubmitActive: false // 提交按钮是否激活
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 如果有扫码结果，则显示在输入框中
    if (options.code) {
      this.setData({
        verifyCode: options.code,
        isSubmitActive: options.code.length > 0
      });
    }
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
    // 不再每次显示页面时清空输入框
    // 这样从扫码页面传入的核销码不会被清空
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

  // 监听输入框内容变化
  onInputChange: function(e) {
    const verifyCode = e.detail.value;
    this.setData({
      verifyCode: verifyCode,
      isSubmitActive: verifyCode.length > 0 // 当输入内容不为空时激活按钮
    });
  },

  // 提交核销码
  submitVerifyCode: function() {
    if (!this.data.isSubmitActive) {
      return; // 如果按钮未激活，不执行操作
    }

    const verifyCode = this.data.verifyCode;
    console.log('提交核销码:', verifyCode);

    // 模拟核销过程
    wx.showLoading({
      title: '核销中...',
    });

    // 模拟网络请求延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 跳转到核销成功页面
      wx.navigateTo({
        url: '/pages/productindex/verify/success'
      });
      
      // 在页面跳转后立即清空输入框内容
      // 这样用户在返回时看到的是空输入框
      this.setData({
        verifyCode: '',
        isSubmitActive: false
      });
    }, 1500);
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
})