export interface ApiUserInfo {
  username: string;
  password: string;
}

export interface ValidationResult {
  type: "success" | "error";
  message?: string;
}
