import { BASE_URL } from "./request";

/**
 * 处理图片URL，支持OSS、完整URL和相对路径
 * @param {string} imageUrl - 图片URL
 * @param {string} defaultImage - 默认图片路径，默认为 "/static/default.jpg"
 * @returns {string} 处理后的完整图片URL
 */
export function getImageUrl(imageUrl, defaultImage = "/static/default.jpg") {
  if (!imageUrl) return defaultImage;

  const url = imageUrl.trim();
  if (!url || url === "") return defaultImage;

  console.log("getImageUrl - 原始URL:", url);

  // 完整的 HTTP/HTTPS URL，直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log("getImageUrl - 完整URL，直接返回:", url);
    return url;
  }

  // OSS URL 检测（包含 oss-cn 或 aliyuncs.com）
  if (url.includes("oss-cn") || url.includes("aliyuncs.com")) {
    let finalUrl;
    // 如果以 // 开头，添加 https:
    if (url.startsWith("//")) {
      finalUrl = "https:" + url;
    } else {
      // 否则添加 https:// 前缀
      finalUrl = "https://" + url;
    }
    console.log("getImageUrl - OSS URL，处理后:", finalUrl);
    return finalUrl;
  }

  // 相对路径，拼接 BASE_URL
  const path = url.startsWith("/") ? url : "/" + url;
  const finalUrl = BASE_URL + path;
  console.log("getImageUrl - 相对路径，拼接后:", finalUrl);
  return finalUrl;
}

/**
 * 处理店铺logo URL
 * @param {string} logo - 店铺logo URL
 * @returns {string} 处理后的完整logo URL
 */
export function getShopLogoUrl(logo) {
  return getImageUrl(logo, "/static/default-shop.jpg");
}

/**
 * 处理商品图片 URL
 * @param {string} image - 商品图片 URL
 * @returns {string} 处理后的完整图片 URL
 */
export function getProductImageUrl(image) {
  return getImageUrl(image, "/static/default-product.jpg");
}

