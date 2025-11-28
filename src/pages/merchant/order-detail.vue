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
        const res = await uni.request({
          url: `http://localhost:8080/merchant/order/${this.orderId}`,
          header: {
            Authorization: "Bearer " + uni.getStorageSync("token"),
            "Content-Type": "application/json",
          },
        });

        if (res.statusCode === 403) {
          this.error = "无权限查看此订单";
          uni.showToast({ title: "无权限查看此订单", icon: "none" });
          return;
        }

        if (res.statusCode === 404) {
          this.error = "订单不存在";
          uni.showToast({ title: "订单不存在", icon: "none" });
          return;
        }

        if (res.data && res.data.code === 200) {
          const data = res.data.data;
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
        } else {
          this.error = res.data?.msg || "加载订单详情失败";
          uni.showToast({ title: this.error, icon: "none" });
        }
      } catch (error) {
        this.error = "网络错误，请稍后重试";
        uni.showToast({ title: this.error, icon: "none" });
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

    deliverOrder() {
      uni.showModal({
        title: "确认发货",
        content: "确定要发货吗？",
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: "发货中..." });

            uni.request({
              url: `http://localhost:8080/merchant/order/deliver/${this.orderId}`,
              method: "PUT",
              header: {
                Authorization: "Bearer " + uni.getStorageSync("token"),
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  uni.showToast({ title: "发货成功", icon: "success" });

                  this.order.status = 3;
                  this.order.deliverTime = new Date().toISOString();
                } else {
                  uni.showToast({
                    title: res.data.msg || "发货失败",
                    icon: "none",
                  });
                }
              },
              fail: (err) => {
                uni.hideLoading();
                console.error("发货失败:", err);
                uni.showToast({ title: "发货失败", icon: "none" });
              },
            });
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

<style scoped>
.container {
  padding: 30rpx;
  padding-bottom: 140rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 加载状态 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  font-size: 32rpx;
  color: #666;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  text-align: center;
}

.error-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.error-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 60rpx;
  line-height: 1.5;
}

.back-btn {
  background: #ff6b35;
  color: #fff;
  padding: 24rpx 60rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  min-width: 200rpx;
}

/* 其他样式保持不变 */
.order-status {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.status-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #ff6b35;
  display: block;
  margin-bottom: 15rpx;
}

.status-desc {
  font-size: 28rpx;
  color: #999;
}

.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 25rpx;
  display: block;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
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
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  background: #f5f5f5;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
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
  font-size: 28rpx;
  color: #ff6b35;
  font-weight: 600;
}

.goods-quantity {
  font-size: 26rpx;
  color: #666;
}

/* 订单总额 */
.order-total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 20rpx;
}

.total-label {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.total-amount {
  font-size: 32rpx;
  color: #ff6b35;
  font-weight: 600;
}

.action-buttons {
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  margin-top: 30rpx;
}

.action-btn {
  width: 100%;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
}

.deliver-btn {
  background: #ff6b35;
  color: #fff;
}

.deliver-btn:active {
  background: #e55a2b;
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
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
  transition: color 0.3s;
}

.tab-item .icon {
  width: 52rpx;
  height: 52rpx;
  margin-bottom: 8rpx;
}

.tab-item.active {
  color: #ff6b35;
}

@media (max-width: 750rpx) {
  .container {
    padding: 20rpx;
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
