// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt"
  ],
  css: [
    "@/assets/global.css",
    "element-plus/dist/index.css"
  ],
  piniaPersistedstate: {
    storage: "localStorage"
  }
});