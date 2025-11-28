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

      <button @tap="submit" class="btn">
        {{ isLogin ? "立即登录" : "注册并登录" }}
      </button>

      <view class="forgot-password" v-if="isLogin">
        <text>忘记密码？</text>
      </view>
    </view>

    <!-- 底部装饰 -->
    <!-- <view class="decoration-bottom">
      <view class="book"></view>
      <view class="pencil"></view>
    </view> -->
  </view>
</template>

<script>
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
    };
  },

  methods: {
    async submit() {
      // 1. 校验手机号
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        return uni.showToast({ title: "请输入正确的手机号", icon: "none" });
      }
      if (this.password.length < 6) {
        return uni.showToast({ title: "密码至少6位", icon: "none" });
      }

      // 2. 构造请求参数
      const url = this.isLogin ? "/auth/login" : "/auth/register";
      const data = this.isLogin
        ? { phone: this.phone, password: this.password }
        : { phone: this.phone, password: this.password, role: this.role };

      // 3. 发送请求
      uni.request({
        url: "http://localhost:8080" + url,
        method: "POST",
        data,
        header: { "Content-Type": "application/json" },
        success: (res) => {
          if (res.data.code === 200) {
            const info = res.data.data;

            const userInfoToSave = {
              userId: info.userId || info.id,
              nickname: info.nickname || "校园用户" + info.phone.slice(-4),
              phone: info.phone,
              role: info.role,
              token: info.token,

              avatar: info.avatar
                ? info.avatar.startsWith("http")
                  ? info.avatar
                  : "http://localhost:8080" + info.avatar
                : "https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG6xMBPrs7QfceDcoZGWweJ1shPv6V1ZM3Iow3kTRBxEIQY1g/0?wx_fmt=png",
            };

            uni.setStorageSync("token", info.token);
            uni.setStorageSync("userInfo", userInfoToSave);

            uni.showToast({
              title: this.isLogin ? "登录成功" : "注册成功",
              icon: "success",
            });

            setTimeout(() => {
              const home =
                info.role === "merchant"
                  ? "/pages/merchant/index"
                  : "/pages/user/index";
              goto(home);
            }, 1000);
          } else {
            uni.showToast({
              title: res.data.msg || "操作失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.log("登录/注册失败", err);
          uni.showToast({
            title: "网络错误，请检查后端是否启动",
            icon: "none",
          });
        },
      });
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

<style scoped>
.login-page {
  padding: 60rpx 40rpx;
  text-align: center;
  background: linear-gradient(135deg, #f5f9ff 0%, #e8f4ff 100%);
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
  border-radius: 50%;
  background: rgba(74, 144, 226, 0.1);
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
  background: rgba(255, 107, 0, 0.1);
}

/* Logo */
.logo-section {
  margin: 120rpx 0 80rpx;
}
.logo-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}
.logo {
  font-size: 60rpx;
  font-weight: 700;
  color: #4a90e2;
  margin-bottom: 20rpx;
  letter-spacing: 4rpx;
}
.slogan {
  font-size: 28rpx;
  color: #7d7d7d;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx;
  box-shadow: 0 10rpx 40rpx rgba(74, 144, 226, 0.1);
  position: relative;
  z-index: 1;
}

/* 标签页 */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
  border-bottom: 2rpx solid #f0f0f0;
}
.tabs text {
  margin: 0 40rpx;
  font-size: 36rpx;
  padding: 20rpx 0;
  color: #6b7280;
  position: relative;
}
.tabs .active {
  color: #4a90e2;
  font-weight: 600;
}
.tabs .active::after {
  content: "";
  position: absolute;
  bottom: -2rpx;
  left: 0;
  width: 100%;
  height: 6rpx;
  background: #4a90e2;
  border-radius: 4rpx;
}

/* 输入框 */
.input-group {
  margin-bottom: 40rpx;
}
.input-item {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin: 30rpx 0;
  border: 2rpx solid #eef2f7;
}
.input-item:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 4rpx rgba(74, 144, 226, 0.1);
}
.input-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}
.input-item input {
  flex: 1;
  padding: 26rpx 0;
  font-size: 32rpx;
}

/* 角色选择 */
.role {
  display: flex;
  justify-content: space-around;
  margin: 40rpx 0;
}
.role text {
  flex: 1;
  max-width: 200rpx;
  padding: 30rpx 20rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 20rpx;
  color: #374151;
  text-align: center;
}
.role .active {
  border-color: #4a90e2;
  background: #f0f7ff;
  color: #4a90e2;
  transform: translateY(-5rpx);
  box-shadow: 0 10rpx 20rpx rgba(74, 144, 226, 0.15);
}
.role-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

/* 按钮 */
.btn {
  background: linear-gradient(135deg, #4a90e2 0%, #63b3ed 100%);
  color: #fff;
  margin-top: 60rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 50rpx;
  font-size: 36rpx;
  font-weight: 600;
  box-shadow: 0 12rpx 30rpx rgba(74, 144, 226, 0.4);
}

/* 忘记密码 */
.forgot-password {
  margin-top: 40rpx;
}
.forgot-password text {
  color: #7d7d7d;
  font-size: 28rpx;
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
  padding: 0 40rpx;
}
</style>
//1
