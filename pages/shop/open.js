// pages/shop/open.js
const api = require('../../utils/api');
const util = require('../../utils/util');

// 获取API基础URL
const baseUrl = api.baseUrl || 'http://shindou.icu:4000/api';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentStep: 0,
    region: ['', '', ''],
    form: {
      // 法人信息
      legalName: '',           // 法人姓名
      idCardNo: '',            // 身份证号
      idCardFront: '',         // 身份证正面照片URL
      idCardBack: '',          // 身份证反面照片URL
      wechatQrcode: '',        // 微信二维码URL
      
      // 店铺信息
      name: '',                 // 店铺名称
      description: '',          // 店铺描述
      logo: '',                 // 店铺logo
      contactName: '',         // 联系人姓名
      contactPhone: '',        // 联系电话
      region: ['', '', ''],     // 地区
      address: '',             // 省市区
      addressDetail: '',       // 详细地址
      storefront: '',          // 店铺门脸照片
      
      // 资质信息
      businessLicense: '',     // 营业执照照片URL
      businessPermit: ''         // 经营许可证照片URL
    },
    previewVisible: false,
    previewImage: '',
    currentStepComplete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置初始导航栏标题
    this.setNavigationBarTitle();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 检查并刷新token
    this.checkAndRefreshToken();
  },

  /**
   * 检查并刷新token
   */
  checkAndRefreshToken: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      console.log('未检测到登录状态，跳转到登录页面');
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/register?type=login'
        });
      }, 1500);
      return;
    }
    
    // 可以在这里添加刷新token的逻辑，如果有刷新token的API
    // 例如：调用API检查token是否有效，如果无效则跳转到登录页
    
    console.log('当前token:', token);
  },

  /**
   * 加载店铺信息
   */
  loadShopInfo: function() {
    // 不显示加载弹窗，静默加载
    api.shop.getShopInfo().then(res => {
      // 如果已有店铺信息，填充表单
      if (res && res.data) {
        this.setData({
          form: {
            ...this.data.form,
            ...res.data
          }
        });
      }
    }).catch(err => {
      // 如果是404错误（店铺不存在），不显示错误提示
      if (err.code !== 404) {
        console.error('加载店铺信息失败:', err);
        // 静默处理错误，不显示错误提示
      }
    });
  },

  /**
   * 设置导航栏标题
   */
  setNavigationBarTitle: function() {
    let title = '';
    
    switch (this.data.currentStep) {
      case 0:
        title = '法人信息';
        break;
      case 1:
        title = '店铺信息';
        break;
      case 2:
        title = '资质信息';
        break;
      default:
        title = '开店申请';
    }
    
    wx.setNavigationBarTitle({
      title: title
    });
  },

  /**
   * 设置当前步骤
   */
  setStep: function (e) {
    const step = parseInt(e.currentTarget.dataset.step);
    
    // 检查是否可以跳转到该步骤
    // 只允许跳转到已完成的步骤或下一个待完成的步骤
    if (step > this.data.currentStep) {
      // 如果要跳转到更高的步骤，需要验证当前步骤是否已完成
      let canProceed = false;
      
      if (this.data.currentStep === 0) {
        canProceed = this.validateLegalInfo();
      } else if (this.data.currentStep === 1) {
        canProceed = this.validateShopInfo();
      }
      
      if (!canProceed) {
        util.showError('请先完成当前步骤');
        return;
      }
    }
    
    // 设置当前步骤
    this.setData({
      currentStep: step
    });
    
    // 滚动页面到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    
    // 设置导航栏标题
    this.setNavigationBarTitle();
  },

  /**
   * 下一步
   */
  nextStep: function() {
    // 当前是最后一步，提交表单
    if (this.data.currentStep === 2) {
      // 验证资质信息
      if (!this.validateQualificationInfo()) {
        return;
      }
      
      // 显示加载状态
      wx.showLoading({
        title: '提交中...',
        mask: true
      });
      
      // 创建提交用的数据对象，排除region和logo字段
      const submitData = {
        legalName: this.data.form.legalName,
        idCardNo: this.data.form.idCardNo,
        idCardFront: this.data.form.idCardFront,
        idCardBack: this.data.form.idCardBack,
        wechatQrcode: this.data.form.wechatQrcode,
        name: this.data.form.name,
        description: this.data.form.description,
        contactName: this.data.form.contactName,
        contactPhone: this.data.form.contactPhone,
        address: this.data.form.address,
        addressDetail: this.data.form.addressDetail,
        storefront: this.data.form.storefront,
        businessLicense: this.data.form.businessLicense,
        businessPermit: this.data.form.businessPermit
      };
      
      // 调用提交店铺信息的API，使用筛选后的数据
      api.shop.submitShopInfo(submitData)
        .then(res => {
          wx.hideLoading();
          
          // 如果返回成功(code为200)
          if (res.code === 200) {
            console.log('店铺审核提交成功:', res);
            
            // 保存店铺ID(如果有)
            if (res.data && res.data.shopId) {
              wx.setStorageSync('shopId', res.data.shopId);
            }
            
            // 显示成功提示并跳转到首页
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500,
              mask: true,
              complete: () => {
                // 成功后直接跳转到首页(productindex/index)
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/productindex/index'
                  });
                }, 1500);
              }
            });
          } else {
            // 显示错误提示
            wx.showToast({
              title: res.message || '提交失败',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('提交店铺信息失败:', err);
          
          // 显示错误提示
          wx.showToast({
            title: err.message || '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
        });
    } else {
      // 不是最后一步，验证当前步骤并前进
      // 根据当前步骤使用对应的验证方法
      let isValid = false;
      
      if (this.data.currentStep === 0) {
        isValid = this.validateLegalInfo();
      } else if (this.data.currentStep === 1) {
        isValid = this.validateShopInfo();
      }
      
      if (isValid) {
        this.setData({
          currentStep: this.data.currentStep + 1
        });
        // 设置导航栏标题
        this.setNavigationBarTitle();
      }
    }
  },

  /**
   * 验证法人信息
   */
  validateLegalInfo: function () {
    const { legalName, idCardNo, idCardFront, idCardBack, wechatQrcode } = this.data.form;
    
    if (!legalName) {
      util.showError('请输入法人姓名');
      return false;
    }
    
    if (!idCardNo) {
      util.showError('请输入身份证号');
      return false;
    }
    
    if (!util.isValidIdCard(idCardNo)) {
      util.showError('身份证号格式不正确');
      return false;
    }
    
    if (!idCardFront) {
      util.showError('请上传身份证头像面');
      return false;
    }
    
    if (!idCardBack) {
      util.showError('请上传身份证国徽面');
      return false;
    }
    
    if (!wechatQrcode) {
      util.showError('请上传微信二维码');
      return false;
    }
    
    return true;
  },

  /**
   * 验证店铺信息
   */
  validateShopInfo: function () {
    const { name, contactName, contactPhone, region, address, addressDetail, storefront } = this.data.form;
    
    if (!name) {
      util.showError('请输入店铺名称');
      return false;
    }
    
    if (!contactName) {
      util.showError('请输入联系人姓名');
      return false;
    }
    
    if (!contactPhone) {
      util.showError('请输入联系手机');
      return false;
    }
    
    if (!util.isValidPhone(contactPhone)) {
      util.showError('手机号格式不正确');
      return false;
    }
    
    if (!region || !region[0]) {
      util.showError('请选择店铺地址');
      return false;
    }
    
    if (!address) {
      util.showError('请选择省市区');
      return false;
    }
    
    if (!addressDetail) {
      util.showError('请输入详细地址');
      return false;
    }
    
    if (!storefront) {
      util.showError('请上传店铺门脸照');
      return false;
    }
    
    return true;
  },

  /**
   * 验证资质信息
   */
  validateQualificationInfo: function () {
    const { businessLicense, businessPermit } = this.data.form;
    
    if (!businessLicense) {
      util.showError('请上传营业执照');
      return false;
    }
    
    if (!businessPermit) {
      util.showError('请上传经营许可证');
      return false;
    }
    
    return true;
  },

  /**
   * 输入法人姓名
   */
  inputLegalName: function (e) {
    this.setData({
      'form.legalName': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 输入身份证号
   */
  inputIdCardNo: function (e) {
    this.setData({
      'form.idCardNo': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 通用上传图片方法
   * @param {string} type - 上传类型，可选值: 'idCardFront', 'idCardBack', 'wechatQrcode', 'storefront', 'businessLicense', 'businessPermit', 'logo'
   */
  uploadImageByType: function(type) {
    // 先检查登录状态
    this.testLoginStatus();
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 使用修复版上传函数
        this.uploadImageFixed(tempFilePath, (url) => {
          // 根据类型设置不同的表单字段
          let formField = '';
          let fieldDesc = '';
          switch(type) {
            case 'idCardFront':
              formField = 'form.idCardFront'; // 使用WXML中的字段名
              fieldDesc = '身份证正面';
              break;
            case 'idCardBack':
              formField = 'form.idCardBack'; // 使用WXML中的字段名
              fieldDesc = '身份证反面';
              break;
            case 'wechatQrcode':
              formField = 'form.wechatQrcode'; // 使用WXML中的字段名
              fieldDesc = '微信二维码';
              break;
            case 'storefront':
              formField = 'form.storefront';
              fieldDesc = '店铺门脸照';
              break;
            case 'businessLicense':
              formField = 'form.businessLicense'; // 使用WXML中的字段名
              fieldDesc = '营业执照';
              break;
            case 'businessPermit':
              formField = 'form.businessPermit'; // 使用WXML中的字段名
              fieldDesc = '经营许可证';
              break;
            case 'logo':
              formField = 'form.logo';
              fieldDesc = '店铺logo';
              break;
            default:
              console.error('未知的上传类型:', type);
              return;
          }
          
          console.log(`设置${fieldDesc}图片URL:`, url);
          
          // 设置表单字段值
          this.setData({
            [formField]: url
          });
          
          // 强制更新数据，确保视图刷新
          this.setData({
            form: this.data.form
          });
          
          // 显示上传成功提示
          wx.showToast({
            title: `${fieldDesc}上传成功`,
            icon: 'success',
            duration: 1500
          });
          
          this.updateCurrentStepComplete();
        });
      }
    });
  },

  /**
   * 通用删除图片方法
   * @param {string} type - 删除类型，可选值: 'idCardFront', 'idCardBack', 'wechatQrcode', 'storefront', 'businessLicense', 'businessPermit', 'logo'
   */
  deleteImageByType: function(type) {
    let formField = '';
    
    switch (type) {
      case 'idCardFront':
        formField = 'form.idCardFront';
        break;
      case 'idCardBack':
        formField = 'form.idCardBack';
        break;
      case 'wechatQrcode':
        formField = 'form.wechatQrcode';
        break;
      case 'storefront':
        formField = 'form.storefront';
        break;
      case 'businessLicense':
        formField = 'form.businessLicense';
        break;
      case 'businessPermit':
        formField = 'form.businessPermit';
        break;
      case 'logo':
        formField = 'form.logo';
        break;
      default:
        console.error('未知的删除类型:', type);
        return;
    }
    
    // 设置对应字段为空
    const data = {};
    data[formField] = '';
    
    this.setData(data);
    this.updateCurrentStepComplete();
    
    console.log(`已删除${type}图片`);
  },

  /**
   * 上传身份证
   */
  uploadIdCard: function (e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'front') {
      this.uploadImageByType('idCardFront');
    } else {
      this.uploadImageByType('idCardBack');
    }
  },

  /**
   * 删除身份证照片
   */
  deleteIdCard: function (e) {
    const type = e.currentTarget.dataset.type;
    if (type === 'front') {
      this.deleteImageByType('idCardFront');
    } else {
      this.deleteImageByType('idCardBack');
    }
  },

  /**
   * 上传微信二维码
   */
  uploadWxQrCode: function () {
    this.uploadImageByType('wechatQrcode');
  },

  /**
   * 删除微信二维码
   */
  deleteWxQrCode: function () {
    this.deleteImageByType('wechatQrcode');
  },

  /**
   * 输入联系人姓名
   */
  inputContactName: function (e) {
    this.setData({
      'form.contactName': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 输入联系手机
   */
  inputContactPhone: function (e) {
    this.setData({
      'form.contactPhone': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 输入店铺名称
   */
  inputShopName: function (e) {
    this.setData({
      'form.name': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 选择地区
   */
  regionChange: function (e) {
    this.setData({
      'form.region': e.detail.value,
      'form.address': e.detail.value.join(' ') // 将省市区合并为一个字符串存入address字段
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 输入详细地址
   */
  inputAddress: function (e) {
    this.setData({
      'form.addressDetail': e.detail.value
    });
    this.updateCurrentStepComplete();
  },

  /**
   * 上传店铺门脸照
   */
  uploadStorefront: function () {
    this.uploadImageByType('storefront');
  },

  /**
   * 删除店铺门脸照
   */
  deleteStorefront: function () {
    this.deleteImageByType('storefront');
  },

  /**
   * 上传营业执照
   */
  uploadLicenseImage: function () {
    this.uploadImageByType('businessLicense');
  },

  /**
   * 删除营业执照
   */
  deleteLicenseImage: function () {
    this.deleteImageByType('businessLicense');
  },

  /**
   * 上传经营许可证
   */
  uploadPermitImage: function () {
    this.uploadImageByType('businessPermit');
  },

  /**
   * 删除经营许可证
   */
  deletePermitImage: function () {
    this.deleteImageByType('businessPermit');
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    const url = e.currentTarget.dataset.url;
    console.log('预览图片URL:', url);
    
    if (!url) {
      console.log('图片URL为空，无法预览');
      return;
    }
    
    // 使用微信原生的图片预览功能
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },

  /**
   * 关闭预览
   */
  closePreview: function () {
    this.setData({
      previewVisible: false,
      previewImage: ''
    });
  },

  /**
   * 更新当前步骤是否完成
   */
  updateCurrentStepComplete: function () {
    let isComplete = false;
    
    if (this.data.currentStep === 0) {
      isComplete = this.validateLegalInfo();
    } else if (this.data.currentStep === 1) {
      isComplete = this.validateShopInfo();
    } else if (this.data.currentStep === 2) {
      isComplete = this.validateQualificationInfo();
    }
    
    this.setData({
      currentStepComplete: isComplete
    });
  },

  /**
   * 测试不同的上传方式（用于调试）
   */
  testUpload: function(tempFilePath, callback) {
    // 获取token
    const token = wx.getStorageSync('token');
    console.log('当前token:', token);
    
    // 尝试不同的认证方式
    const authHeaders = [
      { name: 'Bearer Token', header: { 'Authorization': 'Bearer ' + token } },
      { name: '纯Token', header: { 'Authorization': token } },
      { name: 'Token Header', header: { 'token': token } },
      { name: 'X-Token', header: { 'X-Token': token } },
      { name: '无认证', header: {} }
    ];
    
    // 尝试不同的字段名
    const fieldNames = ['file', 'image', 'photo', 'upload'];
    
    // 尝试不同的URL
    const urls = [
      'https://api.yourdomain.com/api/v1/upload',
      'https://api.yourdomain.com/api/upload',
      'https://api.yourdomain.com/v1/upload'
    ];
    
    // 选择一种组合进行测试
    const authIndex = 1; // 使用纯Token
    const fieldIndex = 0; // 使用'file'字段名
    const urlIndex = 0;   // 使用第一个URL
    
    console.log(`测试上传: URL=${urls[urlIndex]}, 字段=${fieldNames[fieldIndex]}, 认证=${authHeaders[authIndex].name}`);
    
    wx.showLoading({
      title: '测试上传中...',
      mask: true
    });
    
    // 添加一些可能需要的formData
    const formData = {
      type: 'shop',
      token: token // 有些API可能需要在formData中传递token
    };
    
    console.log('上传请求:', {
      url: urls[urlIndex],
      fieldName: fieldNames[fieldIndex],
      header: authHeaders[authIndex].header,
      formData: formData
    });
    
    wx.uploadFile({
      url: urls[urlIndex],
      filePath: tempFilePath,
      name: fieldNames[fieldIndex],
      formData: formData,
      header: authHeaders[authIndex].header,
      success: (res) => {
        wx.hideLoading();
        console.log('测试上传响应:', res);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          wx.showToast({
            title: '测试上传成功',
            icon: 'success'
          });
          
          try {
            const data = JSON.parse(res.data);
            console.log('解析后的测试响应:', data);
            
            // 处理返回的数据
            let imageUrl = '';
            if (data.url) {
              imageUrl = data.url;
            } else if (data.path) {
              // 如果返回的是path字段，需要添加基础URL（不包含/api部分）
              const domainUrl = baseUrl.replace(/\/api$/, '');
              imageUrl = domainUrl + data.path;
            }
            
            if (imageUrl) {
              callback && callback(imageUrl);
            } else {
              callback && callback(data.url); // 兼容旧版本
            }
          } catch (e) {
            console.error('解析测试响应失败:', e, res.data);
          }
        } else {
          wx.showToast({
            title: `错误: ${res.statusCode}`,
            icon: 'none'
          });
          
          // 尝试解析错误响应
          try {
            const errorData = JSON.parse(res.data);
            console.error('错误详情:', errorData);
          } catch (e) {
            console.error('无法解析错误响应:', res.data);
          }
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('测试上传失败:', err);
        wx.showToast({
          title: '测试失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 测试API可访问性
   */
  testApiAccess: function() {
    const token = wx.getStorageSync('token');
    const urls = [
      'https://api.yourdomain.com/api/v1/upload',
      'https://api.yourdomain.com/api/upload',
      'https://api.yourdomain.com/v1/upload'
    ];
    
    // 显示加载提示
    wx.showLoading({
      title: '测试API...',
      mask: true
    });
    
    // 测试第一个URL
    wx.request({
      url: urls[0],
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        console.log('API访问测试响应:', res);
        wx.hideLoading();
        
        wx.showToast({
          title: `状态: ${res.statusCode}`,
          icon: 'none'
        });
      },
      fail: (err) => {
        console.error('API访问测试失败:', err);
        wx.hideLoading();
        
        wx.showToast({
          title: '无法连接到API',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 上传图片通用函数 - 修改版
   */
  uploadImageFixed: function(tempFilePath, callback) {
    // 获取token
    const token = wx.getStorageSync('token');
    
    // 检查token是否存在
    if (!token) {
      console.error('上传失败: 未找到token，请先登录');
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      
      // 延迟跳转到登录页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/register?type=login'
        });
      }, 1500);
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '上传中...',
      mask: true
    });
    
    // 使用正确的API URL和参数
    const url = `${baseUrl}/v1/upload`; // 使用baseUrl变量
    
    console.log('尝试上传图片:', {
      url: url,
      token: token
    });
    
    // 调用API上传图片
    wx.uploadFile({
      url: url,
      filePath: tempFilePath,
      name: 'file', // 根据实际API调整
      formData: {
        type: 'shop', // 指定上传类型
        token: token // 有些API需要在formData中传递token
      },
      header: {
        'Authorization': 'Bearer ' + token // 添加Bearer前缀
      },
      success: (res) => {
        wx.hideLoading();
        console.log('上传响应:', res);
        
        // 检查状态码
        if (res.statusCode === 403) {
          console.error('上传图片被拒绝(403):', res);
          
          // 尝试解析错误响应
          try {
            const errorData = JSON.parse(res.data);
            console.error('403错误详情:', errorData);
            
            wx.showToast({
              title: errorData.message || '无权限上传，请重新登录',
              icon: 'none',
              duration: 2000
            });
          } catch (e) {
            wx.showToast({
              title: '无权限上传，请重新登录',
              icon: 'none',
              duration: 2000
            });
          }
          
          // 延迟跳转到登录页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/register?type=login'
            });
          }, 1500);
          
          return;
        }
        
        // 解析响应数据
        try {
          const data = JSON.parse(res.data);
          console.log('解析后的上传响应:', data);
          
          // 修复处理返回的数据
          let imageUrl = '';
          
          // 处理成功状态
          if (data.code === 200 && data.data && data.data.url) {
            imageUrl = data.data.url;
            console.log('图片上传成功，URL:', imageUrl);
            
            // 调用回调函数，传递图片URL
            callback && callback(imageUrl);
            
            // 确保图片URL在页面上显示
            this.setData({
              previewImage: imageUrl
            });
            
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
            return;
          } else if (data.url) {
            // 兼容老的接口格式
            imageUrl = data.url;
          } else if (data.path) {
            // 如果返回的是path字段，需要添加基础URL（不包含/api部分）
            const domainUrl = baseUrl.replace(/\/api$/, '');
            imageUrl = domainUrl + data.path;
          } else if (data.data && data.data.path) {
            // 可能在data.data下有path
            const domainUrl = baseUrl.replace(/\/api$/, '');
            imageUrl = domainUrl + data.data.path;
          }
          
          if (imageUrl) {
            console.log('图片上传成功，URL:', imageUrl);
            
            // 调用回调函数，传递图片URL
            callback && callback(imageUrl);
            
            // 确保图片URL在页面上显示
            this.setData({
              previewImage: imageUrl
            });
            
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          } else {
            console.error('找不到图片URL:', data);
            wx.showToast({
              title: '上传失败: ' + (data.message || '未知错误'),
              icon: 'none'
            });
          }
        } catch (e) {
          console.error('解析上传响应失败:', e, res.data);
          wx.showToast({
            title: '上传失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传请求失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 测试登录状态
   */
  testLoginStatus: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/register?type=login'
        });
      }, 1500);
      return false;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '检查登录状态...',
      mask: true
    });
    
    // 调用API检查token是否有效
    wx.request({
      url: `${baseUrl}/v1/users/info`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token // 添加Bearer前缀
      },
      success: (res) => {
        wx.hideLoading();
        console.log('登录状态检查结果:', res);
        
        if (res.statusCode === 200) {
          wx.showToast({
            title: '登录状态有效',
            icon: 'success',
            duration: 1500
          });
          return true;
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.error('登录已过期或无效');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          
          // 清除本地token
          wx.removeStorageSync('token');
          
          // 延迟跳转到登录页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/register?type=login'
            });
          }, 1500);
          return false;
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('检查登录状态失败:', err);
        return false;
      }
    });
  },

  /**
   * 查看已上传的图片
   * @param {string} type - 图片类型，可选值: 'idCardFront', 'idCardBack', 'wechatQrcode', 'storefront', 'businessLicense', 'businessPermit', 'logo'
   */
  viewUploadedImage: function(type) {
    let imageUrl = '';
    let fieldDesc = '';
    
    // 根据类型获取不同的图片URL
    switch(type) {
      case 'idCardFront':
        imageUrl = this.data.form.idCardFront;
        fieldDesc = '身份证正面';
        break;
      case 'idCardBack':
        imageUrl = this.data.form.idCardBack;
        fieldDesc = '身份证反面';
        break;
      case 'wechatQrcode':
        imageUrl = this.data.form.wechatQrcode;
        fieldDesc = '微信二维码';
        break;
      case 'storefront':
        imageUrl = this.data.form.storefront;
        fieldDesc = '店铺门脸照';
        break;
      case 'businessLicense':
        imageUrl = this.data.form.businessLicense;
        fieldDesc = '营业执照';
        break;
      case 'businessPermit':
        imageUrl = this.data.form.businessPermit;
        fieldDesc = '经营许可证';
        break;
      case 'logo':
        imageUrl = this.data.form.logo;
        fieldDesc = '店铺Logo';
        break;
      default:
        console.error('未知的图片类型:', type);
        return;
    }
    
    console.log('查看图片URL:', imageUrl);
    
    // 如果没有图片，提示用户
    if (!imageUrl) {
      wx.showToast({
        title: `暂无${fieldDesc}图片`,
        icon: 'none'
      });
      return;
    }
    
    // 使用微信预览图片API
    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    });
  },
}); 