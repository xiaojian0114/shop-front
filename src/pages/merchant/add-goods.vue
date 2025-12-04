<template>
  <view class="add-goods-page">
    <view class="form-item">
      <text class="label">商品名称</text>
      <input v-model="form.name" class="input" placeholder="请输入商品名称" />
    </view>

    <view class="form-item">
      <text class="label">价格</text>
      <input
        v-model="form.price"
        class="input"
        type="number"
        placeholder="请输入价格"
      />
    </view>

    <view class="form-item">
      <text class="label">商品图片</text>

      <view class="upload-box" @tap="chooseImage">
        <image :src="form.image || '/static/default.jpg'" class="preview" />
      </view>
    </view>

    <button class="submit-btn" @click="submit">提交</button>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

export default {
  data() {
    return {
      form: {
        name: "",
        price: "",
        image: "",
      },
    };
  },

  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          this.uploadImage(filePath);
        },
      });
    },

    async uploadImage(filePath) {
      try {
        const url = await merchantApi.uploadImage(filePath);
        this.form.image = url;
        uni.showToast({ title: "上传成功", icon: "success" });
      } catch (err) {
        console.error("上传失败:", err);
      }
    },

    async submit() {
      if (!this.form.name || !this.form.price || !this.form.image) {
        return uni.showToast({ title: "请填写完整", icon: "none" });
      }

      try {
        await merchantApi.product.add(this.form);
        uni.showToast({ title: "上架成功", icon: "success" });
        setTimeout(() => uni.navigateBack(), 1000);
      } catch (err) {
        console.error("上架失败:", err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.add-goods-page {
  padding: $uni-padding-sm;
  background: $uni-bg-color-page;
  min-height: 100vh;
}

.form-item {
  margin-bottom: $uni-margin-base;
  background: $uni-bg-color;
  padding: $uni-padding-base;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-sm;
}

.label {
  font-weight: $uni-font-weight-semibold;
  margin-bottom: $uni-spacing-xs;
  display: block;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
}

.input {
  border: 2rpx solid $uni-border-color-light;
  padding: $uni-padding-sm;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  transition: all $uni-transition-duration-base;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  border-color: $uni-color-primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}

.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed $uni-border-color;
  border-radius: $uni-border-radius-base;
  display: flex;
  justify-content: center;
  align-items: center;
  background: $uni-bg-color-grey;
  transition: all $uni-transition-duration-base;
}

.upload-box:active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.05);
}

.preview {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
}

.submit-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  padding: $uni-padding-base;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  margin-top: $uni-margin-lg;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
</style>
