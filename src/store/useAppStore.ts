import { create } from 'zustand';
import type { Task, TemperatureRecord, Driver, TempStatus, CheckIn, AbnormalInfo } from '../types';
import { mockDriver, mockTasks, mockTemperatureRecords } from '../data/mockData';
import { generateId, getTempStatusColor } from '../utils';

const STORAGE_KEYS = {
  TASKS: 'coldchain_tasks',
  RECORDS: 'coldchain_records',
  CURRENT_TASK: 'coldchain_current_task',
  LIVE_DATA: 'coldchain_live_data',
};

interface PersistedLiveData {
  liveTemperature: number;
  batteryLevel: number;
  powerConnected: boolean;
  lastDoorOpen: string;
  lastUpdate: string;
}

interface AppState {
  driver: Driver;
  tasks: Task[];
  temperatureRecords: TemperatureRecord[];
  currentTaskId: string | null;
  liveTemperature: number;
  batteryLevel: number;
  powerConnected: boolean;
  lastDoorOpen: string;
  initialized: boolean;

  initFromStorage: () => void;
  setCurrentTask: (taskId: string) => void;
  getCurrentTask: () => Task | undefined;
  getTaskRecords: (taskId: string) => TemperatureRecord[];
  getTaskSummary: (taskId: string) => {
    lastTemp: number | null;
    lastStatus: TempStatus | null;
    lastRecordTime: string | null;
    hasTransloadCheckIn: boolean;
    hasWarehouseCheckIn: boolean;
    hasAbnormal: boolean;
    abnormalCount: number;
    recordCount: number;
  };
  addTemperatureRecord: (data: {
    status: TempStatus;
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    remark?: string;
    isAbnormal?: boolean;
  }) => TemperatureRecord | undefined;
  reportAbnormal: (recordId: string, info: Omit<AbnormalInfo, 'reportedAt'>) => void;
  addCheckIn: (taskId: string, type: 'transload' | 'supervision_warehouse', location: {
    latitude: number;
    longitude: number;
    locationName: string;
  }) => void;
  updateLiveTemperature: () => void;
  togglePower: () => void;
  clearAllData: () => void;
}

const persistTasks = (tasks: Task[]) => {
  try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); } catch (e) { console.warn('Storage failed', e); }
};

const persistRecords = (records: TemperatureRecord[]) => {
  try { localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records)); } catch (e) { console.warn('Storage failed', e); }
};

const persistCurrentTask = (taskId: string | null) => {
  try { localStorage.setItem(STORAGE_KEYS.CURRENT_TASK, JSON.stringify(taskId)); } catch (e) { console.warn('Storage failed', e); }
};

const persistLiveData = (data: PersistedLiveData) => {
  try { localStorage.setItem(STORAGE_KEYS.LIVE_DATA, JSON.stringify(data)); } catch (e) { console.warn('Storage failed', e); }
};

const initialTask = mockTasks[0];

export const useAppStore = create<AppState>((set, get) => ({
  driver: mockDriver,
  tasks: mockTasks,
  temperatureRecords: mockTemperatureRecords,
  currentTaskId: initialTask?.id ?? null,
  liveTemperature: -19.6,
  batteryLevel: 87,
  powerConnected: false,
  lastDoorOpen: '2026-06-21T06:35:00+08:00',
  initialized: false,

  initFromStorage: () => {
    if (get().initialized) return;

    try {
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const storedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
      const storedLive = localStorage.getItem(STORAGE_KEYS.LIVE_DATA);

      const mergedTasks = storedTasks ? JSON.parse(storedTasks) : mockTasks;
      const mergedRecords = storedRecords ? JSON.parse(storedRecords) : mockTemperatureRecords;
      const mergedCurrent = storedCurrent ? JSON.parse(storedCurrent) : initialTask?.id ?? null;

      let liveData = {
        liveTemperature: -19.6,
        batteryLevel: 87,
        powerConnected: false,
        lastDoorOpen: '2026-06-21T06:35:00+08:00',
      };

      if (storedLive) {
        const parsed = JSON.parse(storedLive) as PersistedLiveData;
        liveData = { ...liveData, ...parsed };
      }

      set({
        tasks: mergedTasks,
        temperatureRecords: mergedRecords,
        currentTaskId: mergedCurrent,
        ...liveData,
        initialized: true,
      });
    } catch (e) {
      console.warn('Failed to load from storage', e);
      set({ initialized: true });
    }
  },

  setCurrentTask: (taskId) => {
    set({ currentTaskId: taskId });
    persistCurrentTask(taskId);
  },

  getCurrentTask: () => {
    const { tasks, currentTaskId } = get();
    return tasks.find(t => t.id === currentTaskId);
  },

  getTaskRecords: (taskId) => {
    return get()
      .temperatureRecords
      .filter(r => r.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTaskSummary: (taskId) => {
    const records = get().getTaskRecords(taskId);
    const task = get().tasks.find(t => t.id === taskId);
    const lastRecord = records[0];
    const abnormalRecords = records.filter(r => r.isAbnormal || r.status === 'temp_abnormal' || r.status === 'temp_abnormal_reported');

    return {
      lastTemp: lastRecord?.temperature ?? null,
      lastStatus: lastRecord?.status ?? null,
      lastRecordTime: lastRecord?.createdAt ?? null,
      hasTransloadCheckIn: task?.checkIns.some(c => c.type === 'transload') ?? false,
      hasWarehouseCheckIn: task?.checkIns.some(c => c.type === 'supervision_warehouse') ?? false,
      hasAbnormal: abnormalRecords.length > 0,
      abnormalCount: abnormalRecords.length,
      recordCount: records.length,
    };
  },

  addTemperatureRecord: (data) => {
    const { currentTaskId, liveTemperature, batteryLevel, powerConnected, lastDoorOpen } = get();
    if (!currentTaskId) return undefined;

    const currentTask = get().getCurrentTask();
    const isAbnormal = data.isAbnormal ?? (currentTask
      ? getTempStatusColor(liveTemperature, currentTask.targetTempMin, currentTask.targetTempMax) !== 'safe'
      : false);

    const newRecord: TemperatureRecord = {
      id: generateId('REC'),
      taskId: currentTaskId,
      temperature: liveTemperature,
      batteryLevel,
      powerConnected,
      lastDoorOpen,
      ...data,
      isAbnormal,
      createdAt: new Date().toISOString(),
    };

    set(state => {
      const newRecords = [newRecord, ...state.temperatureRecords];
      persistRecords(newRecords);
      return { temperatureRecords: newRecords };
    });

    return newRecord;
  },

  reportAbnormal: (recordId, info) => {
    set(state => {
      const newRecords = state.temperatureRecords.map(r => {
        if (r.id !== recordId) return r;
        const updated: TemperatureRecord = {
          ...r,
          status: 'temp_abnormal_reported',
          isAbnormal: true,
          abnormalInfo: {
            ...info,
            reportedAt: new Date().toISOString(),
          },
        };
        return updated;
      });
      persistRecords(newRecords);
      return { temperatureRecords: newRecords };
    });
  },

  addCheckIn: (taskId, type, location) => {
    const checkIn: CheckIn = {
      id: generateId('CI'),
      taskId,
      type,
      ...location,
      createdAt: new Date().toISOString(),
    };

    set(state => {
      const newTasks = state.tasks.map(task =>
        task.id === taskId
          ? { ...task, checkIns: [...task.checkIns, checkIn] }
          : task
      );
      persistTasks(newTasks);
      return { tasks: newTasks };
    });
  },

  updateLiveTemperature: () => {
    const currentTask = get().getCurrentTask();
    if (!currentTask) return;
    
    const { targetTempMin, targetTempMax } = currentTask;
    const midTemp = (targetTempMin + targetTempMax) / 2;
    const fluctuation = (Math.random() - 0.5) * 1.5;
    const newTemp = Math.round((midTemp + fluctuation) * 10) / 10;

    set(state => {
      const newBattery = Math.max(10, state.batteryLevel - (state.powerConnected ? 0 : 0.3));
      const liveData: PersistedLiveData = {
        liveTemperature: newTemp,
        batteryLevel: newBattery,
        powerConnected: state.powerConnected,
        lastDoorOpen: state.lastDoorOpen,
        lastUpdate: new Date().toISOString(),
      };
      persistLiveData(liveData);
      return {
        liveTemperature: newTemp,
        batteryLevel: newBattery,
      };
    });
  },

  togglePower: () => {
    set(state => {
      const newPowerConnected = !state.powerConnected;
      const liveData: PersistedLiveData = {
        liveTemperature: state.liveTemperature,
        batteryLevel: state.batteryLevel,
        powerConnected: newPowerConnected,
        lastDoorOpen: state.lastDoorOpen,
        lastUpdate: new Date().toISOString(),
      };
      persistLiveData(liveData);
      return { powerConnected: newPowerConnected };
    });
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
    localStorage.removeItem(STORAGE_KEYS.LIVE_DATA);
    set({
      tasks: mockTasks,
      temperatureRecords: mockTemperatureRecords,
      currentTaskId: initialTask?.id ?? null,
      liveTemperature: -19.6,
      batteryLevel: 87,
      powerConnected: false,
      lastDoorOpen: '2026-06-21T06:35:00+08:00',
    });
  },
}));
