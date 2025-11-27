<template>
  <view class="home">
    <view
      style="
        padding: 200rpx;
        text-align: center;
        font-size: 60rpx;
        color: #ff6b00;
      "
    >
      商家后台首页<br />
      <text style="font-size: 40rpx; color: #666"
        >欢迎 {{ userInfo?.nickname || "商家" }}！</text
      >
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { userInfo: {} };
  },

  onReady() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkLogin();
      }, 200);
    });
  },

  onShow() {
    if (process.env.NODE_ENV !== "development") {
      this.checkLogin();
    } else {
      this.userInfo = uni.getStorageSync("userInfo") || {};
    }
  },

  methods: {
    checkLogin() {
      const token = uni.getStorageSync("token");
      const userInfo = uni.getStorageSync("userInfo");

      if (!token || !userInfo || userInfo.role !== "merchant") {
        if (process.env.NODE_ENV === "development") {
          history.replaceState(null, "", "#/pages/auth/login");
          location.reload();
        } else {
          uni.reLaunch({ url: "/pages/auth/login" });
        }
        return;
      }

      this.userInfo = userInfo;
    },
  },
};
</script>
<style scoped>
.home {
  background: #fcfcfc;
  min-height: 100vh;
}
</style>
