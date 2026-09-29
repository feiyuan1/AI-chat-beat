import {
  initStorage,
  reportChatsWithLabel,
  Storage,
} from "@ai-chat-beat/common";
import { StorePayload } from "@ai-chat-beat/common/src/adapter/types";
import { Alert } from "react-native";
import { getData, removeData, saveData } from "../storage";

export const createLocalStorage = (): Storage => {
  return {
    get: async (key: string) => {
      return await getData(key);
    },
    set: async (key: string, value: string) => {
      await saveData(key, value);
    },
    delete: async (key: string) => {
      await removeData(key);
    },
  };
};

export const initLocalStorage = () => {
  initStorage(createLocalStorage());
};

export const reportChats = (chats: StorePayload[]) => {
  reportChatsWithLabel(chats, () => {
    Alert.alert("missing model config");
  });
};
