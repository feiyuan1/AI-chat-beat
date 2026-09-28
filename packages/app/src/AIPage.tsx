import {
  handleAIChatRequestMessage,
  Message,
  reportFailedLogs,
  reportFailedMetrics,
  reportStroageErrorLogs,
} from "@ai-chat-beat/common";
import { Button } from "@react-navigation/elements";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import originalInjected from "../injected.esbuild";
import { MessageType } from "./types";
import { saveDataOnDevice } from "./utils/chatDataStorage";

const injected = originalInjected as unknown as string;
const AIPage = () => {
  useEffect(() => {
    console.log("typeof inejcted:", typeof injected);
  }, []);

  // report errorlogs from injected and adapt
  useEffect(() => {
    reportStroageErrorLogs((logs) => {
      console.log("RN errorlogs", logs);
    });
  }, []);

  // report failedlogs and failedmetrics from report
  useEffect(() => {
    reportFailedLogs();
    reportFailedMetrics();
  }, []);

  const onMessage = async (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as unknown as Message;
      if (message.type === MessageType.INJECTED_ERROR_LOGS) {
        console.log("RN errorlogs from injected", message.payload);
        return;
      }
      await handleAIChatRequestMessage(message, {
        resolve: (result) => {
          saveDataOnDevice([result]);
          // ReportChatsMetrics({ chats: [result] });
          // ReportChatsLogs([result]);
        },
      });
    } catch (err) {
      console.error("handle message error: ", err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: "https://chat.deepseek.com/a/chat/s/12087204-b6a2-4d01-bf1a-9747fb8657cf",
        }}
        webviewDebuggingEnabled={true}
        injectedJavaScriptBeforeContentLoaded={injected}
        onMessage={onMessage}
      />
      <Button screen="Settings" params={{}} style={styles.button}>
        settings
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: "absolute",
    top: 50,
    right: 0,
  },
});

export default AIPage;
