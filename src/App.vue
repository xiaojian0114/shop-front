<script>
export default {
  onLaunch() {
    console.log("启动");
  },
  onShow() {
    setTimeout(() => {
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo && userInfo.role === "merchant") {
        uni.hideTabBar();
      } else {
        uni.showTabBar();
      }
    }, 300);
  },
};
</script>
