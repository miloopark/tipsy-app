import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import AuthProvider from '@/contexts/AuthContext';
import PlayersProvider from '@/contexts/PlayersContext';
import LandingScreen from '@/screens/LandingScreen';
import PlayerSetupScreen from '@/screens/PlayerSetupScreen';
import ModeSelectScreen from '@/screens/ModeSelectScreen';
import GameHubScreen from '@/screens/GameHubScreen';
import SpinGameScreen from '@/games/spin/SpinGameScreen';
import TipsyTrapScreen from '@/games/tipsyTrap/TipsyTrapScreen';
import HotSeatScreen from '@/games/hotSeat/HotSeatScreen';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Magic: require('./assets/fonts/Magic2.otf')
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#12002F' }} />;
  }

  return (
    <AuthProvider>
      <PlayersProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
            <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
            <Stack.Screen name="GameHub" component={GameHubScreen} />
            <Stack.Screen name="SpinGame" component={SpinGameScreen} />
            <Stack.Screen name="TipsyTrap" component={TipsyTrapScreen} />
            <Stack.Screen name="HotSeat" component={HotSeatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PlayersProvider>
    </AuthProvider>
  );
}
