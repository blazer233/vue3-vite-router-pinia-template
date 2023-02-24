<template>
  <div @click="upDemo" class="">HeaderCom---{{ demo.count }}</div>
</template>
<script setup lang="ts">
import { useDemoStore } from "@/store";
const demo = useDemoStore();
const upDemo = () => demo.increment();
</script>
