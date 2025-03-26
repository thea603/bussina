// utils/api.js
// API接口模拟层

// API请求统一管理文件

// 基础配置
const config = {
  // 开发环境配置
  dev: {
    baseUrl: 'http://hangzhou.cstext.top:4000/api',
  },
  // 生产环境配置
  prod: {
    baseUrl: 'https://api.yourdomain.com/api',
  }
};

// 当前环境配置
const ENV = 'dev'; // 可以根据环境变量或其他方式动态设置
const baseUrl = config[ENV].baseUrl;

// 检查URL是否为HTTPS
const isHttps = (url) => {
  return url.startsWith('https://');
};

// 统一请求方法
const request = ({ url, method = 'GET', data = {}, header = {} }) => {
  // 完整URL
  const fullUrl = (typeof url === 'string' && url.startsWith('http')) ? url : `${baseUrl}${url}`;
  
  // 判断是否为HTTPS请求
  const useHttps = typeof fullUrl === 'string' && fullUrl.startsWith('https://');
  
  // 设置通用header
  const commonHeader = {
    'content-type': 'application/json',
    ...header
  };
  
  // 获取token（如果存在）
  const token = wx.getStorageSync('token');
  if (token) {
    commonHeader['Authorization'] = 'Bearer ' + token;
  }
  
  // 调试日志
  console.log(`[API请求] ${method} ${fullUrl}`, data);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: commonHeader,
      success: (res) => {
        // 调试日志
        console.log(`[API响应] ${method} ${fullUrl}`, res.statusCode, res.data);
        
        // 统一处理响应
        if (res.statusCode === 200) {
          // API可能直接返回数据，没有code字段
          if (res.data.code !== undefined) {
            // 有code字段的情况
            if (res.data.code === 200) {
              resolve(res.data);
            } else {
              // 业务错误处理
              showError(res.data.message || '请求失败');
              reject(res.data);
            }
          } else {
            // 没有code字段，直接返回数据
            resolve({
              code: 200,
              message: res.data.message || '成功',
              data: res.data
            });
          }
        } else if (res.statusCode === 401) {
          // 未授权，记录详细日志
          console.error('[API错误] 401 Unauthorized', {
            url: fullUrl,
            method: method,
            requestData: data,
            responseData: res.data,
            headers: commonHeader
          });
          
          // 处理未授权情况
          handleUnauthorized();
          reject({
            code: 401,
            message: '登录已过期，请重新登录',
            data: res.data
          });
        } else {
          // 其他错误
          console.error(`[API错误] ${res.statusCode}`, res.data);
          showError('服务器异常，请稍后再试');
          reject({
            code: res.statusCode,
            message: '服务器异常',
            data: res.data
          });
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
        
        showError('网络异常，请检查网络连接');
        reject({
          code: -1,
          message: '网络异常，请检查网络连接',
          error: err
        });
      }
    });
  });
};

// 文件上传方法
const uploadFile = (filePath, formData = {}) => {
  // 上传文件的URL
  const url = `${baseUrl}/v1/upload`;
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'image',
      formData: formData,
      header: {
        'Authorization': 'Bearer ' + (wx.getStorageSync('token') || '') // 添加Bearer前缀
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 注意：uploadFile的返回值是string，需要转换为对象
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            // 如果返回的数据中有path字段，将基础URL添加到path前面（不包含/api部分）
            if (data.path && !data.url) {
              // 从baseUrl中提取域名部分，去掉/api
              const domainUrl = baseUrl.replace(/\/api$/, '');
              data.url = domainUrl + data.path;
            }
            resolve(data);
          } else {
            showError(data.message || '上传失败');
            reject(data);
          }
        } else if (res.statusCode === 401) {
          handleUnauthorized();
          reject(res.data);
        } else {
          showError('服务器异常，请稍后再试');
          reject(res.data);
        }
      },
      fail: (err) => {
        showError('网络异常，请检查网络连接');
        reject(err);
      }
    });
  });
};

// 错误提示
const showError = (message) => {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
};

// 处理未授权情况
const handleUnauthorized = () => {
  // 清除本地token
  wx.removeStorageSync('token');
  // 跳转到登录页
  wx.navigateTo({
    url: '/pages/login/login'
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
    wxLogin(data) {
      return request({
        url: '/v1/wechat/getOpenId',  // 确保这是正确的登录接口路径
        method: 'POST',
        data: {
          code: data.code,
          type:'business'
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
    }
  },
  
  // 商品相关接口
  product: {
    // 获取商品列表
    getProductList: (params) => {
      return request({ url: '/v1/products', method: 'GET', data: params });
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
    // 修改商品库存
    updateStock: (productId, stock) => {
      return request({ url: `/v1/products/${productId}/stock`, method: 'PATCH', data: { stock } });
    },
    // 编辑商品
    editProduct: (data) => {
      return request({ url: '/product/edit', method: 'PUT', data: data });
    },
    // 获取商品分类
    getCategories: () => {
      return request({ url: '/v1/categories', method: 'GET' });
    },
    
    // 创建商品
    createProduct: (data) => {
      return request({ url: '/v1/products', method: 'POST', data: data });
    },
    // 更新商品状态
    updateProductStatus: (productId, status) => {
      return request({ url: `/v1/products/${productId}/status`, method: 'PATCH', data: { status } });
    },
    batchUpdateStatus: (productIds, status) => {
      return request({ url: '/v1/products/batch/status', method: 'PATCH', data: { productIds, status } });
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
    // 同意退款
    approveRefund: (id) => {
      return request({ url: '/order/approveRefund', method: 'POST', data: { id } });
    },
    // 拒绝退款
    rejectRefund: (id, reason) => {
      return request({ url: '/order/rejectRefund', method: 'POST', data: { id, reason } });
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
  }
};

// 导出API接口
module.exports = {
  ...api,
  baseUrl: baseUrl
}; 