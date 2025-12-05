<template>
  <view class="home">
    <!-- 顶部装饰 -->
    <view class="decoration-top">
      <view class="circle circle1"></view>
      <view class="circle circle2"></view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-container">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input"
          placeholder="搜索商品" 
          @input="onSearchInput"
          placeholder-style="color: #999"
        />
      </view>
    </view>

    <!-- 精选轮播 -->
    <view class="section-header">
      <text class="section-title">精选推荐</text>
    </view>
    <view class="goods-carousel" v-if="featuredList.length > 0">
      <view
        class="carousel-item"
        v-for="(item, index) in featuredList"
        :key="item.id"
        :class="{ active: currentIndex === index }"
        @tap="toDetail(item)"
      >
        <image :src="item.image || '/static/default.jpg'" mode="aspectFill" />
      </view>
      <view class="carousel-indicator">
        <view
          v-for="(item, index) in featuredList"
          :key="index"
          :class="{ active: currentIndex === index }"
        ></view>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section-header">
      <text class="section-title">热门商品</text>
    </view>
    <view class="goods-grid">
      <view
        class="goods-card"
        v-for="item in list"
        :key="item.id"
        @tap="toDetail(item)"
      >
        <view class="card-badge" v-if="item.sales > 50">热卖</view>
        <image :src="item.image || '/static/default.jpg'" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ item.name }}</text>
          <text class="price">¥{{ item.price }}</text>
          <view class="card-footer">
            <text class="sales">已售 {{ item.sales || 0 }}</text>
            <button size="mini" @tap.stop="addCart(item)">加入购物车</button>
          </view>
        </view>
      </view>
    </view>

    <view v-if="list.length === 0" class="empty-state">
      <view class="empty-icon">🛍️</view>
      <text class="empty-text">暂无商品</text>
      <text class="empty-tip">快去挑选心仪的商品吧</text>
    </view>
  </view>
</template>

<script>
import productApi from "@/api/product.js";
import userApi from "@/api/user.js";

export default {
  data() {
    return {
      list: [],
      featuredList: [],
      currentIndex: 0,
      carouselTimer: null,
      searchTimer: null,
    };
  },

  onReady() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.initPage();
      }, 200);
    });
  },

  onShow() {
    if (process.env.NODE_ENV !== "development") {
      this.initPage();
    }
  },

  onHide() {
    clearInterval(this.carouselTimer);
  },

  onUnload() {
    clearInterval(this.carouselTimer);
  },

  methods: {
    async initPage() {
      const token = uni.getStorageSync("token");
      const userInfo = uni.getStorageSync("userInfo");

      if (!token || !userInfo) {
        this.gotoLogin();
        return;
      }

      try {
        const data = await productApi.getProductList();
        this.list = data || [];
        this.featuredList = this.list.slice(0, 3);
        this.startCarousel();
      } catch (err) {
        this.list = [];
        this.featuredList = [];
      }
    },

    startCarousel() {
      if (this.featuredList.length <= 1) return;
      clearInterval(this.carouselTimer);
      this.carouselTimer = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.featuredList.length;
      }, 3000);
    },

    gotoLogin() {
      if (process.env.NODE_ENV === "development") {
        history.replaceState(null, "", "#/pages/auth/login");
        location.reload();
      } else {
        uni.reLaunch({ url: "/pages/auth/login" });
      }
    },

    async addCart(g) {
      try {
        await userApi.addToCart({ productId: g.id, num: 1 });
        uni.showToast({ title: "加入成功", icon: "success" });
      } catch (err) {
        console.log("加入购物车失败:", err);
      }
    },

    toDetail(g) {
      uni.navigateTo({ url: `/pages/common/goods-detail?id=${g.id}` });
    },

    onSearchInput(e) {
      clearTimeout(this.searchTimer);
      const keyword = e.detail.value || e;
      this.searchTimer = setTimeout(() => {
        this.search(keyword);
      }, 300);
    },

    async search(keyword) {
      if (!keyword) {
        this.initPage();
        return;
      }

      try {
        const data = await productApi.searchProducts({ keyword });
        this.list = data || [];
        this.featuredList = this.list.slice(0, 3);
        this.startCarousel();
      } catch (err) {
        this.list = [];
        this.featuredList = [];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
  min-height: 100vh;
  position: relative;
  padding-bottom: 140rpx; /* 为底部tabBar留出空间 */
}

/* 顶部装饰 - 更柔和的渐变 */
.decoration-top {
  position: absolute;
  top: 0;
  right: 0;
  width: 300rpx;
  height: 300rpx;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
}

.circle1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -80rpx;
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 140, 66, 0.08) 100%);
}

.circle2 {
  width: 120rpx;
  height: 120rpx;
  top: 40rpx;
  right: 40rpx;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.12) 0%, rgba(74, 144, 226, 0.06) 100%);
}

/* 搜索栏 - 统一卡片样式 */
.search-bar {
  padding: $uni-padding-lg $uni-padding-base $uni-padding-base;
  position: relative;
  z-index: $uni-z-index-base;
}

.search-container {
  display: flex;
  align-items: center;
  background: $uni-bg-color;
  border-radius: 50rpx;
  padding: $uni-padding-sm $uni-padding-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.search-container:active {
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
  transform: translateY(1rpx);
}

.search-icon {
  font-size: 32rpx;
  margin-right: $uni-margin-sm;
  color: $uni-text-color-placeholder;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  padding: $uni-padding-xs 0;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  background: transparent;
  border: none;
}

.search-input::placeholder {
  color: $uni-text-color-placeholder;
}

/* 区块标题 - 统一样式 */
.section-header {
  padding: $uni-padding-lg $uni-padding-base $uni-padding-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 32rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  position: relative;
  padding-left: $uni-padding-sm;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c42 100%);
  border-radius: 3rpx;
}

/* 轮播图 - 优化样式 */
.goods-carousel {
  position: relative;
  height: 360rpx;
  margin: 0 $uni-padding-base $uni-margin-lg;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.carousel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
}

.carousel-item image {
  width: 100%;
  height: 100%;
  display: block;
}

.carousel-indicator {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  z-index: 2;
}

.carousel-indicator view {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.carousel-indicator view.active {
  background: $uni-text-color-inverse;
  width: 28rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 商品网格 - 优化布局 */
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 $uni-padding-base 40rpx;
  gap: $uni-margin-base;
}

.goods-card {
  width: calc(50% - #{$uni-margin-base / 2});
  background: $uni-bg-color;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}

.goods-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.card-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%);
  color: $uni-text-color-inverse;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: $uni-font-weight-bold;
  z-index: $uni-z-index-base;
  box-shadow: 0 2rpx 8rpx rgba(255, 68, 68, 0.3);
}

.goods-card image {
  width: 100%;
  height: 320rpx;
  background: $uni-bg-color-grey;
  display: block;
}

.info {
  padding: $uni-padding-base;
}

.name {
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  height: 76rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 28rpx;
  line-height: 38rpx;
  margin-bottom: $uni-margin-sm;
}

.price {
  color: #ff6b00;
  font-size: 36rpx;
  font-weight: $uni-font-weight-bold;
  margin-bottom: $uni-margin-sm;
  display: block;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $uni-margin-sm;
}

.sales {
  color: $uni-text-color-placeholder;
  font-size: 24rpx;
  flex: 1;
}

.goods-card button {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c42 100%);
  color: $uni-text-color-inverse;
  border-radius: 40rpx;
  font-size: 24rpx;
  padding: 0 $uni-padding-base;
  height: 56rpx;
  line-height: 56rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.3);
  transition: all 0.2s ease;
  border: none;
  flex-shrink: 0;
}

.goods-card button:active {
  transform: scale(0.96);
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 0, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 200rpx $uni-padding-lg 100rpx;
  color: $uni-text-color-placeholder;
}

.empty-icon {
  font-size: 160rpx;
  margin-bottom: $uni-margin-lg;
  opacity: 0.4;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: $uni-text-color-secondary;
  margin-bottom: $uni-margin-sm;
  font-weight: $uni-font-weight-medium;
}

.empty-tip {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}
</style>
