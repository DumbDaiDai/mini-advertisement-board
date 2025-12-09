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
  const storeRecord = (keyToSet: string | number, value: Record<string, any>) => {
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
