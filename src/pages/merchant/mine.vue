<template>
  <view class="mine">
    <view class="user-info">
      <image src="/static/avatar.png" class="avatar" />
      <text>{{ userInfo.nickname }}（商家）</text>
    </view>
    <view class="menu">
      <view
        class="item"
        @tap="uni.navigateTo({ url: '/pages/common/order-list?type=merchant' })"
      >
        <text>订单管理</text><text class="arrow">></text>
      </view>
      <view class="item" @tap="uni.switchTab({ url: '/pages/merchant/shop' })">
        <text>店铺管理</text><text class="arrow">></text>
      </view>
      <view class="item" @tap="logout">
        <text>退出登录</text><text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { userInfo: {} };
  },
  onShow() {
    this.userInfo = uni.getStorageSync("userInfo") || {};
  },
  methods: {
    logout() {
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
      uni.reLaunch({ url: "/pages/auth/login" });
    },
  },
};
</script>
<style scoped>
.mine {
  background: #fcfcfc;
  min-height: 100vh;
}
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 20rpx;
}
.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  margin-bottom: 16rpx;
}
.menu {
  margin-top: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, 0.06);
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1rpx solid #eef2f7;
}
.item:last-child {
  border-bottom: none;
}
.arrow {
  color: #9ca3af;
}
</style>
