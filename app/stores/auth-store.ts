import { defineStore } from "#imports";

export const useAuthStore = defineStore("login", {
  state: () => ({
    loggedIn: false
  }),
  persist: true
});
