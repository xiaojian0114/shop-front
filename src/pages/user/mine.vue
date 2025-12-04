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

<style lang="scss" scoped>
.mine {
  background: $uni-bg-color-page;
  min-height: 100vh;
  padding-bottom: $uni-padding-lg;
}

/* 顶部区域 */
.header {
  height: 380rpx;
  background: $uni-color-primary-gradient;
  position: relative;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  top: -150rpx;
  right: -150rpx;
  width: 400rpx;
  height: 400rpx;
  border-radius: $uni-border-radius-circle;
  background: rgba(255, 255, 255, 0.1);
}

.user-card {
  display: flex;
  align-items: center;
  padding: 100rpx $uni-padding-lg 0;
  position: relative;
  z-index: $uni-z-index-base;
}

.avatar-wrapper {
  position: relative;
  margin-right: $uni-margin-base;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: $uni-border-radius-circle;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: $uni-shadow-lg;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background: $uni-color-error;
  border-radius: $uni-border-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $uni-text-color-inverse;
}

.avatar-edit .icon {
  font-size: 20rpx;
  color: $uni-text-color-inverse;
}

.info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: $uni-font-size-h2;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color-inverse;
  margin-bottom: $uni-spacing-xs;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.phone {
  font-size: $uni-font-size-base;
  color: rgba(255, 255, 255, 0.9);
}

/* 订单统计 */
.order-box {
  background: $uni-bg-color-card;
  margin: -60rpx $uni-margin-base $uni-margin-base;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  box-shadow: $uni-shadow-card;
  position: relative;
  z-index: $uni-z-index-base;
}

.box-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-margin-base;
  padding-bottom: $uni-padding-sm;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.title {
  font-size: 34rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

.more {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
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
  border-radius: $uni-border-radius-lg;
  background: $uni-bg-color-grey;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  transition: all $uni-transition-duration-base;
}

.icon-box.active {
  background: rgba(74, 144, 226, 0.1);
}

.icon {
  font-size: 40rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: $uni-color-error;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-xs;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: $uni-border-radius-base;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $uni-spacing-xs;
  font-weight: $uni-font-weight-bold;
}

.txt {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

/* 菜单列表 */
.menu-list {
  padding: 0 $uni-padding-base;
}

.menu-group {
  background: $uni-bg-color-card;
  border-radius: $uni-border-radius-lg;
  margin-bottom: $uni-margin-base;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
}

.menu-item {
  height: 100rpx;
  padding: 0 $uni-padding-base;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid $uni-border-color-light;
  transition: background $uni-transition-duration-fast;
}

.menu-item:active {
  background: $uni-bg-color-hover;
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
  border-radius: $uni-border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $uni-margin-sm;
  font-size: $uni-font-size-base;
}

.item-icon.order {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.item-icon.cart {
  background: rgba(255, 152, 0, 0.1);
  color: $uni-color-warning;
}

.item-icon.address {
  background: rgba(76, 175, 80, 0.1);
  color: $uni-color-success;
}

.item-icon.favorite {
  background: rgba(233, 30, 99, 0.1);
  color: #e91e63;
}

.item-icon.service {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.item-icon.logout {
  background: rgba(244, 67, 54, 0.1);
  color: $uni-color-error;
}

.label {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
}

.logout .label {
  color: $uni-color-error;
  font-weight: $uni-font-weight-medium;
}

.arrow {
  font-size: $uni-font-size-xl;
  color: $uni-border-color;
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
  z-index: $uni-z-index-modal;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid $uni-bg-color-grey;
  border-top: 6rpx solid $uni-color-primary;
  border-radius: $uni-border-radius-circle;
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
