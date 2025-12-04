<!-- pages/common/order-confirm/order-confirm.vue -->
<template>
  <view class="order-confirm-page">
    <!-- 地址输入 -->
    <view class="address-section">
      <view class="label">收货地址</view>
      <input
        v-model="address"
        placeholder="请输入收货地址（如宿舍楼+房间号）"
        class="address-input"
      />
    </view>

    <!-- 收货人姓名 -->
    <view class="contact-section">
      <view class="label">收货人姓名</view>
      <input
        v-model="nickname"
        placeholder="请输入收货人姓名"
        class="address-input"
      />
    </view>

    <!-- 联系电话 -->
    <view class="contact-section">
      <view class="label">联系电话</view>
      <input
        v-model="phone"
        placeholder="请输入联系电话"
        class="address-input"
        type="number"
      />
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-title">商品信息</view>
      <view class="goods-list">
        <view class="goods-item" v-for="item in goods" :key="item.id">
          <image
            :src="item.image || '/static/default.jpg'"
            mode="aspectFill"
            class="thumb"
          />
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="spec">¥{{ item.price }} × {{ item.num }}</text>
          </view>
          <text class="total-price"
            >¥{{ (item.price * item.num).toFixed(2) }}</text
          >
        </view>
      </view>
    </view>

    <!-- 总额 -->
    <view class="total-section">
      <view class="total-line">
        <text>商品总额</text>
        <text class="price">¥{{ total }}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @tap="submitOrder" :loading="submitting">
      {{ submitting ? "提交中..." : "提交订单" }}
    </button>
  </view>
</template>

<script>
import userApi from "@/api/user.js";
import orderApi from "@/api/order.js";

export default {
  data() {
    return {
      ids: [],
      goods: [],
      address: "",
      nickname: "",
      phone: "",
      submitting: false,
    };
  },
  computed: {
    total() {
      return this.goods.reduce((sum, g) => sum + g.price * g.num, 0).toFixed(2);
    },
  },
  onLoad(options) {
    // 接收参数 ids=1,2,3
    if (options.ids) {
      this.ids = options.ids.split(",").map(Number);
      this.loadGoods();
    }

    // 加载用户信息
    this.loadUserInfo();
  },
  methods: {
    // 加载要结算的商品
    async loadGoods() {
      try {
        const allCart = await userApi.getCartList();
        this.goods = allCart
          .filter((item) => this.ids.includes(item.productId))
          .map((item) => ({
            id: item.productId,
            name: item.productName,
            image: item.productImage,
            price: Number(item.price),
            num: item.num,
          }));
      } catch (err) {
        console.error("加载商品失败:", err);
      }
    },

    // 加载用户昵称和电话
    async loadUserInfo() {
      try {
        const info = await userApi.getUserInfo();
        this.nickname = info.nickname || "";
        this.phone = info.phone || "";
      } catch (err) {
        console.error("加载用户信息失败:", err);
      }
    },

    // 提交订单
    async submitOrder() {
      if (!this.nickname.trim()) {
        uni.showToast({ title: "请填写收货人姓名", icon: "none" });
        return;
      }
      if (!this.phone.trim()) {
        uni.showToast({ title: "请填写联系电话", icon: "none" });
        return;
      }
      if (!this.address.trim()) {
        uni.showToast({ title: "请填写收货地址", icon: "none" });
        return;
      }

      this.submitting = true;
      try {
        const orderNo = await orderApi.submitOrder({
          productIds: this.ids,
          address: this.address,
          nickname: this.nickname,
          phone: this.phone,
        });
        uni.showToast({
          title: "下单成功！订单号：" + orderNo,
          icon: "success",
        });
        setTimeout(() => {
          uni.switchTab({ url: "/pages/user/mine" });
        }, 1500);
      } catch (err) {
        console.error("下单失败:", err);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.order-confirm-page {
  background: $uni-bg-color-page;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.address-section,
.contact-section {
  background: $uni-bg-color;
  padding: $uni-padding-base;
  margin-bottom: $uni-margin-sm;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-sm;
}

.label {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  margin-bottom: $uni-margin-sm;
  display: block;
  font-weight: $uni-font-weight-medium;
}
.address-input {
  border: 2rpx solid $uni-border-color-light;
  border-radius: $uni-border-radius-base;
  padding: $uni-padding-sm;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  transition: all $uni-transition-duration-base;
}
.address-input:focus {
  border-color: $uni-color-primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 0, 0.1);
}

.section-title {
  padding: $uni-padding-sm $uni-padding-base;
  background: $uni-bg-color;
  font-size: $uni-font-size-lg;
  color: $uni-text-color-secondary;
  font-weight: $uni-font-weight-medium;
}

.goods-item {
  display: flex;
  align-items: center;
  background: $uni-bg-color;
  padding: $uni-padding-base;
  border-bottom: 1rpx solid $uni-border-color-light;
}
.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: $uni-border-radius-base;
  margin-right: $uni-margin-sm;
  background: $uni-bg-color-grey;
}
.info {
  flex: 1;
}
.name {
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.spec {
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
  margin-top: $uni-spacing-xs;
}
.total-price {
  color: $uni-color-price;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
}

.total-section {
  background: $uni-bg-color;
  padding: $uni-padding-base;
  margin: $uni-margin-sm 0;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-sm;
}
.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: $uni-font-size-xl;
}
.total-line .price {
  color: $uni-color-price;
  font-weight: $uni-font-weight-bold;
}

.submit-btn {
  position: fixed;
  bottom: $uni-padding-lg;
  left: $uni-padding-lg;
  right: $uni-padding-lg;
  height: 100rpx;
  line-height: 100rpx;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  border-radius: $uni-border-radius-round;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}
.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
</style>
