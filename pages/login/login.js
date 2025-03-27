// pages/login/login.js
const api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 页面数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '账户登录'
    });
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
   * 登录按钮点击事件
   */
  login: function() {
    wx.navigateTo({
      url: '/pages/login/register?type=login'
    })
  },

  /**
   * 注册开店按钮点击事件
   */
  register() {
    wx.navigateTo({
      url: '/pages/login/register?type=register'
    })
  },

  /**
   * 微信登录按钮点击处理
   */
  handleWxLogin() {
    // 执行微信登录流程
    wx.showLoading({ title: '登录中...' });
    
    let accessToken = null;
    let openid = null;
    
    // 获取OpenID
    this.getWxLoginCode()
      .then(code => this.getOpenId(code))
      .then(res => {
        if (res.code !== 0) throw new Error(res.message || '获取OpenID失败');
        console.log("获取openid成功:", res.data.openid);
        
        // 保存openid供后续使用
        openid = res.data.openid;
        
        // 保存到本地存储
        wx.setStorageSync('openid', openid);
        
        // 获取AccessToken
        return this.getAccessToken();
      })
      .then(tokenRes => {
        if (tokenRes.code !== 0) throw new Error(tokenRes.message || '获取AccessToken失败');
        console.log("获取AccessToken成功:", tokenRes);
        
        accessToken = tokenRes.data.access_token;
        
        // 获取手机号
        return this.getWxLoginCode().then(newCode => {
          console.log("为获取手机号重新获取code:", newCode);
          return this.getPhoneNumberWithCode(newCode, accessToken, openid);
        });
      })
      .then(phoneRes => {
        if (phoneRes.code !== 0) {
          // 特殊处理code无效的情况，尝试再次获取
          if (phoneRes.message && phoneRes.message.includes('invalid code')) {
            console.log("检测到code无效，重新尝试获取");
            return this.getWxLoginCode()
              .then(retryCode => this.getPhoneNumberWithCode(retryCode, accessToken, openid));
          } else {
            throw new Error(phoneRes.message || '获取手机号失败');
          }
        }
        console.log("获取手机号成功:", phoneRes);
        
        // 获取到手机号后，跳转到登录页面并自动填充手机号
        const phoneNumber = phoneRes.data.phoneNumber;
        wx.navigateTo({
          url: `/pages/login/register?type=login&phone=${phoneNumber}`
        });
        
        wx.hideLoading();
        return;
      })
      .catch(err => {
        this.handleError('登录失败，请重试', err);
        wx.hideLoading();
      });
  },
  
  /**
   * 微信按钮获取手机号回调
   */
  getPhoneNumber(e) {
    console.log("获取手机号回调", e.detail);
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 获取到手机号凭证code
      const phoneCode = e.detail.code;
      console.log("获取到手机号凭证code:", phoneCode);
      
      // 显示加载提示
      wx.showLoading({ title: '登录中...' });
      
      let accessToken = null;
      let openid = null;
      
      // 获取OpenID
      this.getWxLoginCode()
        .then(code => this.getOpenId(code))
        .then(res => {
          if (res.code !== 0) throw new Error(res.message || '获取OpenID失败');
          console.log("获取openid成功:", res.data.openid);
          
          // 保存openid供后续使用
          openid = res.data.openid;
          
          // 保存到本地存储
          wx.setStorageSync('openid', openid);
          
          // 获取AccessToken
          return this.getAccessToken();
        })
        .then(tokenRes => {
          if (tokenRes.code !== 0) throw new Error(tokenRes.message || '获取AccessToken失败');
          console.log("获取AccessToken成功:", tokenRes);
          
          accessToken = tokenRes.data.access_token;
          
          // 使用微信回调的手机号凭证code获取手机号
          return api.user.getPhoneNumber({
            code: phoneCode, // 使用微信回调的手机号凭证code
            access_token: accessToken,
            openid: openid
          });
        })
        .then(phoneRes => {
          if (phoneRes.code !== 0) throw new Error(phoneRes.message || '获取手机号失败');
          console.log("获取手机号成功:", phoneRes);
          
          // 获取到手机号后，跳转到登录页面并自动填充手机号
          const phoneNumber = phoneRes.data.phoneNumber;
          wx.navigateTo({
            url: `/pages/login/register?type=login&phone=${phoneNumber}`
          });
          
          wx.hideLoading();
        })
        .catch(err => {
          this.handleError('登录失败，请重试', err);
          wx.hideLoading();
        });
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
      // 用户拒绝授权
      wx.showToast({
        title: '需要授权手机号才能继续使用',
        icon: 'none'
      });
    }
  },

  // 工具函数
  
  /**
   * 获取微信登录凭证(code)
   */
  getWxLoginCode: function() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log("获取code成功:", res.code);
            resolve(res.code);
          } else {
            console.error('获取code失败');
            reject(new Error('获取code失败'));
          }
        },
        fail: (err) => {
          console.error('wx.login失败:', err);
          reject(err);
        }
      });
    });
  },
  
  /**
   * 获取OpenID
   */
  getOpenId: function(code) {
    console.log("开始获取OpenID, code:", code);
    return api.user.wxLogin({
      code: code
    });
  },
  
  /**
   * 获取AccessToken
   */
  getAccessToken: function() {
    console.log("开始获取AccessToken");
    return api.user.getAccessToken({
      type: 'business'
    });
  },
  
  /**
   * 获取手机号
   */
  getPhoneNumberWithCode: function(code, accessToken, openid) {
    console.log("开始获取手机号, code:", code, "accessToken:", accessToken, "openid:", openid);
    return api.user.getPhoneNumber({
      code: code,
      access_token: accessToken,
      openid: openid
    });
  },
  
  /**
   * 处理错误
   */
  handleError: function(errMsg, err) {
    console.error(errMsg, err);
    wx.showToast({
      title: errMsg,
      icon: 'none'
    });
  }
});