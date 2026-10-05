import { Platform } from "@ai-chat-beat/common";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { Fragment } from "react/jsx-runtime";
import DraggableFloating from "./DraggableFloating";

interface PlatformInfo {
  name: Platform;
  url: string;
}

export const platforms: PlatformInfo[] = [
  { name: Platform.deepseek, url: "https://chat.deepseek.com/" },
  { name: Platform.kimi, url: "https://www.kimi.com/" },
  { name: Platform.yuanbao, url: "https://yuanbao.tencent.com/" },
  { name: Platform.qianwen, url: "https://www.qianwen.com/" },
  { name: Platform.yiyan, url: "https://wenxin.baidu.com/" },
  { name: Platform.chatglm, url: "https://chatglm.cn/" },
  { name: Platform.doubao, url: "https://www.doubao.com/" },
  { name: Platform.chatgpt, url: "https://chatgpt.com/" },
];

const ListWidth = 200;
const ListItemHeight = 40;
const SettingsHeight = 55;
const initialY = 30;
const renderSize = 40;
// marginTop - 5
const ListHeight = platforms.length * ListItemHeight + 5 + SettingsHeight;

const PlatformSwitcher = ({
  current,
  updateCurrent,
}: {
  current: Platform;
  updateCurrent: (platform: Platform) => void;
}) => {
  const { height, width } = useWindowDimensions();
  const initialX = width - 20 - renderSize;
  const [modalVisible, setModalVisible] = useState(false);
  const [animationStyle, updateAnimationStyle] = useState({
    transform: [{ translateX: initialX - ListWidth }, { translateY: initialY }],
  });

  const onPress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const onDragEnd = useCallback(({ x, y }: { x: number; y: number }) => {
    let translateX = 0;
    let translateY = 0;
    // 悬浮框左下角坐标
    const positionX = x;
    const positionY = y;
    // list 左上角坐标
    // 默认放左边
    const expectedX = positionX - ListWidth;
    // 默认放下边
    const expectedY = positionY;
    if (expectedX >= 10) {
      translateX = expectedX;
    } else {
      translateX = positionX + renderSize;
    }
    if (expectedY + ListHeight + 10 <= height) {
      translateY = expectedY;
    } else {
      translateY = positionY - ListHeight + renderSize;
    }
    updateAnimationStyle({
      transform: [{ translateX }, { translateY }],
    });
  }, []);

  return (
    <Fragment>
      <DraggableFloating
        renderSize={renderSize}
        initialX={initialX}
        initialY={initialY}
        onPress={onPress}
        onDragEnd={onDragEnd}
      >
        <Image
          style={{ width: 30, height: 30 }}
          source={require("../../assets/icon.png")}
        />
      </DraggableFloating>
      <Modal visible={modalVisible} transparent={true}>
        <Pressable style={{ flex: 1 }} onPress={() => setModalVisible(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.list, animationStyle]}
          >
            <View>
              {platforms.map((platform) => {
                if (platform.name === current) {
                  return (
                    <View key={platform.name} style={styles.seletedListItem}>
                      <Text style={styles.seletedItemCapital}>
                        {platform.name.slice(0, 1).toUpperCase()}
                      </Text>
                      <Text style={styles.seletedItemContent}>
                        {platform.name}
                      </Text>
                      <Ionicons
                        name="checkmark-outline"
                        color="#fff"
                        size={24}
                      />
                    </View>
                  );
                }
                return (
                  <Pressable
                    key={platform.name}
                    onPress={() => {
                      updateCurrent(platform.name);
                      setModalVisible(false);
                    }}
                  >
                    <View key={platform.name} style={styles.listItem}>
                      <Text style={styles.itemCapital}>
                        {platform.name.slice(0, 1).toUpperCase()}
                      </Text>
                      <Text style={styles.itemContent}>{platform.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable
                style={styles.settings}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text style={styles.settingsText}>Settings</Text>
                <Ionicons name="arrow-forward-outline" color="#777" size={20} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Fragment>
  );
};

const listItem: ViewStyle = {
  backgroundColor: "#fff",
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
  height: ListItemHeight,
};

const itemContent: TextStyle = {
  color: "#000",
  flex: 1,
  fontWeight: 700,
  marginLeft: 8,
  fontSize: 16,
};

const itemCapital: TextStyle = {
  color: "#fff",
  backgroundColor: "#000",
  borderRadius: 10,
  width: 30,
  textAlign: "center",
  fontSize: 20,
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: "#fff",
    position: "absolute",
    borderRadius: 10,
    width: ListWidth,
    transformOrigin: "left top",
    boxShadow: "0 0 10px rgba(0, 0, 0, .12)",
  },
  listItem,
  seletedListItem: {
    ...listItem,
    backgroundColor: "#000",
  },
  itemContent,
  seletedItemContent: {
    ...itemContent,
    color: "#fff",
  },
  itemCapital,
  seletedItemCapital: {
    ...itemCapital,
    backgroundColor: "#fff",
    color: "#000",
  },
  settings: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    marginTop: 5,
    height: SettingsHeight,
  },
  settingsText: {
    fontSize: 16,
    flex: 1,
    color: "#777",
  },
});

export default PlatformSwitcher;
