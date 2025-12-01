import request from "@/utils/request";

/**
 * 商家相关 API
 */
export default {
  /**
   * 获取商家信息（包含店铺信息）
   * @returns {Promise}
   */
  getMerchantInfo() {
    return request.get("/merchant/merchant/info");
  },

  /**
   * 获取订单统计
   * @returns {Promise}
   */
  getOrderStats() {
    return request.get("/merchant/order/stats");
  },

  /**
   * 获取我的店铺列表
   * @returns {Promise}
   */
  getMyShops() {
    return request.get("/merchant/shops");
  },

  /**
   * 申请开店
   * @param {Object} data - 店铺信息
   * @returns {Promise}
   */
  applyShop(data) {
    return request.post("/merchant/shop/apply", data);
  },

  /**
   * 获取店铺信息
   * @returns {Promise}
   */
  getShopInfo() {
    return request.get("/merchant/shop/info");
  },

  /**
   * 更新店铺信息
   * @param {Object} data - 店铺信息
   * @returns {Promise}
   */
  updateShop(data) {
    return request.post("/merchant/shop/update", data);
  },

  /**
   * 获取店铺详情
   * @param {number} id - 店铺ID
   * @returns {Promise}
   */
  getShopDetail(id) {
    return request.get(`/merchant/shop/detail/${id}`);
  },

  // 商品管理相关接口
  product: {
    /**
     * 获取店铺商品列表
     * @param {number} shopId - 店铺ID
     * @returns {Promise}
     */
    getList(shopId) {
      return request.get("/merchant/products", { shopId });
    },

    /**
     * 获取所有商品（包括下架）
     * @param {number} shopId - 店铺ID
     * @returns {Promise}
     */
    getAll(shopId) {
      return request.get("/merchant/products/all", { shopId });
    },

    /**
     * 搜索商品
     * @param {Object} params - 搜索参数
     * @param {number} params.shopId - 店铺ID
     * @param {string} params.keyword - 关键词
     * @param {number} params.status - 状态
     * @returns {Promise}
     */
    search(params) {
      return request.get("/merchant/product/search", params);
    },

    /**
     * 添加商品
     * @param {Object} data - 商品信息
     * @returns {Promise}
     */
    add(data) {
      return request.post("/merchant/product", data);
    },

    /**
     * 获取商品详情
     * @param {number} id - 商品ID
     * @returns {Promise}
     */
    getDetail(id) {
      return request.get(`/merchant/product/${id}`);
    },

    /**
     * 更新商品信息
     * @param {Object} data - 商品信息
     * @returns {Promise}
     */
    update(data) {
      return request.put("/merchant/product/update", data);
    },

    /**
     * 下架商品
     * @param {number} id - 商品ID
     * @returns {Promise}
     */
    offSale(id) {
      return request.put(`/merchant/product/off/${id}`);
    },

    /**
     * 上架商品
     * @param {number} id - 商品ID
     * @returns {Promise}
     */
    onSale(id) {
      return request.put(`/merchant/product/on/${id}`);
    },

    /**
     * 删除商品
     * @param {number} id - 商品ID
     * @returns {Promise}
     */
    delete(id) {
      return request.delete(`/merchant/product/${id}`);
    },
  },
};
