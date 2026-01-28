import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { useColorScheme } from 'react-native';

import { AppNavigator } from './src/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { getThemeColors } from './src/theme';
import { useAppState } from './src/storage/state';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

Sentry.init({
  dsn: SENTRY_DSN || undefined,
  enabled: Boolean(SENTRY_DSN),
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 0.1,
});

function App() {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);

  return (
    <>
      <StatusBar style="auto" />
      <ErrorBoundary colors={colors}>
        <AppNavigator />
      </ErrorBoundary>
    </>
  );
}

export default Sentry.wrap(App);
