const api = require('../../../utils/api');

Page({
  data: {
    statusBarHeight: 0, // 默认值，会在onLoad中获取实际高度
    product: {
      name: '', // 商品标题
      description: '', // 商品描述
      images: [], // 商品图片
      sellingPrice: '', // 售价
      originalPrice: '', // 原价
      rewardAmount: '', // 奖励金
      categoryId: '', // 商品分类ID
      categoryName: '', // 商品分类名称（用于显示）
      specification: '', // 商品规格
      stock: '', // 库存
      promotionStart: '', // 活动开始日期
      promotionEnd: '' // 活动结束日期
    },
    categories: [], // 商品分类列表
    showCategoryPicker: false, // 是否显示分类选择器
    maxImageCount: 5, // 最大图片上传数量
    isSubmitActive: false, // 提交按钮是否激活
    
    // 日期选择器相关
    showDatePicker: false, // 是否显示日期选择器
    datePickerTab: 'start', // 当前选择的是开始日期还是结束日期
    datePickerValue: [0, 0, 0], // 日期选择器的当前值
    years: [], // 年份列表
    months: [], // 月份列表
    days: [], // 日期列表
    tempDate: null, // 临时存储选择的日期
    
    // 图片上传相关
    isUploading: false, // 是否正在上传图片
    uploadProgress: 0, // 上传进度
    isOfflineMode: false, // 是否为离线模式
    networkType: 'unknown', // 网络状态
    pendingCategoryMatch: null, // 用于存储分类加载完成后的回调
    isEdit: false,
    productId: null
  },

  onLoad: function(options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 检查API配置
    console.log('API配置:', api);
    // if (!api.baseUrl) {
    //   console.warn('API baseUrl未定义，将使用默认URL');
    //   api.baseUrl = 'http://shindou.icu:4000/api';
    //   console.log('已设置API baseUrl:', api.baseUrl);
    // }
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 获取商品分类
    this.fetchCategories();
    
    // 初始化日期选择器数据
    this.initDatePicker();
    
    // 判断是否是编辑模式
    if (options.type === 'edit') {
      // 设置页面标题为"编辑商品"
      wx.setNavigationBarTitle({
        title: '编辑商品'
      });
      
      // 保存商品ID用于编辑提交
      this.setData({
        isEdit: true,
        productId: options.id
      });
      
      // 如果有商品ID，加载商品信息
      if (options.id) {
        this.fetchProductDetail(options.id);
      }
    } else {
      // 新增商品模式
      wx.setNavigationBarTitle({
        title: '新增商品'
      });
    }
  },

  // 获取商品详情
  fetchProductDetail: function(productId) {
    wx.showLoading({
      title: '加载商品信息...',
    });

    api.product.getProductDetail(productId)
      .then(res => {
        console.log('获取商品详情响应:', res);
        
        if (res.code === 200 && res.data) {
          const productData = res.data;
          
          // 格式化日期
          let promotionStart = '';
          let promotionEnd = '';
          
          if (productData.promotionStart) {
            const startDate = new Date(productData.promotionStart);
            promotionStart = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月${startDate.getDate()}日`;
          }
          
          if (productData.promotionEnd) {
            const endDate = new Date(productData.promotionEnd);
            promotionEnd = `${endDate.getFullYear()}年${endDate.getMonth() + 1}月${endDate.getDate()}日`;
          }
          
          // 在商品分类列表中查找匹配的分类
          let categoryName = '';
          if (this.data.categories && this.data.categories.length > 0) {
            const category = this.data.categories.find(cat => cat.id === productData.categoryId);
            if (category) {
              categoryName = category.name;
            }
          } else {
            // 如果分类列表还未加载完成，保存一个回调函数在分类加载完成后执行
            this.pendingCategoryMatch = () => {
              const category = this.data.categories.find(cat => cat.id === productData.categoryId);
              if (category) {
                this.setData({
                  'product.categoryName': category.name
                });
              }
            };
          }
          
          // 更新页面数据
          this.setData({
            'product': {
              name: productData.name || '',
              description: productData.description || '',
              images: productData.images || [],
              sellingPrice: productData.sellingPrice || '',
              originalPrice: productData.originalPrice || '',
              rewardAmount: productData.rewardAmount || '',
              categoryId: productData.categoryId || '', // 保存分类ID用于表单提交
              categoryName: categoryName || productData.categoryName || '', // 显示分类名称
              specification: productData.specification || '',
              stock: productData.stock || '',
              promotionStart: promotionStart,
              promotionEnd: promotionEnd
            }
          });
          
          // 检查表单有效性
          this.checkFormValidity();
        } else {
          wx.showToast({
            title: '获取商品信息失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取商品信息失败:', err);
        wx.showToast({
          title: '获取商品信息失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 检查网络状态
  checkNetworkStatus: function() {
    const that = this;
    wx.getNetworkType({
      success: function(res) {
        const networkType = res.networkType;
        console.log('当前网络状态:', networkType);
        
        // 设置网络状态
        that.setData({
          networkType: networkType,
          isOfflineMode: networkType === 'none'
        });
        
        // 如果网络状态不佳，提示用户
        if (networkType === 'none') {
          wx.showToast({
            title: '当前处于离线模式，图片将暂存在本地',
            icon: 'none',
            duration: 3000
          });
        } else if (networkType === '2g' || networkType === '3g') {
          wx.showToast({
            title: '当前网络信号较弱，图片上传可能较慢',
            icon: 'none',
            duration: 3000
          });
        }
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res) {
      console.log('网络状态变化:', res.networkType, '是否连接:', res.isConnected);
      
      that.setData({
        networkType: res.networkType,
        isOfflineMode: !res.isConnected
      });
      
      if (!res.isConnected) {
        wx.showToast({
          title: '网络已断开，已切换到离线模式',
          icon: 'none',
          duration: 3000
        });
      } else if (res.networkType === '2g' || res.networkType === '3g') {
        wx.showToast({
          title: '网络信号较弱，图片上传可能较慢',
          icon: 'none',
          duration: 3000
        });
      } else {
        wx.showToast({
          title: '网络已恢复',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 初始化日期选择器数据
  initDatePicker: function() {
    const date = new Date();
    const years = [];
    const months = [];
    const days = [];
    
    // 生成年份列表（当前年份及之后的7年）
    for (let i = date.getFullYear(); i <= date.getFullYear() + 7; i++) {
      years.push(i);
    }
    
    // 生成月份列表
    for (let i = 1; i <= 12; i++) {
      months.push(i);
    }
    
    // 生成日期列表（默认31天，会在选择年月时动态调整）
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    
    this.setData({
      years: years,
      months: months,
      days: days
    });
    
    // 设置默认选中当前日期
    this.setDatePickerValue(date);
  },
  
  // 设置日期选择器的值
  setDatePickerValue: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 计算在数组中的索引
    const yearIndex = this.data.years.findIndex(y => y === year);
    const monthIndex = this.data.months.findIndex(m => m === month);
    const dayIndex = this.data.days.findIndex(d => d === day);
    
    this.setData({
      datePickerValue: [yearIndex, monthIndex, dayIndex],
      tempDate: date
    });
  },
  
  // 根据年月更新日期列表
  updateDays: function(year, month) {
    const days = [];
    // 获取指定年月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    this.setData({
      days: days
    });
    
    // 如果当前选择的日期超出了该月的最大天数，则调整为该月的最后一天
    if (this.data.datePickerValue[2] >= days.length) {
      const newValue = [...this.data.datePickerValue];
      newValue[2] = days.length - 1;
      this.setData({
        datePickerValue: newValue
      });
    }
  },

  // 显示日期选择器
  showDatePicker: function() {
    // 根据当前选择的标签页设置日期选择器的初始值
    if (this.data.datePickerTab === 'start' && this.data.product.promotionStart) {
      // 如果已经选择了开始日期，则使用该日期
      const dateParts = this.data.product.promotionStart.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      this.setDatePickerValue(date);
    } else if (this.data.datePickerTab === 'end' && this.data.product.promotionEnd) {
      // 如果已经选择了结束日期，则使用该日期
      const dateParts = this.data.product.promotionEnd.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      this.setDatePickerValue(date);
    } else {
      // 否则使用当前日期
      this.setDatePickerValue(new Date());
    }
    
    this.setData({
      showDatePicker: true
    });
  },
  
  // 隐藏日期选择器
  hideDatePicker: function() {
    this.setData({
      showDatePicker: false
    });
  },
  
  // 切换日期选择器标签页
  switchDatePickerTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    // 如果切换到的标签页与当前标签页相同，则不做任何操作
    if (tab === this.data.datePickerTab) {
      return;
    }
    
    // 保存当前选择的日期
    this.confirmCurrentDate();
    
    // 切换标签页
    this.setData({
      datePickerTab: tab
    });
    
    // 根据切换后的标签页设置日期选择器的值
    if (tab === 'start' && this.data.product.promotionStart) {
      // 如果已经选择了开始日期，则使用该日期
      const dateParts = this.data.product.promotionStart.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      this.setDatePickerValue(date);
    } else if (tab === 'end' && this.data.product.promotionEnd) {
      // 如果已经选择了结束日期，则使用该日期
      const dateParts = this.data.product.promotionEnd.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      this.setDatePickerValue(date);
    } else {
      // 否则使用当前日期
      this.setDatePickerValue(new Date());
    }
  },
  
  // 日期选择器变化处理
  onDatePickerChange: function(e) {
    const value = e.detail.value;
    
    // 获取选择的年月日
    const year = this.data.years[value[0]];
    const month = this.data.months[value[1]];
    
    // 如果年月发生变化，则更新日期列表
    if (value[0] !== this.data.datePickerValue[0] || value[1] !== this.data.datePickerValue[1]) {
      this.updateDays(year, month);
    }
    
    // 更新日期选择器的值
    this.setData({
      datePickerValue: value
    });
    
    // 更新临时日期
    const day = this.data.days[value[2]];
    this.data.tempDate = new Date(year, month - 1, day);
  },
  
  // 确认当前选择的日期
  confirmCurrentDate: function() {
    if (!this.data.tempDate) {
      return;
    }
    
    // 格式化日期为 "YYYY年MM月DD日"
    const year = this.data.tempDate.getFullYear();
    const month = this.data.tempDate.getMonth() + 1;
    const day = this.data.tempDate.getDate();
    const formattedDate = `${year}年${month}月${day}日`;
    
    // 根据当前标签页更新对应的日期
    if (this.data.datePickerTab === 'start') {
      this.setData({
        'product.promotionStart': formattedDate
      });
    } else {
      this.setData({
        'product.promotionEnd': formattedDate
      });
    }
  },
  
  // 确认日期选择
  confirmDatePicker: function() {
    // 确认当前选择的日期
    this.confirmCurrentDate();
    
    // 检查开始日期和结束日期的有效性
    if (this.data.product.promotionStart && this.data.product.promotionEnd) {
      const startDateStr = this.data.product.promotionStart.replace(/年|月/g, '-').replace(/日/g, '');
      const endDateStr = this.data.product.promotionEnd.replace(/年|月/g, '-').replace(/日/g, '');
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (startDate > endDate) {
        // 如果开始日期晚于结束日期，则将结束日期设置为开始日期
        this.setData({
          'product.promotionEnd': this.data.product.promotionStart
        });
      }
    }
    
    // 隐藏日期选择器
    this.hideDatePicker();
    
    // 检查表单有效性
    this.checkFormValidity();
  },

  // 获取商品分类
  fetchCategories: function() {
    wx.showLoading({
      title: '加载分类...',
    });
    
    api.product.getCategories().then(res => {
      wx.hideLoading();
      console.log('获取商品分类返回数据:', res);
      
      // 检查返回数据结构
      if (res && res.code === 200 && res.categories && Array.isArray(res.categories)) {
        this.setData({
          categories: res.categories
        });
        
        // 如果有待处理的分类匹配，执行它
        if (this.pendingCategoryMatch) {
          this.pendingCategoryMatch();
          this.pendingCategoryMatch = null;
        }
      } else {
        console.error('分类数据结构异常:', res);
        wx.showToast({
          title: '获取分类失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取分类失败:', err);
      
      wx.showToast({
        title: '获取分类失败，请重试',
        icon: 'none'
      });
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 监听输入变化
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const type = e.currentTarget.dataset.type;
    
    // 如果是金额类型，进行验证
    if (type === 'money') {
      // 验证是否为有效金额格式（允许数字和小数点，且最多两位小数）
      if (value && !/^\d+(\.\d{0,2})?$/.test(value)) {
        return; // 如果不是有效金额格式，不更新数据
      }
    }
    
    // 使用对象展开运算符更新特定字段
    this.setData({
      ['product.' + field]: value
    });
    
    // 检查必填字段是否已填写，以激活提交按钮
    this.checkFormValidity();
  },

  // 显示分类选择器
  showCategoryPicker: function() {
    this.setData({
      showCategoryPicker: true
    });
  },

  // 隐藏分类选择器
  hideCategoryPicker: function() {
    this.setData({
      showCategoryPicker: false
    });
  },

  // 选择分类
  selectCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.categories[index];
    
    this.setData({
      'product.categoryId': category.id,
      'product.categoryName': category.name,
      showCategoryPicker: false
    });
    
    // 检查必填字段是否已填写，以激活提交按钮
    this.checkFormValidity();
  },

  // 检查表单有效性
  checkFormValidity: function() {
    const product = this.data.product;
    
    // 检查所有必填字段是否已填写
    const requiredFields = {
      name: '商品标题',
      images: '商品图片',
      rewardAmount: '奖励金',
      categoryId: '商品分类',
      specification: '商品规格',
      sellingPrice: '售价',
      originalPrice: '原价',
      promotionStart: '活动开始日期',
      promotionEnd: '活动结束日期',
      stock: '库存'
    };
    
    let missingFields = [];
    
    for (const field in requiredFields) {
      if (field === 'images') {
        if (product.images.length === 0) {
          missingFields.push(requiredFields[field]);
        }
      } else if (!product[field] || product[field].toString().trim() === '') {
        missingFields.push(requiredFields[field]);
      }
    }
    
    if (missingFields.length > 0) {
      console.log('缺少必填字段:', missingFields);
    }
    
    const isValid = 
      product.name && product.name.trim() !== '' && 
      product.images && product.images.length > 0 &&
      product.sellingPrice && product.sellingPrice.toString().trim() !== '' && 
      product.originalPrice && product.originalPrice.toString().trim() !== '' && 
      product.rewardAmount && product.rewardAmount.toString().trim() !== '' && 
      product.categoryId && product.categoryId.toString().trim() !== '' && 
      product.specification && product.specification.trim() !== '' && 
      product.stock && product.stock.toString().trim() !== '' && 
      product.promotionStart && product.promotionStart.trim() !== '' &&
      product.promotionEnd && product.promotionEnd.trim() !== '';
    
    this.setData({
      isSubmitActive: isValid
    });
    
    return isValid;
  },

  // 选择图片
  chooseImage: function() {
    const currentCount = this.data.product.images.length;
    const remainCount = this.data.maxImageCount - currentCount;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: `最多上传${this.data.maxImageCount}张图片`,
        icon: 'none'
      });
      return;
    }
    
    // 显示操作菜单，让用户选择上传方式
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        // 用户选择从相册或拍照上传
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        
        wx.chooseMedia({
          count: remainCount, // 可以选择的图片数量上限
          mediaType: ['image'],
          sourceType: sourceType,
          sizeType: ['compressed'], // 压缩图片以提高上传速度
          success: (res) => {
            // 显示上传中状态
            this.setData({
              isUploading: true,
              uploadProgress: 0
            });
            
            // 获取已有的图片
            const oldImages = this.data.product.images;
            // 添加新选择的图片
            const newImages = res.tempFiles.map(file => file.tempFilePath);
            
            // 根据网络状态决定是上传图片还是本地模拟
            if (this.data.isOfflineMode || this.data.networkType === '2g') {
              // 离线模式或网络信号很差，提示用户
              wx.showToast({
                title: '网络状态不佳，请稍后再试',
                icon: 'none',
                duration: 2000
              });
              this.setData({
                isUploading: false
              });
            } else {
              // 正常模式，上传到服务器
              wx.showLoading({
                title: '准备上传...',
                mask: true
              });
              
              // 显示选择的图片数量
              wx.showToast({
                title: `已选择${newImages.length}张图片`,
                icon: 'none',
                duration: 1500
              });
              
              setTimeout(() => {
                this.uploadImages(newImages, oldImages);
              }, 1000);
            }
          }
        });
      }
    });
  },
  
  // 上传图片到服务器
  uploadImages: function(newImages, oldImages) {
    if (newImages.length === 0) {
      this.setData({
        isUploading: false
      });
      return;
    }
    
    wx.showLoading({
      title: '上传图片中...',
    });
    
    // 使用多图上传接口
    this.uploadMultipleImages(newImages)
      .then(uploadedImages => {
        wx.hideLoading();
        
        // 合并图片数组，确保格式正确
        const formattedOldImages = oldImages.map(img => {
          // 如果是对象格式，提取URL；否则直接使用字符串
          return typeof img === 'object' && img.imageUrl ? img.imageUrl : img;
        });
        
        const images = formattedOldImages.concat(uploadedImages);
        
        this.setData({
          'product.images': images,
          isUploading: false
        });
        
        // 检查表单有效性
        this.checkFormValidity();
      })
      .catch(error => {
        wx.hideLoading();
        console.error('上传图片失败:', error);
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        });
        this.setData({
          isUploading: false
        });
      });
  },

  // 上传多张图片
  uploadMultipleImages: function(filePaths) {
    return new Promise((resolve, reject) => {
      // 显示上传进度
      let progress = 0;
      const timer = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(timer);
        }
        this.setData({
          uploadProgress: progress
        });
      }, 200);
      console.log(api,'api.baseUrl')
      // 检查API基础URL是否有效
      if (!api || !api.baseUrl) {
        console.error('API对象或baseUrl未定义');
        clearInterval(timer);
        wx.hideLoading();
        wx.showToast({
          title: 'API配置错误',
          icon: 'none'
        });
        reject(new Error('API配置错误'));
        return;
      }
      
      // 构建多图上传的请求
      const uploadUrl = `${api.baseUrl}/v1/upload/multiple`;
      console.log('多图上传URL:', uploadUrl);
      
      // 由于微信小程序限制，我们需要分批上传
      // 这里采用批量上传接口，但每次只传一张图片
      const uploadedImages = [];
      
      // 创建递归上传函数
      const uploadOneByOne = (index) => {
        // 如果已经上传完所有图片，返回结果
        if (index >= filePaths.length) {
          clearInterval(timer);
          this.setData({
            uploadProgress: 100
          });
          console.log('全部图片上传完成:', uploadedImages);
          resolve(uploadedImages);
          return;
        }
        
        // 更新进度提示
        wx.showLoading({
          title: `上传第${index + 1}/${filePaths.length}张...`,
        });
        
        // 准备当前图片的FormData
        const formData = {
          type: 'product',
          fileCount: 1
        };
        
        // 上传当前图片
        wx.uploadFile({
          url: uploadUrl,
          filePath: filePaths[index],
          name: 'files', // 使用multiple接口的name参数
          header: {
            'Authorization': 'Bearer ' + wx.getStorageSync('token')
          },
          formData: formData,
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              console.log(`第${index + 1}张图片上传响应:`, data);
              
              // 处理返回数据，提取图片URL
              if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                // 新版API返回格式
                data.files.forEach(file => {
                  let imageUrl = file.path;
                  
                  // 如果URL不是以http开头，添加域名前缀
                  if (imageUrl && !imageUrl.startsWith('http')) {
                    // 从baseUrl中提取域名部分
                    const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                    const domain = domainMatch ? domainMatch[1] : '';
                    imageUrl = domain + imageUrl;
                  }
                  
                  if (imageUrl) {
                    uploadedImages.push(imageUrl); // 修改：直接使用URL字符串
                  }
                });
              } else if (data.code === 200 && data.data) {
                // 兼容旧版返回格式
                if (Array.isArray(data.data)) {
                  data.data.forEach(item => {
                    let imageUrl = '';
                    
                    if (item.path) {
                      imageUrl = item.path;
                    } else if (item.url) {
                      imageUrl = item.url;
                    } else if (item.files && Array.isArray(item.files) && item.files.length > 0) {
                      imageUrl = item.files[0].path || item.files[0].url;
                    }
                    
                    // 如果URL不是以http开头，添加域名前缀
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      // 从baseUrl中提取域名部分
                      const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                      const domain = domainMatch ? domainMatch[1] : '';
                      imageUrl = domain + imageUrl;
                    }
                    
                    if (imageUrl) {
                      uploadedImages.push(imageUrl); // 修改：直接使用URL字符串
                    }
                  });
                } else if (data.data.files && Array.isArray(data.data.files)) {
                  // 如果data.files是数组
                  data.data.files.forEach(file => {
                    let imageUrl = file.path || file.url;
                    
                    // 如果URL不是以http开头，添加域名前缀
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      // 从baseUrl中提取域名部分
                      const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                      const domain = domainMatch ? domainMatch[1] : '';
                      imageUrl = domain + imageUrl;
                    }
                    
                    if (imageUrl) {
                      uploadedImages.push(imageUrl); // 修改：直接使用URL字符串
                    }
                  });
                } else if (data.data.path || data.data.url) {
                  // 单图情况
                  let imageUrl = data.data.path || data.data.url;
                  
                  // 如果URL不是以http开头，添加域名前缀
                  if (imageUrl && !imageUrl.startsWith('http')) {
                    // 从baseUrl中提取域名部分
                    const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                    const domain = domainMatch ? domainMatch[1] : '';
                    imageUrl = domain + imageUrl;
                  }
                  
                  if (imageUrl) {
                    uploadedImages.push(imageUrl); // 修改：直接使用URL字符串
                  }
                }
              }
              
              // 继续上传下一张图片
              uploadOneByOne(index + 1);
            } catch (e) {
              console.error(`解析第${index + 1}张图片上传响应失败:`, e);
              // 继续尝试上传下一张图片
              uploadOneByOne(index + 1);
            }
          },
          fail: (err) => {
            console.error(`第${index + 1}张图片上传失败:`, err);
            // 继续尝试上传下一张图片
            uploadOneByOne(index + 1);
          }
        });
      };
      
      // 开始上传第一张图片
      uploadOneByOne(0);
    });
  },

  // 上传单张图片 (保留作为备用方法)
  uploadSingleImage: function(filePath) {
    return new Promise((resolve, reject) => {
      // 检查API基础URL是否有效
      if (!api || !api.baseUrl) {
        console.error('API对象或baseUrl未定义');
        wx.hideLoading();
        wx.showToast({
          title: 'API配置错误',
          icon: 'none'
        });
        reject(new Error('API配置错误'));
        return;
      }
      
      // 构建上传URL
      const uploadUrl = `${api.baseUrl}/v1/upload`;
      console.log('单图上传URL:', uploadUrl);
      
      wx.uploadFile({
        url: uploadUrl,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        formData: {
          type: 'product'
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            console.log('单图上传响应数据:', data);
            
            // 新的返回格式: {message: "Files uploaded successfully", files: [{filename, path, size, mimetype}]}
            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
              let imageUrl = data.files[0].path;
              
              // 如果URL不是以http开头，添加域名前缀
              if (imageUrl && !imageUrl.startsWith('http')) {
                // 从baseUrl中提取域名部分
                const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                const domain = domainMatch ? domainMatch[1] : '';
                imageUrl = domain + imageUrl;
              }
              
              resolve({ imageUrl: imageUrl });
            } else if (data.code === 200 && data.data) {
              // 兼容旧版返回格式
              let imageUrl = '';
              
              // 检查返回的数据结构
              if (Array.isArray(data.data) && data.data.length > 0) {
                const item = data.data[0];
                
                // 优先使用files中的path
                if (item.files && Array.isArray(item.files) && item.files.length > 0) {
                  imageUrl = item.files[0].path;
                } else if (item.path) {
                  // 如果没有files但有path字段
                  imageUrl = item.path;
                } else if (item.url) {
                  // 兼容旧版返回格式
                  imageUrl = item.url;
                }
              } else if (data.data.files && Array.isArray(data.data.files) && data.data.files.length > 0) {
                // 如果data.files是数组
                imageUrl = data.data.files[0].path || data.data.files[0].url;
              } else if (data.data.path) {
                // 直接使用path
                imageUrl = data.data.path;
              } else if (data.data.url) {
                // 兼容旧版返回格式
                imageUrl = data.data.url;
              }
              
              // 如果URL不是以http开头，添加域名前缀
              if (imageUrl && !imageUrl.startsWith('http')) {
                // 从baseUrl中提取域名部分
                const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
                const domain = domainMatch ? domainMatch[1] : '';
                imageUrl = domain + imageUrl;
              }
              
              if (imageUrl) {
                resolve({ imageUrl: imageUrl });
              } else {
                console.error('无法从响应中获取图片URL:', data);
                wx.showToast({
                  title: '图片上传失败',
                  icon: 'none'
                });
                resolve(null);
              }
            } else {
              console.error('上传图片返回错误:', data);
              wx.showToast({
                title: '图片上传失败',
                icon: 'none'
              });
              resolve(null);
            }
          } catch (e) {
            console.error('解析上传响应失败:', e);
            wx.showToast({
              title: '图片上传失败',
              icon: 'none'
            });
            resolve(null);
          }
        },
        fail: (err) => {
          console.error('上传图片请求失败:', err);
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
          resolve(null);
        }
      });
    });
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src;
    
    // 确保预览的URL列表格式正确
    const urls = this.data.product.images.map(img => {
      let imageUrl = img.imageUrl || img;
      
      // 如果URL不是以http开头，添加域名前缀
      if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http') && api && api.baseUrl) {
        // 从baseUrl中提取域名部分
        const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : '';
        imageUrl = domain + imageUrl;
      }
      
      return imageUrl;
    });
    
    // 同样处理当前选中的图片URL
    let currentUrl = current;
    if (currentUrl && typeof currentUrl === 'string' && !currentUrl.startsWith('http') && api && api.baseUrl) {
      const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
      const domain = domainMatch ? domainMatch[1] : '';
      currentUrl = domain + currentUrl;
    }
    
    wx.previewImage({
      current: currentUrl,
      urls: urls
    });
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.product.images;
    images.splice(index, 1);
    
    this.setData({
      'product.images': images
    });
    
    // 检查表单有效性
    this.checkFormValidity();
  },

  // 保存草稿
  saveDraft: function() {
    wx.showToast({
      title: '已保存草稿',
      icon: 'success'
    });
  },

  // 提交表单
  submitForm: function() {
    console.log('提交按钮被点击', this.data.isSubmitActive);
    
    // 重新检查表单有效性
    this.checkFormValidity();
    
    if (!this.data.isSubmitActive) {
      console.log('按钮未激活，不执行跳转');
      
      // 显示提示信息，告知用户需要填写所有必填字段
      wx.showToast({
        title: '请填写所有必填项',
        icon: 'none',
        duration: 2000
      });
      
      return; // 如果按钮未激活，不执行操作
    }
    
    // 直接提交
    this.doSubmitForm();
  },
  
  // 执行表单提交
  doSubmitForm: function() {
    console.log('按钮已激活，继续执行');
    
    // 显示加载中
    wx.showLoading({
      title: '提交中...',
    });
    
    // 获取店铺ID
    const shopId = wx.getStorageSync('shopId');
    
    // 准备图片数据 - 修改为直接使用URL字符串数组格式
    const formattedImages = this.data.product.images.map(img => {
      let imageUrl = img.imageUrl || img;
      
      // 如果URL不是以http开头，添加域名前缀
      if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http') && api && api.baseUrl) {
        const domainMatch = api.baseUrl.match(/^(https?:\/\/[^\/]+)/);
        const domain = domainMatch ? domainMatch[1] : '';
        imageUrl = domain + imageUrl;
      }
      
      return imageUrl; // 直接返回URL字符串，不包装成对象
    });
    
    // 转换日期格式为ISO格式
    let promotionStart = '';
    let promotionEnd = '';
    
    if (this.data.product.promotionStart) {
      const startDateParts = this.data.product.promotionStart.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const startYear = parseInt(startDateParts[0]);
      const startMonth = parseInt(startDateParts[1]).toString().padStart(2, '0');
      const startDay = parseInt(startDateParts[2]).toString().padStart(2, '0');
      promotionStart = `${startYear}-${startMonth}-${startDay}T23:59:59Z`;
    }
    
    if (this.data.product.promotionEnd) {
      const endDateParts = this.data.product.promotionEnd.replace(/年|月/g, '-').replace(/日/g, '').split('-');
      const endYear = parseInt(endDateParts[0]);
      const endMonth = parseInt(endDateParts[1]).toString().padStart(2, '0');
      const endDay = parseInt(endDateParts[2]).toString().padStart(2, '0');
      promotionEnd = `${endYear}-${endMonth}-${endDay}T23:59:59Z`;
    }
    
    // 准备提交的数据
    const productData = {
      name: this.data.product.name,
      description: this.data.product.description || '',
      shopId: shopId || '',
      images: formattedImages,
      sellingPrice: Number(this.data.product.sellingPrice),
      originalPrice: Number(this.data.product.originalPrice),
      rewardAmount: Number(this.data.product.rewardAmount),
      categoryId: this.data.product.categoryId,
      specification: this.data.product.specification,
      stock: parseInt(this.data.product.stock) || 0,
      promotionStart: promotionStart,
      promotionEnd: promotionEnd
    };
    
    console.log('提交商品数据:', productData);
    
    // 根据是否为编辑模式选择不同的API方法
    const apiMethod = this.data.isEdit ? 
      api.product.updateProduct(this.data.productId, productData) : 
      api.product.createProduct(productData);
    
    apiMethod.then(res => {
      wx.hideLoading();
      
      if (res && (res.code === 0 || res.code === 200)) {
        // 提交成功
        wx.showToast({
          title: this.data.isEdit ? '编辑成功' : '提交成功',
          icon: 'success',
          duration: 2000
        });
        
        // 返回上一页或跳转到成功页面
        if (this.data.isEdit) {
          wx.navigateBack();
        } else {
          wx.redirectTo({
            url: '/pages/productindex/newproduct/success',
            fail: function(err) {
              console.error('跳转失败', err);
              wx.switchTab({
                url: '/pages/productindex/index'
              });
            }
          });
        }
      } else {
        // 提交失败
        wx.showToast({
          title: res.message || '提交失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('提交商品失败:', err);
      wx.showToast({
        title: err.message || '提交失败，请重试',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 解析数字字段，确保返回有效数字
  parseNumberField: function(value) {
    if (!value || value === '') {
      return 0;
    }
    // 移除非数字字符（保留小数点）
    value = value.toString().replace(/[^\d.]/g, '');
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
  }
}) 