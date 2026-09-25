import { Platform } from "../../types";
import { AdaptResult } from "../types";

export async function getPlatformChatAdapter(
  platform: Platform,
): Promise<(data: any) => AdaptResult> {
  switch (platform) {
    case Platform.deepseek: {
      const { ChatDataAdapter } = await import("./deepseek");
      return ChatDataAdapter;
    }
    case Platform.yuanbao: {
      const { ChatDataAdapter } = await import("./yuanbao");
      return ChatDataAdapter;
    }
    case Platform.qianwen: {
      const { ChatDataAdapter } = await import("./qianwen");
      return ChatDataAdapter;
    }
    case Platform.yiyan: {
      const { ChatDataAdapter } = await import("./yiyan");
      return ChatDataAdapter;
    }
    case Platform.chatglm: {
      const { ChatDataAdapter } = await import("./chatglm");
      return ChatDataAdapter;
    }
    case Platform.doubao: {
      const { ChatDataAdapter } = await import("./doubao");
      return ChatDataAdapter;
    }
    case Platform.kimi: {
      const { ChatDataAdapter } = await import("./kimi");
      return ChatDataAdapter;
    }
    case Platform.chatgpt: {
      const { ChatDataAdapter } = await import("./chatgpt");
      return ChatDataAdapter;
    }
    default:
      throw new Error(`unsupported platform: ${platform}`);
  }
}
