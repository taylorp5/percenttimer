import { requireNativeModule } from 'expo-modules-core';

type SharedStateModule = {
  setSharedState: (jsonString: string) => void;
  getSharedState: () => string | null;
  refreshWidgets: () => void;
};

export default requireNativeModule<SharedStateModule>('SharedState');
import { requireNativeModule } from 'expo-modules-core';

type SharedStateModule = {
  setSharedState: (jsonString: string) => void;
  getSharedState: () => string | null;
};

export default requireNativeModule<SharedStateModule>('SharedState');
