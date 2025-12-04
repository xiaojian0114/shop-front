<template>
  <view class="container">
    <view class="mine">
      <!-- 用户信息部分 -->
      <view class="user-info">
        <image
          :src="avatarUrl"
          class="avatar"
          @error="onAvatarError"
          mode="aspectFill"
        />
        <text class="nickname">{{ userInfo.nickname || "商家" }}（商家）</text>
        <text class="shop-name" v-if="shopInfo">{{ shopInfo.name }}</text>
        <text
          class="shop-status"
          v-if="shopInfo"
          :class="getStatusClass(shopInfo.status)"
        >
          {{ getStatusText(shopInfo.status) }}
        </text>
      </view>

      <!-- 统计信息卡片 -->
      <view class="stats-cards" v-if="orderStats">
        <view class="stat-card">
          <text class="stat-number">{{ orderStats.pendingDelivery || 0 }}</text>
          <text class="stat-label">待发货</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ orderStats.todayOrders || 0 }}</text>
          <text class="stat-label">今日订单</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ orderStats.totalProducts || 0 }}</text>
          <text class="stat-label">商品总数</text>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu">
        <view class="item" @tap="goToOrderManage">
          <view class="item-left">
            <image src="/static/icon/order.png" class="item-icon" />
            <text>订单管理</text>
          </view>
          <text class="arrow">></text>
        </view>
        <view class="item" @tap="goTo('/pages/merchant/shop')">
          <view class="item-left">
            <image src="/static/icon/shop.png" class="item-icon" />
            <text>店铺管理</text>
          </view>
          <text class="arrow">></text>
        </view>
        <view class="item" @tap="goTo('/pages/merchant/index')">
          <view class="item-left">
            <image src="/static/icon/goods.png" class="item-icon" />
            <text>商品管理</text>
          </view>
          <text class="arrow">></text>
        </view>
        <view class="item" @tap="logout">
          <view class="item-left">
            <image src="/static/icon/logout.png" class="item-icon" />
            <text>退出登录</text>
          </view>
          <text class="arrow">></text>
        </view>
      </view>
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

        console.log("商家信息:", data);
      } catch (error) {
        console.error("加载商家信息失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
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
      this.avatarLoadError = true;
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

  computed: {
    avatarUrl() {
      // 如果加载失败或者没有头像，使用默认头像
      if (this.avatarLoadError || !this.userInfo.avatar) {
        return "/static/avatar.png";
      }

      let avatarUrl = this.userInfo.avatar;

      // 确保URL格式正确
      if (avatarUrl && !avatarUrl.startsWith("http")) {
        if (avatarUrl.startsWith("//")) {
          avatarUrl = "https:" + avatarUrl;
        } else {
          avatarUrl = "https://" + avatarUrl;
        }
      }

      // 添加时间戳避免缓存
      if (avatarUrl && avatarUrl.startsWith("http")) {
        const separator = avatarUrl.includes("?") ? "&" : "?";
        avatarUrl += separator + "t=" + Date.now();
      }

      return avatarUrl;
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 140rpx;
  background: $uni-bg-color-page;
  min-height: 100vh;
}

.mine {
  background: $uni-bg-color;
  min-height: 100vh;
}

/* 用户信息区域 */
.user-info {
  padding: 80rpx 0 $uni-padding-xl;
  text-align: center;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  position: relative;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 90rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.8);
  margin-bottom: $uni-margin-sm;
  background: $uni-bg-color;
}

.nickname {
  font-size: $uni-font-size-h2;
  font-weight: $uni-font-weight-bold;
  display: block;
  margin-bottom: $uni-spacing-xs;
}

.shop-name {
  font-size: $uni-font-size-lg;
  opacity: 0.9;
  display: block;
  margin-bottom: 15rpx;
}

.shop-status {
  font-size: $uni-font-size-sm;
  padding: $uni-spacing-xs $uni-padding-sm;
  border-radius: $uni-border-radius-lg;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
}

.status-success {
  background: rgba(7, 193, 96, 0.2);
  color: $uni-color-success;
}

.status-pending {
  background: rgba(255, 153, 0, 0.2);
  color: $uni-color-warning;
}

.status-rejected {
  background: rgba(255, 68, 68, 0.2);
  color: $uni-color-error;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  padding: $uni-padding-base;
  gap: $uni-margin-sm;
  background: transparent;
  margin: -40rpx $uni-margin-base $uni-margin-base;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-card;
  position: relative;
  z-index: $uni-z-index-base;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: $uni-padding-base $uni-padding-sm;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  border: 2rpx solid $uni-border-color-light;
}

.stat-number {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  display: block;
  margin-bottom: $uni-spacing-xs;
}

.stat-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

/* 菜单区域 */
.menu {
  margin: 0 $uni-margin-base;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-xl;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx $uni-padding-lg;
  border-bottom: 1rpx solid $uni-border-color-light;
  font-size: $uni-font-size-lg;
  transition: background-color $uni-transition-duration-base;
}

.item:active {
  background: $uni-bg-color-hover;
}

.item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: $uni-margin-sm;
}

.item-icon {
  width: 40rpx;
  height: 40rpx;
}

.arrow {
  color: $uni-border-color;
  font-size: $uni-font-size-base;
}

/* 底栏样式 */
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
  .user-info {
    padding: $uni-padding-xl 0 $uni-padding-lg;
  }

  .avatar {
    width: 160rpx;
    height: 160rpx;
  }

  .stats-cards {
    margin: -30rpx $uni-margin-sm $uni-margin-sm;
    padding: 25rpx;
  }

  .menu {
    margin: 0 $uni-margin-sm;
  }

  .item {
    padding: $uni-padding-base;
  }
}
</style>
