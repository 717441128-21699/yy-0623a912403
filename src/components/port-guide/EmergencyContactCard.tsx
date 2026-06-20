import { Phone, Headphones, FileSignature, Users } from 'lucide-react';
import { mockEmergencyContacts } from '../../data/mockData';
import { classNames } from '../../utils';

const iconMap = {
  '调度中心': Headphones,
  '现场协调': Users,
  '报关行': FileSignature,
};

function EmergencyContactCard() {
  return (
    <div className="card-base overflow-hidden border-2 border-danger-red/20">
      <div className="bg-gradient-to-r from-danger-red/15 via-danger-red/10 to-transparent px-5 py-4 flex items-center gap-3 border-b border-danger-red/10">
        <div className="w-11 h-11 rounded-xl bg-danger-red/20 flex items-center justify-center relative">
          <Phone className="w-5 h-5 text-danger-red" />
          <span className="absolute inset-0 rounded-xl bg-danger-red/30 animate-ping opacity-60" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-danger-red">紧急联系方式</h3>
          <p className="text-xs text-ink-gray mt-0.5">遇到问题优先拨打调度中心</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {mockEmergencyContacts.map((contact, idx) => {
          const Icon = iconMap[contact.role as keyof typeof iconMap] ?? Phone;
          const isPrimary = idx === 0;
          return (
            <a
              key={contact.phone}
              href={`tel:${contact.phone}`}
              className={classNames(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 active:scale-[0.98]',
                isPrimary
                  ? 'bg-gradient-to-r from-danger-red/15 to-danger-red/5 hover:from-danger-red/20 hover:to-danger-red/8 border-2 border-danger-red/25'
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
              )}
            >
              <div className={classNames(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                isPrimary
                  ? 'bg-danger-red text-white shadow-lg shadow-danger-red/20'
                  : 'bg-white text-cold-deep shadow-sm'
              )}>
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-gray">{contact.role}</p>
                <p className="text-base font-bold text-ink-dark flex items-center gap-2">
                  {contact.name}
                  {isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-danger-red/15 text-danger-red font-bold">
                      优先
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={classNames(
                  'font-bold temp-digit',
                  isPrimary ? 'text-danger-red' : 'text-cold-deep'
                )}>
                  {contact.phone}
                </span>
                <div className={classNames(
                  'mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1',
                  isPrimary
                    ? 'bg-danger-red text-white'
                    : 'bg-cold-deep/10 text-cold-deep'
                )}>
                  <Phone className="w-3 h-3" />
                  拨打
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default EmergencyContactCard;
