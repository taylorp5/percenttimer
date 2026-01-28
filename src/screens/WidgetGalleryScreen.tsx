import { ScrollView, StyleSheet, Text, View, useColorScheme, Pressable, Platform } from 'react-native';

import { WidgetPreview } from '../components/WidgetPreview';
import { WidgetMockPreview } from '../components/WidgetMockPreview';
import { getThemeColors } from '../theme';
import { useAppState } from '../storage/state';
import { refreshWidgets } from '../storage/sharedStateBridge';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'WidgetGallery'>;

export const WidgetGalleryScreen = ({ navigation }: Props) => {
  const state = useAppState();
  const scheme = useColorScheme();
  const colors = getThemeColors(state.settings.theme, scheme, state.settings.accentColor);
  const hasAddedWidget = state.settings.hasAddedWidget;
  const isIOS = Platform.OS === 'ios';

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Widget Preview Gallery</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}
      >
        Example layouts for each widget size.
      </Text>

      <View style={[styles.callout, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.calloutTitle, { color: colors.text }]}
        >
          {hasAddedWidget ? 'Widgets enabled' : 'No widgets added yet'}
        </Text>
        <Text style={[styles.calloutBody, { color: colors.mutedText }]}
        >
          {hasAddedWidget
            ? 'Refresh widgets if they look out of date.'
            : 'Add a widget from your Home Screen to see progress at a glance.'}
        </Text>
        {hasAddedWidget ? (
          <Pressable
            onPress={() => void refreshWidgets()}
            style={[styles.calloutButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.calloutButtonText}>Refresh Widgets</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('AddWidgetHelp')}
            style={[styles.calloutButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.calloutButtonText}>How to add</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Home Screen</Text>
        <View style={styles.row}>
          <WidgetMockPreview
            size="small"
            percent={32}
            label="Day"
            accentColor={colors.progressFill}
          />
          <WidgetMockPreview
            size="medium"
            percent={68}
            label="Week"
            accentColor={colors.progressFill}
          />
        </View>
      </View>

      {isIOS ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lock Screen</Text>
          <View style={styles.row}>
            <WidgetPreview title="Circular" size="circular" colors={colors} />
            <WidgetPreview title="Rectangular" size="rectangular" colors={colors} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
  },
  callout: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  calloutBody: {
    fontSize: 13,
  },
  calloutButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
});




