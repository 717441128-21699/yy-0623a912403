import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Phone, Camera, FileText, CheckCircle2, 
  ChevronRight, X, Image as ImageIcon, Headphones,
  Thermometer, Zap, Battery, Snowflake
} from 'lucide-react';
import PhotoUpload, { PhotoUploadData } from './PhotoUpload';
import { useAppStore } from '../../store/useAppStore';
import { mockEmergencyContacts } from '../../data/mockData';
import { classNames } from '../../utils';
import type { TemperatureRecord } from '../../types';
import { getTempZoneType, TEMP_ZONE_LABELS, ABNORMAL_TIPS_BY_ZONE, ABNORMAL_STATUS_LABELS } from '../../types';

interface AbnormalReportFlowProps {
  record: TemperatureRecord;
  onClose: () => void;
  onCompleted: () => void;
}

type Step = 'warning' | 'call' | 'photos' | 'remark' | 'confirm';

function AbnormalReportFlow({ record, onClose, onCompleted }: AbnormalReportFlowProps) {
  const { createAbnormalReport, getCurrentTask } = useAppStore();
  const currentTask = getCurrentTask();
  
  const [step, setStep] = useState<Step>('warning');
  const [dispatcherContacted, setDispatcherContacted] = useState(false);
  const [dispatcherName, setDispatcherName] = useState('');
  const [photos, setPhotos] = useState<PhotoUploadData>({});
  const [actionTaken, setActionTaken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const tempZone = useMemo(() => {
    if (!currentTask) return 'frozen';
    return getTempZoneType(currentTask.targetTempMin, currentTask.targetTempMax);
  }, [currentTask]);

  const abnormalTips = ABNORMAL_TIPS_BY_ZONE[tempZone];
  const dispatcher = mockEmergencyContacts[0];
  const hasPhotos = Object.keys(photos).length > 0;
  const canProceedToPhotos = dispatcherContacted;
  const canProceedToRemark = dispatcherContacted && hasPhotos;
  const canSubmit = dispatcherContacted && hasPhotos && actionTaken.trim().length >= 8;

  const handleSubmit = async () => {
    if (!canSubmit || submitting || !currentTask) return;
    setSubmitting(true);

    await new Promise(r => setTimeout(r, 800));

    const report = createAbnormalReport({
      recordId: record.id,
      taskId: currentTask.id,
      dispatcherName: dispatcherName || dispatcher.name,
      tempPhoto: photos.tempPhoto,
      sealPhoto: photos.sealPhoto,
      powerPhoto: photos.powerPhoto,
      actionTaken: actionTaken.trim(),
    });

    setCreatedReportId(report.id);
    setStep('confirm');
    setSubmitting(false);
    
    setTimeout(() => {
      onCompleted();
    }, 2000);
  };

  const steps: { key: Step; label: string; icon: typeof AlertTriangle }[] = [
    { key: 'warning', label: '异常确认', icon: AlertTriangle },
    { key: 'call', label: '联系调度', icon: Phone },
    { key: 'photos', label: '补拍留证', icon: Camera },
    { key: 'remark', label: '处理说明', icon: FileText },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-[420px] bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink-dark">温度异常上报</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-ink-gray" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={classNames(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    idx < currentStepIndex ? 'bg-safe-green text-white' :
                    idx === currentStepIndex ? 'bg-danger-red text-white' :
                    'bg-gray-100 text-ink-light'
                  )}>
                    {idx < currentStepIndex ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={classNames(
                    'text-[10px] font-semibold truncate',
                    idx <= currentStepIndex ? 'text-ink-dark' : 'text-ink-light'
                  )}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={classNames(
                    'h-0.5 mt-1.5 rounded-full',
                    idx < currentStepIndex ? 'bg-safe-green' : 'bg-gray-100'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-160px)]">
          <AnimatePresence mode="wait">
            {step === 'warning' && (
              <motion.div
                key="warning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-gradient-to-br from-danger-red/15 to-danger-red/5 rounded-2xl p-5 border border-danger-red/20">
                  <div className="w-14 h-14 rounded-2xl bg-danger-red/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-danger-red" />
                  </div>
                  <h3 className="text-lg font-bold text-danger-red text-center mb-2">
                    {abnormalTips.title}
                  </h3>
                  <p className="text-sm text-ink-gray text-center leading-relaxed">
                    当前温度 <span className="font-bold text-danger-red temp-digit text-base">{record.temperature.toFixed(1)}°C</span> 已超出目标温区
                    <br />
                    请立即按照以下流程进行异常上报
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={classNames(
                      'px-2.5 py-1 rounded-full text-xs font-bold',
                      tempZone === 'frozen' ? 'bg-cold-deep/10 text-cold-deep' :
                      tempZone === 'chilled' ? 'bg-ice/20 text-ice' :
                      'bg-gray-100 text-ink-dark'
                    )}>
                      <Snowflake className="w-3 h-3 inline mr-1" />
                      {TEMP_ZONE_LABELS[tempZone]}货品
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-ink-dark">当前异常信息</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-ink-gray mb-1">异常温度</p>
                      <p className="text-xl font-bold text-danger-red temp-digit">
                        {record.temperature.toFixed(1)}°C
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-ink-gray mb-1">目标温区</p>
                      <p className="text-lg font-semibold text-ink-dark temp-digit">
                        {currentTask?.targetTempMin}°C ~ {currentTask?.targetTempMax}°C
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-ink-gray mb-1 flex items-center gap-1">
                        <Battery className="w-3 h-3" /> 电池电量
                      </p>
                      <p className="text-lg font-semibold text-ink-dark temp-digit">
                        {Math.round(record.batteryLevel)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-ink-gray mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 外接电源
                      </p>
                      <p className="text-lg font-semibold text-ink-dark">
                        {record.powerConnected ? '已连接' : '未连接'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-warn-orange/10 rounded-xl p-4 border border-warn-orange/20">
                  <h4 className="text-sm font-bold text-warn-orange flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    温区专属提醒
                  </h4>
                  <ul className="text-xs text-ink-dark space-y-1.5">
                    {abnormalTips.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-warn-orange mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setStep('call')}
                  className="btn-primary"
                >
                  开始上报流程
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 'call' && (
              <motion.div
                key="call"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-safe-green/15 flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-safe-green" />
                  </div>
                  <h3 className="text-lg font-bold text-ink-dark mb-2">
                    第一步：联系调度中心
                  </h3>
                  <p className="text-sm text-ink-gray">
                    请立即拨打调度电话说明异常情况
                  </p>
                </div>

                <a
                  href={`tel:${dispatcher.phone}`}
                  onClick={() => setDispatcherContacted(true)}
                  className="block bg-gradient-to-r from-safe-green/15 to-ice/15 border-2 border-safe-green/30 rounded-2xl p-5 hover:from-safe-green/20 hover:to-ice/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-safe-green text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-safe-green/20 relative overflow-hidden">
                      <Phone className="w-7 h-7 relative z-10" />
                      <div className="absolute inset-0 bg-safe-green animate-ping opacity-30" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="status-pill bg-danger-red/15 text-danger-red">优先拨打</span>
                      </div>
                      <p className="text-sm font-semibold text-ink-gray">{dispatcher.role}</p>
                      <p className="text-2xl font-bold text-ink-dark temp-digit">{dispatcher.name}</p>
                      <p className="text-xl font-bold text-cold-deep temp-digit mt-1">{dispatcher.phone}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-safe-green text-white flex items-center justify-center">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </a>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-ink-dark">
                    调度人员姓名 <span className="text-ink-light font-normal">(选填)</span>
                  </label>
                  <input
                    type="text"
                    value={dispatcherName}
                    onChange={(e) => {
                      setDispatcherName(e.target.value);
                      if (e.target.value.trim()) setDispatcherContacted(true);
                    }}
                    placeholder={`例如：${dispatcher.name}`}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ice focus:ring-2 focus:ring-ice/20 outline-none transition-all text-ink-dark text-base"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={dispatcherContacted}
                        onChange={(e) => setDispatcherContacted(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-safe-green focus:ring-safe-green"
                      />
                    </div>
                    <span className="text-sm text-ink-dark font-medium">
                      我已联系调度并说明异常情况
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('warning')}
                    className="flex-1 py-4 rounded-2xl font-semibold text-ink-gray bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={() => setStep('photos')}
                    disabled={!canProceedToPhotos}
                    className={classNames(
                      'flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
                      canProceedToPhotos
                        ? 'bg-gradient-to-r from-cold-deep to-ice text-white shadow-lg'
                        : 'bg-gray-100 text-ink-light cursor-not-allowed'
                    )}
                  >
                    下一步
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'photos' && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-ice/15 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-ice" />
                  </div>
                  <h3 className="text-lg font-bold text-ink-dark mb-2">
                    第二步：补拍照片留证
                  </h3>
                  <p className="text-sm text-ink-gray">
                    请拍摄以下照片作为异常证据留存
                  </p>
                </div>

                <div className="bg-warn-orange/10 rounded-xl p-4 border border-warn-orange/20">
                  <h4 className="text-sm font-bold text-warn-orange flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    拍摄要求
                  </h4>
                  <ul className="text-xs text-ink-dark space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-warn-orange mt-0.5">•</span>
                      <span><strong>温度表：</strong>清晰显示当前温度数值</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warn-orange mt-0.5">•</span>
                      <span><strong>铅封：</strong>铅封完整或剪断后的状态</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-warn-orange mt-0.5">•</span>
                      <span><strong>外接电源：</strong>冷机和电源连接状态</span>
                    </li>
                  </ul>
                </div>

                <PhotoUpload photos={photos} onChange={setPhotos} />

                <div className="flex items-center gap-2 text-sm">
                  <div className={classNames(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                    hasPhotos ? 'bg-safe-green text-white' : 'bg-gray-200 text-ink-light'
                  )}>
                    {hasPhotos ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="text-xs font-bold">{Object.keys(photos).length}/3</span>}
                  </div>
                  <span className="text-ink-gray">
                    {hasPhotos 
                      ? `已拍摄 ${Object.keys(photos).length} 张照片`
                      : '请至少拍摄 1 张照片'}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('call')}
                    className="flex-1 py-4 rounded-2xl font-semibold text-ink-gray bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={() => setStep('remark')}
                    disabled={!canProceedToRemark}
                    className={classNames(
                      'flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
                      canProceedToRemark
                        ? 'bg-gradient-to-r from-cold-deep to-ice text-white shadow-lg'
                        : 'bg-gray-100 text-ink-light cursor-not-allowed'
                    )}
                  >
                    下一步
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'remark' && (
              <motion.div
                key="remark"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cold-deep/15 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-cold-deep" />
                  </div>
                  <h3 className="text-lg font-bold text-ink-dark mb-2">
                    第三步：填写处理说明
                  </h3>
                  <p className="text-sm text-ink-gray">
                    请详细描述当前已采取的处理措施
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-ink-dark">
                    处理说明 <span className="text-danger-red">*</span>
                  </label>
                  <textarea
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="例如：已联系调度刘调度，按指令已接通外接电源，冷机运行正常，观察温度回升中。预计10分钟内恢复到正常范围..."
                    rows={5}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-ice focus:ring-2 focus:ring-ice/20 outline-none transition-all text-ink-dark text-sm leading-relaxed resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-ink-light">
                      请至少填写 8 个字，详细说明有助于调度判断
                    </p>
                    <p className={classNames(
                      'text-xs font-semibold',
                      actionTaken.length >= 8 ? 'text-safe-green' : 'text-ink-light'
                    )}>
                      {actionTaken.length} 字
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-ink-dark">快速填写</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '已接通外接电源，等待温度恢复',
                      '冷机运行正常，持续观察中',
                      '已联系调度，等待进一步指令',
                      '已补充干冰，温度正在下降',
                      '海关查验中，开门导致温度波动',
                    ].map(text => (
                      <button
                        key={text}
                        onClick={() => setActionTaken(text)}
                        className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-ice/15 text-xs text-ink-dark hover:text-cold-deep transition-colors"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-ink-dark mb-3">上报信息摘要</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-gray">联系调度</span>
                      <span className="text-safe-green font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        已联系 · {dispatcherName || dispatcher.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-gray">照片留证</span>
                      <span className="text-safe-green font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {Object.keys(photos).length} 张
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-gray">处理说明</span>
                      <span className={classNames(
                        'font-medium flex items-center gap-1',
                        canSubmit ? 'text-safe-green' : 'text-ink-light'
                      )}>
                        {canSubmit ? <CheckCircle2 className="w-4 h-4" /> : null}
                        {actionTaken.length >= 8 ? '已填写' : `${actionTaken.length}/8 字`}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-ink-gray">目标温区</span>
                        <span className="text-ink-dark font-semibold temp-digit">
                          {currentTask?.targetTempMin}°C ~ {currentTask?.targetTempMax}°C
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-ink-gray">异常温度</span>
                        <span className="text-danger-red font-semibold temp-digit">
                          {record.temperature.toFixed(1)}°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('photos')}
                    className="flex-1 py-4 rounded-2xl font-semibold text-ink-gray bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className={classNames(
                      'flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
                      canSubmit && !submitting
                        ? 'bg-gradient-to-r from-safe-green to-ice text-white shadow-lg'
                        : 'bg-gray-100 text-ink-light cursor-not-allowed'
                    )}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        提交上报
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-safe-green/15 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-safe-green" />
                </motion.div>
                <h3 className="text-xl font-bold text-ink-dark mb-2">
                  异常上报成功
                </h3>
                <p className="text-sm text-ink-gray mb-2">
                  调度已收到您的上报，状态：
                  <span className="text-warn-orange font-semibold">
                    {ABNORMAL_STATUS_LABELS.pending_confirmation}
                  </span>
                </p>
                <p className="text-xs text-ink-light">
                  上报编号：{createdReportId}
                </p>
                <p className="text-xs text-ink-light mt-2">
                  正在打开处置单...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AbnormalReportFlow;
