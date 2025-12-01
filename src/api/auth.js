import request from "@/utils/request";

/**
 * 认证相关 API
 */
export default {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.phone - 手机号
   * @param {string} data.password - 密码
   * @returns {Promise}
   */
  login(data) {
    return request.post("/auth/login", data);
  },

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.phone - 手机号
   * @param {string} data.password - 密码
   * @param {string} data.role - 角色 (user/merchant)
   * @returns {Promise}
   */
  register(data) {
    return request.post("/auth/register", data);
  },

  /**
   * 退出登录
   * @returns {Promise}
   */
  logout() {
    return request.post("/auth/logout");
  },

  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo() {
    return request.get("/auth/info");
  },
};
