import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';

import { AddWidgetHelpScreen } from './screens/AddWidgetHelpScreen';
import { CustomScreen } from './screens/CustomScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ManageScreen } from './screens/ManageScreen';
import { TimerScreen, TimerScreenParams } from './screens/TimerScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { WidgetGalleryScreen } from './screens/WidgetGalleryScreen';
import { getThemeColors, resolveTheme } from './theme';
import { useAppState } from './storage/state';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Manage: undefined;
  Custom: undefined;
  WidgetGallery: undefined;
  AddWidgetHelp: undefined;
  Timer: TimerScreenParams;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const resolved = resolveTheme(state.settings.theme, scheme);
  const baseTheme = resolved === 'dark' ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.progressFill,
    },
  };

  const initialRouteName = state.settings.hasOnboarded ? 'Home' : 'Onboarding';

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        key={initialRouteName}
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Manage" component={ManageScreen} />
        <Stack.Screen name="Custom" component={CustomScreen} />
        <Stack.Screen
          name="WidgetGallery"
          component={WidgetGalleryScreen}
          options={{ title: 'Widgets' }}
        />
        <Stack.Screen
          name="AddWidgetHelp"
          component={AddWidgetHelpScreen}
          options={{ title: 'Add a Widget' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
