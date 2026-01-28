import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { RootStackParamList } from '../AppNavigator';
import { getThemeColors } from '../theme';
import { setState, useAppState } from '../storage/state';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);

  const handleDone = () => {
    void setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hasOnboarded: true,
      },
    }));
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to PercentTime</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Add widgets to see time progress at a glance.
      </Text>

      <View style={styles.stepCard}>
        <View style={[styles.placeholder, { borderColor: colors.border }]} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>Home Screen Widgets</Text>
        <Text style={[styles.stepText, { color: colors.mutedText }]}>
          Long press the home screen, tap “+”, and search for PercentTime.
        </Text>
      </View>

      <View style={styles.stepCard}>
        <View style={[styles.placeholder, { borderColor: colors.border }]} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>Lock Screen Widgets</Text>
        <Text style={[styles.stepText, { color: colors.mutedText }]}>
          Long press the lock screen, tap “Customize”, then choose PercentTime.
        </Text>
      </View>

      <Pressable
        onPress={handleDone}
        style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  stepCard: {
    gap: 10,
  },
  placeholder: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#00000010',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
