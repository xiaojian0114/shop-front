import { useUserStore } from "@/stores/user";

export function initApp() {
  const userStore = useUserStore();

  const token = uni.getStorageSync("token");
  if (token) {
    userStore.loadUserInfo();
  }
}
