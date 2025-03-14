import { NitroModules } from 'react-native-nitro-modules';
import { create } from 'zustand';
import React, { useCallback, useEffect } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { BroadcastEvent } from './BroadcastEvent.nitro';

const BroadcastEventHybridObject =
  NitroModules.createHybridObject<BroadcastEvent>('BroadcastEvent');

export async function register(
  filterName: string,
  actionNames: string,
  eventName: string,
  category: string
): Promise<number> {
  return BroadcastEventHybridObject.register(
    filterName,
    actionNames,
    eventName,
    category
  );
}

export async function unregister(idx: number): Promise<boolean> {
  return BroadcastEventHybridObject.unregister(idx);
}

export async function sendBroadcast(
  actionName: string,
  putExtra: string,
  value: string,
  category: string
): Promise<boolean> {
  return BroadcastEventHybridObject.sendBroadcast(
    actionName,
    putExtra,
    value,
    category
  );
}

interface BroadcastContextData {
  data: any;
  timestamp: number;
  sendBroadcast(message: string, key: string): Promise<void>;
  clear(): void;
}

interface BroadcastContextDataStore {
  data: any;
  setData: (value: any) => void;
  timestamp: number;
  setTimestamp: (value: number) => void;
  reciverId: number | undefined;
  setReciverId: (value: number | undefined) => void;
  sendBroadcast(message: string, key: string): Promise<void>;
  clear(): void;
}

/**
 * This provider starts a new receiver and listens for events
 * @param filterName String name used to filter
 * @param actionNames String[] names used to map data
 * @param eventName String name of the event to listen for
 * @param category String category used in the broadcast
 *
 * @returns [React.FC, () => BroadcastContextData]
 */
export function createServiceBroadcast(
  filterName: string,
  actionNames: string[],
  eventName: string,
  category: string = ''
): [React.FC<React.PropsWithChildren>, () => BroadcastContextData] {
  const eventEmitter = new NativeEventEmitter(NativeModules.BroadcastEvent);

  const useDataStore = create<BroadcastContextDataStore>((set, get) => ({
    data: null,
    reciverId: undefined,
    timestamp: Date.now(),
    setTimestamp: (value) => {
      set({ timestamp: value });
    },
    setData: (value) => {
      if (get().data !== value) {
        set({ data: value });
      }
      get().setTimestamp(Date.now());
    },
    setReciverId: (value) => {
      set({ reciverId: value });
    },
    sendBroadcast: async (message: string, key: string) => {
      await sendBroadcast(filterName, key, message, category);
    },
    clear: () => {
      get().setData(null);
    },
  }));

  const BroadcastProvider: React.FC<React.PropsWithChildren> = ({
    children,
  }) => {
    const setData = useDataStore((state) => state.setData);
    const reciverId = useDataStore((state) => state.reciverId);
    const setReciverId = useDataStore((state) => state.setReciverId);

    const eventRegister = useCallback(async () => {
      if (reciverId === undefined) {
        // Call the TurboModule's "register" method
        const idxRegister = await register(
          filterName,
          actionNames.join(';'),
          eventName,
          category
        );
        setReciverId(idxRegister);

        // Listen for events emitted from the native layer
        eventEmitter.addListener(eventName, (map) => {
          setData(map);
        });
      }
    }, [reciverId, setData, setReciverId]);

    const eventUnregister = useCallback(async () => {
      if (reciverId !== undefined) {
        // Call the TurboModule's "unregister" method
        await unregister(reciverId);
        setReciverId(undefined);

        // Remove the listener for the event
        eventEmitter.removeAllListeners(eventName);
      }
    }, [reciverId, setReciverId]);

    useEffect(() => {
      eventRegister();
      return () => {
        eventUnregister();
      };
    }, [eventRegister, eventUnregister]);

    return <>{children}</>;
  };

  /**
   * This hook returns data and a method to clear it
   * @returns {data: any, clear: () => void}
   */
  function useBroadcast(): BroadcastContextData {
    return {
      data: useDataStore((state) => state.data),
      timestamp: useDataStore((state) => state.timestamp),
      clear: useDataStore((state) => state.clear),
      sendBroadcast: useDataStore((state) => state.sendBroadcast),
    };
  }

  return [BroadcastProvider, useBroadcast];
}

export default BroadcastEventHybridObject;
