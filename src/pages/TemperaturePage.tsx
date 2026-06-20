import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Loader2, FileText, ChevronDown, ChevronUp, AlertTriangle, PhoneCall } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import TemperatureDisplay from '@/components/temperature/TemperatureDisplay';
import DeviceStatusCard from '@/components/temperature/DeviceStatusCard';
import PhotoUpload, { PhotoUploadData } from '@/components/temperature/PhotoUpload';
import StatusSelector from '@/components/temperature/StatusSelector';
import RecordTimeline from '@/components/temperature/RecordTimeline';
import AbnormalReportFlow from '@/components/temperature/AbnormalReportFlow';
import { useAppStore } from '@/store/useAppStore';
import type { TempStatus, TemperatureRecord } from '@/types';
import { TEMP_STATUS_LABELS, TEMP_STATUS_META } from '@/types';
import { classNames } from '@/utils';

type SubmitState = 'idle' | 'submitting' | 'success';

function isTempAbnormal(temp: number, targetMin: number, targetMax: number): boolean {
  return temp < targetMin || temp > targetMax;
}

function TemperaturePage() {
  const { 
    currentTaskId, 
    getCurrentTask, 
    getTaskRecords, 
    addTemperatureRecord,
    liveTemperature
  } = useAppStore();
  const currentTask = getCurrentTask();
  const records = currentTaskId ? getTaskRecords(currentTaskId) : [];

  const [selectedStatus, setSelectedStatus] = useState<TempStatus>('waiting_inspection');
  const [photos, setPhotos] = useState<PhotoUploadData>({});
  const [remark, setRemark] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [showAbnormalFlow, setShowAbnormalFlow] = useState(false);
  const [abnormalRecordForReport, setAbnormalRecordForReport] = useState<TemperatureRecord | null>(null);

  const latestAbnormalRecord = useMemo(() => {
    return records.find(r => r.isAbnormal && r.status !== 'temp_abnormal_reported');
  }, [records]);

  const isCurrentTempAbnormal = currentTask && isTempAbnormal(
    liveTemperature,
    currentTask.targetTempMin,
    currentTask.targetTempMax
  );

  const handleSubmit = async () => {
    if (submitState !== 'idle') return;
    setSubmitState('submitting');

    await new Promise(resolve => setTimeout(resolve, 900));

    const newRecord = addTemperatureRecord({
      status: selectedStatus,
      ...photos,
      remark: remark.trim() || undefined,
    });

    setSubmitState('success');
    setPhotos({});
    setRemark('');

    setTimeout(() => setSubmitState('idle'), 2200);

    if (newRecord?.isAbnormal && newRecord.status !== 'temp_abnormal_reported') {
      setTimeout(() => {
        setAbnormalRecordForReport(newRecord);
        setShowAbnormalFlow(true);
      }, 800);
    }
  };

  const handleManualReportAbnormal = () => {
    if (latestAbnormalRecord) {
      setAbnormalRecordForReport(latestAbnormalRecord);
      setShowAbnormalFlow(true);
    }
  };

  const handleAbnormalCompleted = () => {
    setShowAbnormalFlow(false);
    setAbnormalRecordForReport(null);
  };

  const statusLabel = TEMP_STATUS_LABELS[selectedStatus];
  const statusMeta = TEMP_STATUS_META[selectedStatus];

  return (
    <PageContainer>
      <AnimatePresence>
        {showAbnormalFlow && abnormalRecordForReport && (
          <AbnormalReportFlow
            record={abnormalRecordForReport}
            onClose={() => setShowAbnormalFlow(false)}
            onCompleted={handleAbnormalCompleted}
          />
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-b from-cold-deeper via-cold-deep to-transparent pt-12 pb-8 px-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm mb-1">温度监控</p>
            <h1 className="text-2xl font-bold">温度打卡</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 mb-1">今日打卡</p>
            <p className="text-2xl font-bold temp-digit">{records.length}<span className="text-sm text-white/60 ml-0.5">次</span></p>
          </div>
        </div>
        {currentTask && (
          <p className="mt-3 text-sm text-ice-light font-medium truncate">
            🚛 {currentTask.cargoName}
          </p>
        )}
      </div>

      <div className="px-4 -mt-2 space-y-4">
        <AnimatePresence>
          {(isCurrentTempAbnormal || latestAbnormalRecord) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={classNames(
                'relative overflow-hidden rounded-2xl p-4 border-2',
                isCurrentTempAbnormal
                  ? 'bg-gradient-to-r from-danger-red/15 to-warn-orange/10 border-danger-red/40'
                  : 'bg-gradient-to-r from-warn-orange/15 to-warn-orange/5 border-warn-orange/40'
              )}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-danger-red/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative flex items-start gap-3">
                <div className={classNames(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  isCurrentTempAbnormal ? 'bg-danger-red text-white' : 'bg-warn-orange text-white'
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={classNames(
                    'text-sm font-bold',
                    isCurrentTempAbnormal ? 'text-danger-red' : 'text-warn-orange'
                  )}>
                    {isCurrentTempAbnormal ? '⚠️ 当前温度异常' : '📋 有待处理的异常记录'}
                  </h4>
                  <p className="text-xs text-ink-dark mt-1">
                    {isCurrentTempAbnormal 
                      ? `当前 ${liveTemperature.toFixed(1)}°C 超出目标温区 ${currentTask?.targetTempMin}°C ~ ${currentTask?.targetTempMax}°C`
                      : `最近一次打卡温度异常，共 ${records.filter(r => r.isAbnormal).length} 条异常记录`
                    }
                  </p>
                </div>
                <button
                  onClick={handleManualReportAbnormal}
                  className={classNames(
                    'flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors',
                    isCurrentTempAbnormal
                      ? 'bg-danger-red text-white hover:bg-danger-red/90'
                      : 'bg-warn-orange text-white hover:bg-warn-orange/90'
                  )}
                >
                  <PhoneCall className="w-4 h-4" />
                  上报
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TemperatureDisplay />
        <DeviceStatusCard />

        <div className="card-base p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-ink-dark mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cold-deep to-ice rounded-full" />
              作业状态
            </h3>
            <StatusSelector selected={selectedStatus} onChange={setSelectedStatus} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-dark mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cold-deep to-ice rounded-full" />
              照片留证
              <span className="text-xs font-normal text-ink-light ml-1">
                ({Object.keys(photos).length}/3)
              </span>
            </h3>
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink-dark mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cold-deep to-ice rounded-full" />
              备注说明
            </h3>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={`当前状态：${statusLabel}。如有特殊情况请在此说明...`}
              rows={3}
              className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm text-ink-dark placeholder:text-ink-light resize-none focus:outline-none focus:ring-2 focus:ring-ice/40 focus:border-ice/40 transition-all"
            />
          </div>

          <motion.button
            whileTap={{ scale: submitState === 'idle' ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={submitState !== 'idle'}
            className={classNames(
              'btn-primary relative overflow-hidden',
              statusMeta.isAbnormal && 'ring-2 ring-danger-red ring-offset-2'
            )}
          >
            <AnimatePresence mode="wait">
              {submitState === 'submitting' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>提交中...</span>
                </motion.div>
              )}
              {submitState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>打卡成功</span>
                </motion.div>
              )}
              {submitState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>提交打卡 · {statusLabel}</span>
                  {statusMeta.isAbnormal && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
                      异常
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="card-base overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-5 flex items-center justify-between active:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm font-bold text-ink-dark flex items-center gap-2">
              <FileText className="w-4 h-4 text-ice" />
              今日打卡历史
              <span className="text-xs font-normal text-ink-light">({records.length})</span>
              {records.some(r => r.isAbnormal) && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-danger-red/15 text-danger-red text-[10px] font-bold">
                  {records.filter(r => r.isAbnormal).length} 条异常
                </span>
              )}
            </h3>
            {showHistory ? (
              <ChevronUp className="w-5 h-5 text-ink-light" />
            ) : (
              <ChevronDown className="w-5 h-5 text-ink-light" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <RecordTimeline records={records.slice(0, 6)} onReportAbnormal={(record) => {
                    setAbnormalRecordForReport(record);
                    setShowAbnormalFlow(true);
                  }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}

export default TemperaturePage;
