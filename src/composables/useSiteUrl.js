import { computed } from "vue";
import config, { normalizeSiteUrl } from "@/config";

/**
 * 站点域名解析（原逻辑在 Message / Right / MoreSet / Footer 中重复了 4 份）。
 * 返回 computed：{ host, primary, suffix, href }
 */
export const useSiteUrl = (url = config.site.url) => {
  return computed(() => normalizeSiteUrl(url));
};

export default useSiteUrl;
