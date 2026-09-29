import {
  consoleError,
  log,
  parseModelConfig,
  ReportChatsLogs,
  ReportChatsMetrics,
  saveLabelModelConfig,
} from "@ai-chat-beat/common";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Alert, Button, StyleSheet, View } from "react-native";
import {
  deleteDataFromDevice,
  readDataFromDevice,
} from "./utils/chatDataStorage";

const SettingsPage = () => {
  return (
    <View style={styles.container}>
      <Button
        title="Upload chat data"
        onPress={async () => {
          const chatData = readDataFromDevice();
          log("readDataFromDevice", chatData);
          if (!chatData.length) {
            return;
          }
          ReportChatsMetrics({ chats: chatData });
          ReportChatsLogs(chatData);
        }}
      />

      <Button
        title="clear chat data"
        onPress={() => {
          Alert.alert(
            "Confirm Deletion",
            "Delete all chat data? This cannot be undone.",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel",
              },
              { text: "Yes", onPress: deleteDataFromDevice },
            ],
          );
        }}
      />
      <Button
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
