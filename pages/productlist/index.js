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
    products: [], // 从API获取的商品数据
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
    isLoadingMore: false // 是否正在加载更多数据
  },

  onLoad: function (options) {
    // 获取状态栏高度
    const statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    this.setData({
      statusBarHeight,
      sortType: 0,  // 确保默认选中商品排序
      isLoading: true,  // 设置加载状态为true
    });
    
    // 获取商品列表数据
    this.fetchProductList();
  },

  onShow: function() {
    console.log('页面显示，当前排序方式：', this.data.sortOrder === 'asc' ? '升序' : '降序');
    
    // 设置加载状态为true
    this.setData({
      isLoading: true,
      displayProducts: [] // 清空当前显示的商品，确保显示加载中状态
    });
    
    // 重新获取商品列表数据
    this.fetchProductList();
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
    
    // 构建请求参数
    const params = {
      sort: this.data.sortOrder, // 排序方向
      page: this.data.currentPage,
      limit: this.data.pageSize,
      status: 1 // 默认传递状态为1
    };
    
    // 根据当前标签页设置不同的状态参数
    if (this.data.activeTab === 0) {
      params.status = 1; // 出售中
    } else if (this.data.activeTab === 1) {
      params.status = 2; // 已售罄
    } else if (this.data.activeTab === 2) {
      params.status = 3; // 已下架
    } else if (this.data.activeTab === 3) {
      params.status = 4; // 审核中
    }
    
    // 如果有搜索关键词，添加到参数中
    if (this.data.searchValue) {
      params.keyword = this.data.searchValue;
    }
    
    console.log('请求商品列表参数:', params);
    
    // 调用API获取商品列表
    api.product.getProductList(params).then(res => {
      if (res.code === 200 && res.data) {
        // 处理返回的数据
        const newProducts = res.data.map(item => {
          // 根据库存设置商品状态
          let status = 0; // 默认正常
          if (item.stock === 0) {
            status = 2; // 已售罄
          } else if (item.stock <= 10) {
            status = 1; // 库存紧张
          }
          
          // 如果API返回的数据中有status字段，则使用API返回的状态
          if (item.status !== undefined) {
            status = item.status;
          }
          
          // 返回处理后的商品数据
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice || item.price * 1.5, // 如果没有原价，则设置为售价的1.5倍
            stock: item.stock || 0,
            sales: item.sales || 0,
            image: item.image || '/assets/images/product-placeholder.png', // 如果没有图片，则使用默认图片
            status: status,
            createTime: item.createTime || new Date().toISOString() // 如果没有创建时间，则使用当前时间
          };
        });
        
        // 判断是否还有更多数据
        const hasMore = newProducts.length === this.data.pageSize;
        
        if (loadMore) {
          // 如果是加载更多，则将新数据追加到现有数据后面
          this.setData({
            products: [...this.data.products, ...newProducts],
            hasMoreData: hasMore,
            isLoadingMore: false,
            currentPage: this.data.currentPage + 1 // 页码加1，为下次加载做准备
          });
        } else {
          // 如果是首次加载或刷新，则直接替换数据
          this.setData({
            products: newProducts,
            hasMoreData: hasMore,
            isLoading: false,
            currentPage: 2 // 页码设为2，为下次加载做准备
          });
        }
        
        // 更新标签页数量
        this.updateTabCounts();
        
        // 根据当前标签页筛选商品
        this.filterProductsByTab(this.data.activeTab);
        
        // 如果是首次加载或刷新，则重新加载第一页数据
        if (!loadMore) {
    this.loadPageData(true);
        } else {
          // 如果是加载更多，则追加显示新数据
          this.appendDisplayProducts(newProducts);
        }
      } else {
        // 处理API请求失败的情况
        wx.showToast({
          title: res.message || '获取商品列表失败',
          icon: 'none'
        });
        
        // 设置加载状态为false
        this.setData({
          isLoading: false,
          isLoadingMore: false
        });
      }
    }).catch(err => {
      console.error('获取商品列表失败:', err);
      
      // 显示错误提示
      wx.showToast({
        title: '获取商品列表失败，请稍后再试',
        icon: 'none'
      });
      
      // 设置加载状态为false
      this.setData({
        isLoading: false,
        isLoadingMore: false
      });
    });
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
    
    // 重新获取商品列表数据，搜索参数会在fetchProductList中添加
    this.fetchProductList();
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
    
    // 重新获取商品列表数据，根据标签页状态获取
    this.fetchProductList();
    
    console.log('切换标签页，重置排序类型:', newSortType);
  },

  // 根据标签筛选商品
  filterProductsByTab: function(tabIndex) {
    // 获取所有商品
    const allProducts = this.data.products;
    
    // 根据标签筛选
    let filteredProducts = [];
    if (tabIndex === 0) {
      // 出售中：状态为0(正常)或1(库存紧张)且库存>0
      filteredProducts = allProducts.filter(item => (item.status === 0 || item.status === 1) && item.stock > 0);
    } else if (tabIndex === 1) {
      // 已售罄：状态为2(已售罄)或库存为0但状态不是已下架(3)或审核中(4)
      filteredProducts = allProducts.filter(item => item.status === 2 || (item.stock === 0 && item.status !== 3 && item.status !== 4));
    } else if (tabIndex === 2) {
      // 已下架：状态为3(已下架)
      filteredProducts = allProducts.filter(item => item.status === 3);
    } else if (tabIndex === 3) {
      // 审核中：状态为4(审核中)
      filteredProducts = allProducts.filter(item => item.status === 4);
    }
    
    // 确保 filteredProducts 不为 null 或 undefined
    filteredProducts = filteredProducts || [];
    
    // 更新标签页显示的数量
    this.updateTabCounts();
    
    this.setData({
      filteredProducts: filteredProducts,
      isLoading: true // 设置为加载状态，确保在切换标签页时显示加载中
    });
    
    // 筛选后进行排序
    this.sortProducts();
    
    // 重新计算商品列表位置，确保布局正确
    this.calculateListPosition();
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
    }, () => {
      // 在回调函数中执行排序，确保状态已更新
      console.log('排序方式已切换为：', this.data.sortOrder === 'asc' ? '升序' : '降序');
      
      // 重新获取商品列表
      this.fetchProductList();
    });
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
          
          // 调用批量下架API
          api.product.batchOfflineProduct(this.data.selectedProducts).then(res => {
            if (res.code === 200) {
              // 下架成功，重新获取商品列表
              this.fetchProductList();
              
              // 切换回商品排序模式
          this.setData({
                sortType: 0,
            isAllSelected: false,
            selectedProducts: []
          });
          
          wx.showToast({
            title: '下架成功',
            icon: 'success'
              });
            } else {
              wx.showToast({
                title: res.message || '下架失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('批量下架商品失败:', err);
            wx.showToast({
              title: '下架失败，请稍后再试',
              icon: 'none'
            });
          }).finally(() => {
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
    
    // 显示加载中
    wx.showLoading({
      title: '处理中...',
    });
    
    // 根据操作类型调用不同的API
    const apiCall = action === 'upload' ? 
      api.product.onlineProduct(productId) : 
      api.product.offlineProduct(productId);
    
    apiCall.then(res => {
      if (res.code === 200) {
        // 操作成功，关闭弹窗
    this.setData({
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
          title: res.message || '操作失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('改变商品状态失败:', err);
      wx.showToast({
        title: '操作失败，请稍后再试',
        icon: 'none'
      });
    }).finally(() => {
      wx.hideLoading();
    });
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
    wx.navigateTo({
      url: '/pages/productindex/newproduct/index'
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
    
    // 显示加载中
    wx.showLoading({
      title: '处理中...',
    });
    
    // 调用修改库存API
    api.product.updateStock(productId, newStock).then(res => {
      if (res.code === 200) {
        // 修改成功，关闭弹窗
    this.setData({
      showStockModal: false,
      currentProductId: null,
      stockValue: ''
    });
    
        // 重新获取商品列表
        this.fetchProductList();
    
    // 显示成功提示
    wx.showToast({
      title: '修改库存成功',
      icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.message || '修改库存失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('修改库存失败:', err);
      wx.showToast({
        title: '修改库存失败，请稍后再试',
        icon: 'none'
      });
    }).finally(() => {
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

  // 切换全选状态
  toggleSelectAll: function() {
    const isAllSelected = !this.data.isAllSelected;
    
    let selectedProducts = [];
    if (isAllSelected) {
      // 如果是全选，则将所有可见商品的ID添加到已选择数组中
      selectedProducts = (this.data.filteredProducts || this.data.products)
        .filter(item => item.status !== 3 && item.status !== 4) // 排除已下架和审核中的商品
        .map(item => item.id);
    }
    
    this.setData({
      isAllSelected: isAllSelected,
      selectedProducts: selectedProducts
    });
    
    console.log('全选状态切换为:', isAllSelected, '已选择商品:', selectedProducts);
  },
  
  // 切换单个商品的选择状态
  toggleSelectProduct: function(e) {
    const productId = e.currentTarget.dataset.id;
    const selectedProducts = [...this.data.selectedProducts];
    
    // 检查商品是否已经被选中
    const index = selectedProducts.indexOf(productId);
    
    if (index === -1) {
      // 如果未选中，则添加到已选择数组
      selectedProducts.push(productId);
    } else {
      // 如果已选中，则从已选择数组中移除
      selectedProducts.splice(index, 1);
    }
    
    // 检查是否所有可见商品都被选中
    const visibleProducts = (this.data.filteredProducts || this.data.products)
      .filter(item => item.status !== 3 && item.status !== 4); // 排除已下架和审核中的商品
    
    const isAllSelected = visibleProducts.length > 0 && 
      visibleProducts.every(item => selectedProducts.includes(item.id));
    
    this.setData({
      selectedProducts: selectedProducts,
      isAllSelected: isAllSelected
    });
    
    console.log('商品选择状态切换:', productId, '已选择商品:', selectedProducts);
  },
}); 