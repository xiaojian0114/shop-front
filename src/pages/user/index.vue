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
        <view class="search-icon">搜索</view>
        <input placeholder="搜索商品" @input="onSearchInput" />
      </view>
    </view>

    <!-- 精选轮播 -->
    <view class="section-title">精选推荐</view>
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
    <view class="section-title">热门商品</view>
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
      <view class="empty-icon">空</view>
      <text class="empty-text">暂无商品 ~ 去商家上架吧！</text>
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
  background: linear-gradient(135deg, #f5f9ff 0%, #e8f4ff 100%);
  min-height: 100vh;
  position: relative;
}
.decoration-top {
  position: absolute;
  top: 0;
  right: 0;
  width: 300rpx;
  height: 300rpx;
}
.circle {
  position: absolute;
  border-radius: $uni-border-radius-circle;
  background: rgba(74, 144, 226, 0.1);
}
.circle1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -80rpx;
}
.circle2 {
  width: 120rpx;
  height: 120rpx;
  top: 40rpx;
  right: 40rpx;
  background: rgba(255, 107, 0, 0.1);
}
.search-bar {
  padding: $uni-padding-base $uni-padding-sm $uni-padding-sm;
}
.search-container {
  display: flex;
  align-items: center;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-round;
  padding: 0 $uni-padding-base;
  box-shadow: $uni-shadow-base;
}
.search-icon {
  font-size: $uni-font-size-lg;
  margin-right: $uni-margin-sm;
  color: $uni-text-color-placeholder;
}
.search-container input {
  flex: 1;
  padding: $uni-padding-sm 0;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}
.section-title {
  padding: $uni-padding-base $uni-padding-sm $uni-padding-sm;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color-primary;
}
.goods-carousel {
  position: relative;
  height: 350rpx;
  margin: 0 $uni-padding-sm;
  border-radius: $uni-border-radius-xl;
  overflow: hidden;
  box-shadow: $uni-shadow-base;
}
.carousel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity $uni-transition-duration-slow;
}
.carousel-item.active {
  opacity: 1;
}
.carousel-item image {
  width: 100%;
  height: 100%;
}
.carousel-indicator {
  position: absolute;
  bottom: $uni-padding-sm;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: $uni-spacing-sm;
}
.carousel-indicator view {
  width: 16rpx;
  height: 16rpx;
  border-radius: $uni-border-radius-circle;
  background: rgba(255, 255, 255, 0.5);
  transition: all $uni-transition-duration-base;
}
.carousel-indicator view.active {
  background: $uni-text-color-inverse;
  width: 32rpx;
  border-radius: $uni-border-radius-xs;
}
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 $uni-padding-xs 140rpx;
}
.goods-card {
  width: 48%;
  margin: 2% 1%;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
  position: relative;
  transition: all $uni-transition-duration-base;
}
.goods-card:active {
  transform: translateY(4rpx);
  box-shadow: $uni-shadow-card-hover;
}
.card-badge {
  position: absolute;
  top: $uni-padding-xs;
  left: $uni-padding-xs;
  background: $uni-color-error;
  color: $uni-text-color-inverse;
  padding: 6rpx $uni-padding-xs;
  border-radius: $uni-border-radius-lg;
  font-size: $uni-font-size-xs;
  font-weight: $uni-font-weight-semibold;
  z-index: $uni-z-index-base;
}
.goods-card image {
  width: 100%;
  height: 300rpx;
}
.info {
  padding: $uni-padding-sm;
}
.name {
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color-primary;
  height: 80rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: $uni-font-size-base;
}
.price {
  color: $uni-color-price;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  margin-top: $uni-spacing-xs;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
}
.sales {
  color: $uni-text-color-secondary;
  font-size: $uni-font-size-sm;
}
.goods-card button {
  background: $uni-color-secondary-gradient;
  color: $uni-text-color-inverse;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-sm;
  padding: 0 $uni-padding-sm;
  height: 50rpx;
  line-height: 50rpx;
  box-shadow: $uni-shadow-sm;
  transition: all $uni-transition-duration-base;
}
.goods-card button:active {
  transform: scale(0.95);
}
.empty-state {
  text-align: center;
  padding: 200rpx $uni-padding-lg;
  color: $uni-text-color-placeholder;
}
.empty-icon {
  font-size: 120rpx;
  margin-bottom: $uni-margin-base;
  opacity: 0.5;
}
.empty-text {
  display: block;
  margin-bottom: $uni-margin-lg;
  font-size: $uni-font-size-lg;
}
</style>
