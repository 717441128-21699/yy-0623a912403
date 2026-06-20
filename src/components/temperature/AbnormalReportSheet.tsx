import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Thermometer, Battery, Zap, Phone, Clock, FileText, 
  AlertTriangle, CheckCircle2, User, MessageSquare,
  AlertCircle, CircleCheck, CircleDot, Ban
} from 'lucide-react';
import type { AbnormalReport } from '../../types';
import { 
  ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS,
  TEMP_ZONE_LABELS, getTempZoneType 
} from '../../types';
import { formatDateTime, formatTime, classNames } from '../../utils';
import PhotoPreview, { PhotoItem } from '../common/PhotoPreview';

interface AbnormalReportSheetProps {
  report: AbnormalReport | null;
  open: boolean;
  onClose: () => void;
}

const statusFlow: { status: AbnormalReport['status']; label: string; icon: any }[] = [
  { status: 'pending_confirmation', label: '待调度确认', icon: AlertCircle },
  { status: 'dispatcher_confirmed', label: '调度已确认', icon: CircleCheck },
  { status: 'additional_info_requested', label: '要求补充资料', icon: AlertTriangle },
  { status: 'closed', label: '已关闭', icon: CheckCircle2 },
];

function AbnormalReportSheet({ report, open, onClose }: AbnormalReportSheetProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!report) return null;

  const tempZoneType = getTempZoneType(report.targetTempMin, report.targetTempMax);
  const currentStatusIndex = statusFlow.findIndex(s => s.status === report.status);

  const photos: PhotoItem[] = [];
  if (report.tempPhoto) photos.push({ url: report.tempPhoto, label: '温度表照片' });
  if (report.sealPhoto) photos.push({ url: report.sealPhoto, label: '铅封照片' });
  if (report.powerPhoto) photos.push({ url: report.powerPhoto, label: '外接电源照片' });

  const handlePhotoClick = (index: number) => {
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

  const getStatusDotColor = (status: AbnormalReport['status']) => {
    const color = ABNORMAL_STATUS_COLORS[status];
    switch (color) {
      case 'warn-orange': return 'bg-warn-orange';
      case 'ice': return 'bg-ice';
      case 'danger-red': return 'bg-danger-red';
      case 'safe-green': return 'bg-safe-green';
      default: return 'bg-gray-300';
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[90] max-w-[430px] mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink-dark">异常处置单</h2>
                    <p className="text-xs text-ink-light mt-0.5">
                      {report.id} · {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-ink-dark" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto pb-8">
                <div className="px-5 py-4 space-y-5">
                  <div className="bg-gradient-to-r from-danger-red/10 to-warn-orange/10 rounded-2xl p-4 border border-danger-red/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-danger-red/20 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-danger-red" />
                        </div>
                        <div>
                          <p className="text-xs text-ink-gray">当前温度</p>
                          <p className="text-2xl font-bold text-danger-red temp-digit">
                            {report.temperature.toFixed(1)}°C
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-gray">
                          {TEMP_ZONE_LABELS[tempZoneType]}目标温区
                        </p>
                        <p className="text-sm font-bold text-cold-deep temp-digit">
                          {report.targetTempMin}°C ~ {report.targetTempMax}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-danger-red/10">
                      <div className="flex items-center gap-1.5">
                        <Battery className="w-4 h-4 text-ink-light" />
                        <span className="text-xs text-ink-gray temp-digit">
                          电量 {Math.round(report.batteryLevel)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className={classNames(
                          'w-4 h-4',
                          report.powerConnected ? 'text-safe-green' : 'text-ink-light'
                        )} />
                        <span className="text-xs text-ink-gray">
                          {report.powerConnected ? '已接电' : '未接电'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-ice" />
                        处置状态
                      </h3>
                      <span className={classNames(
                        'status-pill text-xs font-semibold',
                        getStatusColorClass(report.status)
                      )}>
                        {ABNORMAL_STATUS_LABELS[report.status]}
                      </span>
                    </div>
                    <div className="relative pl-2">
                      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-100" />
                      <div className="space-y-0">
                        {statusFlow.map((step, idx) => {
                          const isCompleted = idx <= currentStatusIndex;
                          const isCurrent = idx === currentStatusIndex;
                          const StepIcon = step.icon;
                          return (
                            <div key={step.status} className="relative flex items-start gap-3 py-2.5">
                              <div className={classNames(
                                'w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0',
                                isCompleted 
                                  ? isCurrent 
                                    ? `${getStatusDotColor(step.status)} shadow-lg` 
                                    : 'bg-safe-green'
                                  : 'bg-gray-200'
                              )}>
                                <StepIcon className={classNames(
                                  'w-3.5 h-3.5',
                                  isCompleted ? 'text-white' : 'text-ink-light'
                                )} />
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className={classNames(
                                  'text-sm font-semibold',
                                  isCompleted ? 'text-ink-dark' : 'text-ink-light'
                                )}>
                                  {step.label}
                                </p>
                                {isCurrent && (
                                  <p className="text-xs text-ink-gray mt-0.5">
                                    {formatDateTime(report.statusUpdatedAt)}
                                  </p>
                                )}
                                {step.status === 'pending_confirmation' && idx < currentStatusIndex && (
                                  <p className="text-xs text-ink-gray mt-0.5">
                                    {formatDateTime(report.createdAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                      <Phone className="w-4 h-4 text-ice" />
                      联系调度
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-ice/15 flex items-center justify-center">
                          <User className="w-5 h-5 text-cold-deep" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-dark">
                            {report.dispatcherName}
                          </p>
                          <p className="text-xs text-ink-gray">
                            联系时间：{formatTime(report.notifiedAt)}
                          </p>
                        </div>
                      </div>
                      <div className={classNames(
                        'w-2 h-2 rounded-full',
                        report.notifiedDispatcher ? 'bg-safe-green' : 'bg-ink-light'
                      )} />
                    </div>
                  </div>

                  {photos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-ice" />
                        留证照片
                        <span className="text-xs font-normal text-ink-gray">
                          （点击可放大查看）
                        </span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, idx) => (
                          <motion.button
                            key={idx}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePhotoClick(idx)}
                            className="aspect-[4/5] rounded-xl overflow-hidden relative group"
                          >
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute bottom-1.5 left-1.5 text-white text-[10px] font-semibold">
                              {photo.label.replace('照片', '')}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-ice" />
                      处理说明
                    </h3>
                    <p className="text-sm text-ink-dark leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                      {report.actionTaken}
                    </p>
                    <p className="text-xs text-ink-light mt-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      上报时间：{formatDateTime(report.createdAt)}
                    </p>
                  </div>

                  {report.dispatcherRemark && (
                    <div className="bg-cold-deep/5 rounded-2xl p-4 border border-cold-deep/10">
                      <h3 className="text-sm font-bold text-cold-deep flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4" />
                        调度回复
                      </h3>
                      <p className="text-sm text-ink-dark leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                        {report.dispatcherRemark}
                      </p>
                      <p className="text-xs text-ink-light mt-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        回复时间：{formatDateTime(report.statusUpdatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PhotoPreview
        photos={photos}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

export default AbnormalReportSheet;
