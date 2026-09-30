import { useState } from "react";
import { Button, ButtonProps } from "react-native";

type OperationButtonProps = Pick<ButtonProps, "title" | "disabled"> & {
  onPress: () => void | Promise<void>;
};

const OperationButton = ({ title, onPress, disabled }: OperationButtonProps) => {
  const [isOperating, setIsOperating] = useState(false);

  const handlePress = async () => {
    if (isOperating) {
      return;
    }
    setIsOperating(true);
    try {
      await onPress();
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <Button
      title={title}
      onPress={handlePress}
      disabled={disabled || isOperating}
    />
  );
};

export default OperationButton;
