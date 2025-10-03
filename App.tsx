import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import AuthProvider from '@/contexts/AuthContext';
import PlayersProvider from '@/contexts/PlayersContext';
import EntryScreen from '@/screens/EntryScreen';
import ManualWhoScreen from '@/screens/ManualWhoScreen';
import WhoScreen from '@/screens/WhoScreen';
import MainTabs from '@/navigation/MainTabs';
import RoomsScreen from '@/screens/RoomsScreen';
import RoomDetailScreen from '@/screens/RoomDetailScreen';
import ModeSelectScreen from '@/screens/ModeSelectScreen';
import GameHubScreen from '@/screens/GameHubScreen';
import SpinGameScreen from '@/games/spin/SpinGameScreen';
import LoopyTrapScreen from '@/games/loopyTrap/LoopyTrapScreen';
import HotSeatScreen from '@/games/hotSeat/HotSeatScreen';
import CategoriesScreen from '@/games/categories/CategoriesScreen';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Magic: require('./assets/fonts/Magic2.otf')
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F9F7F6' }} />;
  }

  return (
    <AuthProvider>
      <PlayersProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Entry" component={EntryScreen} />
            <Stack.Screen name="ManualWho" component={ManualWhoScreen} />
            <Stack.Screen name="Who" component={WhoScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Rooms" component={RoomsScreen} />
            <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
            <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
            <Stack.Screen name="GameHub" component={GameHubScreen} />
            <Stack.Screen name="SpinGame" component={SpinGameScreen} />
            <Stack.Screen name="LoopyTrap" component={LoopyTrapScreen} />
            <Stack.Screen name="HotSeat" component={HotSeatScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PlayersProvider>
    </AuthProvider>
  );
}
