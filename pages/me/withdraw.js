const api = require('../../utils/api');

Page({
  data: {
    balance: '6000.80',
    totalWithdrawn: '29387',
    currentPeriod: '2024-07',
    records: [],
    page: 1,
    pageSize: 10,
    hasMoreData: true,
    isLoading: false
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '提现'
    });
    this.loadWithdrawalList();
  },

  // 提现操作
  handleWithdraw: function() {
    wx.navigateTo({
      url: '/pages/me/withdraw-confirm?balance=100'
    });
  },

  // 格式化状态
  formatStatus: function(status) {
    const statusMap = {
      0: '待审核',
      1: '已通过',
      2: '已完成',
      3: '已拒绝'
    };
    return statusMap[status] || '未知状态';
  },

  // 格式化时间
  formatDateTime: function(dateTimeStr) {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  },

  // 加载提现列表数据
  loadWithdrawalList: function(isLoadMore = false) {
    if (this.data.isLoading || (!isLoadMore && !this.data.hasMoreData)) {
      return;
    }

    this.setData({ isLoading: true });

    const userId = wx.getStorageSync('userId');
    if (!userId) {
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }

    // 构建请求参数
    const params = {
      page: isLoadMore ? this.data.page : 1,
      pageSize: this.data.pageSize,
      userId: userId,
      startDate: this.data.currentPeriod + '-01',
      endDate: this.data.currentPeriod + '-01'
    };

    // 调用API
    api.withdrawals.getList(params)
      .then(res => {
        if (res.code === 0) {
          // 处理数据
          const newRecords = (res.list || []).map(item => {
            const dateTime = this.formatDateTime(item.createdAt);
            return {
              id: item.id,
              type: this.formatStatus(item.status),
              amount: item.amount,
              date: dateTime.date,
              time: dateTime.time,
              status: item.status,
              reason: item.reason
            };
          });

          this.setData({
            records: isLoadMore ? [...this.data.records, ...newRecords] : newRecords,
            hasMoreData: res.total > (isLoadMore ? this.data.records.length + newRecords.length : newRecords.length),
            page: isLoadMore ? this.data.page + 1 : 2
          });
        }
      })
      .catch(err => {
        console.error('加载提现列表失败:', err);
      })
      .finally(() => {
        this.setData({ isLoading: false });
        wx.stopPullDownRefresh();
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
      currentPeriod: e.detail.value,
      page: 1,
      records: [],
      hasMoreData: true
    }, () => {
      this.loadWithdrawalList();
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      records: [],
      hasMoreData: true
    }, () => {
      this.loadWithdrawalList();
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMoreData && !this.data.isLoading) {
      this.loadWithdrawalList(true);
    }
  }
}) 