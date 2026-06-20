import { motion } from 'framer-motion';
import { 
  Clock, MapPin, Thermometer, AlertTriangle, CheckCircle2,
  Play, Package, Ship, Truck, Home
} from 'lucide-react';
import type { StageEvent, TaskStage } from '../../types';
import { TASK_STAGE_LABELS } from '../../types';
import { formatDateTime, formatRelativeTime, classNames } from '../../utils';

interface StageTimelineProps {
  events: StageEvent[];
}

const stageIcons: Record<TaskStage, any> = {
  pickup: Package,
  transit: Truck,
  port: Ship,
  transload: Package,
  delivered: Home,
};

const eventTypeConfig: Record<StageEvent['type'], { icon: any; color: string; bgColor: string }> = {
  stage_start: { icon: Play, color: 'text-ice', bgColor: 'bg-ice/15' },
  checkin: { icon: MapPin, color: 'text-safe-green', bgColor: 'bg-safe-green/15' },
  temperature_record: { icon: Thermometer, color: 'text-cold-deep', bgColor: 'bg-cold-deep/10' },
  abnormal_report: { icon: AlertTriangle, color: 'text-danger-red', bgColor: 'bg-danger-red/15' },
  abnormal_resolved: { icon: CheckCircle2, color: 'text-safe-green', bgColor: 'bg-safe-green/15' },
};

function StageTimeline({ events }: StageTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-ink-light">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-xs">暂无阶段记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-0">
        {events.map((event, idx) => {
          const config = eventTypeConfig[event.type];
          const EventIcon = event.stage && event.type === 'stage_start'
            ? stageIcons[event.stage]
            : config.icon;
          const isFirst = idx === 0;
          const isLast = idx === events.length - 1;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="relative pl-14 pb-5"
            >
              {!isLast && (
                <div className="absolute left-[22px] top-10 bottom-0 w-px bg-gray-100" />
              )}

              <div className={classNames(
                'absolute left-0 top-0 w-11 h-11 rounded-2xl flex items-center justify-center z-10 border border-white shadow-soft',
                config.bgColor
              )}>
                <EventIcon className={classNames('w-5 h-5', config.color)} />
              </div>

              <div className="pt-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-ink-dark leading-snug">
                    {event.title}
                  </h4>
                  <span className="text-[10px] text-ink-light flex-shrink-0 temp-digit whitespace-nowrap">
                    {formatRelativeTime(event.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-ink-gray leading-relaxed mb-1.5">
                  {event.description}
                </p>
                {event.temperature !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Thermometer className={classNames(
                      'w-3.5 h-3.5',
                      event.type === 'abnormal_report' ? 'text-danger-red' : 'text-cold-deep'
                    )} />
                    <span className={classNames(
                      'text-xs font-bold temp-digit',
                      event.type === 'abnormal_report' ? 'text-danger-red' : 'text-cold-deep'
                    )}>
                      {event.temperature.toFixed(1)}°C
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-ink-light mt-1">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default StageTimeline;
