<template>
  <view class="container">
    <view class="apply-section">
      <button class="apply-btn" @tap="applyShop">+ 申请新店铺</button>
    </view>

    <view class="shop-list" v-if="shops && shops.length > 0">
      <view class="section-title">我的店铺 ({{ shops.length }})</view>
      <view class="shop-cards">
        <view class="shop-card" v-for="item in shops" :key="item.id">
          <view class="card-header">
            <image
              :src="item.logo || '/static/default-shop.jpg'"
              class="logo"
            />
            <view class="shop-info">
              <text class="name">{{ item.name }}</text>
              <text
                class="status"
                :class="item.status === 1 ? 'success' : 'pending'"
              >
                {{ item.status === 1 ? "已通过" : "审核中" }}
              </text>
            </view>
          </view>
          <view class="card-actions">
            <button
              size="mini"
              type="primary"
              v-if="item.status === 1"
              @tap="editShop(item)"
              class="action-btn"
            >
              编辑
            </button>
            <button
              size="mini"
              v-if="item.status === 1"
              @tap="viewShop(item)"
              class="action-btn secondary"
            >
              查看
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 还没有店铺时的友好提示 -->
    <view class="empty" v-if="!shops || shops.length === 0">
      <image src="/static/empty-shop.png" class="empty-img" />
      <text class="empty-text">你还没有店铺，快去申请一个吧~</text>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal" v-if="showEdit">
      <view class="modal-mask" @tap="showEdit = false"></view>
      <view class="modal-content">
        <text class="modal-title">编辑店铺</text>
        <view class="form-item">
          <text class="label">店铺名称</text>
          <input
            v-model="editForm.name"
            placeholder="请输入店铺名称"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="label">店铺头像</text>
          <view class="logo-preview" @tap="chooseLogo">
            <image
              :src="editForm.logo || '/static/default-shop.jpg'"
              class="preview-img"
            />
            <text class="change-tip">点击更换</text>
          </view>
        </view>
        <view class="modal-actions">
          <button @tap="showEdit = false" class="cancel-btn">取消</button>
          <button class="confirm-btn" @tap="submitEdit">保存</button>
        </view>
      </view>
    </view>

    <!-- 商家底栏 -->
    <view class="merchant-tabbar" v-if="isMerchant">
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/index')"
        :class="{ active: currentPath === 'pages/merchant/index' }"
      >
        <image src="/static/tab/merchant-goods.png" class="icon" />
        <text>商品管理</text>
      </view>
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/shop')"
        :class="{ active: currentPath === 'pages/merchant/shop' }"
      >
        <image src="/static/tab/merchant-shop.png" class="icon" />
        <text>店铺信息</text>
      </view>
      <view
        class="tab-item"
        @tap="goTo('/pages/merchant/mine')"
        :class="{ active: currentPath === 'pages/merchant/mine' }"
      >
        <image src="/static/tab/merchant-mine.png" class="icon" />
        <text>商家中心</text>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

export default {
  data() {
    return {
      shops: [],
      currentPath: "",
      isMerchant: false,
      showEdit: false,
      currentEditShop: null,
      editForm: {
        id: "",
        name: "",
        logo: "",
      },
    };
  },
  onLoad() {
    this.init();
  },
  onShow() {
    this.init();
  },
  methods: {
    init() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
      this.loadShops();
    },
    goTo(path) {
      uni.reLaunch({ url: path });
    },
    async loadShops() {
      try {
        const shops = await merchantApi.getMyShops();
        this.shops = shops || [];
      } catch (error) {
        console.error("加载店铺列表失败:", error);
      }
    },
    applyShop() {
      uni.navigateTo({ url: "/pages/merchant/apply-shop" });
    },
    editShop(shop) {
      console.log("编辑店铺:", shop);

      // 修复：确保正确设置编辑表单数据
      this.editForm = {
        id: shop.id,
        name: shop.name || "",
        logo: shop.logo || "",
      };

      this.currentEditShop = shop;
      this.showEdit = true;

      // 添加一个小延迟确保DOM更新
      setTimeout(() => {
        console.log("编辑表单数据:", this.editForm);
      }, 100);
    },
    viewShop(shop) {
      uni.navigateTo({ url: `/pages/merchant/shop-detail?id=${shop.id}` });
    },
    async chooseLogo() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            const url = await merchantApi.uploadImage(res.tempFilePaths[0]);
            this.editForm.logo = url;
            uni.showToast({
              title: "上传成功",
              icon: "success",
            });
          } catch (err) {
            console.error("上传失败:", err);
          }
        },
      });
    },
    async submitEdit() {
      if (!this.editForm.name.trim()) {
        return uni.showToast({
          title: "请输入店铺名",
          icon: "none",
        });
      }

      console.log("提交编辑:", this.editForm);

      try {
        await merchantApi.updateShop({
          id: this.editForm.id,
          name: this.editForm.name,
          logo: this.editForm.logo,
        });
        uni.showToast({
          title: "修改成功",
          icon: "success",
        });
        this.showEdit = false;
        this.loadShops();
      } catch (err) {
        console.error("编辑失败:", err);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* 页面基础布局 */
.container {
  padding: $uni-padding-base;
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: $uni-bg-color-page;
}

/* 申请新店铺区域 */
.apply-section {
  margin-bottom: $uni-padding-lg;
  text-align: center;
}

.apply-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  padding: $uni-padding-sm 50rpx;
  border-radius: 50rpx;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-medium;
  box-shadow: $uni-shadow-button;
  width: 100%;
  max-width: 400rpx;
  transition: all $uni-transition-duration-base;
}

.apply-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

/* 店铺列表区域 */
.shop-list {
  margin-bottom: $uni-padding-lg;
}

.section-title {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-margin-base;
  padding-left: $uni-spacing-xs;
  border-left: 8rpx solid $uni-color-primary;
}

.shop-cards {
  display: flex;
  flex-direction: column;
  gap: $uni-margin-base;
}

.shop-card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  box-shadow: $uni-shadow-sm;
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  transition: all $uni-transition-duration-base;
}

.shop-card:active {
  transform: translateY(4rpx);
  box-shadow: $uni-shadow-card-hover;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 25rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: $uni-border-radius-base;
  object-fit: cover;
  flex-shrink: 0;
}

.shop-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.name {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-spacing-xs;
}

.status {
  font-size: $uni-font-size-sm;
  padding: 6rpx $uni-padding-sm;
  border-radius: $uni-border-radius-lg;
  align-self: flex-start;
}

.status.success {
  background: rgba(7, 193, 96, 0.1);
  color: $uni-color-success;
}

.status.pending {
  background: rgba(255, 153, 0, 0.1);
  color: $uni-color-warning;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: $uni-margin-sm;
}

.action-btn {
  padding: 14rpx $uni-padding-base;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
  font-weight: $uni-font-weight-medium;
  min-width: 120rpx;
  transition: all $uni-transition-duration-base;
}

.action-btn.secondary {
  background: $uni-bg-color-grey;
  color: $uni-text-color-secondary;
  border: 1rpx solid $uni-border-color-light;
}

.action-btn:active {
  transform: translateY(2rpx);
  opacity: 0.9;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $uni-padding-lg;
  text-align: center;
}

.empty-img {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: $uni-padding-lg;
  opacity: 0.7;
}

.empty-text {
  font-size: $uni-font-size-lg;
  color: $uni-text-color-placeholder;
  line-height: 1.5;
}

/* ================= 编辑弹窗 ================= */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: $uni-z-index-modal;
  animation: fadeIn 0.25s ease-out;
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
  box-shadow: $uni-shadow-lg;
  animation: slideUp 0.3s ease-out;
}

.modal-title {
  text-align: center;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: $uni-padding-lg;
}

/* 表单项 */
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

/* 头像预览区域 */
.logo-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-lg;
  background: $uni-bg-color-grey;
  overflow: hidden;
  position: relative;
  margin-top: $uni-spacing-xs;
  border: 2rpx dashed $uni-border-color;
  transition: all $uni-transition-duration-base;
}

.logo-preview:active {
  transform: scale(0.98);
  border-color: $uni-color-primary;
}

.preview-img {
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

/* 按钮组 */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: $uni-margin-sm;
  gap: $uni-margin-sm;
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

/* 弹窗动画 */
@keyframes fadeIn {
  from {
    background: rgba(0, 0, 0, 0);
  }
  to {
    background: rgba(0, 0, 0, 0.5);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(60rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ================= 商家底栏 ================= */
.merchant-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: $uni-bg-color;
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid $uni-border-color-light;
  box-shadow: $uni-shadow-lg;
  z-index: $uni-z-index-fixed;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-sm;
  transition: color $uni-transition-duration-base;
}

.tab-item .icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: $uni-spacing-xs;
}

.tab-item.active {
  color: $uni-color-primary;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: $uni-margin-sm;
    padding-bottom: 140rpx;
  }

  .shop-card {
    padding: 25rpx;
  }

  .modal {
    padding: $uni-margin-sm;
  }
}
</style>
