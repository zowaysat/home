import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * 全局单一时钟：所有调用方共享同一个 ref 与同一个 1s 定时器，
 * 替代原先 Func / TimeCapsule 各自 setInterval 的做法。
 */
const now = ref(new Date());
let timer = null;
let subscribers = 0;

const start = () => {
  if (timer) return;
  now.value = new Date();
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
};

const stop = () => {
  if (subscribers > 0 || !timer) return;
  clearInterval(timer);
  timer = null;
};

export const useNow = () => {
  onMounted(() => {
    subscribers += 1;
    start();
  });
  onBeforeUnmount(() => {
    subscribers -= 1;
    stop();
  });
  return now;
};

/** 只读访问当前时间（测试或非组件场景使用） */
export const getNow = () => now;

export default useNow;
