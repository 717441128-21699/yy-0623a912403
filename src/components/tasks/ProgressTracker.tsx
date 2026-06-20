import { motion } from 'framer-motion';
import { Package, Truck, Ship, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import type { TaskStage } from '../../types';
import { STAGE_ORDER, TASK_STAGE_LABELS } from '../../types';
import { classNames } from '../../utils';

const stageIcons: Record<TaskStage, typeof Package> = {
  pickup: Package,
  transit: Truck,
  port: Ship,
  transload: ArrowRightLeft,
  delivered: CheckCircle2,
};

interface ProgressTrackerProps {
  currentStage: TaskStage;
}

function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-start px-2">
        <div className="absolute top-5 left-6 right-6 h-[3px] bg-gray-100 rounded-full">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cold-deep to-ice rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.max(0, (currentIndex / (STAGE_ORDER.length - 1)) * 100)}%` 
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {STAGE_ORDER.map((stage, index) => {
          const Icon = stageIcons[stage];
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPassed = index <= currentIndex;

          return (
            <div key={stage} className="relative z-10 flex flex-col items-center flex-1">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 1,
                }}
                className={classNames(
                  'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-gradient-to-br from-cold-deep to-ice text-white shadow-lg',
                  isActive && 'bg-white border-[3px] border-ice shadow-glow-ice',
                  !isPassed && 'bg-gray-100 text-ink-light border-2 border-gray-200'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="pulse-ring"
                    className="absolute inset-0 rounded-full bg-ice/30"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <Icon className={classNames(
                  'w-5 h-5 relative z-10',
                  isActive && 'text-cold-deep',
                  isCompleted && 'text-white',
                  !isPassed && 'text-ink-light'
                )} />
              </motion.div>
              <p className={classNames(
                'mt-2 text-[11px] font-medium text-center transition-colors whitespace-nowrap',
                isPassed ? 'text-cold-deep font-semibold' : 'text-ink-light'
              )}>
                {TASK_STAGE_LABELS[stage]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressTracker;
