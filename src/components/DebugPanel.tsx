import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DevSettings } from 'react-native';
import { useMemo, useState } from 'react';

import { clearState, useAppState } from '../storage/state';
import { getThemeColors } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof getThemeColors>;
};

export const DebugPanel = ({ visible, onClose, colors }: Props) => {
  const state = useAppState();
  const [expanded, setExpanded] = useState(false);

  const json = useMemo(() => JSON.stringify(state, null, 2), [state]);

  const handleReload = () => {
    if (DevSettings?.reload) {
      DevSettings.reload();
    }
  };

  const handleClear = async () => {
    await clearState();
    if (DevSettings?.reload) {
      DevSettings.reload();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Debug Panel</Text>
          <Pressable
            onPress={handleReload}
            style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
          >
            <Text style={styles.primaryButtonText}>Reload JS</Text>
          </Pressable>
          <Pressable
            onPress={handleClear}
            style={[styles.secondaryButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Clear saved state</Text>
          </Pressable>

          <Pressable onPress={() => setExpanded((prev) => !prev)}>
            <Text style={[styles.jsonToggle, { color: colors.text }]}
            >
              {expanded ? 'Hide state JSON' : 'Show state JSON'}
            </Text>
          </Pressable>

          {expanded ? (
            <ScrollView style={styles.jsonBox}>
              <Text style={[styles.jsonText, { color: colors.mutedText }]}>{json}</Text>
            </ScrollView>
          ) : null}

          <Pressable onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.text }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  jsonToggle: {
    fontSize: 14,
    fontWeight: '600',
  },
  jsonBox: {
    maxHeight: 220,
    borderRadius: 12,
  },
  jsonText: {
    fontSize: 12,
  },
  closeText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
