const BASE_URL = "http://121.4.51.19:8080";
// const BASE_URL = "http://localhost:8080";

// 导出 BASE_URL 供其他模块使用
export { BASE_URL };

// 全局请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 自动注入 token
    const token = uni.getStorageSync("token");
    const header = {
      "Content-Type": "application/json",
      ...options.header,
    };
    if (token) {
      header["Authorization"] = "Bearer " + token;
    }

    // 显示 loading
    if (options.loading !== false) {
      uni.showLoading({ title: "加载中...", mask: true });
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header,
      success: (res) => {
        uni.hideLoading();

        if (res.statusCode === 401) {
          // token 过期或无效，强制跳登录
          uni.removeStorageSync("token");
          uni.removeStorageSync("userInfo");
          uni.showToast({ title: "登录已过期", icon: "none" });

          setTimeout(() => {
            if (process.env.NODE_ENV === "development") {
              history.replaceState(null, "", "#/pages/auth/login");
              location.reload();
            } else {
              uni.reLaunch({ url: "/pages/auth/login" });
            }
          }, 1000);
          return;
        }

        if (res.data.code === 200) {
          resolve(res.data.data || res.data);
        } else {
          uni.showToast({ title: res.data.msg || "请求失败", icon: "none" });
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
};

// 常用方法
export default {
  get(url, data = {}, options = {}) {
    return request({ url, method: "GET", data, ...options });
  },
  post(url, data = {}, options = {}) {
    return request({ url, method: "POST", data, ...options });
  },
  put(url, data = {}, options = {}) {
    return request({ url, method: "PUT", data, ...options });
  },
  delete(url, data = {}, options = {}) {
    return request({ url, method: "DELETE", data, ...options });
  },
};
