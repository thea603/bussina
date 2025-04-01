const api = require('../../utils/api');

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
    showSuccessPopup: false, // 是否显示成功弹窗
    url: 'https://xy.ziyuebook.com' // API基础URL
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
    
    // 从本地存储获取openid
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.hideLoading();
      wx.showToast({
        title: '未找到用户信息，请重新登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 转换金额为分（微信支付单位）
    const amountInCents = Math.floor(amount * 100);

    wx.request({
      url: `${this.data.url}/api/v1/wechat/createTransfer`,
      method: 'POST',
      data: {
        amount: amountInCents,  // 使用实际金额，单位分
        openid: openid,
        desc: '商户提现',
        type: "business"
      },
      success: (res) => {
        console.log('商家转账请求返回数据:', res.data);
        wx.hideLoading();

        if (res.data) {
          wx.requestMerchantTransfer({
            appId: wx.getAccountInfoSync().miniProgram.appId,
            mchId: '1700852077',
            package: res.data.package_info,
            success: (transferRes) => {
              console.log('转账成功:', transferRes);
              wx.showToast({
                title: '转账成功',
                icon: 'success',
                duration: 2000
              });
              
              // 显示成功弹窗
              this.setData({
                showSuccessPopup: true
              });
            },
            fail: (err) => {
              console.error('转账失败:', err);
              wx.showToast({
                title: '转账失败',
                icon: 'error',
                duration: 2000
              });
            }
          });
        } else {
          console.log('转账请求异常:', res.statusCode, res.data);
          wx.showToast({
            title: res.data && res.data.message ? res.data.message : '转账申请失败',
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.log('转账请求失败:', err);
        wx.showToast({
          title: '转账请求失败，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  // 返回首页
  navigateBack: function() {
    // 使用switchTab跳转到tabBar页面
    wx.switchTab({
      url: '/pages/productindex/index'
    });
  }
}) 