import { useState } from 'react';
import { Ship, AlertTriangle } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import StageTabs from '@/components/port-guide/StageTabs';
import StepGuide from '@/components/port-guide/StepGuide';
import EmergencyContactCard from '@/components/port-guide/EmergencyContactCard';
import type { PortStage } from '@/types';
import { mockPortSteps } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { classNames } from '@/utils';

function PortGuidePage() {
  const [activeStage, setActiveStage] = useState<PortStage>('queue');
  const { getCurrentTask } = useAppStore();
  const currentTask = getCurrentTask();

  const activeData = mockPortSteps.find(s => s.stage === activeStage);

  return (
    <PageContainer className="" paddingBottom={true}>
      <div className="relative overflow-hidden bg-gradient-to-br from-cold-deeper via-cold-deep to-[#0E4A72]">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-danger-red/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-ice/15 blur-3xl translate-y-10" />

        <div className="relative px-5 pt-12 pb-24 text-white">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-white/60 text-sm mb-1">口岸通关指引</p>
              <h1 className="text-2xl font-bold">口岸提示</h1>
            </div>
            <div className="relative p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
              <Ship className="w-6 h-6 text-ice-light" />
            </div>
          </div>

          {currentTask && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warn-orange/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-warn-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  📍 {currentTask.targetPort}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  {currentTask.cargoName}
                </p>
              </div>
              <div className={classNames(
                'px-2.5 py-1 rounded-full text-xs font-semibold',
                'bg-safe-green/20 text-safe-green'
              )}>
                通关中
              </div>
            </div>
          )}
        </div>

        <StageTabs activeStage={activeStage} onChange={setActiveStage} />
      </div>

      <div className="px-4 -mt-2 space-y-5">
        {activeData && <StepGuide data={activeData} />}

        <EmergencyContactCard />

        <div className="card-base p-5">
          <h3 className="text-sm font-bold text-ink-dark mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-warn-orange to-danger-red rounded-full" />
            通关温控红线（严禁违反）
          </h3>
          <div className="space-y-2.5">
            {[
              { text: '冷机在任何情况下不得自行断电', critical: true },
              { text: '查验开门后3分钟内必须完成首次测温', critical: true },
              { text: '温度异常先联系调度，不得擅自移动', critical: true },
              { text: '海关未到场前严禁私自剪开铅封', critical: false },
              { text: '换装作业全程冷链不得断链超过15分钟', critical: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className={classNames(
                  'flex items-start gap-3 p-3 rounded-xl',
                  item.critical
                    ? 'bg-danger-red/8 border border-danger-red/15'
                    : 'bg-gray-50 border border-gray-100'
                )}
              >
                <div className={classNames(
                  'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 text-xs font-bold',
                  item.critical
                    ? 'bg-danger-red text-white'
                    : 'bg-warn-orange text-white'
                )}>
                  {idx + 1}
                </div>
                <p className={classNames(
                  'text-sm font-medium leading-relaxed',
                  item.critical ? 'text-danger-red' : 'text-ink-dark'
                )}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default PortGuidePage;
