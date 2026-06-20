import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

export interface PhotoUploadData {
  tempPhoto?: string;
  sealPhoto?: string;
  powerPhoto?: string;
}

interface PhotoUploadProps {
  photos: PhotoUploadData;
  onChange: (photos: PhotoUploadData) => void;
}

const photoTypes = [
  { key: 'tempPhoto' as const, label: '温度表', icon: '🌡️' },
  { key: 'sealPhoto' as const, label: '铅封', icon: '🔒' },
  { key: 'powerPhoto' as const, label: '外接电源', icon: '🔌' },
];

function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const inputRefs = {
    tempPhoto: useRef<HTMLInputElement>(null),
    sealPhoto: useRef<HTMLInputElement>(null),
    powerPhoto: useRef<HTMLInputElement>(null),
  };

  const [previewKey, setPreviewKey] = useState<keyof PhotoUploadData | null>(null);

  const handleFileChange = useCallback((
    key: keyof PhotoUploadData,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        ...photos,
        [key]: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [photos, onChange]);

  const handleRemove = useCallback((key: keyof PhotoUploadData, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPhotos = { ...photos };
    delete newPhotos[key];
    onChange(newPhotos);
  }, [photos, onChange]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {photoTypes.map(({ key, label, icon }) => {
          const photo = photos[key];
          return (
            <div key={key} className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => photo ? setPreviewKey(key) : inputRefs[key].current?.click()}
                className={`w-full aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-200 ${
                  photo
                    ? 'bg-ink-dark shadow-soft'
                    : 'bg-white border-2 border-dashed border-ink-light/40 hover:border-ice hover:bg-ice/5'
                }`}
              >
                <AnimatePresence mode="wait">
                  {photo ? (
                    <motion.div
                      key="photo"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full relative group"
                    >
                      <img
                        src={photo}
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-white text-xs font-semibold">
                        {label}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 p-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-ice/15 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-cold-deep" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg">{icon}</p>
                        <p className="text-xs font-medium text-ink-gray mt-1">{label}</p>
                        <p className="text-[10px] text-ink-light mt-0.5">点击拍照</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {photo && (
                <button
                  onClick={(e) => handleRemove(key, e)}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center z-10 active:scale-90 transition-transform"
                >
                  <X className="w-3.5 h-3.5 text-ink-dark" />
                </button>
              )}

              <input
                ref={inputRefs[key]}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(key, e)}
              />
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {previewKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
            onClick={() => setPreviewKey(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[previewKey]}
                alt="预览"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
              <button
                onClick={() => setPreviewKey(null)}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {photoTypes.find(t => t.key === previewKey)?.label}照片
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PhotoUpload;
