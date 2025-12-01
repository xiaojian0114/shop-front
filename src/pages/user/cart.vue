<template>
  <view class="cart-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">购物车</text>
      <text class="edit-btn" @tap="toggleEdit">
        {{ isEditing ? "完成" : "管理" }}
      </text>
    </view>

    <!-- 商品列表 -->
    <view class="list">
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
    </view>

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
      if (item.num < 1) {
        item.num = 1;
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
              this.loadCart();
            } catch (error) {
              console.log("删除失败:", error);
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
                this.loadCart();
                this.isEditing = false;
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
  },
};
</script>

<style scoped>
.cart-page {
  background: #f8f9fb;
  min-height: 100vh;
  /* 移除原来的 padding-bottom，改为在列表底部添加占位 */
}

/* 头部 */
.header {
  height: 120rpx;
  padding: 0 40rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
}

.edit-btn {
  font-size: 32rpx;
  color: #3875ff;
  font-weight: 500;
}

/* 商品列表 */
.list {
  padding: 30rpx;
  /* 添加底部内边距，为底部操作栏留出空间 */
  padding-bottom: 160rpx;
}

.item {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
}

.item-editing {
  transform: translateX(-20rpx);
}

/* 勾选框 */
.checkbox-wrapper {
  margin-right: 24rpx;
}

.checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background: #3875ff;
  border-color: #3875ff;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

/* 商品图片 */
.thumb-wrapper {
  position: relative;
  margin-right: 24rpx;
}

.thumb {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  background: #f8f9fa;
}

.thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 180rpx;
}

.name {
  font-size: 32rpx;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.spec {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: 36rpx;
  color: #ff4444;
  font-weight: bold;
}

/* 数量控制器 */
.stepper {
  display: flex;
  align-items: center;
  height: 60rpx;
  border-radius: 30rpx;
  overflow: hidden;
  background: #f8f9fa;
}

.stepper-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.2s ease;
}

.stepper-btn:active {
  background: #f0f0f0;
}

.stepper-btn.disabled {
  background: #f8f9fa;
}

.stepper-btn.disabled .btn-text {
  color: #ccc;
}

.btn-text {
  font-size: 32rpx;
  color: #3875ff;
  font-weight: bold;
}

.stepper-input {
  width: 80rpx;
  height: 60rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  background: #fff;
}

/* 删除按钮 */
.delete-wrapper {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
}

.delete-btn {
  width: 80rpx;
  height: 80rpx;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 68, 68, 0.3);
}

.delete-icon {
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 200rpx 40rpx 300rpx;
}

.empty-icon {
  font-size: 160rpx;
  margin-bottom: 40rpx;
  opacity: 0.3;
}

.empty-text {
  display: block;
  font-size: 34rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-tip {
  display: block;
  font-size: 28rpx;
  color: #ccc;
  margin-bottom: 60rpx;
}

.empty-btn {
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #3875ff, #6a11cb);
  color: #fff;
  border-radius: 40rpx;
  font-size: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(56, 117, 255, 0.3);
}

/* 底部操作栏 - 修复位置 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  /* 关键修复：设置安全区域适配 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  max-width: 750rpx;
  margin: 0 auto;
  /* 确保内容在安全区域内 */
  min-height: 300rpx;
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
  margin-right: 16rpx;
}

.check-all-text {
  font-size: 32rpx;
  color: #333;
}

/* 合计信息 */
.total-info {
  display: flex;
  flex-direction: column;
}

.total-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.amount {
  font-size: 36rpx;
  color: #ff4444;
  font-weight: bold;
}

.total-tip {
  font-size: 24rpx;
  color: #999;
}

/* 操作按钮 */
.action-btn {
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #3875ff, #6a11cb);
  box-shadow: 0 8rpx 24rpx rgba(56, 117, 255, 0.3);
  transition: all 0.3s ease;
}

.action-btn.delete-mode {
  background: linear-gradient(135deg, #ff6b6b, #ff4444);
  box-shadow: 0 8rpx 24rpx rgba(255, 68, 68, 0.3);
}

.action-btn.disabled {
  background: #ccc;
  box-shadow: none;
  transform: scale(0.95);
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
