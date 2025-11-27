<template>
  <view class="shop-page">
    <view class="header">
      <picker @change="switchShop" :value="shopIndex" :range="shopNames">
        <view class="shop-name">{{ currentShop?.name || "请选择店铺" }}</view>
      </picker>
    </view>

    <view class="goods-list">
      <view class="goods-item" v-for="g in goods" :key="g.id">
        <image :src="g.image || '/static/default.jpg'" />
        <view class="info">
          <text class="name">{{ g.name }}</text>
          <text class="price">¥{{ g.price }}</text>
        </view>
        <button size="mini" type="warn" @tap="offSale(g.id)">下架</button>
      </view>
    </view>

    <view
      class="fab"
      @tap="uni.navigateTo({ url: '/pages/merchant/add-goods' })"
    >
      <text>+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shops: [],
      goods: [],
      shopIndex: 0,
    };
  },
  computed: {
    shopNames() {
      return this.shops.map((s) => s.name);
    },
    currentShop() {
      return this.shops[this.shopIndex];
    },
  },
  onShow() {
    this.loadShops();
  },
  methods: {
    loadShops() {
      uni.request({
        url: "http://localhost:8080/merchant/shops", // 你后端加个接口返回商家所有店铺
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          this.shops = res.data.data || [];
          if (this.shops.length) this.loadGoods();
        },
      });
    },
    switchShop(e) {
      this.shopIndex = e.detail.value;
      this.loadGoods();
    },
    loadGoods() {
      if (!this.currentShop) return;
      uni.request({
        url: `http://localhost:8080/merchant/products?shopId=${this.currentShop.id}`,
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          this.goods = res.data.data || [];
        },
      });
    },
    offSale(id) {
      uni.request({
        url: `http://localhost:8080/merchant/product/off/${id}`,
        method: "PUT",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: () => {
          uni.showToast({ title: "已下架" });
          this.loadGoods();
        },
      });
    },
  },
};
</script>

<style scoped>
.shop-page {
  background: #f5f5f5;
  min-height: 100vh;
}
.header {
  background: #fff;
  padding: 30rpx;
  font-size: 36rpx;
  font-weight: bold;
}
.goods-item {
  display: flex;
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 20rpx;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(16, 24, 40, 0.06);
}
.goods-item image {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
}
.info {
  flex: 1;
}
.name {
  font-weight: bold;
}
.price {
  color: #ff6b00;
  font-size: 36rpx;
}
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 100rpx;
  width: 120rpx;
  height: 120rpx;
  background: #ff6b00;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 120rpx;
  font-size: 80rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
}
</style>
