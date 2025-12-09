import { type Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { defineStore, navigateTo } from "#imports";

/** Store */
const useUrlQueryStore = defineStore("urlQuery", () => {
  /** path-url query 关联表 */
  const persistMap = ref(new Map<string, Record<string, string>>());
  /** path-响应式对象 关联表 */
  const refObj = ref(new Map<string, Ref>());
  return { persistMap, refObj };
});

/** url query对象 成员类型转化 */
const transformUrlQueryType = <T extends Record<string, unknown>>(
  obj: Record<string, unknown>,
  typeExample: Partial<T>
) => {
  for (const key of Object.keys(obj)) {
    switch (typeof typeExample[key]) {
      case "string":
        obj[key] = String(obj[key]);
        break;
      case "number":
        obj[key] = parseInt(String(obj[key]));
        break;
      case "boolean":
        obj[key] = Boolean(obj[key]);
    }
  }
};

/** 选项 */
interface initializeUrlQueryOptions<T> {
  /** 符合类型定义的对象实例（用于初始化时的类型转化） */
  typeExample?: Partial<T>;
  /** 初始值
   * @default {}
   */
  initialValue?: T;
}

/** 使用Hook */
export const usePersistUrlQuery = <T extends Record<string, unknown> = Record<string, string | string[]>>() => {
  const urlQueryStore = useUrlQueryStore();
  // 获取当前页面的path
  const currentPath = useRoute().path;

  /** 当前页面对应的url query响应式对象 */
  let urlQuery = urlQueryStore.refObj.get(currentPath);

  // 当前页面对应的响应式对象不存在？
  if (!urlQuery) {
    // 构造响应式对象
    urlQuery = ref<T>();
    // 存入响应式对象
    urlQueryStore.refObj.set(currentPath, urlQuery);
  }

  /** 初始化url query */
  const initializeUrlQuery = (options: initializeUrlQueryOptions<T> = {}) => {
    // 解包传入的参数并设置默认值
    const { initialValue = {}, typeExample } = options;

    // 获取当前页面的url query
    const currentSearchParams = new URLSearchParams(window.location.search || "");
    const currentValue: Record<string, unknown> = {};
    for (const query of currentSearchParams.keys()) {
      // 参数唯一则原样获取，否则以数组形式获取
      currentValue[query] =
        currentSearchParams.getAll(query).length > 1
          ? currentSearchParams.getAll(query)
          : currentSearchParams.get(query);
    }
    // 合并缓存的url query
    Object.assign(initialValue, urlQueryStore.persistMap.get(currentPath));

    // 合并当前的url query
    Object.assign(initialValue, currentValue);

    // 类型转化
    if (typeExample) {
      transformUrlQueryType<T>(initialValue, typeExample);
    }

    // 侦听url query响应式对象变化
    watch(
      urlQuery,
      (newVal) => {
        // 更新缓存状态
        urlQueryStore.persistMap.set(currentPath, newVal);

        // 更新地址栏url query
        navigateTo({ query: newVal }, { replace: true });
      },
      { deep: true }
    );

    // 设置url query初值
    const urlQueryRef = urlQueryStore.refObj.get(currentPath);
    if (urlQueryRef) {
      urlQueryRef.value = initialValue;
    }
  };

  return { urlQuery, initializeUrlQuery } as {
    urlQuery: Ref<T>;
    initializeUrlQuery: typeof initializeUrlQuery;
  };
};
