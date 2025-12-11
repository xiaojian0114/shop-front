<template>
  <view class="container">
    <view class="shop-page">
      <!-- 顶部店铺选择 -->
      <view class="header">
        <picker @change="switchShop" :value="shopIndex" :range="shopNames">
          <view class="shop-selector">
            <text class="shop-name">{{
              currentShop?.name || "请选择店铺"
            }}</text>
            <text class="dropdown-icon">▼</text>
          </view>
        </picker>
      </view>

      <!-- 商品列表 -->
      <view class="goods-list">
        <view
          class="goods-item"
          v-for="g in goods"
          :key="g.id"
          @tap="viewGoodsDetail(g.id)"
        >
          <image :src="getGoodsImage(g)" class="goods-img" mode="aspectFill" />

          <view class="info">
            <view class="row">
              <text class="name">{{ g.name }}</text>
              <text
                class="status-tag"
                :class="g.isOnSale === 1 ? 'on' : 'off'"
              >
                {{ g.isOnSale === 1 ? "销售中" : "已下架" }}
              </text>
            </view>

            <view class="meta">
              <text class="price">¥{{ formatPrice(g.price) }}</text>
              <text class="stock">库存 {{ g.stock || 0 }}</text>
            </view>

            <view class="actions" @tap.stop>
              <button
                size="mini"
                :type="g.isOnSale === 1 ? 'warn' : 'primary'"
                class="action-btn"
                @tap="toggleSale(g)"
              >
                {{ g.isOnSale === 1 ? "下架" : "上架" }}
              </button>
              <button
                size="mini"
                plain
                class="action-btn ghost"
                @tap="viewGoodsDetail(g.id)"
              >
                详情
              </button>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="goods.length === 0 && !loading">
          <image src="/static/empty-goods.png" class="empty-icon" />
          <text class="empty-text">暂无商品</text>
          <text class="empty-tip">点击下方按钮添加商品</text>
        </view>

        <!-- 加载状态 -->
        <view class="loading-state" v-if="loading">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
      </view>

      <!-- 添加商品浮动按钮 -->
      <view class="fab" @tap="addGoods">
        <text class="fab-icon">+</text>
      </view>
    </view>

    <!-- 商家专属底栏 -->
    <view class="merchant-tabbar" v-if="isMerchant">
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/index')"
        :class="{ active: currentPath === 'pages/merchant/index' }"
      >
        <image src="/static/tab/merchant-goods.png" class="icon" />
        <text>商品管理</text>
      </view>
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/shop')"
        :class="{ active: currentPath === 'pages/merchant/shop' }"
      >
        <image src="/static/tab/merchant-shop.png" class="icon" />
        <text>店铺信息</text>
      </view>
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/mine')"
        :class="{ active: currentPath === 'pages/merchant/mine' }"
      >
        <image src="/static/tab/merchant-mine.png" class="icon" />
        <text>商家中心</text>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";
import { getProductImageUrl } from "@/utils/image.js";

export default {
  data() {
    return {
      shops: [],
      goods: [],
      shopIndex: 0,
      currentPath: "",
      isMerchant: false,
      loading: false,
    };
  },

  computed: {
    shopNames() {
      return this.shops.map((s) => s.name);
    },

    currentShop() {
      return this.shops[this.shopIndex];
    },
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.initPage();
    this.loadShops();
  },

  onPullDownRefresh() {
    this.loadShops();
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },

  methods: {
    initPage() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
    },

    goTo(path) {
      uni.reLaunch({ url: path });
    },

    // 加载店铺列表
    async loadShops() {
      try {
        const shops = await merchantApi.getMyShops();
        this.shops = shops || [];
        if (this.shops.length > 0) {
          await this.loadGoods();
        }
      } catch (error) {
        console.error("加载店铺列表失败:", error);
        uni.showToast({ title: "加载店铺失败", icon: "none" });
      }
    },

    // 切换店铺
    async switchShop(e) {
      this.shopIndex = e.detail.value;
      await this.loadGoods();
    },

    // 加载商品列表（包含下架）
    async loadGoods() {
      if (!this.currentShop) return;

      this.loading = true;
      try {
        const goods = await merchantApi.product.getAll(this.currentShop.id);
        this.goods = goods || [];
      } catch (error) {
        console.error("加载商品列表失败:", error);
        uni.showToast({ title: "加载商品失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    // 上/下架
    async toggleSale(goods) {
      const isOn = goods.isOnSale === 1;
      uni.showModal({
        title: isOn ? "确认下架" : "确认上架",
        content: isOn ? "确定要下架该商品吗？" : "确定要上架该商品吗？",
        confirmColor: "#ff6b00",
        success: async (res) => {
          if (!res.confirm) return;
          try {
            if (isOn) {
              await merchantApi.product.offSale(goods.id);
              uni.showToast({ title: "下架成功", icon: "success" });
            } else {
              await merchantApi.product.onSale(goods.id);
              uni.showToast({ title: "上架成功", icon: "success" });
            }
            // 本地立即更新，避免等待重新加载导致“没变化”的错觉
            this.goods = this.goods.map((item) =>
              item.id === goods.id
                ? { ...item, isOnSale: isOn ? 0 : 1 }
                : item
            );
            await this.loadGoods(); // 再次拉取，确保与后端一致
          } catch (error) {
            console.error("上下架失败:", error);
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        },
      });
    },

    // 查看商品详情
    viewGoodsDetail(id) {
      uni.navigateTo({
        url: `/pages/merchant/goods-detail-merchant?id=${id}`,
      });
    },

    // 添加商品
    addGoods() {
      uni.navigateTo({ url: "/pages/merchant/add-goods" });
    },

    // 获取商品图片
    getGoodsImage(goods) {
      return getProductImageUrl(goods?.image);
    },

    // 格式化价格
    formatPrice(price) {
      if (!price) return "0.00";
      return parseFloat(price).toFixed(2);
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: $uni-bg-color-page;
}

.shop-page {
  padding-bottom: $uni-padding-sm;
}

/* 头部店铺选择 */
.header {
  background: $uni-bg-color;
  padding: $uni-padding-base;
  border-bottom: 1rpx solid $uni-border-color-light;
  box-shadow: $uni-shadow-sm;
}

.shop-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-padding-sm $uni-padding-base;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-sm;
  border: 1rpx solid $uni-border-color;
  transition: all $uni-transition-duration-base;
}

.shop-selector:active {
  background: $uni-bg-color-hover;
}

.shop-name {
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
}

.dropdown-icon {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

/* 商品列表 */
.goods-list {
  padding: 0 $uni-padding-sm;
  min-height: 400rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  background: $uni-bg-color;
  margin: $uni-margin-sm 0;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-sm;
  box-shadow: $uni-shadow-card;
  transition: all $uni-transition-duration-base;
}

.goods-item:active {
  transform: scale(0.98);
  box-shadow: $uni-shadow-card-hover;
}

.goods-img {
  width: 160rpx;
  height: 160rpx;
  margin-right: $uni-margin-sm;
  border-radius: $uni-border-radius-sm;
  background: $uni-bg-color-grey;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $uni-spacing-xs;
}

.name {
  display: block;
  font-weight: $uni-font-weight-semibold;
  margin-bottom: $uni-spacing-xs;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  line-height: $uni-line-height-base;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $uni-spacing-sm;
}

.status-tag {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: $uni-font-size-sm;
  line-height: 1.2;
  border: 1rpx solid transparent;
}

.status-tag.on {
  color: #07c160;
  background: rgba(7, 193, 96, 0.08);
  border-color: rgba(7, 193, 96, 0.25);
}

.status-tag.off {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.08);
  border-color: rgba(255, 68, 68, 0.2);
}

.meta {
  display: flex;
  align-items: center;
  gap: $uni-spacing-lg;
}

.price {
  color: $uni-color-price;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-bold;
  display: block;
  margin-bottom: $uni-spacing-xs;
}

.stock {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
  display: block;
}

.actions {
  margin-top: $uni-spacing-xs;
  display: flex;
  align-items: center;
  gap: $uni-spacing-sm;
}

.action-btn {
  min-width: 140rpx;
}

.action-btn.ghost {
  border-color: $uni-border-color;
  color: $uni-text-color;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx $uni-padding-lg;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: $uni-margin-base;
  opacity: 0.5;
}

.empty-text {
  display: block;
  font-size: $uni-font-size-lg;
  color: $uni-text-color-placeholder;
  margin-bottom: 15rpx;
}

.empty-tip {
  display: block;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-disabled;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx $uni-padding-lg;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid $uni-bg-color-grey;
  border-top: 4rpx solid $uni-color-primary;
  border-radius: $uni-border-radius-circle;
  animation: spin 1s linear infinite;
  margin-bottom: $uni-margin-sm;
}

.loading-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 添加商品浮动按钮 */
.fab {
  position: fixed;
  right: $uni-padding-lg;
  bottom: 180rpx;
  width: 120rpx;
  height: 120rpx;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  border-radius: $uni-border-radius-circle;
  text-align: center;
  line-height: 120rpx;
  font-size: 60rpx;
  font-weight: $uni-font-weight-bold;
  box-shadow: $uni-shadow-button;
  z-index: $uni-z-index-fixed;
  transition: all $uni-transition-duration-base;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-weight: $uni-font-weight-bold;
}

/* 商家底栏 */
.merchant-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: $uni-bg-color;
  border-top: 1rpx solid $uni-border-color-light;
  display: flex;
  z-index: $uni-z-index-fixed;
  box-shadow: $uni-shadow-lg;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-sm;
  transition: color $uni-transition-duration-base;
}

.tab-item .icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: $uni-spacing-xs;
}

.tab-item.active {
  color: $uni-color-primary;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .goods-item {
    padding: 15rpx;
  }

  .goods-img {
    width: 140rpx;
    height: 140rpx;
  }

  .fab {
    width: 100rpx;
    height: 100rpx;
    line-height: 100rpx;
    font-size: 50rpx;
    bottom: 160rpx;
    right: $uni-padding-base;
  }
}
</style>
