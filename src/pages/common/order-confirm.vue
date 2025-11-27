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
      uni.request({
        url: "http://localhost:8080/user/cart",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          if (res.data.code === 200) {
            const allCart = res.data.data || [];
            this.goods = allCart
              .filter((item) => this.ids.includes(item.productId))
              .map((item) => ({
                id: item.productId,
                name: item.productName,
                image: item.productImage,
                price: Number(item.price),
                num: item.num,
              }));
          }
        },
      });
    },

    // 加载用户昵称和电话
    loadUserInfo() {
      uni.request({
        url: "http://localhost:8080/user/info",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          if (res.data.code === 200) {
            const info = res.data.data;
            this.nickname = info.nickname || "";
            this.phone = info.phone || "";
          }
        },
      });
    },

    // 提交订单
    submitOrder() {
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
      uni.request({
        url: "http://localhost:8080/user/order/submit",
        method: "POST",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        data: {
          productIds: this.ids,
          address: this.address,
          nickname: this.nickname,
          phone: this.phone,
        },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({
              title: "下单成功！订单号：" + res.data.data,
              icon: "success",
            });
            setTimeout(() => {
              uni.switchTab({ url: "/pages/user/mine" });
            }, 1500);
          } else {
            uni.showToast({ title: res.data.msg || "下单失败", icon: "none" });
          }
        },
        fail: () => {
          uni.showToast({ title: "网络错误", icon: "none" });
        },
        complete: () => {
          this.submitting = false;
        },
      });
    },
  },
};
</script>

<style scoped>
.order-confirm-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.address-section,
.contact-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}
.address-input {
  border: 2rpx solid #eee;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
}

.section-title {
  padding: 20rpx 30rpx;
  background: #fff;
  font-size: 32rpx;
  color: #666;
}

.goods-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
}
.info {
  flex: 1;
}
.name {
  font-size: 32rpx;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.spec {
  color: #999;
  font-size: 28rpx;
  margin-top: 10rpx;
}
.total-price {
  color: #ff5500;
  font-size: 36rpx;
  font-weight: bold;
}

.total-section {
  background: #fff;
  padding: 30rpx;
  margin: 20rpx 0;
}
.total-line {
  display: flex;
  justify-content: space-between;
  font-size: 36rpx;
}
.total-line .price {
  color: #ff5500;
  font-weight: bold;
}

.submit-btn {
  position: fixed;
  bottom: 40rpx;
  left: 40rpx;
  right: 40rpx;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(135deg, #ff6b00, #ff8b3d);
  color: #fff;
  font-size: 36rpx;
  border-radius: 50rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
}
</style>
