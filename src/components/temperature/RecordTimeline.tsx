import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Thermometer, Battery, Zap, DoorOpen, FileText, 
  AlertTriangle, CheckCircle2, Phone, FileCheck,
  Eye, CircleCheck
} from 'lucide-react';
import type { TemperatureRecord, AbnormalReport } from '../../types';
import { TEMP_STATUS_LABELS, ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS } from '../../types';
import { formatTime, formatDateTime, classNames, getTempStatusColor } from '../../utils';
import { useAppStore } from '../../store/useAppStore';
import PhotoPreview, { PhotoItem } from '../common/PhotoPreview';

interface RecordTimelineProps {
  records: TemperatureRecord[];
  onReportAbnormal?: (record: TemperatureRecord) => void;
  onViewAbnormalReport?: (report: AbnormalReport) => void;
}

function RecordTimeline({ records, onReportAbnormal, onViewAbnormalReport }: RecordTimelineProps) {
  const { getAbnormalReport, getCurrentTask } = useAppStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<PhotoItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentTask = getCurrentTask();

  if (records.length === 0) {
    return (
      <div className="text-center py-10 text-ink-light">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">今日暂无打卡记录</p>
      </div>
    );
  }

  const handlePhotoClick = (photos: PhotoItem[], index: number) => {
    setPreviewPhotos(photos);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const getStatusColorClass = (status: AbnormalReport['status']) => {
    const color = ABNORMAL_STATUS_COLORS[status];
    switch (color) {
      case 'warn-orange': return 'bg-warn-orange/15 text-warn-orange';
      case 'ice': return 'bg-ice/15 text-cold-deep';
      case 'danger-red': return 'bg-danger-red/15 text-danger-red';
      case 'safe-green': return 'bg-safe-green/15 text-safe-green';
      default: return 'bg-gray-100 text-ink-gray';
    }
  };

  return (
    <>
      <div className="relative">
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-ice/50 via-gray-200 to-transparent" />

        <div className="space-y-4">
          {records.map((record, idx) => {
            const tempColor = currentTask
              ? getTempStatusColor(record.temperature, currentTask.targetTempMin, currentTask.targetTempMax)
              : 'safe';

            const tempTextColor = 
              tempColor === 'danger' ? 'text-danger-red' :
              tempColor === 'warn' ? 'text-warn-orange' :
              'text-safe-green';

            const isAbnormal = record.isAbnormal;
            const isAbnormalReported = record.status === 'temp_abnormal_reported';
            const needsReport = isAbnormal && !isAbnormalReported && onReportAbnormal;
            
            const abnormalReport = record.abnormalReportId 
              ? getAbnormalReport(record.abnormalReportId) 
              : undefined;

            const photos: PhotoItem[] = [];
            if (record.tempPhoto) photos.push({ url: record.tempPhoto, label: '温度表照片' });
            if (record.sealPhoto) photos.push({ url: record.sealPhoto, label: '铅封照片' });
            if (record.powerPhoto) photos.push({ url: record.powerPhoto, label: '外接电源照片' });

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                className="relative pl-14"
              >
                <div className={classNames(
                  'absolute left-0 top-3 w-11 h-11 rounded-2xl bg-white shadow-soft flex flex-col items-center justify-center border z-10',
                  isAbnormal ? 'border-danger-red/40 bg-danger-red/5' : 'border-gray-100'
                )}>
                  <span className="text-[10px] text-ink-light leading-none">
                    {formatDateTime(record.createdAt).split(' ')[0]}
                  </span>
                  <span className={classNames(
                    'text-[11px] font-bold temp-digit mt-1 leading-none',
                    isAbnormal ? 'text-danger-red' : 'text-cold-deep'
                  )}>
                    {formatTime(record.createdAt)}
                  </span>
                </div>

                <div className={classNames(
                  'card-base p-4 relative overflow-hidden',
                  isAbnormal && !isAbnormalReported && 'border-2 border-danger-red/30 bg-danger-red/[0.03]',
                  isAbnormalReported && 'border-2 border-safe-green/30 bg-safe-green/[0.03]'
                )}>
                  {isAbnormal && !isAbnormalReported && (
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-danger-red/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
                  )}
                  {isAbnormalReported && (
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-safe-green/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3 relative">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAbnormal && (
                        <span className={classNames(
                          'status-pill flex items-center gap-1',
                          isAbnormalReported 
                            ? 'bg-safe-green/10 text-safe-green' 
                            : 'bg-danger-red/10 text-danger-red'
                        )}>
                          {isAbnormalReported ? (
                            <><FileCheck className="w-3 h-3" /> 已上报</>
                          ) : (
                            <><AlertTriangle className="w-3 h-3" /> 温度异常</>
                          )}
                        </span>
                      )}
                      <span className={classNames(
                        'status-pill',
                        record.status === 'temp_abnormal' && 'bg-danger-red/10 text-danger-red',
                        record.status === 'temp_abnormal_reported' && 'bg-safe-green/10 text-safe-green',
                        record.status === 'door_open_inspection' && 'bg-warn-orange/10 text-warn-orange',
                        record.status === 'normal_transit' && 'bg-safe-green/10 text-safe-green',
                        (record.status === 'power_connected' || record.status === 'ice_refilled') && 'bg-ice/15 text-cold-deep',
                        record.status === 'waiting_inspection' && 'bg-cold-deep/10 text-cold-deep'
                      )}>
                        {TEMP_STATUS_LABELS[record.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className={`w-4 h-4 ${tempTextColor}`} />
                      <span className={`font-bold temp-digit text-lg ${tempTextColor}`}>
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

                  {abnormalReport && (
                    <div className="mt-3 pt-3 border-t border-safe-green/10 bg-safe-green/[0.02] -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <CircleCheck className="w-4 h-4 text-safe-green flex-shrink-0" />
                        <span className="text-xs font-bold text-safe-green">异常已上报处理</span>
                        <span className="text-xs text-ink-light ml-auto">
                          {formatTime(abnormalReport.createdAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center gap-1.5 text-ink-gray">
                          <Phone className="w-3 h-3 text-safe-green" />
                          联系：{abnormalReport.dispatcherName}
                        </div>
                        <div className="flex items-center gap-1.5 text-ink-gray">
                          <FileCheck className="w-3 h-3 text-safe-green" />
                          {photos.length > 0 ? `已补拍${photos.length}张` : '未补拍'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-ink-gray">当前状态：</span>
                        <span className={classNames(
                          'status-pill text-xs font-semibold',
                          getStatusColorClass(abnormalReport.status)
                        )}>
                          {ABNORMAL_STATUS_LABELS[abnormalReport.status]}
                        </span>
                      </div>
                      <p className="text-xs text-ink-dark bg-white/70 p-2 rounded-lg mb-3">
                        {abnormalReport.actionTaken}
                      </p>
                      {onViewAbnormalReport && (
                        <button
                          onClick={() => onViewAbnormalReport(abnormalReport)}
                          className="w-full py-2 rounded-xl bg-cold-deep/10 text-cold-deep text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-cold-deep/15 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看完整处置单
                        </button>
                      )}
                    </div>
                  )}

                  {record.remark && !abnormalReport && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-ink-light mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-ink-gray leading-relaxed">{record.remark}</p>
                    </div>
                  )}

                  {photos.length > 0 && (
                    <div className="mt-3">
                      {!abnormalReport && (
                        <p className="text-[10px] text-ink-gray mb-2">点击照片可放大查看</p>
                      )}
                      <div className="flex gap-2">
                        {photos.map((photo, photoIdx) => (
                          <motion.button
                            key={photoIdx}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePhotoClick(photos, photoIdx)}
                            className="w-14 h-14 rounded-lg overflow-hidden relative group flex-shrink-0"
                          >
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {needsReport && (
                    <div className="mt-3 pt-3 border-t border-danger-red/10">
                      <button
                        onClick={() => onReportAbnormal(record)}
                        className="w-full py-2.5 rounded-xl bg-danger-red text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-danger-red/90 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        立即上报调度
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <PhotoPreview
        photos={previewPhotos}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

export default RecordTimeline;
