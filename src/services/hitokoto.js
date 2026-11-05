import { requestJson } from "./http";

export const HITOKOTO_URL = "https://v1.hitokoto.cn";

/**
 * 一言数据规范化：接口字段不可信，统一成 { text, from }
 */
export const normalizeHitokoto = (data) => {
  if (!data || typeof data.hitokoto !== "string" || !data.hitokoto.trim()) {
    throw new Error("一言接口返回的数据格式不正确");
  }
  return {
    text: data.hitokoto.trim(),
    from: typeof data.from === "string" && data.from.trim() ? data.from.trim() : "無名",
  };
};

export const getHitokoto = async ({ request = requestJson } = {}) => {
  return normalizeHitokoto(await request(HITOKOTO_URL));
};
