<template>
  <view class="add-goods-page">
    <view class="form-item">
      <text class="label">商品名称</text>
      <input v-model="form.name" class="input" placeholder="请输入商品名称" />
    </view>

    <view class="form-item">
      <text class="label">价格</text>
      <input
        v-model="form.price"
        class="input"
        type="number"
        placeholder="请输入价格"
      />
    </view>

    <view class="form-item">
      <text class="label">商品图片</text>

      <view class="upload-box" @tap="chooseImage">
        <image :src="form.image || '/static/default.jpg'" class="preview" />
      </view>
    </view>

    <button class="submit-btn" @click="submit">提交</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        price: "",
        image: "",
      },
    };
  },

  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          this.uploadImage(filePath);
        },
      });
    },

    uploadImage(filePath) {
      uni.showLoading({ title: "上传中..." });

      uni.uploadFile({
        url: "http://localhost:8080/merchant/upload",
        filePath,
        name: "file",
        header: {
          Authorization: "Bearer " + uni.getStorageSync("token"),
        },
        success: (res) => {
          uni.hideLoading();
          console.log("上传返回：", res);

          if (res.statusCode !== 200) {
            uni.showToast({ title: "上传失败", icon: "none" });
            return;
          }

          let url = res.data;
          try {
            const result = JSON.parse(res.data);
            url = result.data || result.url || res.data;
          } catch (e) {}

          this.form.image = url;
          uni.showToast({ title: "上传成功", icon: "success" });
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: "上传失败", icon: "none" });
          console.error(err);
        },
      });
    },

    submit() {
      if (!this.form.name || !this.form.price || !this.form.image) {
        return uni.showToast({ title: "请填写完整", icon: "none" });
      }

      uni.request({
        url: "http://localhost:8080/merchant/product",
        method: "POST",
        header: {
          Authorization: "Bearer " + uni.getStorageSync("token"),
          "Content-Type": "application/json",
        },
        data: this.form,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: "上架成功", icon: "success" });
            setTimeout(() => uni.navigateBack(), 1000);
          } else {
            uni.showToast({ title: res.data.msg || "上架失败", icon: "none" });
          }
        },
        fail: () => {
          uni.showToast({ title: "网络错误", icon: "none" });
        },
      });
    },
  },
};
</script>

<style>
.add-goods-page {
  padding: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  border: 1px solid #ddd;
  padding: 20rpx;
  border-radius: 10rpx;
}

.upload-box {
  width: 200rpx;
  height: 200rpx;
  border: 1px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview {
  width: 100%;
  height: 100%;
}

.submit-btn {
  background-color: #007aff;
  color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
}
</style>
