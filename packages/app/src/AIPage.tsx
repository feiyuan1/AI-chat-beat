import {
  consoleError,
  CreateMonitorLog,
  handleAIChatRequestMessage,
  Message,
  MonitorLogType,
  reportFailedLogs,
  reportFailedMetrics,
  reportLogs,
  reportStroageErrorLogs,
  storeFailedLogs,
} from "@ai-chat-beat/common";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import originalInjected from "../injected.esbuild";
import PlatformSwitcher from "./components/PlatformSwitcher";
import useKeyboardInset from "./hooks/useKeyboardInset";
import useLastUsedSession from "./hooks/useLastUsedPlatformSession";
import { MessageType } from "./types";
import { saveDataOnDevice } from "./utils/chatDataStorage";

const injected = originalInjected as unknown as string;

const AIPage = () => {
  const keyboardInset = useKeyboardInset();
  const { platform, sessionUrl, updatePlatform, updateSession } =
    useLastUsedSession();

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
      if (message.type === MessageType.UPDATE_SESSION) {
        updateSession(message.payload as string);
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

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: sessionUrl,
        }}
        style={{ marginBottom: keyboardInset }}
        webviewDebuggingEnabled={true}
        // ios
        scalesPageToFit={false}
        // android
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        injectedJavaScriptBeforeContentLoaded={injected}
        onMessage={onMessage}
      />
      <PlatformSwitcher current={platform} updateCurrent={updatePlatform} />
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
