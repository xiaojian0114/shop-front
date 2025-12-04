import request from "@/utils/request";

/**
 * 商品相关 API
 */
export default {
  /**
   * 获取商品列表
   * @returns {Promise}
   */
  getProductList() {
    return request.get("/user/products");
  },

  /**
   * 搜索商品
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 关键词
   * @returns {Promise}
   */
  searchProducts(params) {
    return request.get("/user/products/search", params);
  },

  /**
   * 获取商品详情
   * @param {number} id - 商品ID
   * @returns {Promise}
   */
  getProductDetail(id) {
    return request.get(`/user/product/${id}`);
  },

  /**
   * 获取热门商品
   * @returns {Promise}
   */
  getHotProducts() {
    return request.get("/user/products/hot");
  },

  /**
   * 获取推荐商品
   * @returns {Promise}
   */
  getRecommendedProducts() {
    return request.get("/user/products/recommended");
  },

  /**
   * 获取店铺商品列表
   * @param {Object} params - 查询参数
   * @param {number} params.shopId - 店铺ID
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise}
   */
  getProductsByShop(params) {
    return request.get("/user/products", params);
  },
};
