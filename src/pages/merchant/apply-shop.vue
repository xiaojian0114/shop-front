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
    chooseLogo() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          uni.uploadFile({
            url: "http://localhost:8080/merchant/upload",
            filePath,
            name: "file",
            header: { Authorization: "Bearer " + uni.getStorageSync("token") },
            success: (uploadRes) => {
              let url = uploadRes.data;
              try {
                url = JSON.parse(url).data || url;
              } catch (e) {}
              this.form.logo = url;
              uni.showToast({ title: "上传成功" });
            },
          });
        },
      });
    },
    submit() {
      if (!this.form.name.trim()) {
        return uni.showToast({ title: "请输入店铺名称", icon: "none" });
      }
      if (!this.form.logo) {
        return uni.showToast({ title: "请上传店铺头像", icon: "none" });
      }

      uni.request({
        url: "http://localhost:8080/merchant/shop/apply",
        method: "POST",
        header: {
          Authorization: "Bearer " + uni.getStorageSync("token"),
          "Content-Type": "application/json",
        },
        data: {
          name: this.form.name,
          logo: this.form.logo,
        },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: "申请提交成功！", icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else {
            uni.showToast({ title: res.data.msg || "提交失败", icon: "none" });
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.apply-page {
  padding: 40rpx;
  background: #f8f8f8;
  min-height: 100vh;
}
.header {
  text-align: center;
  padding: 60rpx 0;
}
.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}
.tip {
  font-size: 30rpx;
  color: #999;
  margin-top: 20rpx;
  display: block;
}

.form-item {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}
.label {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}
input {
  border: 2rpx solid #eee;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.logo-box {
  width: 200rpx;
  height: 200rpx;
  border: 4rpx dashed #ddd;
  border-radius: 20rpx;
  position: relative;
}
.preview {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}
.tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  padding: 10rpx;
  font-size: 26rpx;
}

.submit-btn {
  margin: 100rpx 40rpx;
  background: linear-gradient(135deg, #ff8d4d, #ff6b35);
  color: #fff;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 20rpx;
  font-size: 34rpx;
  font-weight: bold;
}
</style>
