import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const useKeyboardInset = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

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

  return keyboardHeight;
};

export default useKeyboardInset;
