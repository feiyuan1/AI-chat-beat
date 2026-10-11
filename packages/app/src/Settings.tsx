import {
  consoleError,
  log,
  parseModelConfig,
  ReportChatsMetrics,
  saveLabelModelConfig,
} from "@ai-chat-beat/common";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Alert, StyleSheet, View } from "react-native";
import ApiUserInfoForm from "./components/ApiUserInfoForm";
import OperationButton from "./components/OperationButton";
import { reportChats } from "./utils";
import {
  deleteDataFromDevice,
  readDataFromDevice,
} from "./utils/chatDataStorage";

const SettingsPage = () => {
  return (
    <View style={styles.container}>
      <OperationButton
        title="Upload chat data"
        onPress={() => {
          const chatData = readDataFromDevice();
          log("readDataFromDevice", chatData);
          if (!chatData.length) {
            Alert.alert("No chat data to upload");
            return;
          }
          return Promise.all([
            ReportChatsMetrics({ chats: chatData }),
            reportChats(chatData),
          ])
            .then(() => Alert.alert("Upload chat data success"))
            .catch(() => Alert.alert("Upload chat data failed"));
        }}
      />

      <OperationButton
        title="clear chat data"
        onPress={() => {
          return new Promise((res) => {
            Alert.alert(
              "Confirm Deletion",
              "Delete all chat data? This cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    res(deleteDataFromDevice());
                  },
                },
              ],
            );
          }).then(() => {
            Alert.alert("Clear chat data success");
          });
        }}
      />
      <OperationButton
        title="Upload model config"
        onPress={async () => {
          const files = await DocumentPicker.getDocumentAsync({
            type: "application/json",
            multiple: false,
          });
          if (files && files.assets) {
            const file = new File(files.assets[0].uri);
            const result = parseModelConfig(file.textSync());
            if (result.type === "error") {
              Alert.alert("Error", "error structure of selected json file");
              consoleError("parseModelConfig error", result.message);
              return;
            }
            await saveLabelModelConfig(result.config);
            Alert.alert("Success", "model config saved");
          }
        }}
      />
      <ApiUserInfoForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
  },
});

export default SettingsPage;
