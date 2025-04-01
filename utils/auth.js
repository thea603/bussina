// utils/auth.js
const TOKEN_KEY = 'token';
const OPENID_KEY = 'openid';
const USERID_KEY = 'userId';
const USERINFO_KEY = 'userInfo';
const SHOPID_KEY = 'shopId';
const SHOPINFO_KEY = 'shopInfo';
const LOGIN_TIME_KEY = 'loginTime';

// 登录数据过期时间（毫秒）
const EXPIRE_TIME = 24 * 60 * 60 * 1000;

// 检查登录状态
const checkLoginStatus = () => {
  const loginTime = wx.getStorageSync(LOGIN_TIME_KEY);
  const currentTime = new Date().getTime();
  
  // 如果没有登录时间，说明未登录
  if (!loginTime) {
    return false;
  }
  
  // 检查是否过期
  if (currentTime - loginTime > EXPIRE_TIME) {
    // 清除所有登录数据
    clearLoginData();
    return false;
  }
  
  // 检查必要的登录数据是否存在
  const token = wx.getStorageSync(TOKEN_KEY);
  const openid = wx.getStorageSync(OPENID_KEY);
  const userId = wx.getStorageSync(USERID_KEY);
  const userInfo = wx.getStorageSync(USERINFO_KEY);
  const shopId = wx.getStorageSync(SHOPID_KEY);
  const shopInfo = wx.getStorageSync(SHOPINFO_KEY);
  
  return !!(token && openid && userId && userInfo && shopId && shopInfo);
};

// 保存登录数据
const saveLoginData = (data) => {
  const currentTime = new Date().getTime();
  
  // 保存登录时间
  wx.setStorageSync(LOGIN_TIME_KEY, currentTime);
  
  // 保存其他登录数据
  if (data.token) wx.setStorageSync(TOKEN_KEY, data.token);
  if (data.openid) wx.setStorageSync(OPENID_KEY, data.openid);
  if (data.userId) wx.setStorageSync(USERID_KEY, data.userId);
  if (data.userInfo) wx.setStorageSync(USERINFO_KEY, data.userInfo);
  if (data.shopId) wx.setStorageSync(SHOPID_KEY, data.shopId);
  if (data.shopInfo) wx.setStorageSync(SHOPINFO_KEY, data.shopInfo);
};

// 清除登录数据
const clearLoginData = () => {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(OPENID_KEY);
  wx.removeStorageSync(USERID_KEY);
  wx.removeStorageSync(USERINFO_KEY);
  wx.removeStorageSync(SHOPID_KEY);
  wx.removeStorageSync(SHOPINFO_KEY);
  wx.removeStorageSync(LOGIN_TIME_KEY);
};

// 获取登录数据
const getLoginData = () => {
  return {
    token: wx.getStorageSync(TOKEN_KEY),
    openid: wx.getStorageSync(OPENID_KEY),
    userId: wx.getStorageSync(USERID_KEY),
    userInfo: wx.getStorageSync(USERINFO_KEY),
    shopId: wx.getStorageSync(SHOPID_KEY),
    shopInfo: wx.getStorageSync(SHOPINFO_KEY)
  };
};

// 检查并处理登录状态
const handleLoginStatus = () => {
  if (!checkLoginStatus()) {
    // 跳转到登录页
    wx.navigateTo({
      url: '/pages/login/login'
    });
    return false;
  }
  return true;
};

module.exports = {
  checkLoginStatus,
  saveLoginData,
  clearLoginData,
  getLoginData,
  handleLoginStatus
}; 