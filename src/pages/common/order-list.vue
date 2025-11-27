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
          <text v-if="o.status === 3" class="status-tip success">已发货</text>
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
export default {
  data() {
    return {
      orderList: [],
      loading: true,
      payingOrderNo: "",

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

      uni.request({
        url: "http://localhost:8080/user/order/list", // 保持后端路径不变
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        data: {
          status: this.currentStatus, // ← 确保把状态传给后端
          page: 1,
          pageSize: 50,
        },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            const list = res.data.data?.list || [];

            // 兼容后端返回格式：补全字段并映射 statusText 如果后端没有返回
            this.orderList = list.map((o) => ({
              ...o,
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
          } else {
            this.orderList = [];
            uni.showToast({
              title: (res.data && res.data.msg) || "加载失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          this.orderList = [];
          uni.showToast({ title: "网络错误", icon: "none" });
        },
        complete: () => {
          this.loading = false;
          callback?.();
        },
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

          uni.request({
            url: "http://localhost:8080/user/order/pay",
            method: "POST",
            header: { Authorization: "Bearer " + uni.getStorageSync("token") },
            data: { orderNo },
            success: (res) => {
              if (res.data && res.data.code === 200) {
                uni.showToast({ title: "支付成功！", icon: "success" });
                this.loadOrders();
              } else {
                uni.showToast({
                  title: (res.data && res.data.msg) || "支付失败",
                  icon: "none",
                });
              }
            },
            fail: () => uni.showToast({ title: "网络异常", icon: "none" }),
            complete: () => (this.payingOrderNo = ""),
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
  },
};
</script>

<style scoped>
/* 顶部 tabs */
.tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}
.tab {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  padding: 12rpx 0;
}
.tab.active {
  color: #ff6b00;
  font-weight: bold;
  border-bottom: 4rpx solid #ff6b00;
}

/* ===== 订单原样式（不改动） ===== */
.order-list {
  background: #f8f8f8;
  min-height: 100vh;
  padding: 20rpx 0;
}
.order {
  margin: 0 30rpx 30rpx;
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.08);
}
.header {
  padding: 30rpx;
  background: linear-gradient(120deg, #fdfbfb, #f5f5f5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #666;
}
.status-pay {
  color: #ff6b00;
}
.status-ship {
  color: #409eff;
}
.status-receive {
  color: #67c23a;
}
.status-done {
  color: #999;
}
.goods-list {
  padding: 0 30rpx;
}
.goods-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.goods-item:last-child {
  border-bottom: none;
}
.thumb {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  margin-right: 28rpx;
  background: #f9f9f9;
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
  margin-bottom: 12rpx;
}
.spec {
  color: #999;
  font-size: 28rpx;
}
.footer {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-top: 1rpx solid #eee;
}
.total-text {
  font-size: 30rpx;
  color: #666;
}
.price {
  color: #ff4444;
  font-size: 38rpx;
  font-weight: bold;
}
.pay-btn {
  background: linear-gradient(90deg, #ff6b00, #ff8c3d);
  color: #fff;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 38rpx;
  font-size: 30rpx;
  padding: 0 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 0, 0.4);
  min-width: 180rpx;
}
.status-tip {
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  background: #f0f0f0;
}
.status-tip.success {
  background: #f0fdf4;
  color: #67c23a;
}
.empty {
  text-align: center;
  padding-top: 300rpx;
  color: #999;
}
.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>
