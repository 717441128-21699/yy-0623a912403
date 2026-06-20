import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Tag, Ship, User, Phone, MapPin, Check, Loader2 } from 'lucide-react';
import type { Task } from '../../types';
import { TEMP_STATUS_LABELS, TASK_STAGE_LABELS } from '../../types';
import ProgressTracker from './ProgressTracker';
import { useAppStore } from '../../store/useAppStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { formatDateTime, classNames } from '../../utils';

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
}

function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  const { addCheckIn, getTaskRecords } = useAppStore();
  const { getLocation, loading: geoLoading } = useGeolocation();
  const [signingType, setSigningType] = useState<'transload' | 'supervision_warehouse' | null>(null);
  const [signSuccess, setSignSuccess] = useState<string | null>(null);

  const lastRecord = getTaskRecords(task.id)[0];
  const hasTransloadCheckIn = task.checkIns.some(c => c.type === 'transload');
  const hasWarehouseCheckIn = task.checkIns.some(c => c.type === 'supervision_warehouse');

  const tempColor = (() => {
    if (lastRecord) {
      if (lastRecord.temperature < task.tempMin - 2 || lastRecord.temperature > task.tempMax + 2) return 'danger';
      if (lastRecord.temperature < task.tempMin || lastRecord.temperature > task.tempMax) return 'warn';
    }
    return 'safe';
  })();

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
        className="p-5 cursor-pointer active:scale-[0.995] transition-transform"
        onClick={onSelect}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={classNames(
            'w-1.5 self-stretch rounded-full min-h-[80px]',
            task.tempMax <= 0
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

            <div className="flex items-center gap-2 mb-3">
              <div className={classNames(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold temp-digit',
                tempColor === 'safe' && 'bg-safe-green/10 text-safe-green',
                tempColor === 'warn' && 'bg-warn-orange/15 text-warn-orange',
                tempColor === 'danger' && 'bg-danger-red/10 text-danger-red'
              )}>
                <Thermometer className="w-4 h-4" />
                {task.tempRange}
              </div>
              {lastRecord && (
                <span className="text-xs text-ink-gray">
                  最近: <span className={classNames(
                    'font-semibold temp-digit',
                    tempColor === 'safe' && 'text-safe-green',
                    tempColor === 'warn' && 'text-warn-orange',
                    tempColor === 'danger' && 'text-danger-red'
                  )}>{lastRecord.temperature.toFixed(1)}°C</span>
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

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 pt-5 mt-2">
                <p className="text-xs font-semibold text-ink-gray mb-4 px-1">任务进度</p>
                <ProgressTracker currentStage={task.stage} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSelected && (
        <div className="px-5 pb-5 pt-2 space-y-3 bg-gray-50/50 border-t border-gray-100">
          {task.checkIns.length > 0 && (
            <div className="space-y-2 py-2">
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              disabled={!!signingType || hasTransloadCheckIn}
              onClick={() => handleCheckIn('transload')}
              className={classNames(
                'relative overflow-hidden min-h-[52px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]',
                hasTransloadCheckIn
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
                  {hasTransloadCheckIn ? '已签换装点' : '换装点签到'}
                </>
              )}
            </button>

            <button
              disabled={!!signingType || hasWarehouseCheckIn}
              onClick={() => handleCheckIn('supervision_warehouse')}
              className={classNames(
                'relative overflow-hidden min-h-[52px] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]',
                hasWarehouseCheckIn
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
                  {hasWarehouseCheckIn ? '已签监管仓' : '监管仓签到'}
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
