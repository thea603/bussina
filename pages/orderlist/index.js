Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    searchValue: '', // 搜索框的值
    activeTab: 0, // 当前激活的标签页，0: 全部, 1: 待核销, 2: 待退款, 3: 已完成
    isAscending: false, // 排序方式，默认为降序
    orders: [
      {
        id: '1223226410352',
        customerPhone: '153****2424',
        productName: '沪上阿姨鲜果茶系列超大杯草莓奶茶',
        validUntil: '2024-08-10',
        amount: 20.4,
        status: 2, // 0: 已完成, 1: 待核销, 2: 待退款
        orderTime: '1223'
      },
      {
        id: '1223226410353',
        customerPhone: '186****5678',
        productName: '喜茶多肉葡萄冰沙中杯',
        validUntil: '2024-09-15',
        amount: 18.5,
        status: 1, // 待核销
        orderTime: '1045'
      },
      {
        id: '1223226410354',
        customerPhone: '137****9012',
        productName: '星巴克焦糖玛奇朵大杯',
        validUntil: '2024-07-30',
        amount: 15.8,
        status: 0, // 已完成
        orderTime: '0930'
      },
      {
        id: '1223226410355',
        customerPhone: '159****3456',
        productName: '奈雪的茶芝芝莓莓大杯',
        validUntil: '2024-08-20',
        amount: 22.5,
        status: 2, // 待退款
        orderTime: '1430'
      },
      {
        id: '1223226410356',
        customerPhone: '138****7890',
        productName: 'COCO都可珍珠奶茶大杯',
        validUntil: '2024-08-25',
        amount: 16.8,
        status: 1, // 待核销
        orderTime: '1530'
      },
      {
        id: '1223226410357',
        customerPhone: '177****1234',
        productName: '一点点波霸奶茶中杯',
        validUntil: '2024-09-05',
        amount: 17.5,
        status: 0, // 已完成
        orderTime: '0845'
      },
      // 添加更多订单数据用于测试上拉加载
      {
        id: '1223226410358',
        customerPhone: '139****4567',
        productName: '蜜雪冰城柠檬水特大杯',
        validUntil: '2024-08-15',
        amount: 8.5,
        status: 1, // 待核销
        orderTime: '1115'
      },
      {
        id: '1223226410359',
        customerPhone: '158****8901',
        productName: '书亦烧仙草黑糖波波奶茶',
        validUntil: '2024-08-18',
        amount: 13.9,
        status: 0, // 已完成
        orderTime: '1320'
      },
      {
        id: '1223226410360',
        customerPhone: '187****2345',
        productName: '茶百道芝士奶盖茉莉茶',
        validUntil: '2024-08-22',
        amount: 15.0,
        status: 2, // 待退款
        orderTime: '1625'
      },
      {
        id: '1223226410361',
        customerPhone: '136****6789',
        productName: '古茗芋泥波波奶茶大杯',
        validUntil: '2024-08-28',
        amount: 16.9,
        status: 1, // 待核销
        orderTime: '0910'
      },
      {
        id: '1223226410362',
        customerPhone: '151****0123',
        productName: '贡茶黑糖珍珠鲜奶',
        validUntil: '2024-09-01',
        amount: 14.5,
        status: 0, // 已完成
        orderTime: '1150'
      },
      {
        id: '1223226410363',
        customerPhone: '182****4567',
        productName: '益禾堂招牌奶茶特大杯',
        validUntil: '2024-09-03',
        amount: 12.8,
        status: 2, // 待退款
        orderTime: '1410'
      },
      {
        id: '1223226410364',
        customerPhone: '135****8901',
        productName: '鹿角巷黑糖鹿丸鲜奶',
        validUntil: '2024-09-08',
        amount: 19.9,
        status: 1, // 待核销
        orderTime: '1545'
      },
      {
        id: '1223226410365',
        customerPhone: '156****2345',
        productName: '乐乐茶脏脏奶茶中杯',
        validUntil: '2024-09-10',
        amount: 21.0,
        status: 0, // 已完成
        orderTime: '0830'
      },
      {
        id: '1223226410366',
        customerPhone: '189****6789',
        productName: '霸王茶姬芝士奶盖茶',
        validUntil: '2024-09-12',
        amount: 18.0,
        status: 2, // 待退款
        orderTime: '1240'
      },
      {
        id: '1223226410367',
        customerPhone: '133****0123',
        productName: '茶颜悦色幽兰拿铁',
        validUntil: '2024-09-18',
        amount: 23.0,
        status: 1, // 待核销
        orderTime: '1650'
      },
      {
        id: '1223226410368',
        customerPhone: '155****4567',
        productName: '快乐柠檬超级水果茶',
        validUntil: '2024-09-20',
        amount: 17.8,
        status: 0, // 已完成
        orderTime: '0950'
      },
      {
        id: '1223226410369',
        customerPhone: '188****8901',
        productName: '丸摩堂烤黑糖波波奶',
        validUntil: '2024-09-22',
        amount: 19.5,
        status: 2, // 待退款
        orderTime: '1330'
      },
      {
        id: '1223226410370',
        customerPhone: '132****2345',
        productName: '答案茶桂花乌龙奶茶',
        validUntil: '2024-09-25',
        amount: 16.0,
        status: 1, // 待核销
        orderTime: '1520'
      },
      {
        id: '1223226410371',
        customerPhone: '157****6789',
        productName: '蜡笔小新奶茶店草莓奶昔',
        validUntil: '2024-09-28',
        amount: 24.5,
        status: 0, // 已完成
        orderTime: '1010'
      },
      {
        id: '1223226410372',
        customerPhone: '185****0123',
        productName: '甘茶度芝士奶盖绿茶',
        validUntil: '2024-10-01',
        amount: 15.5,
        status: 2, // 待退款
        orderTime: '1350'
      },
      {
        id: '1223226410373',
        customerPhone: '131****4567',
        productName: '米芝莲港式奶茶',
        validUntil: '2024-10-05',
        amount: 13.0,
        status: 1, // 待核销
        orderTime: '1610'
      },
      {
        id: '1223226410374',
        customerPhone: '152****8901',
        productName: '一只酸奶牛原味酸奶',
        validUntil: '2024-10-08',
        amount: 12.0,
        status: 0, // 已完成
        orderTime: '0920'
      },
      {
        id: '1223226410375',
        customerPhone: '183****2345',
        productName: '七分甜多肉葡萄',
        validUntil: '2024-10-10',
        amount: 20.0,
        status: 2, // 待退款
        orderTime: '1420'
      },
      {
        id: '1223226410376',
        customerPhone: '138****6789',
        productName: '茶百道芒果冰沙',
        validUntil: '2024-10-12',
        amount: 18.8,
        status: 1, // 待核销
        orderTime: '1550'
      },
      {
        id: '1223226410377',
        customerPhone: '159****0123',
        productName: '沪上阿姨招牌奶绿',
        validUntil: '2024-10-15',
        amount: 14.9,
        status: 0, // 已完成
        orderTime: '1030'
      },
      {
        id: '1223226410378',
        customerPhone: '186****4567',
        productName: '喜茶满杯红柚',
        validUntil: '2024-10-18',
        amount: 25.0,
        status: 2, // 待退款
        orderTime: '1440'
      },
      {
        id: '1223226410379',
        customerPhone: '137****8901',
        productName: '星巴克拿铁咖啡',
        validUntil: '2024-10-20',
        amount: 32.0,
        status: 1, // 待核销
        orderTime: '1620'
      },
      {
        id: '1223226410380',
        customerPhone: '150****2345',
        productName: '奈雪的茶牛乳茉香',
        validUntil: '2024-10-22',
        amount: 26.0,
        status: 0, // 已完成
        orderTime: '0940'
      },
      {
        id: '1223226410381',
        customerPhone: '181****6789',
        productName: 'COCO都可红豆奶茶',
        validUntil: '2024-10-25',
        amount: 17.0,
        status: 2, // 待退款
        orderTime: '1310'
      },
      {
        id: '1223226410382',
        customerPhone: '134****0123',
        productName: '一点点珍珠奶茶',
        validUntil: '2024-10-28',
        amount: 15.0,
        status: 1, // 待核销
        orderTime: '1540'
      },
      {
        id: '1223226410383',
        customerPhone: '153****4567',
        productName: '蜜雪冰城芒果冰淇淋',
        validUntil: '2024-10-30',
        amount: 7.5,
        status: 0, // 已完成
        orderTime: '1050'
      },
      {
        id: '1223226410384',
        customerPhone: '187****8901',
        productName: '书亦烧仙草奶茶',
        validUntil: '2024-11-02',
        amount: 13.0,
        status: 2, // 待退款
        orderTime: '1450'
      },
      {
        id: '1223226410385',
        customerPhone: '136****2345',
        productName: '茶百道四季春茶',
        validUntil: '2024-11-05',
        amount: 12.0,
        status: 1, // 待核销
        orderTime: '1630'
      },
      {
        id: '1223226410386',
        customerPhone: '151****6789',
        productName: '古茗黑糖波波奶茶',
        validUntil: '2024-11-08',
        amount: 16.0,
        status: 0, // 已完成
        orderTime: '1000'
      },
      {
        id: '1223226410387',
        customerPhone: '182****0123',
        productName: '贡茶抹茶奶盖',
        validUntil: '2024-11-10',
        amount: 18.0,
        status: 2, // 待退款
        orderTime: '1340'
      },
      {
        id: '1223226410388',
        customerPhone: '135****4567',
        productName: '益禾堂芋泥波波奶茶',
        validUntil: '2024-11-12',
        amount: 17.0,
        status: 1, // 待核销
        orderTime: '1600'
      },
      {
        id: '1223226410389',
        customerPhone: '156****8901',
        productName: '鹿角巷奶茶三兄弟',
        validUntil: '2024-11-15',
        amount: 22.0,
        status: 0, // 已完成
        orderTime: '0900'
      },
      {
        id: '1223226410390',
        customerPhone: '189****2345',
        productName: '乐乐茶芝士奶盖茶',
        validUntil: '2024-11-18',
        amount: 23.0,
        status: 2, // 待退款
        orderTime: '1250'
      }
    ],
    filteredOrders: [], // 筛选后的订单
    displayOrders: [], // 当前显示的订单（分页后）
    pageSize: 10, // 每页显示的数据条数
    currentPage: 1, // 当前页码
    hasMoreData: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载数据
    showConfirmModal: false, // 是否显示确认弹窗
    showRejectModal: false, // 是否显示拒绝退款弹窗
    rejectReason: '', // 拒绝退款理由
    currentOrderId: null, // 当前操作的订单ID
    currentAction: null, // 当前操作类型：'agree' 或 'reject'
    modalTitle: '', // 弹窗标题
    modalMessage: '' // 弹窗消息
  },

  onLoad: function(options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      filteredOrders: this.data.orders // 初始化 filteredOrders
    });
    
    console.log('页面加载完成，初始化数据');
    
    // 初始化时进行一次筛选和排序
    this.filterOrdersByTab(this.data.activeTab);
    this.sortOrders();
    
    // 初始化分页数据
    this.loadPageData(true);
  },

  onShow: function() {
    console.log('页面显示，当前排序方式：', this.data.isAscending ? '升序' : '降序');
    // 页面显示时重新排序，确保数据是最新的
    this.sortOrders();
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 监听页面上拉触底事件
  onReachBottom: function() {
    console.log('触发上拉加载更多...');
    if (this.data.hasMoreData && !this.data.isLoading) {
      this.loadMoreData();
    }
  },
  
  // 加载分页数据
  loadPageData: function(reset = false) {
    if (reset) {
      // 重置分页参数
      this.setData({
        currentPage: 1,
        hasMoreData: true,
        displayOrders: []
      });
    }
    
    // 如果没有更多数据或正在加载，则直接返回
    if (!this.data.hasMoreData || this.data.isLoading) {
      return;
    }
    
    // 标记为正在加载
    this.setData({
      isLoading: true
    });
    
    // 计算分页数据
    const { currentPage, pageSize, filteredOrders } = this.data;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // 获取当前页的数据
    const currentPageData = filteredOrders.slice(startIndex, endIndex);
    
    // 判断是否还有更多数据
    const hasMore = endIndex < filteredOrders.length;
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 更新数据
      this.setData({
        displayOrders: [...this.data.displayOrders, ...currentPageData],
        currentPage: currentPage + 1,
        hasMoreData: hasMore,
        isLoading: false
      });
      
      console.log(`加载第${currentPage}页数据完成，共${currentPageData.length}条，是否还有更多：${hasMore}`);
    }, 500);
  },
  
  // 加载更多数据
  loadMoreData: function() {
    this.loadPageData();
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  // 搜索确认
  onSearchConfirm: function(e) {
    const value = e.detail.value;
    console.log('搜索:', value);
    
    // 根据搜索值筛选订单
    if (value) {
      const filteredOrders = this.data.orders.filter(item => 
        item.productName.includes(value) || 
        item.id.includes(value) || 
        item.customerPhone.includes(value)
      );
      this.setData({
        filteredOrders: filteredOrders
      });
    } else {
      // 如果搜索值为空，则恢复按标签筛选
      this.filterOrdersByTab(this.data.activeTab);
    }
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 切换标签页
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index
    });
    
    // 根据标签筛选订单
    this.filterOrdersByTab(index);
    
    // 重新加载第一页数据
    this.loadPageData(true);
  },

  // 根据标签筛选订单
  filterOrdersByTab: function(tabIndex) {
    // 获取所有订单
    const allOrders = this.data.orders;
    
    // 根据标签筛选
    let filteredOrders = allOrders;
    if (tabIndex === 0) {
      // 全部：不筛选
      filteredOrders = allOrders;
    } else if (tabIndex === 1) {
      // 待核销：状态为1
      filteredOrders = allOrders.filter(item => item.status === 1);
    } else if (tabIndex === 2) {
      // 待退款：状态为2
      filteredOrders = allOrders.filter(item => item.status === 2);
    } else if (tabIndex === 3) {
      // 已完成：状态为0
      filteredOrders = allOrders.filter(item => item.status === 0);
    }
    
    this.setData({
      filteredOrders: filteredOrders
    });
    
    // 筛选后进行排序
    this.sortOrders();
  },

  // 切换排序方式
  toggleSortOrder: function() {
    console.log('排序按钮被点击，当前排序方式：', this.data.isAscending ? '升序' : '降序');
    
    // 切换排序方式
    const newIsAscending = !this.data.isAscending;
    
    this.setData({
      isAscending: newIsAscending
    }, () => {
      // 在回调函数中执行排序，确保状态已更新
      console.log('排序方式已切换为：', this.data.isAscending ? '升序' : '降序');
      this.sortOrders();
      
      // 重新加载第一页数据
      this.loadPageData(true);
    });
  },
  
  // 排序订单
  sortOrders: function() {
    console.log('开始排序订单...');
    const isAscending = this.data.isAscending;
    const filteredOrders = [...this.data.filteredOrders];
    
    console.log('排序前的订单：', filteredOrders.map(item => item.orderTime));
    
    // 根据订单时间排序
    filteredOrders.sort((a, b) => {
      // 将时间字符串转换为数字进行比较
      const timeA = parseInt(a.orderTime);
      const timeB = parseInt(b.orderTime);
      
      if (isAscending) {
        return timeA - timeB; // 升序：从早到晚
      } else {
        return timeB - timeA; // 降序：从晚到早
      }
    });
    
    console.log('排序后的订单：', filteredOrders.map(item => item.orderTime));
    
    // 使用setData更新数据，触发视图更新
    this.setData({
      filteredOrders: filteredOrders
    }, () => {
      console.log('订单排序完成，数据已更新');
    });
  },

  // 同意退款
  agreeRefund: function(e) {
    const orderId = e.currentTarget.dataset.id;
    console.log('同意退款:', orderId);
    
    this.setData({
      showConfirmModal: true,
      currentOrderId: orderId,
      currentAction: 'agree',
      modalTitle: '确认退款',
      modalMessage: '确定要同意此订单的退款申请吗？'
    });
  },

  // 拒绝退款
  rejectRefund: function(e) {
    const orderId = e.currentTarget.dataset.id;
    console.log('拒绝退款:', orderId);
    console.log('当前状态:', this.data.showRejectModal);
    
    this.setData({
      showRejectModal: true,
      currentOrderId: orderId,
      rejectReason: ''
    });
    
    console.log('设置后状态:', this.data.showRejectModal);
  },

  // 确认操作
  confirmAction: function() {
    const orderId = this.data.currentOrderId;
    const action = this.data.currentAction;
    
    // 更新订单状态
    const orders = this.data.orders.map(item => {
      if (item.id === orderId) {
        return {
          ...item,
          status: action === 'agree' ? 0 : 1 // 同意退款：已完成，拒绝退款：待核销
        };
      }
      return item;
    });
    
    this.setData({
      orders: orders,
      showConfirmModal: false,
      currentOrderId: null,
      currentAction: null
    });
    
    // 重新筛选订单
    this.filterOrdersByTab(this.data.activeTab);
    
    // 显示成功提示
    wx.showToast({
      title: action === 'agree' ? '退款成功' : '已拒绝退款',
      icon: 'success'
    });
  },
  
  // 取消操作
  cancelAction: function() {
    this.setData({
      showConfirmModal: false,
      currentOrderId: null,
      currentAction: null
    });
  },

  // 拨打电话
  callCustomer: function(e) {
    const phone = e.currentTarget.dataset.phone;
    console.log('拨打电话:', phone);
    
    // 去掉电话号码中的星号，获取完整电话号码
    const fullPhone = phone.replace(/\*/g, '');
    
    wx.makePhoneCall({
      phoneNumber: fullPhone
    });
  },

  // 扫码核销
  verifyOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    console.log('扫码核销:', orderId);
    
    // 使用微信扫码API
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

  // 跳转到订单详情页
  goToOrderDetail: function(e) {
    const orderId = e.currentTarget.dataset.id;
    const orderStatus = e.currentTarget.dataset.status;
    console.log('跳转到订单详情:', orderId);
    
    wx.navigateTo({
      url: '/pages/orderlist/detail?id=' + orderId + '&status=' + orderStatus
    });
  },

  // 拒绝理由输入
  onReasonInput: function(e) {
    this.setData({
      rejectReason: e.detail.value
    });
  },
  
  // 取消拒绝退款
  cancelReject: function() {
    this.setData({
      showRejectModal: false,
      rejectReason: '',
      currentOrderId: null
    });
  },
  
  // 确认拒绝退款
  confirmReject: function() {
    if (!this.data.rejectReason.trim()) {
      wx.showToast({
        title: '请输入拒绝理由',
        icon: 'none'
      });
      return;
    }
    
    console.log('拒绝退款理由:', this.data.rejectReason);
    
    // 更新订单状态
    const orderId = this.data.currentOrderId;
    const orders = this.data.orders.map(item => {
      if (item.id === orderId) {
        return {
          ...item,
          status: 1 // 更新为待核销状态
        };
      }
      return item;
    });
    
    this.setData({
      orders: orders,
      showRejectModal: false,
      rejectReason: '',
      currentOrderId: null
    });
    
    // 重新筛选订单
    this.filterOrdersByTab(this.data.activeTab);
    
    // 显示成功提示
    wx.showToast({
      title: '已拒绝退款',
      icon: 'success'
    });
  }
}); 