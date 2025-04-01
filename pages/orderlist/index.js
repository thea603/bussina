const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    searchValue: '', // 搜索框的值
    activeTab: 0, // 当前激活的标签页，0: 全部, 1: 待核销, 2: 待退款, 3: 已完成
    isAscending: false, // 排序方式，默认为降序
    displayOrders: [], // 当前显示的订单
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
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 初始化时获取订单列表
    this.fetchOrderList();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.refreshOrderList();
  },

  // 刷新订单列表
  refreshOrderList() {
    this.setData({
      currentPage: 1,
      displayOrders: [],
      hasMoreData: true
    }, () => {
      this.fetchOrderList();
    });
  },

  // 获取订单列表
  fetchOrderList: function(loadMore = false) {
    const shopId = wx.getStorageSync('shopId');
    if (!shopId) {
      wx.showToast({
        title: '获取店铺信息失败',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.isLoading) return;

    this.setData({ isLoading: true });

    // 构建请求参数
    const params = {
      page: loadMore ? this.data.currentPage : 1,
      limit: this.data.pageSize,
      shopId: shopId
    };

    // 如果不是"全部"标签，添加状态筛选
    if (this.data.activeTab !== 0) {
      params.status = this.getStatusByTab(this.data.activeTab);
    }

    // 使用 api 模块发送请求
    api.order.getOrderList(params)
      .then(res => {
        if (res.code === 200 && res.data) {
          const newOrders = res.data.items || [];
          const pagination = res.data.pagination || {};

      this.setData({
            displayOrders: loadMore ? [...this.data.displayOrders, ...newOrders] : newOrders,
            hasMoreData: this.data.currentPage < pagination.totalPages,
            currentPage: loadMore ? this.data.currentPage + 1 : 2
          });
          console.log(this.data.displayOrders,'this.data.displayOrders')
        } else {
          wx.showToast({
            title: '获取订单列表失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取订单列表失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  },

  // 根据标签获取状态值
  getStatusByTab: function(tabIndex) {
    switch(tabIndex) {
      case 1: return "1"; // 待核销
      case 2: return "2"; // 待退款
      case 3: return "0"; // 已完成
      default: return ""; // 全部
    }
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    });
  },

  // 搜索确认
  onSearchConfirm: function(e) {
      this.setData({
      searchValue: e.detail.value,
      currentPage: 1,
      displayOrders: []
    }, () => {
      this.fetchOrderList();
    });
  },

  // 切换标签页
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index,
      currentPage: 1,
      displayOrders: []
    }, () => {
      this.fetchOrderList();
    });
  },

  // 切换排序方式
  toggleSortOrder: function() {
    this.setData({
      isAscending: !this.data.isAscending,
      currentPage: 1,
      displayOrders: []
    }, () => {
      this.fetchOrderList();
    });
  },
  
  // 加载更多数据
  onReachBottom: function() {
    if (this.data.hasMoreData && !this.data.isLoading) {
      this.fetchOrderList(true);
    }
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
    
    // 显示加载提示
    wx.showLoading({
      title: '处理中...',
    });

    // 调用退款处理接口
    api.order.processRefund(orderId, 'approve')
      .then(res => {
        wx.hideLoading();
        // 更新订单状态
        const orders = this.data.displayOrders.map(item => {
          if (item.id === orderId) {
            return {
              ...item,
              status: 0 // 更新为已完成状态
            };
          }
          return item;
        });
        
        this.setData({
          displayOrders: orders,
          showConfirmModal: false,
          currentOrderId: null,
          currentAction: null
        });
        
        // 显示成功提示
        wx.showToast({
          title: '退款成功',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: err.message || '处理失败，请重试',
          icon: 'none'
        });
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
    
    const orderId = this.data.currentOrderId;
    
    // 显示加载提示
    wx.showLoading({
      title: '处理中...',
    });

    // 调用退款处理接口
    api.order.processRefund(orderId, 'reject', this.data.rejectReason)
      .then(res => {
        wx.hideLoading();
        // 更新订单状态
        const orders = this.data.displayOrders.map(item => {
          if (item.id === orderId) {
            return {
              ...item,
              status: 1 // 更新为待核销状态
            };
          }
          return item;
        });
        
        this.setData({
          displayOrders: orders,
          showRejectModal: false,
          rejectReason: '',
          currentOrderId: null
        });
        
        // 显示成功提示
        wx.showToast({
          title: '已拒绝退款',
          icon: 'success'
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: err.message || '处理失败，请重试',
          icon: 'none'
        });
      });
  }
}); 