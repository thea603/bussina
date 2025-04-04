const tokenUtil = require('./tokenUtil');

// 不需要token的白名单接口
const whiteList = [
  '/wechat/getOpenId',
  '/wechat/getAccessToken',
  '/wechat/getPhoneNumber',
  '/user/login',
  '/user/register',
  '/v1/users/send-code',
  '/v1/users/login',
  '/v1/wechat-user/login'
];

// 检查是否为白名单URL
const isWhiteListUrl = (url) => {
  return whiteList.some(whiteUrl => url.includes(whiteUrl));
};

// 处理未授权情况，全局统一处理
const handleUnauthorized = () => {
  console.log('执行未授权处理');
  
  // 获取当前页面路径
  const pages = getCurrentPages();
  const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const url = currentPage ? currentPage.route : '';
  
  // 避免循环跳转：如果当前已经在登录页面，不再跳转
  if (url.includes('/pages/login/login')) {
    console.log('当前已在登录页面，不再跳转');
    return;
  }
  
  // 清除本地存储的登录信息
  wx.removeStorageSync('token');
  wx.removeStorageSync('openid');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('shopInfo');
  wx.removeStorageSync('shopId');
  wx.removeStorageSync('userId');
  
  console.log('已清除登录信息，准备跳转到登录页');
  
  // 使用reLaunch强制跳转到登录页，防止用户通过返回按钮回到需要登录的页面
  wx.reLaunch({
    url: '/pages/login/login',
    success: () => {
      console.log('成功跳转到登录页');
    },
    fail: (error) => {
      console.error('跳转到登录页失败:', error);
      // 如果reLaunch失败，尝试使用navigateTo
      wx.navigateTo({
        url: '/pages/login/login',
        fail: (err) => {
          console.error('使用navigateTo跳转也失败:', err);
        }
      });
    }
  });
};

// 请求拦截器
const requestInterceptor = (config) => {
  console.log('执行请求拦截器', config);
  
  // 如果请求的URL在白名单中，直接通过
  if (isWhiteListUrl(config.url)) {
    return config;
  }
  
  // 获取token
  const token = wx.getStorageSync('token');
  
  // 如果没有token，跳转到登录页
  if (!token) {
    console.log('Token不存在，需要登录');
    handleUnauthorized();
    return Promise.reject({ message: '登录已过期，请重新登录' });
  }
  
  // 验证token是否有效
  if (!tokenUtil.isTokenValid()) {
    console.log('Token已过期，需要重新登录');
    handleUnauthorized();
    return Promise.reject({ message: '登录已过期，请重新登录' });
  }
  
  // 添加token到请求头
  config.header = config.header || {};
  config.header['Authorization'] = 'Bearer ' + token;
  
  return config;
};

// 响应拦截器
const responseInterceptor = (response) => {
  console.log('执行响应拦截器', response);
  
  // 如果请求来自白名单，直接返回
  if (response.config && isWhiteListUrl(response.config.url)) {
    return response.data;
  }
  
  // 如果响应状态码表示未授权或禁止访问
  if (response.statusCode === 401 || response.statusCode === 403) {
    console.log('响应状态码表示未授权', response.statusCode);
    handleUnauthorized();
    return Promise.reject({ message: '登录已过期，请重新登录' });
  }
  
  // 如果API返回的code表示token过期
  if (response.data && (response.data.code === 401 || response.data.code === 'TOKEN_EXPIRED')) {
    console.log('API返回的code表示token过期');
    handleUnauthorized();
    return Promise.reject({ message: '登录已过期，请重新登录' });
  }
  
  return response.data;
};

// 错误拦截器
const errorInterceptor = (error, config) => {
  console.log('执行错误拦截器', error, config);
  
  // 如果请求来自白名单，直接抛出错误
  if (config && isWhiteListUrl(config.url)) {
    return Promise.reject(error);
  }
  
  // 如果是网络错误，给出适当提示
  if (error.errMsg && error.errMsg.includes('request:fail')) {
    // 可以区分不同的网络错误类型
    if (error.errMsg.includes('timeout')) {
      return Promise.reject({ message: '请求超时，请检查网络连接' });
    }
    return Promise.reject({ message: '网络连接失败，请检查网络设置' });
  }
  
  // 如果是401或403错误，说明token可能过期
  if (error.statusCode === 401 || error.statusCode === 403) {
    handleUnauthorized();
    return Promise.reject({ message: '登录已过期，请重新登录' });
  }
  
  return Promise.reject(error);
};

// 全局路由拦截器，可以在app.js中调用
const routeInterceptor = (options) => {
  console.log('执行路由拦截器', options);
  
  // 白名单路径，这些页面不需要登录
  const whiteListPages = [
    '/pages/login/login',
    '/pages/login/register'
  ];
  
  const currentPage = options.path;
  
  // 检查是否是白名单页面
  const isWhiteListPage = whiteListPages.some(page => currentPage.includes(page));
  
  // 如果不是白名单页面，检查登录状态
  if (!isWhiteListPage) {
    const token = wx.getStorageSync('token');
    if (!token || !tokenUtil.isTokenValid()) {
      console.log('检测到未登录状态，跳转到登录页');
      wx.redirectTo({
        url: '/pages/login/login',
        fail: () => {
          // 如果redirectTo失败，尝试使用reLaunch
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      });
      return false;
    }
  }
  
  return true;
};

module.exports = {
  whiteList,
  isWhiteListUrl,
  handleUnauthorized,
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
  routeInterceptor
}; 