<!-- pages/merchant/apply-shop.vue -->
<template>
  <view class="apply-page">
    <view class="header">
      <text class="title">申请开店</text>
      <text class="tip">填写店铺信息，提交审核</text>
    </view>

    <view class="form">
      <view class="form-item">
        <text class="label">店铺名称</text>
        <input v-model="form.name" placeholder="请输入店铺名称" />
      </view>

      <view class="form-item">
        <text class="label">店铺头像</text>
        <view class="logo-box" @tap="chooseLogo">
          <image
            :src="form.logo || '/static/default-shop.jpg'"
            class="preview"
          />
          <text class="tip">点击上传头像</text>
        </view>
      </view>
    </view>

    <button class="submit-btn" @tap="submit">提交申请</button>
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
    };
  },
  methods: {
    async chooseLogo() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            const url = await merchantApi.uploadImage(res.tempFilePaths[0]);
            this.form.logo = url;
            uni.showToast({ title: "上传成功", icon: "success" });
          } catch (err) {
            console.error("上传失败:", err);
          }
        },
      });
    },
    async submit() {
      if (!this.form.name.trim()) {
        return uni.showToast({ title: "请输入店铺名称", icon: "none" });
      }
      if (!this.form.logo) {
        return uni.showToast({ title: "请上传店铺头像", icon: "none" });
      }

      try {
        await merchantApi.applyShop({
          name: this.form.name,
          logo: this.form.logo,
        });
        uni.showToast({ title: "申请提交成功！", icon: "success" });
        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } catch (err) {
        console.error("提交失败:", err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.apply-page {
  padding: $uni-padding-lg;
  background: $uni-bg-color-page;
  min-height: 100vh;
}
.header {
  text-align: center;
  padding: $uni-padding-xl 0;
}
.title {
  font-size: $uni-font-size-h1;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}
.tip {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
  margin-top: $uni-margin-sm;
  display: block;
}

.form-item {
  background: $uni-bg-color;
  padding: $uni-padding-lg;
  border-radius: $uni-border-radius-lg;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}
.label {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  display: block;
  margin-bottom: $uni-margin-sm;
  font-weight: $uni-font-weight-medium;
}
input {
  border: 2rpx solid $uni-border-color-light;
  padding: $uni-padding-base;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  transition: all $uni-transition-duration-base;
  width: 100%;
  box-sizing: border-box;
}
input:focus {
  border-color: $uni-color-primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}

.logo-box {
  width: 200rpx;
  height: 200rpx;
  border: 4rpx dashed $uni-border-color;
  border-radius: $uni-border-radius-lg;
  position: relative;
  background: $uni-bg-color-grey;
  transition: all $uni-transition-duration-base;
}
.logo-box:active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.05);
}
.preview {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
}
.tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: $uni-text-color-inverse;
  text-align: center;
  padding: $uni-padding-xs;
  font-size: $uni-font-size-sm;
}

.submit-btn {
  margin: 100rpx $uni-padding-lg;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: $uni-border-radius-lg;
  font-size: 34rpx;
  font-weight: $uni-font-weight-bold;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}
.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
</style>
