import { NavLink } from 'react-router-dom';
import { ClipboardList, Thermometer, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getTempStatusColor } from '../../utils';

function BottomNav() {
  const { liveTemperature, getCurrentTask } = useAppStore();
  const currentTask = getCurrentTask();
  
  const tempStatus = currentTask
    ? getTempStatusColor(liveTemperature, currentTask.targetTempMin, currentTask.targetTempMax)
    : 'safe';

  const navItems = [
    {
      to: '/tasks',
      label: '今日任务',
      Icon: ClipboardList,
    },
    {
      to: '/temperature',
      label: '温度打卡',
      Icon: Thermometer,
      badge: tempStatus !== 'safe',
      badgeColor: tempStatus,
    },
    {
      to: '/port-guide',
      label: '口岸提示',
      Icon: AlertCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 pt-2 pb-6 shadow-[0_-4px_24px_rgba(10,61,98,0.08)]">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map(({ to, label, Icon, badge, badgeColor }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 relative min-h-[56px] ${
                  isActive
                    ? 'text-cold-deep'
                    : 'text-ink-light hover:text-ink-gray'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <div className="absolute inset-0 -m-2 rounded-full bg-ice/15" />
                    )}
                    <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'scale-110' : ''} transition-transform`} />
                    {badge && (
                      <span
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white z-20 ${
                          badgeColor === 'danger'
                            ? 'bg-danger-red animate-pulse'
                            : badgeColor === 'warn'
                            ? 'bg-warn-orange'
                            : 'bg-safe-green'
                        }`}
                      />
                    )}
                  </div>
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-0 w-1 h-1 rounded-full bg-gradient-to-r from-cold-deep to-ice" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
