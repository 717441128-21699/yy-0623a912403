import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, RefreshCw, Power } from 'lucide-react';
import { useLiveTemperature } from '../../hooks/useLiveTemperature';
import { useAppStore } from '../../store/useAppStore';
import { classNames } from '../../utils';

function TemperatureDisplay() {
  const { temperature, tempStatus, targetMin, targetMax, manualUpdate } = useLiveTemperature();
  const { powerConnected, togglePower, getCurrentTask } = useAppStore();
  const currentTask = getCurrentTask();

  const statusStyles = {
    safe: {
      bg: 'from-[#062A45] via-[#0A3D62] to-[#0B5A8A]',
      ring: 'shadow-safe-green/30',
      text: 'text-safe-green',
      glow: 'shadow-glow-green',
      ringColor: 'ring-safe-green/50',
      label: '温度正常',
    },
    warn: {
      bg: 'from-[#4A3800] via-[#7A5A00] to-[#B88B10]',
      ring: 'shadow-warn-orange/30',
      text: 'text-warn-orange',
      glow: '',
      ringColor: 'ring-warn-orange/50',
      label: '接近临界',
    },
    danger: {
      bg: 'from-[#450A0A] via-[#7A1A1A] to-[#A02A2A]',
      ring: 'shadow-danger-red/30',
      text: 'text-danger-red',
      glow: 'shadow-glow-red',
      ringColor: 'ring-danger-red/50',
      label: '温度异常',
    },
  };

  const style = statusStyles[tempStatus];

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.bg}`} />
      
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-64 h-64 rounded-full bg-ice/10 blur-3xl" />

      {tempStatus === 'safe' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-8 rounded-[20px] ring-1 ring-safe-green/20" />
        </motion.div>
      )}

      <div className="relative px-6 py-7 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/60 text-xs mb-1.5">车厢实时温度</p>
            <div className="flex items-center gap-2">
              <span className={classNames(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                tempStatus === 'safe' && 'bg-safe-green/20 text-safe-green',
                tempStatus === 'warn' && 'bg-warn-orange/25 text-warn-orange',
                tempStatus === 'danger' && 'bg-danger-red/20 text-danger-red',
              )}>
                <span className={classNames(
                  'w-1.5 h-1.5 rounded-full',
                  tempStatus === 'safe' && 'bg-safe-green animate-pulse',
                  tempStatus === 'warn' && 'bg-warn-orange animate-pulse',
                  tempStatus === 'danger' && 'bg-danger-red animate-pulse',
                )} />
                {style.label}
              </span>
            </div>
          </div>
          <button
            onClick={manualUpdate}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 active:scale-90 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={temperature.toFixed(1)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start justify-center"
            >
              <span className={classNames(
                'temp-digit font-bold text-[88px] leading-none tracking-tight',
                tempStatus === 'safe' ? 'text-white text-shadow-glow' : style.text
              )}
              style={{ textShadow: tempStatus === 'safe' ? '0 0 40px rgba(85,230,226,0.5)' : undefined }}
              >
                {temperature > 0 ? '' : ''}
                {temperature.toFixed(1)}
              </span>
              <span className="text-4xl font-semibold mt-3 ml-2 temp-digit text-white/80">°C</span>
            </motion.div>
          </AnimatePresence>

          {currentTask && targetMin !== undefined && targetMax !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-ice-light" />
              <span className="text-sm text-white/70">
                目标温区：<span className="font-semibold text-white temp-digit">{targetMin}°C ~ {targetMax}°C</span>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={togglePower}
          className={classNames(
            'w-full mt-2 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 border-2',
            powerConnected
              ? 'bg-safe-green/20 border-safe-green/40 text-safe-green'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
          )}
        >
          <Power className={classNames('w-5 h-5', powerConnected && 'animate-pulse')} />
          <span className="font-semibold text-sm">
            {powerConnected ? '外接电源已连接' : '外接电源未连接'}
          </span>
          {powerConnected && <span className="ml-1 w-2 h-2 rounded-full bg-safe-green animate-ping" />}
        </button>
      </div>
    </div>
  );
}

export default TemperatureDisplay;
