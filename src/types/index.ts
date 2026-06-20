export type TaskStage = 'pickup' | 'transit' | 'port' | 'transload' | 'delivered';

export type TempStatus = 
  | 'waiting_inspection' 
  | 'ice_refilled' 
  | 'power_connected' 
  | 'door_open_inspection' 
  | 'temp_abnormal' 
  | 'normal_transit'
  | 'temp_abnormal_reported';

export interface AbnormalInfo {
  notifiedDispatcher: boolean;
  dispatcherName?: string;
  photosSupplemented: boolean;
  actionTaken: string;
  reportedAt: string;
}

export interface Task {
  id: string;
  cargoName: string;
  tempRange: string;
  targetTempMin: number;
  targetTempMax: number;
  sealNumber: string;
  targetPort: string;
  contactName: string;
  contactPhone: string;
  stage: TaskStage;
  checkIns: CheckIn[];
  createdAt: string;
}

export interface TemperatureRecord {
  id: string;
  taskId: string;
  temperature: number;
  batteryLevel: number;
  powerConnected: boolean;
  lastDoorOpen: string;
  status: TempStatus;
  tempPhoto?: string;
  sealPhoto?: string;
  powerPhoto?: string;
  remark?: string;
  isAbnormal?: boolean;
  abnormalInfo?: AbnormalInfo;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  taskId: string;
  type: 'transload' | 'supervision_warehouse';
  latitude: number;
  longitude: number;
  locationName: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  plateNumber: string;
}

export type PortStage = 'queue' | 'prepare' | 'inspection' | 'transload' | 'emergency';

export interface PortStepData {
  stage: PortStage;
  title: string;
  icon: string;
  steps: string[];
  highlightWords: string[];
}

export interface ContactInfo {
  role: string;
  name: string;
  phone: string;
}

export const TEMP_STATUS_LABELS: Record<TempStatus, string> = {
  waiting_inspection: '等待查验',
  ice_refilled: '补冰完成',
  power_connected: '已接电',
  door_open_inspection: '开门查验中',
  temp_abnormal: '温度异常',
  normal_transit: '正常运输',
  temp_abnormal_reported: '异常已上报',
};

export const TEMP_STATUS_META: Record<TempStatus, { isAbnormal: boolean; priority: number }> = {
  waiting_inspection: { isAbnormal: false, priority: 0 },
  ice_refilled: { isAbnormal: false, priority: 0 },
  power_connected: { isAbnormal: false, priority: 0 },
  door_open_inspection: { isAbnormal: false, priority: 1 },
  temp_abnormal: { isAbnormal: true, priority: 2 },
  normal_transit: { isAbnormal: false, priority: 0 },
  temp_abnormal_reported: { isAbnormal: true, priority: 2 },
};

export const TASK_STAGE_LABELS: Record<TaskStage, string> = {
  pickup: '已提货',
  transit: '运输中',
  port: '到口岸',
  transload: '换装中',
  delivered: '已送达',
};

export const STAGE_ORDER: TaskStage[] = ['pickup', 'transit', 'port', 'transload', 'delivered'];

export const TASK_STAGE_TO_PORT_STAGE: Record<TaskStage, PortStage> = {
  pickup: 'prepare',
  transit: 'queue',
  port: 'queue',
  transload: 'transload',
  delivered: 'queue',
};
