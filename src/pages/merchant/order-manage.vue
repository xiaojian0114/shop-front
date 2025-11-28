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
          <view class="goods-item" v-for="item in order.items" :key="item.id">
            <image
              :src="item.image || '/static/default-product.jpg'"
              class="goods-image"
            />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-price"
                >¥{{ item.price }} x {{ item.quantity }}</text
              >
            </view>
          </view>
        </view>

        <view class="order-footer">
          <text class="order-total">总计: ¥{{ order.totalAmount }}</text>
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

    <!-- 商家底栏 -->
    <!-- <view class="merchant-tabbar" v-if="isMerchant">
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
    </view> -->
  </view>
</template>

<script>
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
        const res = await uni.request({
          url: "http://localhost:8080/merchant/order/stats",
          header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        });

        if (res.data.code === 200) {
          this.orderStats = res.data.data;
          console.log("订单统计:", this.orderStats);
        } else {
          console.warn("加载订单统计失败:", res.data.msg);
        }
      } catch (error) {
        console.error("加载订单统计失败:", error);
      }
    },

    // 加载订单列表
    async loadOrders() {
      try {
        const res = await uni.request({
          url: "http://localhost:8080/merchant/orders",
          header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        });

        if (res.data.code === 200) {
          this.orders = res.data.data || [];
          console.log("订单列表:", this.orders);
        } else {
          uni.showToast({
            title: res.data.msg || "加载订单失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("加载订单失败:", error);
        uni.showToast({ title: "加载订单失败", icon: "none" });
      }
    },

    // 切换筛选条件
    changeFilter(filter) {
      this.currentFilter = filter;
    },

    // 发货
    deliverOrder(orderId) {
      uni.showModal({
        title: "确认发货",
        content: "确定要发货吗？",
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: `http://localhost:8080/merchant/order/deliver/${orderId}`,
              method: "PUT",
              header: {
                Authorization: "Bearer " + uni.getStorageSync("token"),
              },
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({ title: "发货成功", icon: "success" });
                  this.loadOrders(); // 重新加载订单列表
                  this.loadOrderStats(); // 重新加载统计
                } else {
                  uni.showToast({
                    title: res.data.msg || "发货失败",
                    icon: "none",
                  });
                }
              },
              fail: () => {
                uni.showToast({ title: "发货失败", icon: "none" });
              },
            });
          }
        },
      });
    },

    // 查看订单详情
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

<style scoped>
.container {
  padding: 30rpx;
  padding-bottom: 140rpx;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 订单统计 */
.order-stats {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b35;
  display: block;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
}

/* 订单筛选 */
.order-filter {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.filter-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.filter-item.active {
  background: #ff6b35;
  color: #fff;
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.order-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-number {
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.status-pending {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

.status-waiting {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.status-delivered {
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
}

.status-completed {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.status-cancelled {
  background: rgba(153, 153, 153, 0.1);
  color: #999;
}

/* 订单商品 */
.order-goods {
  margin-bottom: 25rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.goods-price {
  font-size: 26rpx;
  color: #ff6b35;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-total {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 120rpx;
}

.deliver-btn {
  background: #ff6b35;
  color: #fff;
}

.detail-btn {
  background: #f1f1f1;
  color: #666;
}

/* 空状态 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
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

/* 响应式调整 */
@media (max-width: 750rpx) {
  .container {
    padding: 20rpx;
    padding-bottom: 140rpx;
  }

  .order-stats {
    padding: 25rpx;
  }

  .order-item {
    padding: 25rpx;
  }
}
</style>
