<template>
  <view class="cart-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">购物车</text>
      <text class="edit-btn" @tap="toggleEdit" v-if="cartList.length">
        {{ isEditing ? "完成" : "管理" }}
      </text>
    </view>

    <!-- 商品列表 -->
    <scroll-view class="list" scroll-y :scroll-top="scrollTop" @scroll="onScroll">
      <view
        class="item"
        v-for="item in cartList"
        :key="item.id"
        :class="{ 'item-editing': isEditing }"
      >
        <!-- 勾选框 -->
        <view class="checkbox-wrapper">
          <view
            class="checkbox"
            :class="{ checked: item.checked }"
            @tap="toggleItem(item)"
          >
            <text class="check-icon" v-if="item.checked">✓</text>
          </view>
        </view>

        <!-- 商品图 -->
        <view class="thumb-wrapper">
          <image class="thumb" :src="item.productImage" mode="aspectFill" />
          <view class="thumb-overlay" v-if="!item.checked"></view>
        </view>

        <!-- 信息区 -->
        <view class="content">
          <text class="name">{{ item.productName }}</text>
          <text class="spec" v-if="item.spec">规格: {{ item.spec }}</text>
          <view class="bottom-row">
            <text class="price">¥{{ item.price }}</text>

            <!-- 数量控制 -->
            <view class="stepper">
              <view
                class="stepper-btn minus"
                @tap="changeNum(item, -1)"
                :class="{ disabled: item.num <= 1 }"
              >
                <text class="btn-text">-</text>
              </view>
              <input
                v-model.number="item.num"
                type="number"
                class="stepper-input"
                @blur="validateNum(item)"
              />
              <view class="stepper-btn plus" @tap="changeNum(item, 1)">
                <text class="btn-text">+</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 删除按钮（编辑模式） -->
        <view v-if="isEditing" class="delete-wrapper">
          <view class="delete-btn" @tap="removeItem(item)">
            <text class="delete-icon">×</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!cartList.length">
        <view class="empty-icon">🛒</view>
        <text class="empty-text">购物车空空如也</text>
        <text class="empty-tip">快去挑选心仪的商品吧</text>
        <button class="empty-btn" @tap="goHome">去逛逛</button>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="footer" v-if="cartList.length">
      <view class="footer-content">
        <view class="left">
          <!-- 编辑模式：显示全选 -->
          <view v-if="isEditing" class="check-all" @tap="toggleAll">
            <view class="checkbox" :class="{ checked: allChecked }">
              <text class="check-icon" v-if="allChecked">✓</text>
            </view>
            <text class="check-all-text">全选</text>
          </view>

          <!-- 正常模式：显示合计 -->
          <view v-else class="total-info">
            <text class="total-text">
              合计：<text class="amount">¥{{ totalPrice }}</text>
            </text>
            <text class="total-tip">已选 {{ selectedCount }} 件商品</text>
          </view>
        </view>

        <button
          class="action-btn"
          :class="{
            'delete-mode': isEditing,
            disabled: selectedCount === 0,
          }"
          @tap="handleAction"
        >
          {{
            isEditing ? `删除所选(${selectedCount})` : `结算(${selectedCount})`
          }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from "@/api/user.js";

export default {
  data() {
    return {
      isEditing: false,
      cartList: [],
      scrollTop: 0,
    };
  },

  computed: {
    // 已选商品数量
    selectedCount() {
      return this.cartList.filter((i) => i.checked).length;
    },
    // 是否全选
    allChecked() {
      return this.cartList.length > 0 && this.cartList.every((i) => i.checked);
    },
    // 总价
    totalPrice() {
      return this.cartList
        .filter((i) => i.checked)
        .reduce((sum, i) => sum + i.price * i.num, 0)
        .toFixed(2);
    },
  },

  onShow() {
    this.loadCart();
  },

  methods: {
    // 加载购物车
    async loadCart() {
      uni.showLoading({ title: "加载中..." });
      try {
        const cartData = await userApi.getCartList();
        this.cartList = cartData.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage || "/static/default.jpg",
          price: Number(item.price),
          num: item.num,
          checked: true,
          spec: item.spec || "默认规格",
        }));
      } catch (error) {
        console.log("加载购物车失败:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 切换编辑模式
    toggleEdit() {
      this.isEditing = !this.isEditing;
      // 切换编辑模式时，如果退出编辑模式，确保有选中商品
      if (!this.isEditing && this.selectedCount === 0 && this.cartList.length > 0) {
        // 退出编辑模式时，如果没有任何选中，默认全选
        this.cartList.forEach((item) => (item.checked = true));
      }
    },

    // 单选
    toggleItem(item) {
      item.checked = !item.checked;
    },

    // 全选/全不选
    toggleAll() {
      const checked = !this.allChecked;
      this.cartList.forEach((item) => (item.checked = checked));
    },

    // 修改数量
    async changeNum(item, delta) {
      const num = item.num + delta;
      if (num < 1) return;

      uni.showLoading({ title: "更新中..." });
      try {
        await userApi.updateCartItem({ productId: item.productId, num });
        item.num = num;
      } catch (error) {
        console.log("更新数量失败:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 验证数量输入
    validateNum(item) {
      const num = parseInt(item.num) || 1;
      if (num < 1) {
        item.num = 1;
        this.changeNum(item, 0); // 同步到服务器
      } else if (num !== item.num) {
        item.num = num;
        this.changeNum(item, 0); // 同步到服务器
      }
    },

    // 删除单个
    async removeItem(item) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除此商品吗？",
        confirmColor: "#ff4444",
        success: async (e) => {
          if (e.confirm) {
            uni.showLoading({ title: "删除中..." });
            try {
              await userApi.deleteCartItem({ productId: item.productId });
              uni.showToast({ title: "删除成功", icon: "success" });
              // 重新加载购物车
              await this.loadCart();
              // 如果购物车为空，退出编辑模式
              if (this.cartList.length === 0) {
                this.isEditing = false;
              }
            } catch (error) {
              console.log("删除失败:", error);
              uni.showToast({ title: "删除失败", icon: "none" });
            } finally {
              uni.hideLoading();
            }
          }
        },
      });
    },

    // 底部主按钮行为
    async handleAction() {
      if (!this.selectedCount) {
        uni.showToast({ title: "请选择商品", icon: "none" });
        return;
      }

      if (this.isEditing) {
        // 批量删除
        uni.showModal({
          title: "确认删除",
          content: `确定删除这 ${this.selectedCount} 件商品吗？`,
          confirmColor: "#ff4444",
          success: async (e) => {
            if (e.confirm) {
              uni.showLoading({ title: "删除中..." });
              try {
                const productIds = this.cartList
                  .filter((i) => i.checked)
                  .map((i) => i.productId);

                await userApi.batchDeleteCartItems(productIds);
                uni.showToast({ title: "删除成功", icon: "success" });
                // 重新加载购物车
                await this.loadCart();
                // 如果购物车为空，退出编辑模式
                if (this.cartList.length === 0) {
                  this.isEditing = false;
                } else {
                  // 如果还有商品，保持编辑模式
                  this.isEditing = true;
                }
              } catch (error) {
                console.log("批量删除失败:", error);
              } finally {
                uni.hideLoading();
              }
            }
          },
        });
      } else {
        // 去结算
        const ids = this.cartList
          .filter((i) => i.checked)
          .map((i) => i.productId);
        uni.navigateTo({
          url: `/pages/common/order-confirm?ids=${ids.join(",")}`,
        });
      }
    },

    goHome() {
      uni.switchTab({ url: "/pages/user/index" });
    },

    // 滚动事件
    onScroll(e) {
      // 可以在这里处理滚动逻辑
    },
  },
};
</script>

<style lang="scss" scoped>
.cart-page {
  background: $uni-bg-color-page;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.header {
  height: 120rpx;
  padding: 0 $uni-padding-lg;
  background: $uni-bg-color;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid $uni-border-color-light;
  position: sticky;
  top: 0;
  z-index: $uni-z-index-sticky;
  box-shadow: $uni-shadow-sm;
}

.title {
  font-size: 38rpx;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
}

.edit-btn {
  font-size: $uni-font-size-lg;
  color: $uni-color-primary;
  font-weight: $uni-font-weight-medium;
}

/* 商品列表 */
.list {
  /* 使用flex:1让列表占据剩余空间 */
  flex: 1;
  padding: $uni-padding-base;
  padding-bottom: 200rpx; /* 底部操作栏 + tabBar */
  box-sizing: border-box;
  /* 头部是sticky定位，列表自然从头部下方开始，不需要padding-top */
  overflow-y: auto;
}

.item {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-xl;
  margin-bottom: $uni-margin-sm;
  padding: $uni-padding-base;
  display: flex;
  align-items: center;
  box-shadow: $uni-shadow-card;
  transition: all $uni-transition-duration-base;
  position: relative;
}

.item-editing {
  transform: translateX(-20rpx);
}

/* 勾选框 */
.checkbox-wrapper {
  margin-right: $uni-margin-sm;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid $uni-border-color;
  border-radius: $uni-border-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $uni-transition-duration-base;
}

.checkbox.checked {
  background: $uni-color-primary;
  border-color: $uni-color-primary;
}

.check-icon {
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-bold;
}

/* 商品图片 */
.thumb-wrapper {
  position: relative;
  margin-right: $uni-margin-sm;
}

.thumb {
  width: 180rpx;
  height: 180rpx;
  border-radius: $uni-border-radius-base;
  background: $uni-bg-color-grey;
}

.thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: $uni-border-radius-base;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 180rpx;
}

.name {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  line-height: $uni-line-height-base;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: $uni-spacing-sm;
}

.spec {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-margin-sm;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: $uni-font-size-xl;
  color: $uni-color-price-highlight;
  font-weight: $uni-font-weight-bold;
}

/* 数量控制器 */
.stepper {
  display: flex;
  align-items: center;
  height: 60rpx;
  border-radius: $uni-border-radius-round;
  overflow: hidden;
  background: $uni-bg-color-grey;
}

.stepper-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $uni-bg-color;
  transition: all $uni-transition-duration-fast;
}

.stepper-btn:active {
  background: $uni-bg-color-hover;
}

.stepper-btn.disabled {
  background: $uni-bg-color-grey;
}

.stepper-btn.disabled .btn-text {
  color: $uni-text-color-disabled;
}

.btn-text {
  font-size: $uni-font-size-lg;
  color: $uni-color-primary;
  font-weight: $uni-font-weight-bold;
}

.stepper-input {
  width: 80rpx;
  height: 60rpx;
  text-align: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  background: $uni-bg-color;
}

/* 删除按钮 */
.delete-wrapper {
  position: absolute;
  right: $uni-padding-base;
  top: 50%;
  transform: translateY(-50%);
}

.delete-btn {
  width: 80rpx;
  height: 80rpx;
  background: $uni-color-error;
  border-radius: $uni-border-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $uni-shadow-base;
  transition: all $uni-transition-duration-base;
}

.delete-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.delete-icon {
  color: $uni-text-color-inverse;
  font-size: 40rpx;
  font-weight: $uni-font-weight-bold;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 200rpx $uni-padding-lg 300rpx;
}

.empty-icon {
  font-size: 160rpx;
  margin-bottom: $uni-margin-lg;
  opacity: 0.3;
}

.empty-text {
  display: block;
  font-size: 34rpx;
  color: $uni-text-color-placeholder;
  margin-bottom: $uni-margin-sm;
}

.empty-tip {
  display: block;
  font-size: $uni-font-size-base;
  color: $uni-text-color-disabled;
  margin-bottom: $uni-margin-xl;
}

.empty-btn {
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-medium;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}

.empty-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

/* 底部操作栏 */
.footer {
  position: fixed;
  /* 为底部导航栏留出空间（tabBar高度约100rpx） */
  bottom: 100rpx;
  left: 0;
  right: 0;
  background: $uni-bg-color;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: $uni-z-index-fixed;
  /* 安全区域适配 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1rpx solid $uni-border-color-light;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $uni-padding-base $uni-padding-lg;
  max-width: 750rpx;
  margin: 0 auto;
  min-height: 100rpx;
  box-sizing: border-box;
}

.left {
  display: flex;
  align-items: center;
  flex: 1;
}

/* 全选 */
.check-all {
  display: flex;
  align-items: center;
}

.check-all .checkbox {
  margin-right: $uni-padding-xs;
}

.check-all-text {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
}

/* 合计信息 */
.total-info {
  display: flex;
  flex-direction: column;
}

.total-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  margin-bottom: $uni-spacing-xs;
}

.amount {
  font-size: $uni-font-size-xl;
  color: $uni-color-price-highlight;
  font-weight: $uni-font-weight-bold;
}

.total-tip {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

/* 操作按钮 */
.action-btn {
  min-width: 200rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-medium;
  color: $uni-text-color-inverse;
  background: $uni-color-primary-gradient;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
  padding: 0 $uni-padding-lg;
  box-sizing: border-box;
  white-space: nowrap;
}

.action-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

.action-btn.delete-mode {
  background: linear-gradient(135deg, #ff6b6b, $uni-color-error);
  box-shadow: 0 8rpx 24rpx rgba(255, 68, 68, 0.3);
}

.action-btn.disabled {
  background: $uni-text-color-disabled;
  box-shadow: none;
  opacity: $uni-opacity-disabled;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item {
  animation: fadeIn 0.4s ease;
}

.item:nth-child(1) {
  animation-delay: 0.05s;
}
.item:nth-child(2) {
  animation-delay: 0.1s;
}
.item:nth-child(3) {
  animation-delay: 0.15s;
}
.item:nth-child(4) {
  animation-delay: 0.2s;
}
.item:nth-child(5) {
  animation-delay: 0.25s;
}
</style>
