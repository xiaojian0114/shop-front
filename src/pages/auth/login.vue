<template>
  <view class="login-page">
    <!-- 顶部装饰元素 -->
    <view class="decoration-top">
      <view class="circle circle1"></view>
      <view class="circle circle2"></view>
    </view>

    <view class="logo-section">
      <view class="logo-icon">校园商城</view>
      <view class="logo">校园商城</view>
      <view class="slogan">青春校园，购物无忧</view>
    </view>

    <view class="card">
      <view class="tabs">
        <text :class="{ active: isLogin }" @tap="isLogin = true">登录</text>
        <text :class="{ active: !isLogin }" @tap="isLogin = false">注册</text>
      </view>

      <view class="input-group">
        <view class="input-item">
          <view class="input-icon">手机</view>
          <input v-model="phone" placeholder="请输入手机号" type="text" />
        </view>
        <view class="input-item">
          <view class="input-icon">密码</view>
          <input
            v-model="password"
            :password="!isLogin ? false : true"
            placeholder="请输入密码（6-20位）"
            type="text"
          />
        </view>
      </view>

      <!-- 注册时选择角色 -->
      <view class="role" v-if="!isLogin">
        <text :class="{ active: role === 'user' }" @tap="role = 'user'">
          <view class="role-icon">学生</view>
          我是学生
        </text>
        <text :class="{ active: role === 'merchant' }" @tap="role = 'merchant'">
          <view class="role-icon">商家</view>
          我是商家
        </text>
      </view>

      <button @tap="submit" class="btn" :disabled="loading">
        {{ loading ? "处理中..." : isLogin ? "立即登录" : "注册并登录" }}
      </button>

      <view class="forgot-password" v-if="isLogin">
        <text>忘记密码？</text>
      </view>
    </view>
  </view>
</template>

<script>
import authApi from "@/api/auth.js";

// H5 + 小程序双端完美跳转
const goto = (path) => {
  // H5
  if (typeof window !== "undefined") {
    // 开发环境 hash 模式刷新
    if (process.env.NODE_ENV === "development") {
      history.replaceState(null, "", "#" + path);
      location.reload();
    } else {
      uni.reLaunch({ url: path });
    }
  } else {
    // 小程序端
    uni.reLaunch({ url: path });
  }
};

export default {
  data() {
    return {
      isLogin: true, // true=登录页，false=注册页
      phone: "13800138000",
      password: "123456",
      role: "user", // user 或 merchant
      loading: false,
    };
  },

  methods: {
    async submit() {
      if (this.loading) return;

      // 1. 校验手机号
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        return uni.showToast({ title: "请输入正确的手机号", icon: "none" });
      }
      if (this.password.length < 6) {
        return uni.showToast({ title: "密码至少6位", icon: "none" });
      }

      this.loading = true;

      try {
        const requestData = this.isLogin
          ? { phone: this.phone, password: this.password }
          : { phone: this.phone, password: this.password, role: this.role };

        // 使用封装的API
        const userInfo = this.isLogin
          ? await authApi.login(requestData)
          : await authApi.register(requestData);

        // 处理登录/注册成功
        this.handleAuthSuccess(userInfo);
      } catch (error) {
        console.log("登录/注册失败", error);
        // 错误信息已经在request中统一处理，这里不需要重复显示
      } finally {
        this.loading = false;
      }
    },

    // 处理认证成功
    handleAuthSuccess(userInfo) {
      if (!userInfo) return;

      const userInfoToSave = {
        userId: userInfo.userId || userInfo.id,
        nickname:
          userInfo.nickname || "校园用户" + (userInfo.phone || "").slice(-4),
        phone: userInfo.phone,
        role: userInfo.role,
        token: userInfo.token,
        avatar: this.formatAvatar(userInfo.avatar),
      };

      // 保存用户信息
      uni.setStorageSync("token", userInfo.token);
      uni.setStorageSync("userInfo", userInfoToSave);

      uni.showToast({
        title: this.isLogin ? "登录成功" : "注册成功",
        icon: "success",
      });

      // 跳转到对应页面
      setTimeout(() => {
        const home =
          userInfo.role === "merchant"
            ? "/pages/merchant/index"
            : "/pages/user/index";
        goto(home);
      }, 1000);
    },

    // 格式化头像URL
    formatAvatar(avatar) {
      if (!avatar) {
        return "https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG6xMBPrs7QfceDcoZGWweJ1shPv6V1ZM3Iow3kTRBxEIQY1g/0?wx_fmt=png";
      }

      if (avatar.startsWith("http")) {
        return avatar;
      }

      // 如果是相对路径，添加基础URL
      return "http://localhost:8080" + avatar;
    },
  },

  onShow() {
    const token = uni.getStorageSync("token");
    const userInfo = uni.getStorageSync("userInfo");
    if (token && userInfo && userInfo.phone) {
      const home =
        userInfo.role === "merchant"
          ? "/pages/merchant/index"
          : "/pages/user/index";
      goto(home);
    }
  },
};
</script>

<style lang="scss" scoped>
 .login-page {
  padding: $uni-padding-xl $uni-padding-lg;
  text-align: center;
  background: linear-gradient(145deg, #fff7f0 0%, #ffe4d1 40%, #f5f7fa 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 顶部装饰 */
.decoration-top {
  position: absolute;
  top: 0;
  right: 0;
  width: 300rpx;
  height: 300rpx;
}
.circle {
  position: absolute;
  border-radius: $uni-border-radius-circle;
  background: rgba(255, 107, 0, 0.06);
}
.circle1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -80rpx;
}
.circle2 {
  width: 120rpx;
  height: 120rpx;
  top: 40rpx;
  right: 40rpx;
  background: rgba(255, 107, 0, 0.14);
}

/* Logo */
.logo-section {
  margin: 120rpx 0 80rpx;
}
.logo-icon {
  font-size: 80rpx;
  margin-bottom: $uni-margin-sm;
}
.logo {
  font-size: 60rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-color-primary;
  margin-bottom: $uni-margin-sm;
  letter-spacing: 4rpx;
}
.slogan {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

/* 卡片 */
.card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-xl;
  padding: $uni-padding-xl $uni-padding-lg;
  box-shadow: $uni-shadow-lg;
  position: relative;
  z-index: $uni-z-index-base;
}

/* 标签页 */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: $uni-margin-xl;
  border-bottom: 2rpx solid $uni-border-color-light;
}
.tabs text {
  margin: 0 $uni-margin-lg;
  font-size: $uni-font-size-xl;
  padding: $uni-padding-sm 0;
  color: $uni-text-color-secondary;
  position: relative;
}
.tabs .active {
  color: $uni-color-primary;
  font-weight: $uni-font-weight-semibold;
}
.tabs .active::after {
  content: "";
  position: absolute;
  bottom: -2rpx;
  left: 0;
  width: 100%;
  height: 6rpx;
  background: $uni-color-primary;
  border-radius: $uni-border-radius-xs;
}

/* 输入框 */
.input-group {
  margin-bottom: $uni-margin-lg;
}
.input-item {
  display: flex;
  align-items: center;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
  padding: 0 $uni-padding-base;
  margin: $uni-margin-base 0;
  border: 2rpx solid $uni-border-color-light;
  transition: all $uni-transition-duration-base;
}
.input-item:focus-within {
  border-color: $uni-color-primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}
.input-icon {
  font-size: $uni-font-size-xl;
  margin-right: $uni-margin-sm;
  color: $uni-text-color-secondary;
}
.input-item input {
  flex: 1;
  padding: 26rpx 0;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
}

/* 角色选择 */
.role {
  display: flex;
  justify-content: space-around;
  margin: $uni-margin-lg 0;
}
.role text {
  flex: 1;
  max-width: 200rpx;
  padding: $uni-padding-base $uni-padding-sm;
  border: 2rpx solid $uni-border-color;
  border-radius: $uni-border-radius-lg;
  color: $uni-text-color-primary;
  text-align: center;
  transition: all $uni-transition-duration-base;
}
.role .active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.1);
  color: $uni-color-primary;
  transform: translateY(-5rpx);
  box-shadow: $uni-shadow-base;
}
.role-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

/* 按钮 */
.btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  margin-top: $uni-margin-xl;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}

.btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

.btn:disabled {
  background: $uni-text-color-disabled;
  box-shadow: none;
  opacity: $uni-opacity-disabled;
}

/* 忘记密码 */
.forgot-password {
  margin-top: $uni-margin-lg;
}
.forgot-password text {
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
}

/* 底部装饰 */
.decoration-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 $uni-padding-lg;
}
</style>
