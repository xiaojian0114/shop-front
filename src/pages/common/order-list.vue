<!-- pages/common/order-list.vue 最终稳定版（保持原样式，仅修复 status 传参与切换） -->
<template>
  <view class="order-list">
    <!-- 顶部 tabs -->
    <view class="tabs">
      <view
        v-for="t in tabs"
        :key="t.value"
        class="tab"
        :class="{ active: currentStatus === t.value }"
        @tap="switchStatus(t.value)"
      >
        {{ t.label }}
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order" v-for="o in orderList" :key="o.orderId">
      <view class="header">
        <text class="order-no">订单号：{{ o.orderNo }}</text>
        <text class="status" :class="statusClass(o.status)">
          {{ o.statusText }}
        </text>
      </view>

      <view class="goods-list">
        <view class="goods-item" v-for="g in o.goods" :key="g.productId">
          <image
            :src="g.productImage || '/static/default.jpg'"
            mode="aspectFill"
            class="thumb"
          />
          <view class="info">
            <text class="name">{{ g.productName }}</text>
            <text class="spec">¥{{ g.price }} × {{ g.num }}</text>
          </view>
        </view>
      </view>

      <view class="footer">
        <view class="left">
          <text class="total-text">
            共 {{ o.goodsCount }} 件商品　合计：
            <text class="price">¥{{ o.totalAmount }}</text>
          </text>
        </view>

        <view class="right">
          <button
            v-if="o.status === 1"
            class="pay-btn"
            @tap="payOrder(o.orderNo)"
            :loading="payingOrderNo === o.orderNo"
            :disabled="payingOrderNo === o.orderNo"
          >
            {{ payingOrderNo === o.orderNo ? "支付中..." : "去支付" }}
          </button>

          <text v-if="o.status === 2" class="status-tip">等待商家发货</text>
          <view v-if="o.status === 3" class="receive-action">
            <text class="status-tip success">已发货</text>
            <button
              class="receive-btn"
              @tap="confirmReceipt(o)"
              :loading="confirmingOrderId === o.orderId"
              :disabled="confirmingOrderId === o.orderId"
            >
              {{ confirmingOrderId === o.orderId ? "提交中..." : "确认收货" }}
            </button>
          </view>
          <text v-if="o.status === 4" class="status-tip success">交易完成</text>
        </view>
      </view>
    </view>

    <view class="empty" v-if="orderList.length === 0 && !loading">
      <text class="icon">Empty Box</text>
      <text class="text">暂无订单～</text>
      <button
        class="go-home"
        @tap="uni.switchTab({ url: '/pages/user/index' })"
      >
        去首页
      </button>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import userApi from "@/api/user.js";
import orderApi from "@/api/order.js";

export default {
  data() {
    return {
      orderList: [],
      loading: true,
      payingOrderNo: "",
      confirmingOrderId: 0,

      tabs: [
        { label: "全部", value: 0 },
        { label: "待支付", value: 1 },
        { label: "待发货", value: 2 },
        { label: "已发货", value: 3 },
        { label: "已完成", value: 4 },
      ],

      currentStatus: 0,
    };
  },

  // 使用 onLoad 接收来自 mine.vue 的 status 参数
  onLoad(query) {
    this.currentStatus = Number(query.status || 0);
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders(() => uni.stopPullDownRefresh());
  },

  methods: {
    switchStatus(status) {
      if (this.currentStatus === status) return;
      this.currentStatus = status;
      // 切换时必须重新请求后端（并把 status 带上）
      this.loadOrders();
    },

    /** 加载订单（关键：把 status 传给后端） */
    loadOrders(callback) {
      this.loading = true;

      userApi
        .getOrderList({
          status: this.currentStatus,
          page: 1,
          pageSize: 50,
        })
        .then((res) => {
          const list = res?.list || res || [];

          // 兼容后端返回格式：补全字段并映射 statusText 如果后端没有返回
          this.orderList = list.map((o) => ({
            ...o,
            orderId: o.orderId || o.id,
            goods: o.goods || [],
            goodsCount: o.goodsCount || (o.goods ? o.goods.length : 0),
            statusText:
              o.statusText ||
              {
                1: "待支付",
                2: "待发货",
                3: "已发货",
                4: "已完成",
              }[o.status] ||
              "未知状态",
          }));
        })
        .catch((err) => {
          this.orderList = [];
          console.error("加载订单失败:", err);
        })
        .finally(() => {
          this.loading = false;
          callback?.();
        });
    },

    /** 支付订单（保持你原来的逻辑） */
    payOrder(orderNo) {
      uni.showModal({
        title: "确认支付",
        content: `确定支付订单 ${orderNo} 吗？`,
        confirmText: "确认支付",
        confirmColor: "#ff6b00",
        success: (e) => {
          if (!e.confirm) return;
          this.payingOrderNo = orderNo;

          orderApi
            .payOrder({ orderNo })
            .then(() => {
              uni.showToast({ title: "支付成功！", icon: "success" });
              this.loadOrders();
            })
            .catch((err) => {
              console.error("支付失败:", err);
            })
            .finally(() => {
              this.payingOrderNo = "";
            });
        },
      });
    },

    statusClass(s) {
      return (
        {
          1: "status-pay",
          2: "status-ship",
          3: "status-receive",
          4: "status-done",
        }[s] || ""
      );
    },

    /** 确认收货 */
    confirmReceipt(order) {
      uni.showModal({
        title: "确认收货",
        content: `确认已收到订单 ${order.orderNo} 的商品吗？`,
        confirmText: "确认",
        confirmColor: "#07c160",
        success: (res) => {
          if (!res.confirm) return;
          const orderId = order.orderId || order.id;
          this.confirmingOrderId = orderId;

          orderApi
            .confirmReceipt(orderId)
            .then(() => {
              uni.showToast({ title: "确认收货成功", icon: "success" });
              this.loadOrders();
            })
            .catch((err) => {
              console.error("确认收货失败:", err);
              uni.showToast({ title: "操作失败，请稍后重试", icon: "none" });
            })
            .finally(() => {
              this.confirmingOrderId = 0;
            });
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* 顶部 tabs */
.tabs {
  display: flex;
  background: $uni-bg-color;
  padding: $uni-padding-sm 0;
  margin-bottom: $uni-margin-sm;
  box-shadow: $uni-shadow-sm;
}
.tab {
  flex: 1;
  text-align: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  padding: $uni-padding-xs 0;
  transition: color $uni-transition-duration-base;
}
.tab.active {
  color: $uni-color-primary;
  font-weight: $uni-font-weight-semibold;
  border-bottom: 4rpx solid $uni-color-primary;
}

/* 订单列表 */
.order-list {
  background: $uni-bg-color-page;
  min-height: 100vh;
  padding: $uni-padding-sm 0;
}
.order {
  margin: 0 $uni-margin-base $uni-margin-base;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-xxl;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
  transition: all $uni-transition-duration-base;
}
.order:active {
  box-shadow: $uni-shadow-card-hover;
}
.header {
  padding: $uni-padding-base;
  background: linear-gradient(120deg, #fdfbfb, $uni-bg-color-grey);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}
.status-pay {
  color: $uni-color-primary;
}
.status-ship {
  color: $uni-color-secondary;
}
.status-receive {
  color: $uni-color-success;
}
.status-done {
  color: $uni-text-color-placeholder;
}
.goods-list {
  padding: 0 $uni-padding-base;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: $uni-padding-base 0;
  border-bottom: 1rpx solid $uni-border-color-light;
}
.goods-item:last-child {
  border-bottom: none;
}
.thumb {
  width: 180rpx;
  height: 180rpx;
  border-radius: $uni-border-radius-lg;
  margin-right: $uni-margin-base;
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
  margin-bottom: $uni-spacing-sm;
}
.spec {
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
}
.footer {
  padding: $uni-padding-base;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $uni-bg-color-grey;
  border-top: 1rpx solid $uni-border-color-light;
}
.total-text {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
}
.price {
  color: $uni-color-price-highlight;
  font-size: 38rpx;
  font-weight: $uni-font-weight-bold;
}
.pay-btn {
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: $uni-border-radius-round;
  font-size: $uni-font-size-base;
  padding: 0 $uni-padding-lg;
  box-shadow: $uni-shadow-button;
  min-width: 180rpx;
  transition: all $uni-transition-duration-base;
}
.pay-btn:active {
  transform: translateY(2rpx);
  box-shadow: $uni-shadow-button-hover;
}
.status-tip {
  font-size: $uni-font-size-base;
  padding: $uni-padding-xs $uni-padding-sm;
  border-radius: $uni-border-radius-round;
  background: $uni-bg-color-grey;
}
.receive-action {
  display: flex;
  align-items: center;
  gap: $uni-spacing-sm;
}
.receive-btn {
  min-width: 180rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: $uni-border-radius-round;
  background: rgba(7, 193, 96, 0.12);
  color: $uni-color-success;
  font-size: $uni-font-size-base;
  padding: 0 $uni-padding-lg;
  border: 2rpx solid rgba(7, 193, 96, 0.4);
  transition: all $uni-transition-duration-base;
}
.receive-btn:active {
  background: rgba(7, 193, 96, 0.24);
}
.status-tip.success {
  background: rgba(7, 193, 96, 0.1);
  color: $uni-color-success;
}
.empty {
  text-align: center;
  padding-top: 300rpx;
  color: $uni-text-color-placeholder;
}
.loading {
  text-align: center;
  padding: 100rpx 0;
  color: $uni-text-color-placeholder;
}
</style>
