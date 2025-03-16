Page({
  data: {
    goodsList: [
      {
        id: 1,
        name: '香辣鸡腿堡套餐',
        price: 32.00,
        image: '/images/food1.png',
        sales: 128,
        category: '热销套餐'
      },
      {
        id: 2,
        name: '双层牛肉汉堡',
        price: 38.00,
        image: '/images/food1.png',
        sales: 95,
        category: '热销套餐'
      },
      {
        id: 3,
        name: '招牌炸鸡全家桶',
        price: 99.00,
        image: '/images/food1.png',
        sales: 75,
        category: '家庭套餐'
      },
      {
        id: 4,
        name: '黄金薯条大份',
        price: 18.00,
        image: '/images/food1.png',
        sales: 156,
        category: '小吃'
      },
      {
        id: 5,
        name: '冰淇淋圣代',
        price: 12.00,
        image: '/images/food1.png',
        sales: 88,
        category: '甜品'
      }
    ],
    categories: ['全部', '热销套餐', '家庭套餐', '小吃', '甜品', '饮料'],
    currentCategory: '全部'
  },

  onLoad: function(options) {
    // 页面加载时执行的逻辑
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  // 切换商品分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
  },

  // 跳转到商品详情页
  navigateToDetail: function(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shop/goods/detail?id=${goodsId}`
    });
  },

  // 添加商品
  addGoods: function() {
    wx.navigateTo({
      url: '/pages/shop/goods/add'
    });
  }
}); 