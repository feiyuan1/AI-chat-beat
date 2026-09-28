import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AIPage from "./AIPage";
import SettingsPage from "./Settings";

const RootSatck = createNativeStackNavigator({
  screens: {
    AI: {
      screen: AIPage,
      options: {
        headerShown: false,
      },
    },
    Settings: SettingsPage,
  },
});

const Navigation = createStaticNavigation(RootSatck);

const Home = () => {
  return <Navigation />;
};

export default Home;
