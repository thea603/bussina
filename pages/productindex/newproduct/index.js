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
    
    // 预设图片URL列表
    presetImages: [
      { imageUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01xA4P9B1d3sY5xUOPk_!!6000000003683-0-tps-1080-1080.jpg' },
      { imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN018v4k441uD0IKPEFNi_!!6000000006007-0-tps-1080-1080.jpg' },
      { imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01WRz3Xy1OcCnYVBnUl_!!6000000001728-0-tps-1080-1080.jpg' },
      { imageUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01LLqGHJ1OkJYi8CtpZ_!!6000000001747-0-tps-1080-1080.jpg' },
      { imageUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01Uo5nHJ1ZVVBRKcJBl_!!6000000003198-0-tps-1080-1080.jpg' }
    ]
  },

  onLoad: function(options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 获取商品分类
    this.fetchCategories();
    
    // 初始化日期选择器数据
    this.initDatePicker();
    
    // 自动添加一张预设图片
    this.addInitialPresetImage();
    
    // 判断是否是编辑模式
    if (options.type === 'edit') {
      // 设置页面标题为"编辑商品"
      wx.setNavigationBarTitle({
        title: '编辑商品'
      });
      
      // 如果有商品ID，加载商品信息
      if (options.id) {
        // 这里应该从服务器获取商品信息
        // 模拟获取商品信息
        const productId = parseInt(options.id);
        // 加载商品信息的逻辑...
      }
    } else {
      // 新增商品模式
      wx.setNavigationBarTitle({
        title: '新增商品'
      });
    }
  },

  // 自动添加一张预设图片
  addInitialPresetImage: function() {
    // 如果已经有图片，则不添加
    if (this.data.product.images && this.data.product.images.length > 0) {
      return;
    }
    
    // 随机选择一张预设图片
    const randomIndex = Math.floor(Math.random() * this.data.presetImages.length);
    const randomImage = this.data.presetImages[randomIndex];
    
    // 添加到商品图片列表
    this.setData({
      'product.images': [randomImage]
    });
    
    console.log('已自动添加预设图片:', randomImage);
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
    
    // 调用获取分类接口
    api.product.getCategories().then(res => {
      wx.hideLoading();
      
      if (res && res.code === 0 && res.data) {
        this.setData({
          categories: res.data
        });
      } else {
        // 接口返回错误，使用模拟数据
        this.useMockCategories();
        wx.showToast({
          title: '使用本地分类数据',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('获取分类失败:', err);
      
      // 接口调用失败，使用模拟数据
      this.useMockCategories();
      wx.showToast({
        title: '使用本地分类数据',
        icon: 'none'
      });
    });
  },
  
  // 使用模拟分类数据
  useMockCategories: function() {
    // 模拟商品分类数据
    const mockCategories = [
      { id: '1', name: '食品饮料' },
      { id: '2', name: '服装鞋帽' },
      { id: '3', name: '家用电器' },
      { id: '4', name: '手机数码' },
      { id: '5', name: '家居家装' },
      { id: '6', name: '美妆护肤' },
      { id: '7', name: '母婴用品' },
      { id: '8', name: '图书音像' },
      { id: '9', name: '运动户外' },
      { id: '10', name: '其他' }
    ];
    
    this.setData({
      categories: mockCategories
    });
    
    console.log('使用模拟分类数据:', mockCategories);
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
    
    // 显示操作菜单，让用户选择使用预设图片还是上传新图片
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照', '使用预设图片'],
      success: (res) => {
        if (res.tapIndex === 2) {
          // 用户选择使用预设图片
          this.usePresetImages();
        } else {
          // 用户选择从相册或拍照上传
          const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
          
          wx.chooseMedia({
            count: remainCount,
            mediaType: ['image'],
            sourceType: sourceType,
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
                // 离线模式或网络信号很差，使用本地模拟
                this.mockUploadImages(newImages, oldImages);
              } else {
                // 正常模式，上传到服务器
                this.uploadImages(newImages, oldImages);
              }
            }
          });
        }
      }
    });
  },
  
  // 本地模拟上传图片
  mockUploadImages: function(newImages, oldImages) {
    if (newImages.length === 0) {
      this.setData({
        isUploading: false
      });
      return;
    }
    
    const totalCount = newImages.length;
    let completedCount = 0;
    const uploadedImages = [];
    
    // 模拟上传进度
    const timer = setInterval(() => {
      const progress = Math.min(100, Math.floor((completedCount / totalCount) * 100) + 5);
      this.setData({
        uploadProgress: progress
      });
      
      if (progress >= 100) {
        clearInterval(timer);
      }
    }, 200);
    
    // 模拟网络延迟
    setTimeout(() => {
      newImages.forEach((path, index) => {
        // 模拟上传成功，直接使用本地路径
        uploadedImages.push({ 
          imageUrl: path,
          isLocalImage: true // 标记为本地图片
        });
        
        completedCount++;
        
        // 所有图片处理完成
        if (completedCount === totalCount) {
          clearInterval(timer);
          
          // 合并图片数组，确保格式正确
          const formattedOldImages = oldImages.map(img => {
            if (typeof img === 'string') {
              return { imageUrl: img };
            }
            return img;
          });
          
          const images = formattedOldImages.concat(uploadedImages);
          
          this.setData({
            'product.images': images,
            isUploading: false,
            uploadProgress: 100
          });
          
          // 检查表单有效性
          this.checkFormValidity();
          
          wx.showToast({
            title: '图片已暂存在本地',
            icon: 'success'
          });
        }
      });
    }, 1500); // 模拟1.5秒的处理时间
  },

  // 使用预设图片
  usePresetImages: function() {
    // 显示加载中
    wx.showLoading({
      title: '加载预设图片...',
    });
    
    // 获取当前已有的图片
    const currentImages = this.data.product.images;
    const currentCount = currentImages.length;
    const remainCount = this.data.maxImageCount - currentCount;
    
    // 如果没有剩余空间，直接返回
    if (remainCount <= 0) {
      wx.hideLoading();
      wx.showToast({
        title: `最多上传${this.data.maxImageCount}张图片`,
        icon: 'none'
      });
      return;
    }
    
    // 从预设图片中选择未使用的图片
    const unusedPresetImages = this.data.presetImages.filter(presetImg => {
      // 检查预设图片是否已经在当前图片列表中
      return !currentImages.some(currentImg => {
        const currentUrl = currentImg.imageUrl || currentImg;
        return currentUrl === presetImg.imageUrl;
      });
    });
    
    // 如果没有未使用的预设图片，提示用户
    if (unusedPresetImages.length === 0) {
      wx.hideLoading();
      wx.showToast({
        title: '所有预设图片已使用',
        icon: 'none'
      });
      return;
    }
    
    // 计算要添加的图片数量（不超过剩余空间）
    const addCount = Math.min(remainCount, unusedPresetImages.length);
    // 选择要添加的图片
    const imagesToAdd = unusedPresetImages.slice(0, addCount);
    
    // 模拟上传进度
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      this.setData({
        isUploading: true,
        uploadProgress: progress
      });
      
      if (progress >= 100) {
        clearInterval(timer);
        
        // 添加预设图片到当前图片列表
        const newImages = [...currentImages, ...imagesToAdd];
        
        this.setData({
          'product.images': newImages,
          isUploading: false
        });
        
        wx.hideLoading();
        wx.showToast({
          title: `已添加${addCount}张预设图片`,
          icon: 'success'
        });
        
        // 检查表单有效性
        this.checkFormValidity();
      }
    }, 100);
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
    
    const totalCount = newImages.length;
    let completedCount = 0;
    const uploadedImages = [];
    
    newImages.forEach((path, index) => {
      this.uploadSingleImage(path)
        .then(imageUrl => {
          completedCount++;
          
          if (imageUrl) {
            // 使用正确的格式添加图片
            uploadedImages.push({ imageUrl: imageUrl });
          }
          
          // 更新上传进度
          const progress = Math.floor((completedCount / totalCount) * 100);
          this.setData({
            uploadProgress: progress
          });
          
          // 所有图片上传完成
          if (completedCount === totalCount) {
            wx.hideLoading();
            
            // 合并图片数组，确保格式正确
            const formattedOldImages = oldImages.map(img => {
              // 如果已经是正确格式则直接使用，否则转换格式
              return typeof img === 'string' ? { imageUrl: img } : img;
            });
            
            const images = formattedOldImages.concat(uploadedImages);
            
            this.setData({
              'product.images': images,
              isUploading: false
            });
            
            // 检查表单有效性
            this.checkFormValidity();
          }
        });
    });
  },

  // 上传单张图片
  uploadSingleImage: function(filePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${api.baseUrl}/v1/upload`,
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
            if (data.code === 0 && data.data && data.data.url) {
              resolve(data.data.url);
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
      return img.imageUrl || img;
    });
    
    wx.previewImage({
      current: current,
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
    
    // 检查是否有本地图片
    const hasLocalImages = this.data.product.images.some(img => img.isLocalImage);
    
    if (hasLocalImages && !this.data.isOfflineMode) {
      // 如果有本地图片且当前不是离线模式，提示用户
      wx.showModal({
        title: '提示',
        content: '检测到有本地暂存的图片，建议在网络良好时重新上传，是否继续提交？',
        success: (res) => {
          if (res.confirm) {
            // 用户确认，继续提交
            this.doSubmitForm();
          }
        }
      });
    } else {
      // 直接提交
      this.doSubmitForm();
    }
  },
  
  // 执行表单提交
  doSubmitForm: function() {
    console.log('按钮已激活，继续执行');
    
    // 显示加载中
    wx.showLoading({
      title: '提交中...',
    });
    
    // 确保图片格式正确
    const formattedImages = this.data.product.images.map(img => {
      return { imageUrl: img.imageUrl || img };
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
      shopId:7,
      images: {
        create: formattedImages
      }, // 使用正确格式的图片数组
      sellingPrice: parseFloat(this.data.product.sellingPrice),
      originalPrice: parseFloat(this.data.product.originalPrice),
      rewardAmount: parseFloat(this.data.product.rewardAmount),
      categoryId: this.data.product.categoryId,
      specification: this.data.product.specification,
      stock: parseInt(this.data.product.stock),
      promotionStart: promotionStart,
      promotionEnd: promotionEnd
    };
    
    console.log('提交商品数据:', productData);
    
    // 如果是离线模式，模拟提交
    if (this.data.isOfflineMode) {
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '已保存到本地',
          icon: 'success',
          duration: 2000
        });
        
        // 可以将数据保存到本地存储
        try {
          const drafts = wx.getStorageSync('product_drafts') || [];
          drafts.push({
            data: productData,
            timestamp: new Date().getTime()
          });
          wx.setStorageSync('product_drafts', drafts);
        } catch (e) {
          console.error('保存草稿失败:', e);
        }
        
        // 跳转到成功页面或返回列表
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 正常模式，调用API提交商品
    api.product.createProduct(productData).then(res => {
      wx.hideLoading();
      
      if (res && res.code === 0) {
        // 提交成功
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000
        });
        
        // 跳转到成功页面
        wx.redirectTo({
          url: '/pages/productindex/newproduct/success',
          fail: function(err) {
            console.error('跳转失败', err);
            
            // 尝试使用另一种方式跳转
            wx.navigateTo({
              url: '/pages/productindex/newproduct/success',
              fail: function(err2) {
                console.error('第二次尝试跳转失败', err2);
                
                // 如果都失败，尝试跳转到一个已知可用的页面
                wx.switchTab({
                  url: '/pages/productindex/index'
                });
              }
            });
          }
        });
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
  }
}) 