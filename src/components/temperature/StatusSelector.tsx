import { ScrollText, Snowflake, Power, DoorOpen, AlertTriangle, Truck } from 'lucide-react';
import type { TempStatus } from '../../types';
import { TEMP_STATUS_LABELS } from '../../types';
import { classNames } from '../../utils';
import type { ComponentType } from 'react';

interface StatusSelectorProps {
  selected: TempStatus;
  onChange: (status: TempStatus) => void;
}

const statusConfig: { value: TempStatus; Icon: ComponentType<any>; color: string }[] = [
  { value: 'normal_transit', Icon: Truck, color: 'safe-green' },
  { value: 'waiting_inspection', Icon: ScrollText, color: 'cold-deep' },
  { value: 'ice_refilled', Icon: Snowflake, color: 'ice' },
  { value: 'power_connected', Icon: Power, color: 'safe-green' },
  { value: 'door_open_inspection', Icon: DoorOpen, color: 'warn-orange' },
  { value: 'temp_abnormal', Icon: AlertTriangle, color: 'danger-red' },
];

function StatusSelector({ selected, onChange }: StatusSelectorProps) {
  return (
    <div className="overflow-x-auto scroll-hide -mx-4 px-4">
      <div className="flex gap-2.5 pb-1 min-w-max">
        {statusConfig.map(({ value, Icon, color }) => {
          const isActive = selected === value;
          const label = TEMP_STATUS_LABELS[value];
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={classNames(
                'flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 min-h-[48px]',
                isActive && color === 'safe-green' && 'bg-safe-green/15 border-safe-green/50 text-safe-green',
                isActive && color === 'ice' && 'bg-ice/15 border-ice/50 text-cold-deep',
                isActive && color === 'cold-deep' && 'bg-cold-deep/15 border-cold-deep/50 text-cold-deep',
                isActive && color === 'warn-orange' && 'bg-warn-orange/15 border-warn-orange/50 text-warn-orange',
                isActive && color === 'danger-red' && 'bg-danger-red/15 border-danger-red/50 text-danger-red',
                !isActive && 'bg-white border-gray-100 text-ink-gray hover:border-gray-200'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StatusSelector;
