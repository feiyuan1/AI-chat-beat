import { initStorage } from "@ai-chat-beat/common";
import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import AIPage from "./src/AIPage";
import Home from "./src/Home";
import SettingsPage from "./src/Settings";
import { createLocalStorage } from "./src/utils";

initStorage(createLocalStorage());

// registerRootComponent calls AppRegistry.registerComponent('main', () => Home);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Home);
AppRegistry.registerComponent("aipage", () => AIPage);
AppRegistry.registerComponent("settings", () => SettingsPage);
