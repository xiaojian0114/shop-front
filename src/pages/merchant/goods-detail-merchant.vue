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
    <view class="modal" v-if="showEditModal" @tap="showEditModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">编辑商品</text>

        <view class="form-item">
          <text class="label">商品名称</text>
          <input
            :value="editForm.name"
            @input="onInput('name', $event)"
            placeholder="请输入商品名称"
            class="form-input"
          />
        </view>

        <view class="form-item">
          <text class="label">商品价格</text>
          <input
            :value="editForm.price"
            @input="onInput('price', $event)"
            placeholder="请输入商品价格"
            type="number"
            class="form-input"
          />
        </view>

        <view class="form-item">
          <text class="label">商品库存</text>
          <input
            :value="editForm.stock"
            @input="onInput('stock', $event)"
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
        const res = await uni.request({
          url: `http://localhost:8080/merchant/product/${this.productId}`,
          header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        });

        if (res.data.code === 200) {
          this.product = res.data.data;
          // 初始化编辑表单
          this.editForm = {
            id: this.product.id || "",
            name: this.product.name || "",
            price: this.product.price || "",
            stock: this.product.stock || "",
            description: this.product.description || "",
            image: this.product.image || "",
          };
        } else {
          uni.showToast({ title: res.data.msg || "加载失败", icon: "none" });
        }
      } catch (error) {
        console.error("加载商品详情失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    // 处理输入事件
    onInput(field, e) {
      this.editForm[field] = e.detail.value;
    },

    toggleSaleStatus() {
      const action = this.product.isOnSale === 1 ? "off" : "on";
      const actionText = this.product.isOnSale === 1 ? "下架" : "上架";

      uni.showModal({
        title: `确认${actionText}`,
        content: `确定要${actionText}这个商品吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `http://localhost:8080/merchant/product/${action}/${this.productId}`,
              method: "PUT",
              header: {
                Authorization: "Bearer " + uni.getStorageSync("token"),
              },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({
                    title: `${actionText}成功`,
                    icon: "success",
                  });
                  this.loadProductDetail(); // 重新加载数据
                } else {
                  uni.showToast({
                    title: res.data.msg || `${actionText}失败`,
                    icon: "none",
                  });
                }
              },
              fail: () => {
                uni.showToast({ title: `${actionText}失败`, icon: "none" });
              },
            });
          }
        },
      });
    },

    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showLoading({ title: "上传中..." });

          uni.uploadFile({
            url: "http://localhost:8080/merchant/upload",
            filePath: res.tempFilePaths[0],
            name: "file",
            header: { Authorization: "Bearer " + uni.getStorageSync("token") },
            success: (r) => {
              uni.hideLoading();
              try {
                const data =
                  typeof r.data === "string" ? JSON.parse(r.data) : r.data;
                if (data.code === 200) {
                  this.editForm.image = data.data;
                  uni.showToast({ title: "上传成功", icon: "success" });
                } else {
                  uni.showToast({
                    title: data.msg || "上传失败",
                    icon: "none",
                  });
                }
              } catch (e) {
                uni.showToast({ title: "上传失败", icon: "none" });
              }
            },
            fail: () => {
              uni.hideLoading();
              uni.showToast({ title: "上传失败", icon: "none" });
            },
          });
        },
      });
    },

    submitEdit() {
      if (!this.editForm.name.trim()) {
        return uni.showToast({ title: "请输入商品名称", icon: "none" });
      }
      if (!this.editForm.price || parseFloat(this.editForm.price) <= 0) {
        return uni.showToast({ title: "请输入有效的价格", icon: "none" });
      }
      if (!this.editForm.stock || parseInt(this.editForm.stock) < 0) {
        return uni.showToast({ title: "请输入有效的库存", icon: "none" });
      }

      uni.request({
        url: "http://localhost:8080/merchant/product/update",
        method: "PUT",
        header: {
          Authorization: "Bearer " + uni.getStorageSync("token"),
          "Content-Type": "application/json",
        },
        data: this.editForm,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: "修改成功", icon: "success" });
            this.showEditModal = false;
            this.loadProductDetail(); // 重新加载数据
          } else {
            uni.showToast({ title: res.data.msg || "修改失败", icon: "none" });
          }
        },
        fail: () => {
          uni.showToast({ title: "修改失败", icon: "none" });
        },
      });
    },
  },
};
</script>

<style scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
}

.goods-detail {
  padding: 30rpx;
}

.goods-image-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.goods-image {
  width: 400rpx;
  height: 400rpx;
  border-radius: 20rpx;
}

.goods-info {
  margin-bottom: 30rpx;
}

.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.goods-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.goods-price {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff6b35;
  display: block;
  margin-bottom: 30rpx;
}

.goods-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.meta-item {
  font-size: 28rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.edit-btn {
  background: #4a90e2;
  color: #fff;
}

.off-btn {
  background: #ff4444;
  color: #fff;
}

.on-btn {
  background: #07c160;
  color: #fff;
}

/* 编辑弹窗样式 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 18rpx;
  display: block;
  font-weight: 500;
}

.form-input {
  width: 100%;
  border: 2rpx solid #e5e5e5;
  background: #fafafa;
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
}

.image-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: #f2f2f2;
  overflow: hidden;
  position: relative;
  border: 2rpx dashed #e5e5e5;
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
  color: #fff;
  text-align: center;
  font-size: 24rpx;
  padding: 10rpx 0;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.cancel-btn {
  background: #f1f1f1;
  color: #666;
}

.confirm-btn {
  background: #ff6b35;
  color: #fff;
}
</style>
