import { BatteryFull, Battery, BatteryMedium, BatteryLow, Zap, DoorOpen, Clock } from 'lucide-react';
import { useLiveTemperature } from '../../hooks/useLiveTemperature';
import { formatRelativeTime } from '../../utils';

function DeviceStatusCard() {
  const { batteryLevel, powerConnected, lastDoorOpen } = useLiveTemperature();

  const BatteryIcon = 
    batteryLevel >= 80 ? BatteryFull :
    batteryLevel >= 50 ? Battery :
    batteryLevel >= 20 ? BatteryMedium :
    BatteryLow;

  const batteryColor = 
    batteryLevel >= 50 ? 'text-safe-green' :
    batteryLevel >= 20 ? 'text-warn-orange' :
    'text-danger-red';

  const batteryFillColor = 
    batteryLevel >= 50 ? 'bg-safe-green' :
    batteryLevel >= 20 ? 'bg-warn-orange' :
    'bg-danger-red';

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card-base p-4 flex flex-col items-center text-center">
        <div className="relative mb-2">
          <BatteryIcon className={`w-8 h-8 ${batteryColor}`} strokeWidth={1.5} />
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-2 rounded-sm bg-gray-200 overflow-hidden">
            <div 
              className={`h-full ${batteryFillColor} transition-all duration-500 rounded-sm`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>
        <p className={`text-xl font-bold temp-digit ${batteryColor}`}>
          {Math.round(batteryLevel)}%
        </p>
        <p className="text-[11px] text-ink-gray mt-1 font-medium">冷机电量</p>
      </div>

      <div className="card-base p-4 flex flex-col items-center text-center">
        <div className={`relative mb-2 p-2 rounded-xl ${
          powerConnected ? 'bg-safe-green/15' : 'bg-gray-100'
        }`}>
          <Zap className={`w-6 h-6 ${
            powerConnected ? 'text-safe-green' : 'text-ink-light'
          }`} strokeWidth={1.8} />
          {powerConnected && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-safe-green border-2 border-white animate-ping" />
          )}
        </div>
        <p className={`text-xl font-bold ${
          powerConnected ? 'text-safe-green' : 'text-ink-light'
        }`}>
          {powerConnected ? '已接电' : '未接电'}
        </p>
        <p className="text-[11px] text-ink-gray mt-1 font-medium">外接电源</p>
      </div>

      <div className="card-base p-4 flex flex-col items-center text-center">
        <div className="relative mb-2 p-2 rounded-xl bg-cold-deep/10">
          <DoorOpen className="w-6 h-6 text-cold-deep" strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-ink-light" />
          <span className="text-xs font-semibold text-ink-gray temp-digit">
            {formatRelativeTime(lastDoorOpen)}
          </span>
        </div>
        <p className="text-[11px] text-ink-gray mt-1 font-medium">最近开门</p>
      </div>
    </div>
  );
}

export default DeviceStatusCard;
