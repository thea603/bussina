Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    latestGoods: [],
    loading: false,
    page: 1,
    hasMore: true,
    shopName: '' // 添加店铺名称数据
  },

  onLoad: function(options) {
    // 从本地存储获取店铺信息
    const shopInfo = wx.getStorageSync('shopInfo');
    if (shopInfo && shopInfo.name) {
      this.setData({
        shopName: shopInfo.name
      });
    }
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    // 加载商品数据
    this.fetchGoodsList();
  },

  // 获取商品列表数据
  fetchGoodsList: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    const api = require('../../utils/api');
    const shopId = wx.getStorageSync('shopId');
    
    const params = {
      page: this.data.page,
      pageSize: 20
    };
    
    if (shopId) {
      params.shopId = shopId;
    }
    
    console.log('请求商品列表参数:', params);
    
    api.product.getProductList(params)
      .then(res => {
        if (res.code === 200 && res.data && res.data.items) {
          const newGoods = res.data.items;
          
          // 如果返回的数据为空，或者已经是最后一页
          if (newGoods.length === 0 || this.data.page >= res.data.pagination.totalPages) {
            this.setData({
              hasMore: false
            });
          }
          
          // 将新数据追加到现有数据中
          this.setData({
            latestGoods: this.data.page === 1 ? newGoods : [...this.data.latestGoods, ...newGoods],
            page: this.data.page + 1
          });
        } else {
          wx.showToast({
            title: '获取商品列表失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('请求商品列表失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      latestGoods: [],
      page: 1,
      hasMore: true
    });
    this.fetchGoodsList();
    wx.stopPullDownRefresh();
  },
  
  // 上拉加载更多
  onReachBottom: function() {
    this.fetchGoodsList();
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
      url: '/pages/productindex/verify/digital'
    });
  },

  // 导航到扫码核销页面
  navigateToScanVerify: function() {
    wx.scanCode({
      success: (res) => {
        // 处理扫码结果
        console.log('扫码结果:', res);
        
        // 将扫码结果传递给数字核销页面
        wx.navigateTo({
          url: `/pages/productindex/verify/digital?code=${res.result}`
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
      url: '/pages/productindex/newproduct/index'
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
  }
}); 