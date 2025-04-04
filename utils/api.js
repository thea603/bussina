// API接口模拟层
const interceptor = require('./interceptor');

// API请求统一管理文件
// 基础配置
const config = {
  // 开发环境配置
  dev: {
    baseUrl: 'https://xy.ziyuebook.com/api',
  },
  // 生产环境配置
  prod: {
    baseUrl: 'https://api.yourdomain.com/api',
  }
};

// 当前环境配置
const ENV = 'dev'; // 可以根据环境变量或其他方式动态设置
const baseUrl = config[ENV].baseUrl;

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

// 检查URL是否为HTTPS
const isHttps = (url) => {
  return url.startsWith('https://');
};

// 处理未授权情况
const handleUnauthorized = () => {
  // 获取当前页面路径
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const url = currentPage ? currentPage.route : '';
  
  // 如果当前不在登录页，才执行跳转
  if (!url.includes('login')) {
    // 清除所有相关的本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('shopInfo');
    wx.removeStorageSync('shopId');
    
    // 直接跳转，不显示提示
    wx.reLaunch({
      url: '/pages/login/login'
    });
  }
};

// 统一请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {} } = options;
    const fullUrl = baseUrl + url;
    
    // 合并通用header
    const commonHeader = {
      'content-type': 'application/json',
      ...header
    };
    
    // 应用请求拦截器
    let requestConfig = {
      url,
      fullUrl,
      method,
      data,
      header: commonHeader
    };
    
    try {
      requestConfig = interceptor.requestInterceptor(requestConfig);
    } catch (error) {
      return reject(error);
    }
    
    // 如果请求拦截器返回了Promise.reject，直接返回
    if (requestConfig instanceof Promise) {
      return requestConfig;
    }
    
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: requestConfig.header,
      success: (res) => {
        // 应用响应拦截器
        try {
          const result = interceptor.responseInterceptor({
            ...res,
            config: requestConfig
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        // 网络错误详细日志
        console.error('[API网络错误]', {
          url: fullUrl,
          method: method,
          requestData: data,
          error: err
        });
        
        // 应用错误拦截器
        try {
          const result = interceptor.errorInterceptor(err, requestConfig);
          reject(result);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

// 文件上传方法
const uploadFile = (filePath, formData = {}) => {
  // 上传文件的URL
  const url = `${baseUrl}/v1/upload`;
  
  // 构建请求配置
  let requestConfig = {
    url: '/v1/upload',
    fullUrl: url,
    method: 'POST',
    data: formData,
    header: {}
  };
  
  // 应用请求拦截器
  try {
    requestConfig = interceptor.requestInterceptor(requestConfig);
  } catch (error) {
    return Promise.reject(error);
  }
  
  // 如果请求拦截器返回了Promise.reject，直接返回
  if (requestConfig instanceof Promise) {
    return requestConfig;
  }
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'image',
      formData: formData,
      header: requestConfig.header,
      success: (res) => {
        if (res.statusCode === 200) {
          // 注意：uploadFile的返回值是string，需要转换为对象
          try {
            const data = JSON.parse(res.data);
            
            // 应用响应拦截器
            try {
              interceptor.responseInterceptor({
                statusCode: res.statusCode,
                data: data,
                config: requestConfig
              });
              
              if (data.code === 200) {
                // 如果返回的数据中有path字段，将基础URL添加到path前面（不包含/api部分）
                if (data.path && !data.url) {
                  // 从baseUrl中提取域名部分，去掉/api
                  const domainUrl = baseUrl.replace(/\/api$/, '');
                  data.url = domainUrl + data.path;
                }
                resolve(data);
              } else {
                reject(data);
              }
            } catch (error) {
              reject(error);
            }
          } catch (e) {
            reject({
              code: -1,
              message: '解析响应数据失败',
              error: e
            });
          }
        } else {
          // 应用错误拦截器
          try {
            const error = {
              statusCode: res.statusCode,
              message: '上传失败',
              data: res.data
            };
            
            interceptor.errorInterceptor(error, requestConfig);
            reject(error);
          } catch (error) {
            reject(error);
          }
        }
      },
      fail: (err) => {
        // 应用错误拦截器
        try {
          const result = interceptor.errorInterceptor(err, requestConfig);
          reject(result);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

// API接口定义
const api = {
  // 用户相关接口
  user: {
    // 用户注册
    register: (data) => {
      // 转换参数格式，将verifyCode改为code
      const params = {
        phone: data.phone,
        code: data.verifyCode,
        userType: data.userType
      };
      return request({ url: '/v1/users/login', method: 'POST', data: params });
    },
    // 用户登录
    login: (data) => {
      // 转换参数格式，将verifyCode改为code
      const params = {
        phone: data.phone,
        code: data.verifyCode,
        userType: data.userType
      };
      return request({ url: '/v1/users/login', method: 'POST', data: params });
    },
    // 发送验证码
    sendVerifyCode: (data) => {
      // 只需要传递手机号
      const params = {
        phone: data.phone
      };
      return request({ url: '/v1/users/send-code', method: 'POST', data: params });
    },
    // 获取用户信息
    getUserInfo: () => {
      return request({ url: '/v1/users/info', method: 'GET' });
    },
    // 检查用户是否有店铺
    checkShop: () => {
      return request({ url: '/v1/users/has-shop', method: 'GET' });
    },
    // 微信登录
    wxLogin(data) {
      return request({
        url: '/v1/wechat/getOpenId',
        method: 'POST',
        data: {
          code: data.code,
          type: 'business'
        }
      });
    },
    // 获取微信 AccessToken
    getAccessToken(data) {
      return request({
        url: '/v1/wechat/getAccessToken',
        method: 'POST',
        data: {
          type: data.type || 'business'
        }
      });
    },
    // 获取用户手机号
    getPhoneNumber(data) {
      return request({
        url: '/v1/wechat/getPhoneNumber',
        method: 'POST',
        data: {
          code: data.code,
          access_token: data.access_token
        }
      });
    },
    // 微信用户登录
    wechatUserLogin: (data) => {
      return request({ 
        url: '/v1/wechat-user/login', 
        method: 'POST', 
        data: {
          code: data.code,
          phoneCode: data.phoneCode,
          type: 'business'
        }
      });
    }
  },
  
  // 店铺相关接口
  shop: {
    // 提交店铺信息
    submitShopInfo: (data) => {
      return request({ url: '/v1/shops', method: 'POST', data: data });
    },
    // 获取店铺信息
    getShopInfo: () => {
      return request({ url: '/v1/shops/info', method: 'GET' });
    },
    // 上传图片
    uploadImage: (filePath, formData) => {
      return uploadFile(filePath, formData);
    },
    // 获取店铺数据统计
    getMetrics: (shopId) => {
      return request({
        url: `/v1/shops/${shopId}/metrics`,
        method: 'GET'
      });
    }
  },
  
  // 商品相关接口
  product: {
    // 获取商品列表
    getProductList: (params) => {
      return request({ 
        url: '/v1/products', 
        method: 'GET',
        data: params
      });
    },
    // 获取商品状态统计
    getProductStatusStats: (params) => {
      return request({ 
        url: '/v1/products/status/stats', 
        method: 'GET',
        data: params
      });
    },
    // 添加商品
    addProduct: (data) => {
      return request({ url: '/product/add', method: 'POST', data: data });
    },
    // 更新商品
    updateProduct: (productId, data) => {
      return request({ url: `/v1/products/${productId}`, method: 'PUT', data: data });
    },
    // 删除商品
    deleteProduct: (id) => {
      return request({ url: '/product/delete', method: 'DELETE', data: { id } });
    },
    // 商品上架
    onlineProduct: (id) => {
      return request({ url: '/product/online', method: 'POST', data: { id } });
    },
    // 商品下架
    offlineProduct: (id) => {
      return request({ url: '/product/offline', method: 'POST', data: { id } });
    },
    // 批量商品下架
    batchOfflineProduct: (ids) => {
      return request({ url: '/product/batchOffline', method: 'POST', data: { ids } });
    },
    // 更新商品库存
    updateStock: (productId, stock) => {
      return request({ 
        url: `/v1/products/${productId}/stock`, 
        method: 'PATCH', 
        data: { stock } 
      });
    },
    // 编辑商品
    editProduct: (data) => {
      return request({ url: '/product/edit', method: 'PUT', data: data });
    },
    // 获取商品分类
    getCategories: () => {
      return request({ url: '/v1/categories', method: 'GET' })
        .then(response => {
          // 确保返回的是原始响应，不进行额外处理
          return response;
        });
    },
    
    // 创建商品
    createProduct: (data) => {
      return request({ url: '/v1/products', method: 'POST', data: data });
    },
    // 更新商品状态
    updateProductStatus: (productId, status) => {
      return request({ 
        url: `/v1/products/${productId}/status`, 
        method: 'PATCH', 
        data: { status } 
      });
    },
    // 批量更新商品状态
    batchUpdateStatus: (productIds, status) => {
      return request({ 
        url: '/v1/products/batch/status', 
        method: 'PATCH', 
        data: { productIds, status } 
      });
    },
    getProductDetail: (productId) => {
      return request({ url: `/v1/products/${productId}`, method: 'GET' });
    },
    //商品核销
    getProductScan:()=>{
      return request({url:'/v1/verification/verify-code',method:'POST',data:data});
    }
  },
  
  // 订单相关接口
  order: {
    // 获取订单列表
    getOrderList: (params) => {
      return request({ url: '/v1/orders', method: 'GET', data: params });
    },
    // 获取订单详情
    getOrderDetail: (id) => {
      return request({ url: `/v1/orders/${id}`, method: 'GET' });
    },
    // 更新订单状态
    updateOrderStatus: (id, status) => {
      return request({ url: '/order/updateStatus', method: 'PUT', data: { id, status } });
    },
    // 订单核销
    verifyOrder: (id, verifyCode) => {
      return request({ url: '/order/verify', method: 'POST', data: { id, verifyCode } });
    },
    // 扫码核销
    scanVerifyOrder: (qrCode) => {
      return request({ url: '/order/scanVerify', method: 'POST', data: { qrCode } });
    },
    // 通过核销码核销
    verifyByCode: (verificationCode) => {
      return request({ 
        url: '/v1/orders/verify-by-code', 
        method: 'POST', 
        data: { verificationCode } 
      });
    },
    // 处理退款申请
    processRefund: (id, action, reason = '') => {
      const data = { action };
      if (action === 'reject' && reason) {
        data.reason = reason;
      }
      return request({ 
        url: `/v1/orders/${id}/process-refund`, 
        method: 'POST', 
        data 
      });
    }
  },
  
  // 提现相关接口
  withdraw: {
    // 获取账户余额
    getBalance: () => {
      return request({ url: '/withdraw/balance', method: 'GET' });
    },
    // 申请提现
    applyWithdraw: (data) => {
      return request({ url: '/withdraw/apply', method: 'POST', data: data });
    },
    // 获取提现记录列表
    getWithdrawList: (params) => {
      return request({ url: '/withdraw/list', method: 'GET', data: params });
    },
    // 获取提现详情
    getWithdrawDetail: (id) => {
      return request({ url: '/withdraw/detail', method: 'GET', data: { id } });
    },
    // 取消提现申请
    cancelWithdraw: (id) => {
      return request({ url: '/withdraw/cancel', method: 'POST', data: { id } });
    },
    // 微信提现
    createTransfer: (data) => {
      return request({ url: '/v1/wechat/createTransfer', method: 'POST', data: data });
    }
  },
  
  // 数据统计接口
  stats: {
    // 获取销售统计
    getSalesStats: (params) => {
      return request({ url: '/stats/sales', method: 'GET', data: params });
    },
    // 获取商品销售排行
    getProductRanking: (params) => {
      return request({ url: '/stats/products', method: 'GET', data: params });
    }
  },

  // 提现相关接口
  withdrawals: {
    // 获取提现列表
    getList: (params) => {
      return request({
        url: '/v1/withdrawals/list',
        method: 'GET',
        data: params
      });
    }
  }
};

// 导出API接口
module.exports = {
  ...api,
  baseUrl: baseUrl
}; 


