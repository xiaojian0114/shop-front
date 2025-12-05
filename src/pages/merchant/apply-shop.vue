<!-- pages/merchant/apply-shop.vue -->
<template>
  <view class="apply-page">
    <!-- 顶部导航栏 -->
    <!-- <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">申请开店</text>
      <view class="nav-placeholder"></view>
    </view> -->

    <!-- 表单区域 -->
    <view class="form-container">
      <view class="form-card">
        <view class="form-item">
          <text class="label">店铺名称</text>
          <text class="label-tip">2-20个字符</text>
          <view class="input-wrapper">
            <input
              v-model="form.name"
              type="text"
              placeholder="请输入店铺名称"
              class="form-input"
              adjust-position
              maxlength="20"
              :disabled="loading"
            />
            <view class="char-count">{{ form.name.length }}/20</view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">店铺头像</text>
          <text class="label-tip">建议尺寸200x200</text>
          <view class="logo-wrapper">
            <view class="logo-upload-area" @tap="chooseLogo" :class="{ 'has-logo': form.logo }">
              <image
                v-if="form.logo"
                :src="getLogoUrl(form.logo)"
                class="logo-preview"
                mode="aspectFill"
              />
              <view v-else class="upload-placeholder">
                <text class="upload-text">点击上传</text>
              </view>
              <view class="upload-mask" v-if="form.logo">
                <text class="mask-text">点击更换</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button 
        class="submit-btn" 
        @tap="submit"
        :disabled="loading"
        :class="{ 'btn-loading': loading }"
      >
        <text v-if="loading">提交中...</text>
        <text v-else>提交申请</text>
      </button>
      <text class="submit-tip">提交后将在1-3个工作日内完成审核</text>
    </view>

    <!-- 加载遮罩 -->
    <view class="loading-mask" v-if="loading">
      <view class="loading-spinner"></view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

export default {
  data() {
    return {
      form: {
        name: "",
        logo: "",
      },
      loading: false,
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },

    async chooseLogo() {
      if (this.loading) return;

      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          this.loading = true;
          try {
            uni.showLoading({ title: "上传中...", mask: true });
            const url = await merchantApi.uploadImage(res.tempFilePaths[0]);
            this.form.logo = url;
            uni.hideLoading();
            uni.showToast({ title: "上传成功", icon: "success", duration: 1500 });
          } catch (err) {
            uni.hideLoading();
            console.error("上传失败:", err);
            uni.showToast({ 
              title: err?.msg || "上传失败，请重试", 
              icon: "none",
              duration: 2000
            });
          } finally {
            this.loading = false;
          }
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
        },
      });
    },

    async submit() {
      // 验证店铺名称
      const name = this.form.name.trim();
      if (!name) {
        return uni.showToast({ 
          title: "请输入店铺名称", 
          icon: "none",
          duration: 2000
        });
      }
      if (name.length < 2) {
        return uni.showToast({ 
          title: "店铺名称至少2个字符", 
          icon: "none",
          duration: 2000
        });
      }
      if (name.length > 20) {
        return uni.showToast({ 
          title: "店铺名称不能超过20个字符", 
          icon: "none",
          duration: 2000
        });
      }

      // 验证头像
      if (!this.form.logo) {
        return uni.showToast({ 
          title: "请上传店铺头像", 
          icon: "none",
          duration: 2000
        });
      }

      // 确认提交
      uni.showModal({
        title: "确认提交",
        content: "提交后将等待审核，确认提交吗？",
        confirmColor: "#ff6b00",
        success: async (res) => {
          if (res.confirm) {
            this.loading = true;
            try {
              await merchantApi.applyShop({
                name: name,
                logo: this.form.logo,
              });
              uni.showToast({ 
                title: "申请提交成功！", 
                icon: "success",
                duration: 2000
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 2000);
            } catch (err) {
              console.error("提交失败:", err);
              uni.showToast({ 
                title: err?.msg || "提交失败，请重试", 
                icon: "none",
                duration: 2000
              });
            } finally {
              this.loading = false;
            }
          }
        },
      });
    },

    // 获取logo URL
    getLogoUrl(logo) {
      if (!logo) return "/static/default-shop.jpg";

      const logoUrl = logo.trim();
      if (!logoUrl || logoUrl === "") return "/static/default-shop.jpg";

      // 完整的 HTTP/HTTPS URL
      if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        return logoUrl;
      }

      // OSS URL
      if (logoUrl.includes("oss-cn") || logoUrl.includes("aliyuncs.com")) {
        if (logoUrl.startsWith("//")) {
          return "https:" + logoUrl;
        }
        return "https://" + logoUrl;
      }

      // 相对路径
      const BASE_URL = "http://121.4.51.19:8080";
      const path = logoUrl.startsWith("/") ? logoUrl : "/" + logoUrl;
      return BASE_URL + path;
    },
  },
};
</script>

<style lang="scss" scoped>
.apply-page {
  background: $uni-bg-color-page;
  min-height: 100vh;
  padding-bottom: $uni-padding-xl;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-padding-base $uni-padding-lg;
  background: $uni-bg-color;
  border-bottom: 1rpx solid $uni-border-color-light;
  position: sticky;
  top: 0;
  z-index: $uni-z-index-fixed;
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 44rpx;
  color: $uni-text-color;
  font-weight: $uni-font-weight-bold;
  line-height: 1;
}

.nav-title {
  font-size: 32rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

.nav-placeholder {
  width: 60rpx;
}

/* 表单容器 */
.form-container {
  padding: $uni-padding-lg;
  margin-top: $uni-margin-lg;
}

.form-card {
  background: $uni-bg-color;
  border-radius: 24rpx;
  padding: $uni-padding-xl;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: $uni-padding-xl;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 30rpx;
  color: $uni-text-color;
  font-weight: $uni-font-weight-semibold;
  display: block;
  margin-bottom: 8rpx;
}

.label-tip {
  font-size: 24rpx;
  color: $uni-text-color-placeholder;
  display: block;
  margin-bottom: $uni-margin-base;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  border: 2rpx solid $uni-border-color-light;
  background: $uni-bg-color-grey;
  padding: $uni-padding-base $uni-padding-lg;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: $uni-text-color;
  transition: all 0.3s ease;
  box-sizing: border-box;
  min-height: 88rpx;
  line-height: 1.5;
}

.form-input:focus {
  border-color: $uni-color-primary;
  background: $uni-bg-color;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  background: $uni-bg-color-grey;
}

.char-count {
  position: absolute;
  right: $uni-padding-lg;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: $uni-text-color-placeholder;
  pointer-events: none;
}

/* 头像上传区域 */
.logo-wrapper {
  display: flex;
  justify-content: center;
  padding: $uni-padding-base 0;
}

.logo-upload-area {
  width: 200rpx;
  height: 200rpx;
  border: 3rpx dashed $uni-border-color;
  border-radius: 20rpx;
  position: relative;
  background: $uni-bg-color-grey;
  transition: all 0.3s ease;
  overflow: hidden;
}

.logo-upload-area:active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.05);
}

.logo-upload-area.has-logo {
  border-style: solid;
  border-color: $uni-border-color-light;
}

.logo-preview {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  font-size: 26rpx;
  color: $uni-text-color-placeholder;
}

.upload-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: $uni-text-color-inverse;
  text-align: center;
  padding: $uni-padding-xs 0;
  font-size: 24rpx;
}

.mask-text {
  font-size: 24rpx;
}

/* 提交区域 */
.submit-section {
  padding: 0 $uni-padding-lg;
  margin-top: $uni-margin-xl;
}

.submit-btn {
  width: 100%;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: $uni-font-weight-bold;
  box-shadow: $uni-shadow-button;
  transition: all 0.3s ease;
  margin-bottom: $uni-margin-base;
}

.submit-btn:active:not(.btn-loading) {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

.submit-btn.btn-loading {
  opacity: 0.7;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.submit-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: $uni-text-color-placeholder;
  line-height: 1.5;
}

/* 加载遮罩 */
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

/* 响应式调整 */
@media (max-width: 750rpx) {
  .form-container {
    padding: $uni-padding-base;
  }

  .form-card {
    padding: $uni-padding-lg;
  }

  .logo-upload-area {
    width: 180rpx;
    height: 180rpx;
  }
}
</style>
