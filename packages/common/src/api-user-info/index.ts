import { getStorageItem, setStorageItem, TargetEnum } from "../storage";
import { ApiUserInfo, ValidationResult } from "./types";

export const loadApiUserInfo = async () => {
  const info = await getStorageItem(TargetEnum.apiUserInfo);
  return info;
};

export const saveApiUserInfo = async (info: ApiUserInfo) => {
  await setStorageItem(TargetEnum.apiUserInfo, info);
};

export const validationApiUserInfo = (info: any): ValidationResult => {
  if (!info?.username) {
    return {
      type: "error",
      message: "username 不能为空",
    };
  }
  if (!info?.password) {
    return {
      type: "error",
      message: "password 不能为空",
    };
  }
  return {
    type: "success",
  };
};
