import { Platform } from "@ai-chat-beat/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { platforms } from "../components/PlatformSwitcher";
import { getData, saveData } from "../storage";
import { STORAGE_KEY } from "../storage/constants";

type LastUsedSessionType = Partial<Record<Platform, string>>;

const useLastUsedPlatformSession = () => {
  const [platform, setPlatform] = useState<Platform>(Platform.deepseek);
  const [session, setSession] = useState<LastUsedSessionType>({});

  useEffect(() => {
    Promise.all([
      getData(STORAGE_KEY.LAST_USED_PLATFORM),
      getData(STORAGE_KEY.LAST_USED_SESSION),
    ]).then(([lastPlatform, lastSession]) => {
      if (lastSession) {
        setSession(lastSession as LastUsedSessionType);
      }
      if (lastPlatform) {
        setPlatform(lastPlatform as Platform);
      }
    });
  }, []);

  const updatePlatform = useCallback((platform: Platform) => {
    setPlatform(platform);
    saveData(STORAGE_KEY.LAST_USED_PLATFORM, platform);
  }, []);

  const updateSession = useCallback(
    (sessionUrl: string) => {
      setSession((prev) => {
        const newSession = { ...prev, [platform]: sessionUrl };
        saveData(STORAGE_KEY.LAST_USED_SESSION, newSession);
        return newSession;
      });
    },
    [platform],
  );

  const sessionUrl = useMemo(() => {
    return session[platform] || platforms.find((p) => p.name === platform)!.url;
  }, [platform, session]);

  return { platform, sessionUrl, updatePlatform, updateSession };
};

export default useLastUsedPlatformSession;
