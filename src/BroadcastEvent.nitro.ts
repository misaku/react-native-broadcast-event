import type { HybridObject } from 'react-native-nitro-modules';

export interface BroadcastEvent
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  register(
    filterName: string,
    actionNames: string,
    eventName: string,
    category: string
  ): Promise<number>;
  unregister(idx: number): Promise<boolean>;
  sendBroadcast(
    actionName: string,
    putExtra: string,
    value: string,
    category: string
  ): Promise<boolean>;
}
