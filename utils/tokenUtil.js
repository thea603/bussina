/**
 * token工具模块
 * 提供token解析、验证等功能
 */

/**
 * 解析JWT token
 * @param {string} token - JWT token字符串
 * @returns {Object} 解析后的token信息对象
 */
function parseToken(token) {
  if (!token) {
    console.error('Token为空');
    return null;
  }
  
  try {
    // 尝试解析JWT token
    const tokenParts = token.split('.');
    
    // 返回的结果对象
    const result = {
      isJWT: false,
      raw: token,
      header: null,
      payload: null,
      userId: null,
      username: null,
      role: null,
      expiryTime: null,
      issuedTime: null,
      isExpired: false
    };
    
    if (tokenParts.length === 3) {
      // JWT格式: header.payload.signature
      result.isJWT = true;
      
      try {
        // 在开发者工具中，我们可以使用更简单的方法
        if (wx.getSystemInfoSync().platform === 'devtools') {
          // 解析header
          const headerBase64 = tokenParts[0].replace(/-/g, '+').replace(/_/g, '/');
          try {
            const decodedHeader = decodeURIComponent(escape(atob(headerBase64)));
            result.header = JSON.parse(decodedHeader);
          } catch (e) {
            console.error('解析Header失败:', e);
          }
          
          // 解析payload
          const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
          try {
            const decodedPayload = decodeURIComponent(escape(atob(payloadBase64)));
            const payloadObj = JSON.parse(decodedPayload);
            result.payload = payloadObj;
            
            // 提取关键信息
            if (payloadObj.exp) {
              const expiryDate = new Date(payloadObj.exp * 1000);
              result.expiryTime = expiryDate;
              result.isExpired = expiryDate < new Date();
            }
            
            if (payloadObj.iat) {
              result.issuedTime = new Date(payloadObj.iat * 1000);
            }
            
            // 提取用户ID (可能有不同的字段名)
            result.userId = payloadObj.sub || payloadObj.userId || payloadObj.user_id || payloadObj.id;
            
            // 提取用户名
            result.username = payloadObj.name || payloadObj.username || payloadObj.userName;
            
            // 提取角色
            result.role = payloadObj.roles || payloadObj.role;
          } catch (e) {
            console.error('解析Payload失败:', e);
          }
        } else {
          // 在真机环境中，我们只能记录无法完全解析
          console.log('在真机环境中无法完全解析Token');
        }
      } catch (e) {
        console.error('解析Token部分失败:', e);
      }
    } else {
      // 非JWT格式，可能是自定义token
      console.log('Token不是标准JWT格式，可能是自定义token');
    }
    
    return result;
  } catch (error) {
    console.error('解析token时出错:', error);
    return null;
  }
}

/**
 * 获取当前用户ID
 * @returns {string|null} 用户ID或null
 */
function getCurrentUserId() {
  const token = wx.getStorageSync('token');
  if (!token) return null;
  
  const tokenInfo = parseToken(token);
  return tokenInfo ? tokenInfo.userId : null;
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息对象或null
 */
function getCurrentUser() {
  const token = wx.getStorageSync('token');
  if (!token) return null;
  
  const tokenInfo = parseToken(token);
  if (!tokenInfo) return null;
  
  return {
    userId: tokenInfo.userId,
    username: tokenInfo.username,
    role: tokenInfo.role
  };
}

/**
 * 检查token是否有效
 * @returns {boolean} token是否有效
 */
function isTokenValid() {
  const token = wx.getStorageSync('token');
  if (!token) return false;
  
  const tokenInfo = parseToken(token);
  if (!tokenInfo) return false;
  
  // 如果是JWT且已过期，则无效
  if (tokenInfo.isJWT && tokenInfo.isExpired) {
    return false;
  }
  
  return true;
}

/**
 * 打印token信息到控制台（用于调试）
 */
function logTokenInfo() {
  const token = wx.getStorageSync('token');
  if (!token) {
    console.log('未找到token');
    return;
  }
  
  const tokenInfo = parseToken(token);
  
  console.log('===== Token信息 =====');
  console.log('原始Token:', token);
  
  if (tokenInfo.isJWT) {
    console.log('Token类型: JWT');
    console.log('Header:', tokenInfo.header);
    console.log('Payload:', tokenInfo.payload);
    
    if (tokenInfo.expiryTime) {
      console.log('过期时间:', tokenInfo.expiryTime.toLocaleString());
      console.log('是否已过期:', tokenInfo.isExpired ? '是' : '否');
    }
    
    if (tokenInfo.issuedTime) {
      console.log('签发时间:', tokenInfo.issuedTime.toLocaleString());
    }
  } else {
    console.log('Token类型: 非标准JWT');
  }
  
  console.log('用户ID:', tokenInfo.userId);
  console.log('用户名:', tokenInfo.username);
  console.log('角色:', tokenInfo.role);
  console.log('=====================');
}

module.exports = {
  parseToken,
  getCurrentUserId,
  getCurrentUser,
  isTokenValid,
  logTokenInfo
}; 