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

    // 构建请求参数
    const params = {
      createdAt: this.data.currentPeriod,  // 使用日期选择器选中的日期，参数名改为createdAt
      page: this.data.page,
      pageSize: this.data.pageSize
    };

    console.log('请求提现列表参数:', params);

    // 调用API - 使用封装好的接口方法
    api.withdrawals.getMyList(params)
      .then(res => {
        // 新的响应格式：res.code 为 200, 数据在 res.data 中
        if (res.code === 0 || res.code === 200) {
          // 从res.data中获取列表数据
          const responseData = res.data || {};
          const list = responseData.list || [];
          
          // 处理数据
          const newRecords = list.map(item => {
            // 创建时间已经是格式化后的日期字符串，需要解析为标准格式
            const createdAtParts = this.parseChineseDate(item.createdAt);
            
            return {
              id: item.id,
              type: this.formatStatus(item.status),
              amount: item.amount,
              date: createdAtParts.date,
              time: createdAtParts.time || '00:00', // 如果没有时间部分，使用默认值
              status: item.status,
              reason: item.reason
            };
          });

          // 处理分页逻辑
          const total = responseData.total || 0;
          const hasMoreData = this.data.page * this.data.pageSize < total;
          let currentRecords = [];
          
          if (isLoadMore) {
            // 加载更多时，将新数据添加到现有数据后面
            currentRecords = this.data.records.concat(newRecords);
          } else {
            // 首次加载或刷新时，直接使用新数据
            currentRecords = newRecords;
          }

          this.setData({
            records: currentRecords,
            hasMoreData: hasMoreData,
            isLoading: false
          });
        } else {
          console.error('获取提现列表响应错误:', res);
          wx.showToast({
            title: res.message || '获取提现记录失败',
            icon: 'none',
            duration: 2000
          });
          this.setData({ isLoading: false });
        }
      })
      .catch(err => {
        console.error('加载提现列表失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
        this.setData({ isLoading: false });
      });
  },
  
  // 解析中文格式的日期（例如："2025年04月05日"）
  parseChineseDate: function(chineseDate) {
    if (!chineseDate) return { date: '', time: '' };
    
    // 提取年月日
    const regex = /(\d{4})年(\d{2})月(\d{2})日/;
    const match = chineseDate.match(regex);
    
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      
      return {
        date: `${year}-${month}-${day}`,
        time: ''  // 中文格式的日期没有时间部分
      };
    }
    
    return { date: chineseDate, time: '' };
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
      wx.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom: function() {
    if (this.data.hasMoreData && !this.data.isLoading) {
      this.setData({
        page: this.data.page + 1
      }, () => {
        this.loadWithdrawalList(true);
      });
    }
  }
}) 