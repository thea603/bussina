const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    latestGoods: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    shopName: '',
    shopId: ''
  },

  onLoad: function(options) {
    this.initData();
  },

  onShow: function() {
    this.refreshProductList();
  },

  /**
   * 初始化页面数据
   */
  initData: function() {
    // 获取店铺信息
    this.getShopInfo();
    
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 布局计算
    this.calculateLayout();
  },

  /**
   * 从本地存储获取店铺信息
   */
  getShopInfo: function() {
    const shopInfo = wx.getStorageSync('shopInfo');
    const shopId = wx.getStorageSync('shopId');
    
    if (shopInfo && shopInfo.name) {
      this.setData({
        shopName: shopInfo.name,
        shopId: shopId
      });
    }
  },

  /**
   * 计算页面布局尺寸
   */
  calculateLayout: function() {
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.fixed-content').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          const systemInfo = wx.getSystemInfoSync();
          const windowHeight = systemInfo.windowHeight;
          const fixedHeight = res[0].height;
          
          this.setData({
            fixedContentHeight: fixedHeight,
            scrollHeight: windowHeight - fixedHeight - 30 // 为底部留出额外空间
          });
        }
      });
    }, 100);
  },

  /**
   * 刷新商品列表
   */
  refreshProductList: function() {
    this.setData({
      page: 1,
      latestGoods: [],
      hasMore: true,
      loading: false
    }, () => {
      this.fetchProductList();
    });
  },

  /**
   * 获取商品列表
   */
  fetchProductList: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    const shopId = this.data.shopId || wx.getStorageSync('shopId');
    
    if (!shopId) {
      this.handleNoShopId();
      return;
    }
    
    this.setData({ loading: true });
    
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      shopId: shopId,
      status: 1  // 仅获取状态为1（上架）的商品
    };
    
    console.log('请求商品列表参数:', params);
    
    api.product.getProductList(params)
      .then(res => this.handleProductListSuccess(res))
      .catch(err => this.handleProductListError(err))
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 处理无店铺ID的情况
   */
  handleNoShopId: function() {
    wx.showToast({
      title: '获取店铺信息失败，请重新登录',
      icon: 'none',
      duration: 2000
    });
    
    // 延迟跳转，让用户有时间看到提示
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }, 1500);
  },

  /**
   * 处理商品列表请求成功
   */
  handleProductListSuccess: function(res) {
    if (res.code === 200 && res.data) {
      // 确保只获取状态为1的商品
      const newGoods = (res.data.items || []).filter(item => String(item.status) === '1');
      const pagination = res.data.pagination || {};
      
      // 处理分页逻辑
      const hasMore = this.data.page < pagination.totalPages;
      const isFirstPage = this.data.page === 1;
      const updatedGoods = isFirstPage ? newGoods : [...this.data.latestGoods, ...newGoods];
      
      this.setData({
        latestGoods: updatedGoods,
        hasMore: hasMore,
        page: this.data.page + 1
      });
      
      // 如果返回数据为空且是第一页
      if (newGoods.length === 0 && isFirstPage) {
        console.log('没有符合条件的商品');
      }
    } else {
      this.showErrorToast('获取商品列表失败');
    }
  },

  /**
   * 处理商品列表请求失败
   */
  handleProductListError: function(err) {
    console.error('请求商品列表失败:', err);
    this.showErrorToast('网络错误，请重试');
  },

  /**
   * 显示错误提示
   */
  showErrorToast: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.refreshProductList();
    wx.stopPullDownRefresh();
  },
  
  /**
   * 上拉加载更多
   */
  onReachBottom: function() {
    this.fetchProductList();
  },

  /**
   * 页面准备就绪
   */
  onReady: function() {
    this.calculateLayout();
  },

  /**
   * 导航到数字核销页面
   */
  navigateToDigitalVerify: function() {
    wx.navigateTo({
      url: '/pages/productindex/verify/digital'
    });
  },

  /**
   * 导航到扫码核销页面
   */
  navigateToScanVerify: function() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res);
        wx.navigateTo({
          url: `/pages/productindex/verify/digital?code=${encodeURIComponent(res.result)}`
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        if (err.errMsg !== 'scanCode:fail cancel') {
          this.showErrorToast('扫码失败，请重试');
        }
      }
    });
  },

  /**
   * 导航到添加商品页面
   */
  navigateToAddGoods: function() {
    wx.navigateTo({
      url: '/pages/productindex/newproduct/index'
    });
  },

  /**
   * 显示更多选项
   */
  showMoreOptions: function() {
    wx.showActionSheet({
      itemList: ['店铺设置', '消息通知', '帮助中心'],
      success: (res) => {
        const index = res.tapIndex;
        switch (index) {
          case 0:
            wx.navigateTo({ url: '/pages/settings/index' });
            break;
          case 1:
            wx.navigateTo({ url: '/pages/message/index' });
            break;
          case 2:
            wx.navigateTo({ url: '/pages/help/index' });
            break;
        }
      }
    });
  },
  
  /**
   * 处理图片加载错误
   */
  handleImageError: function(e) {
    const index = e.currentTarget.dataset.index;
    // 记录错误但不修改原始数据，UI上显示为灰色背景
    console.warn(`商品图片加载失败, 索引: ${index}`);
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      console.warn('预览图片失败：无效的图片URL');
      return;
    }
    
    wx.previewImage({
      current: url,
      urls: [url]
    });
  }
}); 