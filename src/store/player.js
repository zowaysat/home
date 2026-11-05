import { defineStore } from "pinia";

/**
 * 播放器状态：运行期数据，不做持久化。
 * “播放器设置”（自动播放 / 循环 / 顺序 / 歌词显示）属于 settings store。
 */
export const usePlayerStore = defineStore("player", {
  state: () => ({
    musicOpenState: false, // 音乐面板开启状态
    musicIsOk: false, // 音乐是否加载完成
    playerState: false, // 当前播放状态
    playerTitle: null, // 当前播放歌曲名
    playerArtist: null, // 当前播放歌手名
    playerLrc: "歌词加载中", // 当前播放歌词
  }),
  getters: {
    // 当前歌曲信息
    playerData(state) {
      return {
        name: state.playerTitle,
        artist: state.playerArtist,
      };
    },
  },
  actions: {
    // 设置播放 / 暂停状态
    setPlaying(value) {
      this.playerState = Boolean(value);
    },
    // 更改歌词
    setPlayerLrc(value) {
      this.playerLrc = value;
    },
    // 更改歌曲数据
    setPlayerData(title, artist) {
      this.playerTitle = title;
      this.playerArtist = artist;
    },
  },
});

export default usePlayerStore;
