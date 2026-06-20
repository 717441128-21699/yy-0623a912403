import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Thermometer, Battery, Zap, DoorOpen, FileText, 
  AlertTriangle, Phone, FileCheck,
  Eye, User
} from 'lucide-react';
import type { TemperatureRecord, AbnormalReport } from '../../types';
import { TEMP_STATUS_LABELS, ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS } from '../../types';
import { formatTime, formatDateTime, classNames, getTempStatusColor } from '../../utils';
import { useAppStore } from '../../store/useAppStore';
import PhotoPreview, { PhotoItem } from '../common/PhotoPreview';

type TimelineItem = 
  | { type: 'record'; data: TemperatureRecord }
  | { type: 'abnormal'; data: AbnormalReport };

interface RecordTimelineProps {
  records: TemperatureRecord[];
  onReportAbnormal?: () => void;
  onViewAbnormalReport?: (report: AbnormalReport) => void;
}

function RecordTimeline({ records, onReportAbnormal, onViewAbnormalReport }: RecordTimelineProps) {
  const { getCurrentTask, getTaskAbnormalReports, currentTaskId } = useAppStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<PhotoItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentTask = getCurrentTask();

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];
    const abnormalReports = currentTaskId ? getTaskAbnormalReports(currentTaskId) : [];

    records.forEach(record => {
      if (!record.abnormalReportId) {
        items.push({ type: 'record', data: record });
      }
    });

    abnormalReports.forEach(report => {
      items.push({ type: 'abnormal', data: report });
    });

    return items.sort((a, b) => 
      new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    );
  }, [records, currentTaskId, getTaskAbnormalReports]);

  if (timelineItems.length === 0) {
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

  const buildPhotos = (item: TemperatureRecord | AbnormalReport): PhotoItem[] => {
    const photos: PhotoItem[] = [];
    if (item.tempPhoto) photos.push({ url: item.tempPhoto, label: '温度表照片' });
    if (item.sealPhoto) photos.push({ url: item.sealPhoto, label: '铅封照片' });
    if (item.powerPhoto) photos.push({ url: item.powerPhoto, label: '外接电源照片' });
    return photos;
  };

  return (
    <>
      <div className="relative">
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-ice/50 via-gray-200 to-transparent" />

        <div className="space-y-4">
          {timelineItems.map((item, idx) => {
            if (item.type === 'record') {
              const record = item.data;
              const tempColor = currentTask
                ? getTempStatusColor(record.temperature, currentTask.targetTempMin, currentTask.targetTempMax)
                : 'safe';
              const tempTextColor = 
                tempColor === 'danger' ? 'text-danger-red' :
                tempColor === 'warn' ? 'text-warn-orange' :
                'text-safe-green';
              const isAbnormal = record.isAbnormal;
              const photos = buildPhotos(record);

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
                    isAbnormal && record.status !== 'temp_abnormal_reported' && 'border-2 border-danger-red/30 bg-danger-red/[0.03]',
                    record.status === 'temp_abnormal_reported' && 'border-2 border-safe-green/30 bg-safe-green/[0.03]'
                  )}>
                    <div className="flex items-start justify-between gap-3 mb-3 relative">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAbnormal && record.status !== 'temp_abnormal_reported' && (
                          <span className="status-pill flex items-center gap-1 bg-danger-red/10 text-danger-red">
                            <AlertTriangle className="w-3 h-3" /> 温度异常
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

                    {record.remark && (
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-ink-light mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-ink-gray leading-relaxed">{record.remark}</p>
                      </div>
                    )}

                    {photos.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] text-ink-gray mb-2">点击照片可放大查看</p>
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

                    {isAbnormal && record.status !== 'temp_abnormal_reported' && onReportAbnormal && (
                      <div className="mt-3 pt-3 border-t border-danger-red/10">
                        <button
                          onClick={onReportAbnormal}
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
            }

            const report = item.data;
            const photos = buildPhotos(report);
            const isDirectReport = !report.recordId;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.35 }}
                className="relative pl-14"
                onClick={() => onViewAbnormalReport?.(report)}
              >
                <div className={classNames(
                  'absolute left-0 top-3 w-11 h-11 rounded-2xl bg-white shadow-soft flex flex-col items-center justify-center border z-10',
                  'border-safe-green/40 bg-safe-green/5'
                )}>
                  <FileCheck className="w-5 h-5 text-safe-green" />
                  <span className="text-[9px] text-safe-green font-semibold mt-0.5">异常单</span>
                </div>

                <div className={classNames(
                  'card-base p-4 relative overflow-hidden cursor-pointer',
                  'border-2 border-safe-green/30 bg-safe-green/[0.03]'
                )}>
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-safe-green/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex items-start justify-between gap-3 mb-3 relative">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="status-pill flex items-center gap-1 bg-safe-green/10 text-safe-green">
                        <FileCheck className="w-3 h-3" /> 
                        {isDirectReport ? '直接上报' : '已上报'}
                      </span>
                      <span className={classNames(
                        'status-pill text-xs font-semibold',
                        getStatusColorClass(report.status)
                      )}>
                        {ABNORMAL_STATUS_LABELS[report.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-danger-red" />
                      <span className="font-bold temp-digit text-lg text-danger-red">
                        {report.temperature.toFixed(1)}°C
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-gray flex-wrap mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-ink-light" />
                      {report.dispatcherName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-ink-light" />
                      <span className="temp-digit">电量{Math.round(report.batteryLevel)}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className={classNames(
                        'w-3.5 h-3.5',
                        report.powerConnected ? 'text-safe-green' : 'text-ink-light'
                      )} />
                      <span>{report.powerConnected ? '已接电' : '未接电'}</span>
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-xl p-3 border border-gray-100 mb-2">
                    <p className="text-xs text-ink-dark leading-relaxed line-clamp-2">
                      {report.actionTaken}
                    </p>
                  </div>

                  {report.dispatcherRemark && (
                    <div className="bg-cold-deep/5 rounded-xl p-2.5 border border-cold-deep/10 mb-2">
                      <p className="text-[10px] text-cold-deep font-bold mb-0.5">调度回复</p>
                      <p className="text-xs text-ink-dark line-clamp-2">
                        {report.dispatcherRemark}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {photos.length > 0 ? (
                        <div className="flex -space-x-2">
                          {photos.slice(0, 3).map((photo, i) => (
                            <img
                              key={i}
                              src={photo.url}
                              alt=""
                              className="w-7 h-7 rounded-lg border-2 border-white object-cover"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-ink-light">暂无照片</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-ice text-xs font-semibold">
                      查看详情
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-[10px] text-ink-light mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(report.createdAt)} · {report.id}
                  </p>
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
