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

    <!-- 空状态 -->
    <view v-if="list.length === 0" class="empty-state">
      <view class="empty-icon">空</view>
      <text class="empty-text">暂无商品 ~ 去商家上架吧！</text>
    </view>
  </view>
</template>

<script>
import request from "@/utils/request.js";

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
        const data = await request.get("/user/products");
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
        await request.post("/user/cart/add", { productId: g.id, num: 1 });
        uni.showToast({ title: "加入成功", icon: "success" });
      } catch (err) {}
    },

    toDetail(g) {
      uni.navigateTo({ url: `/pages/common/goods-detail?id=${g.id}` });
    },

    // ------------------ 模糊搜索 ------------------
    onSearchInput(e) {
      clearTimeout(this.searchTimer);
      const keyword = e.detail.value || e;
      this.searchTimer = setTimeout(() => {
        this.search(keyword);
      }, 300);
    },

    async search(keyword) {
      if (!keyword) {
        this.initPage(); // 为空恢复列表
        return;
      }

      try {
        // GET 请求把 keyword 放到 data 中，而不是 params
        const data = await request.get("/user/products/search", { keyword });
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

<style scoped>
.home {
  background: linear-gradient(135deg, #f5f9ff 0%, #e8f4ff 100%);
  min-height: 100vh;
  position: relative;
}
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
  border-radius: 50%;
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
  padding: 30rpx 24rpx 20rpx;
}
.search-container {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 50rpx;
  padding: 0 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.15);
}
.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #9ca3af;
}
.search-container input {
  flex: 1;
  padding: 24rpx 0;
  font-size: 30rpx;
}
.section-title {
  padding: 30rpx 24rpx 20rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
}
.goods-carousel {
  position: relative;
  height: 350rpx;
  margin: 0 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.15);
}
.carousel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s;
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
  bottom: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12rpx;
}
.carousel-indicator view {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}
.carousel-indicator view.active {
  background: #fff;
  width: 32rpx;
  border-radius: 8rpx;
}
.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx 140rpx;
}
.goods-card {
  width: 48%;
  margin: 2% 1%;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, 0.08);
  position: relative;
  transition: all 0.3s;
}
.goods-card:active {
  transform: translateY(4rpx);
}
.card-badge {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  background: #ff4757;
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  z-index: 1;
}
.goods-card image {
  width: 100%;
  height: 300rpx;
}
.info {
  padding: 20rpx;
}
.name {
  font-weight: 600;
  color: #1f2937;
  height: 80rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.price {
  color: #ff6b00;
  font-size: 36rpx;
  font-weight: 700;
  margin-top: 8rpx;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
}
.sales {
  color: #6b7280;
  font-size: 24rpx;
}
.goods-card button {
  background: linear-gradient(135deg, #4a90e2 0%, #63b3ed 100%);
  color: #fff;
  border-radius: 40rpx;
  font-size: 24rpx;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}
.empty-state {
  text-align: center;
  padding: 200rpx 40rpx;
  color: #aaa;
}
.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}
.empty-text {
  display: block;
  margin-bottom: 40rpx;
  font-size: 32rpx;
}
</style>
