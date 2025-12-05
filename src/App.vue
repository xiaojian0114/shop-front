<script>
export default {
  onLaunch() {
    console.log("启动");
    // 初始化时设置tabBar显示状态
    this.updateTabBar();
  },
  onShow() {
    // 每次显示时更新tabBar状态
    this.updateTabBar();
  },
  methods: {
    updateTabBar() {
      try {
      const userInfo = uni.getStorageSync("userInfo");
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentRoute = currentPage?.route || "";
        
        // 判断当前页面是否是tabBar页面
        const tabBarPages = [
          "pages/user/index",
          "pages/user/cart",
          "pages/user/mine"
        ];
        const isTabBarPage = tabBarPages.some(page => currentRoute.includes(page));
        
        // 如果是商家角色，隐藏tabBar
      if (userInfo && userInfo.role === "merchant") {
          if (isTabBarPage) {
            uni.hideTabBar({ animation: false });
          }
      } else {
          // 普通用户，如果是tabBar页面则显示
          if (isTabBarPage) {
            uni.showTabBar({ animation: false });
      }
        }
      } catch (err) {
        console.error("更新tabBar状态失败:", err);
      }
    }
  }
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
