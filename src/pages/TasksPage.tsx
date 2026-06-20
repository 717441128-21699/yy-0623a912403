import PageContainer from '@/components/layout/PageContainer';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskCard from '@/components/tasks/TaskCard';
import { useAppStore } from '@/store/useAppStore';

function TasksPage() {
  const { tasks, currentTaskId, setCurrentTask } = useAppStore();

  const activeTasks = tasks.filter(t => t.stage !== 'delivered');
  const deliveredTasks = tasks.filter(t => t.stage === 'delivered');

  return (
    <PageContainer>
      <TasksHeader />

      <div className="px-4 -mt-4 space-y-4">
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
    </PageContainer>
  );
}

export default TasksPage;
