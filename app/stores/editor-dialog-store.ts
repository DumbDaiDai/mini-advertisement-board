import { ref } from "vue";

import { defineStore } from "#imports";

export const useDialogStore = defineStore("dialog", () => {
  const visible = ref(false);
  const id = ref<number | undefined>(undefined);
  return { visible, id };
});
