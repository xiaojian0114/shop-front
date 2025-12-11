import { BASE_URL } from "./request";

/**
 * 图片上传工具函数
 * @param {string} filePath - 文件路径
 * @param {Object} options - 可选配置
 * @param {string} options.endpoint - 上传接口路径，默认为 "/merchant/upload"
 * @param {boolean} options.showLoading - 是否显示加载提示，默认为 true
 * @param {string} options.loadingText - 加载提示文字，默认为 "上传中..."
 * @returns {Promise<string>} 返回图片URL（OSS完整HTTPS地址）
 */
export function uploadImage(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      endpoint = "/merchant/upload",
      showLoading = true,
      loadingText = "上传中...",
    } = options;

    const token = uni.getStorageSync("token");

    if (showLoading) {
      uni.showLoading({ title: loadingText });
    }

    uni.uploadFile({
      url: `${BASE_URL}${endpoint}`,
      filePath,
      name: "file",
      header: {
        Authorization: "Bearer " + token,
      },
      success: (res) => {
        if (showLoading) {
          uni.hideLoading();
        }

        try {
          const data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
          if (data.code === 200) {
            // 后端已改为OSS，返回完整的HTTPS地址，直接使用
            // 格式：https://my-bucket-wyj.oss-cn-shanghai.aliyuncs.com/shop/xxx.jpg
            const imageUrl = data.data || data.url;
            if (imageUrl) {
              resolve(imageUrl);
            } else {
              uni.showToast({ title: "上传成功但未返回图片地址", icon: "none" });
              reject(new Error("未返回图片地址"));
            }
          } else {
            uni.showToast({ title: data.msg || "上传失败", icon: "none" });
            reject(new Error(data.msg || "上传失败"));
          }
        } catch (e) {
          console.error("解析上传响应失败:", e);
          uni.showToast({ title: "上传失败", icon: "none" });
          reject(new Error("解析响应失败"));
        }
      },
      fail: (err) => {
        if (showLoading) {
          uni.hideLoading();
        }
        uni.showToast({ title: "上传失败", icon: "none" });
        reject(err);
      },
    });
  });
}











