import { consoleError } from "../utils/debugger";
import { Storage } from "./types";

let storage: Storage | null = null;

export const initStorage = (customStorage: Storage) => {
  if (storage) {
    consoleError("have inited storage");
    throw new Error("have inited storage");
  }
  storage = customStorage;
};

export const getStorageItem = async (key: string) => {
  if (!storage) {
    consoleError("storage is not inited");
    throw new Error("storage is not inited when getStorageItem");
  }
  return await storage.get(key);
};

export const setStorageItem = async (key: string, value: any) => {
  if (!storage) {
    consoleError("storage is not inited");
    throw new Error("storage is not inited when setStorageItem");
  }
  return await storage.set(key, value);
};

export const appendStorageItem = async (key: string, value: any[]) => {
  if (!storage) {
    consoleError("storage is not inited");
    throw new Error("storage is not inited when appendStorageItem");
  }
  const oldData = (await storage.get(key)) || [];
  return await storage.set(key, [...oldData, ...value]);
};

export const deleteStorageItem = async (key: string) => {
  if (!storage) {
    consoleError("storage is not inited");
    throw new Error("storage is not inited when deleteStorageItem");
  }
  return await storage.delete(key);
};
