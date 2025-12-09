<template>
  <el-dialog
    v-model="dialogStore.visible"
    :class="styles.dialog"
    :body-class="styles.container"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
    @close="handleCloseDialog()"
  >
    <el-form
      ref="AdFormRef"
      v-loading="fetchStatus === 'fetching'"
      :model="AdFormData"
      :rules="formRules"
      label-position="top"
      hide-required-asterisk
      scroll-to-error
      @submit.prevent
    >
      <el-form-item prop="title">
        <template #label>
          <el-text tag="b" size="large">
            广告标题
          </el-text>
        </template>
        <el-input
          v-model="AdFormData.title"
          :minlength="2"
          :maxlength="20"
          :autofocus="!AdFormData.title"
          placeholder="请输入广告标题"
          show-word-limit
          @input="handleAdEdited()"
        />
      </el-form-item>
      <el-form-item prop="publisher">
        <template #label>
          <el-text tag="b" size="large">
            广告发布人
          </el-text>
        </template>
        <el-input
          v-model="AdFormData.publisher"
          :minlength="1"
          :maxlength="20"
          placeholder="请输入广告发布人"
          show-word-limit
          @input="handleAdEdited()"
        />
      </el-form-item>
      <el-form-item prop="content">
        <template #label>
          <el-text tag="b" size="large">
            广告内容文案
          </el-text>
        </template>
        <el-input
          v-model="AdFormData.content"
          :autosize="{ minRows: 7 }"
          :minlength="1"
          :maxlength="500"
          type="textarea"
          resize="none"
          placeholder="请输入广告内容文案"
          show-word-limit
          @input="handleAdEdited()"
        />
      </el-form-item>
      <el-form-item prop="url">
        <template #label>
          <el-text tag="b" size="large">
            落地页
          </el-text>
        </template>
        <el-input
          v-model="AdFormData.url"
          :minlength="1"
          :maxlength="50"
          placeholder="请输入广告落地页"
          show-word-limit
          @input="handleAdEdited()"
        />
      </el-form-item>
      <el-form-item prop="url">
        <template #label>
          <el-text tag="b" size="large">
            出价
          </el-text>
        </template>
        <el-input-number
          v-model="AdFormData.price"
          :min="0"
          :precision="2"
          :step="1"
          placeholder="请输入广告出价"
          controls-position="right"
          @input="handleAdEdited()"
        />
      </el-form-item>
    </el-form>
    <div :class="styles.bottomButtons">
      <el-button
        type="info"
        plain
        @click="handleCloseDialog()"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="handleConfirmClick()"
      >
        {{ isNewAd ? "创建" : "修改" }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElMessage, ElMessageBox, type FormRules } from "element-plus";
import { toRef, useTemplateRef, watch } from "vue";

import { getDetail, postCreateAd, putEditAd } from "~/service/api";
import type { AdvertisementSetting } from "~/service/types";

import type { ListBoardUrlQuery } from "../list-board/types";
import styles from "./index.module.css";

const dialogStore = useDialogStore();
const { urlQuery } = usePersistUrlQuery<ListBoardUrlQuery>();
const queryClient = useQueryClient();

const {
  LRURecordRef: AdFormData,
  storeLRURecord: storeAd,
  deleteLRURecord: deleteAdFormData
} = useLRURecord(
  "AdEditor",
  dialogStore.id ?? "new",
  {
    id: dialogStore.id ?? -1,
    title: "",
    publisher: "",
    content: "",
    url: "",
    price: 0
  } as AdvertisementSetting
);

const isNewAd = (dialogStore.id as string | undefined) === undefined;

const isAdFormDataEmpty = () =>
  !AdFormData.value.title && !AdFormData.value.content && !AdFormData.value.publisher && !AdFormData.value.url && !AdFormData.value.price;

const AdFormRef = useTemplateRef("AdFormRef");
const formRules: FormRules = {
  title: [
    {
      required: true,
      message: "请输入广告标题",
      trigger: "blur",
      whitespace: true
    }
  ],
  publisher: [
    {
      message: "请输入广告发布人",
      trigger: "blur",
      required: true,
      whitespace: true
    }
  ],
  content: [
    {
      message: "请输入广告内容文案",
      trigger: "blur",
      required: true,
      whitespace: true
    }
  ],
  url: [
    {
      message: "请输入广告落地页",
      trigger: "blur",
      required: true,
      whitespace: true
    }
  ],
  price: [
    {
      message: "请输入出价",
      trigger: "blur",
      required: true,
      min: 0
    }
  ]
};

if (!isNewAd && !isAdFormDataEmpty()) {
  ElMessageBox({
    title: "未保存的内容",
    message: "上次编辑的内容未保存。要恢复吗？",
    confirmButtonText: "恢复",
    cancelButtonText: "放弃",
    cancelButtonClass: "el-button--danger",
    showCancelButton: true,
    showClose: false,
    closeOnClickModal: false,
    draggable: true
  })
    .catch(() => {
      deleteAdFormData();
      refetch();
    });
}

const {
  data: AdRemoteData,
  fetchStatus,
  dataUpdatedAt,
  refetch
} = useQuery({
  queryKey: ["detail", toRef(() => dialogStore.id)] as const,
  queryFn: ({ queryKey }) =>
    getDetail({
      id: queryKey[1] ?? 0
    }),
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  enabled: !isNewAd && isAdFormDataEmpty()
});

const handleAdEdited = () => {
  if (isAdFormDataEmpty()) {
    deleteAdFormData();
    return;
  }
  storeAd();
};

const handleCloseDialog = () => {
  dialogStore.visible = false;
  queryClient.refetchQueries({ queryKey: ["list", urlQuery.value.page] });
};

const IsValidatingFailed = async (): Promise<boolean> => {
  let res = false;
  await AdFormRef.value?.validate((pass, invalidFields) => {
    if (!pass && invalidFields) {
      for (const field of Object.keys(invalidFields)) {
        if (invalidFields[field]) {
          ElMessage.error({ message: invalidFields[field][0]?.message });
        }
      }
      res = true;
    }
  });
  return res;
};

const handleConfirmClick = () => {
  ElMessageBox({
    title: "确认",
    message: dialogStore.id ? "确认修改？" : "确认创建？",
    showCancelButton: true,
    draggable: true
  }).then(async () => {
    if (await IsValidatingFailed()) {
      return;
    }
    if (dialogStore.id) {
      editAd();
    } else {
      createAd();
    }
  });
};

const { mutate: createAd } = useMutation({
  mutationFn: () =>
    postCreateAd({
      title: AdFormData.value.title,
      content: AdFormData.value.content,
      url: AdFormData.value.url,
      price: AdFormData.value.price,
      publisher: AdFormData.value.publisher
    }),
  onSuccess: () => {
    ElMessage.success("创建成功");
    deleteAdFormData();
    handleCloseDialog();
    queryClient.refetchQueries({ queryKey: ["list", urlQuery.value.page] });
  },
  onError: (err) => {
    ElMessage.error(err.message || "创建失败");
  }
});

const { mutate: editAd } = useMutation({
  mutationFn: () =>
    putEditAd({
      id: dialogStore.id ?? 0,
      title: AdFormData.value.title,
      content: AdFormData.value.content,
      url: AdFormData.value.url,
      price: AdFormData.value.price,
      publisher: AdFormData.value.publisher
    }),
  onSuccess: () => {
    ElMessage.success("编辑成功");
    deleteAdFormData();
    handleCloseDialog();
    queryClient.refetchQueries({ queryKey: ["list", urlQuery.value.page] });
  },
  onError: (err) => {
    ElMessage.error(err.message || "编辑失败");
  }
});

watch(dataUpdatedAt, () => {
  if (AdRemoteData.value) {
    AdFormData.value.title = AdRemoteData.value.title;
    AdFormData.value.content = AdRemoteData.value.content;
    AdFormData.value.publisher = AdRemoteData.value.publisher;
    AdFormData.value.url = AdRemoteData.value.url;
    AdFormData.value.price = AdRemoteData.value.price;
  }
});
</script>
