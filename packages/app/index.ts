import { registerRootComponent } from "expo";

import { initStorage } from "@ai-chat-beat/common";
import AIPage from "./src/AIPage";
import { createLocalStorage } from "./src/utils";

initStorage(createLocalStorage());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(AIPage);
