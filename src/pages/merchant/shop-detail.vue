<!-- pages/merchant/shop-detail.vue -->
<template>
  <view class="container">
    <!-- 店铺基本信息 -->
    <view class="header">
      <image
        :src="shopDetail.logo || '/static/default-shop.jpg'"
        class="shop-logo"
      />
      <view class="shop-info">
        <text class="shop-name">{{ shopDetail.name }}</text>
        <text
          class="status"
          :class="shopDetail.status === 1 ? 'success' : 'pending'"
        >
          {{ shopDetail.status === 1 ? "已通过" : "审核中" }}
        </text>
      </view>
    </view>

    <!-- 店铺其他信息 -->
    <view class="content">
      <view class="info-card">
        <text class="card-title">店铺信息</text>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ formatDate(shopDetail.createTime) }}</text>
        </view>
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
            :src="product.image || '/static/default-product.jpg'"
            class="product-image"
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
            <button
              size="mini"
              class="action-btn off-btn"
              @tap="offProduct(product.id)"
              v-if="product.isOnSale === 1"
            >
              下架
            </button>
            <text class="off-text" v-else>已下架</text>
          </view>
        </view>
      </view>

      <!-- 空商品状态 -->
      <view class="empty-product" v-else>
        <image src="/static/empty-product.png" class="empty-img" />
        <text class="empty-text">暂无商品</text>
        <button class="add-product-btn" @tap="goToAddProduct">添加商品</button>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

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

    async offProduct(productId) {
      uni.showModal({
        title: "确认下架",
        content: "确定要下架这个商品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await merchantApi.product.offSale(productId);
              uni.showToast({ title: "下架成功", icon: "success" });
              this.loadProducts(); // 重新加载商品列表
            } catch (err) {
              console.error("下架失败:", err);
            }
          }
        },
      });
    },

    goToAddProduct() {
      uni.navigateTo({
        url: "/pages/merchant/add-product",
      });
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: $uni-padding-base;
  background: $uni-bg-color-page;
  min-height: 100vh;
}

/* 店铺头部信息 */
.header {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-lg;
  display: flex;
  align-items: center;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: $uni-border-radius-lg;
  margin-right: $uni-margin-base;
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: 15rpx;
}

.status {
  font-size: $uni-font-size-sm;
  padding: $uni-spacing-xs $uni-margin-sm;
  border-radius: $uni-border-radius-lg;
  align-self: flex-start;
}

.status.success {
  background: rgba(7, 193, 96, 0.1);
  color: $uni-color-success;
}

.status.pending {
  background: rgba(255, 153, 0, 0.1);
  color: $uni-color-warning;
}

/* 内容区域 */
.content {
  padding: 0 $uni-spacing-xs;
  margin-bottom: $uni-margin-base;
}

.info-card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  box-shadow: $uni-shadow-sm;
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
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  box-shadow: $uni-shadow-sm;
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

.action-btn {
  padding: $uni-padding-xs $uni-padding-sm;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
  min-width: 100rpx;
  transition: all $uni-transition-duration-base;
}

.off-btn {
  background: $uni-color-error;
  color: $uni-text-color-inverse;
}

.off-btn:active {
  transform: translateY(2rpx);
  opacity: 0.9;
}

.off-text {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  padding: $uni-padding-xs 0;
}

/* 空商品状态 */
.empty-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx $uni-padding-lg;
  text-align: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: $uni-margin-base;
  opacity: 0.6;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-padding-lg;
}

.add-product-btn {
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  padding: $uni-margin-sm $uni-padding-lg;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  min-width: 200rpx;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}

.add-product-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
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
