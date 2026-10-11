import {
  loadApiUserInfo,
  saveApiUserInfo,
  validationApiUserInfo,
} from "@ai-chat-beat/common";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

const ApiUserInfoForm = () => {
  const [loading, setLoading] = useState(true);
  const info = useRef({ username: "", password: "" }).current;

  useEffect(() => {
    loadApiUserInfo().then((stored) => {
      if (stored) {
        info.username = stored.username;
        info.password = stored.password;
      }
      setLoading(false);
    });
  }, []);

  const setUsername = (text: string) => {
    info.username = text;
  };
  const setPassword = (text: string) => {
    info.password = text;
  };

  const saveInfo = () => {
    const validateResult = validationApiUserInfo(info);
    if (validateResult.type === "error") {
      Alert.alert(validateResult.message!);
      return;
    }
    saveApiUserInfo(info);
    Alert.alert("save user info success");
  };

  if (loading) {
    return <Text>fetching current user info...</Text>;
  }

  return (
    <View>
      <Text style={{ textAlign: "center" }}>api user info form</Text>
      <TextInput
        placeholder="请输入用户名"
        defaultValue={info.username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="请输入密码"
        secureTextEntry={true}
        defaultValue={info.password}
        onChangeText={setPassword}
      />
      <Button title="save" onPress={saveInfo} />
    </View>
  );
};

export default ApiUserInfoForm;
