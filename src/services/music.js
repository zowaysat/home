import fetchJsonp from "fetch-jsonp";
import { requestJson } from "./http";

const defaultJsonp = (url) => fetchJsonp(url).then((response) => response.json());

/**
 * 单首歌曲规范化：兼容 Meting 不同字段命名
 */
export const normalizeSong = (song = {}) => ({
  name: song.name || song.title || "未知歌曲",
  artist: song.artist || song.author || "未知歌手",
  url: song.url || "",
  cover: song.cover || song.pic || "",
  lrc: song.lrc || "",
});

export const normalizePlaylist = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("音乐接口返回的歌单为空");
  }
  return data.map(normalizeSong);
};

/**
 * 获取歌单。
 * QQ 音乐等场景接口返回 `@` 开头的 JSONP 地址，需要二次请求解析播放域名。
 */
export const getPlayerList = async ({
  api,
  server = "netease",
  type = "playlist",
  id,
  request = requestJson,
  jsonp = defaultJsonp,
} = {}) => {
  if (!api) {
    throw new Error("未配置 VITE_SONG_API");
  }
  if (!id) {
    throw new Error("未配置 VITE_SONG_ID");
  }

  const url = `${api}?server=${encodeURIComponent(server)}&type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
  const data = await request(url);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("音乐接口返回的歌单为空");
  }

  const firstUrl = data[0]?.url;
  if (typeof firstUrl !== "string") {
    throw new Error("音乐接口返回的数据格式不正确");
  }

  if (!firstUrl.startsWith("@")) {
    return normalizePlaylist(data);
  }

  const [, , , jsonpUrl] = firstUrl.split("@").slice(1);
  if (!jsonpUrl) {
    throw new Error("音乐接口返回的 JSONP 地址无效");
  }

  const jsonpData = await jsonp(jsonpUrl);
  const req = jsonpData?.req_0?.data;
  const sip = req?.sip;
  const midurlinfo = req?.midurlinfo;
  if (!Array.isArray(sip) || sip.length === 0 || !Array.isArray(midurlinfo)) {
    throw new Error("音乐接口返回的播放地址数据不完整");
  }

  const domain = (sip.find((item) => !item.startsWith("http://ws")) || sip[0]).replace(
    "http://",
    "https://",
  );

  return data.map((song, index) =>
    normalizeSong({ ...song, url: domain + (midurlinfo[index]?.purl || "") }),
  );
};
