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

<style lang="scss">
/* 引入全局样式变量 */
@import "./uni.scss";
@import "./common/common.scss";

/* 全局重置样式 */
page {
  background-color: $uni-bg-color-page;
  color: $uni-text-color;
  font-size: $uni-font-size-base;
  line-height: $uni-line-height-base;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 全局按钮重置 */
button {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: inherit;
  line-height: inherit;
}

button::after {
  border: none;
}

/* 全局输入框样式 */
input,
textarea {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
}

/* 全局图片样式 */
image {
  display: block;
  max-width: 100%;
  height: auto;
}

/* 全局链接样式 */
a {
  color: $uni-color-primary;
  text-decoration: none;
}

/* 全局滚动条样式（H5） */
::-webkit-scrollbar {
  width: 8rpx;
  height: 8rpx;
}

::-webkit-scrollbar-track {
  background: $uni-bg-color-grey;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb {
  background: $uni-border-color;
  border-radius: 4rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: $uni-text-color-placeholder;
}
</style>
