Page({
  data: {
    order: {}, // 订单详情
    showRejectModal: false, // 是否显示拒绝退款弹窗
    rejectReason: '', // 拒绝退款理由
    showConfirmModal: false, // 是否显示确认弹窗
    modalTitle: '', // 弹窗标题
    modalMessage: '' // 弹窗消息
  },

  onLoad: function(options) {
    // 获取订单ID
    const orderId = options.id;
    console.log('订单ID:', orderId);
    
    // 模拟从服务器获取订单详情
    // 实际应用中，应该通过API请求获取订单详情
    this.getOrderDetail(orderId);
  },
  
  // 获取订单详情
  getOrderDetail: function(orderId) {
    console.log('原始订单ID:', orderId);
    console.log('解析后的订单ID:', parseInt(orderId));
    console.log('取模结果:', parseInt(orderId) % 3);
    
    // 模拟订单数据
    // 实际应用中，应该通过API请求获取订单详情
    const orderData = {
      id: orderId,
      customerPhone: '153****2424',
      productName: '位置一天【含调】单人下午茶套餐',
      shopName: '大娃四川味(温湖)',
      quantity: 'x1',
      spec: '300g',
      amount: 74,
      status: parseInt(orderId) % 3, // 根据订单ID动态设置状态，用于测试
      orderTime: '2024-07-07 16:08:08',
      payMethod: '微信',
      transactionId: '123456789012345678901234567890'
    };
    
    console.log('订单状态:', orderData.status);
    
    this.setData({
      order: orderData
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
  
  // 复制订单号
  copyOrderId: function() {
    wx.setClipboardData({
      data: this.data.order.id,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },
  
  // 显示拒绝退款弹窗
  showRejectModal: function() {
    this.setData({
      showRejectModal: true,
      rejectReason: ''
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
      rejectReason: ''
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
    const order = this.data.order;
    order.status = 1; // 更新为待核销状态
    
    this.setData({
      order: order,
      showRejectModal: false,
      rejectReason: ''
    });
    
    wx.showToast({
      title: '已拒绝退款',
      icon: 'success'
    });
  },
  
  // 同意退款
  agreeRefund: function() {
    this.setData({
      showConfirmModal: true,
      modalTitle: '确认退款',
      modalMessage: '确定要同意此订单的退款申请吗？'
    });
  },
  
  // 取消操作
  cancelAction: function() {
    this.setData({
      showConfirmModal: false
    });
  },
  
  // 确认操作
  confirmAction: function() {
    // 更新订单状态
    const order = this.data.order;
    order.status = 0; // 更新为已完成状态
    
    this.setData({
      order: order,
      showConfirmModal: false
    });
    
    wx.showToast({
      title: '退款成功',
      icon: 'success'
    });
  },
  
  // 扫码核销
  verifyOrder: function() {
    const orderId = this.data.order.id;
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
  }
}); 