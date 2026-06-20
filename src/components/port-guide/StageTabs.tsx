import { motion } from 'framer-motion';
import type { ComponentType } from 'react';
import type { PortStage } from '../../types';
import { mockPortSteps } from '../../data/mockData';
import { Clock, ClipboardList, DoorOpen, Truck, AlertTriangle } from 'lucide-react';
import { classNames } from '../../utils';

interface StageTabsProps {
  activeStage: PortStage;
  onChange: (stage: PortStage) => void;
}

const iconMap: Record<string, ComponentType<any>> = {
  Clock,
  ClipboardList,
  DoorOpen,
  Truck,
  AlertTriangle,
};

const stageColors: Record<PortStage, string> = {
  queue: 'cold-deep',
  prepare: 'ice',
  inspection: 'warn-orange',
  transload: 'safe-green',
  emergency: 'danger-red',
};

function StageTabs({ activeStage, onChange }: StageTabsProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 bg-gradient-to-b from-cold-deeper via-cold-deep to-cold-deep/98 backdrop-blur-xl">
      <div className="flex gap-1 overflow-x-auto scroll-hide py-4 -mx-1 px-1">
        {mockPortSteps.map((stage) => {
          const Icon = iconMap[stage.icon];
          const isActive = stage.stage === activeStage;
          const colorKey = stageColors[stage.stage];
          
          return (
            <button
              key={stage.stage}
              onClick={() => onChange(stage.stage)}
              className={classNames(
                'relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 min-h-[48px]',
                isActive
                  ? 'bg-white/15 text-white shadow-lg border border-white/10'
                  : 'text-white/60 hover:text-white/85 hover:bg-white/5'
              )}
            >
              {Icon && (
                <Icon
                  className={classNames(
                    'w-4.5 h-4.5',
                    isActive && colorKey === 'warn-orange' && 'text-warn-orange',
                    isActive && colorKey === 'safe-green' && 'text-safe-green',
                    isActive && colorKey === 'danger-red' && 'text-danger-red',
                    isActive && (colorKey === 'cold-deep' || colorKey === 'ice') && 'text-ice-light'
                  )}
                  strokeWidth={2}
                />
              )}
              <span className={classNames(
                'text-sm font-semibold whitespace-nowrap',
                isActive ? 'text-white' : ''
              )}>
                {stage.title}
              </span>
              {isActive && (
                <motion.div
                  layoutId="stage-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-gradient-to-r from-ice to-ice-light rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StageTabs;
