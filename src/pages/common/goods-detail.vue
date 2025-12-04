<!-- pages/common/goods-detail.vue -->
<template>
  <view class="detail-page">
    <!-- 轮播图 -->
    <swiper class="banner" indicator-dots autoplay interval="4000">
      <swiper-item v-for="(img, i) in images" :key="i">
        <image :src="img" mode="aspectFill" @tap="previewImage(i)" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="info">
      <view class="price-line">
        <text class="price">¥{{ goods.price }}</text>
        <text class="sales">已售 {{ goods.sales || 0 }} 件</text>
      </view>
      <text class="name">{{ goods.name }}</text>
    </view>

    <!-- 店铺信息（直接展示，不跳转！） -->
    <!-- 把原来的 shop-info 改成这样 -->
    <view class="shop-info" @tap="toShop(goods.shopId)">
      <image
        :src="shopInfo.avatar || '/static/shop-default.png'"
        class="avatar"
      />
      <view class="shop-right">
        <text class="shop-name">{{ shopInfo.name || "校园小店" }}</text>
        <text class="shop-desc">{{
          shopInfo.description || "优质商家，值得信赖"
        }}</text>
      </view>
      <text class="arrow">→</text>
    </view>

    <!-- 商品描述 -->
    <view class="section">
      <view class="section-title">商品详情</view>
      <view class="desc" v-html="goods.description || '暂无详细描述~'"></view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <button class="cart-btn" @tap="addCart">加入购物车</button>
      <button class="buy-btn" @tap="buyNow">立即购买</button>
    </view>
  </view>
</template>

<script>
import productApi from "@/api/product.js";
import userApi from "@/api/user.js";

export default {
  data() {
    return {
      id: 0,
      goods: {},
      images: [],
      shopInfo: {}, // 新增：店铺信息
    };
  },

  onLoad(e) {
    this.id = Number(e.id);
    if (!this.id) {
      uni.showToast({ title: "商品ID错误", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1500);
    } else {
      this.loadDetail();
    }
  },

  onReady() {
    this.$nextTick(() => {
      setTimeout(() => {
        // H5 延迟保险
      }, 150);
    });
  },

  methods: {
    async loadDetail() {
      try {
        const data = await productApi.getProductDetail(this.id);
        this.goods = data;

        // 处理图片
        if (data.image) {
          this.images = data.image.includes("|")
            ? data.image.split("|").filter(Boolean)
            : [data.image];
        }
        if (this.images.length === 0) this.images = ["/static/default.jpg"];

        // 设置标题
        uni.setNavigationBarTitle({ title: data.name || "商品详情" });

        // 关键！根据 shopId 查店铺信息
        if (data.shopId) {
          this.loadShopInfo(data.shopId);
        }
      } catch (err) {
        uni.showToast({ title: "商品不存在或已下架", icon: "none" });
        setTimeout(() => uni.navigateBack(), 1500);
      }
    },

    // 新增：加载店铺信息
    async loadShopInfo(shopId) {
      try {
        const shop = await userApi.getShopInfo(shopId);
        this.shopInfo = shop || {};
      } catch (err) {
        this.shopInfo = {
          name: "未知店铺",
          avatar: "/static/shop-default.png",
        };
      }
    },

    async addCart() {
      if (!uni.getStorageSync("token")) {
        uni.navigateTo({ url: "/pages/auth/login" });
        return;
      }
      try {
        await userApi.addToCart({ productId: this.id, num: 1 });
        uni.showToast({ title: "加入购物车成功", icon: "success" });
      } catch (err) {
        console.error("加入购物车失败:", err);
      }
    },

    buyNow() {
      if (!uni.getStorageSync("token")) {
        uni.navigateTo({ url: "/pages/auth/login" });
        return;
      }
      uni.navigateTo({ url: `/pages/user/order-confirm?ids=${this.id}` });
    },

    previewImage(current) {
      uni.previewImage({ current, urls: this.images });
    },
    // 关键！加上这个方法，就能点击店铺跳转了！
    toShop(shopId) {
      if (shopId) {
        uni.navigateTo({
          url: `/pages/common/shop-detail?id=${shopId}`,
        });
      } else {
        uni.showToast({
          title: "店铺信息异常",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-page {
  background: $uni-bg-color;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.banner {
  height: 750rpx;
  background: $uni-bg-color-grey;
}
.banner image {
  width: 100%;
  height: 100%;
}
.info {
  padding: $uni-padding-base;
  background: $uni-bg-color;
}
.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $uni-margin-sm;
}
.price {
  font-size: 48rpx;
  color: $uni-color-price;
  font-weight: $uni-font-weight-bold;
}
.sales {
  color: $uni-text-color-placeholder;
  font-size: $uni-font-size-base;
}
.name {
  font-size: $uni-font-size-xl;
  font-weight: $uni-font-weight-bold;
  color: $uni-text-color;
  display: block;
  line-height: $uni-line-height-base;
}

/* 店铺信息样式 */
.shop-info {
  display: flex;
  align-items: center;
  padding: $uni-padding-base;
  background: $uni-bg-color-grey;
  margin: $uni-margin-sm;
  border-radius: $uni-border-radius-lg;
  box-shadow: $uni-shadow-sm;
  transition: all $uni-transition-duration-base;
}
.shop-info:active {
  background: $uni-bg-color-hover;
}
.shop-info .avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: $uni-border-radius-circle;
  margin-right: $uni-margin-sm;
  background: $uni-bg-color-grey;
}
.shop-right {
  flex: 1;
}
.shop-name {
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  display: block;
}
.shop-desc {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-placeholder;
  margin-top: $uni-spacing-xs;
}
.arrow {
  color: $uni-border-color;
  font-size: 40rpx;
}

/* 商品详情 */
.section {
  margin: $uni-margin-sm;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  overflow: hidden;
  box-shadow: $uni-shadow-sm;
}
.section-title {
  padding: $uni-padding-base $uni-padding-base $uni-padding-sm;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  color: $uni-text-color;
  border-bottom: 2rpx solid $uni-border-color-light;
}
.desc {
  padding: $uni-padding-base;
  color: $uni-text-color-secondary;
  line-height: $uni-line-height-lg;
  font-size: $uni-font-size-base;
}
.desc image {
  max-width: 100% !important;
  height: auto !important;
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 100rpx;
  background: $uni-bg-color;
  box-shadow: $uni-shadow-lg;
  z-index: $uni-z-index-fixed;
}
.cart-btn {
  flex: 1;
  background: $uni-bg-color;
  color: $uni-text-color;
  font-size: $uni-font-size-lg;
  border-right: 1rpx solid $uni-border-color-light;
  transition: all $uni-transition-duration-base;
}
.cart-btn:active {
  background: $uni-bg-color-hover;
}
.buy-btn {
  flex: 1;
  background: $uni-color-primary-gradient;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-lg;
  font-weight: $uni-font-weight-semibold;
  transition: all $uni-transition-duration-base;
}
.buy-btn:active {
  background: $uni-color-primary-dark;
}
</style>
