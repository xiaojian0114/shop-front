<template>
  <view class="container">
    <view class="shop-page">
      <view class="header">
        <picker @change="switchShop" :value="shopIndex" :range="shopNames">
          <view class="shop-name">{{ currentShop?.name || "请选择店铺" }}</view>
        </picker>
      </view>

      <view class="goods-list">
        <!-- 修改首页中的商品项，添加点击事件 -->
        <view
          class="goods-item"
          v-for="g in goods"
          :key="g.id"
          @tap="viewGoodsDetail(g.id)"
        >
          <image :src="g.image || '/static/default.jpg'" class="goods-img" />
          <view class="info">
            <text class="name">{{ g.name }}</text>
            <text class="price">¥{{ g.price }}</text>
          </view>
          <button size="mini" type="warn" @tap.stop="offSale(g.id)">
            下架
          </button>
        </view>
      </view>

      <view
        class="fab"
        @tap="uni.navigateTo({ url: '/pages/merchant/add-goods' })"
      >
        <text>+</text>
      </view>
    </view>

    <!-- 商家专属底栏 -->
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
export default {
  data() {
    return {
      shops: [],
      goods: [],
      shopIndex: 0,
      currentPath: "",
      isMerchant: false,
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
  onLoad() {
    this.initPage();
  },
  onShow() {
    this.initPage();
    this.loadShops();
  },
  methods: {
    initPage() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
    },
    goTo(path) {
      uni.reLaunch({ url: path });
    },
    loadShops() {
      uni.request({
        url: "http://localhost:8080/merchant/shops",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          this.shops = res.data.data || [];
          if (this.shops.length > 0) this.loadGoods();
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
          uni.showToast({ title: "已下架", icon: "success" });
          this.loadGoods();
        },
      });
    },
    viewGoodsDetail(id) {
      uni.navigateTo({
        url: `/pages/merchant/goods-detail-merchant?id=${id}`,
      });
    },
  },
};
</script>

<style scoped>
.container {
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: #f5f5f5;
}
.shop-page {
  padding-bottom: 20rpx;
}
.header {
  background: #fff;
  padding: 30rpx;
  font-size: 36rpx;
  font-weight: bold;
}
.goods-list {
  padding: 0 20rpx;
}
.goods-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx 0;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}
.goods-img {
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  border-radius: 12rpx;
}
.info {
  flex: 1;
}
.name {
  display: block;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.price {
  color: #ff6b00;
  font-size: 36rpx;
  font-weight: bold;
}
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 120rpx;
  height: 120rpx;
  background: #ff6b00;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 120rpx;
  font-size: 80rpx;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 0, 0.4);
  z-index: 998;
}

/* 商家底栏 */
.merchant-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  z-index: 9999;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
}
.tab-item .icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 8rpx;
}
.tab-item.active {
  color: #ff6b35;
}
</style>
