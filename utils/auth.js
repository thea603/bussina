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
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  return !!(token && userInfo);
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
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('shopInfo');
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

const getToken = () => {
  return wx.getStorageSync('token');
};

const getUserInfo = () => {
  return wx.getStorageSync('userInfo');
};

const getShopInfo = () => {
  return wx.getStorageSync('shopInfo');
};

module.exports = {
  checkLoginStatus,
  saveLoginData,
  clearLoginData,
  getLoginData,
  handleLoginStatus,
  getToken,
  getUserInfo,
  getShopInfo
}; 