export type TaskStage = 'pickup' | 'transit' | 'port' | 'transload' | 'delivered';

export type TempStatus = 
  | 'waiting_inspection' 
  | 'ice_refilled' 
  | 'power_connected' 
  | 'door_open_inspection' 
  | 'temp_abnormal' 
  | 'normal_transit'
  | 'temp_abnormal_reported';

export type AbnormalStatus = 
  | 'pending_confirmation'
  | 'dispatcher_confirmed'
  | 'additional_info_requested'
  | 'closed';

export type TempZoneType = 'frozen' | 'chilled' | 'ambient';

export type ConversationRole = 'driver' | 'dispatcher';

export interface SupplementEntry {
  id: string;
  tempPhoto?: string;
  sealPhoto?: string;
  powerPhoto?: string;
  note: string;
  createdAt: string;
}

export interface ConversationEntry {
  id: string;
  role: ConversationRole;
  actorName: string;
  content: string;
  tempPhoto?: string;
  sealPhoto?: string;
  powerPhoto?: string;
  statusChange?: AbnormalStatus;
  createdAt: string;
}

export interface AbnormalReport {
  id: string;
  taskId: string;
  recordId?: string;
  temperature: number;
  targetTempMin: number;
  targetTempMax: number;
  batteryLevel: number;
  powerConnected: boolean;
  dispatcherName: string;
  notifiedDispatcher: boolean;
  notifiedAt: string;
  tempPhoto?: string;
  sealPhoto?: string;
  powerPhoto?: string;
  actionTaken: string;
  status: AbnormalStatus;
  statusUpdatedAt: string;
  dispatcherRemark?: string;
  supplements: SupplementEntry[];
  conversationLog: ConversationEntry[];
  createdAt: string;
}

export interface StageEvent {
  id: string;
  taskId: string;
  type: 'stage_start' | 'checkin' | 'temperature_record' | 'abnormal_report' | 'abnormal_resolved' | 'supplement';
  stage?: TaskStage;
  title: string;
  description: string;
  temperature?: number;
  photoUrl?: string;
  relatedId?: string;
  relatedType?: 'temperature_record' | 'abnormal_report' | 'checkin';
  createdAt: string;
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
  stageStartedAt: string;
  checkIns: CheckIn[];
  abnormalReports: AbnormalReport[];
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
  abnormalReportId?: string;
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

export const ABNORMAL_STATUS_LABELS: Record<AbnormalStatus, string> = {
  pending_confirmation: '待调度确认',
  dispatcher_confirmed: '调度已确认',
  additional_info_requested: '要求补充资料',
  closed: '已关闭',
};

export const ABNORMAL_STATUS_COLORS: Record<AbnormalStatus, string> = {
  pending_confirmation: 'warn-orange',
  dispatcher_confirmed: 'ice',
  additional_info_requested: 'danger-red',
  closed: 'safe-green',
};

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

export function getTempZoneType(min: number, max: number): TempZoneType {
  if (max <= -10) return 'frozen';
  if (max <= 10) return 'chilled';
  return 'ambient';
}

export const TEMP_ZONE_LABELS: Record<TempZoneType, string> = {
  frozen: '冷冻',
  chilled: '冰鲜',
  ambient: '常温',
};

export const ABNORMAL_TIPS_BY_ZONE: Record<TempZoneType, { title: string; tips: string[] }> = {
  frozen: {
    title: '冷冻货品温度异常',
    tips: [
      '立即检查冷机运行状态，确认是否报警',
      '冷冻货品目标温区通常 ≤ -18°C，需快速处理',
      '如断电超过10分钟，通知调度启动备用冷机方案',
      '记录异常开始时间，每5分钟复测一次温度',
      '切勿擅自开门，避免冷气快速流失',
    ],
  },
  chilled: {
    title: '冰鲜货品温度异常',
    tips: [
      '冰鲜货品目标温区通常 0°C ~ 4°C，对温度波动更敏感',
      '检查是否因开门查验导致的暂时性升温',
      '如温度持续上升，检查冷机制冷效果',
      '三文鱼等高档冰鲜品建议每3分钟复测一次',
      '必要时联系调度安排临时加冰',
    ],
  },
  ambient: {
    title: '常温货品温度异常',
    tips: [
      '检查是否因暴晒导致车厢温度过高',
      '确认通风口是否畅通',
      '如遇高温天气，联系调度是否需要采取降温措施',
      '记录环境温度和车厢温度对比',
    ],
  },
};
