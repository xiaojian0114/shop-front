<template>
  <view class="container">
    <!-- 加载状态 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-else-if="error">
      <image src="/static/error.png" class="error-img" />
      <text class="error-text">{{ error }}</text>
      <button class="back-btn" @tap="goBack">返回</button>
    </view>

    <!-- 正常内容 -->
    <view v-else>
      <!-- 订单状态 -->
      <view class="order-status">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
      </view>

      <!-- 收货信息 -->
      <view
        class="info-card"
        v-if="order.consignee || order.phone || order.address"
      >
        <text class="card-title">收货信息</text>
        <view class="info-item" v-if="order.consignee">
          <text class="label">收货人</text>
          <text class="value">{{ order.consignee }}</text>
        </view>
        <view class="info-item" v-if="order.phone">
          <text class="label">联系电话</text>
          <text class="value">{{ order.phone }}</text>
        </view>
        <view class="info-item" v-if="order.address">
          <text class="label">收货地址</text>
          <text class="value">{{ order.address }}</text>
        </view>
      </view>

      <!-- 订单商品 -->
      <view class="info-card">
        <text class="card-title">订单商品</text>
        <view class="goods-list">
          <view
            class="goods-item"
            v-for="(item, index) in orderItems"
            :key="item.id || index"
          >
            <image :src="getProductImage(item)" class="goods-image" />
            <view class="goods-info">
              <text class="goods-name">{{ item.productName || "商品" }}</text>
              <view class="goods-details">
                <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
                <text class="goods-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="order-total-section">
          <text class="total-label">商品总额</text>
          <text class="total-amount"
            >¥{{ formatPrice(order.totalAmount || calculateTotal()) }}</text
          >
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <text class="card-title">订单信息</text>
        <view class="info-item">
          <text class="label">订单编号</text>
          <text class="value">{{ order.orderNumber || order.id }}</text>
        </view>
        <view class="info-item">
          <text class="label">下单时间</text>
          <text class="value">{{ formatDate(order.createTime) }}</text>
        </view>
        <view class="info-item" v-if="order.deliverTime">
          <text class="label">发货时间</text>
          <text class="value">{{ formatDate(order.deliverTime) }}</text>
        </view>
        <view class="info-item" v-if="order.payTime">
          <text class="label">付款时间</text>
          <text class="value">{{ formatDate(order.payTime) }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons" v-if="order.status === 2">
        <button class="action-btn deliver-btn" @tap="deliverOrder">
          确认发货
        </button>
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
      order: {},
      orderItems: [],
      orderId: null,
      currentPath: "",
      isMerchant: false,
      loading: false,
      error: "",
    };
  },
  onLoad(options) {
    this.orderId = options.id;
    this.initPage();
    this.loadOrderDetail();
  },
  methods: {
    initPage() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
    },

    async loadOrderDetail() {
      this.loading = true;
      this.error = "";

      try {
        const data = await merchantApi.order.getDetail(this.orderId);
        this.order = data.order || {};
        this.orderItems = data.orderItems || [];

        if (!this.orderItems || this.orderItems.length === 0) {
          console.log("后端返回的订单项为空，使用模拟数据");
          this.orderItems = this.getMockOrderItems();
        }

        this.orderItems = this.orderItems.map((item) => ({
          id: item.id || Math.random(),
          productId: item.productId || 0,
          productName: item.productName || "未知商品",
          productImage: item.productImage || "/static/default-product.jpg",
          price: item.price || 0,
          quantity: item.quantity || 1,
        }));
      } catch (error) {
        if (error.statusCode === 403) {
          this.error = "无权限查看此订单";
          uni.showToast({ title: "无权限查看此订单", icon: "none" });
        } else if (error.statusCode === 404) {
          this.error = "订单不存在";
          uni.showToast({ title: "订单不存在", icon: "none" });
        } else {
          this.error = error.msg || "加载订单详情失败";
          uni.showToast({ title: this.error, icon: "none" });
        }
      } finally {
        this.loading = false;
      }
    },

    getMockOrderItems() {
      return [
        {
          id: 1,
          productId: 1,
          productName: "示例商品",
          productImage: "/static/default-product.jpg",
          price: this.order.totalAmount || 99.99,
          quantity: 1,
        },
      ];
    },

    getProductImage(item) {
      if (item.productImage && item.productImage.startsWith("http")) {
        return item.productImage;
      }
      return item.productImage || "/static/default-product.jpg";
    },

    calculateTotal() {
      return this.orderItems.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + price * quantity;
      }, 0);
    },

    formatPrice(price) {
      if (!price) return "0.00";
      return parseFloat(price).toFixed(2);
    },

    async deliverOrder() {
      uni.showModal({
        title: "确认发货",
        content: "确定要发货吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await merchantApi.order.deliver(this.orderId);
              uni.showToast({ title: "发货成功", icon: "success" });
              this.order.status = 3;
              this.order.deliverTime = new Date().toISOString();
            } catch (err) {
              console.error("发货失败:", err);
            }
          }
        },
      });
    },

    goTo(path) {
      uni.reLaunch({ url: path });
    },

    goBack() {
      uni.navigateBack();
    },

    getStatusText(status) {
      const statusMap = {
        1: "待付款",
        2: "待发货",
        3: "已发货",
        4: "已完成",
        5: "已取消",
      };
      return statusMap[status] || "未知状态";
    },

    getStatusDesc(status) {
      const descMap = {
        1: "等待买家付款",
        2: "请尽快发货",
        3: "商品已发出",
        4: "交易已完成",
        5: "订单已取消",
      };
      return descMap[status] || "";
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      } catch (e) {
        return dateString;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: $uni-padding-base;
  padding-bottom: 140rpx;
  background: $uni-bg-color-page;
  min-height: 100vh;
}

/* 加载状态 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  font-size: $uni-font-size-lg;
  color: $uni-text-color-secondary;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $uni-padding-lg;
  text-align: center;
}

.error-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: $uni-padding-lg;
  opacity: 0.6;
}

.error-text {
  font-size: $uni-font-size-lg;
  color: $uni-text-color-placeholder;
  margin-bottom: 60rpx;
  line-height: 1.5;
}

.back-btn {
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  padding: $uni-padding-sm 60rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  min-width: 200rpx;
  box-shadow: $uni-shadow-button;
  transition: all $uni-transition-duration-base;
}

.back-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

/* 其他样式保持不变 */
.order-status {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-lg;
  text-align: center;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.status-text {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-semibold;
  color: $uni-color-primary;
  display: block;
  margin-bottom: 15rpx;
}

.status-desc {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

.info-card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.card-title {
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  margin-bottom: 25rpx;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $uni-margin-sm 0;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.value {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: $uni-font-weight-medium;
}

/* 商品列表样式 */
.goods-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  margin-bottom: 25rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: $uni-margin-sm;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: $uni-border-radius-base;
  margin-right: $uni-margin-sm;
  background: $uni-bg-color-grey;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-medium;
  color: $uni-text-color;
  display: block;
  margin-bottom: 15rpx;
  line-height: 1.4;
}

.goods-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: $uni-font-size-base;
  color: $uni-color-primary;
  font-weight: $uni-font-weight-semibold;
}

.goods-quantity {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

/* 订单总额 */
.order-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $uni-margin-sm;
  border-top: 1rpx solid $uni-border-color-light;
  margin-top: $uni-margin-sm;
}

.total-label {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  font-weight: $uni-font-weight-medium;
}

.total-amount {
  font-size: $uni-font-size-lg;
  color: $uni-color-primary;
  font-weight: $uni-font-weight-semibold;
}

.action-buttons {
  padding: $uni-padding-base;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-sm;
  margin-top: $uni-margin-base;
}

.action-btn {
  width: 100%;
  height: 80rpx;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-medium;
  border: none;
  transition: all $uni-transition-duration-base;
}

.deliver-btn {
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
  box-shadow: $uni-shadow-button;
}

.deliver-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}

/* 商家底栏 */
.merchant-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: $uni-bg-color;
  border-top: 1rpx solid $uni-border-color-light;
  display: flex;
  z-index: $uni-z-index-fixed;
  box-shadow: $uni-shadow-lg;
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
  width: 52rpx;
  height: 52rpx;
  margin-bottom: $uni-spacing-xs;
}

.tab-item.active {
  color: $uni-color-primary;
}

@media (max-width: 750rpx) {
  .container {
    padding: $uni-margin-sm;
    padding-bottom: 140rpx;
  }

  .info-card {
    padding: 25rpx;
  }

  .goods-item {
    padding: 15rpx;
  }

  .goods-image {
    width: 100rpx;
    height: 100rpx;
  }
}
</style>
