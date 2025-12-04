<template>
  <view class="container">
    <!-- 订单统计 -->
    <view class="order-stats" v-if="orderStats">
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.pendingDelivery || 0 }}</text>
        <text class="stat-label">待发货</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.todayOrders || 0 }}</text>
        <text class="stat-label">今日订单</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ orderStats.totalProducts || 0 }}</text>
        <text class="stat-label">商品总数</text>
      </view>
    </view>

    <!-- 订单筛选 -->
    <view class="order-filter">
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'all' }"
        @tap="changeFilter('all')"
      >
        全部
      </view>
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'pending' }"
        @tap="changeFilter('pending')"
      >
        待发货
      </view>
      <view
        class="filter-item"
        :class="{ active: currentFilter === 'delivered' }"
        @tap="changeFilter('delivered')"
      >
        已发货
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="order in filteredOrders" :key="order.id">
        <view class="order-header">
          <text class="order-number"
            >订单号: {{ order.orderNumber || order.id }}</text
          >
          <text class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </text>
        </view>

        <view class="order-goods">
          <view
            class="goods-item"
            v-for="(item, index) in getOrderItems(order)"
            :key="item.id || index"
          >
            <image :src="getProductImage(item)" class="goods-image" />
            <view class="goods-info">
              <text class="goods-name">{{ getProductName(item) }}</text>
              <view class="goods-details">
                <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
                <text class="goods-quantity"
                  >x{{ item.quantity || item.num || 1 }}</text
                >
              </view>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <text class="order-total"
            >总计: ¥{{ formatPrice(order.totalAmount) }}</text
          >
          <view class="order-actions">
            <button
              v-if="order.status === 2"
              class="action-btn deliver-btn"
              @tap="deliverOrder(order.id)"
            >
              发货
            </button>
            <button
              class="action-btn detail-btn"
              @tap="viewOrderDetail(order.id)"
            >
              详情
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-order" v-if="filteredOrders.length === 0">
        <image src="/static/empty-order.png" class="empty-img" />
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import merchantApi from "@/api/merchant.js";

export default {
  data() {
    return {
      orders: [],
      orderStats: null,
      currentFilter: "all",
      currentPath: "",
      isMerchant: false,
    };
  },
  computed: {
    filteredOrders() {
      if (this.currentFilter === "all") {
        return this.orders;
      } else if (this.currentFilter === "pending") {
        return this.orders.filter((order) => order.status === 2); // 待发货
      } else if (this.currentFilter === "delivered") {
        return this.orders.filter((order) => order.status === 3); // 已发货
      }
      return this.orders;
    },
  },
  onLoad() {
    this.initPage();
    this.loadOrderStats();
    this.loadOrders();
  },
  onShow() {
    this.initPage();
    // 重新加载数据
    this.loadOrderStats();
    this.loadOrders();
  },
  onPullDownRefresh() {
    this.loadOrderStats();
    this.loadOrders();
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  methods: {
    initPage() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
    },

    // 加载订单统计
    async loadOrderStats() {
      try {
        this.orderStats = await merchantApi.getOrderStats();
        console.log("订单统计:", this.orderStats);
      } catch (error) {
        console.error("加载订单统计失败:", error);
      }
    },

    async loadOrders() {
      try {
        console.log("开始加载订单列表...");
        const orders = await merchantApi.order.getList();
        console.log("订单列表响应:", orders);

        this.orders = orders || [];
        console.log("原始订单数据:", this.orders);

        // 处理订单数据，确保格式统一
        this.orders = this.orders.map((order) => {
          const processedOrder = { ...order };

          // 调试输出
          console.log(`订单 ${order.id} 的 items:`, order.items);
          console.log(`订单 ${order.id} 的 orderItems:`, order.orderItems);

          return processedOrder;
        });

        console.log("处理后的订单数据:", this.orders);
      } catch (error) {
        console.error("加载订单失败:", error);
        uni.showToast({ title: "加载订单失败", icon: "none" });
      }
    },

    // 获取订单的商品项
    getOrderItems(order) {
      // 优先使用 items，其次使用 orderItems
      let items = order.items || order.orderItems || [];

      // 如果后端返回的是空数组，使用默认数据
      if (items.length === 0) {
        items = this.createDefaultOrderItems(order);
      }

      // 确保每个商品项都有必要的字段
      return items.map((item) => ({
        id: item.id || Math.random(),
        name: item.name || item.productName || "商品",
        productName: item.productName || item.name || "商品",
        image: item.image || item.productImage || "/static/default-product.jpg",
        productImage:
          item.productImage || item.image || "/static/default-product.jpg",
        price: item.price || 0,
        quantity: item.quantity || item.num || 1,
        num: item.num || item.quantity || 1,
      }));
    },

    // 获取商品图片
    getProductImage(item) {
      const image = item.image || item.productImage;
      if (image && (image.startsWith("http") || image.startsWith("/static"))) {
        return image;
      }
      return image || "/static/default-product.jpg";
    },

    // 获取商品名称
    getProductName(item) {
      return item.name || item.productName || "商品";
    },

    // 创建默认订单项
    createDefaultOrderItems(order) {
      return [
        {
          id: 1,
          name: "商品",
          productName: "商品",
          image: "/static/default-product.jpg",
          productImage: "/static/default-product.jpg",
          price: order.totalAmount || 0,
          quantity: 1,
          num: 1,
        },
      ];
    },

    // 格式化价格
    formatPrice(price) {
      if (!price) return "0.00";
      return parseFloat(price).toFixed(2);
    },

    // 切换筛选条件
    changeFilter(filter) {
      this.currentFilter = filter;
    },

    // 发货
    async deliverOrder(orderId) {
      uni.showModal({
        title: "确认发货",
        content: "确定要发货吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await merchantApi.order.deliver(orderId);
              uni.showToast({ title: "发货成功", icon: "success" });
              this.loadOrders(); // 重新加载订单列表
              this.loadOrderStats(); // 重新加载统计
            } catch (error) {
              console.error("发货失败:", error);
            }
          }
        },
      });
    },

    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/merchant/order-detail?id=${orderId}`,
      });
    },

    goTo(path) {
      uni.reLaunch({ url: path });
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

    getStatusClass(status) {
      const classMap = {
        1: "status-pending",
        2: "status-waiting",
        3: "status-delivered",
        4: "status-completed",
        5: "status-cancelled",
      };
      return classMap[status] || "status-pending";
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

/* 订单统计 */
.order-stats {
  display: flex;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: $uni-margin-sm 0;
}

.stat-number {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  color: $uni-color-primary;
  display: block;
  margin-bottom: $uni-spacing-xs;
}

.stat-label {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-secondary;
}

/* 订单筛选 */
.order-filter {
  display: flex;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-margin-sm;
  margin-bottom: $uni-margin-base;
  box-shadow: $uni-shadow-sm;
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: $uni-margin-sm 0;
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  border-radius: $uni-border-radius-base;
  transition: all $uni-transition-duration-base;
}

.filter-item.active {
  background: $uni-color-primary;
  color: $uni-text-color-inverse;
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: $uni-margin-base;
}

.order-item {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-padding-base;
  box-shadow: $uni-shadow-sm;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
  padding-bottom: $uni-margin-sm;
  border-bottom: 1rpx solid $uni-border-color-light;
}

.order-number {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}

.order-status {
  font-size: $uni-font-size-sm;
  padding: $uni-spacing-xs $uni-margin-sm;
  border-radius: $uni-border-radius-lg;
}

.status-pending {
  background: rgba(255, 153, 0, 0.1);
  color: $uni-color-warning;
}

.status-waiting {
  background: rgba(255, 107, 53, 0.1);
  color: $uni-color-primary;
}

.status-delivered {
  background: rgba(74, 144, 226, 0.1);
  color: $uni-color-info;
}

.status-completed {
  background: rgba(7, 193, 96, 0.1);
  color: $uni-color-success;
}

.status-cancelled {
  background: rgba(153, 153, 153, 0.1);
  color: $uni-text-color-placeholder;
}

/* 订单商品 */
.order-goods {
  margin-bottom: 25rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  margin-bottom: $uni-margin-sm;
  padding: 15rpx;
  background: $uni-bg-color-grey;
  border-radius: $uni-border-radius-base;
}

.goods-item:last-child {
  margin-bottom: 0;
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
  margin-bottom: $uni-spacing-xs;
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

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $uni-margin-sm;
  border-top: 1rpx solid $uni-border-color-light;
}

.order-total {
  font-size: $uni-font-size-base;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
}

.order-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: $uni-padding-xs $uni-padding-sm;
  border-radius: $uni-border-radius-base;
  font-size: $uni-font-size-sm;
  font-weight: $uni-font-weight-medium;
  min-width: 120rpx;
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

.detail-btn {
  background: $uni-bg-color-grey;
  color: $uni-text-color-secondary;
}

.detail-btn:active {
  transform: translateY(2rpx);
  opacity: 0.9;
}

/* 空状态 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $uni-padding-lg;
  text-align: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: $uni-margin-base;
  opacity: 0.6;
}

.empty-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-placeholder;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: $uni-margin-sm;
    padding-bottom: 140rpx;
  }

  .order-stats {
    padding: 25rpx;
  }

  .order-item {
    padding: 25rpx;
  }

  .goods-item {
    padding: 12rpx;
  }

  .goods-image {
    width: 100rpx;
    height: 100rpx;
  }
}
</style>
