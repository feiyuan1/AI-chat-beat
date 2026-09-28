import { log, ReportChatsLogs, ReportChatsMetrics } from "@ai-chat-beat/common";
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
        title="Upload model config"
        onPress={async () => {
          const files = await DocumentPicker.getDocumentAsync({
            type: "application/json",
            multiple: false,
          });
          if (files && files.assets) {
            console.log("uploaded", files.assets[0].uri);
            const file = new File(files.assets[0].uri);
            console.log(JSON.parse(file.textSync()));
          }
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsPage;
