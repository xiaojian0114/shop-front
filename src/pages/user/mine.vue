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
      avatarUrl: "/static/default-avatar.png", // 默认头像
      avatarError: false,
      loading: false,
    };
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
      if (!token) {
        // 没有token，重置头像
        this.avatarUrl = "/static/default-avatar.png";
        this.avatarError = false;
        return;
      }

      this.loading = true;
      try {
        const userInfo = await userApi.getUserInfo();
        this.userInfo = userInfo || {};
        uni.setStorageSync("userInfo", this.userInfo);
        console.log("用户信息：", this.userInfo);
        
        // 更新头像URL
        this.updateAvatarUrl();
      } catch (error) {
        console.warn("获取用户信息失败：", error);
        this.avatarUrl = "/static/default-avatar.png";
        this.avatarError = false;
      } finally {
        this.loading = false;
        cb?.();
      }
    },

    /** 更新头像URL */
    updateAvatarUrl() {
      // 重置错误状态
      this.avatarError = false;
      
      // 如果没有用户信息或头像，使用默认头像
      if (!this.userInfo || !this.userInfo.avatar) {
        console.log("无头像信息，使用默认头像");
        this.avatarUrl = "/static/default-avatar.png";
        return;
      }

      const avatar = this.userInfo.avatar;
      console.log("原始头像路径:", avatar);
      
      // 处理空字符串
      if (!avatar || typeof avatar !== "string" || avatar.trim() === "") {
        console.log("头像路径为空，使用默认头像");
        this.avatarUrl = "/static/default-avatar.png";
        return;
      }

      // 去除首尾空格
      const trimmedAvatar = avatar.trim();
      
      // 如果已经是完整的URL（http/https开头），直接使用
      if (trimmedAvatar.startsWith("http://") || trimmedAvatar.startsWith("https://")) {
        console.log("使用完整URL:", trimmedAvatar);
        this.avatarUrl = trimmedAvatar;
        return;
      }

      // 如果是OSS URL（包含oss-cn或aliyuncs），即使没有http前缀也处理
      if (trimmedAvatar.includes("oss-cn") || trimmedAvatar.includes("aliyuncs.com")) {
        // 如果没有协议前缀，添加https://
        let ossUrl = trimmedAvatar;
        if (!trimmedAvatar.startsWith("http://") && !trimmedAvatar.startsWith("https://")) {
          ossUrl = trimmedAvatar.startsWith("//") ? "https:" + trimmedAvatar : "https://" + trimmedAvatar;
        }
        console.log("使用OSS URL:", ossUrl);
        this.avatarUrl = ossUrl;
        return;
      }

      // 如果是相对路径，拼接BASE_URL
      const BASE_URL = "http://121.4.51.19:8080";
      // const BASE_URL = "http://localhost:8080";
      
      // 确保路径以/开头
      const path = trimmedAvatar.startsWith("/") ? trimmedAvatar : "/" + trimmedAvatar;
      const fullUrl = BASE_URL + path;
      console.log("拼接后的头像URL:", fullUrl);
      this.avatarUrl = fullUrl;
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

    // 头像加载失败处理
    handleAvatarError(e) {
      console.error("头像加载失败:", e);
      console.error("失败的头像URL:", this.avatarUrl);
      console.error("用户信息:", this.userInfo);
      console.error("原始头像字段值:", this.userInfo?.avatar);
      
      // 如果是OSS URL加载失败，可能是域名白名单问题
      if (this.avatarUrl && this.avatarUrl.includes("aliyuncs.com")) {
        console.error("OSS头像加载失败，可能原因：");
        console.error("1. 小程序域名白名单未配置");
        console.error("2. OSS跨域设置问题");
        console.error("3. 图片URL无效");
      }
      
      // 如果当前不是默认头像，尝试使用默认头像
      if (!this.avatarUrl.includes("default-avatar")) {
        console.log("切换到默认头像");
        this.avatarError = true;
        this.avatarUrl = "/static/default-avatar.png";
      }
    },

    // 头像加载成功处理
    handleAvatarLoad() {
      console.log("头像加载成功:", this.avatarUrl);
      this.avatarError = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.mine {
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
  padding-bottom: 40rpx;
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
}

/* 订单统计 - 统一卡片样式 */
.order-box {
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

.more {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  padding: 4rpx 8rpx;
}

.order-stats {
  display: flex;
  justify-content: space-around;
  padding: $uni-padding-sm 0;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: $uni-padding-xs;
}

.icon-box {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.icon-box:active {
  transform: scale(0.95);
}

.icon-box.active {
  background: linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 140, 66, 0.1) 100%);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 0, 0.2);
}

.icon {
  font-size: 44rpx;
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%);
  color: $uni-text-color-inverse;
  font-size: 20rpx;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-weight: $uni-font-weight-bold;
  box-shadow: 0 2rpx 8rpx rgba(255, 68, 68, 0.3);
  border: 2rpx solid $uni-bg-color;
}

.txt {
  font-size: 24rpx;
  color: $uni-text-color-secondary;
  font-weight: $uni-font-weight-medium;
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

.item-icon.cart {
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
</style>
