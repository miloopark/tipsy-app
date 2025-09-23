import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import AuthProvider from '@/contexts/AuthContext';
import LandingScreen from '@/screens/LandingScreen';
import GameHubScreen from '@/screens/GameHubScreen';
import SpinGameScreen from '@/games/spin/SpinGameScreen';
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
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="GameHub" component={GameHubScreen} />
          <Stack.Screen name="SpinGame" component={SpinGameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
