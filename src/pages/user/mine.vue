<template>
  <view class="mine">
    <!-- 顶部背景 -->
    <view class="header">
      <view class="bg-shape"></view>
      <view class="user-card">
        <view class="avatar-wrapper" @tap="changeAvatar">
          <image
            :src="avatarUrl"
            class="avatar"
            mode="aspectFill"
            @error="avatarError = true"
          ></image>
          <view class="avatar-edit">
            <text class="icon">✎</text>
          </view>
        </view>
        <view class="info">
          <text class="nickname">{{ userInfo.nickname || "校园用户" }}</text>
          <text class="phone">{{ userInfo.phone || "点击登录" }}</text>
        </view>
      </view>
    </view>

    <!-- 订单统计 -->
    <view class="order-box">
      <view class="box-title">
        <text class="title">我的订单</text>
        <text class="more" @tap="goOrder(0)">查看全部 ></text>
      </view>
      <view class="order-stats">
        <view class="item" @tap.stop="goOrder(1)">
          <view class="icon-box" :class="{ active: stats.waitPay > 0 }">
            <text class="icon">🛒</text>
            <view class="badge" v-if="stats.waitPay > 0">{{
              stats.waitPay > 99 ? "99+" : stats.waitPay
            }}</view>
          </view>
          <text class="txt">待支付</text>
        </view>
        <view class="item" @tap.stop="goOrder(2)">
          <view class="icon-box" :class="{ active: stats.waitSend > 0 }">
            <text class="icon">📦</text>
            <view class="badge" v-if="stats.waitSend > 0">{{
              stats.waitSend > 99 ? "99+" : stats.waitSend
            }}</view>
          </view>
          <text class="txt">待发货</text>
        </view>
        <view class="item" @tap.stop="goOrder(3)">
          <view class="icon-box" :class="{ active: stats.waitReceive > 0 }">
            <text class="icon">🚚</text>
            <view class="badge" v-if="stats.waitReceive > 0">{{
              stats.waitReceive > 99 ? "99+" : stats.waitReceive
            }}</view>
          </view>
          <text class="txt">待收货</text>
        </view>
        <view class="item" @tap.stop="goOrder(4)">
          <view class="icon-box">
            <text class="icon">✅</text>
          </view>
          <text class="txt">已完成</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @tap="goOrder(0)">
          <view class="item-left">
            <view class="item-icon order">📋</view>
            <text class="label">全部订单</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="toCart">
          <view class="item-left">
            <view class="item-icon cart">🛍️</view>
            <text class="label">我的购物车</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="soon">
          <view class="item-left">
            <view class="item-icon address">📍</view>
            <text class="label">收货地址</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="soon">
          <view class="item-left">
            <view class="item-icon favorite">❤️</view>
            <text class="label">我的收藏</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="menu-item" @tap="soon">
          <view class="item-left">
            <view class="item-icon service">💬</view>
            <text class="label">联系客服</text>
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
  </view>
</template>

<script>
import userApi from "@/api/user.js";

export default {
  data() {
    return {
      userInfo: {},
      stats: {
        waitPay: 0,
        waitSend: 0,
        waitReceive: 0,
        finished: 0,
      },
      avatarError: false,
      loading: false,
    };
  },

  computed: {
    avatarUrl() {
      console.log("avatarError:", this.avatarError);
      if (this.avatarError) return "/static/default-avatar.png";
      console.log("this.userInfo:", this.userInfo);

      if (this.userInfo.avatar) {
        return this.userInfo.avatar.startsWith("http")
          ? this.userInfo.avatar
          : "http://localhost:8080" + this.userInfo.avatar;
      }
      return "/static/default-avatar.png";
    },
  },

  onShow() {
    console.log("mine 页面 onShow 触发了");
    this.loadUserInfo();
    this.loadOrderStats();
  },

  onPullDownRefresh() {
    this.loadUserInfo(() => {
      this.loadOrderStats(() => uni.stopPullDownRefresh());
    });
  },

  methods: {
    /** 获取个人信息 */
    async loadUserInfo(cb) {
      const token = uni.getStorageSync("token");
      if (!token) return;

      this.loading = true;
      try {
        const userInfo = await userApi.getUserInfo();
        this.userInfo = userInfo || {};
        uni.setStorageSync("userInfo", this.userInfo);
        console.log("用户信息：", this.userInfo);
      } catch (error) {
        console.warn("获取用户信息失败：", error);
      } finally {
        this.loading = false;
        cb?.();
      }
    },

    /** 加载订单统计 */
    async loadOrderStats(cb) {
      const token = uni.getStorageSync("token");
      if (!token) return cb?.();

      try {
        const result = await userApi.getOrderList({
          status: 0,
          page: 1,
          pageSize: 999,
        });

        const list = result?.list || [];
        this.stats = {
          waitPay: list.filter((i) => i.status === 1).length,
          waitSend: list.filter((i) => i.status === 2).length,
          waitReceive: list.filter((i) => i.status === 3).length,
          finished: list.filter((i) => i.status === 4).length,
        };
        console.log("订单统计：", this.stats);
      } catch (error) {
        console.warn("获取订单统计失败：", error);
      } finally {
        cb?.();
      }
    },

    goOrder(status) {
      uni.navigateTo({ url: `/pages/common/order-list?status=${status}` });
    },

    toCart() {
      uni.switchTab({ url: "/pages/user/cart" });
    },

    soon() {
      uni.showToast({ title: "功能开发中~", icon: "none" });
    },

    logout() {
      uni.showModal({
        content: "确定要退出登录吗？",
        success: (e) => {
          if (e.confirm) {
            uni.showLoading({ title: "退出中...", mask: true });
            setTimeout(() => {
              uni.clearStorageSync();
              uni.hideLoading();
              uni.reLaunch({ url: "/pages/auth/login" });
            }, 800);
          }
        },
      });
    },

    changeAvatar() {
      uni.showToast({ title: "头像编辑功能开发中", icon: "none" });
    },
  },
};
</script>

<style scoped>
.mine {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 顶部区域 */
.header {
  height: 380rpx;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  position: relative;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  top: -150rpx;
  right: -150rpx;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.user-card {
  display: flex;
  align-items: center;
  padding: 100rpx 40rpx 0;
  position: relative;
  z-index: 2;
}

.avatar-wrapper {
  position: relative;
  margin-right: 30rpx;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.avatar-edit .icon {
  font-size: 20rpx;
  color: #fff;
}

.info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.phone {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 订单统计 */
.order-box {
  background: #fff;
  margin: -60rpx 30rpx 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.box-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.more {
  font-size: 26rpx;
  color: #999;
}

.order-stats {
  display: flex;
  justify-content: space-around;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.icon-box {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  transition: all 0.3s;
}

.icon-box.active {
  background: #e3f2fd;
}

.icon {
  font-size: 40rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: #ff4757;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.txt {
  font-size: 26rpx;
  color: #666;
}

/* 菜单列表 */
.menu-list {
  padding: 0 30rpx;
}

.menu-group {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.05);
}

.menu-item {
  height: 100rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.2s;
}

.menu-item:active {
  background: #f8f9fa;
}

.menu-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 28rpx;
}

.item-icon.order {
  background: #e3f2fd;
  color: #2196f3;
}

.item-icon.cart {
  background: #fff3e0;
  color: #ff9800;
}

.item-icon.address {
  background: #e8f5e9;
  color: #4caf50;
}

.item-icon.favorite {
  background: #fce4ec;
  color: #e91e63;
}

.item-icon.service {
  background: #f3e5f5;
  color: #9c27b0;
}

.item-icon.logout {
  background: #ffebee;
  color: #f44336;
}

.label {
  font-size: 32rpx;
  color: #333;
}

.logout .label {
  color: #f44336;
  font-weight: 500;
}

.arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-group {
  margin-bottom: 0;
}

/* 加载状态 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #6a11cb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
