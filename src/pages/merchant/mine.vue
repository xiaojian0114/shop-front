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
export default {
  data() {
    return {
      userInfo: {},
      shopInfo: {},
      orderStats: null,
      currentPath: "",
      isMerchant: false,
      avatarLoadError: false,
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
      this.isMerchant = this.userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
    },

    // 加载商家信息
    async loadMerchantInfo() {
      try {
        const res = await uni.request({
          url: "http://localhost:8080/merchant/merchant/info",
          header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        });

        if (res.data.code === 200) {
          const data = res.data.data;
          this.userInfo = data.userInfo || {};
          this.shopInfo = data.shopInfo || {};

          // 更新本地存储的用户信息
          if (this.userInfo) {
            uni.setStorageSync("userInfo", this.userInfo);
          }

          console.log("商家信息:", data);
        } else {
          uni.showToast({ title: res.data.msg || "加载失败", icon: "none" });
        }
      } catch (error) {
        console.error("加载商家信息失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    // 加载订单统计
    async loadOrderStats() {
      try {
        const res = await uni.request({
          url: "http://localhost:8080/merchant/order/stats",
          header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        });

        if (res.data.code === 200) {
          this.orderStats = res.data.data;
          console.log("订单统计:", this.orderStats);
        } else {
          console.warn("加载订单统计失败:", res.data.msg);
        }
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

<style scoped>
.container {
  padding-bottom: 140rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

.mine {
  background: #fcfcfc;
  min-height: 100vh;
}

/* 用户信息区域 */
.user-info {
  padding: 80rpx 0 60rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 90rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.8);
  margin-bottom: 20rpx;
  background: #fff;
}

.nickname {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.shop-name {
  font-size: 32rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 15rpx;
}

.shop-status {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
}

.status-success {
  background: rgba(7, 193, 96, 0.2);
  color: #07c160;
}

.status-pending {
  background: rgba(255, 153, 0, 0.2);
  color: #ff9900;
}

.status-rejected {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
  background: #fff;
  margin: -40rpx 30rpx 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 30rpx 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  border: 2rpx solid #e9ecef;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

/* 菜单区域 */
.menu {
  margin: 0 30rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 32rpx;
  transition: background-color 0.3s;
}

.item:active {
  background: #f8f9fa;
}

.item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-icon {
  width: 40rpx;
  height: 40rpx;
}

.arrow {
  color: #ccc;
  font-size: 28rpx;
}

/* 底栏样式 */
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
  .user-info {
    padding: 60rpx 0 40rpx;
  }

  .avatar {
    width: 160rpx;
    height: 160rpx;
  }

  .stats-cards {
    margin: -30rpx 20rpx 20rpx;
    padding: 25rpx;
  }

  .menu {
    margin: 0 20rpx;
  }

  .item {
    padding: 30rpx;
  }
}
</style>
