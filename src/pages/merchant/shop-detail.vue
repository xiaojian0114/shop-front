<!-- pages/merchant/shop-detail.vue -->
<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <!-- <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">店铺详情</text>
      <view class="nav-placeholder"></view>
    </view> -->

    <!-- 店铺基本信息 -->
    <view class="header">
      <image
        :src="getShopLogo(shopDetail.logo)"
        :key="shopDetail.logo"
        class="shop-logo"
        mode="aspectFill"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <view class="shop-info">
        <text class="shop-name">{{ shopDetail.name }}</text>
        <view class="status-wrapper">
          <text
            class="status"
            :class="getStatusClass(shopDetail.status)"
          >
            {{ getStatusText(shopDetail.status) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 店铺其他信息 -->
    <view class="content">
      <view class="info-card">
        <text class="card-title">店铺信息</text>
        <!-- <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDate(shopDetail.createTime) }}</text>
        </view> -->
        <view class="info-item">
          <text class="label">店铺状态</text>
          <text class="value">{{
            shopDetail.status === 1 ? "正常营业" : "审核中"
          }}</text>
        </view>
        <view class="info-item">
          <text class="label">商品数量</text>
          <text class="value">{{ products.length }} 个</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-section">
      <view class="section-header">
        <text class="section-title">商品列表</text>
        <text class="product-count">共 {{ products.length }} 个商品</text>
      </view>

      <view class="product-list" v-if="products.length > 0">
        <view
          class="product-card"
          v-for="product in products"
          :key="product.id"
        >
          <image
            :src="getProductImage(product.image)"
            class="product-image"
            mode="aspectFill"
          />
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-desc">{{
              product.description || "暂无描述"
            }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ product.price }}</text>
              <text class="product-sales">库存: {{ product.stock || 0 }}</text>
            </view>
          </view>
          <view class="product-actions">
            <text class="sale-status" :class="product.isOnSale === 1 ? 'on-sale' : 'off-sale'">
              {{ product.isOnSale === 1 ? "销售中" : "已下架" }}
            </text>
          </view>
        </view>
      </view>

      <!-- 空商品状态 -->
      <view class="empty-product" v-else>
        <view class="empty-icon">📦</view>
        <text class="empty-text">暂无商品</text>
        <text class="empty-tip">前往商品管理页面添加商品</text>
        <button class="add-product-btn" @tap="goToProductManage">去添加商品</button>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";
import { getShopLogoUrl, getProductImageUrl } from "@/utils/image.js";

export default {
  data() {
    return {
      shopDetail: {},
      products: [],
      shopId: null,
    };
  },
  onLoad(options) {
    this.shopId = options.id;
    this.loadShopDetail();
    this.loadProducts();
  },
  onPullDownRefresh() {
    this.loadShopDetail();
    this.loadProducts();
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  methods: {
    async loadShopDetail() {
      try {
        this.shopDetail = await merchantApi.getShopInfo();
      } catch (err) {
        console.error("加载店铺信息失败:", err);
      }
    },

    async loadProducts() {
      if (!this.shopId) return;

      try {
        this.products = await merchantApi.product.getList(this.shopId);
      } catch (err) {
        console.error("加载商品失败:", err);
        uni.showToast({ title: "加载商品失败", icon: "none" });
      }
    },

    goBack() {
      uni.navigateBack();
    },

    getStatusText(status) {
      const statusMap = {
        0: "审核中",
        1: "已通过",
        2: "已拒绝",
      };
      return statusMap[status] || "未知状态";
    },

    getStatusClass(status) {
      const classMap = {
        0: "pending",
        1: "success",
        2: "rejected",
      };
      return classMap[status] || "pending";
    },

    goToProductManage() {
      uni.switchTab({ url: "/pages/merchant/index" });
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },

    // 获取店铺logo
    getShopLogo(logo) {
      const url = getShopLogoUrl(logo);
      console.log("店铺详情logo - 原始:", logo, "处理后:", url);
      return url;
    },

    // 图片加载错误处理
    handleImageError(e) {
      console.error("店铺logo加载失败:", e);
      console.error("失败的URL:", e.target?.src || e.detail?.errMsg);
    },

    // 图片加载成功处理
    handleImageLoad(e) {
      console.log("店铺logo加载成功:", e.target?.src);
    },

    // 获取商品图片
    getProductImage(image) {
      return getProductImageUrl(image);
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  background: $uni-bg-color-page;
  min-height: 100vh;
  padding-bottom: $uni-padding-lg;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-padding-base $uni-padding-lg;
  background: $uni-bg-color;
  border-bottom: 1rpx solid $uni-border-color-light;
  position: sticky;
  top: 0;
  z-index: $uni-z-index-fixed;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: $uni-text-color;
  font-weight: $uni-font-weight-bold;
  line-height: 1;
}

.nav-title {
  font-size: 32rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

.nav-placeholder {
  width: 60rpx;
}

/* 店铺头部信息 */
.header {
  background: $uni-bg-color;
  border-radius: 24rpx;
  padding: $uni-padding-lg;
  display: flex;
  align-items: center;
  margin: $uni-margin-base;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.shop-logo {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  margin-right: $uni-margin-base;
  background: $uni-bg-color-grey;
  border: 2rpx solid $uni-border-color-light;
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shop-name {
  font-size: 36rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  margin-bottom: $uni-margin-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-wrapper {
  display: flex;
  align-items: center;
}

.status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-weight: $uni-font-weight-medium;
}

.status.success {
  background: rgba(7, 193, 96, 0.15);
  color: #07c160;
}

.status.pending {
  background: rgba(255, 153, 0, 0.15);
  color: #ff9900;
}

.status.rejected {
  background: rgba(255, 68, 68, 0.15);
  color: #ff4444;
}

/* 内容区域 */
.content {
  padding: 0 $uni-margin-base;
  margin-bottom: $uni-margin-base;
}

.info-card {
  background: $uni-bg-color;
  border-radius: 24rpx;
  padding: $uni-padding-lg;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-margin-base;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-margin-sm 0;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: $uni-font-weight-medium;
}

/* 商品列表区域 */
.product-section {
  background: $uni-bg-color;
  border-radius: 24rpx;
  padding: $uni-padding-lg;
  margin: 0 $uni-margin-base;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-margin-base;
  padding-bottom: $uni-margin-sm;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
}

.product-count {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

/* 商品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: $uni-margin-base;
}

.product-card {
  display: flex;
  padding: 25rpx;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  border: 1rpx solid $uni-border-color-light;
  transition: all $uni-transition-duration-base;
}

.product-card:active {
  background: $uni-bg-color-hover;
  transform: translateY(2rpx);
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-base;
  margin-right: 25rpx;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-xs;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  margin-bottom: 15rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-semibold;
  color: $uni-color-primary;
}

.product-sales {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

/* 商品操作 */
.product-actions {
  display: flex;
  align-items: center;
  margin-left: $uni-margin-sm;
}

.sale-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-weight: $uni-font-weight-medium;
}

.sale-status.on-sale {
  background: rgba(7, 193, 96, 0.15);
  color: #07c160;
}

.sale-status.off-sale {
  background: rgba(158, 158, 158, 0.15);
  color: #9e9e9e;
}

/* 空商品状态 */
.empty-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx $uni-padding-lg;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $uni-margin-lg;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  font-weight: $uni-font-weight-medium;
  color: $uni-text-color;
  margin-bottom: $uni-margin-sm;
}

.empty-tip {
  font-size: 26rpx;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-margin-lg;
  line-height: 1.5;
}

.add-product-btn {
  background: linear-gradient(135deg, #ff6b00, #ff8c42);
  color: $uni-text-color-inverse;
  padding: $uni-padding-base $uni-padding-lg;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: $uni-font-weight-medium;
  min-width: 240rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);
  transition: all 0.3s ease;
}

.add-product-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 0, 0.2);
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: $uni-margin-sm;
  }

  .header {
    padding: $uni-padding-base;
  }

  .product-card {
    padding: $uni-margin-sm;
  }

  .product-image {
    width: 140rpx;
    height: 140rpx;
  }
}
</style>
