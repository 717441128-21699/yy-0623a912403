import { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskCard from '@/components/tasks/TaskCard';
import AbnormalReportSheet from '@/components/temperature/AbnormalReportSheet';
import AbnormalDashboard from '@/components/temperature/AbnormalDashboard';
import EventDetailSheet from '@/components/common/EventDetailSheet';
import { useAppStore } from '@/store/useAppStore';
import type { AbnormalReport, StageEvent } from '@/types';

function TasksPage() {
  const { tasks, currentTaskId, setCurrentTask, getAbnormalReport } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<AbnormalReport | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [detailType, setDetailType] = useState<'temperature_record' | 'checkin'>('temperature_record');
  const [detailId, setDetailId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const activeTasks = tasks.filter(t => t.stage !== 'delivered');
  const deliveredTasks = tasks.filter(t => t.stage === 'delivered');

  const handleViewAbnormalReport = (report: AbnormalReport) => {
    setSelectedReport(report);
    setSheetOpen(true);
  };

  const handleEventClick = (event: StageEvent) => {
    if (!event.relatedId || !event.relatedType) return;
    
    if (event.relatedType === 'abnormal_report') {
      const report = getAbnormalReport(event.relatedId);
      if (report) {
        setSelectedReport(report);
        setSheetOpen(true);
      }
    } else if (event.relatedType === 'temperature_record') {
      setDetailType('temperature_record');
      setDetailId(event.relatedId);
      setDetailOpen(true);
    } else if (event.relatedType === 'checkin') {
      setDetailType('checkin');
      setDetailId(event.relatedId);
      setDetailOpen(true);
    }
  };

  const handleDashboardViewReport = (report: AbnormalReport) => {
    setDashboardOpen(false);
    setTimeout(() => {
      setSelectedReport(report);
      setSheetOpen(true);
    }, 250);
  };

  return (
    <PageContainer>
      <TasksHeader onOpenDashboard={() => setDashboardOpen(true)} />

      <div className="px-4 -mt-4 space-y-4 pb-6">
        {activeTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-bold text-ink-dark flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-cold-deep to-ice rounded-full" />
                进行中任务
                <span className="text-sm font-normal text-ink-gray">
                  ({activeTasks.length}单)
                </span>
              </h2>
            </div>
            <div className="space-y-4">
              {activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={task.id === currentTaskId}
                  onSelect={() => setCurrentTask(task.id)}
                  onViewAbnormalReport={handleViewAbnormalReport}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          </div>
        )}

        {deliveredTasks.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-bold text-ink-dark flex items-center gap-2 opacity-70">
                <span className="w-1 h-5 bg-gray-300 rounded-full" />
                已完成
                <span className="text-sm font-normal text-ink-gray">
                  ({deliveredTasks.length}单)
                </span>
              </h2>
            </div>
            <div className="space-y-3 opacity-80">
              {deliveredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={task.id === currentTaskId}
                  onSelect={() => setCurrentTask(task.id)}
                  onViewAbnormalReport={handleViewAbnormalReport}
                  onEventClick={handleEventClick}
                />
              ))}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && deliveredTasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <p className="text-ink-gray">今日暂无任务</p>
            <p className="text-sm text-ink-light mt-1">请等待调度派单</p>
          </div>
        )}
      </div>

      <AbnormalReportSheet
        report={selectedReport}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <AbnormalDashboard
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onViewReport={handleDashboardViewReport}
      />

      <EventDetailSheet
        type={detailType}
        dataId={detailId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </PageContainer>
  );
}

export default TasksPage;
