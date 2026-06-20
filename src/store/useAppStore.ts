import { create } from 'zustand';
import type { Task, TemperatureRecord, Driver, TempStatus, CheckIn, AbnormalReport, AbnormalStatus, StageEvent, TaskStage, SupplementEntry, ConversationEntry } from '../types';
import { STAGE_ORDER, TASK_STAGE_LABELS, TEMP_STATUS_LABELS } from '../types';
import { mockDriver, mockTasks, mockTemperatureRecords, mockAbnormalReports } from '../data/mockData';
import { generateId, getTempStatusColor } from '../utils';

const STORAGE_KEYS = {
  TASKS: 'coldchain_tasks',
  RECORDS: 'coldchain_records',
  CURRENT_TASK: 'coldchain_current_task',
  LIVE_DATA: 'coldchain_live_data',
  ABNORMAL_REPORTS: 'coldchain_abnormal_reports',
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
  abnormalReports: AbnormalReport[];
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
  getTaskAbnormalReports: (taskId: string) => AbnormalReport[];
  getAllAbnormalReports: (filter?: { status?: AbnormalStatus; taskId?: string }) => AbnormalReport[];
  getTaskSummary: (taskId: string) => {
    lastTemp: number | null;
    lastStatus: TempStatus | null;
    lastRecordTime: string | null;
    hasTransloadCheckIn: boolean;
    hasWarehouseCheckIn: boolean;
    hasAbnormal: boolean;
    abnormalCount: number;
    pendingAbnormalCount: number;
    recordCount: number;
    abnormalStatus: AbnormalStatus | null;
  };
  getStageTimeline: (taskId: string) => StageEvent[];
  addTemperatureRecord: (data: {
    status: TempStatus;
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    remark?: string;
    isAbnormal?: boolean;
  }) => TemperatureRecord | undefined;
  createAbnormalReport: (data: {
    recordId: string;
    taskId: string;
    dispatcherName: string;
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    actionTaken: string;
  }) => AbnormalReport;
  createAbnormalReportDirect: (data: {
    taskId: string;
    temperature: number;
    batteryLevel: number;
    powerConnected: boolean;
    dispatcherName: string;
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    actionTaken: string;
  }) => AbnormalReport;
  supplementAbnormalReport: (reportId: string, data: {
    tempPhoto?: string;
    sealPhoto?: string;
    powerPhoto?: string;
    note: string;
  }) => void;
  updateAbnormalStatus: (reportId: string, status: AbnormalStatus, dispatcherRemark?: string) => void;
  addConversationEntry: (reportId: string, entry: Omit<ConversationEntry, 'id' | 'createdAt'>) => void;
  getAbnormalReport: (reportId: string) => AbnormalReport | undefined;
  addCheckIn: (taskId: string, type: 'transload' | 'supervision_warehouse', location: {
    latitude: number;
    longitude: number;
    locationName: string;
  }) => void;
  updateTaskStage: (taskId: string, stage: TaskStage) => void;
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

const persistAbnormalReports = (reports: AbnormalReport[]) => {
  try { localStorage.setItem(STORAGE_KEYS.ABNORMAL_REPORTS, JSON.stringify(reports)); } catch (e) { console.warn('Storage failed', e); }
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
  abnormalReports: mockAbnormalReports,
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
      const storedAbnormal = localStorage.getItem(STORAGE_KEYS.ABNORMAL_REPORTS);
      const storedCurrent = localStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
      const storedLive = localStorage.getItem(STORAGE_KEYS.LIVE_DATA);

      let mergedTasks = storedTasks ? JSON.parse(storedTasks) : mockTasks;
      let mergedRecords = storedRecords ? JSON.parse(storedRecords) : mockTemperatureRecords;
      let mergedAbnormal = storedAbnormal ? JSON.parse(storedAbnormal) : mockAbnormalReports;
      const mergedCurrent = storedCurrent ? JSON.parse(storedCurrent) : initialTask?.id ?? null;

      mergedAbnormal = mergedAbnormal.map((report: AbnormalReport) => ({
        ...report,
        supplements: report.supplements ?? [],
        conversationLog: report.conversationLog ?? [
          {
            id: `msg-${report.id}`,
            role: 'driver' as const,
            actorName: '司机',
            content: report.actionTaken,
            tempPhoto: report.tempPhoto,
            sealPhoto: report.sealPhoto,
            powerPhoto: report.powerPhoto,
            statusChange: report.status,
            createdAt: report.createdAt,
          },
        ],
      }));

      mergedTasks = mergedTasks.map((task: Task) => ({
        ...task,
        abnormalReports: task.abnormalReports?.map((report: AbnormalReport) => ({
          ...report,
          supplements: report.supplements ?? [],
          conversationLog: report.conversationLog ?? [
            {
              id: `msg-${report.id}`,
              role: 'driver' as const,
              actorName: '司机',
              content: report.actionTaken,
              tempPhoto: report.tempPhoto,
              sealPhoto: report.sealPhoto,
              powerPhoto: report.powerPhoto,
              statusChange: report.status,
              createdAt: report.createdAt,
            },
          ],
        })) ?? [],
      }));

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
        abnormalReports: mergedAbnormal,
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

  getTaskAbnormalReports: (taskId) => {
    return get()
      .abnormalReports
      .filter(r => r.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAllAbnormalReports: (filter) => {
    let reports = [...get().abnormalReports];
    if (filter?.status) {
      reports = reports.filter(r => r.status === filter.status);
    }
    if (filter?.taskId) {
      reports = reports.filter(r => r.taskId === filter.taskId);
    }
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTaskSummary: (taskId) => {
    const records = get().getTaskRecords(taskId);
    const task = get().tasks.find(t => t.id === taskId);
    const abnormalReports = get().getTaskAbnormalReports(taskId);
    const lastRecord = records[0];
    const abnormalRecords = records.filter(r => r.isAbnormal || r.status === 'temp_abnormal' || r.status === 'temp_abnormal_reported');
    const pendingAbnormal = abnormalReports.filter(r => r.status !== 'closed');

    return {
      lastTemp: lastRecord?.temperature ?? null,
      lastStatus: lastRecord?.status ?? null,
      lastRecordTime: lastRecord?.createdAt ?? null,
      hasTransloadCheckIn: task?.checkIns.some(c => c.type === 'transload') ?? false,
      hasWarehouseCheckIn: task?.checkIns.some(c => c.type === 'supervision_warehouse') ?? false,
      hasAbnormal: abnormalRecords.length > 0,
      abnormalCount: abnormalRecords.length,
      pendingAbnormalCount: pendingAbnormal.length,
      recordCount: records.length,
      abnormalStatus: pendingAbnormal.length > 0 ? pendingAbnormal[0].status : null,
    };
  },

  getStageTimeline: (taskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return [];

    const records = get().getTaskRecords(taskId);
    const checkIns = task.checkIns;
    const abnormalReports = get().getTaskAbnormalReports(taskId);

    const events: StageEvent[] = [];

    events.push({
      id: `stage-${task.createdAt}`,
      taskId,
      type: 'stage_start',
      stage: 'pickup',
      title: '任务开始',
      description: `已提货：${task.cargoName}`,
      createdAt: task.createdAt,
    });

    const stageStartTimes: Record<string, string> = {
      pickup: task.createdAt,
    };
    if (task.stageStartedAt) {
      stageStartTimes[task.stage] = task.stageStartedAt;
    }

    const currentStageIndex = STAGE_ORDER.indexOf(task.stage);
    for (let i = 1; i <= currentStageIndex; i++) {
      const stage = STAGE_ORDER[i];
      const startTime = stageStartTimes[stage] || task.createdAt;
      events.push({
        id: `stage-${stage}-${startTime}`,
        taskId,
        type: 'stage_start',
        stage,
        title: `进入「${TASK_STAGE_LABELS[stage]}」阶段`,
        description: stage === 'port' ? `到达${task.targetPort}` : TASK_STAGE_LABELS[stage],
        createdAt: startTime,
      });
    }

    checkIns.forEach(checkIn => {
      events.push({
        id: checkIn.id,
        taskId,
        type: 'checkin',
        title: checkIn.type === 'transload' ? '换装点签到' : '监管仓签到',
        description: checkIn.locationName,
        relatedId: checkIn.id,
        relatedType: 'checkin',
        createdAt: checkIn.createdAt,
      });
    });

    records.slice(0, 8).forEach(record => {
      if (record.status !== 'normal_transit') {
        events.push({
          id: record.id,
          taskId,
          type: 'temperature_record',
          title: `温度打卡：${TEMP_STATUS_LABELS[record.status]}`,
          description: `${record.temperature.toFixed(1)}°C · ${record.powerConnected ? '已接电' : '未接电'}`,
          temperature: record.temperature,
          photoUrl: record.tempPhoto,
          relatedId: record.id,
          relatedType: 'temperature_record',
          createdAt: record.createdAt,
        });
      }
    });

    abnormalReports.forEach(report => {
      events.push({
        id: report.id,
        taskId,
        type: 'abnormal_report',
        title: `温度异常上报：${report.temperature.toFixed(1)}°C`,
        description: report.actionTaken,
        temperature: report.temperature,
        photoUrl: report.tempPhoto,
        relatedId: report.id,
        relatedType: 'abnormal_report',
        createdAt: report.createdAt,
      });

      report.supplements.forEach(sup => {
        events.push({
          id: sup.id,
          taskId,
          type: 'supplement',
          title: '补充资料',
          description: sup.note,
          createdAt: sup.createdAt,
          relatedId: report.id,
          relatedType: 'abnormal_report',
        });
      });

      if (report.status === 'closed') {
        events.push({
          id: `${report.id}-resolved`,
          taskId,
          type: 'abnormal_resolved',
          title: '异常已关闭',
          description: report.dispatcherRemark || '温度恢复正常，异常已处理完毕',
          relatedId: report.id,
          relatedType: 'abnormal_report',
          createdAt: report.statusUpdatedAt,
        });
      }
    });

    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  createAbnormalReport: (data) => {
    const record = get().temperatureRecords.find(r => r.id === data.recordId);
    const task = get().tasks.find(t => t.id === data.taskId);
    const now = new Date().toISOString();

    const report: AbnormalReport = {
      id: generateId('ABN'),
      taskId: data.taskId,
      recordId: data.recordId,
      temperature: record?.temperature ?? 0,
      targetTempMin: task?.targetTempMin ?? -22,
      targetTempMax: task?.targetTempMax ?? -18,
      batteryLevel: record?.batteryLevel ?? 100,
      powerConnected: record?.powerConnected ?? false,
      dispatcherName: data.dispatcherName,
      notifiedDispatcher: true,
      notifiedAt: now,
      tempPhoto: data.tempPhoto,
      sealPhoto: data.sealPhoto,
      powerPhoto: data.powerPhoto,
      actionTaken: data.actionTaken,
      status: 'pending_confirmation',
      statusUpdatedAt: now,
      supplements: [],
      conversationLog: [
        {
          id: generateId('MSG'),
          role: 'driver',
          actorName: '司机',
          content: data.actionTaken,
          tempPhoto: data.tempPhoto,
          sealPhoto: data.sealPhoto,
          powerPhoto: data.powerPhoto,
          statusChange: 'pending_confirmation',
          createdAt: now,
        },
      ],
      createdAt: now,
    };

    set(state => {
      const newReports = [report, ...state.abnormalReports];
      persistAbnormalReports(newReports);

      const newRecords = state.temperatureRecords.map(r =>
        r.id === data.recordId
          ? { ...r, status: 'temp_abnormal_reported' as TempStatus, isAbnormal: true, abnormalReportId: report.id }
          : r
      );
      persistRecords(newRecords);

      const newTasks = state.tasks.map(t =>
        t.id === data.taskId
          ? { ...t, abnormalReports: [...t.abnormalReports, report] }
          : t
      );
      persistTasks(newTasks);

      return {
        abnormalReports: newReports,
        temperatureRecords: newRecords,
        tasks: newTasks,
      };
    });

    return report;
  },

  createAbnormalReportDirect: (data) => {
    const task = get().tasks.find(t => t.id === data.taskId);
    const now = new Date().toISOString();

    const report: AbnormalReport = {
      id: generateId('ABN'),
      taskId: data.taskId,
      recordId: undefined,
      temperature: data.temperature,
      targetTempMin: task?.targetTempMin ?? -22,
      targetTempMax: task?.targetTempMax ?? -18,
      batteryLevel: data.batteryLevel,
      powerConnected: data.powerConnected,
      dispatcherName: data.dispatcherName,
      notifiedDispatcher: true,
      notifiedAt: now,
      tempPhoto: data.tempPhoto,
      sealPhoto: data.sealPhoto,
      powerPhoto: data.powerPhoto,
      actionTaken: data.actionTaken,
      status: 'pending_confirmation',
      statusUpdatedAt: now,
      supplements: [],
      conversationLog: [
        {
          id: generateId('MSG'),
          role: 'driver',
          actorName: '司机',
          content: data.actionTaken,
          tempPhoto: data.tempPhoto,
          sealPhoto: data.sealPhoto,
          powerPhoto: data.powerPhoto,
          statusChange: 'pending_confirmation',
          createdAt: now,
        },
      ],
      createdAt: now,
    };

    set(state => {
      const newReports = [report, ...state.abnormalReports];
      persistAbnormalReports(newReports);

      const newTasks = state.tasks.map(t =>
        t.id === data.taskId
          ? { ...t, abnormalReports: [...t.abnormalReports, report] }
          : t
      );
      persistTasks(newTasks);

      return {
        abnormalReports: newReports,
        tasks: newTasks,
      };
    });

    return report;
  },

  supplementAbnormalReport: (reportId, data) => {
    const now = new Date().toISOString();
    const entry: SupplementEntry = {
      id: generateId('SUP'),
      tempPhoto: data.tempPhoto,
      sealPhoto: data.sealPhoto,
      powerPhoto: data.powerPhoto,
      note: data.note,
      createdAt: now,
    };

    const conversationEntry: ConversationEntry = {
      id: generateId('MSG'),
      role: 'driver',
      actorName: '司机',
      content: data.note,
      tempPhoto: data.tempPhoto,
      sealPhoto: data.sealPhoto,
      powerPhoto: data.powerPhoto,
      createdAt: now,
    };

    set(state => {
      const newReports = state.abnormalReports.map(r =>
        r.id === reportId
          ? { 
              ...r, 
              supplements: [...r.supplements, entry],
              conversationLog: [...r.conversationLog, conversationEntry],
              statusUpdatedAt: now,
            }
          : r
      );
      persistAbnormalReports(newReports);

      const newTasks = state.tasks.map(task => ({
        ...task,
        abnormalReports: task.abnormalReports.map(r =>
          r.id === reportId
            ? { 
                ...r, 
                supplements: [...r.supplements, entry],
                conversationLog: [...r.conversationLog, conversationEntry],
                statusUpdatedAt: now,
              }
            : r
        ),
      }));
      persistTasks(newTasks);

      return {
        abnormalReports: newReports,
        tasks: newTasks,
      };
    });
  },

  updateAbnormalStatus: (reportId, status, dispatcherRemark) => {
    const now = new Date().toISOString();
    const report = get().abnormalReports.find(r => r.id === reportId);
    const dispatcherName = report?.dispatcherName || '调度';

    const conversationEntry: ConversationEntry | null = dispatcherRemark
      ? {
          id: generateId('MSG'),
          role: 'dispatcher',
          actorName: dispatcherName,
          content: dispatcherRemark,
          statusChange: status,
          createdAt: now,
        }
      : null;

    set(state => {
      const newReports = state.abnormalReports.map(r =>
        r.id === reportId
          ? {
              ...r,
              status,
              statusUpdatedAt: now,
              dispatcherRemark: dispatcherRemark ?? r.dispatcherRemark,
              conversationLog: conversationEntry
                ? [...r.conversationLog, conversationEntry]
                : r.conversationLog,
            }
          : r
      );
      persistAbnormalReports(newReports);

      const newTasks = state.tasks.map(task => ({
        ...task,
        abnormalReports: task.abnormalReports.map(r =>
          r.id === reportId
            ? {
                ...r,
                status,
                statusUpdatedAt: now,
                dispatcherRemark: dispatcherRemark ?? r.dispatcherRemark,
                conversationLog: conversationEntry
                  ? [...r.conversationLog, conversationEntry]
                  : r.conversationLog,
              }
            : r
        ),
      }));
      persistTasks(newTasks);

      return {
        abnormalReports: newReports,
        tasks: newTasks,
      };
    });
  },

  addConversationEntry: (reportId, entry) => {
    const now = new Date().toISOString();
    const newEntry: ConversationEntry = {
      ...entry,
      id: generateId('MSG'),
      createdAt: now,
    };

    set(state => {
      const newReports = state.abnormalReports.map(r =>
        r.id === reportId
          ? { ...r, conversationLog: [...r.conversationLog, newEntry], statusUpdatedAt: now }
          : r
      );
      persistAbnormalReports(newReports);

      const newTasks = state.tasks.map(task => ({
        ...task,
        abnormalReports: task.abnormalReports.map(r =>
          r.id === reportId
            ? { ...r, conversationLog: [...r.conversationLog, newEntry], statusUpdatedAt: now }
            : r
        ),
      }));
      persistTasks(newTasks);

      return {
        abnormalReports: newReports,
        tasks: newTasks,
      };
    });
  },

  getAbnormalReport: (reportId) => {
    return get().abnormalReports.find(r => r.id === reportId);
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

  updateTaskStage: (taskId, stage) => {
    set(state => {
      const newTasks = state.tasks.map(task =>
        task.id === taskId
          ? { ...task, stage, stageStartedAt: new Date().toISOString() }
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
    localStorage.removeItem(STORAGE_KEYS.ABNORMAL_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
    localStorage.removeItem(STORAGE_KEYS.LIVE_DATA);
    set({
      tasks: mockTasks,
      temperatureRecords: mockTemperatureRecords,
      abnormalReports: mockAbnormalReports,
      currentTaskId: initialTask?.id ?? null,
      liveTemperature: -19.6,
      batteryLevel: 87,
      powerConnected: false,
      lastDoorOpen: '2026-06-21T06:35:00+08:00',
    });
  },
}));
