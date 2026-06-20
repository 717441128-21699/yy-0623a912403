import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  paddingBottom?: boolean;
}

function PageContainer({ children, className = '', paddingBottom = true }: PageContainerProps) {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-[430px] relative bg-transparent min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full ${paddingBottom ? 'pb-32' : 'pb-8'} ${className}`}
        >
          {children}
        </motion.div>
        <BottomNav />
      </div>
    </div>
  );
}

export default PageContainer;
