import { motion } from 'framer-motion';
import { Clock, Thermometer, Battery, Zap, DoorOpen, FileText } from 'lucide-react';
import type { TemperatureRecord } from '../../types';
import { TEMP_STATUS_LABELS } from '../../types';
import { formatTime, formatDateTime, classNames } from '../../utils';

interface RecordTimelineProps {
  records: TemperatureRecord[];
}

function RecordTimeline({ records }: RecordTimelineProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-ink-light">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">今日暂无打卡记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-ice/50 via-gray-200 to-transparent" />

      <div className="space-y-4">
        {records.map((record, idx) => {
          const tempColor = 
            record.temperature < -24 || record.temperature > -16 ? 'text-danger-red' :
            record.temperature < -22 || record.temperature > -18 ? 'text-warn-orange' :
            'text-safe-green';

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="relative pl-14"
            >
              <div className="absolute left-0 top-3 w-11 h-11 rounded-2xl bg-white shadow-soft flex flex-col items-center justify-center border border-gray-100 z-10">
                <span className="text-[10px] text-ink-light leading-none">
                  {formatDateTime(record.createdAt).split(' ')[0]}
                </span>
                <span className="text-[11px] font-bold text-cold-deep temp-digit mt-1 leading-none">
                  {formatTime(record.createdAt)}
                </span>
              </div>

              <div className="card-base p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={classNames(
                      'status-pill',
                      record.status === 'temp_abnormal' && 'bg-danger-red/10 text-danger-red',
                      record.status === 'door_open_inspection' && 'bg-warn-orange/10 text-warn-orange',
                      record.status === 'normal_transit' && 'bg-safe-green/10 text-safe-green',
                      (record.status === 'power_connected' || record.status === 'ice_refilled') && 'bg-ice/15 text-cold-deep',
                      record.status === 'waiting_inspection' && 'bg-cold-deep/10 text-cold-deep'
                    )}>
                      {TEMP_STATUS_LABELS[record.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className={`w-4 h-4 ${tempColor}`} />
                    <span className={`font-bold temp-digit text-lg ${tempColor}`}>
                      {record.temperature.toFixed(1)}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-ink-gray flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-ink-light" />
                    <span className="temp-digit">{Math.round(record.batteryLevel)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className={classNames(
                      'w-3.5 h-3.5',
                      record.powerConnected ? 'text-safe-green' : 'text-ink-light'
                    )} />
                    <span>{record.powerConnected ? '已接电' : '未接电'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-ink-light" />
                    <span className="temp-digit">开门{formatTime(record.lastDoorOpen)}</span>
                  </div>
                </div>

                {record.remark && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-ink-light mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-ink-gray leading-relaxed">{record.remark}</p>
                  </div>
                )}

                {(record.tempPhoto || record.sealPhoto || record.powerPhoto) && (
                  <div className="mt-3 flex gap-2">
                    {record.tempPhoto && (
                      <img src={record.tempPhoto} alt="温度表" className="w-14 h-14 object-cover rounded-lg" />
                    )}
                    {record.sealPhoto && (
                      <img src={record.sealPhoto} alt="铅封" className="w-14 h-14 object-cover rounded-lg" />
                    )}
                    {record.powerPhoto && (
                      <img src={record.powerPhoto} alt="电源" className="w-14 h-14 object-cover rounded-lg" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default RecordTimeline;
