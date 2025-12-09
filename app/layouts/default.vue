<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :class="$style.page">
    <div :class="$style.headBar">
      <head-bar />
    </div>
    <div :class="$style.main">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import HeadBar from "~/components/head-bar/index.vue";
</script>

<style lang="css" module>
.page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .headBar {
    flex-shrink: 0;
    flex-basis: 50px;
  }

  .main {
    background-color: #efefef;
    height: 0;
    flex-grow: 1;
  }
}
</style>