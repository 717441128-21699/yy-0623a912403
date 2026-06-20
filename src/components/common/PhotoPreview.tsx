import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../utils';

export interface PhotoItem {
  url: string;
  label: string;
}

interface PhotoPreviewProps {
  photos: PhotoItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

function PhotoPreview({ photos, initialIndex = 0, open, onClose }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(i => i - 1);
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) setCurrentIndex(i => i + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, photos.length, onClose]);

  if (photos.length === 0) return null;
  const currentPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full h-full flex flex-col items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center z-20 active:scale-95 transition-transform"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {photos.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={() => setCurrentIndex(i => i - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center z-20 active:scale-95 transition-transform"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                )}
                {currentIndex < photos.length - 1 && (
                  <button
                    onClick={() => setCurrentIndex(i => i + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center z-20 active:scale-95 transition-transform"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                )}
              </>
            )}

            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              <motion.img
                key={currentPhoto.url}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                src={currentPhoto.url}
                alt={currentPhoto.label}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {currentPhoto.label}
                </span>
              </div>
              {photos.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={classNames(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PhotoPreview;
