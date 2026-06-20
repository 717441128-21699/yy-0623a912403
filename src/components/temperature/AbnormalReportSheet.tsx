import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Thermometer, Battery, Zap, Phone, Clock, FileText, 
  AlertTriangle, CheckCircle2, User, MessageSquare,
  AlertCircle, CircleCheck, CircleDot, Camera, Send,
  Shield, Plus
} from 'lucide-react';
import type { AbnormalReport, AbnormalStatus } from '../../types';
import { 
  ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS,
  TEMP_ZONE_LABELS, getTempZoneType 
} from '../../types';
import { formatDateTime, formatTime, classNames } from '../../utils';
import { useAppStore } from '../../store/useAppStore';
import PhotoUpload, { PhotoUploadData } from './PhotoUpload';
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
  const { updateAbnormalStatus, supplementAbnormalReport } = useAppStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showSupplementForm, setShowSupplementForm] = useState(false);
  const [supplementPhotos, setSupplementPhotos] = useState<PhotoUploadData>({});
  const [supplementNote, setSupplementNote] = useState('');
  const [showDispatcherPanel, setShowDispatcherPanel] = useState(false);
  const [dispatcherRemark, setDispatcherRemark] = useState('');
  const [supplementSubmitting, setSupplementSubmitting] = useState(false);

  if (!report) return null;

  const tempZoneType = getTempZoneType(report.targetTempMin, report.targetTempMax);
  const currentStatusIndex = statusFlow.findIndex(s => s.status === report.status);

  const photos: PhotoItem[] = [];
  if (report.tempPhoto) photos.push({ url: report.tempPhoto, label: '温度表照片' });
  if (report.sealPhoto) photos.push({ url: report.sealPhoto, label: '铅封照片' });
  if (report.powerPhoto) photos.push({ url: report.powerPhoto, label: '外接电源照片' });

  report.supplements.forEach((sup, idx) => {
    if (sup.tempPhoto) photos.push({ url: sup.tempPhoto, label: `补充${idx + 1}-温度表` });
    if (sup.sealPhoto) photos.push({ url: sup.sealPhoto, label: `补充${idx + 1}-铅封` });
    if (sup.powerPhoto) photos.push({ url: sup.powerPhoto, label: `补充${idx + 1}-外接电源` });
  });

  const handlePhotoClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleDispatcherAction = (status: AbnormalStatus) => {
    updateAbnormalStatus(report.id, status, dispatcherRemark.trim() || undefined);
    setShowDispatcherPanel(false);
    setDispatcherRemark('');
  };

  const handleSupplementSubmit = async () => {
    if (!supplementNote.trim() && Object.keys(supplementPhotos).length === 0) return;
    setSupplementSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    supplementAbnormalReport(report.id, {
      tempPhoto: supplementPhotos.tempPhoto,
      sealPhoto: supplementPhotos.sealPhoto,
      powerPhoto: supplementPhotos.powerPhoto,
      note: supplementNote.trim() || '补充照片资料',
    });
    setSupplementPhotos({});
    setSupplementNote('');
    setShowSupplementForm(false);
    setSupplementSubmitting(false);
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

  const isNeedsSupplement = report.status === 'additional_info_requested';
  const isClosed = report.status === 'closed';

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
                              {photo.label}
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

                  {report.supplements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2 mb-3">
                        <Plus className="w-4 h-4 text-ice" />
                        补充资料
                        <span className="text-xs font-normal text-ink-gray">
                          {report.supplements.length} 次
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {report.supplements.map((sup, idx) => (
                          <div key={sup.id} className="bg-ice/5 rounded-xl p-3 border border-ice/10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-cold-deep">
                                第{idx + 1}次补充
                              </span>
                              <span className="text-[10px] text-ink-light temp-digit">
                                {formatDateTime(sup.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-ink-dark leading-relaxed mb-2">
                              {sup.note}
                            </p>
                            <div className="flex gap-1.5">
                              {sup.tempPhoto && (
                                <img src={sup.tempPhoto} alt="温度表" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              {sup.sealPhoto && (
                                <img src={sup.sealPhoto} alt="铅封" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              {sup.powerPhoto && (
                                <img src={sup.powerPhoto} alt="外接电源" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

                  {isNeedsSupplement && !showSupplementForm && (
                    <div className="bg-warn-orange/10 rounded-2xl p-4 border-2 border-warn-orange/30">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-warn-orange flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-warn-orange mb-1">
                            调度要求补充资料
                          </h4>
                          {report.dispatcherRemark && (
                            <p className="text-xs text-ink-dark mb-3">
                              {report.dispatcherRemark}
                            </p>
                          )}
                          <button
                            onClick={() => setShowSupplementForm(true)}
                            className="w-full py-3 rounded-xl bg-warn-orange text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                          >
                            <Camera className="w-4 h-4" />
                            立即补充资料
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isNeedsSupplement && showSupplementForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-ice/5 rounded-2xl p-4 border border-ice/20 space-y-4"
                    >
                      <h4 className="text-sm font-bold text-cold-deep flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        补充资料
                      </h4>
                      <div>
                        <p className="text-xs text-ink-gray mb-2">补拍照片</p>
                        <PhotoUpload photos={supplementPhotos} onChange={setSupplementPhotos} />
                      </div>
                      <div>
                        <p className="text-xs text-ink-gray mb-2">补充说明</p>
                        <textarea
                          value={supplementNote}
                          onChange={(e) => setSupplementNote(e.target.value)}
                          placeholder="请描述补充的资料内容..."
                          rows={3}
                          className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-ice focus:ring-2 focus:ring-ice/20 outline-none transition-all text-sm text-ink-dark resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowSupplementForm(false);
                            setSupplementPhotos({});
                            setSupplementNote('');
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-ink-gray"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSupplementSubmit}
                          disabled={supplementSubmitting || (!supplementNote.trim() && Object.keys(supplementPhotos).length === 0)}
                          className={classNames(
                            'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all',
                            supplementNote.trim() || Object.keys(supplementPhotos).length > 0
                              ? 'bg-gradient-to-r from-cold-deep to-ice text-white'
                              : 'bg-gray-100 text-ink-light cursor-not-allowed'
                          )}
                        >
                          {supplementSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><Send className="w-3.5 h-3.5" /> 提交补充</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!isClosed && (
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        onClick={() => setShowDispatcherPanel(!showDispatcherPanel)}
                        className="w-full py-3 rounded-xl bg-cold-deep/8 text-cold-deep text-xs font-bold flex items-center justify-center gap-2 hover:bg-cold-deep/12 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        调度协同处理
                        <span className="text-[10px] text-ink-light ml-1">（模拟调度操作）</span>
                      </button>

                      <AnimatePresence>
                        {showDispatcherPanel && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 bg-gray-50 rounded-2xl p-4 space-y-3">
                              <h4 className="text-xs font-bold text-ink-dark">调度操作面板</h4>
                              
                              {report.status === 'pending_confirmation' && (
                                <button
                                  onClick={() => handleDispatcherAction('dispatcher_confirmed')}
                                  className="w-full py-3 rounded-xl bg-safe-green/15 text-safe-green text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  确认异常
                                </button>
                              )}

                              {report.status !== 'additional_info_requested' && report.status !== 'closed' && (
                                <button
                                  onClick={() => handleDispatcherAction('additional_info_requested')}
                                  className="w-full py-3 rounded-xl bg-warn-orange/15 text-warn-orange text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  要求补充资料
                                </button>
                              )}

                              {report.status !== 'closed' && (
                                <>
                                  <div>
                                    <p className="text-xs text-ink-gray mb-1.5">调度回复（关闭时填写）</p>
                                    <textarea
                                      value={dispatcherRemark}
                                      onChange={(e) => setDispatcherRemark(e.target.value)}
                                      placeholder="填写调度回复内容..."
                                      rows={2}
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-ice focus:ring-1 focus:ring-ice/20 outline-none text-xs resize-none"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleDispatcherAction('closed')}
                                    className="w-full py-3 rounded-xl bg-gray-200 text-ink-dark text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                                  >
                                    <X className="w-4 h-4" />
                                    关闭异常
                                  </button>
                                </>
                              )}

                              {report.status === 'closed' && (
                                <p className="text-xs text-ink-gray text-center py-2">
                                  此异常已关闭，无法继续操作
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
