import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useLiveTemperature(autoUpdate: boolean = true) {
  const { liveTemperature, batteryLevel, powerConnected, lastDoorOpen, updateLiveTemperature } = useAppStore();
  const currentTask = useAppStore(s => s.getCurrentTask());

  const manualUpdate = useCallback(() => {
    updateLiveTemperature();
  }, [updateLiveTemperature]);

  useEffect(() => {
    if (!autoUpdate) return;
    const interval = setInterval(() => {
      updateLiveTemperature();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoUpdate, updateLiveTemperature]);

  const tempStatus = currentTask
    ? (() => {
        const { tempMin, tempMax } = currentTask;
        if (liveTemperature < tempMin - 2 || liveTemperature > tempMax + 2) return 'danger' as const;
        if (liveTemperature < tempMin || liveTemperature > tempMax) return 'warn' as const;
        return 'safe' as const;
      })()
    : 'safe' as const;

  return {
    temperature: liveTemperature,
    batteryLevel,
    powerConnected,
    lastDoorOpen,
    tempStatus,
    manualUpdate,
    targetMin: currentTask?.tempMin,
    targetMax: currentTask?.tempMax,
  };
}
