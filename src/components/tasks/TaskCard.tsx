import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Thermometer, Tag, Ship, User, Phone, MapPin, Check, Loader2, 
  AlertTriangle, CircleCheck, CircleDot, Ban, AlertCircle,
  ThermometerSun, Clock
} from 'lucide-react';
import type { Task, AbnormalReport, StageEvent } from '../../types';
import { TEMP_STATUS_LABELS, TASK_STAGE_LABELS, ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS } from '../../types';
import ProgressTracker from './ProgressTracker';
import StageTimeline from './StageTimeline';
import { useAppStore } from '../../store/useAppStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { formatDateTime, formatRelativeTime, classNames, getTempStatusColor } from '../../utils';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onViewAbnormalReport?: (report: AbnormalReport) => void;
  onEventClick?: (event: StageEvent) => void;
}

function TaskCard({ task, isSelected, onSelect, onViewAbnormalReport, onEventClick }: TaskCardProps) {
  const { addCheckIn, getTaskRecords, getTaskSummary, getStageTimeline, getTaskAbnormalReports } = useAppStore();
  const { getLocation } = useGeolocation();
  const [signingType, setSigningType] = useState<'transload' | 'supervision_warehouse' | null>(null);
  const [signSuccess, setSignSuccess] = useState<string | null>(null);

  const summary = getTaskSummary(task.id);
  const lastRecord = getTaskRecords(task.id)[0];

  const tempColor = summary.lastTemp !== null
    ? getTempStatusColor(summary.lastTemp, task.targetTempMin, task.targetTempMax)
    : 'safe';

  const handleCheckIn = async (type: 'transload' | 'supervision_warehouse') => {
    setSigningType(type);
    setSignSuccess(null);
    try {
      const location = await getLocation();
      addCheckIn(task.id, type, location);
      setSignSuccess(type);
      setTimeout(() => setSignSuccess(null), 2500);
    } finally {
      setSigningType(null);
    }
  };

  return (
    <motion.div
      layout
      className={classNames(
        'card-base overflow-hidden transition-all duration-300',
        isSelected ? 'ring-2 ring-ice/50' : ''
      )}
    >
      <div
        className="cursor-pointer active:scale-[0.995] transition-transform"
        onClick={onSelect}
      >
        <div className="px-5 pt-4 pb-2 flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ThermometerSun className={classNames(
                'w-4 h-4',
                tempColor === 'safe' ? 'text-safe-green' :
                tempColor === 'warn' ? 'text-warn-orange' : 'text-danger-red'
              )} />
              <span className="text-xs font-semibold text-ink-gray">温控状态</span>
            </div>
            {summary.lastTemp !== null && (
              <span className={classNames(
                'text-sm font-bold temp-digit',
                tempColor === 'safe' ? 'text-safe-green' :
                tempColor === 'warn' ? 'text-warn-orange' : 'text-danger-red'
              )}>
                {summary.lastTemp.toFixed(1)}°C
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className={classNames(
                'w-2 h-2 rounded-full',
                summary.hasTransloadCheckIn ? 'bg-safe-green' : 'bg-ink-light'
              )} />
              <span className="text-[11px] text-ink-gray">
                {summary.hasTransloadCheckIn ? '已签换装' : '换装待签'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={classNames(
                'w-2 h-2 rounded-full',
                summary.hasWarehouseCheckIn ? 'bg-safe-green' : 'bg-ink-light'
              )} />
              <span className="text-[11px] text-ink-gray">
                {summary.hasWarehouseCheckIn ? '已签监管仓' : '监管仓待签'}
              </span>
            </div>
            {summary.hasAbnormal && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-red/10">
                  <AlertTriangle className="w-3 h-3 text-danger-red" />
                  <span className="text-[10px] font-bold text-danger-red">
                    {summary.abnormalCount}次异常
                  </span>
                </div>
                {summary.pendingAbnormalCount > 0 && summary.abnormalStatus && (
                  <div className={classNames(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full',
                    ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'warn-orange' && 'bg-warn-orange/10',
                    ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'ice' && 'bg-ice/15',
                    ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'danger-red' && 'bg-danger-red/10',
                    ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'safe-green' && 'bg-safe-green/10'
                  )}>
                    <AlertCircle className={classNames(
                      'w-3 h-3',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'warn-orange' && 'text-warn-orange',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'ice' && 'text-cold-deep',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'danger-red' && 'text-danger-red',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'safe-green' && 'text-safe-green'
                    )} />
                    <span className={classNames(
                      'text-[10px] font-bold',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'warn-orange' && 'text-warn-orange',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'ice' && 'text-cold-deep',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'danger-red' && 'text-danger-red',
                      ABNORMAL_STATUS_COLORS[summary.abnormalStatus] === 'safe-green' && 'text-safe-green'
                    )}>
                      {ABNORMAL_STATUS_LABELS[summary.abnormalStatus]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className={classNames(
              'w-1.5 self-stretch rounded-full min-h-[60px]',
              task.targetTempMax <= 0
                ? 'bg-gradient-to-b from-cold-deep to-ice'
                : 'bg-gradient-to-b from-ice to-safe-green'
            )} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-ink-dark leading-snug">
                  {task.cargoName}
                </h3>
                <span className="status-pill flex-shrink-0 bg-cold-deep/10 text-cold-deep">
                  {TASK_STAGE_LABELS[task.stage]}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className={classNames(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold temp-digit',
                  tempColor === 'safe' && 'bg-safe-green/10 text-safe-green',
                  tempColor === 'warn' && 'bg-warn-orange/15 text-warn-orange',
                  tempColor === 'danger' && 'bg-danger-red/10 text-danger-red'
                )}>
                  <Thermometer className="w-4 h-4" />
                  {task.tempRange}
                </div>
                {summary.lastStatus && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-ink-gray flex items-center gap-1">
                    {summary.lastStatus === 'temp_abnormal' || summary.lastStatus === 'temp_abnormal_reported' ? (
                      <AlertCircle className="w-3 h-3 text-danger-red" />
                    ) : summary.lastStatus === 'normal_transit' ? (
                      <CircleCheck className="w-3 h-3 text-safe-green" />
                    ) : (
                      <CircleDot className="w-3 h-3 text-ice" />
                    )}
                    {TEMP_STATUS_LABELS[summary.lastStatus]}
                  </span>
                )}
                {summary.lastRecordTime && (
                  <span className="text-[11px] text-ink-light">
                    · {formatRelativeTime(summary.lastRecordTime)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                <div className="flex items-center gap-2 text-ink-gray min-w-0">
                  <Tag className="w-4 h-4 flex-shrink-0 text-ice" />
                  <span className="truncate">{task.sealNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-gray min-w-0">
                  <Ship className="w-4 h-4 flex-shrink-0 text-ice" />
                  <span className="truncate">{task.targetPort}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-gray min-w-0 col-span-2">
                  <User className="w-4 h-4 flex-shrink-0 text-ice" />
                  <span className="truncate">{task.contactName}</span>
                  <a
                    href={`tel:${task.contactPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded-full bg-ice/10 text-cold-deep font-semibold text-xs hover:bg-ice/20 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    拨打
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 py-2 px-2 rounded-xl bg-gray-50">
            <div className="flex flex-col items-center gap-1">
              <div className={classNames(
                'w-6 h-6 rounded-full flex items-center justify-center',
                summary.recordCount > 0 ? 'bg-safe-green/15' : 'bg-gray-200'
              )}>
                {summary.recordCount > 0 ? (
                  <Check className="w-3.5 h-3.5 text-safe-green" />
                ) : (
                  <Ban className="w-3.5 h-3.5 text-ink-light" />
                )}
              </div>
              <span className="text-[10px] text-ink-gray">打卡{summary.recordCount}次</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={classNames(
                'w-6 h-6 rounded-full flex items-center justify-center',
                summary.hasTransloadCheckIn ? 'bg-safe-green/15' : 'bg-gray-200'
              )}>
                {summary.hasTransloadCheckIn ? (
                  <Check className="w-3.5 h-3.5 text-safe-green" />
                ) : (
                  <Ban className="w-3.5 h-3.5 text-ink-light" />
                )}
              </div>
              <span className="text-[10px] text-ink-gray">换装点</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={classNames(
                'w-6 h-6 rounded-full flex items-center justify-center',
                summary.hasWarehouseCheckIn ? 'bg-safe-green/15' : 'bg-gray-200'
              )}>
                {summary.hasWarehouseCheckIn ? (
                  <Check className="w-3.5 h-3.5 text-safe-green" />
                ) : (
                  <Ban className="w-3.5 h-3.5 text-ink-light" />
                )}
              </div>
              <span className="text-[10px] text-ink-gray">监管仓</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className={classNames(
                'w-6 h-6 rounded-full flex items-center justify-center',
                !summary.hasAbnormal ? 'bg-safe-green/15' : 'bg-danger-red/15'
              )}>
                {!summary.hasAbnormal ? (
                  <Check className="w-3.5 h-3.5 text-safe-green" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-danger-red" />
                )}
              </div>
              <span className="text-[10px] text-ink-gray">
                {summary.hasAbnormal ? `${summary.abnormalCount}次异常` : '无异常'}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 pt-5 mt-4">
                  <p className="text-xs font-semibold text-ink-gray mb-4 px-1">任务进度</p>
                  <ProgressTracker currentStage={task.stage} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isSelected && (
        <div className="px-5 pb-5 pt-2 space-y-4 bg-gray-50/50 border-t border-gray-100">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h4 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-ice" />
              任务阶段时间线
            </h4>
            <StageTimeline 
              events={getStageTimeline(task.id)} 
              onEventClick={onEventClick}
            />
          </div>

          {getTaskAbnormalReports(task.id).length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h4 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-danger-red" />
                异常处置记录
                <span className="ml-auto text-xs font-normal text-ink-gray">
                  {getTaskAbnormalReports(task.id).length} 条
                </span>
              </h4>
              <div className="space-y-2">
                {getTaskAbnormalReports(task.id).map(report => (
                  <div 
                    key={report.id} 
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 cursor-pointer hover:bg-ice/5 transition-colors"
                    onClick={() => onViewAbnormalReport?.(report)}
                  >
                    <div className={classNames(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      report.status === 'closed' ? 'bg-safe-green/15' : 'bg-warn-orange/15'
                    )}>
                      {report.status === 'closed' ? (
                        <Check className="w-5 h-5 text-safe-green" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warn-orange" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-ink-dark temp-digit">
                          {report.temperature.toFixed(1)}°C
                        </p>
                        <span className={classNames(
                          'status-pill text-[10px] font-semibold',
                          ABNORMAL_STATUS_COLORS[report.status] === 'warn-orange' && 'bg-warn-orange/10 text-warn-orange',
                          ABNORMAL_STATUS_COLORS[report.status] === 'ice' && 'bg-ice/15 text-cold-deep',
                          ABNORMAL_STATUS_COLORS[report.status] === 'danger-red' && 'bg-danger-red/10 text-danger-red',
                          ABNORMAL_STATUS_COLORS[report.status] === 'safe-green' && 'bg-safe-green/10 text-safe-green'
                        )}>
                          {ABNORMAL_STATUS_LABELS[report.status]}
                        </span>
                      </div>
                      <p className="text-xs text-ink-gray truncate">
                        {report.actionTaken}
                      </p>
                    </div>
                    <span className="text-[10px] text-ink-light temp-digit flex-shrink-0">
                      {formatRelativeTime(report.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.checkIns.length > 0 && (
            <div className="space-y-2 py-1">
              {task.checkIns.map(checkIn => (
                <div key={checkIn.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-safe-green/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-safe-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-dark">
                      {checkIn.type === 'transload' ? '换装点签到' : '监管仓签到'}
                    </p>
                    <p className="text-xs text-ink-gray flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{checkIn.locationName}</span>
                    </p>
                  </div>
                  <span className="text-xs text-ink-light temp-digit">
                    {formatDateTime(checkIn.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {lastRecord && (
            <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-gray mb-1">最近打卡状态</p>
                <p className="text-sm font-semibold text-cold-deep">
                  {TEMP_STATUS_LABELS[lastRecord.status]}
                </p>
              </div>
              <span className="text-xs text-ink-light temp-digit">
                {formatDateTime(lastRecord.createdAt)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              disabled={!!signingType || summary.hasTransloadCheckIn}
              onClick={() => handleCheckIn('transload')}
              className={classNames(
                'relative overflow-hidden min-h-[52px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]',
                summary.hasTransloadCheckIn
                  ? 'bg-safe-green/15 text-safe-green border-2 border-safe-green/30'
                  : 'btn-primary !py-3 !min-h-[52px]'
              )}
            >
              {signingType === 'transload' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : signSuccess === 'transload' ? (
                <Check className="w-5 h-5" />
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  {summary.hasTransloadCheckIn ? '已签换装点' : '换装点签到'}
                </>
              )}
            </button>

            <button
              disabled={!!signingType || summary.hasWarehouseCheckIn}
              onClick={() => handleCheckIn('supervision_warehouse')}
              className={classNames(
                'relative overflow-hidden min-h-[52px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]',
                summary.hasWarehouseCheckIn
                  ? 'bg-safe-green/15 text-safe-green border-2 border-safe-green/30'
                  : 'btn-ghost !py-3 !min-h-[52px]'
              )}
            >
              {signingType === 'supervision_warehouse' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : signSuccess === 'supervision_warehouse' ? (
                <Check className="w-5 h-5" />
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  {summary.hasWarehouseCheckIn ? '已签监管仓' : '监管仓签到'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default TaskCard;
