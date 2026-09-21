import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import originalInjected from "../injected.esbuild";

const injected = originalInjected as unknown as string;
const AIPage = () => {
  useEffect(() => {
    console.log("typeof inejcted", typeof injected);
  }, []);

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    console.log(event.nativeEvent.data);
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
