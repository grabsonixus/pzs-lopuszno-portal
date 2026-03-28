import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../lib/types';

interface MediaLightboxProps {
  items: string[];
  initialIndex: number;
  collectionId: string;
  recordId: string;
  onClose: () => void;
}

/**
 * MediaLightbox component for professional full-screen (modal) viewing of gallery items.
 */
const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  initialIndex,
  collectionId,
  recordId,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrev, onClose]);

  const currentFile = items[currentIndex];
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(currentFile);
  const url = getImageUrl(collectionId, recordId, currentFile);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300 backdrop-blur-sm">
      {/* Backdrop for closing */}
      <div className="absolute inset-0 z-0" onClick={onClose}></div>

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-all z-50 p-2 hover:bg-white/10 rounded-full"
        title="Zamknij"
      >
        <X size={32} />
      </button>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 z-10 pointer-events-none">
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center pointer-events-auto shadow-2xl rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the content
        >
          {isVideo ? (
            <video 
              key={url}
              src={url} 
              className="max-h-[85vh] max-w-[90vw] md:max-w-[80vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
              controls 
              autoPlay 
              playsInline
            />
          ) : (
            <img 
              key={url}
              src={url} 
              alt={`Media ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] md:max-w-[80vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full z-50 group"
            title="Poprzednie"
          >
            <ChevronLeft size={48} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full z-50 group"
            title="Następne"
          >
            <ChevronRight size={48} className="group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Dot Navigation & Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
        <div className="text-white/60 text-sm font-medium">
          {currentIndex + 1} / {items.length}
        </div>
        
        {items.length > 1 && (
          <div className="flex gap-2 py-2 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-school-accent w-6 shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLightbox;
