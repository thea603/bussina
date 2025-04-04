Page({
  data: {
    order: {}, // 订单详情
    showRejectModal: false, // 是否显示拒绝退款弹窗
    rejectReason: '', // 拒绝退款理由
    showConfirmModal: false, // 是否显示确认弹窗
    modalTitle: '', // 弹窗标题
    modalMessage: '', // 弹窗消息
    loading: true // 加载状态
  },

  onLoad: function(options) {
    // 获取订单ID
    const orderId = options.id;
    console.log('订单ID:', orderId);
    
    // 通过API请求获取订单详情
    this.getOrderDetail(orderId);
  },
  
  // 获取订单详情
  getOrderDetail: function(orderId) {
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
    });
    
    const api = require('../../utils/api');
    
    // 调用API获取订单详情
    api.order.getOrderDetail(orderId)
      .then(res => {
        console.log('订单详情响应:', res);
        
        if (res.code === 200 && res.data) {
          this.setData({
            order: res.data,
            loading: false
          });
        } else {
          wx.showToast({
            title: '获取订单失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取订单详情失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
    this.setData({
          loading: false
        });
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
    
    const api = require('../../utils/api');
    const orderId = this.data.order.id;
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 调用拒绝退款API
    api.order.processRefund(orderId, 'reject', this.data.rejectReason)
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '已拒绝退款',
            icon: 'success'
          });
          // 刷新订单状态
          return this.getOrderDetail(orderId);
        } else {
          wx.showToast({
            title: res.message || '操作失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('拒绝退款失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
        this.setData({
          showRejectModal: false,
          rejectReason: ''
        });
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
    const api = require('../../utils/api');
    const orderId = this.data.order.id;
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 调用同意退款API
    api.order.processRefund(orderId, 'approve')
      .then(res => {
        if (res.code === 200) {
          wx.showToast({
            title: '退款成功',
            icon: 'success'
          });
          // 刷新订单状态
          return this.getOrderDetail(orderId);
        } else {
          wx.showToast({
            title: res.message || '操作失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('同意退款失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
        this.setData({
          showConfirmModal: false
        });
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