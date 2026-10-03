import {
  consoleError,
  CreateMonitorLog,
  handleAIChatRequestMessage,
  Message,
  MonitorLogType,
  Platform,
  reportFailedLogs,
  reportFailedMetrics,
  reportLogs,
  reportStroageErrorLogs,
  storeFailedLogs,
} from "@ai-chat-beat/common";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import originalInjected from "../injected.esbuild";
import PlatformSwitcher, { platforms } from "./components/PlatformSwitcher";
import { MessageType } from "./types";
import { saveDataOnDevice } from "./utils/chatDataStorage";

const injected = originalInjected as unknown as string;
const AIPage = () => {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [current, setCurrent] = useState<Platform>(Platform.deepseek);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      // 减掉底部安全区，避免多顶一截
      const h = Math.max(0, e.endCoordinates.height - insets.bottom);
      setKeyboardHeight(h);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(insets.bottom);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // report errorlogs from injected and adapt
  useEffect(() => {
    reportStroageErrorLogs((logs) => {
      return reportLogs(logs, true);
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
        reportLogs(message.payload);
        return;
      }
      await handleAIChatRequestMessage(message, {
        resolve: (result) => {
          saveDataOnDevice([result]);
        },
      });
    } catch (err) {
      const errorLog = CreateMonitorLog(
        `handle message error ${err}`,
        MonitorLogType.uncaught_error,
      );
      storeFailedLogs([errorLog]);
      consoleError("handle message error: ", err);
    }
  };

  const uri: string = useMemo(() => {
    return platforms.find((p) => p.name === current)!.url;
  }, [current]);

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri,
        }}
        style={{ marginBottom: keyboardHeight }}
        webviewDebuggingEnabled={true}
        injectedJavaScriptBeforeContentLoaded={injected}
        onMessage={onMessage}
      />
      <PlatformSwitcher current={current} updateCurrent={setCurrent} />
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
