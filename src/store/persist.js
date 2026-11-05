/**
 * 持久化配置与旧数据迁移。
 *
 * 版本策略：持久化 key 自带版本号（`home:state:v1`）。字段发生破坏性变更时：
 * 1. 新建 key（如 `home:state:v2`），在本文件补一条迁移函数；
 * 2. 迁移成功后删除旧 key，避免脏数据长期残留。
 *
 * 历史版本：早期把整个 main store 的部分字段存在 key `data` 下（pinia-plugin-persistedstate
 * 默认 key 为 store id）。v1 起只持久化“设置”store，并把旧 `data` 平滑迁移过来。
 */

/** 当前持久化 key（带版本号） */
export const PERSIST_KEY = "home:state:v1";

/** 早期版本的持久化 key */
export const LEGACY_PERSIST_KEY = "data";

/** settings store 中允许持久化的字段 */
export const SETTINGS_PERSIST_PATHS = Object.freeze([
  "coverType",
  "musicVolume",
  "siteStartShow",
  "musicClick",
  "playerLrcShow",
  "footerBlur",
  "playerAutoplay",
  "playerLoop",
  "playerOrder",
]);

/** 壁纸种类白名单 */
const COVER_TYPES = Object.freeze(["0", "1", "2", "3"]);

/** 枚举字段白名单 */
const ENUM_FIELDS = Object.freeze({
  playerLoop: ["all", "one", "none"],
  playerOrder: ["list", "random"],
});

/** 布尔字段白名单 */
const BOOLEAN_FIELDS = Object.freeze([
  "siteStartShow",
  "musicClick",
  "playerLrcShow",
  "footerBlur",
  "playerAutoplay",
]);

const isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isBoolean = (value) => typeof value === "boolean";
const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * 过滤 + 纠偏设置数据：只保留已知字段，非法值丢弃（由 store 默认值兜底）。
 * @param {unknown} input
 * @returns {Record<string, unknown>}
 */
export const sanitizeSettings = (input) => {
  if (!isPlainObject(input)) return {};
  const result = {};

  if (COVER_TYPES.includes(input.coverType)) result.coverType = input.coverType;

  if (isFiniteNumber(input.musicVolume)) {
    result.musicVolume = Math.min(1, Math.max(0, input.musicVolume));
  }

  for (const key of BOOLEAN_FIELDS) {
    if (isBoolean(input[key])) result[key] = input[key];
  }

  for (const [key, allowed] of Object.entries(ENUM_FIELDS)) {
    if (allowed.includes(input[key])) result[key] = input[key];
  }

  return result;
};

/** 是否包含至少一个已知设置字段（用于识别“确实是本站旧数据”） */
const hasKnownField = (input) => Object.keys(sanitizeSettings(input)).length > 0;

const safeGetItem = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeSetItem = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
  } catch {
    // 隐私模式 / 配额不足：持久化失败不应阻塞应用
  }
};

const safeRemoveItem = (storage, key) => {
  try {
    storage?.removeItem(key);
  } catch {
    // 同上
  }
};

/** 内存版 storage：localStorage 不可用时的兜底，同时方便单测 */
export const createMemoryStorage = () => {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    get length() {
      return map.size;
    },
  };
};

/**
 * 获取可用的 storage：优先 localStorage（可写），否则回退内存实现。
 * 在 Node / SSR 环境下同样安全。
 */
export const createStorage = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const probe = "__home_storage_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    // 忽略，走内存兜底
  }
  return createMemoryStorage();
};

/**
 * 把旧 key `data` 迁移到 `home:state:v1`。
 *
 * - 新 key 已存在：不覆盖，返回 false；
 * - 旧数据不存在 / 非 JSON / 不含任何已知字段：不处理，返回 false；
 * - 迁移成功：写入过滤后的设置并删除旧 key，返回 true。
 *
 * @param {{ getItem(k: string): string | null, setItem(k: string, v: string): void, removeItem(k: string): void }} [storage]
 * @returns {boolean} 是否发生了迁移
 */
export const migrateLegacyState = (storage = createStorage()) => {
  if (safeGetItem(storage, PERSIST_KEY) !== null) return false;

  const legacyRaw = safeGetItem(storage, LEGACY_PERSIST_KEY);
  if (!legacyRaw) return false;

  let legacy;
  try {
    legacy = JSON.parse(legacyRaw);
  } catch {
    return false;
  }

  // key `data` 过于通用：只有确实包含本应用设置字段时才认为是旧数据
  if (!hasKnownField(legacy)) return false;

  safeSetItem(storage, PERSIST_KEY, JSON.stringify(sanitizeSettings(legacy)));
  safeRemoveItem(storage, LEGACY_PERSIST_KEY);
  return true;
};

export default {
  PERSIST_KEY,
  LEGACY_PERSIST_KEY,
  SETTINGS_PERSIST_PATHS,
  sanitizeSettings,
  createStorage,
  createMemoryStorage,
  migrateLegacyState,
};
