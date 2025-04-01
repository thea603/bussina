// pages/productindex/verify/digital.js
const api = require('../../../utils/api.js');

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

    // 显示加载提示
    wx.showLoading({
      title: '核销中...',
    });

    // 调用封装好的核销接口
    api.order.verifyByCode(verifyCode)
      .then(res => {
        wx.hideLoading();
        // 核销成功，跳转到成功页面
        wx.navigateTo({
          url: '/pages/productindex/verify/success'
        });
        
        // 清空输入框内容
        this.setData({
          verifyCode: '',
          isSubmitActive: false
        });
      })
      .catch(err => {
        wx.hideLoading();
        // 显示错误提示
        wx.showToast({
          title: err.message || '核销失败，请重试',
          icon: 'none',
          duration: 2000
        });
        console.error('核销请求失败:', err);
      });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
})