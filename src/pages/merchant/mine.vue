<template>
  <view class="mine">
    <!-- 顶部背景 -->
    <view class="header">
      <view class="bg-shape"></view>
      <view class="user-card">
        <view class="avatar-wrapper" @tap="changeAvatar">
          <image
            :src="avatarUrl"
            :key="avatarUrl"
            class="avatar"
            mode="aspectFill"
            @error="handleAvatarError"
            @load="handleAvatarLoad"
          ></image>
          <view class="avatar-edit">
            <text class="icon">✎</text>
          </view>
        </view>
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || "商家" }}</text>
          <text class="phone">{{ userInfo.phone || "点击登录" }}</text>
          <text class="shop-name" v-if="shopInfo">{{ shopInfo.name }}</text>
          <text
            class="shop-status"
            v-if="shopInfo"
            :class="getStatusClass(shopInfo.status)"
          >
            {{ getStatusText(shopInfo.status) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 统计信息卡片 -->
    <view class="stats-box" v-if="orderStats">
      <view class="box-title">
        <text class="title">数据统计</text>
      </view>
      
      <!-- 统计数据卡片 -->
      <view class="stats-grid">
        <view class="stat-card primary">
          <view class="stat-icon">📦</view>
          <view class="stat-content">
            <text class="stat-number">{{ orderStats.pendingDelivery || 0 }}</text>
            <text class="stat-label">待发货</text>
          </view>
        </view>
        
        <view class="stat-card success">
          <view class="stat-icon">📊</view>
          <view class="stat-content">
            <text class="stat-number">{{ orderStats.todayOrders || 0 }}</text>
            <text class="stat-label">今日订单</text>
          </view>
        </view>
        
        <view class="stat-card warning">
          <view class="stat-icon">🛍️</view>
          <view class="stat-content">
            <text class="stat-number">{{ orderStats.totalProducts || 0 }}</text>
            <text class="stat-label">商品总数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @tap="goToOrderManage">
          <view class="item-left">
            <view class="item-icon order">📋</view>
            <text class="label">订单管理</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goTo('/pages/merchant/shop')">
          <view class="item-left">
            <view class="item-icon shop">🏪</view>
            <text class="label">店铺管理</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="goTo('/pages/merchant/index')">
          <view class="item-left">
            <view class="item-icon goods">📦</view>
            <text class="label">商品管理</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="menu-group logout-group">
        <view class="menu-item logout" @tap="logout">
          <view class="item-left">
            <view class="item-icon logout">🚪</view>
            <text class="label">退出登录</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-mask" v-if="loading">
      <view class="loading-spinner"></view>
    </view>

    <!-- 商家底栏 -->
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
      userInfo: {},
      shopInfo: {},
      orderStats: null,
      currentPath: "",
      isMerchant: false,
      avatarUrl: "/static/default-avatar.png",
      avatarLoadError: false,
      loading: false,
    };
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.loadMerchantInfo();
    this.loadOrderStats();
    this.initPage();
  },

  onPullDownRefresh() {
    this.loadMerchantInfo();
    this.loadOrderStats();
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

    // 加载商家信息
    async loadMerchantInfo() {
      if (this.loading) return;

      this.loading = true;
      try {
        const data = await merchantApi.getMerchantInfo();
        this.userInfo = data.userInfo || {};
        this.shopInfo = data.shopInfo || {};

        // 更新本地存储的用户信息
        if (this.userInfo) {
          uni.setStorageSync("userInfo", this.userInfo);
        }

        // 更新头像URL
        this.updateAvatarUrl();

        console.log("商家信息:", data);
      } catch (error) {
        console.error("加载商家信息失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },

    // 更新头像URL
    updateAvatarUrl() {
      this.avatarLoadError = false;

      if (!this.userInfo || !this.userInfo.avatar) {
        console.log("无头像信息，使用默认头像");
        this.avatarUrl = "/static/default-avatar.png";
        return;
      }

      const avatar = this.userInfo.avatar;
      console.log("原始头像路径:", avatar);

      if (!avatar || typeof avatar !== "string" || avatar.trim() === "") {
        console.log("头像路径为空，使用默认头像");
        this.avatarUrl = "/static/default-avatar.png";
        return;
      }

      const trimmedAvatar = avatar.trim();

      // 完整的 HTTP/HTTPS URL
      if (trimmedAvatar.startsWith("http://") || trimmedAvatar.startsWith("https://")) {
        console.log("使用完整URL:", trimmedAvatar);
        this.avatarUrl = trimmedAvatar;
        return;
      }

      // OSS URL
      if (trimmedAvatar.includes("oss-cn") || trimmedAvatar.includes("aliyuncs.com")) {
        let ossUrl = trimmedAvatar;
        if (!trimmedAvatar.startsWith("http://") && !trimmedAvatar.startsWith("https://")) {
          ossUrl = trimmedAvatar.startsWith("//") ? "https:" + trimmedAvatar : "https://" + trimmedAvatar;
        }
        console.log("使用OSS URL:", ossUrl);
        this.avatarUrl = ossUrl;
        return;
      }

      // 相对路径
      const BASE_URL = "http://121.4.51.19:8080";
      const path = trimmedAvatar.startsWith("/") ? trimmedAvatar : "/" + trimmedAvatar;
      const fullUrl = BASE_URL + path;
      console.log("拼接后的头像URL:", fullUrl);
      this.avatarUrl = fullUrl;
    },

    // 加载订单统计
    async loadOrderStats() {
      try {
        const data = await merchantApi.getOrderStats();
        this.orderStats = data;
        console.log("订单统计:", this.orderStats);
      } catch (error) {
        console.error("加载订单统计失败:", error);
      }
    },

    goTo(path) {
      uni.reLaunch({ url: path });
    },

    logout() {
      uni.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
            uni.reLaunch({ url: "/pages/auth/login" });
          }
        },
      });
    },

    onAvatarError(e) {
      console.error("头像加载失败:", e);
      console.error("失败的头像URL:", this.avatarUrl);
      console.error("用户信息:", this.userInfo);
      console.error("原始头像字段值:", this.userInfo?.avatar);

      if (this.avatarUrl && this.avatarUrl.includes("aliyuncs.com")) {
        console.error("OSS头像加载失败，可能原因：");
        console.error("1. 小程序域名白名单未配置");
        console.error("2. OSS跨域设置问题");
        console.error("3. 图片URL无效");
      }

      if (!this.avatarUrl.includes("default-avatar")) {
        console.log("切换到默认头像");
        this.avatarLoadError = true;
        this.avatarUrl = "/static/default-avatar.png";
      }
    },

    handleAvatarLoad() {
      console.log("头像加载成功:", this.avatarUrl);
      this.avatarLoadError = false;
    },

    changeAvatar() {
      uni.showToast({ title: "头像编辑功能开发中", icon: "none" });
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
        0: "status-pending",
        1: "status-success",
        2: "status-rejected",
      };
      return classMap[status] || "status-pending";
    },

    goToOrderManage() {
      uni.navigateTo({ url: "/pages/merchant/order-manage" });
    },
  },
};
</script>

<style lang="scss" scoped>
.mine {
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* 顶部区域 - 统一渐变背景 */
.header {
  height: 360rpx;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c42 50%, #ffa366 100%);
  position: relative;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.bg-shape::before {
  content: "";
  position: absolute;
  top: 150rpx;
  left: -80rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.user-card {
  display: flex;
  align-items: center;
  padding: 80rpx $uni-padding-lg 40rpx;
  position: relative;
  z-index: $uni-z-index-base;
}

.avatar-wrapper {
  position: relative;
  margin-right: $uni-margin-lg;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  background: $uni-bg-color;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 107, 0, 0.3);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.avatar-edit .icon {
  font-size: 18rpx;
  color: $uni-color-primary;
}

.info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color-inverse;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.phone {
  font-size: $uni-font-size-base;
  color: rgba(255, 255, 255, 0.95);
  opacity: 0.95;
  margin-bottom: 8rpx;
}

.shop-name {
  font-size: $uni-font-size-sm;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8rpx;
}

.shop-status {
  font-size: $uni-font-size-xs;
  padding: 4rpx 12rpx;
  border-radius: $uni-border-radius-lg;
  display: inline-block;
  align-self: flex-start;
  margin-top: 4rpx;
}

.status-success {
  background: rgba(7, 193, 96, 0.25);
  color: #07c160;
  border: 1rpx solid rgba(7, 193, 96, 0.3);
}

.status-pending {
  background: rgba(255, 153, 0, 0.25);
  color: #ff9900;
  border: 1rpx solid rgba(255, 153, 0, 0.3);
}

.status-rejected {
  background: rgba(255, 68, 68, 0.25);
  color: #ff4444;
  border: 1rpx solid rgba(255, 68, 68, 0.3);
}

/* 统计信息卡片 - 统一卡片样式 */
.stats-box {
  background: $uni-bg-color;
  margin: -50rpx $uni-margin-base $uni-margin-lg;
  border-radius: 24rpx;
  padding: $uni-padding-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: $uni-z-index-base;
}

.box-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-margin-lg;
  padding-bottom: $uni-padding-base;
  border-bottom: 2rpx solid $uni-border-color-light;
}

.title {
  font-size: 32rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $uni-margin-base;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $uni-padding-lg $uni-padding-base;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 140, 66, 0.05) 100%);
}

.stat-card.success {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(78, 205, 196, 0.05) 100%);
}

.stat-card.warning {
  background: linear-gradient(135deg, rgba(255, 167, 38, 0.1) 0%, rgba(255, 183, 77, 0.05) 100%);
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: $uni-margin-sm;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 36rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  line-height: 1.2;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $uni-text-color-secondary;
  text-align: center;
}

/* 菜单列表 - 统一卡片样式 */
.menu-list {
  padding: 0 $uni-padding-base;
}

.menu-group {
  background: $uni-bg-color;
  border-radius: 24rpx;
  margin-bottom: $uni-margin-base;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  height: 108rpx;
  padding: 0 $uni-padding-lg;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: all 0.2s ease;
  background: $uni-bg-color;
}

.menu-item:active {
  background: $uni-bg-color-grey;
}

.menu-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $uni-margin-base;
  font-size: 28rpx;
  flex-shrink: 0;
}

.item-icon.order {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.08) 100%);
  color: #2196f3;
}

.item-icon.shop {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(156, 39, 176, 0.08) 100%);
  color: #9c27b0;
}

.item-icon.goods {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%);
  color: #ff9800;
}

.item-icon.logout {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.08) 100%);
  color: #f44336;
}

.label {
  font-size: 30rpx;
  color: $uni-text-color;
  font-weight: $uni-font-weight-medium;
}

.logout .label {
  color: #f44336;
}

.arrow {
  font-size: 32rpx;
  color: $uni-border-color;
  margin-left: $uni-margin-sm;
}

.logout-group {
  margin-bottom: 0;
  margin-top: $uni-margin-base;
}

/* 加载状态 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $uni-z-index-modal;
  backdrop-filter: blur(4rpx);
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid rgba(255, 107, 0, 0.1);
  border-top: 6rpx solid $uni-color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  .user-card {
    padding: 60rpx $uni-padding-base 30rpx;
  }

  .avatar {
    width: 100rpx;
    height: 100rpx;
  }

  .stats-box {
    margin: -40rpx $uni-margin-sm $uni-margin-base;
    padding: $uni-padding-base;
  }

  .menu-list {
    padding: 0 $uni-margin-sm;
  }

  .menu-item {
    padding: 0 $uni-padding-base;
    height: 96rpx;
  }
}
</style>
