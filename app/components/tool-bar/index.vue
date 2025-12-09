<template>
  <div :class="styles.container">
    <el-button type="primary" @click="handleCreateClick()">
      新增广告
    </el-button>
    <el-button type="primary" @click="handleRefetchClick()">
      <Icon name="mdi:refresh" :size="28" />
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { ElButton } from "element-plus";

import type { ListBoardUrlQuery } from "~/service/types";

import { default as styles } from "./index.module.css";

const { urlQuery } = usePersistUrlQuery<ListBoardUrlQuery>();
const queryClient = useQueryClient();
const dialogStore = useDialogStore();

const handleCreateClick = () => {
  dialogStore.id = undefined;
  dialogStore.visible = true;
};

const handleRefetchClick = () => {
  queryClient.refetchQueries({ queryKey: ["list", urlQuery.value.page] });
};
</script>