<template>
  <view class="add-goods-page">
    <!-- 头部标题 -->
    <view class="page-header">
      <text class="title">新增商品</text>
      <text class="subtitle">填写基本信息并上传商品主图</text>
    </view>

    <view class="card">
      <view class="form-item">
        <text class="label">商品名称</text>
        <input
          v-model="form.name"
          class="input"
          placeholder="请输入商品名称"
          maxlength="50"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">价格</text>
        <input
          v-model="form.price"
          class="input"
          type="digit"
          placeholder="请输入价格，如 9.90"
          :disabled="loading"
        />
      </view>

      <view class="form-item">
        <text class="label">商品图片</text>
        <view
          class="upload-box"
          :class="{ uploading }"
          @tap="chooseImage"
        >
          <image
            :src="form.image || '/static/default-product.jpg'"
            class="preview"
            mode="aspectFill"
          />
          <view class="upload-mask" v-if="uploading">
            <text class="mask-text">上传中...</text>
          </view>
          <view class="upload-placeholder" v-else-if="!form.image">
            <text class="placeholder-text">点击上传主图</text>
          </view>
        </view>
        <text class="tip">建议尺寸 800×800，支持 JPG/PNG</text>
      </view>
    </view>

    <button
      class="submit-btn"
      :disabled="loading || !isValid"
      @click="submit"
    >
      {{ loading ? "提交中..." : "提交" }}
    </button>
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
      loading: false,
      uploading: false,
    };
  },

  computed: {
    isValid() {
      const name = this.form.name.trim();
      const price = parseFloat(this.form.price);
      return (
        name.length >= 1 &&
        !Number.isNaN(price) &&
        price > 0 &&
        !!this.form.image
      );
    },
  },

  methods: {
    chooseImage() {
      if (this.uploading || this.loading) return;
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          this.uploadImage(filePath);
        },
      });
    },

    async uploadImage(filePath) {
      this.uploading = true;
      try {
        const url = await merchantApi.uploadImage(filePath);
        this.form.image = url;
        uni.showToast({ title: "上传成功", icon: "success" });
      } catch (err) {
        console.error("上传失败:", err);
        uni.showToast({ title: err?.msg || "上传失败", icon: "none" });
      } finally {
        this.uploading = false;
      }
    },

    async submit() {
      if (!this.isValid) {
        return uni.showToast({ title: "请完善表单后提交", icon: "none" });
      }

      const name = this.form.name.trim();
      const price = parseFloat(this.form.price);

      this.loading = true;
      try {
        await merchantApi.product.add({
          ...this.form,
          name,
          price,
        });
        uni.showToast({ title: "上架成功", icon: "success" });
        setTimeout(() => uni.navigateBack(), 1000);
      } catch (err) {
        console.error("上架失败:", err);
        uni.showToast({ title: err?.msg || "上架失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.add-goods-page {
  padding: $uni-padding-lg;
  background: $uni-bg-color-page;
  min-height: 100vh;
}

.page-header {
  margin-bottom: $uni-margin-base;
}

.title {
  font-size: 36rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

.subtitle {
  display: block;
  margin-top: $uni-spacing-xs;
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

.card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-lg;
  box-shadow: $uni-shadow-sm;
}

.form-item {
  margin-bottom: $uni-margin-lg;
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
  position: relative;
  overflow: hidden;
}

.upload-box:active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.05);
}

.upload-box.uploading {
  opacity: 0.7;
}

.preview {
  width: 100%;
  height: 100%;
  border-radius: $uni-border-radius-base;
  object-fit: cover;
}

.upload-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
}

.upload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-text {
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-base;
}

.tip {
  margin-top: $uni-spacing-xs;
  display: block;
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-sm;
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

.submit-btn:disabled {
  opacity: 0.6;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
</style>
