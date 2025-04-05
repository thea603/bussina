const api = require('../../utils/api');

Page({
  data: {
    balance: '6000.80',
    totalWithdrawn: '29387',
    currentPeriod: '', // 初始为空，将在onLoad中设置为当前年月日(格式为YYYY-MM-DD)
    displayDate: '', // 用于显示的格式化日期(格式为YYYY年MM月DD日)
    maxDate: '', // 日期选择器最大日期
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
    
    // 获取当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // 设置当前日期和最大日期
    const currentPeriod = `${year}-${month}-${day}`;
    const maxDate = currentPeriod; // 设置日期选择器的最大日期为当前日期
    const displayDate = `${year}年${month}月${day}日`;
    
    this.setData({
      currentPeriod: currentPeriod,
      maxDate: maxDate,
      displayDate: displayDate
    }, () => {
      this.loadWithdrawalList();
    });
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

    // 构建请求参数，使用完整日期
    const params = {
      page: isLoadMore ? this.data.page : 1,
      pageSize: this.data.pageSize,
      userId: userId,
      startDate: this.data.currentPeriod,
      endDate: this.data.currentPeriod
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

  // 日期选择器变化事件
  onDateChange: function(e) {
    const selectedDate = e.detail.value; // 格式为 YYYY-MM-DD
    
    // 将日期格式化为显示格式
    const dateParts = selectedDate.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const displayDate = `${year}年${month}月${day}日`;
    
    this.setData({
      currentPeriod: selectedDate,
      displayDate: displayDate,
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