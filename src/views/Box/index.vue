<template>
  <div class="box cards">
    <button
      type="button"
      class="close plain-button"
      aria-label="关闭盒子"
      @click="ui.boxOpenState = false"
    >
      <close-one theme="filled" size="28" fill="#ffffff60" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="setting plain-button"
      aria-label="打开全局设置"
      @click="ui.setOpenState = true"
    >
      <setting-two theme="filled" size="28" fill="#ffffff60" aria-hidden="true" />
    </button>
    <div class="content">
      <!-- 可在此处自定义任意内容 -->
      <TimeCapsule />
      <MoreContent />
    </div>
  </div>
</template>

<script setup>
import { CloseOne, SettingTwo } from "@icon-park/vue-next";
import { useUiStore } from "@/store";
import TimeCapsule from "@/components/TimeCapsule.vue";
import MoreContent from "@/components/MoreContent.vue";

const ui = useUiStore();
</script>

<style lang="scss" scoped>
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: 80%;
  max-width: 50%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    display: block;
    // 默认隐藏但保留在 Tab 顺序中，hover 或键盘 focus 时显示
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.3s,
      opacity 0.3s;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  &:hover,
  &:focus-within {
    .close,
    .setting {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .setting {
    right: 56px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 30px;
    width: 100%;
    height: 100%;
  }
}
</style>
