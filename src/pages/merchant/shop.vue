<template>
  <view class="container">
    <view class="apply-section">
      <button class="apply-btn" @tap="applyShop">+ 申请新店铺</button>
    </view>

    <view class="shop-list" v-if="shops && shops.length > 0">
      <view class="section-title">我的店铺 ({{ shops.length }})</view>
      <view class="shop-cards">
        <view class="shop-card" v-for="item in shops" :key="item.id">
          <view class="card-header">
            <image
              :src="item.logo || '/static/default-shop.jpg'"
              class="logo"
            />
            <view class="shop-info">
              <text class="name">{{ item.name }}</text>
              <text
                class="status"
                :class="item.status === 1 ? 'success' : 'pending'"
              >
                {{ item.status === 1 ? "已通过" : "审核中" }}
              </text>
            </view>
          </view>
          <view class="card-actions">
            <button
              size="mini"
              type="primary"
              v-if="item.status === 1"
              @tap="editShop(item)"
              class="action-btn"
            >
              编辑
            </button>
            <button
              size="mini"
              v-if="item.status === 1"
              @tap="viewShop(item)"
              class="action-btn secondary"
            >
              查看
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 还没有店铺时的友好提示 -->
    <view class="empty" v-if="!shops || shops.length === 0">
      <image src="/static/empty-shop.png" class="empty-img" />
      <text class="empty-text">你还没有店铺，快去申请一个吧~</text>
    </view>

    <!-- 编辑弹窗 -->
    <view class="modal" v-if="showEdit" @tap="showEdit = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">编辑店铺</text>
        <view class="form-item">
          <text class="label">店铺名称</text>
          <input
            v-model="editForm.name"
            placeholder="请输入店铺名称"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="label">店铺头像</text>
          <view class="logo-preview" @tap="chooseLogo">
            <image
              :src="editForm.logo || '/static/default-shop.jpg'"
              class="preview-img"
            />
            <text class="change-tip">点击更换</text>
          </view>
        </view>
        <view class="modal-actions">
          <button @tap="showEdit = false" class="cancel-btn">取消</button>
          <button class="confirm-btn" @tap="submitEdit">保存</button>
        </view>
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
      shops: [],
      currentPath: "",
      isMerchant: false,
      showEdit: false,
      currentEditShop: null,
      editForm: {
        id: "",
        name: "",
        logo: "",
      },
    };
  },
  onLoad() {
    this.init();
  },
  onShow() {
    this.init();
  },
  methods: {
    init() {
      const userInfo = uni.getStorageSync("userInfo");
      this.isMerchant = userInfo?.role === "merchant";
      const pages = getCurrentPages();
      this.currentPath = pages[pages.length - 1].route;
      this.loadShops();
    },
    goTo(path) {
      uni.reLaunch({ url: path });
    },
    loadShops() {
      uni.request({
        url: "http://localhost:8080/merchant/shops",
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: (res) => {
          if (res.data.code === 200) {
            this.shops = res.data.data || [];
          }
        },
      });
    },
    applyShop() {
      uni.navigateTo({ url: "/pages/merchant/apply-shop" });
    },
    editShop(shop) {
      console.log("编辑店铺:", shop);

      // 修复：确保正确设置编辑表单数据
      this.editForm = {
        id: shop.id,
        name: shop.name || "",
        logo: shop.logo || "",
      };

      this.currentEditShop = shop;
      this.showEdit = true;

      // 添加一个小延迟确保DOM更新
      setTimeout(() => {
        console.log("编辑表单数据:", this.editForm);
      }, 100);
    },
    viewShop(shop) {
      uni.navigateTo({ url: `/pages/merchant/shop-detail?id=${shop.id}` });
    },
    chooseLogo() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showLoading({
            title: "上传中...",
          });

          uni.uploadFile({
            url: "http://localhost:8080/merchant/upload",
            filePath: res.tempFilePaths[0],
            name: "file",
            header: {
              Authorization: "Bearer " + uni.getStorageSync("token"),
            },
            success: (r) => {
              uni.hideLoading();
              console.log("上传返回:", r);

              try {
                const data =
                  typeof r.data === "string" ? JSON.parse(r.data) : r.data;
                if (data.code === 200) {
                  this.editForm.logo = data.data;
                  uni.showToast({
                    title: "上传成功",
                    icon: "success",
                  });
                } else {
                  uni.showToast({
                    title: data.msg || "上传失败",
                    icon: "none",
                  });
                }
              } catch (e) {
                console.error("解析上传结果失败:", e);
                uni.showToast({
                  title: "上传失败",
                  icon: "none",
                });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              console.error("上传失败:", err);
              uni.showToast({
                title: "上传失败",
                icon: "none",
              });
            },
          });
        },
      });
    },
    submitEdit() {
      if (!this.editForm.name.trim()) {
        return uni.showToast({
          title: "请输入店铺名",
          icon: "none",
        });
      }

      console.log("提交编辑:", this.editForm);

      uni.request({
        url: "http://localhost:8080/merchant/shop/update",
        method: "POST",
        header: {
          Authorization: "Bearer " + uni.getStorageSync("token"),
          "Content-Type": "application/json",
        },
        data: {
          id: this.editForm.id,
          name: this.editForm.name,
          logo: this.editForm.logo,
        },
        success: (res) => {
          console.log("编辑返回:", res);
          if (res.data.code === 200) {
            uni.showToast({
              title: "修改成功",
              icon: "success",
            });
            this.showEdit = false;
            this.loadShops();
          } else {
            uni.showToast({
              title: res.data.msg || "修改失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("编辑失败:", err);
          uni.showToast({
            title: "修改失败",
            icon: "none",
          });
        },
      });
    },
  },
};
</script>

<style scoped>
/* 页面基础布局 */
.container {
  padding: 30rpx;
  padding-bottom: 140rpx;
  min-height: 100vh;
  background: #f5f7fa;
}

/* 申请新店铺区域 */
.apply-section {
  margin-bottom: 40rpx;
  text-align: center;
}

.apply-btn {
  background: linear-gradient(135deg, #ff8d4d, #ff6b35);
  color: #fff;
  padding: 24rpx 50rpx;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
  width: 100%;
  max-width: 400rpx;
}

/* 店铺列表区域 */
.shop-list {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  padding-left: 10rpx;
  border-left: 8rpx solid #ff6b35;
}

.shop-cards {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.shop-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  transition: all 0.3s ease;
}

.shop-card:active {
  transform: translateY(4rpx);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 25rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  object-fit: cover;
  flex-shrink: 0;
}

.shop-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.status {
  font-size: 26rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.status.success {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.status.pending {
  background: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.action-btn {
  padding: 14rpx 30rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 120rpx;
}

.action-btn.secondary {
  background: #f1f1f1;
  color: #666;
  border: 1rpx solid #e5e5e5;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-img {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 40rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  line-height: 1.5;
}

/* ================= 编辑弹窗 ================= */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease-out;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

.modal-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
}

/* 表单项 */
.form-item {
  margin-bottom: 40rpx;
}

.label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 18rpx;
  display: block;
  font-weight: 500;
}

.form-input {
  width: 100%;
  border: 2rpx solid #e5e5e5;
  background: #fafafa;
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #ff6b35;
}

/* 头像预览区域 */
.logo-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: #f2f2f2;
  overflow: hidden;
  position: relative;
  margin-top: 10rpx;
  border: 2rpx dashed #e5e5e5;
  cursor: pointer;
  transition: all 0.3s;
}

.logo-preview:active {
  transform: scale(0.98);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-tip {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  text-align: center;
  font-size: 24rpx;
  padding: 10rpx 0;
}

/* 按钮组 */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
  gap: 20rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.cancel-btn {
  background: #f1f1f1;
  color: #666;
}

.confirm-btn {
  background: #ff6b35;
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
}

/* 弹窗动画 */
@keyframes fadeIn {
  from {
    background: rgba(0, 0, 0, 0);
  }
  to {
    background: rgba(0, 0, 0, 0.5);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(60rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ================= 商家底栏 ================= */
.merchant-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #fff;
  display: flex;
  justify-content: space-around;
  border-top: 1rpx solid #eaeaea;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
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
  width: 44rpx;
  height: 44rpx;
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

  .shop-card {
    padding: 25rpx;
  }

  .modal {
    padding: 20rpx;
  }
}
</style>
