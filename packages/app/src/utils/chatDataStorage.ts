import { log } from "@ai-chat-beat/common";
import { File, Paths } from "expo-file-system";
import { Alert } from "react-native";

const CHAT_FILE_URL = "chat_data.jsonl";

type Chat = any;

const chatsToJsonl = (chats: Chat[]) => {
  return chats.map((chat) => JSON.stringify(chat)).join("\n");
};

const jsonlToChats = (jsonl: string) => {
  return jsonl.split("\n").map((line) => JSON.parse(line) as Chat);
};

export const saveDataOnDevice = (chats: Chat[]) => {
  const data = chatsToJsonl(chats);
  const file = new File(Paths.document, CHAT_FILE_URL);
  file.write(data);
  Alert.alert("save success");
  log("saveDataOnDevice", file.textSync());
};

export const readDataFromDevice = () => {
  const file = new File(Paths.document, CHAT_FILE_URL);
  const jsonl = file.textSync();
  return jsonlToChats(jsonl);
};

export const deleteDataFromDevice = () => {
  const file = new File(Paths.document, CHAT_FILE_URL);
  file.delete();
  Alert.alert("delete success");
};
