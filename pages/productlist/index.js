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
    needRefresh: false, // 是否需要刷新页面
    isFirstLoad: true, // 标记是否是第一次加载
    fromEditPage: false // 标记是否从编辑/新增页面返回
  },

  onLoad: function (options) {
    // 获取状态栏高度
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    
    this.setData({
      statusBarHeight,
      sortType: 0  // 确保默认选中商品排序
    });
    
    // 直接在onLoad中加载数据，而不是等到onShow
    this.refreshCurrentPage();
  },

  onShow: function() {
    console.log('页面显示，fromEditPage:', this.data.fromEditPage);
    
    // 如果是从编辑/新增页面返回，需要刷新数据
    if (this.data.fromEditPage) {
      this.refreshCurrentPage();
      this.setData({
        fromEditPage: false
      });
    }
  },
  
  // 获取商品状态统计数据
  fetchProductStatusStats: function() {
    // 获取店铺ID
    const shopId = wx.getStorageSync('shopId');
    if (!shopId) {
      console.error('未找到店铺ID');
      return;
    }
    
    const params = {
      shopId: shopId
    };
    
    // 使用api模块调用接口
    api.product.getProductStatusStats(params)
      .then(res => {
        console.log('获取商品状态统计响应:', res);
        
        if (res.code === 200 && res.data && res.data.statusStats) {
          const stats = res.data.statusStats;
          
          // 更新标签页统计数据
          this.setData({
            tabCounts: {
              onSale: parseInt(stats['1'] || 0),    // 出售中
              soldOut: parseInt(stats['2'] || 0),   // 已售罄
              offShelf: parseInt(stats['3'] || 0),  // 已下架
              reviewing: parseInt(stats['0'] || 0)  // 审核中
            }
          });
        } else {
          console.error('获取商品状态统计失败:', res.message || '未知错误');
        }
      })
      .catch(err => {
        console.error('获取商品状态统计异常:', err);
      });
  },
  
  // 获取商品列表数据
  fetchProductList: function(loadMore = false) {
    // 获取店铺ID
    const shopId = wx.getStorageSync('shopId');
    if (!shopId) {
      console.error('未找到店铺ID');
      wx.showToast({
        title: '获取店铺信息失败,请重新登录',
        icon: 'none'
      });
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    
    // 如果是加载更多，则不重置页码
    if (!loadMore) {
      this.setData({
        currentPage: 1,
        products: [],
        filteredProducts: [],
        displayProducts: []
      });
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
    
    // 构建请求参数
    const params = {
      page: this.data.currentPage,
      limit: this.data.pageSize,
      status: this.getStatusByTab(this.data.activeTab),
      shopId: shopId
    };

    // 如果有搜索关键词，添加到请求参数中
    if (this.data.searchValue) {
      params.name = this.data.searchValue;
    }
    
    console.log('请求参数:', params);
    
    // 使用api.product.getProductList方法发送请求
    api.product.getProductList(params)
      .then(res => {
        console.log('获取商品列表响应:', res);
        
        if (res.code === 200 && res.data && res.data.items) {
          // 从 res.data.items 获取商品列表数据
          const apiData = res.data.items;
          // 从 res.data.pagination 获取分页信息
          const pagination = res.data.pagination;
          
          // 判断是否还有更多数据
          const hasMore = this.data.currentPage < pagination.totalPages;
          
          // 处理数据
          let newProducts = [];
          if (loadMore) {
            // 加载更多，追加数据
            newProducts = [...this.data.displayProducts, ...apiData];
          } else {
            // 首次加载，直接使用API数据
            newProducts = apiData;
          }
          
          // 更新数据
          this.setData({
            products: apiData,
            filteredProducts: apiData,
            displayProducts: newProducts,
            hasMoreData: hasMore,
            isLoading: false,
            isLoadingMore: false,
            currentPage: loadMore ? this.data.currentPage + 1 : 2
          });
          console.log('数据加载完成，当前页数据:', apiData.length);
          console.log('当前显示商品数量:', newProducts.length);
        } else {
          wx.showToast({
            title: '获取商品列表失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取商品列表失败:', err);
        wx.showToast({
          title: '获取商品列表失败',
          icon: 'none'
        });
        
        this.setData({
          isLoading: false,
          isLoadingMore: false
        });
      });
  },
  
  // 根据标签页获取对应的状态参数
  getStatusByTab: function(tabIndex) {
    switch(tabIndex) {
      case 0: // 出售中
        return "1"; // 包括正常和库存紧张状态
      case 1: // 已售罄
        return "2"; // 已售罄状态
      case 2: // 已下架
        return "3"; // 已下架状态
      case 3: // 审核中
        return "0"; // 审核中状态
      default:
        return "";
    }
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
    
    // 重置页面状态
    this.setData({
      searchValue: value,
      isLoading: true,
      currentPage: 1,
      displayProducts: [], // 清空当前显示的商品，确保显示加载中状态
      hasMoreData: true // 重置加载更多状态
    });
    
    // 调用接口获取数据
    this.fetchProductList();
  },

  // 切换标签页
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    console.log('switchTab 被触发，index:', index);
    
    // 设置排序类型，如果是已下架(2)或审核中(3)标签页，则只显示商品排序
    const newSortType = (index === 2 || index === 3) ? 0 : this.data.sortType;
    
    this.setData({
      activeTab: index,
      sortType: newSortType,
      isLoading: true,
      currentPage: 1,
      displayProducts: [],
      selectedProducts: [],
      isAllSelected: false
    }, () => {
      // 在 setData 的回调中调用 fetchProductList，确保状态更新后再请求
      console.log('准备请求商品列表，activeTab:', this.data.activeTab);
      this.fetchProductList();
      // 重新获取商品状态统计数据
      this.fetchProductStatusStats();
    });
  },

  // 切换排序方式
  toggleSortOrder: function() {
    console.log('排序按钮被点击，当前排序方式：', this.data.sortOrder === 'asc' ? '升序' : '降序');
    
    // 切换排序方式
    const newSortOrder = this.data.sortOrder === 'asc' ? 'desc' : 'asc';
    
    this.setData({
      sortOrder: newSortOrder,
      isLoading: true,
      currentPage: 1,
      displayProducts: [] // 清空当前显示的商品，确保显示加载中状态
    });
    
    // 调用接口获取数据
    this.fetchProductList();
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
        // 重新获取数据并排序
        this.fetchProductList();
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
          
          wx.showLoading({
            title: '处理中...',
          });
          
          // 使用 api.product.batchUpdateStatus 方法发送请求
          api.product.batchUpdateStatus(this.data.selectedProducts, 3)
            .then(res => {
              console.log('批量下架响应:', res);
              
              if (res.code === 200) {
                // 请求成功，更新本地数据
                const products = [...this.data.products];
                
                // 获取选中商品ID（字符串格式）
                const selectedIds = this.data.selectedProducts;
                
                // 将选中的商品状态改为已下架
                selectedIds.forEach(id => {
                  const index = products.findIndex(p => String(p.id) === id);
                  if (index !== -1) {
                    products[index].status = 3; // 已下架状态
                  }
                });
                
                // 更新数据
                this.setData({
                  products: products,
                  sortType: 0,
                  isAllSelected: false,
                  selectedProducts: []
                });
                
                // 重新获取最新数据
                this.fetchProductList();
                this.fetchProductStatusStats();
                
                wx.showToast({
                  title: '下架成功',
                  icon: 'success'
                });
              } else {
                wx.showToast({
                  title: '下架失败，请重试',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              console.error('批量下架失败:', err);
              wx.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
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
    
    // 设置标记，表示即将跳转到编辑页面
    this.setData({
      fromEditPage: true
    });
    
    // 跳转到编辑页面
    wx.navigateTo({
      url: '/pages/productindex/newproduct/index?id=' + productId + '&type=edit&pageTitle=编辑商品'
    });
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
    
    if (!productId) {
      console.error('商品ID不存在');
      wx.showToast({
        title: '操作失败，商品ID不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 根据操作类型设置不同的状态值
    const status = action === 'upload' ? 1 : 3; // 0为上架状态，3为下架状态
    
    // 使用api.product.updateProductStatus方法发送请求
    api.product.updateProductStatus(productId, status)
      .then(res => {
        console.log('修改商品状态响应:', res);
        
        if (res.code === 200) {
          // 请求成功，更新本地数据
          const products = [...this.data.products];
          const productIndex = products.findIndex(p => p.id === productId);
      
          if (productIndex !== -1) {
            // 更新商品状态
            products[productIndex].status = status;
            this.fetchProductStatusStats()

            this.setData({
              products: products,
              showConfirmModal: false,
              currentProductId: null,
              currentAction: null
            });
            
            // 重新筛选当前标签页数据并更新显示
            // this.updateDisplayProducts(products);
            
            wx.showToast({
              title: action === 'upload' ? '上架成功' : '下架成功',
              icon: 'success'
            });
            this.fetchProductList()
          } else {
            wx.showToast({
              title: '操作失败，未找到商品',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '修改商品状态失败，请重试',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('修改商品状态失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
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

  // 复选框组变更处理函数
  checkboxChange: function(e) {
    // 获取checkbox-group中所有选中的checkbox的value值
    const selectedIds = e.detail.value;
    
    // 更新选中的商品数组
    this.setData({
      selectedProducts: selectedIds,
      // 判断是否全选 - 如果选中的数量等于当前页面商品数量
      isAllSelected: selectedIds.length > 0 && selectedIds.length === this.data.displayProducts.length
    });

    // 更新商品的选中状态
    const displayProducts = this.data.displayProducts.map(item => {
      // 添加或更新选中状态
      return {
        ...item,
        checked: selectedIds.includes(String(item.id))
      };
    });
    
    this.setData({
      displayProducts: displayProducts
    });
  },
  
  // 切换全选状态
  toggleSelectAll: function() {
    const isAllSelected = !this.data.isAllSelected;
    const visibleProducts = this.data.displayProducts
      .filter(item => item.status !== 3 && item.status !== 4)
      .map(item => String(item.id));
    
    const selectedProducts = isAllSelected ? visibleProducts : [];
    
    // 更新每个商品的选中状态
    const displayProducts = this.data.displayProducts.map((item) => {
      return {
        ...item,
        checked: isAllSelected && (item.status !== 3 && item.status !== 4)
      };
    });
    
    this.setData({
      isAllSelected: isAllSelected,
      selectedProducts: selectedProducts,
      displayProducts: displayProducts
    });
  },

  
  // 取消下架商品s
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
    
    // 设置标记，表示即将跳转到新增页面
    this.setData({
      fromEditPage: true
    });
    
    // 跳转到新增商品页面
    wx.navigateTo({
      url: '/pages/productindex/newproduct/index?type=add&pageTitle=新增商品'
    });
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
    
    wx.showLoading({
      title: '处理中...',
    });

    // 使用 api.product.updateStock 方法替代直接构造URL
    api.product.updateStock(productId, newStock)
      .then(res => {
        console.log('修改库存响应:', res);
        
        if (res.code === 200) {
          // 更新本地数据
          const products = [...this.data.products];
          const productIndex = products.findIndex(p => p.id === productId);
      
          if (productIndex !== -1) {
            products[productIndex].stock = newStock;
            
            // // 根据库存更新商品状态
            // if (newStock === 0) {
            //   products[productIndex].status = 2; // 已售罄
            // } else if (newStock <= 10) {
            //   products[productIndex].status = 1; // 库存紧张
            // } else {
            //   products[productIndex].status = 0; // 正常状态
            // }
            
            this.setData({
              products: products,
              showStockModal: false,
              currentProductId: null,
              stockValue: ''
            });
            
            // this.updateDisplayProducts(products);
            this.refreshCurrentPage()
            wx.showToast({
              title: '修改库存成功',
              icon: 'success'
            });
          }
        } else {
          wx.showToast({
            title: '修改库存失败，请重试',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('修改库存失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 更新显示的商品数据
  updateDisplayProducts: function(products) {
    // 重新筛选当前标签页数据
    let tabFilteredData = [];
    const tabIndex = this.data.activeTab;
    
    if (tabIndex === 0) {
      // 出售中：状态为0(正常)或1(库存紧张)且库存>0
      tabFilteredData = products.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
    } else if (tabIndex === 1) {
      // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
      tabFilteredData = products.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
    } else if (tabIndex === 2) {
      // 已下架：状态为3(已下架)
      tabFilteredData = products.filter(item => item.status === 3);
    } else if (tabIndex === 3) {
      // 审核中：状态为4(审核中)
      tabFilteredData = products.filter(item => item.status === 4);
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
    const onSaleCount = products.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0).length;
    const soldOutCount = products.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4)).length;
    const offShelfCount = products.filter(item => item.status === 3).length;
    const reviewingCount = products.filter(item => item.status === 4).length;
    
    // 更新显示数据
    this.setData({
      products: products,
      filteredProducts: tabFilteredData,
      displayProducts: tabFilteredData,
      tabCounts: {
        onSale: onSaleCount,
        soldOut: soldOutCount,
        offShelf: offShelfCount,
        reviewing: reviewingCount
      }
    });
  },

  // 添加 onTabItemTap 处理函数
  onTabItemTap(item) {
    // 当通过 tabBar 切换到当前页面时触发
    console.log('Tab被点击:', item);
    this.refreshCurrentPage();
  },

  // 修改刷新页面方法
  refreshCurrentPage() {
    console.log('刷新页面数据');
    
    // 重置页面状态
    this.setData({
      currentPage: 1,
      displayProducts: [],
      selectedProducts: [], // 清空选中的商品
      isAllSelected: false, // 重置全选状态
      isLoading: true
    });

    // 获取商品列表
    this.fetchProductList();
    
    // 获取商品状态统计数据
    this.fetchProductStatusStats();
  },

  // 修改 onHide 方法
  onHide() {
    console.log('页面隐藏，标记需要刷新');
    this.data.needRefresh = true;
  },

  // onUnload 方法用于页面销毁时的处理
  onUnload() {
    console.log('页面卸载');
    this.isFirstLoad = true; // 重置首次加载标记
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },
}); 