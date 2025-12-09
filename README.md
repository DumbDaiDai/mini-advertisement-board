技术选型
- 框架：Nuxt v4（TypeScript）
- 路由：Nuxt约定式路由
- 状态：Pinia
- 图标库：Iconify
- 组件库：Element Plus
- 请求库：Axios
- 请求钩子：Vue Query
- 工具钩子：VueUse
- 工具函数：Lodash-es
- 打包工具：Vite

架构设计
前端
页面
- 登录页
负责输入账号密码，完成登录。登录态无效时前往登录页，并记忆尝试访问的路由，登陆成功后回溯。
- 列表页
负责组织各个组件。
组件
- 广告列表
负责组织广告卡片，并提供分页功能。
- 广告卡片
负责展示广告数据，提供操作对应广告的入口，包括编辑、复制、删除、跳转落地页。
- 顶部工具栏
负责提供操作广告列表的入口，包括新建广告、手动刷新列表。
- 广告编辑模态框
负责提供创建与设置广告的表单。
测试用服务端
使用Nuxt内置服务端功能完成，采用JSON文件持久化数据。
接口
- 登录登出
- 获取广告列表
支持分页，按照竞价权重排序。
- 获取广告详情
- 广告CRUD
复杂逻辑开发细节
- 导航守卫中间件
登录态无效时，回到登录页并通过URL query和encodeURIComponent暂存当前路由，成功登录后回溯。
```TypeScript
import { defineNuxtRouteMiddleware } from "#imports";
import { useAuthStore } from "~/stores/auth-store";

const NO_AUTH_ROUTE = ["/login"];

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return;
  }

  const { loggedIn } = useAuthStore();

  // 已登录状态自动进入
  if (loggedIn && to.path === "/login") {
    return navigateTo({ path: "/" });
  }

  // 未登录状态返回登录
  if (!loggedIn && !NO_AUTH_ROUTE.includes(to.path)) {
    return navigateTo({ path: "/login", query: { fromPath: encodeURIComponent(to.fullPath) } });
  }
});
```
- URL query状态维持钩子
能够记忆不同path下的url query，并以响应式的单例暴露，refresh前可持续记忆。当前优势并不明显，若继续开发更多页面，该钩子能够方便有效地管理不同页面的页码、筛选条件、搜索关键词等。
```TypeScript
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
```

- LRU表单编辑状态维持钩子
实质上是一个通用的LRU键值对持久化存储钩子。利用此钩子，即使广告未编辑完就出现页面刷新/页面关闭/服务器关闭等情况，编辑信息也能保留，并且会根据不同广告的ID，在不同路径下记忆数据，可设置最大记忆容量。
```TypeScript
import { useLocalStorage } from "@vueuse/core";
import { cloneDeep } from "lodash-es";
import { getCurrentInstance, onUnmounted, type Ref, ref } from "vue";

import { defineStore } from "#imports";

/** 键值对最大存储条目数 */
const MAX_MAP_SIZE = 10;

/** Last Recently Used Records 响应式对象非持久化Store */
const useLRURecordRefObjStore = defineStore("LRURecordRefObjStore", () => {
  const stores = ref<{
    [storeName: string]:
      | {
        /** 键-响应式对象 键值对 */
        refObjs: Map<number | string, Ref<Record<string, unknown>> | undefined>;
        /** 键-依赖响应式对象的组件的ID 集合 */
        dependencies: Set<number>;
      }
      | undefined;
  }>({});

  return { stores };
});

/** 使用Last Recently Used的方式管理一组持久化的键值对（Record）的存储，存储的Record数量超限时，最陈旧的Record将被移出存储。
 * 只要storeName和key相同，不同位置的use将访问到同一个响应式对象
 * @param storeName 类似于pinia的defineStore的第一个参数，区分不同的Last Recently Used Records的store
 * @param key Record的键
 * @param initialValue 如果key对应的Record值不存在，则使用此参数作为Record值
 */
export const useLRURecord = <T extends Record<string, unknown>>(
  storeName: string,
  key: number | string,
  initialValue: T
) => {
  /** 该store下对应的LRU keys 响应式localStorage值 */
  const storedKeys = useLocalStorage(`${storeName}LRUKeys`, [] as Array<number | string>);

  /** 该store下指定key对应的localStorage键名 */
  const localStorageKey = (recordKey: string | number) => `${storeName}${recordKey}`;
  /** 设置localStorage中该store下指定key对应的Record */
  const storeRecord = (keyToSet: string | number, value: Record<string, unknown>) => {
    localStorage.setItem(localStorageKey(keyToSet), JSON.stringify(value));
  };
  /** 从localStorage获取该store下指定key对应的Record */
  const getRecord = (keyToGet: string | number) => {
    /** localStorage存储的字符串形式的值 */
    const raw = localStorage.getItem(localStorageKey(keyToGet));
    // 对应localStorage不存在，返回undefined
    if (raw === null) {
      return undefined;
    }
    // 返回解析成Record的值
    return JSON.parse(raw);
  };
  /** 删除该store下指定key对应的localStorage */
  const delRecord = (keyToDel: string | number) => {
    localStorage.removeItem(localStorageKey(keyToDel));
  };

  const refObjStore = useLRURecordRefObjStore();
  if (!refObjStore.stores[storeName]) {
    refObjStore.stores[storeName] = { refObjs: new Map(), dependencies: new Set() };
  }

  /** 当前storeName当前key对应的Record响应式对象 */
  let LRURecordRef = refObjStore.stores[storeName].refObjs.get(key);

  // 当前storeName当前key对应的Record响应式对象不存在？
  if (!LRURecordRef) {
    // 深拷贝初值，防止地址引用
    const initialRefValue = cloneDeep(initialValue);
    // 读取存储的数据
    Object.assign(initialRefValue, getRecord(key));
    // 构造Record响应式对象
    LRURecordRef = ref<T>(initialRefValue) as Ref<T>;
    // 存入Record响应式对象
    refObjStore.stores[storeName].refObjs.set(key, LRURecordRef);
  }

  // 获取当前组件的实例
  const componentInstance = getCurrentInstance();
  if (componentInstance) {
    // 当前组件的ID不在依赖项集合中？
    if (!refObjStore.stores[storeName].dependencies.has(componentInstance.uid)) {
      // 组件卸载时
      onUnmounted(() => {
        if (!refObjStore.stores[storeName]) {
          return;
        }
        // 将当前组件的ID移出依赖项集合
        refObjStore.stores[storeName].dependencies.delete(componentInstance.uid);
        // 依赖项不为空，中断
        if (refObjStore.stores[storeName].dependencies.size > 0) {
          return;
        }
        // 回收响应式对象，释放内存
        refObjStore.stores[storeName].refObjs.delete(key);
      });
      // 将当前组件的ID放入依赖项集合中
      refObjStore.stores[storeName].dependencies.add(componentInstance.uid);
    }
  } else {
    throw new Error("只能在组件的同步逻辑中使用LRURecord，否则响应式变量无法回收");
  }

  /** 存储Record到localStorage中 */
  const storeLRURecord = () => {
    if (!refObjStore.stores[storeName]) {
      return;
    }

    // 存储Record
    storeRecord(key, LRURecordRef.value);
    // 从原有新鲜度升序数组中删除键，以防重复
    storedKeys.value = storedKeys.value.filter((currentKey: number | string) => currentKey !== key);
    // 将键追加到新鲜度升序数组末尾
    storedKeys.value.push(key);
    // 超出存储限制，删除最陈旧的条目
    if (storedKeys.value.length > MAX_MAP_SIZE) {
      // 获取要删除的键，同时将其移出新鲜度升序数组
      const keyToDelete = storedKeys.value.shift();
      if (!keyToDelete) {
        return;
      }
      // 删除最陈旧的键对应的Record
      delRecord(keyToDelete);
      // 回收响应式对象
      refObjStore.stores[storeName].refObjs.delete(keyToDelete);
    }
  };

  /** 从localStorage中删除Record */
  const deleteLRURecord = (keyToDelete: number | string = key) => {
    if (!refObjStore.stores[storeName]) {
      return;
    }

    // 删除Record
    delRecord(keyToDelete);
    // 回收响应式对象，释放内存
    refObjStore.stores[storeName].refObjs.delete(key);
    // 从新鲜度升序数组中删除键
    storedKeys.value = storedKeys.value.filter(
      (currentKey: number | string) => currentKey !== keyToDelete
    );
  };

  return {
    LRURecordRef,
    storeLRURecord,
    deleteLRURecord
  } as {
    LRURecordRef: Ref<T>;
    storeLRURecord: typeof storeLRURecord;
    deleteLRURecord: typeof deleteLRURecord;
  };
};
```