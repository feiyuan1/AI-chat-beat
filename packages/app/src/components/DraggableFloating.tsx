import { memo, PropsWithChildren, useRef } from "react";
import { PanResponder, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface DraggableFloatingProps {
  renderSize: number;
  initialX?: number;
  initialY?: number;
  onPress?: () => void;
  onDragEnd?: (props: { x: number; y: number }) => void;
}

const DraggableFloating = ({
  renderSize,
  initialX = 0,
  initialY = 0,
  onPress,
  onDragEnd,
  children,
}: PropsWithChildren<DraggableFloatingProps>) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const { height, width } = useWindowDimensions();
  const context = useRef({ x: initialX, y: initialY }).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        context.x = translateX.value;
        context.y = translateY.value;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextX = context.x + gestureState.dx;
        const nextY = context.y + gestureState.dy;
        translateX.value = Math.min(Math.max(nextX, 0), width - renderSize);
        translateY.value = Math.min(Math.max(nextY, 0), height - renderSize);
      },
      onPanResponderRelease: () => {
        if (context.x === translateX.value && translateY.value === context.y) {
          onPress?.();
          return;
        }
        onDragEnd?.({ x: translateX.value, y: translateY.value });
      },
    }),
  ).current;

  const animationStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          width: renderSize,
          height: renderSize,
        },
        animationStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    boxShadow: "0 0 8px rgba(0, 0, 0, .12)",
    position: "absolute",
    transformOrigin: "left top",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
  },
});

export default memo(DraggableFloating);
