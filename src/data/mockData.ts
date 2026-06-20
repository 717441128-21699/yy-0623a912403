import type { Task, Driver, TemperatureRecord, PortStepData, ContactInfo, AbnormalReport } from '../types';

export const mockDriver: Driver = {
  id: 'DRV-2026-0881',
  name: '张建国',
  phone: '138****6623',
  plateNumber: '粤Z·B728港',
};

const now = new Date('2026-06-21T10:45:00+08:00').getTime();
const hourMs = 60 * 60 * 1000;

export const mockAbnormalReports: AbnormalReport[] = [
  {
    id: 'ABN-001',
    taskId: 'TASK-20260621-001',
    recordId: 'REC-006',
    temperature: -15.2,
    targetTempMin: -22,
    targetTempMax: -18,
    batteryLevel: 82,
    powerConnected: false,
    dispatcherName: '刘调度',
    notifiedDispatcher: true,
    notifiedAt: new Date(now - 30 * 60 * 1000).toISOString(),
    actionTaken: '已接通外接电源，冷机运行正常，观察温度回升中。预计10分钟内恢复到正常范围。',
    status: 'additional_info_requested',
    statusUpdatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
    dispatcherRemark: '请补拍冷机运行状态照片和当前温度表',
    supplements: [],
    conversationLog: [
      {
        id: 'MSG-001',
        role: 'driver',
        actorName: '张建国（司机）',
        content: '已接通外接电源，冷机运行正常，观察温度回升中。预计10分钟内恢复到正常范围。',
        statusChange: 'pending_confirmation',
        createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'MSG-002',
        role: 'dispatcher',
        actorName: '刘调度',
        content: '已收到异常上报，正在协调口岸现场。请补拍冷机运行状态照片和当前温度表，方便进一步判断。',
        statusChange: 'additional_info_requested',
        createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
  },
];

export const mockTasks: Task[] = [
  {
    id: 'TASK-20260621-001',
    cargoName: '冷冻牛肉（澳洲和牛M9）',
    tempRange: '-18°C ~ -22°C',
    targetTempMin: -22,
    targetTempMax: -18,
    sealNumber: 'CNOOC-88271564',
    targetPort: '深圳湾口岸',
    contactName: '李经理',
    contactPhone: '13928477615',
    stage: 'port',
    stageStartedAt: new Date(now - 2 * hourMs).toISOString(),
    checkIns: [
      {
        id: 'CI-001',
        taskId: 'TASK-20260621-001',
        type: 'transload',
        latitude: 22.5032,
        longitude: 113.9357,
        locationName: '香港元朗冷链仓储中心',
        createdAt: '2026-06-21T06:30:00+08:00',
      },
    ],
    abnormalReports: mockAbnormalReports.filter(r => r.taskId === 'TASK-20260621-001'),
    createdAt: '2026-06-21T05:00:00+08:00',
  },
  {
    id: 'TASK-20260621-002',
    cargoName: '进口三文鱼（冰鲜）',
    tempRange: '0°C ~ 4°C',
    targetTempMin: 0,
    targetTempMax: 4,
    sealNumber: 'COSCO-55120987',
    targetPort: '皇岗口岸',
    contactName: '王主管',
    contactPhone: '13800138000',
    stage: 'transit',
    stageStartedAt: new Date(now - 3 * hourMs).toISOString(),
    checkIns: [],
    abnormalReports: [],
    createdAt: '2026-06-21T04:30:00+08:00',
  },
];

export const mockTemperatureRecords: TemperatureRecord[] = [
  {
    id: 'REC-006',
    taskId: 'TASK-20260621-001',
    temperature: -15.2,
    batteryLevel: 82,
    powerConnected: false,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'temp_abnormal_reported',
    isAbnormal: true,
    abnormalReportId: 'ABN-001',
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'REC-005',
    taskId: 'TASK-20260621-001',
    temperature: -19.6,
    batteryLevel: 87,
    powerConnected: false,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'waiting_inspection',
    remark: '口岸排队中，冷机运行正常',
    createdAt: new Date(now).toISOString(),
  },
  {
    id: 'REC-004',
    taskId: 'TASK-20260621-001',
    temperature: -20.1,
    batteryLevel: 91,
    powerConnected: false,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'normal_transit',
    createdAt: new Date(now - hourMs).toISOString(),
  },
  {
    id: 'REC-003',
    taskId: 'TASK-20260621-001',
    temperature: -19.8,
    batteryLevel: 94,
    powerConnected: true,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'power_connected',
    remark: '换装场临时接电',
    createdAt: new Date(now - 2 * hourMs).toISOString(),
  },
  {
    id: 'REC-002',
    taskId: 'TASK-20260621-001',
    temperature: -20.5,
    batteryLevel: 96,
    powerConnected: false,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'ice_refilled',
    createdAt: new Date(now - 3 * hourMs).toISOString(),
  },
  {
    id: 'REC-001',
    taskId: 'TASK-20260621-001',
    temperature: -21.0,
    batteryLevel: 98,
    powerConnected: false,
    lastDoorOpen: '2026-06-21T06:35:00+08:00',
    status: 'normal_transit',
    createdAt: new Date(now - 4 * hourMs).toISOString(),
  },
];

export const mockPortSteps: PortStepData[] = [
  {
    stage: 'queue',
    title: '排队等待',
    icon: 'Clock',
    steps: [
      '确认冷机持续运行，切勿熄火断电',
      '每30分钟查看一次车厢温度，超温立即上报',
      '准备好报关单、司机本、健康码备查',
      '排队时禁止随意开关车门，保持铅封完好',
    ],
    highlightWords: ['冷机不断电', '30分钟', '禁止开关车门'],
  },
  {
    stage: 'prepare',
    title: '查验准备',
    icon: 'ClipboardList',
    steps: [
      '将车辆停入指定查验位，拉手刹+垫木',
      '保持冷机运行，记录当前温度并拍照',
      '提前联系调度确认是否需要临时接电',
      '准备铅封剪，待海关人员到场后方可剪封',
    ],
    highlightWords: ['冷机运行', '拍照留证', '海关到场后剪封'],
  },
  {
    stage: 'inspection',
    title: '开门查验',
    icon: 'DoorOpen',
    steps: [
      '海关指令下达后方可开门，全程录像',
      '开门后3分钟内完成第一次温度复测并记录',
      '查验过程尽量缩小开门幅度，减少冷气流失',
      '查验完毕立即关门，启动冷机，5分钟后复测温度',
      '温度恢复正常后重新施加铅封并拍照存档',
    ],
    highlightWords: ['3分钟内复测', '缩小开门幅度', '5分钟后复测'],
  },
  {
    stage: 'transload',
    title: '换装作业',
    icon: 'Truck',
    steps: [
      '确认换装区温度符合货品要求方可作业',
      '全程保持冷链不断链，优先使用保温对接门',
      '每板货物交接时核对批次与温度记录',
      '换装完毕立即测温、施封、拍照上传',
    ],
    highlightWords: ['冷链不断链', '立即测温施封'],
  },
  {
    stage: 'emergency',
    title: '异常处理',
    icon: 'AlertTriangle',
    steps: [
      '温度异常第一时间拨打调度电话，切勿擅自移动',
      '记录异常开始时间、当前温度、环境温度',
      '如断电超过10分钟，通知调度启动备用冷机方案',
      '海关查验导致升温，立即请求现场关员协助快速处理',
      '处理完毕后形成完整异常报告提交调度',
    ],
    highlightWords: ['先联系调度', '切勿擅自移动', '完整异常报告'],
  },
];

export const mockEmergencyContacts: ContactInfo[] = [
  { role: '调度中心', name: '刘调度', phone: '400-888-6688' },
  { role: '现场协调', name: '陈专员', phone: '136-0000-1122' },
  { role: '报关行', name: '周经理', phone: '139-2222-3344' },
];
