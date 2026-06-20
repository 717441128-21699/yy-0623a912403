import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import TemperatureDisplay from '@/components/temperature/TemperatureDisplay';
import DeviceStatusCard from '@/components/temperature/DeviceStatusCard';
import PhotoUpload, { PhotoUploadData } from '@/components/temperature/PhotoUpload';
import StatusSelector from '@/components/temperature/StatusSelector';
import RecordTimeline from '@/components/temperature/RecordTimeline';
import { useAppStore } from '@/store/useAppStore';
import type { TempStatus } from '@/types';
import { TEMP_STATUS_LABELS } from '@/types';

type SubmitState = 'idle' | 'submitting' | 'success';

function TemperaturePage() {
  const { currentTaskId, getCurrentTask, getTaskRecords, addTemperatureRecord } = useAppStore();
  const currentTask = getCurrentTask();
  const records = currentTaskId ? getTaskRecords(currentTaskId) : [];

  const [selectedStatus, setSelectedStatus] = useState<TempStatus>('waiting_inspection');
  const [photos, setPhotos] = useState<PhotoUploadData>({});
  const [remark, setRemark] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const handleSubmit = async () => {
    if (submitState !== 'idle') return;
    setSubmitState('submitting');

    await new Promise(resolve => setTimeout(resolve, 900));

    addTemperatureRecord({
      status: selectedStatus,
      ...photos,
      remark: remark.trim() || undefined,
    });

    setSubmitState('success');
    setPhotos({});
    setRemark('');

    setTimeout(() => setSubmitState('idle'), 2200);
  };

  const statusLabel = TEMP_STATUS_LABELS[selectedStatus];

  return (
    <PageContainer>
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
            className="btn-primary relative overflow-hidden"
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
                  <RecordTimeline records={records.slice(0, 6)} />
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
