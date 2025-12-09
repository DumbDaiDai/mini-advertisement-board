<template>
  <div :class="styles.container">
    <Icon :class="styles.logoIcon" name="ic:round-logo-dev" :size="30" />
    <el-text :class="styles.productName" type="primary" tag="b">
      广告墙
    </el-text>

    <el-button
      v-if="isShowLogout"
      :key="route.path"
      :class="styles.logoutButton"
      type="info"
      @click="handleLogoutClick()"
    >
      登出
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { ElButton, ElMessage, ElMessageBox, ElText } from "element-plus";

import { useRoute } from "#imports";
import { postLogout } from "~/service/api";

import { default as styles } from "./index.module.css";

const route = useRoute();
const isShowLogout = computed(() => route.path !== "/login") ;

/** 点击登出 */
const handleLogoutClick = () => {
  ElMessageBox({
    title: "登出",
    message: "确认退出登录？",
    showCancelButton: true
  })
    .then(() => {
      mutateLogout();
    })
    .catch();
};

// 登出
const { mutate: mutateLogout } = useMutation({
  mutationFn: postLogout,
  onSuccess: () => {
    ElMessage.success("已登出");
    useAuthStore().$reset();
    navigateTo("/login");
  },
  onError: (err) => {
    ElMessage.error(`登出失败 ${ err.message}`);
  }
});
</script>