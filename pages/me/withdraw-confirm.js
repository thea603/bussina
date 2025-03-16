Page({
  data: {
    balance: 100.00,
    maxWithdraw: 1000.00,
    withdrawAmount: '',
    feeRate: 0.20, // 20%的手续费
    paymentMethod: '微信',
    showError: false,
    errorMsg: '',
    buttonActive: false, // 新增：按钮激活状态
    showSuccessPopup: false // 是否显示成功弹窗
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '提现确认'
    });
    
    // 如果有传入的余额参数，则使用传入的值
    if (options.balance) {
      this.setData({
        balance: parseFloat(options.balance)
      });
    } else {
      // 如果没有传入余额参数，使用默认值100
      this.setData({
        balance: 100.00
      });
    }
  },
  
  // 输入金额变化
  onAmountInput: function(e) {
    const amount = e.detail.value;
    
    // 清除之前的错误提示
    this.setData({
      withdrawAmount: amount,
      showError: false,
      errorMsg: ''
    });
    
    // 检查输入金额是否超过可提现余额
    if (amount && parseFloat(amount) > this.data.balance) {
      this.setData({
        showError: true,
        errorMsg: '提现金额不能超过可提现余额',
        buttonActive: false // 金额无效，按钮不激活
      });
    } else if (amount && parseFloat(amount) > 0) {
      // 金额有效，激活按钮
      this.setData({
        buttonActive: true
      });
    } else {
      // 金额为空或为0，按钮不激活
      this.setData({
        buttonActive: false
      });
    }
  },
  
  // 点击全部提现
  withdrawAll: function() {
    this.setData({
      withdrawAmount: this.data.balance.toFixed(2),
      showError: false,
      errorMsg: '',
      buttonActive: true // 全部提现时激活按钮
    });
  },
  
  // 确认提现
  confirmWithdraw: function() {
    // 检查是否输入了金额
    if (!this.data.withdrawAmount) {
      this.setData({
        showError: true,
        errorMsg: '请输入提现金额'
      });
      return;
    }
    
    // 检查金额是否有效
    const amount = parseFloat(this.data.withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      this.setData({
        showError: true,
        errorMsg: '请输入有效的提现金额'
      });
      return;
    }
    
    // 检查是否超过可提现余额
    if (amount > this.data.balance) {
      this.setData({
        showError: true,
        errorMsg: '提现金额不能超过可提现余额'
      });
      return;
    }
    
    // 显示提现中的加载提示
    wx.showLoading({
      title: '提现处理中...',
    });
    
    // 模拟提现操作
    setTimeout(() => {
      wx.hideLoading();
      
      // 显示成功弹窗
      this.setData({
        showSuccessPopup: true
      });
    }, 1500);
  },

  // 返回首页
  navigateBack: function() {
    // 使用switchTab跳转到tabBar页面
    wx.switchTab({
      url: '/pages/productindex/index'
    });
  }
}) 