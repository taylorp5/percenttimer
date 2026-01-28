import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useState } from 'react';

import { RootStackParamList } from '../AppNavigator';
import { ProgressCard } from '../components/ProgressCard';
import { getThemeColors } from '../theme';
import { setState, useAppState } from '../storage/state';
import { DebugPanel } from '../components/DebugPanel';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const WelcomeScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const enableDebug = __DEV__;
  const [debugVisible, setDebugVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleTitleTap = () => {
    if (!enableDebug) {
      return;
    }
    const next = tapCount + 1;
    if (next >= 7) {
      setTapCount(0);
      setDebugVisible(true);
      return;
    }
    setTapCount(next);
  };

  const handleGetStarted = () => {
    void setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hasOnboarded: true,
      },
    }));
    navigation.replace('Home');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.centerBlock}>
        <Pressable onPress={handleTitleTap}>
          <Text style={[styles.title, { color: colors.text }]}>PercentTime</Text>
        </Pressable>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}
        >
          See how far you are through your day, week, month, and year.
        </Text>
      </View>

      <View style={styles.cardWrap}>
        <ProgressCard
          label="Day"
          percent={63}
          showLabel
          colors={colors}
        />
      </View>

      <Text style={[styles.helper, { color: colors.mutedText }]}
      >
        Widgets are optional — the timer works fully in the app.
      </Text>

      <Pressable
        onPress={handleGetStarted}
        style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('AddWidgetHelp')}
      >
        <Text style={[styles.secondaryText, { color: colors.text }]}
        >
          How to add a widget
        </Text>
      </Pressable>

      {enableDebug && (
        <DebugPanel
          visible={debugVisible}
          onClose={() => setDebugVisible(false)}
          colors={colors}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 18,
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  cardWrap: {
    alignSelf: 'center',
    width: '100%',
  },
  helper: {
    textAlign: 'center',
    fontSize: 13,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
