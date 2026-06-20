import { motion } from 'framer-motion';
import { 
  Clock, MapPin, Thermometer, AlertTriangle, CheckCircle2,
  Play, Package, Ship, Truck, Home, Eye, Plus, ChevronRight
} from 'lucide-react';
import type { StageEvent, TaskStage } from '../../types';
import { formatDateTime, formatRelativeTime, classNames } from '../../utils';
import type { LucideIcon } from 'lucide-react';

interface StageTimelineProps {
  events: StageEvent[];
  onEventClick?: (event: StageEvent) => void;
}

const stageIcons: Record<TaskStage, LucideIcon> = {
  pickup: Package,
  transit: Truck,
  port: Ship,
  transload: Package,
  delivered: Home,
};

const eventTypeConfig: Record<StageEvent['type'], { icon: LucideIcon; color: string; bgColor: string; dotColor: string }> = {
  stage_start: { icon: Play, color: 'text-ice', bgColor: 'bg-ice/15', dotColor: 'bg-ice' },
  checkin: { icon: MapPin, color: 'text-safe-green', bgColor: 'bg-safe-green/15', dotColor: 'bg-safe-green' },
  temperature_record: { icon: Thermometer, color: 'text-cold-deep', bgColor: 'bg-cold-deep/10', dotColor: 'bg-cold-deep' },
  abnormal_report: { icon: AlertTriangle, color: 'text-danger-red', bgColor: 'bg-danger-red/15', dotColor: 'bg-danger-red' },
  abnormal_resolved: { icon: CheckCircle2, color: 'text-safe-green', bgColor: 'bg-safe-green/15', dotColor: 'bg-safe-green' },
  supplement: { icon: Plus, color: 'text-ice', bgColor: 'bg-ice/10', dotColor: 'bg-ice' },
};

function StageTimeline({ events, onEventClick }: StageTimelineProps) {
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
          const isLast = idx === events.length - 1;
          const isClickable = event.relatedId && event.relatedType && onEventClick;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={classNames(
                'relative pl-14 pb-5',
                isClickable && 'cursor-pointer'
              )}
              onClick={() => isClickable && onEventClick?.(event)}
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

              <div className={classNames(
                'pt-1 rounded-xl transition-colors',
                isClickable && 'hover:bg-gray-50 -mx-2 px-2'
              )}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-ink-dark leading-snug flex items-center gap-1.5">
                    {event.title}
                    {isClickable && (
                      <ChevronRight className="w-3.5 h-3.5 text-ink-light" />
                    )}
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-ink-light">
                    {formatDateTime(event.createdAt)}
                  </p>
                  {isClickable && (
                    <span className="text-[10px] text-ice font-semibold flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {event.relatedType === 'abnormal_report' ? '查看处置单' :
                       event.relatedType === 'temperature_record' ? '查看打卡' : '查看详情'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default StageTimeline;
