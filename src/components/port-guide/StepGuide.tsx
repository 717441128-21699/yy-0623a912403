import { motion } from 'framer-motion';
import { Check, AlertTriangle, Zap } from 'lucide-react';
import type { PortStepData } from '../../types';
import { classNames } from '../../utils';

interface StepGuideProps {
  data: PortStepData;
}

function StepGuide({ data }: StepGuideProps) {
  const isEmergency = data.stage === 'emergency';
  const isInspection = data.stage === 'inspection';

  const highlightKeywords = (text: string, keywords: string[]) => {
    let result: (string | JSX.Element)[] = [text];
    
    keywords.forEach(keyword => {
      result = result.flatMap((part, idx) => {
        if (typeof part !== 'string') return [part];
        const parts = part.split(keyword);
        const newParts: (string | JSX.Element)[] = [];
        parts.forEach((p, i) => {
          if (p) newParts.push(p);
          if (i < parts.length - 1) {
            newParts.push(
              <span
                key={`${keyword}-${idx}-${i}`}
                className={classNames(
                  'px-1.5 py-0.5 rounded-md font-bold mx-0.5',
                  data.stage === 'emergency'
                    ? 'bg-danger-red/15 text-danger-red'
                    : data.stage === 'inspection'
                    ? 'bg-warn-orange/20 text-warn-orange'
                    : 'bg-ice/15 text-cold-deep'
                )}
              >
                {keyword}
              </span>
            );
          }
        });
        return newParts;
      });
    });

    return result;
  };

  return (
    <motion.div
      key={data.stage}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div className={classNames(
        'rounded-2xl p-4 flex items-center gap-3',
        isEmergency
          ? 'bg-gradient-to-r from-danger-red/15 to-danger-red/5 border border-danger-red/20'
          : isInspection
          ? 'bg-gradient-to-r from-warn-orange/15 to-warn-orange/5 border border-warn-orange/20'
          : 'bg-gradient-to-r from-ice/15 to-cold-deep/5 border border-ice/20'
      )}>
        <div className={classNames(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          isEmergency
            ? 'bg-danger-red/20'
            : isInspection
            ? 'bg-warn-orange/20'
            : 'bg-ice/20'
        )}>
          {isEmergency ? (
            <AlertTriangle className="w-5 h-5 text-danger-red" />
          ) : (
            <Zap className={classNames(
              'w-5 h-5',
              isInspection ? 'text-warn-orange' : 'text-cold-deep'
            )} />
          )}
        </div>
        <div className="flex-1">
          <h3 className={classNames(
            'font-bold text-base',
            isEmergency ? 'text-danger-red' : isInspection ? 'text-warn-orange' : 'text-cold-deep'
          )}>
            {data.title}关键要点
          </h3>
          <p className="text-xs text-ink-gray mt-0.5">
            共 {data.steps.length} 条操作指引
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="card-base p-4 flex gap-3.5 items-start hover:shadow-md transition-shadow"
          >
            <div className="relative flex-shrink-0">
              <div className={classNames(
                'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm',
                isEmergency
                  ? 'bg-danger-red text-white'
                  : isInspection
                  ? 'bg-warn-orange text-white'
                  : 'bg-gradient-to-br from-cold-deep to-ice text-white'
              )}>
                {index + 1}
              </div>
              {index < data.steps.length - 1 && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-100" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[15px] text-ink-dark leading-relaxed">
                {highlightKeywords(step, data.highlightWords)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={classNames(
        'rounded-2xl p-4 border-2 flex items-start gap-3',
        isEmergency
          ? 'bg-danger-red/5 border-danger-red/30'
          : 'bg-safe-green/5 border-safe-green/30'
      )}>
        <Check className={classNames(
          'w-5 h-5 mt-0.5 flex-shrink-0',
          isEmergency ? 'text-danger-red' : 'text-safe-green'
        )} />
        <div>
          <p className={classNames(
            'text-sm font-bold mb-1',
            isEmergency ? 'text-danger-red' : 'text-safe-green'
          )}>
            {isEmergency ? '⚠️ 异常处理原则' : '✅ 阶段完成确认'}
          </p>
          <p className="text-xs text-ink-gray leading-relaxed">
            {isEmergency
              ? '任何异常情况必须第一时间联系调度中心获取指令，禁止擅自处置货物或移动车辆。所有操作必须有书面或语音记录留证。'
              : '完成所有步骤后，在温度打卡页面提交对应状态记录，并在今日任务页完成阶段签到。'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default StepGuide;
