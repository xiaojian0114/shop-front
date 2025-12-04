<template>
  <view class="container">
    <view class="goods-detail">
      <!-- 商品图片 -->
      <view class="goods-image-section">
        <image
          :src="product.image || '/static/default-product.jpg'"
          class="goods-image"
          mode="aspectFit"
        />
      </view>

      <!-- 商品信息 -->
      <view class="goods-info">
        <view class="info-card">
          <text class="goods-name">{{ product.name }}</text>
          <text class="goods-price">¥{{ product.price }}</text>
          <view class="goods-meta">
            <text class="meta-item">库存: {{ product.stock || 0 }}</text>
            <text class="meta-item"
              >状态: {{ product.isOnSale === 1 ? "销售中" : "已下架" }}</text
            >
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn edit-btn" @tap="showEditModal = true">
          编辑商品
        </button>
        <button
          class="action-btn"
          :class="product.isOnSale === 1 ? 'off-btn' : 'on-btn'"
          @tap="toggleSaleStatus"
        >
          {{ product.isOnSale === 1 ? "下架商品" : "上架商品" }}
        </button>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal" v-if="showEditModal">
      <view class="modal-mask" @tap="showEditModal = false"></view>
      <view class="modal-content">
        <text class="modal-title">编辑商品</text>

        <view class="form-item">
          <text class="label">商品名称</text>
          <input
            v-model="editForm.name"
            placeholder="请输入商品名称"
            class="form-input"
          />
        </view>

        <view class="form-item">
          <text class="label">商品价格</text>
          <input
            v-model="editForm.price"
            placeholder="请输入商品价格"
            type="number"
            class="form-input"
          />
        </view>

        <view class="form-item">
          <text class="label">商品库存</text>
          <input
            v-model="editForm.stock"
            placeholder="请输入商品库存"
            type="number"
            class="form-input"
          />
        </view>

        <view class="form-item">
          <text class="label">商品图片</text>
          <view class="image-preview" @tap="chooseImage">
            <image
              :src="editForm.image || '/static/default-product.jpg'"
              class="preview-image"
            />
            <text class="change-tip">点击更换图片</text>
          </view>
        </view>

        <view class="modal-actions">
          <button @tap="showEditModal = false" class="cancel-btn">取消</button>
          <button class="confirm-btn" @tap="submitEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

export default {
  data() {
    return {
      product: {},
      showEditModal: false,
      editForm: {
        id: "",
        name: "",
        price: "",
        stock: "",
        description: "",
        image: "",
      },
      productId: null,
    };
  },
  onLoad(options) {
    this.productId = options.id;
    this.loadProductDetail();
  },
  methods: {
    async loadProductDetail() {
      try {
        this.product = await merchantApi.product.getDetail(this.productId);
        // 初始化编辑表单
        this.editForm = {
          id: this.product.id || "",
          name: this.product.name || "",
          price: this.product.price || "",
          stock: this.product.stock || "",
          description: this.product.description || "",
          image: this.product.image || "",
        };
      } catch (error) {
        console.error("加载商品详情失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    async toggleSaleStatus() {
      const action = this.product.isOnSale === 1 ? "off" : "on";
      const actionText = this.product.isOnSale === 1 ? "下架" : "上架";

      uni.showModal({
        title: `确认${actionText}`,
        content: `确定要${actionText}这个商品吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              if (action === "off") {
                await merchantApi.product.offSale(this.productId);
              } else {
                await merchantApi.product.onSale(this.productId);
              }
              uni.showToast({
                title: `${actionText}成功`,
                icon: "success",
              });
              this.loadProductDetail(); // 重新加载数据
            } catch (err) {
              console.error(`${actionText}失败:`, err);
            }
          }
        },
      });
    },

    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            const url = await merchantApi.uploadImage(res.tempFilePaths[0]);
            this.editForm.image = url;
            uni.showToast({ title: "上传成功", icon: "success" });
          } catch (err) {
            console.error("上传失败:", err);
          }
        },
      });
    },

    async submitEdit() {
      if (!this.editForm.name.trim()) {
        return uni.showToast({ title: "请输入商品名称", icon: "none" });
      }
      if (!this.editForm.price || parseFloat(this.editForm.price) <= 0) {
        return uni.showToast({ title: "请输入有效的价格", icon: "none" });
      }
      if (!this.editForm.stock || parseInt(this.editForm.stock) < 0) {
        return uni.showToast({ title: "请输入有效的库存", icon: "none" });
      }

      try {
        await merchantApi.product.update(this.editForm);
        uni.showToast({ title: "修改成功", icon: "success" });
        this.showEditModal = false;
        this.loadProductDetail(); // 重新加载数据
      } catch (err) {
        console.error("修改失败:", err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  background: $uni-bg-color-page;
  min-height: 100vh;
}

.goods-detail {
  padding: $uni-padding-base;
}

.goods-image-section {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-lg;
  text-align: center;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.goods-image {
  width: 400rpx;
  height: 400rpx;
  border-radius: $uni-border-radius-lg;
}

.goods-info {
  margin-bottom: $uni-margin-base;
}

.info-card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-lg;
  box-shadow: $uni-shadow-sm;
}

.goods-name {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  display: block;
  margin-bottom: $uni-margin-sm;
}

.goods-price {
  font-size: $uni-font-size-h1;
  font-weight: $uni-font-weight-bold;
  color: $uni-color-primary;
  display: block;
  margin-bottom: $uni-margin-base;
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: $uni-margin-base;
}

.meta-item {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.action-buttons {
  display: flex;
  gap: $uni-margin-sm;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-medium;
  transition: all $uni-transition-duration-base;
}

.edit-btn {
  background: $uni-color-info;
  color: $uni-text-color-inverse;
}

.off-btn {
  background: $uni-color-error;
  color: $uni-text-color-inverse;
}

.on-btn {
  background: $uni-color-success;
  color: $uni-text-color-inverse;
}

.action-btn:active {
  transform: translateY(2rpx);
  opacity: 0.9;
}

/* 编辑弹窗样式 */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: $uni-z-index-modal;
  padding: $uni-padding-lg;
}

.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600rpx;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-xl;
  padding: 50rpx $uni-padding-lg;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: $uni-shadow-lg;
}

.modal-title {
  text-align: center;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-padding-lg;
}

.form-item {
  margin-bottom: $uni-padding-lg;
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  margin-bottom: $uni-margin-xs;
  display: block;
  font-weight: $uni-font-weight-medium;
}

.form-input {
  width: 100%;
  border: 2rpx solid $uni-border-color-light;
  background: $uni-bg-color-grey;
  padding: $uni-padding-sm $uni-padding-base;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  box-sizing: border-box;
  transition: all $uni-transition-duration-base;
}

.form-input:focus {
  border-color: $uni-color-primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}

.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: $uni-border-radius-lg;
  background: $uni-bg-color-grey;
  overflow: hidden;
  position: relative;
  border: 2rpx dashed $uni-border-color;
  transition: all $uni-transition-duration-base;
}

.image-preview:active {
  border-color: $uni-color-primary;
  background: rgba(255, 107, 0, 0.05);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-tip {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: $uni-text-color-inverse;
  text-align: center;
  font-size: $uni-font-size-sm;
  padding: $uni-padding-xs 0;
}

.modal-actions {
  display: flex;
  gap: $uni-margin-sm;
  margin-top: $uni-margin-sm;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-medium;
  transition: all $uni-transition-duration-base;
}

.cancel-btn {
  background: $uni-bg-color-grey;
  color: $uni-text-color-secondary;
}

.confirm-btn {
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  box-shadow: $uni-shadow-button;
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
</style>
