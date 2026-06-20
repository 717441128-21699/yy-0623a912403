import { Truck, MapPin, ClipboardList } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getTodayDateString } from '../../utils';
import type { AbnormalStatus } from '../../types';

interface TasksHeaderProps {
  onOpenDashboard?: () => void;
}

function TasksHeader({ onOpenDashboard }: TasksHeaderProps) {
  const { driver, tasks, currentTaskId, getAllAbnormalReports } = useAppStore();
  const activeTaskCount = tasks.filter(t => t.stage !== 'delivered').length;
  const currentTask = tasks.find(t => t.id === currentTaskId);
  const pendingReports = getAllAbnormalReports({ status: 'pending_confirmation' as AbnormalStatus }).length;
  const totalReports = getAllAbnormalReports().length;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cold-deeper via-cold-deep to-[#1A6B9A]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-ice/20 rounded-full blur-3xl -translate-y-32 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-ice/10 rounded-full blur-3xl translate-y-16 -translate-x-10" />
      
      <div className="relative px-5 pt-14 pb-8 text-white">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/70 text-sm mb-1">{getTodayDateString()}</p>
            <h1 className="text-2xl font-bold">你好，{driver.name}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/15">
            <Truck className="w-4 h-4 text-ice-light" />
            <span className="text-sm font-semibold tracking-wide">{driver.plateNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-white/60 text-xs mb-1">在途任务</p>
            <p className="text-3xl font-bold temp-digit">
              {activeTaskCount}
              <span className="text-base ml-1 text-white/60 font-normal">单</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-ice-light" />
              <p className="text-white/60 text-xs">当前口岸</p>
            </div>
            <p className="text-lg font-bold truncate">
              {currentTask?.targetPort ?? '暂无'}
            </p>
          </div>
        </div>

        {onOpenDashboard && totalReports > 0 && (
          <button
            onClick={onOpenDashboard}
            className="w-full mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-ice/20 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-ice-light" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">异常处置看板</p>
              <p className="text-xs text-white/60">
                共 {totalReports} 条处置单
                {pendingReports > 0 && (
                  <span className="ml-2 text-warn-orange font-semibold">
                    {pendingReports} 条待确认
                  </span>
                )}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default TasksHeader;
