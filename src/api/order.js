import request from "@/utils/request";

/**
 * 订单相关 API
 */
export default {
  /**
   * 支付订单
   * @param {Object} data - 支付数据
   * @param {string} data.orderNo - 订单号
   * @returns {Promise}
   */
  payOrder(data) {
    return request.post("/user/order/pay", data);
  },

  /**
   * 提交订单
   * @param {Object} data - 订单数据
   * @param {Array} data.productIds - 商品ID数组
   * @param {string} data.address - 收货地址
   * @param {string} data.nickname - 收货人姓名
   * @param {string} data.phone - 联系电话
   * @returns {Promise}
   */
  submitOrder(data) {
    return request.post("/user/order/submit", data);
  },

  /**
   * 获取商家订单列表
   * @returns {Promise}
   */
  getMerchantOrders() {
    return request.get("/merchant/orders");
  },

  /**
   * 获取订单详情（商家）
   * @param {number} orderId - 订单ID
   * @returns {Promise}
   */
  getOrderDetail(orderId) {
    return request.get(`/merchant/order/${orderId}`);
  },

  /**
   * 发货
   * @param {number} orderId - 订单ID
   * @returns {Promise}
   */
  deliverOrder(orderId) {
    return request.put(`/merchant/order/deliver/${orderId}`);
  },

  /**
   * 用户确认收货
   * @param {number} orderId - 订单ID
   * @returns {Promise}
   */
  confirmReceipt(orderId) {
    console.log("API调用 - 确认收货，订单ID:", orderId);
    console.log("API调用 - 请求路径:", `/user/order/receive/${orderId}`);
    return request.put(`/user/order/receive/${orderId}`, {}, { loading: false });
  },
};
