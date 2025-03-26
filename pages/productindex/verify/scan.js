// pages/productindex/verify/scan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    scanCode: '', // 扫描得到的核销码
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

    // 如果有扫码结果，则显示
    if (options.code) {
      this.setData({
        scanCode: options.code,
        isSubmitActive: true
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
    // 每次页面显示时，确保输入框为空
    this.setData({
      scanCode: '',
      isSubmitActive: false
    });
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
    const scanCode = e.detail.value;
    this.setData({
      scanCode: scanCode,
      isSubmitActive: scanCode.length > 0 // 当输入内容不为空时激活按钮
    });
  },

  // 提交核销码
  submitScanCode: function() {
    if (!this.data.isSubmitActive) {
      return; // 如果按钮未激活，不执行操作
    }

    const scanCode = this.data.scanCode;
    console.log('提交扫码核销:', scanCode);

  // 模拟核销过程
    wx.showLoading({
      title: '核销中...',
    });
    const api = require('../../utils/api');

    api.product.getProductScan({code:scanCode})
    .then(res => {
      if (res.code === 200 && res.data && res.data.items) {
        wx.hideLoading();
      
        // 跳转到核销成功页面
        wx.navigateTo({
          url: '/pages/productindex/verify/success'
        });
        
        // 在页面跳转后立即清空输入框内容
        this.setData({
          scanCode: '',
          isSubmitActive: false
        });
      
      } else {
        wx.showToast({
          title: '商品核销失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('商品核销失败:', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    })
    .finally(() => {
      this.setData({ loading: false });
    });

  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
})