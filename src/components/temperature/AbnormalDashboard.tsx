import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, AlertTriangle, CheckCircle2, Clock, 
  Thermometer, FileText, List, ChevronRight,
  User
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AbnormalReport, AbnormalStatus } from '../../types';
import { ABNORMAL_STATUS_LABELS, ABNORMAL_STATUS_COLORS } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { formatRelativeTime, classNames } from '../../utils';

interface AbnormalDashboardProps {
  open: boolean;
  onClose: () => void;
  onViewReport: (report: AbnormalReport) => void;
}

type FilterTab = 'all' | AbnormalStatus;

const filterTabs: { key: FilterTab; label: string; icon: LucideIcon; countKey?: string }[] = [
  { key: 'all', label: '全部', icon: List },
  { key: 'pending_confirmation', label: '待确认', icon: AlertCircle },
  { key: 'additional_info_requested', label: '待补资料', icon: AlertTriangle },
  { key: 'dispatcher_confirmed', label: '处理中', icon: Clock },
  { key: 'closed', label: '已关闭', icon: CheckCircle2 },
];

function AbnormalDashboard({ open, onClose, onViewReport }: AbnormalDashboardProps) {
  const { getAllAbnormalReports, tasks } = useAppStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const allReports = getAllAbnormalReports();
  const filteredReports = activeTab === 'all'
    ? allReports
    : getAllAbnormalReports({ status: activeTab });

  const counts = {
    all: allReports.length,
    pending_confirmation: getAllAbnormalReports({ status: 'pending_confirmation' }).length,
    additional_info_requested: getAllAbnormalReports({ status: 'additional_info_requested' }).length,
    dispatcher_confirmed: getAllAbnormalReports({ status: 'dispatcher_confirmed' }).length,
    closed: getAllAbnormalReports({ status: 'closed' }).length,
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.cargoName || '未知任务';
  };

  const getStatusColorClass = (status: AbnormalStatus) => {
    const color = ABNORMAL_STATUS_COLORS[status];
    switch (color) {
      case 'warn-orange': return 'bg-warn-orange/15 text-warn-orange';
      case 'ice': return 'bg-ice/15 text-cold-deep';
      case 'danger-red': return 'bg-danger-red/15 text-danger-red';
      case 'safe-green': return 'bg-safe-green/15 text-safe-green';
      default: return 'bg-gray-100 text-ink-gray';
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-gray-50"
    >
      <div className="max-w-[430px] mx-auto h-full flex flex-col bg-white">
        <div className="bg-gradient-to-r from-cold-deep to-ice pt-10 pb-6 px-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm mb-1">调度中心</p>
              <h1 className="text-xl font-bold">异常处置看板</h1>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition-transform"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold temp-digit">{counts.pending_confirmation}</p>
              <p className="text-xs text-white/70 mt-0.5">待确认</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold temp-digit text-warn-orange">
                {counts.additional_info_requested}
              </p>
              <p className="text-xs text-white/70 mt-0.5">待补资料</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold temp-digit text-safe-green">{counts.closed}</p>
              <p className="text-xs text-white/70 mt-0.5">已关闭</p>
            </div>
          </div>
        </div>

        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide px-3 py-2 gap-1.5">
            {filterTabs.map(tab => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              const count = counts[tab.key as keyof typeof counts];
              return (
                <motion.button
                  key={tab.key}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-cold-deep text-white'
                      : 'bg-gray-100 text-ink-gray hover:bg-gray-200'
                  )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className={classNames(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-white/20' : 'bg-white'
                  )}>
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-ink-light" />
              </div>
              <p className="text-ink-gray text-sm">
                {activeTab === 'all' ? '暂无异常处置单' : `暂无${filterTabs.find(t => t.key === activeTab)?.label}的异常`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredReports.map((report, idx) => {
                  const isAbnormal = report.temperature > report.targetTempMax || report.temperature < report.targetTempMin;
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onViewReport(report)}
                      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={classNames(
                            'w-11 h-11 rounded-xl flex items-center justify-center',
                            isAbnormal ? 'bg-danger-red/10' : 'bg-safe-green/10'
                          )}>
                            <Thermometer className={classNames(
                              'w-6 h-6',
                              isAbnormal ? 'text-danger-red' : 'text-safe-green'
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-dark">{report.id}</p>
                            <p className="text-xs text-ink-light flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {getTaskName(report.taskId)}
                            </p>
                          </div>
                        </div>
                        <span className={classNames(
                          'status-pill text-xs font-semibold flex-shrink-0',
                          getStatusColorClass(report.status)
                        )}>
                          {ABNORMAL_STATUS_LABELS[report.status]}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-3 pb-3 border-b border-gray-50">
                        <div>
                          <p className="text-[10px] text-ink-light mb-0.5">异常温度</p>
                          <p className={classNames(
                            'text-lg font-bold temp-digit',
                            isAbnormal ? 'text-danger-red' : 'text-safe-green'
                          )}>
                            {report.temperature.toFixed(1)}°C
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-light mb-0.5">目标温区</p>
                          <p className="text-sm font-semibold text-ink-dark temp-digit">
                            {report.targetTempMin}~{report.targetTempMax}°C
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-light mb-0.5">调度</p>
                          <p className="text-sm font-semibold text-ink-dark">
                            {report.dispatcherName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-ink-dark line-clamp-2 flex-1 mr-3">
                          {report.actionTaken}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[10px] text-ink-light">
                            {formatRelativeTime(report.createdAt)}
                          </span>
                          <ChevronRight className="w-4 h-4 text-ink-light" />
                        </div>
                      </div>

                      {report.dispatcherRemark && (
                        <div className="mt-3 pt-3 border-t border-gray-50 bg-cold-deep/[0.03] -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                          <p className="text-xs text-cold-deep font-semibold mb-1">调度回复</p>
                          <p className="text-xs text-ink-dark line-clamp-2">
                            {report.dispatcherRemark}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AbnormalDashboard;
