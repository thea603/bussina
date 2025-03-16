Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    scanCode: '', // 扫描得到的核销码
    isSubmitActive: false // 提交按钮是否激活
  },

  onLoad: function(options) {
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

    // 模拟网络请求延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 假设核销成功
      wx.showToast({
        title: '核销成功',
        icon: 'success',
        duration: 2000
      });

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }, 1500);
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
}); 