# 裂变王商家中心小程序

## 项目说明

这是一个面向商家的微信小程序，专注于帮助商家开店、管理商品、处理订单以及提现收益等核心业务流程。通过简洁易用的界面，商家可以轻松完成从开店申请到日常运营的全流程管理。

## 功能特性

- 商家登录与认证
  - 微信快捷登录
  - 手机号一键授权
  - 多端账号互通

- 店铺管理
  - 店铺开通申请
  - 店铺信息设置
  - 营业资质上传
  - 法人信息认证

- 商品管理
  - 商品列表展示
  - 添加/编辑商品
  - 商品分类管理
  - 商品图片上传
  - 商品上下架控制
  - 库存实时管理
  - 活动时间设置

- 订单管理
  - 订单列表查看
  - 订单详情展示
  - 订单状态更新
  - 扫码/数字核销
  - 退款申请处理

- 收益管理
  - 收益总览
  - 提现申请
  - 提现记录查询
  - 账单明细筛选

## 技术栈

- 框架：微信小程序原生框架
- UI组件：自定义组件
- 状态管理：本地缓存
- 图片处理：微信官方API
- 网络请求：Promise封装

## API 接口文档

### 基础信息

- 基础URL: `https://shindou.icu:4000/api`
- 请求格式：JSON
- 认证方式：Bearer Token

### 接口列表

#### 1. 用户相关

- 登录
  - POST `/v1/users/login`
  - 参数：phone, code

- 微信登录
  - POST `/v1/users/wx-login`
  - 参数：code, encryptedData, iv

- 发送验证码
  - POST `/v1/users/send-code`
  - 参数：phone

- 获取用户信息
  - GET `/v1/users/info`

#### 2. 店铺相关

- 提交店铺申请
  - POST `/v1/shops`
  - 参数：店铺基本信息、法人信息、资质信息

- 获取店铺信息
  - GET `/v1/shops/info`

- 获取店铺审核状态
  - GET `/v1/shops/status`

- 图片上传
  - POST `/v1/upload`
  - 支持单图上传
  
- 多图上传
  - POST `/v1/upload/multiple`
  - 支持批量上传图片

#### 3. 商品相关

- 获取商品列表
  - GET `/v1/products`
  - 支持分页、状态筛选

- 获取商品分类
  - GET `/v1/categories`

- 创建商品
  - POST `/v1/products`
  - 包含商品基本信息、价格、库存等

- 更新商品
  - PUT `/v1/products/{productId}`

- 获取商品详情
  - GET `/v1/products/{productId}`

- 商品状态管理
  - PATCH `/v1/products/{productId}/status`
  - 参数：status (0-下架, 1-上架)

#### 4. 订单相关

- 获取订单列表
  - GET `/v1/orders`
  - 支持分页和状态筛选

- 获取订单详情
  - GET `/v1/orders/{orderId}`

- 订单核销
  - POST `/v1/orders/{orderId}/verify`
  - 参数：verifyCode

- 处理退款申请
  - POST `/v1/orders/{orderId}/refund`
  - 参数：agree (true/false), reason

#### 5. 收益与提现

- 获取收益概览
  - GET `/v1/earnings/overview`

- 提交提现申请
  - POST `/v1/withdrawals`
  - 参数：amount, method

- 获取提现记录
  - GET `/v1/withdrawals`
  - 支持按月份筛选

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未登录或登录过期 |
| 403    | 权限不足 |
| 404    | 资源不存在 |
| 500    | 服务器错误 |

## 项目结构

```
├── pages/                # 页面文件夹
│   ├── login/           # 登录相关页面
│   ├── me/              # 个人中心页面
│   ├── productindex/    # 商品管理页面
│   ├── shop/            # 店铺管理页面
│   ├── orderlist/       # 订单管理页面
│   └── ...
├── components/          # 自定义组件
├── utils/              # 工具函数
│   ├── api.js          # API接口封装
│   ├── util.js         # 通用工具函数
│   └── ...
├── images/             # 静态图片资源
├── app.js             # 应用入口
├── app.json           # 全局配置
└── project.config.json # 项目配置
```

## 开发说明

1. 克隆项目仓库
2. 在微信开发者工具中导入项目
3. 配置 appid 和项目信息
4. 根据需求开发相应功能

## 注意事项

- 敏感信息通过加密传输，确保数据安全
- 严格遵循微信小程序的发布规范
- 注意API调用频率限制，避免触发限流
- 做好用户登录态的维护和刷新
- 上传图片时注意检查网络状态，支持断点续传
- 商品和订单数据实时同步，避免数据不一致
