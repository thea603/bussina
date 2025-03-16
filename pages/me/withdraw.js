Page({
  data: {
    balance: '6000.80',
    totalWithdrawn: '29387',
    currentPeriod: '2024-07',
    records: [
      { id: 1, type: '实名认证赠送', date: '2020-05-12', time: '11:09:00', amount: '0.05' },
      { id: 2, type: '实名认证赠送', date: '2020-05-12', time: '11:09:00', amount: '0.05' },
      { id: 3, type: '实名认证赠送', date: '2020-05-12', time: '11:09:00', amount: '0.05' },
      { id: 4, type: '实名认证赠送', date: '2020-05-12', time: '11:09:00', amount: '0.05' },
      { id: 5, type: '实名认证赠送', date: '2020-05-12', time: '11:09:00', amount: '0.05' }
    ]
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '提现'
    });
  },

  // 提现操作
  handleWithdraw: function() {
    wx.navigateTo({
      url: '/pages/me/withdraw-confirm?balance=100'
    });
  },

  // 选择账单周期
  selectPeriod: function() {
    // 获取当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 设置日期选择器的初始值和范围
    wx.showDatePicker({
      mode: 'date',
      format: 'yyyy-MM',
      currentDate: this.data.currentPeriod.replace('-', '/'),
      startDate: (year - 2) + '/' + month, // 从两年前开始
      endDate: year + '/' + month, // 到当前月份结束
      success: (res) => {
        if (res.date) {
          // 将日期格式化为 yyyy-MM
          const date = new Date(res.date);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const formattedDate = `${year}-${month}`;
          
          this.setData({
            currentPeriod: formattedDate
          });
        }
      }
    });
  },

  // 日期选择器变化事件
  onDateChange: function(e) {
    this.setData({
      currentPeriod: e.detail.value
    });
    
    // 这里可以添加根据选择的日期加载对应账单数据的逻辑
    console.log('选择的日期:', e.detail.value);
    
    // 模拟加载数据
    wx.showLoading({
      title: '加载中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
      // 这里可以根据选择的日期更新账单数据
    }, 500);
  }
}) 