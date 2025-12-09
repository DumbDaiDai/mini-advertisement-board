<template>
  <div :class="styles.container">
    <div :class="styles.toolbar">
      <tool-bar />
    </div>
    <div :class="styles.main">
      <list-board />
    </div>
    <editor-dialog :key="`${dialogStore.visible}`" />
  </div>
</template>

<script setup lang="ts">
import EditorDialog from "~/components/editor-dialog/index.vue";
import ListBoard from "~/components/list-board/index.vue";
import ToolBar from "~/components/tool-bar/index.vue";

import { default as styles } from "./index.module.css";

const dialogStore = useDialogStore();

useSeoMeta({ title: "广告墙" });
</script>
