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
            <text class="name">{{ g.name }}</text>
            <text class="price">¥{{ formatPrice(g.price) }}</text>
            <text class="stock">库存: {{ g.stock || 0 }}</text>
          </view>
          <button size="mini" type="warn" @tap.stop="offSale(g.id)">
            下架
          </button>
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

    // 加载商品列表
    async loadGoods() {
      if (!this.currentShop) return;

      this.loading = true;
      try {
        const goods = await merchantApi.product.getList(this.currentShop.id);
        this.goods = goods || [];
      } catch (error) {
        console.error("加载商品列表失败:", error);
        uni.showToast({ title: "加载商品失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    // 下架商品
    async offSale(id) {
      uni.showModal({
        title: "确认下架",
        content: "确定要下架该商品吗？",
        confirmColor: "#ff6b00",
        success: async (res) => {
          if (res.confirm) {
            try {
              await merchantApi.product.offSale(id);
              uni.showToast({ title: "下架成功", icon: "success" });
              this.loadGoods(); // 重新加载商品列表
            } catch (error) {
              console.error("下架商品失败:", error);
              uni.showToast({ title: "下架失败", icon: "none" });
            }
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
      if (!goods.image) return "/static/default.jpg";

      let imageUrl = goods.image;
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = "http://localhost:8080" + imageUrl;
      }

      return imageUrl;
    },

    // 格式化价格
    formatPrice(price) {
      if (!price) return "0.00";
      return parseFloat(price).toFixed(2);
    },
  },
};
</script>

<style scoped>
.container {
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.shop-page {
  padding-bottom: 20rpx;
}

/* 头部店铺选择 */
.header {
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.shop-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e9ecef;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dropdown-icon {
  font-size: 24rpx;
  color: #666;
}

/* 商品列表 */
.goods-list {
  padding: 0 20rpx;
  min-height: 400rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx 0;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.goods-item:active {
  transform: scale(0.98);
}

.goods-img {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
}

.info {
  flex: 1;
}

.name {
  display: block;
  font-weight: bold;
  margin-bottom: 10rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
}

.price {
  color: #ff6b00;
  font-size: 32rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.stock {
  font-size: 24rpx;
  color: #666;
  display: block;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #999;
  margin-bottom: 15rpx;
}

.empty-tip {
  display: block;
  font-size: 26rpx;
  color: #ccc;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #ff6b00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
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
  right: 40rpx;
  bottom: 180rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff6b00, #ff8c00);
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 120rpx;
  font-size: 60rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
  z-index: 998;
  transition: transform 0.3s;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  font-weight: bold;
}

/* 商家底栏 */
.merchant-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  z-index: 9999;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
  transition: color 0.3s;
}

.tab-item .icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 8rpx;
}

.tab-item.active {
  color: #ff6b35;
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
    right: 30rpx;
  }
}
</style>
