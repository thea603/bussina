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
   * 发送验证码
   */
  sendVerifyCode() {
    // 如果正在倒计时，不允许再次发送
    if (this.data.countdown > 0) {
      return;
    }
    
    // 校验手机号
    if (!this.validatePhone(this.data.phone)) {
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: '发送中...',
      mask: true
    });
    
    // 调用发送验证码API
    api.user.sendVerifyCode({
      phone: this.data.phone
    }).then(res => {
      // 先隐藏加载提示
      wx.hideLoading();
      
      // 开始倒计时
      this.startCountdown();
      
      // 如果后端返回了验证码（仅用于开发环境）
      if (res.data && res.data.code) {
        console.log('开发环境验证码:', res.data.code);
        // 可以自动填充验证码（仅用于开发环境）
        this.setData({
          verifyCode: res.data.code
        });
      }
      
      // 显示成功提示
      setTimeout(() => {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success',
          duration: 1500
        });
      }, 100);
    }).catch(err => {
      // 先隐藏加载提示
      wx.hideLoading();
      
      console.error('发送验证码失败:', err);
      
      // 显示错误提示
      setTimeout(() => {
        wx.showToast({
          title: err.message || '发送验证码失败',
          icon: 'none',
          duration: 1500
        });
      }, 100);
    }).finally(() => {
      // 确保隐藏加载提示
      setTimeout(() => {
        wx.hideLoading();
      }, 200);
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
    // 检查手机号和验证码是否有效
    if (!this.data.isPhoneValid) {
      util.showError('请输入正确的手机号');
      return;
    }
    
    if (!this.data.verifyCode) {
      util.showError('请输入验证码');
      return;
    }
    
    if (!this.data.isAgreeProtocol) {
      util.showError('请阅读并同意协议');
      return;
    }
    
    // 调试日志
    console.log('提交表单:', {
      pageType: this.data.pageType,
      phone: this.data.phone,
      verifyCode: this.data.verifyCode
    });
    
    // 显示加载提示
    util.showLoading(this.data.pageType === 'login' ? '登录中...' : '注册中...');
    
    // 根据页面类型执行不同的操作
    if (this.data.pageType === 'login') {
      // 登录操作
      api.user.login({
        phone: this.data.phone,
        verifyCode: this.data.verifyCode,
        userType: 2
      }).then(res => {
        // 保存token和用户信息到本地存储
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userId', res.data.user.id);
        wx.setStorageSync('userInfo', res.data.user);
        
        util.showSuccess('登录成功');
        
        // 调用检查店铺接口
        api.user.checkShop().then(shopRes => {
          util.hideLoading();
          
          // 保存店铺ID
          if (shopRes.data && shopRes.data.shopId) {
            wx.setStorageSync('shopId', shopRes.data.shopId);
            console.log('已保存店铺ID:', shopRes.data.shopId);
          }
          
          // 根据返回结果决定跳转路径
          if (shopRes.data && shopRes.data.hasShop) {
            // 如果有店铺，跳转到首页
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/productindex/index'
              });
            }, 1500);
          } else {
            // 如果没有店铺，跳转到开店页面
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/shop/open'
              });
            }, 1500);
          }
        }).catch(err => {
          util.hideLoading();
          console.error('检查店铺失败:', err);
          
          // 显示错误提示，不自动跳转
          util.showError(err.message || '检查店铺状态失败，请重试');
        });
      }).catch(err => {
        util.hideLoading();
        util.showError(err.message || '登录失败');
      });
    } else {
      // 注册操作
      console.log('开始注册请求，参数:', {
        phone: this.data.phone,
        verifyCode: this.data.verifyCode
      });
      
      api.user.register({
        phone: this.data.phone,
        verifyCode: this.data.verifyCode,
        userType: 2
      }).then(res => {
        console.log('注册成功，响应:', res);
        util.hideLoading();
        
        // 保存token和用户信息到本地存储
        wx.setStorageSync('token', res.data.token);
        wx.setStorageSync('userId', res.data.user.id);
        wx.setStorageSync('userInfo', res.data.user);
        
        // 显示成功提示
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500,
          mask: true,
          complete: () => {
            // 注册成功后直接跳转到开店页面
            wx.redirectTo({
              url: '/pages/shop/open'
            });
          }
        });
      }).catch(err => {
        console.error('注册失败:', err);
        util.hideLoading();
        util.showError(err.message || '注册失败');
      });
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