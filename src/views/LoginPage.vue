<template>
  <div @click="bindLogin">Login</div>
</template>
<script setup lang="ts" name="login">
import { useUserStore } from "@/store";
import { useRouter } from "vue-router";
const router = useRouter();
const store = useUserStore();

const bindLogin = () => {
  store.bindLogin(true);
  console.log(store.login);
  router.push("/home");
};
</script>
