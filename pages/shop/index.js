Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    categories: [
      { id: 1, name: '食品饮料' },
      { id: 2, name: '服装鞋帽' },
      { id: 3, name: '家用电器' },
      { id: 4, name: '美妆护肤' },
      { id: 5, name: '手机数码' },
      { id: 6, name: '家居家装' },
      { id: 7, name: '母婴玩具' },
      { id: 8, name: '运动户外' }
    ],
    hotProducts: [
      { id: 1, name: '热销商品1', price: '99.00' },
      { id: 2, name: '热销商品2', price: '199.00' },
      { id: 3, name: '热销商品3', price: '299.00' },
      { id: 4, name: '热销商品4', price: '399.00' },
      { id: 5, name: '热销商品5', price: '499.00' }
    ],
    newProducts: [
      { id: 1, name: '新品商品1', price: '88.00' },
      { id: 2, name: '新品商品2', price: '188.00' },
      { id: 3, name: '新品商品3', price: '288.00' },
      { id: 4, name: '新品商品4', price: '388.00' }
    ]
  },

  onLoad: function(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  onReady: function() {
    // 在页面渲染完成后计算固定区域的高度
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.fixed-content').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          // 获取系统信息，计算可用高度
          const systemInfo = wx.getSystemInfoSync();
          const windowHeight = systemInfo.windowHeight;
          const fixedHeight = res[0].height;
          
          this.setData({
            fixedContentHeight: res[0].height,
            scrollHeight: windowHeight - res[0].height - 30 // 减去30px，为底部留出更多空间
          });
        }
      });
    }, 100); // 延迟100ms确保页面已渲染
  },

  // 导航到数字核销页面
  navigateToDigitalVerify: function() {
    wx.navigateTo({
      url: '/pages/shop/verify/digital'
    });
  },

  // 导航到扫码核销页面
  navigateToScanVerify: function() {
    wx.scanCode({
      success: (res) => {
        // 处理扫码结果
        console.log(res);
        // 将扫码结果传递给核销页面
        wx.navigateTo({
          url: `/pages/shop/verify/scan?code=${res.result}`
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        // 可以在这里添加扫码失败的处理逻辑，例如提示用户
        wx.showToast({
          title: '扫码取消或失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 导航到添加商品页面
  navigateToAddGoods: function() {
    wx.navigateTo({
      url: '/pages/shop/goods/add'
    });
  },

  // 显示更多选项
  showMoreOptions: function() {
    wx.showActionSheet({
      itemList: ['店铺设置', '消息通知', '帮助中心'],
      success: function(res) {
        console.log(res.tapIndex);
        // 根据点击的选项执行相应操作
      }
    });
  },
  
  // 扫码
  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.log(res);
        // 处理扫码结果
      }
    });
  },

  // 处理图片加载错误
  handleImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    // 不修改原始数据，只是在UI上显示为灰色背景
    // 如果需要修改数据，可以使用下面的代码
    /*
    const latestGoods = this.data.latestGoods;
    latestGoods[index].image = '';
    this.setData({
      latestGoods: latestGoods
    });
    */
  },

  // 显示搜索
  showSearch: function() {
    wx.navigateTo({
      url: '/pages/shop/search'
    });
  },

  // 显示筛选
  showFilter: function() {
    wx.showActionSheet({
      itemList: ['价格排序', '销量排序', '评分排序'],
      success: function(res) {
        console.log(res.tapIndex);
        // 根据点击的选项执行相应操作
      }
    });
  },

  // 导航到分类页面
  navigateToCategory: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shop/category?id=${categoryId}`
    });
  },

  // 导航到更多页面
  navigateToMore: function(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/shop/more?type=${type}`
    });
  },

  // 导航到商品详情页面
  navigateToDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shop/product/detail?id=${productId}`
    });
  }
}); 