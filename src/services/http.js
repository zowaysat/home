/**
 * 统一的 HTTP 请求封装。
 * 设计目标：
 * - 超时可控（默认 10s），通过 AbortController 实现，兼容旧浏览器；
 * - HTTP 非 2xx 统一抛 HttpError，方便调用方区分"网络错误 / 业务错误"；
 * - fetch 实现可注入（fetchImpl），便于单元测试。
 */
export const REQUEST_TIMEOUT = 10_000;

export class HttpError extends Error {
  constructor(message, { status = null, url = null, cause } = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
    if (cause) this.cause = cause;
  }
}

export const requestJson = async (url, options = {}) => {
  const { timeout = REQUEST_TIMEOUT, fetchImpl = globalThis.fetch } = options;
  if (typeof fetchImpl !== "function") {
    throw new HttpError("当前环境不支持 fetch", { url });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) {
      throw new HttpError(`请求失败（HTTP ${response.status}）：${url}`, {
        status: response.status,
        url,
      });
    }
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new HttpError(`请求超时（${timeout}ms）：${url}`, { url, cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};
