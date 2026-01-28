import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  Pressable,
  ToastAndroid,
  Alert,
} from 'react-native';

import { RootStackParamList } from '../AppNavigator';
import { getThemeColors } from '../theme';
import { setState, useAppState } from '../storage/state';
import { WidgetMockPreview } from '../components/WidgetMockPreview';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWidgetHelp'>;

export const AddWidgetHelpScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const isIOS = Platform.OS === 'ios';

  const handleConfirm = () => {
    void setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        hasAddedWidget: true,
      },
    }));
    if (Platform.OS === 'android') {
      ToastAndroid.show('Widget added!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Widget added!', 'Nice work.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Add a Widget</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        {isIOS
          ? 'Set up widgets for quick access on your Home and Lock Screens.'
          : 'Add a widget to your Home Screen for quick access.'}
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconPlaceholder, { backgroundColor: colors.progressFill }]} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Home Screen Widgets</Text>
        </View>
        <Text style={[styles.body, { color: colors.mutedText }]}
        >
          {isIOS
            ? 'Long-press your home screen → tap + → search PercentTime → choose a size.'
            : 'Long-press an empty area on your home screen → Widgets → PercentTime → drag it onto your home screen.'}
        </Text>
        <WidgetMockPreview
          size="medium"
          percent={68}
          label="Day"
          accentColor={colors.progressFill}
        />
      </View>

      {isIOS ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconPlaceholder, { backgroundColor: colors.progressFill }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lock Screen Widgets</Text>
          </View>
          <Text style={[styles.body, { color: colors.mutedText }]}>
            Long-press the lock screen → Customize → add PercentTime.
          </Text>
          <WidgetMockPreview
            size="small"
            percent={42}
            label="Week"
            accentColor={colors.progressFill}
          />
        </View>
      ) : null}

      <Pressable
        onPress={handleConfirm}
        style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
      >
        <Text style={styles.primaryButtonText}>I added a widget</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[styles.secondaryText, { color: colors.text }]}>Done</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
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





