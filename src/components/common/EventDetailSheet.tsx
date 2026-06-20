import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Battery, Zap, DoorOpen, Clock, MapPin,
  FileText, Eye, Image as ImageIcon
} from 'lucide-react';
import type { TemperatureRecord, CheckIn } from '../../types';
import { TEMP_STATUS_LABELS, TEMP_STATUS_META } from '../../types';
import { formatDateTime, classNames, getTempStatusColor } from '../../utils';
import { useAppStore } from '../../store/useAppStore';
import PhotoPreview, { PhotoItem } from '../common/PhotoPreview';

interface EventDetailSheetProps {
  type: 'temperature_record' | 'checkin';
  dataId: string;
  open: boolean;
  onClose: () => void;
}

function EventDetailSheet({ type, dataId, open, onClose }: EventDetailSheetProps) {
  const { getCurrentTask, temperatureRecords, tasks } = useAppStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<PhotoItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const currentTask = getCurrentTask();

  let record: TemperatureRecord | undefined;
  let checkIn: CheckIn | undefined;

  if (type === 'temperature_record') {
    record = temperatureRecords.find(r => r.id === dataId);
  } else if (type === 'checkin') {
    for (const task of tasks) {
      const found = task.checkIns.find(c => c.id === dataId);
      if (found) {
        checkIn = found;
        break;
      }
    }
  }

  const photos: PhotoItem[] = [];
  if (record?.tempPhoto) photos.push({ url: record.tempPhoto, label: '温度表照片' });
  if (record?.sealPhoto) photos.push({ url: record.sealPhoto, label: '铅封照片' });
  if (record?.powerPhoto) photos.push({ url: record.powerPhoto, label: '外接电源照片' });

  const handlePhotoClick = (index: number) => {
    setPreviewPhotos(photos);
    setPreviewIndex(index);
    setPreviewOpen(true);
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
              className="fixed inset-x-0 bottom-0 z-[90] max-w-[430px] mx-auto bg-white rounded-t-3xl max-h-[80vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white z-10 px-5 pt-4 pb-3 border-b border-gray-100">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink-dark">
                    {type === 'temperature_record' ? '打卡详情' : '签到详情'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <X className="w-5 h-5 text-ink-dark" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto pb-8">
                {type === 'temperature_record' && record && currentTask && (
                  <div className="px-5 py-4 space-y-5">
                    <div className={classNames(
                      'rounded-2xl p-4 border',
                      record.isAbnormal
                        ? 'bg-danger-red/5 border-danger-red/20'
                        : 'bg-safe-green/5 border-safe-green/20'
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-ink-gray mb-1">车厢温度</p>
                          <p className={classNames(
                            'text-3xl font-bold temp-digit',
                            getTempStatusColor(record.temperature, currentTask.targetTempMin, currentTask.targetTempMax) === 'danger' && 'text-danger-red',
                            getTempStatusColor(record.temperature, currentTask.targetTempMin, currentTask.targetTempMax) === 'warn' && 'text-warn-orange',
                            getTempStatusColor(record.temperature, currentTask.targetTempMin, currentTask.targetTempMax) === 'safe' && 'text-safe-green'
                          )}>
                            {record.temperature.toFixed(1)}°C
                          </p>
                        </div>
                        <span className={classNames(
                          'status-pill text-sm',
                          TEMP_STATUS_META[record.status].isAbnormal
                            ? 'bg-danger-red/15 text-danger-red'
                            : 'bg-safe-green/15 text-safe-green'
                        )}>
                          {TEMP_STATUS_LABELS[record.status]}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <Battery className="w-5 h-5 text-ink-light mx-auto mb-1" />
                        <p className="text-xs text-ink-gray mb-0.5">电量</p>
                        <p className="text-sm font-bold text-ink-dark temp-digit">
                          {Math.round(record.batteryLevel)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <Zap className={classNames(
                          'w-5 h-5 mx-auto mb-1',
                          record.powerConnected ? 'text-safe-green' : 'text-ink-light'
                        )} />
                        <p className="text-xs text-ink-gray mb-0.5">电源</p>
                        <p className="text-sm font-bold text-ink-dark">
                          {record.powerConnected ? '已接电' : '未接电'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <DoorOpen className="w-5 h-5 text-ink-light mx-auto mb-1" />
                        <p className="text-xs text-ink-gray mb-0.5">最近开门</p>
                        <p className="text-sm font-bold text-ink-dark temp-digit text-xs">
                          {record.lastDoorOpen.slice(11, 16)}
                        </p>
                      </div>
                    </div>

                    {photos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                          <ImageIcon className="w-4 h-4 text-ice" />
                          留证照片
                          <span className="text-xs font-normal text-ink-gray">
                            （点击可放大）
                          </span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {photos.map((photo, idx) => (
                            <motion.button
                              key={idx}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handlePhotoClick(idx)}
                              className="aspect-square rounded-xl overflow-hidden relative group"
                            >
                              <img
                                src={photo.url}
                                alt={photo.label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <span className="absolute bottom-1 left-1 text-white text-[10px] bg-black/50 px-1.5 py-0.5 rounded">
                                {photo.label.replace('照片', '')}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.remark && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-ice" />
                          备注说明
                        </h3>
                        <p className="text-sm text-ink-dark leading-relaxed">
                          {record.remark}
                        </p>
                      </div>
                    )}

                    <div className="text-center pt-2">
                      <p className="text-xs text-ink-light flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        打卡时间：{formatDateTime(record.createdAt)}
                      </p>
                      <p className="text-[10px] text-ink-light mt-1">
                        记录编号：{record.id}
                      </p>
                    </div>
                  </div>
                )}

                {type === 'checkin' && checkIn && (
                  <div className="px-5 py-4 space-y-5">
                    <div className="bg-safe-green/5 rounded-2xl p-5 border border-safe-green/20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-safe-green/15 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-safe-green" />
                      </div>
                      <h3 className="text-lg font-bold text-ink-dark mb-1">
                        {checkIn.type === 'transload' ? '换装点签到' : '监管仓签到'}
                      </h3>
                      <p className="text-sm text-safe-green font-semibold">
                        签到成功
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-ice" />
                        签到位置
                      </h3>
                      <p className="text-sm text-ink-dark font-medium mb-2">
                        {checkIn.locationName}
                      </p>
                      <p className="text-xs text-ink-light temp-digit">
                        经度：{checkIn.longitude.toFixed(4)} 
                        <span className="mx-2">·</span>
                        纬度：{checkIn.latitude.toFixed(4)}
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-xs text-ink-light flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        签到时间：{formatDateTime(checkIn.createdAt)}
                      </p>
                      <p className="text-[10px] text-ink-light mt-1">
                        记录编号：{checkIn.id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PhotoPreview
        photos={previewPhotos}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

export default EventDetailSheet;
