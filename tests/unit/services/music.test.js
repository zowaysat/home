import { describe, expect, it, vi } from "vitest";
import { getPlayerList } from "@/services/music";

const baseOptions = {
  api: "https://api.test",
  server: "netease",
  type: "playlist",
  id: "1",
};

describe("music service", () => {
  it("映射普通歌单字段", async () => {
    const request = vi
      .fn()
      .mockResolvedValue([{ name: "A", artist: "B", url: "u", cover: "c", lrc: "l" }]);
    const list = await getPlayerList({ ...baseOptions, request });
    expect(list).toEqual([{ name: "A", artist: "B", url: "u", cover: "c", lrc: "l" }]);
  });

  it("兼容 title/author/pic 字段", async () => {
    const request = vi
      .fn()
      .mockResolvedValue([{ title: "T", author: "Au", url: "u", pic: "p" }]);
    const list = await getPlayerList({ ...baseOptions, request });
    expect(list[0]).toMatchObject({ name: "T", artist: "Au", cover: "p" });
  });

  it("空歌单抛错", async () => {
    const request = vi.fn().mockResolvedValue([]);
    await expect(getPlayerList({ ...baseOptions, request })).rejects.toThrow("歌单为空");
  });

  it("缺少 API 配置抛错", async () => {
    await expect(
      getPlayerList({ ...baseOptions, api: "", request: vi.fn() }),
    ).rejects.toThrow("VITE_SONG_API");
  });

  it("JSONP 二次请求解析播放域名", async () => {
    const request = vi
      .fn()
      .mockResolvedValue([{ name: "A", url: "@x@y@z@https://jsonp.test" }]);
    const jsonp = vi.fn().mockResolvedValue({
      req_0: {
        data: {
          sip: ["http://ws.test", "https://sip.test"],
          midurlinfo: [{ purl: "/song.mp3" }],
        },
      },
    });

    const list = await getPlayerList({ ...baseOptions, request, jsonp });
    expect(jsonp).toHaveBeenCalledWith("https://jsonp.test");
    expect(list[0].url).toBe("https://sip.test/song.mp3");
  });

  it("JSONP 数据不完整抛错", async () => {
    const request = vi.fn().mockResolvedValue([{ name: "A", url: "@x@y@z@https://jsonp.test" }]);
    const jsonp = vi.fn().mockResolvedValue({});
    await expect(getPlayerList({ ...baseOptions, request, jsonp })).rejects.toThrow(
      "播放地址数据不完整",
    );
  });
});
