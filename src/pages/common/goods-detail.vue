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
import request from "@/utils/request.js";

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
        const data = await request.get(`/user/product/${this.id}`);
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
        const shop = await request.get(`/user/shop/info/${shopId}`); // 你后端要有一个这个接口
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
        await request.post("/user/cart/add", { productId: this.id, num: 1 });
        uni.showToast({ title: "加入购物车成功", icon: "success" });
      } catch (err) {}
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

<style scoped>
.detail-page {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.banner {
  height: 750rpx;
}
.banner image {
  width: 100%;
  height: 100%;
}
.info {
  padding: 30rpx;
  background: #fff;
}
.price-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.price {
  font-size: 48rpx;
  color: #ff5500;
  font-weight: bold;
}
.sales {
  color: #999;
  font-size: 28rpx;
}
.name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  line-height: 1.4;
}

/* 店铺信息样式 */
.shop-info {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f8f9fb;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}
.shop-info .avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  background: #eee;
}
.shop-right {
  flex: 1;
}
.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.shop-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.arrow {
  color: #ddd;
  font-size: 40rpx;
}

/* 其他样式保持不变 */
.section {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.section-title {
  padding: 30rpx 30rpx 20rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  border-bottom: 2rpx solid #f0f0f0;
}
.desc {
  padding: 30rpx;
  color: #666;
  line-height: 52rpx;
  font-size: 30rpx;
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
  background: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
}
.cart-btn {
  flex: 1;
  background: #fff;
  color: #333;
  font-size: 32rpx;
}
.buy-btn {
  flex: 1;
  background: #ff5500;
  color: #fff;
  font-size: 32rpx;
}
</style>
