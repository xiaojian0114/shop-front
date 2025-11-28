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
    loadShopDetail() {
      uni.request({
        url: `http://localhost:8080/merchant/shop/info`,
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          if (res.data.code === 200) {
            this.shopDetail = res.data.data || {};
          }
        },
      });
    },

    loadProducts() {
      if (!this.shopId) return;

      uni.request({
        url: `http://localhost:8080/merchant/products?shopId=${this.shopId}`,
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          if (res.data.code === 200) {
            this.products = res.data.data || [];
          }
        },
        fail: (err) => {
          console.error("加载商品失败:", err);
          uni.showToast({ title: "加载商品失败", icon: "none" });
        },
      });
    },

    offProduct(productId) {
      uni.showModal({
        title: "确认下架",
        content: "确定要下架这个商品吗？",
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `http://localhost:8080/merchant/product/off/${productId}`,
              method: "PUT",
              header: {
                Authorization: "Bearer " + uni.getStorageSync("token"),
              },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({ title: "下架成功", icon: "success" });
                  this.loadProducts(); // 重新加载商品列表
                } else {
                  uni.showToast({
                    title: res.data.msg || "下架失败",
                    icon: "none",
                  });
                }
              },
              fail: () => {
                uni.showToast({ title: "下架失败", icon: "none" });
              },
            });
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

<style scoped>
.container {
  padding: 30rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 店铺头部信息 */
.header {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 20rpx;
  margin-right: 30rpx;
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
}

.status {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.status.success {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.status.pending {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

/* 内容区域 */
.content {
  padding: 0 10rpx;
  margin-bottom: 30rpx;
}

.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 商品列表区域 */
.product-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.product-count {
  font-size: 26rpx;
  color: #999;
}

/* 商品列表 */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.product-card {
  display: flex;
  padding: 25rpx;
  background: #fafafa;
  border-radius: 16rpx;
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
}

.product-card:active {
  background: #f5f5f5;
  transform: translateY(2rpx);
}

.product-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
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
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: 26rpx;
  color: #999;
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
  font-size: 28rpx;
  font-weight: 600;
  color: #ff6b35;
}

.product-sales {
  font-size: 24rpx;
  color: #999;
}

/* 商品操作 */
.product-actions {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  min-width: 100rpx;
}

.off-btn {
  background: #ff4444;
  color: #fff;
}

.off-text {
  font-size: 24rpx;
  color: #999;
  padding: 12rpx 0;
}

/* 空商品状态 */
.empty-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.add-product-btn {
  background: #ff6b35;
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  min-width: 200rpx;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: 20rpx;
  }

  .header {
    padding: 30rpx;
  }

  .product-card {
    padding: 20rpx;
  }

  .product-image {
    width: 140rpx;
    height: 140rpx;
  }
}
</style>
