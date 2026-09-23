import {
  handleAIChatRequestMessage,
  Message,
  reportStroageErrorLogs,
} from "@ai-chat-beat/common";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import originalInjected from "../injected.esbuild";
import { MessageType } from "./types";

const injected = originalInjected as unknown as string;
const AIPage = () => {
  useEffect(() => {
    console.log("typeof inejcted:", typeof injected);
  }, []);

  useEffect(() => {
    reportStroageErrorLogs((logs) => {
      console.log("RN errorlogs", logs);
    });
  }, []);

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as unknown as Message;
      if (message.type === MessageType.INJECTED_ERROR_LOGS) {
        console.log("RN errorlogs from injected", message.payload);
        return;
      }
      handleAIChatRequestMessage(message, {
        resolve: (result) => {
          console.log("resolve", result);
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
    </View>
  );
};

AIPage.options = {
  topBar: {
    title: {
      text: "历史记录",
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AIPage;
