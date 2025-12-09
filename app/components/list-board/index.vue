<template>
  <div :class="styles.container">
    <div v-if="listData?.list?.length" :class="styles.notEmpty">
      <div v-loading="fetchStatus === 'fetching'" :class="styles.scroll">
        <div :class="styles.cardList">
          <div
            v-for="(item) in listData.list"
            :key="item.id"
            :class="styles.card"
          >
            <advertise-card
              :id="item.id"
              :title="item.title"
              :content="item.content"
              :hot="item.hot"
              :price="item.price"
              :url="item.url"
              :publisher="item.publisher"
            />
          </div>
        </div>
      </div>
      <div :class="styles.pagination">
        <el-pagination
          v-if="listData?.list?.length"
          v-model:current-page="urlQuery.page"
          :class="styles.paginationTool"
          :page-size="CAPACITY"
          :pager-count="7"
          :total="listData?.total"
          size="large"
        />
      </div>
    </div>
    <div v-else :class="styles.empty">
      <el-empty description="暂无广告" :image-size="200" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { ElEmpty, ElPagination } from "element-plus";

import AdvertiseCard from "~/components/advertisement-card/index.vue";
import { getAdvertisementList } from "~/service/api";

import type { ListBoardUrlQuery } from "../../service/types";
import { default as styles } from "./index.module.css";

const { urlQuery, initializeUrlQuery } = usePersistUrlQuery<ListBoardUrlQuery>();

const CAPACITY = 8;

// 初始化url query
initializeUrlQuery({
  typeExample: {
    page: 0
  },
  initialValue: {
    page: 1
  }
});

const {
  data: listData,
  fetchStatus,
  dataUpdatedAt
} = useQuery({
  queryKey: ["list", toRef(() => urlQuery.value.page), CAPACITY] as const,
  queryFn: ({ queryKey }) =>
    getAdvertisementList({
      pageIndex: queryKey[1],
      capacity: queryKey[2]
    }),
  placeholderData: keepPreviousData
});

watch(dataUpdatedAt, () => {
  if (!listData.value) {
    return;
  }
  const maxPage = Math.ceil(listData.value.total / CAPACITY);
  if (urlQuery.value.page > maxPage) {
    urlQuery.value.page = maxPage;
  }
  if (urlQuery.value.page < 1) {
    urlQuery.value.page = 1;
  }
});
</script>