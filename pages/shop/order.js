// pages/shop/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    tabActive: 0,
    tabs: ['全部', '待付款', '待发货', '已发货', '已完成']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '订单管理'
    });
    
    // 模拟加载订单数据
    this.loadOrderData();
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

  // 切换标签页
  changeTab: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      tabActive: index
    });
    this.loadOrderData(index);
  },

  // 加载订单数据
  loadOrderData: function(tabIndex = 0) {
    // 模拟订单数据
    const mockOrders = [
      {
        id: '202311250001',
        status: '待付款',
        statusCode: 1,
        createTime: '2023-11-25 14:30',
        customer: '张三',
        phone: '138****1234',
        products: [
          { name: '商品1', price: 29.9, quantity: 2, image: '/images/food1.png' }
        ],
        totalAmount: 59.8
      },
      {
        id: '202311240002',
        status: '待发货',
        statusCode: 2,
        createTime: '2023-11-24 10:15',
        customer: '李四',
        phone: '139****5678',
        products: [
          { name: '商品2', price: 39.9, quantity: 1, image: '/images/food1.png' },
          { name: '商品3', price: 19.9, quantity: 3, image: '/images/food1.png' }
        ],
        totalAmount: 99.6
      },
      {
        id: '202311230003',
        status: '已发货',
        statusCode: 3,
        createTime: '2023-11-23 16:45',
        customer: '王五',
        phone: '137****9012',
        products: [
          { name: '商品4', price: 49.9, quantity: 1, image: '/images/food1.png' }
        ],
        totalAmount: 49.9
      },
      {
        id: '202311220004',
        status: '已完成',
        statusCode: 4,
        createTime: '2023-11-22 09:20',
        customer: '赵六',
        phone: '136****3456',
        products: [
          { name: '商品5', price: 59.9, quantity: 2, image: '/images/food1.png' },
          { name: '商品6', price: 29.9, quantity: 1, image: '/images/food1.png' }
        ],
        totalAmount: 149.7
      }
    ];
    
    // 根据标签筛选订单
    let filteredOrders = mockOrders;
    if (tabIndex > 0) {
      filteredOrders = mockOrders.filter(order => order.statusCode === tabIndex);
    }
    
    this.setData({
      orderList: filteredOrders
    });
  },
  
  // 查看订单详情
  viewOrderDetail: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shop/order-detail?id=${orderId}`
    });
  }
})