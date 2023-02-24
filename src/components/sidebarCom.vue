<template>
  <div @click="increment">sidebarCom----{{ state }}</div>
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Ref } from "vue";

const state: Ref<number> = ref(0);
const increment = () => {
  state.value += 1;
  nextTick(() => {
    // 访问更新后的 DOM
  });
};
</script>
