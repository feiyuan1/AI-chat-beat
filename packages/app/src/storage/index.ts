import { consoleError, STORAGE_KEY } from "@ai-chat-beat/common";
import { createAsyncStorage } from "@react-native-async-storage/async-storage";

const partKeyPrefix = "@___PART___";
const partKeyPrefixRxp = /^@___PART___/;
const keySplit = ",";
const limit = 500000;
const storage = createAsyncStorage(STORAGE_KEY);

type StorageOriginalData = Record<string, string>;

/**
 * save 操作时，拆分数据；
 * 单次存储大小最多为 2MB（Android），受制于 Android 系统读取数据库时使用的 WindowCursor 缓冲区；
 * 超出上限会导致存储、读取存储失败
 */
const buildData = (key: string, value: any, datas: StorageOriginalData) => {
  let valueStr = JSON.stringify(value);
  if (valueStr.length <= limit) {
    datas[key] = valueStr;
    return;
  }

  const partKeys = [];
  for (let i = 0, len = Math.floor(valueStr.length / limit); i <= len; i++) {
    let partKey = `${partKeyPrefix}${key}${i}`;
    partKeys.push(partKey);
    datas[partKey] = valueStr.substring(i * limit, (i + 1) * limit);
  }
  datas[key] = `${partKeyPrefix}${partKeys.join(keySplit)}`;
};

const handleGetData = async <T>(partKeys: string): Promise<T> => {
  const keys = partKeys.replace(partKeyPrefixRxp, "").split(keySplit);

  return storage.getMany(keys).then((datas) => {
    return JSON.parse(Object.values(datas).join(""));
  });
};

export const saveData = async (key: string, value: any) => {
  const datas: StorageOriginalData = {};
  buildData(key, value, datas);

  try {
    await storage.setMany(datas);
  } catch (e: any) {
    // saving error
    consoleError("storage error[saveData]:", key, e.message);
    throw e;
  }
};

export const getData = async <T = unknown>(key: string): Promise<T | null> => {
  let value: string | null;
  try {
    value = await storage.getItem(key);
  } catch (e: any) {
    // error reading value
    consoleError("storage error[getData]:", key, e.message);
    throw e;
  }
  if (value && partKeyPrefixRxp.test(value)) {
    return handleGetData<T>(value);
  } else if (value == null) return value;
  return JSON.parse(value);
};

export const removeData = async (key: string) => {
  let value: string | null;
  try {
    value = await storage.getItem(key);
  } catch (e: any) {
    // error reading value
    consoleError("storage error[removeData]:", key, e.message);
    throw e;
  }
  if (value && partKeyPrefixRxp.test(value)) {
    let partKeys = value.replace(partKeyPrefixRxp, "").split(keySplit);
    partKeys.push(key);
    try {
      await storage.removeMany(partKeys);
    } catch (e: any) {
      // remove error
      consoleError("storage error[removeData]:", key, e.message);
      throw e;
    }
  } else {
    try {
      await storage.removeItem(key);
    } catch (e: any) {
      // remove error
      consoleError("storage error[removeData]:", key, e.message);
      throw e;
    }
  }
};
