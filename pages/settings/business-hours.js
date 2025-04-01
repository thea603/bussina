Page({
  data: {
    startTime: '',
    endTime: ''
  },

  onLoad: function(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '营业时间'
    });

    // 设置导航栏样式
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#FF6600'
    });

    // 获取已保存的营业时间
    const shopInfo = wx.getStorageSync('shopInfo') || {};
    this.setData({
      startTime: shopInfo.startTime || '',
      endTime: shopInfo.endTime || ''
    });
  },

  // 开始时间变化处理
  onStartTimeChange: function(e) {
    this.setData({
      startTime: e.detail.value
    });
  },

  // 结束时间变化处理
  onEndTimeChange: function(e) {
    this.setData({
      endTime: e.detail.value
    });
  },

  // 保存营业时间
  saveBusinessHours: function() {
    const { startTime, endTime } = this.data;

    // 验证时间是否都已选择
    if (!startTime || !endTime) {
      wx.showToast({
        title: '请选择完整的营业时间',
        icon: 'none'
      });
      return;
    }

    // 验证时间范围是否合理
    if (startTime >= endTime) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return;
    }

    // 获取当前店铺信息
    const shopInfo = wx.getStorageSync('shopInfo') || {};
    
    // 更新店铺信息
    const updatedShopInfo = {
      ...shopInfo,
      startTime,
      endTime
    };

    // 保存到本地存储
    wx.setStorageSync('shopInfo', updatedShopInfo);

    // 提示保存成功
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500
    });

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
}); 