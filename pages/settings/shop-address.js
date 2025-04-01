Page({
  data: {
    region: ['', '', ''],
    address: '',
    customItem: '全部'
  },

  onLoad: function(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '店铺地址'
    });

    // 设置导航栏样式
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#FF6600'
    });

    // 获取已保存的地址信息
    const shopInfo = wx.getStorageSync('shopInfo') || {};
    if (shopInfo.region && shopInfo.region.length === 3) {
      this.setData({
        region: shopInfo.region,
        address: shopInfo.address || ''
      });
    }
  },

  // 省市区选择器变化处理
  onRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    });
  },

  // 详细地址输入处理
  onAddressInput: function(e) {
    this.setData({
      address: e.detail.value
    });
  },

  // 保存地址信息
  saveAddress: function() {
    const { region, address } = this.data;

    // 验证省市区是否已选择
    if (!region[0] || !region[1] || !region[2]) {
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      });
      return;
    }

    // 验证详细地址
    if (!address) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none'
      });
      return;
    }

    // 获取当前店铺信息
    const shopInfo = wx.getStorageSync('shopInfo') || {};
    
    // 更新店铺信息
    const updatedShopInfo = {
      ...shopInfo,
      region,
      address
    };

    // 保存到本地存储
    wx.setStorageSync('shopInfo', updatedShopInfo);

    // 提示保存成功
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1500
    });

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
}); 