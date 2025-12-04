<!-- pages/common/shop-detail.vue -->
<template>
  <view class="shop-detail">
    <!-- 店铺头部 -->
    <view class="shop-header">
      <image
        :src="shopInfo.avatar || '/static/shop-default.png'"
        class="avatar"
        mode="aspectFill"
      />
      <view class="info">
        <text class="name">{{ shopInfo.name || "校园小店" }}</text>
        <text class="desc">{{
          shopInfo.description || "优质商家，欢迎选购~"
        }}</text>
        <text class="stats"
          >商品 {{ total }} · 已售 {{ shopInfo.totalSales || 0 }}</text
        >
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-title">店铺商品</view>

      <view class="goods-grid">
        <view
          class="goods-card"
          v-for="item in goodsList"
          :key="item.id"
          @tap="toDetail(item.id)"
        >
          <image :src="item.image || '/static/default.jpg'" mode="aspectFill" />
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="price">¥{{ item.price }}</text>
            <text class="sales">已售 {{ item.sales || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="goodsList.length === 0 && !loading" class="empty">
        <text>该店铺暂无商品上架~</text>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      <view v-if="noMore && goodsList.length > 0" class="no-more">
        <text>—— 没有更多了 ——</text>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from "@/api/user.js";
import productApi from "@/api/product.js";

export default {
  data() {
    return {
      shopId: 0,
      shopInfo: {},
      goodsList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: true,
      noMore: false,
    };
  },

  onLoad(e) {
    this.shopId = Number(e.id);
    if (!this.shopId) {
      uni.showToast({ title: "店铺ID错误", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1500);
      return;
    }
    this.loadShopInfo();
    this.loadGoods();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.page = 1;
    this.goodsList = [];
    this.noMore = false;
    this.loadGoods(() => {
      uni.stopPullDownRefresh();
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.noMore && !this.loading) {
      this.page++;
      this.loadGoods();
    }
  },

  methods: {
    async loadShopInfo() {
      try {
        const data = await userApi.getShopInfo(this.shopId);
        this.shopInfo = data || {};
        uni.setNavigationBarTitle({ title: data.name || "店铺详情" });
      } catch (err) {
        console.log("店铺信息加载失败", err);
      }
    },

    async loadGoods(callback) {
      this.loading = true;
      try {
        const res = await productApi.getProductsByShop({
          shopId: this.shopId,
          page: this.page,
          pageSize: this.pageSize,
        });

        const list = res.list || res || [];
        if (this.page === 1) {
          this.goodsList = list;
        } else {
          this.goodsList = this.goodsList.concat(list);
        }

        this.total = res.total || list.length;
        this.noMore = list.length < this.pageSize;
      } catch (err) {
        uni.showToast({ title: "加载商品失败", icon: "none" });
      } finally {
        this.loading = false;
        callback && callback();
      }
    },

    toDetail(id) {
      uni.navigateTo({ url: `/pages/common/goods-detail?id=${id}` });
    },
  },
};
</script>

<style lang="scss" scoped>
.shop-detail {
  background: $uni-bg-color-page;
  min-height: 100vh;
}

.shop-header {
  background: $uni-bg-color;
  padding: $uni-padding-lg;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid $uni-border-color-light;
  box-shadow: $uni-shadow-sm;
}
.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: $uni-border-radius-circle;
  margin-right: $uni-margin-base;
  background: $uni-bg-color-grey;
}
.info .name {
  font-size: $uni-font-size-h2;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  display: block;
}
.info .desc {
  font-size: $uni-font-size-base;
  color: $uni-text-color-secondary;
  margin: $uni-margin-xs 0;
  display: block;
}
.info .stats {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

.section-title {
  padding: $uni-padding-base;
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  background: $uni-bg-color;
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 $uni-padding-sm;
  background: $uni-bg-color-page;
}
.goods-card {
  width: 48%;
  margin: 2% 1%;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  overflow: hidden;
  box-shadow: $uni-shadow-card;
  transition: all $uni-transition-duration-base;
}
.goods-card:active {
  transform: translateY(4rpx);
  box-shadow: $uni-shadow-card-hover;
}
.goods-card image {
  width: 100%;
  height: 300rpx;
  background: $uni-bg-color-grey;
}
.goods-card .info {
  padding: $uni-padding-sm;
}
.goods-card .name {
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 80rpx;
  line-height: 40rpx;
}
.goods-card .price {
  color: $uni-color-price;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-bold;
  margin: $uni-spacing-xs 0;
}
.goods-card .sales {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
}

.empty,
.loading,
.no-more {
  text-align: center;
  padding: $uni-padding-xl 0;
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
}
</style>
