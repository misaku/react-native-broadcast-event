import { NitroModules } from 'react-native-nitro-modules';
import type { BroadcastEvent } from './BroadcastEvent.nitro';

const BroadcastEventHybridObject =
  NitroModules.createHybridObject<BroadcastEvent>('BroadcastEvent');

export function multiply(a: number, b: number): number {
  return BroadcastEventHybridObject.multiply(a, b);
}
