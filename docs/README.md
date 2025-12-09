# 校园商城项目 - 功能模块讲解文档总览

## 📚 文档目录

本项目为实训项目，每个成员负责不同的功能模块。本文档为各成员负责模块的详细讲解文档索引。

---

## 👥 成员分工与文档

### 1. 龚祺辉 - 客户端功能模块
**负责模块：**
- 客户端首页（商品搜索、商品展示）
- 商品详情页面
- 个人中心页面

**文档链接：** [龚祺辉-客户端功能讲解.md](./龚祺辉-客户端功能讲解.md)

**核心文件：**
- `src/pages/user/index.vue` - 客户端首页
- `src/pages/common/goods-detail.vue` - 商品详情
- `src/pages/user/mine.vue` - 个人中心

---

### 2. 乔雨林 - 商家端功能模块
**负责模块：**
- 商家端个人中心（订单管理、订单情况、店铺申请）
- 首页商品展示与搜索（与客户端共享）

**文档链接：** [乔雨林-商家端功能讲解.md](./乔雨林-商家端功能讲解.md)

**核心文件：**
- `src/pages/merchant/mine.vue` - 商家个人中心
- `src/pages/merchant/order-manage.vue` - 订单管理
- `src/pages/merchant/apply-shop.vue` - 店铺申请
- `src/pages/user/index.vue` - 首页（共享）

---

### 3. 魏航 - 商家端店铺管理模块
**负责模块：**
- 商家端店铺管理（店铺切换、数据概览、商品展示与上下架）
- 首页商品推荐（与客户端共享）

**文档链接：** [魏航-商家端店铺管理讲解.md](./魏航-商家端店铺管理讲解.md)

**核心文件：**
- `src/pages/merchant/index.vue` - 商品管理
- `src/pages/merchant/shop.vue` - 店铺管理
- `src/pages/merchant/shop-detail.vue` - 店铺详情
- `src/pages/user/index.vue` - 首页（共享）

---

### 4. 赵媛丽 - 登录注册、购物车、支付模块
**负责模块：**
- 登录注册页面
- 购物车页面（商品管理和支付）
- 页面设计与美化

**文档链接：** [赵媛丽-登录购物车支付讲解.md](./赵媛丽-登录购物车支付讲解.md)

**核心文件：**
- `src/pages/auth/login.vue` - 登录注册
- `src/pages/user/cart.vue` - 购物车
- `src/pages/common/order-confirm.vue` - 订单确认/支付

---

### 5. 杨帅 - 后台管理端（不包含在前端项目中）
**负责模块：**
- 后台管理端店铺审核
- 商家管理
- 商品管理

**说明：** 后台管理端为独立系统，不在本前端项目中。

---

## 🗂️ 项目结构说明

```
src/
├── pages/                    # 页面目录
│   ├── auth/                 # 认证相关
│   │   └── login.vue        # 登录注册（赵媛丽）
│   ├── user/                 # 用户端
│   │   ├── index.vue        # 首页（龚祺辉、乔雨林、魏航共享）
│   │   ├── mine.vue         # 个人中心（龚祺辉）
│   │   └── cart.vue         # 购物车（赵媛丽）
│   ├── merchant/             # 商家端
│   │   ├── mine.vue         # 商家个人中心（乔雨林）
│   │   ├── index.vue        # 商品管理（魏航）
│   │   ├── shop.vue         # 店铺管理（魏航）
│   │   ├── shop-detail.vue  # 店铺详情（魏航）
│   │   ├── order-manage.vue # 订单管理（乔雨林）
│   │   └── apply-shop.vue  # 店铺申请（乔雨林）
│   └── common/               # 公共页面
│       ├── goods-detail.vue # 商品详情（龚祺辉）
│       ├── order-confirm.vue # 订单确认（赵媛丽）
│       └── order-list.vue  # 订单列表（龚祺辉）
├── api/                      # API接口
│   ├── auth.js              # 认证API
│   ├── user.js              # 用户API
│   ├── product.js           # 商品API
│   ├── merchant.js          # 商家API
│   └── order.js             # 订单API
└── utils/                    # 工具函数
    ├── request.js           # 请求封装
    ├── upload.js            # 图片上传
    └── image.js             # 图片URL处理
```

---

## 🔑 核心技术要点

### 1. 图片URL处理
项目中图片URL有多种格式，需要统一处理：
- **完整URL**：`https://example.com/image.jpg` - 直接使用
- **OSS URL**：`//my-bucket.oss-cn-shanghai.aliyuncs.com/images/xxx.jpg` - 需要添加 `https:`
- **相对路径**：`/images/xxx.jpg` - 需要拼接 `BASE_URL`

**工具函数：** `src/utils/image.js`

### 2. 状态码规范
- **订单状态**：1=待付款，2=待发货，3=已发货，4=已完成，5=已取消
- **店铺状态**：0=审核中，1=已通过，2=已拒绝
- **商品状态**：1=上架，0=下架

### 3. 本地存储
- `token` - 用户认证令牌
- `userInfo` - 用户信息（包含角色、昵称、手机号等）

### 4. 路由导航
- `uni.navigateTo()` - 跳转到新页面（保留当前页面）
- `uni.switchTab()` - 跳转到tabBar页面
- `uni.reLaunch()` - 重启到新页面（关闭所有页面）
- `uni.navigateBack()` - 返回上一页

---

## 📖 文档使用说明

1. **按需查看**：根据自己负责的模块查看对应文档
2. **代码对照**：结合文档和实际代码理解功能实现
3. **问题排查**：遇到问题时查看文档中的"常见问题与解决方案"部分
4. **扩展开发**：参考文档中的"扩展功能建议"进行功能扩展

---

## 🔄 文档更新说明

- **文档版本**：v1.0
- **最后更新**：2024年
- **维护方式**：各成员负责维护自己模块的文档

---

## 📞 联系方式

如有问题或建议，请联系项目负责人或相关模块负责人。

---

**祝实训顺利！** 🎉

