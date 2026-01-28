import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DevSettings } from 'react-native';

import { clearState } from '../storage/state';
import { getThemeColors } from '../theme';

type Props = {
  colors: ReturnType<typeof getThemeColors>;
  children: React.ReactNode;
};

type State = {
  message: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { message: '' };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  componentDidCatch(error: Error) {
    this.setState({ message: error.message });
  }

  handleReload = () => {
    if (DevSettings?.reload) {
      DevSettings.reload();
    }
  };

  handleReset = async () => {
    await clearState();
    if (DevSettings?.reload) {
      DevSettings.reload();
    }
  };

  render() {
    if (!this.state.message) {
      return this.props.children;
    }

    const { colors } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Something went wrong</Text>
        <Text style={[styles.message, { color: colors.mutedText }]}>{this.state.message}</Text>
        <Pressable
          onPress={this.handleReload}
          style={[styles.primaryButton, { backgroundColor: colors.progressFill }]}
        >
          <Text style={styles.primaryButtonText}>Reload</Text>
        </Pressable>
        <Pressable
          onPress={this.handleReset}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Reset app state</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
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
});
