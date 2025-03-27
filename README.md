# 商家管理系统 API 文档

## 基础信息

- 基础URL: `http://hangzhou.cstext.top:4000/api`
- 所有请求和响应均使用 JSON 格式
- 所有需要身份验证的接口都需要在请求头中包含 `Authorization: Bearer {token}`
- 通用响应格式:
  ```json
  {
    "code": 200,       // 状态码，200表示成功，其他表示失败
    "message": "成功",  // 状态消息
    "data": {}         // 响应数据，根据接口不同而不同
  }
  ```

## 用户相关接口

### 1. 用户登录

- **接口名称**: 用户登录
- **URL**: `/v1/users/login`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "phone": "13800138000",  // 手机号
    "code": "1234",          // 验证码
    "userType": "merchant"   // 用户类型
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userId": "lbw123456"
    }
  }
  ```

### 2. 发送验证码

- **接口名称**: 发送验证码
- **URL**: `/v1/users/send-code`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "phone": "13800138000"  // 手机号
  }
  ```

### 3. 微信登录获取OpenID

- **接口名称**: 获取OpenID
- **URL**: `/v1/wechat/getOpenId`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "code": "微信登录code",
    "type": "business"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 0,
    "message": "成功",
    "data": {
      "openid": "微信用户openid",
      "session_key": "会话密钥"
    }
  }
  ```

### 4. 获取微信AccessToken

- **接口名称**: 获取AccessToken
- **URL**: `/v1/wechat/getAccessToken`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "type": "business"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 0,
    "message": "成功",
    "data": {
      "access_token": "访问令牌",
      "expires_in": 7200
    }
  }
  ```

### 5. 获取微信用户手机号

- **接口名称**: 获取手机号
- **URL**: `/v1/wechat/getPhoneNumber`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "code": "微信获取手机号凭证code",
    "type": "business",
    "access_token": "访问令牌",
    "openid": "用户openid"
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 0,
    "message": "成功",
    "data": {
      "phoneNumber": "13800138000",
      "purePhoneNumber": "13800138000",
      "countryCode": "86"
    }
  }
  ```

### 6. 获取用户信息

- **接口名称**: 获取用户信息
- **URL**: `/v1/users/info`
- **方法**: GET

### 7. 检查用户是否有店铺

- **接口名称**: 检查用户是否有店铺
- **URL**: `/v1/users/has-shop`
- **方法**: GET

## 店铺相关接口

### 1. 提交店铺信息

- **接口名称**: 提交店铺信息
- **URL**: `/v1/shops`
- **方法**: POST

### 2. 获取店铺信息

- **接口名称**: 获取店铺信息
- **URL**: `/v1/shops/info`
- **方法**: GET

### 3. 上传图片

- **接口名称**: 上传图片
- **URL**: `/v1/upload`
- **方法**: POST
- **请求参数**: 
  - 使用 FormData 格式上传
  - 字段名: `file`
  - 文件类型: jpg, jpeg, png

### 4. 多图上传

- **接口名称**: 多图上传
- **URL**: `/v1/upload/multiple`
- **方法**: POST
- **请求参数**: 
  - 使用 FormData 格式上传
  - 字段名: `files`
  - 参数: `type`、`fileCount`

## 商品相关接口

### 1. 获取商品列表

- **接口名称**: 获取商品列表
- **URL**: `/v1/products`
- **方法**: GET
- **请求参数**:
  ```
  ?page=1&limit=10&shopId=xxx&status=1
  ```

### 2. 创建商品

- **接口名称**: 创建商品
- **URL**: `/v1/products`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "name": "商品名称",
    "description": "商品描述",
    "shopId": "店铺ID",
    "images": ["http://图片URL1", "http://图片URL2"],
    "sellingPrice": 100,
    "originalPrice": 200,
    "rewardAmount": 10,
    "categoryId": "分类ID",
    "specification": "规格",
    "stock": 999,
    "promotionStart": "2023-08-01T00:00:00Z",
    "promotionEnd": "2023-09-01T00:00:00Z"
  }
  ```

### 3. 获取商品分类

- **接口名称**: 获取商品分类
- **URL**: `/v1/categories`
- **方法**: GET

### 4. 更新商品

- **接口名称**: 更新商品
- **URL**: `/v1/products/{productId}`
- **方法**: PUT

### 5. 获取商品详情

- **接口名称**: 获取商品详情
- **URL**: `/v1/products/{productId}`
- **方法**: GET

### 6. 更新商品库存

- **接口名称**: 更新商品库存
- **URL**: `/v1/products/{productId}/stock`
- **方法**: PATCH
- **请求参数**:
  ```json
  {
    "stock": 100
  }
  ```

### 7. 更新商品状态

- **接口名称**: 更新商品状态
- **URL**: `/v1/products/{productId}/status`
- **方法**: PATCH
- **请求参数**:
  ```json
  {
    "status": 1  // 1: 上架, 0: 下架
  }
  ```

### 8. 批量更新商品状态

- **接口名称**: 批量更新商品状态
- **URL**: `/v1/products/batch/status`
- **方法**: PATCH
- **请求参数**:
  ```json
  {
    "productIds": ["id1", "id2"],
    "status": 1
  }
  ```

## 订单相关接口

### 1. 获取订单列表

- **接口名称**: 获取订单列表
- **URL**: `/v1/orders`
- **方法**: GET
- **请求参数**:
  ```
  ?page=1&limit=10
  ```

## 错误码说明

| 错误码 | 说明 |
| ----- | ---- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或登录已过期 |
| 403 | 没有权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
