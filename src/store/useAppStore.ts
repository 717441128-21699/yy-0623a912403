import { create } from 'zustand';
import type { Task, TemperatureRecord, Driver, TempStatus, CheckIn } from '../types';
import { mockDriver, mockTasks, mockTemperatureRecords } from '../data/mockData';
import { generateId } from '../utils';

interface AppState {
  driver: Driver;
  tasks: Task[];
  temperatureRecords: TemperatureRecord[];
  currentTaskId: string | null;
  liveTemperature: number;
  batteryLevel: number;
  powerConnected: boolean;
  lastDoorOpen: string;

  setCurrentTask: (taskId: string) => void;
  getCurrentTask: () => Task | undefined;
  getTaskRecords: (taskId: string) => TemperatureRecord[];
  addTemperatureRecord: (data: {
    status: TempStatus;
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    remark?: string;
  }) => void;
  addCheckIn: (taskId: string, type: 'transload' | 'supervision_warehouse', location: {
    latitude: number;
    longitude: number;
    locationName: string;
  }) => void;
  updateLiveTemperature: () => void;
  togglePower: () => void;
}

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

  setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

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

  addTemperatureRecord: (data) => {
    const { currentTaskId, liveTemperature, batteryLevel, powerConnected, lastDoorOpen } = get();
    if (!currentTaskId) return;

    const newRecord: TemperatureRecord = {
      id: generateId('REC'),
      taskId: currentTaskId,
      temperature: liveTemperature,
      batteryLevel,
      powerConnected,
      lastDoorOpen,
      ...data,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      temperatureRecords: [newRecord, ...state.temperatureRecords],
    }));
  },

  addCheckIn: (taskId, type, location) => {
    const checkIn: CheckIn = {
      id: generateId('CI'),
      taskId,
      type,
      ...location,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, checkIns: [...task.checkIns, checkIn] }
          : task
      ),
    }));
  },

  updateLiveTemperature: () => {
    const currentTask = get().getCurrentTask();
    if (!currentTask) return;
    
    const { tempMin, tempMax } = currentTask;
    const midTemp = (tempMin + tempMax) / 2;
    const fluctuation = (Math.random() - 0.5) * 1.5;
    const newTemp = Math.round((midTemp + fluctuation) * 10) / 10;

    set(state => ({
      liveTemperature: newTemp,
      batteryLevel: Math.max(10, state.batteryLevel - (state.powerConnected ? 0 : 0.3)),
    }));
  },

  togglePower: () => {
    set(state => ({ powerConnected: !state.powerConnected }));
  },
}));
