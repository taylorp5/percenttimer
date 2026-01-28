import { NativeModules } from 'react-native';

type SharedStateModuleSpec = {
  setSharedState?: (jsonString: string) => void | Promise<void>;
  getSharedState?: () => string | null | Promise<string | null>;
  refreshWidgets?: () => void | Promise<void>;
};

const loadNativeModule = (): SharedStateModuleSpec | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('shared-state');
    return module.default ?? module;
  } catch {
    return null;
  }
};

const nativeModule =
  (NativeModules.SharedStateModule as SharedStateModuleSpec | undefined) ??
  loadNativeModule();

export const setSharedState = async (jsonString: string): Promise<void> => {
  if (!nativeModule?.setSharedState) return;
  await Promise.resolve(nativeModule.setSharedState(jsonString));
};

export const getSharedState = async (): Promise<string | null> => {
  if (!nativeModule?.getSharedState) return null;
  const result = await Promise.resolve(nativeModule.getSharedState());
  return typeof result === 'string' ? result : null;
};

export const refreshWidgets = async (): Promise<void> => {
  if (!nativeModule?.refreshWidgets) return;
  await Promise.resolve(nativeModule.refreshWidgets());
};
