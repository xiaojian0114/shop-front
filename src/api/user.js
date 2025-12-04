import request from "@/utils/request";

/**
 * 用户相关 API
 */
export default {
  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo() {
    return request.get("/user/info");
  },

  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @param {number} params.status - 订单状态
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  getOrderList(params) {
    return request.get("/user/order/list", params);
  },

  /**
   * 获取购物车列表
   * @returns {Promise}
   */
  getCartList() {
    return request.get("/user/cart");
  },

  /**
   * 添加商品到购物车
   * @param {Object} data - 商品数据
   * @param {number} data.productId - 商品ID
   * @param {number} data.num - 数量
   * @returns {Promise}
   */
  addToCart(data) {
    return request.post("/user/cart/add", data);
  },

  /**
   * 删除购物车商品
   * @param {Object} data - 删除数据
   * @param {number} data.productId - 商品ID
   * @returns {Promise}
   */
  deleteCartItem(data) {
    return request.post("/user/cart/delete", data);
  },

  /**
   * 批量删除购物车商品
   * @param {Array} productIds - 商品ID数组
   * @returns {Promise}
   */
  batchDeleteCartItems(productIds) {
    return Promise.all(
      productIds.map((productId) =>
        request.post("/user/cart/delete", { productId })
      )
    );
  },

  /**
   * 更新购物车商品数量
   * @param {Object} data - 更新数据
   * @param {number} data.productId - 商品ID
   * @param {number} data.num - 数量
   * @returns {Promise}
   */
  updateCartItem(data) {
    return request.post("/user/cart/add", data);
  },

  /**
   * 获取店铺信息
   * @param {number} shopId - 店铺ID
   * @returns {Promise}
   */
  getShopInfo(shopId) {
    return request.get(`/user/shop/info/${shopId}`);
  },
};
