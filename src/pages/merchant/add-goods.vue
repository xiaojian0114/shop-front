<template>
  <view class="add-page">
    <input v-model="form.name" placeholder="商品名称" />
    <input v-model="form.price" placeholder="价格" type="digit" />
    <input v-model="form.stock" placeholder="库存" type="digit" />
    <textarea v-model="form.description" placeholder="商品描述" />

    <button @tap="uploadImage" class="upload-btn">
      {{ image ? "重新上传图片" : "上传商品图片" }}
    </button>
    <image v-if="image" :src="image" mode="widthFix" class="preview" />

    <button class="submit" @tap="submit">立即上架</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: { name: "", price: "", stock: "", description: "" },
      image: "",
    };
  },
  methods: {
    uploadImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.uploadFile({
            url: "http://localhost:8080/upload", // 你后端要加个上传接口
            filePath: res.tempFilePaths[0],
            success: (uploadRes) => {
              const url = JSON.parse(uploadRes.data).data;
              this.image = url;
            },
          });
        },
      });
    },
    submit() {
      if (!this.form.name || !this.form.price || !this.image) {
        return uni.showToast({ title: "请填写完整", icon: "none" });
      }
      uni.request({
        url: "http://localhost:8080/merchant/product",
        method: "POST",
        data: { ...this.form, image: this.image, isOnSale: 1 },
        header: { Authorization: "Bearer " + uni.getStorageSync("token") },
        success: () => {
          uni.showToast({ title: "上架成功", icon: "success" });
          setTimeout(
            () => uni.switchTab({ url: "/pages/merchant/shop" }),
            1000
          );
        },
      });
    },
  },
};
</script>
