// 引入API模块
const api = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 20, // 默认值，会在onLoad中获取实际高度
    searchValue: '', // 搜索框的值
    activeTab: 0, // 当前激活的标签页，0: 出售中, 1: 已售罄, 2: 已下架, 3: 审核中
    sortType: 0, // 排序类型，0: 商品排序, 1: 批量下架
    sortOrder: 'desc', // 排序方向，desc 为降序，asc 为升序
    isAllSelected: false, // 是否全选
    selectedProducts: [], // 已选择的商品ID数组
    products: [], // 存储的商品数据
    filteredProducts: [], // 筛选后的商品
    displayProducts: [], // 当前显示的商品（分页后）
    pageSize: 10, // 每页显示的数据条数
    currentPage: 1, // 当前页码
    hasMoreData: true, // 是否还有更多数据
    isLoading: false, // 是否正在加载数据
    showConfirmModal: false, // 是否显示确认弹窗
    currentProductId: null, // 当前操作的商品ID
    showStockModal: false, // 是否显示修改库存弹窗
    stockValue: '', // 修改库存的值
    currentAction: null, // 保存当前操作类型
    modalTitle: '', // 保存弹窗标题
    modalMessage: '', // 保存弹窗消息
    tabCounts: {
      onSale: 0,
      soldOut: 0,
      offShelf: 0,
      reviewing: 0
    },
    isLoadingMore: false, // 是否正在加载更多数据
    // 本地假数据
    mockProducts: [
      {
        id: 1,
        name: '时尚休闲连衣裙',
        price: 129.99,
        originalPrice: 199.99,
        stock: 50,
        sales: 120,
        image: 'https://img.alicdn.com/imgextra/i2/2023937117/O1CN01OPwXCD1e2AKWgmCeB_!!2023937117.jpg',
        status: 0, // 正常
        createTime: '2023-01-15T08:30:00Z'
      },
      {
        id: 2,
        name: '纯棉T恤 夏季清凉',
        price: 69.90,
        originalPrice: 99.00,
        stock: 5,
        sales: 200,
        image: 'https://img.alicdn.com/imgextra/i4/367651038/O1CN01WvpBxt1MkmWd3bBvq_!!367651038.jpg',
        status: 1, // 库存紧张
        createTime: '2023-02-10T15:45:00Z'
      },
      {
        id: 3,
        name: '运动休闲鞋',
        price: 199.00,
        originalPrice: 299.00,
        stock: 0,
        sales: 85,
        image: 'https://img.alicdn.com/imgextra/i3/2213972051683/O1CN01VYzovC235wJq1wYUg_!!2213972051683.jpg',
        status: 2, // 已售罄
        createTime: '2023-02-25T10:20:00Z'
      },
      {
        id: 4,
        name: '智能手表',
        price: 699.00,
        originalPrice: 999.00,
        stock: 25,
        sales: 60,
        image: 'https://img.alicdn.com/imgextra/i4/1714128138/O1CN01UzJJnR29zFlrKLXu7_!!1714128138.jpg',
        status: 3, // 已下架
        createTime: '2023-03-05T14:10:00Z'
      },
      {
        id: 5,
        name: '防晒霜 SPF50+',
        price: 89.00,
        originalPrice: 129.00,
        stock: 120,
        sales: 240,
        image: 'https://img.alicdn.com/imgextra/i1/2208417957783/O1CN01OkZ7oU1kN1zWAHDfM_!!2208417957783.jpg',
        status: 4, // 审核中
        createTime: '2023-03-10T09:30:00Z'
      },
      {
        id: 6,
        name: '儿童益智玩具',
        price: 159.00,
        originalPrice: 239.00,
        stock: 30,
        sales: 45,
        image: 'https://img.alicdn.com/imgextra/i2/2211448293302/O1CN01COk2Z11x0VhLOfJAe_!!2211448293302.jpg',
        status: 0, // 正常
        createTime: '2023-03-15T11:45:00Z'
      },
      {
        id: 7,
        name: '简约风台灯',
        price: 129.00,
        originalPrice: 169.00,
        stock: 18,
        sales: 30,
        image: 'https://img.alicdn.com/imgextra/i1/2214127414780/O1CN01qNMCw11ZRrG9MKLH3_!!2214127414780.jpg',
        status: 0, // 正常
        createTime: '2023-03-20T16:20:00Z'
      },
      {
        id: 8,
        name: '便携式蓝牙音箱',
        price: 249.00,
        originalPrice: 399.00,
        stock: 0,
        sales: 75,
        image: 'https://img.alicdn.com/imgextra/i3/2212097829095/O1CN01TN0Pn41fMx51Rchw8_!!2212097829095.jpg',
        status: 2, // 已售罄
        createTime: '2023-03-25T13:15:00Z'
      },
      {
        id: 9,
        name: '保温杯',
        price: 89.00,
        originalPrice: 119.00,
        stock: 10,
        sales: 120,
        image: 'https://img.alicdn.com/imgextra/i2/2212358572050/O1CN01Mh72xA1jaakKbPYCm_!!2212358572050.jpg',
        status: 1, // 库存紧张
        createTime: '2023-04-01T10:00:00Z'
      },
      {
        id: 10,
        name: '无线充电器',
        price: 129.00,
        originalPrice: 169.00,
        stock: 40,
        sales: 95,
        image: 'https://img.alicdn.com/imgextra/i4/2215251440509/O1CN01SvxpSG22KRTUBVAhg_!!2215251440509.jpg',
        status: 0, // 正常
        createTime: '2023-04-05T14:30:00Z'
      },
      {
        id: 11,
        name: '旅行箱',
        price: 369.00,
        originalPrice: 599.00,
        stock: 15,
        sales: 40,
        image: 'https://img.alicdn.com/imgextra/i2/2214304862249/O1CN01j0Ue1s1lrOFFDgSzw_!!2214304862249.jpg',
        status: 0, // 正常
        createTime: '2023-04-10T09:45:00Z'
      },
      {
        id: 12,
        name: '厨房置物架',
        price: 149.00,
        originalPrice: 199.00,
        stock: 0,
        sales: 65,
        image: 'https://img.alicdn.com/imgextra/i2/2212306953029/O1CN01H2YQqw1eF6FsEZ2TO_!!2212306953029.jpg',
        status: 2, // 已售罄
        createTime: '2023-04-15T15:50:00Z'
      }
    ]
  },

  onLoad: function (options) {
    // 获取状态栏高度
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    
    // 使用本地假数据
    const mockData = [...this.data.mockProducts];
    
    // 先根据当前标签页筛选商品
    let displayProducts = [];
    
    // 出售中：状态为0(正常)或1(库存紧张)且库存>0
    const onSaleProducts = mockData.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
    // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
    const soldOutProducts = mockData.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
    // 已下架：状态为3(已下架)
    const offShelfProducts = mockData.filter(item => item.status === 3);
    // 审核中：状态为4(审核中)
    const reviewingProducts = mockData.filter(item => item.status === 4);
    
    // 根据当前标签显示对应数据
    if (this.data.activeTab === 0) {
      displayProducts = onSaleProducts;
    } else if (this.data.activeTab === 1) {
      displayProducts = soldOutProducts;
    } else if (this.data.activeTab === 2) {
      displayProducts = offShelfProducts;
    } else if (this.data.activeTab === 3) {
      displayProducts = reviewingProducts;
    }
    
    console.log('初始加载商品数量:', displayProducts.length);
    
    this.setData({
      statusBarHeight,
      sortType: 0,  // 确保默认选中商品排序
      products: mockData,
      filteredProducts: displayProducts,
      displayProducts: displayProducts,
      tabCounts: {
        onSale: onSaleProducts.length,
        soldOut: soldOutProducts.length,
        offShelf: offShelfProducts.length,
        reviewing: reviewingProducts.length
      },
      isLoading: false
    });
    
    console.log('页面加载，显示模拟数据，总计:', mockData.length);
    console.log('出售中:', onSaleProducts.length);
    console.log('已售罄:', soldOutProducts.length);
    console.log('已下架:', offShelfProducts.length);
    console.log('审核中:', reviewingProducts.length);
  },

  onShow: function() {
    console.log('页面显示，当前排序方式：', this.data.sortOrder === 'asc' ? '升序' : '降序');
    
    // 只有当displayProducts为空时才重新加载数据
    if (!this.data.displayProducts || this.data.displayProducts.length === 0) {
    // 设置加载状态为true
    this.setData({
        isLoading: true
    });
    
    // 重新获取商品列表数据
    this.fetchProductList();
    }
  },
  
  // 获取商品列表数据
  fetchProductList: function(loadMore = false) {
    // 如果是加载更多，则不重置页码
    if (!loadMore) {
      this.setData({
        currentPage: 1,
        products: [],
        filteredProducts: [],
        displayProducts: []
      });
    }
    
    // 如果正在加载中，则不重复请求
    if ((this.data.isLoading && !loadMore) || (this.data.isLoadingMore && loadMore)) {
      return;
    }
    
    // 设置加载状态
    if (loadMore) {
      this.setData({
        isLoadingMore: true
      });
    } else {
      this.setData({
        isLoading: true
      });
    }
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 使用本地假数据替代API调用
      const mockData = [...this.data.mockProducts];
      
      // 关键词搜索筛选
      let filteredData = mockData;
    if (this.data.searchValue) {
        const keyword = this.data.searchValue.toLowerCase();
        filteredData = mockData.filter(item => 
          item.name.toLowerCase().includes(keyword)
        );
      }
      
      // 排序处理
      filteredData.sort((a, b) => {
        const timeA = new Date(a.createTime).getTime();
        const timeB = new Date(b.createTime).getTime();
        
        if (this.data.sortOrder === 'desc') {
          return timeB - timeA; // 降序：从新到旧
        } else {
          return timeA - timeB; // 升序：从旧到新
        }
      });
      
      // 根据当前标签页筛选商品
      let tabFilteredData = [];
      const tabIndex = this.data.activeTab;
      
      if (tabIndex === 0) {
        // 出售中：状态为0(正常)或1(库存紧张)且库存>0
        tabFilteredData = filteredData.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
      } else if (tabIndex === 1) {
        // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
        tabFilteredData = filteredData.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
      } else if (tabIndex === 2) {
        // 已下架：状态为3(已下架)
        tabFilteredData = filteredData.filter(item => item.status === 3);
      } else if (tabIndex === 3) {
        // 审核中：状态为4(审核中)
        tabFilteredData = filteredData.filter(item => item.status === 4);
      }
      
      // 模拟分页
      const { currentPage, pageSize } = this.data;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      // 获取当前页的数据
      const currentPageData = tabFilteredData.slice(startIndex, Math.min(endIndex, tabFilteredData.length));
      
      // 判断是否还有更多数据
      const hasMore = endIndex < tabFilteredData.length;
      
      // 计算各个标签页的商品数量
      const onSaleCount = filteredData.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0).length;
      const soldOutCount = filteredData.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4)).length;
      const offShelfCount = filteredData.filter(item => item.status === 3).length;
      const reviewingCount = filteredData.filter(item => item.status === 4).length;
      
      // 直接设置所有数据，简化流程
        this.setData({
        products: filteredData,
        filteredProducts: tabFilteredData,
        displayProducts: loadMore ? [...this.data.displayProducts, ...currentPageData] : currentPageData,
        hasMoreData: hasMore,
          isLoading: false,
        isLoadingMore: false,
        currentPage: loadMore ? this.data.currentPage + 1 : 2,
        tabCounts: {
          onSale: onSaleCount,
          soldOut: soldOutCount,
          offShelf: offShelfCount,
          reviewing: reviewingCount
        }
      });
      
      console.log('数据加载完成，当前页数据：', currentPageData);
      console.log('所有标签页计数：', {onSaleCount, soldOutCount, offShelfCount, reviewingCount});
      console.log('当前显示商品数量：', loadMore ? this.data.displayProducts.length + currentPageData.length : currentPageData.length);
    }, 1000); // 模拟1秒网络延迟
  },
  
  // 追加显示新数据
  appendDisplayProducts: function(newProducts) {
    this.setData({
      displayProducts: [...this.data.displayProducts, ...newProducts]
    });
  },
  
  // 监听页面上拉触底事件
  onReachBottom: function() {
    console.log('触发上拉加载更多...');
    if (this.data.hasMoreData && !this.data.isLoading && !this.data.isLoadingMore) {
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
        displayProducts: []
      });
    }
    
    // 如果没有更多数据，则结束加载状态并返回
    if (!this.data.hasMoreData) {
      this.setData({
        isLoading: false
      });
      return;
    }
    
    // 如果正在加载，则直接返回
    if (this.data.isLoading && !reset) {
      return;
    }
    
    // 标记为正在加载
    this.setData({
      isLoading: true
    });
    
    // 计算分页数据
    const { currentPage, pageSize, filteredProducts } = this.data;
    
    // 如果筛选后没有数据，也保持加载状态一段时间，然后再显示无数据
    if (!filteredProducts || filteredProducts.length === 0) {
      setTimeout(() => {
        this.setData({
          isLoading: false
        });
        console.log('没有符合条件的商品数据');
      }, 1000); // 延长加载状态显示时间
      return;
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // 获取当前页的数据
    const currentPageData = filteredProducts.slice(startIndex, endIndex);
    
    // 判断是否还有更多数据
    const hasMore = endIndex < filteredProducts.length;
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 更新数据
      this.setData({
        displayProducts: [...this.data.displayProducts, ...currentPageData],
        currentPage: currentPage + 1,
        hasMoreData: hasMore,
        isLoading: false
      });
      
      console.log(`加载第${currentPage}页数据完成，共${currentPageData.length}条，是否还有更多：${hasMore}`);
    }, 1000); // 延长加载状态显示时间
  },
  
  // 加载更多数据
  loadMoreData: function() {
    console.log('加载更多数据，当前页码:', this.data.currentPage);
    // 直接调用API获取下一页数据
    this.fetchProductList(true);
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
    
      this.setData({
      searchValue: value,
      isLoading: true,
      displayProducts: [] // 清空当前显示的商品，确保显示加载中状态
      });
    
    // 使用本地假数据进行搜索
    const mockData = [...this.data.mockProducts];
    
    // 关键词搜索筛选
    let filteredData = mockData;
    if (value) {
      const keyword = value.toLowerCase();
      filteredData = mockData.filter(item => 
        item.name.toLowerCase().includes(keyword)
      );
    }
    
    // 根据当前标签进一步筛选
    let tabFilteredData = [];
    const tabIndex = this.data.activeTab;
    
    if (tabIndex === 0) {
      // 出售中：状态为0(正常)或1(库存紧张)且库存>0
      tabFilteredData = filteredData.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
    } else if (tabIndex === 1) {
      // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
      tabFilteredData = filteredData.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
    } else if (tabIndex === 2) {
      // 已下架：状态为3(已下架)
      tabFilteredData = filteredData.filter(item => item.status === 3);
    } else if (tabIndex === 3) {
      // 审核中：状态为4(审核中)
      tabFilteredData = filteredData.filter(item => item.status === 4);
    }
    
    // 按照时间排序
    tabFilteredData.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      
      if (this.data.sortOrder === 'desc') {
        return timeB - timeA; // 降序：从新到旧
      } else {
        return timeA - timeB; // 升序：从旧到新
      }
    });
    
    // 直接设置数据
    setTimeout(() => {
      this.setData({
        filteredProducts: tabFilteredData,
        displayProducts: tabFilteredData,
        isLoading: false
      });
      
      console.log('搜索完成，找到匹配商品:', tabFilteredData.length);
    }, 500);
  },

  // 切换标签页
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    
    // 设置排序类型，如果是已下架(2)或审核中(3)标签页，则只显示商品排序
    const newSortType = (index === 2 || index === 3) ? 0 : this.data.sortType;
    
    this.setData({
      activeTab: index,
      sortType: newSortType, // 如果是已下架或审核中标签页，则重置为商品排序模式
      isLoading: true,
      displayProducts: [] // 清空当前显示的商品，确保显示加载中状态
    });
    
    console.log('切换到标签页:', index);
    
    // 使用本地假数据
    const mockData = [...this.data.mockProducts];
    
    // 进行数据筛选
    let filteredProducts = [];
    if (index === 0) {
      // 出售中：状态为0(正常)或1(库存紧张)且库存>0
      filteredProducts = mockData.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
    } else if (index === 1) {
      // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
      filteredProducts = mockData.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
    } else if (index === 2) {
      // 已下架：状态为3(已下架)
      filteredProducts = mockData.filter(item => item.status === 3);
    } else if (index === 3) {
      // 审核中：状态为4(审核中)
      filteredProducts = mockData.filter(item => item.status === 4);
    }
    
    // 按照时间排序
    filteredProducts.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      
      if (this.data.sortOrder === 'desc') {
        return timeB - timeA; // 降序：从新到旧
      } else {
        return timeA - timeB; // 升序：从旧到新
      }
    });
    
    // 直接设置数据
    setTimeout(() => {
    this.setData({
      filteredProducts: filteredProducts,
        displayProducts: filteredProducts,
        isLoading: false
      });
      
      console.log('标签页切换完成，显示数据数量:', filteredProducts.length);
    }, 500);
  },

  // 切换排序方式
  toggleSortOrder: function() {
    console.log('排序按钮被点击，当前排序方式：', this.data.sortOrder === 'asc' ? '升序' : '降序');
    
    // 切换排序方式
    const newSortOrder = this.data.sortOrder === 'asc' ? 'desc' : 'asc';
    
    this.setData({
      sortOrder: newSortOrder,
      isLoading: true,
      displayProducts: [] // 清空当前显示的商品，确保显示加载中状态
    });
    
    // 直接对当前已筛选的数据进行排序
    let sortedProducts = [...this.data.filteredProducts];
    
    // 按照时间排序
    sortedProducts.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      
      if (newSortOrder === 'desc') {
        return timeB - timeA; // 降序：从新到旧
      } else {
        return timeA - timeB; // 升序：从旧到新
      }
    });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      this.setData({
        filteredProducts: sortedProducts,
        displayProducts: sortedProducts,
        isLoading: false
      });
      
      console.log('排序完成，排序方式：', newSortOrder, '商品数量：', sortedProducts.length);
    }, 500);
  },

  // 计算商品列表位置
  calculateListPosition: function() {
    // 由于我们在WXML中直接使用条件表达式设置margin-top，这里不需要额外计算
    // 这个方法保留为空，以便将来可能的扩展
  },

  // 切换排序类型
  switchSortType: function(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    console.log('切换排序类型:', type);
    
    if (type === 0) {
      // 如果点击的是商品排序，则切换排序方向
      const newSortOrder = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
      this.setData({
        sortOrder: newSortOrder,
        sortType: 0  // 确保排序类型设置为商品排序
      }, () => {
        console.log('排序方向已切换为:', this.data.sortOrder);
        // 重新排序商品
        this.sortProducts();
        // 重新筛选商品
        this.filterProductsByTab(this.data.activeTab);
        // 重新加载第一页数据
        this.loadPageData(true);
      });
    } else {
      // 如果当前已经是批量下架模式，则切换回商品排序模式
      if (this.data.sortType === type) {
        this.setData({
          sortType: 0, // 切换回商品排序模式
          isAllSelected: false, // 重置全选状态
          selectedProducts: [] // 清空已选择的商品
        });
        console.log('切换回商品排序模式');
      } else {
        // 否则切换到批量下架模式
        this.setData({
          sortType: type,
          isAllSelected: false, // 初始化全选状态为false
          selectedProducts: [] // 初始化已选择的商品为空数组
        });
        console.log('切换到批量下架模式');
      }
      
      // 重新加载第一页数据
      this.loadPageData(true);
    }
  },

  // 排序商品数据
  sortProducts: function() {
    console.log('开始排序商品...');
    
    // 确保在排序过程中保持加载状态
    this.setData({
      isLoading: true
    });
    
    wx.showLoading({
      title: '正在排序...',
    });
    
    const products = [...this.data.filteredProducts || this.data.products];
    
    // 按照时间排序
    products.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      
      if (this.data.sortOrder === 'desc') {
        return timeB - timeA; // 降序：从新到旧
      } else {
        return timeA - timeB; // 升序：从旧到新
      }
    });
    
    console.log('排序后的商品:', products.map(item => item.createTime));
    
    this.setData({
      filteredProducts: products
    }, () => {
      console.log('商品排序完成，数据已更新');
    });
    
    wx.hideLoading();
  },

  // 批量下架选中的商品
  batchRemoveProducts: function() {
    // 检查是否有选中的商品
    if (this.data.selectedProducts.length === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      });
      return;
    }
    
    console.log('准备下架商品数量:', this.data.selectedProducts.length);
    
    // 显示确认弹窗
    wx.showModal({
      title: '确认下架',
      content: `确定要下架选中的 ${this.data.selectedProducts.length} 个商品吗？`,
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定，执行下架操作
          console.log('批量下架商品:', this.data.selectedProducts);
          
          // 显示加载中
          wx.showLoading({
            title: '处理中...',
          });
          
          // 模拟网络请求延迟
          setTimeout(() => {
            // 更新本地数据
            const mockProducts = [...this.data.mockProducts];
            
            // 获取选中商品ID（字符串格式）
            const selectedIds = this.data.selectedProducts;
            
            // 将选中的商品状态改为已下架
            selectedIds.forEach(id => {
              // 找到匹配的商品进行修改（需要转换为相同类型进行比较）
              const index = mockProducts.findIndex(p => String(p.id) === id);
              if (index !== -1) {
                mockProducts[index].status = 3; // 已下架状态
              }
            });
            
            // 更新本地数据
          this.setData({
              mockProducts: mockProducts,
                sortType: 0,
            isAllSelected: false,
            selectedProducts: []
          });
            
            // 重新获取商品列表
            this.fetchProductList();
          
          wx.showToast({
            title: '下架成功',
            icon: 'success'
              });
            
            wx.hideLoading();
          }, 1000); // 模拟1秒网络延迟
        }
      }
    });
  },

  // 下载商品
  downloadProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('下载商品:', productId);
    wx.showToast({
      title: '下载成功',
      icon: 'success'
    });
  },

  // 上架商品
  uploadProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('上架商品:', productId);
    wx.showToast({
      title: '上架成功',
      icon: 'success'
    });
  },

  // 编辑商品
  editProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('编辑商品:', productId);
    // 显示成功提示
    wx.showToast({
      title: '编辑功能模拟',
      icon: 'success'
    });
    
    // 暂时注释掉真实导航，避免页面不存在导致错误
    // wx.navigateTo({
    //   url: '/pages/productindex/newproduct/index?id=' + productId + '&type=edit&pageTitle=编辑商品'
    // });
  },

  // 改变商品状态
  changeProductStatus: function(e) {
    const productId = e.currentTarget.dataset.id;
    const action = e.currentTarget.dataset.action; // 获取操作类型：upload 或 remove
    console.log('改变商品状态:', productId);
    
    // 根据操作类型设置不同的弹窗内容
    let title = action === 'upload' ? '确认上架商品' : '确认下架商品';
    let message = action === 'upload' ? 
      '确定要上架该商品吗？上架后将会在商城中显示。' : 
      '确定要下架该商品吗？下架后将不会在商城中显示。';
    
    // 显示确认弹窗
    this.setData({
      showConfirmModal: true,
      currentProductId: productId,
      currentAction: action, // 保存当前操作类型
      modalTitle: title,
      modalMessage: message
    });
  },

  // 确认改变商品状态
  confirmChangeStatus: function() {
    const productId = this.data.currentProductId;
    const action = this.data.currentAction;
    console.log('确认改变商品状态:', productId, action);
    
    // 显示加载中
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 更新本地数据
      const mockProducts = [...this.data.mockProducts];
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      
      if (productIndex !== -1) {
        // 根据操作类型更新商品状态
        if (action === 'upload') {
          // 上架商品
          mockProducts[productIndex].status = 0; // 正常状态
        } else {
          // 下架商品
          mockProducts[productIndex].status = 3; // 已下架状态
        }
        
        // 更新本地数据
    this.setData({
          mockProducts: mockProducts,
      showConfirmModal: false,
      currentProductId: null,
      currentAction: null
    });
    
        // 重新获取商品列表
        this.fetchProductList();
    
    // 显示成功提示
    wx.showToast({
      title: action === 'upload' ? '上架成功' : '下架成功',
      icon: 'success'
        });
      } else {
        wx.showToast({
          title: '操作失败，未找到商品',
          icon: 'none'
        });
      }
      
      wx.hideLoading();
    }, 1000); // 模拟1秒网络延迟
  },

  // 取消下架商品
  cancelChangeStatus: function() {
    // 关闭弹窗
    this.setData({
      showConfirmModal: false,
      currentProductId: null
    });
  },

  // 新增商品
  addNewProduct: function() {
    console.log('新增商品');
    
    // 显示成功提示而不是导航
    wx.showToast({
      title: '新增商品功能模拟',
      icon: 'success'
    });
    
    // 暂时注释掉导航到可能不存在的页面
    // wx.navigateTo({
    //   url: '/pages/productindex/newproduct/index'
    // });
  },

  // 修改库存
  changeStock: function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.products.find(item => item.id === productId);
    
    this.setData({
      showStockModal: true,
      currentProductId: productId,
      stockValue: product ? product.stock.toString() : ''
    });
  },
  
  // 输入库存值
  onStockInput: function(e) {
    this.setData({
      stockValue: e.detail.value
    });
  },
  
  // 确认修改库存
  confirmChangeStock: function() {
    const productId = this.data.currentProductId;
    const newStock = parseInt(this.data.stockValue);
    
    if (isNaN(newStock) || newStock < 0) {
      wx.showToast({
        title: '请输入有效的库存数量',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '处理中...',
    });
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 更新本地数据
      const mockProducts = [...this.data.mockProducts];
      const productIndex = mockProducts.findIndex(p => p.id === productId);
      
      if (productIndex !== -1) {
        // 更新库存
        mockProducts[productIndex].stock = newStock;
        
        // 根据库存更新商品状态
        if (newStock === 0) {
          mockProducts[productIndex].status = 2; // 已售罄
        } else if (newStock <= 10) {
          mockProducts[productIndex].status = 1; // 库存紧张
        } else {
          mockProducts[productIndex].status = 0; // 正常状态
        }
        
        // 更新本地数据
    this.setData({
          mockProducts: mockProducts,
      showStockModal: false,
      currentProductId: null,
      stockValue: ''
    });
    
        // 重新筛选当前标签页数据
        let tabFilteredData = [];
        const tabIndex = this.data.activeTab;
        
        if (tabIndex === 0) {
          // 出售中：状态为0(正常)或1(库存紧张)且库存>0
          tabFilteredData = mockProducts.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
        } else if (tabIndex === 1) {
          // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
          tabFilteredData = mockProducts.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
        } else if (tabIndex === 2) {
          // 已下架：状态为3(已下架)
          tabFilteredData = mockProducts.filter(item => item.status === 3);
        } else if (tabIndex === 3) {
          // 审核中：状态为4(审核中)
          tabFilteredData = mockProducts.filter(item => item.status === 4);
        }
        
        // 按照时间排序
        tabFilteredData.sort((a, b) => {
          const timeA = new Date(a.createTime).getTime();
          const timeB = new Date(b.createTime).getTime();
          
          if (this.data.sortOrder === 'desc') {
            return timeB - timeA; // 降序：从新到旧
          } else {
            return timeA - timeB; // 升序：从旧到新
          }
        });
        
        // 重新计算所有标签页数量
        const onSaleCount = mockProducts.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0).length;
        const soldOutCount = mockProducts.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4)).length;
        const offShelfCount = mockProducts.filter(item => item.status === 3).length;
        const reviewingCount = mockProducts.filter(item => item.status === 4).length;
        
        // 更新显示数据
        this.setData({
          products: mockProducts,
          filteredProducts: tabFilteredData,
          displayProducts: tabFilteredData,
          tabCounts: {
            onSale: onSaleCount,
            soldOut: soldOutCount,
            offShelf: offShelfCount,
            reviewing: reviewingCount
          }
        });
    
    // 显示成功提示
    wx.showToast({
      title: '修改库存成功',
      icon: 'success'
        });
      } else {
        wx.showToast({
          title: '修改库存失败，未找到商品',
          icon: 'none'
        });
      }
      
      wx.hideLoading();
    }, 1000); // 模拟1秒网络延迟
  },
  
  // 取消修改库存
  cancelChangeStock: function() {
    this.setData({
      showStockModal: false,
      currentProductId: null,
      stockValue: ''
    });
  },

  // 更新标签页显示的数量
  updateTabCounts: function() {
    const allProducts = this.data.products;
    
    // 计算各个标签页的商品数量
    const onSaleCount = allProducts.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0).length;
    const soldOutCount = allProducts.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4)).length;
    const offShelfCount = allProducts.filter(item => item.status === 3).length;
    const reviewingCount = allProducts.filter(item => item.status === 4).length;
    
    // 使用对象解构，只更新tabCounts，不影响其他状态
    this.setData({
      tabCounts: {
        onSale: onSaleCount,
        soldOut: soldOutCount,
        offShelf: offShelfCount,
        reviewing: reviewingCount
      }
    });
  },

  // 切换全选状态
  toggleSelectAll: function() {
    // 直接反转当前全选状态
    const isAllSelected = !this.data.isAllSelected;
    console.log('切换全选状态:', isAllSelected);
    
    // 当前可见商品ID数组，统一转换为字符串类型
    const visibleProducts = this.data.filteredProducts
      .filter(item => item.status !== 3 && item.status !== 4)
        .map(item => {
          console.log('全选中的商品ID类型:', item.id, typeof item.id);
          return String(item.id);
        });
    
    // 如果是全选，则使用所有可见商品的ID；否则清空
    const selectedProducts = isAllSelected ? visibleProducts : [];
    
    // 更新状态
    this.setData({
      isAllSelected: isAllSelected,
      selectedProducts: selectedProducts
    });
    
    console.log('全选状态变更为:', isAllSelected, '选中商品数:', selectedProducts.length);
    if(selectedProducts.length > 0) {
      console.log('全选后的第一个ID类型:', typeof selectedProducts[0]);
    }
  },
  
  // 切换单个商品的选择状态
  toggleSelectProduct: function(e) {
    // 从dataset中获取商品ID，确保转换为字符串类型
    const productId = String(e.currentTarget.dataset.id);
    console.log('切换商品选择状态:', productId, typeof productId);
    
    let selectedProducts = [...this.data.selectedProducts];
    
    // 检查商品是否已被选中
    const index = selectedProducts.indexOf(productId);
    
    if (index === -1) {
      // 如果未选中，添加到已选择数组
      selectedProducts.push(productId);
    } else {
      // 如果已选中，从已选择数组中移除
      selectedProducts.splice(index, 1);
    }
    
    // 当前可见商品
    const visibleProducts = this.data.filteredProducts
      .filter(item => item.status !== 3 && item.status !== 4)
      .map(item => String(item.id));
    
    // 检查是否全选 - 所有可见商品都被选中
    const isAllSelected = visibleProducts.length > 0 && 
      visibleProducts.every(id => selectedProducts.indexOf(id) !== -1);
    
    console.log(selectedProducts,'selectedProducts',productId,'productId');
    console.log('selectedProducts中的第一个ID类型:', typeof selectedProducts[0]);
    console.log('ID是否在选中列表中:', selectedProducts.indexOf(productId) !== -1);

    // 更新状态
    this.setData({
      selectedProducts: selectedProducts,
      isAllSelected: isAllSelected
    });
  },
}); 