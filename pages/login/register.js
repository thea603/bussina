// pages/login/register.js
const api = require('../../utils/api');
const util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '', // 手机号
    verifyCode: '', // 验证码
    countdown: 0, // 倒计时
    isPhoneValid: false, // 手机号是否有效
    isVerifyCodeValid: false, // 验证码是否有效
    phoneErrorMsg: '', // 手机号错误信息
    verifyCodeErrorMsg: '', // 验证码错误信息
    isAgreeProtocol: false, // 是否同意协议
    pageType: '' // 页面类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 根据传入的type参数设置页面标题
    if (options.type === 'login') {
      wx.setNavigationBarTitle({
        title: '手机号登录'
      });
      this.setData({
        pageType: 'login'
      });
    } else if (options.type === 'register') {
      wx.setNavigationBarTitle({
        title: '手机号注册'
      });
      this.setData({
        pageType: 'register'
      });
    }

    // 如果URL中包含手机号，自动填充
    if (options.phone) {
      const phone = options.phone;
      this.setData({
        phone: phone
      });
      // 校验手机号格式
      this.validatePhone(phone);
      
      // 自动发送验证码（延迟执行，确保页面渲染完成）
      setTimeout(() => {
        // 如果手机号有效，自动发送验证码
        if (this.data.isPhoneValid && this.data.countdown === 0) {
          this.sendVerifyCode();
        }
      }, 500);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 输入手机号
   */
  inputPhone(e) {
    const phone = e.detail.value;
    // 更新手机号
    this.setData({
      phone: phone
    });
    
    // 校验手机号格式
    this.validatePhone(phone);
  },

  /**
   * 校验手机号格式
   */
  validatePhone(phone) {
    const isValid = util.isValidPhone(phone);
    
    this.setData({
      isPhoneValid: isValid,
      phoneErrorMsg: isValid ? '' : '手机号格式不正确！'
    });
    
    return isValid;
  },

  /**
   * 输入验证码
   */
  inputVerifyCode(e) {
    const verifyCode = e.detail.value;
    // 更新验证码
    this.setData({
      verifyCode: verifyCode,
      isVerifyCodeValid: verifyCode.length === 4
    });
  },

  /**
   * 统一的错误处理方法
   */
  handleError(err, customMessage) {
    util.hideLoading();
    util.showError(err.message || customMessage);
  },

  /**
   * 统一的加载状态处理方法
   */
  showLoadingWithMask(title) {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  /**
   * 发送验证码
   */
  sendVerifyCode() {
    if (this.data.countdown > 0) return;
    if (!this.validatePhone(this.data.phone)) return;
    
    this.showLoadingWithMask('发送中...');
    
    api.user.sendVerifyCode({
      phone: this.data.phone
    }).then(res => {
      wx.hideLoading();
      this.startCountdown();
      
      if (res.data && res.data.code) {
        this.setData({
          verifyCode: res.data.code
        });
      }
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 1500
      });
    }).catch(err => {
      this.handleError(err, '发送验证码失败');
    });
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    // 设置倒计时为60秒
    this.setData({
      countdown: 60
    });
    
    // 创建定时器，每秒减1
    this.countdownTimer = setInterval(() => {
      if (this.data.countdown <= 1) {
        // 倒计时结束，清除定时器
        clearInterval(this.countdownTimer);
        this.setData({
          countdown: 0
        });
      } else {
        // 倒计时减1
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  /**
   * 切换是否同意协议
   */
  toggleAgreeProtocol() {
    this.setData({
      isAgreeProtocol: !this.data.isAgreeProtocol
    });
  },

  /**
   * 提交表单
   */
  submitForm() {
    if (!this.validateForm()) return;
    
    this.showLoadingWithMask(this.data.pageType === 'login' ? '登录中...' : '注册中...');
    
    if (this.data.pageType === 'login') {
      this.handleLogin();
    } else {
      this.handleRegister();
    }
  },

  /**
   * 表单验证
   */
  validateForm() {
    if (!this.data.isPhoneValid) {
      util.showError('请输入正确的手机号');
      return false;
    }
    
    if (!this.data.verifyCode) {
      util.showError('请输入验证码');
      return false;
    }
    
    if (!this.data.isAgreeProtocol) {
      util.showError('请阅读并同意协议');
      return false;
    }
    
    return true;
  },

  /**
   * 处理登录逻辑
   */
  handleLogin() {
    api.user.login({
      phone: this.data.phone,
      verifyCode: this.data.verifyCode,
      userType: 2
    }).then(res => {
      this.saveUserData(res.data);
      util.showSuccess('登录成功');
      this.checkShopStatus();
    }).catch(err => {
      this.handleError(err, '登录失败');
    });
  },

  /**
   * 处理注册逻辑
   */
  handleRegister() {
    api.user.register({
      phone: this.data.phone,
      verifyCode: this.data.verifyCode,
      userType: 2
    }).then(res => {
      util.hideLoading();
      this.saveUserData(res.data);
      
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 1500,
        mask: true,
        complete: () => {
          wx.redirectTo({
            url: '/pages/shop/open'
          });
        }
      });
    }).catch(err => {
      this.handleError(err, '注册失败');
    });
  },

  /**
   * 保存用户数据
   */
  saveUserData(data) {
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userId', data.user.id);
    wx.setStorageSync('userInfo', data.user);
  },

  /**
   * 检查店铺状态
   */
  checkShopStatus() {
    api.user.checkShop().then(shopRes => {
      util.hideLoading();
      
      if (shopRes.data && shopRes.data.shopId) {
        wx.setStorageSync('shopId', shopRes.data.shopId);
        if (shopRes.data.shop) {
          wx.setStorageSync('shopInfo', shopRes.data.shop);
        }
      }
      
      this.handleShopStatusResult(shopRes.data);
    }).catch(err => {
      this.handleError(err, '检查店铺状态失败，请重试');
    });
  },

  /**
   * 处理店铺状态检查结果
   */
  handleShopStatusResult(data) {
    if (data && data.hasShop) {
      if (data.shop && data.shop.auditStatus === 0) {
        wx.showToast({
          title: '店铺审核中',
          icon: 'none',
          duration: 2000
        });
      } else {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/productindex/index'
          });
        }, 1500);
      }
    } else {
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/shop/open'
        });
      }, 1500);
    }
  },

  /**
   * 跳转到登录/注册页面
   */
  goToLogin() {
    if (this.data.pageType === 'login') {
      // 当前是登录页面，切换到注册状态
      this.setData({
        pageType: 'register'
      });
      wx.setNavigationBarTitle({
        title: '手机号注册'
      });
    } else {
      // 当前是注册页面，切换到登录状态
      this.setData({
        pageType: 'login'
      });
      wx.setNavigationBarTitle({
        title: '手机号登录'
      });
    }
  }
});