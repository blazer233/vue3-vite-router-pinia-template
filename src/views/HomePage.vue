<script setup lang="ts" name="home">
import SidebarCom from "@/components/sidebarCom.vue";
import HeaderCom from "@/components/HeaderCom.vue";
</script>
<template>
  <HeaderCom />
  <SidebarCom />
  <div class="content-box">
    <div class="content">
      <router-view v-slot="{ Component }">
        <transition name="move" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>
