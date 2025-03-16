# 商家管理系统 API 文档

## 基础信息

- 本地调试基础URL: `http://shindou.icu:4000/api`
- 生产环境基础URL: `https://api.yourdomain.com/api`
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

### 1. 用户注册/登录

- **接口名称**: 用户注册/登录
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
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "发送成功",
    "data": {
      "expireTime": 300  // 验证码有效期（秒）
    }
  }
  ```

### 3. 获取用户信息

- **接口名称**: 获取用户信息
- **URL**: `/v1/users/info`
- **方法**: GET
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "lbw123456",
      "phone": "13800138000",
      "status": "active",
      "createdAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### 4. 检查用户是否有店铺

- **接口名称**: 检查用户是否有店铺
- **URL**: `/v1/users/check-shop`
- **方法**: GET
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "hasShop": true,
      "shopId": "shop123456"
    }
  }
  ```

## 店铺相关接口

### 1. 提交店铺信息

- **接口名称**: 提交店铺信息
- **URL**: `/v1/shops`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "legalName": "张三",                // 法人姓名
    "idCardNo": "110101199001011234",  // 身份证号
    "idCardFront": "data:image/...",   // 身份证正面照片（Base64或URL）
    "idCardBack": "data:image/...",    // 身份证背面照片（Base64或URL）
    "wxQrCode": "data:image/...",      // 微信二维码（Base64或URL）
    "contactName": "李四",              // 联系人姓名
    "contactPhone": "13900139000",     // 联系电话
    "shopName": "XX商店",               // 店铺名称
    "region": ["广东省", "深圳市", "南山区"], // 地区
    "addressDetail": "XX路XX号",        // 详细地址
    "shopImage": "data:image/...",     // 店铺门脸照片（Base64或URL）
    "licenseImage": "data:image/...",  // 营业执照照片（Base64或URL）
    "permitImage": "data:image/..."    // 经营许可证照片（Base64或URL）
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "提交成功",
    "data": {
      "shopId": "shop123456"
    }
  }
  ```

### 2. 获取店铺信息

- **接口名称**: 获取店铺信息
- **URL**: `/v1/shops/info`
- **方法**: GET
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "shop123456",
      "userId": "lbw123456",
      "legalName": "张三",
      "idCardNo": "110101199001011234",
      "idCardFront": "https://...",
      "idCardBack": "https://...",
      "wxQrCode": "https://...",
      "contactName": "李四",
      "contactPhone": "13900139000",
      "shopName": "XX商店",
      "region": ["广东省", "深圳市", "南山区"],
      "addressDetail": "XX路XX号",
      "shopImage": "https://...",
      "licenseImage": "https://...",
      "permitImage": "https://...",
      "status": "approved",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### 3. 上传图片

- **接口名称**: 上传图片
- **URL**: `/v1/upload`
- **方法**: POST
- **请求参数**: 
  - 使用 FormData 格式上传
  - 字段名: `image`
  - 文件类型: jpg, jpeg, png
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "https://..."
    }
  }
  ```

## 商品相关接口

### 1. 获取商品列表

- **接口名称**: 获取商品列表
- **URL**: `/v1/products`
- **方法**: GET
- **请求参数**:
  ```
  ?page=1&pageSize=10&status=all&keyword=商品&startDate=2023-06-01&endDate=2023-06-30
  ```
  - page: 页码，默认1
  - pageSize: 每页数量，默认10
  - status: 商品状态，可选值：all, active, inactive, pending
  - keyword: 搜索关键词，可搜索商品名称、描述
  - startDate: 开始日期，格式：YYYY-MM-DD
  - endDate: 结束日期，格式：YYYY-MM-DD
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 100,
      "list": [
        {
          "id": "prod123456",
          "shopId": "shop123456",
          "name": "商品1",
          "description": "商品描述",
          "price": 100,
          "originalPrice": 200,
          "stock": 999,
          "image": "https://...",
          "status": "active",
          "createdAt": "2023-06-01T12:00:00Z",
          "updatedAt": "2023-06-01T12:00:00Z"
        }
      ]
    }
  }
  ```

### 2. 创建商品

- **接口名称**: 创建商品
- **URL**: `/v1/products`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "name": "商品1",           // 商品名称
    "description": "商品描述",  // 商品描述
    "price": 100,             // 价格（单位：分）
    "originalPrice": 200,     // 原价（单位：分）
    "stock": 999,             // 库存
    "image": "data:image/..." // 商品图片（Base64或URL）
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "productId": "prod123456"
    }
  }
  ```

### 3. 获取商品分类

- **接口名称**: 获取商品分类
- **URL**: `/v1/categories`
- **方法**: GET
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "categories": [
        {
          "id": "cat123456",
          "name": "分类1",
          "icon": "https://..."
        }
      ]
    }
  }
  ```

### 4. 更新商品

- **接口名称**: 更新商品
- **URL**: `/product/update`
- **方法**: PUT
- **请求参数**:
  ```json
  {
    "id": "prod123456",       // 商品ID
    "name": "商品1",           // 商品名称
    "description": "商品描述",  // 商品描述
    "price": 100,             // 价格（单位：分）
    "originalPrice": 200,     // 原价（单位：分）
    "stock": 999,             // 库存
    "image": "data:image/...", // 商品图片（Base64或URL）
    "status": "active"        // 商品状态：active, inactive, pending
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {
      "productId": "prod123456"
    }
  }
  ```

### 5. 删除商品

- **接口名称**: 删除商品
- **URL**: `/product/delete`
- **方法**: DELETE
- **请求参数**:
  ```json
  {
    "id": "prod123456"  // 商品ID
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "删除成功",
    "data": {}
  }
  ```

### 6. 商品上架

- **接口名称**: 商品上架
- **URL**: `/product/online`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "prod123456"  // 商品ID
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "上架成功",
    "data": {}
  }
  ```

### 7. 商品下架

- **接口名称**: 商品下架
- **URL**: `/product/offline`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "prod123456"  // 商品ID
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "下架成功",
    "data": {}
  }
  ```

### 8. 批量商品下架

- **接口名称**: 批量商品下架
- **URL**: `/product/batchOffline`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "ids": ["prod123456", "prod123457", "prod123458"]  // 商品ID数组
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "批量下架成功",
    "data": {
      "successCount": 3,
      "failCount": 0
    }
  }
  ```

### 9. 修改商品库存

- **接口名称**: 修改商品库存
- **URL**: `/product/updateStock`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "prod123456",  // 商品ID
    "stock": 100         // 新库存数量
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "库存修改成功",
    "data": {
      "id": "prod123456",
      "stock": 100
    }
  }
  ```

### 10. 编辑商品

- **接口名称**: 编辑商品
- **URL**: `/product/edit`
- **方法**: PUT
- **请求参数**:
  ```json
  {
    "id": "prod123456",       // 商品ID
    "name": "商品1",           // 商品名称
    "description": "商品描述",  // 商品描述
    "price": 100,             // 价格（单位：分）
    "originalPrice": 200,     // 原价（单位：分）
    "stock": 999,             // 库存
    "image": "data:image/..." // 商品图片（Base64或URL）
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "编辑成功",
    "data": {
      "productId": "prod123456"
    }
  }
  ```

## 订单相关接口

### 1. 获取订单列表

- **接口名称**: 获取订单列表
- **URL**: `/order/list`
- **方法**: GET
- **请求参数**:
  ```
  ?page=1&pageSize=10&status=all&keyword=王五&orderNo=123456&startDate=2023-06-01&endDate=2023-06-30
  ```
  - page: 页码，默认1
  - pageSize: 每页数量，默认10
  - status: 订单状态，可选值：all, pending, refunding, completed
  - keyword: 搜索关键词，可搜索用户名、手机号、商品名称
  - orderNo: 订单编号
  - startDate: 开始日期，格式：YYYY-MM-DD
  - endDate: 结束日期，格式：YYYY-MM-DD
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 100,
      "list": [
        {
          "id": "order123456",
          "orderNo": "20230601123456",
          "shopId": "shop123456",
          "userId": "user123456",
          "products": [
            {
              "id": "prod123456",
              "name": "商品1",
              "price": 100,
              "quantity": 1,
              "image": "https://..."
            }
          ],
          "totalAmount": 100,
          "status": "pending",
          "paymentMethod": "wechat",
          "paymentTime": "2023-06-01T12:00:00Z",
          "shippingInfo": {
            "name": "王五",
            "phone": "13700137000",
            "address": "广东省深圳市南山区XX路XX号"
          },
          "createdAt": "2023-06-01T12:00:00Z",
          "updatedAt": "2023-06-01T12:00:00Z"
        }
      ]
    }
  }
  ```

### 2. 获取订单详情

- **接口名称**: 获取订单详情
- **URL**: `/order/detail`
- **方法**: GET
- **请求参数**:
  ```
  ?id=order123456
  ```
  - id: 订单ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "order123456",
      "orderNo": "20230601123456",
      "shopId": "shop123456",
      "userId": "user123456",
      "products": [
        {
          "id": "prod123456",
          "name": "商品1",
          "price": 100,
          "quantity": 1,
          "image": "https://..."
        }
      ],
      "totalAmount": 100,
      "status": "pending",
      "paymentMethod": "wechat",
      "paymentTime": "2023-06-01T12:00:00Z",
      "shippingInfo": {
        "name": "王五",
        "phone": "13700137000",
        "address": "广东省深圳市南山区XX路XX号"
      },
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### 3. 更新订单状态

- **接口名称**: 更新订单状态
- **URL**: `/order/updateStatus`
- **方法**: PUT
- **请求参数**:
  ```json
  {
    "id": "order123456",     // 订单ID
    "status": "completed"    // 订单状态
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "更新成功",
    "data": {}
  }
  ```

### 4. 订单核销

- **接口名称**: 订单核销
- **URL**: `/order/verify`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "order123456",     // 订单ID
    "verifyCode": "123456"   // 核销码
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "核销成功",
    "data": {
      "orderId": "order123456",
      "verifyTime": "2023-06-01T12:00:00Z"
    }
  }
  ```

### 5. 扫码核销

- **接口名称**: 扫码核销
- **URL**: `/order/scanVerify`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "qrCode": "https://example.com/verify?code=123456"  // 二维码内容
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "核销成功",
    "data": {
      "orderId": "order123456",
      "verifyTime": "2023-06-01T12:00:00Z",
      "orderInfo": {
        "id": "order123456",
        "products": [
          {
            "id": "prod123456",
            "name": "商品1",
            "quantity": 1
          }
        ],
        "totalAmount": 100,
        "userName": "王五",
        "userPhone": "13700137000"
      }
    }
  }
  ```

### 6. 同意退款

- **接口名称**: 同意退款
- **URL**: `/order/approveRefund`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "order123456"  // 订单ID
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "退款已同意",
    "data": {
      "orderId": "order123456",
      "refundTime": "2023-06-01T12:00:00Z"
    }
  }
  ```

### 7. 拒绝退款

- **接口名称**: 拒绝退款
- **URL**: `/order/rejectRefund`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "order123456",        // 订单ID
    "reason": "商品已使用"       // 拒绝原因
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "退款已拒绝",
    "data": {
      "orderId": "order123456",
      "rejectTime": "2023-06-01T12:00:00Z"
    }
  }
  ```

## 提现相关接口

### 1. 获取账户余额

- **接口名称**: 获取账户余额
- **URL**: `/withdraw/balance`
- **方法**: GET
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "balance": 10000,         // 账户余额（单位：分）
      "frozenAmount": 2000,     // 冻结金额（单位：分）
      "availableAmount": 8000   // 可提现金额（单位：分）
    }
  }
  ```

### 2. 申请提现

- **接口名称**: 申请提现
- **URL**: `/withdraw/apply`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "amount": 5000,                // 提现金额（单位：分）
    "bankName": "中国银行",         // 银行名称
    "bankCardNo": "6222021234567890", // 银行卡号
    "accountName": "张三",          // 开户人姓名
    "bankBranch": "北京分行"        // 开户行支行名称（可选）
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "提现申请已提交",
    "data": {
      "withdrawId": "withdraw123456",
      "amount": 5000,
      "status": "pending",
      "applyTime": "2023-06-01T12:00:00Z",
      "estimateArrivalTime": "2023-06-03T12:00:00Z"
    }
  }
  ```

### 3. 获取提现记录列表

- **接口名称**: 获取提现记录列表
- **URL**: `/withdraw/list`
- **方法**: GET
- **请求参数**:
  ```
  ?page=1&pageSize=10&status=all&startDate=2023-06-01&endDate=2023-06-30
  ```
  - page: 页码，默认1
  - pageSize: 每页数量，默认10
  - status: 提现状态，可选值：all, pending, success, failed
  - startDate: 开始日期，格式：YYYY-MM-DD
  - endDate: 结束日期，格式：YYYY-MM-DD
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "total": 10,
      "list": [
        {
          "id": "withdraw123456",
          "amount": 5000,
          "fee": 50,
          "actualAmount": 4950,
          "bankName": "中国银行",
          "bankCardNo": "6222021234******90",
          "accountName": "张三",
          "status": "success",
          "applyTime": "2023-06-01T12:00:00Z",
          "completeTime": "2023-06-02T12:00:00Z",
          "remark": "提现成功"
        }
      ]
    }
  }
  ```

### 4. 获取提现详情

- **接口名称**: 获取提现详情
- **URL**: `/withdraw/detail`
- **方法**: GET
- **请求参数**:
  ```
  ?id=withdraw123456
  ```
  - id: 提现记录ID
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "id": "withdraw123456",
      "amount": 5000,
      "fee": 50,
      "actualAmount": 4950,
      "bankName": "中国银行",
      "bankCardNo": "6222021234567890",
      "accountName": "张三",
      "bankBranch": "北京分行",
      "status": "success",
      "applyTime": "2023-06-01T12:00:00Z",
      "auditTime": "2023-06-01T14:00:00Z",
      "completeTime": "2023-06-02T12:00:00Z",
      "remark": "提现成功",
      "timeline": [
        {
          "time": "2023-06-01T12:00:00Z",
          "status": "pending",
          "description": "提现申请已提交"
        },
        {
          "time": "2023-06-01T14:00:00Z",
          "status": "processing",
          "description": "提现申请已审核"
        },
        {
          "time": "2023-06-02T12:00:00Z",
          "status": "success",
          "description": "提现已到账"
        }
      ]
    }
  }
  ```

### 5. 取消提现申请

- **接口名称**: 取消提现申请
- **URL**: `/withdraw/cancel`
- **方法**: POST
- **请求参数**:
  ```json
  {
    "id": "withdraw123456"  // 提现记录ID
  }
  ```
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "提现申请已取消",
    "data": {
      "id": "withdraw123456",
      "status": "cancelled",
      "cancelTime": "2023-06-01T13:00:00Z"
    }
  }
  ```

## 数据统计接口

### 1. 获取销售统计

- **接口名称**: 获取销售统计
- **URL**: `/stats/sales`
- **方法**: GET
- **请求参数**:
  ```
  ?period=day&date=2023-06-01
  ```
  - period: 统计周期，可选值：day, week, month, year
  - date: 日期，格式：YYYY-MM-DD
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "totalSales": 10000,
      "totalOrders": 100,
      "averageOrderValue": 100,
      "chart": [
        {
          "time": "00:00",
          "sales": 1000,
          "orders": 10
        },
        {
          "time": "01:00",
          "sales": 2000,
          "orders": 20
        }
      ]
    }
  }
  ```

### 2. 获取商品销售排行

- **接口名称**: 获取商品销售排行
- **URL**: `/stats/products`
- **方法**: GET
- **请求参数**:
  ```
  ?period=day&date=2023-06-01&limit=10
  ```
  - period: 统计周期，可选值：day, week, month, year
  - date: 日期，格式：YYYY-MM-DD
  - limit: 返回数量，默认10
- **响应示例**:
  ```json
  {
    "code": 200,
    "message": "获取成功",
    "data": {
      "list": [
        {
          "id": "prod123456",
          "name": "商品1",
          "image": "https://...",
          "sales": 1000,
          "orders": 10
        }
      ]
    }
  }
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
