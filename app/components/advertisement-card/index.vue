<template>
  <el-card :class="styles.card" :body-class="styles.container">
    <div :class="styles.head">
      <el-text tag="b">
        {{ props.title }}
      </el-text>
      <el-dropdown trigger="click">
        <el-button type="primary">
          操作
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>编辑广告</el-dropdown-item>
            <el-dropdown-item>复制广告</el-dropdown-item>
            <el-dropdown-item>删除广告</el-dropdown-item>
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
import { ElButton, ElCard, ElDropdown, ElDropdownItem, ElDropdownMenu, ElText } from "element-plus";

import type { AdvertisementOverview } from "~/service/types";

import { default as styles } from "./index.module.css";

const props = defineProps<AdvertisementOverview>();
</script>