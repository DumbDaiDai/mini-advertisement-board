<template>
  <el-card :class="styles.card" :body-class="styles.container" @click="handleViewAdUrl()">
    <div :class="styles.head">
      <el-text tag="b">
        {{ props.title }}
      </el-text>
      <el-dropdown trigger="click">
        <el-button type="primary" @click.stop>
          操作
        </el-button>
        <template #dropdown>
          <el-dropdown-menu @click.stop>
            <el-dropdown-item @click="handleEditClick()">
              编辑广告
            </el-dropdown-item>
            <el-dropdown-item @click="handleCopyClick()">
              复制广告
            </el-dropdown-item>
            <el-dropdown-item @click="handleDeleteClick()">
              删除广告
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div :class="styles.main">
      <el-text :line-clamp="3">
        {{ props.content }}
      </el-text>
    </div>
    <div :class="styles.bottom">
      <el-text type="danger">
        热度:{{ props.hot }}
      </el-text>
      <el-text tag="primary">
        出价:{{ props.price }}
      </el-text>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ElButton, ElCard, ElDropdown, ElDropdownItem, ElDropdownMenu, ElText } from "element-plus";

import { deleteAdvertisement, postCopyAdvertisement, putViewAdvertisement } from "~/service/api";
import type { Advertisement, ListBoardUrlQuery } from "~/service/types";

import { default as styles } from "./index.module.css";

const props = defineProps<Advertisement>();

const { urlQuery } = usePersistUrlQuery<ListBoardUrlQuery>();
const queryClient = useQueryClient();
const dialogStore = useDialogStore();

const handleDeleteClick = () => {
  ElMessageBox({
    title: "确认删除",
    message: "确认删除此广告？删除后不可恢复！",
    showCancelButton: true,
    confirmButtonClass: "el-button--danger",
    draggable: true
  }).then(() => {
    deleteAd();
  });
};

const { mutate: deleteAd } = useMutation({
  mutationFn: () =>
    deleteAdvertisement({
      id: props.id
    }),
  onSuccess: () => {
    ElMessage.success("删除成功");
    queryClient.refetchQueries({ queryKey: ["list", toRef(() => urlQuery.value.page)] });
  },
  onError: (err) => {
    ElMessage.error(err.message || "删除失败");
  }
});

const handleCopyClick = () => {
  ElMessageBox({
    title: "确认复制",
    message: "确认复制此广告？",
    showCancelButton: true,
    draggable: true
  }).then(() => {
    copyAd();
  });
};

const { mutate: copyAd } = useMutation({
  mutationFn: () =>
    postCopyAdvertisement({
      id: props.id
    }),
  onSuccess: () => {
    ElMessage.success("复制成功");
    queryClient.refetchQueries({ queryKey: ["list", toRef(() => urlQuery.value.page)] });
  },
  onError: (err) => {
    ElMessage.error(err.message || "复制失败");
  }
});

const handleEditClick = () => {
  dialogStore.id = props.id;
  dialogStore.visible = true;
};

const { mutate: handleViewAdUrl } = useMutation({
  mutationFn: () =>
    putViewAdvertisement({
      id: props.id
    }),
  onSuccess: () => {
    queryClient.refetchQueries({ queryKey: ["list", toRef(() => urlQuery.value.page)] });
    window.open(props.url, "_blank", "noopener,noreferrer");
  }
});
</script>