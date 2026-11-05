import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlayerStore } from "@/store/player";
import { useUiStore } from "@/store/ui";

describe("ui store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("默认状态全部关闭", () => {
    const ui = useUiStore();
    expect(ui.imgLoadStatus).toBe(false);
    expect(ui.backgroundShow).toBe(false);
    expect(ui.boxOpenState).toBe(false);
    expect(ui.mobileOpenState).toBe(false);
    expect(ui.mobileFuncState).toBe(false);
    expect(ui.setOpenState).toBe(false);
  });

  it("setImgLoadStatus 会把值转成布尔", () => {
    const ui = useUiStore();
    ui.setImgLoadStatus("yes");
    expect(ui.imgLoadStatus).toBe(true);
    ui.setImgLoadStatus(0);
    expect(ui.imgLoadStatus).toBe(false);
  });

  it("closePanels 只关闭盒子与设置", () => {
    const ui = useUiStore();
    ui.boxOpenState = true;
    ui.setOpenState = true;
    ui.mobileOpenState = true;

    ui.closePanels();

    expect(ui.boxOpenState).toBe(false);
    expect(ui.setOpenState).toBe(false);
    expect(ui.mobileOpenState).toBe(true);
  });

  it("closeMobilePanels 只关闭移动端菜单", () => {
    const ui = useUiStore();
    ui.mobileOpenState = true;
    ui.mobileFuncState = true;
    ui.boxOpenState = true;

    ui.closeMobilePanels();

    expect(ui.mobileOpenState).toBe(false);
    expect(ui.mobileFuncState).toBe(false);
    expect(ui.boxOpenState).toBe(true);
  });
});

describe("player store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("默认状态", () => {
    const player = usePlayerStore();
    expect(player.musicOpenState).toBe(false);
    expect(player.musicIsOk).toBe(false);
    expect(player.playerState).toBe(false);
    expect(player.playerLrc).toBe("歌词加载中");
    expect(player.playerData).toEqual({ name: null, artist: null });
  });

  it("setPlaying 会把值转成布尔", () => {
    const player = usePlayerStore();
    player.setPlaying(1);
    expect(player.playerState).toBe(true);
    player.setPlaying(0);
    expect(player.playerState).toBe(false);
  });

  it("setPlayerData 同时更新 getter", () => {
    const player = usePlayerStore();
    player.setPlayerData("歌名", "歌手");
    expect(player.playerData).toEqual({ name: "歌名", artist: "歌手" });
  });

  it("setPlayerLrc 更新歌词", () => {
    const player = usePlayerStore();
    player.setPlayerLrc("第一句");
    expect(player.playerLrc).toBe("第一句");
  });
});
