import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    userInfo: null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
      uni.setStorageSync("token", token);
    },
    setUserInfo(info) {
      this.userInfo = info;
      uni.setStorageSync("userInfo", info);
    },
    async loadUserInfo() {
      try {
        const res = await uni.request({
          url: "http://localhost:8080/auth/info",
          header: { Authorization: "Bearer " + this.token },
        });

        if (res[1]?.data?.code === 200) {
          this.setUserInfo(res[1].data.data);
        }
      } catch {
        this.logout();
      }
    },
    logout() {
      this.token = "";
      this.userInfo = null;
      uni.removeStorageSync("token");
      uni.removeStorageSync("userInfo");
      uni.reLaunch({ url: "/pages/auth/login" });
    },
  },
});
